'use server'

import { getAdminClient } from '@/lib/supabase/admin'
import { logAdminActivity } from '@/lib/audit'
import { revalidatePath } from 'next/cache'

export interface AdminCoupon {
  id: string
  code: string
  discount_percent: number
  discount_type: 'percentage' | 'fixed'
  discount_amount_usd: number
  is_active: boolean
  expires_at: string | null
  start_date: string | null
  max_redemptions: number | null
  times_redeemed: number
  brand_id: string | null
  product_id: string | null
  created_at: string
  brands?: { id: string; name: string; slug: string } | null
  products?: { id: string; name: string; slug: string } | null
}

export async function getAdminCouponsAction(params?: {
  search?: string
  brandId?: string
  isActive?: boolean
}) {
  try {
    const supabase = getAdminClient()
    let query = supabase
      .from('coupons')
      .select('*, brands(id, name, slug), products(id, name, slug)')
      .order('created_at', { ascending: false })

    if (params?.search?.trim()) {
      query = query.ilike('code', `%${params.search.trim().toUpperCase()}%`)
    }
    if (params?.brandId) {
      query = query.eq('brand_id', params.brandId)
    }
    if (typeof params?.isActive === 'boolean') {
      query = query.eq('is_active', params.isActive)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching admin coupons:', error)
      return { success: false, error: error.message, coupons: [] }
    }

    return { success: true, coupons: (data || []) as AdminCoupon[] }
  } catch (err: any) {
    return { success: false, error: err.message, coupons: [] }
  }
}

export async function createAdminCouponAction(
  data: {
    code: string
    discountType: 'percentage' | 'fixed'
    discountPercent?: number
    discountAmountUsd?: number
    brandId?: string | null
    productId?: string | null
    expiresAt?: string | null
    maxRedemptions?: number | null
  },
  staffEmail: string
) {
  try {
    const supabase = getAdminClient()
    const cleanCode = (data.code || '').trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '')

    if (!cleanCode) {
      return { success: false, error: 'Valid coupon code is required.' }
    }

    const isPercent = data.discountType === 'percentage'
    const percentVal = isPercent ? Math.min(100, Math.max(1, Math.round(data.discountPercent || 0))) : 0
    const fixedVal = !isPercent ? Math.max(0, Number(data.discountAmountUsd || 0)) : 0

    if (isPercent && percentVal <= 0) {
      return { success: false, error: 'Percentage discount must be 1-100%.' }
    }
    if (!isPercent && fixedVal <= 0) {
      return { success: false, error: 'Fixed discount must be greater than $0.00.' }
    }

    // Check duplicate
    const { data: existing } = await supabase.from('coupons').select('id').eq('code', cleanCode).maybeSingle()
    if (existing) {
      return { success: false, error: `Coupon code "${cleanCode}" already exists.` }
    }

    const payload = {
      code: cleanCode,
      brand_id: data.brandId || null,
      product_id: data.productId || null,
      discount_type: data.discountType,
      discount_percent: isPercent ? percentVal : Math.min(100, Math.round((fixedVal / 50) * 100)),
      discount_amount_usd: fixedVal,
      max_redemptions: data.maxRedemptions ? Number(data.maxRedemptions) : null,
      times_redeemed: 0,
      expires_at: data.expiresAt ? new Date(data.expiresAt).toISOString() : null,
      start_date: new Date().toISOString(),
      is_active: true,
      created_at: new Date().toISOString(),
    }

    const { data: created, error } = await supabase
      .from('coupons')
      .insert(payload)
      .select('*, brands(id, name, slug), products(id, name, slug)')
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    await logAdminActivity({
      staff_email: staffEmail,
      action: 'COUPON_CREATED',
      target_type: 'coupon',
      target_id: created.id,
      details: { code: cleanCode, discount_type: data.discountType },
    })

    revalidatePath('/coupons')
    return { success: true, coupon: created as AdminCoupon }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function toggleAdminCouponActiveAction(
  couponId: string,
  currentStatus: boolean,
  staffEmail: string
) {
  try {
    const supabase = getAdminClient()
    const newStatus = !currentStatus

    const { error } = await supabase
      .from('coupons')
      .update({ is_active: newStatus })
      .eq('id', couponId)

    if (error) return { success: false, error: error.message }

    await logAdminActivity({
      staff_email: staffEmail,
      action: newStatus ? 'COUPON_ACTIVATED' : 'COUPON_PAUSED',
      target_type: 'coupon',
      target_id: couponId,
      details: { is_active: newStatus },
    })

    revalidatePath('/coupons')
    return { success: true, is_active: newStatus }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function deleteAdminCouponAction(couponId: string, staffEmail: string) {
  try {
    const supabase = getAdminClient()
    const { error } = await supabase.from('coupons').delete().eq('id', couponId)

    if (error) return { success: false, error: error.message }

    await logAdminActivity({
      staff_email: staffEmail,
      action: 'COUPON_DELETED',
      target_type: 'coupon',
      target_id: couponId,
      details: {},
    })

    revalidatePath('/coupons')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}
