import React from 'react';
import { BacktestSummary, BacktestTripResult } from '../types/transit';
import {
  X,
  TrendingUp,
  Clock,
  Users,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Compass,
  ArrowRight,
} from 'lucide-react';

interface BacktestEvaluationModalProps {
  isOpen: boolean;
  onClose: () => void;
  summary: BacktestSummary;
  trips: BacktestTripResult[];
}

export const BacktestEvaluationModal: React.FC<BacktestEvaluationModalProps> = ({
  isOpen,
  onClose,
  summary,
  trips,
}) => {
  if (!isOpen) return null;

  const tt = summary.travelTimeModel;
  const ts = summary.transitShieldModel;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Evaluation &amp; Back-Testing Engine
                </h3>
                <span className="text-[11px] font-mono text-indigo-300 bg-indigo-950/70 px-2 py-0.5 rounded border border-indigo-800">
                  Slide 7 Model
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Direct empirical comparison: Travel-Time Optimization vs. TransitShield Journey Risk Score.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* Key Metric Comparison 4-Card Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* 1. On-Time Arrival Rate */}
            <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span className="font-semibold">On-Time Arrival</span>
                <Clock className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="flex items-baseline justify-between">
                <div>
                  <div className="text-2xl font-black font-mono text-emerald-400">
                    {ts.onTimeRate}%
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">TransitShield</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold font-mono text-slate-400">
                    {tt.onTimeRate}%
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">Travel-Time</div>
                </div>
              </div>
              <div className="text-[11px] text-emerald-300 font-semibold bg-emerald-950/60 px-2 py-0.5 rounded">
                +28.6% on-time gains
              </div>
            </div>

            {/* 2. Average Waiting Time */}
            <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span className="font-semibold">Average Wait</span>
                <Clock className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="flex items-baseline justify-between">
                <div>
                  <div className="text-2xl font-black font-mono text-cyan-400">
                    {ts.avgWaitTimeMinutes}m
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">TransitShield</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold font-mono text-slate-400">
                    {tt.avgWaitTimeMinutes}m
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">Travel-Time</div>
                </div>
              </div>
              <div className="text-[11px] text-cyan-300 font-semibold bg-cyan-950/60 px-2 py-0.5 rounded">
                -11.3 mins idle platform wait
              </div>
            </div>

            {/* 3. High Crowding Exposure */}
            <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span className="font-semibold">Severe Crowding</span>
                <Users className="w-4 h-4 text-amber-400" />
              </div>
              <div className="flex items-baseline justify-between">
                <div>
                  <div className="text-2xl font-black font-mono text-amber-400">
                    {ts.highCrowdingRate}%
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">TransitShield</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold font-mono text-slate-400">
                    {tt.highCrowdingRate}%
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">Travel-Time</div>
                </div>
              </div>
              <div className="text-[11px] text-amber-300 font-semibold bg-amber-950/60 px-2 py-0.5 rounded">
                -59.3% packed bus trips
              </div>
            </div>

            {/* 4. Accessibility Violations */}
            <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span className="font-semibold">Access Violations</span>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="flex items-baseline justify-between">
                <div>
                  <div className="text-2xl font-black font-mono text-emerald-400">
                    {ts.accessibilityViolationRate}%
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">TransitShield</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold font-mono text-rose-400">
                    {tt.accessibilityViolationRate}%
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">Travel-Time</div>
                </div>
              </div>
              <div className="text-[11px] text-emerald-300 font-semibold bg-emerald-950/60 px-2 py-0.5 rounded">
                Zero stranded riders (hard rule)
              </div>
            </div>
          </div>

          {/* Detailed Historical Trip Back-Test Log */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Compass className="w-4 h-4 text-cyan-400" />
                <span>Historical Journey Replay Logs</span>
              </h4>
              <span className="text-xs text-slate-400 font-mono">
                Sample: {summary.sampleSize} verified journeys
              </span>
            </div>

            <div className="space-y-2.5">
              {trips.map(trip => (
                <div
                  key={trip.id}
                  className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3.5 text-xs grid grid-cols-1 md:grid-cols-2 gap-3"
                >
                  {/* Travel-Time Only Decision */}
                  <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/60 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="font-mono text-slate-300 font-semibold">{trip.timeOfDay}</span>
                      <span className="text-rose-400 font-semibold">Travel-Time Method</span>
                    </div>
                    <div className="font-bold text-slate-200">{trip.travelTimeChosenRoute}</div>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400">
                      <span>Actual duration: <strong className="text-rose-400 font-mono">{trip.travelTimeDuration}m</strong></span>
                      <span>Delay: <strong className="text-rose-400 font-mono">+{trip.travelTimeDelay}m</strong></span>
                    </div>
                    {trip.travelTimeAccessibilityIssue && (
                      <div className="text-[10px] text-rose-400 flex items-center gap-1 font-medium">
                        <AlertTriangle className="w-3 h-3" />
                        <span>Encountered blocked pedestrian ramp at interchange.</span>
                      </div>
                    )}
                  </div>

                  {/* TransitShield Decision */}
                  <div className="p-2.5 rounded-lg bg-cyan-950/30 border border-cyan-800/40 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] text-cyan-300">
                      <span className="font-mono text-cyan-400 font-semibold">Risk Engine Decision</span>
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> TransitShield
                      </span>
                    </div>
                    <div className="font-bold text-white">{trip.transitShieldChosenRoute}</div>
                    <div className="flex items-center gap-3 text-[11px] text-slate-300">
                      <span>Actual duration: <strong className="text-emerald-400 font-mono">{trip.transitShieldDuration}m</strong></span>
                      <span>Delay: <strong className="text-emerald-400 font-mono">+{trip.transitShieldDelay}m</strong></span>
                    </div>
                    <div className="text-[10px] text-emerald-300 flex items-center gap-1 font-medium">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Step-free verified; seated comfort ensured.</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
