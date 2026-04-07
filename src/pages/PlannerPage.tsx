import { useState, useCallback, useEffect, useRef } from 'react';
import { ParametersPanel } from '../components/ParametersPanel';
import { GpxUploader } from '../components/GpxUploader';
import { ResultsSummary } from '../components/ResultsSummary';
import { GelList } from '../components/GelList';
import { RouteMap } from '../components/RouteMap';
import { ExportButton } from '../components/ExportButton';
import { ElevationChart } from '../components/ElevationChart';
import { FeedingTimeline } from '../components/FeedingTimeline';
import { PrintRaceCard } from '../components/PrintRaceCard';
import { RaceHeader } from '../components/RaceHeader';
import { HydrationPanel } from '../components/HydrationPanel';
import { ShareButton } from '../components/ShareButton';
import { calculatePlan } from '../utils/calculations';
import {
  readBootState,
  encodeState,
  isDefaultState,
  writeHashParam,
  clearHashParam,
  DEFAULT_PARAMS,
} from '../utils/urlState';
import type { NutritionParams, Plan, HydrationParams } from '../types';
import type { ParsedGPX } from '../utils/gpxParser';
import type { Tab } from '../utils/urlState';

const TABS: { id: Tab; label: string; shortLabel: string }[] = [
  { id: 'gel',       label: '💧 Gel Planner',             shortLabel: '💧 Gels'       },
  { id: 'hydration', label: '🧂 Hydration & Electrolytes', shortLabel: '🧂 Hydration'  },
];

function getWarning(params: NutritionParams): string | undefined {
  const totalMin = params.paceMinPerKm * params.distanceKm;
  if (totalMin < params.firstGelMinute) {
    return `Race too short (${Math.round(totalMin)} min) for first gel at ${params.firstGelMinute} min.`;
  }
  return undefined;
}

// ─── Boot: read hash once before first render ─────────────────────────────────
// useState lazy-initialiser runs exactly once, even in StrictMode double-invoke.
function boot() {
  return readBootState();
}

export function PlannerPage() {
  // Decode hash on first render only
  const [{ params: bootParams, hydration: bootHydration, tab: bootTab,
           hadUnknownGels, hasHash }] = useState(boot);

  const [params, setParams]       = useState<NutritionParams>(bootParams);
  const [hydration, setHydration] = useState<HydrationParams>(bootHydration);
  const [activeTab, setActiveTab] = useState<Tab>(bootTab);
  const [showPrint, setShowPrint] = useState(false);
  const [restoreWarning, setRestoreWarning] = useState(hadUnknownGels);

  // Auto-calculate plan when booting from a shared URL
  const [plan, setPlan] = useState<Plan | null>(() =>
    hasHash ? calculatePlan(bootParams) : null,
  );
  const [gpx, setGpx] = useState<ParsedGPX | null>(null);

  // ── Debounced URL sync ──────────────────────────────────────────────────────
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      if (isDefaultState(params, hydration)) {
        clearHashParam();
      } else {
        writeHashParam(encodeState(params, hydration, activeTab));
      }
    }, 500);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [params, hydration, activeTab]);

  // ── GPX handlers ───────────────────────────────────────────────────────────
  const handleGpxLoaded = useCallback((data: ParsedGPX) => {
    setGpx(data);
    const updatedParams: NutritionParams = {
      ...params,
      distanceKm: parseFloat(data.totalDistanceKm.toFixed(2)),
      adjustForElevation: !!data.elevationProfile,
    };
    setParams(updatedParams);
    setPlan(calculatePlan(updatedParams, data.trackPoints));
  }, [params]);

  const handleGpxCleared = useCallback(() => {
    setGpx(null);
    setParams((p) => ({ ...p, distanceKm: DEFAULT_PARAMS.distanceKm, adjustForElevation: false }));
    setPlan(null);
  }, []);

  const handleCalculate = useCallback(() => {
    setPlan(calculatePlan(params, gpx?.trackPoints));
  }, [params, gpx]);

  const handleRaceChange = useCallback((field: 'distanceKm' | 'paceMinPerKm', value: number) => {
    setParams((p) => ({ ...p, [field]: value }));
    setPlan(null);
  }, []);

  const hasElevationData = !!(gpx?.elevationProfile);
  const warning = getWarning(params);

  return (
    <>
      {/* ── Page title ─────────────────────────────────────────────── */}
      <div className="px-6 md:px-10 pt-8 pb-4">
        <p className="text-ink-muted text-[10px] font-label uppercase tracking-[0.2em] mb-2">
          Race Nutrition Planning
        </p>
        <h1 className="font-display font-black uppercase leading-none">
          <span className="text-ink text-4xl md:text-6xl block">Fuel</span>
          <span className="text-volt text-5xl md:text-7xl block">Planner.</span>
        </h1>
      </div>

      {/* ── Restore warning ────────────────────────────────────────── */}
      {restoreWarning && (
        <div className="mx-6 md:mx-10 mb-2 flex items-start gap-3 bg-volt/8 border-l-2 border-volt rounded-sm px-4 py-3">
          <span className="text-volt text-sm shrink-0 mt-0.5">⚠</span>
          <p className="text-xs font-body text-ink leading-relaxed flex-1">
            Some plan data could not be restored — a gel in this link no longer exists in the database.
            Gel selection has been cleared; all other settings were loaded successfully.
          </p>
          <button
            onClick={() => setRestoreWarning(false)}
            className="text-ink-dim hover:text-volt text-xs ml-2 shrink-0"
            aria-label="Dismiss"
          >
            ✕
          </button>
        </div>
      )}

      {/* ── Shared race inputs ─────────────────────────────────────── */}
      <RaceHeader
        distanceKm={params.distanceKm}
        paceMinPerKm={params.paceMinPerKm}
        gpxDistanceKm={gpx?.totalDistanceKm}
        effectiveTotalMinutes={plan?.effectiveTotalMinutes}
        onDistanceChange={(v) => handleRaceChange('distanceKm', v)}
        onPaceChange={(v) => handleRaceChange('paceMinPerKm', v)}
      />

      {/* ── Tab nav ────────────────────────────────────────────────── */}
      <div className="px-6 md:px-10 border-b border-surface-high/40 overflow-x-auto">
        <div className="flex gap-0 min-w-max">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-label font-semibold transition-colors relative whitespace-nowrap
                ${activeTab === tab.id ? 'text-volt' : 'text-ink-muted hover:text-ink'}`}
            >
              <span className="md:hidden">{tab.shortLabel}</span>
              <span className="hidden md:inline">{tab.label}</span>
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-volt rounded-t-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tab content ────────────────────────────────────────────── */}
      <div className="px-6 md:px-10 pb-12 pt-5 space-y-5">

        {activeTab === 'gel' && (
          <>
            {/* Two-column: params | map */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-4">
                <ParametersPanel
                  params={params}
                  onChange={setParams}
                  onCalculate={handleCalculate}
                  hasElevation={hasElevationData}
                  warning={warning}
                />
                <div className="bg-surface-low rounded-xl p-5">
                  <p className="text-ink-muted text-[10px] font-label uppercase tracking-widest mb-3">
                    GPX File <span className="text-ink-dim normal-case">(optional)</span>
                  </p>
                  <GpxUploader
                    onGpxLoaded={handleGpxLoaded}
                    onGpxCleared={handleGpxCleared}
                    loadedGpx={gpx ?? undefined}
                  />
                  {!gpx && (
                    <p className="text-xs font-label text-ink-dim mt-2">
                      Upload a GPX to see the route, elevation profile, and export waypoints.
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-4">
                {gpx ? (
                  <div className="rounded-xl overflow-hidden bg-surface-low flex-shrink-0" style={{ height: '420px' }}>
                    <RouteMap trackPoints={gpx.trackPoints} gels={plan?.gels ?? []} />
                  </div>
                ) : (
                  <div
                    className="rounded-xl flex flex-col items-center justify-center text-center p-10 bg-surface-low flex-1"
                    style={{ minHeight: '300px' }}
                  >
                    <span className="text-5xl mb-4 opacity-30">🗺️</span>
                    <p className="text-sm font-body font-medium text-ink-muted">Map appears after loading a GPX</p>
                    <p className="text-xs font-label text-ink-dim mt-1">Route and gel markers shown interactively</p>
                  </div>
                )}
              </div>
            </div>

            {/* Results */}
            {plan ? (
              <>
                {/* Results header row — share button lives here */}
                <div className="flex items-center justify-between pt-1">
                  <p className="text-[10px] font-label uppercase tracking-widest text-ink-muted">
                    Results
                  </p>
                  <ShareButton visible={true} />
                </div>

                <ResultsSummary plan={plan} />
                <FeedingTimeline gels={plan.gels} totalMinutes={plan.effectiveTotalMinutes} />
                {hasElevationData && gpx && (
                  <ElevationChart trackPoints={gpx.trackPoints} gels={plan.gels} />
                )}
                <GelList plan={plan} />

                {/* Action row */}
                <div className="flex flex-wrap justify-end items-end gap-3 pt-2">
                  <div className="flex flex-col items-center gap-2">
                    <button
                      onClick={() => setShowPrint(true)}
                      className="flex items-center gap-2.5 rounded-full px-6 md:px-8 py-3 font-display font-black text-sm uppercase tracking-wider whitespace-nowrap transition-all active:scale-95 bg-surface-high text-ink hover:bg-surface-highest border border-surface-highest/60"
                    >
                      🖨️ Print Race Card
                    </button>
                    <p className="text-[10px] font-label text-ink-dim">PDF · A5 · Wristband</p>
                  </div>
                  {gpx && plan.gels.some((g) => g.lat !== undefined) && (
                    <ExportButton plan={plan} trackPoints={gpx.trackPoints} />
                  )}
                </div>

                {showPrint && (
                  <PrintRaceCard plan={plan} onClose={() => setShowPrint(false)} />
                )}
              </>
            ) : (
              <div className="bg-surface-low rounded-xl p-10 text-center">
                <p className="text-4xl mb-3 opacity-20">📊</p>
                <p className="text-sm font-body text-ink-muted">
                  Set your parameters and press{' '}
                  <span className="text-volt font-semibold">Calculate Plan</span>
                </p>
              </div>
            )}
          </>
        )}

        {activeTab === 'hydration' && (
          <>
            {/* Hydration share button */}
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-label uppercase tracking-widest text-ink-muted">
                Hydration & Electrolytes
              </p>
              <ShareButton visible={true} />
            </div>

            <HydrationPanel
              params={hydration}
              onChange={setHydration}
              plan={plan}
              distanceKm={params.distanceKm}
            />
          </>
        )}
      </div>
    </>
  );
}
