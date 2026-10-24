"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { useRadar } from "./radar-context";

export interface RadarAxisProps {
  stroke?: string;
  strokeOpacity?: number;
  className?: string;
}

export function RadarAxis({
  stroke = "#2e2e2e",
  strokeOpacity = 0.8,
  className = "",
}: RadarAxisProps) {
  const { metrics, center, radius, getAngle } = useRadar();

  return (
    <g className={cn("radar-axes", className)}>
      {metrics.map((metric, i) => {
        const angle = getAngle(i);
        const x2 = center + radius * Math.cos(angle);
        const y2 = center + radius * Math.sin(angle);

        return (
          <line
            key={`axis-${metric.key}`}
            x1={center}
            y1={center}
            x2={x2}
            y2={y2}
            stroke={stroke}
            strokeOpacity={strokeOpacity}
            strokeWidth={1}
            strokeDasharray="2 2"
          />
        );
      })}
    </g>
  );
}

RadarAxis.displayName = "RadarAxis";
export default RadarAxis;
