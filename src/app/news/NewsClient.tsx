'use client'

import React, { useState, useTransition } from 'react'
import Image from 'next/image'
import {
  Newspaper,
  Search,
  Plus,
  ExternalLink,
  Edit3,
  Trash2,
  X,
  FileCheck2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Eye,
  EyeOff,
  Star,
  Clock,
  User,
  Tag,
  FolderOpen,
  CheckCircle,
} from 'lucide-react'
import {
  ArticleSummary,
  getArticlesAction,
  createArticleAction,
  updateArticleAction,
  toggleArticlePublishAction,
  toggleArticleFeaturedAction,
  deleteArticleAction,
} from '@/actions/newsActions'

interface NewsClientProps {
  initialArticles: ArticleSummary[]
  totalArticles: number
  currentStaffEmail?: string
  currentStaffRole?: string
}

const CATEGORIES = [
  'ALL',
  'Plugins & VSTs',
  'Sound Design',
  'Guides',
  'Tutorials',
  'Deals & News',
  'Free Downloads',
]

export function NewsClient({
  initialArticles,
  totalArticles,
  currentStaffEmail = 'admin@producertoy.com',
  currentStaffRole = 'super_admin',
}: NewsClientProps) {
  const [articles, setArticles] = useState<ArticleSummary[]>(initialArticles)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL')
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'published' | 'draft'>('all')
  const [isPending, startTransition] = useTransition()

  // Numbered Pagination State
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(15)
  const [totalCount, setTotalCount] = useState(totalArticles)

  // Drawer / Modals
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [drawerMode, setDrawerMode] = useState<'create' | 'edit'>('create')
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null)
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  // Form State for Create / Edit
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    category: 'Plugins & VSTs',
    excerpt: '',
    content: '',
    cover_image: '',
    author_name: 'ProducerToy Editorial',
    author_role: 'Staff Editor',
    tags: '',
    read_time: '4 min read',
    is_published: true,
    is_featured: false,
  })

  // Refetch data helper
  const refreshArticles = (page = currentPage, category = selectedCategory, status = selectedStatus, query = search) => {
    startTransition(async () => {
      const res = await getArticlesAction({
        category: category === 'ALL' ? undefined : category,
        status,
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
    refreshArticles(1, selectedCategory, selectedStatus, search)
  }

  // Handle Category Filter
  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat)
    setCurrentPage(1)
    refreshArticles(1, cat, selectedStatus, search)
  }

  // Handle Status Filter
  const handleStatusChange = (status: 'all' | 'published' | 'draft') => {
    setSelectedStatus(status)
    setCurrentPage(1)
    refreshArticles(1, selectedCategory, status, search)
  }

  // Handle Pagination Page Click
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    refreshArticles(page, selectedCategory, selectedStatus, search)
  }

  // Handle Page Size Change
  const handlePageSizeChange = (size: number) => {
    setPageSize(size)
    setCurrentPage(1)
    startTransition(async () => {
      const res = await getArticlesAction({
        category: selectedCategory === 'ALL' ? undefined : selectedCategory,
        status: selectedStatus,
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

  // Toggle Publication
  const handleTogglePublish = async (article: ArticleSummary) => {
    startTransition(async () => {
      const res = await toggleArticlePublishAction(article.id, article.is_published, currentStaffEmail)
      if (res.success) {
        setArticles((prev) =>
          prev.map((a) => (a.id === article.id ? { ...a, is_published: !article.is_published } : a))
        )
        setMessage({
          text: `Article "${article.title}" is now ${!article.is_published ? 'Live on Store' : 'Drafted'}.`,
          type: 'success',
        })
      } else {
        setMessage({ text: res.error || 'Failed to toggle status', type: 'error' })
      }
    })
  }

  // Toggle Featured
  const handleToggleFeatured = async (article: ArticleSummary) => {
    startTransition(async () => {
      const res = await toggleArticleFeaturedAction(article.id, article.is_featured, currentStaffEmail)
      if (res.success) {
        setArticles((prev) =>
          prev.map((a) => (a.id === article.id ? { ...a, is_featured: !article.is_featured } : a))
        )
        setMessage({
          text: `Article spotlight status updated.`,
          type: 'success',
        })
      } else {
        setMessage({ text: res.error || 'Failed to toggle spotlight', type: 'error' })
      }
    })
  }

  // Delete Article
  const handleDeleteArticle = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This cannot be undone.`)) return
    startTransition(async () => {
      const res = await deleteArticleAction(id, currentStaffEmail)
      if (res.success) {
        setArticles((prev) => prev.filter((a) => a.id !== id))
        setTotalCount((c) => Math.max(0, c - 1))
        setMessage({ text: `Article deleted successfully.`, type: 'success' })
      } else {
        setMessage({ text: res.error || 'Failed to delete article', type: 'error' })
      }
    })
  }

  // Open Create Drawer
  const openCreateDrawer = () => {
    setDrawerMode('create')
    setSelectedArticleId(null)
    setFormData({
      title: '',
      slug: '',
      category: 'Plugins & VSTs',
      excerpt: '',
      content: '',
      cover_image: '',
      author_name: 'ProducerToy Editorial',
      author_role: 'Staff Editor',
      tags: 'vst, plugins, production',
      read_time: '4 min read',
      is_published: true,
      is_featured: false,
    })
    setIsDrawerOpen(true)
  }

  // Open Edit Drawer
  const openEditDrawer = (article: ArticleSummary) => {
    setDrawerMode('edit')
    setSelectedArticleId(article.id)
    setFormData({
      title: article.title,
      slug: article.slug,
      category: article.category || 'Plugins & VSTs',
      excerpt: article.excerpt || '',
      content: article.content || '',
      cover_image: article.cover_image || '',
      author_name: article.author_name || 'ProducerToy Editorial',
      author_role: article.author_role || 'Staff Editor',
      tags: article.tags?.join(', ') || '',
      read_time: article.read_time || '4 min read',
      is_published: article.is_published,
      is_featured: article.is_featured,
    })
    setIsDrawerOpen(true)
  }

  // Handle Form Submit
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim()) {
      setMessage({ text: 'Article title is required.', type: 'error' })
      return
    }

    const tagArray = formData.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)

    startTransition(async () => {
      if (drawerMode === 'create') {
        const res = await createArticleAction({
          title: formData.title,
          slug: formData.slug || undefined,
          excerpt: formData.excerpt,
          content: formData.content,
          cover_image: formData.cover_image,
          author_name: formData.author_name,
          author_role: formData.author_role,
          category: formData.category,
          tags: tagArray,
          read_time: formData.read_time,
          is_published: formData.is_published,
          is_featured: formData.is_featured,
          staffEmail: currentStaffEmail,
        })

        if (res.success) {
          setIsDrawerOpen(false)
          setMessage({ text: 'Article created successfully!', type: 'success' })
          refreshArticles(1)
        } else {
          setMessage({ text: res.error || 'Failed to create article', type: 'error' })
        }
      } else if (drawerMode === 'edit' && selectedArticleId) {
        const res = await updateArticleAction({
          id: selectedArticleId,
          title: formData.title,
          slug: formData.slug,
          excerpt: formData.excerpt,
          content: formData.content,
          cover_image: formData.cover_image,
          author_name: formData.author_name,
          author_role: formData.author_role,
          category: formData.category,
          tags: tagArray,
          read_time: formData.read_time,
          is_published: formData.is_published,
          is_featured: formData.is_featured,
          staffEmail: currentStaffEmail,
        })

        if (res.success) {
          setIsDrawerOpen(false)
          setMessage({ text: 'Article updated successfully!', type: 'success' })
          refreshArticles(currentPage)
        } else {
          setMessage({ text: res.error || 'Failed to update article', type: 'error' })
        }
      }
    })
  }

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

  // Calculated KPI stats
  const publishedCount = articles.filter((a) => a.is_published).length
  const featuredCount = articles.filter((a) => a.is_featured).length
  const draftCount = articles.filter((a) => !a.is_published).length

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Toast Alert */}
      {message && (
        <div
          className={`flex items-center justify-between p-3.5 rounded-lg border text-xs font-mono transition ${
            message.type === 'success'
              ? 'bg-[#181818] border-white text-white'
              : 'bg-[#181818] border-zinc-500 text-zinc-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-white shrink-0" />
            <span>{message.text}</span>
          </div>
          <button
            onClick={() => setMessage(null)}
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
            <div className="text-[10px] font-mono uppercase text-zinc-400 tracking-wider">Total Articles</div>
            <div className="text-2xl font-bold font-mono text-white">{totalCount}</div>
            <div className="text-[10px] text-zinc-500 font-mono">Curated Editorial Vault</div>
          </div>
          <div className="p-3 bg-[#202020] border border-[#2e2e2e] rounded-lg">
            <Newspaper className="w-5 h-5 text-white" />
          </div>
        </div>

        <div className="bg-[#181818] border border-[#2a2a2a] p-4 rounded-xl flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-[10px] font-mono uppercase text-zinc-400 tracking-wider">Published Live</div>
            <div className="text-2xl font-bold font-mono text-white">{publishedCount}</div>
            <div className="text-[10px] text-zinc-500 font-mono">Visible on ProducerToy</div>
          </div>
          <div className="p-3 bg-[#202020] border border-[#2e2e2e] rounded-lg">
            <Eye className="w-5 h-5 text-white" />
          </div>
        </div>

        <div className="bg-[#181818] border border-[#2a2a2a] p-4 rounded-xl flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-[10px] font-mono uppercase text-zinc-400 tracking-wider">Featured Deals</div>
            <div className="text-2xl font-bold font-mono text-white">{featuredCount}</div>
            <div className="text-[10px] text-zinc-500 font-mono">Hero Banner Spotlight</div>
          </div>
          <div className="p-3 bg-[#202020] border border-[#2e2e2e] rounded-lg">
            <Star className="w-5 h-5 text-white" />
          </div>
        </div>

        <div className="bg-[#181818] border border-[#2a2a2a] p-4 rounded-xl flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-[10px] font-mono uppercase text-zinc-400 tracking-wider">Draft Articles</div>
            <div className="text-2xl font-bold font-mono text-white">{draftCount}</div>
            <div className="text-[10px] text-zinc-500 font-mono">In Review & Composition</div>
          </div>
          <div className="p-3 bg-[#202020] border border-[#2e2e2e] rounded-lg">
            <EyeOff className="w-5 h-5 text-zinc-400" />
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
              placeholder="Search articles by title, author, slug..."
              className="w-full bg-[#121212] border border-[#2e2e2e] rounded-lg pl-10 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white transition font-mono"
            />
          </form>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Status Filter Toggle */}
            <div className="flex items-center p-1 bg-[#121212] border border-[#2a2a2a] rounded-lg">
              <button
                type="button"
                onClick={() => handleStatusChange('all')}
                className={`px-3 py-1.5 text-[11px] font-mono rounded transition ${
                  selectedStatus === 'all'
                    ? 'bg-white text-black font-bold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                ALL
              </button>
              <button
                type="button"
                onClick={() => handleStatusChange('published')}
                className={`px-3 py-1.5 text-[11px] font-mono rounded transition ${
                  selectedStatus === 'published'
                    ? 'bg-white text-black font-bold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                LIVE
              </button>
              <button
                type="button"
                onClick={() => handleStatusChange('draft')}
                className={`px-3 py-1.5 text-[11px] font-mono rounded transition ${
                  selectedStatus === 'draft'
                    ? 'bg-white text-black font-bold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                DRAFTS
              </button>
            </div>

            {/* Create New Article Button */}
            <button
              onClick={openCreateDrawer}
              className="flex items-center gap-2 px-4 py-2 bg-white text-black hover:bg-zinc-200 rounded-lg text-xs font-bold transition shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Compose Article</span>
            </button>
          </div>
        </div>

        {/* Plugin Boutique Style Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat
            return (
              <button
                key={cat}
                type="button"
                onClick={() => handleCategoryChange(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider whitespace-nowrap transition border ${
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
      </div>

      {/* Articles Table */}
      <div className="bg-[#181818] border border-[#2a2a2a] rounded-xl overflow-hidden">
        <div className="p-4 border-b border-[#242424] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Newspaper className="w-4 h-4 text-white" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Editorial Publications & Deals
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
                <th className="py-3 px-4">Article</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Author / Team</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Spotlight</th>
                <th className="py-3 px-4">Read Time</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#202020] text-xs">
              {articles.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-zinc-500 font-mono">
                    No articles found matching the current filters.
                  </td>
                </tr>
              ) : (
                articles.map((article) => {
                  return (
                    <tr
                      key={article.id}
                      className="hover:bg-[#1f1f1f] transition group"
                    >
                      {/* Cover & Title */}
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
                              /blog/{article.slug}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-[#202020] border border-[#333] text-zinc-300">
                          {article.category || 'General'}
                        </span>
                      </td>

                      {/* Author */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-white">{article.author_name || 'Editorial Team'}</div>
                        <div className="text-[10px] text-zinc-500 font-mono">
                          {article.author_role || 'Staff Editor'}
                        </div>
                      </td>

                      {/* Publish Status Toggle */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleTogglePublish(article)}
                          disabled={isPending}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-mono uppercase tracking-wider border transition ${
                            article.is_published
                              ? 'bg-white text-black font-bold border-white hover:bg-zinc-200'
                              : 'bg-[#181818] text-zinc-400 border-[#2a2a2a] hover:border-zinc-500 hover:text-white'
                          }`}
                          title={article.is_published ? 'Click to unpublish' : 'Click to publish live'}
                        >
                          {article.is_published ? (
                            <>
                              <Eye className="w-3 h-3 text-black" />
                              <span>LIVE</span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3 h-3 text-zinc-500" />
                              <span>DRAFT</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Spotlight Feature Toggle */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleFeatured(article)}
                          disabled={isPending}
                          className={`p-1.5 rounded border transition ${
                            article.is_featured
                              ? 'bg-white text-black border-white'
                              : 'bg-[#181818] text-zinc-500 border-[#2a2a2a] hover:text-white hover:border-zinc-500'
                          }`}
                          title={article.is_featured ? 'Pinned to Featured Storefront' : 'Click to feature'}
                        >
                          <Star className={`w-3.5 h-3.5 ${article.is_featured ? 'fill-black' : ''}`} />
                        </button>
                      </td>

                      {/* Read Time */}
                      <td className="py-3.5 px-4 text-zinc-400 font-mono text-[11px]">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-zinc-500" />
                          <span>{article.read_time || '3 min'}</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <a
                            href={`https://producertoy.com/blog/${article.slug}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 bg-[#202020] border border-[#2e2e2e] rounded text-zinc-400 hover:text-white transition"
                            title="Preview on Store"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                          <button
                            onClick={() => openEditDrawer(article)}
                            className="p-1.5 bg-[#202020] border border-[#2e2e2e] rounded text-zinc-400 hover:text-white transition"
                            title="Edit Article"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteArticle(article.id, article.title)}
                            className="p-1.5 bg-[#202020] border border-[#2e2e2e] rounded text-zinc-400 hover:text-white transition"
                            title="Delete Article"
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

        {/* Plugin Boutique Style Numbered Pagination Footer */}
        <div className="p-4 border-t border-[#242424] bg-[#141414] flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Page Size Selector */}
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
            <span>Per page:</span>
            {[10, 15, 25, 50].map((size) => (
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

      {/* Compose / Edit Drawer */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex justify-end animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-[#141414] border-l border-[#2a2a2a] h-full flex flex-col shadow-2xl">
            {/* Drawer Header */}
            <div className="p-5 border-b border-[#242424] flex items-center justify-between bg-[#181818]">
              <div className="flex items-center gap-2.5">
                <Newspaper className="w-5 h-5 text-white" />
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                    {drawerMode === 'create' ? 'Compose Editorial Article' : 'Edit Editorial Article'}
                  </h3>
                  <div className="text-[10px] text-zinc-400 font-mono">
                    Plugin Boutique Content Publishing Workflow
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

            {/* Drawer Body Form */}
            <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 font-mono">
              {/* Title & Slug */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider">
                  Article Title *
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
                      slug:
                        drawerMode === 'create'
                          ? newTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
                          : prev.slug,
                    }))
                  }}
                  placeholder="e.g. Best Free VST Plugins in 2026: 10 Must-Have Synths"
                  className="w-full bg-[#181818] border border-[#2a2a2a] rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-white transition"
                />
              </div>

              {/* Slug & Category Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider">
                    URL Slug
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="best-free-vst-plugins-2026"
                    className="w-full bg-[#181818] border border-[#2a2a2a] rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-white transition"
                  />
                </div>

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
              </div>

              {/* Excerpt */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider">
                  Summary Excerpt (Meta & Grid Card)
                </label>
                <textarea
                  rows={2}
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  placeholder="Short, punchy summary of the article for storefront cards and SEO..."
                  className="w-full bg-[#181818] border border-[#2a2a2a] rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-white transition"
                />
              </div>

              {/* Cover Image URL */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider">
                  Cover Image URL
                </label>
                <input
                  type="text"
                  value={formData.cover_image}
                  onChange={(e) => setFormData({ ...formData, cover_image: e.target.value })}
                  placeholder="https://..."
                  className="w-full bg-[#181818] border border-[#2a2a2a] rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-white transition"
                />
              </div>

              {/* Author Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider">
                    Author Name
                  </label>
                  <input
                    type="text"
                    value={formData.author_name}
                    onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
                    className="w-full bg-[#181818] border border-[#2a2a2a] rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-white transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider">
                    Author Role / Title
                  </label>
                  <input
                    type="text"
                    value={formData.author_role}
                    onChange={(e) => setFormData({ ...formData, author_role: e.target.value })}
                    placeholder="e.g. Sound Engineer, Staff Editor"
                    className="w-full bg-[#181818] border border-[#2a2a2a] rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-white transition"
                  />
                </div>
              </div>

              {/* Tags & Read Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider">
                    Tags (Comma Separated)
                  </label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="vst, mix, fl studio, ableton"
                    className="w-full bg-[#181818] border border-[#2a2a2a] rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-white transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider">
                    Estimated Read Time
                  </label>
                  <input
                    type="text"
                    value={formData.read_time}
                    onChange={(e) => setFormData({ ...formData, read_time: e.target.value })}
                    placeholder="5 min read"
                    className="w-full bg-[#181818] border border-[#2a2a2a] rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-white transition"
                  />
                </div>
              </div>

              {/* Content Body */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider">
                    Article Body Content (Markdown / HTML) *
                  </label>
                  <span className="text-[10px] text-zinc-500">
                    {formData.content.length} characters
                  </span>
                </div>
                <textarea
                  required
                  rows={8}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Write the full editorial article here..."
                  className="w-full bg-[#181818] border border-[#2a2a2a] rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-white transition font-mono leading-relaxed"
                />
              </div>

              {/* Toggles: Publish & Featured */}
              <div className="p-4 bg-[#181818] border border-[#2a2a2a] rounded-lg space-y-3">
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <div className="text-xs font-bold text-white uppercase tracking-wider">
                      Publish Live on Storefront
                    </div>
                    <div className="text-[10px] text-zinc-400">
                      When active, this article is instantly indexed and live at producertoy.com/blog
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.is_published}
                    onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                    className="w-4 h-4 rounded border-zinc-700 bg-black text-white focus:ring-0 focus:ring-offset-0 cursor-pointer"
                  />
                </label>

                <div className="border-t border-[#242424]" />

                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <div className="text-xs font-bold text-white uppercase tracking-wider">
                      Pin to Hero Spotlight (Featured)
                    </div>
                    <div className="text-[10px] text-zinc-400">
                      Highlights this deal or article in the top hero rotation banner
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                    className="w-4 h-4 rounded border-zinc-700 bg-black text-white focus:ring-0 focus:ring-offset-0 cursor-pointer"
                  />
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3">
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
                  {isPending ? 'Saving...' : drawerMode === 'create' ? 'Publish Article' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
