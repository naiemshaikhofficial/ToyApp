import { getBlogArticlesAction } from '@/actions/blogActions'
import { BlogsClient } from './BlogsClient'
import { AdminHeader } from '@/components/layout/AdminHeader'

export const revalidate = 0

export default async function BlogsPage() {
  const result = await getBlogArticlesAction({ page: 1, pageSize: 15 })

  return (
    <div className="flex-1 flex flex-col font-sans">
      <AdminHeader
        title="Editorial Blogs & Audio Tutorials"
        subtitle="Manage Supabase Blogs, Production Guides, DAW Mixing Tutorials & Spotlight Publications"
      />
      <main className="flex-1">
        <BlogsClient
          initialArticles={result.data || []}
          totalArticles={result.total || 0}
        />
      </main>
    </div>
  )
}
