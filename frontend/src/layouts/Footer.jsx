import React from 'react';
import { Leaf, ShieldCheck, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 mt-auto text-xs text-slate-500 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-forest-800 flex items-center justify-center text-white">
                <Leaf className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <span className="text-sm font-bold text-slate-900">
                EcoBuild AI
              </span>
            </div>
            <p className="text-xs text-slate-600 max-w-md leading-relaxed">
              Engineering-grounded building sustainability advisor. Evaluates thermal envelope physics,
              embodied cradle-to-gate material carbon, annual water balance, and lifecycle capital economics.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-forest-700" />
              <span>Calibrated against ASHRAE 90.1, ICE v3.0, and IPCC guidelines.</span>
            </div>
          </div>

          <div>
            <h5 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-3">Platform</h5>
            <ul className="space-y-2">
              <li><Link to="/dashboard" className="hover:text-forest-800 transition-colors">Project Dashboard</Link></li>
              <li><Link to="/create-project" className="hover:text-forest-800 transition-colors">Building Assessment</Link></li>
              <li><Link to="/compare" className="hover:text-forest-800 transition-colors">Design Comparison</Link></li>
              <li><Link to="/optimize" className="hover:text-forest-800 transition-colors">Multi-Objective Optimizer</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-3">Compliance & Rating</h5>
            <ul className="space-y-2">
              <li><Link to="/reports" className="hover:text-forest-800 transition-colors">Executive Audit Reports</Link></li>
              <li><Link to="/profile" className="hover:text-forest-800 transition-colors">Scoring Weights Config</Link></li>
              <li><span className="text-slate-400">LEED / BREEAM Benchmark Mode</span></li>
              <li><span className="text-slate-400">EPD Material Factor DB</span></li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
          <p>© {new Date().getFullYear()} EcoBuild AI. Dedicated to high-performance sustainable construction.</p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Engineering Demonstration</span>
            <span>•</span>
            <span>Version 1.0.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
