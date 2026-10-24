"use client";

/**
 * ProducerToy Monochrome Live Line Chart
 * Real-time streaming line chart with smooth interpolation and live pulse dot.
 * Strictly adheres to black, white, charcoal, and zinc palette - zero colored accents.
 */

import React, { useEffect, useId, useState } from "react";
import { cn } from "@/lib/utils";

export interface DataPoint {
  time: string;
  value: number;
}

export interface LiveLineChartProps {
  data?: number[];
  days?: string[];
  height?: number;
  streaming?: boolean;
  title?: string;
  unit?: string;
  currentValue?: number;
  className?: string;
}

export function LiveLineChart({
  data = [0, 0, 0, 0, 0, 0, 0],
  days = [],
  height = 200,
  streaming = true,
  title = "Sales Over Time",
  unit = "$",
  currentValue,
  className,
}: LiveLineChartProps) {
  const gradientId = useId();

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const paddingX = 12;
  const paddingY = 16;
  const width = 500;

  const points = data.map((val, idx) => ({
    x: paddingX + (idx / (data.length - 1)) * (width - paddingX * 2),
    y: height - paddingY - ((val - min) / range) * (height - paddingY * 2),
  }));

  // Build smooth bezier curves
  let pathD = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const cpX = (points[i].x + points[i + 1].x) / 2;
    pathD += ` C ${cpX} ${points[i].y}, ${cpX} ${points[i + 1].y}, ${points[i + 1].x} ${points[i + 1].y}`;
  }

  const lastPoint = points[points.length - 1];
  const areaD = `${pathD} L ${lastPoint.x} ${height} L ${points[0].x} ${height} Z`;
  const effectiveCurrentValue =
    currentValue !== undefined ? currentValue : (data[data.length - 1] ?? 0);

  return (
    <div
      className={cn(
        "epic-card p-5 relative overflow-hidden flex flex-col justify-between",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#2a2a2a] mb-2">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              {title}
            </h3>
            {streaming && (
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#181818] border border-[#2a2a2a] text-[10px] font-mono text-zinc-300">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                Live
              </span>
            )}
          </div>
          <p className="text-[11px] font-mono text-zinc-500 mt-0.5">
            Last 7 days of completed sales
          </p>
        </div>

        <div className="text-right">
          <div className="text-lg font-mono font-bold text-white tracking-tight">
            {unit}
            {effectiveCurrentValue.toFixed(2)}
          </div>
          <div className="text-[10px] font-mono text-zinc-400">Today&apos;s Sales</div>
        </div>
      </div>

      {/* SVG Chart Area */}
      <div className="relative w-full" style={{ height }}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="none"
          className="w-full h-full overflow-visible"
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.14" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Subtle Gridlines */}
          {[0.25, 0.5, 0.75].map((pct, idx) => (
            <line
              key={idx}
              x1="0"
              y1={height * pct}
              x2={width}
              y2={height * pct}
              stroke="#262626"
              strokeDasharray="3 3"
              strokeWidth="1"
            />
          ))}

          {/* Area Fill */}
          <path d={areaD} fill={`url(#${gradientId})`} />

          {/* Main White Stroke */}
          <path
            d={pathD}
            fill="none"
            stroke="#ffffff"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Live pulsing dot on the head */}
          <g transform={`translate(${lastPoint.x}, ${lastPoint.y})`}>
            <circle r="4" fill="#ffffff" />
            <circle
              r="9"
              fill="#ffffff"
              opacity="0.3"
              className="animate-ping"
            />
          </g>
        </svg>
      </div>

      {/* Axis Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-[#242424] text-[10px] font-mono text-zinc-500">
        <span>{days.length > 0 ? days[0].slice(5) : "T - 6d"}</span>
        <span>{days.length > 3 ? days[Math.floor(days.length / 2)].slice(5) : "T - 3d"}</span>
        <span className="text-zinc-300 font-bold">Today</span>
      </div>
    </div>
  );
}

export default LiveLineChart;
