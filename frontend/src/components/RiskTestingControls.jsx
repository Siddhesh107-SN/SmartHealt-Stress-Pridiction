import React, { useState, useEffect } from 'react';
import { 
  Sliders, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  RefreshCw, 
  Activity 
} from 'lucide-react';
import { heartbeatAudio } from '../utils/heartbeatAudio';
import { getRiskTier } from '../utils/riskConfig';

const PRESET_TEST_POINTS = [
  { label: "12% Low", value: 12, color: "bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100" },
  { label: "38% Moderate", value: 38, color: "bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100" },
  { label: "64% Elevated", value: 64, color: "bg-orange-50 text-orange-800 border-orange-300 hover:bg-orange-100" },
  { label: "88% Critical", value: 88, color: "bg-rose-50 text-rose-800 border-rose-300 hover:bg-rose-100" },
  { label: "100% Max", value: 100, color: "bg-slate-900 text-white border-slate-900 hover:bg-slate-800" },
];

export default function RiskTestingControls({
  currentValue,
  onChangeValue,
  originalPredictedValue,
  className = ""
}) {
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const tier = getRiskTier(currentValue);

  // Sync heartbeat audio BPM when audio is enabled
  useEffect(() => {
    if (isAudioEnabled) {
      heartbeatAudio.updateBpm(tier.bpm);
    }
  }, [tier.bpm, isAudioEnabled]);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      heartbeatAudio.stop();
    };
  }, []);

  const handleToggleAudio = () => {
    const nextState = !isAudioEnabled;
    setIsAudioEnabled(nextState);
    if (nextState) {
      heartbeatAudio.start(tier.bpm);
    } else {
      heartbeatAudio.stop();
    }
  };

  const isSimulated = originalPredictedValue !== undefined && currentValue !== originalPredictedValue;

  return (
    <div className={`rounded-2xl sm:rounded-3xl p-4 sm:p-5 bg-white border border-slate-200/80 shadow-xs space-y-4 ${className}`}>
      
      {/* Header with Title and Reset / Audio Controls */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
            <Sliders className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-slate-900">
              Interactive Risk Tier Simulation Controls
            </h4>
            <p className="text-[11px] text-slate-500">
              Scrub or pick presets to test 4 risk tiers, animations & gauge boundaries
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Reset to Model Prediction Button */}
          {isSimulated && (
            <button
              type="button"
              onClick={() => onChangeValue(originalPredictedValue)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors border border-slate-200 shadow-2xs"
              title="Reset to model predicted value"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset to {originalPredictedValue}%</span>
            </button>
          )}

          {/* Heartbeat Sound Toggle */}
          <button
            type="button"
            onClick={handleToggleAudio}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold transition-all border shadow-2xs ${
              isAudioEnabled 
                ? 'bg-[#0f766e] text-white border-[#0f766e]' 
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
            title="Optional Web Audio API heartbeat tone (off by default)"
          >
            {isAudioEnabled ? <Volume2 className="w-3.5 h-3.5 animate-pulse" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span className="text-[11px]">{isAudioEnabled ? `${tier.bpm} BPM Tone` : 'Sound Off'}</span>
          </button>
        </div>
      </div>

      {/* Real-Time Slider */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-slate-600 flex items-center gap-1">
            <Activity className="w-3.5 h-3.5 text-slate-400" />
            Live Risk Percentage Scrub:
          </span>
          <span 
            className="font-mono font-bold text-xs px-2 py-0.5 rounded-md border"
            style={{ 
              backgroundColor: `${tier.color}15`, 
              color: tier.color, 
              borderColor: `${tier.color}30` 
            }}
          >
            {currentValue}% ({tier.label})
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[11px] font-mono text-slate-400 font-semibold">0%</span>
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={currentValue}
            onChange={(e) => onChangeValue(parseInt(e.target.value, 10))}
            className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#0f766e] focus:outline-none"
            aria-label="Health risk percentage slider"
          />
          <span className="text-[11px] font-mono text-slate-400 font-semibold">100%</span>
        </div>
      </div>

      {/* Preset Quick Buttons */}
      <div className="pt-1">
        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
          Test Risk Level Presets:
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {PRESET_TEST_POINTS.map((preset) => {
            const isSelected = currentValue === preset.value;
            return (
              <button
                key={preset.value}
                type="button"
                onClick={() => onChangeValue(preset.value)}
                className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all duration-150 flex items-center justify-center gap-1.5 shadow-2xs ${
                  preset.color
                } ${isSelected ? 'ring-2 ring-slate-900 shadow-xs scale-[1.02]' : ''}`}
              >
                <span>{preset.label}</span>
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
}
