-- Visitor feedback: wrong information, feature requests, complaints.
-- Writes go through the Next.js API (service role); no public access.

create table if not exists feedback (
  id          uuid primary key default gen_random_uuid(),
  kind        text not null check (kind in ('wrong_info', 'feature', 'complaint', 'other')),
  message     text not null check (char_length(message) between 5 and 2000),
  page        text,
  contact     text check (contact is null or char_length(contact) <= 120),
  ip_hash     text,
  status      text not null default 'new' check (status in ('new', 'seen', 'done', 'spam')),
  created_at  timestamptz not null default now()
);

create index if not exists feedback_status_created_idx on feedback (status, created_at desc);
create index if not exists feedback_ip_idx on feedback (ip_hash, created_at);

alter table feedback enable row level security;
-- No policies: only the service role (server) can read/write.

revoke all on table feedback from anon, authenticated;
