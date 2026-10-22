'use server'

import { getAdminClient } from '@/lib/supabase/admin'
import { logAdminActivity } from '@/lib/audit'
import { revalidatePath } from 'next/cache'

export async function getAdminPayoutsAction() {
  try {
    const supabase = getAdminClient()
    const { data: payouts, error } = await supabase
      .from('payouts')
      .select('*, brands(id, name, slug, logo_url)')
      .order('created_at', { ascending: false })

    if (error) {
      return { success: false, error: error.message, payouts: [] }
    }

    return { success: true, payouts: payouts || [] }
  } catch (err: any) {
    return { success: false, error: err.message, payouts: [] }
  }
}

export async function getSettlementOverviewAction() {
  try {
    const supabase = getAdminClient()

    // 1. Fetch all purchases to aggregate sales volume
    const { data: purchases, error: pErr } = await supabase
      .from('purchases')
      .select('amount_paid, currency, purchased_at, products(brand_id)')

    if (pErr) return { success: false, error: pErr.message }

    let gmvUsd = 0
    let gmvInr = 0

    ;(purchases || []).forEach((p: any) => {
      const amount = Number(p.amount_paid || 0)
      const currency = (p.currency || 'USD').toUpperCase()
      if (currency === 'INR' || currency === '₹') {
        gmvInr += amount
      } else {
        gmvUsd += amount
      }
    })

    // Approximate USD equivalent (1 USD ~ 85 INR)
    const normalizedGrossUsd = gmvUsd + (gmvInr / 85)
    const platformFeeUsd = normalizedGrossUsd * 0.30
    const creatorNetUsd = normalizedGrossUsd * 0.70

    // 2. Fetch completed payouts
    const { data: payouts } = await supabase
      .from('payouts')
      .select('amount, net_amount, status, currency')

    let totalPaidOutUsd = 0
    let pendingPayoutUsd = 0

    ;(payouts || []).forEach((pay: any) => {
      const net = Number(pay.net_amount || pay.amount || 0)
      if (pay.status === 'completed') {
        totalPaidOutUsd += net
      } else if (pay.status === 'scheduled' || pay.status === 'processing') {
        pendingPayoutUsd += net
      }
    })

    const outstandingBalanceUsd = Math.max(0, creatorNetUsd - totalPaidOutUsd)

    return {
      success: true,
      data: {
        gmvUsd,
        gmvInr,
        normalizedGrossUsd,
        platformFeeUsd,
        creatorNetUsd,
        totalPaidOutUsd,
        pendingPayoutUsd,
        outstandingBalanceUsd,
      },
    }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function updatePayoutStatusAction(formData: {
  payoutId: string
  newStatus: 'processing' | 'completed' | 'on_hold' | 'failed'
  transactionRef?: string
  notes?: string
  staffEmail: string
}) {
  try {
    const supabase = getAdminClient()

    const updatePayload: any = {
      status: formData.newStatus,
    }
    if (formData.newStatus === 'completed') {
      updatePayload.processed_at = new Date().toISOString()
    }
    if (formData.transactionRef) {
      updatePayload.destination = formData.transactionRef
    }

    const { error } = await supabase
      .from('payouts')
      .update(updatePayload)
      .eq('id', formData.payoutId)

    if (error) return { success: false, error: error.message }

    await logAdminActivity({
      staff_email: formData.staffEmail,
      action: 'PAYOUT_STATUS_CHANGED',
      target_type: 'payout',
      target_id: formData.payoutId,
      details: {
        new_status: formData.newStatus,
        transaction_ref: formData.transactionRef,
        notes: formData.notes,
      },
    })

    revalidatePath('/payouts')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}
