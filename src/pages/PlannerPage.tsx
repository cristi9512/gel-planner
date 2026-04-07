import { useState, useCallback } from 'react';
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
import { calculatePlan } from '../utils/calculations';
import type { NutritionParams, Plan, HydrationParams } from '../types';
import type { ParsedGPX } from '../utils/gpxParser';

type Tab = 'gel' | 'hydration';

const DEFAULT_PARAMS: NutritionParams = {
  paceMinPerKm: 5.5,
  distanceKm: 21,
  carbsPerHourG: 60,
  carbsPerGelG: 22,
  firstGelMinute: 45,
  absorptionMinutes: 10,
  adjustForElevation: false,
  useCaffeineGels: false,
  caffeinePerGelMg: 75,
  caffeineStrategy: 'alternating',
  caffeineGelCount: 3,
  caffeineBlackoutMin: 60,
  selectedGelId: null,
  selectedCafGelId: null,
};

const DEFAULT_HYDRATION: HydrationParams = {
  weightKg: 70,
  weightUnit: 'kg',
  tempC: 18,
  tempUnit: 'C',
  intensity: 'moderate',
  electrolyteSource: 'none',
  aidStations: null,
  sodiumPerGelMgOverride: null,
};

function getWarning(params: NutritionParams): string | undefined {
  const totalMin = params.paceMinPerKm * params.distanceKm;
  if (totalMin < params.firstGelMinute) {
    return `Race too short (${Math.round(totalMin)} min) for first gel at ${params.firstGelMinute} min.`;
  }
  return undefined;
}

const TABS: { id: Tab; label: string }[] = [
  { id: 'gel',       label: '💧 Gel Planner'            },
  { id: 'hydration', label: '🧂 Hydration & Electrolytes' },
];

export function PlannerPage() {
  const [params, setParams]           = useState<NutritionParams>(DEFAULT_PARAMS);
  const [hydration, setHydration]     = useState<HydrationParams>(DEFAULT_HYDRATION);
  const [plan, setPlan]               = useState<Plan | null>(null);
  const [gpx, setGpx]                 = useState<ParsedGPX | null>(null);
  const [activeTab, setActiveTab]     = useState<Tab>('gel');
  const [showPrint, setShowPrint]     = useState(false);

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
    setPlan(null); // invalidate plan when shared inputs change
  }, []);

  const hasElevationData = !!(gpx?.elevationProfile);
  const warning = getWarning(params);

  return (
    <>
      {/* ── Page title ───────────────────────────────────────────────── */}
      <div className="px-6 md:px-10 pt-8 pb-4">
        <p className="text-ink-muted text-[10px] font-label uppercase tracking-[0.2em] mb-2">
          Race Nutrition Planning
        </p>
        <h1 className="font-display font-black uppercase leading-none">
          <span className="text-ink text-4xl md:text-6xl block">Fuel</span>
          <span className="text-volt text-5xl md:text-7xl block">Planner.</span>
        </h1>
      </div>

      {/* ── Shared race inputs ───────────────────────────────────────── */}
      <RaceHeader
        distanceKm={params.distanceKm}
        paceMinPerKm={params.paceMinPerKm}
        gpxDistanceKm={gpx?.totalDistanceKm}
        effectiveTotalMinutes={plan?.effectiveTotalMinutes}
        onDistanceChange={(v) => handleRaceChange('distanceKm', v)}
        onPaceChange={(v) => handleRaceChange('paceMinPerKm', v)}
      />

      {/* ── Tab nav ─────────────────────────────────────────────────── */}
      <div className="px-6 md:px-10 border-b border-surface-high/40">
        <div className="flex gap-0">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-label font-semibold transition-colors relative whitespace-nowrap
                ${activeTab === tab.id
                  ? 'text-volt'
                  : 'text-ink-muted hover:text-ink'
                }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-volt rounded-t-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tab content ─────────────────────────────────────────────── */}
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
                    GPX File{' '}
                    <span className="text-ink-dim normal-case">(optional)</span>
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
                <ResultsSummary plan={plan} />
                <FeedingTimeline gels={plan.gels} totalMinutes={plan.effectiveTotalMinutes} />
                {hasElevationData && gpx && (
                  <ElevationChart trackPoints={gpx.trackPoints} gels={plan.gels} />
                )}
                <GelList plan={plan} />
                <div className="flex justify-end items-end gap-3 pt-2">
                  <div className="flex flex-col items-center gap-2">
                    <button
                      onClick={() => setShowPrint(true)}
                      className="flex items-center gap-2.5 rounded-full px-8 py-3 font-display font-black text-sm uppercase tracking-wider transition-all active:scale-95 bg-surface-high text-ink hover:bg-surface-highest border border-surface-highest/60"
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
          <HydrationPanel
            params={hydration}
            onChange={setHydration}
            plan={plan}
            distanceKm={params.distanceKm}
          />
        )}
      </div>
    </>
  );
}
