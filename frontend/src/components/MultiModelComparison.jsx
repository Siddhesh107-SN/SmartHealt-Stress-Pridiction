import React from 'react';
import { Layers, ShieldCheck, Flame } from 'lucide-react';

const MODEL_PRETTY_NAMES = {
  xgboost: "XGBoost Classifier",
  random_forest: "Random Forest",
  decision_tree: "Decision Tree",
  logistic_regression: "Logistic Regression",
};

export default function MultiModelComparison({ multiModelResult }) {
  if (!multiModelResult || !multiModelResult.predictions) return null;

  const predictions = multiModelResult.predictions;
  const modelKeys = Object.keys(predictions);

  let highRiskCount = 0;
  modelKeys.forEach((key) => {
    const item = predictions[key];
    const isHigh = item.prediction === 1 || (item.label && (item.label.toLowerCase().includes("high") || item.label.toLowerCase().includes("elevated") || item.label.toLowerCase().includes("risk")));
    if (isHigh) highRiskCount++;
  });

  const totalModels = modelKeys.length;
  const isConsensusHigh = highRiskCount > totalModels / 2;
  const consensusPercentage = Math.round((Math.max(highRiskCount, totalModels - highRiskCount) / totalModels) * 100);

  return (
    <div id="models" className="rounded-2xl sm:rounded-3xl border border-[#e2ecea] bg-white p-5 sm:p-7 shadow-xs space-y-6 animate-fade-in">
      
      {/* Header & Consensus Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#0f766e]/10 text-[#0f766e] flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-[#0b1f2a]">
              Multi-Model Ensemble Matrix
            </h3>
          </div>
          <p className="text-xs text-[#718784] mt-1">
            Simultaneous health risk inference across 4 machine learning classifiers
          </p>
        </div>

        {/* Consensus Badge */}
        <div className={`px-4 py-2 rounded-2xl border flex items-center gap-2.5 ${
          isConsensusHigh 
            ? 'bg-rose-50 border-rose-200 text-rose-800' 
            : 'bg-emerald-50 border-emerald-200 text-emerald-800'
        }`}>
          <span className="text-lg select-none">{isConsensusHigh ? '⚠️' : '🛡️'}</span>
          <div>
            <div className="text-[10px] uppercase font-bold tracking-wider text-[#718784]">
              Ensemble Consensus
            </div>
            <div className="text-xs sm:text-sm font-bold">
              {consensusPercentage}% ({isConsensusHigh ? 'Elevated Health Risk' : 'Low Health Risk'})
            </div>
          </div>
        </div>
      </div>

      {/* Grid of 4 Model Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {modelKeys.map((key) => {
          const data = predictions[key];
          const isHigh = data.prediction === 1 || (data.label && (data.label.toLowerCase().includes("high") || data.label.toLowerCase().includes("elevated")));
          const probHighPct = typeof data.probability === 'number' 
            ? +(data.probability * 100).toFixed(1) 
            : 0;

          const prettyName = MODEL_PRETTY_NAMES[key] || key;

          return (
            <div
              key={key}
              className={`rounded-2xl p-4 border transition-all duration-150 ${
                isHigh 
                  ? 'bg-rose-50/50 border-rose-200 shadow-2xs' 
                  : 'bg-[#fdfefe] border-[#d8e4e2] shadow-2xs'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-xs font-bold text-[#0b1f2a] truncate">
                  {prettyName}
                </span>
                <span className="text-sm select-none">{isHigh ? '⚠️' : '🛡️'}</span>
              </div>

              {/* Status Badge */}
              <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold mb-3 ${
                isHigh 
                  ? 'bg-rose-100 text-rose-800 border border-rose-200' 
                  : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
              }`}>
                {isHigh ? <Flame className="w-3.5 h-3.5 text-[#ef775f]" /> : <ShieldCheck className="w-3.5 h-3.5 text-[#0f766e]" />}
                <span>{isHigh ? 'Elevated Risk' : 'Low Risk'}</span>
              </div>

              {/* Health Risk Probability Progress Bar */}
              <div className="space-y-1 mt-2">
                <div className="flex justify-between text-[11px] text-[#718784]">
                  <span>Health Risk Prob</span>
                  <span className="font-mono font-bold text-[#0b1f2a]">{probHighPct}%</span>
                </div>
                <div className="w-full h-1.5 bg-[#d8e2e0] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isHigh ? 'bg-[#ef775f]' : 'bg-[#0f766e]'
                    }`}
                    style={{ width: `${probHighPct}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
