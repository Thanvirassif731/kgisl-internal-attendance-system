import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  CheckSquare,
  Megaphone,
  CalendarX,
  UserCog,
  UserCircle,
  LogOut,
  ClipboardCheck,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const Sidebar: React.FC = () => {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    {
      label: 'Dashboard',
      to: isAdmin ? '/admin/dashboard' : '/dashboard',
      icon: LayoutDashboard,
    },
    {
      label: 'Teams',
      to: '/teams',
      icon: Users,
    },
    {
      label: 'Attendance',
      to: '/attendance',
      icon: CalendarCheck,
    },
    {
      label: 'Tasks',
      to: '/tasks',
      icon: CheckSquare,
    },
    {
      label: 'Announcements',
      to: '/announcements',
      icon: Megaphone,
    },
    {
      label: 'Leave Requests',
      to: '/leaves',
      icon: CalendarX,
    },
    ...(isAdmin
      ? [
          {
            label: 'User Management',
            to: '/admin/users',
            icon: UserCog,
          },
        ]
      : []),
  ];

  return (
    <aside className="w-64 bg-[#0b132b] text-slate-300 flex flex-col flex-shrink-0 h-screen sticky top-0 select-none border-r border-[#152042]">
      {/* Brand Header */}
      <div className="p-6 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <ClipboardCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold tracking-wider text-xs text-white uppercase leading-none">
              INTERNAL
            </div>
            <div className="text-[10px] tracking-widest text-slate-400 uppercase font-medium mt-0.5">
              ATTENDANCE
            </div>
          </div>
        </div>

        {/* Role Pill Card */}
        <div className="mt-5 px-3 py-2 rounded-xl bg-[#121c3b] border border-[#1d2a55] flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-emerald-400/20 animate-pulse" />
          <span className="text-xs font-medium text-slate-200">
            {isAdmin ? 'Administrator' : user?.designation || 'Team Member'}
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                isActive
                  ? 'bg-[#182449] text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-[#121c3b]'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className="flex items-center gap-3">
                  <item.icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-blue-400' : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {isActive && (
                  <span className="w-1.5 h-4 bg-blue-500 rounded-full" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom User / Logout Section */}
      <div className="p-3 border-t border-[#152042] space-y-1">
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
              isActive
                ? 'bg-[#182449] text-white'
                : 'text-slate-400 hover:text-white hover:bg-[#121c3b]'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <div className="flex items-center gap-3">
                <UserCircle
                  className={`w-4 h-4 ${
                    isActive ? 'text-blue-400' : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                />
                <span>Profile</span>
              </div>
              {isActive && <span className="w-1.5 h-4 bg-blue-500 rounded-full" />}
            </>
          )}
        </NavLink>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-rose-300 hover:bg-[#1f1525] transition-all group"
        >
          <LogOut className="w-4 h-4 text-slate-400 group-hover:text-rose-400" />
          <span>Log out</span>
        </button>
      </div>
    </aside>
  );
};
