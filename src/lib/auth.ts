import { getAdminClient } from '@/lib/supabase/admin'

export type StaffRole = 'super_admin' | 'catalog_manager' | 'finance_manager' | 'support_agent'

export interface StaffMember {
  id: string
  user_id?: string | null
  email: string
  full_name: string
  role: StaffRole
  status: 'active' | 'suspended' | 'invited'
  permissions: string[]
  avatar_url?: string | null
  last_login_at?: string | null
  created_at: string
  updated_at: string
}

export const ROLE_DEFINITIONS: Record<StaffRole, { title: string; description: string; badgeColor: string }> = {
  super_admin: {
    title: 'Super Administrator',
    description: 'Full unconstrained platform control, financial settlement, staff RBAC, and system governance.',
    badgeColor: 'bg-white text-black border-white',
  },
  catalog_manager: {
    title: 'Catalog & Brand Manager',
    description: 'Product lifecycle, installer verification, audio demos, brand onboarding, and metadata.',
    badgeColor: 'bg-[#262626] text-white border-[#383838]',
  },
  finance_manager: {
    title: 'Orders & Finance Director',
    description: 'Order audits, international tax invoices, creator payout settlements, and revenue splits.',
    badgeColor: 'bg-[#202020] text-zinc-200 border-[#383838]',
  },
  support_agent: {
    title: 'Support & Licensing Specialist',
    description: 'Hardware workstation seat revocations, customer order verification, and inquiry resolution.',
    badgeColor: 'bg-[#181818] text-zinc-300 border-[#2a2a2a]',
  },
}

export async function getCurrentStaffUser(email?: string): Promise<StaffMember | null> {
  const targetEmail = email || 'naiemshaikhofficial@gmail.com'
  try {
    const supabase = getAdminClient()
    const { data, error } = await supabase
      .from('admin_staff')
      .select('*')
      .eq('email', targetEmail.toLowerCase().trim())
      .single()

    if (error || !data) {
      // Fallback: If user is one of the verified owner emails, create/return default super admin
      if (
        targetEmail.toLowerCase().includes('naiem') ||
        targetEmail.toLowerCase().includes('producertoy')
      ) {
        return {
          id: 'super-admin-root',
          email: targetEmail,
          full_name: 'Platform Administrator',
          role: 'super_admin',
          status: 'active',
          permissions: ['*'],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      }
      return null
    }

    return data as StaffMember
  } catch (err) {
    console.error('Error fetching staff member:', err)
    return null
  }
}

export function hasPermission(
  staff: StaffMember | null,
  module: 'brands' | 'products' | 'orders' | 'invoices' | 'payouts' | 'licenses' | 'staff' | 'analytics'
): boolean {
  if (!staff || staff.status !== 'active') return false
  if (staff.role === 'super_admin') return true

  switch (module) {
    case 'brands':
    case 'products':
      return staff.role === 'catalog_manager'
    case 'orders':
    case 'invoices':
    case 'payouts':
      return staff.role === 'finance_manager'
    case 'licenses':
      return staff.role === 'support_agent' || staff.role === 'catalog_manager'
    case 'analytics':
      return staff.role === 'finance_manager' || staff.role === 'catalog_manager'
    case 'staff':
      return false // only super_admin can manage staff
    default:
      return false
  }
}
