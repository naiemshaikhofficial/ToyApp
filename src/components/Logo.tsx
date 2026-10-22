'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'

interface LogoProps {
  size?: number
  className?: string
  showText?: boolean
  subtitle?: string
  href?: string
}

export function Logo({
  size = 40,
  className = '',
  showText = true,
  subtitle = 'BY PRODUCERTOY',
  href,
}: LogoProps) {
  const content = (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {/* Mascot Emblem - Pure Naked Mascot (No square border) */}
      <div className="relative flex-shrink-0" style={{ width: `${size}px`, height: `${size}px` }}>
        <Image
          src="/Manager Bear Dashboard Mascot.png"
          alt="Toy App Mascot"
          width={size}
          height={size}
          className="w-full h-full object-contain filter drop-shadow-sm"
          priority
        />
      </div>

      {showText && (
        <div className="flex flex-col">
          <span className="font-black text-base uppercase tracking-tight leading-none text-white">
            TOY <span className="text-zinc-400">APP</span>
          </span>
          <span className="text-[9px] font-bold text-zinc-500 tracking-widest uppercase leading-none mt-1 font-mono">
            {subtitle}
          </span>
        </div>
      )}
    </div>
  )

  if (href) {
    return (
      <Link href={href} className="inline-flex hover:opacity-90 transition-opacity">
        {content}
      </Link>
    )
  }

  return content
}

export function LogoIcon({ size = 48, className = '' }: Omit<LogoProps, 'showText' | 'subtitle'>) {
  return (
    <div className={`relative flex-shrink-0 select-none ${className}`} style={{ width: `${size}px`, height: `${size}px` }}>
      <Image
        src="/Manager Bear Dashboard Mascot.png"
        alt="Toy App Mascot"
        width={size}
        height={size}
        className="w-full h-full object-contain filter drop-shadow-sm"
        priority
      />
    </div>
  )
}
