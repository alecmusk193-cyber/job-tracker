import { BookOpen, Briefcase, FileText, GraduationCap, LayoutDashboard, Settings } from 'lucide-react';

/** Single source of truth for sidebar links and header titles. */
export const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/jobs', label: 'Job Tracker', icon: Briefcase },
  { to: '/prep', label: 'Interview Prep', icon: GraduationCap },
  { to: '/study', label: 'Study Plan', icon: BookOpen },
  { to: '/documents', label: 'Documents', icon: FileText },
  { to: '/settings', label: 'Backup & Settings', icon: Settings },
];
