import { useMemo } from 'react';
import type {
  HydrationParams, PaceIntensity, ElectrolyteSource, Plan,
} from '../types';
import { calculateHydration, lbsToKg, fToC } from '../utils/hydrationCalc';
import { getGelById } from '../data/gels';

interface Props {
  params: HydrationParams;
  onChange: (p: HydrationParams) => void;
  plan: Plan | null;
  distanceKm: number;
}

// ─── Reusable sub-components ──────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-ink-muted text-[10px] font-label uppercase tracking-widest">{children}</p>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-2 gap-3 items-center">
      <label className="text-xs font-label text-ink-muted">{label}</label>
      {children}
    </div>
  );
}

function NumInput({
  value, min, max, step, unit, onChange,
}: {
  value: number; min: number; max: number; step: number; unit: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="cockpit-input bg-surface-high rounded-sm flex items-center">
      <input
        type="number"
        value={value}
        min={min} max={max} step={step}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="flex-1 bg-transparent px-3 py-2.5 text-sm font-label font-medium text-ink focus:outline-none min-w-0"
      />
      <span className="pr-3 text-[11px] font-label text-ink-dim shrink-0">{unit}</span>
    </div>
  );
}

function UnitToggle<T extends string>({
  value, options, labels, onChange,
}: {
  value: T; options: [T, T]; labels: [string, string]; onChange: (v: T) => void;
}) {
  return (
    <div className="flex rounded-sm overflow-hidden border border-surface-highest text-xs font-label font-semibold shrink-0">
      {options.map((opt, i) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={`px-2.5 py-1.5 transition-colors ${
            value === opt ? 'bg-volt text-surface' : 'bg-surface-high text-ink-muted hover:text-ink'
          }`}
        >
          {labels[i]}
        </button>
      ))}
    </div>
  );
}

function ButtonGroup<T extends string>({
  value, options, onChange,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex gap-1.5 flex-wrap">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={`px-3 py-1.5 rounded-sm text-xs font-label font-semibold transition-colors ${
            value === o.value
              ? 'bg-volt text-surface'
              : 'bg-surface-high text-ink-muted hover:text-ink'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function StatCard({
  label, value, sub, accent,
}: {
  label: string; value: string; sub?: string; accent?: boolean;
}) {
  return (
    <div className="bg-surface-high rounded-lg p-4 flex flex-col gap-1">
      <p className="text-[10px] font-label uppercase tracking-widest text-ink-muted">{label}</p>
      <p className={`font-display font-black text-2xl leading-none ${accent ? 'text-volt' : 'text-ink'}`}>
        {value}
      </p>
      {sub && <p className="text-[10px] font-label text-ink-dim">{sub}</p>}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

const INTENSITY_OPTIONS: { value: PaceIntensity; label: string }[] = [
  { value: 'easy',     label: '🟢 Easy'     },
  { value: 'moderate', label: '🟡 Moderate' },
  { value: 'hard',     label: '🔴 Hard'     },
];

const ELECTROLYTE_OPTIONS: { value: ElectrolyteSource; label: string }[] = [
  { value: 'none',      label: 'None'              },
  { value: 'salt-tabs', label: 'Salt tabs'          },
  { value: 'drink',     label: 'Electrolyte drink'  },
  { value: 'both',      label: 'Both'               },
];

export function HydrationPanel({ params, onChange, plan, distanceKm }: Props) {
  const set = <K extends keyof HydrationParams>(key: K, value: HydrationParams[K]) =>
    onChange({ ...params, [key]: value });

  // Resolve actual tempC/weightKg for calculations
  const resolvedTempC   = params.tempUnit   === 'F'   ? fToC(params.tempC)     : params.tempC;
  const resolvedWeightKg = params.weightUnit === 'lbs' ? lbsToKg(params.weightKg) : params.weightKg;

  // Sodium from selected gel
  const selectedGel = plan?.params.selectedGelId
    ? getGelById(plan.params.selectedGelId)
    : null;
  const gelSodiumMg     = selectedGel?.sodiumMg ?? 0;
  const gelHasElectrolytes = (selectedGel?.sodiumMg ?? 0) > 0
    || selectedGel?.notes.toLowerCase().includes('electrolyte')
    || selectedGel?.type?.toLowerCase() === 'electrolyte';

  const sodiumPerGel = params.sodiumPerGelMgOverride ?? gelSodiumMg;
  const gelCount     = plan?.gels.length ?? 0;
  const raceMinutes  = plan?.effectiveTotalMinutes ?? (60 * distanceKm / 10); // fallback ~6 min/km

  const result = useMemo(() => calculateHydration(
    { ...params, tempC: resolvedTempC },
    raceMinutes,
    distanceKm,
    gelCount,
    sodiumPerGel,
    gelHasElectrolytes,
  ), [params, resolvedTempC, raceMinutes, distanceKm, gelCount, sodiumPerGel, gelHasElectrolytes]);

  const tempDisplay      = params.tempUnit     === 'F'   ? `${params.tempC}°F`      : `${params.tempC}°C`;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        {/* ── Left: Inputs ── */}
        <div className="bg-surface-low rounded-xl p-5 space-y-5">
          <SectionLabel>Runner profile</SectionLabel>

          <div className="space-y-2.5">
            {/* Weight */}
            <Row label="Body weight">
              <div className="flex gap-2">
                <NumInput
                  value={params.weightKg}
                  min={params.weightUnit === 'lbs' ? 66 : 30}
                  max={params.weightUnit === 'lbs' ? 330 : 150}
                  step={params.weightUnit === 'lbs' ? 1 : 0.5}
                  unit={params.weightUnit}
                  onChange={(v) => set('weightKg', v)}
                />
                <UnitToggle<typeof params.weightUnit>
                  value={params.weightUnit}
                  options={['kg', 'lbs']}
                  labels={['kg', 'lbs']}
                  onChange={(u) => {
                    // Convert stored value when toggling
                    const kg = u === 'kg' && params.weightUnit === 'lbs'
                      ? Math.round(lbsToKg(params.weightKg) * 2) / 2
                      : u === 'lbs' && params.weightUnit === 'kg'
                      ? Math.round(params.weightKg * 2.205)
                      : params.weightKg;
                    onChange({ ...params, weightUnit: u, weightKg: kg });
                  }}
                />
              </div>
            </Row>

            {/* Temperature */}
            <Row label="Race temperature">
              <div className="flex gap-2">
                <NumInput
                  value={params.tempC}
                  min={params.tempUnit === 'F' ? 32 : 0}
                  max={params.tempUnit === 'F' ? 113 : 45}
                  step={1}
                  unit={params.tempUnit === 'F' ? '°F' : '°C'}
                  onChange={(v) => set('tempC', v)}
                />
                <UnitToggle<typeof params.tempUnit>
                  value={params.tempUnit}
                  options={['C', 'F']}
                  labels={['°C', '°F']}
                  onChange={(u) => {
                    const converted = u === 'F' && params.tempUnit === 'C'
                      ? Math.round(params.tempC * 9 / 5 + 32)
                      : u === 'C' && params.tempUnit === 'F'
                      ? Math.round(fToC(params.tempC))
                      : params.tempC;
                    onChange({ ...params, tempUnit: u, tempC: converted });
                  }}
                />
              </div>
            </Row>
          </div>

          {/* Intensity */}
          <div className="space-y-2 pt-3 border-t border-surface-high/60">
            <SectionLabel>Race intensity</SectionLabel>
            <ButtonGroup<PaceIntensity>
              value={params.intensity}
              options={INTENSITY_OPTIONS}
              onChange={(v) => set('intensity', v)}
            />
            <p className="text-[10px] font-label text-ink-dim">
              Affects sweat rate (+150 ml/hr moderate, +300 ml/hr hard) and sodium targets.
            </p>
          </div>

          {/* Electrolyte source */}
          <div className="space-y-2 pt-3 border-t border-surface-high/60">
            <SectionLabel>Electrolyte source</SectionLabel>
            <ButtonGroup<ElectrolyteSource>
              value={params.electrolyteSource}
              options={ELECTROLYTE_OPTIONS}
              onChange={(v) => set('electrolyteSource', v)}
            />
          </div>

          {/* Aid stations */}
          <div className="space-y-2.5 pt-3 border-t border-surface-high/60">
            <SectionLabel>Aid stations</SectionLabel>
            <Row label="Number of stops">
              <div className="cockpit-input bg-surface-high rounded-sm flex items-center">
                <input
                  type="number"
                  value={params.aidStations ?? ''}
                  min={1}
                  max={50}
                  step={1}
                  placeholder={`Auto (${Math.ceil(distanceKm / 5)})`}
                  onChange={(e) =>
                    set('aidStations', e.target.value === '' ? null : parseInt(e.target.value))
                  }
                  className="flex-1 bg-transparent px-3 py-2.5 text-sm font-label font-medium text-ink focus:outline-none min-w-0 placeholder:text-ink-dim"
                />
                <span className="pr-3 text-[11px] font-label text-ink-dim shrink-0">stops</span>
              </div>
            </Row>
            <p className="text-[10px] font-label text-ink-dim">
              Leave blank to auto-calculate (1 per 5 km).
            </p>
          </div>

          {/* Sodium per gel override */}
          <div className="space-y-2.5 pt-3 border-t border-surface-high/60">
            <SectionLabel>Sodium from gels</SectionLabel>
            {selectedGel ? (
              <div className="bg-surface-high rounded-sm px-3 py-2.5 text-xs font-label text-ink-muted space-y-0.5">
                <span className="text-ink font-semibold">{selectedGel.brand} {selectedGel.name}</span>
                {gelHasElectrolytes ? (
                  <p className="text-plasma">Contains electrolytes · {gelSodiumMg > 0 ? `${gelSodiumMg} mg Na` : 'exact amount unknown'}</p>
                ) : (
                  <p className="text-ink-dim">No electrolytes listed</p>
                )}
              </div>
            ) : (
              <p className="text-[10px] font-label text-ink-dim">No gel selected — set manually if known.</p>
            )}
            <Row label="Sodium per gel">
              <NumInput
                value={params.sodiumPerGelMgOverride ?? gelSodiumMg}
                min={0}
                max={500}
                step={10}
                unit="mg"
                onChange={(v) => set('sodiumPerGelMgOverride', v === 0 ? null : v)}
              />
            </Row>
            <p className="text-[10px] font-label text-ink-dim">
              Check your gel label. Most regular gels: 10–30 mg. Electrolyte gels: 100–250 mg.
            </p>
          </div>
        </div>

        {/* ── Right: Results ── */}
        <div className="space-y-4">

          {/* Warnings */}
          {result.warnings.length > 0 && (
            <div className="space-y-2">
              {result.warnings.map((w, i) => (
                <div key={i} className="flex gap-3 items-start bg-volt/8 border-l-2 border-volt rounded-sm px-4 py-3">
                  <span className="text-volt text-sm shrink-0">⚠</span>
                  <p className="text-xs font-body text-ink leading-relaxed">{w}</p>
                </div>
              ))}
            </div>
          )}

          {/* Fluid summary */}
          <div>
            <p className="text-[10px] font-label uppercase tracking-widest text-ink-muted mb-2">Fluid needs</p>
            <div className="grid grid-cols-2 gap-3">
              <StatCard
                label="Sweat rate"
                value={`${result.sweatRateMlPerHour} ml`}
                sub="per hour"
                accent
              />
              <StatCard
                label="Total fluid"
                value={result.totalFluidMl >= 1000
                  ? `${(result.totalFluidMl / 1000).toFixed(1)} L`
                  : `${result.totalFluidMl} ml`}
                sub={`across ${(raceMinutes / 60).toFixed(1)} hrs`}
              />
              <StatCard
                label="Per aid station"
                value={`${result.fluidPerAidStationMl} ml`}
                sub={`${result.aidStationCount} stops`}
              />
              <StatCard
                label="Temperature"
                value={tempDisplay}
                sub={resolvedWeightKg ? `${resolvedWeightKg} kg body weight` : ''}
              />
            </div>
          </div>

          {/* Sodium summary */}
          <div>
            <p className="text-[10px] font-label uppercase tracking-widest text-ink-muted mb-2">Sodium</p>
            <div className="grid grid-cols-2 gap-3">
              <StatCard
                label="Target"
                value={`${result.sodiumMgPerHour} mg`}
                sub="per hour"
                accent
              />
              <StatCard
                label="Total needed"
                value={`${result.totalSodiumMg} mg`}
                sub="full race"
              />
              {result.sodiumFromGelsMg > 0 && (
                <StatCard
                  label="From gels"
                  value={`${result.sodiumFromGelsMg} mg`}
                  sub={`${gelCount} gels × ${sodiumPerGel} mg`}
                />
              )}
              <StatCard
                label="Still needed"
                value={`${result.netSodiumMg} mg`}
                sub={
                  params.electrolyteSource === 'none'
                    ? 'from food/drink'
                    : params.electrolyteSource === 'salt-tabs'
                    ? 'via salt tabs'
                    : 'via electrolyte drink'
                }
              />
            </div>
          </div>

          {/* Gel electrolyte note */}
          {result.gelHasElectrolytes && result.sodiumFromGelsMg > 0 && (
            <div className="bg-plasma/8 border-l-2 border-plasma rounded-sm px-4 py-3 text-xs font-body text-ink leading-relaxed">
              💧 <span className="text-plasma font-semibold">Electrolytes from gels factored in.</span>{' '}
              Your selected gel contributes <strong>{result.sodiumFromGelsMg} mg</strong> sodium across the race.
              Net supplementation needed: <strong>{result.netSodiumMg} mg</strong>.
            </div>
          )}

          {/* No gel selected nudge */}
          {!plan && (
            <div className="bg-surface-high rounded-sm px-4 py-3 text-xs font-body text-ink-muted leading-relaxed">
              💡 Calculate a gel plan first to factor in sodium from your gels and get race-duration-accurate fluid totals.
            </div>
          )}

          {/* Reference card */}
          <div className="bg-surface-low rounded-xl p-4 space-y-2 border border-surface-high/50">
            <p className="text-[10px] font-label uppercase tracking-widest text-ink-muted">Quick reference</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs font-label">
              <span className="text-ink-dim">Sweat rate base</span>
              <span className="text-ink">500 ml/hr</span>
              <span className="text-ink-dim">+Temp ({params.tempUnit === 'F' ? `${params.tempC}°F` : `${params.tempC}°C`})</span>
              <span className="text-ink">
                +{Math.round(Math.max(0, (resolvedTempC - 15) / 5) * 100)} ml/hr
              </span>
              <span className="text-ink-dim">+Intensity</span>
              <span className="text-ink">
                +{params.intensity === 'easy' ? 0 : params.intensity === 'moderate' ? 150 : 300} ml/hr
              </span>
              <span className="text-volt font-semibold">= Total sweat rate</span>
              <span className="text-volt font-semibold">{result.sweatRateMlPerHour} ml/hr</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
