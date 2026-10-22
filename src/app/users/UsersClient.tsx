'use client'

import React, { useState, useTransition } from 'react'
import {
  Users,
  Search,
  Mail,
  Phone,
  MapPin,
  Building,
  ShoppingBag,
  Key,
  Laptop,
  Coins,
  Wallet,
  X,
  Edit,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  Calendar,
} from 'lucide-react'
import {
  UserSummary,
  getUsersAction,
  getUserDetailsAction,
  updateUserProfileAction,
} from '@/actions/userActions'

interface UsersClientProps {
  initialUsers: UserSummary[]
  totalUsers: number
}

export function UsersClient({ initialUsers, totalUsers }: UsersClientProps) {
  const [users, setUsers] = useState<UserSummary[]>(initialUsers)
  const [search, setSearch] = useState('')
  const [isPending, startTransition] = useTransition()

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [totalCount, setTotalCount] = useState(totalUsers)

  // Drawer / Modals
  const [selectedUser, setSelectedUser] = useState<UserSummary | null>(null)
  const [userDetails, setUserDetails] = useState<{
    profile: any
    purchases: any[]
    activations: any[]
  } | null>(null)
  const [isLoadingDetails, setIsLoadingDetails] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [notification, setNotification] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  // Edit Form State
  const [editForm, setEditForm] = useState({
    fullName: '',
    phoneNumber: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    companyName: '',
    companyVat: '',
  })

  // Pagination math
  const totalPages = Math.ceil(totalCount / pageSize) || 1
  const startItem = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const endItem = Math.min(currentPage * pageSize, totalCount)

  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      if (currentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, '...', totalPages)
      } else if (currentPage >= totalPages - 3) {
        pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages)
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages)
      }
    }
    return pages
  }
  const pageNumbers = getPageNumbers()

  // Handle Page Change
  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return
    setCurrentPage(newPage)
    startTransition(async () => {
      const res = await getUsersAction({ page: newPage, pageSize, search })
      if (res.success) {
        setUsers(res.data)
        setTotalCount(res.total)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    })
  }

  // Handle Search
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    startTransition(async () => {
      const res = await getUsersAction({ search, page: 1, pageSize })
      if (res.success) {
        setUsers(res.data)
        setTotalCount(res.total)
      }
    })
  }

  // Open User Detail Drawer
  const handleSelectUser = async (user: UserSummary) => {
    setSelectedUser(user)
    setIsLoadingDetails(true)
    const res = await getUserDetailsAction(user.id)
    if (res.success && res.profile) {
      setUserDetails({
        profile: res.profile,
        purchases: res.purchases || [],
        activations: res.activations || [],
      })
      setEditForm({
        fullName: res.profile.full_name || '',
        phoneNumber: res.profile.phone_number || '',
        addressLine1: res.profile.address_line1 || '',
        addressLine2: res.profile.address_line2 || '',
        city: res.profile.city || '',
        state: res.profile.state || '',
        postalCode: res.profile.postal_code || '',
        country: res.profile.country || '',
        companyName: res.profile.company_name || '',
        companyVat: res.profile.company_vat || '',
      })
    }
    setIsLoadingDetails(false)
  }

  // Save Edit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUser) return

    startTransition(async () => {
      const res = await updateUserProfileAction({
        userId: selectedUser.id,
        ...editForm,
        staffEmail: 'naiemshaikhofficial@gmail.com',
      })

      if (res.success) {
        setNotification({ text: 'Customer profile & address updated successfully', type: 'success' })
        setIsEditOpen(false)
        // Refresh details
        const refreshed = await getUserDetailsAction(selectedUser.id)
        if (refreshed.success && refreshed.profile) {
          setUserDetails({
            profile: refreshed.profile,
            purchases: refreshed.purchases || [],
            activations: refreshed.activations || [],
          })
        }
        // Refresh users list
        const listRes = await getUsersAction({ page: currentPage, pageSize, search })
        if (listRes.success) setUsers(listRes.data)
      } else {
        setNotification({ text: res.error || 'Failed to update profile', type: 'error' })
      }
    })
  }

  // Metrics
  const totalBuyers = users.filter((u) => u.purchase_count > 0).length
  const totalGMV = users.reduce((acc, u) => acc + u.total_spent, 0)

  return (
    <div className="space-y-6">
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

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="epic-card p-5 space-y-1">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[11px] font-mono uppercase tracking-wider font-semibold">Total Accounts</span>
            <Users className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-white">{totalCount}</div>
          <p className="text-[11px] text-zinc-500">Registered customers on ProducerToy</p>
        </div>

        <div className="epic-card p-5 space-y-1">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[11px] font-mono uppercase tracking-wider font-semibold">Paying Customers</span>
            <ShoppingBag className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-white">{totalBuyers}</div>
          <p className="text-[11px] text-zinc-500">Accounts with at least 1 verified purchase</p>
        </div>

        <div className="epic-card p-5 space-y-1">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[11px] font-mono uppercase tracking-wider font-semibold">Cumulative Spend</span>
            <Wallet className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-white">${totalGMV.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
          <p className="text-[11px] text-zinc-500">Current visible page volume</p>
        </div>
      </div>

      {/* Search & Action Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="flex-1 w-full max-w-md relative">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by customer name, email, phone, city, country..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="epic-input pl-9"
          />
        </form>

        <div className="text-xs font-mono text-zinc-400">
          Showing {users.length} of {totalCount} Customers
        </div>
      </div>

      {/* Customers Table */}
      <div className="epic-card p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#181818] text-zinc-400 font-mono uppercase text-[10px] border-b border-[#2a2a2a]">
              <tr>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-3">Location / Country</th>
                <th className="py-3 px-3">Phone</th>
                <th className="py-3 px-3 text-right">Orders</th>
                <th className="py-3 px-3 text-right">Total Spent</th>
                <th className="py-3 px-3 font-mono">Member Since</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2a2a]">
              {users.map((u) => {
                const initials = (u.full_name || u.email).slice(0, 2).toUpperCase()
                return (
                  <tr
                    key={u.id}
                    onClick={() => handleSelectUser(u)}
                    className="hover:bg-[#181818]/60 transition cursor-pointer"
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#202020] border border-[#2a2a2a] flex items-center justify-center font-bold text-xs text-white shrink-0">
                          {initials}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-white text-xs truncate">{u.full_name}</div>
                          <div className="text-[11px] text-zinc-400 font-mono truncate">{u.email}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-3">
                      <div className="text-zinc-300 font-medium">{u.country || 'Global / Web'}</div>
                      <div className="text-[10px] text-zinc-500 font-mono">{u.city || 'No city listed'}</div>
                    </td>

                    <td className="py-3.5 px-3 font-mono text-[11px] text-zinc-400">
                      {u.phone_number || '—'}
                    </td>

                    <td className="py-3.5 px-3 text-right font-mono font-bold text-white">
                      {u.purchase_count}
                    </td>

                    <td className="py-3.5 px-3 text-right font-mono font-bold text-white">
                      ${u.total_spent.toFixed(2)}
                    </td>

                    <td className="py-3.5 px-3 font-mono text-[11px] text-zinc-400">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleSelectUser(u)
                        }}
                        className="px-2.5 py-1 rounded bg-[#202020] hover:bg-[#2a2a2a] text-zinc-300 hover:text-white border border-[#2a2a2a] text-[11px] font-mono transition"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Numbered Pagination Toolbar */}
        {totalPages > 1 && (
          <div className="pt-6 mt-4 border-t border-[#242424] flex flex-col sm:flex-row items-center justify-between gap-4 select-none">
            <div className="text-xs font-mono text-zinc-400">
              Showing <strong className="text-white">{startItem}-{endItem}</strong> of <strong className="text-white">{totalCount}</strong> Users
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1 || isPending}
                className="p-2 rounded bg-[#181818] border border-[#2a2a2a] text-zinc-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition"
                title="Previous Page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {pageNumbers.map((p, idx) => {
                if (p === '...') {
                  return (
                    <span key={`dots-${idx}`} className="px-2 py-1 text-zinc-500 font-mono text-xs">
                      ...
                    </span>
                  )
                }
                const pageNum = Number(p)
                const isActive = pageNum === currentPage
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    disabled={isPending}
                    className={`min-w-[34px] h-[34px] px-2 rounded font-mono text-xs font-bold transition flex items-center justify-center ${
                      isActive
                        ? 'bg-white text-black shadow-sm'
                        : 'bg-[#181818] border border-[#2a2a2a] text-zinc-400 hover:text-white hover:bg-[#202020]'
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              })}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages || isPending}
                className="p-2 rounded bg-[#181818] border border-[#2a2a2a] text-zinc-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition"
                title="Next Page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Customer Full Detail Drawer / Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="epic-card bg-[#161616] max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-[#2a2a2a]">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-full bg-[#202020] border border-white/10 flex items-center justify-center text-sm font-bold text-white shrink-0">
                  {(selectedUser.full_name || selectedUser.email).slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">{selectedUser.full_name}</h3>
                  <div className="text-xs font-mono text-zinc-400 flex items-center gap-2 mt-0.5">
                    <span>{selectedUser.email}</span>
                    <span>•</span>
                    <span className="text-zinc-500">ID: {selectedUser.id.slice(0, 8)}...</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsEditOpen(true)}
                  className="px-3 py-1.5 rounded bg-[#202020] hover:bg-[#2a2a2a] text-zinc-300 hover:text-white border border-[#2a2a2a] text-xs font-medium flex items-center gap-1.5 transition"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Edit Details</span>
                </button>
                <button
                  onClick={() => {
                    setSelectedUser(null)
                    setUserDetails(null)
                  }}
                  className="p-1.5 text-zinc-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Address & Contact Information Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Billing Address Card */}
              <div className="p-4 rounded-lg bg-[#181818] border border-[#2a2a2a] space-y-2">
                <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-400">
                  <MapPin className="w-3.5 h-3.5 text-white" />
                  <span>Customer Address</span>
                </div>
                <div className="text-white space-y-0.5 pt-1">
                  <div>{userDetails?.profile?.address_line1 || selectedUser.address_line1 || 'No street address provided'}</div>
                  {userDetails?.profile?.address_line2 && (
                    <div className="text-zinc-400">{userDetails.profile.address_line2}</div>
                  )}
                  <div className="text-zinc-300">
                    {[
                      userDetails?.profile?.city || selectedUser.city,
                      userDetails?.profile?.state || selectedUser.state,
                      userDetails?.profile?.postal_code || selectedUser.postal_code,
                    ]
                      .filter(Boolean)
                      .join(', ') || 'No city/postal code'}
                  </div>
                  <div className="font-semibold text-white pt-1">
                    {userDetails?.profile?.country || selectedUser.country || 'Global'}
                  </div>
                </div>
              </div>

              {/* Contact & Balances Card */}
              <div className="p-4 rounded-lg bg-[#181818] border border-[#2a2a2a] space-y-3">
                <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-400">
                  <ShieldCheck className="w-3.5 h-3.5 text-white" />
                  <span>Account & Balances</span>
                </div>
                <div className="grid grid-cols-2 gap-2 font-mono">
                  <div className="p-2.5 rounded bg-[#202020] border border-[#2a2a2a]">
                    <div className="text-[10px] text-zinc-500 uppercase">Wallet Balance</div>
                    <div className="text-sm font-bold text-white mt-0.5">
                      ${Number(selectedUser.wallet_balance || 0).toFixed(2)}
                    </div>
                  </div>
                  <div className="p-2.5 rounded bg-[#202020] border border-[#2a2a2a]">
                    <div className="text-[10px] text-zinc-500 uppercase">Rewards Virtual Cash</div>
                    <div className="text-sm font-bold text-white mt-0.5">
                      ${Number(selectedUser.reward_balance || 0).toFixed(2)}
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-zinc-400 flex items-center justify-between pt-1">
                  <span>Phone: <strong className="text-white font-mono">{selectedUser.phone_number || 'None'}</strong></span>
                  <span>Joined: <strong className="text-white font-mono">{new Date(selectedUser.created_at).toLocaleDateString()}</strong></span>
                </div>
              </div>
            </div>

            {/* Purchase & Order History */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-zinc-400 font-bold">
                <span>Purchase History ({userDetails?.purchases?.length || 0} Orders)</span>
                <span className="text-white">
                  Total Spent: ${selectedUser.total_spent.toFixed(2)}
                </span>
              </div>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {userDetails?.purchases && userDetails.purchases.length > 0 ? (
                  userDetails.purchases.map((p) => (
                    <div
                      key={p.id}
                      className="p-3 rounded-lg bg-[#181818] border border-[#2a2a2a] flex items-center justify-between text-xs"
                    >
                      <div className="space-y-0.5 min-w-0">
                        <div className="font-bold text-white truncate">
                          {p.products?.name || 'Audio Product'}
                        </div>
                        <div className="text-[11px] text-zinc-400 font-mono">
                          {p.products?.brands?.name || 'ProducerToy'} • {new Date(p.purchased_at).toLocaleDateString()}
                        </div>
                        {p.serial_key && (
                          <div className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-300 pt-0.5">
                            <Key className="w-3 h-3 text-zinc-400" />
                            <span className="bg-[#222222] px-1.5 py-0.5 rounded border border-[#333333]">
                              {p.serial_key}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="text-right shrink-0 ml-4 font-mono">
                        <div className="font-bold text-white">
                          {p.currency === 'INR' ? '₹' : '$'}
                          {Number(p.amount_paid).toLocaleString()}
                        </div>
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white text-black font-bold uppercase">
                          Captured
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-xs text-zinc-500 font-mono bg-[#181818] rounded-lg border border-[#2a2a2a]">
                    No purchase history found for this customer account.
                  </div>
                )}
              </div>
            </div>

            {/* Hardware Machine Workstation Activations */}
            <div className="space-y-3">
              <div className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-bold">
                Hardware Workstation Seats ({userDetails?.activations?.length || 0})
              </div>

              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {userDetails?.activations && userDetails.activations.length > 0 ? (
                  userDetails.activations.map((act) => (
                    <div
                      key={act.id}
                      className="p-3 rounded-lg bg-[#181818] border border-[#2a2a2a] flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <Laptop className="w-4 h-4 text-zinc-400 shrink-0" />
                        <div>
                          <div className="font-bold text-white">{act.products?.name || 'Plugin Seat'}</div>
                          <div className="text-[10px] text-zinc-500 font-mono">{act.device_name || 'Machine Seat'}</div>
                        </div>
                      </div>

                      <span
                        className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${
                          act.is_active
                            ? 'bg-white text-black border-white'
                            : 'bg-[#262626] text-zinc-400 border-[#383838]'
                        }`}
                      >
                        {act.is_active ? 'CLAIMED' : 'REVOKED'}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-xs text-zinc-500 font-mono bg-[#181818] rounded-lg border border-[#2a2a2a]">
                    No machine seats bound to this customer.
                  </div>
                )}
              </div>
            </div>

            {/* Close Button */}
            <div className="flex items-center justify-end pt-4 border-t border-[#2a2a2a]">
              <button
                onClick={() => {
                  setSelectedUser(null)
                  setUserDetails(null)
                }}
                className="epic-btn-outline"
              >
                Close Customer File
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Customer Profile Modal */}
      {isEditOpen && selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleEditSubmit}
            className="epic-card bg-[#181818] max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#2a2a2a]">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                Edit Customer File: {selectedUser.email}
              </h3>
              <button
                type="button"
                onClick={() => setIsEditOpen(false)}
                className="text-zinc-500 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="text-[11px] font-mono text-zinc-400 uppercase font-semibold">Full Name</label>
              <input
                type="text"
                required
                value={editForm.fullName}
                onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                className="epic-input mt-1 font-mono text-xs"
              />
            </div>

            <div>
              <label className="text-[11px] font-mono text-zinc-400 uppercase font-semibold">Phone Number</label>
              <input
                type="text"
                value={editForm.phoneNumber}
                onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value })}
                placeholder="+1 555-0199"
                className="epic-input mt-1 font-mono text-xs"
              />
            </div>

            <div>
              <label className="text-[11px] font-mono text-zinc-400 uppercase font-semibold">Address Line 1</label>
              <input
                type="text"
                value={editForm.addressLine1}
                onChange={(e) => setEditForm({ ...editForm, addressLine1: e.target.value })}
                placeholder="123 Music Ave, Studio 4"
                className="epic-input mt-1 font-mono text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-mono text-zinc-400 uppercase font-semibold">City</label>
                <input
                  type="text"
                  value={editForm.city}
                  onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                  className="epic-input mt-1 font-mono text-xs"
                />
              </div>
              <div>
                <label className="text-[11px] font-mono text-zinc-400 uppercase font-semibold">Postal Code</label>
                <input
                  type="text"
                  value={editForm.postalCode}
                  onChange={(e) => setEditForm({ ...editForm, postalCode: e.target.value })}
                  className="epic-input mt-1 font-mono text-xs"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-mono text-zinc-400 uppercase font-semibold">Country</label>
              <input
                type="text"
                value={editForm.country}
                onChange={(e) => setEditForm({ ...editForm, country: e.target.value })}
                placeholder="United States"
                className="epic-input mt-1 font-mono text-xs"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#2a2a2a]">
              <button
                type="button"
                onClick={() => setIsEditOpen(false)}
                className="epic-btn-outline"
              >
                Cancel
              </button>
              <button type="submit" disabled={isPending} className="epic-btn-primary">
                {isPending ? 'Saving...' : 'Save Customer Data'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
