import React from 'react';
import { Bot, Sparkles, AlertCircle, ArrowUpRight, CheckCircle } from 'lucide-react';

export default function AIInsightCard({ insights = [], className = '' }) {
  return (
    <div className={`bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-2xl p-6 shadow-md border border-slate-800 ${className}`}>
      <div className="flex items-center gap-2.5 mb-5 border-b border-slate-800 pb-4">
        <div className="p-2 rounded-xl bg-forest-700/30 text-emerald-400 border border-emerald-500/20">
          <Bot className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            EcoBuild AI Insights
            <Sparkles className="w-4 h-4 text-emerald-400" />
          </h3>
          <p className="text-xs text-slate-400">
            Algorithmic architectural diagnosis and decarbonization priorities
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {insights.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No critical anomalies detected for this configuration.</p>
        ) : (
          insights.map((insight, idx) => {
            const isHigh = insight.badge_type === 'HIGH PRIORITY' || insight.priority === 'High';
            const isOpportunity = insight.badge_type === 'OPPORTUNITY';

            return (
              <div
                key={insight.id || idx}
                className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/60 transition-colors hover:border-slate-600"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                      isHigh
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : isOpportunity
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    {insight.badge_type || `${insight.priority.toUpperCase()} PRIORITY`}
                  </span>
                  <span className="text-xs text-slate-400 truncate">
                    {insight.category}
                  </span>
                </div>

                <p className="text-sm font-semibold text-slate-100 mb-1 leading-snug">
                  "{insight.reason}"
                </p>

                <div className="mt-2 text-xs text-slate-300 bg-slate-900/60 rounded-lg p-2.5 border border-slate-800 flex items-start gap-2">
                  <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-emerald-400 font-semibold">Recommendation: </span>
                    <span>{insight.explanation}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
