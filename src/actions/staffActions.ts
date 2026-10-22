'use server'

import { getAdminClient } from '@/lib/supabase/admin'
import { StaffRole } from '@/lib/auth'
import { logAdminActivity } from '@/lib/audit'
import { revalidatePath } from 'next/cache'

export async function getStaffMembersAction() {
  try {
    const supabase = getAdminClient()
    const { data, error } = await supabase
      .from('admin_staff')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) return { success: false, error: error.message, staff: [] }

    return { success: true, staff: data || [] }
  } catch (err: any) {
    return { success: false, error: err.message, staff: [] }
  }
}

export async function createStaffMemberAction(formData: {
  email: string
  fullName: string
  role: StaffRole
  authorStaffEmail: string
}) {
  try {
    const supabase = getAdminClient()
    const cleanEmail = formData.email.toLowerCase().trim()

    const { data, error } = await supabase
      .from('admin_staff')
      .insert({
        email: cleanEmail,
        full_name: formData.fullName.trim(),
        role: formData.role,
        status: 'active',
        permissions: ['*'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) return { success: false, error: error.message }

    await logAdminActivity({
      staff_email: formData.authorStaffEmail,
      action: 'STAFF_MEMBER_CREATED',
      target_type: 'staff',
      target_id: data.id,
      details: { email: cleanEmail, role: formData.role },
    })

    revalidatePath('/staff')
    return { success: true, staff: data }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function updateStaffMemberAction(formData: {
  staffId: string
  role: StaffRole
  status: 'active' | 'suspended'
  authorStaffEmail: string
}) {
  try {
    const supabase = getAdminClient()
    const { error } = await supabase
      .from('admin_staff')
      .update({
        role: formData.role,
        status: formData.status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', formData.staffId)

    if (error) return { success: false, error: error.message }

    await logAdminActivity({
      staff_email: formData.authorStaffEmail,
      action: 'STAFF_MEMBER_UPDATED',
      target_type: 'staff',
      target_id: formData.staffId,
      details: { role: formData.role, status: formData.status },
    })

    revalidatePath('/staff')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function getAuditLogsAction(limit: number = 50) {
  try {
    const supabase = getAdminClient()
    const { data, error } = await supabase
      .from('admin_audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) return { success: false, error: error.message, logs: [] }

    return { success: true, logs: data || [] }
  } catch (err: any) {
    return { success: false, error: err.message, logs: [] }
  }
}
