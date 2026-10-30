import {
  TransitRoute,
  TransitStop,
  CommuterProfile,
  JourneyRiskBreakdown,
  CommunityReport,
} from '../types/transit';

/**
 * Calculates the Journey Risk Score (0 - 100, lower is safer)
 * according to commuter profile weights and hard constraints.
 */
export function calculateJourneyRisk(
  route: TransitRoute,
  stopsMap: Map<string, TransitStop>,
  profile: CommuterProfile,
  recentReports: CommunityReport[] = []
): JourneyRiskBreakdown {
  // 1. Reliability Risk (0 - 100)
  // Higher uncertainty variance or delay history means higher risk
  const uncertaintyFactor = Math.min(100, route.arrivalUncertaintyMinutes * 6.5);
  const baseReliability = (route.reliabilityScore * 0.6) + (uncertaintyFactor * 0.4);

  // 2. Crowding Risk (0 - 100)
  // Incorporate recent QR tap-in / community reports for this route or its stops
  let crowdModifier = 0;
  const routeReports = recentReports.filter(r => r.routeId === route.id || route.stops.includes(r.stopId));
  for (const rep of routeReports) {
    if (rep.category === 'overcrowding' || rep.crowdingState === 'standing') {
      crowdModifier += 8;
    } else if (rep.crowdingState === 'plenty') {
      crowdModifier -= 5;
    }
  }
  const crowdingRisk = Math.min(100, Math.max(0, route.crowdingScore + crowdModifier));

  // 3. Accessibility Risk (0 - 100)
  // Inspect all stops along this route
  let stopBarrierCount = 0;
  let hasBlockedPath = false;
  let hasElevatorFault = false;

  for (const stopId of route.stops) {
    const stop = stopsMap.get(stopId);
    if (!stop) continue;

    if (stop.accessibility.status === 'blocked_path') {
      hasBlockedPath = true;
      stopBarrierCount += 3;
    } else if (stop.accessibility.status === 'barrier') {
      stopBarrierCount += 1.5;
    }

    if (stop.accessibility.hasElevator && !stop.accessibility.elevatorOperational) {
      hasElevatorFault = true;
      stopBarrierCount += 1.5;
    }
  }

  // Check vehicles
  let vehicleAccessPenalty = 0;
  if (!route.isLowFloor) vehicleAccessPenalty += 25;
  if (!route.wheelchairAccessible) vehicleAccessPenalty += 35;

  const accessibilityRisk = Math.min(
    100,
    Math.round(vehicleAccessPenalty + (stopBarrierCount * 14))
  );

  // 4. Disruption Risk (0 - 100)
  let disruptionModifier = 0;
  for (const rep of routeReports) {
    if (rep.category === 'delay' || rep.category === 'blocked_path') {
      disruptionModifier += 10;
    }
  }
  const disruptionRisk = Math.min(100, Math.max(0, route.disruptionScore + disruptionModifier));

  // Check Hard Constraints
  let isViolatingHardConstraint = false;
  let constraintViolationReason: string | undefined;

  if (profile.hardConstraints.requiresStepFree) {
    if (!route.wheelchairAccessible || !route.isLowFloor) {
      isViolatingHardConstraint = true;
      constraintViolationReason = 'Vehicle lacks ramp / low-floor step-free boarding.';
    } else if (hasBlockedPath) {
      isViolatingHardConstraint = true;
      constraintViolationReason = 'Critical pathway barricaded or blocked at one of the route stops.';
    }
  }

  if (profile.hardConstraints.avoidHighCrowd && crowdingRisk > 85) {
    if (profile.id === 'elderly' && !isViolatingHardConstraint) {
      // For elderly, extreme crowding is flagged as caution/constraint
      isViolatingHardConstraint = true;
      constraintViolationReason = 'Overcrowded vehicle (severe standing only) exceeds safe mobility threshold.';
    }
  }

  // Calculate Weighted Total Score
  // Weights: Reliability, Crowding, Access, Disruption
  const w = profile.weights;
  let totalScore = Math.round(
    (baseReliability * w.reliability) +
    (crowdingRisk * w.crowding) +
    (accessibilityRisk * w.access) +
    (disruptionRisk * w.disruption)
  );

  // If hard constraint violated, cap score or mark invalid
  if (isViolatingHardConstraint) {
    totalScore = Math.max(totalScore, 88); // Pushed into severe risk zone
  }

  // Clamp 0 - 100
  totalScore = Math.max(0, Math.min(100, totalScore));

  let verdict: JourneyRiskBreakdown['verdict'] = 'Recommended';
  if (isViolatingHardConstraint) {
    verdict = 'Inaccessible';
  } else if (totalScore >= 50) {
    verdict = 'High Risk';
  } else if (totalScore >= 30) {
    verdict = 'Caution';
  } else {
    verdict = 'Recommended';
  }

  return {
    totalScore,
    reliabilityRisk: Math.round(baseReliability),
    crowdingRisk: Math.round(crowdingRisk),
    accessibilityRisk: Math.round(accessibilityRisk),
    disruptionRisk: Math.round(disruptionRisk),
    isViolatingHardConstraint,
    constraintViolationReason,
    recommendationRank: 0,
    verdict,
  };
}

/**
 * Rank routes by risk score (lowest score first), respecting hard accessibility constraints
 */
export function rankRoutes(
  routes: TransitRoute[],
  stopsMap: Map<string, TransitStop>,
  profile: CommuterProfile,
  reports: CommunityReport[] = []
): { route: TransitRoute; breakdown: JourneyRiskBreakdown }[] {
  const scored = routes.map(route => {
    const breakdown = calculateJourneyRisk(route, stopsMap, profile, reports);
    return { route, breakdown };
  });

  // Sort: First feasible (non-violating), then by lowest totalScore
  scored.sort((a, b) => {
    if (a.breakdown.isViolatingHardConstraint && !b.breakdown.isViolatingHardConstraint) {
      return 1;
    }
    if (!a.breakdown.isViolatingHardConstraint && b.breakdown.isViolatingHardConstraint) {
      return -1;
    }
    return a.breakdown.totalScore - b.breakdown.totalScore;
  });

  // Assign ranks
  scored.forEach((item, index) => {
    item.breakdown.recommendationRank = index + 1;
  });

  return scored;
}
