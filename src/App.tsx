import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  CommuterProfileId,
  TransitStop,
  TransitRoute,
  CommunityReport,
  BusyTimeBucket,
  BacktestSummary,
  BacktestTripResult,
  PassengerUser,
  CustomerLocation,
} from './types/transit';
import {
  COMMUTER_PROFILES,
  INITIAL_STOPS,
  INITIAL_ROUTES,
  BUSY_TIMES_DATA,
  INITIAL_REPORTS,
  INITIAL_BACKTEST_SUMMARY,
  INITIAL_BACKTEST_TRIPS,
  DEFAULT_PASSENGER_USER,
  DEFAULT_CUSTOMER_LOCATION,
} from './data/transitData';
import { findNearestStop } from './utils/geoUtils';
import { rankRoutes } from './services/riskEngine';
import { SupportedLanguage, TransitVoiceSynthesizer, LOCALIZED_VOICE_GUIDANCE } from './services/speechService';
import { TRANSLATIONS } from './services/i18n';
import { Header } from './components/Header';
import { PassengerLoginScreen } from './components/PassengerLoginScreen';
import { RedBusHeroSearch } from './components/RedBusHeroSearch';
import { RiskMatrixBanner } from './components/RiskMatrixBanner';
import { RouteList } from './components/RouteList';
import { SchematicMap } from './components/SchematicMap';
import { BusyTimesChart } from './components/BusyTimesChart';
import { SeatLayoutModal } from './components/SeatLayoutModal';
import { LiveGpsTrackerTool } from './components/LiveGpsTrackerTool';
import { CommunityReportModal } from './components/CommunityReportModal';
import { BacktestEvaluationModal } from './components/BacktestEvaluationModal';
import { AIAssistantDrawer } from './components/AIAssistantDrawer';
import { StopDetailsModal } from './components/StopDetailsModal';
import {
  Bus,
  AlertTriangle,
  ArrowLeft,
  Navigation,
  MapPin,
  LocateFixed,
  CheckCircle2,
  X,
  Search,
} from 'lucide-react';

export default function App() {
  // Passenger User Profile (Opens with Login Screen initially!)
  const [passenger, setPassenger] = useState<PassengerUser>(() => {
    try {
      const saved = localStorage.getItem('transitshield_user');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // ignore
    }
    return DEFAULT_PASSENGER_USER;
  });

  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  // Commuter Customer Specific Live Location
  const [customerLocation, setCustomerLocation] = useState<CustomerLocation>(DEFAULT_CUSTOMER_LOCATION);
  const [isLocating, setIsLocating] = useState(false);
  const [liveLocationToast, setLiveLocationToast] = useState<string | null>(null);

  // Localization Language (Working across EN, HI, KN)
  const [language, setLanguage] = useState<SupportedLanguage>('en');
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  // Accessibility toggles
  const [highContrast, setHighContrast] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  // Active navigation tab and Navigation History Stack for Universal Back Press
  const [activeNavTab, setActiveNavTab] = useState<string>('buses');
  const [navHistory, setNavHistory] = useState<string[]>([]);

  // Search Buses State
  const [fromStopId, setFromStopId] = useState<string>('stop-majestic');
  const [toStopId, setToStopId] = useState<string>('stop-ecospace');
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [isSearchActive, setIsSearchActive] = useState<boolean>(true);

  // Reference to results section for smooth scrolling
  const busResultsRef = useRef<HTMLDivElement>(null);

  // Network State
  const [stops, setStops] = useState<TransitStop[]>(INITIAL_STOPS);
  const [routes, setRoutes] = useState<TransitRoute[]>(INITIAL_ROUTES);
  const [busyTimes, setBusyTimes] = useState<BusyTimeBucket[]>(BUSY_TIMES_DATA);
  const [reports, setReports] = useState<CommunityReport[]>(INITIAL_REPORTS);
  const [backtestSummary, setBacktestSummary] = useState<BacktestSummary>(INITIAL_BACKTEST_SUMMARY);
  const [backtestTrips, setBacktestTrips] = useState<BacktestTripResult[]>(INITIAL_BACKTEST_TRIPS);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>('route-335e');

  // Modals State
  const [selectedRouteForSeat, setSelectedRouteForSeat] = useState<TransitRoute | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isBacktestModalOpen, setIsBacktestModalOpen] = useState(false);
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
  const [inspectedStop, setInspectedStop] = useState<TransitStop | null>(null);

  // Physical QR Code scan verification banner state
  const [physicalQrBanner, setPhysicalQrBanner] = useState<{
    stopName: string;
    stopCode: string;
    locality: string;
    stepFree: boolean;
  } | null>(null);

  // Active Profile mapped from passenger special needs
  const currentProfileId = passenger.commuterProfileId || 'default';
  const activeProfile = COMMUTER_PROFILES[currentProfileId] || COMMUTER_PROFILES.default;

  // Stops Map for quick lookups
  const stopsMap = useMemo(() => {
    const map = new Map<string, TransitStop>();
    stops.forEach(s => map.set(s.id, s));
    return map;
  }, [stops]);

  // Compute real-time Journey Risk Scores with Stop-to-Stop & Keyword Search Filtering!
  const rankedRoutes = useMemo(() => {
    let list = rankRoutes(routes, stopsMap, activeProfile, reports);

    // 1. Keyword search (if user typed bus number or keyword)
    if (searchKeyword.trim()) {
      const q = searchKeyword.trim().toLowerCase();
      list = list.filter(r => {
        const routeNum = r.route.routeNumber.toLowerCase();
        const routeName = r.route.name.toLowerCase();
        const operator = r.route.operator.toLowerCase();
        const busType = r.route.busType.toLowerCase();
        const summary = r.route.summary.toLowerCase();
        const servesStop = r.route.stops.some(id => {
          const s = stopsMap.get(id);
          return (
            s?.name.toLowerCase().includes(q) ||
            s?.code.toLowerCase().includes(q) ||
            s?.locality.toLowerCase().includes(q)
          );
        });

        return (
          routeNum.includes(q) ||
          routeName.includes(q) ||
          operator.includes(q) ||
          busType.includes(q) ||
          summary.includes(q) ||
          servesStop
        );
      });
    }

    // 2. Stop-to-Stop Search (Origin & Destination)
    if (isSearchActive && fromStopId && toStopId && fromStopId !== toStopId) {
      const fromStop = stopsMap.get(fromStopId);
      const toStop = stopsMap.get(toStopId);

      // Direct route match: both stops in route and fromStop before toStop
      const directMatches = list.filter(r => {
        const fromIdx = r.route.stops.indexOf(fromStopId);
        const toIdx = r.route.stops.indexOf(toStopId);
        return fromIdx !== -1 && toIdx !== -1 && fromIdx < toIdx;
      });

      if (directMatches.length > 0) {
        list = directMatches;
      } else {
        // Locality corridor match: route connects departure locality and destination locality
        const fromLocality = fromStop?.locality?.toLowerCase();
        const toLocality = toStop?.locality?.toLowerCase();

        const corridorMatches = list.filter(r => {
          const stopsInRoute = r.route.stops.map(id => stopsMap.get(id));
          const hasFromLoc = stopsInRoute.some(s => s?.locality?.toLowerCase() === fromLocality);
          const hasToLoc = stopsInRoute.some(s => s?.locality?.toLowerCase() === toLocality);
          return hasFromLoc && hasToLoc;
        });

        if (corridorMatches.length > 0) {
          list = corridorMatches;
        } else {
          // Route serves either origin or destination stop
          const partialMatches = list.filter(r =>
            r.route.stops.includes(fromStopId) || r.route.stops.includes(toStopId)
          );
          if (partialMatches.length > 0) {
            list = partialMatches;
          }
        }
      }
    }

    // Filter chips
    if (activeFilter === 'lowest_risk') {
      list = list.filter(r => r.breakdown.totalScore < 30);
    } else if (activeFilter === 'step_free') {
      list = list.filter(r => r.route.wheelchairAccessible && r.route.isLowFloor);
    } else if (activeFilter === 'seats_available') {
      list = list.filter(r => r.route.availableSeats >= 15);
    }

    return list;
  }, [routes, stopsMap, activeProfile, reports, searchKeyword, fromStopId, toStopId, isSearchActive, activeFilter]);

  // Execute bus search and scroll down smoothly to results
  const handleExecuteBusSearch = () => {
    setIsSearchActive(true);
    navigateToTab('buses');

    // Smooth scroll to bus results
    setTimeout(() => {
      if (busResultsRef.current) {
        busResultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  // Universal Navigation Tab changer with history tracking
  const navigateToTab = (newTab: string) => {
    if (newTab !== activeNavTab) {
      setNavHistory(prev => [...prev, activeNavTab]);
      setActiveNavTab(newTab);
    }
  };

  // Universal Back Press Handler (Returns to page before used)
  const handleUniversalBackPress = () => {
    if (selectedRouteForSeat) {
      setSelectedRouteForSeat(null);
      return;
    }
    if (isReportModalOpen) {
      setIsReportModalOpen(false);
      return;
    }
    if (isBacktestModalOpen) {
      setIsBacktestModalOpen(false);
      return;
    }
    if (isAIAssistantOpen) {
      setIsAIAssistantOpen(false);
      return;
    }
    if (inspectedStop) {
      setInspectedStop(null);
      return;
    }
    if (isEditProfileOpen) {
      setIsEditProfileOpen(false);
      return;
    }

    // Return to the previous tab in history
    if (navHistory.length > 0) {
      const prevTab = navHistory[navHistory.length - 1];
      setNavHistory(prev => prev.slice(0, -1));
      setActiveNavTab(prevTab);
    } else if (activeNavTab !== 'buses') {
      setActiveNavTab('buses');
    }
  };

  // Real-time user live location detection:
  // Detects browser GPS coordinates, computes distance to all stops, and auto-selects closest stop
  const handleDetectBrowserLocation = () => {
    if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setIsLocating(false);
          const userLat = pos.coords.latitude;
          const userLng = pos.coords.longitude;
          const accuracy = Math.round(pos.coords.accuracy || 5);

          // Find the nearest stop in the network
          const { nearestStop, formattedDistance } = findNearestStop(userLat, userLng, stops);

          // Update customer location
          setCustomerLocation({
            stopId: nearestStop.id,
            locationName: nearestStop.name,
            landmark: `Closest Stop: ${formattedDistance} from your live GPS (${nearestStop.locality})`,
            latitude: userLat,
            longitude: userLng,
            accuracyMeters: accuracy,
            isLiveGps: true,
          });

          // Automatically set the departure stop to this nearest stop!
          setFromStopId(nearestStop.id);
          setIsSearchActive(true);

          // Show confirmation toast
          const toastMsg = `📍 Live GPS detected: Closest bus stop set to ${nearestStop.name} (${formattedDistance} away)`;
          setLiveLocationToast(toastMsg);
          setTimeout(() => setLiveLocationToast(null), 6000);
        },
        (err) => {
          setIsLocating(false);
          console.warn('Geolocation error or permission prompt skipped:', err);
          // Fallback to primary transit stop
          const defaultStop = stops.find(s => s.id === 'stop-majestic') || stops[0];
          if (defaultStop) {
            setCustomerLocation({
              stopId: defaultStop.id,
              locationName: defaultStop.name,
              landmark: 'Central Transit Interchange Hub (Auto-Assigned)',
              latitude: 12.9778,
              longitude: 77.5726,
              accuracyMeters: 10,
              isLiveGps: false,
            });
          }
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    }
  };

  // On initial mount: automatically detect the live location of the user!
  useEffect(() => {
    handleDetectBrowserLocation();
  }, []);

  // High contrast sync
  useEffect(() => {
    if (highContrast) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
  }, [highContrast]);

  // Save passenger to localStorage
  const handleSavePassenger = (user: PassengerUser) => {
    setPassenger(user);
    try {
      localStorage.setItem('transitshield_user', JSON.stringify(user));
    } catch (e) {
      // ignore
    }
    setIsEditProfileOpen(false);

    if (voiceEnabled) {
      const strings = LOCALIZED_VOICE_GUIDANCE[language] || LOCALIZED_VOICE_GUIDANCE.en;
      const welcome = `${strings.greeting} ${user.name}`;
      TransitVoiceSynthesizer.speak(welcome, language);
    }
  };

  // Fetch initial network state
  useEffect(() => {
    const fetchState = async () => {
      try {
        const response = await fetch('/api/network');
        if (response.ok) {
          const data = await response.json();
          if (data.stops) setStops(data.stops);
          if (data.routes) setRoutes(data.routes);
          if (data.reports) setReports(data.reports);
          if (data.busyTimes) setBusyTimes(data.busyTimes);
          if (data.backtestSummary) setBacktestSummary(data.backtestSummary);
        }
      } catch (err) {
        console.warn('Network state fetch fallback to local seed data:', err);
      }
    };
    fetchState();
  }, []);

  // Physical Bus Stop QR Scan Handler
  const triggerPhysicalQrCheckin = (stopIdOrCode: string) => {
    const matched = stops.find(
      s => s.id === stopIdOrCode || s.code.toLowerCase() === stopIdOrCode.toLowerCase()
    );
    if (matched) {
      setFromStopId(matched.id);
      setCustomerLocation({
        stopId: matched.id,
        locationName: matched.name,
        landmark: `${matched.locality} · Physical Bus Stop QR Verified`,
        latitude: matched.latitude || 12.9778,
        longitude: matched.longitude || 77.5726,
        accuracyMeters: 2,
        isLiveGps: true,
      });
      setPhysicalQrBanner({
        stopName: matched.name,
        stopCode: matched.code,
        locality: matched.locality,
        stepFree: matched.accessibility.status === 'step_free',
      });

      try {
        const newUrl = `${window.location.pathname}?stop=${matched.id}`;
        window.history.replaceState({ path: newUrl }, '', newUrl);
      } catch (e) {
        // ignore
      }
    }
  };

  // On mount: check if app was opened via physical QR code scanned at bus stop
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const stopParam = params.get('stop') || params.get('qr') || params.get('stop_code');
    if (stopParam && stops.length > 0) {
      triggerPhysicalQrCheckin(stopParam);
    }
  }, [stops]);

  // Handle Report Feedback
  const handleReportSubmitted = (result: any) => {
    if (result.stops) setStops(result.stops);
    if (result.routes) setRoutes(result.routes);
    if (result.report) setReports(prev => [result.report, ...prev]);
  };

  // Handle upvoting
  const handleUpvoteReport = async (reportId: string) => {
    try {
      const res = await fetch(`/api/reports/${reportId}/upvote`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setReports(prev =>
          prev.map(r => (r.id === reportId ? { ...r, upvotes: data.upvotes } : r))
        );
      }
    } catch (err) {
      console.error('Failed to upvote report', err);
    }
  };

  // FIRST TURN CONDITION: If passenger is not registered, show the login onboarding screen!
  if (!passenger.isRegistered) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
        <header className="border-b border-emerald-800/80 bg-emerald-950 py-4 px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white text-emerald-800 flex items-center justify-center font-bold shadow-md">
              <Bus className="w-6 h-6 stroke-[2.4]" />
            </div>
            <div>
              <h1 className="text-lg font-black font-mono text-white tracking-tight">
                {t.appTitle}
              </h1>
              <p className="text-xs text-emerald-200/80">
                {t.tagline}
              </p>
            </div>
          </div>

          {/* Language Switcher on Login Page */}
          <div className="flex items-center bg-emerald-900 rounded-lg p-0.5 border border-emerald-700 text-xs">
            {(['en', 'hi', 'kn'] as SupportedLanguage[]).map(lang => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`px-2.5 py-1 rounded font-bold transition ${
                  language === lang
                    ? 'bg-white text-emerald-900 shadow-sm'
                    : 'text-emerald-200 hover:text-white'
                }`}
              >
                {lang === 'en' ? 'EN' : lang === 'hi' ? 'हिन्दी' : 'ಕನ್ನಡ'}
              </button>
            ))}
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center p-4">
          <PassengerLoginScreen
            initialUser={passenger}
            language={language}
            onLoginComplete={handleSavePassenger}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* RedBus-Green Header Bar with Real-Time Live Location & Clean Passenger Tools */}
      <Header
        currentProfile={currentProfileId}
        onSelectProfile={(pId) => {
          setPassenger(prev => ({ ...prev, commuterProfileId: pId }));
        }}
        passenger={passenger}
        onEditPassenger={() => setIsEditProfileOpen(true)}
        customerLocation={customerLocation}
        onDetectLocation={handleDetectBrowserLocation}
        language={language}
        onSelectLanguage={setLanguage}
        highContrast={highContrast}
        onToggleHighContrast={() => setHighContrast(!highContrast)}
        voiceEnabled={voiceEnabled}
        onToggleVoice={() => setVoiceEnabled(!voiceEnabled)}
        activeNavTab={activeNavTab}
        onSelectNavTab={navigateToTab}
        onOpenBacktest={() => setIsBacktestModalOpen(true)}
        onOpenAIAssistant={() => setIsAIAssistantOpen(true)}
        onOpenGpsTracker={() => navigateToTab('gps_tracker')}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5">
        {/* Live GPS Fix Notification Toast */}
        {liveLocationToast && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-900/90 border border-emerald-400 text-emerald-100 flex items-center justify-between text-xs shadow-lg animate-fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
              <span className="font-semibold">{liveLocationToast}</span>
            </div>
            <button
              onClick={() => setLiveLocationToast(null)}
              className="p-1 rounded-md hover:bg-emerald-800 text-emerald-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Universal Back Button Toolbar on sub-pages */}
        {activeNavTab !== 'buses' && (
          <div className="mb-4 flex items-center justify-between bg-slate-900 border border-slate-800 p-2.5 rounded-xl">
            <button
              onClick={handleUniversalBackPress}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-white font-bold text-xs border border-slate-700 shadow-sm transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-emerald-400" />
              <span>Back to Previous Screen</span>
            </button>

            <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span className="truncate max-w-xs">{customerLocation.locationName}</span>
            </div>
          </div>
        )}

        {/* Physical Bus Stop QR Scan Verified Banner */}
        {physicalQrBanner && (
          <div className="mb-4 p-3.5 rounded-xl bg-emerald-950/90 border border-emerald-400 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-emerald-100 shadow-lg">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-emerald-500 text-slate-950 font-black shrink-0">
                📱 QR
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-white text-sm">Opened via Bus Stop Signboard QR Code</span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/40 font-mono font-bold">
                    Platform Check-In Verified
                  </span>
                </div>
                <p className="text-xs text-emerald-200 mt-0.5">
                  Signboard at <strong className="text-white">{physicalQrBanner.stopName} ({physicalQrBanner.stopCode})</strong> in {physicalQrBanner.locality} · {physicalQrBanner.stepFree ? '✓ Step-Free Ramp & Kneeling Bay Available' : '⚠️ Note: Curb step present'}
                </p>
              </div>
            </div>

            <button
              onClick={() => setPhysicalQrBanner(null)}
              className="self-end sm:self-auto px-3 py-1.5 rounded-lg bg-emerald-900 hover:bg-emerald-800 text-emerald-200 border border-emerald-700 text-xs font-semibold cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Physical QR Scan Simulation Bar for Evaluators */}
        <div className="mb-4 bg-slate-900/90 border border-emerald-800/60 rounded-xl px-3.5 py-2.5 flex flex-col md:flex-row items-center justify-between gap-2.5 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <span className="text-[10px] bg-emerald-500 text-slate-950 font-extrabold px-2 py-0.5 rounded uppercase tracking-wider">
              Evaluator Test
            </span>
            <span className="font-medium text-slate-200">
              Simulate Smartphone Scanning QR Code at Bus Stop:
            </span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] w-full md:w-auto">
            <button
              onClick={() => triggerPhysicalQrCheckin('stop-majestic')}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-emerald-800 text-slate-200 hover:text-white border border-slate-700 whitespace-nowrap transition font-semibold"
            >
              MAJ-01 Majestic
            </button>
            <button
              onClick={() => triggerPhysicalQrCheckin('stop-ecospace')}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-emerald-800 text-slate-200 hover:text-white border border-slate-700 whitespace-nowrap transition font-semibold"
            >
              ECO-19 EcoSpace
            </button>
            <button
              onClick={() => triggerPhysicalQrCheckin('stop-indiranagar')}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-emerald-800 text-slate-200 hover:text-white border border-slate-700 whitespace-nowrap transition font-semibold"
            >
              IND-12 Indiranagar
            </button>
            <button
              onClick={() => triggerPhysicalQrCheckin('stop-whitefield')}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-emerald-800 text-slate-200 hover:text-white border border-slate-700 whitespace-nowrap transition font-semibold"
            >
              WHT-07 Whitefield
            </button>
          </div>
        </div>

        {/* TAB 1: Find Buses (RedBus style bus listings) */}
        {activeNavTab === 'buses' && (
          <>
            {/* RedBus Hero Search Card with Live GPS sync & Bus Keyword Search */}
            <RedBusHeroSearch
              stops={stops}
              passenger={passenger}
              customerLocation={customerLocation}
              language={language}
              fromStopId={fromStopId}
              toStopId={toStopId}
              onFromStopChange={(id) => {
                setFromStopId(id);
                setIsSearchActive(true);
              }}
              onToStopChange={(id) => {
                setToStopId(id);
                setIsSearchActive(true);
              }}
              onSearch={handleExecuteBusSearch}
              onEditPassenger={() => setIsEditProfileOpen(true)}
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
              onDetectLocation={handleDetectBrowserLocation}
              searchKeyword={searchKeyword}
              onSearchKeywordChange={setSearchKeyword}
              isLocating={isLocating}
            />

            {/* Live Search Results Status & Results Anchor */}
            <div
              id="bus-results-section"
              ref={busResultsRef}
              className="mb-4 p-3.5 rounded-xl bg-slate-900 border border-emerald-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <Search className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">
                      {rankedRoutes.length} Buses Available
                    </span>
                    <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-800 font-mono font-bold">
                      {fromStopId === customerLocation.stopId ? 'Departing From Your Live Location' : 'Filtered'}
                    </span>
                  </div>
                  <span className="text-slate-300 block text-xs mt-0.5">
                    Route: <strong className="text-emerald-400">{stopsMap.get(fromStopId)?.name || 'Origin'}</strong> ➔ <strong className="text-teal-400">{stopsMap.get(toStopId)?.name || 'Destination'}</strong>
                    {searchKeyword && (
                      <span className="ml-1 text-slate-400">· Keyword &quot;{searchKeyword}&quot;</span>
                    )}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {(isSearchActive || searchKeyword) && (
                  <button
                    onClick={() => {
                      setIsSearchActive(false);
                      setSearchKeyword('');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-medium text-xs border border-slate-700 transition"
                  >
                    Clear Filter ({routes.length} Total Routes)
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left 7 cols: Ranked Bus Cards */}
              <div className="lg:col-span-7 space-y-6">
                <RiskMatrixBanner profile={activeProfile} />

                {rankedRoutes.length === 0 ? (
                  <div className="p-8 text-center bg-slate-900/90 border border-slate-800 rounded-2xl space-y-3">
                    <div className="w-12 h-12 mx-auto rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                      <AlertTriangle className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-white text-sm">No Direct Buses for This Specific Stop Combination</h3>
                    <p className="text-xs text-slate-400 max-w-md mx-auto">
                      No single direct route links &quot;{stopsMap.get(fromStopId)?.name}&quot; and &quot;{stopsMap.get(toStopId)?.name}&quot;. Try selecting corridor stops or clearing filters to view all network routes.
                    </p>
                    <button
                      onClick={() => {
                        setIsSearchActive(false);
                        setSearchKeyword('');
                      }}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                    >
                      Show All Available Bus Routes ({routes.length})
                    </button>
                  </div>
                ) : (
                  <RouteList
                    rankedRoutes={rankedRoutes}
                    profile={activeProfile}
                    passenger={passenger}
                    stopsMap={stopsMap}
                    language={language}
                    selectedRouteId={selectedRouteId}
                    onSelectRoute={setSelectedRouteId}
                    onOpenSeatLayout={(r) => setSelectedRouteForSeat(r)}
                    onTrackBusLocation={(r) => {
                      setSelectedRouteId(r.id);
                      navigateToTab('gps_tracker');
                    }}
                  />
                )}
              </div>

              {/* Right 5 cols: Live Schematic Map & Busy Times */}
              <div className="lg:col-span-5 space-y-6">
                <SchematicMap
                  stops={stops}
                  routes={routes}
                  selectedRouteId={selectedRouteId}
                  onSelectStop={(stop) => setInspectedStop(stop)}
                />

                <BusyTimesChart busyTimes={busyTimes} />

                {/* GPS Tracker Callout Card */}
                <div className="bg-slate-900 border border-emerald-800/80 rounded-2xl p-4 flex items-center justify-between text-xs shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-cyan-600/20 text-cyan-400 border border-cyan-500/30">
                      <Navigation className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white">Live Bus Fleet Radar</h4>
                      <p className="text-slate-400 text-[11px]">Track real-time bus locations &amp; distance to your stop</p>
                    </div>
                  </div>

                  <button
                    onClick={() => navigateToTab('gps_tracker')}
                    className="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs cursor-pointer"
                  >
                    Open Radar
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* TAB 2: Dedicated Live Bus Fleet GPS & Commuter Location Tracker Tool */}
        {activeNavTab === 'gps_tracker' && (
          <LiveGpsTrackerTool
            customerLocation={customerLocation}
            onUpdateCustomerLocation={setCustomerLocation}
            stops={stops}
            language={language}
            onBack={handleUniversalBackPress}
          />
        )}

        {/* TAB 3: Live Schematic Transit Map */}
        {activeNavTab === 'live_map' && (
          <div className="space-y-6">
            <SchematicMap
              stops={stops}
              routes={routes}
              selectedRouteId={selectedRouteId}
              onSelectStop={(stop) => setInspectedStop(stop)}
            />
          </div>
        )}

        {/* TAB 4: Busy Times Forecast */}
        {activeNavTab === 'busy_times' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <BusyTimesChart busyTimes={busyTimes} />
          </div>
        )}

        {/* TAB 5: Community Alerts */}
        {activeNavTab === 'reports' && (
          <div className="max-w-3xl mx-auto space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <span>Live Community Reports &amp; Road Obstacles</span>
              </h3>
              <button
                onClick={() => setIsReportModalOpen(true)}
                className="px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs"
              >
                File New Report
              </button>
            </div>

            <div className="space-y-3">
              {reports.map(rep => (
                <div
                  key={rep.id}
                  className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-start justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{rep.stopName}</span>
                      {rep.routeNumber && (
                        <span className="font-mono text-emerald-400">({rep.routeNumber})</span>
                      )}
                    </div>
                    <p className="text-slate-300">{rep.notes}</p>
                  </div>
                  <button
                    onClick={() => handleUpvoteReport(rep.id)}
                    className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 text-xs flex items-center gap-1 shrink-0"
                  >
                    <span>👍</span>
                    <span>{rep.upvotes}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* RedBus-Green Footer (Customer Only, No Admin Links) */}
      <footer className="border-t border-emerald-950 bg-slate-950 py-4 text-xs text-slate-400 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white font-mono">TRANSITSHIELD GREEN</span>
            <span>· RedBus-Style Smart &amp; Accessible Public Transit System</span>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium">
            <button
              onClick={() => navigateToTab('gps_tracker')}
              className="text-cyan-400 hover:text-cyan-300 transition flex items-center gap-1 cursor-pointer"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Live Bus Fleet Radar</span>
            </button>
            <span className="text-slate-800">·</span>
            <button
              onClick={() => navigateToTab('live_map')}
              className="text-emerald-400 hover:text-emerald-300 transition cursor-pointer"
            >
              Network Map
            </button>
            <span className="text-slate-800">·</span>
            <button
              onClick={() => setIsBacktestModalOpen(true)}
              className="text-slate-300 hover:text-white transition cursor-pointer"
            >
              Slide 7 Back-Testing
            </button>
          </div>
        </div>
      </footer>

      {/* Edit Profile Modal */}
      {isEditProfileOpen && (
        <PassengerLoginScreen
          initialUser={passenger}
          language={language}
          isModal={true}
          onCancel={() => setIsEditProfileOpen(false)}
          onLoginComplete={handleSavePassenger}
        />
      )}

      {/* RedBus Live Seat Availability Modal (Read-only, no booking) */}
      {selectedRouteForSeat && (
        <SeatLayoutModal
          isOpen={Boolean(selectedRouteForSeat)}
          onClose={() => setSelectedRouteForSeat(null)}
          route={selectedRouteForSeat}
          passenger={passenger}
          language={language}
        />
      )}

      {/* Community Report Modal */}
      <CommunityReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        stops={stops}
        routes={routes}
        reports={reports}
        initialStop={inspectedStop}
        onReportSubmitted={handleReportSubmitted}
        onUpvoteReport={handleUpvoteReport}
      />

      {/* Backtest Evaluation Modal */}
      <BacktestEvaluationModal
        isOpen={isBacktestModalOpen}
        onClose={() => setIsBacktestModalOpen(false)}
        summary={backtestSummary}
        trips={backtestTrips}
      />

      {/* Stop Details Inspector */}
      <StopDetailsModal
        stop={inspectedStop}
        onClose={() => setInspectedStop(null)}
        onSelectDeparture={(s) => setFromStopId(s.id)}
        onSelectDestination={(s) => setToStopId(s.id)}
        onSetLocation={(s) => {
          setCustomerLocation({
            stopId: s.id,
            locationName: s.name,
            landmark: `${s.locality} · Selected by commuter`,
            latitude: s.latitude || 12.9778,
            longitude: s.longitude || 77.5726,
            accuracyMeters: 5,
            isLiveGps: true,
          });
        }}
        onReportIssue={(s) => {
          setInspectedStop(s);
          setIsReportModalOpen(true);
        }}
        reports={reports}
      />

      {/* Gemini AI Advisor */}
      <AIAssistantDrawer
        isOpen={isAIAssistantOpen}
        onClose={() => setIsAIAssistantOpen(false)}
        profile={activeProfile}
        language={language}
        routes={routes}
        onSelectRoute={(id) => setSelectedRouteId(id)}
      />
    </div>
  );
}
