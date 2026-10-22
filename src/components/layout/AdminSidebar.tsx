'use client'

import React, { useState, useMemo, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Building2,
  Package,
  Receipt,
  FileSpreadsheet,
  Wallet,
  ShieldCheck,
  Users,
  LifeBuoy,
  Newspaper,
  BookOpen,
  Search,
  ExternalLink,
  LogOut,
  X,
  PlusCircle,
  Key,
  Shield,
  Tag,
  Star,
  DownloadCloud,
  MessageSquare,
  Activity,
  PanelLeftClose,
  PanelLeft,
  Settings,
  CreditCard,
  Globe,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface AdminSidebarProps {
  currentStaffRole?: string
  currentStaffName?: string
}

type NavSectionId =
  | 'overview'
  | 'brands'
  | 'products'
  | 'orders'
  | 'finance'
  | 'licenses'
  | 'users'
  | 'editorial'
  | 'support'
  | 'settings'

interface SubMenuItem {
  label: string
  href: string
  icon: React.ElementType
  badge?: string
  isAction?: boolean
}

interface SectionConfig {
  id: NavSectionId
  label: string
  icon: React.ElementType
  defaultHref: string
  headerTitle: string
  subItems: SubMenuItem[]
}

// 100% ProducerToy domain sections - no raw Supabase DB tables
const SECTIONS: SectionConfig[] = [
  {
    id: 'overview',
    label: 'Overview',
    icon: LayoutDashboard,
    defaultHref: '/',
    headerTitle: 'Command Center',
    subItems: [
      { label: 'Executive Dashboard', href: '/', icon: LayoutDashboard },
      { label: 'Live Sales & Charts', href: '/#charts', icon: Activity },
      { label: 'Recent Orders', href: '/orders', icon: Receipt },
      { label: 'Live Activity Feed', href: '/#feed', icon: Activity },
    ],
  },
  {
    id: 'brands',
    label: 'Brands',
    icon: Building2,
    defaultHref: '/brands',
    headerTitle: 'Brand Management',
    subItems: [
      { label: 'Brands', href: '/brands', icon: Building2, badge: '303+' },
      { label: 'Onboard Brand', href: '/brands?action=new', icon: PlusCircle, isAction: true },
      { label: 'Brand Verification', href: '/brands?tab=verification', icon: ShieldCheck, badge: 'Review' },
    ],
  },
  {
    id: 'products',
    label: 'Products',
    icon: Package,
    defaultHref: '/products',
    headerTitle: 'Product Catalog',
    subItems: [
      { label: 'All Products', href: '/products', icon: Package },
      { label: 'Add Product', href: '/products?action=new', icon: PlusCircle, isAction: true },
      { label: 'Audio Assets & Stems', href: '/products', icon: DownloadCloud },
      { label: 'Categories & Tags', href: '/products', icon: Tag },
      { label: 'Customer Reviews', href: '/products', icon: Star },
    ],
  },
  {
    id: 'orders',
    label: 'Orders',
    icon: Receipt,
    defaultHref: '/orders',
    headerTitle: 'Sales & Orders',
    subItems: [
      { label: 'All Orders', href: '/orders', icon: Receipt, badge: 'Live' },
      { label: 'Customer Invoices', href: '/invoices', icon: FileSpreadsheet },
      { label: 'Customer Purchases', href: '/orders', icon: Receipt },
    ],
  },
  {
    id: 'finance',
    label: 'Finance',
    icon: Wallet,
    defaultHref: '/payouts',
    headerTitle: 'Finance & Payouts',
    subItems: [
      { label: 'Payouts', href: '/payouts', icon: Wallet, badge: 'Active' },
      { label: 'Tax Invoices', href: '/invoices', icon: FileSpreadsheet },
      { label: 'Revenue Analytics', href: '/payouts', icon: Activity },
    ],
  },
  {
    id: 'licenses',
    label: 'Licenses',
    icon: ShieldCheck,
    defaultHref: '/licenses',
    headerTitle: 'Licenses & DRM',
    subItems: [
      { label: 'Serial Key Vaults', href: '/licenses', icon: Key },
      { label: 'Device Activations', href: '/licenses', icon: ShieldCheck },
      { label: 'Machine Seat Limits', href: '/licenses', icon: Shield },
    ],
  },
  {
    id: 'users',
    label: 'Users',
    icon: Users,
    defaultHref: '/users',
    headerTitle: 'Customer Accounts',
    subItems: [
      { label: 'Registered Profiles', href: '/users', icon: Users, badge: '9+' },
      { label: 'Customer Purchases', href: '/orders', icon: Receipt },
      { label: 'Data Consents', href: '/users', icon: Shield },
    ],
  },
  {
    id: 'editorial',
    label: 'Editorial',
    icon: BookOpen,
    defaultHref: '/news',
    headerTitle: 'Editorial & News',
    subItems: [
      { label: 'Audio News (Turso)', href: '/news', icon: Newspaper, badge: '160+' },
      { label: 'Editorial Blogs', href: '/blogs', icon: BookOpen, badge: '12' },
      { label: 'Draft Article', href: '/blogs?action=new', icon: PlusCircle, isAction: true },
    ],
  },
  {
    id: 'support',
    label: 'Support',
    icon: LifeBuoy,
    defaultHref: '/support',
    headerTitle: 'Support Helpdesk',
    subItems: [
      { label: 'All Tickets', href: '/support', icon: LifeBuoy, badge: '2 Open' },
      { label: 'Escalated Tickets', href: '/support?filter=escalated', icon: MessageSquare },
      { label: 'Customer Inquiries', href: '/support', icon: Users },
    ],
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    defaultHref: '/staff',
    headerTitle: 'Platform Settings',
    subItems: [
      { label: 'Staff & Roles', href: '/staff', icon: Users, badge: 'Admin' },
      { label: 'Audit Logs', href: '/staff?tab=audit', icon: Activity },
      { label: 'Platform Security', href: '/staff?tab=security', icon: Shield },
    ],
  },
]

export function AdminSidebar({
  currentStaffRole = 'super_admin',
  currentStaffName = 'Naiem Shaikh',
}: AdminSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  const detectSection = (path: string): NavSectionId => {
    if (path === '/') return 'overview'
    if (path.startsWith('/brands')) return 'brands'
    if (path.startsWith('/products')) return 'products'
    if (path.startsWith('/orders')) return 'orders'
    if (path.startsWith('/invoices') || path.startsWith('/payouts')) return 'finance'
    if (path.startsWith('/licenses')) return 'licenses'
    if (path.startsWith('/users')) return 'users'
    if (path.startsWith('/news') || path.startsWith('/blogs')) return 'editorial'
    if (path.startsWith('/support')) return 'support'
    if (path.startsWith('/staff')) return 'settings'
    return 'overview'
  }

  const [activeSection, setActiveSection] = useState<NavSectionId>(() => detectSection(pathname))
  const [isHovered, setIsHovered] = useState(false)
  const [isPinned, setIsPinned] = useState(true) // Open by default
  const [searchQuery, setSearchQuery] = useState('')

  const leaveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    setActiveSection(detectSection(pathname))
  }, [pathname])

  const handleMouseEnter = () => {
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current)
      leaveTimeoutRef.current = null
    }
    setIsHovered(true)
  }

  const handleMouseLeave = () => {
    leaveTimeoutRef.current = setTimeout(() => {
      setIsHovered(false)
    }, 150)
  }

  const handleSignOut = async () => {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push('/login')
      router.refresh()
    } catch (err) {
      console.error('Sign out error:', err)
      router.push('/login')
    }
  }

  const currentConfig = useMemo(() => {
    return SECTIONS.find((s) => s.id === activeSection) || SECTIONS[0]
  }, [activeSection])

  const filteredSubItems = useMemo(() => {
    if (!searchQuery.trim()) return currentConfig.subItems
    return currentConfig.subItems.filter((item) =>
      item.label.toLowerCase().includes(searchQuery.toLowerCase().trim())
    )
  }, [currentConfig, searchQuery])

  const isPanelVisible = isPinned || isHovered

  const handleItemClick = (item: SubMenuItem) => {
    if (item.href.includes('action=new') && pathname === '/brands') {
      window.dispatchEvent(new CustomEvent('toy-onboard-brand'))
    }
  }

  return (
    <aside
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative shrink-0 min-h-screen sticky top-0 h-screen z-40 select-none flex transition-[width] duration-200 ease-out ${
        isPinned ? 'w-[316px]' : 'w-[56px]'
      }`}
    >
      {/* =========================================================================
          TIER 1: Primary Icon Rail (56px) - Clean, prominent, easy to click
         ========================================================================= */}
      <div className="w-[56px] bg-[#101010] border-r border-[#242424] flex flex-col items-center justify-between py-3.5 shrink-0 h-full z-20">
        {/* Top: ProducerToy Mascot */}
        <div className="flex flex-col items-center gap-3.5">
          <Link
            href="/"
            title="Toy App Home"
            onClick={() => {
              setActiveSection('overview')
              setIsPinned(true)
            }}
            className="w-9 h-9 flex items-center justify-center hover:opacity-85 transition"
          >
            <Image
              src="/Manager Bear Dashboard Mascot.png"
              alt="Toy Mascot"
              width={32}
              height={32}
              className="w-8 h-8 object-contain"
              priority
            />
          </Link>

          {/* Clean divider */}
          <div className="w-6 h-px bg-[#262626]" />

          {/* Rail Navigation Icons */}
          <div className="flex flex-col items-center gap-1.5">
            {SECTIONS.map((sec) => {
              const Icon = sec.icon
              const isActive = activeSection === sec.id

              return (
                <Link
                  key={sec.id}
                  href={sec.defaultHref}
                  onClick={() => {
                    setActiveSection(sec.id)
                    setIsPinned(true) // Stays open when clicked
                  }}
                  onMouseEnter={() => {
                    if (!isPinned) {
                      setActiveSection(sec.id)
                    }
                  }}
                  title={sec.label}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors relative group ${
                    isActive
                      ? 'bg-[#222222] text-white shadow-inner border border-white/10'
                      : 'text-zinc-400 hover:text-white hover:bg-[#181818]'
                  }`}
                >
                  <Icon className="w-4.5 h-4.5" />
                  {isActive && (
                    <span className="absolute -left-1 top-1/2 -translate-y-1/2 w-1.5 h-4.5 bg-white rounded-r-full shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
                  )}

                  {/* Clean Tooltip on hover when collapsed */}
                  {!isPanelVisible && (
                    <span className="absolute left-14 px-2.5 py-1 bg-[#181818] text-white text-xs font-medium rounded-md shadow-xl border border-[#2a2a2a] whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
                      {sec.label}
                    </span>
                  )}
                </Link>
              )
            })}
          </div>
        </div>

        {/* Bottom Rail Actions */}
        <div className="flex flex-col items-center gap-2">
          {/* External Store Link */}
          <a
            href="https://producertoy.com"
            target="_blank"
            rel="noreferrer"
            title="Open ProducerToy Store"
            className="w-10 h-10 rounded-xl flex items-center justify-center text-zinc-400 hover:text-white hover:bg-[#181818] transition relative group"
          >
            <ExternalLink className="w-4 h-4" />
            {!isPanelVisible && (
              <span className="absolute left-14 px-2.5 py-1 bg-[#181818] text-white text-xs rounded-md shadow-xl border border-[#2a2a2a] whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
                ProducerToy.com
              </span>
            )}
          </a>

          {/* Collapse/Expand Toggle Button */}
          <button
            onClick={() => setIsPinned(!isPinned)}
            title={isPinned ? 'Collapse Sidebar' : 'Expand Sidebar'}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-zinc-400 hover:text-white hover:bg-[#181818] transition"
          >
            {isPinned ? <PanelLeftClose className="w-4.5 h-4.5" /> : <PanelLeft className="w-4.5 h-4.5" />}
          </button>

          {/* Staff Sign Out */}
          <button
            onClick={handleSignOut}
            title={`Sign Out (${currentStaffName})`}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-zinc-400 hover:text-white hover:bg-[#181818] transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* =========================================================================
          TIER 2: Sub-Panel (260px) - Spacious, clear, prominent text
         ========================================================================= */}
      <div
        className={`w-[260px] bg-[#141414] border-r border-[#262626] flex flex-col shrink-0 h-screen overflow-hidden transition-all duration-200 ease-out ${
          isPinned
            ? 'relative opacity-100 translate-x-0'
            : isHovered
            ? 'absolute left-[56px] top-0 bottom-0 z-30 shadow-[12px_0_35px_rgba(0,0,0,0.8)] opacity-100 translate-x-0'
            : 'absolute left-[56px] top-0 bottom-0 z-30 opacity-0 -translate-x-3 pointer-events-none'
        }`}
      >
        {/* Header Title */}
        <div className="h-14 px-4 flex items-center justify-between border-b border-[#242424] bg-[#121212]">
          <div className="flex items-center gap-2.5">
            <span className="text-sm font-bold text-white tracking-tight">
              {currentConfig.headerTitle}
            </span>
            <span className="text-[11px] font-mono px-2 py-0.5 bg-[#202020] text-zinc-300 border border-[#2e2e2e] rounded-md font-semibold">
              {currentConfig.subItems.length}
            </span>
          </div>

          <button
            onClick={() => setIsPinned(false)}
            title="Collapse Sidebar"
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-[#1f1f1f] transition"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        </div>

        {/* Scope Pill */}
        <div className="px-4 py-2.5 border-b border-[#242424] bg-[#141414] flex items-center justify-between text-xs font-mono">
          <span className="text-zinc-500 uppercase tracking-wider text-[11px] font-semibold">
            scope {activeSection}
          </span>
          <span className="text-zinc-400 text-[11px] font-medium">Toy App</span>
        </div>

        {/* Search Box */}
        <div className="p-3 border-b border-[#242424]">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#181818] border border-[#2a2a2a] focus:border-zinc-400 rounded-lg px-3 pl-9 pr-8 py-2 text-xs text-white placeholder-zinc-500 outline-none transition font-sans"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 text-zinc-400 hover:text-white p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Navigation Items */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredSubItems.length === 0 ? (
            <div className="py-10 px-4 text-center">
              <p className="text-xs text-zinc-500">No items found</p>
            </div>
          ) : (
            filteredSubItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => handleItemClick(item)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs transition group ${
                    isActive
                      ? 'bg-[#222222] text-white font-semibold border-l-2 border-white'
                      : 'text-zinc-400 hover:text-white hover:bg-[#1a1a1a]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        isActive ? 'text-white' : 'text-zinc-500 group-hover:text-zinc-300'
                      }`}
                    />
                    <span className="truncate text-xs font-medium">{item.label}</span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {item.badge && (
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-[#202020] text-zinc-300 border border-[#2e2e2e]">
                        {item.badge}
                      </span>
                    )}
                    {item.isAction ? (
                      <span className="text-[10px] font-mono text-zinc-400 uppercase font-bold">+new</span>
                    ) : (
                      <Globe className="w-3.5 h-3.5 text-zinc-600 group-hover:text-zinc-400" />
                    )}
                  </div>
                </Link>
              )
            })
          )}
        </div>

        {/* Bottom Footer Details */}
        <div className="h-11 px-4 border-t border-[#242424] bg-[#111111] flex items-center justify-between text-xs text-zinc-500 font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-white" />
            <span className="text-zinc-400">connected</span>
          </div>
          <span className="text-zinc-400 capitalize">{currentStaffRole.replace('_', ' ')}</span>
        </div>
      </div>
    </aside>
  )
}
