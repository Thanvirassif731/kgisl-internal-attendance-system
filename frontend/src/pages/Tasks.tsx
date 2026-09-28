import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  CheckCircle2,
  Trash2,
  Edit2,
  MoreVertical,
} from 'lucide-react';
import { Header } from '../components/Header';
import { ProgressBar } from '../components/ProgressBar';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';
import { useAuth } from '../contexts/AuthContext';
import { taskService, teamService, userService } from '../services/api';
import { Task, Team, User } from '../types';

export const Tasks: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'in_progress' | 'pending' | 'completed'>('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');
  const [status, setStatus] = useState<'PENDING' | 'IN_PROGRESS' | 'REVIEW' | 'COMPLETED'>('PENDING');
  const [progress, setProgress] = useState(0);
  const [dueDate, setDueDate] = useState('');
  const [teamId, setTeamId] = useState('');
  const [assignedUserId, setAssignedUserId] = useState('');

  const fetchTasks = async () => {
    try {
      if (isAdmin) {
        const res = await taskService.getAdminTasks();
        setTasks(res.tasks);
      } else {
        const res = await taskService.getUserTasks();
        setTasks(res.tasks);
      }
    } catch (err) {
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    if (isAdmin) {
      teamService.getAll().then((r) => setTeams(r.teams)).catch(() => {});
      userService.getAll().then((r) => setUsers(r.users)).catch(() => {});
    }
  }, [isAdmin]);

  const handleOpenCreateModal = () => {
    setEditingTask(null);
    setTitle('');
    setDescription('');
    setPriority('MEDIUM');
    setStatus('PENDING');
    setProgress(0);
    setDueDate('');
    setTeamId(teams[0]?.id || '');
    setAssignedUserId(user?.id || '');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (task: Task) => {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description || '');
    setPriority(task.priority);
    setStatus(task.status);
    setProgress(task.progress);
    setDueDate(task.dueDate ? task.dueDate.split('T')[0] : '');
    setTeamId(task.teamId || '');
    setAssignedUserId(task.userId);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    try {
      if (editingTask) {
        await taskService.update(editingTask.id, {
          title,
          description,
          priority,
          status,
          progress,
          dueDate: dueDate || null,
          teamId: teamId || null,
          userId: isAdmin ? assignedUserId : undefined,
        });
      } else {
        await taskService.create({
          title,
          description,
          priority,
          status,
          progress,
          dueDate: dueDate || null,
          teamId: teamId || null,
          userId: isAdmin && assignedUserId ? assignedUserId : undefined,
        });
      }
      setIsModalOpen(false);
      fetchTasks();
    } catch (err) {
      console.error('Failed to save task:', err);
    }
  };

  const handleQuickStatusToggle = async (task: Task) => {
    const nextStatus = task.status === 'COMPLETED' ? 'IN_PROGRESS' : 'COMPLETED';
    const nextProgress = nextStatus === 'COMPLETED' ? 100 : 50;
    try {
      await taskService.updateStatus(task.id, nextStatus, nextProgress);
      fetchTasks();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await taskService.delete(id);
      fetchTasks();
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  };

  // Filter tasks based on tabs and search
  const filteredTasks = tasks.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.user?.name.toLowerCase().includes(search.toLowerCase()) ||
      t.team?.name.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === 'in_progress') return t.status === 'IN_PROGRESS';
    if (activeTab === 'pending') return t.status === 'PENDING';
    if (activeTab === 'completed') return t.status === 'COMPLETED';
    return true;
  });

  const totalCount = tasks.length;
  const inProgressCount = tasks.filter((t) => t.status === 'IN_PROGRESS').length;
  const pendingCount = tasks.filter((t) => t.status === 'PENDING').length;
  const completedCount = tasks.filter((t) => t.status === 'COMPLETED').length;

  return (
    <div className="flex-1 flex flex-col pb-12">
      <Header title="Tasks" />

      <div className="px-8 pt-8 space-y-6 max-w-7xl w-full">
        {/* Title & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Tasks
            </h2>
            <p className="text-xs text-slate-400 mt-1 font-normal">
              Track current work and task progress.
            </p>
          </div>

          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm shadow-blue-500/20 transition-all self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create task</span>
          </button>
        </div>

        {/* Tab Filters and Search */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Tabs Container */}
          <div className="inline-flex p-1 bg-white border border-slate-200/80 rounded-2xl shadow-sm self-start">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'all'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All {totalCount}
            </button>
            <button
              onClick={() => setActiveTab('in_progress')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'in_progress'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              In progress {inProgressCount}
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'pending'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pending {pendingCount}
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'completed'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Completed {completedCount}
            </button>
          </div>

          {/* Search Box */}
          <div className="relative max-w-xs w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tasks, assignees..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Tasks Table Card */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50">
                  <th className="py-4 px-6">TASK</th>
                  <th className="py-4 px-6">TEAM</th>
                  <th className="py-4 px-6">ASSIGNEE</th>
                  <th className="py-4 px-6">DUE</th>
                  <th className="py-4 px-6">PROGRESS</th>
                  <th className="py-4 px-6 text-center">STATUS</th>
                  <th className="py-4 px-6 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                      Loading tasks...
                    </td>
                  </tr>
                ) : filteredTasks.length > 0 ? (
                  filteredTasks.map((task) => {
                    const dueFormatted = task.dueDate
                      ? new Date(task.dueDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })
                      : '27 Sep';

                    return (
                      <tr
                        key={task.id}
                        className="hover:bg-slate-50/70 transition-colors group"
                      >
                        {/* Task Title */}
                        <td className="py-4 px-6 font-semibold text-slate-900 max-w-xs">
                          <div className="truncate">{task.title}</div>
                          {task.description && (
                            <div className="text-[11px] text-slate-400 font-normal truncate mt-0.5">
                              {task.description}
                            </div>
                          )}
                        </td>

                        {/* Team */}
                        <td className="py-4 px-6 text-slate-600 font-medium">
                          {task.team?.name || 'Platform Team'}
                        </td>

                        {/* Assignee */}
                        <td className="py-4 px-6 text-slate-700 font-medium">
                          {task.user?.name || 'Mohamed Ashfaq'}
                        </td>

                        {/* Due Date */}
                        <td className="py-4 px-6 text-slate-500 whitespace-nowrap">
                          {dueFormatted}
                        </td>

                        {/* Progress */}
                        <td className="py-4 px-6 min-w-[140px]">
                          <ProgressBar progress={task.progress} showText />
                        </td>

                        {/* Status */}
                        <td className="py-4 px-6 text-center">
                          <StatusBadge status={task.status} type="task" showDot={false} />
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-6 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleQuickStatusToggle(task)}
                              title={task.status === 'COMPLETED' ? 'Mark In Progress' : 'Mark Completed'}
                              className={`p-1.5 rounded-lg transition-colors ${
                                task.status === 'COMPLETED'
                                  ? 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100'
                                  : 'text-slate-400 hover:text-emerald-600 hover:bg-slate-100'
                              }`}
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => handleOpenEditModal(task)}
                              title="Edit task"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => handleDeleteTask(task.id)}
                              title="Delete task"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      No tasks found matching your filter criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Create / Edit Task Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTask ? 'Edit Task' : 'Create Task'}
        subtitle={editingTask ? 'Update task deliverables and progress' : 'Assign or log a new task'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Task Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. AWS infrastructure migration"
              required
              className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed instructions or acceptance criteria..."
              rows={3}
              className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
            />
          </div>

          {isAdmin && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Assignee
                </label>
                <select
                  value={assignedUserId}
                  onChange={(e) => setAssignedUserId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  <option value="">Select Assignee</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Team
                </label>
                <select
                  value={teamId}
                  onChange={(e) => setTeamId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  <option value="">No Team</option>
                  {teams.map((tm) => (
                    <option key={tm.id} value={tm.id}>
                      {tm.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e: any) => setPriority(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e: any) => {
                  setStatus(e.target.value);
                  if (e.target.value === 'COMPLETED') setProgress(100);
                }}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                <option value="PENDING">Pending</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="REVIEW">Review</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Progress: {progress}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={progress}
                onChange={(e) => setProgress(parseInt(e.target.value, 10))}
                className="w-full mt-2 accent-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
            >
              {editingTask ? 'Save changes' : 'Create task'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
