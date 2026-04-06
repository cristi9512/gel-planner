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
  caffeineGelCount: number;       // for 'finalPush': how many caffeinated gels at the end
  caffeineBlackoutMin: number;    // no caffeine within last X minutes of race
}

export interface ElevationProfile {
  gainM: number;
  lossM: number;
}

export interface Plan {
  params: NutritionParams;
  totalMinutes: number;            // flat time estimate
  effectiveTotalMinutes: number;   // elevation-adjusted
  gelIntervalMinutes: number;
  gels: GelPoint[];
  totalCarbs: number;
  avgCarbsPerHour: number;
  elevation?: ElevationProfile;
  totalCaffeineMg: number;
}
