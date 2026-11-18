import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import { Briefcase, LogOut, X } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useJobs } from '../../hooks/useJobs';
import { NAV_ITEMS } from './navItems';

interface Props {
  open: boolean;
  onClose: () => void;
}

/** Fixed sidebar on desktop, slide-in drawer on mobile. */
export default function Sidebar({ open, onClose }: Props) {
  const { jobs } = useJobs();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  // In-progress applications (excludes wishlist, offers and rejections)
  const active = jobs.filter((j) => !['Wishlist', 'Rejected', 'Offer'].includes(j.status)).length;

  const content = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center justify-between px-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white shadow-lg shadow-brand-600/30">
            <Briefcase size={18} />
          </div>
          <div>
            <p className="text-sm font-semibold leading-tight">Job Tracker</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Land your next role</p>
          </div>
        </div>
        <button onClick={onClose} className="btn-icon lg:hidden" aria-label="Close menu">
          <X size={18} />
        </button>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            onClick={onClose}
            className={({ isActive }) =>
              clsx(
                'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white',
              )
            }
          >
            <Icon size={18} />
            <span className="flex-1">{label}</span>
            {to === '/jobs' && active > 0 && (
              <span className="rounded-full bg-brand-600 px-2 py-0.5 text-[10px] font-semibold text-white">{active}</span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Signed-in user + logout */}
      <div className="border-t border-slate-200 p-3 dark:border-slate-800">
        <div className="flex items-center gap-3 rounded-xl px-2 py-2">
          {user?.photoURL ? (
            <img src={user.photoURL} alt="" referrerPolicy="no-referrer" className="h-9 w-9 shrink-0 rounded-full" />
          ) : (
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-600 text-sm font-semibold text-white">
              {(user?.displayName ?? user?.email ?? '?').charAt(0).toUpperCase()}
            </span>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{user?.displayName ?? 'Signed in'}</p>
            <p className="truncate text-xs text-slate-500 dark:text-slate-400">{user?.email}</p>
          </div>
          <button
            onClick={async () => {
              onClose();
              await signOut();
              // Explicit logout: go to a clean login page so the next sign-in lands on the Dashboard
              navigate('/login', { replace: true });
            }}
            className="btn-icon shrink-0 hover:text-rose-600"
            aria-label="Log out"
            title="Log out"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 lg:block">
        {content}
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
            />
            <motion.aside
              className="fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-xl dark:bg-slate-900 lg:hidden"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            >
              {content}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
