import React from 'react';

interface ProgressBarProps {
  progress: number;
  showText?: boolean;
  textPosition?: 'right' | 'top';
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  showText = false,
  textPosition = 'right',
  className = '',
}) => {
  const clamped = Math.min(100, Math.max(0, progress));

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden">
        <div
          className="bg-blue-600 h-1.5 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${clamped}%` }}
        />
      </div>
      {showText && (
        <span className="text-xs font-semibold text-slate-700 min-w-[32px] text-right">
          {clamped}%
        </span>
      )}
    </div>
  );
};
