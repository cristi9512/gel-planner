import { useState } from 'react';
import type { NutritionParams, CaffeineStrategy } from '../types';

interface Props {
  params: NutritionParams;
  onChange: (params: NutritionParams) => void;
  onCalculate: () => void;
  gpxDistanceKm?: number;
  hasElevation: boolean;
  warning?: string;
}

interface FieldConfig {
  key: keyof NutritionParams;
  label: string;
  unit: string;
  min: number;
  max: number;
  step: number;
}

const FIELDS: FieldConfig[] = [
  { key: 'paceMinPerKm',    label: 'Pace',              unit: 'min/km', min: 3,  max: 12,  step: 0.1 },
  { key: 'distanceKm',      label: 'Race distance',     unit: 'km',     min: 5,  max: 200, step: 0.5 },
  { key: 'carbsPerHourG',   label: 'Target carbs/hour', unit: 'g/h',    min: 20, max: 120, step: 5   },
  { key: 'carbsPerGelG',    label: 'Carbs per gel',     unit: 'g',      min: 10, max: 60,  step: 1   },
  { key: 'firstGelMinute',  label: 'First gel at',      unit: 'min',    min: 20, max: 90,  step: 5   },
  { key: 'absorptionMinutes', label: 'Absorption time', unit: 'min',    min: 5,  max: 20,  step: 5   },
];

function CockpitInput({
  value, min, max, step, unit, locked, onChange,
}: {
  value: number; min: number; max: number; step: number;
  unit: string; locked?: boolean; onChange: (v: string) => void;
}) {
  return (
    <div className={`cockpit-input bg-surface-high rounded-sm flex items-center ${locked ? 'opacity-70' : ''}`}>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        readOnly={locked}
        onChange={(e) => !locked && onChange(e.target.value)}
        className="flex-1 bg-transparent px-3 py-2.5 text-sm font-label font-medium text-ink focus:outline-none min-w-0"
        style={{ cursor: locked ? 'not-allowed' : 'auto' }}
      />
      <span className="pr-3 text-[11px] font-label text-ink-dim shrink-0">{unit}</span>
    </div>
  );
}

export function ParametersPanel({
  params, onChange, onCalculate, gpxDistanceKm, hasElevation, warning,
}: Props) {
  const [caffeineOpen, setCaffeineOpen] = useState(params.useCaffeineGels);

  const set = <K extends keyof NutritionParams>(key: K, value: NutritionParams[K]) =>
    onChange({ ...params, [key]: value });

  return (
    <div className="bg-surface-low rounded-xl p-5 space-y-5">
      <p className="text-ink-muted text-[10px] font-label uppercase tracking-widest">Race Config</p>

      {/* Numeric fields */}
      <div className="space-y-2.5">
        {FIELDS.map(({ key, label, unit, min, max, step }) => {
          const locked = key === 'distanceKm' && gpxDistanceKm !== undefined;
          return (
            <div key={key} className="grid grid-cols-2 gap-3 items-center">
              <label className="text-xs font-label text-ink-muted leading-tight">{label}</label>
              <div className="relative">
                <CockpitInput
                  value={params[key] as number}
                  min={min} max={max} step={step} unit={unit}
                  locked={locked}
                  onChange={(v) => set(key, parseFloat(v) as NutritionParams[typeof key])}
                />
                {locked && (
                  <span className="absolute -top-1 -right-1 text-[8px] font-label bg-volt text-surface px-1 rounded font-bold leading-tight">
                    GPX
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Elevation toggle — only if GPX with elevation */}
      {hasElevation && (
        <label className="flex items-start gap-3 cursor-pointer select-none bg-surface-high rounded-sm px-3 py-2.5">
          <input
            type="checkbox"
            checked={params.adjustForElevation}
            onChange={(e) => set('adjustForElevation', e.target.checked)}
            className="mt-0.5 w-3.5 h-3.5 accent-volt shrink-0"
          />
          <div>
            <p className="text-xs font-label font-medium text-ink leading-tight">Adjust for elevation</p>
            <p className="text-[10px] font-label text-ink-dim mt-0.5">+1 min per 10 m gain (Naismith's rule)</p>
          </div>
        </label>
      )}

      {/* Caffeine section */}
      <div className="space-y-2.5 pt-3 border-t border-surface-high/60">
        <label className="flex items-start gap-3 cursor-pointer select-none bg-surface-high rounded-sm px-3 py-2.5">
          <input
            type="checkbox"
            checked={params.useCaffeineGels}
            onChange={(e) => { set('useCaffeineGels', e.target.checked); setCaffeineOpen(e.target.checked); }}
            className="mt-0.5 w-3.5 h-3.5 shrink-0"
            style={{ accentColor: '#00e3fd' }}
          />
          <div>
            <p className="text-xs font-label font-medium text-ink leading-tight">Mix caffeinated gels ☕</p>
            <p className="text-[10px] font-label text-ink-dim mt-0.5">Plan regular vs. caffeine gel distribution</p>
          </div>
        </label>

        {caffeineOpen && params.useCaffeineGels && (
          <div className="space-y-2.5 pl-1">
            {/* Caffeine per gel */}
            <div className="grid grid-cols-2 gap-3 items-center">
              <label className="text-xs font-label text-ink-muted">Caffeine per gel</label>
              <CockpitInput
                value={params.caffeinePerGelMg} min={25} max={200} step={25} unit="mg"
                onChange={(v) => set('caffeinePerGelMg', parseFloat(v))}
              />
            </div>

            {/* Strategy */}
            <div className="grid grid-cols-2 gap-3 items-center">
              <label className="text-xs font-label text-ink-muted">Strategy</label>
              <select
                value={params.caffeineStrategy}
                onChange={(e) => set('caffeineStrategy', e.target.value as CaffeineStrategy)}
                className="cockpit-input bg-surface-high px-3 py-2.5 text-xs font-label text-ink rounded-sm focus:outline-none w-full"
              >
                <option value="alternating">Every other gel</option>
                <option value="finalPush">Final push</option>
              </select>
            </div>

            {params.caffeineStrategy === 'finalPush' && (
              <div className="grid grid-cols-2 gap-3 items-center">
                <label className="text-xs font-label text-ink-muted">Caffeinated gels</label>
                <CockpitInput
                  value={params.caffeineGelCount} min={1} max={6} step={1} unit="at end"
                  onChange={(v) => set('caffeineGelCount', parseInt(v))}
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 items-center">
              <label className="text-xs font-label text-ink-muted">No caffeine in final</label>
              <CockpitInput
                value={params.caffeineBlackoutMin} min={0} max={90} step={15} unit="min"
                onChange={(v) => set('caffeineBlackoutMin', parseFloat(v))}
              />
            </div>

            <p className="text-[10px] font-label text-ink-dim pl-1">
              Peak effect ~45 min after intake. Avoid dosing too close to the finish.
            </p>
          </div>
        )}
      </div>

      {/* Warning */}
      {warning && (
        <div className="rounded-sm bg-volt/10 border-l-2 border-volt px-3 py-2 text-xs font-label text-volt">
          ⚠ {warning}
        </div>
      )}

      {/* CTA */}
      <button
        onClick={onCalculate}
        className="w-full rounded-full py-3 font-display font-black text-sm uppercase tracking-wider text-surface transition-transform active:scale-95"
        style={{ background: 'linear-gradient(180deg, #f4ffc8 0%, #cffc00 100%)' }}
      >
        Calculate Plan
      </button>
    </div>
  );
}
