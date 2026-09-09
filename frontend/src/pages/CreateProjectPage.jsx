import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectService } from '../services/projectService';
import StepIndicator from '../components/project/StepIndicator';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import Checkbox from '../components/common/Checkbox';
import Toggle from '../components/common/Toggle';
import Button from '../components/common/Button';
import LoadingState from '../components/common/LoadingState';
import {
  BUILDING_TYPES,
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
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Building,
  Ruler,
  Boxes,
  Maximize2,
  Zap,
  Droplets
} from 'lucide-react';

const STEPS = [
  { id: 'basic', label: 'Basic Info', icon: Building },
  { id: 'geometry', label: 'Building Info', icon: Ruler },
  { id: 'materials', label: 'Materials', icon: Boxes },
  { id: 'windows', label: 'Windows & Design', icon: Maximize2 },
  { id: 'energy', label: 'Energy & HVAC', icon: Zap },
  { id: 'water', label: 'Water Systems', icon: Droplets }
];

export default function CreateProjectPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Comprehensive Form State with realistic engineering defaults
  const [formData, setFormData] = useState({
    // Step 1: Basic
    project_name: 'Verdant Horizon Residence',
    building_type: 'Residential',
    location: 'London, UK (Temperate Climate)',
    description: 'Proposed low-carbon high-efficiency building project.',

    // Step 2: Building Geometry & Schedule
    built_up_area: 280,
    num_floors: 2,
    occupants: 4,
    operating_hours: 14,
    building_orientation: 'South-Facing',

    // Step 3: Construction Materials
    structural_material: 'Mass Timber / CLT',
    wall_material: 'AAC Lightweight Concrete Blocks',
    flooring_material: 'FSC Hardwood / Bamboo',
    roof_material: 'Cool Metal Roof (Reflective)',
    insulation_type: 'Mineral Rockwool',
    recycled_material_percentage: 25,

    // Step 4: Windows and Design
    window_type: 'Wood / Timber Frame',
    window_to_wall_ratio: 28,
    glazing_type: 'Double Glazed Low-E (Argon)',
    external_shading: true,
    natural_ventilation: true,

    // Step 5: Energy
    electricity_source: 'Grid + Rooftop Solar',
    solar_installed: true,
    solar_capacity: 8.5,
    hvac_system: 'High-Efficiency Air-Source Heat Pump',
    led_lighting: true,
    other_renewable: 'None',

    // Step 6: Water
    water_source: 'Municipal Supply',
    rainwater_harvesting: true,
    water_efficient_fixtures: true,
    wastewater_recycling: false,
    greywater_reuse: true
  });

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        project_name: formData.project_name,
        building_type: formData.building_type,
        location: formData.location,
        description: formData.description,
        initial_parameters: formData
      };

      const project = await projectService.createProject(payload);
      // Navigate straight to analysis page for this newly created project!
      navigate(`/analysis/${project.id}`);
    } catch (err) {
      setError(err.userMessage || 'Failed to analyze building. Please verify values.');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-16">
        <LoadingState isAnalyzing={true} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Title & Description */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Create Building Assessment
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Complete the multi-step building parameters to initiate AI sustainability and lifecycle analysis.
        </p>
      </div>

      {/* Step Indicator Navigation */}
      <StepIndicator
        steps={STEPS}
        currentStep={currentStep}
        onStepClick={(idx) => setCurrentStep(idx)}
      />

      {error && (
        <div className="p-4 mb-6 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
          {error}
        </div>
      )}

      {/* Multi-step Form Card Container */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs mb-8">
        {/* STEP 1: BASIC INFORMATION */}
        {currentStep === 0 && (
          <div className="space-y-5 animate-fadeIn">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-lg font-bold text-slate-900">Step 1 — Basic Information</h2>
              <p className="text-xs text-slate-500">Project identity, typology, and geographic climate zone.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="sm:col-span-2">
                <Input
                  label="Project Name"
                  required
                  placeholder="e.g. Greenwood Community Center"
                  value={formData.project_name}
                  onChange={(e) => updateField('project_name', e.target.value)}
                />
              </div>

              <Select
                label="Building Typology"
                options={BUILDING_TYPES}
                value={formData.building_type}
                onChange={(e) => updateField('building_type', e.target.value)}
              />

              <Input
                label="Location / Climate Region"
                required
                placeholder="e.g. Seattle, WA or London, UK"
                value={formData.location}
                onChange={(e) => updateField('location', e.target.value)}
                helperText="Used to calibrate solar irradiance and heating/cooling degree days."
              />

              <div className="sm:col-span-2">
                <Input
                  label="Project Description (Optional)"
                  placeholder="Summary of architectural goals, occupancy context, and client objectives..."
                  value={formData.description}
                  onChange={(e) => updateField('description', e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: BUILDING GEOMETRY & INFORMATION */}
        {currentStep === 1 && (
          <div className="space-y-5 animate-fadeIn">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-lg font-bold text-slate-900">Step 2 — Building Information & Geometry</h2>
              <p className="text-xs text-slate-500">Gross area, floors, internal occupancy density, and orientation.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Input
                label="Built-up Area"
                type="number"
                min={10}
                unit="m²"
                value={formData.built_up_area}
                onChange={(e) => updateField('built_up_area', Number(e.target.value))}
                helperText="Total gross enclosed floor space."
              />

              <Input
                label="Number of Floors"
                type="number"
                min={1}
                max={100}
                unit="stories"
                value={formData.num_floors}
                onChange={(e) => updateField('num_floors', Number(e.target.value))}
              />

              <Input
                label="Design Occupancy"
                type="number"
                min={1}
                unit="occupants"
                value={formData.occupants}
                onChange={(e) => updateField('occupants', Number(e.target.value))}
                helperText="Used to model domestic water and internal metabolic plug loads."
              />

              <Input
                label="Operating Hours"
                type="number"
                min={1}
                max={24}
                unit="hrs/day"
                value={formData.operating_hours}
                onChange={(e) => updateField('operating_hours', Number(e.target.value))}
              />

              <div className="sm:col-span-2">
                <Select
                  label="Primary Building Orientation"
                  options={ORIENTATIONS}
                  value={formData.building_orientation}
                  onChange={(e) => updateField('building_orientation', e.target.value)}
                  helperText="South-facing orientation optimizes solar passive gains in northern hemisphere."
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: CONSTRUCTION MATERIALS */}
        {currentStep === 2 && (
          <div className="space-y-5 animate-fadeIn">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-lg font-bold text-slate-900">Step 3 — Construction Materials</h2>
              <p className="text-xs text-slate-500">Structural framing, envelope materials, insulation, and circularity.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Select
                label="Primary Structural Material"
                options={STRUCTURAL_MATERIALS}
                value={formData.structural_material}
                onChange={(e) => updateField('structural_material', e.target.value)}
              />

              <Select
                label="Exterior Wall Material"
                options={WALL_MATERIALS}
                value={formData.wall_material}
                onChange={(e) => updateField('wall_material', e.target.value)}
              />

              <Select
                label="Flooring Material"
                options={FLOORING_MATERIALS}
                value={formData.flooring_material}
                onChange={(e) => updateField('flooring_material', e.target.value)}
              />

              <Select
                label="Roof Construction Material"
                options={ROOF_MATERIALS}
                value={formData.roof_material}
                onChange={(e) => updateField('roof_material', e.target.value)}
              />

              <Select
                label="Envelope Insulation Type"
                options={INSULATION_TYPES}
                value={formData.insulation_type}
                onChange={(e) => updateField('insulation_type', e.target.value)}
              />

              <Input
                label="Recycled Material Content"
                type="number"
                min={0}
                max={100}
                unit="%"
                value={formData.recycled_material_percentage}
                onChange={(e) => updateField('recycled_material_percentage', Number(e.target.value))}
                helperText="Percentage of recycled aggregates, steel, or bio-composite content."
              />
            </div>
          </div>
        )}

        {/* STEP 4: WINDOWS AND DESIGN */}
        {currentStep === 3 && (
          <div className="space-y-5 animate-fadeIn">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-lg font-bold text-slate-900">Step 4 — Windows and Passive Design</h2>
              <p className="text-xs text-slate-500">Glazing performance, window-to-wall ratios, shading, and natural air cycling.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Select
                label="Window Frame Type"
                options={WINDOW_TYPES}
                value={formData.window_type}
                onChange={(e) => updateField('window_type', e.target.value)}
              />

              <Select
                label="Glazing Specification"
                options={GLAZING_TYPES}
                value={formData.glazing_type}
                onChange={(e) => updateField('glazing_type', e.target.value)}
              />

              <div className="sm:col-span-2">
                <Input
                  label="Window-to-Wall Ratio (WWR)"
                  type="number"
                  min={5}
                  max={90}
                  unit="%"
                  value={formData.window_to_wall_ratio}
                  onChange={(e) => updateField('window_to_wall_ratio', Number(e.target.value))}
                  helperText="Recommended ASHRAE baseline window-to-wall ratio is typically 20%–35%."
                />
              </div>

              <div className="sm:col-span-2 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
                <Toggle
                  label="External Architectural Shading / Overhangs"
                  description="Block high summer solar irradiation while permitting daylight and winter heat gains."
                  checked={formData.external_shading}
                  onChange={(val) => updateField('external_shading', val)}
                />

                <div className="border-t border-slate-200 pt-3">
                  <Toggle
                    label="Natural Passive Ventilation Strategy"
                    description="Operable high-low fenestration facilitating night flushing and buoyant cross-ventilation."
                    checked={formData.natural_ventilation}
                    onChange={(val) => updateField('natural_ventilation', val)}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: ENERGY & HVAC */}
        {currentStep === 4 && (
          <div className="space-y-5 animate-fadeIn">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-lg font-bold text-slate-900">Step 5 — Energy & Renewables</h2>
              <p className="text-xs text-slate-500">Grid electricity supply, heat pumps, lighting, and on-site solar PV.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Select
                label="Primary Electricity Source"
                options={ELECTRICITY_SOURCES}
                value={formData.electricity_source}
                onChange={(e) => updateField('electricity_source', e.target.value)}
              />

              <Select
                label="Mechanical HVAC System"
                options={HVAC_SYSTEMS}
                value={formData.hvac_system}
                onChange={(e) => updateField('hvac_system', e.target.value)}
              />

              <div className="sm:col-span-2 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
                <Toggle
                  label="Rooftop Solar Photovoltaic (PV) Installed"
                  description="Generate renewable zero-carbon electricity on-site to offset grid demand."
                  checked={formData.solar_installed}
                  onChange={(val) => {
                    updateField('solar_installed', val);
                    if (!val) updateField('solar_capacity', 0);
                    else if (formData.solar_capacity === 0) updateField('solar_capacity', 8.0);
                  }}
                />

                {formData.solar_installed && (
                  <div className="pt-3 border-t border-slate-200">
                    <Input
                      label="Installed Solar PV Capacity"
                      type="number"
                      min={0.5}
                      step={0.5}
                      unit="kWp"
                      value={formData.solar_capacity}
                      onChange={(e) => updateField('solar_capacity', Number(e.target.value))}
                      helperText="Standard residential systems range from 4 to 15 kWp; commercial 20 to 100+ kWp."
                    />
                  </div>
                )}
              </div>

              <div className="sm:col-span-2">
                <Checkbox
                  label="100% High-Efficiency LED Lighting Specification"
                  description="Cuts electrical lighting power density by over 50% relative to standard fluorescent/halogen."
                  checked={formData.led_lighting}
                  onChange={(e) => updateField('led_lighting', e.target.checked)}
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 6: WATER SYSTEMS & CIRCULARITY */}
        {currentStep === 5 && (
          <div className="space-y-5 animate-fadeIn">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-lg font-bold text-slate-900">Step 6 — Water Stewardship & Circularity</h2>
              <p className="text-xs text-slate-500">Rainwater harvesting, low-flow plumbing, and greywater reclamation.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="sm:col-span-2">
                <Select
                  label="Primary Water Source"
                  options={WATER_SOURCES}
                  value={formData.water_source}
                  onChange={(e) => updateField('water_source', e.target.value)}
                />
              </div>

              <div className="sm:col-span-2 space-y-3">
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                  <Checkbox
                    label="Rooftop Rainwater Harvesting Cistern & Filtration"
                    description="Captures roof precipitation for non-potable flushing, cooling tower makeup, or landscaping."
                    checked={formData.rainwater_harvesting}
                    onChange={(e) => updateField('rainwater_harvesting', e.target.checked)}
                  />
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                  <Checkbox
                    label="EPA WaterSense Certified Low-Flow Fixtures"
                    description="Ultra-efficient aerated faucets, dual-flush toilets, and shower flow limiters (~35% water savings)."
                    checked={formData.water_efficient_fixtures}
                    onChange={(e) => updateField('water_efficient_fixtures', e.target.checked)}
                  />
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                  <Checkbox
                    label="Dual-Plumbing Greywater Reuse System"
                    description="Recovers lavatory and shower drainage to supply sub-surface irrigation and toilet flushing."
                    checked={formData.greywater_reuse}
                    onChange={(e) => updateField('greywater_reuse', e.target.checked)}
                  />
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                  <Checkbox
                    label="Blackwater / Membrane Bioreactor (MBR) Wastewater Recycling"
                    description="Full on-site wastewater reclamation for industrial or large-scale institutional developments."
                    checked={formData.wastewater_recycling}
                    onChange={(e) => updateField('wastewater_recycling', e.target.checked)}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons: Back, Next, Analyze Building */}
      <div className="flex items-center justify-between gap-4">
        <Button
          type="button"
          variant="outline"
          size="md"
          onClick={handleBack}
          disabled={currentStep === 0}
          icon={ArrowLeft}
        >
          Previous Step
        </Button>

        {currentStep < STEPS.length - 1 ? (
          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={handleNext}
          >
            Next Step
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        ) : (
          <Button
            type="button"
            variant="primary"
            size="lg"
            onClick={handleSubmit}
            className="bg-forest-800 hover:bg-forest-900 shadow-md font-bold px-8"
            icon={Sparkles}
          >
            Analyze Building
          </Button>
        )}
      </div>
    </div>
  );
}
