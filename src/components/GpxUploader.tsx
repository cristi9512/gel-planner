import { useCallback, useRef, useState } from 'react';
import { parseGPXFile, type ParsedGPX } from '../utils/gpxParser';

interface Props {
  onGpxLoaded: (data: ParsedGPX) => void;
  onGpxCleared: () => void;
  loadedGpx?: ParsedGPX;
}

export function GpxUploader({ onGpxLoaded, onGpxCleared, loadedGpx }: Props) {
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.gpx')) {
      setError('Only .gpx files are accepted.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const data = await parseGPXFile(file);
      onGpxLoaded(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load file.');
    } finally {
      setLoading(false);
    }
  }, [onGpxLoaded]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = '';
  };

  if (loadedGpx) {
    return (
      <div className="bg-surface-high rounded-sm px-4 py-3 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-volt shrink-0" />
            <span className="text-xs font-label font-semibold text-ink truncate max-w-[200px]">{loadedGpx.fileName}</span>
          </div>
          <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] font-label text-ink-muted">
            <span>{loadedGpx.totalDistanceKm.toFixed(2)} km</span>
            <span>{loadedGpx.trackPoints.length.toLocaleString()} pts</span>
            {loadedGpx.elevationProfile && (
              <>
                <span className="text-volt">↑ {Math.round(loadedGpx.elevationProfile.gainM)} m</span>
                <span className="text-ink-dim">↓ {Math.round(loadedGpx.elevationProfile.lossM)} m</span>
              </>
            )}
          </div>
        </div>
        <button
          onClick={() => { setError(null); onGpxCleared(); }}
          className="text-ink-dim hover:text-volt transition-colors shrink-0 p-1"
          title="Remove GPX"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`rounded-sm border border-dashed cursor-pointer transition-all p-6 text-center
          ${dragging
            ? 'border-volt bg-volt/5 shadow-[0_0_20px_rgba(207,252,0,0.1)]'
            : 'border-surface-highest hover:border-volt/40 hover:bg-surface-high'
          }
          ${loading ? 'opacity-50 pointer-events-none' : ''}`}
      >
        <input ref={inputRef} type="file" accept=".gpx" className="hidden" onChange={handleFileChange} />
        <p className="text-2xl mb-2">{loading ? '⏳' : '📍'}</p>
        <p className="text-xs font-label font-semibold text-ink-muted">
          {loading ? 'Parsing GPX…' : 'Upload GPX file'}
        </p>
        <p className="text-[10px] font-label text-ink-dim mt-1">Drag & drop or click · .gpx only</p>
      </div>
      {error && (
        <div className="mt-2 rounded-sm border-l-2 border-red-500 bg-red-500/10 px-3 py-2 text-[11px] font-label text-red-400">
          {error}
        </div>
      )}
    </div>
  );
}
