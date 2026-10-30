import React, { useState } from 'react';
import {
  TransitRoute,
  TransitStop,
  PassengerUser,
  JourneyRiskBreakdown,
} from '../types/transit';
import {
  X,
  Printer,
  Download,
  CheckCircle2,
  AlertTriangle,
  QrCode,
  ShieldCheck,
  FileText,
  Copy,
  Check,
  Armchair,
  MapPin,
  Clock,
} from 'lucide-react';
import {
  generatePrintableTicketHTML,
  openPrintableTicket,
  downloadText,
} from '../utils/downloadUtils';

interface TicketDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  route: TransitRoute;
  passenger: PassengerUser;
  stopsMap: Map<string, TransitStop>;
  breakdown?: JourneyRiskBreakdown;
}

export const TicketDownloadModal: React.FC<TicketDownloadModalProps> = ({
  isOpen,
  onClose,
  route,
  passenger,
  stopsMap,
  breakdown,
}) => {
  const [copiedHash, setCopiedHash] = useState(false);
  const [selectedSeat, setSelectedSeat] = useState('04B');

  if (!isOpen) return null;

  const fromStopName = stopsMap.get(route.stops[0])?.name || route.from || 'Majestic Central Bus Station';
  const toStopName = stopsMap.get(route.stops[route.stops.length - 1])?.name || route.to || 'Destination';

  // Relevant Fare Calculation strictly matching passenger concessions
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

  const riskScore = breakdown ? breakdown.totalScore : 18;
  const passId = `TS-PASS-${route.routeNumber.replace(/\s+/g, '')}-${Date.now().toString().slice(-4)}`;

  const handlePrintOrPdf = () => {
    const html = generatePrintableTicketHTML({
      route,
      passenger,
      fromStopName,
      toStopName,
      effectiveFare,
      fareBenefitNote,
      seatNumber: selectedSeat,
      riskScore,
    });
    openPrintableTicket(html);
  };

  const handleDownloadHtml = () => {
    const html = generatePrintableTicketHTML({
      route,
      passenger,
      fromStopName,
      toStopName,
      effectiveFare,
      fareBenefitNote,
      seatNumber: selectedSeat,
      riskScore,
    });
    downloadText(html, `transit_pass_${route.routeNumber.replace(/\s+/g, '_')}.html`, 'text/html;charset=utf-8;');
  };

  const handleDownloadJson = () => {
    const passData = {
      passId,
      issuedAt: new Date().toISOString(),
      passenger: {
        name: passenger.name || 'Commuter',
        age: passenger.age,
        gender: passenger.gender,
        specialNeed: passenger.specialPerson,
      },
      route: {
        routeNumber: route.routeNumber,
        operator: route.operator,
        busType: route.busType,
        from: fromStopName,
        to: toStopName,
        departureTime: route.departureTime,
        arrivalTime: route.arrivalTime,
        nominalDurationMinutes: route.nominalTravelTimeMinutes,
        isStepFree: route.wheelchairAccessible,
        isLowFloor: route.isLowFloor,
      },
      fare: {
        baseFare: route.fare,
        effectiveFare,
        fareBenefitNote,
        isFreePass,
      },
      seatAssigned: selectedSeat,
      journeyRiskScore: riskScore,
      qrVerificationCode: `VERIF-${passId}`,
      status: 'ACTIVE_VALID_PASS',
    };
    downloadText(JSON.stringify(passData, null, 2), `digital_pass_${route.routeNumber.replace(/\s+/g, '_')}.json`, 'application/json');
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(`VERIF-${passId}`);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-xs">
      <div className="bg-slate-900 border border-emerald-700/80 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 p-4 border-b border-emerald-800/60 flex items-center justify-between text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300 font-black">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold tracking-tight">
                  Download Bus Pass &amp; Boarding Slip
                </h3>
                <span className="text-[10px] bg-emerald-500 text-slate-950 font-extrabold px-1.5 py-0.2 rounded uppercase">
                  Verified
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Official Digital E-Ticket with QR Code &amp; Concession Verification
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Ticket Preview */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {/* Card Preview Container */}
          <div className="bg-slate-950 border-2 border-emerald-600/80 rounded-2xl overflow-hidden shadow-lg">
            {/* Top Pass Strip */}
            <div className="bg-gradient-to-r from-emerald-800 to-emerald-700 text-white p-3.5 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-200 block">
                  TRANSITSHIELD GREEN PASS
                </span>
                <span className="text-base font-black font-mono tracking-tight">
                  {route.operator} · {route.routeNumber}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] bg-emerald-950 text-emerald-200 px-2 py-0.5 rounded font-mono font-bold border border-emerald-500/50">
                  {passId}
                </span>
              </div>
            </div>

            {/* Ticket Journey Body */}
            <div className="p-4 space-y-4">
              {/* Origin to Destination */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <span className="text-[10px] text-slate-400 font-mono uppercase">From</span>
                  <div className="font-bold text-white text-sm truncate max-w-[140px] sm:max-w-[180px]">
                    {fromStopName}
                  </div>
                  <div className="text-emerald-400 font-mono text-[11px] font-semibold flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{route.departureTime}</span>
                  </div>
                </div>

                <div className="flex flex-col items-center px-2">
                  <span className="text-xs text-slate-400 font-mono">{route.nominalTravelTimeMinutes}m</span>
                  <div className="w-16 h-0.5 bg-emerald-500/50 my-1 relative">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 absolute -top-[3px] right-0" />
                  </div>
                  <span className="text-[10px] text-slate-500">direct</span>
                </div>

                <div className="space-y-0.5 text-right">
                  <span className="text-[10px] text-slate-400 font-mono uppercase">To</span>
                  <div className="font-bold text-white text-sm truncate max-w-[140px] sm:max-w-[180px]">
                    {toStopName}
                  </div>
                  <div className="text-emerald-400 font-mono text-[11px] font-semibold">
                    Est. {route.arrivalTime}
                  </div>
                </div>
              </div>

              {/* Passenger & Fare Info Row */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs font-mono">
                <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase block">Passenger</span>
                  <span className="font-bold text-white truncate block">
                    {passenger.name || 'Commuter'}
                  </span>
                  <span className="text-[10px] text-emerald-400">
                    {passenger.gender}, {passenger.age}y
                  </span>
                </div>

                <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase block">Seat Assigned</span>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-300 text-sm">{selectedSeat}</span>
                    <Armchair className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <span className="text-[9px] text-slate-400 font-sans">Window / Safe</span>
                </div>

                <div className="col-span-2 sm:col-span-1 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase block">Accessibility</span>
                  <span className={`font-bold block ${route.wheelchairAccessible ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {route.wheelchairAccessible ? '✓ Step-Free Ramp' : '⚠️ Steps Required'}
                  </span>
                  <span className="text-[9px] text-slate-400 font-sans">
                    {route.isLowFloor ? 'Kneeling platform' : 'Standard chassis'}
                  </span>
                </div>
              </div>

              {/* Fare Badge */}
              <div className="p-3 rounded-xl bg-emerald-950/70 border border-emerald-700/60 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-emerald-300 uppercase font-mono block font-bold">
                    Effective Fare
                  </span>
                  <div className="text-xl font-black font-mono text-white">
                    {isFreePass ? '₹0 FREE PASS' : `₹${effectiveFare}`}
                  </div>
                  <span className="text-[10px] text-emerald-300 block">
                    {fareBenefitNote}
                  </span>
                </div>

                <div className="text-right">
                  <div className="text-[10px] font-mono text-slate-400">Risk Score</div>
                  <div className="text-lg font-black font-mono text-emerald-400">
                    {riskScore}/100
                  </div>
                  <span className="text-[10px] text-slate-400">Optimal Safety</span>
                </div>
              </div>

              {/* QR Code Barcode Representation */}
              <div className="border-t border-dashed border-slate-800 pt-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 bg-white p-1 rounded-lg shrink-0 flex items-center justify-center">
                    <QrCode className="w-14 h-14 text-slate-950" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-mono text-slate-400 block">
                      Boarding Verification Hash
                    </span>
                    <span className="font-mono text-xs font-bold text-slate-200 break-all">
                      VERIF-{passId}
                    </span>
                    <button
                      onClick={handleCopyCode}
                      className="mt-1 flex items-center gap-1 text-[10px] text-emerald-400 hover:text-emerald-300 cursor-pointer"
                    >
                      {copiedHash ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedHash ? 'Code Copied' : 'Copy Validator Code'}</span>
                    </button>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded font-mono border border-emerald-800 block">
                    Active E-Ticket
                  </span>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Valid for Today
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Seat Selector */}
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-300 font-medium">Select Seat for Pass:</span>
            <div className="flex items-center gap-1.5 font-mono">
              {['W-01', '01A', '01B', '04B', '04C'].map(seat => (
                <button
                  key={seat}
                  onClick={() => setSelectedSeat(seat)}
                  className={`px-2 py-1 rounded text-xs font-bold transition cursor-pointer ${
                    selectedSeat === seat
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {seat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Download Action Bar */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrintOrPdf}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save as PDF</span>
            </button>

            <button
              onClick={handleDownloadHtml}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-emerald-300 border border-slate-700 text-xs font-semibold transition cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>Download HTML</span>
            </button>

            <button
              onClick={handleDownloadJson}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-semibold transition cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>JSON Pass</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
