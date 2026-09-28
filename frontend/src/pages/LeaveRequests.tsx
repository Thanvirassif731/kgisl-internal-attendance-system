import React, { useState, useEffect } from 'react';
import {
  CalendarX,
  Plus,
  CheckCircle,
  XCircle,
  Clock,
  Check,
  X,
  Search,
} from 'lucide-react';
import { Header } from '../components/Header';
import { StatCard } from '../components/StatCard';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';
import { useAuth } from '../contexts/AuthContext';
import { leaveService } from '../services/api';
import { LeaveRequest } from '../types';

export const LeaveRequests: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [summary, setSummary] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [leaveDate, setLeaveDate] = useState('');
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchLeaves = async () => {
    try {
      if (isAdmin) {
        const res = await leaveService.getAdminLeaves({ status: statusFilter !== 'all' ? statusFilter : undefined });
        setLeaves(res.leaves);
        if (res.summary) setSummary(res.summary);
      } else {
        const res = await leaveService.getMyLeaves();
        setLeaves(res.leaves);
        const total = res.leaves.length;
        const pending = res.leaves.filter((l) => l.status === 'PENDING').length;
        const approved = res.leaves.filter((l) => l.status === 'APPROVED').length;
        const rejected = res.leaves.filter((l) => l.status === 'REJECTED').length;
        setSummary({ total, pending, approved, rejected });
      }
    } catch (err) {
      console.error('Error fetching leaves:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, [isAdmin, statusFilter]);

  const handleSubmitLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveDate || !reason) return;
    setSubmitting(true);
    try {
      await leaveService.submit({ leaveDate, reason, description });
      setIsModalOpen(false);
      setLeaveDate('');
      setReason('');
      setDescription('');
      fetchLeaves();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error submitting leave request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await leaveService.approve(id);
      fetchLeaves();
    } catch (err) {
      console.error('Failed to approve leave:', err);
    }
  };

  const handleReject = async (id: string) => {
    try {
      await leaveService.reject(id);
      fetchLeaves();
    } catch (err) {
      console.error('Failed to reject leave:', err);
    }
  };

  return (
    <div className="flex-1 flex flex-col pb-12">
      <Header title="Leave Requests" />

      <div className="px-8 pt-8 space-y-6 max-w-7xl w-full">
        {/* Title & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Leave Management
            </h2>
            <p className="text-xs text-slate-400 mt-1 font-normal">
              {isAdmin
                ? 'Review, approve, and track employee leave submissions.'
                : 'Submit your planned leaves and monitor approval status.'}
            </p>
          </div>

          {!isAdmin && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm shadow-blue-500/20 transition-all self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Submit leave request</span>
            </button>
          )}
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total requests"
            value={summary.total}
            subtext="All submissions"
            icon={<CalendarX className="w-5 h-5 text-blue-600" />}
            iconBgColor="bg-blue-50"
          />
          <StatCard
            label="Pending"
            value={summary.pending}
            subtext="Requires review"
            icon={<Clock className="w-5 h-5 text-amber-600" />}
            iconBgColor="bg-amber-50"
          />
          <StatCard
            label="Approved"
            value={summary.approved}
            subtext="Authorized leaves"
            icon={<CheckCircle className="w-5 h-5 text-emerald-600" />}
            iconBgColor="bg-emerald-50"
          />
          <StatCard
            label="Rejected"
            value={summary.rejected}
            subtext="Declined requests"
            icon={<XCircle className="w-5 h-5 text-rose-600" />}
            iconBgColor="bg-rose-50"
          />
        </div>

        {/* Filters if Admin */}
        {isAdmin && (
          <div className="flex items-center gap-2">
            {['all', 'PENDING', 'APPROVED', 'REJECTED'].map((filter) => (
              <button
                key={filter}
                onClick={() => setStatusFilter(filter)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
                  statusFilter === filter
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {filter.toLowerCase()}
              </button>
            ))}
          </div>
        )}

        {/* Leave Requests Table */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50">
                  <th className="py-4 px-6">USER</th>
                  <th className="py-4 px-6">DATE</th>
                  <th className="py-4 px-6">REASON</th>
                  <th className="py-4 px-6">REQUESTED ON</th>
                  <th className="py-4 px-6 text-center">STATUS</th>
                  {isAdmin && <th className="py-4 px-6 text-right">ACTION</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {loading ? (
                  <tr>
                    <td colSpan={isAdmin ? 6 : 5} className="py-12 text-center text-slate-400">
                      Loading leave requests...
                    </td>
                  </tr>
                ) : leaves.length > 0 ? (
                  leaves.map((leave) => {
                    const applicant = leave.user?.name || user?.name || 'Applicant';
                    return (
                      <tr key={leave.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-4 px-6">
                          <div className="font-semibold text-slate-900">{applicant}</div>
                          {leave.user?.rollNumber && (
                            <div className="text-[11px] text-slate-400">
                              {leave.user.rollNumber}
                            </div>
                          )}
                        </td>

                        <td className="py-4 px-6 font-medium text-slate-700">
                          {leave.leaveDate}
                        </td>

                        <td className="py-4 px-6 max-w-xs">
                          <div className="font-medium text-slate-800">{leave.reason}</div>
                          {leave.description && (
                            <div className="text-[11px] text-slate-400 truncate mt-0.5">
                              {leave.description}
                            </div>
                          )}
                        </td>

                        <td className="py-4 px-6 text-slate-500">
                          {new Date(leave.createdAt).toLocaleDateString('en-US', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </td>

                        <td className="py-4 px-6 text-center">
                          <StatusBadge status={leave.status} type="leave" />
                        </td>

                        {isAdmin && (
                          <td className="py-4 px-6 text-right">
                            {leave.status === 'PENDING' ? (
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleApprove(leave.id)}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold text-xs transition-colors flex items-center gap-1"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Approve</span>
                                </button>
                                <button
                                  onClick={() => handleReject(leave.id)}
                                  className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 font-semibold text-xs transition-colors flex items-center gap-1"
                                >
                                  <X className="w-3.5 h-3.5" />
                                  <span>Reject</span>
                                </button>
                              </div>
                            ) : (
                              <span className="text-[11px] text-slate-400 italic">
                                Reviewed
                              </span>
                            )}
                          </td>
                        )}
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={isAdmin ? 6 : 5} className="py-12 text-center text-slate-400">
                      No leave requests found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Submit Leave Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Submit Leave Request"
        subtitle="Request absence for an upcoming workday"
      >
        <form onSubmit={handleSubmitLeave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Leave Date
            </label>
            <input
              type="date"
              value={leaveDate}
              onChange={(e) => setLeaveDate(e.target.value)}
              required
              className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Reason
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Medical emergency, Family function"
              required
              className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain circumstance or handoff details..."
              rows={3}
              className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
            />
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
              disabled={submitting}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit request'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
