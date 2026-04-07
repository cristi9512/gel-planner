interface Props {
  distanceKm: number;
  paceMinPerKm: number;
  gpxDistanceKm?: number;
  effectiveTotalMinutes?: number;
  onDistanceChange: (v: number) => void;
  onPaceChange: (v: number) => void;
}

function Field({
  label, value, min, max, step, unit, locked, badge, onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  locked?: boolean;
  badge?: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex flex-col gap-1 min-w-0">
      <span className="text-[10px] font-label uppercase tracking-widest text-ink-muted">{label}</span>
      <div className="relative">
        <div className={`cockpit-input bg-surface-high rounded-sm flex items-center ${locked ? 'opacity-60' : ''}`}>
          <input
            type="number"
            value={value}
            min={min}
            max={max}
            step={step}
            readOnly={locked}
            onChange={(e) => !locked && onChange(parseFloat(e.target.value))}
            className="flex-1 bg-transparent px-3 py-2 text-sm font-label font-semibold text-ink focus:outline-none min-w-0"
            style={{ cursor: locked ? 'not-allowed' : 'auto' }}
          />
          <span className="pr-3 text-[11px] font-label text-ink-dim shrink-0">{unit}</span>
        </div>
        {badge && (
          <span className="absolute -top-1 -right-1 text-[8px] font-label bg-volt text-surface px-1 rounded font-bold leading-tight">
            {badge}
          </span>
        )}
      </div>
    </div>
  );
}

export function RaceHeader({ distanceKm, paceMinPerKm, gpxDistanceKm, effectiveTotalMinutes, onDistanceChange, onPaceChange }: Props) {
  const estimatedMin = effectiveTotalMinutes ?? paceMinPerKm * distanceKm;

  return (
    <div className="px-6 md:px-10 py-4 border-b border-surface-high/40 bg-surface-low/60">
      <div className="flex flex-wrap items-end gap-4 md:gap-6">
        <p className="text-[10px] font-label uppercase tracking-widest text-ink-muted self-center shrink-0 hidden md:block">
          Race
        </p>

        <Field
          label="Distance"
          value={distanceKm}
          min={1} max={200} step={0.5}
          unit="km"
          locked={gpxDistanceKm !== undefined}
          badge={gpxDistanceKm !== undefined ? 'GPX' : undefined}
          onChange={onDistanceChange}
        />

        <Field
          label="Pace"
          value={paceMinPerKm}
          min={3} max={12} step={0.1}
          unit="min/km"
          onChange={onPaceChange}
        />

        {/* Live finish time */}
        <div className="flex flex-col gap-1 ml-auto text-right">
          <span className="text-[10px] font-label uppercase tracking-widest text-ink-muted">Estimated finish</span>
          <p className="font-display font-black text-2xl text-ink leading-none">
            {Math.floor(estimatedMin / 60)}h{' '}
            <span className="text-volt">
              {String(Math.round(estimatedMin % 60)).padStart(2, '0')}
            </span>
            <span className="text-ink-muted text-base">min</span>
          </p>
        </div>
      </div>
    </div>
  );
}
