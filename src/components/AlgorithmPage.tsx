interface Props {
  onBack: () => void;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="font-display font-black text-xl uppercase text-ink border-b border-surface-high pb-3">
        {title}
      </h2>
      {children}
    </section>
  );
}

function Formula({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-surface rounded-sm border-l-2 border-volt px-5 py-4 font-label font-medium text-xs text-volt whitespace-pre overflow-x-auto leading-relaxed">
      {children}
    </div>
  );
}

function Note({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-surface-high rounded-sm border-l-2 border-plasma px-4 py-3 text-xs font-body text-ink-muted leading-relaxed">
      {children}
    </div>
  );
}

function Callout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-volt/8 rounded-sm border-l-2 border-volt px-4 py-3 text-xs font-body text-ink leading-relaxed">
      {children}
    </div>
  );
}

export function AlgorithmPage({ onBack }: Props) {
  return (
    <div className="min-h-screen bg-surface">
      {/* Hero */}
      <div className="px-6 md:px-10 pt-8 pb-6">
        <button
          onClick={onBack}
          className="text-[10px] font-label uppercase tracking-widest text-ink-muted hover:text-volt transition-colors mb-6 flex items-center gap-2"
        >
          ← Back to planner
        </button>
        <p className="text-ink-muted text-[10px] font-label uppercase tracking-[0.2em] mb-2">Documentation</p>
        <h1 className="font-display font-black uppercase leading-none">
          <span className="text-ink text-4xl md:text-6xl block">How it</span>
          <span className="text-volt text-5xl md:text-7xl block">Works.</span>
        </h1>
        <p className="text-ink-muted text-sm font-body mt-4 max-w-lg">
          The science and formulas behind every recommendation in the planner.
        </p>
      </div>

      <div className="px-6 md:px-10 pb-16 max-w-3xl space-y-10">

        <Section title="1. Gel interval">
          <p className="text-sm font-body text-ink-muted leading-relaxed">
            The core goal is to deliver carbohydrates at your target hourly rate using gels of a fixed carb content.
            The interval derives directly from this ratio:
          </p>
          <Formula>
            {`gel_interval_min = (carbs_per_gel_g ÷ target_carbs_per_hour_g) × 60`}
          </Formula>
          <p className="text-xs font-label text-ink-muted">
            <span className="text-volt font-semibold">Example:</span> 22 g gel at 60 g/h target
            → interval = (22 ÷ 60) × 60 = <span className="text-volt font-bold">22 min</span>
          </p>
          <Note>
            The first gel is taken at a fixed offset (default: 45 min) because glycogen stores cover the first ~40–50 minutes of racing.
            Subsequent gels follow every <em>gel_interval_min</em> until 5 minutes before the finish.
          </Note>
        </Section>

        <Section title="2. Flat race time">
          <p className="text-sm font-body text-ink-muted leading-relaxed">
            Without elevation data, total race time is the product of pace and distance:
          </p>
          <Formula>
            {`T_flat_min = pace_min_per_km × distance_km`}
          </Formula>
          <p className="text-sm font-body text-ink-muted leading-relaxed">
            Gel positions on the route are estimated by linear interpolation:
          </p>
          <Formula>
            {`gel_km = (gel_time_min ÷ T_effective_min) × distance_km`}
          </Formula>
        </Section>

        <Section title="3. Elevation adjustment — Naismith's Rule">
          <p className="text-sm font-body text-ink-muted leading-relaxed">
            When a GPX file is loaded and the elevation toggle is on, race time is adjusted
            using a modified <span className="text-ink font-semibold">Naismith's Rule</span> (1892),
            updated by Langmuir (1984) for descent:
          </p>
          <Formula>
            {`T_effective = T_flat + (ΔH⁺ × 0.1) − (ΔH⁻ × 0.03)

  ΔH⁺  = total elevation gain (metres)
  ΔH⁻  = total elevation loss (metres)
  0.1  = 1 min per 10 m ascent   (≈ 6 s / metre)
  0.03 = 0.3 min per 10 m descent (partial saving)`}
          </Formula>
          <p className="text-xs font-label text-ink-muted">
            <span className="text-volt font-semibold">Example:</span> 21 km, pace 5:30/km, 400 m gain, 350 m loss
          </p>
          <Formula>
            {`T_flat     = 5.5 × 21 = 115.5 min
T_effective = 115.5 + (400 × 0.1) − (350 × 0.03)
            = 115.5 + 40 − 10.5
            = 145 min  (+29.5 min vs flat)`}
          </Formula>
          <Note>
            GPS elevation data contains noise. Tiny up/down fluctuations would inflate the gain calculation.
            A <span className="text-ink font-semibold">5 m noise threshold</span> is applied — only
            changes greater than 5 m between consecutive track points are counted as real gain or loss.
          </Note>
          <Callout>
            Naismith's rule was originally designed for hiking. For running, the adjustment is a conservative
            upper bound. Treat the adjusted estimate as a "worst-case" planning scenario.
          </Callout>
        </Section>

        <Section title="4. Caffeinated gel strategy">
          <p className="text-sm font-body text-ink-muted leading-relaxed">
            Caffeine is a well-documented ergogenic aid. Key pharmacokinetics:
          </p>
          <ul className="text-sm font-body text-ink-muted list-disc pl-5 space-y-1">
            <li><span className="text-ink font-semibold">Onset:</span> effects begin 15–30 min after ingestion</li>
            <li><span className="text-ink font-semibold">Peak:</span> plasma concentration peaks at ~45–60 min</li>
            <li><span className="text-ink font-semibold">Half-life:</span> 3–5 hours</li>
            <li><span className="text-ink font-semibold">Effective dose:</span> ~3–6 mg per kg body weight</li>
          </ul>

          <div className="grid md:grid-cols-2 gap-3 mt-2">
            <div className="bg-surface-high rounded-sm p-4 space-y-2">
              <p className="text-xs font-label font-bold text-volt uppercase tracking-wide">Alternating</p>
              <p className="text-xs font-body text-ink-muted leading-relaxed">
                Every other gel (2nd, 4th, 6th…) is caffeinated. Steady, distributed caffeine intake.
                Best for long events where sustained alertness matters.
              </p>
              <Formula>{`caffeinated if  index % 2 === 1`}</Formula>
            </div>
            <div className="bg-surface-high rounded-sm p-4 space-y-2">
              <p className="text-xs font-label font-bold text-plasma uppercase tracking-wide">Final Push</p>
              <p className="text-xs font-body text-ink-muted leading-relaxed">
                Last N eligible gels are caffeinated. Caffeine peaks as you approach the finish.
                Ideal for a strong closing effort.
              </p>
              <Formula>{`last N gels before blackout window`}</Formula>
            </div>
          </div>

          <Callout>
            <span className="text-volt font-semibold">Blackout window:</span> No caffeinated gel is
            scheduled within the last X minutes (default: 60 min). Caffeine taken too late provides
            no benefit and may cause GI distress. The algorithm silently downgrades these to regular gels.
          </Callout>
        </Section>

        <Section title="5. GPS interpolation">
          <p className="text-sm font-body text-ink-muted leading-relaxed">
            To place gel markers on the map, the planner finds exact GPS coordinates at each gel's
            target distance using <span className="text-ink font-semibold">linear interpolation</span> between track points:
          </p>
          <Formula>
            {`for segment [P_i, P_{i+1}] where cumDist_{i+1} ≥ target_m:
  frac = (target_m − cumDist_i) / segment_length_m
  lat  = P_i.lat + frac × (P_{i+1}.lat − P_i.lat)
  lon  = P_i.lon + frac × (P_{i+1}.lon − P_i.lon)`}
          </Formula>
          <p className="text-sm font-body text-ink-muted leading-relaxed">
            Cumulative distances use the <span className="text-ink font-semibold">Haversine formula</span> (Earth radius ≈ 6,371 km):
          </p>
          <Formula>
            {`a = sin²(ΔLat/2) + cos(lat₁)·cos(lat₂)·sin²(ΔLon/2)
d = 2R · atan2(√a, √(1−a))`}
          </Formula>
        </Section>

        <Section title="6. GPX export">
          <p className="text-sm font-body text-ink-muted leading-relaxed">
            The exported file follows <span className="text-ink font-semibold">GPX 1.1 schema</span> and includes:
          </p>
          <ul className="text-sm font-body text-ink-muted list-disc pl-5 space-y-1">
            <li><code className="text-volt text-xs font-label">&lt;wpt&gt;</code> waypoints for each gel with name, description, coordinates</li>
            <li><code className="text-volt text-xs font-label">&lt;sym&gt;Flag, Blue&lt;/sym&gt;</code> — Garmin-compatible symbol</li>
            <li><code className="text-volt text-xs font-label">&lt;extensions&gt;</code> with carb amount and alert text</li>
            <li>Original <code className="text-volt text-xs font-label">&lt;trk&gt;</code> track preserved intact</li>
          </ul>
          <Note>
            Waypoint names are kept under 30 characters for GPS device display compatibility.
            Komoot and Strava import these as course points.
          </Note>
        </Section>

        <div className="text-[10px] font-label text-ink-dim pt-4 border-t border-surface-high leading-relaxed">
          References: Naismith (1892) · Langmuir, <em>Mountaincraft and Leadership</em> (1984) ·
          Burke &amp; Deakin, <em>Clinical Sports Nutrition</em> (2015) ·
          Jeukendrup, <em>Sports Medicine</em> 2011 (carbohydrate oxidation rates)
        </div>
      </div>
    </div>
  );
}
