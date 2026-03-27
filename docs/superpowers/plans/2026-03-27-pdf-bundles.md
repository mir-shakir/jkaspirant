# PDF Bundles Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a paid PDF bundles system with Razorpay checkout, email delivery via Resend, coupon codes, and admin management — enabling instant purchase and download of exam resource packs.

**Architecture:** New Supabase tables for bundles/orders/coupons. Next.js API Route Handlers for Razorpay integration and coupon validation. Private Supabase Storage bucket with server-side signed URLs for secure file delivery. Client-side Razorpay checkout SDK. Follows existing project patterns (SSG for public pages, client components for admin).

**Tech Stack:** Next.js 14 (App Router), TypeScript, Tailwind CSS, Supabase, Razorpay SDK, Resend SDK

**Spec:** `docs/superpowers/specs/2026-03-27-pdf-bundles-design.md`

---

## File Structure

```
src/
├── app/
│   ├── bundles/
│   │   ├── page.tsx                              # /bundles listing (SSG)
│   │   └── [slug]/
│   │       ├── page.tsx                          # /bundles/[slug] detail (SSG)
│   │       └── download/
│   │           └── page.tsx                      # /bundles/[slug]/download (dynamic, token-gated)
│   ├── api/
│   │   ├── razorpay/
│   │   │   ├── create-order/route.ts             # POST — create Razorpay order
│   │   │   └── webhook/route.ts                  # POST — payment confirmation
│   │   ├── coupons/
│   │   │   └── validate/route.ts                 # POST — validate coupon code
│   │   └── bundles/
│   │       └── free-order/route.ts               # POST — create free order (100% coupon)
│   └── admin/
│       ├── bundles/page.tsx                      # Admin bundle manager
│       ├── orders/page.tsx                       # Admin order list
│       └── coupons/page.tsx                      # Admin coupon manager
├── components/
│   ├── BundleCard.tsx                            # Bundle listing card
│   ├── BuyButton.tsx                             # Email + coupon + Razorpay checkout flow
│   └── DownloadFileList.tsx                      # File list with signed URL downloads
├── lib/
│   ├── queries/
│   │   └── bundles.ts                            # Server-side bundle/order queries
│   ├── razorpay.ts                               # Razorpay server-side utility
│   ├── email.ts                                  # Resend email utility
│   └── types/
│       └── database.ts                           # Add Bundle, BundleFile, Order, Coupon types
supabase/
└── migrations/
    ├── 003_create_bundle_tables.sql              # Schema for bundles, bundle_files, orders, coupons
    └── 004_bundle_rls.sql                        # RLS policies
```

**Modified files:**
- `src/lib/types/database.ts` — add 4 new interfaces
- `src/lib/queries/admin.ts` — add bundle/order/coupon admin queries
- `src/components/admin/AdminSidebar.tsx` — add 3 new nav items
- `src/app/page.tsx` — add featured bundles section to homepage
- `src/components/Header.tsx` — add "Resources" nav link
- `.env.local.example` — add Razorpay + Resend env vars
- `package.json` — add razorpay + resend dependencies

---

### Task 1: Database Schema & Types

**Files:**
- Create: `supabase/migrations/003_create_bundle_tables.sql`
- Create: `supabase/migrations/004_bundle_rls.sql`
- Modify: `src/lib/types/database.ts`

- [ ] **Step 1: Create bundle tables migration**

Create `supabase/migrations/003_create_bundle_tables.sql`:
```sql
-- BUNDLES
create table if not exists bundles (
  id              uuid primary key default gen_random_uuid(),
  slug            text unique not null,
  title           text not null,
  description     text,
  price_paise     int not null,
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
  file_name       text not null,
  storage_path    text not null,
  file_size_kb    int,
  sort_order      int default 0,
  created_at      timestamptz default now()
);

-- COUPONS (must be created before orders due to FK)
create table if not exists coupons (
  id                uuid primary key default gen_random_uuid(),
  code              text unique not null,
  discount_percent  int not null check (discount_percent between 0 and 100),
  max_uses          int,
  times_used        int default 0,
  expires_at        timestamptz,
  is_active         boolean default true,
  created_at        timestamptz default now()
);

-- ORDERS
create table if not exists orders (
  id                  uuid primary key default gen_random_uuid(),
  bundle_id           uuid references bundles(id) on delete set null,
  buyer_email         text not null,
  amount_paid_paise   int not null,
  razorpay_order_id   text,
  razorpay_payment_id text,
  coupon_id           uuid references coupons(id) on delete set null,
  download_token      uuid unique not null default gen_random_uuid(),
  token_expires_at    timestamptz not null,
  status              text not null default 'pending'
                      check (status in ('pending', 'paid', 'free')),
  created_at          timestamptz default now()
);

-- Indexes
create index if not exists idx_bundles_slug on bundles(slug);
create index if not exists idx_bundles_active on bundles(is_active);
create index if not exists idx_bundle_files_bundle on bundle_files(bundle_id);
create index if not exists idx_orders_token on orders(download_token);
create index if not exists idx_orders_bundle on orders(bundle_id);
create index if not exists idx_orders_email on orders(buyer_email);
create index if not exists idx_coupons_code on coupons(code);

-- Updated_at trigger for bundles
create trigger bundles_updated_at before update on bundles
  for each row execute function update_updated_at();
```

- [ ] **Step 2: Create RLS policies**

Create `supabase/migrations/004_bundle_rls.sql`:
```sql
-- Enable RLS
alter table bundles enable row level security;
alter table bundle_files enable row level security;
alter table orders enable row level security;
alter table coupons enable row level security;

-- Public read for active bundles
create policy "Public can read active bundles"
  on bundles for select using (is_active = true);

-- Public read for bundle files (storage paths only — actual files served via signed URLs)
create policy "Public can read bundle files"
  on bundle_files for select using (true);

-- Orders: no public access (service role only)
-- Coupons: no public access (validated via API route with service role)
```

- [ ] **Step 3: Add TypeScript interfaces**

Add to the end of `src/lib/types/database.ts`:
```typescript
export interface Bundle {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  price_paise: number;
  exam_id: string | null;
  cover_image_url: string | null;
  is_active: boolean;
  seo_title: string | null;
  seo_description: string | null;
  focus_keyword: string | null;
  created_at: string;
  updated_at: string;
  exam?: Pick<Exam, "slug" | "title">;
  files?: BundleFile[];
}

export interface BundleFile {
  id: string;
  bundle_id: string;
  file_name: string;
  storage_path: string;
  file_size_kb: number | null;
  sort_order: number;
  created_at: string;
}

export interface Order {
  id: string;
  bundle_id: string | null;
  buyer_email: string;
  amount_paid_paise: number;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  coupon_id: string | null;
  download_token: string;
  token_expires_at: string;
  status: "pending" | "paid" | "free";
  created_at: string;
  bundle?: Pick<Bundle, "title" | "slug">;
  coupon?: Pick<Coupon, "code">;
}

export interface Coupon {
  id: string;
  code: string;
  discount_percent: number;
  max_uses: number | null;
  times_used: number;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
}
```

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/003_create_bundle_tables.sql supabase/migrations/004_bundle_rls.sql src/lib/types/database.ts
git commit -m "feat: add database schema and types for bundles, orders, coupons"
```

---

### Task 2: Install Dependencies & Env Config

**Files:**
- Modify: `package.json`
- Modify: `.env.local.example`

- [ ] **Step 1: Install razorpay and resend**

Run:
```bash
npm install razorpay resend
```

- [ ] **Step 2: Update .env.local.example**

Add to `.env.local.example`:
```env

# Razorpay
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...
RAZORPAY_WEBHOOK_SECRET=...
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_...

# Resend
RESEND_API_KEY=re_...
```

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json .env.local.example
git commit -m "feat: add razorpay and resend dependencies"
```

---

### Task 3: Server-Side Utilities (Razorpay + Email + Bundle Queries)

**Files:**
- Create: `src/lib/razorpay.ts`
- Create: `src/lib/email.ts`
- Create: `src/lib/queries/bundles.ts`

- [ ] **Step 1: Create Razorpay server utility**

Create `src/lib/razorpay.ts`:
```typescript
import Razorpay from "razorpay";
import crypto from "crypto";

let instance: Razorpay | null = null;

export function getRazorpay(): Razorpay {
  if (!instance) {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) {
      throw new Error("Missing Razorpay credentials");
    }
    instance = new Razorpay({ key_id: keyId, key_secret: keySecret });
  }
  return instance;
}

export function verifyWebhookSignature(
  body: string,
  signature: string
): boolean {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) return false;

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}
```

- [ ] **Step 2: Create email utility**

Create `src/lib/email.ts`:
```typescript
import { Resend } from "resend";
import { siteConfig } from "@/config/site";

let resendClient: Resend | null = null;

function getResend(): Resend {
  if (!resendClient) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) throw new Error("Missing RESEND_API_KEY");
    resendClient = new Resend(apiKey);
  }
  return resendClient;
}

export async function sendDownloadEmail(params: {
  to: string;
  bundleTitle: string;
  bundleSlug: string;
  downloadToken: string;
}) {
  const downloadUrl = `${siteConfig.url}/bundles/${params.bundleSlug}/download?token=${params.downloadToken}`;

  const resend = getResend();
  await resend.emails.send({
    from: `JK Aspirant <noreply@${new URL(siteConfig.url).hostname}>`,
    to: params.to,
    subject: `Your download is ready — ${params.bundleTitle}`,
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
        <h2>Your download is ready!</h2>
        <p>Thank you for purchasing <strong>${params.bundleTitle}</strong>.</p>
        <p>
          <a href="${downloadUrl}" style="display: inline-block; background: #0d9488; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600;">
            Download Now
          </a>
        </p>
        <p style="color: #666; font-size: 14px;">
          This link expires in 48 hours. If you need help, contact us on
          <a href="https://t.me/jkaspirant">Telegram</a>.
        </p>
        <p style="color: #999; font-size: 12px;">— JK Aspirant</p>
      </div>
    `,
  });
}
```

- [ ] **Step 3: Create bundle server-side queries**

Create `src/lib/queries/bundles.ts`:
```typescript
import { createServerClient } from "@/lib/supabase/server";
import type { Bundle, BundleFile, Order, Coupon } from "@/lib/types/database";

export async function getAllBundles(): Promise<Bundle[]> {
  try {
    const supabase = createServerClient();
    const { data } = await supabase
      .from("bundles")
      .select("*, exam:exams(slug, title), files:bundle_files(*)")
      .eq("is_active", true)
      .order("created_at", { ascending: false });
    return data || [];
  } catch {
    return [];
  }
}

export async function getBundleBySlug(slug: string): Promise<Bundle | null> {
  try {
    const supabase = createServerClient();
    const { data } = await supabase
      .from("bundles")
      .select("*, exam:exams(slug, title), files:bundle_files(*)")
      .eq("slug", slug)
      .eq("is_active", true)
      .single();
    return data;
  } catch {
    return null;
  }
}

export async function getBundleSlugs(): Promise<string[]> {
  try {
    const supabase = createServerClient();
    const { data } = await supabase
      .from("bundles")
      .select("slug")
      .eq("is_active", true);
    return (data || []).map((row) => row.slug);
  } catch {
    return [];
  }
}

export async function getOrderByToken(token: string): Promise<Order | null> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*, bundle:bundles(title, slug)")
    .eq("download_token", token)
    .in("status", ["paid", "free"])
    .single();
  if (error) return null;
  return data;
}

export async function getBundleFiles(bundleId: string): Promise<BundleFile[]> {
  const supabase = createServerClient();
  const { data } = await supabase
    .from("bundle_files")
    .select("*")
    .eq("bundle_id", bundleId)
    .order("sort_order");
  return data || [];
}

export async function createSignedDownloadUrls(
  files: BundleFile[]
): Promise<{ fileName: string; url: string; fileSizeKb: number | null }[]> {
  const supabase = createServerClient();
  const results = [];

  for (const file of files) {
    const { data, error } = await supabase.storage
      .from("bundles")
      .createSignedUrl(file.storage_path, 3600); // 1 hour

    if (!error && data?.signedUrl) {
      results.push({
        fileName: file.file_name,
        url: data.signedUrl,
        fileSizeKb: file.file_size_kb,
      });
    }
  }

  return results;
}

export async function validateCoupon(
  code: string
): Promise<{ valid: boolean; coupon?: Coupon; reason?: string }> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("coupons")
    .select("*")
    .eq("code", code.toUpperCase())
    .eq("is_active", true)
    .single();

  if (error || !data) return { valid: false, reason: "Invalid coupon code" };

  if (data.expires_at && new Date(data.expires_at) < new Date()) {
    return { valid: false, reason: "Coupon has expired" };
  }

  if (data.max_uses !== null && data.times_used >= data.max_uses) {
    return { valid: false, reason: "Coupon usage limit reached" };
  }

  return { valid: true, coupon: data };
}

export async function createOrder(params: {
  bundleId: string;
  buyerEmail: string;
  amountPaidPaise: number;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  couponId?: string;
  status: "pending" | "paid" | "free";
}): Promise<Order> {
  const supabase = createServerClient();
  const tokenExpiresAt = new Date(
    Date.now() + 48 * 60 * 60 * 1000
  ).toISOString();

  const { data, error } = await supabase
    .from("orders")
    .insert({
      bundle_id: params.bundleId,
      buyer_email: params.buyerEmail,
      amount_paid_paise: params.amountPaidPaise,
      razorpay_order_id: params.razorpayOrderId || null,
      razorpay_payment_id: params.razorpayPaymentId || null,
      coupon_id: params.couponId || null,
      status: params.status,
      token_expires_at: tokenExpiresAt,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateOrderPayment(
  razorpayOrderId: string,
  razorpayPaymentId: string
): Promise<Order | null> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("orders")
    .update({
      status: "paid",
      razorpay_payment_id: razorpayPaymentId,
    })
    .eq("razorpay_order_id", razorpayOrderId)
    .select("*, bundle:bundles(title, slug)")
    .single();

  if (error) return null;
  return data;
}

export async function incrementCouponUsage(couponId: string): Promise<void> {
  const supabase = createServerClient();
  await supabase.rpc("increment_coupon_usage", { coupon_id: couponId });
}
```

- [ ] **Step 4: Add the increment_coupon_usage RPC to migration**

Add to the bottom of `supabase/migrations/003_create_bundle_tables.sql`:
```sql
-- RPC to atomically increment coupon usage
create or replace function increment_coupon_usage(coupon_id uuid)
returns void as $$
begin
  update coupons set times_used = times_used + 1 where id = coupon_id;
end;
$$ language plpgsql security definer;
```

- [ ] **Step 5: Commit**

```bash
git add src/lib/razorpay.ts src/lib/email.ts src/lib/queries/bundles.ts supabase/migrations/003_create_bundle_tables.sql
git commit -m "feat: add Razorpay, email, and bundle query utilities"
```

---

### Task 4: API Routes

**Files:**
- Create: `src/app/api/razorpay/create-order/route.ts`
- Create: `src/app/api/razorpay/webhook/route.ts`
- Create: `src/app/api/coupons/validate/route.ts`
- Create: `src/app/api/bundles/free-order/route.ts`

- [ ] **Step 1: Create Razorpay create-order route**

Create `src/app/api/razorpay/create-order/route.ts`:
```typescript
import { NextRequest, NextResponse } from "next/server";
import { getRazorpay } from "@/lib/razorpay";
import { createServerClient } from "@/lib/supabase/server";
import { validateCoupon, createOrder } from "@/lib/queries/bundles";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { bundle_id, buyer_email, coupon_code } = body;

  if (!bundle_id || !buyer_email) {
    return NextResponse.json(
      { error: "bundle_id and buyer_email are required" },
      { status: 400 }
    );
  }

  // Fetch bundle
  const supabase = createServerClient();
  const { data: bundle, error } = await supabase
    .from("bundles")
    .select("*")
    .eq("id", bundle_id)
    .eq("is_active", true)
    .single();

  if (error || !bundle) {
    return NextResponse.json({ error: "Bundle not found" }, { status: 404 });
  }

  // Validate coupon if provided
  let discountPercent = 0;
  let couponId: string | undefined;
  if (coupon_code) {
    const couponResult = await validateCoupon(coupon_code);
    if (!couponResult.valid) {
      return NextResponse.json(
        { error: couponResult.reason },
        { status: 400 }
      );
    }
    discountPercent = couponResult.coupon!.discount_percent;
    couponId = couponResult.coupon!.id;
  }

  const finalAmountPaise = Math.round(
    bundle.price_paise * (1 - discountPercent / 100)
  );

  // Create Razorpay order
  const razorpay = getRazorpay();
  const razorpayOrder = await razorpay.orders.create({
    amount: finalAmountPaise,
    currency: "INR",
    receipt: `bundle_${bundle.id}_${Date.now()}`,
  });

  // Create pending order in DB
  await createOrder({
    bundleId: bundle.id,
    buyerEmail: buyer_email,
    amountPaidPaise: finalAmountPaise,
    razorpayOrderId: razorpayOrder.id,
    couponId,
    status: "pending",
  });

  return NextResponse.json({
    razorpay_order_id: razorpayOrder.id,
    amount_paise: finalAmountPaise,
    key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  });
}
```

- [ ] **Step 2: Create Razorpay webhook route**

Create `src/app/api/razorpay/webhook/route.ts`:
```typescript
import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/razorpay";
import {
  updateOrderPayment,
  incrementCouponUsage,
} from "@/lib/queries/bundles";
import { sendDownloadEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("x-razorpay-signature");

  if (!signature || !verifyWebhookSignature(body, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(body);

  if (event.event === "payment.captured") {
    const payment = event.payload.payment.entity;
    const razorpayOrderId = payment.order_id;
    const razorpayPaymentId = payment.id;

    // Update order status
    const order = await updateOrderPayment(razorpayOrderId, razorpayPaymentId);

    if (order) {
      // Increment coupon usage if applicable
      if (order.coupon_id) {
        await incrementCouponUsage(order.coupon_id);
      }

      // Send download email
      if (order.bundle) {
        await sendDownloadEmail({
          to: order.buyer_email,
          bundleTitle: order.bundle.title,
          bundleSlug: order.bundle.slug,
          downloadToken: order.download_token,
        });
      }
    }
  }

  return NextResponse.json({ status: "ok" });
}
```

- [ ] **Step 3: Create coupon validation route**

Create `src/app/api/coupons/validate/route.ts`:
```typescript
import { NextRequest, NextResponse } from "next/server";
import { validateCoupon } from "@/lib/queries/bundles";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { code } = body;

  if (!code) {
    return NextResponse.json(
      { valid: false, reason: "Coupon code is required" },
      { status: 400 }
    );
  }

  const result = await validateCoupon(code);

  if (!result.valid) {
    return NextResponse.json({
      valid: false,
      reason: result.reason,
    });
  }

  return NextResponse.json({
    valid: true,
    discount_percent: result.coupon!.discount_percent,
  });
}
```

- [ ] **Step 4: Create free order route**

Create `src/app/api/bundles/free-order/route.ts`:
```typescript
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import {
  validateCoupon,
  createOrder,
  incrementCouponUsage,
} from "@/lib/queries/bundles";
import { sendDownloadEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { bundle_id, buyer_email, coupon_code } = body;

  if (!bundle_id || !buyer_email || !coupon_code) {
    return NextResponse.json(
      { error: "bundle_id, buyer_email, and coupon_code are required" },
      { status: 400 }
    );
  }

  // Validate coupon is 100% discount
  const couponResult = await validateCoupon(coupon_code);
  if (!couponResult.valid || couponResult.coupon!.discount_percent !== 100) {
    return NextResponse.json(
      { error: "Invalid or non-free coupon" },
      { status: 400 }
    );
  }

  // Fetch bundle
  const supabase = createServerClient();
  const { data: bundle, error } = await supabase
    .from("bundles")
    .select("title, slug")
    .eq("id", bundle_id)
    .eq("is_active", true)
    .single();

  if (error || !bundle) {
    return NextResponse.json({ error: "Bundle not found" }, { status: 404 });
  }

  // Create free order
  const order = await createOrder({
    bundleId: bundle_id,
    buyerEmail: buyer_email,
    amountPaidPaise: 0,
    couponId: couponResult.coupon!.id,
    status: "free",
  });

  // Increment coupon usage
  await incrementCouponUsage(couponResult.coupon!.id);

  // Send email
  await sendDownloadEmail({
    to: buyer_email,
    bundleTitle: bundle.title,
    bundleSlug: bundle.slug,
    downloadToken: order.download_token,
  });

  return NextResponse.json({
    download_token: order.download_token,
    slug: bundle.slug,
  });
}
```

- [ ] **Step 5: Commit**

```bash
git add src/app/api/razorpay/ src/app/api/coupons/ src/app/api/bundles/
git commit -m "feat: add API routes for Razorpay checkout, webhook, coupon validation, free orders"
```

---

### Task 5: Public Components (BundleCard, BuyButton, DownloadFileList)

**Files:**
- Create: `src/components/BundleCard.tsx`
- Create: `src/components/BuyButton.tsx`
- Create: `src/components/DownloadFileList.tsx`

- [ ] **Step 1: Create BundleCard component**

Create `src/components/BundleCard.tsx`:
```typescript
import Link from "next/link";
import type { Bundle } from "@/lib/types/database";

interface BundleCardProps {
  bundle: Pick<Bundle, "slug" | "title" | "price_paise" | "cover_image_url"> & {
    exam?: { title: string } | null;
    files?: { id: string }[];
  };
}

export function BundleCard({ bundle }: BundleCardProps) {
  const priceRupees = bundle.price_paise / 100;
  const fileCount = bundle.files?.length || 0;

  return (
    <Link
      href={`/bundles/${bundle.slug}`}
      className="block rounded-lg border border-gray-200 bg-white p-5 transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
    >
      <h3 className="text-base font-semibold text-gray-900 dark:text-white">
        {bundle.title}
      </h3>
      {bundle.exam && (
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {bundle.exam.title}
        </p>
      )}
      <div className="mt-3 flex items-center justify-between">
        <span className="text-lg font-bold text-teal-600 dark:text-teal-400">
          ₹{priceRupees}
        </span>
        {fileCount > 0 && (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {fileCount} {fileCount === 1 ? "file" : "files"}
          </span>
        )}
      </div>
    </Link>
  );
}
```

- [ ] **Step 2: Create BuyButton component**

Create `src/components/BuyButton.tsx`:
```typescript
"use client";

import { useState } from "react";

interface BuyButtonProps {
  bundleId: string;
  bundleSlug: string;
  bundleTitle: string;
  pricePaise: number;
}

export function BuyButton({
  bundleId,
  bundleSlug,
  bundleTitle,
  pricePaise,
}: BuyButtonProps) {
  const [email, setEmail] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState<{
    discount_percent: number;
  } | null>(null);
  const [couponError, setCouponError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const finalPricePaise = couponApplied
    ? Math.round(pricePaise * (1 - couponApplied.discount_percent / 100))
    : pricePaise;

  async function handleApplyCoupon() {
    if (!couponCode.trim()) return;
    setCouponError("");
    const res = await fetch("/api/coupons/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: couponCode.trim() }),
    });
    const data = await res.json();
    if (data.valid) {
      setCouponApplied({ discount_percent: data.discount_percent });
    } else {
      setCouponError(data.reason || "Invalid coupon");
      setCouponApplied(null);
    }
  }

  async function handlePurchase() {
    if (!email.trim()) return;
    setLoading(true);

    // Free order (100% discount)
    if (finalPricePaise === 0) {
      const res = await fetch("/api/bundles/free-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bundle_id: bundleId,
          buyer_email: email.trim(),
          coupon_code: couponCode.trim(),
        }),
      });
      const data = await res.json();
      if (data.download_token) {
        window.location.href = `/bundles/${bundleSlug}/download?token=${data.download_token}`;
      }
      setLoading(false);
      return;
    }

    // Paid order — create Razorpay order
    const res = await fetch("/api/razorpay/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bundle_id: bundleId,
        buyer_email: email.trim(),
        coupon_code: couponCode.trim() || undefined,
      }),
    });
    const data = await res.json();

    if (!data.razorpay_order_id) {
      setLoading(false);
      return;
    }

    // Open Razorpay checkout
    const options = {
      key: data.key_id,
      amount: data.amount_paise,
      currency: "INR",
      name: "JK Aspirant",
      description: bundleTitle,
      order_id: data.razorpay_order_id,
      prefill: { email: email.trim() },
      handler: function (response: { razorpay_payment_id: string }) {
        // Redirect to download page — webhook will have updated order by now
        window.location.href = `/bundles/${bundleSlug}/download?token=${data.razorpay_order_id}&payment_id=${response.razorpay_payment_id}`;
      },
      modal: {
        ondismiss: function () {
          setLoading(false);
        },
      },
    };

    const rzp = new (window as any).Razorpay(options);
    rzp.open();
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="w-full rounded-md bg-teal-600 px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-teal-700"
      >
        Buy Now — ₹{pricePaise / 100}
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 dark:bg-gray-900">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Purchase {bundleTitle}
            </h3>

            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Download link will be sent to this email.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Coupon code (optional)
                </label>
                <div className="mt-1 flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => {
                      setCouponCode(e.target.value.toUpperCase());
                      setCouponApplied(null);
                      setCouponError("");
                    }}
                    placeholder="e.g. SHARE50"
                    className="block flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                  >
                    Apply
                  </button>
                </div>
                {couponApplied && (
                  <p className="mt-1 text-xs text-green-600 dark:text-green-400">
                    {couponApplied.discount_percent}% discount applied!
                  </p>
                )}
                {couponError && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                    {couponError}
                  </p>
                )}
              </div>

              <div className="rounded-md bg-gray-50 p-3 dark:bg-gray-800">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Total
                  </span>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    {finalPricePaise === 0
                      ? "FREE"
                      : `₹${finalPricePaise / 100}`}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={handlePurchase}
                disabled={!email.trim() || loading}
                className="flex-1 rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-50"
              >
                {loading
                  ? "Processing..."
                  : finalPricePaise === 0
                  ? "Get Free Download"
                  : `Pay ₹${finalPricePaise / 100}`}
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
```

- [ ] **Step 3: Create DownloadFileList component**

Create `src/components/DownloadFileList.tsx`:
```typescript
interface DownloadFile {
  fileName: string;
  url: string;
  fileSizeKb: number | null;
}

interface DownloadFileListProps {
  files: DownloadFile[];
}

export function DownloadFileList({ files }: DownloadFileListProps) {
  return (
    <div className="space-y-3">
      {files.map((file, index) => (
        <div
          key={index}
          className="flex items-center justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-800"
        >
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {file.fileName}
            </p>
            {file.fileSizeKb && (
              <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                {file.fileSizeKb > 1024
                  ? `${(file.fileSizeKb / 1024).toFixed(1)} MB`
                  : `${file.fileSizeKb} KB`}
              </p>
            )}
          </div>
          <a
            href={file.url}
            download
            className="shrink-0 rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-teal-700"
          >
            Download
          </a>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/components/BundleCard.tsx src/components/BuyButton.tsx src/components/DownloadFileList.tsx
git commit -m "feat: add BundleCard, BuyButton with Razorpay checkout, and DownloadFileList components"
```

---

### Task 6: Public Pages (Listing, Detail, Download)

**Files:**
- Create: `src/app/bundles/page.tsx`
- Create: `src/app/bundles/[slug]/page.tsx`
- Create: `src/app/bundles/[slug]/download/page.tsx`

- [ ] **Step 1: Create bundles listing page**

Create `src/app/bundles/page.tsx`:
```typescript
import { Metadata } from "next";
import { BundleCard } from "@/components/BundleCard";
import { Breadcrumb } from "@/components/Breadcrumb";
import { buildMetadata, buildBreadcrumbJsonLd } from "@/lib/seo";
import { getAllBundles } from "@/lib/queries/bundles";

export const metadata: Metadata = buildMetadata({
  title: "Exam Resources — PDF Packs",
  description:
    "Download JKSSB and JKPSC exam preparation packs — previous papers, notes, question banks, and more.",
  canonicalPath: "/bundles",
  keywords: ["JKSSB PDF", "JKPSC study material", "JKSSB previous papers download"],
});

export default async function BundlesPage() {
  const bundles = await getAllBundles();
  const breadcrumbItems = [{ name: "Resources", path: "/bundles" }];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildBreadcrumbJsonLd(breadcrumbItems)),
        }}
      />
      <Breadcrumb items={breadcrumbItems} />

      <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
        Exam Resources
      </h1>
      <p className="mt-2 text-gray-600 dark:text-gray-400">
        Curated PDF packs to help you prepare — previous papers, notes, and question banks.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {bundles.map((bundle) => (
          <BundleCard key={bundle.id} bundle={bundle} />
        ))}
      </div>

      {bundles.length === 0 && (
        <p className="mt-8 text-center text-gray-500 dark:text-gray-400">
          No resources available yet. Check back soon.
        </p>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Create bundle detail page**

Create `src/app/bundles/[slug]/page.tsx`:
```typescript
import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import { Breadcrumb } from "@/components/Breadcrumb";
import { BuyButton } from "@/components/BuyButton";
import { buildMetadata, buildBreadcrumbJsonLd } from "@/lib/seo";
import { getBundleBySlug, getBundleSlugs } from "@/lib/queries/bundles";

interface PageProps {
  params: { slug: string };
}

export async function generateStaticParams() {
  const slugs = await getBundleSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const bundle = await getBundleBySlug(params.slug);
  if (!bundle) return {};
  return buildMetadata({
    title: bundle.seo_title || `${bundle.title} — ₹${bundle.price_paise / 100}`,
    description: bundle.seo_description || `Download ${bundle.title} — exam preparation pack for JKSSB/JKPSC candidates.`,
    canonicalPath: `/bundles/${bundle.slug}`,
    keywords: bundle.focus_keyword ? [bundle.focus_keyword] : undefined,
    ogImage: bundle.cover_image_url || undefined,
  });
}

export default async function BundleDetailPage({ params }: PageProps) {
  const bundle = await getBundleBySlug(params.slug);
  if (!bundle) notFound();

  const files = bundle.files || [];
  const totalSizeKb = files.reduce((sum, f) => sum + (f.file_size_kb || 0), 0);

  const breadcrumbItems = [
    { name: "Resources", path: "/bundles" },
    { name: bundle.title, path: `/bundles/${bundle.slug}` },
  ];

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      <div className="mx-auto max-w-3xl px-4 py-8">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(buildBreadcrumbJsonLd(breadcrumbItems)),
          }}
        />
        <Breadcrumb items={breadcrumbItems} />

        {bundle.exam && (
          <Link
            href={`/exams/${bundle.exam.slug}`}
            className="mb-2 inline-block text-sm text-teal-600 hover:text-teal-700 dark:text-teal-400"
          >
            {bundle.exam.title} &rarr;
          </Link>
        )}

        <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
          {bundle.title}
        </h1>

        {bundle.description && (
          <div
            className="prose prose-gray mt-4 max-w-none dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: bundle.description }}
          />
        )}

        {/* File list preview */}
        {files.length > 0 && (
          <div className="mt-6">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Included files ({files.length})
            </h2>
            <ul className="mt-2 space-y-1">
              {files.map((file) => (
                <li
                  key={file.id}
                  className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"
                >
                  <svg className="h-4 w-4 shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                  {file.file_name}
                  {file.file_size_kb && (
                    <span className="text-xs text-gray-400">
                      ({file.file_size_kb > 1024 ? `${(file.file_size_kb / 1024).toFixed(1)} MB` : `${file.file_size_kb} KB`})
                    </span>
                  )}
                </li>
              ))}
            </ul>
            {totalSizeKb > 0 && (
              <p className="mt-2 text-xs text-gray-400">
                Total: {totalSizeKb > 1024 ? `${(totalSizeKb / 1024).toFixed(1)} MB` : `${totalSizeKb} KB`}
              </p>
            )}
          </div>
        )}

        {/* Buy button */}
        <div className="mt-8">
          <BuyButton
            bundleId={bundle.id}
            bundleSlug={bundle.slug}
            bundleTitle={bundle.title}
            pricePaise={bundle.price_paise}
          />
        </div>
      </div>
    </>
  );
}
```

- [ ] **Step 3: Create download page**

Create `src/app/bundles/[slug]/download/page.tsx`:
```typescript
import Link from "next/link";
import { DownloadFileList } from "@/components/DownloadFileList";
import {
  getOrderByToken,
  getBundleFiles,
  createSignedDownloadUrls,
} from "@/lib/queries/bundles";

interface PageProps {
  params: { slug: string };
  searchParams: { token?: string };
}

export default async function DownloadPage({ params, searchParams }: PageProps) {
  const { token } = searchParams;

  if (!token) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Invalid link
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          This download link is not valid.
        </p>
        <Link href="/bundles" className="mt-4 inline-block text-sm font-medium text-teal-600 hover:text-teal-700 dark:text-teal-400">
          Browse resources &rarr;
        </Link>
      </div>
    );
  }

  const order = await getOrderByToken(token);

  if (!order) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Download not found
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          This download link is invalid or the order is still being processed.
          Please check your email or try again in a moment.
        </p>
      </div>
    );
  }

  // Check expiry
  if (new Date(order.token_expires_at) < new Date()) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Link expired
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          This download link has expired. Contact us for help.
        </p>
        <a
          href="https://t.me/jkaspirant"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-block rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
        >
          Contact on Telegram
        </a>
      </div>
    );
  }

  // Generate signed URLs
  const files = await getBundleFiles(order.bundle_id!);
  const downloadFiles = await createSignedDownloadUrls(files);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-900/20">
        <p className="text-sm font-medium text-green-800 dark:text-green-300">
          Your download is ready! Links are valid for 1 hour.
        </p>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        {order.bundle?.title || "Your Downloads"}
      </h1>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        Sent to {order.buyer_email}
      </p>

      <div className="mt-6">
        <DownloadFileList files={downloadFiles} />
      </div>

      <p className="mt-6 text-xs text-gray-400">
        Download link expires{" "}
        {new Date(order.token_expires_at).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "long",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
        })}
        . Check your email for a backup link.
      </p>
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/app/bundles/
git commit -m "feat: add bundles listing, detail with Razorpay checkout, and download pages"
```

---

### Task 7: Admin Pages (Bundles, Orders, Coupons)

**Files:**
- Create: `src/app/admin/bundles/page.tsx`
- Create: `src/app/admin/orders/page.tsx`
- Create: `src/app/admin/coupons/page.tsx`
- Modify: `src/components/admin/AdminSidebar.tsx`
- Modify: `src/lib/queries/admin.ts`

- [ ] **Step 1: Add admin queries for bundles, orders, coupons**

Add to the end of `src/lib/queries/admin.ts`:
```typescript
import type { Bundle, BundleFile, Order, Coupon } from "@/lib/types/database";

// --- Bundles ---
export async function getAdminBundles(): Promise<(Bundle & { files?: BundleFile[] })[]> {
  const { data, error } = await supabase.from("bundles").select("*, files:bundle_files(*), exam:exams(slug, title)").order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function upsertBundle(bundle: Partial<Bundle> & { title: string; slug: string; price_paise: number }): Promise<Bundle> {
  const { data, error } = await supabase.from("bundles").upsert(bundle, { onConflict: "id" }).select().single();
  if (error) throw error;
  return data;
}

export async function deleteBundle(id: string): Promise<void> {
  const { error } = await supabase.from("bundles").delete().eq("id", id);
  if (error) throw error;
}

export async function uploadBundleFile(file: File, storagePath: string): Promise<string> {
  const { data, error } = await supabase.storage.from("bundles").upload(storagePath, file, { upsert: true });
  if (error) throw error;
  return data.path;
}

export async function insertBundleFile(bundleFile: { bundle_id: string; file_name: string; storage_path: string; file_size_kb: number | null; sort_order: number }): Promise<BundleFile> {
  const { data, error } = await supabase.from("bundle_files").insert(bundleFile).select().single();
  if (error) throw error;
  return data;
}

export async function deleteBundleFile(id: string): Promise<void> {
  const { error } = await supabase.from("bundle_files").delete().eq("id", id);
  if (error) throw error;
}

// --- Orders ---
export async function getAdminOrders(): Promise<Order[]> {
  const { data, error } = await supabase.from("orders").select("*, bundle:bundles(title, slug), coupon:coupons(code)").order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

// --- Coupons ---
export async function getAdminCoupons(): Promise<Coupon[]> {
  const { data, error } = await supabase.from("coupons").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function upsertCoupon(coupon: Partial<Coupon> & { code: string; discount_percent: number }): Promise<Coupon> {
  const { data, error } = await supabase.from("coupons").upsert({ ...coupon, code: coupon.code.toUpperCase() }, { onConflict: "id" }).select().single();
  if (error) throw error;
  return data;
}

export async function deleteCoupon(id: string): Promise<void> {
  const { error } = await supabase.from("coupons").delete().eq("id", id);
  if (error) throw error;
}
```

Note: The existing import at the top of admin.ts already imports from `@/lib/types/database`, so add `Bundle, BundleFile, Order, Coupon` to that import list.

- [ ] **Step 2: Update AdminSidebar with new nav items**

In `src/components/admin/AdminSidebar.tsx`, update the `navItems` array to add:
```typescript
const navItems = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/notifications", label: "Notifications" },
  { href: "/admin/exams", label: "Exams" },
  { href: "/admin/papers", label: "Papers" },
  { href: "/admin/cutoffs", label: "Cut-offs" },
  { href: "/admin/syllabus", label: "Syllabus" },
  { href: "/admin/dates", label: "Exam Dates" },
  { href: "/admin/bundles", label: "Bundles" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/coupons", label: "Coupons" },
];
```

- [ ] **Step 3: Create admin bundles manager page**

Create `src/app/admin/bundles/page.tsx`:
```typescript
"use client";

import { useEffect, useState } from "react";
import { AdminAuthGuard } from "@/components/admin/AdminAuthGuard";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { getAdminBundles, getAdminExams, upsertBundle, deleteBundle, uploadBundleFile, insertBundleFile, deleteBundleFile } from "@/lib/queries/admin";
import type { Bundle, BundleFile, Exam } from "@/lib/types/database";

export default function AdminBundlesPage() {
  const [bundles, setBundles] = useState<(Bundle & { files?: BundleFile[] })[]>([]);
  const [exams, setExams] = useState<Pick<Exam, "id" | "title">[]>([]);
  const [editing, setEditing] = useState<Bundle | null>(null);
  const [creating, setCreating] = useState(false);

  function loadData() { getAdminBundles().then(setBundles); getAdminExams().then(setExams); }
  useEffect(() => { loadData(); }, []);

  async function handleDelete(id: string) { if (!confirm("Delete this bundle and all its files?")) return; await deleteBundle(id); loadData(); }

  return (
    <AdminAuthGuard>
      <div className="flex min-h-screen">
        <AdminSidebar />
        <div className="flex-1 p-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Bundles</h1>
            <button onClick={() => { setCreating(true); setEditing(null); }} className="rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700">New Bundle</button>
          </div>

          {(creating || editing) && (
            <BundleForm exams={exams} bundle={editing} onSaved={() => { setCreating(false); setEditing(null); loadData(); }} onCancel={() => { setCreating(false); setEditing(null); }} />
          )}

          <div className="mt-4 overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr><th className="px-4 py-3 text-left font-semibold">Title</th><th className="px-4 py-3 text-left font-semibold">Price</th><th className="px-4 py-3 text-left font-semibold">Files</th><th className="px-4 py-3 text-left font-semibold">Status</th><th className="px-4 py-3 text-left font-semibold">Actions</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {bundles.map((b) => (
                  <tr key={b.id}>
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{b.title}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">₹{b.price_paise / 100}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{b.files?.length || 0} files</td>
                    <td className="px-4 py-3"><span className={`rounded px-2 py-0.5 text-xs font-medium ${b.is_active ? "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-gray-100 text-gray-600"}`}>{b.is_active ? "Active" : "Inactive"}</span></td>
                    <td className="space-x-2 px-4 py-3">
                      <button onClick={() => { setEditing(b); setCreating(false); }} className="text-xs font-medium text-teal-600 hover:text-teal-700">Edit</button>
                      <button onClick={() => handleDelete(b.id)} className="text-xs font-medium text-red-600 hover:text-red-700">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminAuthGuard>
  );
}

function BundleForm({ exams, bundle, onSaved, onCancel }: { exams: Pick<Exam, "id" | "title">[]; bundle: Bundle | null; onSaved: () => void; onCancel: () => void }) {
  const [title, setTitle] = useState(bundle?.title || "");
  const [slug, setSlug] = useState(bundle?.slug || "");
  const [description, setDescription] = useState(bundle?.description || "");
  const [priceRupees, setPriceRupees] = useState(bundle ? (bundle.price_paise / 100).toString() : "");
  const [examId, setExamId] = useState(bundle?.exam_id || "");
  const [saving, setSaving] = useState(false);
  const [files, setFiles] = useState<FileList | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const saved = await upsertBundle({
      ...(bundle?.id ? { id: bundle.id } : {}),
      title, slug,
      description: description || null,
      price_paise: Math.round(parseFloat(priceRupees) * 100),
      exam_id: examId || null,
    });

    // Upload new files if any
    if (files) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const storagePath = `${saved.id}/${file.name}`;
        const path = await uploadBundleFile(file, storagePath);
        await insertBundleFile({
          bundle_id: saved.id,
          file_name: file.name,
          storage_path: path,
          file_size_kb: Math.round(file.size / 1024),
          sort_order: i,
        });
      }
    }

    setSaving(false);
    onSaved();
  }

  return (
    <div className="mt-4 rounded-lg border border-gray-200 p-4 dark:border-gray-800">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Title</label><input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} onBlur={() => !slug && setSlug(title.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-"))} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white" /></div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Slug</label><input type="text" required value={slug} onChange={(e) => setSlug(e.target.value)} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white" /></div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Price (₹)</label><input type="number" required min="0" step="1" value={priceRupees} onChange={(e) => setPriceRupees(e.target.value)} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white" /></div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Exam (optional)</label><select value={examId} onChange={(e) => setExamId(e.target.value)} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"><option value="">None</option>{exams.map((e) => <option key={e.id} value={e.id}>{e.title}</option>)}</select></div>
        </div>
        <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description (HTML)</label><textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white" /></div>
        <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Upload PDF files</label><input type="file" accept="application/pdf" multiple onChange={(e) => setFiles(e.target.files)} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:rounded-md file:border-0 file:bg-teal-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-teal-700" /></div>
        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-50">{saving ? "Saving..." : "Save"}</button>
          <button type="button" onClick={onCancel} className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300">Cancel</button>
        </div>
      </form>
    </div>
  );
}
```

- [ ] **Step 4: Create admin orders page**

Create `src/app/admin/orders/page.tsx`:
```typescript
"use client";

import { useEffect, useState } from "react";
import { AdminAuthGuard } from "@/components/admin/AdminAuthGuard";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { getAdminOrders } from "@/lib/queries/admin";
import type { Order } from "@/lib/types/database";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => { getAdminOrders().then(setOrders); }, []);

  return (
    <AdminAuthGuard>
      <div className="flex min-h-screen">
        <AdminSidebar />
        <div className="flex-1 p-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Orders</h1>

          <div className="mt-4 overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr><th className="px-4 py-3 text-left font-semibold">Email</th><th className="px-4 py-3 text-left font-semibold">Bundle</th><th className="px-4 py-3 text-left font-semibold">Amount</th><th className="px-4 py-3 text-left font-semibold">Status</th><th className="px-4 py-3 text-left font-semibold">Coupon</th><th className="px-4 py-3 text-left font-semibold">Date</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {orders.map((o) => (
                  <tr key={o.id}>
                    <td className="px-4 py-3 text-gray-900 dark:text-white">{o.buyer_email}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{o.bundle?.title || "—"}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{o.amount_paid_paise === 0 ? "Free" : `₹${o.amount_paid_paise / 100}`}</td>
                    <td className="px-4 py-3"><span className={`rounded px-2 py-0.5 text-xs font-medium ${o.status === "paid" ? "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400" : o.status === "free" ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" : "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"}`}>{o.status}</span></td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{o.coupon?.code || "—"}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{new Date(o.created_at).toLocaleDateString("en-IN")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {orders.length === 0 && <p className="p-4 text-center text-sm text-gray-500">No orders yet.</p>}
          </div>
        </div>
      </div>
    </AdminAuthGuard>
  );
}
```

- [ ] **Step 5: Create admin coupons page**

Create `src/app/admin/coupons/page.tsx`:
```typescript
"use client";

import { useEffect, useState } from "react";
import { AdminAuthGuard } from "@/components/admin/AdminAuthGuard";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { getAdminCoupons, upsertCoupon, deleteCoupon } from "@/lib/queries/admin";
import type { Coupon } from "@/lib/types/database";

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [creating, setCreating] = useState(false);

  function loadData() { getAdminCoupons().then(setCoupons); }
  useEffect(() => { loadData(); }, []);

  async function handleDelete(id: string) { if (!confirm("Delete this coupon?")) return; await deleteCoupon(id); loadData(); }

  return (
    <AdminAuthGuard>
      <div className="flex min-h-screen">
        <AdminSidebar />
        <div className="flex-1 p-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Coupons</h1>
            <button onClick={() => setCreating(true)} className="rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700">New Coupon</button>
          </div>

          {creating && (
            <CouponForm onSaved={() => { setCreating(false); loadData(); }} onCancel={() => setCreating(false)} />
          )}

          <div className="mt-4 overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr><th className="px-4 py-3 text-left font-semibold">Code</th><th className="px-4 py-3 text-left font-semibold">Discount</th><th className="px-4 py-3 text-left font-semibold">Used</th><th className="px-4 py-3 text-left font-semibold">Max</th><th className="px-4 py-3 text-left font-semibold">Expires</th><th className="px-4 py-3 text-left font-semibold">Actions</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {coupons.map((c) => (
                  <tr key={c.id}>
                    <td className="px-4 py-3 font-mono font-medium text-gray-900 dark:text-white">{c.code}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{c.discount_percent}%</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{c.times_used}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{c.max_uses ?? "∞"}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{c.expires_at ? new Date(c.expires_at).toLocaleDateString("en-IN") : "Never"}</td>
                    <td className="px-4 py-3"><button onClick={() => handleDelete(c.id)} className="text-xs font-medium text-red-600 hover:text-red-700">Delete</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminAuthGuard>
  );
}

function CouponForm({ onSaved, onCancel }: { onSaved: () => void; onCancel: () => void }) {
  const [code, setCode] = useState(""); const [discountPercent, setDiscountPercent] = useState(""); const [maxUses, setMaxUses] = useState(""); const [expiresAt, setExpiresAt] = useState(""); const [saving, setSaving] = useState(false);
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setSaving(true);
    await upsertCoupon({ code: code.toUpperCase(), discount_percent: parseInt(discountPercent, 10), max_uses: maxUses ? parseInt(maxUses, 10) : null, expires_at: expiresAt || null });
    setSaving(false); onSaved();
  }
  return (
    <div className="mt-4 rounded-lg border border-gray-200 p-4 dark:border-gray-800">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-4">
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Code</label><input type="text" required value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="SHARE50" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm font-mono dark:border-gray-700 dark:bg-gray-900 dark:text-white" /></div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Discount %</label><input type="number" required min="0" max="100" value={discountPercent} onChange={(e) => setDiscountPercent(e.target.value)} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white" /></div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Max uses</label><input type="number" min="1" value={maxUses} onChange={(e) => setMaxUses(e.target.value)} placeholder="Unlimited" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white" /></div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Expires</label><input type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white" /></div>
        </div>
        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-50">{saving ? "Saving..." : "Save"}</button>
          <button type="button" onClick={onCancel} className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300">Cancel</button>
        </div>
      </form>
    </div>
  );
}
```

- [ ] **Step 6: Commit**

```bash
git add src/app/admin/bundles/ src/app/admin/orders/ src/app/admin/coupons/ src/components/admin/AdminSidebar.tsx src/lib/queries/admin.ts
git commit -m "feat: add admin pages for bundles, orders, and coupons management"
```

---

### Task 8: Integrate with Homepage & Navigation

**Files:**
- Modify: `src/components/Header.tsx`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Add Resources link to header navigation**

In `src/components/Header.tsx`, update the `navLinks` array:
```typescript
const navLinks = [
  { href: "/exams", label: "Exams" },
  { href: "/bundles", label: "Resources" },
  { href: "/notifications", label: "Notifications" },
];
```

- [ ] **Step 2: Add featured bundles section to homepage**

In `src/app/page.tsx`, add import and section. Add to the imports:
```typescript
import { BundleCard } from "@/components/BundleCard";
import { getAllBundles } from "@/lib/queries/bundles";
```

Update the data fetch:
```typescript
const [exams, notifications, bundles] = await Promise.all([
  getAllExams(),
  getLatestNotifications(5),
  getAllBundles(),
]);
```

Add a new section after the Exams section (before the closing `</div>`):
```tsx
{bundles.length > 0 && (
  <section className="mt-10">
    <div className="flex items-center justify-between">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
        Study Resources
      </h2>
      <Link
        href="/bundles"
        className="text-sm font-medium text-teal-600 hover:text-teal-700 dark:text-teal-400"
      >
        View all &rarr;
      </Link>
    </div>
    <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {bundles.slice(0, 3).map((bundle) => (
        <BundleCard key={bundle.id} bundle={bundle} />
      ))}
    </div>
  </section>
)}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/Header.tsx src/app/page.tsx
git commit -m "feat: add Resources nav link and featured bundles on homepage"
```

---

### Task 9: Build Verification

- [ ] **Step 1: Run build**

```bash
npm run build
```

Expected: Build succeeds with new bundle routes:
- `/bundles` (SSG)
- `/bundles/[slug]` (SSG)
- `/bundles/[slug]/download` (Dynamic)
- `/api/razorpay/create-order` (Dynamic)
- `/api/razorpay/webhook` (Dynamic)
- `/api/coupons/validate` (Dynamic)
- `/api/bundles/free-order` (Dynamic)
- `/admin/bundles`, `/admin/orders`, `/admin/coupons` (Static client)

- [ ] **Step 2: Fix any type errors and rebuild if needed**

- [ ] **Step 3: Final commit**

```bash
git add -A
git commit -m "feat: complete PDF bundles feature — Razorpay checkout, email delivery, coupon system"
```

---

## Post-Implementation Setup

After deploying, these manual steps are needed:

1. **Razorpay:** Create account at razorpay.com, get API keys, set webhook URL to `https://jkaspirant.tech/api/razorpay/webhook` with event `payment.captured`
2. **Resend:** Create account at resend.com, get API key, verify sending domain
3. **Supabase:** Run `003_create_bundle_tables.sql` and `004_bundle_rls.sql` in SQL Editor. Create private `bundles` storage bucket
4. **Vercel:** Add `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`, `NEXT_PUBLIC_RAZORPAY_KEY_ID`, `RESEND_API_KEY` env vars
5. **Create first bundle** via admin CRM at `/admin/bundles`
