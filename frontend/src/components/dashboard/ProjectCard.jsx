import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, MapPin, Calendar, ArrowRight, Layers } from 'lucide-react';
import { formatDate, getScoreColorClass } from '../../utils/formatters';

export default function ProjectCard({ project, onDelete }) {
  const score = project.latest_score !== undefined && project.latest_score !== null
    ? Math.round(project.latest_score)
    : null;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group">
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1">
            <span className="text-[11px] font-semibold text-forest-700 bg-forest-50 px-2 py-0.5 rounded-full uppercase tracking-wider inline-block mb-1.5 border border-forest-100">
              {project.building_type || 'Residential'}
            </span>
            <h3 className="text-base font-bold text-slate-900 group-hover:text-forest-800 transition-colors line-clamp-1">
              {project.project_name}
            </h3>
          </div>

          {score !== null ? (
            <div className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl border font-bold shrink-0 ${getScoreColorClass(score)}`}>
              <span className="text-base leading-none">{score}</span>
              <span className="text-[9px] font-semibold uppercase opacity-80 mt-0.5">pts</span>
            </div>
          ) : (
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 text-slate-400 font-bold shrink-0 text-xs">
              N/A
            </div>
          )}
        </div>

        <div className="space-y-1.5 text-xs text-slate-600 mb-4">
          <div className="flex items-center gap-1.5 text-slate-500">
            <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400" />
            <span className="truncate">{project.location || 'Standard Climate'}</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-500">
            <Layers className="w-3.5 h-3.5 shrink-0 text-slate-400" />
            <span>{project.design_count || 1} design {project.design_count === 1 ? 'version' : 'versions'}</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
            <Calendar className="w-3 h-3 shrink-0" />
            <span>Analyzed {formatDate(project.updatedAt || project.createdAt)}</span>
          </div>
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        <Link
          to={`/projects/${project.id}`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-forest-800 hover:text-forest-900 hover:underline"
        >
          Project Details
        </Link>
        <Link
          to={`/analysis/${project.id}`}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-forest-800 hover:bg-forest-900 text-white text-xs font-medium transition-colors shadow-xs"
        >
          View Analysis
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
