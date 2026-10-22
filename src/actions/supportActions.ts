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
  audience?: 'ALL' | 'DEVELOPER' | 'CUSTOMER' | 'ESCALATED_TEAM' | 'ESCALATED_DEV'
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

    // Audience filtering
    if (params?.audience === 'DEVELOPER') {
      query = query.or('category.eq.DEVELOPER,subject.ilike.%[Brand Application]%,ticket_number.ilike.DEV-%')
    } else if (params?.audience === 'CUSTOMER') {
      query = query.neq('category', 'DEVELOPER').not('ticket_number', 'ilike', 'DEV-%')
    } else if (params?.audience === 'ESCALATED_TEAM') {
      query = query.or('status.eq.ESCALATED_TO_TEAM,priority.eq.URGENT')
    } else if (params?.audience === 'ESCALATED_DEV') {
      query = query.eq('status', 'ESCALATED_TO_DEV')
    }

    if (params?.search?.trim()) {
      const term = params.search.trim()
      query = query.or(
        `ticket_number.ilike.%${term}%,name.ilike.%${term}%,email.ilike.%${term}%,subject.ilike.%${term}%,description.ilike.%${term}%`
      )
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
  staffEmail: string,
  senderType: 'staff' | 'internal_note' | 'escalation' = 'staff'
) {
  try {
    const supabase = getAdminClient()

    const { data: newMsg, error: msgErr } = await supabase
      .from('ticket_messages')
      .insert({
        ticket_id: ticketId,
        sender_type: senderType,
        sender_name: staffName || 'ProducerToy Staff',
        message: message.trim(),
        created_at: new Date().toISOString(),
      })
      .select('*')
      .single()

    if (msgErr) throw new Error(msgErr.message)

    // Touch ticket updated_at
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
      details: { senderType, snippet: message.slice(0, 50) },
    })

    revalidatePath('/support')
    return { success: true, message: newMsg }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to send ticket response' }
  }
}

/**
 * Escalate a Customer / User Ticket directly to the Creator / Developer
 */
export async function escalateTicketToDeveloperAction({
  ticketId,
  brandName,
  developerEmail,
  notes,
  staffEmail,
}: {
  ticketId: string
  brandName: string
  developerEmail?: string
  notes: string
  staffEmail: string
}) {
  try {
    const supabase = getAdminClient()

    // 1. Update ticket status to ESCALATED_TO_DEV and priority to HIGH
    const { error: ticketErr } = await supabase
      .from('support_tickets')
      .update({
        status: 'ESCALATED_TO_DEV',
        priority: 'HIGH',
        updated_at: new Date().toISOString(),
      })
      .eq('id', ticketId)

    if (ticketErr) throw new Error(ticketErr.message)

    // 2. Post an official escalation message into ticket thread
    const escalationText = `🚨 [ESCALATED TO DEVELOPER / BRAND: ${brandName}]\n\nNotes from ProducerToy Support:\n${notes.trim()}${
      developerEmail ? `\nTarget Developer Contact: ${developerEmail}` : ''
    }`

    const { data: newMsg, error: msgErr } = await supabase
      .from('ticket_messages')
      .insert({
        ticket_id: ticketId,
        sender_type: 'staff',
        sender_name: 'ProducerToy Support Desk (Escalated to Developer)',
        message: escalationText,
        created_at: new Date().toISOString(),
      })
      .select('*')
      .single()

    if (msgErr) throw new Error(msgErr.message)

    // 3. Log Audit
    await logAdminActivity({
      staff_email: staffEmail,
      action: 'TICKET_ESCALATED_TO_DEV',
      target_type: 'system',
      target_id: ticketId,
      details: { brandName, developerEmail, notes: notes.slice(0, 60) },
    })

    revalidatePath('/support')
    return { success: true, message: newMsg }
  } catch (err: any) {
    console.error('escalateTicketToDeveloperAction error:', err)
    return { success: false, error: err.message || 'Failed to escalate ticket to developer' }
  }
}

/**
 * Escalate a Developer or High-Priority Ticket to the ProducerToy Core Engineering Team
 */
export async function escalateTicketToTeamAction({
  ticketId,
  reason,
  staffEmail,
}: {
  ticketId: string
  reason: string
  staffEmail: string
}) {
  try {
    const supabase = getAdminClient()

    // 1. Update ticket status to ESCALATED_TO_TEAM and priority to URGENT
    const { error: ticketErr } = await supabase
      .from('support_tickets')
      .update({
        status: 'ESCALATED_TO_TEAM',
        priority: 'URGENT',
        updated_at: new Date().toISOString(),
      })
      .eq('id', ticketId)

    if (ticketErr) throw new Error(ticketErr.message)

    // 2. Post escalation announcement
    const escalationText = `🔥 [ESCALATED TO PRODUCERTOY CORE TEAM / SUPER ADMIN]\n\nReason for Core Escalation:\n${reason.trim()}`

    const { data: newMsg, error: msgErr } = await supabase
      .from('ticket_messages')
      .insert({
        ticket_id: ticketId,
        sender_type: 'staff',
        sender_name: 'Core Team Escalation Alert',
        message: escalationText,
        created_at: new Date().toISOString(),
      })
      .select('*')
      .single()

    if (msgErr) throw new Error(msgErr.message)

    // 3. Log Audit
    await logAdminActivity({
      staff_email: staffEmail,
      action: 'TICKET_ESCALATED_TO_TEAM',
      target_type: 'system',
      target_id: ticketId,
      details: { reason: reason.slice(0, 60) },
    })

    revalidatePath('/support')
    return { success: true, message: newMsg }
  } catch (err: any) {
    console.error('escalateTicketToTeamAction error:', err)
    return { success: false, error: err.message || 'Failed to escalate ticket to team' }
  }
}

/**
 * De-escalate a Ticket back to standard IN_PROGRESS workflow
 */
export async function deescalateTicketAction({
  ticketId,
  staffEmail,
}: {
  ticketId: string
  staffEmail: string
}) {
  try {
    const supabase = getAdminClient()

    const { error } = await supabase
      .from('support_tickets')
      .update({
        status: 'IN_PROGRESS',
        updated_at: new Date().toISOString(),
      })
      .eq('id', ticketId)

    if (error) throw new Error(error.message)

    const { data: newMsg } = await supabase
      .from('ticket_messages')
      .insert({
        ticket_id: ticketId,
        sender_type: 'staff',
        sender_name: 'ProducerToy Support Desk',
        message: 'ℹ️ [STATUS UPDATE]: Ticket de-escalated and returned to normal In-Progress resolution.',
        created_at: new Date().toISOString(),
      })
      .select('*')
      .single()

    await logAdminActivity({
      staff_email: staffEmail,
      action: 'TICKET_DEESCALATED',
      target_type: 'system',
      target_id: ticketId,
    })

    revalidatePath('/support')
    return { success: true, message: newMsg }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to de-escalate ticket' }
  }
}

/**
 * Get simple list of brands for escalation dropdown
 */
export async function getBrandsListForSupportAction() {
  try {
    const supabase = getAdminClient()
    const { data, error } = await supabase
      .from('brands')
      .select('id, name, slug, support_email')
      .order('name', { ascending: true })

    if (error) throw error
    return { success: true, brands: data || [] }
  } catch (err: any) {
    return { success: false, brands: [] }
  }
}
