'use server'

import { getAdminClient } from '@/lib/supabase/admin'
import { logAdminActivity } from '@/lib/audit'
import { revalidatePath } from 'next/cache'
import { requireAuthenticatedStaff } from '@/lib/auth'

export async function getAdminOrdersAction(params?: {
  search?: string
  currency?: string
  paymentGateway?: string
  page?: number
  pageSize?: number
}) {
  try {
    await requireAuthenticatedStaff('orders')
    const supabase = getAdminClient()
    const page = params?.page || 1
    const pageSize = params?.pageSize || 25
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    let query = supabase
      .from('purchases')
      .select('*, products(id, name, slug, cover_image, product_type, brands(id, name))', { count: 'exact' })

    if (params?.search?.trim()) {
      const s = params.search.trim()
      query = query.or(`customer_email.ilike.%${s}%,customer_name.ilike.%${s}%,serial_key.ilike.%${s}%,razorpay_payment_id.ilike.%${s}%`)
    }
    if (params?.currency) {
      query = query.eq('currency', params.currency)
    }

    query = query.order('purchased_at', { ascending: false }).range(from, to)

    const { data, count, error } = await query

    if (error) {
      console.error('Error fetching admin orders:', error)
      return { success: false, error: error.message, orders: [], total: 0 }
    }

    return { success: true, orders: data || [], total: count || 0 }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to fetch orders', orders: [], total: 0 }
  }
}

export async function getOrderByIdAction(purchaseId: string) {
  try {
    await requireAuthenticatedStaff('orders')
    const supabase = getAdminClient()
    const { data: purchase, error } = await supabase
      .from('purchases')
      .select('*, products(*, brands(*)), device_activations(*)')
      .eq('id', purchaseId)
      .single()

    if (error || !purchase) return { success: false, error: error?.message || 'Order not found' }

    return { success: true, purchase }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function refundOrderAction(formData: {
  purchaseId: string
  reason: string
  revokeLicense: boolean
  staffEmail?: string
}) {
  try {
    const staff = await requireAuthenticatedStaff('orders')
    const effectiveStaffEmail = staff.email || formData.staffEmail || 'staff@producertoy.com'
    const supabase = getAdminClient()

    // 1. Get purchase info
    const { data: purchase } = await supabase
      .from('purchases')
      .select('id, serial_key, product_id, user_id, amount_paid, currency')
      .eq('id', formData.purchaseId)
      .single()

    if (!purchase) return { success: false, error: 'Purchase not found' }

    // 2. If revokeLicense, revoke active device activations
    if (formData.revokeLicense) {
      await supabase
        .from('device_activations')
        .update({ is_active: false, revoked_at: new Date().toISOString() })
        .eq('purchase_id', formData.purchaseId)

      // Also if serial_key exists in serial_keys table, mark is_used = false or mark revoked
      if (purchase.serial_key) {
        await supabase
          .from('serial_keys')
          .update({ is_used: false, assigned_to_user_id: null })
          .eq('serial_key', purchase.serial_key)
      }
    }

    // 3. Log admin activity
    await logAdminActivity({
      staff_email: effectiveStaffEmail,
      action: 'ORDER_REFUND_PROCESSED',
      target_type: 'order',
      target_id: formData.purchaseId,
      details: {
        reason: formData.reason,
        amount_paid: purchase.amount_paid,
        currency: purchase.currency,
        license_revoked: formData.revokeLicense,
      },
    })

    revalidatePath('/orders')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}
