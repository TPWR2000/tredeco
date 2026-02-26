import type { ReactNode } from 'react';
import { Navbar } from './Navbar';

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top,#d4f7ea_0%,transparent_45%)] dark:bg-[radial-gradient(circle_at_top,#1f2937_0%,transparent_55%)]" />
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
