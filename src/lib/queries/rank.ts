import { createServerClient } from "@/lib/supabase/server";
import type { ShareStats } from "@/lib/rank";

export interface CutoffStats {
  stats: Pick<ShareStats, "total" | "histogram">;
  catCounts: Record<string, number>;
}

/**
 * Shared-score totals for the expected cut-off card. Read on the server and
 * cached with the page (ISR), so the database sees one read per refresh no
 * matter how many people open the tool.
 *
 * Without database settings (local builds) this returns null and the card is
 * hidden. If the database is configured but the read fails, it throws: Next.js
 * then keeps serving the last good page instead of replacing the cut-offs with
 * the much rougher past-pattern estimate.
 */
export async function getCutoffStats(examKey: string): Promise<CutoffStats | null> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) return null;
  const supabase = createServerClient();
  const [rpc, rows] = await Promise.all([
    supabase.rpc("rank_stats", { p_exam: examKey, p_score: 0, p_category: "OM", p_cutoff_index: 0 }),
    supabase.from("score_submissions").select("category").eq("exam_key", examKey),
  ]);
  if (rpc.error || !rpc.data) throw new Error(`rank_stats failed: ${rpc.error?.message ?? "no data"}`);
  if (rows.error) throw new Error(`category counts failed: ${rows.error.message}`);
  const data = rpc.data as { total: number; histogram: ShareStats["histogram"] | null };
  const catCounts: Record<string, number> = {};
  for (const r of (rows.data ?? []) as { category: string }[]) catCounts[r.category] = (catCounts[r.category] ?? 0) + 1;
  return { stats: { total: data.total, histogram: data.histogram ?? [] }, catCounts };
}
