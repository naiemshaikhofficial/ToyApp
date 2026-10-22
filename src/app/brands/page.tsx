import { getBrandsAction } from '@/actions/brandActions'
import { BrandsClient } from './BrandsClient'
import { AdminHeader } from '@/components/layout/AdminHeader'

export const revalidate = 0

export default async function BrandsPage() {
  const result = await getBrandsAction({ page: 1, pageSize: 60 })

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader
        title="Brand Management"
        subtitle="Manage 300+ Audio Manufacturers, Sound Designers, Verification Badges & Revenue Shares"
      />
      <main className="p-8 flex-1">
        <BrandsClient initialBrands={result.data || []} totalBrands={result.total || 0} />
      </main>
    </div>
  )
}
