import React from 'react';
import { TransitStop, CommunityReport } from '../types/transit';
import {
  X,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Accessibility,
  ArrowUpRight,
  LocateFixed,
} from 'lucide-react';

interface StopDetailsModalProps {
  stop: TransitStop | null;
  onClose: () => void;
  onSelectDeparture?: (stop: TransitStop) => void;
  onSelectDestination?: (stop: TransitStop) => void;
  onSetLocation?: (stop: TransitStop) => void;
  onReportIssue: (stop: TransitStop) => void;
  reports: CommunityReport[];
}

export const StopDetailsModal: React.FC<StopDetailsModalProps> = ({
  stop,
  onClose,
  onSelectDeparture,
  onSelectDestination,
  onSetLocation,
  onReportIssue,
  reports,
}) => {
  if (!stop) return null;

  const stopReports = reports.filter(r => r.stopId === stop.id);
  const acc = stop.accessibility;

  const getStatusColor = (status: TransitStop['accessibility']['status']) => {
    switch (status) {
      case 'step_free':
        return {
          bg: 'bg-emerald-950/80 border-emerald-700/80 text-emerald-300',
          dot: 'bg-emerald-400',
          title: 'Step-Free Verified (Green)',
        };
      case 'barrier':
        return {
          bg: 'bg-amber-950/80 border-amber-700/80 text-amber-300',
          dot: 'bg-amber-400',
          title: 'Barrier Present (Amber)',
        };
      case 'blocked_path':
        return {
          bg: 'bg-rose-950/80 border-rose-700/80 text-rose-300',
          dot: 'bg-rose-400',
          title: 'Path Blocked (Red)',
        };
      default:
        return {
          bg: 'bg-slate-900 border-slate-800 text-slate-300',
          dot: 'bg-slate-400',
          title: 'Status Pending',
        };
    }
  };

  const statusTheme = getStatusColor(acc.status);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">
                  {stop.name}
                </h3>
                <span className="text-xs font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                  {stop.code}
                </span>
              </div>
              <p className="text-xs text-slate-400">{stop.locality} locality</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1 text-xs">
          {/* Status pill card */}
          <div className={`p-3.5 rounded-xl border flex items-start gap-3 ${statusTheme.bg}`}>
            <span className={`w-3 h-3 rounded-full mt-0.5 shrink-0 ${statusTheme.dot}`} />
            <div className="space-y-1">
              <div className="font-bold text-sm">{statusTheme.title}</div>
              <p className="leading-relaxed">{acc.details}</p>
            </div>
          </div>

          {/* Accessibility Checklist */}
          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 space-y-2.5">
            <div className="font-semibold text-slate-200 flex items-center gap-1.5">
              <Accessibility className="w-4 h-4 text-emerald-400" />
              <span>Platform Accessibility Specs</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="flex items-center gap-2 p-2 bg-slate-900 rounded border border-slate-800">
                {acc.hasElevator ? (
                  acc.elevatorOperational ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-amber-400 shrink-0" />
                  )
                ) : (
                  <XCircle className="w-4 h-4 text-slate-500 shrink-0" />
                )}
                <span>
                  {acc.hasElevator
                    ? acc.elevatorOperational
                      ? 'Elevator: In Service'
                      : 'Elevator: Out of Service'
                    : 'No Elevator'}
                </span>
              </div>

              <div className="flex items-center gap-2 p-2 bg-slate-900 rounded border border-slate-800">
                {acc.hasRamps ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                )}
                <span>{acc.hasRamps ? 'Wheelchair Ramps: Yes' : 'No Access Ramps'}</span>
              </div>

              <div className="flex items-center gap-2 p-2 bg-slate-900 rounded border border-slate-800">
                {acc.lowFloorCurbs ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-slate-500 shrink-0" />
                )}
                <span>{acc.lowFloorCurbs ? 'Low-Floor Level Curbs' : 'Standard High Curbs'}</span>
              </div>

              <div className="flex items-center gap-2 p-2 bg-slate-900 rounded border border-slate-800">
                {acc.tactilePaving ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-slate-500 shrink-0" />
                )}
                <span>{acc.tactilePaving ? 'Tactile Paving Installed' : 'No Tactile Guiding'}</span>
              </div>
            </div>
          </div>

          {/* Active Reports at this stop */}
          <div className="space-y-2">
            <span className="font-semibold text-slate-200 block">
              Recent Commuter Feedback for {stop.code} ({stopReports.length})
            </span>
            {stopReports.length === 0 ? (
              <p className="text-slate-400 text-[11px] italic">
                No active obstacle reports filed at this stop in the last 60 minutes.
              </p>
            ) : (
              <div className="space-y-2 max-h-36 overflow-y-auto">
                {stopReports.map(r => (
                  <div key={r.id} className="p-2.5 rounded bg-slate-950 border border-slate-800 text-[11px]">
                    <div className="flex items-center justify-between text-slate-400 mb-1">
                      <span className="font-semibold text-amber-300">{r.notes}</span>
                      <span className="font-mono text-cyan-400">verified</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex flex-col sm:flex-row items-center gap-2">
          {onSelectDeparture && (
            <button
              onClick={() => {
                onSelectDeparture(stop);
                onClose();
              }}
              className="w-full sm:flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Set as Pickup</span>
            </button>
          )}

          {onSelectDestination && (
            <button
              onClick={() => {
                onSelectDestination(stop);
                onClose();
              }}
              className="w-full sm:flex-1 py-2 px-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Set as Dropoff</span>
            </button>
          )}

          {onSetLocation && (
            <button
              onClick={() => {
                onSetLocation(stop);
                onClose();
              }}
              className="w-full sm:flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition"
            >
              <LocateFixed className="w-3.5 h-3.5" />
              <span>Set My Location</span>
            </button>
          )}

          <button
            onClick={() => {
              onClose();
              onReportIssue(stop);
            }}
            className="w-full sm:flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Report Issue</span>
          </button>
        </div>
      </div>
    </div>
  );
};
