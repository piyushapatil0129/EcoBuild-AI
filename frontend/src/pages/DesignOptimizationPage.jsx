import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { projectService } from '../services/projectService';
import { analysisService } from '../services/analysisService';
import MetricCard from '../components/common/MetricCard';
import ChartCard from '../components/common/ChartCard';
import Button from '../components/common/Button';
import LoadingState from '../components/common/LoadingState';
import ErrorState from '../components/common/ErrorState';
import { OPTIMIZATION_PRIORITIES } from '../utils/constants';
import {
  Sliders,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Zap,
  Flame,
  Droplets,
  DollarSign,
  Award,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from 'recharts';
import { formatNumber, formatCurrency, getScoreColorClass } from '../utils/formatters';

export default function DesignOptimizationPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlDesignId = searchParams.get('designId');

  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [selectedDesignId, setSelectedDesignId] = useState(urlDesignId || '');
  const [priority, setPriority] = useState('Balanced');

  const [optimizationResult, setOptimizationResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [optimizing, setOptimizing] = useState(false);
  const [error, setError] = useState(null);

  // 1. Initial Load: Fetch projects and designs
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const projs = await projectService.getProjects();
        setProjects(projs);

        if (projs.length > 0) {
          const firstProj = projs[0];
          setSelectedProjectId(firstProj.id);
          const fullProj = await projectService.getProjectById(firstProj.id);
          if (fullProj.designs && fullProj.designs.length > 0) {
            const targetDesign = urlDesignId
              ? fullProj.designs.find((d) => d.id === urlDesignId) || fullProj.designs[0]
              : fullProj.designs[0];
            setSelectedDesignId(targetDesign.id);
          }
        }
      } catch (err) {
        setError('Failed to initialize optimizer.');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [urlDesignId]);

  // 2. Trigger optimization when designId or priority changes
  useEffect(() => {
    if (!selectedDesignId) return;

    const runOptimization = async () => {
      setOptimizing(true);
      setError(null);
      try {
        const res = await analysisService.optimizeDesign(selectedDesignId, priority);
        setOptimizationResult(res);
      } catch (err) {
        setError(err.userMessage || 'Failed to solve optimization.');
      } finally {
        setOptimizing(false);
      }
    };

    runOptimization();
  }, [selectedDesignId, priority]);

  // Handle Project selection change
  const handleProjectSelect = async (e) => {
    const pId = e.target.value;
    setSelectedProjectId(pId);
    setLoading(true);
    try {
      const fullProj = await projectService.getProjectById(pId);
      if (fullProj.designs && fullProj.designs.length > 0) {
        setSelectedDesignId(fullProj.designs[0].id);
      }
    } catch (err) {
      setError('Could not load project designs.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingState message="Loading optimization solver..." className="py-20" />;
  }

  const currentProj = projects.find((p) => p.id === selectedProjectId);

  // Improvements Chart Data
  const chartData = optimizationResult ? [
    {
      metric: 'Energy (MWh)',
      Current: Math.round(optimizationResult.current_metrics.annual_energy_kwh / 1000),
      Optimized: Math.round(optimizationResult.optimized_metrics.annual_energy_kwh / 1000)
    },
    {
      metric: 'Carbon (t/50yr)',
      Current: Math.round(optimizationResult.current_metrics.lifecycle_carbon_tco2e),
      Optimized: Math.round(optimizationResult.optimized_metrics.lifecycle_carbon_tco2e)
    },
    {
      metric: 'Water (m³)',
      Current: Math.round(optimizationResult.current_metrics.water_consumption_m3),
      Optimized: Math.round(optimizationResult.optimized_metrics.water_consumption_m3)
    }
  ] : [];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
          <Sliders className="w-7 h-7 text-forest-700" />
          Multi-Objective Design Optimizer
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Algorithmic trade-off solver exploring optimal permutations across cost, carbon, energy, and water.
        </p>
      </div>

      {/* Target Design & Priority Selector Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
              Target Building Project
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
              Base Design Version to Optimize
            </label>
            <select
              value={selectedDesignId}
              onChange={(e) => setSelectedDesignId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold py-2 px-3 focus:ring-forest-500 focus:border-forest-500"
            >
              {currentProj?.designs ? (
                currentProj.designs.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.design_name}
                  </option>
                ))
              ) : (
                <option value={selectedDesignId}>Initial Proposed Design</option>
              )}
            </select>
          </div>
        </div>

        {/* PRIORITY SELECTOR (Prompt #17: "What is your priority?") */}
        <div>
          <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-3">
            What is your optimization priority?
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {OPTIMIZATION_PRIORITIES.map((opt) => {
              const isSelected = priority === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setPriority(opt.id)}
                  className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-forest-800 text-white border-forest-900 shadow-sm ring-2 ring-forest-500/50'
                      : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-xs">{opt.label}</span>
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                  </div>
                  <p className={`text-[11px] leading-tight ${isSelected ? 'text-emerald-100' : 'text-slate-500'}`}>
                    {opt.desc}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {optimizing && (
        <LoadingState message={`Solving Pareto envelope under "${priority}" objective...`} className="py-12" />
      )}

      {error && <ErrorState message={error} className="my-8" />}

      {optimizationResult && !optimizing && (
        <div className="space-y-8 animate-fadeIn">
          {/* TRADE-OFF EXPLANATION (Prompt #17) */}
          <div className="bg-gradient-to-r from-forest-900 to-slate-900 text-white rounded-2xl p-6 shadow-md border border-forest-800">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2">
              <Sparkles className="w-4 h-4" />
              Optimization Rationale & Trade-off Analysis
            </div>
            <p className="text-sm sm:text-base text-slate-100 leading-relaxed font-medium">
              "{optimizationResult.tradeoff_explanation}"
            </p>
          </div>

          {/* BEFORE VS AFTER SCORE CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Current Specification
              </span>
              <div className="flex items-baseline gap-2 mb-4">
                <span className={`text-3xl font-black px-3 py-1 rounded-xl border ${getScoreColorClass(optimizationResult.current_metrics.score)}`}>
                  {Math.round(optimizationResult.current_metrics.score)}
                </span>
                <span className="text-xs text-slate-500 font-semibold">points / 100</span>
              </div>
              <div className="space-y-2 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Net Annual Energy:</span>
                  <span className="font-bold">{formatNumber(optimizationResult.current_metrics.annual_energy_kwh)} kWh/yr</span>
                </div>
                <div className="flex justify-between">
                  <span>50-Yr Lifecycle Carbon:</span>
                  <span className="font-bold">{formatNumber(optimizationResult.current_metrics.lifecycle_carbon_tco2e, 1)} tCO2e</span>
                </div>
                <div className="flex justify-between">
                  <span>Potable Water Demand:</span>
                  <span className="font-bold">{formatNumber(optimizationResult.current_metrics.water_consumption_m3, 1)} m³/yr</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Initial CapEx:</span>
                  <span className="font-bold">{formatCurrency(optimizationResult.current_metrics.estimated_initial_cost_usd)}</span>
                </div>
              </div>
            </div>

            {/* OPTIMIZED CONFIGURATION */}
            <div className="bg-emerald-50/50 rounded-2xl border-2 border-forest-500 p-6 shadow-xs relative">
              <span className="text-xs font-bold uppercase tracking-wider text-forest-800 bg-emerald-100 px-2.5 py-0.5 rounded-full inline-block mb-2">
                Recommended Configuration ({priority})
              </span>
              <div className="flex items-baseline gap-2 mb-4">
                <span className={`text-3xl font-black px-3 py-1 rounded-xl border ${getScoreColorClass(optimizationResult.optimized_metrics.score)}`}>
                  {Math.round(optimizationResult.optimized_metrics.score)}
                </span>
                <span className="text-xs font-bold text-forest-800">
                  +{optimizationResult.improvements.score_increase} pts improvement
                </span>
              </div>
              <div className="space-y-2 text-xs text-slate-700">
                <div className="flex justify-between">
                  <span>Net Annual Energy:</span>
                  <span className="font-bold text-forest-900">{formatNumber(optimizationResult.optimized_metrics.annual_energy_kwh)} kWh/yr</span>
                </div>
                <div className="flex justify-between">
                  <span>50-Yr Lifecycle Carbon:</span>
                  <span className="font-bold text-forest-900">{formatNumber(optimizationResult.optimized_metrics.lifecycle_carbon_tco2e, 1)} tCO2e</span>
                </div>
                <div className="flex justify-between">
                  <span>Potable Water Demand:</span>
                  <span className="font-bold text-forest-900">{formatNumber(optimizationResult.optimized_metrics.water_consumption_m3, 1)} m³/yr</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Initial CapEx:</span>
                  <span className="font-bold text-slate-900">{formatCurrency(optimizationResult.optimized_metrics.estimated_initial_cost_usd)}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-emerald-200">
                  <span className="font-bold text-forest-800">Annual OpEx Utility Savings:</span>
                  <span className="font-bold text-forest-800">+{formatCurrency(optimizationResult.improvements.annual_opex_savings_usd)}/yr</span>
                </div>
              </div>
            </div>
          </div>

          {/* RECOMMENDED ARCHITECTURAL SPECIFICATIONS */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">
              Optimal Assembly Parameters
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Structure</span>
                <span className="font-bold text-slate-800">{optimizationResult.recommended_configuration.structural_material}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Wall Envelope</span>
                <span className="font-bold text-slate-800">{optimizationResult.recommended_configuration.wall_material}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Insulation</span>
                <span className="font-bold text-slate-800">{optimizationResult.recommended_configuration.insulation_type}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Glazing</span>
                <span className="font-bold text-slate-800">{optimizationResult.recommended_configuration.glazing_type}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">HVAC Mechanical</span>
                <span className="font-bold text-slate-800">{optimizationResult.recommended_configuration.hvac_system}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Solar Photovoltaic</span>
                <span className="font-bold text-slate-800">{optimizationResult.recommended_configuration.solar_capacity} kWp</span>
              </div>
            </div>
          </div>

          {/* VISUAL CHART */}
          <ChartCard
            title="Resource Consumption Reduction"
            subtitle="Comparing current vs optimized design loads"
          >
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="metric" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="Current" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Optimized" fill="#047857" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      )}
    </div>
  );
}
