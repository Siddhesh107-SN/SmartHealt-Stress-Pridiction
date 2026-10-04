/**
 * Centralized Risk Tier Configuration for Health Risk Prediction
 * 
 * Defines the 4 risk tiers: Low, Moderate, Elevated, and Critical,
 * with standardized colors, labels, icons, BPM pulse rates, and clinical advisories.
 */

export const RISK_TIERS = {
  low: {
    id: "low",
    min: 0,
    max: 24,
    label: "LOW RISK",
    shortLabel: "Low",
    badgeLabel: "● LOW RISK",
    color: "#10b981", // Emerald-500
    colorName: "emerald",
    bgLight: "bg-emerald-50",
    borderLight: "border-emerald-200",
    textDark: "text-emerald-800",
    textPrimary: "text-emerald-600",
    ringColor: "ring-emerald-500/20",
    gradientFrom: "#10b981",
    gradientTo: "#34d399",
    iconName: "ShieldCheck",
    emoji: "🛡️",
    bpm: 60,
    heartbeatDuration: 1.0, // seconds per pulse
    pulseStyle: "heartbeat-low",
    pulseDescription: "Calm Autonomic State (60 BPM rhythm)",
    advisoryTitle: "Optimal Health & Resilient Baseline",
    advisoryMessage: "Your physiological indicators demonstrate strong autonomic recovery and low overall health risk. Resting vitals, sleep duration, and blood oxygenation are in healthy target zones.",
    actionableTips: [
      "Maintain your regular physical activity and hydration routines.",
      "Keep consistent sleep intervals (7–9 hours nightly).",
      "Continue proactive annual check-ups and preventive wellness habits."
    ],
  },
  moderate: {
    id: "moderate",
    min: 25,
    max: 49,
    label: "MODERATE RISK",
    shortLabel: "Moderate",
    badgeLabel: "● MODERATE RISK",
    color: "#f59e0b", // Amber-500
    colorName: "amber",
    bgLight: "bg-amber-50",
    borderLight: "border-amber-200",
    textDark: "text-amber-800",
    textPrimary: "text-amber-600",
    ringColor: "ring-amber-500/20",
    gradientFrom: "#f59e0b",
    gradientTo: "#fbbf24",
    iconName: "AlertTriangle",
    emoji: "⚠️",
    bpm: 78,
    heartbeatDuration: 0.77, // seconds per pulse
    pulseStyle: "heartbeat-moderate",
    pulseDescription: "Steady Cardiac Baseline (78 BPM rhythm)",
    advisoryTitle: "Moderate Health Risk Advisory",
    advisoryMessage: "Minor physiological deviations or lifestyle fatigue markers detected. While within manageable thresholds, subtle autonomic strain can accumulate without mindful lifestyle pacing.",
    actionableTips: [
      "Improve sleep duration and limit late-night screen exposure.",
      "Incorporate brief movement and stretching breaks during prolonged sedentary periods.",
      "Track hydration and incorporate balanced stress-reduction habits."
    ],
  },
  elevated: {
    id: "elevated",
    min: 50,
    max: 74,
    label: "ELEVATED RISK",
    shortLabel: "Elevated",
    badgeLabel: "● ELEVATED RISK",
    color: "#f97316", // Orange-500
    colorName: "orange",
    bgLight: "bg-orange-50",
    borderLight: "border-orange-200",
    textDark: "text-orange-800",
    textPrimary: "text-orange-600",
    ringColor: "ring-orange-500/20",
    gradientFrom: "#f97316",
    gradientTo: "#fb923c",
    iconName: "AlertCircle",
    emoji: "⚡",
    bpm: 96,
    heartbeatDuration: 0.625, // seconds per pulse
    pulseStyle: "heartbeat-elevated",
    pulseDescription: "Accelerated Cardiac Rhythm (96 BPM rhythm)",
    advisoryTitle: "Elevated Health Risk Warning",
    advisoryMessage: "Multiple biometric markers indicate heightened physiological strain, reduced recovery capacity, or cardiovascular load. Proactive intervention is recommended to prevent chronic health strain.",
    actionableTips: [
      "Prioritize structured rest and address acute sleep deficits immediately.",
      "Consider scheduling a check-up with a healthcare provider for routine screening.",
      "Reduce caffeine/stimulants and practice 5-minute diaphragmatic breathing."
    ],
  },
  critical: {
    id: "critical",
    min: 75,
    max: 100,
    label: "CRITICAL RISK",
    shortLabel: "Critical",
    badgeLabel: "● CRITICAL RISK",
    color: "#ef4444", // Rose/Crimson-500
    colorName: "rose",
    bgLight: "bg-rose-50",
    borderLight: "border-rose-300",
    textDark: "text-rose-900",
    textPrimary: "text-rose-600",
    ringColor: "ring-rose-500/30",
    gradientFrom: "#ef4444",
    gradientTo: "#f87171",
    iconName: "Flame",
    emoji: "🚨",
    bpm: 124,
    heartbeatDuration: 0.48, // seconds per pulse (urgent double-thump)
    pulseStyle: "heartbeat-critical",
    pulseDescription: "Urgent Double-Thump Rhythm (124 BPM rhythm)",
    advisoryTitle: "Critical Health Risk Alert",
    advisoryMessage: "Significant biometric distress patterns or acute autonomic imbalance identified across vital signs. These parameters reflect severe physiological strain that warrants prompt clinical review.",
    actionableTips: [
      "Consult a qualified healthcare professional or physician for comprehensive evaluation.",
      "Avoid intense exertion or high physical stress until cleared by medical guidance.",
      "Engage in immediate restorative resting and monitor vitals closely."
    ],
  },
};

/**
 * Returns the matching risk tier configuration for a given health risk percentage.
 * 
 * @param {number} percentage - Value from 0 to 100
 * @returns {typeof RISK_TIERS[keyof typeof RISK_TIERS]}
 */
export function getRiskTier(percentage) {
  const clamped = Math.min(100, Math.max(0, Number(percentage) || 0));
  if (clamped < 25) return RISK_TIERS.low;
  if (clamped < 50) return RISK_TIERS.moderate;
  if (clamped < 75) return RISK_TIERS.elevated;
  return RISK_TIERS.critical;
}

/**
 * SVG Geometry Utilities for Radial Horseshoe Gauge (260° sweep)
 */
export const GAUGE_CONFIG = {
  cx: 190,
  cy: 170,
  radius: 136,
  startAngle: 140, // bottom-left
  endAngle: 400,   // bottom-right (140 + 260)
  sweep: 260,
  totalTicks: 51,  // 0%, 2%, 4%, ..., 100%
  majorTicks: [0, 25, 50, 75, 100],
  hubRadius: 84,   // Center white circle radius (diameter = 168px)
};

/**
 * Converts polar coordinates to SVG Cartesian coordinates.
 */
export function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  // Using standard angle where 0 is right, 90 is bottom, 180 is left, 270 is top
  const rad = (angleInDegrees * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(rad),
    y: centerY + radius * Math.sin(rad),
  };
}

/**
 * Calculates SVG arc path for a given start and end angle.
 */
export function describeArc(cx, cy, r, startAngle, endAngle) {
  const start = polarToCartesian(cx, cy, r, startAngle);
  const end = polarToCartesian(cx, cy, r, endAngle);
  const arcSweep = endAngle - startAngle;
  const largeArcFlag = arcSweep <= 180 ? 0 : 1;

  return [
    "M", start.x, start.y,
    "A", r, r, 0, largeArcFlag, 1, end.x, end.y
  ].join(" ");
}

/**
 * Maps a percentage (0-100) to an angle on the 260° sweep (140° to 400°).
 */
export function percentageToAngle(percentage) {
  const clamped = Math.min(100, Math.max(0, percentage));
  return GAUGE_CONFIG.startAngle + (clamped / 100) * GAUGE_CONFIG.sweep;
}

/**
 * Maps an angle in [140°, 400°] back to a percentage [0, 100].
 */
export function angleToPercentage(angle) {
  let normalized = angle;
  while (normalized < GAUGE_CONFIG.startAngle) normalized += 360;
  while (normalized > GAUGE_CONFIG.endAngle) normalized -= 360;
  const clamped = Math.min(GAUGE_CONFIG.endAngle, Math.max(GAUGE_CONFIG.startAngle, normalized));
  return Math.round(((clamped - GAUGE_CONFIG.startAngle) / GAUGE_CONFIG.sweep) * 100);
}
