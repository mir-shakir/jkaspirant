-- Keep the full name of people who join the leaderboard (private; the site
-- only ever shows the masked form in display_name). Run once in the SQL Editor.

alter table score_submissions add column if not exists full_name text;

notify pgrst, 'reload schema';
