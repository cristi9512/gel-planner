import type { Plan } from '../types';

interface Props {
  plan: Plan;
}

export function ResultsSummary({ plan }: Props) {
  const elevAdj = plan.elevation && plan.params.adjustForElevation;
  const timeDiff = Math.round(plan.effectiveTotalMinutes - plan.totalMinutes);

  const metrics = [
    {
      label: 'Total gels',
      value: String(plan.gels.length),
      unit: plan.gels.length === 1 ? 'gel' : 'gels',
      accent: 'text-volt',
    },
    {
      label: 'Gel interval',
      value: String(Math.round(plan.gelIntervalMinutes)),
      unit: 'min',
      accent: 'text-ink',
    },
    {
      label: 'Effective carbs/h',
      value: String(Math.round(plan.avgCarbsPerHour)),
      unit: 'g/h',
      accent: 'text-plasma',
    },
    {
      label: 'Total carbs',
      value: String(plan.totalCarbs),
      unit: 'g',
      accent: 'text-ink',
    },
  ];

  return (
    <div className="space-y-3">
      {/* Metrics grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {metrics.map((m) => (
          <div key={m.label} className="bg-surface-low rounded-xl px-5 py-4">
            <p className="text-[10px] font-label text-ink-muted uppercase tracking-widest mb-2">{m.label}</p>
            <p className={`font-display font-black text-3xl leading-none ${m.accent}`}>
              {m.value}
              <span className="text-base font-label font-normal text-ink-dim ml-1">{m.unit}</span>
            </p>
          </div>
        ))}
      </div>

      {/* Elevation strip */}
      {plan.elevation && (
        <div className={`rounded-sm px-4 py-3 flex flex-wrap gap-x-6 gap-y-1 text-xs font-label
          ${elevAdj ? 'bg-volt/8 border-l-2 border-volt' : 'bg-surface-high'}`}
        >
          <span className="text-ink-muted">
            🏔 Gain: <span className={elevAdj ? 'text-volt font-semibold' : 'text-ink'}>{Math.round(plan.elevation.gainM)} m</span>
          </span>
          <span className="text-ink-muted">
            ↘ Loss: <span className="text-ink">{Math.round(plan.elevation.lossM)} m</span>
          </span>
          {elevAdj && timeDiff > 0 && (
            <span className="text-ink-muted">
              ⏱ Added: <span className="text-volt font-semibold">+{timeDiff} min</span>
            </span>
          )}
          {!elevAdj && (
            <span className="text-ink-dim italic">Elevation adjustment off</span>
          )}
        </div>
      )}

      {/* Caffeine strip */}
      {plan.params.useCaffeineGels && plan.totalCaffeineMg > 0 && (
        <div className="rounded-sm bg-plasma/8 border-l-2 border-plasma px-4 py-3 flex flex-wrap gap-x-6 gap-y-1 text-xs font-label">
          <span className="text-ink-muted">
            ☕ Caffeinated: <span className="text-plasma font-semibold">{plan.gels.filter((g) => g.isCaffeinated).length} gels</span>
          </span>
          <span className="text-ink-muted">
            Total caffeine: <span className="text-plasma font-semibold">{plan.totalCaffeineMg} mg</span>
          </span>
          <span className="text-ink-muted">
            Strategy: <span className="text-ink">{plan.params.caffeineStrategy === 'alternating' ? 'Alternating' : 'Final push'}</span>
          </span>
        </div>
      )}
    </div>
  );
}
