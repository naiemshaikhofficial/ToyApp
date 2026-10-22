'use client'

import React, { useState, useTransition } from 'react'
import {
  Wallet,
  TrendingUp,
  DollarSign,
  Building2,
  CheckCircle,
  Clock,
  AlertTriangle,
  X,
  CreditCard,
  FileCheck,
} from 'lucide-react'
import { updatePayoutStatusAction, getAdminPayoutsAction, getSettlementOverviewAction } from '@/actions/payoutActions'

interface PayoutsClientProps {
  initialPayouts: any[]
  settlementData: any
}

export function PayoutsClient({ initialPayouts, settlementData }: PayoutsClientProps) {
  const [payouts, setPayouts] = useState<any[]>(initialPayouts)
  const [settlement, setSettlement] = useState<any>(settlementData)
  const [selectedPayout, setSelectedPayout] = useState<any | null>(null)
  const [newStatus, setNewStatus] = useState<'processing' | 'completed' | 'on_hold' | 'failed'>('completed')
  const [transactionRef, setTransactionRef] = useState('')
  const [notes, setNotes] = useState('')
  const [isPending, startTransition] = useTransition()
  const [notification, setNotification] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPayout) return

    startTransition(async () => {
      const res = await updatePayoutStatusAction({
        payoutId: selectedPayout.id,
        newStatus,
        transactionRef,
        notes,
        staffEmail: 'naiemshaikhofficial@gmail.com',
      })

      if (res.success) {
        setNotification({
          text: `Payout #${selectedPayout.payout_number} status updated to ${newStatus.toUpperCase()}`,
          type: 'success',
        })
        setSelectedPayout(null)
        setTransactionRef('')
        setNotes('')

        const [pReload, sReload] = await Promise.all([
          getAdminPayoutsAction(),
          getSettlementOverviewAction(),
        ])
        if (pReload.success) setPayouts(pReload.payouts)
        if (sReload.success) setSettlement(sReload.data)
      } else {
        setNotification({ text: res.error || 'Failed to update payout', type: 'error' })
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

      {/* Financial Settlement Accounting Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="epic-card p-5">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-mono uppercase font-semibold">Normalized Gross GMV</span>
            <DollarSign className="w-4 h-4 text-white" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-white font-mono">
              ${settlement?.normalizedGrossUsd?.toFixed(2) || '0.00'}
            </div>
            <div className="text-[11px] text-zinc-400 mt-1 font-mono">
              USD ${settlement?.gmvUsd?.toFixed(2) || '0'} + INR ₹{settlement?.gmvInr?.toLocaleString() || '0'}
            </div>
          </div>
        </div>

        <div className="epic-card p-5">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-mono uppercase font-semibold">Creator Retain (70%)</span>
            <Wallet className="w-4 h-4 text-zinc-300" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-white font-mono">
              ${settlement?.creatorNetUsd?.toFixed(2) || '0.00'}
            </div>
            <p className="text-[11px] text-zinc-400 mt-1 font-mono">Total Net Creator Entitlement</p>
          </div>
        </div>

        <div className="epic-card p-5">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-mono uppercase font-semibold">Platform Fee (30%)</span>
            <TrendingUp className="w-4 h-4 text-white" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-white font-mono">
              ${settlement?.platformFeeUsd?.toFixed(2) || '0.00'}
            </div>
            <p className="text-[11px] text-zinc-400 mt-1 font-mono">ProducerToy Marketplace Cut</p>
          </div>
        </div>

        <div className="epic-card p-5">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-mono uppercase font-semibold">Outstanding Balance</span>
            <AlertTriangle className="w-4 h-4 text-zinc-400" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-white font-mono">
              ${settlement?.outstandingBalanceUsd?.toFixed(2) || '0.00'}
            </div>
            <p className="text-[11px] text-zinc-400 mt-1 font-mono">Pending Platform Liabilities</p>
          </div>
        </div>
      </div>

      {/* Payouts Table */}
      <div className="epic-card p-6">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#2a2a2a]">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">Creator Payout Requests</h2>
            <p className="text-xs text-zinc-400 mt-0.5">Wire transfers, Wise settlements & PayPal payouts</p>
          </div>
          <span className="text-xs font-mono text-zinc-400">{payouts.length} payout records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#181818] text-zinc-400 font-mono uppercase text-[10px] border-b border-[#2a2a2a]">
              <tr>
                <th className="py-3 px-4">Payout # / Date</th>
                <th className="py-3 px-3">Brand / Developer</th>
                <th className="py-3 px-3">Payment Method & Destination</th>
                <th className="py-3 px-3 font-mono">Amount</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2a2a]">
              {payouts.length > 0 ? (
                payouts.map((pay) => (
                  <tr key={pay.id} className="hover:bg-[#181818]/60 transition">
                    <td className="py-3.5 px-4 font-mono">
                      <div className="text-white font-bold">{pay.payout_number}</div>
                      <div className="text-[10px] text-zinc-500">
                        {new Date(pay.created_at).toLocaleDateString()}
                      </div>
                    </td>

                    <td className="py-3.5 px-3">
                      <div className="text-white font-semibold">{pay.brands?.name || 'Developer'}</div>
                      <div className="text-[10px] text-zinc-500 font-mono">/{pay.brands?.slug}</div>
                    </td>

                    <td className="py-3.5 px-3 text-xs">
                      <div className="text-zinc-300 font-mono font-medium">{pay.method || 'Bank Wire'}</div>
                      <div className="text-[10px] text-zinc-500 font-mono truncate max-w-[200px]" title={pay.destination}>
                        {pay.destination || 'Direct Account'}
                      </div>
                    </td>

                    <td className="py-3.5 px-3 font-mono">
                      <div className="text-white font-bold">${Number(pay.net_amount || pay.amount).toFixed(2)}</div>
                      <div className="text-[10px] text-zinc-500">{pay.currency || 'USD'}</div>
                    </td>

                    <td className="py-3.5 px-3 text-center">
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${
                          pay.status === 'completed'
                            ? 'bg-[#262626] text-white border-[#383838]'
                            : pay.status === 'processing'
                            ? 'bg-[#202020] text-zinc-200 border-[#383838]'
                            : pay.status === 'on_hold'
                            ? 'bg-[#181818] text-zinc-400 border-[#2a2a2a]'
                            : 'bg-zinc-800 text-zinc-500 border-zinc-700'
                        }`}
                      >
                        {pay.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedPayout(pay)
                          setNewStatus(pay.status === 'scheduled' ? 'processing' : 'completed')
                          setTransactionRef(pay.destination || '')
                        }}
                        className="px-2.5 py-1 rounded bg-[#202020] hover:bg-[#2a2a2a] text-zinc-300 hover:text-white border border-[#2a2a2a] text-[11px] font-mono transition"
                      >
                        Update
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-zinc-500 font-mono text-xs">
                    No creator payout requests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Settle / Update Payout Modal */}
      {selectedPayout && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleUpdateStatus} className="epic-card bg-[#181818] max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#2a2a2a]">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                Settle Payout #{selectedPayout.payout_number}
              </h3>
              <button type="button" onClick={() => setSelectedPayout(null)} className="text-zinc-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 rounded bg-[#202020] border border-[#2a2a2a] text-xs space-y-1">
              <div className="text-zinc-400">Brand: <strong className="text-white">{selectedPayout.brands?.name}</strong></div>
              <div className="text-zinc-400 font-mono">
                Amount: <strong className="text-white">${selectedPayout.net_amount || selectedPayout.amount} {selectedPayout.currency}</strong>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-mono text-zinc-400 uppercase font-semibold">Transition Status</label>
              <select
                value={newStatus}
                onChange={(e: any) => setNewStatus(e.target.value)}
                className="epic-input mt-1 font-mono text-xs"
              >
                <option value="processing">Processing (Funds Dispatched)</option>
                <option value="completed">Completed (Confirmed Settled)</option>
                <option value="on_hold">On Hold (Compliance Review)</option>
                <option value="failed">Failed / Rejected</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-mono text-zinc-400 uppercase font-semibold">
                Transaction Reference (Bank UTR / PayPal Txn / Wise ID)
              </label>
              <input
                type="text"
                placeholder="e.g. UTR-982348239082 or PAYPAL-TXN-1234"
                value={transactionRef}
                onChange={(e) => setTransactionRef(e.target.value)}
                className="epic-input mt-1 font-mono text-xs"
              />
            </div>

            <div>
              <label className="text-[11px] font-mono text-zinc-400 uppercase font-semibold">Settlement Notes</label>
              <textarea
                rows={2}
                placeholder="Optional transfer remarks..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="epic-input mt-1 text-xs"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#2a2a2a]">
              <button type="button" onClick={() => setSelectedPayout(null)} className="epic-btn-outline">
                Cancel
              </button>
              <button type="submit" disabled={isPending} className="epic-btn-primary">
                {isPending ? 'Updating...' : 'Confirm Status Update'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
