import React from 'react';
import { 
  ShieldCheck, 
  Activity, 
  Sliders, 
  Sparkles, 
  Layers, 
  Brain, 
  Info 
} from 'lucide-react';
import PredictionForm from './PredictionForm';
import LoadingSpinner from './LoadingSpinner';
import HealthRiskMeter from './HealthRiskMeter';

export default function DashboardTray({
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
  formErrors,
  predictionResult,
  multiModelResult,
  explanationResult,
  inputSnapshot,
}) {
  return (
    <section id="dashboard" className="w-full mt-10 sm:mt-14">
      <div className="rounded-t-[32px] sm:rounded-t-[44px] bg-[#f6faf9] p-5 sm:p-8 md:p-10 border-t border-white shadow-2xl backdrop-blur-sm">
        
        {/* Dashboard Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 sm:pb-8 border-b border-[#e2ecea]">
          <div>
            <div className="text-[11px] font-mono tracking-widest text-[#718784] font-semibold uppercase mb-1">
              VITALS / 01
            </div>
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0b1f2a]">
              Biometric Inference & Health Risk Assessment
            </h3>
          </div>

          {/* Status Indicator Pill */}
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white text-[#718784] border border-[#d8e4e2] text-xs font-semibold shadow-2xs">
              <ShieldCheck className="w-4 h-4 text-[#0f766e]" />
              <span>Multi-Model Clinical ML Inference</span>
            </div>
          </div>
        </div>

        {/* 2-Column Responsive Layout: Inputs on Left (7 cols), Analytics Preview on Right (5 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mt-8">
          
          {/* Left Column: Form & Controls */}
          <div className="lg:col-span-7 space-y-6">
            <div className="rounded-2xl sm:rounded-3xl bg-white p-5 sm:p-8 border border-[#e2ecea] shadow-xs">
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#0f766e]/10 text-[#0f766e] flex items-center justify-center">
                    <Sliders className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm sm:text-base font-bold text-[#0b1f2a]">
                      Physiological Parameters
                    </h4>
                    <p className="text-xs text-[#718784]">
                      Enter sensor vitals or pick a 1-click test profile
                    </p>
                  </div>
                </div>

                <span className="text-[11px] font-mono text-[#0f766e] bg-[#f6faf9] px-2.5 py-1 rounded-full border border-[#d8e4e2] font-semibold">
                  6 ML Features
                </span>
              </div>

              <PredictionForm
                formData={formData}
                onChangeField={onChangeField}
                onReset={onReset}
                onSubmit={onSubmit}
                isLoading={isLoading}
                selectedModel={selectedModel}
                onSelectModel={onSelectModel}
                isCompareAll={isCompareAll}
                onToggleCompareAll={onToggleCompareAll}
                includeExplainability={includeExplainability}
                onToggleExplainability={onToggleExplainability}
                formErrors={formErrors}
              />
            </div>
          </div>

          {/* Right Column: Interactive Meter Preview & Capabilities */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Loading State Spinner */}
            {isLoading && (
              <div className="rounded-2xl sm:rounded-3xl border border-[#e2ecea] bg-white p-8 sm:p-12 shadow-xs text-center">
                <LoadingSpinner />
                <p className="text-xs font-semibold text-slate-500 mt-4">
                  Calculating biometric probabilities & generating health risk assessment...
                </p>
              </div>
            )}

            {/* Overview / Calibrated Baseline Card */}
            {!isLoading && (
              <div className="rounded-2xl sm:rounded-3xl border border-[#e2ecea] bg-white p-6 sm:p-8 text-center space-y-5 shadow-xs">
                
                {/* Meter Interactive Preview */}
                <div className="pt-2">
                  <HealthRiskMeter
                    value={18}
                    isInteractive={false}
                  />
                  <div className="mt-2 text-xs font-semibold text-[#718784]">
                    Baseline Calibrated & Ready for Analysis
                  </div>
                </div>

                <div className="max-w-xs mx-auto pt-2">
                  <h4 className="text-base font-bold text-[#0b1f2a]">
                    Real-Time Health Risk Engine
                  </h4>
                  <p className="text-xs text-[#718784] mt-1.5 leading-relaxed">
                    Adjust your biometric vitals on the left, then click <b>Predict Health Risk</b> to open your full assessment dashboard.
                  </p>
                </div>

                <div className="pt-3 flex flex-col gap-2 text-xs text-[#718784] text-left bg-[#f6faf9] p-4 rounded-2xl border border-[#e2ecea]">
                  <div className="flex items-center gap-2 text-[#0b1f2a] font-bold mb-1">
                    <Sparkles className="w-3.5 h-3.5 text-[#0f766e]" />
                    Prediction Suite Features:
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0f766e]"></span>
                    <span>Dedicated Health Risk Results dashboard with interactive gauge</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0f766e]"></span>
                    <span>Multi-tier cardiac rhythm animation (60–124 BPM)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0f766e]"></span>
                    <span>Multi-model comparison: XGBoost, Random Forest, Decision Tree, Logistic Regression</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0f766e]"></span>
                    <span>Explainable AI (SHAP) feature attribution vectors</span>
                  </div>
                </div>

              </div>
            )}

          </div>

        </div>

        {/* Dashboard Bottom Disclaimer */}
        <div className="mt-10 pt-6 border-t border-[#e2ecea] text-center">
          <p className="text-xs text-[#718784] font-medium flex items-center justify-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-[#0f766e]" />
            Illustrative clinical AI preview — powered by trained machine learning models. Not medical advice.
          </p>
        </div>

      </div>
    </section>
  );
}
