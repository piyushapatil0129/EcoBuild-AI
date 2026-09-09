import React from 'react';

export default function Checkbox({
  label,
  description,
  checked,
  onChange,
  id,
  className = '',
  ...props
}) {
  const checkboxId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <label htmlFor={checkboxId} className={`flex items-start gap-3 cursor-pointer select-none ${className}`}>
      <div className="flex items-center h-5">
        <input
          id={checkboxId}
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="w-4 h-4 text-forest-700 bg-white border-slate-300 rounded focus:ring-forest-500 focus:ring-2 focus:ring-offset-1"
          {...props}
        />
      </div>
      {(label || description) && (
        <div className="text-sm">
          {label && <span className="font-medium text-slate-800">{label}</span>}
          {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
        </div>
      )}
    </label>
  );
}
