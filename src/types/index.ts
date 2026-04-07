export interface TrackPoint {
  lat: number;
  lon: number;
  ele: number;
  cumulativeDistM: number;
}

export interface GelPoint {
  index: number;
  timeMin: number;
  distanceKm: number;
  lat?: number;
  lon?: number;
  carbsG: number;
  isCaffeinated: boolean;
  cumulativeCaffeineMg: number;
}

export type CaffeineStrategy = 'alternating' | 'finalPush';

export interface NutritionParams {
  paceMinPerKm: number;
  distanceKm: number;
  carbsPerHourG: number;
  carbsPerGelG: number;
  firstGelMinute: number;
  absorptionMinutes: number;
  // Elevation
  adjustForElevation: boolean;
  // Caffeine
  useCaffeineGels: boolean;
  caffeinePerGelMg: number;
  caffeineStrategy: CaffeineStrategy;
  caffeineGelCount: number;
  caffeineBlackoutMin: number;
  // Gel selection (UI convenience — fills the numeric fields above)
  selectedGelId: string | null;
  selectedCafGelId: string | null;
}

export interface ElevationProfile {
  gainM: number;
  lossM: number;
}

export interface Plan {
  params: NutritionParams;
  totalMinutes: number;
  effectiveTotalMinutes: number;
  gelIntervalMinutes: number;
  gels: GelPoint[];
  totalCarbs: number;
  avgCarbsPerHour: number;
  elevation?: ElevationProfile;
  totalCaffeineMg: number;
}

export interface GelEntry {
  id: string;
  brand: string;
  name: string;
  carbsG: number;
  caffeineMg: number;
  sodiumMg: number;   // mg sodium per serving; 0 if not listed
  servingG: number;
  type: string;
  notes: string;
}

// ─── Hydration ────────────────────────────────────────────────────────────────

export type WeightUnit      = 'kg' | 'lbs';
export type TempUnit        = 'C' | 'F';
export type PaceIntensity   = 'easy' | 'moderate' | 'hard';
export type ElectrolyteSource = 'none' | 'salt-tabs' | 'drink' | 'both';

export interface HydrationParams {
  weightKg: number;
  weightUnit: WeightUnit;
  tempC: number;
  tempUnit: TempUnit;
  intensity: PaceIntensity;
  electrolyteSource: ElectrolyteSource;
  aidStations: number | null;   // null → auto: ceil(distanceKm / 5)
  sodiumPerGelMgOverride: number | null; // null → use gel's sodiumMg
}

export interface HydrationPlan {
  sweatRateMlPerHour: number;
  totalFluidMl: number;
  aidStationCount: number;
  fluidPerAidStationMl: number;
  sodiumMgPerHour: number;
  totalSodiumMg: number;
  sodiumFromGelsMg: number;
  netSodiumMg: number;
  gelHasElectrolytes: boolean;
  warnings: string[];
}
