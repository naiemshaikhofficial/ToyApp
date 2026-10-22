'use client'

import React, { useState, useTransition } from 'react'
import {
  ShieldCheck,
  KeyRound,
  Laptop,
  AlertTriangle,
  RotateCcw,
  Plus,
  Search,
  CheckCircle,
  X,
  Radio,
} from 'lucide-react'
import {
  revokeDeviceActivationAction,
  uploadSerialKeysAction,
  getDeviceActivationsAction,
  getSerialPoolInventoryAction,
} from '@/actions/licenseActions'

interface LicensesClientProps {
  initialActivations: any[]
  totalActivations: number
  serialInventory: any[]
}

export function LicensesClient({ initialActivations, totalActivations, serialInventory }: LicensesClientProps) {
  const [activeTab, setActiveTab] = useState<'devices' | 'serials'>('devices')
  const [activations, setActivations] = useState<any[]>(initialActivations)
  const [inventory, setInventory] = useState<any[]>(serialInventory)
  const [search, setSearch] = useState('')
  const [isPending, startTransition] = useTransition()

  // Serial upload modal
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [targetProductId, setTargetProductId] = useState(inventory[0]?.id || '')
  const [rawKeys, setRawKeys] = useState('')
  const [notification, setNotification] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  // Revoke device seat
  const handleRevokeSeat = async (id: string, machineName: string) => {
    if (!confirm(`Are you sure you want to revoke the activation seat for machine "${machineName}"? The software will immediately lock on their workstation.`)) {
      return
    }

    startTransition(async () => {
      const res = await revokeDeviceActivationAction(id, 'naiemshaikhofficial@gmail.com')
      if (res.success) {
        setNotification({ text: `Machine seat "${machineName}" has been successfully revoked.`, type: 'success' })
        setActivations((prev) =>
          prev.map((a) => (a.id === id ? { ...a, is_active: false, revoked_at: new Date().toISOString() } : a))
        )
      } else {
        setNotification({ text: res.error || 'Failed to revoke activation', type: 'error' })
      }
    })
  }

  // Handle Serial Upload Submit
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!targetProductId || !rawKeys.trim()) return

    startTransition(async () => {
      const res = await uploadSerialKeysAction({
        productId: targetProductId,
        rawKeys,
        staffEmail: 'naiemshaikhofficial@gmail.com',
      })

      if (res.success) {
        setNotification({
          text: `Success! Uploaded ${res.inserted} serial keys into the inventory pool.`,
          type: 'success',
        })
        setIsUploadOpen(false)
        setRawKeys('')
        const reload = await getSerialPoolInventoryAction()
        if (reload.success) setInventory(reload.inventory)
      } else {
        setNotification({ text: res.error || 'Failed to upload serial keys', type: 'error' })
      }
    })
  }

  const filteredActivations = activations.filter((a) => {
    if (!search.trim()) return true
    const s = search.toLowerCase()
    return (
      a.device_name?.toLowerCase().includes(s) ||
      a.os?.toLowerCase().includes(s) ||
      a.device_id_hash?.toLowerCase().includes(s) ||
      a.products?.name?.toLowerCase().includes(s)
    )
  })

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

      {/* Tab Switcher & Action Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 p-1 rounded-lg bg-[#181818] border border-[#2a2a2a]">
          <button
            onClick={() => setActiveTab('devices')}
            className={`px-4 py-2 rounded-md text-xs font-bold font-mono transition flex items-center gap-2 ${
              activeTab === 'devices'
                ? 'bg-white text-black shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Laptop className="w-3.5 h-3.5" />
            <span>Hardware Machine Seats ({totalActivations})</span>
          </button>

          <button
            onClick={() => setActiveTab('serials')}
            className={`px-4 py-2 rounded-md text-xs font-bold font-mono transition flex items-center gap-2 ${
              activeTab === 'serials'
                ? 'bg-white text-black shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Serial Inventory Pools ({inventory.length})</span>
          </button>
        </div>

        {activeTab === 'serials' && (
          <button onClick={() => setIsUploadOpen(true)} className="epic-btn-primary">
            <Plus className="w-4 h-4" />
            <span>Upload Serial Keys</span>
          </button>
        )}
      </div>

      {/* Tab 1: Hardware Machine Activations */}
      {activeTab === 'devices' && (
        <div className="space-y-4">
          <div className="relative max-w-md">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by machine name, OS, device hash, product..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="epic-input pl-9 text-xs"
            />
          </div>

          <div className="epic-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#181818] text-zinc-400 font-mono uppercase text-[10px] border-b border-[#2a2a2a]">
                  <tr>
                    <th className="py-3 px-4">Workstation Machine</th>
                    <th className="py-3 px-3">Operating System</th>
                    <th className="py-3 px-3">Activated Audio Tool</th>
                    <th className="py-3 px-3">Hardware Hash</th>
                    <th className="py-3 px-3 font-mono">Last Heartbeat</th>
                    <th className="py-3 px-3 text-center">Seat Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2a2a2a]">
                  {filteredActivations.length > 0 ? (
                    filteredActivations.map((act) => (
                      <tr key={act.id} className="hover:bg-[#181818]/60 transition">
                        <td className="py-3.5 px-4 font-mono">
                          <div className="text-white font-bold flex items-center gap-2">
                            <Laptop className="w-3.5 h-3.5 text-zinc-400" />
                            <span>{act.device_name || 'Studio Workstation'}</span>
                          </div>
                          <div className="text-[10px] text-zinc-500">
                            Activated {new Date(act.activated_at).toLocaleDateString()}
                          </div>
                        </td>

                        <td className="py-3.5 px-3">
                          <span className="px-2 py-0.5 rounded bg-[#202020] border border-[#2a2a2a] text-zinc-300 font-mono text-[10px]">
                            {act.os || 'Universal OS'}
                          </span>
                        </td>

                        <td className="py-3.5 px-3">
                          <div className="text-white font-semibold">{act.products?.name || 'Audio Plugin'}</div>
                          <div className="text-[10px] text-zinc-500 font-mono">{act.products?.brands?.name || 'Producer Toy'}</div>
                        </td>

                        <td className="py-3.5 px-3 font-mono text-[11px] text-zinc-400">
                          <span className="truncate max-w-[140px] block" title={act.device_id_hash}>
                            {act.device_id_hash}
                          </span>
                        </td>

                        <td className="py-3.5 px-3 font-mono text-[11px] text-zinc-400">
                          {act.last_seen_at ? new Date(act.last_seen_at).toLocaleDateString() : 'Active'}
                        </td>

                        <td className="py-3.5 px-3 text-center">
                          <span
                            className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${
                              act.is_active
                                ? 'bg-white text-black border-white'
                                : 'bg-[#262626] text-zinc-400 border-[#383838]'
                            }`}
                          >
                            {act.is_active ? 'CLAIMED' : 'REVOKED'}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          {act.is_active ? (
                            <button
                              onClick={() => handleRevokeSeat(act.id, act.device_name)}
                              className="px-2.5 py-1 rounded bg-[#262626] hover:bg-[#34363d] text-white border border-[#383838] text-[10px] font-mono font-bold transition flex items-center gap-1 ml-auto"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>Revoke</span>
                            </button>
                          ) : (
                            <span className="text-[10px] font-mono text-zinc-600">Locked</span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-zinc-500 font-mono text-xs">
                        No active machine hardware activations found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Serial Key Inventory Pool Monitor */}
      {activeTab === 'serials' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {inventory.map((item) => (
              <div
                key={item.id}
                className={`epic-card p-5 space-y-3 ${
                  item.isDepleted ? 'border-white/30 bg-[#222222]' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white">{item.name}</h4>
                    <p className="text-[11px] font-mono text-zinc-500">{item.brand}</p>
                  </div>
                  {item.isDepleted && (
                    <span className="flex items-center gap-1 text-[9px] font-mono font-bold text-white bg-[#2a2a2a] px-2 py-0.5 rounded border border-[#383838] uppercase">
                      <AlertTriangle className="w-3 h-3" />
                      Low Stock
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#2a2a2a] text-center font-mono">
                  <div className="p-2 rounded bg-[#181818] border border-[#2a2a2a]">
                    <div className="text-[10px] text-zinc-500 uppercase">Total</div>
                    <div className="text-sm font-bold text-white mt-0.5">{item.total}</div>
                  </div>
                  <div className="p-2 rounded bg-[#181818] border border-[#2a2a2a]">
                    <div className="text-[10px] text-zinc-500 uppercase">Used</div>
                    <div className="text-sm font-bold text-zinc-400 mt-0.5">{item.used}</div>
                  </div>
                  <div className="p-2 rounded bg-[#181818] border border-[#2a2a2a]">
                    <div className="text-[10px] text-zinc-500 uppercase">Available</div>
                    <div className="text-sm font-bold mt-0.5 text-white">
                      {item.available}
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-zinc-500 truncate max-w-[160px]">
                    {item.plugin_identifier || 'PT-STANDARD-POOL'}
                  </span>
                  <button
                    onClick={() => {
                      setTargetProductId(item.id)
                      setIsUploadOpen(true)
                    }}
                    className="text-xs font-mono text-zinc-200 hover:text-white underline"
                  >
                    + Add Keys
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Batch Upload Serials Modal */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleUploadSubmit} className="epic-card bg-[#181818] max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#2a2a2a]">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">Batch Upload Serial Keys</h3>
              <button type="button" onClick={() => setIsUploadOpen(false)} className="text-zinc-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="text-[11px] font-mono text-zinc-400 uppercase font-semibold">Target Product</label>
              <select
                value={targetProductId}
                onChange={(e) => setTargetProductId(e.target.value)}
                className="epic-input mt-1 font-mono text-xs"
              >
                {inventory.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.name} ({i.brand}) - {i.available} keys left
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-mono text-zinc-400 uppercase font-semibold">
                Serial Keys (Paste CSV / TXT list)
              </label>
              <textarea
                rows={8}
                required
                placeholder="PRO-VERB-1234-ABCD&#10;PRO-VERB-5678-EFGH&#10;..."
                value={rawKeys}
                onChange={(e) => setRawKeys(e.target.value)}
                className="epic-input mt-1 font-mono text-xs"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#2a2a2a]">
              <button type="button" onClick={() => setIsUploadOpen(false)} className="epic-btn-outline">
                Cancel
              </button>
              <button type="submit" disabled={isPending} className="epic-btn-primary">
                {isPending ? 'Uploading...' : 'Upload Keys into Pool'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
