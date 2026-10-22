import { getDeviceActivationsAction, getSerialPoolInventoryAction } from '@/actions/licenseActions'
import { LicensesClient } from './LicensesClient'
import { AdminHeader } from '@/components/layout/AdminHeader'

export const revalidate = 0

export default async function LicensesPage() {
  const [actRes, invRes] = await Promise.all([
    getDeviceActivationsAction({ page: 1, pageSize: 60 }),
    getSerialPoolInventoryAction(),
  ])

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader
        title="Licenses & Hardware Activations"
        subtitle="Manage Audio Workstation Machine Seats, Remote Seat Revocation & Serial Key Inventory Pool"
      />
      <main className="p-8 flex-1">
        <LicensesClient
          initialActivations={actRes.activations || []}
          totalActivations={actRes.total || 0}
          serialInventory={invRes.inventory || []}
        />
      </main>
    </div>
  )
}
