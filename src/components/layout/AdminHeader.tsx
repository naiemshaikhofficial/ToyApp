'use client'

import { Bell, Sparkles, RefreshCw, Shield, Database } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface AdminHeaderProps {
  title: string
  subtitle?: string
}

export function AdminHeader({ title, subtitle }: AdminHeaderProps) {
  const router = useRouter()

  return (
    <header className="h-16 border-b border-[#2a2a2a] bg-[#181818]/90 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-base font-extrabold text-white tracking-wide uppercase">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs text-zinc-400 mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Database Status Pill */}
        <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#202020] border border-[#2a2a2a] text-[11px] font-mono text-zinc-300">
          <Database className="w-3.5 h-3.5 text-zinc-300" />
          <span>TOY APP CLUSTER</span>
          <span className="w-1.5 h-1.5 rounded-full bg-white" />
        </div>

        {/* Refresh Action */}
        <button
          onClick={() => router.refresh()}
          className="p-2 rounded-md bg-[#202020] text-zinc-300 hover:text-white hover:bg-[#2a2a2a] border border-[#2a2a2a] transition"
          title="Reload Data"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>
    </header>
  )
}
