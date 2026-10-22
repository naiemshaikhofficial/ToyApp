'use server'

import { getAdminClient } from '@/lib/supabase/admin'
import { logAdminActivity } from '@/lib/audit'
import { revalidatePath } from 'next/cache'

export interface ArticleSummary {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string | null
  cover_image: string | null
  author_name: string | null
  author_avatar: string | null
  author_role: string | null
  category: string | null
  tags: string[] | null
  read_time: string | null
  is_published: boolean
  is_featured: boolean
  published_at: string | null
  created_at: string
  updated_at: string
}

export async function getArticlesAction(params?: {
  category?: string
  status?: 'all' | 'published' | 'draft'
  search?: string
  page?: number
  pageSize?: number
}) {
  try {
    const supabase = getAdminClient()
    const page = params?.page || 1
    const pageSize = params?.pageSize || 15
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    let query = supabase.from('blogs').select('*', { count: 'exact' })

    if (params?.category && params.category !== 'ALL') {
      query = query.eq('category', params.category)
    }

    if (params?.status === 'published') {
      query = query.eq('is_published', true)
    } else if (params?.status === 'draft') {
      query = query.eq('is_published', false)
    }

    if (params?.search?.trim()) {
      const term = params.search.trim()
      query = query.or(`title.ilike.%${term}%,slug.ilike.%${term}%,excerpt.ilike.%${term}%,author_name.ilike.%${term}%`)
    }

    query = query.order('created_at', { ascending: false }).range(from, to)

    const { data, count, error } = await query

    if (error) {
      console.error('Error fetching articles:', error)
      return { success: false, error: error.message, data: [], total: 0 }
    }

    return { success: true, data: data || [], total: count || 0 }
  } catch (err: any) {
    console.error('getArticlesAction error:', err)
    return { success: false, error: err.message || 'Failed to fetch articles', data: [], total: 0 }
  }
}

export async function createArticleAction(data: {
  title: string
  slug?: string
  excerpt?: string
  content: string
  cover_image?: string
  author_name?: string
  author_role?: string
  category: string
  tags?: string[]
  read_time?: string
  is_published?: boolean
  is_featured?: boolean
  staffEmail: string
}) {
  try {
    const supabase = getAdminClient()

    const rawSlug = data.slug?.trim() || data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')

    const payload = {
      title: data.title.trim(),
      slug: rawSlug,
      excerpt: data.excerpt || null,
      content: data.content,
      cover_image: data.cover_image || null,
      author_name: data.author_name || 'ProducerToy Editorial',
      author_role: data.author_role || 'Staff Editor',
      category: data.category || 'DEALS',
      tags: data.tags || [],
      read_time: data.read_time || '3 min read',
      is_published: Boolean(data.is_published),
      is_featured: Boolean(data.is_featured),
      published_at: data.is_published ? new Date().toISOString() : null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const { data: newArticle, error } = await supabase
      .from('blogs')
      .insert(payload)
      .select('*')
      .single()

    if (error) throw new Error(error.message)

    await logAdminActivity({
      staff_email: data.staffEmail,
      action: 'ARTICLE_CREATED',
      target_type: 'system',
      target_id: newArticle.id,
      details: { title: data.title, slug: rawSlug },
    })

    revalidatePath('/news')
    return { success: true, article: newArticle }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to create article' }
  }
}

export async function updateArticleAction(data: {
  id: string
  title: string
  slug: string
  excerpt?: string
  content: string
  cover_image?: string
  author_name?: string
  author_role?: string
  category: string
  tags?: string[]
  read_time?: string
  is_published: boolean
  is_featured: boolean
  staffEmail: string
}) {
  try {
    const supabase = getAdminClient()

    const { error } = await supabase
      .from('blogs')
      .update({
        title: data.title.trim(),
        slug: data.slug.trim(),
        excerpt: data.excerpt || null,
        content: data.content,
        cover_image: data.cover_image || null,
        author_name: data.author_name || null,
        author_role: data.author_role || null,
        category: data.category,
        tags: data.tags || [],
        read_time: data.read_time || null,
        is_published: data.is_published,
        is_featured: data.is_featured,
        published_at: data.is_published ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', data.id)

    if (error) throw new Error(error.message)

    await logAdminActivity({
      staff_email: data.staffEmail,
      action: 'ARTICLE_UPDATED',
      target_type: 'system',
      target_id: data.id,
      details: { title: data.title },
    })

    revalidatePath('/news')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to update article' }
  }
}

export async function toggleArticlePublishAction(
  articleId: string,
  currentStatus: boolean,
  staffEmail: string
) {
  try {
    const supabase = getAdminClient()
    const newStatus = !currentStatus

    const { error } = await supabase
      .from('blogs')
      .update({
        is_published: newStatus,
        published_at: newStatus ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', articleId)

    if (error) throw new Error(error.message)

    await logAdminActivity({
      staff_email: staffEmail,
      action: newStatus ? 'ARTICLE_PUBLISHED' : 'ARTICLE_UNPUBLISHED',
      target_type: 'system',
      target_id: articleId,
    })

    revalidatePath('/news')
    return { success: true, is_published: newStatus }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to toggle publication' }
  }
}

export async function toggleArticleFeaturedAction(
  articleId: string,
  currentStatus: boolean,
  staffEmail: string
) {
  try {
    const supabase = getAdminClient()
    const newFeatured = !currentStatus

    const { error } = await supabase
      .from('blogs')
      .update({
        is_featured: newFeatured,
        updated_at: new Date().toISOString(),
      })
      .eq('id', articleId)

    if (error) throw new Error(error.message)

    await logAdminActivity({
      staff_email: staffEmail,
      action: newFeatured ? 'ARTICLE_FEATURED' : 'ARTICLE_UNFEATURED',
      target_type: 'system',
      target_id: articleId,
    })

    revalidatePath('/news')
    return { success: true, is_featured: newFeatured }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to toggle featured status' }
  }
}

export async function deleteArticleAction(articleId: string, staffEmail: string) {
  try {
    const supabase = getAdminClient()

    const { error } = await supabase.from('blogs').delete().eq('id', articleId)
    if (error) throw new Error(error.message)

    await logAdminActivity({
      staff_email: staffEmail,
      action: 'ARTICLE_DELETED',
      target_type: 'system',
      target_id: articleId,
    })

    revalidatePath('/news')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to delete article' }
  }
}
