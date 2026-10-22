'use client'

import React, { useState, useTransition } from 'react'
import {
  Tag,
  Plus,
  Search,
  Filter,
  Copy,
  Check,
  Trash2,
  Calendar,
  Percent,
  DollarSign,
  AlertCircle,
  X,
  Sparkles,
  Users,
  Clock,
  Layers,
} from 'lucide-react'
import {
  createAdminCouponAction,
  toggleAdminCouponActiveAction,
  deleteAdminCouponAction,
  AdminCoupon,
} from '@/actions/couponActions'

interface CouponsClientProps {
  initialCoupons: AdminCoupon[]
  brands: any[]
  products: any[]
}

export function CouponsClient({ initialCoupons, brands, products }: CouponsClientProps) {
  const [coupons, setCoupons] = useState<AdminCoupon[]>(initialCoupons)
  const [search, setSearch] = useState('')
  const [selectedBrandFilter, setSelectedBrandFilter] = useState('')
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('')
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [notification, setNotification] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  // Form State
  const [formCode, setFormCode] = useState('')
  const [formDiscountType, setFormDiscountType] = useState<'percentage' | 'fixed'>('percentage')
  const [formDiscountPercent, setFormDiscountPercent] = useState('20')
  const [formDiscountAmount, setFormDiscountAmount] = useState('10.00')
  const [formBrandId, setFormBrandId] = useState('')
  const [formProductId, setFormProductId] = useState('')
  const [formExpiresAt, setFormExpiresAt] = useState('')
  const [formMaxRedemptions, setFormMaxRedemptions] = useState('')

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const generateRandomCode = () => {
    const prefixes = ['TOY', 'DEAL', 'VIP', 'FLASH', 'SAVE']
    const p = prefixes[Math.floor(Math.random() * prefixes.length)]
    const num = Math.floor(10 + Math.random() * 90)
    setFormCode(`${p}${num}`)
  }

  const resetForm = () => {
    setFormCode('')
    setFormDiscountType('percentage')
    setFormDiscountPercent('20')
    setFormDiscountAmount('10.00')
    setFormBrandId('')
    setFormProductId('')
    setFormExpiresAt('')
    setFormMaxRedemptions('')
  }

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    startTransition(async () => {
      const res = await createAdminCouponAction(
        {
          code: formCode,
          discountType: formDiscountType,
          discountPercent: formDiscountType === 'percentage' ? Number(formDiscountPercent) : undefined,
          discountAmountUsd: formDiscountType === 'fixed' ? Number(formDiscountAmount) : undefined,
          brandId: formBrandId || null,
          productId: formProductId || null,
          expiresAt: formExpiresAt || null,
          maxRedemptions: formMaxRedemptions ? Number(formMaxRedemptions) : null,
        },
        'naiemshaikhofficial@gmail.com'
      )

      if (res.success && res.coupon) {
        setCoupons((prev) => [res.coupon!, ...prev])
        setNotification({ text: `Coupon "${res.coupon!.code}" created successfully!`, type: 'success' })
        setIsModalOpen(false)
        resetForm()
      } else {
        setNotification({ text: res.error || 'Failed to create coupon.', type: 'error' })
      }
    })
  }

  const handleToggleActive = async (couponId: string, current: boolean) => {
    startTransition(async () => {
      const res = await toggleAdminCouponActiveAction(couponId, current, 'naiemshaikhofficial@gmail.com')
      if (res.success) {
        setCoupons((prev) =>
          prev.map((c) => (c.id === couponId ? { ...c, is_active: res.is_active! } : c))
        )
      }
    })
  }

  const handleDelete = async (couponId: string) => {
    if (!confirm('Are you sure you want to permanently delete this coupon code?')) return
    startTransition(async () => {
      const res = await deleteAdminCouponAction(couponId, 'naiemshaikhofficial@gmail.com')
      if (res.success) {
        setCoupons((prev) => prev.filter((c) => c.id !== couponId))
        setNotification({ text: 'Coupon deleted successfully.', type: 'success' })
      }
    })
  }

  // Filter products by selected modal brand
  const modalAvailableProducts = formBrandId
    ? products.filter((p) => p.brand_id === formBrandId)
    : products

  // Filtered list
  const filteredCoupons = coupons.filter((c) => {
    if (search.trim()) {
      const q = search.toLowerCase()
      const codeMatch = c.code.toLowerCase().includes(q)
      const brandMatch = c.brands?.name?.toLowerCase().includes(q)
      const prodMatch = c.products?.name?.toLowerCase().includes(q)
      if (!codeMatch && !brandMatch && !prodMatch) return false
    }
    if (selectedBrandFilter && c.brand_id !== selectedBrandFilter) {
      return false
    }
    if (selectedTypeFilter && c.discount_type !== selectedTypeFilter) {
      return false
    }
    return true
  })

  const activeCount = coupons.filter((c) => c.is_active).length
  const totalRedeemed = coupons.reduce((acc, c) => acc + (c.times_redeemed || 0), 0)

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between transition-all ${
            notification.type === 'success'
              ? 'bg-zinc-900 border-zinc-700 text-zinc-100'
              : 'bg-red-500/10 border-red-500/20 text-red-400'
          }`}
        >
          <div className="flex items-center gap-2 text-xs">
            {notification.type === 'success' ? (
              <Check className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400" />
            )}
            <span>{notification.text}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-zinc-500 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="epic-card p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-[#181818] border border-[#2a2a2a] flex items-center justify-center shrink-0">
            <Tag className="w-5 h-5 text-zinc-300" />
          </div>
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">Active Coupons</div>
            <div className="text-xl font-bold font-mono text-white mt-0.5">
              {activeCount} <span className="text-xs text-zinc-400 font-normal">/ {coupons.length} total</span>
            </div>
          </div>
        </div>

        <div className="epic-card p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-[#181818] border border-[#2a2a2a] flex items-center justify-center shrink-0">
            <Users className="w-5 h-5 text-zinc-300" />
          </div>
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">Total Checkouts Redeemed</div>
            <div className="text-xl font-bold font-mono text-white mt-0.5">
              {totalRedeemed} <span className="text-xs text-zinc-400 font-normal">uses</span>
            </div>
          </div>
        </div>

        <div className="epic-card p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-[#181818] border border-[#2a2a2a] flex items-center justify-center shrink-0">
            <Percent className="w-5 h-5 text-zinc-300" />
          </div>
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">Coupon Validation</div>
            <div className="text-xs font-semibold text-zinc-200 mt-1">Real-time DB + Instant Cart Apply</div>
          </div>
        </div>
      </div>

      {/* Filter and Action Header */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search */}
          <div className="relative min-w-[240px] flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Search code, brand, product..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="epic-input pl-9"
            />
          </div>

          {/* Brand Filter */}
          <select
            value={selectedBrandFilter}
            onChange={(e) => setSelectedBrandFilter(e.target.value)}
            className="epic-select w-auto text-xs"
          >
            <option value="">All Brands & Platform</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>

          {/* Type Filter */}
          <select
            value={selectedTypeFilter}
            onChange={(e) => setSelectedTypeFilter(e.target.value)}
            className="epic-select w-auto text-xs"
          >
            <option value="">All Discount Types</option>
            <option value="percentage">Percentage (%)</option>
            <option value="fixed">Fixed Off ($)</option>
          </select>
        </div>

        <button
          onClick={() => {
            resetForm()
            generateRandomCode()
            setIsModalOpen(true)
          }}
          className="epic-btn-primary shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Create Coupon Code</span>
        </button>
      </div>

      {/* Coupons Table */}
      <div className="epic-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#181818] text-zinc-400 font-mono uppercase text-[10px] border-b border-[#2a2a2a]">
              <tr>
                <th className="py-3 px-4">Coupon Code</th>
                <th className="py-3 px-3">Discount</th>
                <th className="py-3 px-3">Brand / Store</th>
                <th className="py-3 px-3">Product Scope</th>
                <th className="py-3 px-3">Redemptions</th>
                <th className="py-3 px-3">Expiration</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2a2a]">
              {filteredCoupons.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-zinc-400">
                    No coupon codes found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredCoupons.map((c) => {
                  const isExpired = c.expires_at ? new Date(c.expires_at) < new Date() : false
                  const isLimitReached = c.max_redemptions ? c.times_redeemed >= c.max_redemptions : false

                  return (
                    <tr key={c.id} className="hover:bg-[#181818]/60 transition">
                      {/* Code */}
                      <td className="py-3.5 px-4 font-mono font-bold text-white">
                        <div className="flex items-center gap-2">
                          <span className="bg-[#141414] border border-[#2a2a2a] px-2 py-0.5 rounded text-xs tracking-wider">
                            {c.code}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyCode(c.code)}
                            className="text-zinc-500 hover:text-white transition"
                            title="Copy code"
                          >
                            {copiedCode === c.code ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Discount */}
                      <td className="py-3.5 px-3">
                        {c.discount_type === 'fixed' ? (
                          <span className="font-mono text-emerald-400 font-bold">
                            ${Number(c.discount_amount_usd || 0).toFixed(2)} OFF
                          </span>
                        ) : (
                          <span className="font-mono text-sky-400 font-bold">
                            {c.discount_percent}% OFF
                          </span>
                        )}
                      </td>

                      {/* Brand */}
                      <td className="py-3.5 px-3">
                        {c.brands?.name ? (
                          <span className="text-zinc-300 font-medium">{c.brands.name}</span>
                        ) : (
                          <span className="text-zinc-400 font-mono text-[10px] bg-[#181818] px-1.5 py-0.5 rounded border border-[#2a2a2a]">
                            Storewide (Platform)
                          </span>
                        )}
                      </td>

                      {/* Product Scope */}
                      <td className="py-3.5 px-3">
                        {c.products?.name ? (
                          <span className="text-zinc-300 truncate max-w-[180px] block" title={c.products.name}>
                            {c.products.name}
                          </span>
                        ) : (
                          <span className="text-zinc-400 font-mono text-[10px]">All Products</span>
                        )}
                      </td>

                      {/* Redemptions */}
                      <td className="py-3.5 px-3 font-mono text-zinc-300">
                        {c.times_redeemed}
                        <span className="text-zinc-500">
                          {c.max_redemptions ? ` / ${c.max_redemptions}` : ' (unlimited)'}
                        </span>
                        {isLimitReached && (
                          <span className="text-[9px] text-amber-400 block font-sans">Cap Reached</span>
                        )}
                      </td>

                      {/* Expiration */}
                      <td className="py-3.5 px-3 text-zinc-400 font-mono text-[11px]">
                        {c.expires_at ? (
                          <span className={isExpired ? 'text-red-400 font-bold' : 'text-zinc-300'}>
                            {new Date(c.expires_at).toLocaleDateString()}
                            {isExpired && ' (Expired)'}
                          </span>
                        ) : (
                          <span className="text-zinc-600">Never</span>
                        )}
                      </td>

                      {/* Status Toggle */}
                      <td className="py-3.5 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(c.id, c.is_active)}
                          className={`w-8 h-4.5 rounded-full p-0.5 transition relative inline-flex items-center ${
                            c.is_active && !isExpired ? 'bg-white' : 'bg-[#2a2a2a]'
                          }`}
                        >
                          <span
                            className={`w-3.5 h-3.5 rounded-full transition-transform transform ${
                              c.is_active && !isExpired
                                ? 'translate-x-3.5 bg-black'
                                : 'translate-x-0 bg-zinc-500'
                            }`}
                          />
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleDelete(c.id)}
                          className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded transition"
                          title="Delete coupon"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Coupon Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateSubmit}
            className="epic-card bg-[#181818] max-w-lg w-full p-6 space-y-4 border border-[#2a2a2a]"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#2a2a2a]">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-white" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                  Create Platform or Brand Coupon
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-500 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Code */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-mono text-zinc-400 uppercase font-semibold">
                  Coupon Code *
                </label>
                <button
                  type="button"
                  onClick={generateRandomCode}
                  className="text-[11px] text-zinc-400 hover:text-white flex items-center gap-1 transition"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Random Code</span>
                </button>
              </div>
              <input
                type="text"
                required
                placeholder="e.g. TOY20"
                value={formCode}
                onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                className="epic-input uppercase font-mono font-bold tracking-wider"
              />
            </div>

            {/* Discount Type */}
            <div>
              <label className="text-[11px] font-mono text-zinc-400 uppercase font-semibold block mb-1">
                Discount Type *
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFormDiscountType('percentage')}
                  className={`p-2.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 transition ${
                    formDiscountType === 'percentage'
                      ? 'bg-white text-black border-white'
                      : 'bg-[#141414] text-zinc-400 border-[#2a2a2a] hover:text-white'
                  }`}
                >
                  <Percent className="w-4 h-4" />
                  <span>Percentage (%)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormDiscountType('fixed')}
                  className={`p-2.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 transition ${
                    formDiscountType === 'fixed'
                      ? 'bg-white text-black border-white'
                      : 'bg-[#141414] text-zinc-400 border-[#2a2a2a] hover:text-white'
                  }`}
                >
                  <DollarSign className="w-4 h-4" />
                  <span>Fixed Off ($)</span>
                </button>
              </div>
            </div>

            {/* Value */}
            <div>
              <label className="text-[11px] font-mono text-zinc-400 uppercase font-semibold block mb-1">
                {formDiscountType === 'percentage' ? 'Discount Percentage (%) *' : 'Discount Amount (USD $) *'}
              </label>
              <input
                type="number"
                step={formDiscountType === 'percentage' ? '1' : '0.01'}
                min={formDiscountType === 'percentage' ? '1' : '0.50'}
                max={formDiscountType === 'percentage' ? '100' : '999'}
                required
                value={formDiscountType === 'percentage' ? formDiscountPercent : formDiscountAmount}
                onChange={(e) =>
                  formDiscountType === 'percentage'
                    ? setFormDiscountPercent(e.target.value)
                    : setFormDiscountAmount(e.target.value)
                }
                className="epic-input font-mono"
              />
            </div>

            {/* Brand and Product Scope */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-mono text-zinc-400 uppercase font-semibold block mb-1">
                  Brand Scope
                </label>
                <select
                  value={formBrandId}
                  onChange={(e) => {
                    setFormBrandId(e.target.value)
                    setFormProductId('')
                  }}
                  className="epic-select text-xs"
                >
                  <option value="">Storewide (Platform-wide)</option>
                  {brands.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-mono text-zinc-400 uppercase font-semibold block mb-1">
                  Product Scope
                </label>
                <select
                  value={formProductId}
                  onChange={(e) => setFormProductId(e.target.value)}
                  className="epic-select text-xs"
                >
                  <option value="">All Brand Products</option>
                  {modalAvailableProducts.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Expiry & Max Redemptions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-mono text-zinc-400 uppercase font-semibold block mb-1">
                  Expiration Date
                </label>
                <input
                  type="date"
                  value={formExpiresAt}
                  onChange={(e) => setFormExpiresAt(e.target.value)}
                  className="epic-input text-xs font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-zinc-400 uppercase font-semibold block mb-1">
                  Max Redemptions
                </label>
                <input
                  type="number"
                  min="1"
                  placeholder="Unlimited"
                  value={formMaxRedemptions}
                  onChange={(e) => setFormMaxRedemptions(e.target.value)}
                  className="epic-input text-xs font-mono"
                />
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#2a2a2a]">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="epic-btn-outline"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="epic-btn-primary"
              >
                {isPending ? 'Saving...' : 'Activate Coupon'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
