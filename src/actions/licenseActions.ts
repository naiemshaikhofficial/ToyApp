'use server'

import { getAdminClient } from '@/lib/supabase/admin'
import { logAdminActivity } from '@/lib/audit'
import { revalidatePath } from 'next/cache'

export async function getDeviceActivationsAction(params?: {
  search?: string
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
      .from('device_activations')
      .select('*, products(id, name, slug, plugin_identifier, brands(name))', { count: 'exact' })

    if (params?.search?.trim()) {
      const s = params.search.trim()
      query = query.or(`device_name.ilike.%${s}%,os.ilike.%${s}%,device_id_hash.ilike.%${s}%`)
    }

    query = query.order('activated_at', { ascending: false }).range(from, to)

    const { data, count, error } = await query

    if (error) return { success: false, error: error.message, activations: [], total: 0 }

    return { success: true, activations: data || [], total: count || 0 }
  } catch (err: any) {
    return { success: false, error: err.message, activations: [], total: 0 }
  }
}

export async function revokeDeviceActivationAction(activationId: string, staffEmail: string) {
  try {
    const supabase = getAdminClient()
    const { error } = await supabase
      .from('device_activations')
      .update({
        is_active: false,
        revoked_at: new Date().toISOString(),
      })
      .eq('id', activationId)

    if (error) return { success: false, error: error.message }

    await logAdminActivity({
      staff_email: staffEmail,
      action: 'DEVICE_ACTIVATION_REVOKED',
      target_type: 'license',
      target_id: activationId,
    })

    revalidatePath('/licenses')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function getSerialPoolInventoryAction() {
  try {
    const supabase = getAdminClient()

    // Query products with serial count
    const { data: products, error } = await supabase
      .from('products')
      .select('id, name, slug, plugin_identifier, brands(name), serial_keys(id, is_used)')
      .order('name', { ascending: true })

    if (error) return { success: false, error: error.message, inventory: [] }

    const inventory = (products || []).map((prod: any) => {
      const keys = prod.serial_keys || []
      const total = keys.length
      const used = keys.filter((k: any) => k.is_used).length
      const available = total - used
      const isDepleted = available < 10

      return {
        id: prod.id,
        name: prod.name,
        slug: prod.slug,
        brand: prod.brands?.name || 'Producer Toy',
        plugin_identifier: prod.plugin_identifier,
        total,
        used,
        available,
        isDepleted,
      }
    })

    return { success: true, inventory }
  } catch (err: any) {
    return { success: false, error: err.message, inventory: [] }
  }
}

export async function uploadSerialKeysAction(formData: {
  productId: string
  rawKeys: string
  staffEmail: string
}) {
  try {
    const supabase = getAdminClient()
    const parsedKeys = formData.rawKeys
      .split(/[\r\n,]+/)
      .map((k) => k.trim().replace(/^["']|["']$/g, ''))
      .filter((k) => k.length > 2)

    if (parsedKeys.length === 0) {
      return { success: false, error: 'No valid serial keys provided' }
    }

    const uniqueKeys = Array.from(new Set(parsedKeys))

    // Check existing keys for this product
    const { data: existing } = await supabase
      .from('serial_keys')
      .select('serial_key')
      .eq('product_id', formData.productId)

    const existingSet = new Set((existing || []).map((e: any) => e.serial_key))
    const toInsert = uniqueKeys
      .filter((k) => !existingSet.has(k))
      .map((k) => ({
        product_id: formData.productId,
        serial_key: k,
        is_used: false,
      }))

    if (toInsert.length === 0) {
      return { success: false, error: 'All submitted keys are already present in the database.' }
    }

    const { error: insErr } = await supabase.from('serial_keys').insert(toInsert)

    if (insErr) return { success: false, error: insErr.message }

    await logAdminActivity({
      staff_email: formData.staffEmail,
      action: 'SERIALS_BATCH_UPLOADED',
      target_type: 'serial_pool',
      target_id: formData.productId,
      details: { inserted_count: toInsert.length, duplicates_skipped: uniqueKeys.length - toInsert.length },
    })

    revalidatePath('/licenses')
    revalidatePath('/products')
    return {
      success: true,
      inserted: toInsert.length,
      skipped: uniqueKeys.length - toInsert.length,
    }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}
