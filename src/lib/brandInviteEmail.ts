import crypto from 'crypto'

interface SendBrandOwnerInviteParams {
  to: string
  brandName: string
  brandSlug: string
  brandLogoUrl?: string | null
  inviteToken: string
  portalUrl?: string
}

export async function sendBrandOwnerInviteEmail({
  to,
  brandName,
  brandSlug,
  brandLogoUrl,
  inviteToken,
  portalUrl = process.env.NEXT_PUBLIC_CREATOR_PORTAL_URL || 'https://creators.producertoy.com',
}: SendBrandOwnerInviteParams): Promise<{ success: boolean; error?: string; messageId?: string }> {
  const cleanEmail = to.trim().toLowerCase()
  if (!cleanEmail || !cleanEmail.includes('@')) {
    return { success: false, error: 'Invalid recipient email.' }
  }

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.warn('[BRAND_INVITE_EMAIL] RESEND_API_KEY is not configured in .env.local.')
    return { success: false, error: 'Email service configuration missing.' }
  }

  const fromEmail = process.env.EMAIL_FROM || 'ProducerToy Creator Portal <info@producertoy.com>'
  const inviteUrl = `${portalUrl.replace(/\/$/, '')}/invite?token=${encodeURIComponent(inviteToken)}`

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Brand Owner Portal Activation - ${brandName}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0d0d0d; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color: #e4e4e7; line-height: 1.6;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0d0d0d; min-height: 100vh; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 580px; background-color: #141414; border: 1px solid #262626; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 40px rgba(0, 0, 0, 0.6);" cellspacing="0" cellpadding="0">
          
          <!-- Top Accent Line -->
          <tr>
            <td style="height: 3px; background-color: #ffffff;"></td>
          </tr>

          <!-- Header -->
          <tr>
            <td style="padding: 36px 36px 20px 36px; text-align: left; border-bottom: 1px solid #202020;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <div style="font-size: 11px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; color: #a1a1aa;">
                      TOY CREATOR • EXECUTIVE PARTNER PORTAL
                    </div>
                    <div style="font-size: 22px; font-weight: 800; color: #ffffff; margin-top: 6px; letter-spacing: -0.02em;">
                      Brand Owner Invitation
                    </div>
                  </td>
                  ${brandLogoUrl ? `
                  <td align="right" style="vertical-align: middle;">
                    <img src="${brandLogoUrl}" alt="${brandName}" width="48" height="48" style="border-radius: 8px; border: 1px solid #2e2e2e; object-fit: contain; background-color: #1a1a1a;" />
                  </td>
                  ` : ''}
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 32px 36px;">
              <p style="margin: 0 0 20px 0; font-size: 14px; color: #d4d4d8;">
                Hello,
              </p>
              <p style="margin: 0 0 24px 0; font-size: 14px; color: #d4d4d8; line-height: 1.6;">
                ProducerToy has officially provisioned an executive brand portal for <strong style="color: #ffffff;">${brandName}</strong>. You have been designated as the verified <strong style="color: #ffffff;">Brand Owner</strong>.
              </p>

              <!-- Brand Summary Card -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #181818; border: 1px solid #282828; border-radius: 8px; margin-bottom: 28px; padding: 20px;">
                <tr>
                  <td>
                    <div style="font-size: 10px; font-family: monospace; text-transform: uppercase; letter-spacing: 0.1em; color: #71717a; margin-bottom: 4px;">
                      Brand Catalog Identifier
                    </div>
                    <div style="font-size: 15px; font-weight: 700; color: #ffffff;">
                      ${brandName} <span style="font-size: 12px; font-weight: normal; color: #71717a; font-family: monospace;">(slug: /${brandSlug})</span>
                    </div>

                    <div style="height: 1px; background-color: #242424; margin: 14px 0;"></div>

                    <div style="font-size: 10px; font-family: monospace; text-transform: uppercase; letter-spacing: 0.1em; color: #71717a; margin-bottom: 4px;">
                      Authority & Economics
                    </div>
                    <div style="font-size: 13px; font-weight: 600; color: #ffffff;">
                      Role: Brand Owner (Full Access) • 70% Revenue Split
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Permissions List -->
              <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #a1a1aa; margin-bottom: 12px;">
                What you can do in Toy Creator:
              </div>
              <ul style="margin: 0 0 32px 0; padding-left: 18px; font-size: 13px; color: #a1a1aa; line-height: 1.7;">
                <li>Publish and distribute audio software plugins, soundbanks, and sample packs</li>
                <li>Monitor live real-time gross volume, customer analytics, and monthly payouts</li>
                <li>Generate, distribute, and verify DRM software serial keys</li>
                <li>Invite team members and assign developer, support, or finance seats</li>
              </ul>

              <!-- CTA Button -->
              <div style="text-align: center; margin-bottom: 32px;">
                <a href="${inviteUrl}" target="_blank" style="display: inline-block; background-color: #ffffff; color: #000000; font-size: 13px; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; text-decoration: none; padding: 14px 32px; border-radius: 6px; box-shadow: 0 2px 12px rgba(255, 255, 255, 0.15);">
                  Activate Brand Portal &rarr;
                </a>
              </div>

              <!-- Fallback Direct URL -->
              <div style="padding: 16px; background-color: #161616; border: 1px solid #222222; border-radius: 6px; font-size: 11px; color: #71717a; word-break: break-all; font-family: monospace;">
                <span style="color: #a1a1aa; font-weight: 600;">Direct Link:</span><br />
                <a href="${inviteUrl}" style="color: #d4d4d8; text-decoration: underline;">${inviteUrl}</a>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 36px; background-color: #111111; border-top: 1px solid #202020; font-size: 11px; color: #52525b; text-align: center;">
              <div>This invitation was dispatched by ProducerToy Operations for ${cleanEmail}.</div>
              <div style="margin-top: 6px; color: #71717a;">
                ProducerToy Ecosystem • <a href="https://creators.producertoy.com" style="color: #71717a; text-decoration: underline;">creators.producertoy.com</a>
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [cleanEmail],
        subject: `Executive Invitation: Claim ${brandName} on ProducerToy Creator`,
        html,
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      console.error('[BRAND_INVITE_EMAIL] Resend API error:', data)
      return { success: false, error: data?.message || 'Failed to send invitation email.' }
    }

    return { success: true, messageId: data?.id }
  } catch (err: any) {
    console.error('[BRAND_INVITE_EMAIL] Network error:', err)
    return { success: false, error: err?.message || 'Email delivery service failure.' }
  }
}
