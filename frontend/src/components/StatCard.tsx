import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon: React.ReactNode;
  iconBgColor?: string;
  iconColor?: string;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subtext,
  icon,
  iconBgColor = 'bg-blue-50',
  iconColor = 'text-blue-600',
  className = '',
}) => {
  return (
    <div
      className={`bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-shadow duration-200 flex items-start gap-4 ${className}`}
    >
      <div
        className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBgColor} ${iconColor}`}
      >
        {icon}
      </div>
      <div className="flex flex-col">
        <span className="text-xs font-medium text-slate-500">{label}</span>
        <span className="text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
          {value}
        </span>
        {subtext && (
          <span className="text-xs text-slate-400 mt-1 font-normal">
            {subtext}
          </span>
        )}
      </div>
    </div>
  );
};
