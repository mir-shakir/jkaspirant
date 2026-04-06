-- RESOURCES
create table if not exists resources (
  id              uuid primary key default gen_random_uuid(),
  title           text not null,
  description     text,
  resource_type   text not null
                  check (resource_type in ('notes', 'book', 'official_link', 'external_link', 'guide', 'bundle', 'previous_paper')),
  exam_id         uuid references exams(id) on delete set null,
  url             text not null,
  source_label    text,
  cta_label       text,
  is_external     boolean default true,
  is_premium      boolean default false,
  is_featured     boolean default false,
  is_active       boolean default true,
  sort_order      int default 0,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

create index if not exists idx_resources_exam on resources(exam_id);
create index if not exists idx_resources_type on resources(resource_type);
create index if not exists idx_resources_featured on resources(is_featured, sort_order);
create index if not exists idx_resources_active on resources(is_active, sort_order);

create trigger resources_updated_at before update on resources
  for each row execute function update_updated_at();

alter table resources enable row level security;

create policy "Public can read active resources"
  on resources for select using (is_active = true);

create policy "Authenticated can read resources"
  on resources for select to authenticated using (true);

create policy "Authenticated can insert resources"
  on resources for insert to authenticated with check (true);

create policy "Authenticated can update resources"
  on resources for update to authenticated using (true) with check (true);

create policy "Authenticated can delete resources"
  on resources for delete to authenticated using (true);
