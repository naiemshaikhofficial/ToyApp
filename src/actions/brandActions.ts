'use server'

import { getAdminClient } from '@/lib/supabase/admin'
import { logAdminActivity } from '@/lib/audit'
import { revalidatePath } from 'next/cache'
import { requireAuthenticatedStaff } from '@/lib/auth'
import crypto from 'crypto'
import { sendBrandOwnerInviteEmail } from '@/lib/brandInviteEmail'

export async function getBrandsAction(params?: {
  search?: string
  verifiedOnly?: boolean
  page?: number
  pageSize?: number
}) {
  try {
    await requireAuthenticatedStaff('brands')
    const supabase = getAdminClient()
    const page = params?.page || 1
    const pageSize = params?.pageSize || 30
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    let query = supabase
      .from('brands')
      .select('*, products(id), brand_members(id, role, status, revenue_share_percent)', { count: 'exact' })

    if (params?.search?.trim()) {
      query = query.ilike('name', `%${params.search.trim()}%`)
    }

    query = query.order('name', { ascending: true }).range(from, to)

    const { data, count, error } = await query

    if (error) {
      console.error('Error fetching brands:', error)
      return { success: false, error: error.message, data: [], total: 0 }
    }

    return { success: true, data: data || [], total: count || 0 }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to fetch brands', data: [], total: 0 }
  }
}

export async function getBrandByIdAction(brandId: string) {
  try {
    await requireAuthenticatedStaff('brands')
    const supabase = getAdminClient()
    const { data: brand, error } = await supabase
      .from('brands')
      .select('*, brand_members(*)')
      .eq('id', brandId)
      .single()

    if (error || !brand) {
      return { success: false, error: error?.message || 'Brand not found' }
    }

    // Also get products count and list for this brand
    const { data: products } = await supabase
      .from('products')
      .select('id, name, slug, price_usd, is_active, cover_image, product_type')
      .eq('brand_id', brandId)
      .order('created_at', { ascending: false })

    return {
      success: true,
      brand,
      products: products || [],
    }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to fetch brand' }
  }
}

export async function createBrandAction(formData: {
  name: string
  slug: string
  description?: string
  website_url?: string
  support_email?: string
  country?: string
  logo_url?: string
  revenue_share_percent?: number
  staff_email?: string
  owner_email?: string
}) {
  try {
    const staff = await requireAuthenticatedStaff('brands')
    const effectiveStaffEmail = staff.email || formData.staff_email || 'staff@producertoy.com'
    const supabase = getAdminClient()
    const cleanSlug = formData.slug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/--+/g, '-')

    const { data, error } = await supabase
      .from('brands')
      .insert({
        name: formData.name.trim(),
        slug: cleanSlug,
        description: formData.description || null,
        website_url: formData.website_url || null,
        support_email: formData.support_email || null,
        country: formData.country || 'Global',
        logo_url: formData.logo_url || null,
        contract_version: 'v1.0',
        contract_accepted_at: new Date().toISOString(),
        contract_signatory_name: formData.name.trim(),
      })
      .select()
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    await logAdminActivity({
      staff_email: effectiveStaffEmail,
      action: 'BRAND_CREATED',
      target_type: 'brand',
      target_id: data.id,
      details: { name: formData.name, slug: cleanSlug },
    })

    // If an owner email was specified, automatically dispatch the owner invite
    let inviteInfo: { inviteUrl?: string; emailSent?: boolean; emailError?: string } | undefined
    if (formData.owner_email && formData.owner_email.trim().includes('@')) {
      const inviteRes = await inviteBrandOwnerAction({
        brandId: data.id,
        email: formData.owner_email.trim(),
        staffEmail: effectiveStaffEmail,
      })
      if (inviteRes.success) {
        inviteInfo = {
          inviteUrl: inviteRes.inviteUrl,
          emailSent: inviteRes.emailSent,
          emailError: inviteRes.emailError,
        }
      }
    }

    revalidatePath('/brands')
    return { success: true, brand: data, inviteInfo }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to create brand' }
  }
}

export async function updateBrandAction(formData: {
  id: string
  name: string
  slug: string
  description?: string
  website_url?: string
  support_email?: string
  country?: string
  logo_url?: string
  staff_email?: string
}) {
  try {
    const staff = await requireAuthenticatedStaff('brands')
    const effectiveStaffEmail = staff.email || formData.staff_email || 'staff@producertoy.com'
    const supabase = getAdminClient()
    const { data, error } = await supabase
      .from('brands')
      .update({
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        description: formData.description || null,
        website_url: formData.website_url || null,
        support_email: formData.support_email || null,
        country: formData.country || null,
        logo_url: formData.logo_url || null,
      })
      .eq('id', formData.id)
      .select()
      .single()

    if (error) return { success: false, error: error.message }

    await logAdminActivity({
      staff_email: effectiveStaffEmail,
      action: 'BRAND_UPDATED',
      target_type: 'brand',
      target_id: formData.id,
      details: { name: formData.name },
    })

    revalidatePath('/brands')
    return { success: true, brand: data }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function updateBrandCommissionAction(formData: {
  brandId: string
  revenueSharePercent: number
  staff_email?: string
}) {
  try {
    const staff = await requireAuthenticatedStaff('brands')
    const effectiveStaffEmail = staff.email || formData.staff_email || 'staff@producertoy.com'
    const supabase = getAdminClient()
    const { error } = await supabase
      .from('brand_members')
      .update({ revenue_share_percent: formData.revenueSharePercent })
      .eq('brand_id', formData.brandId)

    if (error) return { success: false, error: error.message }

    await logAdminActivity({
      staff_email: effectiveStaffEmail,
      action: 'BRAND_COMMISSION_UPDATED',
      target_type: 'brand',
      target_id: formData.brandId,
      details: { revenue_share_percent: formData.revenueSharePercent },
    })

    revalidatePath('/brands')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function toggleBrandVerificationAction(formData: {
  brandId: string
  verify: boolean
  staff_email?: string
}) {
  try {
    const staff = await requireAuthenticatedStaff('brands')
    const effectiveStaffEmail = staff.email || formData.staff_email || 'staff@producertoy.com'
    const supabase = getAdminClient()
    const { data, error } = await supabase
      .from('brands')
      .update({
        contract_accepted_at: formData.verify ? new Date().toISOString() : null,
        contract_version: formData.verify ? 'v2.4' : null,
        contract_signatory_name: formData.verify ? 'Verified by Admin' : null,
      })
      .eq('id', formData.brandId)
      .select()
      .single()

    if (error) return { success: false, error: error.message }

    await logAdminActivity({
      staff_email: effectiveStaffEmail,
      action: formData.verify ? 'BRAND_VERIFIED' : 'BRAND_VERIFICATION_REVOKED',
      target_type: 'brand',
      target_id: formData.brandId,
      details: { verified: formData.verify },
    })

    revalidatePath('/brands')
    return { success: true, brand: data }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

/**
 * Dispatch an official Brand Owner Portal invitation
 */
export async function inviteBrandOwnerAction(params: {
  brandId: string
  email: string
  staffEmail?: string
}) {
  try {
    const staff = await requireAuthenticatedStaff('brands')
    const effectiveStaffEmail = staff.email || params.staffEmail || 'staff@producertoy.com'
    const supabase = getAdminClient()
    const cleanEmail = (params.email || '').trim().toLowerCase()
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      return { success: false, error: 'Please provide a valid email address.' }
    }

    // 1. Fetch brand
    const { data: brand, error: brandErr } = await supabase
      .from('brands')
      .select('id, name, slug, logo_url')
      .eq('id', params.brandId)
      .single()

    if (brandErr || !brand) {
      return { success: false, error: 'Brand not found in database.' }
    }

    // 2. Generate secure cryptographic 32-byte hex token
    const inviteToken = crypto.randomBytes(32).toString('hex')
    const portalUrl = process.env.NEXT_PUBLIC_CREATOR_PORTAL_URL || 'https://creators.producertoy.com'
    const inviteUrl = `${portalUrl.replace(/\/$/, '')}/invite?token=${encodeURIComponent(inviteToken)}`

    // 3. Insert or update record in brand_invites
    const { data: existingInvite } = await supabase
      .from('brand_invites')
      .select('id')
      .eq('brand_id', params.brandId)
      .eq('email', cleanEmail)
      .eq('status', 'pending')
      .maybeSingle()

    if (existingInvite) {
      const { error: updErr } = await supabase
        .from('brand_invites')
        .update({
          token: inviteToken,
          role: 'owner',
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingInvite.id)
      if (updErr) throw updErr
    } else {
      const { error: insErr } = await supabase
        .from('brand_invites')
        .insert({
          brand_id: params.brandId,
          email: cleanEmail,
          role: 'owner',
          status: 'pending',
          token: inviteToken,
        })
      if (insErr) throw insErr
    }

    // 4. Send official branded invitation email via Resend
    let emailSent = false
    let emailError: string | undefined
    try {
      const emailRes = await sendBrandOwnerInviteEmail({
        to: cleanEmail,
        brandName: brand.name,
        brandSlug: brand.slug,
        brandLogoUrl: brand.logo_url,
        inviteToken,
        portalUrl,
      })
      emailSent = emailRes.success
      emailError = emailRes.error
    } catch (e: any) {
      emailError = e?.message || 'Email dispatch failed'
    }

    // 5. Log audit trail
    await logAdminActivity({
      staff_email: effectiveStaffEmail,
      action: 'BRAND_OWNER_INVITED',
      target_type: 'brand',
      target_id: params.brandId,
      details: {
        brandName: brand.name,
        invitedEmail: cleanEmail,
        emailSent,
        emailError,
      },
    })

    revalidatePath('/brands')
    return {
      success: true,
      inviteUrl,
      emailSent,
      emailError,
    }
  } catch (err: any) {
    console.error('inviteBrandOwnerAction error:', err)
    return { success: false, error: err.message || 'Failed to dispatch brand invitation.' }
  }
}

/**
 * Fetch current owner and pending owner invite status for a brand
 */
export async function getBrandOwnerAndInviteStatusAction(brandId: string) {
  try {
    await requireAuthenticatedStaff('brands')
    const supabase = getAdminClient()

    // 1. Fetch active owner from brand_members
    const { data: members } = await supabase
      .from('brand_members')
      .select('id, user_id, role, status, created_at, revenue_share_percent')
      .eq('brand_id', brandId)
      .eq('role', 'owner')
      .limit(1)

    let activeOwner = null
    if (members && members.length > 0) {
      const ownerMem = members[0]
      let ownerEmail = 'Active Brand Owner'
      let ownerName = 'Brand Owner'
      try {
        const { data: userData } = await supabase.auth.admin.getUserById(ownerMem.user_id)
        if (userData?.user?.email) ownerEmail = userData.user.email
        if (userData?.user?.user_metadata?.full_name) {
          ownerName = userData.user.user_metadata.full_name
        }
      } catch {
        // ignore single user lookup error
      }
      activeOwner = {
        id: ownerMem.id,
        userId: ownerMem.user_id,
        email: ownerEmail,
        name: ownerName,
        status: ownerMem.status,
        createdAt: ownerMem.created_at,
        revenueSharePercent: ownerMem.revenue_share_percent || 70,
      }
    }

    // 2. Fetch pending owner invite
    const { data: invites } = await supabase
      .from('brand_invites')
      .select('id, email, role, status, token, created_at')
      .eq('brand_id', brandId)
      .eq('role', 'owner')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(1)

    const pendingInvite = invites && invites.length > 0 ? invites[0] : null
    const portalUrl = process.env.NEXT_PUBLIC_CREATOR_PORTAL_URL || 'https://creators.producertoy.com'
    const inviteUrl = pendingInvite?.token
      ? `${portalUrl.replace(/\/$/, '')}/invite?token=${encodeURIComponent(pendingInvite.token)}`
      : null

    return {
      success: true,
      activeOwner,
      pendingInvite: pendingInvite
        ? {
            id: pendingInvite.id,
            email: pendingInvite.email,
            createdAt: pendingInvite.created_at,
            inviteUrl,
          }
        : null,
    }
  } catch (err: any) {
    return { success: false, error: err.message, activeOwner: null, pendingInvite: null }
  }
}

/**
 * Revoke a pending brand invitation
 */
export async function revokeBrandInviteAction(params: {
  inviteId: string
  brandId: string
  staffEmail?: string
}) {
  try {
    const staff = await requireAuthenticatedStaff('brands')
    const effectiveStaffEmail = staff.email || params.staffEmail || 'staff@producertoy.com'
    const supabase = getAdminClient()

    const { error } = await supabase
      .from('brand_invites')
      .update({ status: 'revoked', updated_at: new Date().toISOString() })
      .eq('id', params.inviteId)
      .eq('brand_id', params.brandId)

    if (error) throw error

    await logAdminActivity({
      staff_email: effectiveStaffEmail,
      action: 'BRAND_INVITE_REVOKED',
      target_type: 'brand',
      target_id: params.brandId,
      details: { inviteId: params.inviteId },
    })

    revalidatePath('/brands')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to revoke invite.' }
  }
}

