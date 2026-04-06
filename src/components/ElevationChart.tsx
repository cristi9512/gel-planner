import { useMemo } from 'react';
import type { TrackPoint, GelPoint } from '../types';
import { formatTime } from '../utils/calculations';

interface Props {
  trackPoints: TrackPoint[];
  gels: GelPoint[];
}

const W = 800;
const H = 160;
const PAD = { top: 44, right: 24, bottom: 28, left: 44 };
const PLOT_W = W - PAD.left - PAD.right;
const PLOT_H = H - PAD.top - PAD.bottom;

function sample(points: TrackPoint[], max: number): TrackPoint[] {
  if (points.length <= max) return points;
  const step = Math.floor(points.length / max);
  const result: TrackPoint[] = [];
  for (let i = 0; i < points.length; i += step) result.push(points[i]);
  if (result[result.length - 1] !== points[points.length - 1])
    result.push(points[points.length - 1]);
  return result;
}

export function ElevationChart({ trackPoints, gels }: Props) {
  const { pathD, areaD, minEle, maxEle, totalDist, sampled, eleRange } = useMemo(() => {
    const s = sample(trackPoints, 400);
    const eles = s.map((p) => p.ele);
    const minE = Math.min(...eles);
    const maxE = Math.max(...eles);
    const eRange = maxE - minE || 1;
    const tDist = s[s.length - 1].cumulativeDistM;

    const toX = (m: number) => PAD.left + (m / tDist) * PLOT_W;
    const toY = (e: number) => PAD.top + PLOT_H - ((e - minE) / eRange) * PLOT_H;

    const coords = s.map((p) => `${toX(p.cumulativeDistM)},${toY(p.ele)}`).join(' ');
    const firstX = toX(0);
    const lastX = toX(tDist);
    const baseY = PAD.top + PLOT_H;

    return {
      sampled: s,
      pathD: `M ${coords.replace(/ /g, ' L ')}`,
      areaD: `M ${firstX},${baseY} L ${coords.replace(/ /g, ' L ')} L ${lastX},${baseY} Z`,
      minEle: minE,
      maxEle: maxE,
      eleRange: eRange,
      totalDist: tDist,
    };
  }, [trackPoints]);

  const toX = (m: number) => PAD.left + (m / totalDist) * PLOT_W;
  const toY = (e: number) => PAD.top + PLOT_H - ((e - minEle) / eleRange) * PLOT_H;

  // Elevation at a given distance via linear interp on sampled points
  const eleAtDist = (targetM: number): number => {
    for (let i = 1; i < sampled.length; i++) {
      if (sampled[i].cumulativeDistM >= targetM) {
        const seg = sampled[i].cumulativeDistM - sampled[i - 1].cumulativeDistM;
        const frac = seg === 0 ? 0 : (targetM - sampled[i - 1].cumulativeDistM) / seg;
        return sampled[i - 1].ele + frac * (sampled[i].ele - sampled[i - 1].ele);
      }
    }
    return sampled[sampled.length - 1].ele;
  };

  // Km tick marks
  const kmTicks: number[] = [];
  const totalKm = totalDist / 1000;
  const tickStep = totalKm <= 15 ? 5 : totalKm <= 30 ? 10 : totalKm <= 60 ? 15 : 20;
  for (let km = 0; km <= totalKm; km += tickStep) kmTicks.push(km);

  const geosWithCoords = gels.filter((g) => g.lat !== undefined);

  return (
    <div className="bg-surface-low rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-ink-muted text-[10px] font-label uppercase tracking-widest">Elevation & Fuelling Strategy</p>
        </div>
        <div className="flex items-center gap-4 text-[10px] font-label text-ink-muted">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-volt"></span> Gel
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-plasma"></span> Caffeine
          </span>
          <span className="ml-2 text-ink-dim">
            ↑ {Math.round(maxEle - minEle)} m range
          </span>
        </div>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        style={{ height: 'auto' }}
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id="eleGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#cffc00" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#cffc00" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#cffc00" stopOpacity="0.6" />
            <stop offset="50%" stopColor="#cffc00" stopOpacity="1" />
            <stop offset="100%" stopColor="#cffc00" stopOpacity="0.6" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[0.25, 0.5, 0.75].map((frac) => (
          <line
            key={frac}
            x1={PAD.left}
            y1={PAD.top + PLOT_H * frac}
            x2={PAD.left + PLOT_W}
            y2={PAD.top + PLOT_H * frac}
            stroke="#23262a"
            strokeWidth="1"
          />
        ))}

        {/* Elevation area fill */}
        <path d={areaD} fill="url(#eleGrad)" />

        {/* Elevation line */}
        <path d={pathD} fill="none" stroke="url(#lineGrad)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />

        {/* Km ticks */}
        {kmTicks.map((km) => {
          const x = toX(km * 1000);
          return (
            <g key={km}>
              <line x1={x} y1={PAD.top + PLOT_H} x2={x} y2={PAD.top + PLOT_H + 4} stroke="#46484b" strokeWidth="1" />
              <text x={x} y={PAD.top + PLOT_H + 14} textAnchor="middle" fill="#6b7280" fontSize="9" fontFamily="Inter, sans-serif">
                {km === 0 ? 'START' : km >= totalKm - 0.5 ? 'FINISH' : `${km}km`}
              </text>
            </g>
          );
        })}
        {/* Finish tick if not already shown */}
        <text x={toX(totalDist)} y={PAD.top + PLOT_H + 14} textAnchor="middle" fill="#6b7280" fontSize="9" fontFamily="Inter, sans-serif">
          FINISH
        </text>

        {/* Elevation axis labels */}
        <text x={PAD.left - 4} y={PAD.top} textAnchor="end" fill="#6b7280" fontSize="8" fontFamily="Inter, sans-serif">{Math.round(maxEle)}m</text>
        <text x={PAD.left - 4} y={PAD.top + PLOT_H} textAnchor="end" fill="#6b7280" fontSize="8" fontFamily="Inter, sans-serif">{Math.round(minEle)}m</text>

        {/* Gel markers */}
        {geosWithCoords.map((gel, i) => {
          const distM = gel.distanceKm * 1000;
          const x = toX(distM);
          const ele = eleAtDist(distM);
          const y = toY(ele);
          const color = gel.isCaffeinated ? '#00e3fd' : '#cffc00';
          const textColor = '#000';
          // Alternate labels above/below line
          const above = i % 2 === 0;
          const calloutY = above ? y - 26 : y + 18;

          return (
            <g key={gel.index}>
              {/* Vertical dashed line from chart line to label */}
              <line
                x1={x} y1={above ? y - 6 : y + 6}
                x2={x} y2={above ? calloutY + 10 : calloutY - 10}
                stroke={color} strokeWidth="1" strokeDasharray="2 2" opacity="0.6"
              />
              {/* Dot on line */}
              <circle cx={x} cy={y} r="4" fill={color} stroke="#0c0e11" strokeWidth="1.5" />
              {/* Label bubble */}
              <g transform={`translate(${x}, ${calloutY})`}>
                <rect x="-22" y="-9" width="44" height="18" rx="9" fill={color} />
                <text textAnchor="middle" y="4" fontSize="8" fill={textColor} fontWeight="800" fontFamily="Lexend, sans-serif">
                  {gel.isCaffeinated ? '☕' : ''}G{gel.index}
                </text>
              </g>
              {/* Time below bubble */}
              <text
                x={x}
                y={above ? calloutY - 12 : calloutY + 22}
                textAnchor="middle"
                fontSize="7.5"
                fill="#9ca3af"
                fontFamily="Inter, sans-serif"
              >
                {formatTime(gel.timeMin)}
              </text>
            </g>
          );
        })}

        {/* Start dot */}
        <circle cx={PAD.left} cy={toY(sampled[0].ele)} r="4" fill="#ffffff" stroke="#0c0e11" strokeWidth="1.5" />
        {/* Finish dot */}
        <circle cx={PAD.left + PLOT_W} cy={toY(sampled[sampled.length - 1].ele)} r="4" fill="#ffffff" stroke="#0c0e11" strokeWidth="1.5" />
      </svg>
    </div>
  );
}
