'use server'

import { getTursoClient } from '@/lib/turso/client'
import { logAdminActivity } from '@/lib/audit'
import { revalidatePath } from 'next/cache'

export interface TursoNewsArticle {
  id: string
  slug: string
  title: string
  excerpt: string | null
  content: string | null
  category: string
  badge: string
  cover_image: string | null
  author_name: string | null
  author_role: string | null
  reading_time: string | null
  source_name: string | null
  source_url: string | null
  deal_price: string | null
  deal_regular_price: string | null
  deal_expires_at?: string | null
  published_at: string
  created_at: string
  is_featured: number
}

export async function getTursoNewsAction(params?: {
  page?: number
  pageSize?: number
  category?: string
  badge?: string
  search?: string
  featuredOnly?: boolean
}) {
  try {
    const client = getTursoClient()
    const page = params?.page || 1
    const pageSize = params?.pageSize || 20
    const offset = (page - 1) * pageSize

    let whereClauses: string[] = []
    let args: any[] = []

    if (params?.category && params.category !== 'ALL') {
      whereClauses.push('category = ?')
      args.push(params.category)
    }

    if (params?.badge && params.badge !== 'ALL') {
      whereClauses.push('badge = ?')
      args.push(params.badge)
    }

    if (params?.featuredOnly) {
      whereClauses.push('is_featured = 1')
    }

    if (params?.search?.trim()) {
      const term = `%${params.search.trim()}%`
      whereClauses.push('(title LIKE ? OR slug LIKE ? OR source_name LIKE ? OR excerpt LIKE ?)')
      args.push(term, term, term, term)
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : ''

    // 1. Get Count
    const countSql = `SELECT count(*) as total FROM news_articles ${whereSql}`
    const countRes = await client.execute({ sql: countSql, args })
    const total = Number(countRes.rows[0]?.total || 0)

    // 2. Get Paginated Records
    const querySql = `
      SELECT id, slug, title, excerpt, content, category, badge, cover_image,
             author_name, author_role, reading_time, source_name, source_url,
             deal_price, deal_regular_price, published_at, created_at, is_featured
      FROM news_articles
      ${whereSql}
      ORDER BY published_at DESC, created_at DESC
      LIMIT ? OFFSET ?
    `
    const listRes = await client.execute({ sql: querySql, args: [...args, pageSize, offset] })

    const articles: TursoNewsArticle[] = listRes.rows.map((row: any) => ({
      id: String(row.id || ''),
      slug: String(row.slug || ''),
      title: String(row.title || ''),
      excerpt: row.excerpt ? String(row.excerpt) : null,
      content: row.content ? String(row.content) : null,
      category: String(row.category || 'Deals & Sales'),
      badge: String(row.badge || 'HOT DEAL'),
      cover_image: row.cover_image ? String(row.cover_image) : null,
      author_name: row.author_name ? String(row.author_name) : 'ProducerToy News Desk',
      author_role: row.author_role ? String(row.author_role) : 'Audio Deals Curator',
      reading_time: row.reading_time ? String(row.reading_time) : '2 min read',
      source_name: row.source_name ? String(row.source_name) : 'Plugin Boutique',
      source_url: row.source_url ? String(row.source_url) : null,
      deal_price: row.deal_price ? String(row.deal_price) : null,
      deal_regular_price: row.deal_regular_price ? String(row.deal_regular_price) : null,
      published_at: String(row.published_at || new Date().toISOString()),
      created_at: String(row.created_at || new Date().toISOString()),
      is_featured: Number(row.is_featured || 0),
    }))

    return { success: true, data: articles, total }
  } catch (err: any) {
    console.error('getTursoNewsAction error:', err)
    return { success: false, error: err.message || 'Failed to fetch Turso news articles', data: [], total: 0 }
  }
}

export async function toggleTursoNewsFeaturedAction(
  articleId: string,
  currentFeatured: number,
  staffEmail: string
) {
  try {
    const client = getTursoClient()
    const nextVal = currentFeatured === 1 ? 0 : 1

    await client.execute({
      sql: 'UPDATE news_articles SET is_featured = ? WHERE id = ?',
      args: [nextVal, articleId],
    })

    await logAdminActivity({
      staff_email: staffEmail,
      action: nextVal === 1 ? 'TURSO_NEWS_FEATURED' : 'TURSO_NEWS_UNFEATURED',
      target_type: 'system',
      target_id: articleId,
    })

    revalidatePath('/news')
    return { success: true, is_featured: nextVal }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to toggle featured status' }
  }
}

export async function deleteTursoNewsAction(articleId: string, staffEmail: string) {
  try {
    const client = getTursoClient()

    await client.execute({
      sql: 'DELETE FROM news_articles WHERE id = ?',
      args: [articleId],
    })

    await logAdminActivity({
      staff_email: staffEmail,
      action: 'TURSO_NEWS_DELETED',
      target_type: 'system',
      target_id: articleId,
    })

    revalidatePath('/news')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to delete Turso news article' }
  }
}

export async function createTursoNewsAction(data: {
  title: string
  slug?: string
  excerpt?: string
  content: string
  category: string
  badge: string
  deal_price?: string
  deal_regular_price?: string
  cover_image?: string
  source_name?: string
  source_url?: string
  reading_time?: string
  is_featured?: number
  staffEmail: string
}) {
  try {
    const client = getTursoClient()
    const id = `news_${Date.now().toString(36)}`
    const rawSlug =
      data.slug?.trim() ||
      data.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '')

    const now = new Date().toISOString()

    await client.execute({
      sql: `
        INSERT INTO news_articles (
          id, slug, title, excerpt, content, category, badge,
          cover_image, author_name, author_role, reading_time,
          source_name, source_url, deal_price, deal_regular_price,
          published_at, created_at, is_featured
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      args: [
        id,
        rawSlug,
        data.title.trim(),
        data.excerpt || '',
        data.content,
        data.category || 'Deals & Sales',
        data.badge || 'HOT DEAL',
        data.cover_image || 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800',
        'ProducerToy News Desk',
        'Senior Audio Editor',
        data.reading_time || '2 min read',
        data.source_name || 'Plugin Boutique',
        data.source_url || 'https://pluginboutique.com',
        data.deal_price || null,
        data.deal_regular_price || null,
        now,
        now,
        data.is_featured || 0,
      ],
    })

    await logAdminActivity({
      staff_email: data.staffEmail,
      action: 'TURSO_NEWS_CREATED',
      target_type: 'system',
      target_id: id,
      details: { title: data.title, slug: rawSlug },
    })

    revalidatePath('/news')
    return { success: true, id }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to create Turso news article' }
  }
}

export async function triggerTursoNewsSyncAction(staffEmail: string) {
  try {
    // Ping storefront API sync route
    const res = await fetch('https://producertoy.com/api/news/sync', {
      method: 'GET',
      headers: {
        'User-Agent': 'ToyApp-Executive-Engine/1.0',
      },
      cache: 'no-store',
    })

    await logAdminActivity({
      staff_email: staffEmail,
      action: 'TURSO_NEWS_SYNC_TRIGGERED',
      target_type: 'system',
      target_id: 'news_sync_engine',
    })

    revalidatePath('/news')
    return { success: true, status: res.status }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to ping news sync API' }
  }
}
