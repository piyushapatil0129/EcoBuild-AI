import React from 'react';
import { Link } from 'react-router-dom';
import {
  Leaf,
  Zap,
  Flame,
  Droplets,
  Cpu,
  GitCompare,
  Sliders,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Layers,
  BarChart3,
  Award,
  Sparkles
} from 'lucide-react';
import Button from '../components/common/Button';

export default function LandingPage() {
  return (
    <div className="space-y-20 pb-12">
      {/* HERO SECTION */}
      <section className="text-center pt-8 sm:pt-14 pb-12 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-forest-50 border border-forest-200/80 text-forest-800 text-xs font-semibold mb-6 shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-forest-600" />
          <span>Physics-Grounded AI Building Sustainability Engine</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-[1.1] mb-4">
          EcoBuild <span className="text-forest-800">AI</span>
          <span className="block text-2xl sm:text-4xl font-extrabold text-slate-700 mt-2">
            Design Smarter. Build Greener.
          </span>
        </h1>

        <p className="text-base sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed mb-8">
          AI-powered sustainability analysis for smarter construction decisions. Evaluate energy consumption,
          carbon footprint, water balance, and life-cycle costs before breaking ground.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/create-project">
            <Button size="lg" variant="primary" icon={ArrowRight}>
              Analyze Your Building
            </Button>
          </Link>
          <Link to="/dashboard">
            <Button size="lg" variant="outline" icon={Layers}>
              Explore Demo
            </Button>
          </Link>
        </div>

        {/* Quick Trust Badges */}
        <div className="flex flex-wrap items-center justify-center gap-6 mt-12 text-xs font-medium text-slate-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-forest-700" />
            <span>ASHRAE 90.1 Calibrated</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-forest-700" />
            <span>ICE v3.0 Embodied Carbon</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-forest-700" />
            <span>Multi-Objective Pareto Optimizer</span>
          </div>
        </div>
      </section>

      {/* PIPELINE VISUAL SECTION (Building Data -> AI Analysis -> Sustainability Score -> Recommendations -> Optimized Design) */}
      <section className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-10 shadow-sm">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-forest-700 bg-forest-50 px-2.5 py-1 rounded-full border border-forest-100">
            End-to-End Workflow
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-3">
            How EcoBuild AI Evaluates Your Design
          </h2>
          <p className="text-sm text-slate-500 mt-2">
            A rigorous engineering workflow translating schematic building parameters into verified decarbonization targets.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
          {[
            {
              step: '01',
              title: 'Building Data',
              desc: 'Input geometry, envelope materials, glazing, HVAC, and renewables.',
              icon: Layers,
              color: 'forest'
            },
            {
              step: '02',
              title: 'AI Analysis',
              desc: 'ML regression predicts net kWh while physics engines balance carbon and water.',
              icon: Cpu,
              color: 'emerald'
            },
            {
              step: '03',
              title: 'Sustainability Score',
              desc: 'Composite 0–100 rating weighted across Carbon, Energy, Water, and Materials.',
              icon: Award,
              color: 'green'
            },
            {
              step: '04',
              title: 'AI Recommendations',
              desc: 'Prioritized insights identifying highest-yield envelope and solar upgrades.',
              icon: Sparkles,
              color: 'teal'
            },
            {
              step: '05',
              title: 'Optimized Design',
              desc: 'Algorithmic trade-off solver generates lowest carbon or budget configurations.',
              icon: Sliders,
              color: 'emerald'
            }
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-slate-50 rounded-xl p-5 border border-slate-200/80 relative flex flex-col justify-between group hover:bg-forest-50/50 hover:border-forest-200 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-black text-slate-400 group-hover:text-forest-700 transition-colors">
                      {item.step}
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-forest-700 shadow-2xs">
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mb-1.5">{item.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* CORE CAPABILITIES GRID */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-forest-700 bg-forest-50 px-2.5 py-1 rounded-full border border-forest-100">
            Core Modules
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-3">
            Comprehensive Sustainable Building Intelligence
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Energy */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center mb-4 border border-amber-200">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Energy Prediction ML</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Trained Scikit-learn regression pipeline predicting annual kWh and EUI based on degree days,
              window-to-wall ratios, U-values, and on-site solar photovoltaic yield.
            </p>
          </div>

          {/* Carbon */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center mb-4 border border-rose-200">
              <Flame className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Carbon Footprint Analysis</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Granular embodied carbon breakdown from structural concrete, mass timber, and wall envelopes,
              synthesized with 50-year operational grid emissions and recycled mitigation.
            </p>
          </div>

          {/* Water */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center mb-4 border border-blue-200">
              <Droplets className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Water Balance Model</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Calculates indoor occupant baseline, low-flow fixture conservation, rooftop rainwater harvesting cistern yield,
              and dual-plumbing greywater reuse percentages.
            </p>
          </div>

          {/* AI Recommendations */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-lg bg-forest-50 text-forest-700 flex items-center justify-center mb-4 border border-forest-200">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">AI Recommendation Advisor</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Evaluates performance deficits to formulate high-priority engineering interventions, from external shading
              louvers to heat pump retrofits with quantified payback periods.
            </p>
          </div>

          {/* Design Comparison */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center mb-4 border border-teal-200">
              <GitCompare className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Design Version Comparison</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Side-by-side benchmarking of Design A (Baseline) vs Design B (Sustainable) across CapEx, OpEx,
              annual energy, carbon abatement, and composite rating.
            </p>
          </div>

          {/* Sustainable Optimization */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center mb-4 border border-indigo-200">
              <Sliders className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Sustainable Optimization</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Multi-objective solver tailoring envelope and MEP parameters to client priorities: Lowest Cost,
              Lowest Carbon, Lowest Energy, or Balanced Performance.
            </p>
          </div>
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section className="bg-forest-900 text-white rounded-2xl p-8 sm:p-12 text-center relative overflow-hidden">
        <div className="relative z-10 max-w-2xl mx-auto space-y-4">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Ready to evaluate your building design?
          </h2>
          <p className="text-sm text-emerald-100 leading-relaxed">
            Run an end-to-end building assessment in under 3 minutes. Test alternative envelopes and generate
            an executive decarbonization roadmap.
          </p>
          <div className="pt-2">
            <Link to="/create-project">
              <Button size="lg" className="bg-white text-forest-900 hover:bg-emerald-50 border-transparent font-bold">
                Start Building Assessment
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
