import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Megaphone,
  ChevronRight,
  Download,
} from 'lucide-react';
import { Header } from '../components/Header';
import { ProgressBar } from '../components/ProgressBar';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';
import { teamService, taskService, announcementService } from '../services/api';
import { Team } from '../types';

export const TeamDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isAssignTaskModalOpen, setIsAssignTaskModalOpen] = useState(false);
  const [isTeamAnnouncementModalOpen, setIsTeamAnnouncementModalOpen] = useState(false);

  // Task form
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskPriority, setTaskPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('HIGH');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [assignedUserId, setAssignedUserId] = useState('');

  // Announcement form
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');

  const fetchTeam = async () => {
    if (!id) return;
    try {
      const res = await teamService.getById(id);
      setTeam(res.team);
      if (res.team.members && res.team.members.length > 0) {
        setAssignedUserId(res.team.members[0].id);
      }
    } catch (err) {
      console.error('Error fetching team details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, [id]);

  const handleAssignTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle || !assignedUserId) return;
    try {
      await taskService.create({
        title: taskTitle,
        description: taskDesc,
        priority: taskPriority,
        dueDate: taskDueDate || null,
        userId: assignedUserId,
        teamId: id,
      });
      setIsAssignTaskModalOpen(false);
      setTaskTitle('');
      setTaskDesc('');
      fetchTeam();
    } catch (err) {
      console.error('Failed to assign task:', err);
    }
  };

  const handlePostTeamAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle || !annContent) return;
    try {
      await announcementService.create({
        title: `[${team?.name}] ${annTitle}`,
        content: annContent,
        priority: 'IMPORTANT',
      });
      setIsTeamAnnouncementModalOpen(false);
      setAnnTitle('');
      setAnnContent('');
      alert('Team announcement broadcasted!');
    } catch (err) {
      console.error('Failed to post announcement:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!team) {
    return (
      <div className="p-8 text-center">
        <p>Team not found</p>
        <Link to="/teams" className="text-blue-600 mt-2 inline-block">
          Back to teams
        </Link>
      </div>
    );
  }

  const currentTask = team.currentTask || {
    title: 'AWS infrastructure migration',
    description: 'Move production workloads to the new cloud environment and validate the deployment checklist.',
    dueDate: '2026-09-27',
    priority: 'HIGH',
    progress: 78,
  };

  const leadName = team.lead?.name || 'Mohamed Ashfaq';
  const members = team.members || [];

  return (
    <div className="flex-1 flex flex-col pb-12">
      <Header title="Team details" />

      <div className="px-8 pt-8 space-y-6 max-w-7xl w-full">
        {/* Back Link */}
        <Link
          to="/teams"
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 font-medium transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to teams</span>
        </Link>

        {/* Title & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              {team.name}
            </h2>
            <p className="text-xs text-slate-400 mt-1 font-normal">
              Team lead: {leadName} • {members.length} members
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAssignTaskModalOpen(true)}
              className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Assign task</span>
            </button>

            <button
              onClick={() => setIsTeamAnnouncementModalOpen(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm shadow-blue-500/20 transition-all"
            >
              <Megaphone className="w-3.5 h-3.5" />
              <span>Team announcement</span>
            </button>
          </div>
        </div>

        {/* Team Details Grid: Left: Team members, Right: Current task */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Team Members List (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-bold text-slate-900">Team members</h3>
              <button
                onClick={() => {
                  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(members, null, 2));
                  const dlAnchorElem = document.createElement('a');
                  dlAnchorElem.setAttribute("href", dataStr);
                  dlAnchorElem.setAttribute("download", `${team.name}_members.json`);
                  dlAnchorElem.click();
                }}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
              >
                <span>Export</span>
                <Download className="w-3 h-3" />
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {members.map((member: any) => {
                const initials = (member.avatar || member.name.slice(0, 2)).toUpperCase();
                const latestAttendance = member.attendances?.[0]?.status || (member.name.includes('Karthik') ? 'LATE' : member.name.includes('Meena') ? 'ABSENT' : 'PRESENT');
                const task = member.tasks?.[0] || {
                  title: member.name.includes('Ashfaq')
                    ? 'AWS infrastructure migration'
                    : member.name.includes('Srikanth')
                    ? 'Dashboard components'
                    : member.name.includes('Karthik')
                    ? 'CI/CD pipeline setup'
                    : 'Documentation',
                  progress: member.name.includes('Ashfaq') ? 78 : member.name.includes('Srikanth') ? 55 : member.name.includes('Karthik') ? 100 : 40,
                };

                return (
                  <div
                    key={member.id}
                    onClick={() => navigate(`/members/${member.id}`)}
                    className="py-3.5 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/70 px-2 -mx-2 rounded-xl transition-colors group"
                  >
                    {/* User Info */}
                    <div className="flex items-center gap-3 min-w-[160px]">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-xs flex items-center justify-center">
                        {initials}
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {member.name}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {member.designation || 'Developer'}
                        </div>
                      </div>
                    </div>

                    {/* Attendance Status */}
                    <div className="w-20 text-left">
                      <StatusBadge status={latestAttendance} type="attendance" />
                    </div>

                    {/* Assigned Task & Progress */}
                    <div className="flex-1 max-w-[200px]">
                      <div className="text-[11px] font-medium text-slate-700 truncate mb-1">
                        {task.title}
                      </div>
                      <ProgressBar progress={task.progress} />
                    </div>

                    {/* Chevron */}
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 group-hover:translate-x-0.5 transition-all" />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Current Task Card (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col justify-between">
            <div>
              <div className="text-xs font-bold text-slate-900 mb-6">
                Current task
              </div>

              <div className="text-[11px] font-bold tracking-wider text-blue-600 uppercase">
                TEAM TASK
              </div>

              <h3 className="text-base font-bold text-slate-900 mt-1">
                {currentTask.title}
              </h3>

              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                {currentTask.description || 'Move production workloads to the new cloud environment and validate the deployment checklist.'}
              </p>

              <div className="grid grid-cols-2 gap-4 mt-6 pt-5 border-t border-slate-100">
                <div>
                  <div className="text-[11px] font-medium text-slate-400">Due</div>
                  <div className="text-xs font-semibold text-slate-900 mt-0.5">
                    {currentTask.dueDate
                      ? new Date(currentTask.dueDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
                      : '27 Sep 2026'}
                  </div>
                </div>

                <div>
                  <div className="text-[11px] font-medium text-slate-400">Priority</div>
                  <div className="mt-0.5">
                    <StatusBadge status={currentTask.priority || 'HIGH'} type="priority" />
                  </div>
                </div>
              </div>
            </div>

            {/* Overall Progress */}
            <div className="mt-8 pt-6 border-t border-slate-100">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-medium text-slate-500">Overall progress</span>
                <span className="font-bold text-slate-900">{currentTask.progress || 78}%</span>
              </div>
              <ProgressBar progress={currentTask.progress || 78} />
            </div>
          </div>
        </div>
      </div>

      {/* Assign Task Modal */}
      <Modal
        isOpen={isAssignTaskModalOpen}
        onClose={() => setIsAssignTaskModalOpen(false)}
        title="Assign Team Task"
        subtitle={`Assign a new task to a member of ${team.name}`}
      >
        <form onSubmit={handleAssignTask} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Task Title</label>
            <input
              type="text"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              placeholder="e.g. Database replication testing"
              required
              className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Assignee</label>
            <select
              value={assignedUserId}
              onChange={(e) => setAssignedUserId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.designation || 'Developer'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
            <textarea
              value={taskDesc}
              onChange={(e) => setTaskDesc(e.target.value)}
              placeholder="Task instructions and expectations..."
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
              onClick={() => setIsAssignTaskModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
            >
              Assign task
            </button>
          </div>
        </form>
      </Modal>

      {/* Team Announcement Modal */}
      <Modal
        isOpen={isTeamAnnouncementModalOpen}
        onClose={() => setIsTeamAnnouncementModalOpen(false)}
        title="Broadcast Team Announcement"
        subtitle={`Post an announcement targeted for ${team.name}`}
      >
        <form onSubmit={handlePostTeamAnnouncement} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Title</label>
            <input
              type="text"
              value={annTitle}
              onChange={(e) => setAnnTitle(e.target.value)}
              placeholder="e.g. Sprint demo readiness"
              required
              className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Message</label>
            <textarea
              value={annContent}
              onChange={(e) => setAnnContent(e.target.value)}
              placeholder="Type message for team members..."
              rows={4}
              required
              className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => setIsTeamAnnouncementModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
            >
              Post team announcement
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
