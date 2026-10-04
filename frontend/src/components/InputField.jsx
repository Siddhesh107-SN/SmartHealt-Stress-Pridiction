import React from 'react';
import { Heart, Wind, Footprints, Moon, Activity, Gauge } from 'lucide-react';
import { FEATURE_BOUNDS } from '../utils/constants';

const ICON_MAP = {
  heart_rate_bpm: Heart,
  blood_oxygen_level: Wind,
  step_count: Footprints,
  sleep_duration_hours: Moon,
  stress_level: Gauge,
};

export default function InputField({
  name,
  value,
  onChange,
  disabled = false,
  error = null,
}) {
  const meta = FEATURE_BOUNDS[name] || {
    min: 0,
    max: 100,
    step: 1,
    unit: '',
    label: name,
    description: '',
    normalRange: [0, 100],
  };

  const Icon = ICON_MAP[name] || Activity;
  const numValue = typeof value === 'number' ? value : parseFloat(value) || 0;
  
  const isOutOfBiologicalRange = numValue < meta.min || numValue > meta.max;

  const isOptimal = 
    meta.normalRange && 
    numValue >= meta.normalRange[0] && 
    numValue <= meta.normalRange[1];

  const handleSliderChange = (e) => {
    onChange(name, parseFloat(e.target.value));
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    if (val === '') {
      onChange(name, '');
    } else {
      onChange(name, parseFloat(val) || 0);
    }
  };

  return (
    <div className="rounded-2xl p-4 sm:p-5 bg-white border border-[#e2ecea] hover:border-[#0f766e]/40 transition-all shadow-2xs focus-within:border-[#0f766e] focus-within:ring-2 focus-within:ring-[#0f766e]/10 group">
      
      {/* Top Header with Icon, Label, and Normal Baseline Pill */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#0f766e]/10 text-[#0f766e] flex items-center justify-center shrink-0 group-hover:bg-[#0f766e]/15 transition-colors">
            <Icon className="w-4 h-4" />
          </div>
          <div>
            <label htmlFor={`input-${name}`} className="text-xs sm:text-sm font-semibold text-[#0b1f2a] block">
              {meta.label}
            </label>
            <span className="text-[11px] text-[#718784] font-medium">
              Range: {meta.min} - {meta.max} {meta.unit}
            </span>
          </div>
        </div>

        {/* Optimal Baseline Pill */}
        {meta.normalRange && (
          <span 
            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
              isOptimal 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}
            title={`Clinical optimal baseline: ${meta.normalRange[0]} - ${meta.normalRange[1]} ${meta.unit}`}
          >
            {isOptimal ? 'Optimal' : 'Elevated'}
          </span>
        )}
      </div>

      {/* Numerical Input + Slider Row */}
      <div className="space-y-3 mt-3">
        <div className="flex items-center gap-3">
          {/* Slider */}
          <input
            type="range"
            min={meta.min}
            max={meta.max}
            step={meta.step}
            value={isNaN(numValue) ? meta.min : numValue}
            onChange={handleSliderChange}
            disabled={disabled}
            aria-label={`${meta.label} slider`}
            className="flex-1 h-2 bg-[#e2ecea] rounded-lg appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed accent-[#0f766e]"
          />

          {/* Direct Numerical Input Box */}
          <div className="relative w-28 shrink-0">
            <input
              id={`input-${name}`}
              type="number"
              min={meta.min}
              max={meta.max}
              step={meta.step}
              value={value}
              onChange={handleInputChange}
              disabled={disabled}
              placeholder={`${meta.min}`}
              className="w-full bg-[#fdfefe] border border-[#d8e4e2] focus:border-[#0f766e] focus:outline-none focus:ring-1 focus:ring-[#0f766e] text-[#0b1f2a] font-semibold text-xs sm:text-sm px-3 py-1.5 rounded-xl text-right disabled:opacity-50 disabled:cursor-not-allowed pr-8 transition-colors"
            />
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] sm:text-[11px] text-[#718784] pointer-events-none font-sans font-medium">
              {meta.unit}
            </span>
          </div>
        </div>

        {/* Feature Context / Description */}
        <p className="text-[11px] text-[#718784] leading-tight">
          {meta.description}
        </p>

        {/* Out-of-bounds warning */}
        {isOutOfBiologicalRange && (
          <div className="text-[11px] text-rose-700 font-medium bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
            ⚠️ Value outside accepted clinical range ({meta.min} - {meta.max} {meta.unit})
          </div>
        )}

        {/* Custom Field Error */}
        {error && (
          <div className="text-[11px] text-rose-600 font-semibold">
            {error}
          </div>
        )}
      </div>

    </div>
  );
}
