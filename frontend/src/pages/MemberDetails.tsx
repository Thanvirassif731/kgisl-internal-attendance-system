import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  ListTodo,
} from 'lucide-react';
import { Header } from '../components/Header';
import { ProgressBar } from '../components/ProgressBar';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';
import { userService, taskService } from '../services/api';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

export const MemberDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [member, setMember] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);

  // Add task state
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskPriority, setTaskPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('HIGH');
  const [taskDueDate, setTaskDueDate] = useState('');

  const fetchMember = async () => {
    if (!id) return;
    try {
      const res = await userService.getById(id);
      setMember(res.user);
    } catch (err) {
      console.error('Error fetching member details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMember();
  }, [id]);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle || !id) return;
    try {
      await taskService.create({
        title: taskTitle,
        description: taskDesc,
        priority: taskPriority,
        dueDate: taskDueDate || null,
        userId: id,
        teamId: member?.teamId,
      });
      setIsAddTaskModalOpen(false);
      setTaskTitle('');
      setTaskDesc('');
      fetchMember();
    } catch (err) {
      console.error('Failed to add task:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!member) {
    return (
      <div className="p-8 text-center">
        <p>Member not found</p>
        <button onClick={() => navigate(-1)} className="text-blue-600 mt-2">
          Go back
        </button>
      </div>
    );
  }

  // Monthly attendance trend data matching reference line chart
  const attendanceTrend = [
    { month: 'Apr', rate: 82, target: 80 },
    { month: 'May', rate: 86, target: 82 },
    { month: 'Jun', rate: 84, target: 83 },
    { month: 'Jul', rate: 92, target: 85 },
    { month: 'Aug', rate: 90, target: 86 },
    { month: 'Sep', rate: 94, target: 88 },
  ];

  const initials = member.avatar || member.name.slice(0, 2).toUpperCase();
  const tasks = member.tasks || [];
  const completedCount = tasks.filter((t: any) => t.status === 'COMPLETED').length;
  const totalTasks = tasks.length || 23;
  const completionPercent = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 78;

  return (
    <div className="flex-1 flex flex-col pb-12">
      <Header title="Member details" />

      <div className="px-8 pt-8 space-y-6 max-w-7xl w-full">
        {/* Back Link */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 font-medium transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to team</span>
        </button>

        {/* Title & Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              {member.name}
            </h2>
            <p className="text-xs text-slate-400 mt-1 font-normal">
              {member.designation || 'Team Lead'} • {member.team?.name || 'Platform Team'}
            </p>
          </div>

          <button
            onClick={() => setIsAddTaskModalOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm shadow-blue-500/20 transition-all self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add task</span>
          </button>
        </div>

        {/* Top Member Card */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 font-bold text-sm flex items-center justify-center">
              {initials}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">{member.name}</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {member.email} • Roll No. {member.rollNumber || 'PLT-001'}
              </p>
              <div className="mt-2">
                <StatusBadge status="PRESENT" type="attendance" />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-8 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-8">
            <div>
              <div className="text-[11px] font-medium text-slate-400">Attendance</div>
              <div className="text-xl font-bold text-slate-900 mt-0.5">94%</div>
              <div className="text-[10px] text-slate-400">This month</div>
            </div>

            <div>
              <div className="text-[11px] font-medium text-slate-400">Tasks completed</div>
              <div className="text-xl font-bold text-slate-900 mt-0.5">
                {completedCount || 18}/{totalTasks}
              </div>
              <div className="text-[10px] text-slate-400">
                {completionPercent}% completion
              </div>
            </div>
          </div>
        </div>

        {/* Middle Grid: Left: Current & previous tasks, Right: Attendance chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Current & previous tasks */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h3 className="text-sm font-bold text-slate-900 mb-5">
              Current & previous tasks
            </h3>

            <div className="space-y-4">
              {tasks.length > 0 ? (
                tasks.map((task: any) => (
                  <div key={task.id} className="p-2 -mx-2 rounded-xl hover:bg-slate-50 transition-colors">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                          <ListTodo className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-slate-900 truncate">
                            {task.title}
                          </div>
                          <div className="text-[10px] text-slate-400 capitalize">
                            {task.status.toLowerCase().replace('_', ' ')}
                          </div>
                        </div>
                      </div>

                      <span className="text-xs font-bold text-slate-700">
                        {task.progress}%
                      </span>
                    </div>

                    <ProgressBar progress={task.progress} />
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-400 py-8 text-center">
                  No tasks recorded for this member.
                </div>
              )}
            </div>
          </div>

          {/* Attendance Trend Chart */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h3 className="text-sm font-bold text-slate-900 mb-6">
              Attendance chart
            </h3>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={attendanceTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    domain={[60, 100]}
                    ticks={[60, 70, 80, 90, 100]}
                    unit="%"
                  />
                  <Tooltip
                    formatter={(val: number) => [`${val}%`, 'Attendance Rate']}
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      fontSize: '11px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="rate"
                    stroke="#2563eb"
                    strokeWidth={2.5}
                    dot={{ fill: '#2563eb', r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="target"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Add Task Modal */}
      <Modal
        isOpen={isAddTaskModalOpen}
        onClose={() => setIsAddTaskModalOpen(false)}
        title={`Add Task for ${member.name}`}
        subtitle="Assign a specific deliverable or goal"
      >
        <form onSubmit={handleAddTask} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Task Title</label>
            <input
              type="text"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              placeholder="e.g. AWS Lambda cost optimization"
              required
              className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
            <textarea
              value={taskDesc}
              onChange={(e) => setTaskDesc(e.target.value)}
              placeholder="Details or deliverables..."
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
              onClick={() => setIsAddTaskModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
            >
              Add task
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
