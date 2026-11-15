#!/usr/bin/env node
// Upsert one notification into Supabase, revalidate the site, optionally post to Telegram.
//
// Usage:
//   node --env-file=.env.local scripts/publish-notification.mjs path/to/item.json [--publish] [--telegram]
//
// item.json:
// {
//   "slug": "jkssb-faa-answer-key-2026",          // required, kebab-case, stable (dedupe key)
//   "title": "JKSSB FAA Answer Key 2026 Released", // required
//   "category": "answer_key",                      // notification | admit_card | answer_key | result
//   "exam_slug": "finance-accounts-assistant",     // optional, must exist in exams table
//   "body": "Markdown/plain summary ...",
//   "source_url": "https://jkssb.nic.in/...pdf",   // official source, always set when available
//   "published_at": "2026-11-15T10:00:00+05:30",   // optional, defaults to now
//   "seo_title": "...", "seo_description": "...", "focus_keyword": "..."
// }
//
// Without --publish the row is saved as a draft (is_published=false) and nothing is announced.

import { readFile } from "node:fs/promises";
import { createClient } from "@supabase/supabase-js";

const CATEGORIES = ["notification", "admit_card", "answer_key", "result"];

const args = process.argv.slice(2);
const file = args.find((a) => !a.startsWith("--"));
const publish = args.includes("--publish");
const telegram = args.includes("--telegram");

if (!file) {
  console.error("Usage: publish-notification.mjs <item.json> [--publish] [--telegram]");
  process.exit(1);
}

const env = (name, required = true) => {
  const v = process.env[name];
  if (required && !v) {
    console.error(`Missing env var ${name} (run with --env-file=.env.local)`);
    process.exit(1);
  }
  return v;
};

const item = JSON.parse(await readFile(file, "utf8"));
if (!item.slug || !item.title) throw new Error("slug and title are required");
if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(item.slug)) throw new Error(`bad slug: ${item.slug}`);
if (item.category && !CATEGORIES.includes(item.category)) {
  throw new Error(`category must be one of ${CATEGORIES.join(", ")}`);
}

const supabase = createClient(env("NEXT_PUBLIC_SUPABASE_URL"), env("SUPABASE_SERVICE_ROLE_KEY"), {
  auth: { persistSession: false },
});

let exam_id = null;
if (item.exam_slug) {
  const { data, error } = await supabase.from("exams").select("id").eq("slug", item.exam_slug).maybeSingle();
  if (error) throw error;
  if (!data) throw new Error(`exam not found: ${item.exam_slug}`);
  exam_id = data.id;
}

const { data: existing } = await supabase
  .from("notifications")
  .select("id, is_published")
  .eq("slug", item.slug)
  .maybeSingle();

const row = {
  slug: item.slug,
  title: item.title,
  body: item.body ?? null,
  source_url: item.source_url ?? null,
  exam_id,
  category: item.category ?? "notification",
  published_at: item.published_at ?? new Date().toISOString(),
  is_published: publish || existing?.is_published || false,
  seo_title: item.seo_title ?? null,
  seo_description: item.seo_description ?? null,
  focus_keyword: item.focus_keyword ?? null,
  auto_fetched: true,
  updated_at: new Date().toISOString(),
};

const { error: upsertError } = await supabase.from("notifications").upsert(row, { onConflict: "slug" });
if (upsertError) throw upsertError;
console.log(`${existing ? "updated" : "inserted"}: ${item.slug} (published=${row.is_published})`);

if (!row.is_published) process.exit(0);

// Revalidate affected pages
const siteUrl = env("NEXT_PUBLIC_SITE_URL");
const secret = env("VERCEL_REVALIDATION_SECRET");
for (const path of ["/", "/notifications", `/notifications/${item.slug}`]) {
  const res = await fetch(`${siteUrl}/api/revalidate`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-revalidation-secret": secret },
    body: JSON.stringify({ path }),
  });
  console.log(`revalidate ${path}: ${res.status}`);
}

// Announce only on first publish, never on edits
const firstPublish = !existing?.is_published;
if (telegram && firstPublish) {
  const token = env("TELEGRAM_BOT_TOKEN");
  const chat = env("TELEGRAM_CHANNEL_ID");
  const url = `${siteUrl}/notifications/${item.slug}`;
  const text = `<b>${escapeHtml(item.title)}</b>\n\n${escapeHtml(item.tg_summary ?? item.seo_description ?? "")}\n\n${url}`;
  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ chat_id: chat, text, parse_mode: "HTML" }),
  });
  console.log(`telegram: ${res.status}`);
} else if (telegram) {
  console.log("telegram: skipped (already announced)");
}

function escapeHtml(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
