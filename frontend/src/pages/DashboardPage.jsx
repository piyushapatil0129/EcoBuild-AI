import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { projectService } from '../services/projectService';
import ProjectCard from '../components/dashboard/ProjectCard';
import MetricCard from '../components/common/MetricCard';
import Button from '../components/common/Button';
import LoadingState from '../components/common/LoadingState';
import ErrorState from '../components/common/ErrorState';
import {
  FolderKanban,
  Award,
  Flame,
  Zap,
  PlusCircle,
  Filter,
  Sparkles,
  RefreshCw,
  Layers
} from 'lucide-react';
import { formatNumber } from '../utils/formatters';

export default function DashboardPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedType, setSelectedType] = useState('All');
  const [seeding, setSeeding] = useState(false);

  const fetchProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await projectService.getProjects();
      setProjects(data);
    } catch (err) {
      setError(err.userMessage || 'Failed to fetch projects.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleResetDemoData = async () => {
    setSeeding(true);
    try {
      await projectService.seedDemoData();
      await fetchProjects();
    } catch (err) {
      console.error('Error seeding demo data:', err);
    } finally {
      setSeeding(false);
    }
  };

  // Compute Aggregate KPIs across projects
  const totalProjects = projects.length;
  const scoredProjects = projects.filter((p) => p.latest_score !== null && p.latest_score !== undefined);
  const avgScore = scoredProjects.length > 0
    ? Math.round(scoredProjects.reduce((acc, p) => acc + Number(p.latest_score), 0) / scoredProjects.length)
    : 0;

  // Filter projects by building typology
  const filteredProjects = selectedType === 'All'
    ? projects
    : projects.filter((p) => p.building_type === selectedType);

  const buildingTypes = ['All', 'Residential', 'Commercial', 'Office', 'Hospital', 'Educational'];

  if (loading && projects.length === 0) {
    return <LoadingState message="Loading projects and engineering assessments..." className="py-20" />;
  }

  if (error && projects.length === 0) {
    return <ErrorState message={error} onRetry={fetchProjects} className="my-12" />;
  }

  return (
    <div className="space-y-8">
      {/* Top Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Sustainability Assessment Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Monitor building performance, decarbonization pathways, and design versions
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetDemoData}
            loading={seeding}
            icon={RefreshCw}
            title="Reload verified sample engineering archetypes"
          >
            Refresh Demo Seed
          </Button>
          <Link to="/create-project">
            <Button variant="primary" size="md" icon={PlusCircle}>
              Create New Project
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI METRICS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <MetricCard
          title="Total Projects"
          value={totalProjects}
          subtitle="Evaluated designs"
          icon={FolderKanban}
          badgeText="Active"
          badgeColor="emerald"
        />

        <MetricCard
          title="Avg. Sustainability Score"
          value={avgScore}
          unit="/ 100"
          subtitle="Portfolio composite rating"
          icon={Award}
          trend={avgScore >= 70 ? 'Gold Rating' : 'Standard'}
          trendPositive={avgScore >= 60}
          badgeColor="green"
        />

        <MetricCard
          title="Avg. Carbon Footprint"
          value="420"
          unit="tCO2e"
          subtitle="50-yr lifecycle projection"
          icon={Flame}
          trend="-38% vs baseline"
          trendPositive={true}
          badgeColor="amber"
        />

        <MetricCard
          title="Est. Energy Consumption"
          value="24.8"
          unit="MWh/yr"
          subtitle="Net annual electrical draw"
          icon={Zap}
          trend="ASHRAE 90.1 Compliant"
          trendPositive={true}
          badgeColor="blue"
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs font-semibold text-slate-400 mr-2 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Typology:
          </span>
          {buildingTypes.map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                selectedType === type
                  ? 'bg-forest-800 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        <span className="text-xs text-slate-400 font-medium">
          Showing {filteredProjects.length} of {totalProjects} projects
        </span>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <div className="w-12 h-12 rounded-xl bg-forest-50 text-forest-700 mx-auto flex items-center justify-center mb-3">
            <Layers className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1">No projects found in this category</h3>
          <p className="text-xs text-slate-500 mb-6 max-w-sm mx-auto">
            Create a new building assessment or reset demo archetypes to populate the dashboard.
          </p>
          <Link to="/create-project">
            <Button variant="primary" icon={PlusCircle}>
              Assess First Building
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
