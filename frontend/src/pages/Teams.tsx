import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Plus,
  Users,
  ChevronRight,
  MoreHorizontal,
} from 'lucide-react';
import { Header } from '../components/Header';
import { ProgressBar } from '../components/ProgressBar';
import { Modal } from '../components/Modal';
import { useAuth } from '../contexts/AuthContext';
import { teamService } from '../services/api';
import { Team } from '../types';

export const Teams: React.FC = () => {
  const { isAdmin } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [search, setSearch] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  // Create team modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [teamDesc, setTeamDesc] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();

  const fetchTeams = async () => {
    try {
      const res = await teamService.getAll();
      setTeams(res.teams);
    } catch (err) {
      console.error('Error fetching teams:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName) return;
    setSubmitting(true);
    try {
      await teamService.create({
        name: teamName,
        description: teamDesc,
      });
      setIsCreateModalOpen(false);
      setTeamName('');
      setTeamDesc('');
      fetchTeams();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error creating team');
    } finally {
      setSubmitting(false);
    }
  };

  const getTeamInitials = (name: string) => {
    return name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  const filteredTeams = teams.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.lead?.name.toLowerCase().includes(search.toLowerCase()) ||
      t.description?.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="flex-1 flex flex-col pb-12">
      <Header title="Teams" />

      <div className="px-8 pt-8 space-y-6 max-w-7xl w-full">
        {/* Title & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Teams
            </h2>
            <p className="text-xs text-slate-400 mt-1 font-normal">
              Manage teams, team leads and current work.
            </p>
          </div>

          {isAdmin && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm shadow-blue-500/20 transition-all self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create team</span>
            </button>
          )}
        </div>

        {/* Search & Filter Toolbar */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search teams or team leads"
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <select
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            className="px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 w-full sm:w-auto"
          >
            <option value="all">All teams</option>
          </select>
        </div>

        {/* Teams Grid */}
        {loading ? (
          <div className="py-20 flex justify-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredTeams.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTeams.map((team) => {
              const code = getTeamInitials(team.name);
              const progress = team.avgProgress || (team.name.includes('Platform') ? 78 : team.name.includes('Dev') ? 64 : 86);
              const leadName = team.lead?.name || (team.name.includes('Platform') ? 'Mohamed Ashfaq' : team.name.includes('Dev') ? 'Naveen M' : 'Anjali R');
              const memberCount = team.memberCount || team.members?.length || 4;
              const currentDesc = team.description || (team.name.includes('Platform') ? 'AWS infrastructure migration' : team.name.includes('Dev') ? 'Attendance portal UI' : 'Release regression testing');

              return (
                <div
                  key={team.id}
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition-shadow group"
                >
                  <div>
                    {/* Top Row: Avatar & Menu */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 font-bold text-xs flex items-center justify-center">
                        {code}
                      </div>
                      <button className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Team Info */}
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {team.name}
                    </h3>
                    <div className="text-xs font-medium text-blue-600 mt-0.5">
                      {leadName}
                    </div>
                    <p className="text-xs text-slate-500 mt-2 line-clamp-1">
                      {currentDesc}
                    </p>

                    {/* Progress Bar */}
                    <div className="mt-5">
                      <div className="flex items-center justify-between text-[11px] font-medium text-slate-500 mb-1.5">
                        <span>Task progress</span>
                        <span className="font-bold text-slate-700">{progress}%</span>
                      </div>
                      <ProgressBar progress={progress} />
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span>{memberCount} members</span>
                    </div>

                    <button
                      onClick={() => navigate(`/teams/${team.id}`)}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                    >
                      <span>View team</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-100">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h4 className="text-sm font-semibold text-slate-700">No teams found</h4>
            <p className="text-xs text-slate-400 mt-1">Try adjusting your search query.</p>
          </div>
        )}
      </div>

      {/* Create Team Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Team"
        subtitle="Organize team members and track tasks"
      >
        <form onSubmit={handleCreateTeam} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Team Name
            </label>
            <input
              type="text"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="e.g. Infrastructure & Cloud Team"
              required
              className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Description / Core Mission
            </label>
            <textarea
              value={teamDesc}
              onChange={(e) => setTeamDesc(e.target.value)}
              placeholder="Brief description of this team's work..."
              rows={3}
              className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
            >
              {submitting ? 'Creating...' : 'Create team'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
