// Read JKSSB's official "Previous Question Papers" page and save the list to
// src/content/papers.json (title, year, url). We only link the official PDFs; we never re-host them.
//
//   node scripts/sources/jkssb-papers.mjs          # write src/content/papers.json, print a summary
//   node scripts/sources/jkssb-papers.mjs --print  # print JSON lines only, write nothing
//
// curl is used because Node's fetch rejects jkssb.nic.in's certificate chain;
// long connect timeout and retries because the server drops many connections.

import { execFileSync } from "node:child_process";
import { writeFileSync, readFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const PAGE = "https://jkssb.nic.in/QP.html";
const out = resolve(dirname(fileURLToPath(import.meta.url)), "../../src/content/papers.json");

const html = execFileSync("curl", ["-sk", "-A", "Mozilla/5.0", "--connect-timeout", "45", "--max-time", "120", "--retry", "3", "--retry-all-errors", "--retry-delay", "5", PAGE], { encoding: "utf8", maxBuffer: 20e6 });

const decode = (s) =>
  s.replace(/&amp;/g, "&").replace(/&#39;|&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&nbsp;/g, " ").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
const clean = (s) => decode(s.replace(/<[^>]+>/g, "")).replace(/\s+/g, " ").trim();

// Older entries are in ALL CAPS; show them like the newer ones. Known short forms stay upper case.
const KEEP = new Set(["JE", "MTS", "SI", "IRP", "SDRF", "ITI", "PWD", "R&B", "J&K", "JK", "ASO", "CAD", "AYUSH", "II", "III", "IV", "VLW", "ICDS", "FPF", "CT", "GIS", "MCH", "ANM", "OT", "ECG", "X-RAY", "PTI", "PASO", "PCB", "IT", "IB", "DEO", "LDC", "UDC", "ECE", "EE", "ME"]);
const FIX = { Teelphone: "Telephone", Psycholigist: "Psychologist", Sanitory: "Sanitary", "H&me": "H&ME" };
function titleCase(s) {
  if (s !== s.toUpperCase()) return s;
  const small = new Set(["of", "and", "in", "for", "the", "to", "cum"]);
  const t = s
    .toLowerCase()
    .replace(/[a-z0-9&']+/g, (w, i) => {
      const up = w.toUpperCase();
      if (KEEP.has(up) || /^(i|ii|iii|iv|v|vi)$/.test(w) || (w.length === 1 && w !== "a")) return up;
      if (/^'?[a-z]'?$/.test(w)) return up;
      if (small.has(w) && i > 0) return w;
      return w[0].toUpperCase() + w.slice(1);
    })
    .replace(/^./, (c) => c.toUpperCase());
  return t.replace(/[A-Za-z&]+/g, (w) => FIX[w] ?? w);
}

const seen = new Set();
const papers = [];
for (const m of html.matchAll(/href\s*=\s*['"]([^'"]*\.pdf)['"][^>]*>([\s\S]*?)<\/a>/gi)) {
  const href = m[1].trim();
  const text = clean(m[2]);
  if (!text || /\/\.pdf$/i.test(href)) continue;
  const ym = text.match(/[-–]\s*(20\d\d)\s*$/);
  if (!ym) continue; // not a dated paper entry
  const url = encodeURI(new URL(href, PAGE).href.replace(/%20/g, " "));
  if (seen.has(url)) continue;
  seen.add(url);
  const title = titleCase(text.replace(/\s*[-–]\s*20\d\d\s*$/, "").replace(/\s*\(\s*/g, " (").replace(/\s*\)/g, ")").trim());
  papers.push({ title, year: Number(ym[1]), url });
}

if (papers.length < 50) {
  console.error(`only ${papers.length} papers found; the page layout may have changed. Not writing.`);
  process.exit(1);
}

if (process.argv.includes("--print")) {
  for (const p of papers) console.log(JSON.stringify(p));
  process.exit(0);
}

const before = existsSync(out) ? JSON.parse(readFileSync(out, "utf8")).papers.length : 0;
writeFileSync(out, JSON.stringify({ source: PAGE, checked: new Date().toISOString().slice(0, 10), papers }, null, 2) + "\n");
console.log(`wrote ${papers.length} papers (was ${before}) to src/content/papers.json`);
