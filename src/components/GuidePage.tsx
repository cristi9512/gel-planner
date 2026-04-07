import { useNavigate } from 'react-router-dom';

// ─── Shared layout primitives (same shape as AlgorithmPage) ───────────────────

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

function Tip({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-volt/8 rounded-sm border-l-2 border-volt px-4 py-3 text-xs font-body text-ink leading-relaxed">
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

// ─── Guide-specific primitives ────────────────────────────────────────────────

function Step({
  n, title, children,
}: {
  n: number; title: string; children: React.ReactNode;
}) {
  return (
    <div className="flex gap-4">
      <div className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center font-display font-black text-xs text-surface mt-0.5"
           style={{ background: 'linear-gradient(180deg, #f4ffc8 0%, #cffc00 100%)' }}>
        {n}
      </div>
      <div className="flex-1 space-y-1 pb-5 border-b border-surface-high/40 last:border-0 last:pb-0">
        <p className="text-sm font-label font-semibold text-ink">{title}</p>
        <div className="text-xs font-body text-ink-muted leading-relaxed">{children}</div>
      </div>
    </div>
  );
}

function FeatureCard({
  icon, title, when, children,
}: {
  icon: string; title: string; when: string; children: React.ReactNode;
}) {
  return (
    <div className="bg-surface-high rounded-xl p-5 space-y-3">
      <div className="flex items-start gap-3">
        <span className="text-2xl shrink-0 leading-none mt-0.5">{icon}</span>
        <div>
          <p className="font-display font-black text-sm uppercase text-ink tracking-wide">{title}</p>
          <p className="text-[10px] font-label uppercase tracking-widest text-plasma mt-0.5">
            When: {when}
          </p>
        </div>
      </div>
      <div className="text-xs font-body text-ink-muted leading-relaxed space-y-2">{children}</div>
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block bg-surface-highest text-ink-muted text-[10px] font-label rounded px-1.5 py-0.5 font-medium">
      {children}
    </span>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function GuidePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-surface">

      {/* Hero */}
      <div className="px-6 md:px-10 pt-8 pb-6">
        <button
          onClick={() => navigate('/')}
          className="text-[10px] font-label uppercase tracking-widest text-ink-muted hover:text-volt transition-colors mb-6 flex items-center gap-2"
        >
          ← Back to planner
        </button>
        <p className="text-ink-muted text-[10px] font-label uppercase tracking-[0.2em] mb-2">Documentation</p>
        <h1 className="font-display font-black uppercase leading-none">
          <span className="text-ink text-4xl md:text-6xl block">User</span>
          <span className="text-volt text-5xl md:text-7xl block">Guide.</span>
        </h1>
        <p className="text-ink-muted text-sm font-body mt-4 max-w-lg">
          What the planner does, who it's for, and how to get the most out of every feature.
        </p>
      </div>

      <div className="px-6 md:px-10 pb-16 max-w-3xl space-y-10">

        {/* ── What is this? ── */}
        <Section title="What is Gel Timing Planner?">
          <p className="text-sm font-body text-ink-muted leading-relaxed">
            Gel Timing Planner is a free, browser-based tool for runners who want a
            precise, personalised nutrition and hydration strategy for race day.
            It calculates <span className="text-ink font-semibold">exactly when and where to take energy gels</span>,
            how much fluid you need at each aid station, and what your electrolyte targets are —
            then lets you export that plan to your GPS watch, print it as a pocket card, or share it with your coach.
          </p>
          <div className="grid grid-cols-3 gap-3 mt-2">
            {[
              { icon: '🔒', label: 'No account needed' },
              { icon: '🌐', label: 'Runs in the browser' },
              { icon: '📴', label: 'No data sent anywhere' },
            ].map(({ icon, label }) => (
              <div key={label} className="bg-surface-high rounded-lg p-3 text-center space-y-1">
                <span className="text-xl block">{icon}</span>
                <p className="text-[10px] font-label text-ink-muted">{label}</p>
              </div>
            ))}
          </div>
          <Note>
            The planner is most useful for races or long training runs of <strong>45 minutes or more</strong>.
            Below that threshold, glycogen stores are typically sufficient without supplemental carbohydrates.
          </Note>
        </Section>

        {/* ── Quick start ── */}
        <Section title="Quick start — your first plan in 4 steps">
          <div className="space-y-0">
            <Step n={1} title="Set your race distance and pace">
              Enter your target distance (km) and pace (min/km) in the shared header at the top of the
              planner. These feed into both the gel tab and the hydration tab.
              The estimated finish time updates live as you type.
            </Step>

            <Step n={2} title="Choose your gel">
              In the <span className="text-volt font-semibold">Gel Planner</span> tab, open the gel picker
              and search for your product by name or brand. 156 gels across 23 brands are listed.
              If yours isn't there, select <Badge>Custom</Badge> and type the carbs per serving manually.
            </Step>

            <Step n={3} title="Press Calculate Plan">
              Hit the <span className="text-volt font-semibold">Calculate Plan</span> button.
              The schedule appears immediately — each gel's time, km marker, carbs, and cumulative total.
            </Step>

            <Step n={4} title="Review, export, or share">
              Check the feeding timeline and gel list. If the schedule looks right, use{' '}
              <Badge>🔗 Share Plan</Badge> to copy a link, <Badge>🖨️ Print Race Card</Badge> for a pocket card,
              or <Badge>Export GPX</Badge> to send waypoints to your watch (requires a GPX upload first).
            </Step>
          </div>
          <Tip>
            <span className="text-volt font-semibold">First time?</span>{' '}
            Start with the defaults: 60 g carbs/hr, 22 g gel, first gel at 45 min.
            These are safe starting points for most runners — refine after a few training races.
          </Tip>
        </Section>

        {/* ── Feature breakdown ── */}
        <Section title="Features in detail">

          <FeatureCard
            icon="⚡"
            title="Gel timing calculator"
            when="any race or long run over 45 min"
          >
            <p>
              The core of the planner. Set your <strong>carbohydrate target per hour</strong> (default 60 g —
              a well-studied safe upper limit for untrained guts) and the <strong>carbs per gel</strong>.
              The calculator divides these to find your gel interval, then places gels from your first-gel
              time to 5 minutes before the finish.
            </p>
            <p>
              Adjust <strong>first gel at</strong> if you're racing after a carb-heavy breakfast (push to 50–60 min)
              or starting fasted (pull to 30 min). <strong>Absorption time</strong> adds a buffer before
              the next gel fires — useful if your gel takes longer to digest.
            </p>
          </FeatureCard>

          <FeatureCard
            icon="🗂️"
            title="Gel database — 156 products, 23 brands"
            when="picking a specific product, or comparing gels"
          >
            <p>
              Click the gel picker button in the parameters panel to open the database.
              Search by product name, or filter by brand using the pills at the top.
              Selecting a gel automatically fills in the carbs per serving.
            </p>
            <p>
              Brands include GU, Maurten, SiS, Clif, Hammer, High5, Torq, Precision Fuel,
              Gu Roctane, Spring Energy, and more.
              If your gel isn't listed, choose <Badge>Custom</Badge> and enter the carbs manually —
              the number is on the wrapper.
            </p>
          </FeatureCard>

          <FeatureCard
            icon="🗺️"
            title="GPX upload — route-aware gel placement"
            when="hilly races (trail, cross-country, hilly road)"
          >
            <p>
              Drag your GPX file onto the uploader panel.
              The planner reads the track and does three things automatically:
            </p>
            <ul className="list-disc pl-4 space-y-1 mt-1">
              <li>Fills in distance from the file (locks the input with a <Badge>GPX</Badge> badge)</li>
              <li>Enables the <strong>Adjust for elevation</strong> toggle, which adds time for climbs using Naismith's Rule</li>
              <li>Places gel markers at the exact latitude/longitude of each scheduled dose</li>
            </ul>
            <p className="mt-1">
              The interactive map shows your full route and every gel stop. The elevation chart
              below the results overlays gel callouts on the altitude profile.
            </p>
            <Note>
              GPX data is not included when you share a plan link — it's binary and too large
              to encode in a URL. After loading a shared link, re-upload your file to restore the map.
            </Note>
          </FeatureCard>

          <FeatureCard
            icon="📤"
            title="GPX export — gel waypoints to your watch"
            when="you want gel alerts on your GPS device"
          >
            <p>
              After uploading a GPX and calculating a plan, the{' '}
              <Badge>Export GPX</Badge> button appears in the results section.
              It downloads a GPX 1.1 file that contains your full original route
              plus a <strong>waypoint for every gel stop</strong>.
            </p>
            <p>
              Each waypoint includes:
            </p>
            <ul className="list-disc pl-4 space-y-1 mt-1">
              <li>Exact GPS coordinates at the gel's km marker</li>
              <li>Name with gel number and scheduled time (e.g. <Badge>Gel 3 · 1:07</Badge>)</li>
              <li>Description with carb amount and cumulative total</li>
              <li>Garmin-compatible <Badge>Flag, Blue</Badge> symbol — shows as a flag icon on the device map</li>
            </ul>
            <p className="mt-1">
              Compatible with <strong>Garmin</strong>, <strong>Coros</strong>, <strong>Suunto</strong>,
              and <strong>Komoot</strong>. Import the file as a course on your device
              and the gel stops appear as course points — your watch will alert you as you approach each one.
            </p>
            <Note>
              The Export GPX button only appears when a GPX file has been uploaded and the
              plan includes at least one gel with a GPS position. Distance-only plans (no GPX) cannot generate export files.
            </Note>
          </FeatureCard>

          <FeatureCard
            icon="☕"
            title="Caffeinated gel strategy"
            when="you alternate regular and caffeinated gels in a race"
          >
            <p>
              Enable <strong>Mix caffeinated gels</strong> in the parameters panel, then pick your
              caffeinated variant from the same database (or enter mg manually).
              Two strategies are available:
            </p>
            <ul className="list-disc pl-4 space-y-1 mt-1">
              <li>
                <strong>Alternating</strong> — every other gel is caffeinated (2nd, 4th, 6th…).
                Spreads caffeine intake across the whole race. Good for events over 2 hours.
              </li>
              <li>
                <strong>Final Push</strong> — the last N gels before the finish are caffeinated.
                Peaks caffeine when you need it most. Better for shorter races or a strong finish.
              </li>
            </ul>
            <p className="mt-1">
              Set a <strong>blackout window</strong> (default 60 min) to prevent caffeinated gels
              being scheduled so close to the finish that they peak after the tape.
              Any gel inside the window is automatically swapped to regular.
            </p>
          </FeatureCard>

          <FeatureCard
            icon="🧂"
            title="Hydration & electrolytes tab"
            when="always — hydration is as important as carbs"
          >
            <p>
              Switch to the <span className="text-volt font-semibold">🧂 Hydration & Electrolytes</span> tab.
              Enter your body weight, expected race temperature, and how hard you'll push.
              The planner calculates your estimated sweat rate and total fluid need for the full race duration.
            </p>
            <p>
              Key outputs:
            </p>
            <ul className="list-disc pl-4 space-y-1 mt-1">
              <li><strong>Sweat rate</strong> — ml per hour, factoring in temp and intensity</li>
              <li><strong>Fluid per aid station</strong> — how much to drink at each stop (auto-spaces every 5 km if you leave the count blank)</li>
              <li><strong>Sodium target</strong> — mg per hour and total, scaled to intensity</li>
              <li><strong>Net sodium after gels</strong> — if your gel has electrolytes, that amount is deducted automatically</li>
            </ul>
            <Tip>
              Calculate a gel plan first. The hydration tab uses the exact race duration and gel count
              from your plan for more accurate totals. Without a plan, it estimates based on a 6 min/km default pace.
            </Tip>
          </FeatureCard>

          <FeatureCard
            icon="🖨️"
            title="Print Race Card"
            when="races without phone/watch access, or as a backup"
          >
            <p>
              Click <Badge>🖨️ Print Race Card</Badge> at the bottom of the results section.
              A modal opens with two format options:
            </p>
            <ul className="list-disc pl-4 space-y-1 mt-1">
              <li>
                <strong>Half A4</strong> — A5 portrait card with the full gel schedule table, race stats,
                gel info, and a hydration reminder. Fits in a jersey pocket.
              </li>
              <li>
                <strong>Wristband strip</strong> — 210 × 70 mm landscape strip. Print, laminate, and tape
                to your wrist or forearm. Shows gel chips with time and km.
              </li>
            </ul>
            <p className="mt-1">
              Enter an optional race name and runner name before printing.
              Use your browser's <Badge>Save as PDF</Badge> option to get a digital copy
              instead of printing to paper.
            </p>
          </FeatureCard>

          <FeatureCard
            icon="🔗"
            title="Share Plan"
            when="sharing with a coach, training partner, or saving for later"
          >
            <p>
              The <Badge>🔗 Share Plan</Badge> button appears at the top of your results.
              Clicking it copies the full URL — including all your settings — to the clipboard.
            </p>
            <p>
              Anyone who opens that link sees the exact same plan, already calculated.
              All state is encoded in the URL hash, so no account or server is needed.
              What's included in the link:
            </p>
            <ul className="list-disc pl-4 space-y-1 mt-1">
              <li>All gel planner settings (distance, pace, gel, carbs targets, caffeine strategy)</li>
              <li>All hydration inputs (weight, temperature, intensity, electrolyte source)</li>
              <li>Active tab (gel or hydration)</li>
              <li>Unit preferences (kg/lbs, °C/°F)</li>
            </ul>
            <Note>
              The URL hash also updates automatically as you change any setting, so the browser
              back/forward buttons work as expected. If state is back at defaults, the hash is cleared.
            </Note>
          </FeatureCard>

        </Section>

        {/* ── Practical tips ── */}
        <Section title="Practical tips for race day">
          <div className="space-y-3">
            <Tip>
              <span className="text-volt font-semibold">Gut training matters.</span>{' '}
              60 g carbs/hr is the upper limit for glucose-only oxidation. Gels using a 2:1
              glucose-to-fructose ratio (Maurten, Precision Fuel 30:60) can push this to 90 g/hr,
              but only if you've trained your gut in long runs. Start lower and build up.
            </Tip>
            <Tip>
              <span className="text-volt font-semibold">Always take gels with water.</span>{' '}
              Taking a gel without water concentrates the carbohydrates in your stomach and slows
              absorption. Aim for at least 150–200 ml per gel. If aid stations are sparse, carry a bottle.
            </Tip>
            <Tip>
              <span className="text-volt font-semibold">Hot race? Check the hydration tab.</span>{' '}
              Sweat rate increases by ~100 ml/hr for every 5°C above 15°C. A 30°C day adds
              300 ml/hr to your baseline — that's an extra water bottle every 30 minutes.
            </Tip>
            <Tip>
              <span className="text-volt font-semibold">Set the first gel time correctly.</span>{' '}
              The default 45 min assumes you start a race with full glycogen. If you had a big
              carb-heavy meal two hours before, you might push this to 50–55 min.
              If you're racing first thing in the morning after a light breakfast, consider 30 min.
            </Tip>
            <Tip>
              <span className="text-volt font-semibold">Use the elevation toggle on hilly courses.</span>{' '}
              A mountain marathon with 2,000 m gain might add 40–60 minutes to your estimated finish.
              Without the toggle, your gel schedule ends too early — you'll run out of fuel on the descent.
            </Tip>
          </div>
        </Section>

        <div className="text-[10px] font-label text-ink-dim pt-4 border-t border-surface-high leading-relaxed">
          For the science behind these recommendations, see the{' '}
          <button
            onClick={() => window.location.href = '/how-it-works'}
            className="text-volt hover:underline"
          >
            How It Works
          </button>{' '}
          page · Jeukendrup, <em>Sports Medicine</em> 2011 ·
          Burke &amp; Deakin, <em>Clinical Sports Nutrition</em> (2015) ·
          Sawka et al., <em>Medicine &amp; Science in Sports &amp; Exercise</em> 2007
        </div>

      </div>
    </div>
  );
}
