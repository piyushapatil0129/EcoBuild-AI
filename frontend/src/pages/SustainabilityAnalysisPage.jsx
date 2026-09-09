import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { projectService } from '../services/projectService';
import { analysisService } from '../services/analysisService';
import ScoreCard from '../components/common/ScoreCard';
import MetricCard from '../components/common/MetricCard';
import ProgressBar from '../components/common/ProgressBar';
import ChartCard from '../components/common/ChartCard';
import Button from '../components/common/Button';
import LoadingState from '../components/common/LoadingState';
import ErrorState from '../components/common/ErrorState';
import {
  Zap,
  Flame,
  Droplets,
  DollarSign,
  Sparkles,
  GitCompare,
  Sliders,
  FileText,
  Layers,
  Info,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { formatNumber, formatCurrency } from '../utils/formatters';

export default function SustainabilityAnalysisPage() {
  const { projectId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedDesignId = searchParams.get('designId');

  const [project, setProject] = useState(null);
  const [selectedDesign, setSelectedDesign] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const p = await projectService.getProjectById(projectId);
        setProject(p);

        if (p.designs && p.designs.length > 0) {
          // Select requested design or first design
          const target = requestedDesignId
            ? p.designs.find((d) => d.id === requestedDesignId) || p.designs[0]
            : p.designs[0];
          setSelectedDesign(target);

          if (target.analysis) {
            setAnalysis(target.analysis);
          } else {
            // Fetch analysis directly
            const a = await analysisService.getAnalysisByDesignId(target.id);
            setAnalysis(a);
          }
        }
      } catch (err) {
        setError(err.userMessage || 'Failed to load sustainability analysis.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [projectId, requestedDesignId]);

  const handleDesignChange = async (e) => {
    const designId = e.target.value;
    setSearchParams({ designId });
  };

  if (loading) {
    return <LoadingState message="Compiling multi-disciplinary engineering analysis..." className="py-20" />;
  }

  if (error || !analysis) {
    return <ErrorState message={error || 'Analysis data could not be computed.'} className="my-12" />;
  }

  const { energy_metrics, carbon_metrics, water_metrics, cost_metrics, category_scores } = analysis;

  // Energy Chart Data (kWh breakdown)
  const energyChartData = [
    { name: 'Cooling', kwh: energy_metrics.breakdown?.cooling_kwh || 0 },
    { name: 'Heating', kwh: energy_metrics.breakdown?.heating_kwh || 0 },
    { name: 'Lighting', kwh: energy_metrics.breakdown?.lighting_kwh || 0 },
    { name: 'Equipment', kwh: energy_metrics.breakdown?.equipment_kwh || 0 },
    { name: 'Solar Yield', kwh: energy_metrics.breakdown?.solar_offset_kwh || 0 }
  ];

  // Carbon Chart Data (tCO2e pie breakdown)
  const carbonPieData = [
    { name: 'Structure', value: carbon_metrics.breakdown?.structural_tco2e || 0, color: '#065f46' },
    { name: 'Walls & Envelope', value: carbon_metrics.breakdown?.walls_envelope_tco2e || 0, color: '#047857' },
    { name: 'Roofing & Finishes', value: (carbon_metrics.breakdown?.roofing_tco2e || 0) + (carbon_metrics.breakdown?.finishes_tco2e || 0), color: '#10b981' },
    { name: 'Annual Grid OpEx', value: carbon_metrics.breakdown?.annual_grid_emissions_tco2e || 0, color: '#f59e0b' }
  ].filter((item) => item.value > 0);

  // Water Chart Data (m³ comparison)
  const waterBarData = [
    { name: 'Baseline Demand', volume: water_metrics.baseline_water_consumption_m3 || 0, fill: '#94a3b8' },
    { name: 'Net Municipal Draw', volume: water_metrics.annual_water_consumption_m3 || 0, fill: '#0284c7' },
    { name: 'Rainwater Harvested', volume: water_metrics.rainwater_harvested_m3 || 0, fill: '#10b981' },
    { name: 'Greywater Reused', volume: water_metrics.reused_water_m3 || 0, fill: '#0d9488' }
  ];

  return (
    <div className="space-y-8">
      {/* Top Header & Version Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-forest-700 bg-forest-50 px-2.5 py-0.5 rounded-full border border-forest-100">
              {project?.building_type}
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 font-medium">{project?.location}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {project?.project_name}
          </h1>
        </div>

        {/* Design Selector & Quick Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          {project?.designs && project.designs.length > 1 && (
            <div className="relative">
              <select
                value={selectedDesign?.id}
                onChange={handleDesignChange}
                className="bg-white border border-slate-300 rounded-lg text-xs font-bold py-2 pl-3 pr-8 focus:ring-forest-500 focus:border-forest-500 appearance-none shadow-2xs"
              >
                {project.designs.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.design_name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          )}

          <Link to={`/recommendations/${selectedDesign?.id}`}>
            <Button variant="secondary" size="sm" icon={Sparkles}>
              AI Recommendations ({analysis.recommendations?.length || 0})
            </Button>
          </Link>

          <Link to={`/optimize?designId=${selectedDesign?.id}`}>
            <Button variant="outline" size="sm" icon={Sliders}>
              Optimize
            </Button>
          </Link>

          <Link to={`/reports/${project?.id}`}>
            <Button variant="primary" size="sm" icon={FileText}>
              Audit Report
            </Button>
          </Link>
        </div>
      </div>

      {/* LARGE SUSTAINABILITY SCORE GAUGE & CATEGORIES */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ScoreCard
            score={analysis.sustainability_score}
            tier={analysis.rating_tier}
            summary={analysis.summary_explanation}
          />
        </div>

        {/* Category Performance Breakdown Bars */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
            Category Dimension Ratings
          </h3>
          <div className="space-y-3.5">
            <ProgressBar
              label="Carbon & Decarbonization"
              value={category_scores?.carbon || 0}
              weight="30%"
              color="forest"
            />
            <ProgressBar
              label="Energy Efficiency (EUI)"
              value={category_scores?.energy || 0}
              weight="25%"
              color="emerald"
            />
            <ProgressBar
              label="Water Stewardship"
              value={category_scores?.water || 0}
              weight="20%"
              color="teal"
            />
            <ProgressBar
              label="Materials & Embodied Carbon"
              value={category_scores?.materials || 0}
              weight="15%"
              color="blue"
            />
            <ProgressBar
              label="Waste & Circular Modularity"
              value={category_scores?.waste || 0}
              weight="10%"
              color="amber"
            />
          </div>
        </div>
      </div>

      {/* CORE 4 ENGINEERING METRIC TILES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <MetricCard
          title="Net Annual Energy"
          value={formatNumber(energy_metrics.annual_energy_kwh)}
          unit="kWh/yr"
          subtitle={`EUI: ${energy_metrics.energy_use_intensity_eui} kWh/m²`}
          icon={Zap}
          trend={`-${energy_metrics.energy_savings_percentage}% vs base`}
          trendPositive={true}
          badgeColor="emerald"
        />

        <MetricCard
          title="50-Yr Lifecycle Carbon"
          value={formatNumber(carbon_metrics.lifecycle_50yr_carbon_tco2e, 1)}
          unit="tCO2e"
          subtitle={`Upfront: ${carbon_metrics.embodied_carbon_tco2e} tCO2e`}
          icon={Flame}
          trend={`-${carbon_metrics.carbon_reduction_percentage}% lifetime`}
          trendPositive={true}
          badgeColor="green"
        />

        <MetricCard
          title="Potable Water Draw"
          value={formatNumber(water_metrics.annual_water_consumption_m3, 1)}
          unit="m³/yr"
          subtitle={`${water_metrics.freshwater_dependency_percentage}% grid dependency`}
          icon={Droplets}
          trend={`-${water_metrics.water_savings_percentage}% saved`}
          trendPositive={true}
          badgeColor="blue"
        />

        <MetricCard
          title="Annual Utility OpEx"
          value={formatCurrency(cost_metrics.annual_operating_cost_usd)}
          unit="/yr"
          subtitle={`Saves ${formatCurrency(cost_metrics.annual_utility_savings_usd)}/yr`}
          icon={DollarSign}
          trend={`${cost_metrics.payback_period_years} yr payback`}
          trendPositive={true}
          badgeColor="amber"
        />
      </div>

      {/* VISUAL CHARTS ROW (Energy Breakdown & Carbon Embodied Distribution) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Energy Sub-system Breakdown */}
        <ChartCard
          title="Predicted Energy Consumption Breakdown"
          subtitle="Annual electrical draw simulated by ML regression (kWh/year)"
        >
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={energyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip formatter={(val) => [`${formatNumber(val)} kWh`, 'Energy']} />
              <Bar dataKey="kwh" fill="#047857" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Carbon Distribution */}
        <ChartCard
          title="Embodied & Operational Carbon Footprint"
          subtitle="Emissions distribution across building assemblies (tCO2e)"
        >
          <div className="flex flex-col sm:flex-row items-center h-full gap-4">
            <div className="w-full sm:w-1/2 h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={carbonPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {carbonPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val) => [`${formatNumber(val, 1)} tCO2e`, 'Emissions']} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="w-full sm:w-1/2 space-y-2 text-xs">
              {carbonPieData.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-slate-600">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="truncate">{item.name}</span>
                  </div>
                  <span className="font-bold text-slate-800">{formatNumber(item.value, 1)} t</span>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>
      </div>

      {/* WATER BALANCE CHART */}
      <ChartCard
        title="Annual Water Stewardship Balance"
        subtitle="Potable municipal consumption vs on-site rainwater harvesting & greywater reclamation (m³/year)"
      >
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={waterBarData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
            <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
            <Tooltip formatter={(val) => [`${formatNumber(val, 1)} m³`, 'Volume']} />
            <Bar dataKey="volume" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* ENGINEERING ASSUMPTIONS & DISCLAIMER NOTE */}
      <div className="bg-slate-100/70 rounded-xl p-5 border border-slate-200 text-xs text-slate-600 space-y-2">
        <div className="flex items-center gap-1.5 font-bold text-slate-800">
          <Info className="w-4 h-4 text-forest-700" />
          <span>Engineering Assumptions & Standard Disclaimers</span>
        </div>
        <ul className="list-disc list-inside space-y-1 pl-1 text-[11px] text-slate-500">
          {analysis.assumptions?.map((assump, idx) => (
            <li key={idx}>{assump}</li>
          ))}
        </ul>
        <p className="text-[11px] text-slate-500 italic pt-1">
          {analysis.disclaimer}
        </p>
      </div>
    </div>
  );
}
