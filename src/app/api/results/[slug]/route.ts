import { NextRequest, NextResponse } from "next/server";
import { getResultSheet } from "@/content/results";

// Search a parsed score sheet by roll number or name. Answers are a few rows,
// so a slow phone never downloads the whole PDF or data set.

export const dynamic = "force-dynamic";
const LIMIT = 25;

export function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  const sheet = getResultSheet(params.slug);
  if (!sheet) return NextResponse.json({ error: "Unknown result" }, { status: 404 });
  const q = (req.nextUrl.searchParams.get("q") || "").trim().toUpperCase().replace(/\s+/g, " ");
  if (q.length < 3) return NextResponse.json({ rows: [], total: 0, error: "Type at least 3 characters" });

  const digits = /^\d+$/.test(q);
  const words = q.split(" ");
  const hits = sheet.rows.filter(([, roll, name]) => (digits ? roll.startsWith(q) : words.every((w) => name.includes(w))));
  return NextResponse.json(
    { rows: hits.slice(0, LIMIT), total: hits.length, candidates: sheet.rows.length },
    { headers: { "cache-control": "public, max-age=300, s-maxage=86400" } }
  );
}
