/**
 * URL hash state encoding / decoding.
 *
 * Format: #plan=BASE64(encodeURIComponent(JSON))
 *
 * encodeURIComponent wraps before btoa so any UTF-8 chars survive the
 * Latin-1 restriction of btoa/atob.
 */

import type { NutritionParams, HydrationParams } from '../types';
import { getGelById } from '../data/gels';

export type Tab = 'gel' | 'hydration';

const HASH_KEY   = 'plan';
const STATE_VER  = 1;

// ─── Defaults (single source of truth — imported by PlannerPage) ──────────────

export const DEFAULT_PARAMS: NutritionParams = {
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

export const DEFAULT_HYDRATION: HydrationParams = {
  weightKg: 70,
  weightUnit: 'kg',
  tempC: 18,
  tempUnit: 'C',
  intensity: 'moderate',
  electrolyteSource: 'none',
  aidStations: null,
  sodiumPerGelMgOverride: null,
};

// ─── Wire types ───────────────────────────────────────────────────────────────

interface SerializedState {
  v: number;
  p: NutritionParams;
  h: HydrationParams;
  t: Tab;
}

export interface DecodedState {
  params: NutritionParams;
  hydration: HydrationParams;
  tab: Tab;
  hadUnknownGels: boolean;
}

// ─── Encode ───────────────────────────────────────────────────────────────────

export function encodeState(
  params: NutritionParams,
  hydration: HydrationParams,
  tab: Tab,
): string {
  const payload: SerializedState = { v: STATE_VER, p: params, h: hydration, t: tab };
  return btoa(encodeURIComponent(JSON.stringify(payload)));
}

// ─── Decode ───────────────────────────────────────────────────────────────────

export function decodeState(raw: string): DecodedState | null {
  try {
    const json   = decodeURIComponent(atob(raw));
    const state  = JSON.parse(json) as Partial<SerializedState>;

    if (!state.p || !state.h) return null;

    // Merge with current defaults so new fields added in future versions are
    // filled in rather than being undefined.
    const params: NutritionParams = { ...DEFAULT_PARAMS, ...state.p };
    const hydration: HydrationParams = { ...DEFAULT_HYDRATION, ...state.h };

    let hadUnknownGels = false;

    if (params.selectedGelId && !getGelById(params.selectedGelId)) {
      params.selectedGelId = null;
      hadUnknownGels = true;
    }
    if (params.selectedCafGelId && !getGelById(params.selectedCafGelId)) {
      params.selectedCafGelId = null;
      hadUnknownGels = true;
    }

    return {
      params,
      hydration,
      tab: state.t ?? 'gel',
      hadUnknownGels,
    };
  } catch {
    return null;
  }
}

// ─── Hash I/O ─────────────────────────────────────────────────────────────────

export function readHashParam(): string | null {
  const { hash } = window.location;
  const prefix = `#${HASH_KEY}=`;
  if (!hash.startsWith(prefix)) return null;
  return hash.slice(prefix.length);
}

export function writeHashParam(encoded: string): void {
  window.history.replaceState(null, '', `#${HASH_KEY}=${encoded}`);
}

export function clearHashParam(): void {
  window.history.replaceState(
    null, '',
    window.location.pathname + window.location.search,
  );
}

// ─── Default check ────────────────────────────────────────────────────────────

export function isDefaultState(
  params: NutritionParams,
  hydration: HydrationParams,
): boolean {
  return (
    JSON.stringify(params)    === JSON.stringify(DEFAULT_PARAMS) &&
    JSON.stringify(hydration) === JSON.stringify(DEFAULT_HYDRATION)
  );
}

// ─── Convenience: read + decode once on app boot ──────────────────────────────

export interface BootState {
  params: NutritionParams;
  hydration: HydrationParams;
  tab: Tab;
  hadUnknownGels: boolean;
  hasHash: boolean;
}

export function readBootState(): BootState {
  const raw = readHashParam();
  if (!raw) {
    return {
      params: DEFAULT_PARAMS,
      hydration: DEFAULT_HYDRATION,
      tab: 'gel',
      hadUnknownGels: false,
      hasHash: false,
    };
  }

  const decoded = decodeState(raw);
  if (!decoded) {
    // Malformed hash — fall back silently
    return {
      params: DEFAULT_PARAMS,
      hydration: DEFAULT_HYDRATION,
      tab: 'gel',
      hadUnknownGels: false,
      hasHash: false,
    };
  }

  return { ...decoded, hasHash: true };
}
