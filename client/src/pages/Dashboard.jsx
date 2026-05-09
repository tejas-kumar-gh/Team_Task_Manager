import { useState, useEffect } from 'react';
import api from '../api';
import { Layers, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    overdueTasks: 0
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/tasks/dashboard');
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch stats', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return <div className="animate-pulse flex space-x-4">Loading dashboard...</div>;
  }

  const statCards = [
    { title: 'Total Projects', value: stats.totalProjects, icon: <Layers size={24} className="text-blue-500" />, bg: 'bg-blue-500/10' },
    { title: 'Total Tasks', value: stats.totalTasks, icon: <Layers size={24} className="text-purple-500" />, bg: 'bg-purple-500/10' },
    { title: 'Completed', value: stats.completedTasks, icon: <CheckCircle2 size={24} className="text-emerald-500" />, bg: 'bg-emerald-500/10' },
    { title: 'Pending', value: stats.pendingTasks, icon: <Clock size={24} className="text-amber-500" />, bg: 'bg-amber-500/10' },
    { title: 'Overdue', value: stats.overdueTasks, icon: <AlertCircle size={24} className="text-red-500" />, bg: 'bg-red-500/10' },
  ];

  // Calculate progress
  const progress = stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {statCards.map((card, index) => (
          <div key={index} className="glass p-6 rounded-2xl flex items-center space-x-4 hover:-translate-y-1 transition-transform duration-300">
            <div className={`p-4 rounded-xl ${card.bg}`}>
              {card.icon}
            </div>
            <div>
              <p className="text-sm opacity-70 mb-1">{card.title}</p>
              <h3 className="text-2xl font-bold">{card.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass p-6 rounded-2xl">
          <h3 className="text-xl font-semibold mb-6">Task Progress</h3>
          <div className="flex items-center justify-center py-8">
            <div className="relative w-48 h-48">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="opacity-10" />
                <circle
                  cx="50" cy="50" r="40"
                  stroke="currentColor" strokeWidth="8" fill="transparent"
                  strokeDasharray={`${progress * 2.51} 251`}
                  className="text-primary transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold">{progress}%</span>
                <span className="text-sm opacity-70">Completed</span>
              </div>
            </div>
          </div>
        </div>

        <div className="glass p-6 rounded-2xl">
          <h3 className="text-xl font-semibold mb-6">Welcome, {user?.name}!</h3>
          <p className="opacity-80 mb-4 leading-relaxed">
            {user?.role === 'Admin' 
              ? "As an Admin, you can create and manage projects, assign tasks to your team members, and monitor the overall progress of all activities."
              : "Welcome to your dashboard! Here you can track your assigned projects and update your task statuses."}
          </p>
          <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 text-primary">
            <h4 className="font-semibold mb-2 flex items-center"><AlertCircle size={18} className="mr-2" /> Quick Tip</h4>
            <p className="text-sm opacity-90">Keep your task statuses updated to help the team track overall progress accurately.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
