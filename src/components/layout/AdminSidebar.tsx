'use client'

import React, { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import {
  Sidebar as AceternitySidebar,
  SidebarBody,
  SidebarLink,
  useSidebar,
} from '@/components/ui/sidebar'
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
  Activity,
  Settings,
  Disc,
  Music,
  CheckCircle,
  RotateCcw,
  Percent,
  Ticket,
  MessageSquare,
  Pin,
  PinOff,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { motion, AnimatePresence } from 'motion/react'

export interface AdminSidebarProps {
  currentStaffRole?: string
  currentStaffName?: string
}

export interface SubMenuItem {
  label: string
  href: string
  icon: React.ElementType
}

export interface AdminSectionConfig {
  id: string
  label: string
  defaultHref: string
  icon: React.ElementType
  subItems: SubMenuItem[]
}

export const ADMIN_SECTIONS: AdminSectionConfig[] = [
  {
    id: 'overview',
    label: 'Overview',
    defaultHref: '/',
    icon: LayoutDashboard,
    subItems: [],
  },
  {
    id: 'brands',
    label: 'Brands',
    defaultHref: '/brands',
    icon: Building2,
    subItems: [
      { label: 'All Brands', href: '/brands', icon: Building2 },
      { label: 'Onboard Brand', href: '/brands?action=new', icon: PlusCircle },
      { label: 'Verification', href: '/brands?tab=verification', icon: ShieldCheck },
    ],
  },
  {
    id: 'products',
    label: 'Products',
    defaultHref: '/products',
    icon: Package,
    subItems: [
      { label: 'All Products', href: '/products', icon: Package },
      { label: 'Audio Plugins', href: '/products?type=plugin', icon: Disc },
      { label: 'Sample Packs', href: '/products?type=sample_pack', icon: Music },
      { label: 'Add Product', href: '/products?action=new', icon: PlusCircle },
    ],
  },
  {
    id: 'coupons',
    label: 'Offers & Discounts',
    defaultHref: '/coupons',
    icon: Tag,
    subItems: [
      { label: 'All Coupons & Deals', href: '/coupons', icon: Tag },
      { label: 'Product Discounts', href: '/coupons?tab=discounts', icon: Percent },
      { label: 'Coupon Codes', href: '/coupons?tab=codes', icon: Ticket },
      { label: 'Create New Offer', href: '/coupons?action=new', icon: PlusCircle },
    ],
  },
  {
    id: 'orders',
    label: 'Orders',
    defaultHref: '/orders',
    icon: Receipt,
    subItems: [
      { label: 'All Orders', href: '/orders', icon: Receipt },
      { label: 'Completed Sales', href: '/orders?status=completed', icon: CheckCircle },
      { label: 'Refunds & Issues', href: '/orders?status=refunded', icon: RotateCcw },
      { label: 'Invoices & Receipts', href: '/invoices', icon: FileSpreadsheet },
    ],
  },
  {
    id: 'finance',
    label: 'Finance',
    defaultHref: '/payouts',
    icon: Wallet,
    subItems: [
      { label: 'Payouts', href: '/payouts', icon: Wallet },
      { label: 'Tax Invoices', href: '/invoices', icon: FileSpreadsheet },
      { label: 'Revenue Analytics', href: '/payouts', icon: Activity },
    ],
  },
  {
    id: 'licenses',
    label: 'Licenses',
    defaultHref: '/licenses',
    icon: ShieldCheck,
    subItems: [
      { label: 'Serial Key Vaults', href: '/licenses', icon: Key },
      { label: 'Device Activations', href: '/licenses', icon: ShieldCheck },
      { label: 'Machine Seat Limits', href: '/licenses', icon: Shield },
    ],
  },
  {
    id: 'users',
    label: 'Users',
    defaultHref: '/users',
    icon: Users,
    subItems: [
      { label: 'Customer Accounts', href: '/users', icon: Users },
      { label: 'Customer Purchases', href: '/orders', icon: Receipt },
      { label: 'Data Consents', href: '/users', icon: Shield },
    ],
  },
  {
    id: 'editorial',
    label: 'Editorial',
    defaultHref: '/news',
    icon: BookOpen,
    subItems: [
      { label: 'Audio Deals & News', href: '/news', icon: Newspaper },
      { label: 'Articles & Guides', href: '/blogs', icon: BookOpen },
      { label: 'Draft Article', href: '/blogs?action=new', icon: PlusCircle },
    ],
  },
  {
    id: 'support',
    label: 'Support',
    defaultHref: '/support',
    icon: LifeBuoy,
    subItems: [
      { label: 'All Tickets', href: '/support', icon: LifeBuoy },
      { label: 'Escalated Tickets', href: '/support?filter=escalated', icon: MessageSquare },
      { label: 'Customer Inquiries', href: '/support', icon: Users },
    ],
  },
  {
    id: 'settings',
    label: 'Settings',
    defaultHref: '/staff',
    icon: Settings,
    subItems: [
      { label: 'Staff & Roles', href: '/staff', icon: Users },
      { label: 'Audit Logs', href: '/staff?tab=audit', icon: Activity },
      { label: 'Platform Security', href: '/staff?tab=security', icon: Shield },
    ],
  },
]

export function AdminSidebar({
  currentStaffRole = 'super_admin',
  currentStaffName = 'Naiem Shaikh',
}: AdminSidebarProps) {
  const [open, setOpen] = useState(false)
  const [isPinned, setIsPinned] = useState(false)

  const effectiveOpen = isPinned || open

  return (
    <AceternitySidebar open={effectiveOpen} setOpen={setOpen} animate={true}>
      <AdminSidebarContent
        currentStaffRole={currentStaffRole}
        currentStaffName={currentStaffName}
        isPinned={isPinned}
        setIsPinned={setIsPinned}
      />
    </AceternitySidebar>
  )
}

function AdminSidebarContent({
  currentStaffRole,
  currentStaffName,
  isPinned,
  setIsPinned,
}: {
  currentStaffRole: string
  currentStaffName: string
  isPinned: boolean
  setIsPinned: React.Dispatch<React.SetStateAction<boolean>>
}) {
  const pathname = usePathname()
  const router = useRouter()
  const { open } = useSidebar()
  const [searchQuery, setSearchQuery] = useState('')

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

  // Filter sections by search query
  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return ADMIN_SECTIONS
    const q = searchQuery.toLowerCase().trim()
    return ADMIN_SECTIONS.filter(
      (sec) =>
        sec.label.toLowerCase().includes(q) ||
        sec.subItems.some((sub) => sub.label.toLowerCase().includes(q))
    )
  }, [searchQuery])

  // Detect active section
  const isSectionActive = (sec: AdminSectionConfig) => {
    if (sec.defaultHref === '/') return pathname === '/'
    if (sec.id === 'finance') return pathname.startsWith('/payouts') || pathname.startsWith('/invoices')
    if (sec.id === 'editorial') return pathname.startsWith('/news') || pathname.startsWith('/blogs')
    return pathname.startsWith(sec.defaultHref)
  }

  return (
    <SidebarBody className="justify-between gap-4 h-full bg-[#101010] border-r border-[#242424] text-white">
      {/* Top Header / Mascot / Navigation */}
      <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto no-scrollbar">
        {/* Mascot Header - Borderless Naked Mascot Rule */}
        <div className="flex items-center justify-between pb-3 border-b border-[#242424] shrink-0">
          <Link
            href="/"
            className="flex items-center gap-2.5 overflow-hidden group/brand py-1"
          >
            {/* Borderless mascot - never enclosed in boxes or background avatars */}
            <div className="w-8 h-8 flex items-center justify-center shrink-0">
              <Image
                src="/Manager Bear Dashboard Mascot.png"
                alt="Toy Mascot"
                width={32}
                height={32}
                className="w-8 h-8 object-contain filter drop-shadow-sm transition-transform group-hover/brand:scale-105"
                priority
              />
            </div>

            <motion.div
              animate={{
                display: open ? 'block' : 'none',
                opacity: open ? 1 : 0,
              }}
              transition={{ duration: 0.15 }}
              className="flex flex-col min-w-0"
            >
              <span className="font-bold text-xs uppercase tracking-tight text-white leading-tight whitespace-nowrap">
                TOY APP
              </span>
              <span className="text-[9px] font-semibold text-zinc-400 uppercase tracking-widest whitespace-nowrap">
                by ProducerToy
              </span>
            </motion.div>
          </Link>

          {/* Desktop Pin Toggle Button */}
          {open && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              type="button"
              onClick={() => setIsPinned(!isPinned)}
              title={isPinned ? 'Unpin sidebar (auto-collapse)' : 'Pin sidebar open'}
              className={`hidden md:flex p-1.5 rounded-lg text-zinc-400 hover:text-white transition ${
                isPinned ? 'bg-[#222222] text-white' : 'hover:bg-[#1a1a1a]'
              }`}
            >
              {isPinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
            </motion.button>
          )}
        </div>

        {/* Scope Pill when open (Monochrome palette) */}
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2.5 px-2.5 py-1.5 rounded-lg bg-[#141414] border border-[#262626] flex items-center justify-between shrink-0"
          >
            <span className="text-[11px] font-medium text-zinc-300 truncate">
              Central Command
            </span>
            <span className="text-[9px] px-1.5 py-0.5 rounded font-mono font-semibold uppercase tracking-wider bg-[#202020] text-zinc-300 border border-[#2e2e2e]">
              Staff
            </span>
          </motion.div>
        )}

        {/* Search Input when open */}
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.15 }}
            className="mt-3 relative shrink-0"
          >
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search admin..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#161616] border border-[#282828] focus:border-zinc-400 rounded-lg pl-8 pr-7 py-1.5 text-xs text-white placeholder-zinc-500 outline-none transition font-sans"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </motion.div>
        )}

        {/* Navigation Items */}
        <div className="mt-3 flex flex-col gap-1 overflow-y-auto no-scrollbar py-1">
          {filteredSections.map((sec) => {
            const Icon = sec.icon
            const isActive = isSectionActive(sec)

            return (
              <div key={sec.id} className="flex flex-col">
                <SidebarLink
                  link={{
                    label: sec.label,
                    href: sec.defaultHref,
                    icon: (
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-colors ${
                          isActive ? 'text-white' : 'text-zinc-400 group-hover/sidebar:text-white'
                        }`}
                      />
                    ),
                  }}
                  isActive={isActive}
                />

                {/* Sub-items when expanded and active */}
                {open && isActive && sec.subItems.length > 0 && !searchQuery && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="ml-6 pl-2.5 my-1 border-l border-[#282828] flex flex-col gap-1"
                  >
                    {sec.subItems.map((sub) => {
                      const SubIcon = sub.icon
                      const isSubActive = pathname === sub.href

                      return (
                        <Link
                          key={sub.label}
                          href={sub.href}
                          onClick={() => {
                            if (sub.href.includes('action=new') && pathname === '/brands') {
                              window.dispatchEvent(new CustomEvent('toy-onboard-brand'))
                            }
                          }}
                          className={`flex items-center gap-2 py-1 px-2 rounded-md text-[11px] transition ${
                            isSubActive
                              ? 'text-white font-medium bg-[#1e1e1e]'
                              : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#161616]'
                          }`}
                        >
                          <SubIcon className="w-3 h-3 shrink-0 text-zinc-500" />
                          <span className="truncate">{sub.label}</span>
                        </Link>
                      )
                    })}
                  </motion.div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Bottom Profile & Actions */}
      <div className="pt-3 border-t border-[#242424] flex flex-col gap-1 shrink-0">
        {/* ProducerToy.com External Link */}
        <SidebarLink
          link={{
            label: 'ProducerToy.com',
            href: 'https://producertoy.com',
            icon: (
              <ExternalLink className="w-4 h-4 shrink-0 text-zinc-400 group-hover/sidebar:text-white" />
            ),
          }}
          target="_blank"
          rel="noreferrer"
        />

        {/* Staff Profile / Sign Out (Absolute Monochrome) */}
        <div className="flex items-center justify-between gap-2 p-1.5 rounded-xl hover:bg-[#161616] transition group">
          <div className="flex items-center gap-2.5 min-w-0 flex-1 overflow-hidden">
            <div className="w-7 h-7 rounded-full bg-[#242424] border border-zinc-600 flex items-center justify-center text-xs font-bold text-white uppercase shrink-0">
              {currentStaffName ? currentStaffName[0] : 'A'}
            </div>

            <motion.div
              animate={{
                display: open ? 'block' : 'none',
                opacity: open ? 1 : 0,
              }}
              transition={{ duration: 0.15 }}
              className="flex flex-col min-w-0"
            >
              <span className="text-xs font-medium text-white truncate max-w-[130px]">
                {currentStaffName}
              </span>
              <span className="text-[10px] text-zinc-400 font-mono capitalize truncate max-w-[130px]">
                {currentStaffRole.replace('_', ' ')}
              </span>
            </motion.div>
          </div>

          {/* Sign Out Button */}
          <button
            type="button"
            onClick={handleSignOut}
            title={`Sign Out (${currentStaffName})`}
            className="p-1.5 text-zinc-400 hover:text-white hover:bg-[#202020] rounded-lg transition shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </SidebarBody>
  )
}
