'use server'

import { getAdminClient } from '@/lib/supabase/admin'
import { logAdminActivity } from '@/lib/audit'
import { revalidatePath } from 'next/cache'

export interface SupportTicketSummary {
  id: string
  ticket_number: string
  user_id: string | null
  name: string
  email: string
  category: string
  priority: string
  status: string
  order_id: string | null
  os_platform: string | null
  daw: string | null
  subject: string
  description: string
  created_at: string
  updated_at: string
}

export async function getSupportTicketsAction(params?: {
  status?: string
  category?: string
  priority?: string
  search?: string
  page?: number
  pageSize?: number
}) {
  try {
    const supabase = getAdminClient()
    const page = params?.page || 1
    const pageSize = params?.pageSize || 20
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    let query = supabase
      .from('support_tickets')
      .select('*', { count: 'exact' })

    if (params?.status && params.status !== 'ALL') {
      query = query.eq('status', params.status.toUpperCase())
    }

    if (params?.category && params.category !== 'ALL') {
      query = query.eq('category', params.category.toUpperCase())
    }

    if (params?.search?.trim()) {
      const term = params.search.trim()
      query = query.or(`ticket_number.ilike.%${term}%,name.ilike.%${term}%,email.ilike.%${term}%,subject.ilike.%${term}%,description.ilike.%${term}%`)
    }

    query = query.order('created_at', { ascending: false }).range(from, to)

    const { data, count, error } = await query

    if (error) {
      console.error('Error fetching support tickets:', error)
      return { success: false, error: error.message, data: [], total: 0 }
    }

    return { success: true, data: data || [], total: count || 0 }
  } catch (err: any) {
    console.error('getSupportTicketsAction error:', err)
    return { success: false, error: err.message || 'Failed to fetch tickets', data: [], total: 0 }
  }
}

export async function getTicketDetailsAction(ticketId: string) {
  try {
    const supabase = getAdminClient()

    const { data: ticket, error: tickErr } = await supabase
      .from('support_tickets')
      .select('*')
      .eq('id', ticketId)
      .single()

    if (tickErr || !ticket) {
      return { success: false, error: 'Ticket not found' }
    }

    const { data: messages } = await supabase
      .from('ticket_messages')
      .select('*')
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true })

    return {
      success: true,
      ticket,
      messages: messages || [],
    }
  } catch (err: any) {
    console.error('getTicketDetailsAction error:', err)
    return { success: false, error: err.message || 'Failed to fetch ticket messages' }
  }
}

export async function updateTicketStatusAction(
  ticketId: string,
  newStatus: string,
  staffEmail: string
) {
  try {
    const supabase = getAdminClient()

    const { error } = await supabase
      .from('support_tickets')
      .update({
        status: newStatus.toUpperCase(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', ticketId)

    if (error) throw new Error(error.message)

    await logAdminActivity({
      staff_email: staffEmail,
      action: 'TICKET_STATUS_UPDATED',
      target_type: 'system',
      target_id: ticketId,
      details: { status: newStatus.toUpperCase() },
    })

    revalidatePath('/support')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to update ticket status' }
  }
}

export async function replyToTicketAction(
  ticketId: string,
  message: string,
  staffName: string,
  staffEmail: string
) {
  try {
    const supabase = getAdminClient()

    const { data: newMsg, error: msgErr } = await supabase
      .from('ticket_messages')
      .insert({
        ticket_id: ticketId,
        sender_type: 'staff',
        sender_name: staffName || 'ProducerToy Staff',
        message: message.trim(),
        created_at: new Date().toISOString(),
      })
      .select('*')
      .single()

    if (msgErr) throw new Error(msgErr.message)

    // Touch ticket updated_at and move to IN_PROGRESS if OPEN
    await supabase
      .from('support_tickets')
      .update({
        updated_at: new Date().toISOString(),
      })
      .eq('id', ticketId)

    await logAdminActivity({
      staff_email: staffEmail,
      action: 'TICKET_REPLIED',
      target_type: 'system',
      target_id: ticketId,
      details: { messageSnippet: message.slice(0, 50) },
    })

    revalidatePath('/support')
    return { success: true, message: newMsg }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to send ticket response' }
  }
}
