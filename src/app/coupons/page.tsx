import { Suspense } from 'react'
import { getAdminCouponsAction } from '@/actions/couponActions'
import { getBrandsAction } from '@/actions/brandActions'
import { getAdminProductsAction } from '@/actions/productActions'
import { CouponsClient } from './CouponsClient'
import { AdminHeader } from '@/components/layout/AdminHeader'

export const revalidate = 0

export default async function CouponsPage() {
  const [couponsRes, brandRes, productsRes] = await Promise.all([
    getAdminCouponsAction(),
    getBrandsAction({ pageSize: 300 }),
    getAdminProductsAction({ pageSize: 500 }),
  ])

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader
        title="Offers, Discounts & Coupon Codes"
        subtitle="Manage Storewide Promos, Brand Discounts, Redemption Limits, and Flash Offers"
      />
      <main className="p-8 flex-1">
        <Suspense fallback={<div className="p-8 text-xs text-zinc-500">Loading coupons...</div>}>
          <CouponsClient
            initialCoupons={couponsRes.coupons || []}
            brands={brandRes.data || []}
            products={productsRes.products || []}
          />
        </Suspense>
      </main>
    </div>
  )
}
