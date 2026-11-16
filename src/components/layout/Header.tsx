import { Download, Menu, Upload } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useBackup } from '../../hooks/useBackup';
import { NAV_ITEMS } from './navItems';
import ThemeToggle from './ThemeToggle';

/** Sticky top bar: page title, quick backup actions and theme toggle. */
export default function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const { pathname } = useLocation();
  const { exportJSON, openImport, fileInput } = useBackup();
  const title = NAV_ITEMS.find((n) => n.to === pathname)?.label ?? 'Dashboard';

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-slate-200 bg-white/80 px-4 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80 sm:px-6 lg:px-8">
      <button onClick={onMenuClick} className="btn-icon lg:hidden" aria-label="Open menu">
        <Menu size={20} />
      </button>
      <h1 className="flex-1 truncate text-lg font-semibold">{title}</h1>

      <button onClick={exportJSON} className="btn-ghost hidden sm:inline-flex" title="Export JSON backup">
        <Download size={16} /> Export
      </button>
      <button onClick={openImport} className="btn-ghost hidden sm:inline-flex" title="Import JSON backup">
        <Upload size={16} /> Import
      </button>
      {fileInput}
      <ThemeToggle />
    </header>
  );
}
