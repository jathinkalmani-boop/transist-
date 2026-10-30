import React from 'react';
import { CommuterProfile } from '../types/transit';
import { ShieldCheck, Activity, Users, Ban, Compass } from 'lucide-react';

interface RiskMatrixBannerProps {
  profile: CommuterProfile;
}

export const RiskMatrixBanner: React.FC<RiskMatrixBannerProps> = ({ profile }) => {
  const w = profile.weights;

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 sm:p-5 relative overflow-hidden mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left: Philosophy & Profile Rationale */}
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-widest font-mono text-cyan-400 font-semibold">
              Journey Risk Score Model
            </span>
            <span className="text-slate-600 text-xs">/</span>
            <span className="text-xs text-slate-300 font-medium">
              Lower is safer (0 - 100)
            </span>
          </div>

          <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <Compass className="w-5 h-5 text-cyan-400 shrink-0" />
            <span>Active Commute Profile: {profile.name}</span>
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {profile.description} Conventional apps rank strictly by optimistic timetable, exposing commuters to full buses and blocked stops. TransitShield unifies arrival uncertainty, seat availability, physical barriers, and active road disruptions into one actionable score.
          </p>

          {profile.hardConstraints.requiresStepFree && (
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-300 bg-emerald-950/60 border border-emerald-800/80 px-2.5 py-1 rounded-md">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Hard Constraint Active: Step-free access is mandatory. Routes without low-floor or ramp access are flagged ineligible.</span>
            </div>
          )}
        </div>

        {/* Right: Dynamic Weight Allocation Breakdown */}
        <div className="bg-slate-950/90 border border-slate-800 rounded-lg p-3 sm:p-3.5 min-w-[280px]">
          <div className="text-xs font-mono uppercase text-slate-400 mb-2.5 flex items-center justify-between">
            <span>Score Weights</span>
            <span className="text-cyan-400 font-semibold">Sum: 100%</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {/* Reliability */}
            <div className="bg-slate-900/90 p-2 rounded border border-slate-800/80">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-cyan-400" />
                  Reliability
                </span>
                <span className="font-mono font-bold text-slate-200">
                  {Math.round(w.reliability * 100)}%
                </span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-cyan-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${w.reliability * 100}%` }}
                />
              </div>
            </div>

            {/* Crowding */}
            <div className="bg-slate-900/90 p-2 rounded border border-slate-800/80">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-amber-400" />
                  Crowding
                </span>
                <span className="font-mono font-bold text-slate-200">
                  {Math.round(w.crowding * 100)}%
                </span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-amber-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${w.crowding * 100}%` }}
                />
              </div>
            </div>

            {/* Accessibility */}
            <div className="bg-slate-900/90 p-2 rounded border border-slate-800/80">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Access
                </span>
                <span className="font-mono font-bold text-slate-200">
                  {Math.round(w.access * 100)}%
                </span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${w.access * 100}%` }}
                />
              </div>
            </div>

            {/* Disruption */}
            <div className="bg-slate-900/90 p-2 rounded border border-slate-800/80">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="flex items-center gap-1.5">
                  <Ban className="w-3.5 h-3.5 text-rose-400" />
                  Disruption
                </span>
                <span className="font-mono font-bold text-slate-200">
                  {Math.round(w.disruption * 100)}%
                </span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-rose-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${w.disruption * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
