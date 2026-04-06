import { useState } from 'react';
import type { Plan, TrackPoint } from '../types';
import { exportGPX } from '../utils/gpxExporter';

interface Props {
  plan: Plan;
  trackPoints: TrackPoint[];
}

export function ExportButton({ plan, trackPoints }: Props) {
  const [exported, setExported] = useState(false);

  const handleExport = () => {
    exportGPX(plan, trackPoints);
    setExported(true);
    setTimeout(() => setExported(false), 2000);
  };

  const waypointCount = plan.gels.filter((g) => g.lat !== undefined).length;

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        onClick={handleExport}
        className={`flex items-center gap-2.5 rounded-full px-8 py-3 font-display font-black text-sm uppercase tracking-wider transition-all active:scale-95
          ${exported
            ? 'bg-plasma text-surface shadow-[0_0_20px_rgba(0,227,253,0.4)]'
            : 'text-surface'
          }`}
        style={!exported ? { background: 'linear-gradient(180deg, #f4ffc8 0%, #cffc00 100%)', boxShadow: '0 0 20px rgba(207,252,0,0.25)' } : {}}
      >
        {exported ? (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Downloaded!
          </>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            Export GPX
          </>
        )}
      </button>
      <p className="text-[10px] font-label text-ink-dim">
        {waypointCount} waypoints · Garmin · Coros · Suunto · Komoot
      </p>
    </div>
  );
}
