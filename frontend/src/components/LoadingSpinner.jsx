import React, { useState, useEffect } from 'react';
import { HeartPulse, Sparkles, Brain } from 'lucide-react';

const ANALYSIS_MESSAGES = [
  "Normalizing biometric inputs...",
  "Applying trained feature transformations...",
  "Running inference through ML model...",
  "Evaluating stress probability distribution...",
  "Generating clinical interpretation...",
];

export default function LoadingSpinner({ text, isCompact = false }) {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % ANALYSIS_MESSAGES.length);
    }, 800);
    return () => clearInterval(interval);
  }, []);

  if (isCompact) {
    return (
      <div className="flex items-center gap-2 text-[#0b1f2a]" role="status">
        <div className="w-4 h-4 border-2 border-[#0f766e]/30 border-t-[#0f766e] rounded-full animate-spin" />
        <span className="text-xs font-semibold">{text || "Processing..."}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center" role="status">
      {/* Animated Rings & Pulse Logo */}
      <div className="relative flex items-center justify-center w-20 h-20 mb-5">
        <div className="absolute inset-0 rounded-full border-4 border-[#0f766e]/15 animate-ping"></div>
        <div className="absolute inset-0 rounded-full border-2 border-dashed border-[#0f766e] animate-spin" style={{ animationDuration: '6s' }}></div>
        <div className="relative flex items-center justify-center w-14 h-14 rounded-full bg-[#0f766e] text-white shadow-md shadow-[#0f766e]/20">
          <HeartPulse className="w-7 h-7 animate-pulse" />
        </div>
      </div>

      <h3 className="text-base sm:text-lg font-bold text-[#0b1f2a] mb-1 flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-[#0f766e]" />
        {text || "Analyzing Biometric Features..."}
      </h3>

      <p className="text-xs sm:text-sm text-[#718784] h-5 transition-all duration-300 font-medium">
        {ANALYSIS_MESSAGES[messageIndex]}
      </p>

      <div className="mt-4 flex gap-1.5">
        <div className="w-1.5 h-1.5 rounded-full bg-[#0f766e] animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-1.5 h-1.5 rounded-full bg-[#0f766e] animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-1.5 h-1.5 rounded-full bg-[#0f766e] animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>
    </div>
  );
}
