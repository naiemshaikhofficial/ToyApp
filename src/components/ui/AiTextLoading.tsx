"use client";

/**
 * ProducerToy Monochrome AI Text Loading Component
 * Wave-undulating text state for Prody AI assistant responses.
 * Strictly adheres to black, white, charcoal, and zinc palette - zero colored accents.
 */

import React from "react";
import { cn } from "@/lib/utils";

export interface AiTextLoadingProps {
  text?: string;
  className?: string;
}

export function AiTextLoading({
  text = "Prody AI is synthesizing response...",
  className,
}: AiTextLoadingProps) {
  const letters = Array.from(text);

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 select-none py-1.5 px-3 rounded-lg bg-[#181818] border border-[#2a2a2a]",
        className
      )}
    >
      {/* Monochrome AI Pulse Orb */}
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-40" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
      </span>

      {/* Undulating Monochrome Letter Wave */}
      <span className="font-mono text-xs text-zinc-400 tracking-wide flex items-center">
        {letters.map((char, index) => (
          <span
            key={index}
            className="inline-block animate-pulse duration-1000"
            style={{
              animationDelay: `${index * 45}ms`,
              animationDuration: "1200ms",
            }}
          >
            {char === " " ? "\u00A0" : char}
          </span>
        ))}
      </span>
    </div>
  );
}

export default AiTextLoading;
