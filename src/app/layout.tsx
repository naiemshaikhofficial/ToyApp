import type { Metadata } from 'next'
import './globals.css'
import { AppShell } from '@/components/layout/AppShell'

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
      <body className="bg-[#121212] text-white antialiased selection:bg-white selection:text-black min-h-screen">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  )
}
