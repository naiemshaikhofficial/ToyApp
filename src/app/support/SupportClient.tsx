'use client'

import React, { useState, useEffect, useTransition } from 'react'
import {
  LifeBuoy,
  Search,
  Mail,
  User,
  Clock,
  CheckCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Send,
  X,
  Laptop,
  Music,
  Receipt,
  MessageSquare,
  ShieldAlert,
  ArrowUpRight,
  ArrowDownRight,
  RotateCcw,
  Building2,
  Code2,
  Flame,
  Bot,
} from 'lucide-react'
import {
  SupportTicketSummary,
  getSupportTicketsAction,
  getTicketDetailsAction,
  updateTicketStatusAction,
  replyToTicketAction,
  escalateTicketToDeveloperAction,
  escalateTicketToTeamAction,
  deescalateTicketAction,
  getBrandsListForSupportAction,
  autoRouteTicketWithAIAction,
} from '@/actions/supportActions'

interface SupportClientProps {
  initialTickets: SupportTicketSummary[]
  totalTickets: number
}

type AudienceType = 'ALL' | 'DEVELOPER' | 'CUSTOMER' | 'ESCALATED_TEAM' | 'ESCALATED_DEV'

export function SupportClient({ initialTickets, totalTickets }: SupportClientProps) {
  const [tickets, setTickets] = useState<SupportTicketSummary[]>(initialTickets)
  const [search, setSearch] = useState('')
  const [activeAudience, setActiveAudience] = useState<AudienceType>('ALL')
  const [activeStatus, setActiveStatus] = useState<string>('ALL')
  const [isPending, startTransition] = useTransition()

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [totalCount, setTotalCount] = useState(totalTickets)

  // Drawer / Modals
  const [selectedTicket, setSelectedTicket] = useState<SupportTicketSummary | null>(null)
  const [ticketMessages, setTicketMessages] = useState<any[]>([])
  const [isLoadingDetails, setIsLoadingDetails] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [isSendingReply, setIsSendingReply] = useState(false)
  const [notification, setNotification] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  // Escalation Modals State
  const [showEscalateDevModal, setShowEscalateDevModal] = useState(false)
  const [showEscalateTeamModal, setShowEscalateTeamModal] = useState(false)
  const [brandsList, setBrandsList] = useState<{ id: string; name: string; slug: string; support_email: string | null }[]>([])
  const [selectedBrandName, setSelectedBrandName] = useState('')
  const [escalateDevEmail, setEscalateDevEmail] = useState('')
  const [escalateDevNotes, setEscalateDevNotes] = useState('')
  const [escalateTeamReason, setEscalateTeamReason] = useState('')
  const [isEscalating, setIsEscalating] = useState(false)

  // Load brands on mount
  useEffect(() => {
    getBrandsListForSupportAction().then((res) => {
      if (res.success && res.brands) {
        setBrandsList(res.brands)
        if (res.brands.length > 0) {
          setSelectedBrandName(res.brands[0].name)
          setEscalateDevEmail(res.brands[0].support_email || '')
        }
      }
    })
  }, [])

  // Pagination calculations
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

  // Fetch tickets helper
  const refetchTickets = (page = currentPage, audience = activeAudience, status = activeStatus, query = search) => {
    startTransition(async () => {
      const res = await getSupportTicketsAction({
        audience,
        status,
        search: query,
        page,
        pageSize,
      })
      if (res.success) {
        setTickets(res.data)
        setTotalCount(res.total)
      }
    })
  }

  // Handle Audience Filter Change
  const handleAudienceChange = (aud: AudienceType) => {
    setActiveAudience(aud)
    setCurrentPage(1)
    refetchTickets(1, aud, activeStatus, search)
  }

  // Handle Status Filter Change
  const handleStatusFilter = (status: string) => {
    setActiveStatus(status)
    setCurrentPage(1)
    refetchTickets(1, activeAudience, status, search)
  }

  // Handle Page Change
  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return
    setCurrentPage(newPage)
    refetchTickets(newPage, activeAudience, activeStatus, search)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Handle Search
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    refetchTickets(1, activeAudience, activeStatus, search)
  }

  // Open Ticket Drawer
  const handleSelectTicket = async (t: SupportTicketSummary) => {
    setSelectedTicket(t)
    setIsLoadingDetails(true)
    const res = await getTicketDetailsAction(t.id)
    if (res.success && res.ticket) {
      setSelectedTicket(res.ticket)
      setTicketMessages(res.messages || [])
    }
    setIsLoadingDetails(false)
  }

  // Send Normal Reply
  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!replyText.trim() || !selectedTicket) return

    setIsSendingReply(true)
    const res = await replyToTicketAction(
      selectedTicket.id,
      replyText,
      'ProducerToy Support',
      'naiemshaikhofficial@gmail.com'
    )

    if (res.success && res.message) {
      setTicketMessages([...ticketMessages, res.message])
      setReplyText('')
      setNotification({ text: 'Response dispatched to ticket thread', type: 'success' })
      if (selectedTicket.status === 'OPEN') {
        setSelectedTicket({ ...selectedTicket, status: 'IN_PROGRESS' })
      }
    } else {
      setNotification({ text: res.error || 'Failed to send reply', type: 'error' })
    }
    setIsSendingReply(false)
  }

  // Update Status
  const handleUpdateStatus = async (newStatus: string) => {
    if (!selectedTicket) return

    startTransition(async () => {
      const res = await updateTicketStatusAction(
        selectedTicket.id,
        newStatus,
        'naiemshaikhofficial@gmail.com'
      )

      if (res.success) {
        setSelectedTicket({ ...selectedTicket, status: newStatus.toUpperCase() })
        setNotification({ text: `Ticket marked as ${newStatus}`, type: 'success' })
        refetchTickets()
      } else {
        setNotification({ text: res.error || 'Failed to update status', type: 'error' })
      }
    })
  }

  // Escalate to Developer Submit
  const handleEscalateToDevSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTicket || !selectedBrandName || !escalateDevNotes.trim()) return

    setIsEscalating(true)
    const foundBrand = brandsList.find((b) => b.name === selectedBrandName)
    const res = await escalateTicketToDeveloperAction({
      ticketId: selectedTicket.id,
      brandId: foundBrand?.id,
      brandName: selectedBrandName,
      developerEmail: escalateDevEmail.trim() || undefined,
      notes: escalateDevNotes,
      staffEmail: 'naiemshaikhofficial@gmail.com',
    })

    if (res.success && res.message) {
      setSelectedTicket({ ...selectedTicket, status: 'ESCALATED_TO_DEV', priority: 'HIGH', brand_id: foundBrand?.id })
      setTicketMessages([...ticketMessages, res.message])
      setShowEscalateDevModal(false)
      setEscalateDevNotes('')
      setNotification({
        text: `Issue escalated directly to brand creator "${selectedBrandName}".`,
        type: 'success',
      })
      refetchTickets()
    } else {
      setNotification({ text: res.error || 'Failed to escalate to developer', type: 'error' })
    }
    setIsEscalating(false)
  }

  // 1-Click AI Auto-Route
  const [isAutoRouting, setIsAutoRouting] = useState(false)
  const handleAutoRouteWithAI = async () => {
    if (!selectedTicket) return
    setIsAutoRouting(true)
    try {
      const res = await autoRouteTicketWithAIAction(selectedTicket.id)
      if (res.success && res.routed) {
        setNotification({
          text: `Auto-routed to ${res.brandName} (${res.reasoning})`,
          type: 'success',
        })
        refetchTickets()
      } else {
        setNotification({
          text: res.reasoning || res.error || 'Classified as platform inquiry (no brand match).',
          type: 'error',
        })
      }
    } catch (err: any) {
      setNotification({ text: err.message || 'Auto-routing failed', type: 'error' })
    } finally {
      setIsAutoRouting(false)
    }
  }

  // Escalate to Core Team Submit
  const handleEscalateToTeamSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTicket || !escalateTeamReason.trim()) return

    setIsEscalating(true)
    const res = await escalateTicketToTeamAction({
      ticketId: selectedTicket.id,
      reason: escalateTeamReason,
      staffEmail: 'naiemshaikhofficial@gmail.com',
    })

    if (res.success && res.message) {
      setSelectedTicket({ ...selectedTicket, status: 'ESCALATED_TO_TEAM', priority: 'URGENT' })
      setTicketMessages([...ticketMessages, res.message])
      setShowEscalateTeamModal(false)
      setEscalateTeamReason('')
      setNotification({
        text: 'Ticket escalated to ProducerToy Core Engineering & Super Admin.',
        type: 'success',
      })
      refetchTickets()
    } else {
      setNotification({ text: res.error || 'Failed to escalate to core team', type: 'error' })
    }
    setIsEscalating(false)
  }

  // De-escalate to Normal In Progress
  const handleDeescalate = async () => {
    if (!selectedTicket) return
    setIsEscalating(true)
    const res = await deescalateTicketAction({
      ticketId: selectedTicket.id,
      staffEmail: 'naiemshaikhofficial@gmail.com',
    })

    if (res.success && res.message) {
      setSelectedTicket({ ...selectedTicket, status: 'IN_PROGRESS' })
      setTicketMessages([...ticketMessages, res.message])
      setNotification({ text: 'Ticket de-escalated to standard In Progress.', type: 'success' })
      refetchTickets()
    } else {
      setNotification({ text: res.error || 'Failed to de-escalate ticket', type: 'error' })
    }
    setIsEscalating(false)
  }

  // Helper to detect if a ticket is from a Developer
  const isDeveloperTicket = (t: SupportTicketSummary) => {
    return (
      t.category === 'DEVELOPER' ||
      t.ticket_number.startsWith('DEV-') ||
      t.subject.toLowerCase().includes('[brand application]') ||
      t.subject.toLowerCase().includes('vst') ||
      t.subject.toLowerCase().includes('developer')
    )
  }

  // Metrics
  const devTicketCount = tickets.filter(isDeveloperTicket).length
  const customerTicketCount = tickets.filter((t) => !isDeveloperTicket(t)).length
  const escalatedTeamCount = tickets.filter(
    (t) => t.status === 'ESCALATED_TO_TEAM' || t.priority === 'URGENT'
  ).length
  const escalatedDevCount = tickets.filter((t) => t.status === 'ESCALATED_TO_DEV').length

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
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

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="epic-card p-5 space-y-1">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[11px] font-mono uppercase tracking-wider font-semibold">
              Total Support Queue
            </span>
            <LifeBuoy className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-white">{totalCount}</div>
          <p className="text-[11px] text-zinc-500">Developer + Customer Inquiries</p>
        </div>

        <div className="epic-card p-5 space-y-1">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[11px] font-mono uppercase tracking-wider font-semibold">
              Developer Priority Desk
            </span>
            <Code2 className="w-4 h-4 text-white" />
          </div>
          <div className="text-2xl font-black text-white">{devTicketCount}</div>
          <p className="text-[11px] text-zinc-500">Toy Creators & VST DSP Issues</p>
        </div>

        <div className="epic-card p-5 space-y-1">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[11px] font-mono uppercase tracking-wider font-semibold">
              Escalated to Core Team
            </span>
            <Flame className="w-4 h-4 text-white" />
          </div>
          <div className="text-2xl font-black text-white">{escalatedTeamCount}</div>
          <p className="text-[11px] text-zinc-500">Super Admin & Senior Engineering</p>
        </div>

        <div className="epic-card p-5 space-y-1">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[11px] font-mono uppercase tracking-wider font-semibold">
              Escalated to Creator
            </span>
            <ArrowUpRight className="w-4 h-4 text-white" />
          </div>
          <div className="text-2xl font-black text-white">{escalatedDevCount}</div>
          <p className="text-[11px] text-zinc-500">User issues routed to plugin developer</p>
        </div>
      </div>

      {/* Audience Filter Bar (Developer vs Customer vs Escalations) */}
      <div className="bg-[#181818] border border-[#2a2a2a] p-3 rounded-xl flex items-center gap-2 overflow-x-auto">
        <span className="text-[10px] font-mono uppercase text-zinc-500 font-bold px-2 whitespace-nowrap">
          Queue:
        </span>
        {[
          { id: 'ALL', label: 'All Inquiries' },
          { id: 'DEVELOPER', label: 'Toy Creator / Developer Issues' },
          { id: 'CUSTOMER', label: 'End-User Customer Tickets' },
          { id: 'ESCALATED_TEAM', label: 'Escalated to ProducerToy Team' },
          { id: 'ESCALATED_DEV', label: 'Escalated to Creator / Brand' },
        ].map((item) => {
          const isActive = activeAudience === item.id
          return (
            <button
              key={item.id}
              onClick={() => handleAudienceChange(item.id as AudienceType)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase tracking-wider whitespace-nowrap transition border ${
                isActive
                  ? 'bg-white text-black border-white shadow-sm'
                  : 'bg-[#121212] text-zinc-400 border-[#2a2a2a] hover:text-white hover:border-zinc-500'
              }`}
            >
              {item.label}
            </button>
          )
        })}
      </div>

      {/* Status Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-lg bg-[#181818] border border-[#2a2a2a] overflow-x-auto w-full sm:w-auto">
          {['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map((st) => (
            <button
              key={st}
              onClick={() => handleStatusFilter(st)}
              className={`px-3 py-1.5 rounded-md text-xs font-mono font-bold transition whitespace-nowrap uppercase ${
                activeStatus === st
                  ? 'bg-white text-black shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="w-full sm:max-w-xs relative">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search tickets, email, DAW, brand..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="epic-input pl-9"
          />
        </form>
      </div>

      {/* Tickets Table */}
      <div className="epic-card p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#181818] text-zinc-400 font-mono uppercase text-[10px] border-b border-[#2a2a2a]">
              <tr>
                <th className="py-3 px-4">Ticket Number</th>
                <th className="py-3 px-3">Subject / Summary</th>
                <th className="py-3 px-3">Audience / Role</th>
                <th className="py-3 px-3 font-mono">Status</th>
                <th className="py-3 px-3 font-mono">Priority</th>
                <th className="py-3 px-3 font-mono">Created</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2a2a]">
              {tickets.length > 0 ? (
                tickets.map((t) => {
                  const isDev = isDeveloperTicket(t)
                  const isEscalatedTeam = t.status === 'ESCALATED_TO_TEAM'
                  const isEscalatedDev = t.status === 'ESCALATED_TO_DEV'

                  return (
                    <tr
                      key={t.id}
                      onClick={() => handleSelectTicket(t)}
                      className="hover:bg-[#181818]/60 transition cursor-pointer"
                    >
                      {/* Ticket Number & Inquirer */}
                      <td className="py-3.5 px-4 font-mono">
                        <div className="font-bold text-white text-xs">{t.ticket_number}</div>
                        <div className="text-[11px] text-zinc-400 font-sans truncate max-w-[140px]">
                          {t.name}
                        </div>
                      </td>

                      {/* Subject & Email */}
                      <td className="py-3.5 px-3 max-w-sm">
                        <div className="font-bold text-white text-xs truncate">{t.subject}</div>
                        <div className="text-[11px] text-zinc-400 font-mono truncate">{t.email}</div>
                      </td>

                      {/* Audience Badge */}
                      <td className="py-3.5 px-3">
                        {isDev ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white text-black border border-white text-[10px] font-mono uppercase font-bold">
                            <Code2 className="w-3 h-3" />
                            <span>CREATOR / DEV</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#202020] text-zinc-300 border border-[#333] text-[10px] font-mono uppercase font-bold">
                            <User className="w-3 h-3" />
                            <span>CUSTOMER</span>
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-3 font-mono">
                        {isEscalatedTeam ? (
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded bg-white text-black border border-white uppercase animate-pulse">
                            <Flame className="w-3 h-3 fill-black" />
                            <span>ESCALATED (TEAM)</span>
                          </span>
                        ) : isEscalatedDev ? (
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded bg-[#2a2a2a] text-white border border-[#444] uppercase">
                            <ArrowUpRight className="w-3 h-3" />
                            <span>ESCALATED (CREATOR)</span>
                          </span>
                        ) : (
                          <span
                            className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase ${
                              t.status === 'OPEN'
                                ? 'bg-white text-black border-white'
                                : t.status === 'IN_PROGRESS'
                                ? 'bg-[#2a2a2a] text-white border-[#383838]'
                                : 'bg-[#181818] text-zinc-400 border-[#2a2a2a]'
                            }`}
                          >
                            {t.status.replace('_', ' ')}
                          </span>
                        )}
                      </td>

                      {/* Priority */}
                      <td className="py-3.5 px-3 font-mono">
                        <span
                          className={`text-[10px] font-semibold uppercase ${
                            t.priority === 'URGENT' || t.priority === 'HIGH'
                              ? 'text-white font-bold'
                              : 'text-zinc-400'
                          }`}
                        >
                          {t.priority}
                        </span>
                      </td>

                      {/* Created Date */}
                      <td className="py-3.5 px-3 font-mono text-[11px] text-zinc-400">
                        {new Date(t.created_at).toLocaleDateString()}
                      </td>

                      {/* Action Button */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleSelectTicket(t)
                          }}
                          className="px-2.5 py-1 rounded bg-[#202020] hover:bg-[#2a2a2a] text-zinc-300 hover:text-white border border-[#2a2a2a] text-[11px] font-mono transition"
                        >
                          Manage Ticket
                        </button>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-zinc-500 font-mono text-xs">
                    No support tickets match the current filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Numbered Pagination Toolbar */}
        {totalPages > 1 && (
          <div className="pt-6 mt-4 border-t border-[#242424] flex flex-col sm:flex-row items-center justify-between gap-4 select-none">
            <div className="text-xs font-mono text-zinc-400">
              Showing <strong className="text-white">{startItem}-{endItem}</strong> of{' '}
              <strong className="text-white">{totalCount}</strong> Tickets
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

      {/* Ticket Details & Conversation Drawer */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="epic-card bg-[#161616] max-w-3xl w-full p-6 max-h-[92vh] overflow-y-auto space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-[#2a2a2a]">
              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-xs font-mono font-bold text-white bg-[#262626] px-2 py-0.5 rounded border border-[#383838]">
                    {selectedTicket.ticket_number}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded border bg-white text-black font-bold uppercase">
                    {selectedTicket.status.replace('_', ' ')}
                  </span>
                  <span className="text-[10px] font-mono text-zinc-400 uppercase">
                    Priority: {selectedTicket.priority}
                  </span>
                  {isDeveloperTicket(selectedTicket) ? (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-[#444] bg-[#222] text-white">
                      Toy Creator / Brand Partner
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-[#333] bg-[#1a1a1a] text-zinc-400">
                      Standard Customer
                    </span>
                  )}
                </div>
                <h3 className="text-base font-extrabold text-white mt-1.5">{selectedTicket.subject}</h3>
                <p className="text-xs text-zinc-400 font-mono mt-0.5">
                  From: {selectedTicket.name} ({selectedTicket.email})
                </p>
              </div>

              <button
                onClick={() => {
                  setSelectedTicket(null)
                  setTicketMessages([])
                  setShowEscalateDevModal(false)
                  setShowEscalateTeamModal(false)
                }}
                className="p-1.5 text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Escalation Control Bar */}
            <div className="p-3.5 bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-white shrink-0" />
                <span className="text-xs font-mono font-bold uppercase text-white">
                  Escalation Hub
                </span>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Escalate to Developer Button */}
                <button
                  type="button"
                  onClick={() => setShowEscalateDevModal(true)}
                  className="px-3 py-1.5 rounded bg-white text-black hover:bg-zinc-200 text-[11px] font-mono font-bold transition flex items-center gap-1.5"
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>Escalate to Creator / Brand</span>
                </button>

                {/* AI Auto-Route Button */}
                <button
                  type="button"
                  onClick={handleAutoRouteWithAI}
                  disabled={isAutoRouting}
                  className="px-3 py-1.5 rounded bg-[#1e1e1e] text-zinc-300 hover:text-white hover:bg-[#282828] border border-[#333] text-[11px] font-mono font-bold transition flex items-center gap-1.5"
                  title="Analyze ticket via Groq AI & match to brand catalog"
                >
                  <Bot className="w-3.5 h-3.5" />
                  <span>{isAutoRouting ? 'AI Analyzing...' : 'AI Auto-Route'}</span>
                </button>

                {/* Escalate to Core Team Button */}
                <button
                  type="button"
                  onClick={() => setShowEscalateTeamModal(true)}
                  className="px-3 py-1.5 rounded bg-[#242424] text-white hover:bg-[#303030] border border-[#383838] text-[11px] font-mono font-bold transition flex items-center gap-1.5"
                >
                  <Flame className="w-3.5 h-3.5" />
                  <span>Escalate to Core Team</span>
                </button>

                {/* De-escalate button if currently escalated */}
                {(selectedTicket.status === 'ESCALATED_TO_DEV' ||
                  selectedTicket.status === 'ESCALATED_TO_TEAM') && (
                  <button
                    type="button"
                    onClick={handleDeescalate}
                    disabled={isEscalating}
                    className="px-3 py-1.5 rounded bg-[#181818] text-zinc-400 hover:text-white border border-[#2a2a2a] text-[11px] font-mono transition flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>De-escalate</span>
                  </button>
                )}
              </div>
            </div>

            {/* Hardware & Context Environment Info */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
              <div className="p-3 rounded bg-[#181818] border border-[#2a2a2a] flex items-center gap-2">
                <Laptop className="w-4 h-4 text-zinc-400 shrink-0" />
                <div className="min-w-0">
                  <div className="text-[10px] text-zinc-500 uppercase">OS Platform</div>
                  <div className="text-white truncate font-bold">{selectedTicket.os_platform || 'Universal / Web'}</div>
                </div>
              </div>

              <div className="p-3 rounded bg-[#181818] border border-[#2a2a2a] flex items-center gap-2">
                <Music className="w-4 h-4 text-zinc-400 shrink-0" />
                <div className="min-w-0">
                  <div className="text-[10px] text-zinc-500 uppercase">Audio DAW</div>
                  <div className="text-white truncate font-bold">{selectedTicket.daw || 'All Audio DAWs'}</div>
                </div>
              </div>

              <div className="p-3 rounded bg-[#181818] border border-[#2a2a2a] flex items-center gap-2">
                <Receipt className="w-4 h-4 text-zinc-400 shrink-0" />
                <div className="min-w-0">
                  <div className="text-[10px] text-zinc-500 uppercase">Order ID</div>
                  <div className="text-white truncate font-bold">{selectedTicket.order_id || 'General Support'}</div>
                </div>
              </div>
            </div>

            {/* Initial Inquirer Description */}
            <div className="p-4 rounded-lg bg-[#181818] border border-[#2a2a2a] space-y-2">
              <div className="text-[11px] font-mono font-bold uppercase text-zinc-400">
                Inquirer Message Description:
              </div>
              <p className="text-xs text-zinc-200 whitespace-pre-wrap leading-relaxed font-sans">
                {selectedTicket.description}
              </p>
            </div>

            {/* Conversation Thread */}
            <div className="space-y-3">
              <div className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-bold">
                Ticket Responses ({ticketMessages.length})
              </div>

              <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                {ticketMessages.length > 0 ? (
                  ticketMessages.map((msg) => {
                    const isEscalationMsg = msg.message?.startsWith('🚨 [ESCALATED') || msg.message?.startsWith('🔥 [ESCALATED')
                    return (
                      <div
                        key={msg.id}
                        className={`p-3.5 rounded-lg border text-xs space-y-1 ${
                          isEscalationMsg
                            ? 'bg-[#181818] border-white text-white font-mono'
                            : msg.sender_type === 'staff'
                            ? 'bg-[#202020] border-white/20 ml-6 text-white'
                            : 'bg-[#181818] border-[#2a2a2a] mr-6 text-zinc-200'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
                          <span className="font-bold uppercase tracking-wider text-white">
                            {msg.sender_name || (msg.sender_type === 'staff' ? 'Staff Official' : 'Requester')}
                          </span>
                          <span>{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="whitespace-pre-wrap leading-relaxed font-sans">{msg.message}</p>
                      </div>
                    )
                  })
                ) : (
                  <div className="p-4 text-center text-xs text-zinc-500 font-mono bg-[#181818] rounded-lg border border-[#2a2a2a]">
                    No messages sent on this ticket yet. Reply below to initiate communication.
                  </div>
                )}
              </div>
            </div>

            {/* Quick Reply Form */}
            <form onSubmit={handleSendReply} className="space-y-3 pt-2 border-t border-[#2a2a2a]">
              <div className="text-[11px] font-mono text-zinc-400 uppercase font-semibold">
                Compose Official Staff Response
              </div>
              <textarea
                rows={3}
                required
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type your response to the customer or brand developer..."
                className="epic-input text-xs font-sans"
              />
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                {/* Status Switcher Actions */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus('IN_PROGRESS')}
                    disabled={isPending}
                    className="px-2.5 py-1 rounded bg-[#202020] hover:bg-[#2a2a2a] text-zinc-300 hover:text-white border border-[#2a2a2a] text-[10px] font-mono transition"
                  >
                    In Progress
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus('RESOLVED')}
                    disabled={isPending}
                    className="px-2.5 py-1 rounded bg-white text-black font-bold text-[10px] font-mono transition"
                  >
                    Resolve Ticket
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus('CLOSED')}
                    disabled={isPending}
                    className="px-2.5 py-1 rounded bg-[#181818] text-zinc-400 hover:text-white border border-[#2a2a2a] text-[10px] font-mono transition"
                  >
                    Close
                  </button>
                </div>

                {/* Send Button */}
                <button
                  type="submit"
                  disabled={isSendingReply || !replyText.trim()}
                  className="epic-btn-primary"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSendingReply ? 'Sending...' : 'Send Response'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Escalate to Creator / Developer */}
      {showEscalateDevModal && selectedTicket && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#181818] border border-[#2a2a2a] rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 font-mono">
            <div className="flex items-center justify-between pb-2 border-b border-[#242424]">
              <div className="flex items-center gap-2">
                <ArrowUpRight className="w-4 h-4 text-white" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Escalate Issue to Plugin Creator / Brand
                </h3>
              </div>
              <button
                onClick={() => setShowEscalateDevModal(false)}
                className="p-1 hover:bg-[#242424] rounded text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-zinc-400 font-sans">
              Forward this user's technical inquiry or crash report directly to the VST brand developer for resolution.
            </p>

            <form onSubmit={handleEscalateToDevSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider">
                  Select Brand Partner *
                </label>
                <select
                  value={selectedBrandName}
                  onChange={(e) => {
                    const bName = e.target.value
                    setSelectedBrandName(bName)
                    const found = brandsList.find((b) => b.name === bName)
                    if (found?.support_email) setEscalateDevEmail(found.support_email)
                  }}
                  className="w-full bg-[#121212] border border-[#2e2e2e] rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-white transition"
                >
                  {brandsList.map((brand) => (
                    <option key={brand.id} value={brand.name} className="bg-[#181818] text-white">
                      {brand.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider">
                  Developer Direct Contact Email (Optional)
                </label>
                <input
                  type="email"
                  value={escalateDevEmail}
                  onChange={(e) => setEscalateDevEmail(e.target.value)}
                  placeholder="developer@brand.com"
                  className="w-full bg-[#121212] border border-[#2e2e2e] rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-white transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider">
                  Escalation Notes & DSP Instructions *
                </label>
                <textarea
                  rows={4}
                  required
                  value={escalateDevNotes}
                  onChange={(e) => setEscalateDevNotes(e.target.value)}
                  placeholder="Explain why this requires developer intervention (e.g. AU/VST3 crashing on Apple Silicon M3, JUCE memory leak, license key regeneration required)..."
                  className="w-full bg-[#121212] border border-[#2e2e2e] rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-white transition font-sans"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEscalateDevModal(false)}
                  className="px-4 py-2 bg-[#202020] text-zinc-300 hover:text-white rounded-lg text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isEscalating}
                  className="px-5 py-2 bg-white text-black hover:bg-zinc-200 rounded-lg text-xs font-bold transition disabled:opacity-50"
                >
                  {isEscalating ? 'Escalating...' : 'Dispatch to Developer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Escalate to Core Team */}
      {showEscalateTeamModal && selectedTicket && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#181818] border border-[#2a2a2a] rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 font-mono">
            <div className="flex items-center justify-between pb-2 border-b border-[#242424]">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-white" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Escalate to ProducerToy Core Engineering
                </h3>
              </div>
              <button
                onClick={() => setShowEscalateTeamModal(false)}
                className="p-1 hover:bg-[#242424] rounded text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-zinc-400 font-sans">
              Mark this ticket as URGENT and assign it to the Senior Audio DSP Engineering / Super Admin queue.
            </p>

            <form onSubmit={handleEscalateToTeamSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider">
                  Reason for Core Team Escalation *
                </label>
                <textarea
                  rows={4}
                  required
                  value={escalateTeamReason}
                  onChange={(e) => setEscalateTeamReason(e.target.value)}
                  placeholder="Detail critical platform blocker (e.g. server-side license verification failure, CDN distribution outage, unresolved payment/refund dispute)..."
                  className="w-full bg-[#121212] border border-[#2e2e2e] rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-white transition font-sans"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEscalateTeamModal(false)}
                  className="px-4 py-2 bg-[#202020] text-zinc-300 hover:text-white rounded-lg text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isEscalating}
                  className="px-5 py-2 bg-white text-black hover:bg-zinc-200 rounded-lg text-xs font-bold transition disabled:opacity-50"
                >
                  {isEscalating ? 'Escalating...' : 'Alert Core Team'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
