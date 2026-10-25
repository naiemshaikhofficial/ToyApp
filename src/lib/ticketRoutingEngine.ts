import { getAdminClient } from '@/lib/supabase/admin'

export interface RoutingResult {
  isDeveloperProductIssue: boolean
  brandId: string | null
  productId: string | null
  confidence: number
  reasoning: string
  routingSource: 'GROQ_AI' | 'CATALOG_MATCH' | 'NONE'
}

/**
 * Intelligent Support Ticket Routing Engine using Groq AI
 * Classifies whether an incoming query is a Developer Plugin issue or Platform-level inquiry
 */
export async function analyzeAndRouteTicket({
  subject,
  description,
  daw,
  osPlatform,
}: {
  subject: string
  description: string
  daw?: string | null
  osPlatform?: string | null
}): Promise<RoutingResult> {
  const supabase = getAdminClient()

  // 1. Fetch all brands and active products
  const [{ data: brands }, { data: products }] = await Promise.all([
    supabase.from('brands').select('id, name, slug'),
    supabase.from('products').select('id, name, slug, brand_id'),
  ])

  const brandsList = brands || []
  const productsList = products || []

  const contentText = `${subject} ${description} ${daw || ''} ${osPlatform || ''}`.toLowerCase()

  // 2. Try Groq AI Dispatcher
  const groqApiKey = process.env.GROQ_API_KEY?.trim()
  if (groqApiKey && brandsList.length > 0) {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${groqApiKey}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: `You are an AI Support Dispatcher for ProducerToy Audio Marketplace.
Your job is to determine whether an incoming support ticket is specifically an issue regarding a developer's audio plugin, preset, or sound pack (e.g. plugin crash, VST installation, DAW compatibility, preset issue, sound bug), OR if it is a ProducerToy platform-level issue (checkout error, website login, developer onboarding, platform payout, partnership request).

Studio Brands:
${brandsList.map((b) => `- ID: "${b.id}", Name: "${b.name}"`).join('\n')}

Products:
${productsList.map((p) => `- ID: "${p.id}", Name: "${p.name}", BrandID: "${p.brand_id}"`).join('\n')}

Rules:
1. If the ticket is about a developer's product (e.g. mentions the plugin/pack name or brand name or DAW crash with that plugin), return isDeveloperProductIssue: true, and match the corresponding brandId and productId.
2. If the ticket is about platform billing, general login, developer registration/partnership, general website issue, or does not clearly belong to a specific third-party studio brand, return isDeveloperProductIssue: false, brandId: null, productId: null.
3. Respond ONLY with raw JSON without markdown code fences:
{"isDeveloperProductIssue": boolean, "brandId": string | null, "productId": string | null, "confidence": number, "reasoning": string}`.trim(),
            },
            {
              role: 'user',
              content: `Subject: ${subject}\nDescription: ${description}\nDAW: ${daw || 'N/A'}\nOS: ${osPlatform || 'N/A'}`,
            },
          ],
          temperature: 0.1,
          max_tokens: 300,
        }),
      })

      if (response.ok) {
        const json = await response.json()
        const rawContent = json.choices?.[0]?.message?.content?.trim() || ''
        const cleanContent = rawContent.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim()
        const parsed = JSON.parse(cleanContent)

        if (parsed && typeof parsed.isDeveloperProductIssue === 'boolean') {
          const brandExists = parsed.brandId ? brandsList.some((b) => b.id === parsed.brandId) : false
          return {
            isDeveloperProductIssue: parsed.isDeveloperProductIssue && brandExists,
            brandId: brandExists ? parsed.brandId : null,
            productId: parsed.productId || null,
            confidence: parsed.confidence || 0.9,
            reasoning: parsed.reasoning || 'Groq AI Classification',
            routingSource: 'GROQ_AI',
          }
        }
      }
    } catch (groqErr) {
      console.warn('[analyzeAndRouteTicket] Groq routing fallback to catalog:', groqErr)
    }
  }

  // 3. Fallback: Direct Substring Catalog Matching
  for (const prod of productsList) {
    if (prod.name && prod.name.length > 2 && contentText.includes(prod.name.toLowerCase())) {
      return {
        isDeveloperProductIssue: true,
        brandId: prod.brand_id,
        productId: prod.id,
        confidence: 0.85,
        reasoning: `Catalog match: product "${prod.name}"`,
        routingSource: 'CATALOG_MATCH',
      }
    }
  }

  for (const b of brandsList) {
    if (b.name && b.name.length > 2 && contentText.includes(b.name.toLowerCase())) {
      return {
        isDeveloperProductIssue: true,
        brandId: b.id,
        productId: null,
        confidence: 0.8,
        reasoning: `Catalog match: brand "${b.name}"`,
        routingSource: 'CATALOG_MATCH',
      }
    }
  }

  return {
    isDeveloperProductIssue: false,
    brandId: null,
    productId: null,
    confidence: 1.0,
    reasoning: 'Platform inquiry',
    routingSource: 'NONE',
  }
}
