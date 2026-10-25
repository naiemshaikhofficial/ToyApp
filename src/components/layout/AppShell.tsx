'use client'

import React, { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { AdminSidebar } from '@/components/layout/AdminSidebar'
import { createClient } from '@/lib/supabase/client'

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [staffInfo, setStaffInfo] = useState<{ name: string; role: string }>({
    name: 'Administrator',
    role: 'super_admin',
  })

  useEffect(() => {
    async function loadStaffProfile() {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data: staff } = await supabase
            .from('admin_staff')
            .select('full_name, role')
            .eq('email', user.email?.toLowerCase().trim() || '')
            .maybeSingle()

          if (staff) {
            setStaffInfo({
              name: staff.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Staff',
              role: staff.role || 'super_admin',
            })
          } else {
            setStaffInfo({
              name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Staff Member',
              role: 'super_admin',
            })
          }
        }
      } catch (e) {
        console.warn('Error loading staff profile for sidebar:', e)
      }
    }
    loadStaffProfile()
  }, [])

  const isAuthPage =
    pathname === '/login' ||
    pathname === '/forgot-password' ||
    pathname === '/reset-password'

  if (isAuthPage) {
    return <main className="min-h-screen w-full bg-[#121212] flex flex-col">{children}</main>
  }

  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-[#121212] overflow-hidden">
      {/* Persistent Aceternity Expandable Sidebar */}
      <AdminSidebar currentStaffRole={staffInfo.role} currentStaffName={staffInfo.name} />

      {/* Primary Page Canvas */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto bg-[#121212]">
        {children}
      </div>
    </div>
  )
}
