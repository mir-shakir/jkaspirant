// Post new site updates to our Telegram channels, once each per channel, only after they are live.
//
// It reads the LIVE site (sitemap + each update page's meta tags), so nothing is posted
// before it is merged and deployed.
//
//   node --env-file=.env.local scripts/telegram-post.mjs                  # dry run: show what would be posted
//   node --env-file=.env.local scripts/telegram-post.mjs --send           # post new updates (max 3 per channel per run)
//   node --env-file=.env.local scripts/telegram-post.mjs --init --channel @name   # mark everything live as already posted in one channel
//   ... --only <slug> [--force] [--channel @name]                         # limit to one update / one channel (--force re-posts)
//
// Channels: ops/telegram-channels.json (falls back to TELEGRAM_CHANNEL_ID). A channel that is
// new to the state file starts from now: everything already live is marked as posted for it.
// Env: TELEGRAM_BOT_TOKEN, optional TELEGRAM_STATE_FILE (default ops/telegram-posted.json,
// committed so cloud runs share it), NEXT_PUBLIC_SITE_URL.

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repo = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const site = (process.env.NEXT_PUBLIC_SITE_URL || "https://jkaspirant.in").replace(/\/$/, "");
const stateFile = process.env.TELEGRAM_STATE_FILE || resolve(repo, "ops", "telegram-posted.json");
const channelsFile = resolve(repo, "ops", "telegram-channels.json");
const MAX_PER_RUN = 3;

const args = process.argv.slice(2);
const send = args.includes("--send");
const init = args.includes("--init");
const force = args.includes("--force");
const arg = (name) => (args.includes(name) ? args[args.indexOf(name) + 1] : null);
const only = arg("--only");
const onlyChannel = arg("--channel");

let channels = existsSync(channelsFile)
  ? JSON.parse(readFileSync(channelsFile, "utf8")).channels
  : [process.env.TELEGRAM_CHANNEL_ID].filter(Boolean);
if (onlyChannel) channels = channels.filter((c) => c === onlyChannel);
if (!channels.length) {
  console.error(onlyChannel ? `${onlyChannel} is not in ops/telegram-channels.json` : "no channels configured");
  process.exit(1);
}

const state = existsSync(stateFile) ? JSON.parse(readFileSync(stateFile, "utf8")) : { channels: {} };
state.channels ??= {};
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
const allLive = [...sitemap.matchAll(/<loc>[^<]*\/notifications\/([^<\/]+)<\/loc>/g)].map((m) => m[1]);
let slugs = only ? allLive.filter((s) => s === only) : allLive;
if (only && !slugs.length) {
  console.error(`"${only}" is not live on ${site} (not in the sitemap).`);
  process.exit(1);
}

// A channel seen for the first time starts from now, so it isn't flooded with old updates.
const now = new Date().toISOString();
for (const c of channels) {
  if (state.channels[c] && !init) continue;
  state.channels[c] ??= { posted: {} };
  for (const s of allLive) state.channels[c].posted[s] ??= { at: now, sent: false };
  console.log(`${c}: marked ${allLive.length} live updates as already posted (nothing sent)`);
  if (send || init) saveState();
}
if (init) process.exit(0);

const freshFor = (c) => slugs.filter((s) => force || !state.channels[c].posted[s]);
const wanted = [...new Set(channels.flatMap((c) => freshFor(c).slice(0, MAX_PER_RUN)))];
if (!wanted.length) {
  console.log("nothing new to post");
  process.exit(0);
}

// 2. Build each post from the live page
const posts = new Map();
for (const slug of wanted) {
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
  posts.set(slug, `<b>${escapeHtml(title)}</b>\n\n${escapeHtml(summary)}\n\nFull details and the official notice:\n${url}`);
}

if (!send) {
  for (const c of channels) for (const s of freshFor(c).slice(0, MAX_PER_RUN)) if (posts.has(s)) console.log(`--- would post to ${c}: ${s}\n${posts.get(s)}\n`);
  console.log("dry run. add --send to post.");
  process.exit(0);
}

// 3. Send
const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
  console.error("TELEGRAM_BOT_TOKEN must be set");
  process.exit(1);
}
for (const c of channels) {
  const list = freshFor(c);
  if (list.length > MAX_PER_RUN) console.log(`${c}: ${list.length - MAX_PER_RUN} more waiting for the next run`);
  for (const slug of list.slice(0, MAX_PER_RUN)) {
    const text = posts.get(slug);
    if (!text) continue;
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ chat_id: c, text, parse_mode: "HTML" }),
    });
    const body = await res.json();
    if (!body.ok) {
      console.error(`${c}: failed ${slug}: ${body.description}`);
      process.exitCode = 1;
      continue;
    }
    state.channels[c].posted[slug] = { at: new Date().toISOString(), sent: true, message_id: body.result.message_id };
    saveState();
    console.log(`${c}: posted ${slug} (message ${body.result.message_id})`);
  }
}
