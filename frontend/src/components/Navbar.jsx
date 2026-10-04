import React, { useState } from 'react';
import { HeartPulse, ChevronDown, ChevronRight, Menu, X, Activity, Server, ExternalLink, RefreshCw, Sparkles } from 'lucide-react';
import { API_BASE_URL } from '../services/api';

export default function Navbar({ backendStatus, onRetryHealthCheck, activeModel }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="w-full pt-4 sm:pt-6 px-3 sm:px-6 relative z-30">
      <div className="max-w-6xl mx-auto">
        {/* Floating Pill Bar */}
        <nav className="rounded-full bg-white/90 backdrop-blur-md px-4 sm:px-6 py-2.5 sm:py-3 shadow-xs border border-white/90 flex items-center justify-between">
          
          {/* Brand Logo & Name */}
          <a href="#" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-full bg-[#0f766e] text-white flex items-center justify-center shadow-xs group-hover:bg-[#0d645e] transition-colors">
              <HeartPulse className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <span className="font-semibold text-base tracking-tight text-[#0b1f2a] block leading-none">
                SmartHealth <span className="text-[#0f766e] font-serif italic text-lg font-normal">AI</span>
              </span>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-6 text-xs sm:text-sm font-medium text-[#718784]">
            <a href="#dashboard" className="hover:text-[#0b1f2a] transition-colors">
              Health Risk Suite
            </a>
            <a href="#models" className="hover:text-[#0b1f2a] transition-colors">
              ML Models
            </a>
            <a href="#explainability" className="hover:text-[#0b1f2a] transition-colors">
              Explainable AI (SHAP)
            </a>
          </div>

          {/* Right Action Items: Backend Status & CTA */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Live FastAPI Status Badge */}
            <div 
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
                backendStatus === 'healthy'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : backendStatus === 'offline'
                  ? 'bg-rose-50 text-rose-800 border-rose-200'
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}
              title={`FastAPI backend at ${API_BASE_URL}`}
            >
              <span className={`w-2 h-2 rounded-full ${
                backendStatus === 'healthy' 
                  ? 'bg-emerald-500 animate-pulse' 
                  : backendStatus === 'offline' 
                  ? 'bg-rose-500' 
                  : 'bg-amber-500'
              }`} />

              <span className="text-[11px]">
                {backendStatus === 'healthy' 
                  ? 'FastAPI Online' 
                  : backendStatus === 'offline' 
                  ? 'Backend Offline' 
                  : 'Connecting...'}
              </span>

              {backendStatus !== 'healthy' && (
                <button
                  type="button"
                  onClick={onRetryHealthCheck}
                  aria-label="Retry connection"
                  className="hover:opacity-75 transition-opacity p-0.5 text-slate-600"
                >
                  <RefreshCw className="w-3 h-3 animate-spin" />
                </button>
              )}
            </div>

            {/* API Docs Button */}
            <a
              href={`${API_BASE_URL}/docs`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 pl-3.5 pr-2 py-1.5 rounded-full bg-[#0b1f2a] hover:bg-[#163546] text-white text-xs font-medium shadow-xs transition-all group"
            >
              <span>Swagger Docs</span>
              <div className="w-5 h-5 rounded-full bg-white/15 flex items-center justify-center group-hover:bg-white/25 transition-colors">
                <ExternalLink className="w-3 h-3 text-white" />
              </div>
            </a>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="md:hidden flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${
              backendStatus === 'healthy' ? 'bg-emerald-500' : 'bg-rose-500'
            }`} />
            
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-full text-[#0b1f2a] hover:bg-slate-100 transition-colors focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </nav>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-2 rounded-2xl bg-white p-4 shadow-xl border border-slate-100 space-y-3 text-sm font-medium text-[#0b1f2a] animate-slide-up">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-xs">
              <span className="text-[#718784]">FastAPI Status</span>
              <span className={`px-2 py-0.5 rounded-full font-semibold ${
                backendStatus === 'healthy' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
              }`}>
                {backendStatus === 'healthy' ? 'Online' : 'Offline'}
              </span>
            </div>

            <a
              href="#dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl hover:bg-[#f6faf9] text-[#718784] hover:text-[#0b1f2a] transition-colors"
            >
              Health Risk Suite
            </a>
            <a
              href="#models"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl hover:bg-[#f6faf9] text-[#718784] hover:text-[#0b1f2a] transition-colors"
            >
              ML Models
            </a>
            <a
              href="#explainability"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl hover:bg-[#f6faf9] text-[#718784] hover:text-[#0b1f2a] transition-colors"
            >
              Explainable AI (SHAP)
            </a>

            <div className="pt-2 border-t border-slate-100">
              <a
                href={`${API_BASE_URL}/docs`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-full bg-[#0b1f2a] text-white text-xs font-medium"
              >
                <span>Open API Swagger Docs</span>
                <ExternalLink className="w-3.5 h-3.5 text-white" />
              </a>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
