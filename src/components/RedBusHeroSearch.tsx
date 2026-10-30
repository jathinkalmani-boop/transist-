import React, { useState, useMemo } from 'react';
import { TransitStop, PassengerUser, CustomerLocation } from '../types/transit';
import { TRANSLATIONS } from '../services/i18n';
import { SupportedLanguage } from '../services/speechService';
import {
  MapPin,
  ArrowRightLeft,
  Calendar,
  Search,
  User,
  ShieldCheck,
  Edit3,
  Filter,
  LocateFixed,
  Building2,
  ChevronDown,
  ChevronUp,
  Bus,
  Sparkles,
} from 'lucide-react';

interface RedBusHeroSearchProps {
  stops: TransitStop[];
  passenger: PassengerUser;
  customerLocation: CustomerLocation;
  language: SupportedLanguage;
  fromStopId: string;
  toStopId: string;
  onFromStopChange: (id: string) => void;
  onToStopChange: (id: string) => void;
  onSearch: () => void;
  onEditPassenger: () => void;
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  onSelectCustomerLocation?: (stop: TransitStop) => void;
  onDetectLocation?: () => void;
  searchKeyword?: string;
  onSearchKeywordChange?: (keyword: string) => void;
  isLocating?: boolean;
}

export const RedBusHeroSearch: React.FC<RedBusHeroSearchProps> = ({
  stops,
  passenger,
  customerLocation,
  language,
  fromStopId,
  toStopId,
  onFromStopChange,
  onToStopChange,
  onSearch,
  onEditPassenger,
  activeFilter,
  onFilterChange,
  onDetectLocation,
  searchKeyword = '',
  onSearchKeywordChange,
  isLocating = false,
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  const [journeyDate, setJourneyDate] = useState('Today, 30 Oct');
  const [areaSearchQuery, setAreaSearchQuery] = useState('');
  const [isAreaStopsExpanded, setIsAreaStopsExpanded] = useState(true);
  const [areaScope, setAreaScope] = useState<'departure' | 'destination' | 'all'>('departure');

  const selectedFromStop = stops.find(s => s.id === fromStopId);
  const selectedToStop = stops.find(s => s.id === toStopId);

  // Determine current active searched locality
  const currentDepartureLocality = selectedFromStop?.locality || 'Central Hub';
  const currentDestinationLocality = selectedToStop?.locality || 'Outer Ring Corridor';

  const handleSwapStops = () => {
    const temp = fromStopId;
    onFromStopChange(toStopId);
    onToStopChange(temp);
  };

  const getSpecialBadgeText = () => {
    switch (passenger.specialPerson) {
      case 'wheelchair':
        return 'Wheelchair User · 100% Step-Free Mandatory';
      case 'elderly':
        return `Senior Citizen (Age ${passenger.age}) · 50% Concession`;
      case 'mobility':
        return 'Reduced Mobility · Low-Floor Boarding';
      case 'vision':
        return 'Visually Impaired · Audio Guidance';
      default:
        return 'Standard Commuter';
    }
  };

  // Extract all distinct localities
  const allLocalities = useMemo(() => {
    const set = new Set<string>();
    stops.forEach(s => set.add(s.locality));
    return Array.from(set);
  }, [stops]);

  // Filter stops located in the searched area
  const stopsInSearchedArea = useMemo(() => {
    let targetLocality = '';
    if (areaScope === 'departure') {
      targetLocality = currentDepartureLocality;
    } else if (areaScope === 'destination') {
      targetLocality = currentDestinationLocality;
    }

    return stops.filter(s => {
      if (areaSearchQuery.trim()) {
        const q = areaSearchQuery.toLowerCase();
        return (
          s.name.toLowerCase().includes(q) ||
          s.code.toLowerCase().includes(q) ||
          s.locality.toLowerCase().includes(q)
        );
      }

      if (areaScope === 'all') return true;
      return s.locality.toLowerCase() === targetLocality.toLowerCase();
    });
  }, [stops, areaScope, currentDepartureLocality, currentDestinationLocality, areaSearchQuery]);

  const getStepFreeBadge = (status: TransitStop['accessibility']['status']) => {
    switch (status) {
      case 'step_free':
        return {
          label: 'Step-Free (Green)',
          badgeClass: 'bg-emerald-950 text-emerald-300 border-emerald-700/80',
          dotClass: 'bg-emerald-400',
        };
      case 'barrier':
        return {
          label: 'Barrier Present (Amber)',
          badgeClass: 'bg-amber-950 text-amber-300 border-amber-700/80',
          dotClass: 'bg-amber-400',
        };
      case 'blocked_path':
        return {
          label: 'Path Blocked (Red)',
          badgeClass: 'bg-rose-950 text-rose-300 border-rose-700/80',
          dotClass: 'bg-rose-400',
        };
      default:
        return {
          label: 'Unknown',
          badgeClass: 'bg-slate-800 text-slate-300 border-slate-700',
          dotClass: 'bg-slate-400',
        };
    }
  };

  return (
    <div className="space-y-4 mb-6">
      {/* Passenger Info & RedBus Green Hero Search Bar */}
      <div className="bg-gradient-to-b from-emerald-900/60 via-slate-900 to-slate-950 border border-emerald-800/60 rounded-2xl p-4 sm:p-6 shadow-xl relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Top Commuter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-emerald-800/40">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300">
              <User className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">
                  {passenger.name || 'Commuter'}
                </span>
                <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                  {passenger.gender}, Age {passenger.age}
                </span>
              </div>
              <p className="text-xs text-emerald-400/90 font-medium flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>{getSpecialBadgeText()}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Real-time Location Trigger Button */}
            {onDetectLocation && (
              <button
                onClick={onDetectLocation}
                disabled={isLocating}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-800/90 hover:bg-emerald-700 text-emerald-200 hover:text-white border border-emerald-600/70 text-xs font-semibold transition shadow-xs"
                title="Detect live GPS position and set nearest bus stop"
              >
                <LocateFixed className={`w-3.5 h-3.5 text-emerald-300 ${isLocating ? 'animate-spin' : ''}`} />
                <span>{isLocating ? 'Detecting GPS...' : 'Use My Live Location'}</span>
              </button>
            )}

            <button
              onClick={onEditPassenger}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-semibold transition"
            >
              <Edit3 className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t.logoutOrEdit}</span>
            </button>
          </div>
        </div>

        {/* Global Bus Keyword / Route Text Search Bar */}
        <div className="mb-3.5">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-emerald-400" />
            <input
              type="text"
              placeholder="Search by Bus Number or Route (e.g. 335E, 500D, V-360, Metro Feeder, Majestic, Whitefield)..."
              value={searchKeyword}
              onChange={(e) => onSearchKeywordChange && onSearchKeywordChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  onSearch();
                }
              }}
              className="w-full bg-slate-950/90 border border-emerald-700/60 rounded-xl pl-10 pr-24 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-medium shadow-inner"
            />
            {searchKeyword && (
              <button
                onClick={() => onSearchKeywordChange && onSearchKeywordChange('')}
                className="absolute right-3 top-2.5 px-2 py-0.5 rounded text-[10px] text-slate-400 hover:text-white bg-slate-800"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Main RedBus-Green Stop Search Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center bg-slate-950/90 p-3 sm:p-4 rounded-xl border border-emerald-900/50">
          {/* From Stop */}
          <div className="md:col-span-3 space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span>{t.labelFrom} (Departure)</span>
              </label>
              {onDetectLocation && (
                <button
                  type="button"
                  onClick={onDetectLocation}
                  className="text-[10px] text-emerald-300 hover:text-emerald-200 font-bold flex items-center gap-1 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-800 transition"
                  title="Detect live GPS location & set closest bus stop"
                >
                  <LocateFixed className="w-2.5 h-2.5 text-emerald-400" />
                  <span>GPS Near Me</span>
                </button>
              )}
            </div>
            <select
              value={fromStopId}
              onChange={(e) => onFromStopChange(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-medium truncate"
            >
              {stops.map(s => (
                <option key={s.id} value={s.id} disabled={s.id === toStopId}>
                  {s.id === customerLocation.stopId ? '📍 [Closest to You] ' : ''}{s.code} · {s.name} ({s.locality})
                </option>
              ))}
            </select>
            <div className="text-[10px] text-slate-400 flex items-center gap-1">
              <span>Area:</span>
              <span className="font-semibold text-emerald-300">{selectedFromStop?.locality}</span>
            </div>
          </div>

          {/* Swap Button */}
          <div className="md:col-span-1 flex items-center justify-center">
            <button
              onClick={handleSwapStops}
              title={t.quickSwap}
              className="p-2.5 rounded-full bg-emerald-950/80 hover:bg-emerald-800 text-emerald-300 border border-emerald-700 shadow-md transition transform hover:rotate-180 duration-300"
            >
              <ArrowRightLeft className="w-4 h-4" />
            </button>
          </div>

          {/* To Destination */}
          <div className="md:col-span-3 space-y-1">
            <label className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-teal-400" />
              <span>{t.labelTo} (Destination)</span>
            </label>
            <select
              value={toStopId}
              onChange={(e) => onToStopChange(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-medium truncate"
            >
              {stops.map(s => (
                <option key={s.id} value={s.id} disabled={s.id === fromStopId}>
                  {s.code} · {s.name} ({s.locality})
                </option>
              ))}
            </select>
            <div className="text-[10px] text-slate-400 flex items-center gap-1">
              <span>Area:</span>
              <span className="font-semibold text-teal-300">{selectedToStop?.locality}</span>
            </div>
          </div>

          {/* Date & Time */}
          <div className="md:col-span-2 space-y-1">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{t.labelDate}</span>
            </label>
            <select
              value={journeyDate}
              onChange={(e) => setJourneyDate(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            >
              <option value="Today, 30 Oct">Today, 30 Oct</option>
              <option value="Tomorrow, 31 Oct">Tomorrow, 31 Oct</option>
              <option value="Weekend Special">Weekend Special</option>
            </select>
          </div>

          {/* RedBus-Style Big Green Search Button */}
          <div className="md:col-span-3">
            <button
              onClick={onSearch}
              className="w-full h-11 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs tracking-wider uppercase flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition transform active:scale-95 cursor-pointer"
            >
              <Search className="w-4 h-4 stroke-[2.5]" />
              <span>{t.btnSearchBuses}</span>
            </button>
          </div>
        </div>

        {/* Filter Chips Bar (RedBus style) */}
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-800/80 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-400 flex items-center gap-1 font-semibold shrink-0">
            <Filter className="w-3.5 h-3.5 text-emerald-400" />
            <span>Filter:</span>
          </span>

          {[
            { id: 'all', label: t.filterAll },
            { id: 'lowest_risk', label: t.filterLowestRisk },
            { id: 'step_free', label: t.filterStepFree },
            { id: 'seats_available', label: t.filterSeatsAvailable },
          ].map(chip => (
            <button
              key={chip.id}
              onClick={() => onFilterChange(chip.id)}
              className={`px-3 py-1.5 rounded-lg font-semibold shrink-0 transition text-xs ${
                activeFilter === chip.id
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700'
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* CORE FEATURE: BUS STOPS LOCATED IN THE SEARCHED AREA */}
      <div className="bg-slate-900/90 border border-emerald-800/60 rounded-2xl p-4 sm:p-5 shadow-lg">
        {/* Section Header with Expand/Collapse & Area Scope Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Bus Stops Located in Searched Area
                </h3>
                <span className="text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded-full font-bold">
                  {stopsInSearchedArea.length} Stops Found
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Shows all neighborhood bus stops in your searched location with step-free accessibility &amp; boarding bays
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {/* Quick Area Scope Switcher */}
            <div className="flex items-center bg-slate-950 rounded-lg p-0.5 border border-slate-800 text-xs">
              <button
                onClick={() => {
                  setAreaScope('departure');
                  setAreaSearchQuery('');
                }}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition ${
                  areaScope === 'departure' && !areaSearchQuery
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                From Area ({currentDepartureLocality})
              </button>
              <button
                onClick={() => {
                  setAreaScope('destination');
                  setAreaSearchQuery('');
                }}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition ${
                  areaScope === 'destination' && !areaSearchQuery
                    ? 'bg-teal-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                To Area ({currentDestinationLocality})
              </button>
              <button
                onClick={() => {
                  setAreaScope('all');
                }}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition ${
                  areaScope === 'all'
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                All Areas
              </button>
            </div>

            <button
              onClick={() => setIsAreaStopsExpanded(!isAreaStopsExpanded)}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              title={isAreaStopsExpanded ? 'Collapse' : 'Expand'}
            >
              {isAreaStopsExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Search input for specific locality/landmark within area */}
        {isAreaStopsExpanded && (
          <div className="pt-3 space-y-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter stops by name, code, landmark (e.g. Majestic, EcoSpace, Whitefield, ITPL)..."
                  value={areaSearchQuery}
                  onChange={(e) => setAreaSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-medium"
                />
              </div>

              {/* Area Quick Selector Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
                <span className="text-slate-500 text-[10px] uppercase font-bold shrink-0">Popular:</span>
                {allLocalities.slice(0, 5).map(loc => (
                  <button
                    key={loc}
                    onClick={() => {
                      setAreaSearchQuery(loc);
                    }}
                    className={`px-2 py-1 rounded-lg border text-xs whitespace-nowrap transition font-medium ${
                      areaSearchQuery === loc
                        ? 'bg-emerald-500 text-slate-950 font-bold border-emerald-400'
                        : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {loc}
                  </button>
                ))}
              </div>
            </div>

            {/* List of Bus Stops Located in the Searched Area */}
            {stopsInSearchedArea.length === 0 ? (
              <div className="p-6 text-center text-slate-400 bg-slate-950/60 rounded-xl border border-slate-800 text-xs">
                No bus stops found matching &quot;{areaSearchQuery}&quot; in this area. Try searching another neighborhood or selecting &quot;All Areas&quot;.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {stopsInSearchedArea.map(stop => {
                  const badge = getStepFreeBadge(stop.accessibility.status);
                  const isCurrentDeparture = fromStopId === stop.id;
                  const isCurrentDestination = toStopId === stop.id;
                  const isCustomerHere = customerLocation.stopId === stop.id;

                  return (
                    <div
                      key={stop.id}
                      className={`p-3.5 rounded-xl border transition flex flex-col justify-between gap-2.5 relative ${
                        isCurrentDeparture
                          ? 'bg-emerald-950/40 border-emerald-500 ring-1 ring-emerald-500/50'
                          : isCurrentDestination
                          ? 'bg-teal-950/40 border-teal-500 ring-1 ring-teal-500/50'
                          : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {/* Top: Stop Code, Locality, and Accessibility Badge */}
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-[11px] font-bold text-white bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                              {stop.code}
                            </span>
                            <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/60">
                              {stop.locality}
                            </span>
                          </div>

                          {/* Step-Free Indicator */}
                          <div className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border font-bold ${badge.badgeClass}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${badge.dotClass}`} />
                            <span>{badge.label}</span>
                          </div>
                        </div>

                        {/* Stop Name & Customer Presence */}
                        <div className="flex items-start gap-1.5">
                          <MapPin className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${
                            isCurrentDeparture ? 'text-emerald-400' : isCurrentDestination ? 'text-teal-400' : 'text-slate-400'
                          }`} />
                          <div>
                            <h4 className="text-xs font-bold text-white leading-snug">
                              {stop.name}
                            </h4>
                            {isCustomerHere && (
                              <span className="inline-flex items-center gap-1 text-[10px] text-cyan-400 font-mono mt-0.5 font-bold">
                                📍 You are located at this stop (GPS fixed)
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Accessibility Amenities summary */}
                        <p className="text-[11px] text-slate-300 mt-1.5 line-clamp-2 leading-relaxed">
                          {stop.accessibility.details}
                        </p>

                        {/* Amenity Icons Row */}
                        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-800/80 text-[10px] text-slate-400">
                          <span className={`flex items-center gap-1 ${stop.accessibility.hasRamps ? 'text-emerald-300' : 'text-slate-500'}`}>
                            {stop.accessibility.hasRamps ? '✓ Ramp' : '✗ No Ramp'}
                          </span>
                          <span>·</span>
                          <span className={`flex items-center gap-1 ${stop.accessibility.lowFloorCurbs ? 'text-emerald-300' : 'text-slate-500'}`}>
                            {stop.accessibility.lowFloorCurbs ? '✓ Low-Floor Curbs' : '✗ Standard Curb'}
                          </span>
                          <span>·</span>
                          <span className="text-slate-300">
                            Crowd: <strong className="capitalize text-white">{stop.liveCrowdEstimate}</strong>
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons to Select as Pickup or Destination */}
                      <div className="grid grid-cols-2 gap-1.5 pt-1">
                        <button
                          onClick={() => onFromStopChange(stop.id)}
                          className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition flex items-center justify-center gap-1 ${
                            isCurrentDeparture
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-slate-900 hover:bg-slate-800 text-emerald-300 border border-emerald-900/80'
                          }`}
                        >
                          {isCurrentDeparture ? '✓ From Stop' : 'Set as Pickup'}
                        </button>

                        <button
                          onClick={() => onToStopChange(stop.id)}
                          className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition flex items-center justify-center gap-1 ${
                            isCurrentDestination
                              ? 'bg-teal-600 text-white shadow-xs'
                              : 'bg-slate-900 hover:bg-slate-800 text-teal-300 border border-teal-900/80'
                          }`}
                        >
                          {isCurrentDestination ? '✓ To Stop' : 'Set as Dropoff'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
