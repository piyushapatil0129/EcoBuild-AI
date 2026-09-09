import React from 'react';
import { CheckCircle2, TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { formatNumber, formatCurrency } from '../../utils/formatters';

export default function ComparisonTable({ comparisonData }) {
  if (!comparisonData || !comparisonData.metrics_comparison) return null;

  const { design_a, design_b, metrics_comparison } = comparisonData;

  const formatValue = (key, val) => {
    if (key === 'sustainability_score') return `${Math.round(val)} pts`;
    if (key === 'annual_energy') return `${formatNumber(val)} kWh/yr`;
    if (key === 'carbon_footprint') return `${formatNumber(val, 1)} tCO2e`;
    if (key === 'water_consumption') return `${formatNumber(val, 1)} m³/yr`;
    if (key === 'initial_cost') return formatCurrency(val);
    if (key === 'annual_operating_cost') return `${formatCurrency(val)}/yr`;
    return val;
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs">
      <table className="w-full text-left border-collapse text-sm">
        <thead>
          <tr className="bg-slate-50/80 border-b border-slate-200 text-xs text-slate-500 uppercase tracking-wider">
            <th className="py-3 px-4 font-semibold">Evaluation Metric</th>
            <th className="py-3 px-4 font-semibold text-center bg-emerald-50/40 text-forest-900 border-x border-emerald-100">
              {design_a.name || 'Design A'}
            </th>
            <th className="py-3 px-4 font-semibold text-center bg-teal-50/40 text-teal-900 border-r border-teal-100">
              {design_b.name || 'Design B'}
            </th>
            <th className="py-3 px-4 font-semibold text-right">Optimal Design</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {Object.entries(metrics_comparison).map(([key, metric]) => {
            const isABetter = metric.better === 'Design A';
            const isBBetter = metric.better === 'Design B';

            return (
              <tr key={key} className="hover:bg-slate-50/50 transition-colors">
                <td className="py-3 px-4 font-medium text-slate-800">
                  {metric.label}
                </td>
                <td className={`py-3 px-4 text-center font-semibold border-x border-slate-100 ${
                  isABetter ? 'text-forest-700 bg-emerald-50/50 font-bold' : 'text-slate-600'
                }`}>
                  {formatValue(key, metric.val_a)}
                </td>
                <td className={`py-3 px-4 text-center font-semibold border-r border-slate-100 ${
                  isBBetter ? 'text-teal-700 bg-teal-50/50 font-bold' : 'text-slate-600'
                }`}>
                  {formatValue(key, metric.val_b)}
                </td>
                <td className="py-3 px-4 text-right">
                  {metric.better === 'Tie' ? (
                    <span className="inline-flex items-center gap-1 text-xs text-slate-500 font-medium">
                      <Minus className="w-3.5 h-3.5" /> Equivalent
                    </span>
                  ) : (
                    <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${
                      isABetter
                        ? 'bg-emerald-100 text-forest-800'
                        : 'bg-teal-100 text-teal-800'
                    }`}>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {metric.better}
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
