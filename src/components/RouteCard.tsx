import React, { useState } from 'react';
import {
  TransitRoute,
  JourneyRiskBreakdown,
  CommuterProfile,
  TransitStop,
  PassengerUser,
} from '../types/transit';
import {
  Clock,
  Users,
  Accessibility,
  Volume2,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Radio,
  CheckCircle2,
  XCircle,
  TrendingDown,
  Armchair,
  Ticket,
} from 'lucide-react';
import { SupportedLanguage, TransitVoiceSynthesizer, LOCALIZED_VOICE_GUIDANCE } from '../services/speechService';
import { TRANSLATIONS } from '../services/i18n';

interface RouteCardProps {
  route: TransitRoute;
  breakdown: JourneyRiskBreakdown;
  profile: CommuterProfile;
  passenger: PassengerUser;
  stopsMap: Map<string, TransitStop>;
  language: SupportedLanguage;
  isSelected: boolean;
  onSelect: () => void;
  onOpenSeatLayout: (route: TransitRoute) => void;
  onTrackBusLocation?: (route: TransitRoute) => void;
}

export const RouteCard: React.FC<RouteCardProps> = ({
  route,
  breakdown,
  profile,
  passenger,
  stopsMap,
  language,
  isSelected,
  onSelect,
  onOpenSeatLayout,
  onTrackBusLocation,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [isSpeakingThis, setIsSpeakingThis] = useState(false);
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  // Play voice guidance
  const handleVoiceGuidance = (e: React.MouseEvent) => {
    e.stopPropagation();
    const voiceData = LOCALIZED_VOICE_GUIDANCE[language] || LOCALIZED_VOICE_GUIDANCE.en;
    let spokenText = `${route.routeNumber}. ${voiceData.arrivingIn(route.arrivalMinutes, route.arrivalUncertaintyMinutes)} `;

    if (route.crowdingScore < 45) {
      spokenText += `${voiceData.crowdingPlenty} `;
    } else if (route.crowdingScore < 70) {
      spokenText += `${voiceData.crowdingFew} `;
    } else {
      spokenText += `${voiceData.crowdingSevere} `;
    }

    if (route.wheelchairAccessible && route.isLowFloor) {
      spokenText += `${voiceData.stepFreeAccessible} `;
    } else {
      spokenText += `${voiceData.barrierWarning} `;
    }

    spokenText += voiceData.riskNotice(breakdown.totalScore);

    setIsSpeakingThis(true);
    TransitVoiceSynthesizer.speak(spokenText, language, () => {
      setIsSpeakingThis(false);
    });
  };

  // Color schemes for Journey Risk Score
  const getScoreTheme = (score: number, isInaccessible: boolean) => {
    if (isInaccessible) {
      return {
        badgeBg: 'bg-rose-950/90 border-rose-700 text-rose-300',
        scoreText: 'text-rose-400',
        label: 'Inaccessible',
      };
    }
    if (score < 25) {
      return {
        badgeBg: 'bg-emerald-950/90 border-emerald-600 text-emerald-300',
        scoreText: 'text-emerald-400',
        label: 'Safest Journey',
      };
    }
    if (score < 45) {
      return {
        badgeBg: 'bg-cyan-950/90 border-cyan-600 text-cyan-300',
        scoreText: 'text-cyan-400',
        label: 'Moderate Risk',
      };
    }
    return {
      badgeBg: 'bg-rose-950/90 border-rose-700 text-rose-300',
      scoreText: 'text-rose-400',
      label: 'High Delay Hazard',
    };
  };

  const theme = getScoreTheme(breakdown.totalScore, breakdown.isViolatingHardConstraint);

  // Relevant fare calculation strictly based on passenger profile
  let effectiveFare = route.fare;
  let fareBenefitNote = 'Standard On-Board Fare';
  let isFreePass = false;

  if (passenger.gender === 'Female') {
    effectiveFare = 0;
    isFreePass = true;
    fareBenefitNote = 'FREE under Karnataka Shakti Scheme for Women';
  } else if (passenger.specialPerson === 'wheelchair') {
    effectiveFare = 0;
    isFreePass = true;
    fareBenefitNote = 'FREE Accessible Concession Pass';
  } else if (passenger.specialPerson === 'elderly' || passenger.age >= 60) {
    effectiveFare = Math.round(route.fare * 0.5);
    fareBenefitNote = '50% Senior Citizen Concession';
  }

  // Simulated live location of the approaching bus
  const approxDistanceKm = (route.arrivalMinutes * 0.45).toFixed(1);
  const busLocationDescription = `Currently approaching ${route.legs[0]?.toStopId ? stopsMap.get(route.legs[0].toStopId)?.name || 'Next Transit Junction' : 'Next Junction'} (${approxDistanceKm} km from departure stop)`;

  return (
    <div
      onClick={onSelect}
      className={`rounded-2xl border transition-all duration-200 cursor-pointer overflow-hidden shadow-md ${
        isSelected
          ? 'bg-slate-900 border-emerald-500 ring-2 ring-emerald-500/30'
          : 'bg-slate-900/90 border-slate-800 hover:border-emerald-600 hover:bg-slate-900'
      }`}
    >
      {/* Top Banner on Rank #1 */}
      {breakdown.recommendationRank === 1 && !breakdown.isViolatingHardConstraint && (
        <div className="bg-emerald-800 text-white px-4 py-1.5 flex items-center justify-between text-xs font-semibold">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-200" />
            <span>Recommended Optimal Low-Risk Bus for {passenger.name || profile.name}</span>
          </div>
          <span className="font-mono text-[11px] bg-emerald-950/80 px-2 py-0.5 rounded text-emerald-200">
            Lowest Composite Risk: {breakdown.totalScore}
          </span>
        </div>
      )}

      {/* Inaccessible Hard Rule Violation Banner */}
      {breakdown.isViolatingHardConstraint && (
        <div className="bg-rose-900 text-rose-100 px-4 py-1.5 flex items-center justify-between text-xs font-semibold">
          <div className="flex items-center gap-1.5">
            <XCircle className="w-4 h-4 text-rose-300" />
            <span>Hard Constraint Alert: Step-Free Rule Violated</span>
          </div>
          <span className="text-[11px] font-mono text-rose-200">Excluded from Safe Travel</span>
        </div>
      )}

      <div className="p-4 sm:p-5">
        {/* Main RedBus-Style Card Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-base sm:text-lg font-black text-white tracking-tight font-mono">
                {route.operator}
              </span>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs font-bold text-emerald-400">
                {route.routeNumber}
              </span>
            </div>

            <div className="text-xs text-slate-300 font-medium">
              {route.busType}
            </div>

            {/* RedBus Departure, Duration, Arrival Time Row */}
            <div className="flex items-center gap-4 text-xs pt-1.5 font-mono">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">{t.departure}</span>
                <span className="font-bold text-white text-sm">{route.departureTime}</span>
              </div>
              <div className="text-center px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[11px] text-slate-300">
                <span>{route.nominalTravelTimeMinutes} mins</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">{t.arrival}</span>
                <span className="font-bold text-white text-sm">{route.arrivalTime}</span>
              </div>
            </div>
          </div>

          {/* Relevant Fare & Journey Risk Score Box */}
          <div className="flex sm:flex-col items-end justify-between sm:justify-start gap-2 shrink-0">
            {/* Relevant Fare Tag */}
            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase font-mono block">Relevant Fare</span>
              <div className="text-xl sm:text-2xl font-black font-mono text-emerald-400 leading-none">
                {isFreePass ? '₹0 FREE' : `₹${effectiveFare}`}
                {effectiveFare < route.fare && !isFreePass && (
                  <span className="text-xs font-normal text-slate-500 line-through ml-1">
                    ₹{route.fare}
                  </span>
                )}
              </div>
              <span className="text-[10px] text-emerald-300 block font-medium mt-0.5">
                {fareBenefitNote}
              </span>
            </div>

            {/* Risk Score Pill */}
            <div className={`px-2.5 py-1 rounded-lg border text-right ${theme.badgeBg}`}>
              <div className="text-[10px] uppercase font-mono tracking-wider text-slate-300">
                Risk Score
              </div>
              <div className={`text-base sm:text-lg font-black font-mono leading-tight ${theme.scoreText}`}>
                {breakdown.totalScore}
                <span className="text-xs font-normal text-slate-400 ml-1">/100</span>
              </div>
            </div>
          </div>
        </div>

        {/* Live Approaching Bus Location Banner */}
        <div className="mt-3.5 p-2.5 rounded-xl bg-slate-950/90 border border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-200 truncate">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping shrink-0" />
            <span className="font-semibold text-cyan-300">Live Bus Location:</span>
            <span className="truncate text-slate-300 font-mono text-[11px]">
              {busLocationDescription}
            </span>
          </div>

          {onTrackBusLocation && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onTrackBusLocation(route);
              }}
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-700/50 text-[11px] font-bold shrink-0 transition"
            >
              Track GPS
            </button>
          )}
        </div>

        {/* Dynamic Key Features Row: Seats available, arrival uncertainty, step-free */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3 pt-3 border-t border-slate-800 text-xs">
          {/* Seats Available & Crowding (Free vs Occupied) */}
          <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between text-slate-300 mb-1">
              <span className="flex items-center gap-1.5 font-semibold text-emerald-300">
                <Users className="w-3.5 h-3.5" />
                <span>{route.availableSeats} Seats Free</span>
              </span>
              <span className="font-mono text-[11px] text-slate-400">
                {route.availableSeats > 15 ? 'Plenty Open' : route.availableSeats > 5 ? 'Few Free' : 'Standing Only'}
              </span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className={`h-full ${
                  route.availableSeats < 6 ? 'bg-rose-500' : route.availableSeats < 15 ? 'bg-amber-400' : 'bg-emerald-400'
                }`}
                style={{ width: `${Math.round((route.availableSeats / route.totalSeats) * 100)}%` }}
              />
            </div>
            <div className="text-[10px] text-slate-500 pt-1 font-mono">
              Total {route.totalSeats} seats on-board
            </div>
          </div>

          {/* Arrival Uncertainty */}
          <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center gap-1.5 font-semibold">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>Arriving in {route.arrivalMinutes}m</span>
              </span>
              <span className="font-mono text-amber-300 font-bold">
                ±{route.arrivalUncertaintyMinutes}m
              </span>
            </div>
            <div className="text-[11px] text-slate-400 pt-0.5">
              Arrival uncertainty range
            </div>
          </div>

          {/* Step-Free Accessibility */}
          <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-semibold text-slate-300">
                <Accessibility className="w-3.5 h-3.5 text-emerald-400" />
                <span>Boarding</span>
              </span>
              {route.wheelchairAccessible ? (
                <span className="text-emerald-400 font-bold flex items-center gap-1 text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Step-Free
                </span>
              ) : (
                <span className="text-rose-400 font-bold flex items-center gap-1 text-[11px]">
                  <XCircle className="w-3.5 h-3.5" /> High Steps
                </span>
              )}
            </div>
            <div className="text-[11px] text-slate-400 pt-0.5">
              {route.isLowFloor ? 'Ramp equipped' : 'Stairs required'}
            </div>
          </div>
        </div>

        {/* Action Buttons: Check Seat Status + Track GPS + Spoken Voice (No Ticket Booking!) */}
        <div className="flex flex-wrap items-center justify-between gap-2 mt-4 pt-3 border-t border-slate-800">
          <div className="flex items-center gap-2">
            {/* Check Available Seats Button (Read-only layout viewer) */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenSeatLayout(route);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition"
            >
              <Armchair className="w-4 h-4" />
              <span>Check Available Seats</span>
            </button>

            {/* Track Bus Location */}
            {onTrackBusLocation && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onTrackBusLocation(route);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-cyan-300 border border-slate-700 text-xs font-semibold transition"
              >
                <span>Track Bus on Map</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Voice Guidance Button */}
            <button
              onClick={handleVoiceGuidance}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition ${
                isSpeakingThis
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                  : 'bg-slate-900 text-emerald-300 border-slate-700 hover:bg-slate-800'
              }`}
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>{isSpeakingThis ? 'Speaking...' : t.btnListenVoice}</span>
            </button>

            {/* Details Accordion Toggle */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setExpanded(!expanded);
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 transition"
            >
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Expanded Breakdown */}
        {expanded && (
          <div className="mt-3.5 pt-3 border-t border-slate-800 space-y-2 bg-slate-950/70 p-3 rounded-xl text-xs">
            <div className="font-semibold text-slate-200 flex items-center justify-between">
              <span>Risk Factors Breakdown (Weights: Reliability {Math.round(profile.weights.reliability * 100)}%, Crowding {Math.round(profile.weights.crowding * 100)}%, Access {Math.round(profile.weights.access * 100)}%, Disruption {Math.round(profile.weights.disruption * 100)}%)</span>
              <span className="font-mono text-emerald-400 font-bold">{breakdown.totalScore}/100</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block">Reliability Risk:</span>
                <span className="font-mono font-bold text-white">{breakdown.reliabilityRisk}</span>
              </div>
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block">Crowding Risk:</span>
                <span className="font-mono font-bold text-white">{breakdown.crowdingRisk}</span>
              </div>
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block">Accessibility Risk:</span>
                <span className="font-mono font-bold text-white">{breakdown.accessibilityRisk}</span>
              </div>
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block">Disruption Risk:</span>
                <span className="font-mono font-bold text-white">{breakdown.disruptionRisk}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
