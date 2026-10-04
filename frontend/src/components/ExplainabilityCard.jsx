import React from 'react';
import { Sparkles, TrendingUp, TrendingDown, Info } from 'lucide-react';

const PRETTY_FEATURE_NAMES = {
  "Heart Rate (BPM)": "Heart Rate",
  "Blood Oxygen Level (%)": "Blood Oxygen (SpO2)",
  "Step Count": "Daily Step Count",
  "Sleep Duration (hours)": "Sleep Duration",
  "Activity Level": "Physical Activity Level",
  "Stress Level": "Sensor Stress Score",
};

export default function ExplainabilityCard({ explanationData }) {
  if (!explanationData || !explanationData.explanation) return null;

  const { model, prediction, label, base_value, explanation } = explanationData;
  const maxAbsShap = Math.max(...explanation.map((item) => Math.abs(item.shap_value)), 0.01);

  return (
    <div id="explainability" className="rounded-2xl sm:rounded-3xl border border-[#e2ecea] bg-white p-5 sm:p-7 shadow-xs space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#0f766e]/10 text-[#0f766e] flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-[#0b1f2a]">
              Explainable AI (XAI) — Biometric Risk Drivers
            </h3>
          </div>
          <p className="text-xs text-[#718784] mt-1">
            Local SHAP feature attribution: quantifying how each vital metric influenced your health risk score
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-xl text-xs font-mono bg-[#f6faf9] border border-[#d8e4e2] text-[#0f766e] font-semibold">
            Model: {model}
          </span>
          {typeof base_value === 'number' && (
            <span className="px-3 py-1 rounded-xl text-xs font-mono bg-[#f6faf9] border border-[#d8e4e2] text-[#718784]">
              Base: {base_value}
            </span>
          )}
        </div>
      </div>

      {/* Legend & Direction */}
      <div className="flex flex-wrap items-center gap-4 text-xs">
        <div className="flex items-center gap-1.5 text-rose-700 font-medium">
          <TrendingUp className="w-4 h-4 text-[#ef775f]" />
          <span><b>Coral (+):</b> Increases Health Risk</span>
        </div>
        <div className="flex items-center gap-1.5 text-emerald-800 font-medium">
          <TrendingDown className="w-4 h-4 text-[#0f766e]" />
          <span><b>Teal (-):</b> Protective / Lowers Health Risk</span>
        </div>
      </div>

      {/* Feature Attribution Bars List */}
      <div className="space-y-3">
        {explanation.map((item, idx) => {
          const isPositive = item.shap_value > 0.0001;
          const isNegative = item.shap_value < -0.0001;
          const percentageWidth = Math.min(100, Math.round((Math.abs(item.shap_value) / maxAbsShap) * 100));
          const displayName = PRETTY_FEATURE_NAMES[item.feature] || item.feature;

          return (
            <div key={idx} className="p-3.5 rounded-2xl bg-[#fdfefe] border border-[#e2ecea] space-y-2">
              
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#0b1f2a]">{displayName}</span>
                  <span className="text-[#718784] font-mono text-xs">
                    (value: {item.value})
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`font-mono text-xs font-bold ${
                    isPositive ? 'text-[#ef775f]' : isNegative ? 'text-[#0f766e]' : 'text-[#718784]'
                  }`}>
                    {item.shap_value > 0 ? `+${item.shap_value.toFixed(4)}` : item.shap_value.toFixed(4)}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isPositive 
                      ? 'bg-rose-100 text-rose-800' 
                      : isNegative 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : 'bg-slate-100 text-slate-700'
                  }`}>
                    {isPositive ? 'Risk Driver' : isNegative ? 'Protective' : 'Neutral'}
                  </span>
                </div>
              </div>

              {/* Visual SHAP Impact Bar */}
              <div className="w-full h-2 bg-[#d8e2e0] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ease-out ${
                    isPositive ? 'bg-[#ef775f]' : 'bg-[#0f766e]'
                  }`}
                  style={{ width: `${Math.max(5, percentageWidth)}%` }}
                />
              </div>

            </div>
          );
        })}
      </div>

      {/* Explanation Footer Note */}
      <div className="p-3.5 rounded-2xl bg-[#f6faf9] border border-[#e2ecea] text-xs text-[#718784] flex items-start gap-2">
        <Info className="w-4 h-4 text-[#0f766e] shrink-0 mt-0.5" />
        <p>
          SHAP (SHapley Additive exPlanations) uses cooperative game theory to quantify the exact mathematical influence of each biometric input on the overall health risk classification.
        </p>
      </div>

    </div>
  );
}
