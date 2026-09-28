import React from 'react';
import { Bell } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

interface HeaderProps {
  title: string;
  breadcrumb?: string;
  actions?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  breadcrumb = 'Attendance & Task Management',
  actions,
}) => {
  const { user, isAdmin } = useAuth();

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <header className="px-8 py-5 flex items-center justify-between border-b border-slate-100 bg-white/70 backdrop-blur-md sticky top-0 z-30">
      <div>
        <div className="text-[11px] font-medium text-slate-400 tracking-wide uppercase">
          {breadcrumb}
        </div>
        <h1 className="text-xl font-bold text-slate-900 mt-0.5 tracking-tight">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-4">
        {actions && <div className="flex items-center gap-3">{actions}</div>}

        {/* Notifications */}
        <button
          className="w-10 h-10 rounded-xl border border-slate-200/80 flex items-center justify-center text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors relative"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="w-2 h-2 rounded-full bg-blue-600 absolute top-2.5 right-2.5 ring-2 ring-white" />
        </button>

        {/* User Profile Pill */}
        <Link
          to="/profile"
          className="flex items-center gap-3 pl-2 pr-3 py-1.5 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200/60"
        >
          <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 font-semibold text-xs flex items-center justify-center border border-blue-200/60">
            {user?.avatar || getInitials(user?.name)}
          </div>
          <div className="text-left hidden md:block">
            <div className="text-xs font-semibold text-slate-900 leading-tight">
              {user?.name || 'User'}
            </div>
            <div className="text-[11px] text-slate-400 font-normal">
              {isAdmin ? 'Administrator' : user?.designation || 'Member'}
            </div>
          </div>
        </Link>
      </div>
    </header>
  );
};
