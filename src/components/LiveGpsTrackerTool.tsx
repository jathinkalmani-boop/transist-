import React, { useState, useEffect } from 'react';
import { ETMGpsTelemetry, CustomerLocation, TransitStop } from '../types/transit';
import { TRANSLATIONS } from '../services/i18n';
import { SupportedLanguage } from '../services/speechService';
import { findNearestStop, calculateHaversineDistanceKm } from '../utils/geoUtils';
import {
  Navigation,
  MapPin,
  Compass,
  Radio,
  Wifi,
  Satellite,
  Gauge,
  Clock,
  ArrowLeft,
  RefreshCw,
  LocateFixed,
  Bus,
  CheckCircle2,
} from 'lucide-react';

interface LiveGpsTrackerToolProps {
  customerLocation: CustomerLocation;
  onUpdateCustomerLocation: (loc: CustomerLocation) => void;
  stops: TransitStop[];
  language: SupportedLanguage;
  onBack: () => void;
}

export const LiveGpsTrackerTool: React.FC<LiveGpsTrackerToolProps> = ({
  customerLocation,
  onUpdateCustomerLocation,
  stops,
  language: _language,
  onBack,
}) => {
  const [fleet, setFleet] = useState<ETMGpsTelemetry[]>([]);
  const [selectedBusId, setSelectedBusId] = useState<string>('BUS-KA-01-F-3351');
  const [isLocating, setIsLocating] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<string>(new Date().toLocaleTimeString());

  const fetchGpsTelemetry = async () => {
    try {
      const res = await fetch('/api/etm/gps');
      if (res.ok) {
        const data = await res.json();
        if (data.fleet) {
          setFleet(data.fleet);
          setLastRefreshed(new Date().toLocaleTimeString());
        }
      }
    } catch (e) {
      console.warn('GPS telemetry fetch fallback', e);
    }
  };

  useEffect(() => {
    fetchGpsTelemetry();
    const interval = setInterval(fetchGpsTelemetry, 3000); // Live poll every 3 seconds
    return () => clearInterval(interval);
  }, []);

  // Browser Geolocation Detection with auto nearest stop matching
  const handleDetectBrowserLocation = () => {
    if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setIsLocating(false);
          const userLat = pos.coords.latitude;
          const userLng = pos.coords.longitude;
          const { nearestStop, formattedDistance } = findNearestStop(userLat, userLng, stops);

          const newLoc: CustomerLocation = {
            stopId: nearestStop.id,
            locationName: nearestStop.name,
            landmark: `Closest Stop: ${formattedDistance} from your live GPS (${nearestStop.locality})`,
            latitude: userLat,
            longitude: userLng,
            accuracyMeters: Math.round(pos.coords.accuracy || 5),
            isLiveGps: true,
          };
          onUpdateCustomerLocation(newLoc);
        },
        (err) => {
          setIsLocating(false);
          console.warn('Browser geolocation denied/error, keeping stop preset', err);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    }
  };

  const selectedBus = fleet.find(b => b.busId === selectedBusId) || fleet[0];

  // Calculate distance between customer live location and bus in km
  const calculateApproxDistanceKm = (busLat: number, busLng: number) => {
    const dist = calculateHaversineDistanceKm(
      customerLocation.latitude,
      customerLocation.longitude,
      busLat,
      busLng
    );
    return Math.max(0.1, dist).toFixed(1);
  };

  return (
    <div className="space-y-5">
      {/* Universal Page Header with Prominent Back Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-emerald-800/80 rounded-2xl p-4 shadow-lg">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-white font-bold text-xs border border-slate-700 shadow-md transition transform active:scale-95 cursor-pointer"
            title="Return to previous screen"
          >
            <ArrowLeft className="w-4 h-4 text-emerald-400" />
            <span>Back</span>
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                <Navigation className="w-5 h-5 text-emerald-400" />
                <span>Live Bus Fleet GPS &amp; Commuter Radar</span>
              </h2>
              <span className="text-[10px] font-mono bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-800 font-bold">
                LIVE RADAR
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Real-time GPS satellite telemetry showing approaching buses and distance to you.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={fetchGpsTelemetry}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 text-slate-200 hover:text-white border border-slate-700 font-semibold transition"
          >
            <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
            <span>Refreshed: {lastRefreshed}</span>
          </button>
        </div>
      </div>

      {/* Persistent Customer Location Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 border-2 border-emerald-500/80 rounded-2xl p-4 sm:p-5 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-emerald-300 shrink-0 shadow-inner">
              <MapPin className="w-6 h-6 animate-bounce text-emerald-400" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
                  Your Commuter Location
                </span>
                <span className="text-[10px] font-mono bg-emerald-900/80 text-emerald-200 px-2 py-0.2 rounded-full flex items-center gap-1 font-bold">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>GPS Precision: ±{customerLocation.accuracyMeters}m</span>
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                {customerLocation.locationName}
              </h3>
              <div className="flex items-center gap-3 text-xs text-slate-400 font-mono flex-wrap">
                <span>Landmark: <strong className="text-slate-200">{customerLocation.landmark}</strong></span>
                <span>·</span>
                <span>Fix: <strong className="text-emerald-300">Live Device Geolocation</strong></span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDetectBrowserLocation}
              disabled={isLocating}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-emerald-700/30 transition disabled:opacity-50 cursor-pointer"
            >
              <LocateFixed className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
              <span>{isLocating ? 'Detecting GPS...' : 'Detect Device GPS'}</span>
            </button>

            {/* Change Stop Presets */}
            <select
              value={customerLocation.stopId}
              onChange={(e) => {
                const s = stops.find(stop => stop.id === e.target.value);
                if (s) {
                  onUpdateCustomerLocation({
                    stopId: s.id,
                    locationName: `${s.name} (${s.locality})`,
                    landmark: s.accessibility.details.slice(0, 40),
                    latitude: s.latitude || 12.9778,
                    longitude: s.longitude || 77.5726,
                    accuracyMeters: 4.5,
                    isLiveGps: true,
                  });
                }
              }}
              className="bg-slate-950 border border-emerald-700 rounded-xl px-3 py-2 text-xs text-emerald-200 font-semibold"
            >
              <option disabled>Switch Location to Stop:</option>
              {stops.map(s => (
                <option key={s.id} value={s.id}>
                  📍 {s.name} ({s.code})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main GPS Telemetry Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Live Radar / Tracked Fleet List (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span>Approaching Buses ({fleet.length})</span>
            </h3>
            <span className="text-xs text-emerald-400 font-mono">Live Feeds</span>
          </div>

          <div className="space-y-3">
            {fleet.map(bus => {
              const isSelected = bus.busId === selectedBusId;
              const distToCustomer = calculateApproxDistanceKm(bus.latitude, bus.longitude);

              return (
                <div
                  key={bus.busId}
                  onClick={() => setSelectedBusId(bus.busId)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition ${
                    isSelected
                      ? 'bg-slate-950 border-emerald-500 ring-1 ring-emerald-500/50 shadow-md'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <Bus className="w-4 h-4 text-emerald-400" />
                      <span className="font-mono font-bold text-white text-xs">
                        {bus.routeNumber}
                      </span>
                    </div>
                    <span className="text-[10px] bg-emerald-950 text-emerald-300 font-mono px-2 py-0.5 rounded border border-emerald-800 font-semibold">
                      {distToCustomer} km away
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 font-medium">
                    At: <strong className="text-white">{bus.currentLocationName}</strong>
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono mt-2 pt-2 border-t border-slate-800/80">
                    <span className="text-emerald-400 font-semibold">
                      ETA: {bus.etaNextStopMinutes} mins
                    </span>
                    <span>Speed: {bus.speedKmH} km/h</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Bus Telemetry & Live Radial Compass (7 cols) */}
        {selectedBus && (
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-extrabold text-white">
                    {selectedBus.operatorName} · {selectedBus.routeNumber}
                  </h3>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-mono font-bold">
                    Active
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Bus Reg: {selectedBus.busId}
                </p>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Distance from You</span>
                <span className="text-xl font-black font-mono text-emerald-400">
                  {calculateApproxDistanceKm(selectedBus.latitude, selectedBus.longitude)} km
                </span>
              </div>
            </div>

            {/* Radar / Instrument Telemetry Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                <Gauge className="w-4 h-4 mx-auto text-emerald-400 mb-1" />
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Live Speed</span>
                <span className="font-mono font-bold text-white text-sm">{selectedBus.speedKmH} km/h</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                <Compass className="w-4 h-4 mx-auto text-cyan-400 mb-1" />
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Heading</span>
                <span className="font-mono font-bold text-white text-sm">{selectedBus.heading}° North-East</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                <Satellite className="w-4 h-4 mx-auto text-amber-400 mb-1" />
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Satellites</span>
                <span className="font-mono font-bold text-white text-sm">{selectedBus.satelliteLock} Locked</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                <Wifi className="w-4 h-4 mx-auto text-emerald-400 mb-1" />
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Telemetry</span>
                <span className="font-mono font-bold text-emerald-400 text-sm">Real-Time</span>
              </div>
            </div>

            {/* Next Stop & ETA progress */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Approaching Next Stop:</span>
                </span>
                <span className="font-bold text-white text-sm">{selectedBus.nextStopName}</span>
              </div>

              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.max(10, Math.min(95, 100 - (selectedBus.distanceToNextStopMeters / 30)))}%`,
                  }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>Distance: {selectedBus.distanceToNextStopMeters}m</span>
                <span className="text-emerald-300 font-bold">Estimated in {selectedBus.etaNextStopMinutes} mins</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
