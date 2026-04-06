import { useState, useRef, useEffect, useMemo } from 'react';
import { GEL_DATABASE, GEL_BRANDS, getGelById } from '../data/gels';
import type { GelEntry } from '../types';

interface Props {
  label: string;
  selectedGelId: string | null;
  customCarbsG: number;
  customCaffeineMg?: number;
  showCaffeineInPill?: boolean;
  /** Filter to only caffeinated gels */
  caffeineOnly?: boolean;
  onSelect: (gelId: string | null) => void;
  onCustomChange: (carbsG: number, caffeineMg?: number) => void;
}

function CaffeineBadge({ mg }: { mg: number }) {
  return (
    <span className="text-[9px] font-label font-bold px-1.5 py-0.5 rounded bg-plasma/20 text-plasma">
      ☕ {mg} mg
    </span>
  );
}

function CarbsBadge({ g }: { g: number }) {
  return (
    <span className="text-[9px] font-label font-bold px-1.5 py-0.5 rounded bg-volt/15 text-volt">
      {g} g
    </span>
  );
}

export function GelPicker({
  label,
  selectedGelId,
  customCarbsG,
  customCaffeineMg,
  showCaffeineInPill = false,
  caffeineOnly = false,
  onSelect,
  onCustomChange,
}: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [activeBrand, setActiveBrand] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const selectedGel = selectedGelId ? getGelById(selectedGelId) : null;
  const isCustom = selectedGelId === null;

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return GEL_DATABASE.filter((g) => {
      if (caffeineOnly && g.caffeineMg === 0) return false;
      if (activeBrand && g.brand !== activeBrand) return false;
      if (q && !g.name.toLowerCase().includes(q) && !g.brand.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [search, activeBrand, caffeineOnly]);

  // Group filtered gels by brand
  const grouped = useMemo(() => {
    const map = new Map<string, GelEntry[]>();
    for (const gel of filtered) {
      const arr = map.get(gel.brand) ?? [];
      arr.push(gel);
      map.set(gel.brand, arr);
    }
    return map;
  }, [filtered]);

  const availableBrands = useMemo(() => {
    if (caffeineOnly) return GEL_BRANDS.filter((b) => GEL_DATABASE.some((g) => g.brand === b && g.caffeineMg > 0));
    return GEL_BRANDS;
  }, [caffeineOnly]);

  useEffect(() => {
    if (open) setTimeout(() => searchRef.current?.focus(), 50);
  }, [open]);

  const handleSelect = (gel: GelEntry | null) => {
    if (gel) {
      // Only call onSelect — ParametersPanel's handleGelSelect already syncs carbsG + caffeineMg
      onSelect(gel.id);
    } else {
      onSelect(null);
    }
    setOpen(false);
    setSearch('');
    setActiveBrand(null);
  };

  return (
    <>
      {/* Trigger pill */}
      <button
        onClick={() => setOpen(true)}
        className="w-full cockpit-input bg-surface-high rounded-sm flex items-center gap-2 px-3 py-2 text-left hover:bg-surface-highest transition-colors"
      >
        <span className="flex-1 min-w-0">
          {isCustom ? (
            <span className="text-xs font-label text-ink-muted">Custom gel</span>
          ) : (
            <span className="text-xs font-label text-ink leading-tight truncate block">
              <span className="text-ink-dim">{selectedGel?.brand} </span>
              {selectedGel?.name}
            </span>
          )}
        </span>
        <div className="flex items-center gap-1.5 shrink-0">
          {!isCustom && selectedGel && (
            <>
              <CarbsBadge g={selectedGel.carbsG} />
              {showCaffeineInPill && selectedGel.caffeineMg > 0 && <CaffeineBadge mg={selectedGel.caffeineMg} />}
            </>
          )}
          {isCustom && (
            <CarbsBadge g={customCarbsG} />
          )}
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 text-ink-dim" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
      </button>

      {/* Custom carbs override (shown when custom selected) */}
      {isCustom && (
        <div className="mt-1.5 grid grid-cols-2 gap-2">
          <div className="cockpit-input bg-surface-high rounded-sm flex items-center">
            <input
              type="number"
              value={customCarbsG}
              min={5} max={100} step={1}
              onChange={(e) => onCustomChange(parseFloat(e.target.value), customCaffeineMg)}
              className="flex-1 bg-transparent px-3 py-2 text-xs font-label text-ink focus:outline-none"
            />
            <span className="pr-3 text-[10px] font-label text-ink-dim">g carbs</span>
          </div>
          {showCaffeineInPill && (
            <div className="cockpit-input bg-surface-high rounded-sm flex items-center">
              <input
                type="number"
                value={customCaffeineMg ?? 0}
                min={0} max={200} step={25}
                onChange={(e) => onCustomChange(customCarbsG, parseFloat(e.target.value))}
                className="flex-1 bg-transparent px-3 py-2 text-xs font-label text-ink focus:outline-none"
              />
              <span className="pr-3 text-[10px] font-label text-ink-dim">mg caff</span>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 z-[2000] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          <div className="bg-surface-low rounded-xl w-full max-w-lg flex flex-col shadow-2xl" style={{ maxHeight: '80vh' }}>

            {/* Modal header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-surface-high/50">
              <div>
                <p className="text-[10px] font-label uppercase tracking-widest text-ink-muted">{label}</p>
                <p className="text-sm font-display font-black text-ink uppercase">Select Gel</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-ink-dim hover:text-volt transition-colors w-8 h-8 flex items-center justify-center rounded-sm hover:bg-surface-high"
              >
                ✕
              </button>
            </div>

            {/* Search */}
            <div className="px-4 pt-3 pb-2">
              <div className="cockpit-input bg-surface-high rounded-sm flex items-center gap-2 px-3 py-2.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-ink-dim shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
                <input
                  ref={searchRef}
                  type="text"
                  placeholder="Search brand or name…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="flex-1 bg-transparent text-sm font-label text-ink focus:outline-none placeholder:text-ink-dim"
                />
                {search && (
                  <button onClick={() => setSearch('')} className="text-ink-dim hover:text-volt text-xs">✕</button>
                )}
              </div>
            </div>

            {/* Brand filter pills */}
            <div className="px-4 pb-3">
              <p className="text-[9px] font-label uppercase tracking-widest text-ink-dim mb-1.5">Brand</p>
              <div className="flex gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                <button
                  onClick={() => setActiveBrand(null)}
                  className={`shrink-0 text-[10px] font-label px-2.5 py-1 rounded-full transition-colors
                    ${!activeBrand
                      ? 'bg-surface-highest text-volt border border-volt/40 font-semibold'
                      : 'bg-surface-high text-ink-muted hover:text-ink'}`}
                >
                  All
                </button>
                {availableBrands.map((brand) => (
                  <button
                    key={brand}
                    onClick={() => setActiveBrand(brand === activeBrand ? null : brand)}
                    className={`shrink-0 text-[10px] font-label px-2.5 py-1 rounded-full transition-colors
                      ${activeBrand === brand
                        ? 'bg-surface-highest text-volt border border-volt/40 font-semibold'
                        : 'bg-surface-high text-ink-muted hover:text-ink'}`}
                  >
                    {brand}
                  </button>
                ))}
              </div>
            </div>

            {/* Gel list */}
            <div ref={listRef} className="flex-1 overflow-y-auto px-3 pb-3 space-y-1">

              {/* Custom option */}
              <button
                onClick={() => handleSelect(null)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-sm text-left transition-colors
                  ${isCustom ? 'bg-volt/10 border-l-2 border-volt' : 'hover:bg-surface-high'}`}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-ink-dim shrink-0 ml-0.5" />
                <div className="flex-1">
                  <p className="text-xs font-label font-semibold text-ink">Custom</p>
                  <p className="text-[10px] font-label text-ink-dim">Enter carbs manually</p>
                </div>
              </button>

              {/* Grouped gels */}
              {[...grouped.entries()].map(([brand, brandGels]) => (
                <div key={brand}>
                  <p className="text-[10px] font-label uppercase tracking-widest text-ink-dim px-3 py-1.5 mt-2">
                    {brand}
                  </p>
                  {brandGels.map((gel) => {
                    const isSelected = gel.id === selectedGelId;
                    return (
                      <button
                        key={gel.id}
                        onClick={() => handleSelect(gel)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-sm text-left transition-colors
                          ${isSelected ? 'bg-volt/10 border-l-2 border-volt' : 'hover:bg-surface-high'}`}
                      >
                        {/* Caffeine dot indicator */}
                        <div
                          className="w-1.5 h-1.5 rounded-full shrink-0 ml-0.5"
                          style={{ background: gel.caffeineMg > 0 ? '#00e3fd' : '#cffc00' }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-label font-medium text-ink leading-snug truncate">{gel.name}</p>
                          {gel.notes && (
                            <p className="text-[10px] font-label text-ink-dim leading-tight truncate">{gel.notes}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <CarbsBadge g={gel.carbsG} />
                          {gel.caffeineMg > 0 && <CaffeineBadge mg={gel.caffeineMg} />}
                          <span className="text-[9px] font-label text-ink-dim">{gel.servingG}g</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ))}

              {filtered.length === 0 && (
                <div className="py-8 text-center text-xs font-label text-ink-dim">
                  No gels match your search
                </div>
              )}
            </div>

            {/* Footer count */}
            <div className="px-5 py-3 border-t border-surface-high/50 text-[10px] font-label text-ink-dim">
              {filtered.length} gels · {GEL_DATABASE.length} total in database
            </div>
          </div>
        </div>
      )}
    </>
  );
}
