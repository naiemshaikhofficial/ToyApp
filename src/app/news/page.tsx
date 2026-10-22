import { getArticlesAction } from '@/actions/newsActions'
import { NewsClient } from './NewsClient'
import { AdminHeader } from '@/components/layout/AdminHeader'

export const revalidate = 0

export default async function NewsPage() {
  const result = await getArticlesAction({ page: 1, pageSize: 15 })

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader
        title="News & Editorial Hub"
        subtitle="Plugin Boutique Style Content Publishing, VST Deals, Tutorials & Editorial Role Management"
      />
      <main className="flex-1">
        <NewsClient
          initialArticles={result.data || []}
          totalArticles={result.total || 0}
        />
      </main>
    </div>
  )
}
