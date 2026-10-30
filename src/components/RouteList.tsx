import React from 'react';
import {
  TransitRoute,
  JourneyRiskBreakdown,
  CommuterProfile,
  TransitStop,
  PassengerUser,
} from '../types/transit';
import { RouteCard } from './RouteCard';
import { SupportedLanguage } from '../services/speechService';
import { TRANSLATIONS } from '../services/i18n';
import { Sparkles, AlertOctagon } from 'lucide-react';

interface RouteListProps {
  rankedRoutes: { route: TransitRoute; breakdown: JourneyRiskBreakdown }[];
  profile: CommuterProfile;
  passenger: PassengerUser;
  stopsMap: Map<string, TransitStop>;
  language: SupportedLanguage;
  selectedRouteId: string | null;
  onSelectRoute: (id: string) => void;
  onOpenSeatLayout: (route: TransitRoute) => void;
  onTrackBusLocation?: (route: TransitRoute) => void;
}

export const RouteList: React.FC<RouteListProps> = ({
  rankedRoutes,
  profile,
  passenger,
  stopsMap,
  language,
  selectedRouteId,
  onSelectRoute,
  onOpenSeatLayout,
  onTrackBusLocation,
}) => {
  const t = TRANSLATIONS[language];

  const recommendedItem = rankedRoutes.find(r => !r.breakdown.isViolatingHardConstraint);
  const alternatives = rankedRoutes.filter(r => r !== recommendedItem && !r.breakdown.isViolatingHardConstraint);
  const inaccessible = rankedRoutes.filter(r => r.breakdown.isViolatingHardConstraint);

  return (
    <div className="space-y-4">
      {/* List Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span>{t.busesFound(rankedRoutes.length)}</span>
            <span className="text-xs font-mono font-normal text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
              Risk Sorted
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            {t.lowerIsSafer}
          </p>
        </div>

        {/* Slide 6 Quick Reference Badge */}
        <div className="hidden lg:flex items-center gap-2 text-xs bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800 font-mono">
          <span className="text-slate-400">Default Benchmark:</span>
          <span className="text-emerald-400 font-semibold">Bus 335E (18)</span>
          <span className="text-slate-600">·</span>
          <span className="text-cyan-400 font-semibold">Metro+Feeder (24)</span>
          <span className="text-slate-600">·</span>
          <span className="text-rose-400 font-semibold">Bus 500D (52)</span>
        </div>
      </div>

      {/* Top Recommended Route */}
      {recommendedItem && (
        <div className="space-y-1">
          <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 px-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Optimal Low-Risk Choice for {passenger.name || profile.name}</span>
          </div>
          <RouteCard
            route={recommendedItem.route}
            breakdown={recommendedItem.breakdown}
            profile={profile}
            passenger={passenger}
            stopsMap={stopsMap}
            language={language}
            isSelected={selectedRouteId === recommendedItem.route.id}
            onSelect={() => onSelectRoute(recommendedItem.route.id)}
            onOpenSeatLayout={onOpenSeatLayout}
            onTrackBusLocation={onTrackBusLocation}
          />
        </div>
      )}

      {/* Feasible Alternative Routes */}
      {alternatives.length > 0 && (
        <div className="space-y-2 pt-2">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">
            Feasible Alternatives
          </div>
          <div className="space-y-3">
            {alternatives.map(({ route, breakdown }) => (
              <RouteCard
                key={route.id}
                route={route}
                breakdown={breakdown}
                profile={profile}
                passenger={passenger}
                stopsMap={stopsMap}
                language={language}
                isSelected={selectedRouteId === route.id}
                onSelect={() => onSelectRoute(route.id)}
                onOpenSeatLayout={onOpenSeatLayout}
                onTrackBusLocation={onTrackBusLocation}
              />
            ))}
          </div>
        </div>
      )}

      {/* Inaccessible or Excluded Routes (e.g. for wheelchair users) */}
      {inaccessible.length > 0 && (
        <div className="space-y-2 pt-3">
          <div className="text-xs font-semibold text-rose-400 uppercase tracking-wider flex items-center gap-1.5 px-1">
            <AlertOctagon className="w-3.5 h-3.5" />
            <span>Ineligible Due to Hard Accessibility Constraints ({inaccessible.length})</span>
          </div>
          <p className="text-xs text-slate-400 px-1">
            These routes fail the strict step-free requirement or contain impassable barriers for your profile.
          </p>
          <div className="space-y-3">
            {inaccessible.map(({ route, breakdown }) => (
              <RouteCard
                key={route.id}
                route={route}
                breakdown={breakdown}
                profile={profile}
                passenger={passenger}
                stopsMap={stopsMap}
                language={language}
                isSelected={selectedRouteId === route.id}
                onSelect={() => onSelectRoute(route.id)}
                onOpenSeatLayout={onOpenSeatLayout}
                onTrackBusLocation={onTrackBusLocation}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
