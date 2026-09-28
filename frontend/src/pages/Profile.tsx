import React, { useState } from 'react';
import { Header } from '../components/Header';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/api';

export const Profile: React.FC = () => {
  const { user, isAdmin, updateUser } = useAuth();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const initials = user?.avatar || (user?.name ? user.name.slice(0, 2).toUpperCase() : 'AU');

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await authService.updateProfile({
        name,
        email,
        password: password || undefined,
      });
      updateUser(res.user);
      setIsEditModalOpen(false);
      setPassword('');
      alert('Profile updated successfully!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col pb-12">
      <Header title="Profile" />

      <div className="px-8 pt-8 space-y-6 max-w-5xl w-full">
        {/* Title & Edit Button */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Profile
            </h2>
            <p className="text-xs text-slate-400 mt-1 font-normal">
              Manage your account information.
            </p>
          </div>

          <button
            onClick={() => {
              setName(user?.name || '');
              setEmail(user?.email || '');
              setPassword('');
              setIsEditModalOpen(true);
            }}
            className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 rounded-xl text-xs font-semibold shadow-sm transition-all"
          >
            Edit profile
          </button>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 max-w-3xl">
          {/* Header section with avatar */}
          <div className="flex items-center gap-5 pb-6 border-b border-slate-100">
            <div className="w-16 h-16 rounded-2xl bg-blue-100 text-blue-700 font-bold text-lg flex items-center justify-center">
              {initials}
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900">{user?.name}</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {user?.designation || (isAdmin ? 'System Administrator' : 'Team Member')}
              </p>
              <div className="mt-2">
                <StatusBadge status="ACTIVE" type="account" />
              </div>
            </div>
          </div>

          {/* Grid Information */}
          <div className="grid grid-cols-2 gap-y-6 pt-6 text-xs">
            <div>
              <div className="text-[11px] font-medium text-slate-400">Email</div>
              <div className="font-semibold text-slate-800 mt-1">{user?.email}</div>
            </div>

            <div>
              <div className="text-[11px] font-medium text-slate-400">Role</div>
              <div className="font-semibold text-slate-800 mt-1">
                {isAdmin ? 'Administrator' : 'Team Member'}
              </div>
            </div>

            <div>
              <div className="text-[11px] font-medium text-slate-400">Username</div>
              <div className="font-semibold text-slate-800 mt-1">{user?.username}</div>
            </div>

            <div>
              <div className="text-[11px] font-medium text-slate-400">Last login</div>
              <div className="font-semibold text-slate-800 mt-1">
                {user?.lastLogin
                  ? new Date(user.lastLogin).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : 'Today, 09:04 AM'}
              </div>
            </div>

            {user?.rollNumber && (
              <div>
                <div className="text-[11px] font-medium text-slate-400">Roll Number</div>
                <div className="font-semibold text-slate-800 mt-1 font-mono">
                  {user.rollNumber}
                </div>
              </div>
            )}

            {user?.team?.name && (
              <div>
                <div className="text-[11px] font-medium text-slate-400">Team</div>
                <div className="font-semibold text-slate-800 mt-1">
                  {user.team.name}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Profile"
        subtitle="Update your personal account credentials"
      >
        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              New Password (Optional)
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Leave blank to keep current password"
              minLength={6}
              className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
            >
              {submitting ? 'Updating...' : 'Save changes'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
