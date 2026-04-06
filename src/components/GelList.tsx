import type { Plan } from '../types';
import { formatTime } from '../utils/calculations';

interface Props {
  plan: Plan;
}

export function GelList({ plan }: Props) {
  if (plan.gels.length === 0) {
    return (
      <div className="bg-surface-low rounded-xl p-8 text-center">
        <p className="text-sm font-body text-ink-muted">
          No gels scheduled. Check your parameters — the race may be too short for the first gel timing.
        </p>
      </div>
    );
  }

  const showCaffeine = plan.params.useCaffeineGels;

  return (
    <div className="bg-surface-low rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-label uppercase tracking-widest text-ink-muted">
            Detailed Plan
          </p>
          <p className="text-sm font-body font-semibold text-ink mt-0.5">
            {plan.gels.length} {plan.gels.length === 1 ? 'gel' : 'gels'} ·{' '}
            <span className="text-volt">{plan.totalCarbs} g</span> carbs total
            {showCaffeine && plan.totalCaffeineMg > 0 && (
              <span className="text-plasma ml-2">· {plan.totalCaffeineMg} mg caffeine</span>
            )}
          </p>
        </div>
        {showCaffeine && (
          <div className="flex items-center gap-3 text-[10px] font-label text-ink-muted shrink-0">
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-volt" /> Regular
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-plasma" /> Caffeinated
            </span>
          </div>
        )}
      </div>

      {/* List — 4px gap, alternating backgrounds, NO dividers */}
      <div className="space-y-1 px-2 pb-3">
        {plan.gels.map((gel, i) => {
          const isEven = i % 2 === 0;
          const accentColor = gel.isCaffeinated ? '#00e3fd' : '#cffc00';

          return (
            <div
              key={gel.index}
              className={`flex items-center gap-4 px-4 py-3 rounded-sm ${isEven ? 'bg-surface-high' : 'bg-surface-highest'}`}
            >
              {/* Index badge */}
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-label font-black text-surface shrink-0"
                style={{ backgroundColor: accentColor, boxShadow: `0 0 8px ${accentColor}40` }}
              >
                {gel.isCaffeinated ? '☕' : gel.index}
              </div>

              {/* Data */}
              <div className="flex-1 grid grid-cols-3 gap-2 min-w-0 text-xs font-label">
                <div>
                  <span className="font-display font-bold text-sm text-ink">{formatTime(gel.timeMin)}</span>
                </div>
                <div className="text-ink-muted">
                  km <span className="font-semibold text-ink">{gel.distanceKm.toFixed(1)}</span>
                </div>
                <div className="text-ink-muted">
                  <span className="font-semibold text-ink">{gel.carbsG} g</span>
                  {gel.isCaffeinated && (
                    <span className="text-plasma ml-1">·{plan.params.caffeinePerGelMg} mg</span>
                  )}
                </div>
              </div>

              {/* Cumulative caffeine — desktop only */}
              {showCaffeine && gel.cumulativeCaffeineMg > 0 && (
                <div className="text-[10px] font-label text-plasma hidden md:block shrink-0">
                  Σ {gel.cumulativeCaffeineMg} mg
                </div>
              )}

              {/* Coordinates — large desktop only */}
              {gel.lat !== undefined && (
                <div className="text-[10px] font-label text-ink-dim font-mono hidden lg:block shrink-0">
                  {gel.lat.toFixed(4)}, {gel.lon!.toFixed(4)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
