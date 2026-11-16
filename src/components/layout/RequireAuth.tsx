import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import FullScreenLoader from '../common/FullScreenLoader';

/** Redirects to /login when signed out; waits for the user's data before rendering. */
export default function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading, dataReady } = useAuth();
  const location = useLocation();

  if (loading) return <FullScreenLoader />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (!dataReady) return <FullScreenLoader label="Syncing your data…" />;
  return <>{children}</>;
}
