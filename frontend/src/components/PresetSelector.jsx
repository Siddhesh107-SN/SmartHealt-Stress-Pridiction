import React from 'react';
import { Sparkles, ShieldCheck, Flame, Activity, AlertTriangle } from 'lucide-react';
import { PRESET_SCENARIOS } from '../utils/constants';

const PRESET_ICONS = {
  ShieldCheck: ShieldCheck,
  Flame: Flame,
  Activity: Activity,
  AlertTriangle: AlertTriangle,
};

export default function PresetSelector({ onSelectPreset, currentData, disabled = false }) {
  return (
    <div className="rounded-2xl sm:rounded-3xl p-4 sm:p-6 bg-white border border-[#e2ecea] shadow-2xs">
      <div className="flex items-center justify-between gap-2 mb-3 sm:mb-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[#0f766e]/10 text-[#0f766e] flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <h3 className="text-xs sm:text-sm font-bold text-[#0b1f2a] tracking-tight uppercase">
            Quick Clinical Test Profiles
          </h3>
        </div>
        <span className="text-[11px] text-[#718784] hidden sm:inline font-medium">
          1-Click Physiological Scenarios
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {PRESET_SCENARIOS.map((preset) => {
          const Icon = PRESET_ICONS[preset.icon] || Activity;
          return (
            <button
              key={preset.id}
              type="button"
              disabled={disabled}
              onClick={() => onSelectPreset(preset.data)}
              className="flex items-start gap-3 p-3.5 rounded-2xl text-left bg-[#fdfefe] hover:bg-[#f6faf9] border border-[#d8e4e2] hover:border-[#0f766e]/50 text-[#0b1f2a] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed group focus:outline-none focus:ring-2 focus:ring-[#0f766e]/20 shadow-2xs hover:shadow-xs"
            >
              <div className="w-8 h-8 rounded-xl bg-[#0f766e]/10 text-[#0f766e] flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs sm:text-sm font-bold text-[#0b1f2a] group-hover:text-[#0f766e] transition-colors truncate">
                  {preset.name}
                </div>
                <div className="text-[11px] text-[#718784] line-clamp-2 mt-0.5 leading-snug">
                  {preset.description}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
