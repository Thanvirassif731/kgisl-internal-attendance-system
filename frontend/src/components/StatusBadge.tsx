import React from 'react';

interface StatusBadgeProps {
  status: string;
  type?: 'attendance' | 'task' | 'priority' | 'announcement' | 'account' | 'leave';
  showDot?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  type = 'attendance',
  showDot = true,
}) => {
  const norm = status?.toUpperCase() || '';

  // Attendance
  if (type === 'attendance') {
    if (norm === 'PRESENT') {
      return (
        <span className="inline-flex items-center text-xs font-medium text-emerald-600">
          {showDot && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />}
          Present
        </span>
      );
    }
    if (norm === 'LATE') {
      return (
        <span className="inline-flex items-center text-xs font-medium text-amber-600">
          {showDot && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5" />}
          Late
        </span>
      );
    }
    if (norm === 'ABSENT') {
      return (
        <span className="inline-flex items-center text-xs font-medium text-rose-600">
          {showDot && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-1.5" />}
          Absent
        </span>
      );
    }
    if (norm === 'ON_LEAVE') {
      return (
        <span className="inline-flex items-center text-xs font-medium text-purple-600">
          {showDot && <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mr-1.5" />}
          On Leave
        </span>
      );
    }
  }

  // Tasks
  if (type === 'task') {
    if (norm === 'IN_PROGRESS' || norm === 'IN PROGRESS') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-600 border border-blue-100">
          In progress
        </span>
      );
    }
    if (norm === 'PENDING') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
          Pending
        </span>
      );
    }
    if (norm === 'REVIEW') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-purple-50 text-purple-600 border border-purple-100">
          Review
        </span>
      );
    }
    if (norm === 'COMPLETED') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-emerald-50 text-emerald-600 border border-emerald-100">
          Completed
        </span>
      );
    }
  }

  // Priority
  if (type === 'priority') {
    if (norm === 'HIGH') {
      return <span className="text-xs font-semibold text-rose-600">High</span>;
    }
    if (norm === 'MEDIUM') {
      return <span className="text-xs font-medium text-amber-600">Medium</span>;
    }
    return <span className="text-xs font-medium text-slate-500">Low</span>;
  }

  // Announcements
  if (type === 'announcement') {
    if (norm === 'IMPORTANT') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-600">
          Important
        </span>
      );
    }
    if (norm === 'MEETING') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-sky-50 text-sky-600">
          Meeting
        </span>
      );
    }
    if (norm === 'NOTICE') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600">
          Notice
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-gray-100 text-gray-600">
        General
      </span>
    );
  }

  // Leave Status
  if (type === 'leave') {
    if (norm === 'APPROVED') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
          Approved
        </span>
      );
    }
    if (norm === 'REJECTED') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-700">
          Rejected
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
        Pending
      </span>
    );
  }

  // Account Status
  if (norm === 'ACTIVE') {
    return (
      <span className="inline-flex items-center text-xs font-medium text-emerald-600">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5" />
        Active account
      </span>
    );
  }

  return (
    <span className="inline-flex items-center text-xs font-medium text-slate-400">
      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mr-1.5" />
      Inactive
    </span>
  );
};
