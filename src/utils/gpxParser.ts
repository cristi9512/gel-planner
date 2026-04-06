import { buildTrackPoints, calculateElevationProfile } from './geo';
import type { TrackPoint, ElevationProfile } from '../types';

export interface ParsedGPX {
  trackPoints: TrackPoint[];
  totalDistanceKm: number;
  fileName: string;
  elevationProfile?: ElevationProfile;
}

export function parseGPXFile(file: File): Promise<ParsedGPX> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parser = new DOMParser();
        const xml = parser.parseFromString(text, 'text/xml');

        const parseError = xml.querySelector('parsererror');
        if (parseError) {
          reject(new Error('The GPX file is not valid XML.'));
          return;
        }

        const trkpts = Array.from(xml.querySelectorAll('trkpt'));
        if (trkpts.length === 0) {
          reject(new Error('No track points found in this GPX file (missing <trkpt> elements).'));
          return;
        }

        const raw = trkpts.map((pt) => ({
          lat: parseFloat(pt.getAttribute('lat') || '0'),
          lon: parseFloat(pt.getAttribute('lon') || '0'),
          ele: parseFloat(pt.querySelector('ele')?.textContent || '0'),
        }));

        const trackPoints = buildTrackPoints(raw);
        const totalDistanceKm = trackPoints[trackPoints.length - 1].cumulativeDistM / 1000;

        // Check if elevation data is meaningful (not all zeros)
        const hasElevation = raw.some((p) => p.ele !== 0);
        const elevationProfile = hasElevation
          ? calculateElevationProfile(trackPoints)
          : undefined;

        resolve({ trackPoints, totalDistanceKm, fileName: file.name, elevationProfile });
      } catch {
        reject(new Error('Failed to parse the GPX file.'));
      }
    };
    reader.onerror = () => reject(new Error('Could not read the file.'));
    reader.readAsText(file);
  });
}
