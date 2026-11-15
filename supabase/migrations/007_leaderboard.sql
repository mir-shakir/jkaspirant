-- Leaderboard for the rank predictor. Run once in the Supabase SQL Editor.
-- Only a masked name (e.g. "S*** M***") is stored, never the full name.

alter table score_submissions
  add column if not exists display_name text,
  add column if not exists on_leaderboard boolean not null default false;

create index if not exists score_submissions_board_idx
  on score_submissions (exam_key, score desc)
  where on_leaderboard;

create index if not exists score_submissions_ip_created_idx
  on score_submissions (exam_key, ip_hash, created_at);

notify pgrst, 'reload schema';
