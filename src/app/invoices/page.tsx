import { getAdminInvoicesAction } from '@/actions/invoiceActions'
import { InvoicesClient } from './InvoicesClient'
import { AdminHeader } from '@/components/layout/AdminHeader'

export const revalidate = 0

export default async function InvoicesPage() {
  const result = await getAdminInvoicesAction({ page: 1, pageSize: 50 })

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader
        title="Commercial Tax Invoices"
        subtitle="Official Sequential Invoices, International Tax Compliance, GST Breakdown & Printable PDFs"
      />
      <main className="p-8 flex-1">
        <InvoicesClient initialInvoices={result.invoices || []} totalInvoices={result.total || 0} />
      </main>
    </div>
  )
}
