'use client'

import React, { useState } from 'react'
import {
  FileSpreadsheet,
  Search,
  Printer,
  Download,
  Eye,
  CheckCircle,
  X,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react'
import { InvoiceRecord, generateInvoiceHTML } from '@/lib/invoiceUtils'
import { getInvoiceHtmlAction } from '@/actions/invoiceActions'

interface InvoicesClientProps {
  initialInvoices: InvoiceRecord[]
  totalInvoices: number
}

export function InvoicesClient({ initialInvoices, totalInvoices }: InvoicesClientProps) {
  const [invoices, setInvoices] = useState<InvoiceRecord[]>(initialInvoices)
  const [search, setSearch] = useState('')
  const [previewHtml, setPreviewHtml] = useState<string | null>(null)
  const [activeInvoiceNumber, setActiveInvoiceNumber] = useState<string | null>(null)

  const filteredInvoices = invoices.filter((inv) => {
    if (!search.trim()) return true
    const s = search.toLowerCase()
    return (
      inv.invoice_number.toLowerCase().includes(s) ||
      inv.customer_email?.toLowerCase().includes(s) ||
      inv.customer_name?.toLowerCase().includes(s) ||
      inv.products.name.toLowerCase().includes(s)
    )
  })

  // Open Preview Modal
  const handlePreview = (item: InvoiceRecord) => {
    const html = generateInvoiceHTML(item)
    setPreviewHtml(html)
    setActiveInvoiceNumber(item.invoice_number)
  }

  // Direct Print / New Window
  const handlePrint = (item: InvoiceRecord) => {
    const html = generateInvoiceHTML(item)
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(html)
      printWindow.document.close()
    }
  }

  // Export CSV of invoices
  const handleExportCSV = () => {
    const headers = ['Invoice Number', 'Date', 'Customer Name', 'Customer Email', 'Product', 'Amount', 'Currency', 'Payment Method']
    const rows = filteredInvoices.map((i) => [
      i.invoice_number,
      new Date(i.purchased_at).toISOString().split('T')[0],
      `"${i.customer_name || ''}"`,
      i.customer_email || '',
      `"${i.products.name}"`,
      i.amount_paid,
      i.currency,
      i.payment_gateway,
    ])

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `producertoy_invoices_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by invoice #, customer email, product name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="epic-input pl-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <span className="text-xs font-mono text-zinc-400">
            {filteredInvoices.length} of {totalInvoices} Invoices
          </span>
          <button onClick={handleExportCSV} className="epic-btn-outline">
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Invoices List */}
      <div className="epic-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#181818] text-zinc-400 font-mono uppercase text-[10px] border-b border-[#2a2a2a]">
              <tr>
                <th className="py-3 px-4">Invoice # / Date</th>
                <th className="py-3 px-3">Billed To (Licensee)</th>
                <th className="py-3 px-3">Product Item</th>
                <th className="py-3 px-3">Payment Method</th>
                <th className="py-3 px-3 text-right">Total Amount</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2a2a]">
              {filteredInvoices.map((inv) => {
                const isINR = (inv.currency || '').toUpperCase() === 'INR' || inv.currency === '₹'
                return (
                  <tr key={inv.id} className="hover:bg-[#181818]/60 transition">
                    <td className="py-3.5 px-4 font-mono">
                      <div className="text-white font-bold">{inv.invoice_number}</div>
                      <div className="text-[10px] text-zinc-500">
                        {new Date(inv.purchased_at).toLocaleDateString()}
                      </div>
                    </td>

                    <td className="py-3.5 px-3">
                      <div className="text-white font-semibold">{inv.customer_name || 'Valued Producer'}</div>
                      <div className="text-[11px] text-zinc-400 font-mono">{inv.customer_email}</div>
                    </td>

                    <td className="py-3.5 px-3">
                      <div className="text-white font-medium">{inv.products.name}</div>
                      <div className="text-[10px] text-zinc-500 font-mono">{inv.products.brand || 'Producer Toy'}</div>
                    </td>

                    <td className="py-3.5 px-3 font-mono text-[11px]">
                      <span className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300 font-bold text-[9px] uppercase">
                        {inv.payment_gateway}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-right font-mono font-bold text-white">
                      {isINR ? '₹' : '$'}
                      {inv.amount_paid.toFixed(2)} {inv.currency}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handlePreview(inv)}
                          className="px-2.5 py-1 rounded bg-[#202020] hover:bg-[#2a2a2a] text-zinc-300 hover:text-white border border-[#2a2a2a] text-[11px] font-mono transition flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Preview</span>
                        </button>
                        <button
                          onClick={() => handlePrint(inv)}
                          className="p-1.5 rounded hover:bg-[#2a2a2a] text-zinc-400 hover:text-white transition"
                          title="Print / Save PDF"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Preview Modal */}
      {previewHtml && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="epic-card bg-[#181818] max-w-4xl w-full h-[90vh] flex flex-col overflow-hidden">
            <div className="p-4 border-b border-[#2a2a2a] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-zinc-400" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                  Tax Invoice Preview: #{activeInvoiceNumber}
                </h3>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    const printWindow = window.open('', '_blank')
                    if (printWindow) {
                      printWindow.document.write(previewHtml)
                      printWindow.document.close()
                    }
                  }}
                  className="epic-btn-primary"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print / PDF</span>
                </button>
                <button
                  onClick={() => {
                    setPreviewHtml(null)
                    setActiveInvoiceNumber(null)
                  }}
                  className="p-1 text-zinc-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 bg-white overflow-hidden">
              <iframe
                srcDoc={previewHtml}
                title="Invoice Preview"
                className="w-full h-full border-none"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
