import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { projectService } from '../services/projectService';
import { analysisService } from '../services/analysisService';
import ScoreCard from '../components/common/ScoreCard';
import MetricCard from '../components/common/MetricCard';
import ProgressBar from '../components/common/ProgressBar';
import Button from '../components/common/Button';
import LoadingState from '../components/common/LoadingState';
import ErrorState from '../components/common/ErrorState';
import {
  FileText,
  Download,
  Printer,
  Calendar,
  Building2,
  MapPin,
  ShieldCheck,
  Zap,
  Flame,
  Droplets,
  DollarSign,
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { formatNumber, formatCurrency, formatDate, getScoreColorClass } from '../utils/formatters';

export default function ReportsPage() {
  const { projectId: routeProjectId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeProjectId = routeProjectId || searchParams.get('projectId');

  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(activeProjectId || '');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState(null);

  // 1. Initial Load: Fetch projects
  useEffect(() => {
    const init = async () => {
      try {
        const projs = await projectService.getProjects();
        setProjects(projs);

        const targetId = activeProjectId || (projs.length > 0 ? projs[0].id : null);
        if (targetId) {
          setSelectedProjectId(targetId);
        }
      } catch (err) {
        setError('Failed to fetch projects.');
      }
    };
    init();
  }, [activeProjectId]);

  // 2. Load Report Data for selected project
  useEffect(() => {
    if (!selectedProjectId) return;

    const fetchReport = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await analysisService.getReport(selectedProjectId);
        setReportData(data);
      } catch (err) {
        setError(err.userMessage || 'Failed to generate sustainability report.');
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [selectedProjectId]);

  const handleProjectSelect = (e) => {
    const pId = e.target.value;
    setSelectedProjectId(pId);
    setSearchParams({ projectId: pId });
  };

  const handleDownloadPdf = async () => {
    setDownloading(true);
    try {
      const pdfUrl = analysisService.getReportPdfUrl(selectedProjectId);
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.setAttribute('download', `EcoBuild_Report_${selectedProjectId}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      alert('Could not download PDF. Opening print preview instead.');
      window.print();
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading && !reportData) {
    return <LoadingState message="Compiling executive sustainability audit report..." className="py-20" />;
  }

  if (error && !reportData) {
    return <ErrorState message={error} className="my-12" />;
  }

  const { project, primary_design, all_designs } = reportData || {};
  const analysis = primary_design?.analysis;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Top Action Toolbar (Hidden in Print) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5 no-print">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-forest-50 text-forest-700 border border-forest-100">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Sustainability Audit Report
            </h1>
            <p className="text-xs text-slate-500">
              Verified lifecycle documentation, carbon footprint breakdown, and executive summary
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {projects.length > 1 && (
            <div className="relative">
              <select
                value={selectedProjectId}
                onChange={handleProjectSelect}
                className="bg-white border border-slate-300 rounded-lg text-xs font-semibold py-2 pl-3 pr-8 focus:ring-forest-500 focus:border-forest-500 appearance-none shadow-2xs"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.project_name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          )}

          <Button variant="outline" size="sm" onClick={handlePrint} icon={Printer}>
            Print View
          </Button>

          <Button variant="primary" size="sm" onClick={handleDownloadPdf} loading={downloading} icon={Download}>
            Download PDF Report
          </Button>
        </div>
      </div>

      {/* PRINTABLE REPORT DOCUMENT CONTAINER */}
      <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 shadow-sm space-y-8 card-shadow">
        {/* Document Header */}
        <div className="border-b border-slate-200 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-black tracking-widest text-forest-800 uppercase">
              EcoBuild AI • Executive Sustainability Audit
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              {project?.project_name}
            </h2>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-2">
              <span className="flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                {project?.building_type}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {project?.location}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Audit Date: {formatDate(reportData?.generatedAt)}
              </span>
            </div>
          </div>

          {analysis && (
            <div className={`px-5 py-3 rounded-xl border text-center font-bold ${getScoreColorClass(analysis.sustainability_score)}`}>
              <span className="block text-3xl font-black">{Math.round(analysis.sustainability_score)}</span>
              <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">Rating: {analysis.rating_tier}</span>
            </div>
          )}
        </div>

        {/* Executive Summary */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
            1. Executive Assessment Summary
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            {analysis?.summary_explanation || 'Comprehensive building sustainability evaluation.'}
          </p>
        </div>

        {/* Category Scores Table */}
        {analysis && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              2. Dimension Performance Ratings
            </h3>
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-slate-50 text-slate-600 font-bold uppercase border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-4">Evaluation Dimension</th>
                    <th className="py-2.5 px-4 text-center">Score (0-100)</th>
                    <th className="py-2.5 px-4 text-center">Weight</th>
                    <th className="py-2.5 px-4 text-right">Impact</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  <tr>
                    <td className="py-2.5 px-4 font-bold text-slate-900">Carbon & Decarbonization</td>
                    <td className="py-2.5 px-4 text-center font-bold">{analysis.category_scores?.carbon} / 100</td>
                    <td className="py-2.5 px-4 text-center text-slate-500">30%</td>
                    <td className="py-2.5 px-4 text-right">{roundScore(analysis.category_scores?.carbon * 0.3)} pts</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-bold text-slate-900">Energy Efficiency (EUI)</td>
                    <td className="py-2.5 px-4 text-center font-bold">{analysis.category_scores?.energy} / 100</td>
                    <td className="py-2.5 px-4 text-center text-slate-500">25%</td>
                    <td className="py-2.5 px-4 text-right">{roundScore(analysis.category_scores?.energy * 0.25)} pts</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-bold text-slate-900">Water Stewardship</td>
                    <td className="py-2.5 px-4 text-center font-bold">{analysis.category_scores?.water} / 100</td>
                    <td className="py-2.5 px-4 text-center text-slate-500">20%</td>
                    <td className="py-2.5 px-4 text-right">{roundScore(analysis.category_scores?.water * 0.20)} pts</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-bold text-slate-900">Circular Materials</td>
                    <td className="py-2.5 px-4 text-center font-bold">{analysis.category_scores?.materials} / 100</td>
                    <td className="py-2.5 px-4 text-center text-slate-500">15%</td>
                    <td className="py-2.5 px-4 text-right">{roundScore(analysis.category_scores?.materials * 0.15)} pts</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-bold text-slate-900">Waste & Modularity</td>
                    <td className="py-2.5 px-4 text-center font-bold">{analysis.category_scores?.waste} / 100</td>
                    <td className="py-2.5 px-4 text-center text-slate-500">10%</td>
                    <td className="py-2.5 px-4 text-right">{roundScore(analysis.category_scores?.waste * 0.10)} pts</td>
                  </tr>
                  <tr className="bg-emerald-50/60 font-black text-forest-950">
                    <td className="py-3 px-4">OVERALL COMPOSITE RATING</td>
                    <td className="py-3 px-4 text-center text-base">{Math.round(analysis.sustainability_score)} / 100</td>
                    <td className="py-3 px-4 text-center">100%</td>
                    <td className="py-3 px-4 text-right">{Math.round(analysis.sustainability_score)} pts</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Quantified Resource Metrics Table */}
        {analysis && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              3. Quantified Engineering Metrics
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-1.5">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-500" /> Energy Performance
                </span>
                <p className="text-slate-600">
                  Annual Net Demand: <strong>{formatNumber(analysis.energy_metrics?.annual_energy_kwh)} kWh/yr</strong>
                </p>
                <p className="text-slate-600">
                  Energy Use Intensity: <strong>{analysis.energy_metrics?.energy_use_intensity_eui} kWh/m²/yr</strong>
                </p>
                <p className="text-slate-600">
                  Solar On-Site Generation: <strong>{formatNumber(analysis.energy_metrics?.annual_solar_generation_kwh)} kWh/yr</strong>
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-1.5">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-rose-500" /> Carbon Balance
                </span>
                <p className="text-slate-600">
                  Upfront Embodied Carbon: <strong>{analysis.carbon_metrics?.embodied_carbon_tco2e} tCO2e</strong>
                </p>
                <p className="text-slate-600">
                  Annual Operational Grid: <strong>{analysis.carbon_metrics?.annual_operational_carbon_tco2e} tCO2e/yr</strong>
                </p>
                <p className="text-slate-600">
                  50-Year Lifecycle Emissions: <strong>{analysis.carbon_metrics?.lifecycle_50yr_carbon_tco2e} tCO2e</strong>
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-1.5">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Droplets className="w-4 h-4 text-blue-500" /> Water Stewardship
                </span>
                <p className="text-slate-600">
                  Net Potable Municipal Draw: <strong>{formatNumber(analysis.water_metrics?.annual_water_consumption_m3, 1)} m³/yr</strong>
                </p>
                <p className="text-slate-600">
                  Rainwater Harvesting Catchment: <strong>{formatNumber(analysis.water_metrics?.rainwater_harvested_m3, 1)} m³/yr</strong>
                </p>
                <p className="text-slate-600">
                  Municipal Grid Dependency: <strong>{analysis.water_metrics?.freshwater_dependency_percentage}%</strong>
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-1.5">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-emerald-600" /> Lifecycle Economics
                </span>
                <p className="text-slate-600">
                  Initial Construction Cost: <strong>{formatCurrency(analysis.cost_metrics?.estimated_initial_cost_usd)}</strong>
                </p>
                <p className="text-slate-600">
                  Annual Utility OpEx: <strong>{formatCurrency(analysis.cost_metrics?.annual_operating_cost_usd)}/yr</strong>
                </p>
                <p className="text-slate-600">
                  Annual Savings vs Baseline: <strong>{formatCurrency(analysis.cost_metrics?.annual_utility_savings_usd)}/yr</strong>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* AI Recommendations Action List */}
        {analysis?.recommendations && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              4. Priority Decarbonization Roadmap
            </h3>
            <div className="space-y-2 text-xs">
              {analysis.recommendations.map((rec, idx) => (
                <div key={idx} className="p-3 rounded-lg border border-slate-200 bg-white space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">
                      [{rec.priority.toUpperCase()}] {rec.title}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500">{rec.category}</span>
                  </div>
                  <p className="text-slate-600">{rec.explanation}</p>
                  <p className="font-semibold text-forest-800">Impact: {rec.expected_impact}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Legal Disclaimer Note */}
        <div className="pt-6 border-t border-slate-200 text-[11px] text-slate-500 space-y-1.5">
          <p className="font-semibold text-slate-700">Notice of Algorithmic Methodology:</p>
          <p className="italic leading-relaxed">
            {analysis?.disclaimer ||
              'This sustainability report is an algorithmic early-stage engineering estimate. It does not replace official LEED, BREEAM, or certified PE stamp approvals.'}
          </p>
        </div>
      </div>
    </div>
  );
}

function roundScore(val) {
  return val ? Math.round(val * 10) / 10 : 0;
}
