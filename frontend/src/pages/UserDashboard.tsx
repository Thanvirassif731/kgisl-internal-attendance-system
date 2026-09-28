import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  CheckCircle2,
  Clock,
  ListTodo,
  CalendarCheck,
  Megaphone,
  Plus,
  ChevronRight,
  CalendarX,
  LogOut as LogOutIcon,
} from 'lucide-react';
import { Header } from '../components/Header';
import { StatCard } from '../components/StatCard';
import { ProgressBar } from '../components/ProgressBar';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';
import { useAuth } from '../contexts/AuthContext';
import { statsService, attendanceService, taskService, leaveService } from '../services/api';
import { UserDashboardData } from '../types';

export const UserDashboard: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<UserDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);

  // New task form state
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskPriority, setTaskPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');
  const [taskDueDate, setTaskDueDate] = useState('');

  // New leave form state
  const [leaveDate, setLeaveDate] = useState('');
  const [leaveReason, setLeaveReason] = useState('');
  const [leaveDescription, setLeaveDescription] = useState('');

  const navigate = useNavigate();

  const fetchDashboard = async () => {
    try {
      const res = await statsService.getUserDashboard();
      setData(res);
    } catch (err) {
      console.error('Error fetching user dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleCheckIn = async () => {
    setCheckingIn(true);
    try {
      await attendanceService.checkIn();
      fetchDashboard();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Check-in failed');
    } finally {
      setCheckingIn(false);
    }
  };

  const handleCheckOut = async () => {
    setCheckingOut(true);
    try {
      await attendanceService.checkOut();
      fetchDashboard();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Check-out failed');
    } finally {
      setCheckingOut(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle) return;
    try {
      await taskService.create({
        title: taskTitle,
        description: taskDescription,
        priority: taskPriority,
        dueDate: taskDueDate || null,
      });
      setIsTaskModalOpen(false);
      setTaskTitle('');
      setTaskDescription('');
      fetchDashboard();
    } catch (err) {
      console.error('Failed to create task:', err);
    }
  };

  const handleCreateLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveDate || !leaveReason) return;
    try {
      await leaveService.submit({
        leaveDate,
        reason: leaveReason,
        description: leaveDescription,
      });
      setIsLeaveModalOpen(false);
      setLeaveDate('');
      setLeaveReason('');
      setLeaveDescription('');
      fetchDashboard();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit leave request');
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const todayAtt = data?.todayAttendance;
  const isCheckedIn = !!todayAtt?.checkInTime;
  const isCheckedOut = !!todayAtt?.checkOutTime;

  return (
    <div className="flex-1 flex flex-col pb-12">
      <Header title="Dashboard" />

      <div className="px-8 pt-8 space-y-6 max-w-7xl w-full">
        {/* Banner Greeting */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Good morning, {user?.name}
            </h2>
            <p className="text-xs text-slate-400 mt-1 font-normal">
              Here is your today's attendance status and active task overview.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsTaskModalOpen(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm shadow-blue-500/20 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create task</span>
            </button>
            <button
              onClick={() => setIsLeaveModalOpen(true)}
              className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm transition-all"
            >
              <CalendarX className="w-3.5 h-3.5 text-slate-500" />
              <span>Request leave</span>
            </button>
          </div>
        </div>

        {/* Attendance Action Widget Card */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white shadow-lg shadow-blue-500/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-blue-200 text-xs font-medium">
              <CalendarCheck className="w-4 h-4" />
              <span>Today's Attendance Status</span>
            </div>
            <div className="text-xl font-bold mt-1">
              {!isCheckedIn
                ? 'You have not checked in yet today'
                : isCheckedOut
                ? `Checked out at ${todayAtt.checkOutTime}`
                : `Checked in at ${todayAtt.checkInTime} (${todayAtt.status})`}
            </div>
            <p className="text-xs text-blue-100 mt-1">
              Work hours: 09:00 AM - 06:00 PM • Standard check-in cutoff: 09:15 AM
            </p>
          </div>

          <div className="flex items-center gap-3">
            {!isCheckedIn ? (
              <button
                onClick={handleCheckIn}
                disabled={checkingIn}
                className="px-5 py-2.5 rounded-xl bg-white text-blue-600 hover:bg-blue-50 font-bold text-xs shadow-md transition-all flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>{checkingIn ? 'Checking in...' : 'Mark Check-In'}</span>
              </button>
            ) : !isCheckedOut ? (
              <button
                onClick={handleCheckOut}
                disabled={checkingOut}
                className="px-5 py-2.5 rounded-xl bg-white text-rose-600 hover:bg-rose-50 font-bold text-xs shadow-md transition-all flex items-center gap-2"
              >
                <LogOutIcon className="w-4 h-4 text-rose-500" />
                <span>{checkingOut ? 'Checking out...' : 'Mark Check-Out'}</span>
              </button>
            ) : (
              <div className="px-4 py-2 rounded-xl bg-white/20 text-white font-medium text-xs flex items-center gap-2 backdrop-blur-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                <span>Completed for today</span>
              </div>
            )}
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total tasks"
            value={data?.stats.totalTasks || 0}
            subtext={`${data?.stats.completionRate || 0}% overall completion`}
            icon={<ListTodo className="w-5 h-5 text-blue-600" />}
            iconBgColor="bg-blue-50"
          />
          <StatCard
            label="Pending tasks"
            value={data?.stats.pendingTasks || 0}
            subtext="Needs attention"
            icon={<Clock className="w-5 h-5 text-amber-600" />}
            iconBgColor="bg-amber-50"
          />
          <StatCard
            label="Tasks completed"
            value={data?.stats.completedTasks || 0}
            subtext="Finished tasks"
            icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />}
            iconBgColor="bg-emerald-50"
          />
          <StatCard
            label="Attendance rate"
            value={`${data?.stats.monthlyAttendanceRate || 94}%`}
            subtext="This month"
            icon={<CalendarCheck className="w-5 h-5 text-indigo-600" />}
            iconBgColor="bg-indigo-50"
          />
        </div>

        {/* Tasks and Announcements */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* My Tasks */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-sm font-bold text-slate-900">My active tasks</h3>
                <Link
                  to="/tasks"
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                >
                  <span>View all</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {data?.tasks && data.tasks.length > 0 ? (
                <div className="space-y-4">
                  {data.tasks.slice(0, 4).map((task) => (
                    <div
                      key={task.id}
                      onClick={() => navigate('/tasks')}
                      className="p-3 -mx-2.5 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group border border-slate-50"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="min-w-0 pr-3">
                          <h4 className="text-xs font-semibold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                            {task.title}
                          </h4>
                          <span className="text-[11px] text-slate-400">
                            {task.dueDate
                              ? `Due: ${new Date(task.dueDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}`
                              : 'No due date'}
                          </span>
                        </div>
                        <StatusBadge status={task.status} type="task" showDot={false} />
                      </div>
                      <ProgressBar progress={task.progress} showText />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-slate-400 text-xs">
                  No tasks assigned. Create one using the button above!
                </div>
              )}
            </div>
          </div>

          {/* Announcements & Leaves */}
          <div className="space-y-6">
            {/* Announcements */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-900">Latest announcements</h3>
                <Link
                  to="/announcements"
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                >
                  <span>View all</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="space-y-3">
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
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-slate-400">
                          {new Date(ann.createdAt).toLocaleDateString('en-US', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                        <StatusBadge status={ann.priority} type="announcement" showDot={false} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Leaves */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-900">Leave request status</h3>
                <Link
                  to="/leaves"
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                >
                  <span>View history</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {data?.recentLeaves && data.recentLeaves.length > 0 ? (
                <div className="space-y-2.5">
                  {data.recentLeaves.map((leave) => (
                    <div
                      key={leave.id}
                      className="p-3 rounded-xl bg-slate-50/70 border border-slate-100 flex items-center justify-between"
                    >
                      <div>
                        <div className="text-xs font-semibold text-slate-900">
                          {leave.reason}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Date: {leave.leaveDate}
                        </div>
                      </div>
                      <StatusBadge status={leave.status} type="leave" />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 py-3 text-center">
                  No recent leave requests
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Create Task Modal */}
      <Modal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        title="Create New Task"
        subtitle="Add a task to your personal backlog"
      >
        <form onSubmit={handleCreateTask} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Task Title</label>
            <input
              type="text"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              placeholder="e.g. Implement authentication middleware"
              required
              className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
            <textarea
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
              placeholder="Optional notes or details..."
              rows={3}
              className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Priority</label>
              <select
                value={taskPriority}
                onChange={(e: any) => setTaskPriority(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Due Date</label>
              <input
                type="date"
                value={taskDueDate}
                onChange={(e) => setTaskDueDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => setIsTaskModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
            >
              Save task
            </button>
          </div>
        </form>
      </Modal>

      {/* Submit Leave Modal */}
      <Modal
        isOpen={isLeaveModalOpen}
        onClose={() => setIsLeaveModalOpen(false)}
        title="Submit Leave Request"
        subtitle="Request absence for an upcoming working day"
      >
        <form onSubmit={handleCreateLeave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Leave Date</label>
            <input
              type="date"
              value={leaveDate}
              onChange={(e) => setLeaveDate(e.target.value)}
              required
              className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Reason</label>
            <input
              type="text"
              value={leaveReason}
              onChange={(e) => setLeaveReason(e.target.value)}
              placeholder="e.g. Medical appointment, Personal errand"
              required
              className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description (Optional)</label>
            <textarea
              value={leaveDescription}
              onChange={(e) => setLeaveDescription(e.target.value)}
              placeholder="Provide additional details if needed..."
              rows={3}
              className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => setIsLeaveModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
            >
              Submit request
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
