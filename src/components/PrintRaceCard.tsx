import { createPortal } from 'react-dom';
import { useEffect, useRef, useState } from 'react';
import type { Plan } from '../types';
import { getGelById } from '../data/gels';
import { formatTime } from '../utils/calculations';
import { halfA4, halfA4Overrides as ov, wristband } from '../styles/printCard';

export type PrintFormat = 'half-a4' | 'wristband';

interface Props {
  plan: Plan;
  onClose: () => void;
}

interface CardInnerProps {
  plan: Plan;
  raceName: string;
  runnerName: string;
  today: string;
}

// ─── Shared helpers ────────────────────────────────────────────────────────────

function gelLabel(plan: Plan): string {
  const gel = plan.params.selectedGelId ? getGelById(plan.params.selectedGelId) : null;
  return gel ? `${gel.brand} — ${gel.name}` : 'Custom Gel';
}

function cafGelLabel(plan: Plan): string | null {
  const g = plan.params.selectedCafGelId ? getGelById(plan.params.selectedCafGelId) : null;
  return g ? `${g.brand} — ${g.name}` : null;
}

// ─── Half-A4 card ─────────────────────────────────────────────────────────────

function HalfA4Card({ plan, raceName, runnerName, today }: CardInnerProps) {
  const gName = gelLabel(plan);
  const cafName = cafGelLabel(plan);
  const cafGelIndices = plan.gels.filter((g) => g.isCaffeinated).map((g) => g.index);
  const raceTitle = raceName || `${plan.params.distanceKm} km Race`;

  return (
    <div style={halfA4.card}>
      {/* Header */}
      <div style={halfA4.header}>
        <div>
          <p style={halfA4.headerTitle}>⚡ Gel Race Card</p>
          <p style={halfA4.headerSub}>gelplanner · print edition</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ ...halfA4.headerSub, ...ov.headerName }}>{raceTitle}</p>
          <p style={halfA4.headerSub}>{today}</p>
        </div>
      </div>

      <div style={halfA4.body}>
        {/* Race overview */}
        <div style={halfA4.row2col}>
          <div style={halfA4.col}>
            <p style={halfA4.label}>Estimated finish</p>
            <p style={{ ...halfA4.value, ...ov.finishTime }}>
              {formatTime(plan.effectiveTotalMinutes)}
            </p>
            {plan.effectiveTotalMinutes !== plan.totalMinutes && (
              <p style={{ fontSize: '6pt', color: '#9ca3af' }}>
                (+{Math.round(plan.effectiveTotalMinutes - plan.totalMinutes)} min elevation adj.)
              </p>
            )}
          </div>
          <div style={halfA4.col}>
            <p style={halfA4.label}>Pace</p>
            <p style={halfA4.value}>{plan.params.paceMinPerKm} min/km</p>
            <p style={halfA4.label}>Distance</p>
            <p style={halfA4.value}>{plan.params.distanceKm} km</p>
          </div>
          <div style={halfA4.col}>
            <p style={halfA4.label}>Total gels</p>
            <p style={{ ...halfA4.value, ...ov.totalGels }}>{plan.gels.length}</p>
            <p style={{ fontSize: '6pt', color: '#6b7280' }}>
              {plan.totalCarbs} g · {Math.round(plan.avgCarbsPerHour)} g/h
            </p>
          </div>
        </div>

        <div style={halfA4.divider} />

        {/* Gel info */}
        <div style={halfA4.section}>
          <div style={halfA4.row2col}>
            <div style={halfA4.col}>
              <p style={halfA4.label}>Gel</p>
              <p style={{ ...halfA4.value, ...ov.gelValue }}>{gName}</p>
              <p style={{ fontSize: '6.5pt', color: '#6b7280' }}>
                {plan.params.carbsPerGelG} g carbs per gel
              </p>
            </div>
            {cafName && cafGelIndices.length > 0 && (
              <div style={halfA4.col}>
                <p style={halfA4.label}>Caffeinated variant</p>
                <p style={{ ...halfA4.value, ...ov.cafGelValue }}>{cafName}</p>
                <p style={{ fontSize: '6.5pt', color: '#6b7280' }}>
                  {plan.params.caffeinePerGelMg} mg · gels: {cafGelIndices.join(', ')}
                </p>
              </div>
            )}
          </div>
        </div>

        <div style={halfA4.divider} />

        {/* Schedule table */}
        <p style={{ ...halfA4.label, marginBottom: '1.5mm' }}>Feeding Schedule</p>
        <table style={halfA4.table}>
          <thead>
            <tr>
              <th style={halfA4.th}>#</th>
              <th style={halfA4.th}>Time</th>
              <th style={{ ...halfA4.th, ...halfA4.thRight }}>km</th>
              <th style={{ ...halfA4.th, ...halfA4.thRight }}>Carbs</th>
              <th style={{ ...halfA4.th, ...halfA4.thRight }}>∑ Carbs</th>
            </tr>
          </thead>
          <tbody>
            {plan.gels.map((gel) => (
              <tr key={gel.index}>
                <td style={halfA4.td}>
                  <span style={gel.isCaffeinated ? { ...halfA4.badge, ...ov.cafRowBadge } : halfA4.badge}>
                    {gel.isCaffeinated ? '☕' : gel.index}
                  </span>
                </td>
                <td style={halfA4.td}><strong>{formatTime(gel.timeMin)}</strong></td>
                <td style={{ ...halfA4.td, ...halfA4.tdRight }}>{gel.distanceKm.toFixed(1)}</td>
                <td style={{ ...halfA4.td, ...halfA4.tdRight }}>{gel.carbsG} g</td>
                <td style={{ ...halfA4.td, ...halfA4.tdRight, fontWeight: 600 }}>
                  {gel.carbsG * gel.index} g
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={halfA4.divider} />

        {/* Notes */}
        <div style={halfA4.note}>
          💧 <strong>Take each gel with ~200 ml water</strong> to aid absorption and avoid GI distress.
          {cafGelIndices.length > 0 && (
            <span> ☕ Caffeinated gels: #{cafGelIndices.join(', #')}</span>
          )}
        </div>

        {/* Footer */}
        <div style={halfA4.footer}>
          <span>{runnerName ? `Runner: ${runnerName}` : 'gelplanner.app'}</span>
          <span>gelplanner.app · {today}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Wristband card ───────────────────────────────────────────────────────────

function WristbandCard({ plan, raceName, runnerName }: CardInnerProps) {
  const gName = gelLabel(plan);
  const raceTitle = raceName || `${plan.params.distanceKm} km`;

  return (
    <div style={wristband.card}>
      <div style={wristband.header}>
        <span style={{ fontWeight: 900, letterSpacing: '0.08em', fontSize: '7.5pt' }}>
          ⚡ GEL PLAN
        </span>
        <span style={{ color: '#fff', fontSize: '7pt' }}>
          {raceTitle} · {plan.gels.length} gels · {plan.totalCarbs} g carbs ·{' '}
          {Math.round(plan.avgCarbsPerHour)} g/h
        </span>
        <span style={{ color: '#9ca3af', fontSize: '6pt' }}>
          {formatTime(plan.effectiveTotalMinutes)}
        </span>
      </div>

      <div style={wristband.body}>
        <div style={wristband.gelRow}>
          {plan.gels.map((gel) => (
            <div key={gel.index} style={gel.isCaffeinated ? wristband.cafChip : wristband.gelChip}>
              <strong>G{gel.index}</strong> {formatTime(gel.timeMin)} · km {gel.distanceKm.toFixed(1)}
              {gel.isCaffeinated && ' ☕'}
            </div>
          ))}
        </div>

        <div style={wristband.aside}>
          <div>{gName}</div>
          <div>{plan.params.carbsPerGelG} g carbs/gel</div>
          <div style={{ color: '#6b7280', marginTop: '0.5mm' }}>💧 with water</div>
          {runnerName && <div style={{ marginTop: '0.5mm', fontWeight: 600 }}>{runnerName}</div>}
        </div>
      </div>
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────

export function PrintRaceCard({ plan, onClose }: Props) {
  const [raceName, setRaceName]     = useState('');
  const [runnerName, setRunnerName] = useState('');
  const [format, setFormat]         = useState<PrintFormat>('half-a4');

  const portalContainerRef = useRef<HTMLDivElement | null>(null);
  const [portalReady, setPortalReady] = useState(false);

  const today = new Date().toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  });

  // Mount a portal root outside #root so @media print targets it independently
  useEffect(() => {
    const el = document.createElement('div');
    el.className = 'gel-print-root';
    document.body.appendChild(el);
    portalContainerRef.current = el;
    setPortalReady(true);
    return () => { document.body.removeChild(el); };
  }, []);

  // Inject @page size rule per format
  useEffect(() => {
    const style = document.createElement('style');
    style.id = 'gel-print-page';
    style.textContent =
      format === 'wristband'
        ? '@media print { @page { size: 210mm 70mm landscape; margin: 5mm; } }'
        : '@media print { @page { size: A5 portrait; margin: 8mm; } }';
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, [format]);

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const cardProps: CardInnerProps = { plan, raceName, runnerName, today };
  const cardNode = format === 'wristband'
    ? <WristbandCard {...cardProps} />
    : <HalfA4Card {...cardProps} />;

  return (
    <>
      {/* ── Screen modal ── */}
      <div
        className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <div className="bg-surface-low rounded-xl w-full max-w-2xl flex flex-col shadow-2xl max-h-[95vh]">

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-surface-high/50 shrink-0">
            <div>
              <p className="text-[10px] font-label uppercase tracking-widest text-ink-muted">Race Card</p>
              <p className="text-sm font-display font-black text-ink uppercase">🖨 Print Race Card</p>
            </div>
            <button
              onClick={onClose}
              className="text-ink-dim hover:text-volt transition-colors w-8 h-8 flex items-center justify-center rounded-sm hover:bg-surface-high"
            >
              ✕
            </button>
          </div>

          {/* Options */}
          <div className="px-5 py-4 border-b border-surface-high/30 shrink-0 space-y-3">
            <div className="grid grid-cols-2 gap-4">
              {/* Race name */}
              <div>
                <label className="text-[10px] font-label uppercase tracking-widest text-ink-muted block mb-1">
                  Race name <span className="normal-case text-ink-dim">(optional)</span>
                </label>
                <div className="cockpit-input bg-surface-high rounded-sm">
                  <input
                    type="text"
                    value={raceName}
                    onChange={(e) => setRaceName(e.target.value)}
                    placeholder={`${plan.params.distanceKm} km Race`}
                    className="w-full bg-transparent px-3 py-2 text-sm font-label text-ink focus:outline-none placeholder:text-ink-dim"
                  />
                </div>
              </div>

              {/* Runner name */}
              <div>
                <label className="text-[10px] font-label uppercase tracking-widest text-ink-muted block mb-1">
                  Runner name <span className="normal-case text-ink-dim">(optional)</span>
                </label>
                <div className="cockpit-input bg-surface-high rounded-sm">
                  <input
                    type="text"
                    value={runnerName}
                    onChange={(e) => setRunnerName(e.target.value)}
                    placeholder="Your name"
                    className="w-full bg-transparent px-3 py-2 text-sm font-label text-ink focus:outline-none placeholder:text-ink-dim"
                  />
                </div>
              </div>
            </div>

            {/* Format selector */}
            <div>
              <p className="text-[10px] font-label uppercase tracking-widest text-ink-muted mb-1.5">
                Format
              </p>
              <div className="flex gap-2">
                {(['half-a4', 'wristband'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFormat(f)}
                    className={`flex-1 py-2 px-3 rounded-sm text-xs font-label font-semibold transition-colors
                      ${format === f
                        ? 'bg-volt text-surface'
                        : 'bg-surface-high text-ink-muted hover:text-ink'}`}
                  >
                    {f === 'half-a4' ? '📄 Half A4 (pocket card)' : '📏 Wristband strip'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="flex-1 overflow-auto p-5 bg-surface-highest/30">
            <p className="text-[9px] font-label uppercase tracking-widest text-ink-dim text-center mb-3">
              Preview
            </p>
            <div className="flex justify-center">
              <div style={{ transform: 'scale(0.85)', transformOrigin: 'top center' }}>
                {cardNode}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="px-5 py-4 border-t border-surface-high/50 flex items-center justify-between shrink-0">
            <p className="text-[10px] font-label text-ink-dim">
              Tip: use browser's "Save as PDF" for a digital copy
            </p>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-full text-sm font-label font-semibold text-ink-muted hover:text-ink hover:bg-surface-high transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-6 py-2 rounded-full text-sm font-display font-black uppercase tracking-wide text-surface transition-all active:scale-95"
                style={{ background: 'linear-gradient(180deg, #f4ffc8 0%, #cffc00 100%)' }}
              >
                🖨 Print
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Print portal (hidden on screen, revealed on print) ── */}
      {portalReady && portalContainerRef.current &&
        createPortal(
          <div className="gel-print-content">{cardNode}</div>,
          portalContainerRef.current,
        )}
    </>
  );
}
