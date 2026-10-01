'use client';

import React from 'react';

// Mathematical Cubic Bézier Path Formula from master_design.md
function getBezierPath(points: Array<{ x: number; y: number }>) {
  if (!points || points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  let path = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? 0 : i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] || p2;

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    path += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return path;
}

interface DualLineChartProps {
  seriesA?: number[];
  seriesB?: number[];
  labels?: string[];
  height?: number;
}

export function DualBezierChart({
  seriesA = [12, 19, 28, 35, 42, 58, 64],
  seriesB = [8, 14, 20, 26, 32, 45, 52],
  labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  height = 190
}: DualLineChartProps) {
  const width = 560;
  const paddingX = 35;
  const paddingY = 25;
  const maxVal = Math.max(...seriesA, ...seriesB, 70);

  const stepX = (width - paddingX * 2) / (labels.length - 1);
  const chartHeight = height - paddingY * 2;

  const pointsA = seriesA.map((val, idx) => ({
    x: paddingX + idx * stepX,
    y: height - paddingY - (val / maxVal) * chartHeight
  }));

  const pointsB = seriesB.map((val, idx) => ({
    x: paddingX + idx * stepX,
    y: height - paddingY - (val / maxVal) * chartHeight
  }));

  const pathA = getBezierPath(pointsA);
  const pathB = getBezierPath(pointsB);

  const areaA = `${pathA} L ${pointsA[pointsA.length - 1].x} ${height - paddingY} L ${pointsA[0].x} ${height - paddingY} Z`;
  const areaB = `${pathB} L ${pointsB[pointsB.length - 1].x} ${height - paddingY} L ${pointsB[0].x} ${height - paddingY} Z`;

  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        style={{ width: '100%', height: 'auto', display: 'block' }}
      >
        <defs>
          <linearGradient id="grad-series-a" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1d4ed8" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0.0" />
          </linearGradient>
          <linearGradient id="grad-series-b" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Subtle Horizontal Grid lines */}
        {[0.25, 0.5, 0.75, 1].map((ratio, i) => {
          const y = height - paddingY - ratio * chartHeight;
          return (
            <line
              key={i}
              x1={paddingX}
              y1={y}
              x2={width - paddingX}
              y2={y}
              stroke="#e5e7eb"
              strokeDasharray="3 3"
              strokeWidth="1"
            />
          );
        })}

        {/* Area Fills */}
        <path d={areaA} fill="url(#grad-series-a)" />
        <path d={areaB} fill="url(#grad-series-b)" />

        {/* Curved Stroke Lines */}
        <path d={pathA} fill="none" stroke="#1d4ed8" strokeWidth="2.5" strokeLinecap="round" />
        <path d={pathB} fill="none" stroke="#10b981" strokeWidth="2" strokeDasharray="4 2" strokeLinecap="round" />

        {/* Points on Series A */}
        {pointsA.map((p, idx) => (
          <circle
            key={idx}
            cx={p.x}
            cy={p.y}
            r="3.5"
            fill="#ffffff"
            stroke="#1d4ed8"
            strokeWidth="2"
          />
        ))}

        {/* X Axis Labels */}
        {labels.map((lbl, idx) => (
          <text
            key={idx}
            x={paddingX + idx * stepX}
            y={height - 6}
            textAnchor="middle"
            fill="#64748b"
            fontSize="10.5"
            fontFamily="Inter, sans-serif"
            fontWeight="500"
          >
            {lbl}
          </text>
        ))}
      </svg>
    </div>
  );
}

interface SpeedometerProps {
  score?: number;
  maxScore?: number;
  size?: number;
  label?: string;
}

export function SpeedometerGauge({
  score = 94.2,
  maxScore = 100,
  size = 210,
  label = 'Velocity Score'
}: SpeedometerProps) {
  const clampedScore = Math.max(0, Math.min(maxScore, Number(score) || 0));
  const pct = clampedScore / maxScore;

  const cx = size / 2;
  const cy = size * 0.58;
  const radius = size * 0.42;
  const strokeWidth = 13;
  const needleAngle = -180 + pct * 180;
  const arcLength = Math.PI * radius;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <svg
        width={size}
        height={Math.round(size * 0.62)}
        viewBox={`0 0 ${size} ${Math.round(size * 0.62)}`}
      >
        <defs>
          <linearGradient id="speedo-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="35%" stopColor="#f59e0b" />
            <stop offset="70%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
        </defs>

        {/* Gray Track */}
        <path
          d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
          fill="none"
          stroke="#f1f5f9"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        {/* Active Gradient Arc */}
        <path
          d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
          fill="none"
          stroke="url(#speedo-grad)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={arcLength}
          strokeDashoffset={arcLength * (1 - pct)}
        />

        {/* Needle Pointer */}
        <g transform={`rotate(${needleAngle} ${cx} ${cy})`}>
          <line
            x1={cx}
            y1={cy}
            x2={cx + radius - 6}
            y2={cy}
            stroke="#0f172a"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <circle cx={cx + radius - 6} cy={cy} r="3" fill="#10b981" />
        </g>

        {/* Center Metallic Pivot */}
        <circle cx={cx} cy={cy} r="7" fill="#0f172a" stroke="#ffffff" strokeWidth="2.5" />
      </svg>
      <div style={{ marginTop: '-12px', textAlign: 'center' }}>
        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111827', fontFamily: 'Montserrat, sans-serif' }}>
          {score}%
        </div>
        <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {label}
        </div>
      </div>
    </div>
  );
}

export function CircularProgressRing({
  pct = 78,
  size = 64,
  strokeWidth = 6,
  strokeColor = '#1e1e1e'
}: {
  pct?: number;
  size?: number;
  strokeWidth?: number;
  strokeColor?: string;
}) {
  const radius = (size - strokeWidth * 2) / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - pct / 100);

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ transform: 'rotate(-90deg)' }}
      >
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="#f1f5f9"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.6875rem',
          fontWeight: 800,
          color: '#111827'
        }}
      >
        {pct}%
      </div>
    </div>
  );
}
