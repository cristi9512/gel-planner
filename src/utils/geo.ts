import type { TrackPoint, ElevationProfile } from '../types';

export function haversineM(p1: { lat: number; lon: number }, p2: { lat: number; lon: number }): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(p2.lat - p1.lat);
  const dLon = toRad(p2.lon - p1.lon);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(p1.lat)) * Math.cos(toRad(p2.lat)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function buildTrackPoints(rawPoints: { lat: number; lon: number; ele: number }[]): TrackPoint[] {
  let cumDist = 0;
  return rawPoints.map((p, i) => {
    if (i > 0) cumDist += haversineM(rawPoints[i - 1], p);
    return { ...p, cumulativeDistM: cumDist };
  });
}

export function interpolateAtKm(
  points: TrackPoint[],
  targetKm: number
): { lat: number; lon: number } | null {
  if (!points.length) return null;
  const targetM = targetKm * 1000;
  if (targetM <= 0) return { lat: points[0].lat, lon: points[0].lon };

  for (let i = 1; i < points.length; i++) {
    if (points[i].cumulativeDistM >= targetM) {
      const segLen = points[i].cumulativeDistM - points[i - 1].cumulativeDistM;
      const frac = segLen === 0 ? 0 : (targetM - points[i - 1].cumulativeDistM) / segLen;
      return {
        lat: points[i - 1].lat + frac * (points[i].lat - points[i - 1].lat),
        lon: points[i - 1].lon + frac * (points[i].lon - points[i - 1].lon),
      };
    }
  }

  return { lat: points[points.length - 1].lat, lon: points[points.length - 1].lon };
}

/**
 * Calculates total elevation gain and loss from a GPX track.
 * Small noise is filtered by a 5m threshold to avoid GPS jitter inflating the numbers.
 */
export function calculateElevationProfile(points: TrackPoint[]): ElevationProfile {
  const NOISE_THRESHOLD_M = 5;
  let gainM = 0;
  let lossM = 0;

  for (let i = 1; i < points.length; i++) {
    const diff = points[i].ele - points[i - 1].ele;
    if (diff > NOISE_THRESHOLD_M) gainM += diff;
    else if (diff < -NOISE_THRESHOLD_M) lossM += Math.abs(diff);
  }

  return { gainM, lossM };
}
