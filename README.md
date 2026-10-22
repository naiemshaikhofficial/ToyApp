# Toy App (`app.producertoy.com`)
**Central Commercial Operations, Brand Governance, Catalog Curation, Staff Roles, Invoices & Creator Settlements**

---

## Overview
**Toy App** is the centralized operational and governance web application powering the **ProducerToy** commercial audio ecosystem. Architected with Next.js (App Router), React 19, TypeScript, and Tailwind CSS v4, Toy App seamlessly bridges the consumer storefront (`producertoy.com`) and the audio developer portal (`creators.producertoy.com`).

---

## Core Capabilities & Feature Modules

### 1. Brand Management (`/brands`)
- Master directory of 300+ audio software manufacturers, sound design boutiques, and independent creators.
- Verification badge management & contractual compliance tracking (`v1.0` Master Seller Distribution Agreement).
- Custom creator revenue share configuration (standard: 70% Creator / 30% Platform).
- Developer profile customization: logos, banners, support emails, official websites, and country metadata.

### 2. Product Catalog & Digital Assets (`/products`)
- Full lifecycle management for audio plugins (VST3, AU, AAX), sample libraries (WAV 24-bit), synthesizer preset banks, and DAW templates.
- Multi-platform installer links (Windows `.exe`/`.zip`, macOS `.pkg`/`.dmg`, Universal/Google Drive links).
- Direct audio demo preview player integration.
- Hardware workstation licensing parameters: `plugin_identifier`, `max_activation_seats`, `offline_grace_days`, and version changelogs.
- Real-time connection with the `serial_keys` inventory pool.

### 3. Sales & Customer Orders (`/orders`)
- Live transaction stream across Razorpay (INR / International) and PayPal (USD).
- Real-time search by customer email, Razorpay payment ID, PayPal capture ID, or serial key.
- Order details inspection with customer billing addresses and payment gateway references.
- Refund processing & access revocation: automated locking of hardware machine seats and deallocation of serial keys.

### 4. Commercial Tax Invoices (`/invoices`)
- Automated generation of sequential international tax invoices (`#INV-XXXXXX`) adhering to ProducerToy's official corporate standard.
- International tax & Indian GST (18%) breakdown with itemized subtotals.
- Instant HTML preview and high-resolution print / save as PDF modal.
- CSV export for financial reconciliations and accounting audits.

### 5. Creator Payouts & Settlements (`/payouts`)
- Payout request management for creator disbursements.
- Solved multi-currency accounting: normalized gross sales across USD and domestic INR transactions.
- 70/30 commission split accounting: tracking platform fee retains, creator payouts, and pending platform liabilities.
- Status transitions (`scheduled` -> `processing` -> `completed`) with Bank UTR, Wise, or PayPal transaction references.

### 6. Licenses & Hardware Activations (`/licenses`)
- Real-time monitoring of authenticated machine workstation activations (`device_activations`).
- Remote seat revocation for pirated, refunded, or decommissioned producer workstations.
- Serial key inventory pool stock monitor across all catalog products with low-inventory warnings (<10 keys remaining).
- Batch upload serial keys utility with automatic deduplication against existing database keys.

### 7. Staff Base Roles & Access Control (`/staff`)
- Role-Based Access Control (RBAC) backed by PostgreSQL database policies:
  - **Super Administrator**: Full unconstrained platform governance, staff invites, financial settlements.
  - **Catalog & Brand Manager**: Product moderation, installer verification, audio demos, brand onboarding.
  - **Orders & Finance Director**: Order audits, tax invoices, creator payout approvals, revenue splits.
  - **Support & Licensing Specialist**: Machine activation seat revocations, license challenge resolution.
- Immutable system audit trail (`admin_audit_logs`) recording administrative actions with timestamps and staff emails.

---

## Tech Stack
- **Framework:** Next.js 16 (App Router with Turbopack)
- **Runtime:** React 19, TypeScript 5
- **Styling:** Tailwind CSS v4, Charcoal & Near-Black Palette (`#121212`, `#181818`, `#202020`, `#34363d`)
- **Database:** Supabase PostgreSQL (`voalgeyexfhfitlyorfl.supabase.co`)
- **Icons:** Lucide React

---

## Production Domain
- **Canonical URL:** `https://app.producertoy.com`
- **Storefront:** `https://producertoy.com`
- **Seller Portal:** `https://creators.producertoy.com`
