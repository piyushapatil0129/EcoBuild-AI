export function formatNumber(val, decimals = 0) {
  if (val === null || val === undefined || isNaN(val)) return '0';
  return Number(val).toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatCurrency(val, decimals = 0) {
  if (val === null || val === undefined || isNaN(val)) return '$0';
  return '$' + formatNumber(val, decimals);
}

export function formatScore(score) {
  if (score === null || score === undefined) return '--';
  return Math.round(Number(score));
}

export function formatDate(dateString) {
  if (!dateString) return 'Recent';
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return dateString;
  }
}

export function getScoreColorClass(score) {
  const num = Number(score) || 0;
  if (num >= 80) return 'text-emerald-700 bg-emerald-50 border-emerald-200';
  if (num >= 65) return 'text-green-700 bg-green-50 border-green-200';
  if (num >= 50) return 'text-teal-700 bg-teal-50 border-teal-200';
  if (num >= 40) return 'text-amber-700 bg-amber-50 border-amber-200';
  return 'text-rose-700 bg-rose-50 border-rose-200';
}

export function getScoreBadge(score) {
  const num = Number(score) || 0;
  if (num >= 85) return { label: 'Platinum Performance', bg: 'bg-emerald-600', text: 'text-white' };
  if (num >= 70) return { label: 'Gold Sustainable', bg: 'bg-emerald-500', text: 'text-white' };
  if (num >= 55) return { label: 'Silver Sustainable', bg: 'bg-teal-500', text: 'text-white' };
  if (num >= 40) return { label: 'Bronze Compliant', bg: 'bg-amber-500', text: 'text-white' };
  return { label: 'Conventional Baseline', bg: 'bg-slate-500', text: 'text-white' };
}
