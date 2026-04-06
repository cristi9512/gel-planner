import type { Plan, TrackPoint } from '../types';
import { formatTime } from './calculations';

export function exportGPX(plan: Plan, trackPoints: TrackPoint[]): void {
  const wpts = plan.gels
    .filter((g) => g.lat !== undefined && g.lon !== undefined)
    .map(
      (g) => `  <wpt lat="${g.lat!.toFixed(7)}" lon="${g.lon!.toFixed(7)}">
    <name>Gel #${g.index}</name>
    <desc>${formatTime(g.timeMin)} - km ${g.distanceKm.toFixed(1)} - ${g.carbsG}g carbs</desc>
    <sym>Flag, Blue</sym>
    <type>GEL</type>
    <extensions>
      <alert>GEL ${g.index}: ${g.carbsG}g carbs la km ${g.distanceKm.toFixed(1)} (${formatTime(g.timeMin)})</alert>
      <nutrition_type>carbohydrate_gel</nutrition_type>
      <carbs_g>${g.carbsG}</carbs_g>
    </extensions>
  </wpt>`
    )
    .join('\n');

  const trksegs = trackPoints
    .map((p) => `      <trkpt lat="${p.lat.toFixed(7)}" lon="${p.lon.toFixed(7)}"><ele>${p.ele.toFixed(1)}</ele></trkpt>`)
    .join('\n');

  const gpxContent = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Gel Timing Planner" xmlns="http://www.topografix.com/GPX/1/1" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <metadata>
    <name>Plan nutritie - ${plan.gels.length} geluri</name>
    <desc>Target: ${plan.params.carbsPerHourG}g carbs/h | Gel: ${plan.params.carbsPerGelG}g | Pace: ${plan.params.paceMinPerKm}min/km | Distanta: ${plan.params.distanceKm}km</desc>
    <time>${new Date().toISOString()}</time>
  </metadata>
${wpts}
  <trk>
    <name>Traseu original</name>
    <trkseg>
${trksegs}
    </trkseg>
  </trk>
</gpx>`;

  const blob = new Blob([gpxContent], { type: 'application/gpx+xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `plan-nutritie-${plan.gels.length}-geluri.gpx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
