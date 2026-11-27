#!/usr/bin/env node
// JKSSB "What's New" scraper. Prints one JSON line per notice, newest first:
//   {"title": "...", "url": "https://jkssb.nic.in/Pdf/....pdf", "date": "2026-11-15" | null}
//
// Usage: node scripts/sources/jkssb.mjs [--limit 40]
//
// The page is plain HTML (no login, no CAPTCHA). Each notice is an
// <a class='linkText' href='../Pdf/<name>.pdf'>title</a> in a table, newest
// first. Rows carry no date column, so the date comes from the file name
// (most end in DDMMYYYY) and is null when it can't be read. For results and
// answer keys that date is often the exam date, not the posting date, so treat
// it as a hint and rely on page order for "newest". Commented-out
// rows on the page are ignored.

const PAGE = "https://jkssb.nic.in/Whatsnew.html";

const args = process.argv.slice(2);
const limitAt = args.indexOf("--limit");
const limit = limitAt >= 0 ? Number(args[limitAt + 1]) : 40;

const entities = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", "#39": "'" };
const decode = (s) => s.replace(/&(#?\w+);/g, (m, e) => entities[e] ?? m);
const clean = (s) => decode(s.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();

function dateFrom(url) {
  const file = decodeURIComponent(url.split("/").pop() ?? "");
  const m = file.match(/(\d{2})(\d{2})(20\d{2})(?!.*\d{8})/);
  if (!m) return null;
  const [, d, mo, y] = m;
  if (+d < 1 || +d > 31 || +mo < 1 || +mo > 12) return null;
  return `${y}-${mo}-${d}`;
}

// jkssb.nic.in is slow and drops many new connections (a connect often takes
// 10-35 s while TCP retries), and it sends an incomplete certificate chain that
// Node's fetch rejects. So use curl, with a long connect timeout and retries.
export const CURL_PATIENT = ["--connect-timeout", "45", "--max-time", "120", "--retry", "3", "--retry-all-errors", "--retry-delay", "5"];

async function getPage(url) {
  const { execFileSync } = await import("node:child_process");
  try {
    return execFileSync("curl", ["-sSfL", ...CURL_PATIENT, "-A", "Mozilla/5.0", url], { encoding: "utf8", maxBuffer: 50e6 });
  } catch (err) {
    console.error(`jkssb: could not load ${url} after 4 tries (${String(err.stderr || err.message).trim()})`);
    process.exit(1);
  }
}

const html = (await getPage(PAGE)).replace(/<!--[\s\S]*?-->/g, "");

const seen = new Set();
const items = [];
const linkRe = /<a\b[^>]*\bhref=['"]([^'"]+)['"][^>]*\bclass=['"]linkText['"][^>]*>([\s\S]*?)<\/a>/gi;
for (const m of html.matchAll(linkRe)) {
  const url = new URL(m[1].trim(), PAGE).href.replace(/ /g, "%20");
  const title = clean(m[2]);
  if (!title || /\/\.pdf$/i.test(url) || seen.has(url)) continue;
  seen.add(url);
  items.push({ title, url, date: dateFrom(url) });
  if (items.length >= limit) break;
}

if (items.length === 0) {
  console.error("jkssb: no notices found; the page layout may have changed");
  process.exit(1);
}
for (const item of items) console.log(JSON.stringify(item));
