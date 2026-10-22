'use client'

import React, { useState, useTransition } from 'react'
import {
  Receipt,
  Search,
  Filter,
  DollarSign,
  FileText,
  RotateCcw,
  CheckCircle,
  X,
  CreditCard,
  User,
  MapPin,
  KeyRound,
  ExternalLink,
} from 'lucide-react'
import { getAdminOrdersAction, refundOrderAction } from '@/actions/orderActions'
import { getInvoiceHtmlAction } from '@/actions/invoiceActions'

interface OrdersClientProps {
  initialOrders: any[]
  totalOrders: number
}

export function OrdersClient({ initialOrders, totalOrders }: OrdersClientProps) {
  const [orders, setOrders] = useState<any[]>(initialOrders)
  const [search, setSearch] = useState('')
  const [currencyFilter, setCurrencyFilter] = useState('')
  const [isPending, startTransition] = useTransition()

  // Selected Order for Modal
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null)
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false)
  const [refundReason, setRefundReason] = useState('Customer Request - Compatibility issue')
  const [revokeLicense, setRevokeLicense] = useState(true)

  // Notification
  const [notification, setNotification] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  // Filtered orders
  const filteredOrders = orders.filter((o) => {
    if (search.trim()) {
      const s = search.toLowerCase()
      const match =
        o.customer_email?.toLowerCase().includes(s) ||
        o.customer_name?.toLowerCase().includes(s) ||
        o.serial_key?.toLowerCase().includes(s) ||
        o.razorpay_payment_id?.toLowerCase().includes(s)
      if (!match) return false
    }
    if (currencyFilter && (o.currency || 'USD').toUpperCase() !== currencyFilter) {
      return false
    }
    return true
  })

  // Open Invoice in new window
  const handleOpenInvoice = async (purchaseId: string) => {
    const res = await getInvoiceHtmlAction(purchaseId)
    if (res.success && res.html) {
      const printWindow = window.open('', '_blank')
      if (printWindow) {
        printWindow.document.write(res.html)
        printWindow.document.close()
      }
    } else {
      alert(res.error || 'Failed to render invoice')
    }
  }

  // Handle Refund Submit
  const handleRefundSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedOrder) return

    startTransition(async () => {
      const res = await refundOrderAction({
        purchaseId: selectedOrder.id,
        reason: refundReason,
        revokeLicense,
        staffEmail: 'naiemshaikhofficial@gmail.com',
      })

      if (res.success) {
        setNotification({
          text: `Order ${selectedOrder.id.slice(0, 8)} refunded and licenses revoked successfully!`,
          type: 'success',
        })
        setIsRefundModalOpen(false)
        setSelectedOrder(null)
        const reload = await getAdminOrdersAction({ pageSize: 50 })
        if (reload.success) setOrders(reload.orders)
      } else {
        setNotification({ text: res.error || 'Failed to process refund', type: 'error' })
      }
    })
  }

  return (
    <div className="space-y-6">
      {/* Notification Banner */}
      {notification && (
        <div
          className={`p-4 rounded-lg flex items-center justify-between text-xs font-semibold ${
            notification.type === 'success'
              ? 'bg-[#202020] text-white border border-[#383838]'
              : 'bg-[#202020] text-zinc-300 border border-zinc-700'
          }`}
        >
          <span>{notification.text}</span>
          <button onClick={() => setNotification(null)} className="p-1 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Control Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by customer email, payment ID, serial..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="epic-input pl-9 text-xs"
            />
          </div>

          <select
            value={currencyFilter}
            onChange={(e) => setCurrencyFilter(e.target.value)}
            className="epic-input w-auto text-xs font-mono"
          >
            <option value="">All Currencies</option>
            <option value="USD">USD ($)</option>
            <option value="INR">INR (₹)</option>
          </select>
        </div>

        <div className="text-xs font-mono text-zinc-400">
          Showing {filteredOrders.length} of {totalOrders} transactions
        </div>
      </div>

      {/* Orders Table */}
      <div className="epic-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#181818] text-zinc-400 font-mono uppercase text-[10px] border-b border-[#2a2a2a]">
              <tr>
                <th className="py-3 px-4">Transaction / Date</th>
                <th className="py-3 px-3">Customer</th>
                <th className="py-3 px-3">Product / Developer</th>
                <th className="py-3 px-3">Gateway & Ref</th>
                <th className="py-3 px-3">Assigned Serial</th>
                <th className="py-3 px-3 text-right">Amount</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2a2a]">
              {filteredOrders.map((ord) => {
                const isINR = (ord.currency || '').toUpperCase() === 'INR' || ord.currency === '₹'
                const gateway = ord.razorpay_payment_id ? 'Razorpay' : 'PayPal'
                const paymentRef = ord.razorpay_payment_id || ord.id

                return (
                  <tr key={ord.id} className="hover:bg-[#181818]/60 transition">
                    <td className="py-3.5 px-4 font-mono">
                      <div className="text-white font-semibold">{ord.id.slice(0, 8)}...</div>
                      <div className="text-[10px] text-zinc-500">
                        {new Date(ord.purchased_at).toLocaleDateString()} {new Date(ord.purchased_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>

                    <td className="py-3.5 px-3">
                      <div className="text-white font-medium">{ord.customer_name || 'Customer'}</div>
                      <div className="text-[11px] text-zinc-400 font-mono">{ord.customer_email}</div>
                    </td>

                    <td className="py-3.5 px-3">
                      <div className="text-white font-semibold">{ord.products?.name || 'Audio Tool'}</div>
                      <div className="text-[10px] text-zinc-500 font-mono">{ord.products?.brands?.name || 'Producer Toy'}</div>
                    </td>

                    <td className="py-3.5 px-3 font-mono text-[11px]">
                      <span className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300 font-bold text-[9px] uppercase">
                        {gateway}
                      </span>
                      <div className="text-[10px] text-zinc-500 mt-0.5 truncate max-w-[120px]" title={paymentRef}>
                        {paymentRef}
                      </div>
                    </td>

                    <td className="py-3.5 px-3 font-mono text-[11px]">
                      {ord.serial_key ? (
                        <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300 text-[10px] select-all">
                          {ord.serial_key}
                        </span>
                      ) : (
                        <span className="text-zinc-600">None required</span>
                      )}
                    </td>

                    <td className="py-3.5 px-3 text-right font-mono font-bold text-white">
                      {isINR ? '₹' : '$'}
                      {Number(ord.amount_paid || 0).toFixed(2)} {ord.currency || 'INR'}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedOrder(ord)}
                          className="px-2.5 py-1 rounded bg-[#202020] hover:bg-[#2a2a2a] text-zinc-300 hover:text-white border border-[#2a2a2a] text-[11px] font-mono transition"
                        >
                          Details
                        </button>
                        <button
                          onClick={() => handleOpenInvoice(ord.id)}
                          className="px-2 py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700 text-[11px] font-mono transition"
                          title="Generate Tax Invoice"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="epic-card bg-[#181818] max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-start justify-between pb-4 border-b border-[#2a2a2a]">
              <div>
                <h3 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
                  Order Details #{selectedOrder.id.slice(0, 10).toUpperCase()}
                </h3>
                <p className="text-xs font-mono text-zinc-400 mt-0.5">
                  Placed on {new Date(selectedOrder.purchased_at).toLocaleString()}
                </p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-zinc-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Product & Payment Summary */}
            <div className="p-4 rounded-lg bg-[#202020] border border-[#2a2a2a] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded bg-[#181818] border border-[#2a2a2a] overflow-hidden shrink-0">
                  {selectedOrder.products?.cover_image ? (
                    <img src={selectedOrder.products.cover_image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Receipt className="w-6 h-6 text-zinc-600 m-3" />
                  )}
                </div>
                <div>
                  <div className="font-bold text-white text-sm">{selectedOrder.products?.name}</div>
                  <div className="text-xs text-zinc-400 font-mono">
                    Developer: {selectedOrder.products?.brands?.name || 'Producer Toy'}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-mono font-black text-white">
                  {selectedOrder.currency === 'INR' ? '₹' : '$'}
                  {Number(selectedOrder.amount_paid || 0).toFixed(2)} {selectedOrder.currency}
                </div>
                <div className="text-[10px] font-mono text-zinc-300 font-bold uppercase">Payment Captured</div>
              </div>
            </div>

            {/* Customer & Billing Address */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded bg-[#202020] border border-[#2a2a2a] space-y-1">
                <div className="text-[10px] font-mono text-zinc-500 uppercase flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  <span>Customer Profile</span>
                </div>
                <div className="font-bold text-white">{selectedOrder.customer_name || 'Producer'}</div>
                <div className="font-mono text-zinc-400">{selectedOrder.customer_email}</div>
                {selectedOrder.customer_phone && (
                  <div className="font-mono text-zinc-500">{selectedOrder.customer_phone}</div>
                )}
              </div>

              <div className="p-3.5 rounded bg-[#202020] border border-[#2a2a2a] space-y-1">
                <div className="text-[10px] font-mono text-zinc-500 uppercase flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Billing Address</span>
                </div>
                <div className="text-zinc-300 leading-relaxed">
                  {[
                    selectedOrder.billing_address,
                    selectedOrder.billing_city,
                    selectedOrder.billing_state,
                    selectedOrder.billing_zip,
                    selectedOrder.billing_country,
                  ]
                    .filter(Boolean)
                    .join(', ') || 'Global Digital Fulfillment Vault'}
                </div>
              </div>
            </div>

            {/* Serial & Gateway Reference */}
            <div className="p-4 rounded-lg bg-[#202020] border border-[#2a2a2a] space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400 font-mono">Gateway Transaction ID:</span>
                <span className="text-white font-mono font-bold select-all">
                  {selectedOrder.razorpay_payment_id || selectedOrder.id}
                </span>
              </div>
              {selectedOrder.serial_key && (
                <div className="flex items-center justify-between text-xs pt-2 border-t border-[#2a2a2a]">
                  <span className="text-zinc-400 font-mono flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Cryptographic Serial Key:</span>
                  </span>
                  <span className="text-white font-mono font-bold px-2 py-0.5 rounded bg-black border border-zinc-700 select-all">
                    {selectedOrder.serial_key}
                  </span>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-[#2a2a2a]">
              <button
                onClick={() => setIsRefundModalOpen(true)}
                className="px-3 py-1.5 rounded bg-[#202020] hover:bg-[#2a2a2a] text-zinc-200 border border-[#383838] text-xs font-mono font-bold transition flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Process Refund & Revoke</span>
              </button>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleOpenInvoice(selectedOrder.id)}
                  className="epic-btn-outline"
                >
                  <FileText className="w-4 h-4" />
                  <span>Tax Invoice</span>
                </button>
                <button onClick={() => setSelectedOrder(null)} className="epic-btn-primary">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Refund Confirmation Modal */}
      {isRefundModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <form onSubmit={handleRefundSubmit} className="epic-card bg-[#181818] max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#2a2a2a]">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-zinc-400" />
                <span>Confirm Order Refund</span>
              </h3>
              <button type="button" onClick={() => setIsRefundModalOpen(false)} className="text-zinc-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              You are about to issue a refund for Order <strong className="text-white font-mono">{selectedOrder.id.slice(0, 8)}</strong> ({selectedOrder.currency === 'INR' ? '₹' : '$'}{selectedOrder.amount_paid}).
            </p>

            <div>
              <label className="text-[11px] font-mono text-zinc-400 uppercase font-semibold">Refund Reason</label>
              <textarea
                rows={2}
                required
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                className="epic-input mt-1 text-xs"
              />
            </div>

            <div className="p-3 rounded bg-[#202020] border border-[#2a2a2a]">
              <label className="flex items-center gap-2 text-xs text-zinc-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={revokeLicense}
                  onChange={(e) => setRevokeLicense(e.target.checked)}
                  className="rounded border-[#34363d] text-white focus:ring-0"
                />
                <span>Revoke active machine hardware seats and deallocate serial</span>
              </label>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#2a2a2a]">
              <button type="button" onClick={() => setIsRefundModalOpen(false)} className="epic-btn-outline">
                Cancel
              </button>
              <button type="submit" disabled={isPending} className="epic-btn-primary">
                {isPending ? 'Processing...' : 'Confirm Refund'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
