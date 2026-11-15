-- ============================================================
-- 007: Bundle ↔ Exam many-to-many via junction table
-- ============================================================

-- 1. Create junction table
create table if not exists bundle_exams (
  bundle_id uuid references bundles(id) on delete cascade,
  exam_id   uuid references exams(id) on delete cascade,
  primary key (bundle_id, exam_id)
);

-- 2. Migrate existing data from bundles.exam_id
insert into bundle_exams (bundle_id, exam_id)
  select id, exam_id from bundles where exam_id is not null
  on conflict do nothing;

-- 3. Drop the old single-exam FK column
alter table bundles drop column if exists exam_id;

-- 4. Enable RLS
alter table bundle_exams enable row level security;

-- 5. Public read access
create policy "Public can read bundle_exams"
  on bundle_exams for select using (true);

-- 6. Authenticated full access
create policy "Authenticated can insert bundle_exams"
  on bundle_exams for insert to authenticated with check (true);
create policy "Authenticated can update bundle_exams"
  on bundle_exams for update to authenticated using (true) with check (true);
create policy "Authenticated can delete bundle_exams"
  on bundle_exams for delete to authenticated using (true);

-- 7. Indexes for fast lookups
create index if not exists idx_bundle_exams_bundle on bundle_exams(bundle_id);
create index if not exists idx_bundle_exams_exam on bundle_exams(exam_id);
