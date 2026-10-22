import { getStaffMembersAction, getAuditLogsAction } from '@/actions/staffActions'
import { StaffClient } from './StaffClient'
import { AdminHeader } from '@/components/layout/AdminHeader'

export const revalidate = 0

export default async function StaffPage() {
  const [staffRes, auditRes] = await Promise.all([
    getStaffMembersAction(),
    getAuditLogsAction(60),
  ])

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader
        title="Staff Base Roles & Access Control (RBAC)"
        subtitle="Manage Staff Permissions, Operational Roles, System Governance & Immutable Audit Logs"
      />
      <main className="p-8 flex-1">
        <StaffClient
          initialStaff={staffRes.staff || []}
          initialLogs={auditRes.logs || []}
        />
      </main>
    </div>
  )
}
