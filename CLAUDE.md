# Gel Timing Planner — Project Context

## Commands

Node is managed via **NVM**. Always prefix npm commands:

```bash
export NVM_DIR="$HOME/.nvm" && source "$NVM_DIR/nvm.sh" && npm run dev
export NVM_DIR="$HOME/.nvm" && source "$NVM_DIR/nvm.sh" && npm run build   # tsc -b && vite build
```

## Stack

| Layer | Choice |
|-------|--------|
| Framework | React 19 + TypeScript (verbatimModuleSyntax enabled) |
| Build | Vite 8 + `@vitejs/plugin-react` (React Compiler via Babel) |
| Styling | Tailwind CSS v4 via `@tailwindcss/vite` — no config file, tokens in `@theme {}` in index.css |
| Routing | react-router-dom v7, `BrowserRouter` wraps in `main.tsx` |
| Map | react-leaflet v5 + Leaflet 1.9, CartoDB dark tiles |

## File Structure

```
src/
  main.tsx                  # BrowserRouter + StrictMode root
  App.tsx                   # Layout shell: <Sidebar> + <Routes>
  index.css                 # @theme tokens, global resets, Leaflet overrides, print rules

  types/index.ts            # All shared interfaces — see Types section below

  pages/
    PlannerPage.tsx         # All state (params, hydration, plan, gpx, tab, showPrint)
                            # Layout: title → RaceHeader → tab nav → tab content
    HowItWorksPage.tsx      # Thin wrapper → <AlgorithmPage>

  components/
    Sidebar.tsx             # NavLink sidebar; uses `end` prop on "/" to avoid always-active
    RaceHeader.tsx          # Shared distance + pace inputs (above tab nav)
    ParametersPanel.tsx     # Gel-specific inputs (carbs, first gel, caffeine, gel picker)
                            # Note: pace + distance removed — now in RaceHeader
    HydrationPanel.tsx      # Hydration tab: inputs (weight, temp, intensity, electrolytes)
                            #   + result cards + warnings; auto-calculates on change
    GelPicker.tsx           # Modal gel selector (156 products, 23 brands) + Custom fallback
    RouteMap.tsx            # Leaflet map, volt polyline, gel markers
    ElevationChart.tsx      # SVG area chart, gel callout bubbles
    FeedingTimeline.tsx     # Horizontal timeline with gel dots
    ResultsSummary.tsx      # Summary stats cards
    GelList.tsx             # Detailed gel schedule table
    ExportButton.tsx        # GPX download with success state
    PrintRaceCard.tsx       # Print modal + portal; imports styles from src/styles/printCard.ts
    AlgorithmPage.tsx       # "How It Works" content; uses useNavigate for back button
    GpxUploader.tsx         # Drag-and-drop GPX loader

  utils/
    calculations.ts         # calculatePlan(), formatTime(), assignCaffeine()
    hydrationCalc.ts        # calculateHydration(), lbsToKg(), fToC()
    geo.ts                  # haversine(), calculateElevationProfile() (5 m noise threshold)
    gpxParser.ts            # DOMParser-based GPX → ParsedGPX
    gpxExporter.ts          # Plan + TrackPoints → GPX 1.1 Blob download

  data/
    gels.json               # 156 gel products, 23 brands
    gels.ts                 # GEL_DATABASE, GEL_BRANDS, getGelById()

  styles/
    printCard.ts            # CSSProperties style objects for HalfA4Card / WristbandCard
                            # (mm/pt print units — Tailwind has no physical unit support)
```

## Design System

Tokens live in the `@theme {}` block in `index.css` — no `tailwind.config.js`.

```
Surfaces:  surface (#0c0e11)  surface-low (#111417)
           surface-high (#23262a)  surface-highest (#2d3035)
Accents:   volt (#cffc00)  volt-light (#f4ffc8)  plasma (#00e3fd)
Text:      ink (#fff)  ink-muted (#9ca3af)  ink-dim (#6b7280)
Fonts:     font-display (Lexend)  font-body (Plus Jakarta Sans)  font-label (Inter)
```

Recurring UI patterns:
- **Primary button** — volt gradient + `rounded-full px-8 py-3 font-display font-black uppercase tracking-wider`
- **Secondary button** — `bg-surface-high border border-surface-highest/60 rounded-full px-8 py-3 font-display font-black uppercase tracking-wider`
- **Ghost pill** — `border border-surface-high rounded-full`
- **Panel card** — `bg-surface-low rounded-xl p-5`
- **Input** — `.cockpit-input` class (left border focus glow) + `bg-surface-high rounded-sm`
- **Section label** — `text-[10px] font-label uppercase tracking-widest text-ink-muted`

The volt gradient (used on primary buttons) cannot be expressed as a Tailwind class:
```
background: linear-gradient(180deg, #f4ffc8 0%, #cffc00 100%)
```
Use `style={{ background: '…' }}` inline where needed (ExportButton, PrintRaceCard Print button).

## Inline Styles Policy

Use Tailwind for everything on-screen. Inline `style={}` is acceptable only for:
1. **Runtime-dynamic values** — computed percentages, hex colours from data (timeline dots, gel badges)
2. **Print units** — all `mm`/`pt` values live in `src/styles/printCard.ts`, imported by `PrintRaceCard.tsx`
3. **Gradients** — volt gradient (see above)

No `S = Record<string, CSSProperties>` objects inside component files. Extract to `src/styles/` instead.

## Types (types/index.ts)

```typescript
// Gel planner
NutritionParams   // paceMinPerKm, distanceKm, carbsPerHourG, carbsPerGelG,
                  // firstGelMinute, absorptionMinutes, adjustForElevation,
                  // useCaffeineGels, caffeinePerGelMg, caffeineStrategy,
                  // caffeineGelCount, caffeineBlackoutMin,
                  // selectedGelId, selectedCafGelId
GelPoint          // index, timeMin, distanceKm, lat?, lon?, carbsG, isCaffeinated, cumulativeCaffeineMg
Plan              // params, totalMinutes, effectiveTotalMinutes, gelIntervalMinutes,
                  // gels, totalCarbs, avgCarbsPerHour, elevation?, totalCaffeineMg
GelEntry          // id, brand, name, carbsG, caffeineMg, sodiumMg, servingG, type, notes
ElevationProfile  // gainM, lossM

// Hydration
HydrationParams   // weightKg, weightUnit, tempC, tempUnit, intensity,
                  // electrolyteSource, aidStations (null=auto), sodiumPerGelMgOverride (null=from gel)
HydrationPlan     // sweatRateMlPerHour, totalFluidMl, aidStationCount,
                  // fluidPerAidStationMl, sodiumMgPerHour, totalSodiumMg,
                  // sodiumFromGelsMg, netSodiumMg, gelHasElectrolytes, warnings[]

// Enums
CaffeineStrategy      = 'alternating' | 'finalPush'
PaceIntensity         = 'easy' | 'moderate' | 'hard'
ElectrolyteSource     = 'none' | 'salt-tabs' | 'drink' | 'both'
WeightUnit / TempUnit = 'kg'|'lbs' / 'C'|'F'
```

## Key Behaviours

### Page layout (PlannerPage)
```
Title → RaceHeader (distance + pace, shared) → Tab nav → Tab content
```
- `RaceHeader` owns distance + pace inputs and live finish time display
- `ParametersPanel` is gel-specific only (carbs, timing, caffeine, gel picker)
- Changing distance/pace via `RaceHeader` invalidates `plan` (sets to null)
- `Tab` state: `'gel' | 'hydration'`, default `'gel'`
- Both tabs read `params.distanceKm` + `params.paceMinPerKm` from shared state

### Gel calculation flow
```
NutritionParams + TrackPoint[] → calculatePlan() → Plan
```
- `gel_interval_min = (carbsPerGelG / carbsPerHourG) × 60`
- First gel at `firstGelMinute` (default 45 min); subsequent gels every `gelIntervalMinutes`; stops 5 min before finish
- Elevation adjustment (Naismith): `T_effective = T_flat + gainM × 0.1 − lossM × 0.03`
- GPS noise: elevation changes < 5 m ignored
- Caffeine strategies: `alternating` (every 2nd gel) | `finalPush` (last N gels); blackout window = no caffeine in final N min

### Hydration calculation flow
```
HydrationParams + raceMinutes + gelCount + sodiumPerGel → calculateHydration() → HydrationPlan
```
- `sweat_rate = 500 + max(0, (tempC−15)/5)×100 + intensity_bonus`  (Easy 0 / Moderate +150 / Hard +300)
- `total_fluid = sweat_rate × race_hours`
- `aid_stations = params.aidStations ?? ceil(distanceKm / 5)`
- Sodium targets (mg/hr): Easy 500 / Moderate 750 / Hard 1000
- Gel sodium detected via `GelEntry.sodiumMg` or notes keyword "electrolyte"
- `sodiumPerGelMgOverride` (null = use gel's sodiumMg) lets user correct label data
- Auto-calculates on every input change (no button)
- Warnings emitted for: tempC ≥ 35, tempC ≥ 28 + long race, fluid > 500ml/stop, no electrolytes + high deficit

### GPX handling
- Parsing: `DOMParser` in browser, no server
- Map markers: Haversine cumulative distances → linear interpolation to exact lat/lon
- Export: GPX 1.1 with `<wpt>` per gel (Garmin `<sym>Flag, Blue</sym>`) + original `<trk>` preserved

### Print
- `PrintRaceCard` renders via `createPortal` into `.gel-print-root` div outside `#root`
- `@media print` in `index.css` hides `#root`, shows `.gel-print-root`
- Dynamic `<style id="gel-print-page">` injected into `<head>` per format:
  - Half A4 → `@page { size: A5 portrait; margin: 8mm; }`
  - Wristband → `@page { size: 210mm 70mm landscape; margin: 5mm; }`

## GelEntry.sodiumMg
`sodiumMg` is 0 by default for most gels in `gels.json` (sodium data not widely published).
Electrolyte gels are detected by: `sodiumMg > 0 || notes.includes('electrolyte') || type === 'electrolyte'`.
Users can override via `sodiumPerGelMgOverride` in `HydrationParams`. Typical values: plain gels 10–30 mg, electrolyte gels 100–250 mg.

## Known Gotchas

- **Leaflet z-index** conflicts with modals. Fix: `isolation: isolate` on `.leaflet-container` in index.css + modals at `z-[2000]`.
- **GelPicker `handleSelect`** must call only `onSelect(gel.id)` — never also call `onCustomChange`. Calling both resets `selectedGelId` to null via `handleGelCustomChange` in ParametersPanel.
- **`verbatimModuleSyntax`** is on — types must be imported with `import type`, not mixed into value imports. e.g. `import type { CSSProperties } from 'react'` on its own line.
- **NavLink on "/"** requires `end` prop, otherwise it matches every route and is always active.
- **ElevationChart** removed `totalMinutes` from props — it was unused and caused TS6133.
- **ParametersPanel** no longer receives `gpxDistanceKm` — distance/pace moved to `RaceHeader`. Do not re-add them there.
- **`HydrationPanel`** auto-recalculates via `useMemo` — no "calculate" button. Depends on `plan` being non-null for gel count and exact race duration; falls back to `distanceKm / 10 * 60` minutes if no plan yet.
