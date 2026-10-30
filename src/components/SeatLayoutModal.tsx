import React, { useState } from 'react';
import { TransitRoute, PassengerUser } from '../types/transit';
import { TRANSLATIONS } from '../services/i18n';
import { SupportedLanguage } from '../services/speechService';
import {
  X,
  Accessibility,
  Armchair,
  Users,
  Info,
} from 'lucide-react';

interface SeatLayoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  route: TransitRoute;
  passenger: PassengerUser;
  language: SupportedLanguage;
}

export const SeatLayoutModal: React.FC<SeatLayoutModalProps> = ({
  isOpen,
  onClose,
  route,
  passenger,
  language,
}) => {
  const [inspectedSeat, setInspectedSeat] = useState<string | null>(null);

  if (!isOpen) return null;

  // Base fare calculation with special person / gender concession
  const baseFare = route.fare || 28;
  let finalFare = baseFare;
  let benefitLabel = 'Standard Commuter Fare';
  let isFree = false;

  if (passenger.gender === 'Female') {
    finalFare = 0;
    isFree = true;
    benefitLabel = 'FREE Travel · Karnataka Shakti Scheme for Women';
  } else if (passenger.specialPerson === 'wheelchair') {
    finalFare = 0;
    isFree = true;
    benefitLabel = 'FREE Accessible Transit Pass';
  } else if (passenger.specialPerson === 'elderly' || passenger.age >= 60) {
    finalFare = Math.round(baseFare * 0.5);
    benefitLabel = '50% Senior Citizen Concession';
  }

  // Seat matrix configuration (Wheelchair bays, Senior priority, Regular window/aisle)
  const seats = [
    { id: 'W-01', label: 'W-01', isWheelchairBay: true, isBooked: false, desc: 'Wheelchair Bay 1 with tie-down clamp (FREE)' },
    { id: 'W-02', label: 'W-02', isWheelchairBay: true, isBooked: true, desc: 'Wheelchair Bay 2 (Occupied)' },
    { id: 'S-01', label: '01A', isSenior: true, isBooked: false, desc: 'Senior Citizen Priority Seat (Window - FREE)' },
    { id: 'S-02', label: '01B', isSenior: true, isBooked: false, desc: 'Senior Citizen Priority Seat (Aisle - FREE)' },
    { id: 'S-03', label: '01C', isSenior: true, isBooked: true, desc: 'Senior Priority Seat (Occupied)' },
    { id: 'S-04', label: '01D', isSenior: true, isBooked: false, desc: 'Senior Priority Seat (Window - FREE)' },
    { id: '02A', label: '02A', isBooked: false, desc: 'General Window Seat (FREE)' },
    { id: '02B', label: '02B', isBooked: false, desc: 'General Aisle Seat (FREE)' },
    { id: '02C', label: '02C', isBooked: true, desc: 'General Aisle Seat (Occupied)' },
    { id: '02D', label: '02D', isBooked: false, desc: 'General Window Seat (FREE)' },
    { id: '03A', label: '03A', isBooked: false, desc: 'General Window Seat (FREE)' },
    { id: '03B', label: '03B', isBooked: true, desc: 'General Aisle Seat (Occupied)' },
    { id: '03C', label: '03C', isBooked: false, desc: 'General Aisle Seat (FREE)' },
    { id: '03D', label: '03D', isBooked: false, desc: 'General Window Seat (FREE)' },
    { id: '04A', label: '04A', isBooked: false, desc: 'General Window Seat (FREE)' },
    { id: '04B', label: '04B', isBooked: false, desc: 'General Aisle Seat (FREE)' },
    { id: '04C', label: '04C', isBooked: false, desc: 'General Aisle Seat (FREE)' },
    { id: '04D', label: '04D', isBooked: true, desc: 'General Window Seat (Occupied)' },
  ];

  const freeSeatsCount = seats.filter(s => !s.isBooked).length;
  const occupiedSeatsCount = seats.filter(s => s.isBooked).length;
  const selectedSeatObj = seats.find(s => s.id === inspectedSeat);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xs">
      <div className="bg-slate-900 border border-emerald-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-900 to-slate-900 p-4 border-b border-emerald-800/60 flex items-center justify-between text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300">
              <Armchair className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight">
                Live Bus Seat Availability Monitor
              </h3>
              <p className="text-xs text-slate-300">
                {route.routeNumber} · {route.operator}
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

        {/* Live Occupancy Metric Bar */}
        <div className="p-3.5 bg-slate-950 border-b border-slate-800 grid grid-cols-3 gap-2 text-center text-xs">
          <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800">
            <span className="text-slate-400 block text-[10px] uppercase">Available Free</span>
            <span className="text-base font-black text-emerald-400 font-mono">{freeSeatsCount} Seats</span>
          </div>
          <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800">
            <span className="text-slate-400 block text-[10px] uppercase">Occupied</span>
            <span className="text-base font-black text-slate-400 font-mono">{occupiedSeatsCount} Seats</span>
          </div>
          <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800">
            <span className="text-slate-400 block text-[10px] uppercase">Wheelchair Bay</span>
            <span className="text-base font-black text-cyan-400 font-mono">1 Free / 2</span>
          </div>
        </div>

        {/* Seat Legend */}
        <div className="px-4 py-2.5 bg-slate-950/60 border-b border-slate-800 flex items-center justify-around text-xs flex-wrap gap-2">
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded bg-emerald-500/20 border border-emerald-500" />
            <span className="text-slate-300 text-[11px]">Free Seat</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded bg-slate-800 border border-slate-700 opacity-60" />
            <span className="text-slate-500 text-[11px]">Occupied</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded bg-amber-500/20 border border-amber-500" />
            <span className="text-amber-300 text-[11px]">Senior Priority</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded bg-cyan-500/20 border border-cyan-500" />
            <span className="text-cyan-300 text-[11px]">Wheelchair Bay</span>
          </div>
        </div>

        {/* Bus Layout Schematic */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 max-h-[48vh]">
          {/* Driver Cockpit Indicator */}
          <div className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-center text-xs font-mono text-slate-400 flex items-center justify-between px-6">
            <span>🚪 FRONT ENTRY RAMP (STEP-FREE)</span>
            <span className="text-emerald-400 font-bold">🚍 DRIVER CABIN</span>
          </div>

          {/* Wheelchair Priority Bays */}
          <div className="bg-cyan-950/20 border border-cyan-800/60 rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-cyan-300 flex items-center gap-1.5">
                <Accessibility className="w-4 h-4 text-cyan-400" />
                <span>Reserved Wheelchair Securing Bays</span>
              </span>
              <span className="text-[11px] font-mono text-cyan-400">Low-Floor Platform</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {seats.filter(s => s.isWheelchairBay).map(seat => (
                <button
                  key={seat.id}
                  onClick={() => setInspectedSeat(seat.id)}
                  className={`p-3 rounded-xl border flex items-center justify-between transition ${
                    seat.isBooked
                      ? 'bg-slate-950/80 border-slate-800 opacity-60 text-slate-500'
                      : 'bg-cyan-950/40 border-cyan-500 text-white shadow-sm hover:bg-cyan-900/40'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Accessibility className="w-4 h-4 text-cyan-400" />
                    <span className="font-mono font-bold text-xs">{seat.label}</span>
                  </div>
                  <span className={`text-[11px] font-bold ${seat.isBooked ? 'text-slate-500' : 'text-emerald-400'}`}>
                    {seat.isBooked ? 'Occupied' : 'AVAILABLE'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Passenger Seats Grid */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between text-xs pb-1 border-b border-slate-800 text-slate-400 font-mono">
              <span>Left Window / Aisle</span>
              <span>Central Walkway</span>
              <span>Right Aisle / Window</span>
            </div>

            <div className="grid grid-cols-4 gap-2 pt-1">
              {seats.filter(s => !s.isWheelchairBay).map(seat => (
                <button
                  key={seat.id}
                  onClick={() => setInspectedSeat(seat.id)}
                  className={`h-10 rounded-xl font-mono text-xs flex flex-col items-center justify-center border transition ${
                    seat.isBooked
                      ? 'bg-slate-900 text-slate-600 border-slate-800 opacity-60'
                      : seat.isSenior
                      ? 'bg-amber-950/40 text-amber-200 border-amber-600/80 hover:bg-amber-900/40 font-bold'
                      : 'bg-emerald-950/30 text-emerald-200 border-emerald-700/70 hover:bg-emerald-900/40 font-bold'
                  }`}
                >
                  <span>{seat.label}</span>
                  <span className="text-[9px] opacity-80">{seat.isBooked ? 'Taken' : 'Free'}</span>
                </button>
              ))}
            </div>
          </div>

          {inspectedSeat && selectedSeatObj && (
            <div className="p-3 rounded-xl bg-slate-950 border border-emerald-700/60 text-xs text-slate-300 flex items-center justify-between">
              <div>
                <span className="font-bold text-white font-mono">{selectedSeatObj.label}: </span>
                <span>{selectedSeatObj.desc}</span>
              </div>
              <span className={`font-mono text-xs font-bold ${selectedSeatObj.isBooked ? 'text-rose-400' : 'text-emerald-400'}`}>
                {selectedSeatObj.isBooked ? 'Occupied' : 'Free to Board'}
              </span>
            </div>
          )}
        </div>

        {/* Relevant Fare & Boarding Guidance Summary (No Ticket Booking!) */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="text-[11px] text-slate-400">
              Relevant Fare for <strong>{passenger.name || 'Commuter'}</strong>:
            </div>
            <div className="text-lg font-black font-mono text-emerald-400 flex items-baseline gap-2">
              <span>{isFree ? '₹0 FREE' : `₹${finalFare}`}</span>
              <span className="text-xs text-slate-300 font-normal">
                ({benefitLabel})
              </span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-emerald-400" />
              <span>No online booking needed. Pay on-board to conductor or tap bus QR.</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="py-2.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider shadow-md transition self-end sm:self-auto"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
