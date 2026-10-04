import React from 'react';
import { 
  ShieldCheck, 
  Flame, 
  Activity, 
  Percent, 
  Heart, 
  Wind, 
  Moon, 
  Footprints, 
  TrendingUp, 
  Info,
  Sparkles
} from 'lucide-react';
import Gauge from './Gauge';

// Helper to determine the contextual emoji reaction & empathetic message
function getEmojiReaction(isHighStress, confidencePct, inputSnapshot) {
  if (isHighStress) {
    if (inputSnapshot && inputSnapshot.sleep_duration_hours < 5.5) {
      return {
        emoji: "🥱",
        title: "Sleep Depleted & Strained",
        subtext: "Curtailment of sleep is amplifying physiological stress.",
        badgeColor: "bg-amber-50 text-amber-800 border-amber-200",
        advice: "🛏️ Prioritize an early bedtime and reduce blue light exposure tonight."
      };
    }
    if (confidencePct > 85 || (inputSnapshot && inputSnapshot.stress_level >= 7.5)) {
      return {
        emoji: "🔥",
        title: "Acute High Stress Detected",
        subtext: "Strong sympathetic arousal and elevated risk signals detected.",
        badgeColor: "bg-rose-50 text-rose-800 border-rose-200",
        advice: "🧘 Take a 5-minute boxed breathing pause (4s in, 4s hold, 4s out, 4s hold)."
      };
    }
    return {
      emoji: "😰",
      title: "Elevated Tension Response",
      subtext: "Your vitals show noticeable strain and autonomic fatigue.",
      badgeColor: "bg-rose-50 text-rose-800 border-rose-200",
      advice: "💧 Step away from screens, take a short walk, and hydrate."
    };
  } else {
    if (inputSnapshot && (inputSnapshot.step_count >= 10000 || inputSnapshot.activity_level === 'highly active')) {
      return {
        emoji: "⚡",
        title: "Active & High Recovery",
        subtext: "High physical output backed by strong autonomic resilience.",
        badgeColor: "bg-teal-50 text-[#0f766e] border-teal-200",
        advice: "💪 Great physiological momentum! Keep up the balanced routine."
      };
    }
    if (confidencePct > 80 && inputSnapshot && inputSnapshot.sleep_duration_hours >= 7) {
      return {
        emoji: "😌",
        title: "Calm, Rested & Balanced",
        subtext: "Your nervous system is operating in an optimal restorative zone.",
        badgeColor: "bg-emerald-50 text-emerald-800 border-emerald-200",
        advice: "🌿 Perfect baseline! Your body is recovering and adapting well."
      };
    }
    return {
      emoji: "✨",
      title: "Healthy Physiological Baseline",
      subtext: "Biometrics indicate low stress and steady recovery.",
      badgeColor: "bg-emerald-50 text-emerald-800 border-emerald-200",
      advice: "🍵 Maintain consistent hydration and regular movement intervals."
    };
  }
}

export default function PredictionResult({ result, inputSnapshot }) {
  if (!result) return null;

  const isHighStress = result.isHighStress;
  const label = result.label;
  const confidencePct = result.confidencePct;
  const probabilities = result.probabilities || {
    "Low Stress": isHighStress ? +(100 - confidencePct).toFixed(1) : confidencePct,
    "High Stress": isHighStress ? confidencePct : +(100 - confidencePct).toFixed(1),
  };

  const lowStressPct = probabilities["Low Stress"] > 1 ? probabilities["Low Stress"] : +(probabilities["Low Stress"] * 100).toFixed(1);
  const highStressPct = probabilities["High Stress"] > 1 ? probabilities["High Stress"] : +(probabilities["High Stress"] * 100).toFixed(1);

  const gaugeValue = isHighStress ? highStressPct : lowStressPct;
  const gaugeColor = isHighStress ? '#ef775f' : '#0f766e';

  const reaction = getEmojiReaction(isHighStress, confidencePct, inputSnapshot);

  return (
    <div className="rounded-2xl sm:rounded-3xl border border-[#e2ecea] bg-white p-5 sm:p-7 shadow-xs space-y-6 animate-fade-in">
      
      {/* ============================================================ */}
      {/* Emoji Reaction Hero Banner */}
      {/* ============================================================ */}
      <div className={`p-4 sm:p-5 rounded-2xl border flex items-center gap-4 transition-all ${
        isHighStress ? 'bg-rose-50/80 border-rose-200' : 'bg-emerald-50/70 border-emerald-200'
      }`}>
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white shadow-xs border border-white flex items-center justify-center text-3xl sm:text-4xl shrink-0 select-none animate-bounce" style={{ animationDuration: '2.5s' }}>
          {reaction.emoji}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#718784]">
              AI Emotion & Vitals State
            </span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${reaction.badgeColor}`}>
              {isHighStress ? 'Alert' : 'Optimal'}
            </span>
          </div>

          <h3 className="text-base sm:text-lg font-extrabold text-[#0b1f2a] truncate mt-0.5">
            {reaction.title}
          </h3>

          <p className="text-xs text-[#718784] mt-0.5 line-clamp-2 leading-snug">
            {reaction.subtext}
          </p>
        </div>
      </div>

      {/* Top Model Output Card Header */}
      <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${
            isHighStress 
              ? 'bg-[#ef775f]/15 text-[#ef775f]' 
              : 'bg-[#0f766e]/10 text-[#0f766e]'
          }`}>
            {isHighStress ? <Flame className="w-5 h-5 animate-pulse" /> : <ShieldCheck className="w-5 h-5" />}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#718784] font-semibold">
                Class Prediction
              </span>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-[#f6faf9] text-[#0f766e] border border-[#d8e4e2] font-mono">
                {result.model}
              </span>
            </div>
            
            <h3 className={`text-xl sm:text-2xl font-extrabold tracking-tight ${
              isHighStress ? 'text-[#ef775f]' : 'text-[#0f766e]'
            }`}>
              {label}
            </h3>
          </div>
        </div>

        {/* Status Trend Pill */}
        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${
          isHighStress
            ? 'bg-rose-50 text-rose-700 border-rose-200'
            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
        }`}>
          {isHighStress ? '⚡ Elevated Strain' : '🌿 Optimal Baseline'}
        </span>
      </div>

      {/* Semicircular SVG Gauge (32 Ticks) */}
      <div className="py-2">
        <Gauge
          value={confidencePct}
          color={gaugeColor}
          inactiveColor="#d8e2e0"
          label={`${confidencePct}%`}
          showLabels={true}
        />
        <div className="text-center mt-2 flex items-center justify-center gap-1.5 text-xs font-semibold text-[#718784]">
          <span>{reaction.emoji}</span>
          <span>Model Confidence: {confidencePct}% for {label}</span>
        </div>
      </div>

      {/* Multi-Class Probability Progress Bars */}
      <div className="rounded-2xl bg-[#f6faf9] p-4 border border-[#e2ecea] space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-[#0b1f2a]">
          <span className="flex items-center gap-1.5">
            <Percent className="w-3.5 h-3.5 text-[#0f766e]" />
            Class Probability Distribution
          </span>
          <span className="text-[11px] text-[#718784] font-mono font-medium">
            Softmax Ratio
          </span>
        </div>

        {/* Low Stress Bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs font-medium">
            <span className="text-[#0b1f2a] flex items-center gap-1.5">
              <span>😌</span>
              <span>Low / Normal Stress (Class 0)</span>
            </span>
            <span className="font-mono text-[#0f766e] font-bold">{lowStressPct}%</span>
          </div>
          <div className="w-full h-2 bg-[#d8e2e0] rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#0f766e] rounded-full transition-all duration-700 ease-out"
              style={{ width: `${Math.min(100, Math.max(0, lowStressPct))}%` }}
            />
          </div>
        </div>

        {/* High Stress Bar */}
        <div className="space-y-1 pt-1">
          <div className="flex justify-between text-xs font-medium">
            <span className="text-[#0b1f2a] flex items-center gap-1.5">
              <span>😰</span>
              <span>High / Elevated Stress (Class 1)</span>
            </span>
            <span className="font-mono text-[#ef775f] font-bold">{highStressPct}%</span>
          </div>
          <div className="w-full h-2 bg-[#d8e2e0] rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#ef775f] rounded-full transition-all duration-700 ease-out"
              style={{ width: `${Math.min(100, Math.max(0, highStressPct))}%` }}
            />
          </div>
        </div>
      </div>

      {/* Empathetic Clinical Advice & Actionable Tip */}
      <div className={`p-4 sm:p-5 rounded-2xl border text-xs sm:text-sm leading-relaxed ${
        isHighStress 
          ? 'bg-rose-50/70 border-rose-200 text-[#0b1f2a]' 
          : 'bg-[#f6faf9] border-[#d8e4e2] text-[#0b1f2a]'
      }`}>
        <h4 className="font-bold mb-1.5 flex items-center gap-2 text-[#0b1f2a]">
          <Sparkles className="w-4 h-4 text-[#0f766e]" />
          Empathetic Recommendation
        </h4>
        <p className="text-xs text-[#0b1f2a] font-medium mb-1">
          {reaction.advice}
        </p>
        <p className="text-[11px] text-[#718784] leading-relaxed">
          {result.riskAssessment || (
            isHighStress 
              ? "The model detected heightened physiological strain. Prioritize restorative sleep, hydration, and short relaxation breaks."
              : "Autonomic vitals indicate steady parasympathetic recovery and healthy resilience."
          )}
        </p>
      </div>

      {/* Physiological Snapshot Summary Chips with Mini Emojis */}
      {inputSnapshot && (
        <div className="pt-2">
          <div className="text-[11px] font-bold text-[#718784] uppercase tracking-wider mb-2.5">
            Biometric Input Snapshot
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            
            <div className="p-2.5 rounded-xl bg-[#f6faf9] border border-[#e2ecea] text-center">
              <div className="text-[10px] text-[#718784] flex items-center justify-center gap-1">
                <span>💓</span> Heart Rate
              </div>
              <div className="text-xs font-bold font-mono text-[#0b1f2a] mt-0.5">
                {inputSnapshot.heart_rate_bpm} <span className="text-[10px] text-[#718784]">BPM</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-[#f6faf9] border border-[#e2ecea] text-center">
              <div className="text-[10px] text-[#718784] flex items-center justify-center gap-1">
                <span>🫁</span> Blood Oxygen
              </div>
              <div className="text-xs font-bold font-mono text-[#0b1f2a] mt-0.5">
                {inputSnapshot.blood_oxygen_level}%
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-[#f6faf9] border border-[#e2ecea] text-center">
              <div className="text-[10px] text-[#718784] flex items-center justify-center gap-1">
                <span>👟</span> Daily Steps
              </div>
              <div className="text-xs font-bold font-mono text-[#0b1f2a] mt-0.5">
                {inputSnapshot.step_count}
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-[#f6faf9] border border-[#e2ecea] text-center">
              <div className="text-[10px] text-[#718784] flex items-center justify-center gap-1">
                <span>🌙</span> Sleep
              </div>
              <div className="text-xs font-bold font-mono text-[#0b1f2a] mt-0.5">
                {inputSnapshot.sleep_duration_hours}h
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-[#f6faf9] border border-[#e2ecea] text-center">
              <div className="text-[10px] text-[#718784] flex items-center justify-center gap-1">
                <span>🏃</span> Activity
              </div>
              <div className="text-xs font-bold capitalize text-[#0b1f2a] mt-0.5 truncate">
                {inputSnapshot.activity_level}
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-[#f6faf9] border border-[#e2ecea] text-center">
              <div className="text-[10px] text-[#718784] flex items-center justify-center gap-1">
                <span>⚡</span> Sensor Score
              </div>
              <div className="text-xs font-bold font-mono text-[#0b1f2a] mt-0.5">
                {inputSnapshot.stress_level}/10
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
