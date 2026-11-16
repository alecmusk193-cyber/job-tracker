import { motion } from 'framer-motion';
import { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Header from './components/layout/Header';
import RequireAuth from './components/layout/RequireAuth';
import Sidebar from './components/layout/Sidebar';
import { isFirebaseConfigured } from './config/firebase';
import { useTheme } from './hooks/useTheme';
import Dashboard from './pages/Dashboard';
import Documents from './pages/Documents';
import InterviewPrep from './pages/InterviewPrep';
import Jobs from './pages/Jobs';
import Login from './pages/Login';
import Settings from './pages/Settings';
import SetupRequired from './pages/SetupRequired';
import StudyPlanPage from './pages/StudyPlan';

/** Sidebar + header shell for every signed-in page. */
function AppLayout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col lg:pl-64">
        <Header onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          {/*
            Fade/slide each page in. Keying by pathname remounts the wrapper on
            navigation. (No exit animation on purpose: waiting for exits can
            block route changes while nested layout animations are running.)
          */}
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <Routes location={location}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/jobs" element={<Jobs />} />
              <Route path="/prep" element={<InterviewPrep />} />
              <Route path="/study" element={<StudyPlanPage />} />
              <Route path="/documents" element={<Documents />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </motion.div>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  const { theme } = useTheme();

  return (
    <>
      {isFirebaseConfigured ? (
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/*"
            element={
              <RequireAuth>
                <AppLayout />
              </RequireAuth>
            }
          />
        </Routes>
      ) : (
        <SetupRequired />
      )}

      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 2500,
          style:
            theme === 'dark'
              ? { background: '#1e293b', color: '#f1f5f9', border: '1px solid #334155' }
              : { background: '#ffffff', color: '#0f172a', border: '1px solid #e2e8f0' },
        }}
      />
    </>
  );
}
