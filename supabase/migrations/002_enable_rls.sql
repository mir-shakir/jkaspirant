-- Enable RLS on all tables
alter table exams enable row level security;
alter table notifications enable row level security;
alter table papers enable row level security;
alter table cutoffs enable row level security;
alter table syllabus_sections enable row level security;
alter table exam_dates enable row level security;

-- Public read for active/published content
create policy "Public can read active exams"
  on exams for select using (is_active = true);

create policy "Public can read published notifications"
  on notifications for select using (is_published = true);

create policy "Public can read published papers"
  on papers for select using (is_published = true);

create policy "Public can read cutoffs"
  on cutoffs for select using (true);

create policy "Public can read syllabus"
  on syllabus_sections for select using (true);

create policy "Public can read exam dates"
  on exam_dates for select using (true);

-- Service role bypasses RLS automatically, so no admin write policies needed
-- Admin operations use SUPABASE_SERVICE_ROLE_KEY which bypasses RLS
