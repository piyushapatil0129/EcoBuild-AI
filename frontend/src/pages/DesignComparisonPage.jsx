import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { projectService } from '../services/projectService';
import { analysisService } from '../services/analysisService';
import ComparisonTable from '../components/compare/ComparisonTable';
import ChartCard from '../components/common/ChartCard';
import MetricCard from '../components/common/MetricCard';
import Button from '../components/common/Button';
import LoadingState from '../components/common/LoadingState';
import ErrorState from '../components/common/ErrorState';
import {
  GitCompare,
  CheckCircle2,
  Sparkles,
  Layers,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  Award,
  Zap,
  Flame,
  Droplets,
  DollarSign
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { formatNumber, formatCurrency, getScoreColorClass } from '../utils/formatters';

export default function DesignComparisonPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlProjectId = searchParams.get('projectId');

  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(urlProjectId || '');
  const [currentProject, setCurrentProject] = useState(null);

  const [designAId, setDesignAId] = useState('');
  const [designBId, setDesignBId] = useState('');

  const [comparisonData, setComparisonData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comparing, setComparing] = useState(false);
  const [error, setError] = useState(null);

  // 1. Initial Load: Fetch projects
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const projs = await projectService.getProjects();
        setProjects(projs);

        // Pick initial project: URL project or first project with 2+ designs
        let targetProj = null;
        if (urlProjectId) {
          targetProj = projs.find((p) => p.id === urlProjectId);
        }
        if (!targetProj && projs.length > 0) {
          targetProj = projs.find((p) => p.design_count >= 2) || projs[0];
        }

        if (targetProj) {
          setSelectedProjectId(targetProj.id);
          const fullProj = await projectService.getProjectById(targetProj.id);
          setCurrentProject(fullProj);

          if (fullProj.designs && fullProj.designs.length >= 2) {
            setDesignAId(fullProj.designs[0].id);
            setDesignBId(fullProj.designs[1].id);
          } else if (fullProj.designs && fullProj.designs.length === 1) {
            setDesignAId(fullProj.designs[0].id);
          }
        }
      } catch (err) {
        setError(err.userMessage || 'Failed to initialize comparison.');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [urlProjectId]);

  // 2. Run Comparison when Design A and B are selected
  useEffect(() => {
    if (!designAId || !designBId || designAId === designBId) {
      setComparisonData(null);
      return;
    }

    const runCompare = async () => {
      setComparing(true);
      setError(null);
      try {
        const res = await analysisService.compareDesigns(designAId, designBId);
        setComparisonData(res);
      } catch (err) {
        setError(err.userMessage || 'Failed to compute comparison.');
      } finally {
        setComparing(false);
      }
    };
    runCompare();
  }, [designAId, designBId]);

  // Handle Project selection change
  const handleProjectSelect = async (e) => {
    const pId = e.target.value;
    setSelectedProjectId(pId);
    setSearchParams({ projectId: pId });
    setLoading(true);
    try {
      const fullProj = await projectService.getProjectById(pId);
      setCurrentProject(fullProj);
      if (fullProj.designs && fullProj.designs.length >= 2) {
        setDesignAId(fullProj.designs[0].id);
        setDesignBId(fullProj.designs[1].id);
      } else if (fullProj.designs && fullProj.designs.length === 1) {
        setDesignAId(fullProj.designs[0].id);
        setDesignBId('');
      } else {
        setDesignAId('');
        setDesignBId('');
      }
    } catch (err) {
      setError('Could not load designs for selected project.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingState message="Loading design version models..." className="py-20" />;
  }

  const designs = currentProject?.designs || [];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
          <GitCompare className="w-7 h-7 text-forest-700" />
          Design Version Comparison
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Side-by-side engineering evaluation of architectural iterations, envelope upgrades, and lifecycle trade-offs.
        </p>
      </div>

      {/* Selector Controls: Project, Design A, Design B */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
              Select Building Project
            </label>
            <select
              value={selectedProjectId}
              onChange={handleProjectSelect}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold py-2 px-3 focus:ring-forest-500 focus:border-forest-500"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.project_name} ({p.building_type})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
              Design A (Baseline)
            </label>
            <select
              value={designAId}
              onChange={(e) => setDesignAId(e.target.value)}
              disabled={designs.length === 0}
              className="w-full bg-emerald-50/50 border border-emerald-300 rounded-lg text-xs font-semibold py-2 px-3 text-forest-900 focus:ring-forest-500 focus:border-forest-500"
            >
              {designs.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.design_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
              Design B (Proposed Alternative)
            </label>
            <select
              value={designBId}
              onChange={(e) => setDesignBId(e.target.value)}
              disabled={designs.length < 2}
              className="w-full bg-teal-50/50 border border-teal-300 rounded-lg text-xs font-semibold py-2 px-3 text-teal-900 focus:ring-teal-500 focus:border-teal-500"
            >
              <option value="">-- Choose Comparison Version --</option>
              {designs.map((d) => (
                <option key={d.id} value={d.id} disabled={d.id === designAId}>
                  {d.design_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {designs.length < 2 && (
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between gap-4 bg-amber-50 p-3 rounded-lg border border-amber-200 text-xs text-amber-800">
            <span>This project currently has only 1 design version. Create an alternative version to compare.</span>
            <Link to={`/create-design/${currentProject?.id}`}>
              <Button size="sm" variant="primary">Create Design B</Button>
            </Link>
          </div>
        )}
      </div>

      {comparing && (
        <LoadingState message="Comparing multi-parameter matrices..." className="py-12" />
      )}

      {error && (
        <ErrorState message={error} className="my-8" />
      )}

      {comparisonData && !comparing && (
        <div className="space-y-8 animate-fadeIn">
          {/* AI SUMMARY CALLOUT PANEL (Prompt #16) */}
          <div className="bg-gradient-to-r from-forest-900 to-slate-900 text-white rounded-2xl p-6 shadow-md border border-forest-800">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2">
              <Sparkles className="w-4 h-4" />
              EcoBuild AI Comparative Synthesis
            </div>
            <p className="text-sm sm:text-base text-slate-100 font-medium leading-relaxed">
              "{comparisonData.ai_comparison_summary}"
            </p>
          </div>

          {/* SIDE-BY-SIDE SCORE CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Design A Card */}
            <div className="bg-white rounded-2xl border-2 border-emerald-200 p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  {comparisonData.design_a.name}
                </span>
                <span className={`text-2xl font-black px-3 py-1 rounded-xl border ${getScoreColorClass(comparisonData.design_a.analysis?.sustainability_score)}`}>
                  {Math.round(comparisonData.design_a.analysis?.sustainability_score || 0)} <span className="text-xs font-normal">pts</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 mb-4">
                Tier: <strong>{comparisonData.design_a.analysis?.rating_tier}</strong>
              </p>
              <div className="space-y-2 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Net Annual Energy:</span>
                  <span className="font-bold">{formatNumber(comparisonData.design_a.analysis?.energy_metrics.annual_energy_kwh)} kWh/yr</span>
                </div>
                <div className="flex justify-between">
                  <span>50-Yr Lifecycle Carbon:</span>
                  <span className="font-bold">{formatNumber(comparisonData.design_a.analysis?.carbon_metrics.lifecycle_50yr_carbon_tco2e, 1)} tCO2e</span>
                </div>
                <div className="flex justify-between">
                  <span>Annual Water Consumption:</span>
                  <span className="font-bold">{formatNumber(comparisonData.design_a.analysis?.water_metrics.annual_water_consumption_m3, 1)} m³/yr</span>
                </div>
                <div className="flex justify-between">
                  <span>Initial Construction Cost:</span>
                  <span className="font-bold">{formatCurrency(comparisonData.design_a.analysis?.cost_metrics.estimated_initial_cost_usd)}</span>
                </div>
              </div>
            </div>

            {/* Design B Card */}
            <div className="bg-white rounded-2xl border-2 border-teal-200 p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-800 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
                  {comparisonData.design_b.name}
                </span>
                <span className={`text-2xl font-black px-3 py-1 rounded-xl border ${getScoreColorClass(comparisonData.design_b.analysis?.sustainability_score)}`}>
                  {Math.round(comparisonData.design_b.analysis?.sustainability_score || 0)} <span className="text-xs font-normal">pts</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 mb-4">
                Tier: <strong>{comparisonData.design_b.analysis?.rating_tier}</strong>
              </p>
              <div className="space-y-2 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Net Annual Energy:</span>
                  <span className="font-bold">{formatNumber(comparisonData.design_b.analysis?.energy_metrics.annual_energy_kwh)} kWh/yr</span>
                </div>
                <div className="flex justify-between">
                  <span>50-Yr Lifecycle Carbon:</span>
                  <span className="font-bold">{formatNumber(comparisonData.design_b.analysis?.carbon_metrics.lifecycle_50yr_carbon_tco2e, 1)} tCO2e</span>
                </div>
                <div className="flex justify-between">
                  <span>Annual Water Consumption:</span>
                  <span className="font-bold">{formatNumber(comparisonData.design_b.analysis?.water_metrics.annual_water_consumption_m3, 1)} m³/yr</span>
                </div>
                <div className="flex justify-between">
                  <span>Initial Construction Cost:</span>
                  <span className="font-bold">{formatCurrency(comparisonData.design_b.analysis?.cost_metrics.estimated_initial_cost_usd)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* DETAILED COMPARISON TABLE WITH HIGHLIGHTS */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">
              Metric-by-Metric Delta Breakdown
            </h3>
            <ComparisonTable comparisonData={comparisonData} />
          </div>

          {/* RADAR CHART (Multi-category radar overlay) */}
          <ChartCard
            title="Multi-Dimensional Category Comparison"
            subtitle="Radar chart visualizing balanced performance across all 5 dimensions"
          >
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={comparisonData.radar_chart_data}>
                  <PolarGrid stroke="#cbd5e1" />
                  <PolarAngleAxis dataKey="category" tick={{ fill: '#475569', fontSize: 12 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
                  <Radar name={comparisonData.design_a.name} dataKey="Design_A" stroke="#047857" fill="#047857" fillOpacity={0.4} />
                  <Radar name={comparisonData.design_b.name} dataKey="Design_B" stroke="#0d9488" fill="#0d9488" fillOpacity={0.4} />
                  <Legend />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>
      )}
    </div>
  );
}
