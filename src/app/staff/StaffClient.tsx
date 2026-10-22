'use client'

import React, { useState, useTransition } from 'react'
import {
  Users2,
  Shield,
  ShieldCheck,
  UserPlus,
  Activity,
  CheckCircle,
  X,
  Lock,
  Edit,
  Sliders,
  FileCheck2,
} from 'lucide-react'
import { StaffMember, StaffRole, ROLE_DEFINITIONS } from '@/lib/auth'
import { createStaffMemberAction, updateStaffMemberAction } from '@/actions/staffActions'

interface StaffClientProps {
  initialStaff: StaffMember[]
  initialLogs: any[]
}

export function StaffClient({ initialStaff, initialLogs }: StaffClientProps) {
  const [staffList, setStaffList] = useState<StaffMember[]>(initialStaff)
  const [auditLogs, setAuditLogs] = useState<any[]>(initialLogs)
  const [isPending, startTransition] = useTransition()

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null)
  const [notification, setNotification] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  // Add Form
  const [addForm, setAddForm] = useState({
    email: '',
    fullName: '',
    role: 'catalog_manager' as StaffRole,
  })

  // Edit Form
  const [editRole, setEditRole] = useState<StaffRole>('catalog_manager')
  const [editStatus, setEditStatus] = useState<'active' | 'suspended'>('active')

  // Handle Add Staff
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    startTransition(async () => {
      const res = await createStaffMemberAction({
        ...addForm,
        authorStaffEmail: 'naiemshaikhofficial@gmail.com',
      })

      if (res.success && res.staff) {
        setNotification({ text: `Staff member ${res.staff.email} added successfully!`, type: 'success' })
        setIsAddOpen(false)
        setStaffList([res.staff, ...staffList])
        setAddForm({ email: '', fullName: '', role: 'catalog_manager' })
      } else {
        setNotification({ text: res.error || 'Failed to add staff member', type: 'error' })
      }
    })
  }

  // Handle Edit Staff
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedStaff) return

    startTransition(async () => {
      const res = await updateStaffMemberAction({
        staffId: selectedStaff.id,
        role: editRole,
        status: editStatus,
        authorStaffEmail: 'naiemshaikhofficial@gmail.com',
      })

      if (res.success) {
        setNotification({ text: `Staff role and status updated for ${selectedStaff.email}`, type: 'success' })
        setSelectedStaff(null)
        setStaffList((prev) =>
          prev.map((s) => (s.id === selectedStaff.id ? { ...s, role: editRole, status: editStatus } : s))
        )
      } else {
        setNotification({ text: res.error || 'Failed to update staff member', type: 'error' })
      }
    })
  }

  return (
    <div className="space-y-8">
      {/* Notification Banner */}
      {notification && (
        <div
          className={`p-4 rounded-lg flex items-center justify-between text-xs font-semibold ${
            notification.type === 'success'
              ? 'bg-[#202020] text-white border border-white/20'
              : 'bg-[#181818] text-zinc-300 border border-zinc-700'
          }`}
        >
          <span>{notification.text}</span>
          <button onClick={() => setNotification(null)} className="p-1 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Role Definitions Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {(Object.entries(ROLE_DEFINITIONS) as [StaffRole, any][]).map(([key, def]) => (
          <div key={key} className="epic-card p-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${def.badgeColor}`}>
                {key.replace('_', ' ')}
              </span>
              <ShieldCheck className="w-4 h-4 text-zinc-500" />
            </div>
            <h4 className="text-sm font-bold text-white pt-1">{def.title}</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">{def.description}</p>
          </div>
        ))}
      </div>

      {/* Staff Directory Table */}
      <div className="epic-card p-6">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#2a2a2a]">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">Active Staff Members</h2>
            <p className="text-xs text-zinc-400 mt-0.5">Role assignments and permissions</p>
          </div>
          <button onClick={() => setIsAddOpen(true)} className="epic-btn-primary">
            <UserPlus className="w-4 h-4" />
            <span>Add Staff Member</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#181818] text-zinc-400 font-mono uppercase text-[10px] border-b border-[#2a2a2a]">
              <tr>
                <th className="py-3 px-4">Staff Member</th>
                <th className="py-3 px-3">Role & Privileges</th>
                <th className="py-3 px-3 font-mono">Status</th>
                <th className="py-3 px-3 font-mono">Member Since</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2a2a]">
              {staffList.map((member) => {
                const roleDef = ROLE_DEFINITIONS[member.role] || ROLE_DEFINITIONS.catalog_manager
                return (
                  <tr key={member.id} className="hover:bg-[#181818]/60 transition">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#2a2a2a] border border-white/10 flex items-center justify-center font-bold text-xs text-white">
                          {member.full_name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-white text-xs">{member.full_name}</div>
                          <div className="text-[11px] text-zinc-400 font-mono">{member.email}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-3">
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${roleDef.badgeColor}`}>
                        {roleDef.title}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 font-mono">
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase ${
                          member.status === 'active'
                            ? 'bg-white text-black border-white'
                            : 'bg-[#262626] text-zinc-400 border-[#383838]'
                        }`}
                      >
                        {member.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 font-mono text-[11px] text-zinc-400">
                      {new Date(member.created_at).toLocaleDateString()}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedStaff(member)
                          setEditRole(member.role)
                          setEditStatus(member.status as any)
                        }}
                        className="px-2.5 py-1 rounded bg-[#202020] hover:bg-[#2a2a2a] text-zinc-300 hover:text-white border border-[#2a2a2a] text-[11px] font-mono transition"
                      >
                        Edit Role
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Immutable Audit Logs Stream */}
      <div className="epic-card p-6">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#2a2a2a]">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">System Governance & Audit Logs</h2>
            <p className="text-xs text-zinc-400 mt-0.5">Immutable record of admin actions across catalog, orders, and settlements</p>
          </div>
          <span className="text-xs font-mono text-zinc-400">{auditLogs.length} events logged</span>
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
          {auditLogs.length > 0 ? (
            auditLogs.map((log) => (
              <div key={log.id} className="p-3 rounded bg-[#181818] border border-[#2a2a2a] flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-3">
                  <Activity className="w-4 h-4 text-zinc-500" />
                  <div>
                    <span className="font-bold text-white uppercase text-[11px]">{log.action}</span>
                    <span className="text-zinc-500 mx-2">•</span>
                    <span className="text-zinc-400">{log.staff_email}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-right">
                  {log.target_type && (
                    <span className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 text-[10px] uppercase">
                      {log.target_type}
                    </span>
                  )}
                  <span className="text-[10px] text-zinc-500">
                    {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}{' '}
                    {new Date(log.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-xs font-mono text-zinc-500">No audit log records yet.</div>
          )}
        </div>
      </div>

      {/* Add Staff Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleAddSubmit} className="epic-card bg-[#181818] max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#2a2a2a]">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">Add Staff Member</h3>
              <button type="button" onClick={() => setIsAddOpen(false)} className="text-zinc-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="text-[11px] font-mono text-zinc-400 uppercase font-semibold">Full Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Alex Rivera"
                value={addForm.fullName}
                onChange={(e) => setAddForm({ ...addForm, fullName: e.target.value })}
                className="epic-input mt-1"
              />
            </div>

            <div>
              <label className="text-[11px] font-mono text-zinc-400 uppercase font-semibold">Email Address</label>
              <input
                type="email"
                required
                placeholder="alex@producertoy.com"
                value={addForm.email}
                onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                className="epic-input mt-1 font-mono text-xs"
              />
            </div>

            <div>
              <label className="text-[11px] font-mono text-zinc-400 uppercase font-semibold">Operational Role</label>
              <select
                value={addForm.role}
                onChange={(e: any) => setAddForm({ ...addForm, role: e.target.value })}
                className="epic-input mt-1 font-mono text-xs"
              >
                <option value="catalog_manager">Catalog & Brand Manager</option>
                <option value="editorial_team">Editorial & News Director</option>
                <option value="finance_manager">Orders & Finance Director</option>
                <option value="support_agent">Support & Licensing Specialist</option>
                <option value="super_admin">Super Administrator</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#2a2a2a]">
              <button type="button" onClick={() => setIsAddOpen(false)} className="epic-btn-outline">
                Cancel
              </button>
              <button type="submit" disabled={isPending} className="epic-btn-primary">
                {isPending ? 'Adding...' : 'Add Staff Member'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Staff Modal */}
      {selectedStaff && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleEditSubmit} className="epic-card bg-[#181818] max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#2a2a2a]">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                Edit Staff: {selectedStaff.full_name}
              </h3>
              <button type="button" onClick={() => setSelectedStaff(null)} className="text-zinc-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 rounded bg-[#202020] border border-[#2a2a2a] text-xs">
              <div className="text-zinc-400">Email: <strong className="text-white font-mono">{selectedStaff.email}</strong></div>
            </div>

            <div>
              <label className="text-[11px] font-mono text-zinc-400 uppercase font-semibold">Assigned Role</label>
              <select
                value={editRole}
                onChange={(e: any) => setEditRole(e.target.value)}
                className="epic-input mt-1 font-mono text-xs"
              >
                <option value="catalog_manager">Catalog & Brand Manager</option>
                <option value="editorial_team">Editorial & News Director</option>
                <option value="finance_manager">Orders & Finance Director</option>
                <option value="support_agent">Support & Licensing Specialist</option>
                <option value="super_admin">Super Administrator</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-mono text-zinc-400 uppercase font-semibold">Account Status</label>
              <select
                value={editStatus}
                onChange={(e: any) => setEditStatus(e.target.value)}
                className="epic-input mt-1 font-mono text-xs"
              >
                <option value="active">Active (Access Granted)</option>
                <option value="suspended">Suspended (Access Revoked)</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#2a2a2a]">
              <button type="button" onClick={() => setSelectedStaff(null)} className="epic-btn-outline">
                Cancel
              </button>
              <button type="submit" disabled={isPending} className="epic-btn-primary">
                {isPending ? 'Saving...' : 'Update Staff Member'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
