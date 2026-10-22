'use client'

import React from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { RefreshCw, ExternalLink, ShieldCheck } from 'lucide-react'

interface AdminHeaderProps {
  title: string
  subtitle?: string
}

export function AdminHeader({ title, subtitle }: AdminHeaderProps) {
  const router = useRouter()

  return (
    <header className="h-16 border-b border-[#242424] bg-[#121212]/90 backdrop-blur-md px-6 sm:px-8 flex items-center justify-between sticky top-0 z-30 select-none">
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-base sm:text-lg font-bold text-white tracking-tight leading-none uppercase">
            {title}
          </h1>
          <p className="text-[11px] text-zinc-400 font-medium hidden sm:block mt-1">
            {subtitle || 'Toy App • Central Operations Portal'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Live Store Link matching Toy Creator */}
        <a
          href="https://producertoy.com"
          target="_blank"
          rel="noreferrer"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-white bg-[#1a1a1a] hover:bg-[#242424] border border-[#2a2a2a] transition-colors"
        >
          <span>Live Store</span>
          <ExternalLink className="w-3 h-3 text-zinc-400" />
        </a>

        {/* Reload Data Button */}
        <button
          onClick={() => router.refresh()}
          className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-[#202020] border border-[#2a2a2a] transition-colors"
          title="Reload Data"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>

        {/* Mascot Avatar - Naked, No Border */}
        <div className="w-8 h-8 flex items-center justify-center shrink-0">
          <Image
            src="/Manager Bear Dashboard Mascot.png"
            alt="Staff Mascot Avatar"
            width={32}
            height={32}
            className="w-8 h-8 object-contain filter drop-shadow-sm"
          />
        </div>
      </div>
    </header>
  )
}
