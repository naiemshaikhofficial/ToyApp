export interface InvoiceItem {
  id: string
  name: string
  brand?: string
  product_type?: string
  price_usd?: number
  cover_image?: string
}

export interface InvoiceRecord {
  id: string
  invoice_number: string
  order_id: string
  order_number?: string
  purchased_at: string
  customer_name: string | null
  customer_email: string | null
  customer_phone?: string | null
  billing_address?: string | null
  billing_city?: string | null
  billing_state?: string | null
  billing_zip?: string | null
  billing_country?: string | null
  amount_paid: number
  currency: string
  serial_key?: string | null
  payment_gateway: string
  payment_id?: string
  products: InvoiceItem
}

export function generateInvoiceHTML(item: InvoiceRecord): string {
  const isINR = item.currency.toUpperCase() === 'INR' || item.currency === '₹'
  const currencySymbol = isINR ? '₹' : '$'
  const currencyCode = isINR ? 'INR' : 'USD'
  const amount = Number(item.amount_paid || 0)
  
  // Tax breakdown (18% GST for India or Export Tax for International)
  const isDomesticIndia = (item.billing_country || '').toLowerCase().includes('india') || isINR
  const basePrice = isDomesticIndia ? (amount / 1.18) : amount
  const taxAmount = isDomesticIndia ? (amount - basePrice) : 0
  
  const formattedDate = new Date(item.purchased_at).toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })

  const fullAddress = [
    item.billing_address,
    item.billing_city,
    item.billing_state,
    item.billing_zip,
    item.billing_country,
  ].filter(Boolean).join(', ') || 'Global Digital Fulfillment Vault'

  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Tax Invoice #${item.invoice_number} - Producer Toy</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@500;700;800&display=swap');
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { 
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            padding: 40px; 
            color: #121212; 
            background: #121212; 
            line-height: 1.5;
            -webkit-font-smoothing: antialiased;
          }
          .invoice-card {
            max-width: 860px;
            margin: 0 auto;
            background: #ffffff;
            border: 1px solid #e4e4e7;
            border-radius: 12px;
            padding: 48px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 2px solid #000000;
            padding-bottom: 28px;
            margin-bottom: 32px;
          }
          .brand-title {
            font-size: 26px;
            font-weight: 900;
            letter-spacing: -0.8px;
            text-transform: uppercase;
            line-height: 1;
            color: #000000;
          }
          .brand-subtitle {
            font-size: 10px;
            font-weight: 800;
            letter-spacing: 1.5px;
            color: #71717a;
            text-transform: uppercase;
            margin-top: 6px;
          }
          .inv-badge {
            display: inline-block;
            font-family: 'JetBrains Mono', monospace;
            font-size: 10px;
            font-weight: 800;
            color: #000000;
            background: #f4f4f5;
            border: 1px solid #d4d4d8;
            padding: 4px 10px;
            border-radius: 4px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 6px;
          }
          .inv-heading {
            font-size: 24px;
            font-weight: 900;
            color: #000000;
          }
          .inv-sub {
            font-family: 'JetBrains Mono', monospace;
            font-size: 12px;
            font-weight: 600;
            color: #71717a;
            margin-top: 4px;
          }
          .meta-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 32px;
            margin-bottom: 36px;
          }
          .meta-box h4 {
            font-size: 10px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 1.2px;
            color: #a1a1aa;
            margin-bottom: 8px;
          }
          .meta-box p {
            font-size: 13px;
            color: #27272a;
            line-height: 1.6;
          }
          .table-wrapper {
            margin-bottom: 32px;
            border: 1px solid #e4e4e7;
            border-radius: 8px;
            overflow: hidden;
          }
          .table {
            width: 100%;
            border-collapse: collapse;
          }
          .table th {
            background: #000000;
            color: #ffffff;
            padding: 12px 16px;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
            text-align: left;
          }
          .table td {
            padding: 16px;
            font-size: 13px;
            border-bottom: 1px solid #e4e4e7;
            color: #18181b;
          }
          .totals-wrapper {
            margin-left: auto;
            width: 320px;
            margin-bottom: 32px;
          }
          .totals-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            font-size: 13px;
            color: #71717a;
          }
          .totals-row.grand-total {
            border-top: 2px solid #000000;
            padding-top: 12px;
            margin-top: 8px;
            color: #000000;
            font-size: 18px;
            font-weight: 900;
          }
          .license-box {
            background: #f4f4f5;
            border: 1px dashed #d4d4d8;
            border-radius: 8px;
            padding: 16px 20px;
            margin-bottom: 32px;
          }
          .license-box h5 {
            font-size: 10px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #71717a;
            margin-bottom: 4px;
          }
          .license-key {
            font-family: 'JetBrains Mono', monospace;
            font-size: 14px;
            font-weight: 700;
            color: #000000;
            letter-spacing: 1px;
          }
          .footer {
            border-top: 1px solid #e4e4e7;
            padding-top: 24px;
            text-align: center;
            font-size: 11px;
            color: #a1a1aa;
          }
          @media print {
            body { padding: 0; background: #ffffff; }
            .invoice-card { box-shadow: none; border: none; padding: 0; }
            .no-print { display: none !important; }
          }
        </style>
      </head>
      <body>
        <div class="no-print" style="max-width: 860px; margin: 0 auto 20px auto; display: flex; justify-content: flex-end; gap: 12px;">
          <button onclick="window.print()" style="background: #ffffff; color: #000; padding: 10px 20px; font-weight: 700; border-radius: 6px; cursor: pointer; border: none; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Print / Save as PDF</button>
        </div>
        <div class="invoice-card">
          <div class="header">
            <div>
              <div class="brand-title">PRODUCER<span>TOY</span></div>
              <div class="brand-subtitle">Commercial Audio Marketplace</div>
            </div>
            <div style="text-align: right;">
              <div class="inv-badge">Official Tax Invoice</div>
              <div class="inv-heading">#${item.invoice_number}</div>
              <div class="inv-sub">Date: ${formattedDate}</div>
            </div>
          </div>

          <div class="meta-grid">
            <div class="meta-box">
              <h4>Sold By (Platform Operator)</h4>
              <p><strong>ProducerToy Marketplace Inc.</strong><br/>
              Commercial Software & Audio Distribution Platform<br/>
              Support: support@producertoy.com<br/>
              Web: https://producertoy.com</p>
            </div>
            <div class="meta-box">
              <h4>Billed To (Licensee)</h4>
              <p><strong>${item.customer_name || 'Valued Producer'}</strong><br/>
              Email: ${item.customer_email || 'customer@producertoy.com'}<br/>
              Address: ${fullAddress}</p>
            </div>
          </div>

          <div class="table-wrapper">
            <table class="table">
              <thead>
                <tr>
                  <th>Product Description</th>
                  <th>Brand / Developer</th>
                  <th>Type</th>
                  <th style="text-align: right;">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>${item.products.name}</strong></td>
                  <td>${item.products.brand || 'Producer Toy'}</td>
                  <td>${item.products.product_type || 'Digital Audio Software'}</td>
                  <td style="text-align: right; font-weight: 700;">${currencySymbol}${amount.toFixed(2)} ${currencyCode}</td>
                </tr>
              </tbody>
            </table>
          </div>

          ${item.serial_key ? `
            <div class="license-box">
              <h5>Official Cryptographic Activation Key / Serial</h5>
              <div class="license-key">${item.serial_key}</div>
            </div>
          ` : ''}

          <div class="totals-wrapper">
            <div class="totals-row">
              <span>Subtotal:</span>
              <span>${currencySymbol}${basePrice.toFixed(2)}</span>
            </div>
            ${isDomesticIndia ? `
              <div class="totals-row">
                <span>GST (18% Included):</span>
                <span>${currencySymbol}${taxAmount.toFixed(2)}</span>
              </div>
            ` : `
              <div class="totals-row">
                <span>Tax (Export / Zero-Rated):</span>
                <span>${currencySymbol}0.00</span>
              </div>
            `}
            <div class="totals-row grand-total">
              <span>Total Paid:</span>
              <span>${currencySymbol}${amount.toFixed(2)} ${currencyCode}</span>
            </div>
          </div>

          <div class="footer">
            <p>Payment Method: ${item.payment_gateway.toUpperCase()} | Transaction ID: ${item.payment_id || 'VERIFIED'} | Order: ${item.order_number || item.order_id}</p>
            <p style="margin-top: 4px;">Thank you for empowering genuine sound creators worldwide. This is a computer-generated tax invoice.</p>
          </div>
        </div>
      </body>
    </html>
  `
}
