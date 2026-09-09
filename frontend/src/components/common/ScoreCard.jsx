import React from 'react';
import { getScoreBadge } from '../../utils/formatters';
import { Award, ShieldCheck } from 'lucide-react';

export default function ScoreCard({
  score = 0,
  tier = 'Compliant Baseline',
  summary = '',
  size = 'lg',
  className = ''
}) {
  const badge = getScoreBadge(score);
  const circumference = 2 * Math.PI * 45; // radius = 45
  const strokeDashoffset = circumference - (Math.min(100, Math.max(0, score)) / 100) * circumference;

  return (
    <div className={`bg-gradient-to-br from-white to-forest-50/40 rounded-2xl border border-forest-200/80 p-6 shadow-sm ${className}`}>
      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* SVG Circular Progress Gauge */}
        <div className="relative shrink-0 flex items-center justify-center">
          <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
            {/* Background Track */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="transparent"
              stroke="#e2e8f0"
              strokeWidth="8"
            />
            {/* Active Arc */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="transparent"
              stroke="#047857"
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-black text-slate-900 tracking-tight leading-none">
              {Math.round(score)}
            </span>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest mt-1">
              / 100
            </span>
          </div>
        </div>

        {/* Score Details & Rating Tier */}
        <div className="flex-1 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-2">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${badge.bg} ${badge.text}`}>
              <Award className="w-3.5 h-3.5" />
              {tier || badge.label}
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-slate-500 bg-white px-2.5 py-1 rounded-full border border-slate-200">
              <ShieldCheck className="w-3.5 h-3.5 text-forest-700" />
              ASHRAE 90.1 Aligned
            </span>
          </div>

          <h3 className="text-lg font-bold text-slate-900 mb-1">
            EcoBuild Sustainability Rating
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed mb-3">
            {summary || 'Holistic composite assessment factoring lifecycle carbon, EUI energy efficiency, water stewardship, circular materials, and passive envelope strategies.'}
          </p>

          <div className="text-[11px] text-slate-500 bg-white/70 backdrop-blur-xs p-2.5 rounded-lg border border-slate-200">
            <span className="font-semibold text-slate-700">Weights: </span>
            Carbon (30%) • Energy (25%) • Water (20%) • Materials (15%) • Waste (10%)
          </div>
        </div>
      </div>
    </div>
  );
}
