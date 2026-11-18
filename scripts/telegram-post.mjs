// Post new site updates to the Telegram channel, once each, only after they are live.
//
// It reads the LIVE site (sitemap + each update page's meta tags), so nothing is posted
// before the owner has merged it and Vercel has deployed it.
//
//   node --env-file=.env.local scripts/telegram-post.mjs            # dry run: show what would be posted
//   node --env-file=.env.local scripts/telegram-post.mjs --send     # post new updates (max 3 per run)
//   node --env-file=.env.local scripts/telegram-post.mjs --init     # mark everything live now as already posted
//   ... --only <slug> [--force]                                     # limit to one update (--force re-posts it)
//
// Env: TELEGRAM_BOT_TOKEN, TELEGRAM_CHANNEL_ID (@channel_username or -100… id),
//      optional TELEGRAM_STATE_FILE (default ../notes/telegram-posted.json), NEXT_PUBLIC_SITE_URL.

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repo = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const site = (process.env.NEXT_PUBLIC_SITE_URL || "https://jkaspirant.in").replace(/\/$/, "");
const stateFile = process.env.TELEGRAM_STATE_FILE || resolve(repo, "..", "notes", "telegram-posted.json");
const MAX_PER_RUN = 3;

const args = process.argv.slice(2);
const send = args.includes("--send");
const init = args.includes("--init");
const force = args.includes("--force");
const only = args.includes("--only") ? args[args.indexOf("--only") + 1] : null;

const state = existsSync(stateFile) ? JSON.parse(readFileSync(stateFile, "utf8")) : { posted: {} };

function saveState() {
  mkdirSync(dirname(stateFile), { recursive: true });
  writeFileSync(stateFile, JSON.stringify(state, null, 2) + "\n");
}

const decode = (s) =>
  s.replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
const escapeHtml = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const meta = (html, key) => {
  const m = html.match(new RegExp(`<meta (?:property|name)="${key}" content="([^"]*)"`));
  return m ? decode(m[1]) : null;
};

// 1. Live update URLs from the sitemap
const sitemap = await (await fetch(`${site}/sitemap.xml`)).text();
let slugs = [...sitemap.matchAll(/<loc>[^<]*\/notifications\/([^<\/]+)<\/loc>/g)].map((m) => m[1]);
if (only) slugs = slugs.filter((s) => s === only);
if (only && !slugs.length) {
  console.error(`"${only}" is not live on ${site} (not in the sitemap).`);
  process.exit(1);
}

const fresh = slugs.filter((s) => force || !state.posted[s]);

if (init) {
  const now = new Date().toISOString();
  for (const s of slugs) state.posted[s] ??= { at: now, sent: false };
  saveState();
  console.log(`marked ${slugs.length} live updates as already posted (nothing sent). state: ${stateFile}`);
  process.exit(0);
}

if (!fresh.length) {
  console.log("nothing new to post");
  process.exit(0);
}

// 2. Build each post from the live page
const posts = [];
for (const slug of fresh.slice(0, MAX_PER_RUN)) {
  const url = `${site}/notifications/${slug}`;
  const res = await fetch(url);
  if (res.status !== 200) {
    console.log(`skip ${slug}: page returned ${res.status}`);
    continue;
  }
  const html = await res.text();
  const title = meta(html, "og:title");
  const summary = meta(html, "og:description") || meta(html, "description") || "";
  if (!title) {
    console.log(`skip ${slug}: no title on the page`);
    continue;
  }
  const text = `<b>${escapeHtml(title)}</b>\n\n${escapeHtml(summary)}\n\nFull details and the official notice:\n${url}`;
  posts.push({ slug, url, text });
}
if (fresh.length > MAX_PER_RUN) console.log(`${fresh.length - MAX_PER_RUN} more waiting for the next run`);

if (!send) {
  for (const p of posts) console.log(`--- would post: ${p.slug}\n${p.text}\n`);
  console.log("dry run. add --send to post.");
  process.exit(0);
}

// 3. Send
const token = process.env.TELEGRAM_BOT_TOKEN;
const chat = process.env.TELEGRAM_CHANNEL_ID;
if (!token || !chat) {
  console.error("TELEGRAM_BOT_TOKEN and TELEGRAM_CHANNEL_ID must be set");
  process.exit(1);
}
for (const p of posts) {
  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ chat_id: chat, text: p.text, parse_mode: "HTML" }),
  });
  const body = await res.json();
  if (!body.ok) {
    console.error(`failed ${p.slug}: ${body.description}`);
    process.exitCode = 1;
    continue;
  }
  state.posted[p.slug] = { at: new Date().toISOString(), sent: true, message_id: body.result.message_id };
  saveState();
  console.log(`posted ${p.slug} (message ${body.result.message_id})`);
}
