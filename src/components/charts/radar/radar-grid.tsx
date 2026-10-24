"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { useRadar } from "./radar-context";

export interface RadarGridProps {
  showLabels?: boolean;
  stroke?: string;
  strokeOpacity?: number;
  className?: string;
}

export function RadarGrid({
  showLabels = true,
  stroke = "#2a2a2a",
  strokeOpacity = 0.8,
  className = "",
}: RadarGridProps) {
  const { metrics, center, radius, levels, getAngle } = useRadar();

  return (
    <g className={cn("radar-grid", className)}>
      {/* Concentric spider-web polygon rings */}
      {Array.from({ length: levels }, (_, i) => {
        const levelPct = (i + 1) / levels;
        const levelRadius = levelPct * radius;

        const points = metrics
          .map((_, mIdx) => {
            const angle = getAngle(mIdx);
            const x = center + levelRadius * Math.cos(angle);
            const y = center + levelRadius * Math.sin(angle);
            return `${x},${y}`;
          })
          .join(" ");

        return (
          <polygon
            key={`grid-ring-${i}`}
            points={points}
            fill="none"
            stroke={stroke}
            strokeOpacity={strokeOpacity}
            strokeWidth={1}
            className="transition-all duration-300"
          />
        );
      })}

      {/* Grid level labels (e.g. 20, 40, 60, 80, 100) */}
      {showLabels &&
        Array.from({ length: levels }, (_, i) => {
          const levelPct = (i + 1) / levels;
          const levelRadius = levelPct * radius;
          const y = center - levelRadius;

          return (
            <text
              key={`level-label-${i}`}
              x={center + 4}
              y={y + 3}
              fontSize={9}
              fill="#71717a"
              className="font-mono select-none"
              textAnchor="start"
            >
              {Math.round(levelPct * 100)}
            </text>
          );
        })}
    </g>
  );
}

RadarGrid.displayName = "RadarGrid";
export default RadarGrid;
