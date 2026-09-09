import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { projectService } from '../services/projectService';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import Checkbox from '../components/common/Checkbox';
import Toggle from '../components/common/Toggle';
import Button from '../components/common/Button';
import LoadingState from '../components/common/LoadingState';
import {
  STRUCTURAL_MATERIALS,
  WALL_MATERIALS,
  FLOORING_MATERIALS,
  ROOF_MATERIALS,
  INSULATION_TYPES,
  WINDOW_TYPES,
  GLAZING_TYPES,
  HVAC_SYSTEMS,
  ORIENTATIONS,
  ELECTRICITY_SOURCES,
  WATER_SOURCES
} from '../utils/constants';
import { ArrowLeft, Sparkles, Layers, PlusCircle } from 'lucide-react';

export default function BuildingDesignFormPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [designName, setDesignName] = useState('Design B (Sustainable Alternative)');
  const [description, setDescription] = useState('Alternative design iteration with high-performance envelope and renewables.');

  const [params, setParams] = useState({
    built_up_area: 250,
    num_floors: 2,
    occupants: 4,
    operating_hours: 14,
    building_orientation: 'South-Facing',
    structural_material: 'Mass Timber / CLT',
    wall_material: 'AAC Lightweight Concrete Blocks',
    flooring_material: 'FSC Hardwood / Bamboo',
    roof_material: 'Extensive Green Roof',
    insulation_type: 'Mineral Rockwool',
    recycled_material_percentage: 35,
    window_type: 'Wood / Timber Frame',
    window_to_wall_ratio: 25,
    glazing_type: 'Triple Glazed Low-E (Krypton)',
    external_shading: true,
    natural_ventilation: true,
    electricity_source: 'Grid + Rooftop Solar',
    solar_installed: true,
    solar_capacity: 10.0,
    hvac_system: 'High-Efficiency Air-Source Heat Pump',
    led_lighting: true,
    water_source: 'Municipal Supply',
    rainwater_harvesting: true,
    water_efficient_fixtures: true,
    wastewater_recycling: false,
    greywater_reuse: true
  });

  useEffect(() => {
    const loadProject = async () => {
      try {
        const p = await projectService.getProjectById(projectId);
        setProject(p);
        if (p.designs && p.designs.length > 0) {
          const prevDesign = p.designs[p.designs.length - 1];
          // Prepopulate with previous design parameters
          if (prevDesign.parameters) {
            setParams((prev) => ({ ...prev, ...prevDesign.parameters }));
          }
          const nextLetter = String.fromCharCode(65 + p.designs.length);
          setDesignName(`Design ${nextLetter} (Enhanced Strategy)`);
        }
      } catch (err) {
        setError('Failed to load project details.');
      } finally {
        setLoading(false);
      }
    };
    loadProject();
  }, [projectId]);

  const updateParam = (field, value) => {
    setParams((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const payload = {
        project_id: projectId,
        design_name: designName,
        description: description,
        parameters: {
          ...params,
          project_name: project.project_name,
          building_type: project.building_type,
          location: project.location
        }
      };

      await projectService.createDesign(payload);
      navigate(`/projects/${projectId}`);
    } catch (err) {
      setError(err.userMessage || 'Failed to create and analyze design version.');
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingState message="Preparing design version template..." className="py-20" />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link
          to={`/projects/${projectId}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Project Details
        </Link>
      </div>

      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-bold text-slate-900">
          Create New Design Version
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Project: <strong className="text-slate-800">{project?.project_name}</strong> • Typology: {project?.building_type}
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Version Identity */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
            Version Identity
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Design Version Name"
              required
              value={designName}
              onChange={(e) => setDesignName(e.target.value)}
            />
            <Input
              label="Design Notes / Narrative"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Mass timber structure with upgraded triple glazing"
            />
          </div>
        </div>

        {/* Geometry & Envelope */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
            Envelope & Construction Materials
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select
              label="Structural Framing"
              options={STRUCTURAL_MATERIALS}
              value={params.structural_material}
              onChange={(e) => updateParam('structural_material', e.target.value)}
            />
            <Select
              label="Exterior Walls"
              options={WALL_MATERIALS}
              value={params.wall_material}
              onChange={(e) => updateParam('wall_material', e.target.value)}
            />
            <Select
              label="Insulation Type"
              options={INSULATION_TYPES}
              value={params.insulation_type}
              onChange={(e) => updateParam('insulation_type', e.target.value)}
            />
            <Select
              label="Roofing Material"
              options={ROOF_MATERIALS}
              value={params.roof_material}
              onChange={(e) => updateParam('roof_material', e.target.value)}
            />
            <Select
              label="Glazing Specification"
              options={GLAZING_TYPES}
              value={params.glazing_type}
              onChange={(e) => updateParam('glazing_type', e.target.value)}
            />
            <Input
              label="Window-to-Wall Ratio"
              type="number"
              unit="%"
              value={params.window_to_wall_ratio}
              onChange={(e) => updateParam('window_to_wall_ratio', Number(e.target.value))}
            />
          </div>
        </div>

        {/* Energy & Water Systems */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
            HVAC, Renewables & Water Systems
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="HVAC System"
              options={HVAC_SYSTEMS}
              value={params.hvac_system}
              onChange={(e) => updateParam('hvac_system', e.target.value)}
            />
            <Input
              label="Solar PV Capacity"
              type="number"
              min={0}
              step={0.5}
              unit="kWp"
              value={params.solar_capacity}
              onChange={(e) => updateParam('solar_capacity', Number(e.target.value))}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100">
            <Checkbox
              label="External Shading Louvers"
              checked={params.external_shading}
              onChange={(e) => updateParam('external_shading', e.target.checked)}
            />
            <Checkbox
              label="Passive Natural Ventilation"
              checked={params.natural_ventilation}
              onChange={(e) => updateParam('natural_ventilation', e.target.checked)}
            />
            <Checkbox
              label="Rainwater Harvesting Cistern"
              checked={params.rainwater_harvesting}
              onChange={(e) => updateParam('rainwater_harvesting', e.target.checked)}
            />
            <Checkbox
              label="Dual-Plumbing Greywater Reuse"
              checked={params.greywater_reuse}
              onChange={(e) => updateParam('greywater_reuse', e.target.checked)}
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <Link to={`/projects/${projectId}`}>
            <Button variant="outline">Cancel</Button>
          </Link>
          <Button type="submit" variant="primary" loading={submitting} icon={Sparkles}>
            Save & Run AI Analysis
          </Button>
        </div>
      </form>
    </div>
  );
}
