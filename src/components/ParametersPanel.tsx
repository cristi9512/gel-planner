import { useState } from 'react';
import type { NutritionParams, CaffeineStrategy } from '../types';
import { GelPicker } from './GelPicker';
import { getGelById } from '../data/gels';

interface Props {
  params: NutritionParams;
  onChange: (params: NutritionParams) => void;
  onCalculate: () => void;
  hasElevation: boolean;
  warning?: string;
}

function CockpitInput({
  value, min, max, step, unit, locked, onChange,
}: {
  value: number; min: number; max: number; step: number;
  unit: string; locked?: boolean; onChange: (v: string) => void;
}) {
  return (
    <div className={`cockpit-input bg-surface-high rounded-sm flex items-center ${locked ? 'opacity-60' : ''}`}>
      <input
        type="number"
        value={value}
        min={min} max={max} step={step}
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
  params, onChange, onCalculate, hasElevation, warning,
}: Props) {
  const [caffeineOpen, setCaffeineOpen] = useState(params.useCaffeineGels);

  const set = <K extends keyof NutritionParams>(key: K, value: NutritionParams[K]) =>
    onChange({ ...params, [key]: value });

  const handleGelSelect = (gelId: string | null) => {
    const gel = gelId ? getGelById(gelId) : null;
    onChange({
      ...params,
      selectedGelId: gelId,
      carbsPerGelG: gel ? gel.carbsG : params.carbsPerGelG,
    });
  };

  const handleGelCustomChange = (carbsG: number) => {
    onChange({ ...params, selectedGelId: null, carbsPerGelG: carbsG });
  };

  const handleCafGelSelect = (gelId: string | null) => {
    const gel = gelId ? getGelById(gelId) : null;
    onChange({
      ...params,
      selectedCafGelId: gelId,
      caffeinePerGelMg: gel ? gel.caffeineMg : params.caffeinePerGelMg,
    });
  };

  const handleCafCustomChange = (_carbsG: number, caffeineMg?: number) => {
    onChange({
      ...params,
      selectedCafGelId: null,
      caffeinePerGelMg: caffeineMg ?? params.caffeinePerGelMg,
    });
  };

  const selectedGel = params.selectedGelId ? getGelById(params.selectedGelId) : null;

  return (
    <div className="bg-surface-low rounded-xl p-5 space-y-5">
      <p className="text-ink-muted text-[10px] font-label uppercase tracking-widest">Gel Config</p>

      <div className="space-y-2.5">
        <div className="grid grid-cols-2 gap-3 items-center">
          <label className="text-xs font-label text-ink-muted">Target carbs/hour</label>
          <CockpitInput value={params.carbsPerHourG} min={20} max={120} step={5} unit="g/h"
            onChange={(v) => set('carbsPerHourG', parseFloat(v))} />
        </div>

        <div className="grid grid-cols-2 gap-3 items-center">
          <label className="text-xs font-label text-ink-muted">First gel at</label>
          <CockpitInput value={params.firstGelMinute} min={20} max={90} step={5} unit="min"
            onChange={(v) => set('firstGelMinute', parseFloat(v))} />
        </div>

        <div className="grid grid-cols-2 gap-3 items-center">
          <label className="text-xs font-label text-ink-muted">Absorption time</label>
          <CockpitInput value={params.absorptionMinutes} min={5} max={20} step={5} unit="min"
            onChange={(v) => set('absorptionMinutes', parseFloat(v))} />
        </div>
      </div>

      {/* ── Gel Selection ── */}
      <div className="space-y-2.5 pt-3 border-t border-surface-high/60">
        <p className="text-ink-muted text-[10px] font-label uppercase tracking-widest">Your Gel</p>

        <GelPicker
          label="Regular gel"
          selectedGelId={params.selectedGelId}
          customCarbsG={params.carbsPerGelG}
          showCaffeineInPill={false}
          onSelect={handleGelSelect}
          onCustomChange={handleGelCustomChange}
        />

        {/* Show carbs readout when a gel is selected */}
        {selectedGel && (
          <div className="flex items-center gap-2 text-[10px] font-label text-ink-muted pl-1">
            <span className="text-volt font-semibold">{selectedGel.carbsG} g</span> carbs per gel
            {selectedGel.caffeineMg > 0 && (
              <span className="text-plasma">· {selectedGel.caffeineMg} mg caffeine</span>
            )}
          </div>
        )}
      </div>

      {/* Elevation toggle */}
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

      {/* ── Caffeine section ── */}
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
            <p className="text-[10px] font-label text-ink-dim mt-0.5">Alternate with a caffeinated variant</p>
          </div>
        </label>

        {caffeineOpen && params.useCaffeineGels && (
          <div className="space-y-2.5 pl-1">
            {/* Caffeinated gel picker */}
            <p className="text-[10px] font-label text-ink-muted">Caffeinated gel variant</p>
            <GelPicker
              label="Caffeinated gel"
              selectedGelId={params.selectedCafGelId}
              customCarbsG={params.carbsPerGelG}
              customCaffeineMg={params.caffeinePerGelMg}
              showCaffeineInPill={true}
              caffeineOnly={true}
              onSelect={handleCafGelSelect}
              onCustomChange={handleCafCustomChange}
            />

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
                <CockpitInput value={params.caffeineGelCount} min={1} max={6} step={1} unit="at end"
                  onChange={(v) => set('caffeineGelCount', parseInt(v))} />
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 items-center">
              <label className="text-xs font-label text-ink-muted">No caffeine in final</label>
              <CockpitInput value={params.caffeineBlackoutMin} min={0} max={90} step={15} unit="min"
                onChange={(v) => set('caffeineBlackoutMin', parseFloat(v))} />
            </div>

            <p className="text-[10px] font-label text-ink-dim pl-1">
              Peak effect ~45 min after intake. Avoid dosing within {params.caffeineBlackoutMin} min of finish.
            </p>
          </div>
        )}
      </div>

      {warning && (
        <div className="rounded-sm bg-volt/10 border-l-2 border-volt px-3 py-2 text-xs font-label text-volt">
          ⚠ {warning}
        </div>
      )}

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
