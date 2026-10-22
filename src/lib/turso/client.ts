import { createClient, type Client } from '@libsql/client'

let cachedClient: Client | null = null

export function getTursoClient(): Client {
  if (cachedClient) return cachedClient

  const url = process.env.TURSO_DATABASE_URL?.trim() || 'file:data_news.db'
  const authToken = process.env.TURSO_AUTH_TOKEN?.trim() || undefined

  cachedClient = createClient({
    url,
    authToken,
  })

  return cachedClient
}
