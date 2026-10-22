import { getSupportTicketsAction } from '@/actions/supportActions'
import { SupportClient } from './SupportClient'
import { AdminHeader } from '@/components/layout/AdminHeader'

export const revalidate = 0

export default async function SupportPage() {
  const result = await getSupportTicketsAction({ page: 1, pageSize: 20 })

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader
        title="Support Helpdesk & Inquiries"
        subtitle="Manage Technical Tickets, Brand Developer Applications & Customer Inquiries"
      />
      <main className="p-8 flex-1">
        <SupportClient
          initialTickets={result.data || []}
          totalTickets={result.total || 0}
        />
      </main>
    </div>
  )
}
