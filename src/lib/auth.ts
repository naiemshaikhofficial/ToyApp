import { getAdminClient } from '@/lib/supabase/admin'
import { getUser } from '@/lib/supabase/server'
export * from './auth-types'
import type { StaffMember, AdminModule } from './auth-types'
import { hasPermission } from './auth-types'

/**
 * Retrieves staff member profile strictly for the authenticated session or provided email
 */
export async function getCurrentStaffUser(email?: string): Promise<StaffMember | null> {
  try {
    let targetEmail = email?.trim().toLowerCase()

    if (!targetEmail) {
      const { data: { user } } = await getUser()
      if (!user?.email) return null
      targetEmail = user.email.trim().toLowerCase()
    }

    const supabase = getAdminClient()
    const { data, error } = await supabase
      .from('admin_staff')
      .select('*')
      .eq('email', targetEmail)
      .eq('status', 'active')
      .maybeSingle()

    if (error || !data) {
      return null
    }

    return data as StaffMember
  } catch (err) {
    console.error('Error fetching staff member:', err)
    return null
  }
}

/**
 * Strict server-side RBAC guard for server actions & route handlers.
 * Verifies that the caller has a valid session cookie and is an active staff member in admin_staff.
 */
export async function requireAuthenticatedStaff(module?: AdminModule): Promise<StaffMember> {
  const { data: { user } } = await getUser()

  if (!user || !user.email) {
    throw new Error('Unauthorized: Administrative sign-in required.')
  }

  const staff = await getCurrentStaffUser(user.email)

  if (!staff || staff.status !== 'active') {
    throw new Error('Forbidden: Your account is not authorized as active ProducerToy administrative staff.')
  }

  if (module && !hasPermission(staff, module)) {
    throw new Error(`Forbidden: Your role (${staff.role}) does not have permission to access the ${module} module.`)
  }

  return staff
}
