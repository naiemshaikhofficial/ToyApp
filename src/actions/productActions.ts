'use server'

import { getAdminClient } from '@/lib/supabase/admin'
import { logAdminActivity } from '@/lib/audit'
import { revalidatePath } from 'next/cache'
import { requireAuthenticatedStaff } from '@/lib/auth'

export async function getAdminProductsAction(params?: {
  search?: string
  brandId?: string
  productType?: string
  isActive?: boolean
  page?: number
  pageSize?: number
}) {
  try {
    await requireAuthenticatedStaff('products')
    const supabase = getAdminClient()
    const page = params?.page || 1
    const pageSize = params?.pageSize || 25
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    let query = supabase
      .from('products')
      .select('*, brands(id, name, slug, logo_url), categories(id, name, slug), serial_keys(id)', { count: 'exact' })

    if (params?.search?.trim()) {
      query = query.ilike('name', `%${params.search.trim()}%`)
    }
    if (params?.brandId) {
      query = query.eq('brand_id', params.brandId)
    }
    if (params?.productType) {
      query = query.eq('product_type', params.productType)
    }
    if (typeof params?.isActive === 'boolean') {
      query = query.eq('is_active', params.isActive)
    }

    query = query.order('created_at', { ascending: false }).range(from, to)

    const { data, count, error } = await query

    if (error) {
      console.error('Error fetching admin products:', error)
      return { success: false, error: error.message, products: [], total: 0 }
    }

    return { success: true, products: data || [], total: count || 0 }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to fetch products', products: [], total: 0 }
  }
}

export async function getProductByIdAction(productId: string) {
  try {
    await requireAuthenticatedStaff('products')
    const supabase = getAdminClient()
    const { data, error } = await supabase
      .from('products')
      .select('*, brands(id, name, slug), categories(id, name)')
      .eq('id', productId)
      .single()

    if (error || !data) return { success: false, error: error?.message || 'Product not found' }

    // Get serial pool statistics
    const { count: totalSerials } = await supabase
      .from('serial_keys')
      .select('*', { count: 'exact', head: true })
      .eq('product_id', productId)

    const { count: usedSerials } = await supabase
      .from('serial_keys')
      .select('*', { count: 'exact', head: true })
      .eq('product_id', productId)
      .eq('is_used', true)

    return {
      success: true,
      product: data,
      serials: {
        total: totalSerials || 0,
        used: usedSerials || 0,
        available: (totalSerials || 0) - (usedSerials || 0),
      },
    }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function toggleProductActiveAction(productId: string, currentStatus: boolean, staffEmail?: string) {
  try {
    const staff = await requireAuthenticatedStaff('products')
    const effectiveStaffEmail = staff.email || staffEmail || 'staff@producertoy.com'
    const supabase = getAdminClient()
    const newStatus = !currentStatus
    const { error } = await supabase
      .from('products')
      .update({ is_active: newStatus, updated_at: new Date().toISOString() })
      .eq('id', productId)

    if (error) return { success: false, error: error.message }

    await logAdminActivity({
      staff_email: effectiveStaffEmail,
      action: newStatus ? 'PRODUCT_PUBLISHED' : 'PRODUCT_UNPUBLISHED',
      target_type: 'product',
      target_id: productId,
      details: { new_status: newStatus },
    })

    revalidatePath('/products')
    return { success: true, is_active: newStatus }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function toggleProductFeaturedAction(productId: string, currentFeatured: boolean, staffEmail?: string) {
  try {
    const staff = await requireAuthenticatedStaff('products')
    const effectiveStaffEmail = staff.email || staffEmail || 'staff@producertoy.com'
    const supabase = getAdminClient()
    const newFeatured = !currentFeatured
    const { error } = await supabase
      .from('products')
      .update({ is_featured: newFeatured, updated_at: new Date().toISOString() })
      .eq('id', productId)

    if (error) return { success: false, error: error.message }

    await logAdminActivity({
      staff_email: effectiveStaffEmail,
      action: newFeatured ? 'PRODUCT_FEATURED' : 'PRODUCT_UNFEATURED',
      target_type: 'product',
      target_id: productId,
      details: { is_featured: newFeatured },
    })

    revalidatePath('/products')
    return { success: true, is_featured: newFeatured }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function upsertAdminProductAction(productData: any, staffEmail?: string) {
  try {
    const staff = await requireAuthenticatedStaff('products')
    const effectiveStaffEmail = staff.email || staffEmail || 'staff@producertoy.com'
    const supabase = getAdminClient()
    const isNew = !productData.id

    const payload = {
      name: productData.name,
      slug: productData.slug || productData.name.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
      brand_id: productData.brand_id || null,
      category_id: productData.category_id || null,
      product_type: productData.product_type || 'plugin',
      price_usd: Number(productData.price_usd || 0),
      original_price_usd: productData.original_price_usd ? Number(productData.original_price_usd) : null,
      cover_image: productData.cover_image || null,
      demo_audio_url: productData.demo_audio_url || null,
      download_url: productData.download_url || null,
      download_url_win: productData.download_url_win || null,
      download_url_mac: productData.download_url_mac || null,
      short_description: productData.short_description || null,
      full_description: productData.full_description || null,
      vst_format: productData.vst_format || 'VST3, AU, AAX',
      operating_system: productData.operating_system || 'macOS 12+, Windows 10/11',
      supported_daws: productData.supported_daws || 'Ableton Live, FL Studio, Logic Pro, Pro Tools, Reaper',
      plugin_identifier: productData.plugin_identifier || null,
      max_activation_seats: Number(productData.max_activation_seats || 3),
      offline_grace_days: Number(productData.offline_grace_days || 14),
      version: productData.version || '1.0.0',
      external_url: productData.external_url || null,
      button_text: productData.button_text || null,
      is_active: productData.is_active !== undefined ? productData.is_active : true,
      updated_at: new Date().toISOString(),
    }

    let result
    if (isNew) {
      result = await supabase.from('products').insert(payload).select().single()
    } else {
      result = await supabase.from('products').update(payload).eq('id', productData.id).select().single()
    }

    if (result.error) return { success: false, error: result.error.message }

    await logAdminActivity({
      staff_email: effectiveStaffEmail,
      action: isNew ? 'PRODUCT_CREATED' : 'PRODUCT_UPDATED',
      target_type: 'product',
      target_id: result.data.id,
      details: { name: productData.name },
    })

    revalidatePath('/products')
    return { success: true, product: result.data }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}
