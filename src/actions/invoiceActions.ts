'use server'

import { getAdminClient } from '@/lib/supabase/admin'
import { generateInvoiceHTML, InvoiceRecord } from '@/lib/invoiceUtils'

export async function getAdminInvoicesAction(params?: {
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
      .from('purchases')
      .select('*, products(id, name, product_type, price_usd, cover_image, brands(name))', { count: 'exact' })

    if (params?.search?.trim()) {
      const s = params.search.trim()
      query = query.or(`customer_email.ilike.%${s}%,customer_name.ilike.%${s}%,razorpay_payment_id.ilike.%${s}%`)
    }

    query = query.order('purchased_at', { ascending: false }).range(from, to)

    const { data, count, error } = await query

    if (error) {
      return { success: false, error: error.message, invoices: [], total: 0 }
    }

    const invoices: InvoiceRecord[] = (data || []).map((p: any) => {
      const ref = (p.razorpay_payment_id || p.id).replace(/[^a-zA-Z0-9]/g, '').slice(-8).toUpperCase()
      return {
        id: p.id,
        invoice_number: `INV-${ref}`,
        order_id: p.razorpay_order_id || `ORD-${p.id.slice(0, 8).toUpperCase()}`,
        order_number: p.razorpay_order_id || `ORD-${p.id.slice(0, 8).toUpperCase()}`,
        purchased_at: p.purchased_at,
        customer_name: p.customer_name || 'Valued Producer',
        customer_email: p.customer_email || 'customer@producertoy.com',
        customer_phone: p.customer_phone,
        billing_address: p.billing_address,
        billing_city: p.billing_city,
        billing_state: p.billing_state,
        billing_zip: p.billing_zip,
        billing_country: p.billing_country || 'India',
        amount_paid: Number(p.amount_paid || 0),
        currency: p.currency || 'INR',
        serial_key: p.serial_key,
        payment_gateway: p.razorpay_payment_id ? 'Razorpay' : 'PayPal',
        payment_id: p.razorpay_payment_id || p.id,
        products: {
          id: p.products?.id,
          name: p.products?.name || 'Audio Asset',
          brand: p.products?.brands?.name || 'Producer Toy',
          product_type: p.products?.product_type || 'Plugin',
          price_usd: p.products?.price_usd,
          cover_image: p.products?.cover_image,
        },
      }
    })

    return { success: true, invoices, total: count || 0 }
  } catch (err: any) {
    return { success: false, error: err.message, invoices: [], total: 0 }
  }
}

export async function getInvoiceHtmlAction(purchaseId: string) {
  try {
    const supabase = getAdminClient()
    const { data: p, error } = await supabase
      .from('purchases')
      .select('*, products(id, name, product_type, price_usd, cover_image, brands(name))')
      .eq('id', purchaseId)
      .single()

    if (error || !p) return { success: false, error: 'Invoice record not found' }

    const ref = (p.razorpay_payment_id || p.id).replace(/[^a-zA-Z0-9]/g, '').slice(-8).toUpperCase()
    const record: InvoiceRecord = {
      id: p.id,
      invoice_number: `INV-${ref}`,
      order_id: p.razorpay_order_id || `ORD-${p.id.slice(0, 8).toUpperCase()}`,
      order_number: p.razorpay_order_id || `ORD-${p.id.slice(0, 8).toUpperCase()}`,
      purchased_at: p.purchased_at,
      customer_name: p.customer_name || 'Valued Producer',
      customer_email: p.customer_email || 'customer@producertoy.com',
      customer_phone: p.customer_phone,
      billing_address: p.billing_address,
      billing_city: p.billing_city,
      billing_state: p.billing_state,
      billing_zip: p.billing_zip,
      billing_country: p.billing_country || 'India',
      amount_paid: Number(p.amount_paid || 0),
      currency: p.currency || 'INR',
      serial_key: p.serial_key,
      payment_gateway: p.razorpay_payment_id ? 'Razorpay' : 'PayPal',
      payment_id: p.razorpay_payment_id || p.id,
      products: {
        id: p.products?.id,
        name: p.products?.name || 'Audio Asset',
        brand: p.products?.brands?.name || 'Producer Toy',
        product_type: p.products?.product_type || 'Plugin',
        price_usd: p.products?.price_usd,
        cover_image: p.products?.cover_image,
      },
    }

    const html = generateInvoiceHTML(record)
    return { success: true, html, invoiceNumber: record.invoice_number }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}
