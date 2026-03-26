-- EXAMS
create table if not exists exams (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,
  title         text not null,
  department    text,
  description   text,
  vacancy_count int,
  pay_scale     text,
  eligibility   text,
  is_active     boolean default true,
  seo_title       text,
  seo_description text,
  seo_keywords    text[],
  og_image_url    text,
  focus_keyword   text,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- NOTIFICATIONS
create table if not exists notifications (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,
  title         text not null,
  body          text,
  source_url    text,
  exam_id       uuid references exams(id) on delete set null,
  category      text check (category in ('result', 'admit_card', 'notification', 'answer_key')),
  published_at  timestamptz,
  is_published  boolean default false,
  seo_title       text,
  seo_description text,
  focus_keyword   text,
  auto_fetched    boolean default false,
  source_raw      text,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- PAPERS
create table if not exists papers (
  id            uuid primary key default gen_random_uuid(),
  exam_id       uuid references exams(id) on delete cascade,
  title         text not null,
  year          int,
  subject       text,
  file_url      text,
  file_size_kb  int,
  downloads     int default 0,
  is_published  boolean default true,
  seo_title       text,
  seo_description text,
  created_at    timestamptz default now()
);

-- CUTOFFS
create table if not exists cutoffs (
  id            uuid primary key default gen_random_uuid(),
  exam_id       uuid references exams(id) on delete cascade,
  year          int not null,
  category      text not null,
  cutoff_score  numeric,
  total_posts   int,
  total_applied int,
  created_at    timestamptz default now()
);

-- SYLLABUS SECTIONS
create table if not exists syllabus_sections (
  id            uuid primary key default gen_random_uuid(),
  exam_id       uuid references exams(id) on delete cascade,
  section_title text not null,
  topics        text[],
  marks_weight  int,
  sort_order    int default 0,
  created_at    timestamptz default now()
);

-- EXAM DATES
create table if not exists exam_dates (
  id            uuid primary key default gen_random_uuid(),
  exam_id       uuid references exams(id) on delete cascade,
  event_name    text not null,
  event_date    date,
  is_tentative  boolean default false,
  created_at    timestamptz default now()
);

-- Indexes for common queries
create index if not exists idx_exams_slug on exams(slug);
create index if not exists idx_exams_active on exams(is_active);
create index if not exists idx_notifications_slug on notifications(slug);
create index if not exists idx_notifications_published on notifications(is_published, published_at desc);
create index if not exists idx_papers_exam on papers(exam_id);
create index if not exists idx_cutoffs_exam_year on cutoffs(exam_id, year);
create index if not exists idx_syllabus_exam on syllabus_sections(exam_id);
create index if not exists idx_exam_dates_exam on exam_dates(exam_id);

-- Updated_at trigger function
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger exams_updated_at before update on exams
  for each row execute function update_updated_at();

create trigger notifications_updated_at before update on notifications
  for each row execute function update_updated_at();
