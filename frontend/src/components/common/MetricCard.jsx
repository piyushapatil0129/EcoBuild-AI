import React from 'react';

export default function MetricCard({
  title,
  value,
  unit,
  subtitle,
  icon: Icon,
  trend,
  trendPositive = true,
  badgeText,
  badgeColor = 'emerald',
  className = ''
}) {
  const badgeColors = {
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    green: 'bg-green-50 text-green-700 border-green-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    slate: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  return (
    <div className={`bg-white rounded-xl border border-slate-200 p-5 shadow-xs transition-shadow hover:shadow-md ${className}`}>
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</span>
        {Icon && (
          <div className="p-2 rounded-lg bg-forest-50 text-forest-700">
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-1.5">
        <span className="text-2xl font-bold text-slate-900 tracking-tight">{value}</span>
        {unit && <span className="text-sm font-medium text-slate-500">{unit}</span>}
      </div>

      <div className="mt-2 flex items-center justify-between">
        {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
        {trend && (
          <span className={`text-xs font-semibold ${trendPositive ? 'text-emerald-700' : 'text-rose-600'}`}>
            {trend}
          </span>
        )}
        {badgeText && (
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${badgeColors[badgeColor] || badgeColors.slate}`}>
            {badgeText}
          </span>
        )}
      </div>
    </div>
  );
}
