import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
  Megaphone,
  ChevronRight,
  ListTodo,
} from 'lucide-react';
import { Header } from '../components/Header';
import { StatCard } from '../components/StatCard';
import { ProgressBar } from '../components/ProgressBar';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';
import { statsService, announcementService } from '../services/api';
import { AdminDashboardData } from '../types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

export const AdminDashboard: React.FC = () => {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newPriority, setNewPriority] = useState('IMPORTANT');
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();

  const fetchDashboard = async () => {
    try {
      const res = await statsService.getAdminDashboard();
      setData(res);
    } catch (err) {
      console.error('Error fetching admin dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newContent) return;
    setSubmitting(true);
    try {
      await announcementService.create({
        title: newTitle,
        content: newContent,
        priority: newPriority,
      });
      setIsAnnouncementModalOpen(false);
      setNewTitle('');
      setNewContent('');
      fetchDashboard();
    } catch (err) {
      console.error('Failed to post announcement:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const stats = data?.stats || {
    totalMembers: 48,
    teamsCount: 8,
    presentToday: 42,
    presentPercentage: '87.5%',
    lateToday: 3,
    latePercentage: '6.3%',
    openTasks: 17,
    dueThisWeek: 5,
    pendingLeaves: 1,
  };

  const attendanceData = data?.attendanceThisWeek || [
    { day: 'Mon', percentage: 88 },
    { day: 'Tue', percentage: 92 },
    { day: 'Wed', percentage: 84 },
    { day: 'Thu', percentage: 90 },
    { day: 'Fri', percentage: 87 },
  ];

  return (
    <div className="flex-1 flex flex-col pb-12">
      <Header title="Dashboard" />

      <div className="px-8 pt-8 space-y-6 max-w-7xl w-full">
        {/* Banner Greeting & Top Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Good morning, Admin
            </h2>
            <p className="text-xs text-slate-400 mt-1 font-normal">
              Here is today's attendance and task overview.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAnnouncementModalOpen(true)}
              className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm transition-all"
            >
              <Megaphone className="w-3.5 h-3.5 text-slate-600" />
              <span>New announcement</span>
            </button>

            <button
              onClick={() => navigate('/teams')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm shadow-blue-500/20 transition-all"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Manage teams</span>
            </button>
          </div>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total members"
            value={stats.totalMembers}
            subtext={`Across ${stats.teamsCount} teams`}
            icon={<Users className="w-5 h-5 text-blue-600" />}
            iconBgColor="bg-blue-50"
          />
          <StatCard
            label="Present today"
            value={stats.presentToday}
            subtext={`${stats.presentPercentage} attendance`}
            icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />}
            iconBgColor="bg-emerald-50"
          />
          <StatCard
            label="Late today"
            value={stats.lateToday}
            subtext={`${stats.latePercentage} of members`}
            icon={<Clock className="w-5 h-5 text-amber-600" />}
            iconBgColor="bg-amber-50"
          />
          <StatCard
            label="Open tasks"
            value={stats.openTasks}
            subtext={`${stats.dueThisWeek} due this week`}
            icon={<AlertCircle className="w-5 h-5 text-rose-600" />}
            iconBgColor="bg-rose-50"
          />
        </div>

        {/* Middle Row: Teams Overview & Latest Announcements */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Teams Overview */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-sm font-bold text-slate-900">Teams overview</h3>
                <Link
                  to="/teams"
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                >
                  <span>View all</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="space-y-4">
                {(data?.teamsOverview || []).map((team) => (
                  <div
                    key={team.id}
                    onClick={() => navigate(`/teams/${team.id}`)}
                    className="p-2.5 -mx-2.5 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-xs flex items-center justify-center">
                          {team.code}
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                            {team.name}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            Lead: {team.leadName} • {team.memberCount} members
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-800">
                          {team.progress}%
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </div>

                    <ProgressBar progress={team.progress} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Latest Announcements */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-sm font-bold text-slate-900">
                  Latest announcements
                </h3>
                <Link
                  to="/announcements"
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                >
                  <span>View all</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="space-y-4">
                {(data?.latestAnnouncements || []).map((ann) => (
                  <div
                    key={ann.id}
                    onClick={() => navigate('/announcements')}
                    className="flex items-start gap-3 p-2.5 -mx-2.5 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group"
                  >
                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Megaphone className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-semibold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                        {ann.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                        {ann.content}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-[10px] text-slate-400">
                          {new Date(ann.createdAt).toLocaleDateString('en-US', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                        <StatusBadge
                          status={ann.priority}
                          type="announcement"
                          showDot={false}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Row: Attendance this week chart & Tasks needing attention */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Attendance this week chart */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h3 className="text-sm font-bold text-slate-900 mb-6">
              Attendance this week
            </h3>

            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={attendanceData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    domain={[0, 100]}
                    ticks={[0, 25, 50, 75, 100]}
                    unit="%"
                  />
                  <Tooltip
                    formatter={(val: number) => [`${val}%`, 'Attendance']}
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      fontSize: '11px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                    }}
                  />
                  <Bar
                    dataKey="percentage"
                    fill="#3b82f6"
                    radius={[6, 6, 0, 0]}
                    barSize={28}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Tasks needing attention */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-sm font-bold text-slate-900">
                  Tasks needing attention
                </h3>
                <Link
                  to="/tasks"
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                >
                  <span>View tasks</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="space-y-4">
                {(data?.tasksNeedingAttention || []).map((task) => (
                  <div
                    key={task.id}
                    onClick={() => navigate('/tasks')}
                    className="flex items-center justify-between p-2.5 -mx-2.5 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center flex-shrink-0">
                        <ListTodo className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                          {task.title}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {task.teamName} • {task.dueText}
                        </div>
                      </div>
                    </div>

                    <StatusBadge
                      status={task.rawStatus}
                      type="task"
                      showDot={false}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* New Announcement Modal */}
      <Modal
        isOpen={isAnnouncementModalOpen}
        onClose={() => setIsAnnouncementModalOpen(false)}
        title="Create New Announcement"
        subtitle="Broadcast an update to all employees and teams"
      >
        <form onSubmit={handleCreateAnnouncement} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Title
            </label>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Announcement title"
              required
              className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Priority
            </label>
            <select
              value={newPriority}
              onChange={(e) => setNewPriority(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="IMPORTANT">Important</option>
              <option value="MEETING">Meeting</option>
              <option value="NOTICE">Notice</option>
              <option value="GENERAL">General</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Message
            </label>
            <textarea
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="Type your announcement here..."
              rows={4}
              required
              className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => setIsAnnouncementModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
            >
              {submitting ? 'Posting...' : 'Post announcement'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
