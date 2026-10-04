import React from 'react';
import { 
  Play, 
  RotateCcw, 
  Cpu, 
  Layers, 
  Sparkles, 
  Activity, 
  ChevronRight, 
  Check, 
  ShieldCheck 
} from 'lucide-react';
import InputField from './InputField';
import { AVAILABLE_MODELS, ACTIVITY_LEVELS } from '../utils/constants';

export default function PredictionForm({
  formData,
  onChangeField,
  onReset,
  onSubmit,
  isLoading,
  selectedModel,
  onSelectModel,
  isCompareAll,
  onToggleCompareAll,
  includeExplainability,
  onToggleExplainability,
  formErrors = {},
}) {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      
      {/* Top Model Selection & Mode Control Bar */}
      <div className="rounded-2xl sm:rounded-3xl p-4 sm:p-5 bg-[#fdfefe] border border-[#d8e4e2] shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Model Selector */}
          <div className="flex-1">
            <label className="text-[11px] font-bold text-[#718784] uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-[#0f766e]" />
              Machine Learning Classifier
            </label>
            <div className="relative">
              <select
                value={selectedModel}
                onChange={(e) => onSelectModel(e.target.value)}
                disabled={isLoading || isCompareAll}
                className="w-full bg-white border border-[#d8e4e2] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-[#0b1f2a] focus:outline-none focus:border-[#0f766e] focus:ring-1 focus:ring-[#0f766e] disabled:opacity-50 disabled:cursor-not-allowed appearance-none cursor-pointer pr-10 shadow-2xs"
              >
                {AVAILABLE_MODELS.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.name} — {model.tag}
                  </option>
                ))}
              </select>
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#718784] text-xs">
                ▼
              </div>
            </div>
          </div>

          {/* Mode Switch: Single vs Multi-Model Matrix */}
          <div className="flex items-center gap-3 pt-1 md:pt-6">
            <button
              type="button"
              onClick={onToggleCompareAll}
              disabled={isLoading}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all border ${
                isCompareAll
                  ? 'bg-[#0f766e] text-white border-[#0f766e] shadow-xs'
                  : 'bg-white text-[#718784] border-[#d8e4e2] hover:text-[#0b1f2a] hover:bg-[#f6faf9]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Multi-Model Matrix</span>
              <span className={`w-2 h-2 rounded-full ${isCompareAll ? 'bg-white animate-pulse' : 'bg-[#d8e2e0]'}`} />
            </button>
          </div>

        </div>
      </div>

      {/* Grid of Physiological Input Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Heart Rate */}
        <InputField
          name="heart_rate_bpm"
          value={formData.heart_rate_bpm}
          onChange={onChangeField}
          disabled={isLoading}
          error={formErrors.heart_rate_bpm}
        />

        {/* Blood Oxygen Level */}
        <InputField
          name="blood_oxygen_level"
          value={formData.blood_oxygen_level}
          onChange={onChangeField}
          disabled={isLoading}
          error={formErrors.blood_oxygen_level}
        />

        {/* Daily Step Count */}
        <InputField
          name="step_count"
          value={formData.step_count}
          onChange={onChangeField}
          disabled={isLoading}
          error={formErrors.step_count}
        />

        {/* Sleep Duration */}
        <InputField
          name="sleep_duration_hours"
          value={formData.sleep_duration_hours}
          onChange={onChangeField}
          disabled={isLoading}
          error={formErrors.sleep_duration_hours}
        />

        {/* Sensor Stress Level as a biomarker (Full width on md) */}
        <div className="md:col-span-2">
          <InputField
            name="stress_level"
            value={formData.stress_level}
            onChange={onChangeField}
            disabled={isLoading}
            error={formErrors.stress_level}
          />
        </div>

      </div>

      {/* Categorical Feature: Activity Level Selector */}
      <div className="rounded-2xl sm:rounded-3xl p-4 sm:p-5 bg-white border border-[#e2ecea] shadow-2xs">
        <label className="text-[11px] font-bold text-[#718784] uppercase tracking-wider block mb-3 flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-[#0f766e]" />
          Physical Activity Level Category
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {ACTIVITY_LEVELS.map((lvl) => {
            const isSelected = formData.activity_level === lvl.value;
            return (
              <button
                key={lvl.value}
                type="button"
                disabled={isLoading}
                onClick={() => onChangeField('activity_level', lvl.value)}
                className={`p-3.5 rounded-2xl text-left border transition-all duration-150 relative overflow-hidden group ${
                  isSelected
                    ? 'bg-[#f6faf9] border-[#0f766e] text-[#0b1f2a] shadow-xs ring-1 ring-[#0f766e]'
                    : 'bg-[#fdfefe] border-[#d8e4e2] text-[#718784] hover:border-[#0f766e]/40 hover:bg-[#f6faf9]'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-0 right-0 w-7 h-7 bg-[#0f766e]/15 rounded-bl-xl flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 text-[#0f766e]" />
                  </div>
                )}
                <div className="font-bold text-xs sm:text-sm text-[#0b1f2a] group-hover:text-[#0f766e] transition-colors">
                  {lvl.label}
                </div>
                <div className="text-[10px] text-[#0f766e] font-semibold mt-0.5">
                  {lvl.badge}
                </div>
                <div className="text-[11px] text-[#718784] mt-1.5 leading-snug">
                  {lvl.subtext}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* SHAP Explainability Toggle */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-[#fdfefe] border border-[#d8e4e2] shadow-2xs">
        <label htmlFor="explain-toggle" className="flex items-center gap-3 cursor-pointer select-none">
          <div className="w-8 h-8 rounded-xl bg-[#0f766e]/10 text-[#0f766e] flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs sm:text-sm font-bold text-[#0b1f2a] block">
              Generate Explainable AI (SHAP) Report
            </span>
            <span className="text-[11px] text-[#718784]">
              Compute exact biometric feature attribution and health risk drivers
            </span>
          </div>
        </label>
        
        <input
          id="explain-toggle"
          type="checkbox"
          checked={includeExplainability}
          onChange={onToggleExplainability}
          disabled={isLoading}
          className="w-4 h-4 rounded text-[#0f766e] border-[#d8e4e2] focus:ring-[#0f766e] cursor-pointer"
        />
      </div>

      {/* Action Buttons: Predict Health Risk & Reset */}
      <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
        {/* Predict CTA Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full sm:flex-1 py-3.5 px-6 rounded-full bg-[#0b1f2a] hover:bg-[#163546] text-white font-semibold text-sm sm:text-base shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group active:scale-[0.99]"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Analyzing Physiological Health Risk...</span>
            </>
          ) : (
            <>
              <span>
                {isCompareAll 
                  ? "Predict Health Risk (All 4 Models)" 
                  : `Predict Health Risk (${AVAILABLE_MODELS.find(m => m.id === selectedModel)?.name || selectedModel})`}
              </span>
              <div className="w-6 h-6 rounded-full bg-white/15 flex items-center justify-center group-hover:bg-white/25 transition-colors">
                <ChevronRight className="w-3.5 h-3.5 text-white group-hover:translate-x-0.5 transition-transform" />
              </div>
            </>
          )}
        </button>

        {/* Reset Button */}
        <button
          type="button"
          onClick={onReset}
          disabled={isLoading}
          className="w-full sm:w-auto py-3 px-5 rounded-full bg-white hover:bg-slate-50 text-[#718784] hover:text-[#0b1f2a] border border-[#d8e4e2] font-semibold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

    </form>
  );
}
