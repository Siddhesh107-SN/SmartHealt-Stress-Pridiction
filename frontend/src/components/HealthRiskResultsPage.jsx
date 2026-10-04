import React, { useState, useEffect } from 'react';
import { 
  HeartPulse, 
  ArrowLeft, 
  Printer, 
  RefreshCcw, 
  ShieldCheck, 
  Cpu, 
  Sparkles, 
  Activity, 
  Layers, 
  Heart, 
  Wind, 
  Footprints, 
  Moon, 
  Gauge, 
  CheckCircle2, 
  Info,
  ChevronRight,
  Share2
} from 'lucide-react';
import HealthRiskMeter from './HealthRiskMeter';
import RiskAdvisoryCard from './RiskAdvisoryCard';
import RiskTestingControls from './RiskTestingControls';
import MultiModelComparison from './MultiModelComparison';
import ExplainabilityCard from './ExplainabilityCard';
import { getRiskTier } from '../utils/riskConfig';

export default function HealthRiskResultsPage({
  predictionResult,
  multiModelResult,
  explanationResult,
  inputSnapshot,
  selectedModel,
  onBackToForm,
  onRecalculate,
}) {
  // Determine baseline predicted health risk percentage
  const initialRiskScore = React.useMemo(() => {
    if (!predictionResult) return 50;

    // Check if backend returned confidence_percentage or probability
    if (typeof predictionResult.confidencePct === 'number') {
      return predictionResult.isHighStress 
        ? predictionResult.confidencePct 
        : Math.round(100 - predictionResult.confidencePct);
    }
    if (typeof predictionResult.probability === 'number') {
      const prob = predictionResult.probability;
      const pct = prob > 1 ? prob : prob * 100;
      return predictionResult.isHighStress ? Math.round(pct) : Math.round(100 - pct);
    }
    return predictionResult.isHighStress ? 82 : 18;
  }, [predictionResult]);

  // Interactive state (starts with model output, user can scrub / simulate)
  const [currentRiskScore, setCurrentRiskScore] = useState(initialRiskScore);

  useEffect(() => {
    setCurrentRiskScore(initialRiskScore);
  }, [initialRiskScore]);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const tier = getRiskTier(currentRiskScore);
  const modelName = predictionResult?.model || selectedModel || 'xgboost';

  return (
    <div className="w-full min-h-screen bg-[#eef3f2] p-2 sm:p-4 md:p-6 text-[#0b1f2a]">
      
      {/* Main Page Container */}
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* ============================================================ */}
        {/* Top Header & Navigation Bar */}
        {/* ============================================================ */}
        <header className="rounded-2xl sm:rounded-3xl bg-white/90 backdrop-blur-md border border-white/80 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Back Button & Brand */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
            <button
              type="button"
              onClick={onBackToForm}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-semibold transition-all shadow-2xs group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              <span>Back to Vitals Input</span>
            </button>

            <div className="h-6 w-px bg-slate-200 hidden sm:block" />

            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[#0f766e] text-white flex items-center justify-center shadow-2xs">
                <HeartPulse className="w-3.5 h-3.5 animate-pulse" />
              </div>
              <span className="font-bold text-sm tracking-tight text-[#0b1f2a]">
                SmartHealth <span className="text-[#0f766e] font-serif italic text-base font-normal">AI</span>
              </span>
            </div>
          </div>

          {/* Model Badge & Action Buttons */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#f6faf9] border border-[#d8e4e2] text-xs font-semibold text-[#0f766e]">
              <Cpu className="w-3.5 h-3.5" />
              <span className="font-mono uppercase">{modelName}</span>
            </div>

            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold shadow-2xs transition-colors"
              title="Print assessment report"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Print Report</span>
            </button>
          </div>

        </header>

        {/* ============================================================ */}
        {/* Results Page Hero Banner */}
        {/* ============================================================ */}
        <div className="rounded-3xl bg-[#dce9e6] border border-white/80 p-6 sm:p-8 md:p-10 shadow-xs relative overflow-hidden">
          
          {/* Subtle Background Radial Glow */}
          <div 
            className="absolute -right-20 -bottom-20 w-96 h-96 rounded-full blur-3xl opacity-30 pointer-events-none transition-colors duration-700"
            style={{ backgroundColor: tier.color }}
          />

          <div className="relative z-10 max-w-3xl">
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/80 backdrop-blur-xs border border-white text-xs font-bold text-[#0f766e] mb-3 shadow-2xs">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Personalized Health Risk Assessment</span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-[#0b1f2a]">
              Your Physiological Health Risk Assessment
            </h1>

            <p className="mt-2 text-xs sm:text-sm md:text-base text-[#718784] font-medium leading-relaxed">
              Based on your multi-parameter biometric vitals and machine learning inference, we’ve analyzed your overall cardiovascular, metabolic, and autonomic health risk profile.
            </p>
          </div>

        </div>

        {/* ============================================================ */}
        {/* Main 2-Column Dashboard Layout */}
        {/* ============================================================ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* ============================================================ */}
          {/* LEFT COLUMN: Health Risk Prediction Meter & Advisory (7 cols) */}
          {/* ============================================================ */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Main Meter Card */}
            <div className="rounded-3xl bg-white p-6 sm:p-8 border border-slate-200/80 shadow-lg shadow-slate-200/50 space-y-6 text-center">
              
              {/* Card Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 text-left">
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold">
                    Primary Output / 01
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                    Health Risk Prediction Meter
                  </h3>
                </div>

                <span 
                  className="px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider transition-colors duration-300"
                  style={{ 
                    backgroundColor: `${tier.color}15`, 
                    color: tier.color, 
                    borderColor: `${tier.color}30` 
                  }}
                >
                  {tier.label}
                </span>
              </div>

              {/* The SVG Radial Horseshoe Meter */}
              <div className="py-2">
                <HealthRiskMeter
                  value={currentRiskScore}
                  onChange={setCurrentRiskScore}
                  isInteractive={true}
                />
              </div>

              {/* Dynamic Risk Advisory Card (Directly beneath meter) */}
              <RiskAdvisoryCard
                value={currentRiskScore}
                customAdvice={predictionResult?.riskAssessment}
              />

              {/* Interactive Testing & Simulation Controls */}
              <RiskTestingControls
                currentValue={currentRiskScore}
                onChangeValue={setCurrentRiskScore}
                originalPredictedValue={initialRiskScore}
              />

            </div>

          </div>

          {/* ============================================================ */}
          {/* RIGHT COLUMN: Biometric Context, Vitals Snapshot & XAI (5 cols) */}
          {/* ============================================================ */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Biometric Snapshot Card */}
            {inputSnapshot && (
              <div className="rounded-3xl bg-white p-5 sm:p-7 border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-[#0f766e]/10 text-[#0f766e] flex items-center justify-center">
                      <Activity className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900">
                      Recorded Biometric Vitals
                    </h3>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500 font-semibold">
                    Input Snapshot
                  </span>
                </div>

                {/* 6 Biometric Feature Grid */}
                <div className="grid grid-cols-2 gap-3">
                  
                  {/* Heart Rate */}
                  <div className="p-3 rounded-2xl bg-slate-50/80 border border-slate-200/70">
                    <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                      <span className="flex items-center gap-1">
                        <Heart className="w-3.5 h-3.5 text-rose-500" />
                        Heart Rate
                      </span>
                    </div>
                    <div className="text-base font-mono font-bold text-slate-900 mt-1">
                      {inputSnapshot.heart_rate_bpm} <span className="text-xs text-slate-500 font-normal">BPM</span>
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      Normal: 60–100 BPM
                    </div>
                  </div>

                  {/* Blood Oxygen */}
                  <div className="p-3 rounded-2xl bg-slate-50/80 border border-slate-200/70">
                    <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                      <span className="flex items-center gap-1">
                        <Wind className="w-3.5 h-3.5 text-teal-600" />
                        SpO2 Oxygen
                      </span>
                    </div>
                    <div className="text-base font-mono font-bold text-slate-900 mt-1">
                      {inputSnapshot.blood_oxygen_level}%
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      Target: 95–100%
                    </div>
                  </div>

                  {/* Daily Steps */}
                  <div className="p-3 rounded-2xl bg-slate-50/80 border border-slate-200/70">
                    <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                      <span className="flex items-center gap-1">
                        <Footprints className="w-3.5 h-3.5 text-amber-600" />
                        Daily Steps
                      </span>
                    </div>
                    <div className="text-base font-mono font-bold text-slate-900 mt-1">
                      {Number(inputSnapshot.step_count).toLocaleString()}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      Target: 7,000+
                    </div>
                  </div>

                  {/* Sleep Duration */}
                  <div className="p-3 rounded-2xl bg-slate-50/80 border border-slate-200/70">
                    <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                      <span className="flex items-center gap-1">
                        <Moon className="w-3.5 h-3.5 text-indigo-500" />
                        Sleep Duration
                      </span>
                    </div>
                    <div className="text-base font-mono font-bold text-slate-900 mt-1">
                      {inputSnapshot.sleep_duration_hours} <span className="text-xs text-slate-500 font-normal">hrs</span>
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      Target: 7–9 hrs
                    </div>
                  </div>

                  {/* Activity Level */}
                  <div className="p-3 rounded-2xl bg-slate-50/80 border border-slate-200/70">
                    <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                      <span className="flex items-center gap-1">
                        <Activity className="w-3.5 h-3.5 text-emerald-600" />
                        Activity Tier
                      </span>
                    </div>
                    <div className="text-xs font-bold capitalize text-slate-900 mt-1 truncate">
                      {inputSnapshot.activity_level}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      Lifestyle baseline
                    </div>
                  </div>

                  {/* Sensor Stress Score (Biomarker feature) */}
                  <div className="p-3 rounded-2xl bg-slate-50/80 border border-slate-200/70">
                    <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                      <span className="flex items-center gap-1">
                        <Gauge className="w-3.5 h-3.5 text-orange-500" />
                        Sensor Stress
                      </span>
                    </div>
                    <div className="text-base font-mono font-bold text-slate-900 mt-1">
                      {inputSnapshot.stress_level} <span className="text-xs text-slate-500 font-normal">/ 10</span>
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      Galvanic / Perceived
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* Multi-Model Comparison (if ran) */}
            {multiModelResult && (
              <MultiModelComparison multiModelResult={multiModelResult} />
            )}

            {/* SHAP Explainable AI Breakdown (if requested) */}
            {explanationResult && (
              <ExplainabilityCard explanationData={explanationResult} />
            )}

            {/* Next Steps & Re-Evaluation Card */}
            <div className="rounded-3xl bg-[#f6faf9] p-5 sm:p-6 border border-[#d8e4e2] space-y-4">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <Sparkles className="w-4 h-4 text-[#0f766e]" />
                <span>Next Steps for Your Health Journey</span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Want to see how changes in sleep duration, daily steps, or resting heart rate affect your predicted health risk? You can adjust vitals anytime.
              </p>

              <div className="pt-1 flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={onBackToForm}
                  className="flex-1 py-2.5 px-4 rounded-full bg-[#0b1f2a] hover:bg-[#163546] text-white text-xs font-semibold transition-colors flex items-center justify-center gap-2 shadow-xs"
                >
                  <RefreshCcw className="w-3.5 h-3.5" />
                  <span>Modify Physiological Inputs</span>
                </button>
              </div>
            </div>

          </div>

        </div>

        {/* ============================================================ */}
        {/* Page Footer Disclaimer */}
        {/* ============================================================ */}
        <footer className="pt-6 pb-8 border-t border-slate-200 text-center">
          <p className="text-xs text-slate-500 font-medium flex items-center justify-center gap-1.5 max-w-2xl mx-auto">
            <Info className="w-4 h-4 text-[#0f766e] shrink-0" />
            <span>
              SmartHealth AI Prediction Suite provides statistical risk estimations based on biometric sensor data. It does not replace professional clinical judgment.
            </span>
          </p>
        </footer>

      </div>

    </div>
  );
}
