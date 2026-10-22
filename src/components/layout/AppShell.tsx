'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import { AdminSidebar } from '@/components/layout/AdminSidebar'

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAuthPage =
    pathname === '/login' ||
    pathname === '/forgot-password' ||
    pathname === '/reset-password'

  if (isAuthPage) {
    return <main className="min-h-screen w-full bg-[#121212] flex flex-col">{children}</main>
  }

  return (
    <div className="flex min-h-screen w-full bg-[#121212]">
      {/* Persistent Sticky Sidebar */}
      <AdminSidebar currentStaffRole="super_admin" currentStaffName="Naiem Shaikh" />

      {/* Primary Page Canvas */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen bg-[#121212]">
        {children}
      </div>
    </div>
  )
}
