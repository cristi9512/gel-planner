import { useState, useCallback } from 'react';
import { ParametersPanel } from './components/ParametersPanel';
import { GpxUploader } from './components/GpxUploader';
import { ResultsSummary } from './components/ResultsSummary';
import { GelList } from './components/GelList';
import { RouteMap } from './components/RouteMap';
import { ExportButton } from './components/ExportButton';
import { AlgorithmPage } from './components/AlgorithmPage';
import { ElevationChart } from './components/ElevationChart';
import { FeedingTimeline } from './components/FeedingTimeline';
import { calculatePlan } from './utils/calculations';
import type { NutritionParams, Plan } from './types';
import type { ParsedGPX } from './utils/gpxParser';

type Page = 'planner' | 'algorithm';

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
};

function getWarning(params: NutritionParams): string | undefined {
  const totalMin = params.paceMinPerKm * params.distanceKm;
  if (totalMin < params.firstGelMinute) {
    return `Race too short (${Math.round(totalMin)} min) for first gel at ${params.firstGelMinute} min.`;
  }
  return undefined;
}

interface NavItemProps {
  icon: string;
  label: string;
  active: boolean;
  onClick: () => void;
}

function NavItem({ icon, label, active, onClick }: NavItemProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors relative font-label
        ${active
          ? 'text-volt bg-volt/10'
          : 'text-ink-muted hover:text-ink hover:bg-white/5'
        }`}
    >
      {active && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-volt rounded-r" />
      )}
      <span className="text-base shrink-0">{icon}</span>
      <span className="hidden md:block">{label}</span>
      {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-volt hidden md:block" />}
    </button>
  );
}

export default function App() {
  const [page, setPage] = useState<Page>('planner');
  const [params, setParams] = useState<NutritionParams>(DEFAULT_PARAMS);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [gpx, setGpx] = useState<ParsedGPX | null>(null);

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

  const warning = getWarning(params);

  const sidebar = (
    <aside className="fixed inset-y-0 left-0 z-50 w-14 md:w-52 bg-surface-low flex flex-col">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-surface-high/40">
        <div className="hidden md:block">
          <p className="text-volt font-display font-black text-xs uppercase tracking-widest leading-tight">
            Gel Timing
          </p>
          <p className="text-ink font-display font-black text-sm uppercase leading-tight">
            Planner
          </p>
        </div>
        <div className="md:hidden flex items-center justify-center">
          <span className="text-volt font-display font-black text-lg">G</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 space-y-1">
        <NavItem icon="⚡" label="Planner" active={page === 'planner'} onClick={() => setPage('planner')} />
        <NavItem icon="📐" label="How it works" active={page === 'algorithm'} onClick={() => setPage('algorithm')} />
      </nav>

      {/* Bottom tag */}
      <div className="hidden md:block px-4 py-4 border-t border-surface-high/40">
        <p className="text-[10px] font-label text-ink-dim uppercase tracking-widest">Race Nutrition</p>
        <p className="text-[10px] font-label text-ink-dim">v2.0 · Client-side only</p>
      </div>
    </aside>
  );

  if (page === 'algorithm') {
    return (
      <div className="flex min-h-screen bg-surface">
        {sidebar}
        <main className="ml-14 md:ml-52 flex-1 overflow-x-hidden">
          <AlgorithmPage onBack={() => setPage('planner')} />
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-surface">
      {sidebar}

      <main className="ml-14 md:ml-52 flex-1 overflow-x-hidden">
        {/* Hero */}
        <div className="px-6 md:px-10 pt-8 pb-6">
          <p className="text-ink-muted text-[10px] font-label uppercase tracking-[0.2em] mb-2">
            Race Nutrition Planning
          </p>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <h1 className="font-display font-black uppercase leading-none">
              <span className="text-ink text-4xl md:text-6xl block">Gel Timing</span>
              <span className="text-volt text-5xl md:text-7xl block">Planner.</span>
            </h1>
            {plan && (
              <div className="text-right shrink-0">
                <p className="text-ink-dim text-[10px] font-label uppercase tracking-widest">Estimated finish</p>
                <p className="font-display font-black text-4xl text-ink leading-none">
                  {Math.floor(plan.effectiveTotalMinutes / 60)}h{' '}
                  <span className="text-volt">{String(Math.round(plan.effectiveTotalMinutes % 60)).padStart(2, '0')}</span>
                  <span className="text-ink-muted text-xl">min</span>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Main content */}
        <div className="px-6 md:px-10 pb-12 space-y-5">

          {/* Two-column: params + map */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-4">
              <ParametersPanel
                params={params}
                onChange={setParams}
                onCalculate={handleCalculate}
                gpxDistanceKm={gpx?.totalDistanceKm}
                hasElevation={!!gpx?.elevationProfile}
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
                    Upload a GPX to visualise the route, see the elevation chart, and export waypoints.
                  </p>
                )}
              </div>
            </div>

            {/* Map / placeholder */}
            {gpx ? (
              <div className="rounded-xl overflow-hidden bg-surface-low" style={{ minHeight: '420px' }}>
                <RouteMap trackPoints={gpx.trackPoints} gels={plan?.gels ?? []} />
              </div>
            ) : (
              <div
                className="rounded-xl flex flex-col items-center justify-center text-center p-10 bg-surface-low"
                style={{ minHeight: '320px' }}
              >
                <span className="text-5xl mb-4 opacity-30">🗺️</span>
                <p className="text-sm font-body font-medium text-ink-muted">Map appears after loading a GPX</p>
                <p className="text-xs font-label text-ink-dim mt-1">Route and gel markers shown interactively</p>
              </div>
            )}
          </div>

          {/* Results */}
          {plan ? (
            <>
              <ResultsSummary plan={plan} />
              <FeedingTimeline gels={plan.gels} totalMinutes={plan.effectiveTotalMinutes} />
              {gpx?.elevationProfile && (
                <ElevationChart
                  trackPoints={gpx.trackPoints}
                  gels={plan.gels}
                />
              )}
              <GelList plan={plan} />
              {gpx && plan.gels.some((g) => g.lat !== undefined) && (
                <div className="flex justify-end pt-2">
                  <ExportButton plan={plan} trackPoints={gpx.trackPoints} />
                </div>
              )}
            </>
          ) : (
            <div className="bg-surface-low rounded-xl p-10 text-center">
              <p className="text-4xl mb-3 opacity-20">📊</p>
              <p className="text-sm font-body text-ink-muted">
                Set your parameters and press{' '}
                <span className="text-volt font-semibold">Calculate plan</span>
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
