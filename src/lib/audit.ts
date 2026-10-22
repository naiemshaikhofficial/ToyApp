import { getAdminClient } from '@/lib/supabase/admin'

export interface AuditLogPayload {
  staff_email: string
  action: string
  target_type: 'product' | 'brand' | 'order' | 'payout' | 'serial_pool' | 'staff' | 'license' | 'coupon' | 'system'
  target_id?: string
  details?: Record<string, any>
  ip_address?: string
}

export async function logAdminActivity(payload: AuditLogPayload) {
  try {
    const supabase = getAdminClient()
    await supabase.from('admin_audit_logs').insert({
      staff_email: payload.staff_email,
      action: payload.action,
      target_type: payload.target_type,
      target_id: payload.target_id || null,
      details: payload.details || {},
      ip_address: payload.ip_address || null,
      created_at: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Failed to write admin audit log:', error)
  }
}
