import React from 'react';
import { HeartPulse, ChevronRight, Activity } from 'lucide-react';
import Navbar from './Navbar';
import PresetSelector from './PresetSelector';
import DashboardTray from './DashboardTray';
import ErrorMessage from './ErrorMessage';

export default function HeroSection({
  backendStatus,
  onRetryHealthCheck,
  activeModel,
  formData,
  onChangeField,
  onSelectPreset,
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
  error,
  onDismissError,
}) {
  return (
    <div className="w-full min-h-screen p-2 sm:p-3 bg-[#eef3f2]">
      {/* Outer Rounded Hero Container */}
      <div className="relative w-full min-h-[calc(100vh-16px)] sm:min-h-[calc(100vh-24px)] rounded-[28px] sm:rounded-[36px] md:rounded-[44px] bg-[#dce9e6] overflow-hidden flex flex-col justify-between border border-white/60 shadow-xs">
        
        {/* Full Visibility Background Video */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover pointer-events-none select-none"
          >
            <source
              src="/174489-851502103.mp4"
              type="video/mp4"
            />
          </video>
        </div>

        {/* Navigation Bar */}
        <Navbar
          backendStatus={backendStatus}
          onRetryHealthCheck={onRetryHealthCheck}
          activeModel={activeModel}
        />

        {/* Hero Headline Content in Frosted Container */}
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center pt-8 sm:pt-12 md:pt-14 pb-6 flex flex-col items-center">
          
          <div className="rounded-3xl bg-white/85 backdrop-blur-md border border-white/90 p-6 sm:p-10 shadow-xs flex flex-col items-center max-w-3xl">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0f766e]/10 border border-[#0f766e]/20 text-xs font-bold text-[#0f766e] mb-5">
              <HeartPulse className="w-4 h-4 text-[#0f766e]" />
              <span>AI-assisted physiological health risk prediction</span>
            </div>

            {/* Main Headline */}
            <h1 className="headline-clamp font-bold tracking-tight text-[#0b1f2a] max-w-2xl">
              Understand your{' '}
              <span className="font-serif italic font-normal text-[#0f766e] text-[1.12em] tracking-normal inline-block px-1">
                health risk
              </span>{' '}
              before it compounds
            </h1>

            {/* Subtitle */}
            <p className="mt-4 sm:mt-5 text-sm sm:text-base md:text-lg text-[#718784] max-w-xl font-normal leading-relaxed">
              A clinical-grade predictive suite analyzing wearable biometric signals to quantify overall physiological risk and guide proactive wellness.
            </p>

            {/* CTA Button */}
            <div className="mt-6 sm:mt-8">
              <a
                href="#dashboard"
                className="inline-flex items-center gap-3 pl-6 pr-3 py-3.5 rounded-full bg-[#0b1f2a] hover:bg-[#163546] text-white text-sm sm:text-base font-semibold shadow-md hover:shadow-lg transition-all group"
              >
                <span>Start Health Assessment</span>
                <div className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center group-hover:bg-white/25 transition-colors">
                  <ChevronRight className="w-4 h-4 text-white group-hover:translate-x-0.5 transition-transform" />
                </div>
              </a>
            </div>
          </div>

        </div>

        {/* Error Alert (if present) & Quick Presets */}
        <div className="relative z-10 w-full max-w-6xl mx-auto px-3 sm:px-6 space-y-4">
          {error && (
            <ErrorMessage
              error={error}
              onRetry={onSubmit}
              onDismiss={onDismissError}
            />
          )}

          <PresetSelector
            onSelectPreset={onSelectPreset}
            currentData={formData}
            disabled={isLoading}
          />
        </div>

        {/* Dashboard Tray Container */}
        <div className="relative z-10 w-full max-w-6xl mx-auto px-2 sm:px-6">
          <DashboardTray
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
            predictionResult={predictionResult}
            multiModelResult={multiModelResult}
            explanationResult={explanationResult}
            inputSnapshot={inputSnapshot}
          />
        </div>

      </div>
    </div>
  );
}
