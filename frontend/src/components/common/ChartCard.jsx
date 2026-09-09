import React from 'react';

export default function ChartCard({
  title,
  subtitle,
  children,
  action,
  className = ''
}) {
  return (
    <div className={`bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col ${className}`}>
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h4 className="text-sm font-bold text-slate-900 tracking-tight">{title}</h4>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
        {action && <div>{action}</div>}
      </div>
      <div className="w-full flex-1 min-h-[220px]">
        {children}
      </div>
    </div>
  );
}
