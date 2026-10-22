'use server'

import { getAdminClient } from '@/lib/supabase/admin'

export async function getDashboardAnalyticsAction() {
  try {
    const supabase = getAdminClient()

    // 1. Fetch count of active brands
    const { count: totalBrands } = await supabase
      .from('brands')
      .select('*', { count: 'exact', head: true })

    // 2. Fetch count of products (total, active)
    const { count: totalProducts } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })

    const { count: activeProducts } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)

    // 3. Fetch count of device activations
    const { count: activeDevices } = await supabase
      .from('device_activations')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)

    // 4. Fetch all purchases for financial calculations
    const { data: purchases, count: totalPurchases } = await supabase
      .from('purchases')
      .select('id, amount_paid, currency, purchased_at, customer_email, customer_name, serial_key, product_id, products(id, name, slug, brands(name))', { count: 'exact' })
      .order('purchased_at', { ascending: false })

    let gmvUsd = 0
    let gmvInr = 0

    const productSalesMap = new Map<string, { name: string; brand: string; units: number; revenueUsd: number }>()
    const brandSalesMap = new Map<string, { name: string; units: number; revenueUsd: number }>()

    ;(purchases || []).forEach((p: any) => {
      const amount = Number(p.amount_paid || 0)
      const currency = (p.currency || 'USD').toUpperCase()
      const isINR = currency === 'INR' || currency === '₹'
      const usdValue = isINR ? amount / 85 : amount

      if (isINR) {
        gmvInr += amount
      } else {
        gmvUsd += amount
      }

      // Track top products
      const pId = p.product_id
      const pName = p.products?.name || 'Unknown Audio Tool'
      const bName = p.products?.brands?.name || 'Producer Toy'

      if (pId) {
        const existing = productSalesMap.get(pId) || { name: pName, brand: bName, units: 0, revenueUsd: 0 }
        existing.units += 1
        existing.revenueUsd += usdValue
        productSalesMap.set(pId, existing)

        const existingBrand = brandSalesMap.get(bName) || { name: bName, units: 0, revenueUsd: 0 }
        existingBrand.units += 1
        existingBrand.revenueUsd += usdValue
        brandSalesMap.set(bName, existingBrand)
      }
    })

    const normalizedGrossUsd = gmvUsd + gmvInr / 85
    const platformRevenueUsd = normalizedGrossUsd * 0.30
    const creatorPayoutsUsd = normalizedGrossUsd * 0.70

    // Top 5 products
    const topProducts = Array.from(productSalesMap.values())
      .sort((a, b) => b.revenueUsd - a.revenueUsd)
      .slice(0, 5)

    // Top 5 brands
    const topBrands = Array.from(brandSalesMap.values())
      .sort((a, b) => b.revenueUsd - a.revenueUsd)
      .slice(0, 5)

    // Recent 8 orders
    const recentOrders = (purchases || []).slice(0, 8).map((p: any) => ({
      id: p.id,
      customer_name: p.customer_name || 'Customer',
      customer_email: p.customer_email || 'customer@producertoy.com',
      product_name: p.products?.name || 'Audio Asset',
      brand_name: p.products?.brands?.name || 'Producer Toy',
      amount: Number(p.amount_paid || 0),
      currency: p.currency || 'INR',
      purchased_at: p.purchased_at,
      serial_key: p.serial_key,
    }))

    return {
      success: true,
      stats: {
        totalBrands: totalBrands || 0,
        totalProducts: totalProducts || 0,
        activeProducts: activeProducts || 0,
        totalPurchases: totalPurchases || 0,
        activeDevices: activeDevices || 0,
        gmvUsd,
        gmvInr,
        normalizedGrossUsd,
        platformRevenueUsd,
        creatorPayoutsUsd,
      },
      topProducts,
      topBrands,
      recentOrders,
    }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}
