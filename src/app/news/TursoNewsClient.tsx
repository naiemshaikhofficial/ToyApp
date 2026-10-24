'use client'

import React, { useState, useTransition } from 'react'
import {
  Newspaper,
  Search,
  Plus,
  ExternalLink,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  Star,
  Clock,
  Tag,
  CheckCircle,
  RefreshCw,
  Sparkles,
  DollarSign,
  Radio,
  Sliders,
} from 'lucide-react'
import {
  TursoNewsArticle,
  getTursoNewsAction,
  toggleTursoNewsFeaturedAction,
  deleteTursoNewsAction,
  createTursoNewsAction,
  triggerTursoNewsSyncAction,
} from '@/actions/tursoNewsActions'

interface TursoNewsClientProps {
  initialArticles: TursoNewsArticle[]
  totalArticles: number
  currentStaffEmail?: string
}

const CATEGORIES = ['ALL', 'Deals & Sales', 'Free VSTs', 'Guides', 'Tech & Gear']
const BADGES = ['ALL', 'HOT DEAL', 'MEGA DEAL', 'FREEWARE', 'NEW RELEASE']

export function TursoNewsClient({
  initialArticles,
  totalArticles,
  currentStaffEmail = 'admin@producertoy.com',
}: TursoNewsClientProps) {
  const [articles, setArticles] = useState<TursoNewsArticle[]>(initialArticles)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL')
  const [selectedBadge, setSelectedBadge] = useState<string>('ALL')
  const [isPending, startTransition] = useTransition()
  const [isSyncing, setIsSyncing] = useState(false)

  // Numbered Pagination State
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [totalCount, setTotalCount] = useState(totalArticles)

  // Drawer / Modals
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [notification, setNotification] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  // Form State for Creating Turso Deal/News
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    category: 'Deals & Sales',
    badge: 'HOT DEAL',
    deal_price: '',
    deal_regular_price: '',
    excerpt: '',
    content: '',
    cover_image: '',
    source_name: 'Plugin Boutique',
    source_url: 'https://pluginboutique.com',
    reading_time: '2 min read',
    is_featured: 0,
  })

  // Refetch data helper
  const refreshArticles = (
    page = currentPage,
    category = selectedCategory,
    badge = selectedBadge,
    query = search
  ) => {
    startTransition(async () => {
      const res = await getTursoNewsAction({
        category: category === 'ALL' ? undefined : category,
        badge: badge === 'ALL' ? undefined : badge,
        search: query,
        page,
        pageSize,
      })
      if (res.success && res.data) {
        setArticles(res.data)
        setTotalCount(res.total)
      }
    })
  }

  // Handle Search
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    refreshArticles(1, selectedCategory, selectedBadge, search)
  }

  // Handle Category Filter
  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat)
    setCurrentPage(1)
    refreshArticles(1, cat, selectedBadge, search)
  }

  // Handle Badge Filter
  const handleBadgeChange = (bdg: string) => {
    setSelectedBadge(bdg)
    setCurrentPage(1)
    refreshArticles(1, selectedCategory, bdg, search)
  }

  // Handle Page Change
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    refreshArticles(page, selectedCategory, selectedBadge, search)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Handle Page Size Change
  const handlePageSizeChange = (size: number) => {
    setPageSize(size)
    setCurrentPage(1)
    startTransition(async () => {
      const res = await getTursoNewsAction({
        category: selectedCategory === 'ALL' ? undefined : selectedCategory,
        badge: selectedBadge === 'ALL' ? undefined : selectedBadge,
        search,
        page: 1,
        pageSize: size,
      })
      if (res.success && res.data) {
        setArticles(res.data)
        setTotalCount(res.total)
      }
    })
  }

  // Toggle Featured
  const handleToggleFeatured = async (article: TursoNewsArticle) => {
    startTransition(async () => {
      const res = await toggleTursoNewsFeaturedAction(article.id, article.is_featured, currentStaffEmail)
      if (res.success && typeof res.is_featured === 'number') {
        const nextVal = res.is_featured
        setArticles((prev) =>
          prev.map((a) => (a.id === article.id ? { ...a, is_featured: nextVal } : a))
        )
        setNotification({
          text: `Article "${article.title.slice(0, 30)}..." spotlight status updated.`,
          type: 'success',
        })
      } else {
        setNotification({ text: res.error || 'Failed to toggle spotlight', type: 'error' })
      }
    })
  }

  // Delete Article
  const handleDeleteArticle = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This cannot be undone.`)) return
    startTransition(async () => {
      const res = await deleteTursoNewsAction(id, currentStaffEmail)
      if (res.success) {
        setArticles((prev) => prev.filter((a) => a.id !== id))
        setTotalCount((c) => Math.max(0, c - 1))
        setNotification({ text: 'Article deleted successfully.', type: 'success' })
      } else {
        setNotification({ text: res.error || 'Failed to delete article', type: 'error' })
      }
    })
  }

  // Trigger News Sync API
  const handleTriggerSync = async () => {
    setIsSyncing(true)
    const res = await triggerTursoNewsSyncAction(currentStaffEmail)
    if (res.success) {
      setNotification({
        text: 'Automated news sync API triggered! Refreshing Turso article vault...',
        type: 'success',
      })
      setTimeout(() => refreshArticles(1), 2500)
    } else {
      setNotification({ text: res.error || 'Failed to trigger news sync', type: 'error' })
    }
    setIsSyncing(false)
  }

  // Handle Form Submit
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim()) {
      setNotification({ text: 'Article title is required.', type: 'error' })
      return
    }

    startTransition(async () => {
      const res = await createTursoNewsAction({
        title: formData.title,
        slug: formData.slug || undefined,
        excerpt: formData.excerpt,
        content: formData.content,
        category: formData.category,
        badge: formData.badge,
        deal_price: formData.deal_price || undefined,
        deal_regular_price: formData.deal_regular_price || undefined,
        cover_image: formData.cover_image || undefined,
        source_name: formData.source_name || undefined,
        source_url: formData.source_url || undefined,
        reading_time: formData.reading_time || undefined,
        is_featured: formData.is_featured,
        staffEmail: currentStaffEmail,
      })

      if (res.success) {
        setIsDrawerOpen(false)
        setNotification({ text: 'Turso news article created successfully!', type: 'success' })
        refreshArticles(1)
      } else {
        setNotification({ text: res.error || 'Failed to create article', type: 'error' })
      }
    })
  }

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

  // KPIs
  const featuredCount = articles.filter((a) => a.is_featured === 1).length
  const hotDealsCount = articles.filter(
    (a) => a.badge === 'HOT DEAL' || a.badge === 'MEGA DEAL' || a.category === 'Deals & Sales'
  ).length
  const freewareCount = articles.filter(
    (a) => a.badge === 'FREEWARE' || a.category === 'Free VSTs' || a.deal_price === 'FREE'
  ).length

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto font-sans">
      {/* Toast Alert */}
      {notification && (
        <div
          className={`flex items-center justify-between p-3.5 rounded-lg border text-xs font-mono transition ${
            notification.type === 'success'
              ? 'bg-[#181818] border-white text-white'
              : 'bg-[#181818] border-zinc-500 text-zinc-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-white shrink-0" />
            <span>{notification.text}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="p-1 hover:bg-[#262626] rounded text-zinc-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Banner & KPI Stat Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#181818] border border-[#2a2a2a] p-4 rounded-xl flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-[10px] font-mono uppercase text-zinc-400 tracking-wider">
              Audio Deals Database
            </div>
            <div className="text-2xl font-bold font-mono text-white">{totalCount}</div>
            <div className="text-[10px] text-zinc-500 font-mono">160+ Synced Edge Articles</div>
          </div>
          <div className="p-3 bg-[#202020] border border-[#2e2e2e] rounded-lg">
            <Newspaper className="w-5 h-5 text-white" />
          </div>
        </div>

        <div className="bg-[#181818] border border-[#2a2a2a] p-4 rounded-xl flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-[10px] font-mono uppercase text-zinc-400 tracking-wider">
              Hot Deals & Megadeals
            </div>
            <div className="text-2xl font-bold font-mono text-white">{hotDealsCount}</div>
            <div className="text-[10px] text-zinc-500 font-mono">Plugin Boutique & Brand Sales</div>
          </div>
          <div className="p-3 bg-[#202020] border border-[#2e2e2e] rounded-lg">
            <DollarSign className="w-5 h-5 text-white" />
          </div>
        </div>

        <div className="bg-[#181818] border border-[#2a2a2a] p-4 rounded-xl flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-[10px] font-mono uppercase text-zinc-400 tracking-wider">
              Free VSTs & Freeware
            </div>
            <div className="text-2xl font-bold font-mono text-white">{freewareCount}</div>
            <div className="text-[10px] text-zinc-500 font-mono">Zero-Cost Instruments</div>
          </div>
          <div className="p-3 bg-[#202020] border border-[#2e2e2e] rounded-lg">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
        </div>

        <div className="bg-[#181818] border border-[#2a2a2a] p-4 rounded-xl flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-[10px] font-mono uppercase text-zinc-400 tracking-wider">
              Spotlight Headlines
            </div>
            <div className="text-2xl font-bold font-mono text-white">{featuredCount}</div>
            <div className="text-[10px] text-zinc-500 font-mono">Hero Banner Carousel</div>
          </div>
          <div className="p-3 bg-[#202020] border border-[#2e2e2e] rounded-lg">
            <Star className="w-5 h-5 text-white" />
          </div>
        </div>
      </div>

      {/* Main Filter & Action Bar */}
      <div className="bg-[#181818] border border-[#2a2a2a] p-4 rounded-xl space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search deals and articles by title, slug, source..."
              className="w-full bg-[#121212] border border-[#2e2e2e] rounded-lg pl-10 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white transition font-mono"
            />
          </form>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Sync Engine Button */}
            <button
              type="button"
              onClick={handleTriggerSync}
              disabled={isSyncing}
              className="flex items-center gap-2 px-3.5 py-2 bg-[#202020] hover:bg-[#282828] text-white border border-[#333] rounded-lg text-xs font-mono font-bold transition"
              title="Ping producertoy.com/api/news/sync to fetch latest audio deals"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : 'Sync Live Deals'}</span>
            </button>

            {/* Compose Article Button */}
            <button
              onClick={() => {
                setFormData({
                  title: '',
                  slug: '',
                  category: 'Deals & Sales',
                  badge: 'HOT DEAL',
                  deal_price: '',
                  deal_regular_price: '',
                  excerpt: '',
                  content: '',
                  cover_image: '',
                  source_name: 'Plugin Boutique',
                  source_url: 'https://pluginboutique.com',
                  reading_time: '2 min read',
                  is_featured: 0,
                })
                setIsDrawerOpen(true)
              }}
              className="flex items-center gap-2 px-4 py-2 bg-white text-black hover:bg-zinc-200 rounded-lg text-xs font-bold transition shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Post New Deal</span>
            </button>
          </div>
        </div>

        {/* Categories & Badges Filter Row */}
        <div className="space-y-2 pt-2 border-t border-[#242424]">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
            <span className="text-[10px] font-mono uppercase text-zinc-500 font-bold px-1 whitespace-nowrap">
              Category:
            </span>
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => handleCategoryChange(cat)}
                  className={`px-3 py-1 rounded-md text-xs font-mono uppercase tracking-wider whitespace-nowrap transition border ${
                    isSelected
                      ? 'bg-white text-black font-bold border-white'
                      : 'bg-[#121212] text-zinc-400 border-[#2a2a2a] hover:text-white hover:border-zinc-500'
                  }`}
                >
                  {cat}
                </button>
              )
            })}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
            <span className="text-[10px] font-mono uppercase text-zinc-500 font-bold px-1 whitespace-nowrap">
              Badge:
            </span>
            {BADGES.map((bdg) => {
              const isSelected = selectedBadge === bdg
              return (
                <button
                  key={bdg}
                  type="button"
                  onClick={() => handleBadgeChange(bdg)}
                  className={`px-3 py-1 rounded-md text-[11px] font-mono uppercase tracking-wider whitespace-nowrap transition border ${
                    isSelected
                      ? 'bg-white text-black font-bold border-white'
                      : 'bg-[#121212] text-zinc-400 border-[#2a2a2a] hover:text-white hover:border-zinc-500'
                  }`}
                >
                  {bdg}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Articles Table */}
      <div className="bg-[#181818] border border-[#2a2a2a] rounded-xl overflow-hidden">
        <div className="p-4 border-b border-[#242424] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Newspaper className="w-4 h-4 text-white" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Audio Deals & News Archive
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 bg-[#202020] border border-[#333] text-zinc-300 rounded">
              {totalCount} Total
            </span>
          </div>

          <div className="text-xs text-zinc-400 font-mono">
            Showing {startItem}-{endItem} of {totalCount}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#242424] bg-[#141414] text-[11px] font-mono uppercase text-zinc-400 tracking-wider">
                <th className="py-3 px-4">Deal / Headline</th>
                <th className="py-3 px-4">Category & Badge</th>
                <th className="py-3 px-4">Price / Discount</th>
                <th className="py-3 px-4 text-center">Spotlight</th>
                <th className="py-3 px-4">Source</th>
                <th className="py-3 px-4">Published</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#202020] text-xs">
              {articles.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-zinc-500 font-mono">
                    No news articles match the current filter.
                  </td>
                </tr>
              ) : (
                articles.map((article) => {
                  return (
                    <tr
                      key={article.id}
                      className="hover:bg-[#1f1f1f] transition group"
                    >
                      {/* Deal & Title */}
                      <td className="py-3.5 px-4 max-w-md">
                        <div className="flex items-start gap-3">
                          <div className="w-14 h-10 rounded bg-[#242424] border border-[#333] shrink-0 overflow-hidden relative">
                            {article.cover_image ? (
                              <img
                                src={article.cover_image}
                                alt={article.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-zinc-600 font-mono text-[9px]">
                                NO IMG
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-white group-hover:text-zinc-200 transition line-clamp-1">
                              {article.title}
                            </div>
                            <div className="text-[11px] text-zinc-400 font-mono truncate mt-0.5">
                              /news/{article.slug}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category & Badge */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-[#202020] border border-[#333] text-zinc-300">
                            {article.category}
                          </span>
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-white text-black">
                            {article.badge}
                          </span>
                        </div>
                      </td>

                      {/* Deal Price */}
                      <td className="py-3.5 px-4 font-mono">
                        {article.deal_price ? (
                          <div>
                            <span className="text-white font-bold text-xs">{article.deal_price}</span>
                            {article.deal_regular_price && (
                              <span className="text-[10px] text-zinc-500 line-through ml-1.5">
                                {article.deal_regular_price}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-zinc-500 text-[11px]">Editorial / News</span>
                        )}
                      </td>

                      {/* Spotlight Feature Toggle */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleFeatured(article)}
                          disabled={isPending}
                          className={`p-1.5 rounded border transition ${
                            article.is_featured === 1
                              ? 'bg-white text-black border-white'
                              : 'bg-[#181818] text-zinc-500 border-[#2a2a2a] hover:text-white hover:border-zinc-500'
                          }`}
                          title={article.is_featured === 1 ? 'Pinned to Featured Carousel' : 'Click to feature'}
                        >
                          <Star className={`w-3.5 h-3.5 ${article.is_featured === 1 ? 'fill-black' : ''}`} />
                        </button>
                      </td>

                      {/* Source */}
                      <td className="py-3.5 px-4 text-zinc-400 font-mono text-[11px]">
                        <div className="truncate max-w-[120px]">{article.source_name || 'Direct Deal'}</div>
                      </td>

                      {/* Published Date */}
                      <td className="py-3.5 px-4 text-zinc-400 font-mono text-[11px]">
                        {new Date(article.published_at).toLocaleDateString()}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <a
                            href={`https://producertoy.com/news/${article.slug}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 bg-[#202020] border border-[#2e2e2e] rounded text-zinc-400 hover:text-white transition"
                            title="Preview on Store"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                          <button
                            onClick={() => handleDeleteArticle(article.id, article.title)}
                            className="p-1.5 bg-[#202020] border border-[#2e2e2e] rounded text-zinc-400 hover:text-white transition"
                            title="Delete from Turso DB"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Numbered Pagination Footer */}
        <div className="p-4 border-t border-[#242424] bg-[#141414] flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Page Size Selector */}
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
            <span>Per page:</span>
            {[15, 25, 50, 100].map((size) => (
              <button
                key={size}
                onClick={() => handlePageSizeChange(size)}
                className={`px-2 py-1 rounded text-xs transition ${
                  pageSize === size
                    ? 'bg-white text-black font-bold'
                    : 'bg-[#181818] border border-[#2a2a2a] text-zinc-400 hover:text-white'
                }`}
              >
                {size}
              </button>
            ))}
          </div>

          {/* Numbered Pagination Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1 || isPending}
              className="p-1.5 rounded bg-[#181818] border border-[#2a2a2a] text-zinc-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {pageNumbers.map((page, index) => {
              if (page === '...') {
                return (
                  <span key={`dots-${index}`} className="px-2 py-1 text-xs font-mono text-zinc-500">
                    ...
                  </span>
                )
              }
              const pageNum = page as number
              const isActive = currentPage === pageNum
              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  disabled={isPending}
                  className={`w-8 h-8 rounded text-xs font-mono transition flex items-center justify-center ${
                    isActive
                      ? 'bg-white text-black font-bold shadow-sm'
                      : 'bg-[#181818] border border-[#2a2a2a] text-zinc-400 hover:text-white hover:border-zinc-500'
                  }`}
                >
                  {pageNum}
                </button>
              )
            })}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages || isPending}
              className="p-1.5 rounded bg-[#181818] border border-[#2a2a2a] text-zinc-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Compose Deal Drawer */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex justify-end animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-[#141414] border-l border-[#2a2a2a] h-full flex flex-col shadow-2xl">
            {/* Drawer Header */}
            <div className="p-5 border-b border-[#242424] flex items-center justify-between bg-[#181818]">
              <div className="flex items-center gap-2.5">
                <Newspaper className="w-5 h-5 text-white" />
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                    Publish Audio Deal / Article
                  </h3>
                  <div className="text-[10px] text-zinc-400 font-mono">
                    Directly publishes to the live store at producertoy.com/news
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-2 rounded-lg bg-[#202020] border border-[#2e2e2e] text-zinc-400 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 font-mono">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider">
                  Headline / Deal Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => {
                    const newTitle = e.target.value
                    setFormData((prev) => ({
                      ...prev,
                      title: newTitle,
                      slug: newTitle
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, '-')
                        .replace(/(^-|-$)+/g, ''),
                    }))
                  }}
                  placeholder="e.g. Excite Audio Bloom Bundle Deal: 50% OFF ($209.00 VST)"
                  className="w-full bg-[#181818] border border-[#2a2a2a] rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-white transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-[#181818] border border-[#2a2a2a] rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-white transition"
                  >
                    {CATEGORIES.filter((c) => c !== 'ALL').map((c) => (
                      <option key={c} value={c} className="bg-[#181818] text-white">
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider">
                    Badge
                  </label>
                  <select
                    value={formData.badge}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    className="w-full bg-[#181818] border border-[#2a2a2a] rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-white transition"
                  >
                    {BADGES.filter((b) => b !== 'ALL').map((b) => (
                      <option key={b} value={b} className="bg-[#181818] text-white">
                        {b}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider">
                    Deal Price (e.g. $29.00 or FREE)
                  </label>
                  <input
                    type="text"
                    value={formData.deal_price}
                    onChange={(e) => setFormData({ ...formData, deal_price: e.target.value })}
                    placeholder="$29.00"
                    className="w-full bg-[#181818] border border-[#2a2a2a] rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-white transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider">
                    Regular Price (e.g. $99.00)
                  </label>
                  <input
                    type="text"
                    value={formData.deal_regular_price}
                    onChange={(e) => setFormData({ ...formData, deal_regular_price: e.target.value })}
                    placeholder="$99.00"
                    className="w-full bg-[#181818] border border-[#2a2a2a] rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-white transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider">
                    Source Name
                  </label>
                  <input
                    type="text"
                    value={formData.source_name}
                    onChange={(e) => setFormData({ ...formData, source_name: e.target.value })}
                    placeholder="Plugin Boutique / Native Instruments"
                    className="w-full bg-[#181818] border border-[#2a2a2a] rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-white transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider">
                    Source URL
                  </label>
                  <input
                    type="url"
                    value={formData.source_url}
                    onChange={(e) => setFormData({ ...formData, source_url: e.target.value })}
                    placeholder="https://..."
                    className="w-full bg-[#181818] border border-[#2a2a2a] rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-white transition"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider">
                  Cover Image URL
                </label>
                <input
                  type="text"
                  value={formData.cover_image}
                  onChange={(e) => setFormData({ ...formData, cover_image: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-[#181818] border border-[#2a2a2a] rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-white transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider">
                  Summary Excerpt
                </label>
                <textarea
                  rows={2}
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  placeholder="Short deal description..."
                  className="w-full bg-[#181818] border border-[#2a2a2a] rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-white transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider">
                  Full Article / Deal Details *
                </label>
                <textarea
                  rows={6}
                  required
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Detailed specs, features, discount details..."
                  className="w-full bg-[#181818] border border-[#2a2a2a] rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-white transition font-mono leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  className="px-4 py-2.5 bg-[#202020] border border-[#2a2a2a] text-zinc-300 hover:text-white rounded-lg text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-6 py-2.5 bg-white text-black hover:bg-zinc-200 rounded-lg text-xs font-bold transition disabled:opacity-50"
                >
                  {isPending ? 'Saving...' : 'Publish Deal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
