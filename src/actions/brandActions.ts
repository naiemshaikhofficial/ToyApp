'use server'

import { getAdminClient } from '@/lib/supabase/admin'
import { logAdminActivity } from '@/lib/audit'
import { revalidatePath } from 'next/cache'

export async function getBrandsAction(params?: {
  search?: string
  verifiedOnly?: boolean
  page?: number
  pageSize?: number
}) {
  try {
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
  staff_email: string
}) {
  try {
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
      staff_email: formData.staff_email,
      action: 'BRAND_CREATED',
      target_type: 'brand',
      target_id: data.id,
      details: { name: formData.name, slug: cleanSlug },
    })

    revalidatePath('/brands')
    return { success: true, brand: data }
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
  staff_email: string
}) {
  try {
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
      staff_email: formData.staff_email,
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
  staff_email: string
}) {
  try {
    const supabase = getAdminClient()
    const { error } = await supabase
      .from('brand_members')
      .update({ revenue_share_percent: formData.revenueSharePercent })
      .eq('brand_id', formData.brandId)

    if (error) return { success: false, error: error.message }

    await logAdminActivity({
      staff_email: formData.staff_email,
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
