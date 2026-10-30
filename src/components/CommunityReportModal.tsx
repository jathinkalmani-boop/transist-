import React, { useState } from 'react';
import { TransitStop, TransitRoute, CommunityReport } from '../types/transit';
import {
  AlertTriangle,
  Clock,
  Users,
  ShieldAlert,
  ThumbsUp,
  X,
  Send,
  CheckCircle2,
  AlertOctagon,
} from 'lucide-react';

interface CommunityReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  stops: TransitStop[];
  routes: TransitRoute[];
  reports: CommunityReport[];
  initialStop?: TransitStop | null;
  onReportSubmitted: (res: any) => void;
  onUpvoteReport: (id: string) => void;
}

export const CommunityReportModal: React.FC<CommunityReportModalProps> = ({
  isOpen,
  onClose,
  stops,
  routes,
  reports,
  initialStop,
  onReportSubmitted,
  onUpvoteReport,
}) => {
  const [stopId, setStopId] = useState<string>(initialStop ? initialStop.id : (stops[0]?.id || ''));
  const [routeId, setRouteId] = useState<string>('');
  const [category, setCategory] = useState<CommunityReport['category']>('blocked_path');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tab, setTab] = useState<'create' | 'feed'>('create');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stopId || !category) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stopId,
          routeId: routeId || undefined,
          category,
          notes,
        }),
      });

      const data = await response.json();
      if (data.success) {
        onReportSubmitted(data);
        setNotes('');
        setTab('feed');
      }
    } catch (err) {
      console.error('Failed to submit report:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCategoryBadge = (cat: CommunityReport['category']) => {
    switch (cat) {
      case 'blocked_path':
        return { label: 'Blocked Pathway', color: 'text-rose-400 bg-rose-950/80 border-rose-800' };
      case 'broken_ramp_elevator':
        return { label: 'Broken Lift/Ramp', color: 'text-amber-400 bg-amber-950/80 border-amber-800' };
      case 'overcrowding':
        return { label: 'Severe Crowding', color: 'text-amber-400 bg-amber-950/80 border-amber-800' };
      case 'delay':
        return { label: 'Bus Delay Variance', color: 'text-cyan-400 bg-cyan-950/80 border-cyan-800' };
      case 'qr_tap':
        return { label: 'QR Verified', color: 'text-emerald-400 bg-emerald-950/80 border-emerald-800' };
      default:
        return { label: 'Disruption', color: 'text-slate-400 bg-slate-800 border-slate-700' };
    }
  };

  const formatRemainingMinutes = (expiresAt: number) => {
    const mins = Math.max(1, Math.round((expiresAt - Date.now()) / 60000));
    return `${mins}m left`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Community Transit Reporting
              </h3>
              <p className="text-xs text-slate-400">
                Shared crowd intelligence · Dynamically adjusts Journey Risk Scores
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

        {/* Tab switch: New Report vs Active Live Feed */}
        <div className="flex items-center border-b border-slate-800 px-4 bg-slate-950/60">
          <button
            onClick={() => setTab('create')}
            className={`py-2.5 px-4 text-xs font-semibold border-b-2 transition ${
              tab === 'create'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            File New Hazard / Delay
          </button>
          <button
            onClick={() => setTab('feed')}
            className={`py-2.5 px-4 text-xs font-semibold border-b-2 transition flex items-center gap-2 ${
              tab === 'feed'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Live Reports Feed</span>
            <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-1.5 py-0.2 rounded-full">
              {reports.length}
            </span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1">
          {tab === 'create' ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Category Picker */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-200">
                  Select Incident Type:
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { id: 'blocked_path', label: 'Blocked Pathway / Steps', icon: <AlertOctagon className="w-4 h-4 text-rose-400" /> },
                    { id: 'broken_ramp_elevator', label: 'Broken Lift or Ramp', icon: <ShieldAlert className="w-4 h-4 text-amber-400" /> },
                    { id: 'overcrowding', label: 'Severe Bus Overcrowding', icon: <Users className="w-4 h-4 text-amber-400" /> },
                    { id: 'delay', label: 'Unannounced Bus Delay', icon: <Clock className="w-4 h-4 text-cyan-400" /> },
                  ].map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id as any)}
                      className={`p-2.5 rounded-lg border text-left flex items-start gap-2 transition ${
                        category === cat.id
                          ? 'bg-amber-500/20 text-white border-amber-500 shadow-xs'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                      }`}
                    >
                      <div className="mt-0.5">{cat.icon}</div>
                      <span className="font-medium text-xs leading-tight">{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Stop Selector */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">
                  Affected Stop / Station:
                </label>
                <select
                  value={stopId}
                  onChange={(e) => setStopId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:ring-1 focus:ring-amber-400"
                >
                  {stops.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.code} · {s.name} ({s.locality})
                    </option>
                  ))}
                </select>
              </div>

              {/* Route Selector (Optional) */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">
                  Affected Bus / Line (Optional):
                </label>
                <select
                  value={routeId}
                  onChange={(e) => setRouteId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:ring-1 focus:ring-amber-400"
                >
                  <option value="">General Stop Hazard (No specific line)</option>
                  {routes.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.routeNumber}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">
                  Incident Details &amp; Guidance:
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Ramp barricaded with metal sheets; wheelchair users should use Bay 4 detour instead."
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-white placeholder-slate-500 focus:ring-1 focus:ring-amber-400"
                  required
                />
              </div>

              <div className="text-[11px] text-slate-400 bg-slate-950/70 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between">
                <span>Data validity policy:</span>
                <span className="font-mono text-amber-400 font-medium">Auto-expires in 60 mins</span>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? 'Posting Report...' : 'Publish Community Report'}</span>
              </button>
            </form>
          ) : (
            <div className="space-y-3">
              {reports.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  No active reports right now. All corridors operating normally.
                </div>
              ) : (
                reports.map(rep => {
                  const badge = getCategoryBadge(rep.category);
                  return (
                    <div
                      key={rep.id}
                      className="bg-slate-950/90 border border-slate-800 p-3 rounded-xl space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${badge.color}`}>
                            {badge.label}
                          </span>
                          <span className="font-bold text-white">{rep.stopName}</span>
                          {rep.routeNumber && (
                            <span className="text-slate-400 font-mono text-[11px]">({rep.routeNumber})</span>
                          )}
                        </div>
                        <span className="text-[11px] font-mono text-cyan-400">
                          {formatRemainingMinutes(rep.expiresAt)}
                        </span>
                      </div>

                      <p className="text-slate-300 leading-relaxed">{rep.notes}</p>

                      <div className="flex items-center justify-between pt-1 border-t border-slate-900 text-[11px] text-slate-400">
                        <span>Reported by commuter</span>
                        <button
                          onClick={() => onUpvoteReport(rep.id)}
                          className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 transition"
                        >
                          <ThumbsUp className="w-3 h-3 text-cyan-400" />
                          <span>Verify ({rep.upvotes})</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
