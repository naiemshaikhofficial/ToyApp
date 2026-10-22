import { Suspense } from 'react'
import { getAdminOrdersAction } from '@/actions/orderActions'
import { OrdersClient } from './OrdersClient'
import { AdminHeader } from '@/components/layout/AdminHeader'

export const revalidate = 0

export default async function OrdersPage() {
  const result = await getAdminOrdersAction({ page: 1, pageSize: 50 })

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader
        title="Sales & Customer Orders"
        subtitle="Live Transaction Stream, Gateway Payment Reconciliations, Serial Delivery & Refunds"
      />
      <main className="p-8 flex-1">
        <Suspense fallback={<div className="p-8 text-xs text-zinc-500">Loading orders ledger...</div>}>
          <OrdersClient initialOrders={result.orders || []} totalOrders={result.total || 0} />
        </Suspense>
      </main>
    </div>
  )
}
