import React from 'react';

export default function ProgressBar({
  label,
  value = 0,
  max = 100,
  weight,
  unit = 'pts',
  color = 'forest',
  showValue = true,
  className = ''
}) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const colors = {
    forest: 'bg-forest-700',
    emerald: 'bg-emerald-600',
    blue: 'bg-blue-600',
    teal: 'bg-teal-600',
    amber: 'bg-amber-500',
    rose: 'bg-rose-500',
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
        <span className="text-slate-700 flex items-center gap-1.5">
          {label}
          {weight && <span className="text-[10px] text-slate-400 font-normal">({weight})</span>}
        </span>
        {showValue && (
          <span className="font-semibold text-slate-900">
            {Math.round(value)} {unit}
          </span>
        )}
      </div>
      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/60">
        <div
          className={`h-full ${colors[color] || colors.forest} transition-all duration-700 ease-out rounded-full`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
