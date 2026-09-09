import React, { useState, useEffect } from 'react';
import { Cpu } from 'lucide-react';

const ANALYSIS_STEPS = [
  'Extracting architectural building parameters...',
  'Running ML neural energy prediction model...',
  'Evaluating embodied & operational carbon balance...',
  'Simulating rainwater harvesting & water balance...',
  'Synthesizing AI engineering recommendations...'
];

export default function LoadingState({
  message = 'Processing...',
  isAnalyzing = false,
  className = ''
}) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    if (!isAnalyzing) return;
    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => (prev + 1) % ANALYSIS_STEPS.length);
    }, 700);
    return () => clearInterval(interval);
  }, [isAnalyzing]);

  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center ${className}`}>
      <div className="relative mb-4">
        <div className="w-12 h-12 rounded-full border-3 border-forest-200 border-t-forest-700 animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center text-forest-700">
          <Cpu className="w-5 h-5 animate-pulse" />
        </div>
      </div>
      
      <p className="text-sm font-semibold text-slate-800 transition-all duration-300">
        {isAnalyzing ? ANALYSIS_STEPS[currentStepIndex] : message}
      </p>
      
      {isAnalyzing && (
        <p className="text-xs text-slate-500 mt-1 max-w-xs">
          Calibrating thermodynamic envelope against ASHRAE 90.1 benchmarks
        </p>
      )}
    </div>
  );
}
