import React from 'react';
import { AlertCircle, Zap, Droplets, Leaf, ShieldAlert, CheckCircle2, TrendingUp } from 'lucide-react';

export default function RecommendationCard({ rec }) {
  const priorityStyles = {
    High: {
      border: 'border-l-4 border-l-rose-500 border-slate-200',
      badge: 'bg-rose-50 text-rose-700 border-rose-200',
      icon: ShieldAlert,
      iconColor: 'text-rose-600',
    },
    Medium: {
      border: 'border-l-4 border-l-amber-500 border-slate-200',
      badge: 'bg-amber-50 text-amber-700 border-amber-200',
      icon: AlertCircle,
      iconColor: 'text-amber-600',
    },
    Low: {
      border: 'border-l-4 border-l-emerald-500 border-slate-200',
      badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: CheckCircle2,
      iconColor: 'text-emerald-600',
    },
  };

  const style = priorityStyles[rec.priority] || priorityStyles.Medium;
  const PriorityIcon = style.icon;

  return (
    <div className={`bg-white rounded-xl border p-5 shadow-xs transition-shadow hover:shadow-md ${style.border}`}>
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <PriorityIcon className={`w-4 h-4 shrink-0 ${style.iconColor}`} />
          <span className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${style.badge}`}>
            {rec.priority} Priority
          </span>
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
            {rec.category}
          </span>
        </div>
      </div>

      <h4 className="text-base font-bold text-slate-900 mb-1.5 leading-snug">
        {rec.title}
      </h4>

      <div className="bg-slate-50 rounded-lg p-3 my-2.5 border border-slate-100 text-xs space-y-1.5">
        <p className="text-slate-600">
          <strong className="text-slate-800">Observation: </strong>
          {rec.reason}
        </p>
        <p className="text-slate-600">
          <strong className="text-slate-800">Action: </strong>
          {rec.explanation}
        </p>
      </div>

      {rec.expected_impact && (
        <div className="flex items-center gap-2 pt-2 text-xs font-semibold text-forest-800">
          <TrendingUp className="w-4 h-4 text-forest-700 shrink-0" />
          <span>Expected Impact: {rec.expected_impact}</span>
        </div>
      )}
    </div>
  );
}
