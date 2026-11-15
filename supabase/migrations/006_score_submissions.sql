-- Crowd-sourced score submissions for rank predictor tools.
-- Writes and reads go through the Next.js API (service role); no public access.

create table if not exists score_submissions (
  id           uuid primary key default gen_random_uuid(),
  exam_key     text not null,
  device_id    text not null,
  ip_hash      text,
  category     text not null,
  correct      int  not null check (correct >= 0),
  wrong        int  not null check (wrong >= 0),
  score        numeric(6,2) not null,
  source       text not null default 'self_estimate' check (source in ('self_estimate', 'answer_key')),
  created_at   timestamptz default now(),
  updated_at   timestamptz default now(),
  unique (exam_key, device_id)
);

create index if not exists score_submissions_exam_score_idx on score_submissions (exam_key, score desc);
create index if not exists score_submissions_ip_idx on score_submissions (exam_key, ip_hash, updated_at);

alter table score_submissions enable row level security;
-- No policies: only the service role (server) can read/write.

-- Aggregate stats for one score in one call.
create or replace function rank_stats(p_exam text, p_score numeric, p_category text, p_cutoff_index int)
returns json
language sql
stable
as $$
  select json_build_object(
    'total',      (select count(*) from score_submissions where exam_key = p_exam),
    'above',      (select count(*) from score_submissions where exam_key = p_exam and score > p_score),
    'catTotal',   (select count(*) from score_submissions where exam_key = p_exam and category = p_category),
    'catAbove',   (select count(*) from score_submissions where exam_key = p_exam and category = p_category and score > p_score),
    'cutoffScore',(select score from score_submissions where exam_key = p_exam
                     order by score desc offset greatest(p_cutoff_index, 0) limit 1),
    'histogram',  coalesce((
                    select json_agg(json_build_object('bucket', bucket, 'count', c) order by bucket)
                    from (
                      select (floor(score / 5) * 5)::int as bucket, count(*) as c
                      from score_submissions where exam_key = p_exam
                      group by 1
                    ) h
                  ), '[]'::json)
  );
$$;

revoke all on function rank_stats(text, numeric, text, int) from public, anon, authenticated;
