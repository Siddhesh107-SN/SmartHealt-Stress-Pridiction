import React, { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  AlertCircle, 
  Flame, 
  Activity, 
  Heart, 
  Sparkles 
} from 'lucide-react';
import { 
  GAUGE_CONFIG, 
  getRiskTier, 
  polarToCartesian, 
  describeArc, 
  percentageToAngle 
} from '../utils/riskConfig';

export default function HealthRiskMeter({
  value = 0,
  onChange = null,
  isInteractive = true,
  className = "",
  size = "default" // "default" | "compact" | "large"
}) {
  const svgRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [displayValue, setDisplayValue] = useState(0);

  // Target value clamped to 0..100
  const targetValue = Math.min(100, Math.max(0, Math.round(Number(value) || 0)));

  // Smooth value animation (interpolates towards targetValue on load / change)
  useEffect(() => {
    let animationFrameId;
    let startTimestamp = null;
    const startVal = displayValue;
    const diff = targetValue - startVal;

    if (Math.abs(diff) < 0.2 || isDragging) {
      setDisplayValue(targetValue);
      return;
    }

    const duration = 750; // ms

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const elapsed = timestamp - startTimestamp;
      const progress = Math.min(1, elapsed / duration);
      // Ease out cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = startVal + diff * ease;
      
      setDisplayValue(current);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      } else {
        setDisplayValue(targetValue);
      }
    };

    animationFrameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrameId);
  }, [targetValue, isDragging]);

  const roundedValue = Math.round(displayValue);
  const tier = useMemo(() => getRiskTier(displayValue), [displayValue]);

  // SVG Geometry Calculations
  const { cx, cy, radius, startAngle, endAngle, sweep, hubRadius } = GAUGE_CONFIG;
  const currentAngle = percentageToAngle(displayValue);

  // Background rail arc path (full 260° sweep)
  const bgRailPath = useMemo(() => {
    return describeArc(cx, cy, radius, startAngle, endAngle);
  }, [cx, cy, radius, startAngle, endAngle]);

  // Active progress arc path (from 140° to currentAngle)
  const activeArcPath = useMemo(() => {
    if (displayValue <= 0.2) return null;
    const end = Math.min(endAngle, Math.max(startAngle + 0.5, currentAngle));
    return describeArc(cx, cy, radius, startAngle, end);
  }, [cx, cy, radius, startAngle, endAngle, currentAngle, displayValue]);

  // Tip orb position at current angle
  const tipPos = useMemo(() => {
    return polarToCartesian(cx, cy, radius, currentAngle);
  }, [cx, cy, radius, currentAngle]);

  // Radial Ticks (51 ticks: every 2% from 0% to 100%)
  const ticks = useMemo(() => {
    const list = [];
    const totalTicks = 51; // 0..50 (i.e. 0%, 2%, ..., 100%)
    const majorSet = new Set([0, 25, 50, 75, 100]);

    for (let i = 0; i < totalTicks; i++) {
      const pct = i * 2;
      const angle = startAngle + (i / (totalTicks - 1)) * sweep;
      const isMajor = majorSet.has(pct);
      const isActive = pct <= displayValue;

      // Minor vs Major tick lengths
      const rInner = isMajor ? radius + 9 : radius + 11;
      const rOuter = isMajor ? radius + 21 : radius + 17;

      const p1 = polarToCartesian(cx, cy, rInner, angle);
      const p2 = polarToCartesian(cx, cy, rOuter, angle);

      list.push({
        pct,
        angle,
        isMajor,
        isActive,
        x1: p1.x,
        y1: p1.y,
        x2: p2.x,
        y2: p2.y,
      });
    }
    return list;
  }, [cx, cy, radius, startAngle, sweep, displayValue]);

  // Major tick labels (0%, 25%, 50%, 75%, 100%)
  const majorLabels = useMemo(() => {
    return [0, 25, 50, 75, 100].map((pct) => {
      const angle = startAngle + (pct / 100) * sweep;
      const pos = polarToCartesian(cx, cy, radius + 33, angle);
      const isActive = pct <= displayValue;
      return {
        pct: `${pct}%`,
        x: pos.x,
        y: pos.y + 4, // Slight vertical centering adjustment
        isActive,
      };
    });
  }, [cx, cy, radius, startAngle, sweep, displayValue]);

  // Pointer Interaction Logic (Click & Drag scrubber)
  const calculateValueFromPointer = useCallback((clientX, clientY) => {
    if (!svgRef.current || !onChange) return;
    const rect = svgRef.current.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    // Convert client coordinates to SVG coordinate system (380 x 340)
    const svgX = ((clientX - rect.left) / rect.width) * 380;
    const svgY = ((clientY - rect.top) / rect.height) * 340;

    const dx = svgX - cx;
    const dy = svgY - cy;

    // Angle in degrees from center
    let angle = (Math.atan2(dy, dx) * 180) / Math.PI;
    if (angle < 0) angle += 360;

    // Mapping 140° -> 400°
    // The bottom-right section (0° - 40°) is equivalent to 360° - 400°
    if (angle <= 40) {
      angle += 360;
    }

    // Dead zone check (the bottom opening between 40° and 140°, i.e. 41° to 139°)
    if (angle > 40 && angle < 140) {
      // Snap to closest endpoint
      if (angle < 90) {
        angle = 400; // 100%
      } else {
        angle = 140; // 0%
      }
    }

    // Clamp angle to [140, 400]
    const clampedAngle = Math.min(endAngle, Math.max(startAngle, angle));
    const newPct = Math.round(((clampedAngle - startAngle) / sweep) * 100);
    const finalPct = Math.min(100, Math.max(0, newPct));

    onChange(finalPct);
  }, [cx, cy, startAngle, endAngle, sweep, onChange]);

  const handlePointerDown = (e) => {
    if (!isInteractive || !onChange) return;
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
    calculateValueFromPointer(e.clientX, e.clientY);
  };

  const handlePointerMove = (e) => {
    if (!isDragging || !isInteractive || !onChange) return;
    calculateValueFromPointer(e.clientX, e.clientY);
  };

  const handlePointerUp = (e) => {
    if (!isDragging) return;
    setIsDragging(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch (_) {}
  };

  // Heartbeat animation duration & pulse class based on tier
  const heartbeatStyle = {
    animationDuration: `${tier.heartbeatDuration}s`,
    transformOrigin: `${cx}px ${cy}px`,
  };

  return (
    <div className={`relative flex flex-col items-center justify-center select-none ${className}`}>
      
      {/* Dynamic Background Halo for Elevated/Critical Risk */}
      {(tier.id === 'elevated' || tier.id === 'critical') && (
        <div 
          className={`absolute inset-0 rounded-full blur-3xl opacity-20 pointer-events-none transition-all duration-700 ${
            tier.id === 'critical' ? 'bg-rose-500 animate-pulse' : 'bg-orange-500'
          }`}
          style={{ transform: 'scale(0.85)' }}
        />
      )}

      <svg
        ref={svgRef}
        viewBox="0 0 380 340"
        className={`w-full max-w-[360px] sm:max-w-[380px] h-auto overflow-visible transition-transform duration-150 ${
          isInteractive ? 'cursor-pointer touch-none' : ''
        }`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        aria-label={`Health Risk Prediction Meter: ${roundedValue}% (${tier.label})`}
        role="meter"
        aria-valuenow={roundedValue}
        aria-valuemin="0"
        aria-valuemax="100"
      >
        <defs>
          {/* Active Gradient for Progress Arc */}
          <linearGradient id="riskProgressGradient" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={tier.gradientFrom} />
            <stop offset="100%" stopColor={tier.gradientTo} />
          </linearGradient>

          {/* Soft Glow Filter */}
          <filter id="meterGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor={tier.color} floodOpacity="0.4" />
          </filter>

          {/* Hub Drop Shadow */}
          <filter id="hubShadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="#0f172a" floodOpacity="0.08" />
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#0f172a" floodOpacity="0.04" />
          </filter>

          {/* Tip Orb Glow */}
          <filter id="tipGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor={tier.color} floodOpacity="0.8" />
          </filter>
        </defs>

        {/* 1. Subtle Background Arc Track Rail */}
        <path
          d={bgRailPath}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth="10"
          strokeLinecap="round"
          className="transition-colors duration-300"
        />

        {/* 2. Radial Ticks (51 ticks, major every 25%) */}
        <g className="transition-colors duration-200">
          {ticks.map((t) => (
            <line
              key={t.pct}
              x1={t.x1}
              y1={t.y1}
              x2={t.x2}
              y2={t.y2}
              stroke={t.isActive ? tier.color : '#e2e8f0'}
              strokeWidth={t.isMajor ? 2.5 : 1.4}
              strokeLinecap="round"
              className="transition-all duration-150"
            />
          ))}
        </g>

        {/* 3. Major Tick Endpoint & Step Labels */}
        <g className="select-none pointer-events-none">
          {majorLabels.map((lbl) => (
            <text
              key={lbl.pct}
              x={lbl.x}
              y={lbl.y}
              textAnchor="middle"
              className={`text-[10px] sm:text-[11px] font-mono font-semibold transition-colors duration-200 ${
                lbl.isActive ? 'fill-slate-800' : 'fill-slate-400'
              }`}
            >
              {lbl.pct}
            </text>
          ))}
        </g>

        {/* 4. Active Progress Arc with Risk Color Glow */}
        {activeArcPath && (
          <path
            d={activeArcPath}
            fill="none"
            stroke="url(#riskProgressGradient)"
            strokeWidth="11"
            strokeLinecap="round"
            filter="url(#meterGlow)"
            className="transition-all duration-150"
          />
        )}

        {/* 5. Glowing Tip / Orb at Current Value */}
        {displayValue > 0.5 && (
          <g transform={`translate(${tipPos.x}, ${tipPos.y})`} filter="url(#tipGlow)">
            {/* Outer expanding pulse circle */}
            <circle
              r="10"
              fill={tier.color}
              opacity="0.3"
              className="animate-ping"
              style={{ animationDuration: `${tier.heartbeatDuration}s` }}
            />
            {/* Middle halo circle */}
            <circle
              r="7"
              fill={tier.color}
              opacity="0.9"
            />
            {/* Inner solid white core */}
            <circle
              r="3.5"
              fill="#ffffff"
            />
          </g>
        )}

        {/* 6. Expanding Pulse Rings for Critical & Elevated Tiers */}
        {tier.id === 'critical' && (
          <circle
            cx={cx}
            cy={cy}
            r={hubRadius + 14}
            fill="none"
            stroke={tier.color}
            strokeWidth="2"
            opacity="0.35"
            className="animate-pulse-ring"
            style={{ transformOrigin: `${cx}px ${cy}px` }}
          />
        )}

        {/* ============================================================ */}
        {/* 7. Center Circular Porcelain Hub */}
        {/* ============================================================ */}
        <g 
          className={`animate-heartbeat transition-all duration-300 ${
            tier.id === 'low'
              ? '[animation-name:heartbeat-low]'
              : tier.id === 'moderate'
              ? '[animation-name:heartbeat-moderate]'
              : tier.id === 'elevated'
              ? '[animation-name:heartbeat-elevated]'
              : '[animation-name:heartbeat-critical]'
          }`}
          style={heartbeatStyle}
        >
          {/* Main White Hub Background with Drop Shadow */}
          <circle
            cx={cx}
            cy={cy}
            r={hubRadius}
            fill="#ffffff"
            stroke="#f8fafc"
            strokeWidth="1"
            filter="url(#hubShadow)"
          />

          {/* Subtle Inner Accent Ring */}
          <circle
            cx={cx}
            cy={cy}
            r={hubRadius - 6}
            fill="none"
            stroke="#f1f5f9"
            strokeWidth="1.5"
          />

          {/* Soft Inner Glow/Tint */}
          <circle
            cx={cx}
            cy={cy}
            r={hubRadius - 7}
            fill={tier.color}
            fillOpacity="0.03"
          />

          {/* ============================================================ */}
          {/* Center Hierarchy Content */}
          {/* ============================================================ */}

          {/* TOP: Small Uppercase Risk Badge */}
          <g transform={`translate(${cx}, ${cy - 44})`}>
            {/* Badge Background Pill */}
            <rect
              x="-48"
              y="-10"
              width="96"
              height="20"
              rx="10"
              fill={tier.color}
              fillOpacity="0.12"
              stroke={tier.color}
              strokeOpacity="0.25"
              strokeWidth="0.8"
            />
            {/* Bullet Dot */}
            <circle
              cx="-34"
              cy="0"
              r="2.5"
              fill={tier.color}
              className={tier.id === 'critical' ? 'animate-ping' : ''}
            />
            {/* Badge Text */}
            <text
              x="2"
              y="3.5"
              textAnchor="middle"
              fill={tier.color}
              className="text-[9.5px] sm:text-[10px] font-bold tracking-wider uppercase font-sans"
              style={{ fontWeight: 800 }}
            >
              {tier.label}
            </text>
          </g>

          {/* MIDDLE: Large Bold Score (Comfortable clearance for 100%) */}
          <g transform={`translate(${cx}, ${cy + 6})`}>
            <text
              x="0"
              y="0"
              textAnchor="middle"
              className="font-mono font-extrabold fill-slate-900 select-none"
              style={{
                fontSize: '34px',
                letterSpacing: '-0.04em',
                fontFeatureSettings: '"tnum"',
              }}
            >
              {roundedValue}
              <tspan
                dx="1"
                dy="-6"
                className="font-sans font-bold fill-slate-500"
                style={{ fontSize: '18px' }}
              >
                %
              </tspan>
            </text>
          </g>

          {/* BOTTOM: Small Muted Uppercase Descriptor */}
          <g transform={`translate(${cx}, ${cy + 34})`}>
            <text
              x="0"
              y="0"
              textAnchor="middle"
              className="fill-slate-400 text-[9.5px] sm:text-[10px] font-bold tracking-widest uppercase font-sans"
              style={{ letterSpacing: '0.14em' }}
            >
              HEALTH AT RISK
            </text>
          </g>
        </g>

      </svg>

      {/* Scrub / Drag Helper Pill for Users (when interactive) */}
      {isInteractive && (
        <div className="mt-1 flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100/90 text-slate-500 text-[11px] font-medium border border-slate-200/80 shadow-2xs">
          <Activity className="w-3 h-3 text-slate-400 animate-pulse" />
          <span>Click or drag dial to simulate risk levels</span>
        </div>
      )}

    </div>
  );
}
