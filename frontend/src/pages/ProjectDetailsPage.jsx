import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { projectService } from '../services/projectService';
import Button from '../components/common/Button';
import LoadingState from '../components/common/LoadingState';
import ErrorState from '../components/common/ErrorState';
import {
  Building2,
  MapPin,
  Calendar,
  Layers,
  ArrowRight,
  GitCompare,
  PlusCircle,
  Trash2,
  Award,
  Zap,
  Flame,
  Droplets,
  ArrowLeft
} from 'lucide-react';
import { formatDate, formatNumber, getScoreColorClass } from '../utils/formatters';

export default function ProjectDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchProject = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await projectService.getProjectById(id);
      setProject(data);
    } catch (err) {
      setError(err.userMessage || 'Could not find project.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this project and all associated design versions?')) {
      return;
    }
    setDeleting(true);
    try {
      await projectService.deleteProject(id);
      navigate('/dashboard');
    } catch (err) {
      alert(err.userMessage || 'Failed to delete project.');
      setDeleting(false);
    }
  };

  if (loading) {
    return <LoadingState message="Loading project details and designs..." className="py-20" />;
  }

  if (error || !project) {
    return <ErrorState message={error || 'Project not found.'} onRetry={fetchProject} className="my-12" />;
  }

  const designs = project.designs || [];

  return (
    <div className="space-y-8">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Dashboard
        </Link>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleDelete}
          loading={deleting}
          icon={Trash2}
          className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
        >
          Delete Project
        </Button>
      </div>

      {/* Project Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold text-forest-700 bg-forest-50 px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-forest-100">
                {project.building_type}
              </span>
              <span className="text-xs text-slate-400">•</span>
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{project.location}</span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {project.project_name}
            </h1>

            {project.description && (
              <p className="text-sm text-slate-600 mt-2 max-w-2xl leading-relaxed">
                {project.description}
              </p>
            )}
          </div>

          <div className="flex flex-col sm:items-end gap-2">
            {project.latest_score !== undefined && project.latest_score !== null && (
              <div className="flex items-center gap-3 bg-forest-50/60 border border-forest-200 rounded-xl p-3">
                <div className="text-right">
                  <span className="block text-[10px] font-bold text-forest-700 uppercase tracking-wider">Latest Score</span>
                  <span className="text-xs font-semibold text-slate-600">{project.latest_rating_tier || 'Rating'}</span>
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg border ${getScoreColorClass(project.latest_score)}`}>
                  {Math.round(project.latest_score)}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              Created {formatDate(project.createdAt)}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Layers className="w-3.5 h-3.5" />
              {designs.length} Design {designs.length === 1 ? 'Version' : 'Versions'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {designs.length >= 2 && (
              <Link to={`/compare?projectId=${project.id}`}>
                <Button variant="secondary" size="sm" icon={GitCompare}>
                  Compare Versions
                </Button>
              </Link>
            )}
            <Link to={`/create-design/${project.id}`}>
              <Button variant="primary" size="sm" icon={PlusCircle}>
                New Design Version
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* DESIGN VERSIONS SECTION */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">
            Design Versions & Historical Iterations
          </h2>
          <span className="text-xs text-slate-500">
            Select a version to inspect detailed lifecycle metrics or optimize
          </span>
        </div>

        <div className="space-y-4">
          {designs.map((design, idx) => {
            const analysis = design.analysis;
            const score = analysis?.sustainability_score;
            const energy = analysis?.energy_metrics;
            const carbon = analysis?.carbon_metrics;
            const water = analysis?.water_metrics;

            return (
              <div
                key={design.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-forest-300 transition-all"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs font-bold bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-md">
                        Version {String.fromCharCode(65 + idx)}
                      </span>
                      <h3 className="text-base font-bold text-slate-900">
                        {design.design_name}
                      </h3>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-1">
                      {design.description || 'Parametric design iteration with modified envelope and systems.'}
                    </p>

                    {/* Key Specifications Tag Line */}
                    <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-500">
                      <span className="bg-slate-50 border border-slate-200 px-2 py-0.5 rounded">
                        Structure: {design.parameters?.structural_material || 'Concrete'}
                      </span>
                      <span className="bg-slate-50 border border-slate-200 px-2 py-0.5 rounded">
                        Glazing: {design.parameters?.glazing_type || 'Standard'}
                      </span>
                      <span className="bg-slate-50 border border-slate-200 px-2 py-0.5 rounded">
                        Solar: {design.parameters?.solar_capacity || 0} kWp
                      </span>
                    </div>
                  </div>

                  {/* Metrics Snapshot */}
                  {analysis ? (
                    <div className="flex items-center gap-6 py-2 lg:py-0 border-y lg:border-y-0 lg:border-l border-slate-100 lg:pl-6">
                      <div className="text-center">
                        <span className="block text-[10px] font-semibold text-slate-400 uppercase">Energy</span>
                        <span className="text-sm font-bold text-slate-800 flex items-center gap-0.5">
                          <Zap className="w-3.5 h-3.5 text-amber-500 inline" />
                          {formatNumber(energy?.annual_energy_kwh)} <span className="text-[10px] font-normal text-slate-400">kWh</span>
                        </span>
                      </div>

                      <div className="text-center">
                        <span className="block text-[10px] font-semibold text-slate-400 uppercase">50-yr Carbon</span>
                        <span className="text-sm font-bold text-slate-800 flex items-center gap-0.5">
                          <Flame className="w-3.5 h-3.5 text-rose-500 inline" />
                          {formatNumber(carbon?.lifecycle_50yr_carbon_tco2e, 1)} <span className="text-[10px] font-normal text-slate-400">t</span>
                        </span>
                      </div>

                      <div className="text-center">
                        <span className="block text-[10px] font-semibold text-slate-400 uppercase">Score</span>
                        <span className={`text-base font-black px-2.5 py-0.5 rounded-lg border ${getScoreColorClass(score)}`}>
                          {Math.round(score)}
                        </span>
                      </div>
                    </div>
                  ) : null}

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Link to={`/analysis/${project.id}?designId=${design.id}`}>
                      <Button variant="primary" size="sm" icon={ArrowRight}>
                        View Analysis
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
