import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { ThemeToggle } from './ThemeToggle';

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/kalkulator', label: 'Kalkulator Dat' },
  { to: '/kalendarz', label: 'Kalendarz Pełny' },
  { to: '/o-systemie', label: 'O systemie Tredeco' },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `pointer-events-auto rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
      isActive
        ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300'
        : 'text-slate-600 hover:bg-slate-200/70 dark:text-slate-300 dark:hover:bg-slate-800'
    }`;

  return (
    <header className="sticky top-0 z-[100] border-b border-slate-200/80 bg-white/80 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <NavLink to="/" className="pointer-events-auto text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
          Tredeco
        </NavLink>

        <nav className="hidden items-center gap-1 md:flex pointer-events-auto">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={linkClass}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />

          <button
            type="button"
            onClick={() => setIsOpen((current) => !current)}
            className="pointer-events-auto rounded-lg border border-slate-300 p-2 text-slate-700 transition hover:bg-slate-100 md:hidden dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            aria-label="Przełącz menu"
            aria-expanded={isOpen}
          >
            {isOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {isOpen ? (
        <nav className="mx-auto grid max-w-6xl gap-1 px-4 pb-3 md:hidden pointer-events-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={linkClass}
              onClick={() => setIsOpen(false)}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      ) : null}
    </header>
  );
}
