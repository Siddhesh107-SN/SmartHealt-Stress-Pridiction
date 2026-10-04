import React, { useState } from 'react';
import { AlertCircle, WifiOff, RefreshCw, X, ChevronDown, ChevronUp, Terminal, ShieldAlert, Check } from 'lucide-react';
import { API_BASE_URL } from '../services/api';

export default function ErrorMessage({ error, onRetry, onDismiss }) {
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);
  const [copiedCors, setCopiedCors] = useState(false);

  if (!error) return null;

  const isNetwork = error.isNetworkError || !navigator.onLine;
  const isValidation = error.status === 422 || (error.validationDetails && error.validationDetails.length > 0);
  const isCors = error.possibleCors && !isValidation;

  const corsFixCode = `# Add in backend/main.py if not already present:
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)`;

  const handleCopyCors = () => {
    navigator.clipboard.writeText(corsFixCode);
    setCopiedCors(true);
    setTimeout(() => setCopiedCors(false), 2000);
  };

  return (
    <div className="rounded-2xl sm:rounded-3xl border border-rose-200 bg-rose-50/90 p-4 sm:p-5 text-rose-900 shadow-xs mb-6 animate-slide-up">
      <div className="flex items-start gap-3.5">
        
        {/* Icon */}
        <div className="p-2 rounded-xl bg-rose-100 text-rose-600 border border-rose-200 shrink-0 mt-0.5">
          {isNetwork ? <WifiOff className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-sm sm:text-base font-bold text-rose-900 flex items-center gap-2">
              {isNetwork 
                ? "FastAPI Backend Unreachable" 
                : isValidation 
                ? "Input Validation Error (HTTP 422)" 
                : `Prediction Error ${error.status ? `(HTTP ${error.status})` : ''}`}
            </h4>
            {onDismiss && (
              <button
                type="button"
                onClick={onDismiss}
                className="text-rose-500 hover:text-rose-800 p-1 rounded-lg hover:bg-rose-100 transition-colors"
                aria-label="Dismiss error"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <p className="text-xs sm:text-sm text-rose-800/90 mt-1 leading-relaxed">
            {error.message || "An unexpected error occurred while communicating with the prediction engine."}
          </p>

          {/* Validation Fields List */}
          {error.validationDetails && Array.isArray(error.validationDetails) && error.validationDetails.length > 0 && (
            <div className="mt-3 p-3 rounded-xl bg-white border border-rose-200 text-xs">
              <span className="font-bold text-rose-800 block mb-1">Please review the following fields:</span>
              <ul className="list-disc list-inside space-y-1 text-rose-700">
                {error.validationDetails.map((detail, idx) => (
                  <li key={idx} className="font-mono">{detail}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Troubleshooting hints for Network / Server error */}
          {isNetwork && (
            <div className="mt-3 p-3.5 rounded-2xl bg-white border border-rose-200 text-xs text-[#0b1f2a] space-y-2">
              <div className="flex items-center gap-2 text-[#0f766e] font-bold">
                <Terminal className="w-3.5 h-3.5" />
                <span>Backend Start Command</span>
              </div>
              <p className="text-[#718784]">
                Ensure your FastAPI server is running locally on port 8000:
              </p>
              <div className="bg-[#f6faf9] px-3 py-2 rounded-xl font-mono text-emerald-800 text-xs select-all border border-[#d8e4e2]">
                uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000
              </div>
              <p className="text-[#718784] text-[11px]">
                Configured URL: <span className="font-mono font-semibold text-[#0f766e]">{API_BASE_URL}</span>
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-4 flex flex-wrap items-center gap-2.5">
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Retry Request
              </button>
            )}

            {isCors && (
              <button
                type="button"
                onClick={handleCopyCors}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white hover:bg-slate-50 text-[#0b1f2a] border border-[#d8e4e2] text-xs font-medium transition-colors"
              >
                {copiedCors ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />}
                {copiedCors ? "Copied CORS Code!" : "Copy CORS Helper"}
              </button>
            )}

            {(error.originalError || error.stack) && (
              <button
                type="button"
                onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
                className="inline-flex items-center gap-1 text-xs text-rose-700 hover:text-rose-900 transition-colors ml-auto font-medium"
              >
                <span>{showTechnicalDetails ? "Hide Stack" : "Technical Details"}</span>
                {showTechnicalDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>

          {/* Technical Details collapsible */}
          {showTechnicalDetails && (
            <pre className="mt-3 p-3 rounded-xl bg-white text-[11px] font-mono text-[#718784] overflow-x-auto border border-rose-200 max-h-36">
              {JSON.stringify({
                status: error.status,
                name: error.name,
                message: error.message,
                validation: error.validationDetails,
                endpoint: API_BASE_URL,
              }, null, 2)}
            </pre>
          )}

        </div>
      </div>
    </div>
  );
}
