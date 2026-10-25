'use client'

import React, { useState, useTransition } from 'react'
import Image from 'next/image'
import {
  Building2,
  Search,
  CheckCircle,
  Plus,
  ExternalLink,
  Mail,
  Globe,
  Sliders,
  DollarSign,
  Package,
  X,
  FileCheck2,
  ChevronLeft,
  ChevronRight,
  Shield,
  ShieldCheck,
  Clock,
  AlertCircle,
  Copy,
  Check,
  Send,
  UserCheck,
} from 'lucide-react'
import {
  createBrandAction,
  updateBrandAction,
  updateBrandCommissionAction,
  getBrandsAction,
  getBrandByIdAction,
  toggleBrandVerificationAction,
  inviteBrandOwnerAction,
  getBrandOwnerAndInviteStatusAction,
  revokeBrandInviteAction,
} from '@/actions/brandActions'

interface BrandsClientProps {
  initialBrands: any[]
  totalBrands: number
}

export function BrandsClient({ initialBrands, totalBrands }: BrandsClientProps) {
  const [brands, setBrands] = useState<any[]>(initialBrands)
  const [search, setSearch] = useState('')
  const [isPending, startTransition] = useTransition()

  // Numbered Pagination State
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(24)
  const [totalCount, setTotalCount] = useState(totalBrands)

  // Selected brand for detail / edit
  const [selectedBrand, setSelectedBrand] = useState<any | null>(null)
  const [brandProducts, setBrandProducts] = useState<any[]>([])
  const [isLoadingDetail, setIsLoadingDetail] = useState(false)

  // Brand Owner & Invite Management State
  const [brandOwnerData, setBrandOwnerData] = useState<{
    activeOwner: any | null
    pendingInvite: any | null
  }>({ activeOwner: null, pendingInvite: null })
  const [inviteEmailInput, setInviteEmailInput] = useState('')
  const [isSendingInvite, setIsSendingInvite] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  // Active view: 'brands' (catalog) or 'verification' (compliance pipeline)
  const [activeTab, setActiveTab] = useState<'brands' | 'verification'>('brands')
  const [verificationFilter, setVerificationFilter] = useState<'all' | 'pending' | 'verified'>('all')
  const [verifyingId, setVerifyingId] = useState<string | null>(null)

  React.useEffect(() => {
    const handleUrlSync = () => {
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search)
        if (params.get('tab') === 'verification') {
          setActiveTab('verification')
        } else {
          setActiveTab('brands')
        }
        if (params.get('action') === 'new') {
          setIsCreateOpen(true)
        }
      }
    }
    handleUrlSync()
    window.addEventListener('popstate', handleUrlSync)
    window.addEventListener('toy-onboard-brand', () => setIsCreateOpen(true))
    return () => {
      window.removeEventListener('popstate', handleUrlSync)
      window.removeEventListener('toy-onboard-brand', () => setIsCreateOpen(true))
    }
  }, [])

  const handleToggleVerification = async (brandId: string, currentStatus: boolean, brandName: string) => {
    setVerifyingId(brandId)
    const nextVerify = !currentStatus
    try {
      const res = await toggleBrandVerificationAction({
        brandId,
        verify: nextVerify,
        staff_email: 'naiemshaikhofficial@gmail.com',
      })
      if (res.success) {
        setBrands((prev) =>
          prev.map((b) =>
            b.id === brandId
              ? {
                  ...b,
                  contract_accepted_at: nextVerify ? new Date().toISOString() : null,
                  contract_version: nextVerify ? 'v2.4' : null,
                }
              : b
          )
        )
        setMessage({
          text: `Brand "${brandName}" verification ${nextVerify ? 'approved & verified!' : 'revoked.'}`,
          type: 'success',
        })
      } else {
        setMessage({ text: res.error || 'Failed to update verification', type: 'error' })
      }
    } catch (err: any) {
      setMessage({ text: err.message || 'Error updating verification', type: 'error' })
    } finally {
      setVerifyingId(null)
    }
  }

  // Create Form State
  const [createForm, setCreateForm] = useState({
    name: '',
    slug: '',
    description: '',
    website_url: '',
    support_email: '',
    country: 'United States',
    logo_url: '',
    revenue_share_percent: 70,
    owner_email: '',
  })

  // Edit Form State
  const [editForm, setEditForm] = useState({
    id: '',
    name: '',
    slug: '',
    description: '',
    website_url: '',
    support_email: '',
    country: '',
    logo_url: '',
    revenue_share_percent: 70,
  })

  // Numbered Pagination Calculations
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
      const res = await getBrandsAction({ page: newPage, pageSize, search })
      if (res.success) {
        setBrands(res.data)
        setTotalCount(res.total)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    })
  }

  // Handle Page Size Change
  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize)
    setCurrentPage(1)
    startTransition(async () => {
      const res = await getBrandsAction({ page: 1, pageSize: newSize, search })
      if (res.success) {
        setBrands(res.data)
        setTotalCount(res.total)
      }
    })
  }

  // Filtered brands
  const filteredBrands = brands.filter((b) => {
    if (!search.trim()) return true
    return (
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.slug?.toLowerCase().includes(search.toLowerCase()) ||
      b.support_email?.toLowerCase().includes(search.toLowerCase())
    )
  })

  // Open brand detail
  const handleSelectBrand = async (brand: any) => {
    setSelectedBrand(brand)
    setIsLoadingDetail(true)
    setInviteEmailInput('')
    setCopiedLink(false)

    // Load brand details and products
    const res = await getBrandByIdAction(brand.id)
    if (res.success && res.brand) {
      setSelectedBrand(res.brand)
      setBrandProducts(res.products || [])
      setEditForm({
        id: res.brand.id,
        name: res.brand.name || '',
        slug: res.brand.slug || '',
        description: res.brand.description || '',
        website_url: res.brand.website_url || '',
        support_email: res.brand.support_email || '',
        country: res.brand.country || '',
        logo_url: res.brand.logo_url || '',
        revenue_share_percent: res.brand.brand_members?.[0]?.revenue_share_percent || 70,
      })
    }

    // Load active owner and pending invite status
    try {
      const statusRes = await getBrandOwnerAndInviteStatusAction(brand.id)
      if (statusRes.success) {
        setBrandOwnerData({
          activeOwner: statusRes.activeOwner,
          pendingInvite: statusRes.pendingInvite,
        })
      } else {
        setBrandOwnerData({ activeOwner: null, pendingInvite: null })
      }
    } catch {
      setBrandOwnerData({ activeOwner: null, pendingInvite: null })
    }

    setIsLoadingDetail(false)
  }

  // Handle Copy Invite Link
  const handleCopyInviteLink = (url: string) => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(url)
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 2500)
    }
  }

  // Handle Send or Resend Owner Invite
  const handleSendOwnerInvite = async (email: string) => {
    if (!selectedBrand || !email || !email.includes('@')) {
      setMessage({ text: 'Please provide a valid email address.', type: 'error' })
      return
    }
    setIsSendingInvite(true)
    try {
      const res = await inviteBrandOwnerAction({
        brandId: selectedBrand.id,
        email,
        staffEmail: 'naiemshaikhofficial@gmail.com',
      })
      if (res.success) {
        setMessage({
          text: `Invitation ${res.emailSent ? 'sent via email' : 'created successfully'} for ${email}!`,
          type: 'success',
        })
        setInviteEmailInput('')
        // Refresh owner data
        const statusRes = await getBrandOwnerAndInviteStatusAction(selectedBrand.id)
        if (statusRes.success) {
          setBrandOwnerData({
            activeOwner: statusRes.activeOwner,
            pendingInvite: statusRes.pendingInvite,
          })
        }
      } else {
        setMessage({ text: res.error || 'Failed to dispatch invite', type: 'error' })
      }
    } catch (err: any) {
      setMessage({ text: err.message || 'Error dispatching invite', type: 'error' })
    } finally {
      setIsSendingInvite(false)
    }
  }

  // Handle Revoke Invite
  const handleRevokeInvite = async (inviteId: string) => {
    if (!selectedBrand) return
    try {
      const res = await revokeBrandInviteAction({
        inviteId,
        brandId: selectedBrand.id,
        staffEmail: 'naiemshaikhofficial@gmail.com',
      })
      if (res.success) {
        setMessage({ text: 'Invitation revoked.', type: 'success' })
        const statusRes = await getBrandOwnerAndInviteStatusAction(selectedBrand.id)
        if (statusRes.success) {
          setBrandOwnerData({
            activeOwner: statusRes.activeOwner,
            pendingInvite: statusRes.pendingInvite,
          })
        }
      } else {
        setMessage({ text: res.error || 'Failed to revoke invite.', type: 'error' })
      }
    } catch (err: any) {
      setMessage({ text: err.message || 'Error revoking invite', type: 'error' })
    }
  }

  // Handle Search
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    startTransition(async () => {
      const res = await getBrandsAction({ search, page: 1, pageSize })
      if (res.success) {
        setBrands(res.data)
        setTotalCount(res.total)
      }
    })
  }

  // Handle Create Brand
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    startTransition(async () => {
      const res = await createBrandAction({
        ...createForm,
        staff_email: 'naiemshaikhofficial@gmail.com',
      })
      if (res.success) {
        let msg = `Brand "${createForm.name}" successfully onboarded!`
        if (res.inviteInfo?.inviteUrl) {
          msg += ` Owner invitation sent to ${createForm.owner_email}.`
        }
        setMessage({ text: msg, type: 'success' })
        setIsCreateOpen(false)
        setCreateForm({
          name: '',
          slug: '',
          description: '',
          website_url: '',
          support_email: '',
          country: 'United States',
          logo_url: '',
          revenue_share_percent: 70,
          owner_email: '',
        })
        const reload = await getBrandsAction({ pageSize: 60 })
        if (reload.success) setBrands(reload.data)
      } else {
        setMessage({ text: res.error || 'Failed to onboard brand', type: 'error' })
      }
    })
  }

  // Handle Edit Brand
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    startTransition(async () => {
      const res = await updateBrandAction({
        id: editForm.id,
        name: editForm.name,
        slug: editForm.slug,
        description: editForm.description,
        website_url: editForm.website_url,
        support_email: editForm.support_email,
        country: editForm.country,
        logo_url: editForm.logo_url,
        staff_email: 'naiemshaikhofficial@gmail.com',
      })

      if (res.success) {
        // Also update commission if changed
        await updateBrandCommissionAction({
          brandId: editForm.id,
          revenueSharePercent: Number(editForm.revenue_share_percent),
          staff_email: 'naiemshaikhofficial@gmail.com',
        })

        setMessage({ text: 'Brand updated successfully!', type: 'success' })
        setIsEditOpen(false)
        setSelectedBrand(res.brand)
        const reload = await getBrandsAction({ pageSize: 60 })
        if (reload.success) setBrands(reload.data)
      } else {
        setMessage({ text: res.error || 'Failed to update brand', type: 'error' })
      }
    })
  }

  return (
    <div className="space-y-6">
      {/* Alert Notification */}
      {message && (
        <div
          className={`p-4 rounded-lg flex items-center justify-between text-xs font-semibold ${
            message.type === 'success'
              ? 'bg-[#202020] text-white border border-[#383838]'
              : 'bg-[#202020] text-zinc-300 border border-zinc-700'
          }`}
        >
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="p-1 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* View Switcher Bar */}
      <div className="flex items-center justify-between border-b border-[#242424] pb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setActiveTab('brands')
              if (typeof window !== 'undefined') {
                const url = new URL(window.location.href)
                url.searchParams.delete('tab')
                window.history.replaceState({}, '', url.toString())
              }
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'brands'
                ? 'bg-white text-black shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-[#1a1a1a]'
            }`}
          >
            All Brands ({totalBrands})
          </button>
          <button
            onClick={() => {
              setActiveTab('verification')
              if (typeof window !== 'undefined') {
                const url = new URL(window.location.href)
                url.searchParams.set('tab', 'verification')
                window.history.replaceState({}, '', url.toString())
              }
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              activeTab === 'verification'
                ? 'bg-white text-black shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-[#1a1a1a]'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Brand Verification</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#202020] text-zinc-300 border border-[#2e2e2e]">
              {brands.filter((b) => !b.contract_accepted_at).length} Pending
            </span>
          </button>
        </div>

        <button onClick={() => setIsCreateOpen(true)} className="epic-btn-primary">
          <Plus className="w-4 h-4" />
          <span>Onboard Brand</span>
        </button>
      </div>

      {/* VIEW 1: BRAND VERIFICATION PIPELINE */}
      {activeTab === 'verification' ? (
        <div className="space-y-6">
          {/* Top Verification Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
            <div className="p-4 rounded-xl bg-[#181818] border border-[#2a2a2a] space-y-1">
              <span className="text-zinc-500 uppercase tracking-wider text-[10px]">Total Brands</span>
              <div className="text-xl font-bold text-white">{totalCount}</div>
            </div>
            <div className="p-4 rounded-xl bg-[#181818] border border-[#2a2a2a] space-y-1">
              <span className="text-zinc-500 uppercase tracking-wider text-[10px] flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-white" />
                <span>Verified & Active</span>
              </span>
              <div className="text-xl font-bold text-white">
                {brands.filter((b) => b.contract_accepted_at).length}
              </div>
            </div>
            <div className="p-4 rounded-xl bg-[#181818] border border-[#2a2a2a] space-y-1">
              <span className="text-zinc-500 uppercase tracking-wider text-[10px] flex items-center gap-1">
                <Clock className="w-3 h-3 text-zinc-400" />
                <span>Pending Review</span>
              </span>
              <div className="text-xl font-bold text-white">
                {brands.filter((b) => !b.contract_accepted_at).length}
              </div>
            </div>
          </div>

          {/* Verification Filters */}
          <div className="flex items-center gap-2">
            {(['all', 'pending', 'verified'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setVerificationFilter(filter)}
                className={`px-3 py-1 rounded-md text-xs font-mono capitalize transition ${
                  verificationFilter === filter
                    ? 'bg-white text-black font-bold'
                    : 'bg-[#181818] text-zinc-400 hover:text-white border border-[#2a2a2a]'
                }`}
              >
                {filter === 'all'
                  ? `All (${brands.length})`
                  : filter === 'pending'
                  ? `Pending Review (${brands.filter((b) => !b.contract_accepted_at).length})`
                  : `Verified (${brands.filter((b) => b.contract_accepted_at).length})`}
              </button>
            ))}
          </div>

          {/* Verification Cards List */}
          <div className="space-y-3">
            {brands
              .filter((b) => {
                if (verificationFilter === 'pending') return !b.contract_accepted_at
                if (verificationFilter === 'verified') return !!b.contract_accepted_at
                return true
              })
              .map((brand) => {
                const isVerified = !!brand.contract_accepted_at
                const isVerifying = verifyingId === brand.id

                return (
                  <div
                    key={brand.id}
                    className="p-5 rounded-xl bg-[#161616] border border-[#262626] flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-12 h-12 rounded-lg bg-[#202020] border border-[#2a2a2a] flex items-center justify-center overflow-hidden shrink-0">
                        {brand.logo_url ? (
                          <img
                            src={brand.logo_url}
                            alt={brand.name}
                            className="w-full h-full object-contain p-1"
                          />
                        ) : (
                          <Building2 className="w-6 h-6 text-zinc-500" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-white truncate">{brand.name}</h3>
                          <span
                            className={`text-[9px] font-mono px-2 py-0.5 rounded border uppercase font-bold flex items-center gap-1 ${
                              isVerified
                                ? 'bg-white text-black border-white'
                                : 'bg-[#202020] text-zinc-400 border-zinc-700'
                            }`}
                          >
                            {isVerified ? (
                              <>
                                <CheckCircle className="w-2.5 h-2.5" />
                                <span>VERIFIED</span>
                              </>
                            ) : (
                              <>
                                <Clock className="w-2.5 h-2.5" />
                                <span>PENDING</span>
                              </>
                            )}
                          </span>
                        </div>

                        <div className="text-xs text-zinc-400 mt-1 flex flex-wrap items-center gap-3 font-mono">
                          <span>/{brand.slug}</span>
                          <span>•</span>
                          <span>
                            {isVerified
                              ? `Terms Signed: ${new Date(brand.contract_accepted_at).toLocaleDateString()}`
                              : 'Awaiting Contract Signature'}
                          </span>
                          <span>•</span>
                          <span>Terms: {brand.contract_version || 'v2.4'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0 self-end md:self-center">
                      <button
                        onClick={() => handleSelectBrand(brand)}
                        className="px-3 py-1.5 rounded-lg border border-[#333333] hover:bg-[#202020] text-xs text-zinc-300 hover:text-white transition"
                      >
                        Review Brand
                      </button>

                      <button
                        onClick={() => handleToggleVerification(brand.id, isVerified, brand.name)}
                        disabled={isVerifying}
                        className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition disabled:opacity-50 ${
                          isVerified
                            ? 'bg-[#242424] text-zinc-300 hover:text-white border border-[#333]'
                            : 'bg-white text-black hover:bg-zinc-200'
                        }`}
                      >
                        {isVerifying ? 'Updating...' : isVerified ? 'Revoke Status' : 'Verify Brand'}
                      </button>
                    </div>
                  </div>
                )
              })}
          </div>
        </div>
      ) : (
        /* VIEW 2: ALL BRANDS CATALOG GRID */
        <div className="space-y-6">
          {/* Search Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <form onSubmit={handleSearchSubmit} className="flex-1 w-full max-w-md relative">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by brand name, slug, email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="epic-input pl-9"
              />
            </form>

            <div className="text-xs font-mono text-zinc-400">
              {filteredBrands.length} of {totalBrands} Brands
            </div>
          </div>

          {/* Brands Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBrands.map((brand) => {
              const productCount = Array.isArray(brand.products)
                ? brand.products.length
                : brand.products?.[0]?.count || 0
              const revShare = brand.brand_members?.[0]?.revenue_share_percent || 70

              return (
                <div
                  key={brand.id}
                  onClick={() => handleSelectBrand(brand)}
                  className="epic-card p-5 cursor-pointer hover:border-zinc-500 transition group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-lg bg-[#181818] border border-[#2a2a2a] flex items-center justify-center overflow-hidden shrink-0">
                          {brand.logo_url ? (
                            <img
                              src={brand.logo_url}
                              alt={brand.name}
                              className="w-full h-full object-contain p-1"
                            />
                          ) : (
                            <Building2 className="w-5 h-5 text-zinc-500" />
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-white group-hover:text-zinc-200 flex items-center gap-1.5">
                            {brand.name}
                            {brand.contract_accepted_at && (
                              <span title="Distribution Agreement Signed">
                                <CheckCircle className="w-3.5 h-3.5 text-zinc-300" />
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] font-mono text-zinc-500">/{brand.slug}</div>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300">
                        {revShare}% Share
                      </span>
                    </div>

                    {brand.description && (
                      <p className="text-xs text-zinc-400 mt-3 line-clamp-2 leading-relaxed">
                        {brand.description}
                      </p>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#2a2a2a] flex items-center justify-between text-[11px] text-zinc-500 font-mono">
                    <span className="flex items-center gap-1">
                      <Package className="w-3.5 h-3.5" />
                      {productCount} Products
                    </span>
                    <span>{brand.country || 'Global'}</span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Numbered Pagination Toolbar */}
          {totalPages > 1 && (
            <div className="pt-6 border-t border-[#242424] flex flex-col sm:flex-row items-center justify-between gap-4 select-none">
              <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-zinc-400">
                <span>
                  Showing <strong className="text-white">{startItem}-{endItem}</strong> of{' '}
                  <strong className="text-white">{totalCount}</strong> Brands
                </span>
                <div className="flex items-center gap-1.5 sm:ml-2 sm:pl-3 sm:border-l border-[#2a2a2a]">
                  <span className="text-zinc-500">Per page:</span>
                  {[12, 24, 48, 96].map((size) => (
                    <button
                      key={size}
                      onClick={() => handlePageSizeChange(size)}
                      className={`px-2 py-0.5 rounded text-[11px] font-mono transition ${
                        pageSize === size
                          ? 'bg-white text-black font-bold'
                          : 'bg-[#1e1e1e] text-zinc-400 hover:text-white border border-[#2a2a2a]'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
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
      )}

      {/* Selected Brand Detail Modal */}
      {selectedBrand && !isEditOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="epic-card bg-[#181818] max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-start justify-between pb-4 border-b border-[#2a2a2a]">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-[#202020] border border-[#2a2a2a] flex items-center justify-center overflow-hidden shrink-0">
                  {selectedBrand.logo_url ? (
                    <img src={selectedBrand.logo_url} alt={selectedBrand.name} className="w-full h-full object-contain p-1" />
                  ) : (
                    <Building2 className="w-6 h-6 text-zinc-500" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-black text-white flex items-center gap-2">
                    {selectedBrand.name}
                    {selectedBrand.contract_accepted_at && (
                      <CheckCircle className="w-4 h-4 text-white" />
                    )}
                  </h3>
                  <p className="text-xs font-mono text-zinc-400">Slug: {selectedBrand.slug}</p>
                </div>
              </div>
              <button onClick={() => setSelectedBrand(null)} className="p-1 hover:text-white text-zinc-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded bg-[#202020] border border-[#2a2a2a]">
                <div className="text-[10px] font-mono text-zinc-500 uppercase">Support Email</div>
                <div className="text-white font-medium mt-1">{selectedBrand.support_email || 'Not specified'}</div>
              </div>
              <div className="p-3 rounded bg-[#202020] border border-[#2a2a2a]">
                <div className="text-[10px] font-mono text-zinc-500 uppercase">Website</div>
                <div className="text-white font-medium mt-1 truncate">
                  {selectedBrand.website_url ? (
                    <a href={selectedBrand.website_url} target="_blank" rel="noreferrer" className="underline hover:text-zinc-300">
                      {selectedBrand.website_url}
                    </a>
                  ) : (
                    'Not specified'
                  )}
                </div>
              </div>
              <div className="p-3 rounded bg-[#202020] border border-[#2a2a2a]">
                <div className="text-[10px] font-mono text-zinc-500 uppercase">Contract Compliance</div>
                <div className="text-white font-medium mt-1 flex items-center gap-1">
                  <FileCheck2 className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Version {selectedBrand.contract_version || 'v1.0'} Verified</span>
                </div>
              </div>
              <div className="p-3 rounded bg-[#202020] border border-[#2a2a2a]">
                <div className="text-[10px] font-mono text-zinc-500 uppercase">Revenue Retain Split</div>
                <div className="text-white font-mono font-bold mt-1">
                  {selectedBrand.brand_members?.[0]?.revenue_share_percent || 70}% Creator / 30% Platform
                </div>
              </div>
            </div>

            {/* Brand Owner & Creator Portal Invitation */}
            <div className="p-4 rounded-xl bg-[#141414] border border-[#262626] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  <span className="text-[11px] font-mono uppercase font-bold text-white tracking-wider">
                    Brand Owner Portal &amp; Invitation
                  </span>
                </div>
                {brandOwnerData.activeOwner ? (
                  <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-white text-black">
                    OWNER ACTIVE
                  </span>
                ) : brandOwnerData.pendingInvite ? (
                  <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-[#202020] text-zinc-300 border border-[#333]">
                    INVITE PENDING
                  </span>
                ) : (
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-[#181818] text-zinc-500 border border-[#242424]">
                    NOT INVITED
                  </span>
                )}
              </div>

              {brandOwnerData.activeOwner ? (
                <div className="p-3 rounded-lg bg-[#181818] border border-[#2a2a2a] flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-white flex items-center gap-2">
                      <span>{brandOwnerData.activeOwner.name}</span>
                      <span className="text-[11px] font-mono text-zinc-400">({brandOwnerData.activeOwner.email})</span>
                    </div>
                    <div className="text-[10px] font-mono text-zinc-500 mt-0.5">
                      Status: {brandOwnerData.activeOwner.status} • Joined: {new Date(brandOwnerData.activeOwner.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#222] text-zinc-300 border border-[#2e2e2e]">
                      {brandOwnerData.activeOwner.revenueSharePercent}% Share
                    </span>
                  </div>
                </div>
              ) : brandOwnerData.pendingInvite ? (
                <div className="p-3 rounded-lg bg-[#181818] border border-[#2a2a2a] space-y-2.5 text-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="font-semibold text-white">{brandOwnerData.pendingInvite.email}</div>
                      <div className="text-[10px] font-mono text-zinc-500">
                        Dispatched: {new Date(brandOwnerData.pendingInvite.createdAt).toLocaleDateString()} • Role: Brand Owner
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {brandOwnerData.pendingInvite.inviteUrl && (
                        <button
                          type="button"
                          onClick={() => handleCopyInviteLink(brandOwnerData.pendingInvite.inviteUrl)}
                          className="px-2.5 py-1 rounded bg-[#222222] hover:bg-[#2c2c2c] border border-[#333333] text-[10px] font-mono text-white transition flex items-center gap-1"
                        >
                          {copiedLink ? <Check className="w-3 h-3 text-white" /> : <Copy className="w-3 h-3 text-zinc-400" />}
                          <span>{copiedLink ? 'Copied' : 'Copy Link'}</span>
                        </button>
                      )}
                      <button
                        type="button"
                        disabled={isSendingInvite}
                        onClick={() => handleSendOwnerInvite(brandOwnerData.pendingInvite.email)}
                        className="px-2.5 py-1 rounded bg-[#222222] hover:bg-[#2c2c2c] border border-[#333333] text-[10px] font-mono text-zinc-300 hover:text-white transition disabled:opacity-50"
                      >
                        {isSendingInvite ? 'Sending...' : 'Resend Email'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRevokeInvite(brandOwnerData.pendingInvite.id)}
                        className="px-2 py-1 rounded bg-[#1a1a1a] hover:bg-[#222] border border-[#2a2a2a] text-[10px] font-mono text-zinc-500 hover:text-zinc-300 transition"
                        title="Revoke Invitation"
                      >
                        Revoke
                      </button>
                    </div>
                  </div>
                  {brandOwnerData.pendingInvite.inviteUrl && (
                    <div className="p-2 rounded bg-[#121212] border border-[#222222] font-mono text-[10px] text-zinc-400 truncate">
                      <span className="text-zinc-500">Link: </span>
                      <span className="text-zinc-300">{brandOwnerData.pendingInvite.inviteUrl}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-3 rounded-lg bg-[#181818] border border-[#2a2a2a] space-y-2">
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    Send an executive invitation to the brand owner. They will receive an email with their secure onboarding link to claim this brand on <strong className="text-white">creators.producertoy.com</strong>.
                  </p>
                  <div className="flex items-center gap-2">
                    <input
                      type="email"
                      placeholder="e.g. founder@brand.com"
                      value={inviteEmailInput}
                      onChange={(e) => setInviteEmailInput(e.target.value)}
                      className="epic-input text-xs py-1.5 flex-1"
                    />
                    <button
                      type="button"
                      disabled={isSendingInvite || !inviteEmailInput.trim()}
                      onClick={() => handleSendOwnerInvite(inviteEmailInput)}
                      className="px-3.5 py-1.5 rounded-lg bg-white text-black hover:bg-zinc-200 text-xs font-semibold disabled:opacity-40 transition shrink-0 flex items-center gap-1.5"
                    >
                      <Send className="w-3 h-3" />
                      <span>{isSendingInvite ? 'Sending...' : 'Send Owner Invite'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Brand Catalog Preview */}
            <div>
              <div className="text-xs font-mono uppercase text-zinc-400 font-bold mb-3">
                Brand Catalog ({brandProducts.length} Products)
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {brandProducts.length > 0 ? (
                  brandProducts.map((p) => (
                    <div key={p.id} className="p-2.5 rounded bg-[#202020] border border-[#2a2a2a] flex items-center justify-between text-xs">
                      <div>
                        <div className="font-semibold text-white">{p.name}</div>
                        <div className="text-[10px] text-zinc-500 font-mono capitalize">{p.product_type}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-bold text-white">${p.price_usd}</div>
                        <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded border ${p.is_active ? 'bg-[#262626] text-white border-[#383838]' : 'bg-[#181818] text-zinc-500 border-[#2a2a2a]'}`}>
                          {p.is_active ? 'LIVE' : 'DRAFT'}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-zinc-500 font-mono py-4 text-center">No catalog items listed under this brand yet.</div>
                )}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#2a2a2a]">
              <button onClick={() => setSelectedBrand(null)} className="epic-btn-outline">
                Close
              </button>
              <button
                onClick={() => {
                  setIsEditOpen(true)
                }}
                className="epic-btn-primary"
              >
                Edit Brand Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Brand Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleEditSubmit} className="epic-card bg-[#181818] max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#2a2a2a]">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">Edit Brand: {editForm.name}</h3>
              <button type="button" onClick={() => setIsEditOpen(false)} className="text-zinc-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="text-[11px] font-mono text-zinc-400 uppercase font-semibold">Brand / Manufacturer Name</label>
              <input
                type="text"
                required
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="epic-input mt-1"
              />
            </div>

            <div>
              <label className="text-[11px] font-mono text-zinc-400 uppercase font-semibold">Slug Identifier</label>
              <input
                type="text"
                required
                value={editForm.slug}
                onChange={(e) => setEditForm({ ...editForm, slug: e.target.value })}
                className="epic-input mt-1"
              />
            </div>

            <div>
              <label className="text-[11px] font-mono text-zinc-400 uppercase font-semibold">Support Email</label>
              <input
                type="email"
                value={editForm.support_email}
                onChange={(e) => setEditForm({ ...editForm, support_email: e.target.value })}
                className="epic-input mt-1"
              />
            </div>

            <div>
              <label className="text-[11px] font-mono text-zinc-400 uppercase font-semibold">Official Website</label>
              <input
                type="url"
                value={editForm.website_url}
                onChange={(e) => setEditForm({ ...editForm, website_url: e.target.value })}
                className="epic-input mt-1"
              />
            </div>

            <div>
              <label className="text-[11px] font-mono text-zinc-400 uppercase font-semibold">Logo Image URL</label>
              <input
                type="url"
                value={editForm.logo_url}
                onChange={(e) => setEditForm({ ...editForm, logo_url: e.target.value })}
                className="epic-input mt-1"
              />
            </div>

            <div>
              <label className="text-[11px] font-mono text-zinc-400 uppercase font-semibold">
                Creator Revenue Share % (Standard: 70%)
              </label>
              <input
                type="number"
                min="10"
                max="95"
                value={editForm.revenue_share_percent}
                onChange={(e) => setEditForm({ ...editForm, revenue_share_percent: Number(e.target.value) })}
                className="epic-input mt-1 font-mono"
              />
            </div>

            <div>
              <label className="text-[11px] font-mono text-zinc-400 uppercase font-semibold">Brand Description</label>
              <textarea
                rows={3}
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                className="epic-input mt-1"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#2a2a2a]">
              <button type="button" onClick={() => setIsEditOpen(false)} className="epic-btn-outline">
                Cancel
              </button>
              <button type="submit" disabled={isPending} className="epic-btn-primary">
                {isPending ? 'Saving...' : 'Save Brand Settings'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Onboard New Brand Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleCreateSubmit} className="epic-card bg-[#181818] max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#2a2a2a]">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">Onboard New Audio Brand</h3>
              <button type="button" onClick={() => setIsCreateOpen(false)} className="text-zinc-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="text-[11px] font-mono text-zinc-400 uppercase font-semibold">Brand / Manufacturer Name</label>
              <input
                type="text"
                required
                placeholder="e.g. FORGE Multimedia Group LLC"
                value={createForm.name}
                onChange={(e) => {
                  const val = e.target.value
                  setCreateForm({
                    ...createForm,
                    name: val,
                    slug: val.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/--+/g, '-'),
                  })
                }}
                className="epic-input mt-1"
              />
            </div>

            <div>
              <label className="text-[11px] font-mono text-zinc-400 uppercase font-semibold">URL Slug</label>
              <input
                type="text"
                required
                value={createForm.slug}
                onChange={(e) => setCreateForm({ ...createForm, slug: e.target.value })}
                className="epic-input mt-1 font-mono text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-mono text-zinc-400 uppercase font-semibold">Support Email</label>
                <input
                  type="email"
                  placeholder="contact@brand.com"
                  value={createForm.support_email}
                  onChange={(e) => setCreateForm({ ...createForm, support_email: e.target.value })}
                  className="epic-input mt-1 text-xs"
                />
              </div>
              <div>
                <label className="text-[11px] font-mono text-zinc-400 uppercase font-semibold">Country</label>
                <input
                  type="text"
                  placeholder="United States"
                  value={createForm.country}
                  onChange={(e) => setCreateForm({ ...createForm, country: e.target.value })}
                  className="epic-input mt-1 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-mono text-zinc-400 uppercase font-semibold">Official Website</label>
              <input
                type="url"
                placeholder="https://brand.com"
                value={createForm.website_url}
                onChange={(e) => setCreateForm({ ...createForm, website_url: e.target.value })}
                className="epic-input mt-1 text-xs"
              />
            </div>

            <div>
              <label className="text-[11px] font-mono text-zinc-400 uppercase font-semibold">Logo Image URL</label>
              <input
                type="url"
                placeholder="https://.../logo.png"
                value={createForm.logo_url}
                onChange={(e) => setCreateForm({ ...createForm, logo_url: e.target.value })}
                className="epic-input mt-1 text-xs"
              />
            </div>

            <div>
              <label className="text-[11px] font-mono text-zinc-400 uppercase font-semibold">Description</label>
              <textarea
                rows={2}
                placeholder="Professional boutique audio software & sample instruments."
                value={createForm.description}
                onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                className="epic-input mt-1 text-xs"
              />
            </div>

            <div>
              <label className="text-[11px] font-mono text-zinc-400 uppercase font-semibold flex items-center justify-between">
                <span>Brand Owner Email</span>
                <span className="text-[10px] text-zinc-500 font-normal">Optional • Auto-dispatches invite</span>
              </label>
              <input
                type="email"
                placeholder="founder@brand.com (Sends executive onboarding link)"
                value={createForm.owner_email}
                onChange={(e) => setCreateForm({ ...createForm, owner_email: e.target.value })}
                className="epic-input mt-1 text-xs"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#2a2a2a]">
              <button type="button" onClick={() => setIsCreateOpen(false)} className="epic-btn-outline">
                Cancel
              </button>
              <button type="submit" disabled={isPending} className="epic-btn-primary">
                {isPending ? 'Onboarding...' : 'Complete Onboarding'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
