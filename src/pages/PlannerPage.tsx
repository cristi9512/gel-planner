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
import { calculatePlan } from '../utils/calculations';
import type { NutritionParams, Plan } from '../types';
import type { ParsedGPX } from '../utils/gpxParser';

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

function getWarning(params: NutritionParams): string | undefined {
  const totalMin = params.paceMinPerKm * params.distanceKm;
  if (totalMin < params.firstGelMinute) {
    return `Race too short (${Math.round(totalMin)} min) for first gel at ${params.firstGelMinute} min.`;
  }
  return undefined;
}

export function PlannerPage() {
  const [params, setParams] = useState<NutritionParams>(DEFAULT_PARAMS);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [gpx, setGpx] = useState<ParsedGPX | null>(null);
  const [showPrint, setShowPrint] = useState(false);

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
    setParams((p) => ({
      ...p,
      distanceKm: DEFAULT_PARAMS.distanceKm,
      adjustForElevation: false,
    }));
    setPlan(null);
  }, []);

  const handleCalculate = useCallback(() => {
    setPlan(calculatePlan(params, gpx?.trackPoints));
  }, [params, gpx]);

  const hasElevationData = !!(gpx?.elevationProfile);
  const gelsForMap = plan?.gels ?? [];
  const warning = getWarning(params);

  return (
    <>
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
              <p className="text-ink-dim text-[10px] font-label uppercase tracking-widest">
                Estimated finish
              </p>
              <p className="font-display font-black text-4xl text-ink leading-none">
                {Math.floor(plan.effectiveTotalMinutes / 60)}h{' '}
                <span className="text-volt">
                  {String(Math.round(plan.effectiveTotalMinutes % 60)).padStart(2, '0')}
                </span>
                <span className="text-ink-muted text-xl">min</span>
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="px-6 md:px-10 pb-12 space-y-5">

        {/* Two-column: params | map */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          {/* Left: parameters + GPX uploader */}
          <div className="space-y-4">
            <ParametersPanel
              params={params}
              onChange={setParams}
              onCalculate={handleCalculate}
              gpxDistanceKm={gpx?.totalDistanceKm}
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

          {/* Right: map */}
          <div className="flex flex-col gap-4">
            {gpx ? (
              <div
                className="rounded-xl overflow-hidden bg-surface-low flex-shrink-0"
                style={{ height: '420px' }}
              >
                <RouteMap trackPoints={gpx.trackPoints} gels={gelsForMap} />
              </div>
            ) : (
              <div
                className="rounded-xl flex flex-col items-center justify-center text-center p-10 bg-surface-low flex-1"
                style={{ minHeight: '300px' }}
              >
                <span className="text-5xl mb-4 opacity-30">🗺️</span>
                <p className="text-sm font-body font-medium text-ink-muted">
                  Map appears after loading a GPX
                </p>
                <p className="text-xs font-label text-ink-dim mt-1">
                  Route and gel markers shown interactively
                </p>
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
              {/* Print — secondary pill, same height as Export GPX */}
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
      </div>
    </>
  );
}
