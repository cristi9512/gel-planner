import { useEffect } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { TrackPoint, GelPoint } from '../types';
import { formatTime } from '../utils/calculations';

delete (L.Icon.Default.prototype as any)._getIconUrl;

function createGelIcon(index: number, caffeinated: boolean) {
  const bg = caffeinated ? '#00e3fd' : '#cffc00';
  const text = caffeinated ? '☕' : String(index);
  return L.divIcon({
    className: '',
    html: `<div class="gel-marker-icon" style="width:26px;height:26px;background:${bg};color:#0c0e11;">${text}</div>`,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
    popupAnchor: [0, -16],
  });
}

function createEndpointIcon(color: string) {
  return L.divIcon({
    className: '',
    html: `<div style="width:10px;height:10px;background:${color};border:2px solid #0c0e11;border-radius:50%;box-shadow:0 0 8px ${color}80;"></div>`,
    iconSize: [10, 10],
    iconAnchor: [5, 5],
  });
}

function FitBounds({ points }: { points: TrackPoint[] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length < 2) return;
    const lats = points.map((p) => p.lat);
    const lons = points.map((p) => p.lon);
    map.fitBounds(
      [[Math.min(...lats), Math.min(...lons)], [Math.max(...lats), Math.max(...lons)]],
      { padding: [20, 20] }
    );
  }, [map, points]);
  return null;
}

interface Props {
  trackPoints: TrackPoint[];
  gels: GelPoint[];
}

export function RouteMap({ trackPoints, gels }: Props) {
  const polyline = trackPoints.map((p) => [p.lat, p.lon] as [number, number]);
  const start = trackPoints[0];
  const end = trackPoints[trackPoints.length - 1];
  const center: [number, number] = start ? [start.lat, start.lon] : [45.9, 25.0];

  return (
    <MapContainer center={center} zoom={13} className="w-full h-full" scrollWheelZoom>
      {/* Dark CartoDB tiles — no API key required */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />
      <FitBounds points={trackPoints} />

      {polyline.length > 1 && (
        <Polyline positions={polyline} color="#cffc00" weight={3} opacity={0.85} />
      )}

      {start && (
        <Marker position={[start.lat, start.lon]} icon={createEndpointIcon('#4ade80')}>
          <Popup className="dark-popup">
            <strong>Start</strong><br />{start.lat.toFixed(5)}, {start.lon.toFixed(5)}
          </Popup>
        </Marker>
      )}
      {end && trackPoints.length > 1 && (
        <Marker position={[end.lat, end.lon]} icon={createEndpointIcon('#f87171')}>
          <Popup>
            <strong>Finish</strong><br />{end.lat.toFixed(5)}, {end.lon.toFixed(5)}
          </Popup>
        </Marker>
      )}

      {gels
        .filter((g) => g.lat !== undefined && g.lon !== undefined)
        .map((gel) => (
          <Marker key={gel.index} position={[gel.lat!, gel.lon!]} icon={createGelIcon(gel.index, gel.isCaffeinated)}>
            <Popup>
              <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12 }}>
                <strong>Gel #{gel.index}{gel.isCaffeinated ? ' ☕' : ''}</strong><br />
                ⏱ {formatTime(gel.timeMin)}<br />
                📍 km {gel.distanceKm.toFixed(1)}<br />
                🍬 {gel.carbsG} g carbs
                {gel.isCaffeinated && <><br />☕ + caffeine</>}
              </div>
            </Popup>
          </Marker>
        ))}
    </MapContainer>
  );
}
