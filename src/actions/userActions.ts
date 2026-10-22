'use server'

import { getAdminClient } from '@/lib/supabase/admin'
import { logAdminActivity } from '@/lib/audit'
import { revalidatePath } from 'next/cache'

export interface UserSummary {
  id: string
  email: string
  full_name: string | null
  phone_number: string | null
  address_line1: string | null
  address_line2: string | null
  city: string | null
  state: string | null
  postal_code: string | null
  country: string | null
  company_name: string | null
  company_vat: string | null
  wallet_balance: number | string | null
  reward_balance: number | string | null
  created_at: string
  purchase_count: number
  total_spent: number
}

export async function getUsersAction(params?: {
  search?: string
  page?: number
  pageSize?: number
}) {
  try {
    const supabase = getAdminClient()
    const page = params?.page || 1
    const pageSize = params?.pageSize || 20
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    let query = supabase
      .from('profiles')
      .select('*', { count: 'exact' })

    if (params?.search?.trim()) {
      const term = params.search.trim()
      query = query.or(`email.ilike.%${term}%,full_name.ilike.%${term}%,city.ilike.%${term}%,country.ilike.%${term}%,phone_number.ilike.%${term}%`)
    }

    query = query.order('created_at', { ascending: false }).range(from, to)

    const { data, count, error } = await query

    if (error) {
      console.error('Error fetching users:', error)
      return { success: false, error: error.message, data: [], total: 0 }
    }

    // Fetch purchases for these users safely
    const userIds = (data || []).map((u: any) => u.id)
    const purchasesByUser: Record<string, any[]> = {}

    if (userIds.length > 0) {
      const { data: pData } = await supabase
        .from('purchases')
        .select('id, user_id, amount_paid, currency')
        .in('user_id', userIds)

      if (pData) {
        pData.forEach((p: any) => {
          if (!purchasesByUser[p.user_id]) purchasesByUser[p.user_id] = []
          purchasesByUser[p.user_id].push(p)
        })
      }
    }

    const formattedUsers: UserSummary[] = (data || []).map((u: any) => {
      const purchases = purchasesByUser[u.id] || []
      const purchase_count = purchases.length
      const total_spent = purchases.reduce((acc: number, p: any) => {
        const amt = Number(p.amount_paid) || 0
        return acc + (p.currency === 'INR' ? amt / 85 : amt)
      }, 0)

      return {
        id: u.id,
        email: u.email,
        full_name: u.full_name || u.display_name || 'Anonymous User',
        phone_number: u.phone_number,
        address_line1: u.address_line1,
        address_line2: u.address_line2,
        city: u.city,
        state: u.state,
        postal_code: u.postal_code,
        country: u.country,
        company_name: u.company_name,
        company_vat: u.company_vat,
        wallet_balance: u.wallet_balance || 0,
        reward_balance: u.reward_balance || 0,
        created_at: u.created_at,
        purchase_count,
        total_spent: Math.round(total_spent * 100) / 100,
      }
    })

    return { success: true, data: formattedUsers, total: count || 0 }
  } catch (err: any) {
    console.error('getUsersAction error:', err)
    return { success: false, error: err.message || 'Failed to fetch users', data: [], total: 0 }
  }
}

export async function getUserDetailsAction(userId: string) {
  try {
    const supabase = getAdminClient()

    // 1. Fetch Profile
    const { data: profile, error: profErr } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (profErr || !profile) {
      return { success: false, error: 'User profile not found' }
    }

    // 2. Fetch User Purchases
    const { data: purchases } = await supabase
      .from('purchases')
      .select('*')
      .eq('user_id', userId)
      .order('purchased_at', { ascending: false })

    let enrichedPurchases: any[] = []
    if (purchases && purchases.length > 0) {
      const productIds = purchases.map((p: any) => p.product_id).filter(Boolean)
      const productsMap: Record<string, any> = {}

      if (productIds.length > 0) {
        const { data: prods } = await supabase
          .from('products')
          .select('id, name, price_usd, brand_id, brands(name)')
          .in('id', productIds)

        if (prods) {
          prods.forEach((pr: any) => {
            productsMap[pr.id] = pr
          })
        }
      }

      enrichedPurchases = purchases.map((p: any) => ({
        ...p,
        products: productsMap[p.product_id] || { name: 'Audio Software', price_usd: p.amount_paid },
      }))
    }

    // 3. Fetch Machine Workstation Seats
    const { data: activations } = await supabase
      .from('device_activations')
      .select('*, products(name)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    return {
      success: true,
      profile,
      purchases: enrichedPurchases,
      activations: activations || [],
    }
  } catch (err: any) {
    console.error('getUserDetailsAction error:', err)
    return { success: false, error: err.message || 'Failed to fetch user details' }
  }
}

export async function updateUserProfileAction(data: {
  userId: string
  fullName: string
  phoneNumber?: string
  addressLine1?: string
  addressLine2?: string
  city?: string
  state?: string
  postalCode?: string
  country?: string
  companyName?: string
  companyVat?: string
  staffEmail: string
}) {
  try {
    const supabase = getAdminClient()

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: data.fullName,
        phone_number: data.phoneNumber || null,
        address_line1: data.addressLine1 || null,
        address_line2: data.addressLine2 || null,
        city: data.city || null,
        state: data.state || null,
        postal_code: data.postalCode || null,
        country: data.country || null,
        company_name: data.companyName || null,
        company_vat: data.companyVat || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', data.userId)

    if (error) throw new Error(error.message)

    await logAdminActivity({
      staff_email: data.staffEmail,
      action: 'USER_PROFILE_UPDATED',
      target_type: 'staff',
      target_id: data.userId,
      details: { updated_by: data.staffEmail },
    })

    revalidatePath('/users')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to update user profile' }
  }
}
