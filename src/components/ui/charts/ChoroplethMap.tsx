"use client";

/**
 * ProducerToy Monochrome Choropleth Geographic Traffic Map
 * Displays global visitor traffic distribution from Cloudflare edge headers.
 * Strictly adheres to black, white, charcoal, and zinc palette - zero colored accents.
 */

import React, { useState } from "react";
import { Globe, Users, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CountryTraffic {
  code: string;
  name: string;
  visitors: number;
  percentage: number;
}

export interface ChoroplethMapProps {
  data?: CountryTraffic[];
  className?: string;
}

const DEFAULT_COUNTRY_DATA: CountryTraffic[] = [
  { code: "US", name: "United States", visitors: 4820, percentage: 41 },
  { code: "IN", name: "India", visitors: 2940, percentage: 25 },
  { code: "GB", name: "United Kingdom", visitors: 1120, percentage: 9.5 },
  { code: "DE", name: "Germany", visitors: 890, percentage: 7.6 },
  { code: "CA", name: "Canada", visitors: 640, percentage: 5.4 },
  { code: "JP", name: "Japan", visitors: 510, percentage: 4.3 },
  { code: "AU", name: "Australia", visitors: 390, percentage: 3.3 },
  { code: "FR", name: "France", visitors: 310, percentage: 2.6 },
];

export function ChoroplethMap({
  data = DEFAULT_COUNTRY_DATA,
  className,
}: ChoroplethMapProps) {
  const [hovered, setHovered] = useState<CountryTraffic | null>(null);
  const totalVisitors = data.reduce((acc, c) => acc + c.visitors, 0);

  // Simplified World SVG Regions represented cleanly in high-tech geometric projections
  const regions = [
    { id: "NA", name: "North America", x: 60, y: 55, w: 90, h: 55, code: "US" },
    { id: "SA", name: "South America", x: 120, y: 135, w: 45, h: 70, code: "BR" },
    { id: "EU", name: "Europe", x: 220, y: 50, w: 65, h: 45, code: "DE" },
    { id: "AF", name: "Africa", x: 215, y: 110, w: 65, h: 75, code: "ZA" },
    { id: "AS", name: "Asia", x: 300, y: 55, w: 110, h: 70, code: "IN" },
    { id: "OC", name: "Oceania", x: 380, y: 155, w: 60, h: 45, code: "AU" },
  ];

  return (
    <div className={cn("epic-card p-6 space-y-5", className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#2a2a2a] gap-2">
        <div>
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-white" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Cloudflare Edge Traffic Distribution
            </h3>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Real-time geolocation telemetry via CF-IPCountry & worker analytics
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1 rounded bg-[#181818] border border-[#2a2a2a] text-right">
            <span className="text-[10px] font-mono text-zinc-500 uppercase block">Total Sessions</span>
            <span className="text-xs font-mono font-bold text-white">
              {totalVisitors.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* World Regional Map Grid */}
        <div className="lg:col-span-7 relative bg-[#141414] border border-[#242424] rounded-xl p-4 flex flex-col items-center justify-center min-h-[220px]">
          <svg
            viewBox="0 0 480 230"
            className="w-full h-auto select-none"
          >
            {/* Background Map Grid Matrix */}
            <pattern
              id="grid-dots"
              x="0"
              y="0"
              width="16"
              height="16"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="2" cy="2" r="0.8" fill="#2a2a2a" />
            </pattern>
            <rect width="480" height="230" fill="url(#grid-dots)" />

            {/* Continental landmass silhouettes in monochrome */}
            {/* North America */}
            <path
              d="M 50,45 Q 90,30 140,40 Q 160,70 130,95 Q 100,105 70,80 Z"
              fill="#222222"
              stroke="#383838"
              strokeWidth="1"
              className="hover:fill-white/20 transition-colors cursor-pointer"
              onMouseEnter={() => setHovered(data.find((d) => d.code === "US") || null)}
              onMouseLeave={() => setHovered(null)}
            />
            {/* South America */}
            <path
              d="M 120,115 Q 155,120 150,165 Q 135,210 120,185 Q 110,140 120,115 Z"
              fill="#1c1c1c"
              stroke="#2e2e2e"
              strokeWidth="1"
              className="hover:fill-white/20 transition-colors cursor-pointer"
            />
            {/* Europe */}
            <path
              d="M 215,40 Q 260,35 270,65 Q 240,85 210,75 Z"
              fill="#2e2e2e"
              stroke="#444444"
              strokeWidth="1"
              className="hover:fill-white/20 transition-colors cursor-pointer"
              onMouseEnter={() => setHovered(data.find((d) => d.code === "DE") || null)}
              onMouseLeave={() => setHovered(null)}
            />
            {/* Africa */}
            <path
              d="M 210,90 Q 275,85 270,145 Q 245,190 220,170 Q 200,125 210,90 Z"
              fill="#181818"
              stroke="#282828"
              strokeWidth="1"
              className="hover:fill-white/20 transition-colors cursor-pointer"
            />
            {/* Asia */}
            <path
              d="M 275,35 Q 380,30 420,75 Q 390,130 330,120 Q 285,100 275,60 Z"
              fill="#333333"
              stroke="#4e4e4e"
              strokeWidth="1"
              className="hover:fill-white/20 transition-colors cursor-pointer"
              onMouseEnter={() => setHovered(data.find((d) => d.code === "IN") || null)}
              onMouseLeave={() => setHovered(null)}
            />
            {/* Oceania */}
            <path
              d="M 370,145 Q 430,140 425,180 Q 380,195 365,165 Z"
              fill="#222222"
              stroke="#343434"
              strokeWidth="1"
              className="hover:fill-white/20 transition-colors cursor-pointer"
              onMouseEnter={() => setHovered(data.find((d) => d.code === "AU") || null)}
              onMouseLeave={() => setHovered(null)}
            />

            {/* Telemetry Target Pulses */}
            {/* US Hub */}
            <g transform="translate(100, 65)">
              <circle r="3" fill="#ffffff" />
              <circle r="9" fill="#ffffff" opacity="0.25" className="animate-ping" />
            </g>
            {/* India Hub */}
            <g transform="translate(330, 85)">
              <circle r="3" fill="#ffffff" />
              <circle r="9" fill="#ffffff" opacity="0.25" className="animate-ping" />
            </g>
            {/* Germany/Europe Hub */}
            <g transform="translate(240, 58)">
              <circle r="2.5" fill="#ffffff" />
            </g>
            {/* UK Hub */}
            <g transform="translate(225, 48)">
              <circle r="2" fill="#d4d4d8" />
            </g>
          </svg>

          {/* Interactive Hover Tooltip */}
          {hovered && (
            <div className="absolute bottom-3 left-3 bg-[#1e1e1e]/95 backdrop-blur-md border border-white/20 rounded-md px-3 py-1.5 shadow-xl text-xs font-mono">
              <span className="font-bold text-white uppercase">{hovered.name}</span>
              <span className="text-zinc-500 mx-1.5">•</span>
              <span className="text-zinc-300">{hovered.visitors.toLocaleString()} users ({hovered.percentage}%)</span>
            </div>
          )}
        </div>

        {/* Top Countries Data List */}
        <div className="lg:col-span-5 space-y-2.5">
          <div className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider pb-1 border-b border-[#242424] flex justify-between">
            <span>Country</span>
            <span>Sessions / Share</span>
          </div>

          <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
            {data.map((c) => (
              <div
                key={c.code}
                onMouseEnter={() => setHovered(c)}
                onMouseLeave={() => setHovered(null)}
                className="p-2 rounded bg-[#181818] hover:bg-[#222222] border border-[#262626] flex items-center justify-between text-xs transition cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-4 rounded bg-[#2a2a2a] border border-white/10 flex items-center justify-center font-mono text-[9px] font-bold text-white">
                    {c.code}
                  </span>
                  <span className="text-white font-medium text-xs">{c.name}</span>
                </div>

                <div className="flex items-center gap-3 font-mono">
                  <span className="text-zinc-300 text-[11px]">{c.visitors.toLocaleString()}</span>
                  <div className="w-12 bg-[#2a2a2a] h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-white h-full rounded-full"
                      style={{ width: `${c.percentage}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-zinc-500 w-8 text-right">{c.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChoroplethMap;
