import React from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  AlertCircle, 
  Flame, 
  HeartPulse, 
  CheckCircle2, 
  Info,
  ArrowRight
} from 'lucide-react';
import { getRiskTier } from '../utils/riskConfig';

const ICON_MAP = {
  ShieldCheck: ShieldCheck,
  AlertTriangle: AlertTriangle,
  AlertCircle: AlertCircle,
  Flame: Flame,
};

export default function RiskAdvisoryCard({ 
  value = 0,
  customAdvice = null,
  className = "" 
}) {
  const tier = getRiskTier(value);
  const IconComponent = ICON_MAP[tier.iconName] || ShieldCheck;
  const clampedValue = Math.min(100, Math.max(0, Math.round(value)));

  return (
    <div 
      className={`relative overflow-hidden rounded-2xl sm:rounded-3xl border transition-all duration-300 shadow-sm ${tier.bgLight} ${tier.borderLight} ${tier.textDark} ${className}`}
    >
      {/* Critical Risk Top Animated Alert Bar */}
      {tier.id === 'critical' && (
        <div className="h-1.5 w-full bg-rose-500 animate-pulse" />
      )}

      <div className="p-5 sm:p-6 space-y-4">
        
        {/* Top Header: Icon + Badge + Risk Category */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div 
              className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-2xs transition-colors duration-300"
              style={{ backgroundColor: `${tier.color}20`, color: tier.color }}
            >
              <IconComponent className={`w-5 h-5 ${tier.id === 'critical' ? 'animate-bounce' : ''}`} />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-widest font-bold opacity-75">
                  Clinical Assessment
                </span>
                <span 
                  className="px-2 py-0.5 text-[10px] font-bold rounded-full border uppercase tracking-wider"
                  style={{ 
                    backgroundColor: `${tier.color}15`, 
                    color: tier.color, 
                    borderColor: `${tier.color}30` 
                  }}
                >
                  {tier.shortLabel} Tier ({clampedValue}%)
                </span>
              </div>

              <h4 className="text-base sm:text-lg font-extrabold tracking-tight mt-0.5">
                {tier.advisoryTitle}
              </h4>
            </div>
          </div>

          {/* Dynamic Pulse Rhythm Pill */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/70 backdrop-blur-xs border border-slate-200/60 text-xs font-semibold text-slate-700 shadow-2xs">
            <HeartPulse className="w-3.5 h-3.5 text-slate-500 animate-pulse" />
            <span className="text-[11px] font-mono">{tier.bpm} BPM</span>
          </div>
        </div>

        {/* Advisory Narrative Message */}
        <p className="text-xs sm:text-sm font-medium leading-relaxed opacity-95">
          {customAdvice || tier.advisoryMessage}
        </p>

        {/* Actionable Health Recommendations */}
        <div className="pt-2 border-t border-black/5 space-y-2">
          <div className="text-[11px] font-bold uppercase tracking-wider opacity-80 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Recommended Next Actions:
          </div>

          <ul className="space-y-1.5 text-xs">
            {tier.actionableTips.map((tip, index) => (
              <li key={index} className="flex items-start gap-2">
                <span 
                  className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" 
                  style={{ backgroundColor: tier.color }}
                />
                <span className="leading-snug">{tip}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Medical Disclaimer Footer */}
        <div className="pt-2 flex items-start gap-2 text-[11px] opacity-75 leading-tight border-t border-black/5">
          <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <span>
            <b>Assessment Notice:</b> This AI prediction reflects biometric probability scoring based on wearable vital signals and does not constitute a definitive medical diagnosis.
          </span>
        </div>

      </div>
    </div>
  );
}
