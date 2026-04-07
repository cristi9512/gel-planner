import { NavLink } from 'react-router-dom';

interface NavItemProps {
  to: string;
  end?: boolean;
  icon: string;
  label: string;
}

function NavItem({ to, end, icon, label }: NavItemProps) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors relative font-label
        ${isActive ? 'text-volt bg-volt/10' : 'text-ink-muted hover:text-ink hover:bg-white/5'}`
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-volt rounded-r" />
          )}
          <span className="text-base shrink-0">{icon}</span>
          <span className="hidden md:block">{label}</span>
          {isActive && (
            <span className="ml-auto w-1.5 h-1.5 rounded-full bg-volt hidden md:block" />
          )}
        </>
      )}
    </NavLink>
  );
}

export function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-50 w-14 md:w-52 bg-surface-low flex flex-col">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-surface-high/40">
        <NavLink to="/" className="block">
          <div className="hidden md:block">
            <p className="text-volt font-display font-black text-xs uppercase tracking-widest leading-tight">
              Gel Timing
            </p>
            <p className="text-ink font-display font-black text-sm uppercase leading-tight">
              Planner
            </p>
          </div>
          <div className="md:hidden flex items-center justify-center">
            <span className="text-volt font-display font-black text-lg">G</span>
          </div>
        </NavLink>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 space-y-1">
        <NavItem to="/" end icon="⚡" label="Planner" />
        <NavItem to="/how-it-works" icon="📐" label="How it works" />
      </nav>

      {/* Footer */}
      <div className="hidden md:block px-4 py-4 border-t border-surface-high/40">
        <p className="text-[10px] font-label text-ink-dim uppercase tracking-widest">Race Nutrition</p>
        <p className="text-[10px] font-label text-ink-dim">v2.0 · Client-side only</p>
      </div>
    </aside>
  );
}
