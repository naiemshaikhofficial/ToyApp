'use client'

import React, { useState, useTransition, useEffect } from 'react'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import {
  Package,
  Search,
  Filter,
  Plus,
  Play,
  Pause,
  ExternalLink,
  Edit,
  KeyRound,
  Eye,
  EyeOff,
  Star,
  CheckCircle,
  X,
  Volume2,
} from 'lucide-react'
import {
  toggleProductActiveAction,
  toggleProductFeaturedAction,
  upsertAdminProductAction,
  getAdminProductsAction,
} from '@/actions/productActions'
import { uploadSerialKeysAction } from '@/actions/licenseActions'

interface ProductsClientProps {
  initialProducts: any[]
  totalProducts: number
  brands: any[]
}

export function ProductsClient({ initialProducts, totalProducts, brands }: ProductsClientProps) {
  const searchParams = useSearchParams()
  const typeParam = searchParams.get('type')

  const [products, setProducts] = useState<any[]>(initialProducts)
  const [search, setSearch] = useState('')
  const [selectedBrandFilter, setSelectedBrandFilter] = useState('')
  const [selectedTypeFilter, setSelectedTypeFilter] = useState(() => typeParam || '')
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (typeParam) {
      setSelectedTypeFilter(typeParam)
    }
  }, [typeParam])

  // Audio Player Preview
  const [playingAudioUrl, setPlayingAudioUrl] = useState<string | null>(null)
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null)

  // Modals
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isSerialUploadOpen, setIsSerialUploadOpen] = useState(false)
  const [activeProductId, setActiveProductId] = useState<string | null>(null)
  const [rawSerialsText, setRawSerialsText] = useState('')
  const [notification, setNotification] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  // Form State
  const [productForm, setProductForm] = useState<any>({
    id: '',
    name: '',
    slug: '',
    brand_id: '',
    product_type: 'plugin',
    price_usd: 0,
    original_price_usd: '',
    cover_image: '',
    demo_audio_url: '',
    download_url_win: '',
    download_url_mac: '',
    download_url: '',
    vst_format: 'VST3, AU, AAX',
    operating_system: 'macOS 12+, Windows 10/11',
    supported_daws: 'Ableton Live, FL Studio, Logic Pro, Pro Tools, Reaper',
    plugin_identifier: '',
    max_activation_seats: 3,
    offline_grace_days: 14,
    version: '1.0.0',
    allow_external_url: false,
    external_url: '',
    button_text: '',
    affiliate_disclosure: false,
    short_description: '',
    full_description: '',
    is_active: true,
  })

  // Audio Toggle
  const togglePlayAudio = (url: string) => {
    if (playingAudioUrl === url) {
      audioElement?.pause()
      setPlayingAudioUrl(null)
      return
    }

    if (audioElement) {
      audioElement.pause()
    }

    const audio = new Audio(url)
    audio.play()
    audio.onended = () => setPlayingAudioUrl(null)
    setAudioElement(audio)
    setPlayingAudioUrl(url)
  }

  // Filtered products
  const filteredProducts = products.filter((p) => {
    if (search.trim() && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.slug?.toLowerCase().includes(search.toLowerCase())) {
      return false
    }
    if (selectedBrandFilter && p.brand_id !== selectedBrandFilter) {
      return false
    }
    if (selectedTypeFilter && p.product_type !== selectedTypeFilter) {
      return false
    }
    return true
  })

  // Open Edit Modal
  const handleOpenEdit = (p?: any) => {
    if (p) {
      setProductForm({
        id: p.id,
        name: p.name || '',
        slug: p.slug || '',
        brand_id: p.brand_id || '',
        product_type: p.product_type || 'plugin',
        price_usd: p.price_usd || 0,
        original_price_usd: p.original_price_usd || '',
        cover_image: p.cover_image || '',
        demo_audio_url: p.demo_audio_url || '',
        download_url_win: p.download_url_win || '',
        download_url_mac: p.download_url_mac || '',
        download_url: p.download_url || '',
        vst_format: p.vst_format || 'VST3, AU, AAX',
        operating_system: p.operating_system || 'macOS 12+, Windows 10/11',
        supported_daws: p.supported_daws || 'Ableton Live, FL Studio, Logic Pro, Pro Tools, Reaper',
        plugin_identifier: p.plugin_identifier || '',
        max_activation_seats: p.max_activation_seats || 3,
        offline_grace_days: p.offline_grace_days || 14,
        version: p.version || '1.0.0',
        allow_external_url: Boolean(p.allow_external_url),
        external_url: p.external_url || '',
        button_text: p.button_text || '',
        affiliate_disclosure: Boolean(p.affiliate_disclosure),
        short_description: p.short_description || '',
        full_description: p.full_description || '',
        is_active: p.is_active ?? true,
      })
    } else {
      setProductForm({
        id: '',
        name: '',
        slug: '',
        brand_id: brands[0]?.id || '',
        product_type: 'plugin',
        price_usd: 19,
        original_price_usd: 39,
        cover_image: '',
        demo_audio_url: '',
        download_url_win: '',
        download_url_mac: '',
        download_url: '',
        vst_format: 'VST3, AU, AAX',
        operating_system: 'macOS 12+, Windows 10/11',
        supported_daws: 'Ableton Live, FL Studio, Logic Pro, Pro Tools, Reaper',
        plugin_identifier: '',
        max_activation_seats: 3,
        offline_grace_days: 14,
        version: '1.0.0',
        allow_external_url: false,
        external_url: '',
        button_text: '',
        affiliate_disclosure: false,
        short_description: '',
        full_description: '',
        is_active: true,
      })
    }
    setIsEditOpen(true)
  }

  // Toggle Active
  const handleToggleActive = async (productId: string, current: boolean) => {
    startTransition(async () => {
      const res = await toggleProductActiveAction(productId, current, 'naiemshaikhofficial@gmail.com')
      if (res.success) {
        setProducts((prev) =>
          prev.map((item) => (item.id === productId ? { ...item, is_active: res.is_active } : item))
        )
      }
    })
  }

  // Toggle Featured
  const handleToggleFeatured = async (productId: string, current: boolean) => {
    startTransition(async () => {
      const res = await toggleProductFeaturedAction(productId, current, 'naiemshaikhofficial@gmail.com')
      if (res.success) {
        setProducts((prev) =>
          prev.map((item) => (item.id === productId ? { ...item, is_featured: res.is_featured } : item))
        )
      }
    })
  }

  // Submit Product Form
  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    startTransition(async () => {
      const res = await upsertAdminProductAction(productForm, 'naiemshaikhofficial@gmail.com')
      if (res.success) {
        setNotification({ text: `Product "${productForm.name}" saved successfully!`, type: 'success' })
        setIsEditOpen(false)
        const reload = await getAdminProductsAction({ pageSize: 50 })
        if (reload.success) setProducts(reload.products)
      } else {
        setNotification({ text: res.error || 'Failed to save product', type: 'error' })
      }
    })
  }

  // Submit Serials Upload
  const handleSerialUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeProductId || !rawSerialsText.trim()) return

    startTransition(async () => {
      const res = await uploadSerialKeysAction({
        productId: activeProductId,
        rawKeys: rawSerialsText,
        staffEmail: 'naiemshaikhofficial@gmail.com',
      })
      if (res.success) {
        setNotification({
          text: `Success! Added ${res.inserted} serial keys into the inventory pool (${res.skipped} duplicates skipped).`,
          type: 'success',
        })
        setIsSerialUploadOpen(false)
        setRawSerialsText('')
      } else {
        setNotification({ text: res.error || 'Failed to upload serials', type: 'error' })
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

      {/* Control Bar: Search & Filters */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto flex-1">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search product name, slug, bundle id..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="epic-input pl-9 text-xs"
            />
          </div>

          {/* Brand Filter */}
          <select
            value={selectedBrandFilter}
            onChange={(e) => setSelectedBrandFilter(e.target.value)}
            className="epic-input w-auto text-xs font-mono"
          >
            <option value="">All Brands ({brands.length})</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>

          {/* Product Type Filter */}
          <select
            value={selectedTypeFilter}
            onChange={(e) => setSelectedTypeFilter(e.target.value)}
            className="epic-input w-auto text-xs font-mono"
          >
            <option value="">All Types</option>
            <option value="plugin">Plugins (VST/AU/AAX)</option>
            <option value="sample_pack">Sample Packs</option>
            <option value="preset">Preset Banks</option>
            <option value="template">DAW Templates</option>
          </select>
        </div>

        <button onClick={() => handleOpenEdit()} className="epic-btn-primary shrink-0">
          <Plus className="w-4 h-4" />
          <span>Create Product</span>
        </button>
      </div>

      {/* Products Table */}
      <div className="epic-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#181818] text-zinc-400 font-mono uppercase text-[10px] border-b border-[#2a2a2a]">
              <tr>
                <th className="py-3 px-4">Item</th>
                <th className="py-3 px-3">Brand</th>
                <th className="py-3 px-3">Type & Formats</th>
                <th className="py-3 px-3">Price</th>
                <th className="py-3 px-3">Pool Stock</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2a2a]">
              {filteredProducts.map((p) => {
                const serialCount = Array.isArray(p.serial_keys) ? p.serial_keys.length : (p.serial_keys?.[0]?.count || 0)
                return (
                  <tr key={p.id} className="hover:bg-[#181818]/60 transition">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded bg-[#181818] border border-[#2a2a2a] flex items-center justify-center overflow-hidden shrink-0 relative group">
                          {p.cover_image ? (
                            <img src={p.cover_image} alt={p.name} className="w-full h-full object-cover" />
                          ) : (
                            <Package className="w-5 h-5 text-zinc-600" />
                          )}
                          {p.demo_audio_url && (
                            <button
                              onClick={() => togglePlayAudio(p.demo_audio_url)}
                              className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-white"
                              title="Play Demo"
                            >
                              {playingAudioUrl === p.demo_audio_url ? (
                                <Pause className="w-4 h-4 text-white" />
                              ) : (
                                <Play className="w-4 h-4 text-white" />
                              )}
                            </button>
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-white text-xs hover:text-zinc-300 flex items-center gap-1.5">
                            {p.name}
                            {p.is_featured && <Star className="w-3.5 h-3.5 text-white fill-white" />}
                          </div>
                          <div className="text-[10px] text-zinc-500 font-mono mt-0.5">
                            v{p.version || '1.0.0'} • /{p.slug}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-3">
                      <div className="text-zinc-300 font-medium">{p.brands?.name || 'Producer Toy'}</div>
                    </td>

                    <td className="py-3.5 px-3 font-mono text-[11px]">
                      <div className="capitalize text-zinc-200">{p.product_type}</div>
                      <div className="text-[10px] text-zinc-500">{p.vst_format || 'Universal'}</div>
                    </td>

                    <td className="py-3.5 px-3 font-mono">
                      <div className="text-white font-bold">${p.price_usd}</div>
                      {p.original_price_usd && (
                        <div className="text-[10px] text-zinc-500 line-through">${p.original_price_usd}</div>
                      )}
                    </td>

                    <td className="py-3.5 px-3 font-mono">
                      <button
                        onClick={() => {
                          setActiveProductId(p.id)
                          setIsSerialUploadOpen(true)
                        }}
                        className="text-[11px] underline hover:text-white flex items-center gap-1"
                        title="Upload Serials"
                      >
                        <KeyRound className="w-3.5 h-3.5 text-zinc-400" />
                        <span>{serialCount} in pool</span>
                      </button>
                    </td>

                    <td className="py-3.5 px-3 text-center">
                      <button
                        onClick={() => handleToggleActive(p.id, p.is_active)}
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border transition ${
                          p.is_active
                            ? 'bg-[#262626] text-white border-[#383838]'
                            : 'bg-[#181818] text-zinc-500 border-[#2a2a2a]'
                        }`}
                      >
                        {p.is_active ? 'PUBLISHED' : 'DRAFT'}
                      </button>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggleFeatured(p.id, p.is_featured)}
                          title="Toggle Featured"
                          className="p-1.5 rounded hover:bg-[#2a2a2a] text-zinc-400 hover:text-white transition"
                        >
                          <Star className={`w-3.5 h-3.5 ${p.is_featured ? 'text-white fill-white' : ''}`} />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(p)}
                          title="Edit Product"
                          className="p-1.5 rounded hover:bg-[#2a2a2a] text-zinc-400 hover:text-white transition"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <a
                          href={`https://producertoy.com/product/${p.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          title="View on Storefront"
                          className="p-1.5 rounded hover:bg-[#2a2a2a] text-zinc-400 hover:text-white transition"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Edit / Create Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleProductSubmit} className="epic-card bg-[#181818] max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#2a2a2a]">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                {productForm.id ? `Edit Product: ${productForm.name}` : 'Create New Product'}
              </h3>
              <button type="button" onClick={() => setIsEditOpen(false)} className="text-zinc-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-mono text-zinc-400 uppercase font-semibold">Product Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ProVerb Algorithmic Reverb"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  className="epic-input mt-1"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-zinc-400 uppercase font-semibold">Slug</label>
                <input
                  type="text"
                  required
                  value={productForm.slug}
                  onChange={(e) => setProductForm({ ...productForm, slug: e.target.value })}
                  className="epic-input mt-1 font-mono text-xs"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-zinc-400 uppercase font-semibold">Brand / Manufacturer</label>
                <select
                  value={productForm.brand_id}
                  onChange={(e) => setProductForm({ ...productForm, brand_id: e.target.value })}
                  className="epic-input mt-1 font-mono text-xs"
                >
                  <option value="">Select Brand</option>
                  {brands.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-mono text-zinc-400 uppercase font-semibold">Product Type</label>
                <select
                  value={productForm.product_type}
                  onChange={(e) => setProductForm({ ...productForm, product_type: e.target.value })}
                  className="epic-input mt-1 font-mono text-xs"
                >
                  <option value="plugin">Audio Plugin (VST3 / AU / AAX)</option>
                  <option value="sample_pack">Audio Sample Pack</option>
                  <option value="preset">Preset Bank</option>
                  <option value="template">DAW Template</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-mono text-zinc-400 uppercase font-semibold">Price USD</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={productForm.price_usd}
                  onChange={(e) => setProductForm({ ...productForm, price_usd: e.target.value })}
                  className="epic-input mt-1 font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-zinc-400 uppercase font-semibold">Original Price USD (Strikethrough)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="e.g. 49.00"
                  value={productForm.original_price_usd}
                  onChange={(e) => setProductForm({ ...productForm, original_price_usd: e.target.value })}
                  className="epic-input mt-1 font-mono"
                />
              </div>
            </div>

            {/* Direct Link & Brand Referral Redirect */}
            <div className="space-y-3 pt-2 border-t border-[#2a2a2a] bg-[#121212]/50 p-3.5 rounded-lg border border-[#242424]">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs font-semibold text-white block">External Referral Allotment</label>
                  <p className="text-[10px] text-zinc-400 mt-0.5">
                    Authorize this product to redirect buyers to an external brand website and unlock referral editing in Creator Portal.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={Boolean(productForm.allow_external_url)}
                  onChange={(e) => setProductForm({ ...productForm, allow_external_url: e.target.checked })}
                  className="w-4 h-4 rounded bg-[#181818] border-[#383838] text-white focus:ring-0 cursor-pointer"
                />
              </div>

              {productForm.allow_external_url && (
                <div className="space-y-3 pt-2 border-t border-[#242424]">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <label className="text-[11px] font-mono text-zinc-300 uppercase font-semibold">Direct Store Link / Referral URL</label>
                      </div>
                      <input
                        type="url"
                        placeholder="https://brandstore.com/checkout or partner link"
                        value={productForm.external_url}
                        onChange={(e) => setProductForm({ ...productForm, external_url: e.target.value })}
                        className="epic-input text-xs"
                      />
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <label className="text-[11px] font-mono text-zinc-300 uppercase font-semibold">Custom CTA Button Text</label>
                      </div>
                      <input
                        type="text"
                        placeholder="e.g. Get on Brand Website / Buy from Partner"
                        value={productForm.button_text}
                        onChange={(e) => setProductForm({ ...productForm, button_text: e.target.value })}
                        className="epic-input text-xs"
                      />
                    </div>
                  </div>

                  {/* Affiliate Disclosure Tick Mark */}
                  <div className="pt-2 border-t border-[#1f1f1f] flex items-start gap-2.5">
                    <input
                      type="checkbox"
                      id="adminAffiliateDisclosure"
                      checked={Boolean(productForm.affiliate_disclosure)}
                      onChange={(e) => setProductForm({ ...productForm, affiliate_disclosure: e.target.checked })}
                      className="mt-0.5 w-4 h-4 rounded bg-[#181818] border-[#383838] text-white focus:ring-0 cursor-pointer"
                    />
                    <label htmlFor="adminAffiliateDisclosure" className="text-xs text-zinc-300 cursor-pointer select-none">
                      <span className="font-semibold text-white block">Affiliate Disclosure</span>
                      <span className="text-[10px] text-zinc-400 block mt-0.5 leading-relaxed">
                        ProducerToy may earn a commission if you purchase {productForm.name || 'Groove Console'} through this link. This does not increase the price you pay.
                      </span>
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Media & Audio URLs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-[#2a2a2a]">
              <div>
                <label className="text-[11px] font-mono text-zinc-400 uppercase font-semibold">Cover Image URL</label>
                <input
                  type="url"
                  placeholder="https://.../cover.png"
                  value={productForm.cover_image}
                  onChange={(e) => setProductForm({ ...productForm, cover_image: e.target.value })}
                  className="epic-input mt-1 text-xs"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-zinc-400 uppercase font-semibold">Audio Demo Preview URL (.mp3 / .wav)</label>
                <input
                  type="url"
                  placeholder="https://.../demo.mp3"
                  value={productForm.demo_audio_url}
                  onChange={(e) => setProductForm({ ...productForm, demo_audio_url: e.target.value })}
                  className="epic-input mt-1 text-xs"
                />
              </div>
            </div>

            {/* Installer URLs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-[#2a2a2a]">
              <div>
                <label className="text-[11px] font-mono text-zinc-400 uppercase font-semibold">Windows Installer Link (.exe / .zip)</label>
                <input
                  type="url"
                  placeholder="Google Drive link or Direct URL"
                  value={productForm.download_url_win}
                  onChange={(e) => setProductForm({ ...productForm, download_url_win: e.target.value })}
                  className="epic-input mt-1 text-xs"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-zinc-400 uppercase font-semibold">macOS Installer Link (.pkg / .dmg)</label>
                <input
                  type="url"
                  placeholder="Google Drive link or Direct URL"
                  value={productForm.download_url_mac}
                  onChange={(e) => setProductForm({ ...productForm, download_url_mac: e.target.value })}
                  className="epic-input mt-1 text-xs"
                />
              </div>
            </div>

            {/* Audio Specs & Licensing */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t border-[#2a2a2a]">
              <div>
                <label className="text-[11px] font-mono text-zinc-400 uppercase font-semibold">Plugin Bundle ID</label>
                <input
                  type="text"
                  placeholder="com.brand.plugin"
                  value={productForm.plugin_identifier}
                  onChange={(e) => setProductForm({ ...productForm, plugin_identifier: e.target.value })}
                  className="epic-input mt-1 font-mono text-xs"
                />
              </div>
              <div>
                <label className="text-[11px] font-mono text-zinc-400 uppercase font-semibold">Max Seats (Default: 3)</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={productForm.max_activation_seats}
                  onChange={(e) => setProductForm({ ...productForm, max_activation_seats: e.target.value })}
                  className="epic-input mt-1 font-mono text-xs"
                />
              </div>
              <div>
                <label className="text-[11px] font-mono text-zinc-400 uppercase font-semibold">Offline Grace Days</label>
                <input
                  type="number"
                  min="1"
                  max="90"
                  value={productForm.offline_grace_days}
                  onChange={(e) => setProductForm({ ...productForm, offline_grace_days: e.target.value })}
                  className="epic-input mt-1 font-mono text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#2a2a2a]">
              <button type="button" onClick={() => setIsEditOpen(false)} className="epic-btn-outline">
                Cancel
              </button>
              <button type="submit" disabled={isPending} className="epic-btn-primary">
                {isPending ? 'Saving...' : 'Save Product'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Serial Keys Batch Upload Modal */}
      {isSerialUploadOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleSerialUploadSubmit} className="epic-card bg-[#181818] max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#2a2a2a]">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">Batch Upload Serial Keys</h3>
              <button type="button" onClick={() => setIsSerialUploadOpen(false)} className="text-zinc-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-zinc-400">
              Paste software activation serial keys below (separated by newlines or commas). Existing duplicate keys will be safely ignored.
            </p>

            <textarea
              rows={8}
              required
              placeholder="PT-ABCD-1234-EFGH&#10;PT-IJKL-5678-MNOP&#10;..."
              value={rawSerialsText}
              onChange={(e) => setRawSerialsText(e.target.value)}
              className="epic-input font-mono text-xs"
            />

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#2a2a2a]">
              <button type="button" onClick={() => setIsSerialUploadOpen(false)} className="epic-btn-outline">
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
