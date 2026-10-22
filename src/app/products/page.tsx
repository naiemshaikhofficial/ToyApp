import { Suspense } from 'react'
import { getAdminProductsAction } from '@/actions/productActions'
import { getBrandsAction } from '@/actions/brandActions'
import { ProductsClient } from './ProductsClient'
import { AdminHeader } from '@/components/layout/AdminHeader'

export const revalidate = 0

export default async function ProductsPage() {
  const [productRes, brandRes] = await Promise.all([
    getAdminProductsAction({ page: 1, pageSize: 50 }),
    getBrandsAction({ pageSize: 300 }),
  ])

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader
        title="Product Catalog & Digital Assets"
        subtitle="Manage VST/AU/AAX Plugins, Sample Packs, Sound Banks, Activation Seats & Installers"
      />
      <main className="p-8 flex-1">
        <Suspense fallback={<div className="p-8 text-xs text-zinc-500">Loading catalog...</div>}>
          <ProductsClient
            initialProducts={productRes.products || []}
            totalProducts={productRes.total || 0}
            brands={brandRes.data || []}
          />
        </Suspense>
      </main>
    </div>
  )
}
