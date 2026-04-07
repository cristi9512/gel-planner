import type { HydrationParams, HydrationPlan } from '../types';

/**
 * Sweat rate model
 *   base 500 ml/hr
 *   + 100 ml per 5 °C above 15 °C
 *   + intensity bonus (Easy 0 / Moderate +150 / Hard +300)
 *
 * Sodium targets (mg/hr)
 *   Easy 500 / Moderate 750 / Hard 1000
 */

const INTENSITY_SWEAT_BONUS: Record<string, number> = {
  easy: 0,
  moderate: 150,
  hard: 300,
};

const INTENSITY_SODIUM_PER_HOUR: Record<string, number> = {
  easy: 500,
  moderate: 750,
  hard: 1000,
};

export function calculateHydration(
  params: HydrationParams,
  raceMinutes: number,
  distanceKm: number,
  gelCount: number,
  sodiumPerGelMg: number,
  gelHasElectrolytes: boolean,
): HydrationPlan {
  const raceHours = raceMinutes / 60;

  // ── Fluid ──────────────────────────────────────────────────────────────────
  const tempAdj = Math.max(0, (params.tempC - 15) / 5) * 100;
  const sweatRateMlPerHour =
    Math.round(500 + tempAdj + INTENSITY_SWEAT_BONUS[params.intensity]);

  const totalFluidMl = Math.round(sweatRateMlPerHour * raceHours);

  const aidStationCount =
    params.aidStations ?? Math.max(1, Math.ceil(distanceKm / 5));

  const fluidPerAidStationMl = Math.round(totalFluidMl / aidStationCount);

  // ── Sodium ─────────────────────────────────────────────────────────────────
  const sodiumMgPerHour = INTENSITY_SODIUM_PER_HOUR[params.intensity];
  const totalSodiumMg   = Math.round(sodiumMgPerHour * raceHours);
  const sodiumFromGelsMg = gelCount * sodiumPerGelMg;
  const netSodiumMg     = Math.max(0, totalSodiumMg - sodiumFromGelsMg);

  // ── Warnings ───────────────────────────────────────────────────────────────
  const warnings: string[] = [];

  if (params.tempC >= 35) {
    warnings.push('Extreme heat — consider reducing target pace and adding an electrolyte drink at every stop.');
  } else if (params.tempC >= 28 && raceHours >= 2) {
    warnings.push('Hot conditions over a long race. Prioritise drinking at every aid station.');
  }

  if (fluidPerAidStationMl > 500) {
    warnings.push(`${fluidPerAidStationMl} ml per aid station is a lot — consider carrying a bottle between stops.`);
  }

  if (totalFluidMl > 3000) {
    warnings.push('Very high total fluid need. Confirm aid station locations before race day.');
  }

  if (params.electrolyteSource === 'none' && netSodiumMg > 800) {
    warnings.push('High sodium deficit with no electrolyte source selected. Consider salt tabs or an electrolyte drink.');
  }

  return {
    sweatRateMlPerHour,
    totalFluidMl,
    aidStationCount,
    fluidPerAidStationMl,
    sodiumMgPerHour,
    totalSodiumMg,
    sodiumFromGelsMg,
    netSodiumMg,
    gelHasElectrolytes,
    warnings,
  };
}

/** Convert lbs → kg (for display/calc normalisation) */
export function lbsToKg(lbs: number): number {
  return Math.round(lbs / 2.205 * 10) / 10;
}

/** Convert °F → °C */
export function fToC(f: number): number {
  return Math.round((f - 32) * 5 / 9 * 10) / 10;
}
