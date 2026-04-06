import type { NutritionParams, Plan, GelPoint, TrackPoint, CaffeineStrategy } from '../types';
import { interpolateAtKm, calculateElevationProfile } from './geo';

export function formatTime(totalMin: number): string {
  const h = Math.floor(totalMin / 60);
  const m = Math.round(totalMin % 60);
  if (h > 0) return `${h}h ${m.toString().padStart(2, '0')}min`;
  return `${m}min`;
}

/**
 * Elevation adjustment using a modified Naismith's rule for running:
 *   +1 min per 10 m of ascent  (≈ 6 s per metre — conservative estimate)
 *   -0.3 min per 10 m of descent (mild time saving for moderate slopes)
 *
 * Reference: Naismith (1892), updated by Langmuir (1984) for descent.
 */
function elevationTimeAdjustmentMin(gainM: number, lossM: number): number {
  const ascentAdjMin = gainM * 0.1;      // 1 min per 10 m gain
  const descentAdjMin = lossM * 0.03;   // slight saving on descent
  return ascentAdjMin - descentAdjMin;
}

/**
 * Assigns caffeinated / regular status to each gel.
 *
 * Rules applied in order:
 * 1. No caffeinated gel within `caffeineBlackoutMin` of the finish
 *    (caffeine peaks ~45 min after ingestion; taking it too late gives no benefit
 *     and may cause GI issues).
 * 2. Strategy 'alternating': every other gel starting from gel #2 is caffeinated.
 * 3. Strategy 'finalPush': the last `caffeineGelCount` eligible gels are caffeinated.
 */
function assignCaffeine(
  gelTimes: number[],
  effectiveTotalMinutes: number,
  strategy: CaffeineStrategy,
  caffeineGelCount: number,
  caffeineBlackoutMin: number
): boolean[] {
  const eligible = gelTimes.map((t) => t <= effectiveTotalMinutes - caffeineBlackoutMin);

  if (strategy === 'alternating') {
    return gelTimes.map((_, i) => eligible[i] && i % 2 === 1);
  }

  // finalPush: last N eligible gels
  const result = new Array(gelTimes.length).fill(false);
  let assigned = 0;
  for (let i = gelTimes.length - 1; i >= 0 && assigned < caffeineGelCount; i--) {
    if (eligible[i]) {
      result[i] = true;
      assigned++;
    }
  }
  return result;
}

export function calculatePlan(params: NutritionParams, trackPoints?: TrackPoint[]): Plan {
  const flatTotalMinutes = params.paceMinPerKm * params.distanceKm;
  const gelIntervalMinutes = (params.carbsPerGelG / params.carbsPerHourG) * 60;

  // Elevation profile & time adjustment
  const elevation =
    trackPoints && trackPoints.length > 1 && params.adjustForElevation
      ? calculateElevationProfile(trackPoints)
      : undefined;

  const elevAdjMin =
    elevation ? elevationTimeAdjustmentMin(elevation.gainM, elevation.lossM) : 0;

  const effectiveTotalMinutes = flatTotalMinutes + elevAdjMin;

  // Build gel schedule based on effective race time
  const gelTimes: number[] = [];
  let t = params.firstGelMinute;
  while (t < effectiveTotalMinutes - 5) {
    gelTimes.push(t);
    t += gelIntervalMinutes;
  }

  // Caffeine assignment
  const caffeineFlags = params.useCaffeineGels
    ? assignCaffeine(
        gelTimes,
        effectiveTotalMinutes,
        params.caffeineStrategy,
        params.caffeineGelCount,
        params.caffeineBlackoutMin
      )
    : new Array(gelTimes.length).fill(false);

  // Build gel points
  let cumulativeCaffeine = 0;
  const gels: GelPoint[] = gelTimes.map((timeMin, i) => {
    const distanceKm = (timeMin / effectiveTotalMinutes) * params.distanceKm;
    const isCaffeinated = caffeineFlags[i];
    if (isCaffeinated) cumulativeCaffeine += params.caffeinePerGelMg;

    const gelPoint: GelPoint = {
      index: i + 1,
      timeMin,
      distanceKm,
      carbsG: params.carbsPerGelG,
      isCaffeinated,
      cumulativeCaffeineMg: cumulativeCaffeine,
    };

    if (trackPoints && trackPoints.length > 0) {
      const coords = interpolateAtKm(trackPoints, distanceKm);
      if (coords) {
        gelPoint.lat = coords.lat;
        gelPoint.lon = coords.lon;
      }
    }

    return gelPoint;
  });

  const totalCarbs = gels.length * params.carbsPerGelG;
  const avgCarbsPerHour = effectiveTotalMinutes > 0
    ? (totalCarbs / effectiveTotalMinutes) * 60
    : 0;

  const totalCaffeineMg = params.useCaffeineGels
    ? gels.filter((g) => g.isCaffeinated).length * params.caffeinePerGelMg
    : 0;

  return {
    params,
    totalMinutes: flatTotalMinutes,
    effectiveTotalMinutes,
    gelIntervalMinutes,
    gels,
    totalCarbs,
    avgCarbsPerHour,
    elevation,
    totalCaffeineMg,
  };
}
