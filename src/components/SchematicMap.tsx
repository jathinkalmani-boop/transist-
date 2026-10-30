import React from 'react';
import { TransitStop, TransitRoute } from '../types/transit';
import { Accessibility, AlertCircle, Info, Bus, CheckCircle2, MapPin } from 'lucide-react';

interface SchematicMapProps {
  stops: TransitStop[];
  routes: TransitRoute[];
  selectedRouteId: string | null;
  onSelectStop: (stop: TransitStop) => void;
}

export const SchematicMap: React.FC<SchematicMapProps> = ({
  stops,
  routes,
  selectedRouteId,
  onSelectStop,
}) => {
  const selectedRoute = routes.find(r => r.id === selectedRouteId);

  // SVG canvas dimensions
  const svgWidth = 840;
  const svgHeight = 360;

  // Colors according to Slide 4: Green: step-free, Amber: barrier, Red: path blocked
  const getStopStatusColor = (status: TransitStop['accessibility']['status']) => {
    switch (status) {
      case 'step_free':
        return '#10b981'; // Green (step-free)
      case 'barrier':
        return '#f59e0b'; // Amber (barrier)
      case 'blocked_path':
        return '#f43f5e'; // Red (path blocked)
      default:
        return '#94a3b8';
    }
  };

  // Helper to draw connecting paths between stops for a route
  const getPathForRoute = (route: TransitRoute) => {
    const routeStops = route.stops
      .map(id => stops.find(s => s.id === id))
      .filter(Boolean) as TransitStop[];

    if (routeStops.length < 2) return '';
    return routeStops.reduce((path, stop, i) => {
      return i === 0
        ? `M ${stop.coordinates.x} ${stop.coordinates.y}`
        : `${path} L ${stop.coordinates.x} ${stop.coordinates.y}`;
    }, '');
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 sm:p-5 flex flex-col gap-4">
      {/* Header & Accessibility Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
            <span>Schematic Transit Network Map</span>
            <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/60">
              Interactive
            </span>
          </h3>
          <p className="text-xs text-slate-400">
            Real-time step-free barrier statuses and live corridor path highlights.
          </p>
        </div>

        {/* Legend (Slide 4: Green: step-free, Amber: barrier, Red: path blocked) */}
        <div className="flex items-center gap-3 text-xs bg-slate-950/80 px-3 py-1.5 rounded-lg border border-slate-800">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-xs shadow-emerald-500/50" />
            <span className="text-emerald-300 font-medium">Step-Free</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-xs shadow-amber-500/50" />
            <span className="text-amber-300 font-medium">Barrier Present</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-xs shadow-rose-500/50" />
            <span className="text-rose-300 font-medium">Path Blocked</span>
          </div>
        </div>
      </div>

      {/* SVG Container */}
      <div className="relative w-full overflow-x-auto rounded-lg bg-slate-950 border border-slate-800/80 p-2">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full min-w-[700px] h-[300px] select-none"
        >
          {/* Subtle Grid Lines */}
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.5" strokeOpacity="0.4" />
            </pattern>
            {/* Pulsing Glow Filters */}
            <filter id="glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          <rect width={svgWidth} height={svgHeight} fill="url(#grid)" />

          {/* Route Paths */}
          {routes.map(r => {
            const isTarget = selectedRouteId === r.id;
            const pathD = getPathForRoute(r);
            const isDisrupted = r.id === 'route-500d';

            let strokeColor = '#475569';
            if (isTarget) {
              strokeColor = isDisrupted ? '#f43f5e' : '#06b6d4';
            } else if (r.id === 'route-335e') {
              strokeColor = '#10b981';
            } else if (r.id === 'route-metro-feeder') {
              strokeColor = '#818cf8';
            }

            return (
              <g key={`path-${r.id}`}>
                {/* Background Shadow line */}
                <path
                  d={pathD}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth={isTarget ? 7 : 3}
                  strokeOpacity={isTarget ? 0.3 : 0.15}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Foreground Corridor Line */}
                <path
                  d={pathD}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth={isTarget ? 4 : 2}
                  strokeDasharray={r.type === 'metro_feeder' ? '8 4' : undefined}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="transition-all duration-300"
                />
              </g>
            );
          })}

          {/* Stops Nodes */}
          {stops.map(stop => {
            const statusColor = getStopStatusColor(stop.accessibility.status);
            const isStopOnSelectedRoute = selectedRoute?.stops.includes(stop.id);

            return (
              <g
                key={stop.id}
                transform={`translate(${stop.coordinates.x}, ${stop.coordinates.y})`}
                className="cursor-pointer group"
                onClick={() => onSelectStop(stop)}
              >
                {/* Active selection ring */}
                {isStopOnSelectedRoute && (
                  <circle
                    r="15"
                    fill="none"
                    stroke="#06b6d4"
                    strokeWidth="1.5"
                    strokeDasharray="4 2"
                    className="animate-spin origin-center"
                    style={{ animationDuration: '8s' }}
                  />
                )}

                {/* Stop Status Aura */}
                <circle
                  r="10"
                  fill={statusColor}
                  fillOpacity="0.2"
                />

                {/* Stop Node Circle */}
                <circle
                  r="6"
                  fill={statusColor}
                  stroke="#020617"
                  strokeWidth="2.5"
                  className="group-hover:scale-125 transition-transform"
                />

                {/* Stop Code Pill Label */}
                <g transform="translate(0, -14)">
                  <rect
                    x="-24"
                    y="-10"
                    width="48"
                    height="14"
                    rx="3"
                    fill="#0f172a"
                    stroke="#334155"
                    strokeWidth="0.8"
                  />
                  <text
                    x="0"
                    y="0"
                    textAnchor="middle"
                    fill="#e2e8f0"
                    fontSize="8"
                    fontWeight="700"
                    fontFamily="monospace"
                  >
                    {stop.code}
                  </text>
                </g>

                {/* Stop Name */}
                <text
                  x="0"
                  y="22"
                  textAnchor="middle"
                  fill="#f1f5f9"
                  fontSize="10"
                  fontWeight="600"
                  className="pointer-events-none drop-shadow"
                >
                  {stop.name.split(' ')[0]} {stop.name.split(' ')[1] || ''}
                </text>

                {/* Locality Subtitle */}
                <text
                  x="0"
                  y="33"
                  textAnchor="middle"
                  fill="#94a3b8"
                  fontSize="8"
                  className="pointer-events-none"
                >
                  {stop.locality}
                </text>
              </g>
            );
          })}

          {/* Live Simulated Bus Vehicle Pins with Uncertainty Halo */}
          {routes.map((r, i) => {
            const stopCount = r.stops.length;
            const targetStopId = r.stops[Math.min(1 + i, stopCount - 1)];
            const targetStop = stops.find(s => s.id === targetStopId);
            if (!targetStop) return null;

            // Offset vehicle slightly so it doesn't overlap stop directly
            const vx = targetStop.coordinates.x + (i % 2 === 0 ? 25 : -25);
            const vy = targetStop.coordinates.y + (i % 2 === 0 ? -15 : 20);

            return (
              <g key={`bus-pin-${r.id}`} transform={`translate(${vx}, ${vy})`}>
                {/* Uncertainty Halo (Radius proportional to ±uncertainty) */}
                <circle
                  r={Math.min(30, 10 + r.arrivalUncertaintyMinutes * 1.5)}
                  fill={r.arrivalUncertaintyMinutes > 6 ? '#f43f5e' : '#06b6d4'}
                  fillOpacity="0.12"
                  stroke={r.arrivalUncertaintyMinutes > 6 ? '#f43f5e' : '#06b6d4'}
                  strokeWidth="1"
                  strokeDasharray="2 2"
                />

                {/* Vehicle Marker */}
                <rect
                  x="-12"
                  y="-10"
                  width="24"
                  height="16"
                  rx="4"
                  fill="#0f172a"
                  stroke="#38bdf8"
                  strokeWidth="1.5"
                />
                <text
                  x="0"
                  y="2"
                  textAnchor="middle"
                  fill="#38bdf8"
                  fontSize="8"
                  fontWeight="bold"
                  fontFamily="monospace"
                >
                  {r.routeNumber.split(' ')[1] || 'BUS'}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Selected Route or Selected Stop Quick Insight Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-xs text-slate-300">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>
            {selectedRoute
              ? `Currently viewing path for ${selectedRoute.routeNumber}: ${selectedRoute.name}`
              : 'Click any stop on the schematic to inspect barriers, view elevator status, and check passing bus lines.'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-400">Inspect Stop:</span>
          <select
            className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-200 text-xs focus:ring-1 focus:ring-cyan-400"
            onChange={(e) => {
              const stop = stops.find(s => s.id === e.target.value);
              if (stop) onSelectStop(stop);
            }}
            defaultValue=""
          >
            <option value="" disabled>Select Stop to Inspect</option>
            {stops.map(s => (
              <option key={s.id} value={s.id}>
                {s.code} · {s.name} ({s.locality})
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
