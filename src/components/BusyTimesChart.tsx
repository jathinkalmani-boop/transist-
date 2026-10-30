import React, { useState } from 'react';
import { BusyTimeBucket } from '../types/transit';
import { Users, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';

interface BusyTimesChartProps {
  busyTimes: BusyTimeBucket[];
}

export const BusyTimesChart: React.FC<BusyTimesChartProps> = ({ busyTimes }) => {
  const [selectedBucketIndex, setSelectedBucketIndex] = useState<number>(1); // Default to 8-10 morning peak
  const activeBucket = busyTimes[selectedBucketIndex] || busyTimes[0];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 sm:p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-amber-400" />
            <span>Busy Times Forecast: Passenger Seats Taken (%)</span>
          </h3>
          <p className="text-xs text-slate-400">
            Morning &amp; evening rush hours help commuters choose quieter departures.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">Selected Window:</span>
          <span className="font-mono font-bold text-cyan-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
            {activeBucket.hourRange}
          </span>
        </div>
      </div>

      {/* Bar Chart Container */}
      <div className="pt-5 pb-2">
        <div className="grid grid-cols-7 gap-2 sm:gap-3 items-end h-36">
          {busyTimes.map((item, idx) => {
            const isSelected = selectedBucketIndex === idx;
            const isPeak = item.seatsTakenPercent >= 90;

            let barColor = 'bg-cyan-500/80 hover:bg-cyan-400';
            if (isPeak) {
              barColor = 'bg-rose-500 hover:bg-rose-400';
            } else if (item.seatsTakenPercent <= 50) {
              barColor = 'bg-emerald-500/80 hover:bg-emerald-400';
            }

            return (
              <button
                key={item.hourRange}
                onClick={() => setSelectedBucketIndex(idx)}
                className="group flex flex-col items-center h-full justify-end focus:outline-hidden"
              >
                {/* Value tooltip label */}
                <div
                  className={`text-[11px] font-mono font-bold transition mb-1.5 ${
                    isSelected
                      ? 'text-white'
                      : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                >
                  {item.seatsTakenPercent}%
                </div>

                {/* Vertical Bar */}
                <div className="w-full bg-slate-950/80 rounded-t-md p-0.5 h-full flex items-end border border-slate-800/80">
                  <div
                    className={`w-full rounded-t transition-all duration-300 ${barColor} ${
                      isSelected ? 'ring-2 ring-cyan-400' : ''
                    }`}
                    style={{ height: `${item.seatsTakenPercent}%` }}
                  />
                </div>

                {/* Hour Label */}
                <span
                  className={`text-[10px] font-mono mt-2 transition text-center truncate w-full ${
                    isSelected ? 'text-cyan-300 font-bold' : 'text-slate-400'
                  }`}
                >
                  {item.hourRange.split(' - ')[0]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Time Insights Box */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          {activeBucket.seatsTakenPercent >= 90 ? (
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          )}
          <span className="text-slate-300">
            {activeBucket.seatsTakenPercent >= 90 ? (
              <span className="text-rose-300 font-medium">
                Extreme Peak ({activeBucket.seatsTakenPercent}% capacity). Boarding delays and standing-only expected.
              </span>
            ) : activeBucket.seatsTakenPercent <= 50 ? (
              <span className="text-emerald-300 font-medium">
                Low Crowding ({activeBucket.seatsTakenPercent}% capacity). High probability of finding open seating.
              </span>
            ) : (
              <span className="text-amber-300 font-medium">
                Moderate Crowding ({activeBucket.seatsTakenPercent}% capacity). Prompt boarding advised.
              </span>
            )}
          </span>
        </div>

        <div className="text-slate-400 flex items-center gap-1.5 shrink-0">
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <span>Tap any hour bucket to simulate departure</span>
        </div>
      </div>
    </div>
  );
};
