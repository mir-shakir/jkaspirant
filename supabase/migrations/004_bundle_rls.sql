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
