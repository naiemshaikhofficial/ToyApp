import { getTursoNewsAction } from '@/actions/tursoNewsActions'
import { TursoNewsClient } from './TursoNewsClient'
import { AdminHeader } from '@/components/layout/AdminHeader'

export const revalidate = 0

export default async function NewsPage() {
  const result = await getTursoNewsAction({ page: 1, pageSize: 20 })

  return (
    <div className="flex-1 flex flex-col font-sans">
      <AdminHeader
        title="Audio Deals & News Engine"
        subtitle="160+ Latest VST Deals, Freeware, and Plugin Announcements"
      />
      <main className="flex-1">
        <TursoNewsClient
          initialArticles={result.data || []}
          totalArticles={result.total || 0}
        />
      </main>
    </div>
  )
}
