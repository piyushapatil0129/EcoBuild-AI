import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import Button from '../components/common/Button';
import {
  User,
  Settings,
  Sliders,
  ShieldCheck,
  CheckCircle2,
  Database,
  Cpu,
  Save
} from 'lucide-react';

export default function ProfileSettingsPage() {
  const { user } = useAuth();

  const [weights, setWeights] = useState({
    carbon: 30,
    energy: 25,
    water: 20,
    materials: 15,
    waste: 10
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleWeightChange = (category, value) => {
    setWeights((prev) => ({ ...prev, [category]: Number(value) }));
    setSavedSuccess(false);
  };

  const handleSaveWeights = (e) => {
    e.preventDefault();
    localStorage.setItem('ecobuild_custom_weights', JSON.stringify(weights));
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
          <Settings className="w-7 h-7 text-forest-700" />
          Settings & Methodology Configuration
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Manage professional profile credentials and calibrate algorithmic scoring weights.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User Profile Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="w-12 h-12 rounded-full bg-forest-800 text-white flex items-center justify-center text-lg font-bold">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">{user?.name || 'Architect User'}</h3>
              <p className="text-xs text-forest-700 font-semibold">{user?.role || 'Lead Architect'}</p>
            </div>
          </div>

          <div className="space-y-2.5 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px] font-bold uppercase">Email</span>
              <span className="text-slate-800 font-medium">{user?.email || 'demo@ecobuild.ai'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px] font-bold uppercase">Account Role</span>
              <span className="text-slate-800 font-medium">{user?.role || 'Architect'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px] font-bold uppercase">Status</span>
              <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" /> Active Session
              </span>
            </div>
          </div>
        </div>

        {/* System & Model Information */}
        <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-forest-700" />
            AI Model Engine & Physics Pipeline
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Model Type</span>
              <span className="block font-bold text-slate-900 mt-0.5">Scikit-learn RandomForestRegressor</span>
              <span className="text-[11px] text-slate-500">Trained on 6,000 thermal building models (R² = 0.988)</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Embodied Carbon Standard</span>
              <span className="block font-bold text-slate-900 mt-0.5">ICE Database v3.0</span>
              <span className="text-[11px] text-slate-500">Cradle-to-gate inventory for concrete, timber, and envelope</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Water Balance Model</span>
              <span className="block font-bold text-slate-900 mt-0.5">ASHRAE 189.1 Standard</span>
              <span className="text-[11px] text-slate-500">Rainwater collection & greywater offset coefficient</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Database Storage</span>
              <span className="block font-bold text-slate-900 mt-0.5">MongoDB Atlas / In-Memory Dual Driver</span>
              <span className="text-[11px] text-slate-500">Zero-configuration fallback for resilient instant operation</span>
            </div>
          </div>
        </div>
      </div>

      {/* SCORING ENGINE WEIGHTS CUSTOMIZATION (Prompt #12) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-forest-700" />
              Sustainability Scoring Engine Weights
            </h2>
            <p className="text-xs text-slate-500">
              Adjust dimension priority weights (Total must sum to 100%)
            </p>
          </div>

          <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
            totalWeight === 100
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-700 border-rose-200'
          }`}>
            Total Weight: {totalWeight}% {totalWeight !== 100 && '(Must equal 100%)'}
          </span>
        </div>

        <form onSubmit={handleSaveWeights} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Carbon Weight</label>
              <input
                type="number"
                min={0}
                max={100}
                value={weights.carbon}
                onChange={(e) => handleWeightChange('carbon', e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg py-2 px-3 text-xs font-bold text-slate-900 text-center"
              />
              <span className="text-[10px] text-slate-400 block text-center mt-1">Default 30%</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Energy Weight</label>
              <input
                type="number"
                min={0}
                max={100}
                value={weights.energy}
                onChange={(e) => handleWeightChange('energy', e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg py-2 px-3 text-xs font-bold text-slate-900 text-center"
              />
              <span className="text-[10px] text-slate-400 block text-center mt-1">Default 25%</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Water Weight</label>
              <input
                type="number"
                min={0}
                max={100}
                value={weights.water}
                onChange={(e) => handleWeightChange('water', e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg py-2 px-3 text-xs font-bold text-slate-900 text-center"
              />
              <span className="text-[10px] text-slate-400 block text-center mt-1">Default 20%</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Materials Weight</label>
              <input
                type="number"
                min={0}
                max={100}
                value={weights.materials}
                onChange={(e) => handleWeightChange('materials', e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg py-2 px-3 text-xs font-bold text-slate-900 text-center"
              />
              <span className="text-[10px] text-slate-400 block text-center mt-1">Default 15%</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Waste Weight</label>
              <input
                type="number"
                min={0}
                max={100}
                value={weights.waste}
                onChange={(e) => handleWeightChange('waste', e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg py-2 px-3 text-xs font-bold text-slate-900 text-center"
              />
              <span className="text-[10px] text-slate-400 block text-center mt-1">Default 10%</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            {savedSuccess ? (
              <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Scoring weights successfully calibrated!
              </span>
            ) : <span />}

            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={totalWeight !== 100}
              icon={Save}
            >
              Save Custom Weights
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
