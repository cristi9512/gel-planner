/**
 * Print-specific style objects for race card components.
 * These use mm / pt units intentionally — Tailwind does not support physical
 * print units, so inline CSSProperties are the correct approach here.
 */
import type { CSSProperties } from 'react';

export type StyleMap = Record<string, CSSProperties>;

// ─── Shared tokens ────────────────────────────────────────────────────────────

const COLOR_DARK    = '#0c0e11';
const COLOR_VOLT    = '#cffc00';
const COLOR_PLASMA  = '#0891b2';
const COLOR_TEXT    = '#0a0a0a';
const COLOR_MUTED   = '#6b7280';
const COLOR_DIM     = '#9ca3af';
const COLOR_BORDER  = '#e5e7eb';
const COLOR_SUBTLE  = '#d1d5db';
const COLOR_SURFACE = '#f8fafc';

// ─── Half-A4 card styles ──────────────────────────────────────────────────────

export const halfA4: StyleMap = {
  card: {
    width: '148mm',
    minHeight: '200mm',
    fontFamily: '"Inter", "Helvetica Neue", Arial, sans-serif',
    fontSize: '8pt',
    color: COLOR_TEXT,
    background: '#ffffff',
    boxSizing: 'border-box',
    pageBreakInside: 'avoid',
  },
  header: {
    background: COLOR_DARK,
    color: COLOR_VOLT,
    padding: '4mm 6mm',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: '"Lexend", "Arial Black", sans-serif',
    fontWeight: 900,
    fontSize: '10pt',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: COLOR_VOLT,
    margin: 0,
  },
  headerSub: {
    fontSize: '6.5pt',
    color: COLOR_DIM,
    margin: 0,
    fontFamily: '"Inter", Arial, sans-serif',
  },
  body: {
    padding: '4mm 6mm',
  },
  section: {
    marginBottom: '3mm',
  },
  label: {
    fontSize: '5.5pt',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
    color: COLOR_MUTED,
    marginBottom: '0.5mm',
  },
  value: {
    fontSize: '9pt',
    fontWeight: 700,
    color: COLOR_TEXT,
    lineHeight: 1.2,
  },
  row2col: {
    display: 'flex',
    gap: '4mm',
    marginBottom: '3mm',
  },
  col: {
    flex: 1,
  },
  divider: {
    borderTop: `0.3mm solid ${COLOR_BORDER}`,
    margin: '3mm 0',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '7.5pt',
  },
  th: {
    borderBottom: `0.3mm solid ${COLOR_SUBTLE}`,
    padding: '1mm 1.5mm',
    textAlign: 'left',
    fontWeight: 700,
    fontSize: '5.5pt',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: COLOR_MUTED,
  },
  thRight: { textAlign: 'right' },
  td: {
    padding: '1.2mm 1.5mm',
    borderBottom: '0.2mm solid #f3f4f6',
    verticalAlign: 'middle',
  },
  tdRight: { textAlign: 'right' },
  badge: {
    display: 'inline-block',
    background: COLOR_DARK,
    color: COLOR_VOLT,
    borderRadius: '10mm',
    padding: '0.3mm 1.5mm',
    fontSize: '6pt',
    fontWeight: 700,
    minWidth: '5mm',
    textAlign: 'center',
  },
  cafBadge: {
    display: 'inline-block',
    background: '#00e3fd22',
    color: COLOR_PLASMA,
    borderRadius: '10mm',
    padding: '0.3mm 1.5mm',
    fontSize: '6pt',
    fontWeight: 700,
    marginLeft: '1mm',
  },
  note: {
    background: COLOR_SURFACE,
    border: `0.3mm solid #e2e8f0`,
    borderLeft: `1mm solid ${COLOR_VOLT}`,
    padding: '2mm 3mm',
    fontSize: '7pt',
    color: '#374151',
    marginBottom: '2mm',
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    borderTop: `0.3mm solid ${COLOR_BORDER}`,
    paddingTop: '2mm',
    marginTop: '2mm',
    fontSize: '6pt',
    color: COLOR_DIM,
  },
};

// Convenience overrides used inline
export const halfA4Overrides = {
  finishTime: { fontSize: '14pt', color: COLOR_DARK } as CSSProperties,
  totalGels:  { fontSize: '14pt', color: COLOR_DARK } as CSSProperties,
  gelValue:   { fontSize: '8pt' } as CSSProperties,
  cafGelValue: { fontSize: '8pt', color: COLOR_PLASMA } as CSSProperties,
  headerName: { color: '#ffffff', fontWeight: 700, fontSize: '8pt' } as CSSProperties,
  cafRowBadge: { background: COLOR_PLASMA, color: '#fff' } as CSSProperties,
};

// ─── Wristband card styles ────────────────────────────────────────────────────

export const wristband: StyleMap = {
  card: {
    width: '200mm',
    fontFamily: '"Inter", "Helvetica Neue", Arial, sans-serif',
    fontSize: '7pt',
    color: COLOR_TEXT,
    background: '#ffffff',
    border: `0.5mm solid ${COLOR_DARK}`,
    borderRadius: '3mm',
    overflow: 'hidden',
    boxSizing: 'border-box',
    pageBreakInside: 'avoid',
  },
  header: {
    background: COLOR_DARK,
    color: COLOR_VOLT,
    padding: '1.5mm 4mm',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '3mm',
  },
  body: {
    padding: '2mm 4mm',
    display: 'flex',
    gap: '4mm',
    alignItems: 'flex-start',
  },
  gelRow: {
    flex: 1,
    display: 'flex',
    flexWrap: 'wrap',
    gap: '1.5mm',
  },
  gelChip: {
    background: '#f3f4f6',
    border: `0.2mm solid ${COLOR_SUBTLE}`,
    borderRadius: '2mm',
    padding: '0.8mm 1.5mm',
    fontSize: '6.5pt',
    lineHeight: 1.2,
    whiteSpace: 'nowrap',
  },
  cafChip: {
    background: '#e0f2fe',
    border: '0.2mm solid #7dd3fc',
    borderRadius: '2mm',
    padding: '0.8mm 1.5mm',
    fontSize: '6.5pt',
    lineHeight: 1.2,
    whiteSpace: 'nowrap',
    color: '#0369a1',
  },
  aside: {
    borderLeft: `0.3mm solid ${COLOR_BORDER}`,
    paddingLeft: '3mm',
    fontSize: '6.5pt',
    color: '#374151',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
};
