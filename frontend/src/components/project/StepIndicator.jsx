import React from 'react';
import { Check } from 'lucide-react';

export default function StepIndicator({ steps, currentStep, onStepClick }) {
  return (
    <div className="w-full py-4 mb-6">
      <div className="flex items-center justify-between relative">
        {/* Connecting progress line */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 w-full bg-slate-200 -z-0" />
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-forest-700 transition-all duration-300 -z-0"
          style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
        />

        {steps.map((step, idx) => {
          const isCompleted = idx < currentStep;
          const isCurrent = idx === currentStep;

          return (
            <div
              key={step.id || idx}
              onClick={() => onStepClick && onStepClick(idx)}
              className={`flex flex-col items-center relative z-10 ${
                onStepClick ? 'cursor-pointer group' : ''
              }`}
            >
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-xs ${
                  isCompleted
                    ? 'bg-forest-700 text-white'
                    : isCurrent
                    ? 'bg-forest-800 text-white ring-4 ring-forest-100'
                    : 'bg-white text-slate-500 border-2 border-slate-300 group-hover:border-slate-400'
                }`}
              >
                {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : idx + 1}
              </div>
              <span
                className={`text-[11px] font-semibold mt-2 hidden sm:block text-center max-w-[90px] leading-tight ${
                  isCurrent
                    ? 'text-forest-900 font-bold'
                    : isCompleted
                    ? 'text-slate-700'
                    : 'text-slate-400'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
      <div className="sm:hidden text-center mt-3">
        <span className="text-xs font-bold text-forest-900">
          Step {currentStep + 1} of {steps.length}: {steps[currentStep].label}
        </span>
      </div>
    </div>
  );
}
