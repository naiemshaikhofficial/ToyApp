'use server'

import { verifyTurnstileToken } from '@/lib/turnstile'

/**
 * Validates Cloudflare Turnstile token on the server
 */
export async function validateTurnstileAction(token: string): Promise<{ success: boolean; error?: string }> {
  if (!token || typeof token !== 'string' || !token.trim()) {
    return { success: false, error: 'Security verification required. Please complete Cloudflare Turnstile.' }
  }
  const isValid = await verifyTurnstileToken(token)
  if (!isValid) {
    return { success: false, error: 'Security verification failed. Please try again.' }
  }
  return { success: true }
}
