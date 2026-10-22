import type { Metadata } from 'next'
import './globals.css'
import { AdminSidebar } from '@/components/layout/AdminSidebar'

export const metadata: Metadata = {
  title: 'Toy App | Central Operations & Creator Marketplace',
  description: 'Master Brand Governance, Catalog Management, Staff Roles, Invoices & Sales for ProducerToy',
  icons: {
    icon: [
      { url: '/Manager Bear Dashboard Mascot.png', href: '/Manager Bear Dashboard Mascot.png' },
    ],
    shortcut: '/Manager Bear Dashboard Mascot.png',
    apple: '/Manager Bear Dashboard Mascot.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#121212] text-white flex min-h-screen antialiased selection:bg-white selection:text-black">
        {/* Persistent Sticky Sidebar */}
        <AdminSidebar currentStaffRole="super_admin" currentStaffName="Naiem Shaikh" />

        {/* Primary Page Canvas */}
        <div className="flex-1 flex flex-col min-w-0 min-h-screen bg-[#121212]">
          {children}
        </div>
      </body>
    </html>
  )
}
