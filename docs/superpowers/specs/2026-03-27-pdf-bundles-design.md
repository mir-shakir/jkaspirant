# PDF Bundles — Feature Design Spec

## Overview

Add a paid PDF bundles system to JK Aspirant. Buyers purchase exam resource packs (previous papers, notes, question banks) via Razorpay, get instant download + email delivery. Admin manages bundles, orders, and coupon codes from the existing CRM.

## Context

The site owner already sells PDF bundles via a Telegram group at ₹50–100 with direct UPI payments and manual delivery. This feature automates that workflow: pay → instant access. Existing Telegram customers will be migrated to the website.

---

## Product Model

A **Bundle** is a purchasable product containing one or more PDF files.

**Bundle properties:**
- Title, slug, description (HTML body for rich content)
- Price in INR (integer, stored in paise for Razorpay: ₹100 = 10000 paise)
- Optional exam association (links to existing `exams` table)
- Cover image URL (Supabase Storage `og-images` bucket)
- SEO fields: seo_title, seo_description, focus_keyword
- is_active flag

**Bundle files:**
- Each bundle has 1+ files in a separate `bundle_files` table
- Files stored in Supabase Storage private `bundles` bucket (not publicly accessible)
- Each file has: display name, storage path, file size, sort order

---

## Purchase Flow

### Happy Path

1. Buyer visits `/bundles/[slug]` — sees bundle details, file list, price
2. Clicks **"Buy Now"** → email input modal appears
3. Enters email → optionally enters coupon code → sees final price
4. If final price > 0: Razorpay checkout opens (Razorpay handles UPI/card/wallet)
5. If final price = 0 (100% coupon): skip Razorpay, create order directly
6. On success:
   - Order created in DB with a unique `download_token` (UUID) and `token_expires_at` (48 hours)
   - Buyer redirected to `/bundles/[slug]/download?token=<UUID>`
   - Download page shows signed URLs for each file (valid 1 hour, regenerated on page load)
   - Email sent via Resend with download page link
7. Buyer can revisit the download page using the token link (from email) within 48 hours

### Edge Cases

- **Token expired:** Download page shows "Link expired. Contact us on Telegram for help." with Telegram link
- **Invalid token:** 404 page
- **Razorpay payment fails:** Buyer stays on bundle page, can retry
- **Webhook arrives before redirect:** Order already exists when buyer hits download page — works fine
- **Webhook delayed:** Redirect includes `razorpay_payment_id` as fallback; download page can verify payment directly if order not yet created

---

## Coupon System

**Coupon properties:**
- Code (unique, case-insensitive, e.g. "SHARE50")
- Discount percent (0–100; 100 = fully free)
- Max uses (null = unlimited)
- Times used (counter)
- Expires at (nullable — null = never expires)
- is_active flag

**Coupon flow:**
1. Buyer enters code on checkout
2. Client calls `/api/coupons/validate` with code + bundle_id
3. API returns { valid: true, discount_percent: 50 } or { valid: false, reason: "..." }
4. UI updates displayed price
5. On order creation, coupon_id stored on order, times_used incremented

**Validation rules:**
- Code must exist and be active
- Not expired
- times_used < max_uses (if max_uses is set)

---

## URL Structure

```
/bundles                         → Browse all bundles (SSG)
/bundles/[slug]                  → Bundle detail + buy button (SSG)
/bundles/[slug]/download         → Download page (dynamic, token-gated)

/api/razorpay/create-order       → Creates Razorpay order (POST)
/api/razorpay/webhook            → Razorpay payment confirmation (POST)
/api/coupons/validate            → Validate coupon code (POST)
/api/bundles/free-order          → Create order for 100% discount (POST)

/admin/bundles                   → Bundle manager
/admin/orders                    → Order list
/admin/coupons                   → Coupon manager
```

---

## Database Schema

```sql
-- BUNDLES
create table if not exists bundles (
  id              uuid primary key default gen_random_uuid(),
  slug            text unique not null,
  title           text not null,
  description     text,
  price_paise     int not null,              -- price in paise (₹100 = 10000)
  exam_id         uuid references exams(id) on delete set null,
  cover_image_url text,
  is_active       boolean default true,
  seo_title       text,
  seo_description text,
  focus_keyword   text,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- BUNDLE FILES
create table if not exists bundle_files (
  id              uuid primary key default gen_random_uuid(),
  bundle_id       uuid references bundles(id) on delete cascade,
  file_name       text not null,             -- display name: "GK Paper 2023.pdf"
  storage_path    text not null,             -- Supabase Storage path
  file_size_kb    int,
  sort_order      int default 0,
  created_at      timestamptz default now()
);

-- ORDERS
create table if not exists orders (
  id                  uuid primary key default gen_random_uuid(),
  bundle_id           uuid references bundles(id) on delete set null,
  buyer_email         text not null,
  amount_paid_paise   int not null,          -- actual amount after discount
  razorpay_order_id   text,
  razorpay_payment_id text,
  coupon_id           uuid references coupons(id) on delete set null,
  download_token      uuid unique not null default gen_random_uuid(),
  token_expires_at    timestamptz not null,
  status              text not null default 'pending'
                      check (status in ('pending', 'paid', 'free')),
  created_at          timestamptz default now()
);

-- COUPONS
create table if not exists coupons (
  id                uuid primary key default gen_random_uuid(),
  code              text unique not null,
  discount_percent  int not null check (discount_percent between 0 and 100),
  max_uses          int,                     -- null = unlimited
  times_used        int default 0,
  expires_at        timestamptz,             -- null = never expires
  is_active         boolean default true,
  created_at        timestamptz default now()
);
```

**RLS policies:**
- `bundles`: public read where is_active = true
- `bundle_files`: public read (file URLs are storage paths, not direct links — signed URLs generated server-side)
- `orders`: no public read (server-side only via service role)
- `coupons`: no public read (validated via API route)

**Storage:**
- New private bucket: `bundles` — admin write, no public read
- Files accessed only via signed URLs (1-hour expiry, generated on download page load)

---

## API Routes

### POST `/api/razorpay/create-order`
- Input: `{ bundle_id, buyer_email, coupon_code? }`
- Validates bundle exists, validates coupon if provided
- Creates Razorpay order via Razorpay SDK
- Returns `{ razorpay_order_id, amount_paise, key_id }`

### POST `/api/razorpay/webhook`
- Razorpay sends payment confirmation
- Verifies webhook signature using Razorpay secret
- Creates/updates order in DB: status = 'paid', sets download_token, token_expires_at
- Sends email via Resend with download link
- Increments coupon times_used if applicable

### POST `/api/coupons/validate`
- Input: `{ code, bundle_id }`
- Returns `{ valid, discount_percent, reason? }`

### POST `/api/bundles/free-order`
- Input: `{ bundle_id, buyer_email, coupon_code }`
- Validates 100% discount coupon
- Creates order: status = 'free', sets download_token, token_expires_at
- Sends email via Resend
- Returns `{ download_token }`

---

## Email Delivery

**Provider:** Resend (free tier: 3,000 emails/month — sufficient for early stage)

**Email content:**
- Subject: "Your download is ready — {bundle title}"
- Body: Bundle name, download page link (`/bundles/[slug]/download?token=<UUID>`), expiry note (48 hours), support contact (Telegram link)

---

## Admin CRM Pages

### Bundles Manager (`/admin/bundles`)
- List all bundles (active/inactive)
- Create/edit: title, slug, description, price, exam association, cover image, SEO fields
- Upload PDF files per bundle (to private `bundles` storage bucket)
- Reorder files, view file count and total size
- Toggle is_active

### Orders (`/admin/orders`)
- Table: buyer email, bundle title, amount paid, payment status, coupon used, date
- Filter by: bundle, date range, status
- View download token and expiry

### Coupons Manager (`/admin/coupons`)
- List all coupons
- Create/edit: code, discount %, max uses, expiry
- View usage count
- Toggle is_active

---

## Public Pages

### `/bundles` — Bundle Listing (SSG)
- Grid of bundle cards: title, price, exam tag (if linked), cover image
- SEO: "JKSSB Exam Resources — PDF Packs" with JSON-LD

### `/bundles/[slug]` — Bundle Detail (SSG)
- Title, description, price, file list (names + sizes, no download links)
- "Buy Now" button → opens email/coupon modal → Razorpay checkout
- Breadcrumbs, JSON-LD, SEO metadata
- If linked to an exam, cross-link to exam page

### `/bundles/[slug]/download` — Download Page (Dynamic, server-rendered)
- Requires `?token=<UUID>` query parameter
- Validates token exists and not expired
- Generates fresh signed URLs for each file (1-hour expiry)
- Shows file list with download buttons
- If token expired: shows expiry message + Telegram contact link

---

## Components

- `BundleCard` — used on `/bundles` listing and homepage
- `BuyButton` — handles email input, coupon, Razorpay checkout flow
- `DownloadFileList` — shows files with signed URL download buttons on download page

---

## New Dependencies

- `razorpay` — server-side SDK for order creation and webhook verification
- `resend` — email delivery SDK

---

## New Environment Variables

```env
RAZORPAY_KEY_ID=rzp_live_...
RAZORPAY_KEY_SECRET=...
RAZORPAY_WEBHOOK_SECRET=...
RESEND_API_KEY=re_...
```

---

## What's NOT in Scope

- User accounts / login for buyers
- Purchase history page (future — when accounts are added)
- Subscription/recurring payments
- Multiple payment gateways
- Refunds (handled manually via Razorpay dashboard)
- Analytics/revenue dashboard (use Razorpay dashboard)
