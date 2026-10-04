import React from 'react';

/**
 * Reusable Semicircular SVG Gauge Component
 *
 * @param {Object} props
 * @param {number} props.value - Percentage value (0 - 100)
 * @param {string} props.color - Active tick color (e.g. '#0f766e')
 * @param {string} [props.inactiveColor='#d8e2e0'] - Inactive tick color
 * @param {string} [props.label] - Optional center label (defaults to value + '%')
 * @param {boolean} [props.showLabels=true] - Whether to show '0' and '100' endpoint labels
 */
export default function Gauge({
  value = 0,
  color = '#0f766e',
  inactiveColor = '#d8e2e0',
  label,
  showLabels = true,
}) {
  const totalTicks = 32;
  const clampedValue = Math.min(100, Math.max(0, value));
  const activeCount = Math.round((clampedValue / 100) * totalTicks);

  // Geometry settings
  const cx = 100;
  const cy = 95;
  const rInner = 68;
  const rOuter = 82;

  const ticks = [];
  for (let i = 0; i < totalTicks; i++) {
    // Angle in radians from Math.PI (180deg, left) to 0 (0deg, right)
    const angle = Math.PI - (i / (totalTicks - 1)) * Math.PI;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    const x1 = cx + rInner * cos;
    const y1 = cy - rInner * sin;
    const x2 = cx + rOuter * cos;
    const y2 = cy - rOuter * sin;

    const isActive = i < activeCount;

    ticks.push(
      <line
        key={i}
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={isActive ? color : inactiveColor}
        strokeWidth="3.2"
        strokeLinecap="round"
      />
    );
  }

  return (
    <div className="relative flex flex-col items-center justify-center select-none w-full max-w-[220px] mx-auto">
      <svg
        viewBox="0 0 200 115"
        className="w-full h-auto overflow-visible"
        aria-label={`Gauge showing ${clampedValue}%`}
      >
        {/* Semicircle Ticks */}
        <g>{ticks}</g>

        {/* Center Percentage Display */}
        <text
          x={cx}
          y={cy - 12}
          textAnchor="middle"
          className="fill-[#0b1f2a] font-bold"
          style={{ fontSize: '26px', fontFamily: 'Inter, sans-serif' }}
        >
          {label !== undefined ? label : `${clampedValue}%`}
        </text>

        {/* Endpoint Labels */}
        {showLabels && (
          <>
            <text
              x={cx - rOuter - 2}
              y={cy + 14}
              textAnchor="middle"
              className="fill-[#718784] text-[11px] font-medium"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              0
            </text>
            <text
              x={cx + rOuter + 2}
              y={cy + 14}
              textAnchor="middle"
              className="fill-[#718784] text-[11px] font-medium"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              100
            </text>
          </>
        )}
      </svg>
    </div>
  );
}
