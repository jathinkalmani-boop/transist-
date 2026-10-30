export type CommuterProfileId = 'default' | 'wheelchair' | 'elderly' | 'time_critical';

export interface CommuterProfile {
  id: CommuterProfileId;
  name: string;
  description: string;
  icon: string;
  weights: {
    reliability: number;
    crowding: number;
    access: number;
    disruption: number;
  };
  hardConstraints: {
    requiresStepFree: boolean;
    maxWalkingDistanceMeters: number;
    avoidHighCrowd: boolean;
  };
}

export type BarrierType = 'step_free' | 'barrier' | 'blocked_path';

export interface StopAccessibility {
  status: BarrierType;
  details: string;
  hasElevator: boolean;
  elevatorOperational: boolean;
  hasRamps: boolean;
  tactilePaving: boolean;
  lowFloorCurbs: boolean;
}

export interface TransitStop {
  id: string;
  code: string;
  name: string;
  locality: string;
  coordinates: { x: number; y: number };
  accessibility: StopAccessibility;
  liveCrowdEstimate: 'plenty' | 'few' | 'standing' | 'severe';
  lastReportTimestamp?: number;
  latitude?: number;
  longitude?: number;
}

export type CrowdingLevel = 'plenty' | 'few' | 'standing' | 'severe';

export interface RouteLeg {
  fromStopId: string;
  toStopId: string;
  mode: 'bus' | 'metro' | 'walk';
  lineName: string;
  scheduledMinutes: number;
  distanceKm: number;
  uncertaintyMinutes: number;
  stepFree: boolean;
}

export interface TransitRoute {
  id: string;
  routeNumber: string;
  name: string;
  operator: string;
  busType: string;
  fare: number;
  availableSeats: number;
  totalSeats: number;
  departureTime: string;
  arrivalTime: string;
  type: 'bus' | 'metro_feeder' | 'express_bus';
  summary: string;
  from: string;
  to: string;
  nominalTravelTimeMinutes: number;
  stops: string[];
  legs: RouteLeg[];
  isLowFloor: boolean;
  wheelchairAccessible: boolean;
  
  // Dynamic factors
  arrivalMinutes: number;
  arrivalUncertaintyMinutes: number;
  crowdingScore: number;
  crowdingLevel: CrowdingLevel;
  reliabilityScore: number;
  disruptionScore: number;
  activeDisruptionAlert?: string;

  // Real-time status tags
  isLiveFeedAvailable: boolean;
  dataSourceLabel: string;
  reliabilityConfidence: 'High' | 'Moderate' | 'Historical Estimate';
}

export interface JourneyRiskBreakdown {
  totalScore: number; // 0-100 (lower is safer)
  reliabilityRisk: number;
  crowdingRisk: number;
  accessibilityRisk: number;
  disruptionRisk: number;
  isViolatingHardConstraint: boolean;
  constraintViolationReason?: string;
  recommendationRank: number;
  verdict: 'Recommended' | 'Caution' | 'High Risk' | 'Inaccessible';
}

export interface CommunityReport {
  id: string;
  stopId: string;
  stopName: string;
  routeId?: string;
  routeNumber?: string;
  category: 'delay' | 'overcrowding' | 'blocked_path' | 'broken_ramp_elevator' | 'qr_tap';
  crowdingState?: 'plenty' | 'few' | 'standing';
  hasArrived?: boolean;
  notes: string;
  reportedAt: number;
  expiresAt: number;
  upvotes: number;
}

export interface BusyTimeBucket {
  hourRange: string;
  seatsTakenPercent: number;
  crowdLevel: CrowdingLevel;
  isPeak: boolean;
}

export interface BacktestTripResult {
  id: string;
  timeOfDay: string;
  travelTimeChosenRoute: string;
  travelTimeDuration: number;
  travelTimeDelay: number;
  travelTimeCrowding: CrowdingLevel;
  travelTimeAccessibilityIssue: boolean;

  transitShieldChosenRoute: string;
  transitShieldDuration: number;
  transitShieldDelay: number;
  transitShieldCrowding: CrowdingLevel;
  transitShieldAccessibilityIssue: boolean;
}

export interface BacktestSummary {
  sampleSize: number;
  travelTimeModel: {
    onTimeRate: number;
    avgWaitTimeMinutes: number;
    highCrowdingRate: number;
    accessibilityViolationRate: number;
  };
  transitShieldModel: {
    onTimeRate: number;
    avgWaitTimeMinutes: number;
    highCrowdingRate: number;
    accessibilityViolationRate: number;
  };
}

// User Profile for the Initial Login Screen
export type SpecialPersonCategory = 'none' | 'wheelchair' | 'elderly' | 'mobility' | 'vision';

export interface PassengerUser {
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  specialPerson: SpecialPersonCategory;
  commuterProfileId: CommuterProfileId;
  phone?: string;
  isRegistered: boolean;
}

// Electronic Ticketing Machine (ETM) Models for Showcase
export type ETMPassengerType = 'General' | 'Special Person / Disabled' | 'Senior Citizen' | 'Student' | 'Child';

export interface ETMTicket {
  id: string;
  ticketNumber: string;
  machineId: string;
  routeId: string;
  routeNumber: string;
  fromStopName: string;
  toStopName: string;
  passengerName: string;
  passengerAge?: number;
  passengerType: ETMPassengerType;
  seatNumber: string;
  fareAmount: number;
  discountApplied: number;
  paymentMode: 'CASH' | 'SMART_CARD' | 'UPI_QR';
  issuedAt: number; // timestamp
  validUntil: number; // timestamp
  riskScoreAtIssue: number;
  isStepFreeVerified: boolean;
  qrVerificationHash: string;
  status: 'VALID' | 'BOARDED' | 'EXPIRED';
}

export interface ETMMachineState {
  machineId: string;
  operatorName: string;
  batteryLevel: number;
  activeRouteId: string;
  currentStopId: string;
  totalTicketsIssuedToday: number;
  totalRevenueToday: number;
  specialPassengerCount: number;
}

// Seat Occupancy Database Model (Shows whether each seat is Free or Booked)
export interface ETMSeat {
  seatNumber: string;
  isFree: boolean;
  passengerName?: string;
  passengerCategory?: string;
  ticketNumber?: string;
  isWheelchairBay?: boolean;
  isSeniorReserved?: boolean;
}

// Real-time GPS Tracker Telemetry for ETM Machine & Fleet
export interface ETMGpsTelemetry {
  busId: string;
  routeId: string;
  routeNumber: string;
  operatorName: string;
  latitude: number;
  longitude: number;
  speedKmH: number;
  heading: number; // degrees
  altitudeMeters: number;
  satelliteLock: number;
  currentLocationName: string;
  nextStopName: string;
  distanceToNextStopMeters: number;
  etaNextStopMinutes: number;
  conductorMachineId: string;
  lastPingTimestamp: number;
}

// Commuter Customer Location Model
export interface CustomerLocation {
  stopId: string;
  locationName: string;
  landmark: string;
  latitude: number;
  longitude: number;
  accuracyMeters: number;
  isLiveGps: boolean;
}
