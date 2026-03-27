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

-- RPC to atomically increment coupon usage
create or replace function increment_coupon_usage(coupon_id uuid)
returns void as $$
begin
  update coupons set times_used = times_used + 1 where id = coupon_id;
end;
$$ language plpgsql security definer;
