'use client'

import React, { useState, useTransition } from 'react'
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
} from 'lucide-react'
import {
  SupportTicketSummary,
  getSupportTicketsAction,
  getTicketDetailsAction,
  updateTicketStatusAction,
  replyToTicketAction,
} from '@/actions/supportActions'

interface SupportClientProps {
  initialTickets: SupportTicketSummary[]
  totalTickets: number
}

export function SupportClient({ initialTickets, totalTickets }: SupportClientProps) {
  const [tickets, setTickets] = useState<SupportTicketSummary[]>(initialTickets)
  const [search, setSearch] = useState('')
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

  // Handle Tab Status Change
  const handleStatusFilter = (status: string) => {
    setActiveStatus(status)
    setCurrentPage(1)
    startTransition(async () => {
      const res = await getSupportTicketsAction({
        status,
        search,
        page: 1,
        pageSize,
      })
      if (res.success) {
        setTickets(res.data)
        setTotalCount(res.total)
      }
    })
  }

  // Handle Page Change
  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return
    setCurrentPage(newPage)
    startTransition(async () => {
      const res = await getSupportTicketsAction({
        status: activeStatus,
        search,
        page: newPage,
        pageSize,
      })
      if (res.success) {
        setTickets(res.data)
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
      const res = await getSupportTicketsAction({
        status: activeStatus,
        search,
        page: 1,
        pageSize,
      })
      if (res.success) {
        setTickets(res.data)
        setTotalCount(res.total)
      }
    })
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

  // Send Reply
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
      // If was OPEN, update local ticket status to IN_PROGRESS
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
        // Refresh ticket list
        const refresh = await getSupportTicketsAction({
          status: activeStatus,
          search,
          page: currentPage,
          pageSize,
        })
        if (refresh.success) setTickets(refresh.data)
      } else {
        setNotification({ text: res.error || 'Failed to update status', type: 'error' })
      }
    })
  }

  // Metrics
  const openCount = tickets.filter((t) => t.status === 'OPEN').length
  const inProgressCount = tickets.filter((t) => t.status === 'IN_PROGRESS').length
  const resolvedCount = tickets.filter((t) => t.status === 'RESOLVED' || t.status === 'CLOSED').length

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

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="epic-card p-5 space-y-1">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[11px] font-mono uppercase tracking-wider font-semibold">Total Tickets</span>
            <LifeBuoy className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-white">{totalCount}</div>
          <p className="text-[11px] text-zinc-500">Inquiries and partnership requests</p>
        </div>

        <div className="epic-card p-5 space-y-1">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[11px] font-mono uppercase tracking-wider font-semibold">Action Required</span>
            <AlertCircle className="w-4 h-4 text-white" />
          </div>
          <div className="text-2xl font-black text-white">{openCount}</div>
          <p className="text-[11px] text-zinc-500">Open awaiting staff response</p>
        </div>

        <div className="epic-card p-5 space-y-1">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[11px] font-mono uppercase tracking-wider font-semibold">In Progress</span>
            <Clock className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-white">{inProgressCount}</div>
          <p className="text-[11px] text-zinc-500">Under active staff investigation</p>
        </div>

        <div className="epic-card p-5 space-y-1">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[11px] font-mono uppercase tracking-wider font-semibold">Resolved / Closed</span>
            <CheckCircle className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-white">{resolvedCount}</div>
          <p className="text-[11px] text-zinc-500">Resolved inquiries</p>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
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
            placeholder="Search tickets, email, DAW..."
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
                <th className="py-3 px-4">Ticket</th>
                <th className="py-3 px-3">Subject / Request</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3 font-mono">Status</th>
                <th className="py-3 px-3 font-mono">Priority</th>
                <th className="py-3 px-3 font-mono">Created</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2a2a]">
              {tickets.length > 0 ? (
                tickets.map((t) => (
                  <tr
                    key={t.id}
                    onClick={() => handleSelectTicket(t)}
                    className="hover:bg-[#181818]/60 transition cursor-pointer"
                  >
                    <td className="py-3.5 px-4 font-mono">
                      <div className="font-bold text-white text-xs">{t.ticket_number}</div>
                      <div className="text-[11px] text-zinc-400 font-sans truncate max-w-[140px]">{t.name}</div>
                    </td>

                    <td className="py-3.5 px-3">
                      <div className="font-bold text-white text-xs truncate max-w-sm">{t.subject}</div>
                      <div className="text-[11px] text-zinc-400 font-mono truncate max-w-sm">{t.email}</div>
                    </td>

                    <td className="py-3.5 px-3">
                      <span className="px-2 py-0.5 rounded bg-[#202020] text-zinc-300 border border-[#2a2a2a] text-[10px] font-mono uppercase font-bold">
                        {t.category}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 font-mono">
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
                    </td>

                    <td className="py-3.5 px-3 font-mono">
                      <span className="text-[10px] text-zinc-300 font-semibold uppercase">
                        {t.priority}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 font-mono text-[11px] text-zinc-400">
                      {new Date(t.created_at).toLocaleDateString()}
                    </td>

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
                ))
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
              Showing <strong className="text-white">{startItem}-{endItem}</strong> of <strong className="text-white">{totalCount}</strong> Tickets
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
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono font-bold text-white bg-[#262626] px-2 py-0.5 rounded border border-[#383838]">
                    {selectedTicket.ticket_number}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded border bg-white text-black font-bold uppercase">
                    {selectedTicket.status.replace('_', ' ')}
                  </span>
                  <span className="text-[10px] font-mono text-zinc-400 uppercase">
                    Priority: {selectedTicket.priority}
                  </span>
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
                }}
                className="p-1.5 text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
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
                Customer Message Description:
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
                  ticketMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`p-3.5 rounded-lg border text-xs space-y-1 ${
                        msg.sender_type === 'staff'
                          ? 'bg-[#202020] border-white/20 ml-6 text-white'
                          : 'bg-[#181818] border-[#2a2a2a] mr-6 text-zinc-200'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
                        <span className="font-bold uppercase tracking-wider">
                          {msg.sender_name || (msg.sender_type === 'staff' ? 'Staff Official' : 'Requester')}
                        </span>
                        <span>{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p className="whitespace-pre-wrap leading-relaxed font-sans">{msg.message}</p>
                    </div>
                  ))
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
    </div>
  )
}
