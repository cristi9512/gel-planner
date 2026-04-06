import type { GelPoint } from '../types';
import { formatTime } from '../utils/calculations';

interface Props {
  gels: GelPoint[];
  totalMinutes: number;
}

export function FeedingTimeline({ gels, totalMinutes }: Props) {
  if (gels.length === 0) return null;

  return (
    <div className="bg-surface-low rounded-xl px-6 py-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-ink-muted text-[10px] font-label uppercase tracking-widest">Feeding Schedule</p>
        <span className="text-[10px] font-label text-ink-dim">{gels.length} gel{gels.length !== 1 ? 's' : ''} · {formatTime(totalMinutes)} total</span>
      </div>

      {/* Timeline track */}
      <div className="relative h-16">
        {/* Track line */}
        <div className="absolute left-0 right-0 top-1/2 h-px bg-surface-highest -translate-y-px" />

        {/* Start marker */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-ink-muted" />
          <span className="text-[8px] font-label text-ink-dim uppercase tracking-wide mt-1">Start</span>
        </div>

        {/* Gel markers */}
        {gels.map((gel, i) => {
          const pct = (gel.timeMin / totalMinutes) * 100;
          const color = gel.isCaffeinated ? '#00e3fd' : '#cffc00';
          const isAbove = i % 2 === 0;

          return (
            <div
              key={gel.index}
              className="absolute top-1/2 -translate-x-1/2"
              style={{ left: `${pct}%` }}
            >
              {/* Dot */}
              <div
                className="w-3 h-3 rounded-full -translate-y-1/2 border-2 border-surface"
                style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}66` }}
              />
              {/* Label — alternate above / below */}
              <div
                className={`absolute -translate-x-1/2 left-1/2 flex flex-col items-center ${isAbove ? '-top-9' : 'top-4'}`}
              >
                <span
                  className="text-[9px] font-label font-semibold leading-none"
                  style={{ color }}
                >
                  G{gel.index}
                </span>
                <span className="text-[8px] font-label text-ink-dim leading-none mt-0.5 whitespace-nowrap">
                  {formatTime(gel.timeMin)}
                </span>
              </div>
            </div>
          );
        })}

        {/* Finish marker */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-ink-muted" />
          <span className="text-[8px] font-label text-ink-dim uppercase tracking-wide mt-1">Finish</span>
        </div>
      </div>

      {/* Distance strip below timeline */}
      <div className="flex justify-between mt-3 text-[9px] font-label text-ink-dim border-t border-surface-high pt-2">
        <span>0 km</span>
        {gels.map((gel) => (
          <span key={gel.index} className="text-ink-muted">
            km {gel.distanceKm.toFixed(1)}
          </span>
        ))}
        <span>finish</span>
      </div>
    </div>
  );
}
