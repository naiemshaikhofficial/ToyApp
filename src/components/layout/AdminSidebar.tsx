'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Building2,
  Package,
  Receipt,
  FileSpreadsheet,
  Wallet,
  ShieldCheck,
  Users2,
  ExternalLink,
} from 'lucide-react'

interface AdminSidebarProps {
  currentStaffRole?: string
  currentStaffName?: string
}

export function AdminSidebar({ currentStaffRole = 'super_admin', currentStaffName = 'Naiem Shaikh' }: AdminSidebarProps) {
  const pathname = usePathname()

  const navItems = [
    {
      label: 'Toy Overview',
      href: '/',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      label: 'Brand Management',
      href: '/brands',
      icon: Building2,
      badge: '303+',
    },
    {
      label: 'Product Management',
      href: '/products',
      icon: Package,
      badge: null,
    },
    {
      label: 'Sales & Orders',
      href: '/orders',
      icon: Receipt,
      badge: 'Live',
    },
    {
      label: 'Tax Invoices',
      href: '/invoices',
      icon: FileSpreadsheet,
      badge: null,
    },
    {
      label: 'Creator Payouts',
      href: '/payouts',
      icon: Wallet,
      badge: '70/30',
    },
    {
      label: 'Licenses & Devices',
      href: '/licenses',
      icon: ShieldCheck,
      badge: null,
    },
    {
      label: 'Staff Base Roles',
      href: '/staff',
      icon: Users2,
      badge: null,
    },
  ]

  return (
    <aside className="w-64 bg-[#181818] border-r border-[#2a2a2a] flex flex-col shrink-0 min-h-screen sticky top-0 h-screen overflow-y-auto z-40">
      {/* Brand Header with 3D Logo & Mascot */}
      <div className="p-4 border-b border-[#2a2a2a] flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative w-9 h-9 rounded-lg overflow-hidden shrink-0 border border-[#2a2a2a] bg-[#121212]">
            <Image
              src="/Manager Bear Dashboard Mascot.png"
              alt="Manager Bear Mascot"
              width={36}
              height={36}
              className="object-cover w-full h-full"
            />
          </div>
          <div className="flex flex-col">
            <div className="relative h-6 w-28">
              <Image
                src="/Producer Toy Charcoal 3D Logo.webp"
                alt="ProducerToy"
                fill
                className="object-contain object-left group-hover:brightness-110 transition"
                priority
              />
            </div>
            <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-zinc-400">
              TOY APP
            </span>
          </div>
        </Link>
        <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold bg-[#2a2a2a] text-zinc-300 rounded border border-[#383838]">
          v2.0
        </span>
      </div>

      {/* Navigation List */}
      <nav className="p-3 space-y-1 flex-1">
        <div className="px-3 py-2 text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-bold">
          Toy Modules
        </div>
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3 py-2.5 rounded-md text-xs font-medium transition-all ${
                isActive
                  ? 'bg-white text-black font-semibold shadow-sm'
                  : 'text-zinc-300 hover:text-white hover:bg-[#202020]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-black' : 'text-zinc-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                    isActive
                      ? 'bg-black text-white font-bold'
                      : 'bg-[#2a2a2a] text-zinc-300 border border-[#383838]'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          )
        })}

        <div className="pt-4 px-3 py-2 text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-bold">
          Ecosystem Hubs
        </div>

        <a
          href="https://producertoy.com"
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-between px-3 py-2 rounded-md text-xs text-zinc-400 hover:text-white hover:bg-[#202020] transition"
        >
          <span className="flex items-center gap-2">
            <ExternalLink className="w-3.5 h-3.5" />
            <span>ProducerToy Store</span>
          </span>
          <span className="text-[10px] font-mono text-zinc-600">.com</span>
        </a>

        <a
          href="http://localhost:3001"
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-between px-3 py-2 rounded-md text-xs text-zinc-400 hover:text-white hover:bg-[#202020] transition"
        >
          <span className="flex items-center gap-2">
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Toy Creator Portal</span>
          </span>
          <span className="text-[10px] font-mono text-zinc-600">:3001</span>
        </a>
      </nav>

      {/* Staff Profile Box with Manager Mascot Thumbnail */}
      <div className="p-3 border-t border-[#2a2a2a] bg-[#141414]">
        <div className="flex items-center gap-3 p-2 rounded-md bg-[#181818] border border-[#2a2a2a]">
          <div className="relative w-8 h-8 rounded-full overflow-hidden shrink-0 border border-[#2a2a2a]">
            <Image
              src="/Manager Bear Dashboard Mascot.png"
              alt="Staff Avatar"
              width={32}
              height={32}
              className="object-cover w-full h-full"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-white truncate">{currentStaffName}</div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-mono uppercase text-zinc-400 tracking-wider">
                {currentStaffRole.replace('_', ' ')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
