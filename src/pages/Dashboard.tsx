import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ActivityChart, StatusChart } from '../components/dashboard/Chart';
import StatsCards from '../components/dashboard/StatsCards';
import Timeline from '../components/dashboard/Timeline';
import UpcomingInterviews from '../components/dashboard/UpcomingInterviews';
import { useJobs } from '../hooks/useJobs';

export default function Dashboard() {
  const { jobs, activities } = useJobs();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold">{greeting} 👋</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Here is how your job search is going.</p>
        </div>
        <Link to="/jobs?new=1" className="btn-primary">
          <Plus size={16} /> Add application
        </Link>
      </div>

      <StatsCards jobs={jobs} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <StatusChart jobs={jobs} />
        <ActivityChart jobs={jobs} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="min-w-0 lg:col-span-3">
          <UpcomingInterviews jobs={jobs} />
        </div>
        <div className="min-w-0 lg:col-span-2">
          <Timeline activities={activities} />
        </div>
      </div>
    </div>
  );
}
