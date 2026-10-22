'use client'

import React, { useState, useMemo, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Table2,
  Building2,
  Package,
  Receipt,
  FileSpreadsheet,
  Wallet,
  ShieldCheck,
  Users,
  Users2,
  LifeBuoy,
  Newspaper,
  BookOpen,
  Search,
  ChevronDown,
  Globe,
  ExternalLink,
  LogOut,
  X,
  PlusCircle,
  Key,
  Shield,
  CreditCard,
  Tag,
  Star,
  DownloadCloud,
  MessageSquare,
  Activity,
  PanelLeftClose,
  PanelLeft,
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
  | 'finance'
  | 'licenses'
  | 'users'
  | 'editorial'
  | 'support'
  | 'staff'
  | 'tables'

interface SubMenuItem {
  label: string
  href: string
  icon: React.ElementType
  badge?: string
  isAction?: boolean
  onClickAction?: () => void
}

interface SectionConfig {
  id: NavSectionId
  label: string
  icon: React.ElementType
  defaultHref: string
  headerTitle: string
  subItems: SubMenuItem[]
}

// Supabase raw database tables
const RAW_TABLES = [
  { name: 'activation_challenges', href: '/licenses', schema: 'public' },
  { name: 'admin_audit_logs', href: '/staff', schema: 'auth' },
  { name: 'admin_staff', href: '/staff', schema: 'auth', badge: 'Admin' },
  { name: 'blogs', href: '/blogs', schema: 'public', badge: '12' },
  { name: 'brand_invites', href: '/brands', schema: 'public' },
  { name: 'brand_members', href: '/brands', schema: 'public' },
  { name: 'brands', href: '/brands', schema: 'public', badge: '303+' },
  { name: 'categories', href: '/products', schema: 'public' },
  { name: 'coupons', href: '/products', schema: 'public' },
  { name: 'customer_data_consents', href: '/users', schema: 'auth' },
  { name: 'device_activations', href: '/licenses', schema: 'public' },
  { name: 'invoices', href: '/invoices', schema: 'public' },
  { name: 'orders', href: '/orders', schema: 'public', badge: 'Live' },
  { name: 'payouts', href: '/payouts', schema: 'public', badge: '70/30' },
  { name: 'product_downloads', href: '/products', schema: 'public' },
  { name: 'product_reviews', href: '/products', schema: 'public' },
  { name: 'products', href: '/products', schema: 'public' },
  { name: 'profiles', href: '/users', schema: 'public', badge: '9+' },
  { name: 'purchases', href: '/orders', schema: 'public' },
  { name: 'reward_transactions', href: '/payouts', schema: 'public' },
  { name: 'serial_keys', href: '/licenses', schema: 'public' },
  { name: 'subcategories', href: '/products', schema: 'public' },
  { name: 'support_tickets', href: '/support', schema: 'public', badge: '2' },
  { name: 'ticket_messages', href: '/support', schema: 'public' },
  { name: 'turso_news', href: '/news', schema: 'edge', badge: '160+' },
  { name: 'wishlists', href: '/products', schema: 'public' },
]

// Working sub-items for each section
const SECTIONS: SectionConfig[] = [
  {
    id: 'overview',
    label: 'Overview',
    icon: LayoutDashboard,
    defaultHref: '/',
    headerTitle: 'Toy Overview',
    subItems: [
      { label: 'Command Center', href: '/', icon: LayoutDashboard },
      { label: 'Ecosystem Metrics', href: '/#metrics', icon: Activity },
      { label: 'Escalation Decks', href: '/#actions', icon: ShieldCheck, badge: 'Active' },
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
      { label: 'All Verified Brands', href: '/brands', icon: Building2, badge: '303+' },
      { label: 'Onboard New Brand', href: '/brands?action=new', icon: PlusCircle, isAction: true },
      { label: 'Brand DRM & API Keys', href: '/licenses', icon: Key },
      { label: '70/30 Payout Splits', href: '/payouts', icon: Wallet, badge: '70/30' },
      { label: 'Brand Members & Roles', href: '/staff', icon: Users },
    ],
  },
  {
    id: 'products',
    label: 'Products',
    icon: Package,
    defaultHref: '/products',
    headerTitle: 'Product Catalog',
    subItems: [
      { label: 'All Audio Products', href: '/products', icon: Package },
      { label: 'Categories & Filters', href: '/products', icon: Tag },
      { label: 'Downloads & Stems', href: '/products', icon: DownloadCloud },
      { label: 'Customer Reviews', href: '/products', icon: Star },
    ],
  },
  {
    id: 'finance',
    label: 'Finance',
    icon: Receipt,
    defaultHref: '/orders',
    headerTitle: 'Finance & Orders',
    subItems: [
      { label: 'Live Sales & Orders', href: '/orders', icon: Receipt, badge: 'Live' },
      { label: 'Tax & GST Invoices', href: '/invoices', icon: FileSpreadsheet },
      { label: 'Creator Payouts', href: '/payouts', icon: Wallet, badge: '70/30' },
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
      { label: 'Hardware Activations', href: '/licenses', icon: ShieldCheck },
      { label: 'Device Challenges', href: '/licenses', icon: Activity },
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
      { label: 'Editorial Blogs (CMS)', href: '/blogs', icon: BookOpen, badge: '12' },
      { label: 'Draft New Article', href: '/blogs?action=new', icon: PlusCircle, isAction: true },
      { label: 'Turso Edge Deals', href: '/news', icon: Activity },
    ],
  },
  {
    id: 'support',
    label: 'Support',
    icon: LifeBuoy,
    defaultHref: '/support',
    headerTitle: 'Support Helpdesk',
    subItems: [
      { label: 'All Support Tickets', href: '/support', icon: LifeBuoy, badge: '2 Open' },
      { label: 'Escalated to Creator', href: '/support', icon: MessageSquare },
      { label: 'Customer Inquiries', href: '/support', icon: Users },
    ],
  },
  {
    id: 'staff',
    label: 'Staff',
    icon: Users2,
    defaultHref: '/staff',
    headerTitle: 'Staff & Security',
    subItems: [
      { label: 'Staff & RBAC Roles', href: '/staff', icon: Users2, badge: 'Admin' },
      { label: 'Admin Audit Logs', href: '/staff', icon: Activity },
    ],
  },
  {
    id: 'tables',
    label: 'Tables',
    icon: Table2,
    defaultHref: '/brands',
    headerTitle: 'Table Editor',
    subItems: [],
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
    if (path.startsWith('/orders') || path.startsWith('/invoices') || path.startsWith('/payouts'))
      return 'finance'
    if (path.startsWith('/licenses')) return 'licenses'
    if (path.startsWith('/users')) return 'users'
    if (path.startsWith('/news') || path.startsWith('/blogs')) return 'editorial'
    if (path.startsWith('/support')) return 'support'
    if (path.startsWith('/staff')) return 'staff'
    return 'tables'
  }

  const [activeSection, setActiveSection] = useState<NavSectionId>(() => detectSection(pathname))
  const [isHovered, setIsHovered] = useState(false)
  const [isPinned, setIsPinned] = useState(true) // Open by default like Supabase
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSchema, setSelectedSchema] = useState<'public' | 'edge' | 'auth'>('public')
  const [schemaDropdownOpen, setSchemaDropdownOpen] = useState(false)

  const leaveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Sync active section when path changes
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
      setSchemaDropdownOpen(false)
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

  const isTableEditor = activeSection === 'tables'

  const filteredTables = useMemo(() => {
    return RAW_TABLES.filter((t) => {
      const matchesSchema = selectedSchema === 'public' ? true : t.schema === selectedSchema
      const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
      return matchesSchema && matchesSearch
    })
  }, [selectedSchema, searchQuery])

  const filteredSubItems = useMemo(() => {
    if (!searchQuery.trim()) return currentConfig.subItems
    return currentConfig.subItems.filter((item) =>
      item.label.toLowerCase().includes(searchQuery.toLowerCase().trim())
    )
  }, [currentConfig, searchQuery])

  const isPanelVisible = isPinned || isHovered

  // Handle clicking on an action (like Onboard New Brand)
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
        isPinned ? 'w-[292px]' : 'w-[52px]'
      }`}
    >
      {/* =========================================================================
          TIER 1: Thin Icon Rail (~52px)
         ========================================================================= */}
      <div className="w-[52px] bg-[#101010] border-r border-[#202020] flex flex-col items-center justify-between py-3 shrink-0 h-full z-20">
        {/* Top: ProducerToy Mascot */}
        <div className="flex flex-col items-center gap-3">
          <Link
            href="/"
            title="Toy App Home"
            onClick={() => {
              setActiveSection('overview')
              setIsPinned(true)
            }}
            className="w-8 h-8 flex items-center justify-center hover:opacity-80 transition"
          >
            <Image
              src="/Manager Bear Dashboard Mascot.png"
              alt="Toy Mascot"
              width={28}
              height={28}
              className="w-7 h-7 object-contain"
              priority
            />
          </Link>

          {/* Thin separator */}
          <div className="w-5 h-px bg-[#242424]" />

          {/* Rail Navigation Icons */}
          <div className="flex flex-col items-center gap-1">
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
                  className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors relative group ${
                    isActive
                      ? 'bg-[#222222] text-white shadow-inner'
                      : 'text-zinc-400 hover:text-white hover:bg-[#1a1a1a]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {isActive && (
                    <span className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-1 h-4 bg-white rounded-r-full" />
                  )}

                  {/* Tooltip on Hover when sub-panel is closed */}
                  {!isPanelVisible && (
                    <span className="absolute left-12 px-2 py-1 bg-[#181818] text-white text-[11px] font-medium rounded shadow-lg border border-[#2a2a2a] whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
                      {sec.label}
                    </span>
                  )}
                </Link>
              )
            })}
          </div>
        </div>

        {/* Bottom Rail Actions */}
        <div className="flex flex-col items-center gap-1.5">
          {/* External Store Link */}
          <a
            href="https://producertoy.com"
            target="_blank"
            rel="noreferrer"
            title="Open ProducerToy Store"
            className="w-9 h-9 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white hover:bg-[#1a1a1a] transition relative group"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            {!isPanelVisible && (
              <span className="absolute left-12 px-2 py-1 bg-[#181818] text-white text-[11px] rounded shadow-lg border border-[#2a2a2a] whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
                ProducerToy.com
              </span>
            )}
          </a>

          {/* Collapse/Expand Toggle Button (Exact Supabase Bottom Button) */}
          <button
            onClick={() => setIsPinned(!isPinned)}
            title={isPinned ? 'Collapse Panel' : 'Expand Panel'}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white hover:bg-[#1a1a1a] transition"
          >
            {isPinned ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeft className="w-4 h-4" />}
          </button>

          {/* Staff Sign Out */}
          <button
            onClick={handleSignOut}
            title={`Sign Out (${currentStaffName})`}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white hover:bg-[#1a1a1a] transition"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* =========================================================================
          TIER 2: Sub-Panel (~240px) - Visible when Pinned or on Hover
         ========================================================================= */}
      <div
        className={`w-60 bg-[#141414] border-r border-[#222222] flex flex-col shrink-0 h-screen overflow-hidden transition-all duration-200 ease-out ${
          isPinned
            ? 'relative opacity-100 translate-x-0'
            : isHovered
            ? 'absolute left-[52px] top-0 bottom-0 z-30 shadow-[10px_0_30px_rgba(0,0,0,0.7)] opacity-100 translate-x-0'
            : 'absolute left-[52px] top-0 bottom-0 z-30 opacity-0 -translate-x-3 pointer-events-none'
        }`}
      >
        {/* Header Title */}
        <div className="h-12 px-3.5 flex items-center justify-between border-b border-[#202020] bg-[#121212]">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-white tracking-tight">
              {currentConfig.headerTitle}
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 bg-[#202020] text-zinc-400 border border-[#2a2a2a] rounded">
              {isTableEditor ? filteredTables.length : currentConfig.subItems.length}
            </span>
          </div>

          <button
            onClick={() => setIsPinned(false)}
            title="Collapse Sidebar"
            className="p-1 rounded text-zinc-500 hover:text-white hover:bg-[#1f1f1f] transition"
          >
            <PanelLeftClose className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Scope Selector (If Table Editor) OR Quick Switcher */}
        {isTableEditor ? (
          <div className="p-2.5 border-b border-[#202020] relative">
            <button
              onClick={() => setSchemaDropdownOpen(!schemaDropdownOpen)}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded bg-[#1a1a1a] border border-[#2a2a2a] hover:border-zinc-600 text-xs text-zinc-200 transition"
            >
              <div className="flex items-center gap-1.5 truncate">
                <span className="text-zinc-500 text-[11px] font-mono">schema</span>
                <span className="font-medium text-white truncate font-mono text-[11px]">
                  {selectedSchema}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
            </button>

            {/* Schema Dropdown */}
            {schemaDropdownOpen && (
              <div className="absolute top-11 left-2.5 right-2.5 bg-[#181818] border border-[#2a2a2a] rounded shadow-xl py-1 z-30">
                {(['public', 'edge', 'auth'] as const).map((sch) => (
                  <button
                    key={sch}
                    onClick={() => {
                      setSelectedSchema(sch)
                      setSchemaDropdownOpen(false)
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs font-mono flex items-center justify-between ${
                      selectedSchema === sch
                        ? 'bg-white text-black font-semibold'
                        : 'text-zinc-300 hover:bg-[#242424] hover:text-white'
                    }`}
                  >
                    <span>schema {sch}</span>
                    <span className="text-[10px] text-zinc-400">
                      {sch === 'public' ? 'Postgres' : sch === 'edge' ? 'Turso' : 'Security'}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="px-3 py-2 border-b border-[#202020] bg-[#141414] flex items-center justify-between text-[10px] font-mono">
            <span className="text-zinc-500 uppercase">scope {activeSection}</span>
            <button
              onClick={() => setActiveSection('tables')}
              title="View All Database Tables"
              className="text-zinc-400 hover:text-white transition flex items-center gap-1"
            >
              <Table2 className="w-3 h-3" />
              <span>All Tables</span>
            </button>
          </div>
        )}

        {/* Search Box */}
        <div className="p-2.5 border-b border-[#202020]">
          <div className="relative flex items-center">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder={isTableEditor ? 'Search tables...' : 'Search items...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#181818] border border-[#282828] focus:border-zinc-500 rounded px-2.5 pl-8 pr-7 py-1 text-xs text-white placeholder-zinc-500 outline-none transition font-mono"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 text-zinc-400 hover:text-white p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Navigation / Table List */}
        <div className="flex-1 overflow-y-auto p-1.5 space-y-0.5">
          {isTableEditor ? (
            filteredTables.length === 0 ? (
              <div className="py-8 px-3 text-center">
                <p className="text-xs text-zinc-500">No tables matching</p>
                <p className="text-[10px] text-zinc-600 font-mono mt-0.5">
                  &quot;{searchQuery}&quot;
                </p>
              </div>
            ) : (
              filteredTables.map((tbl) => {
                const isActive = pathname === tbl.href
                return (
                  <Link
                    key={tbl.name}
                    href={tbl.href}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded text-xs transition group ${
                      isActive
                        ? 'bg-[#222222] text-white font-medium border-l-2 border-white'
                        : 'text-zinc-400 hover:text-white hover:bg-[#1a1a1a]'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Table2
                        className={`w-3.5 h-3.5 shrink-0 ${
                          isActive ? 'text-white' : 'text-zinc-500 group-hover:text-zinc-300'
                        }`}
                      />
                      <span className="truncate font-mono text-[11px]">{tbl.name}</span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {tbl.badge && (
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#202020] text-zinc-300 border border-[#2e2e2e]">
                          {tbl.badge}
                        </span>
                      )}
                      <Globe className="w-3 h-3 text-zinc-600 group-hover:text-zinc-400" />
                    </div>
                  </Link>
                )
              })
            )
          ) : filteredSubItems.length === 0 ? (
            <div className="py-8 px-3 text-center">
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
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded text-xs transition group ${
                    isActive
                      ? 'bg-[#222222] text-white font-medium border-l-2 border-white'
                      : 'text-zinc-400 hover:text-white hover:bg-[#1a1a1a]'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Icon
                      className={`w-3.5 h-3.5 shrink-0 ${
                        isActive ? 'text-white' : 'text-zinc-500 group-hover:text-zinc-300'
                      }`}
                    />
                    <span className="truncate text-xs">{item.label}</span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {item.badge && (
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#202020] text-zinc-300 border border-[#2e2e2e]">
                        {item.badge}
                      </span>
                    )}
                    {item.isAction ? (
                      <span className="text-[9px] font-mono text-zinc-500 uppercase">+new</span>
                    ) : (
                      <Globe className="w-3 h-3 text-zinc-600 group-hover:text-zinc-400" />
                    )}
                  </div>
                </Link>
              )
            })
          )}
        </div>

        {/* Bottom Footer Details */}
        <div className="h-10 px-3 border-t border-[#202020] bg-[#111111] flex items-center justify-between text-[10px] text-zinc-500 font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-white" />
            <span>connected</span>
          </div>
          <span className="text-zinc-500">{currentStaffRole.replace('_', ' ')}</span>
        </div>
      </div>
    </aside>
  )
}
