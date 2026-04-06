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
  servingG: number;
  type: string;
  notes: string;
}
