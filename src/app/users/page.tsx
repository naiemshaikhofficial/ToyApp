import { getUsersAction } from '@/actions/userActions'
import { UsersClient } from './UsersClient'
import { AdminHeader } from '@/components/layout/AdminHeader'

export const revalidate = 0

export default async function UsersPage() {
  const result = await getUsersAction({ page: 1, pageSize: 20 })

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader
        title="Customer Directory & Accounts"
        subtitle="Customer Addresses, Purchase History, Serial Keys Issued & Workstation Activations"
      />
      <main className="p-8 flex-1">
        <UsersClient
          initialUsers={result.data || []}
          totalUsers={result.total || 0}
        />
      </main>
    </div>
  )
}
