import { createServerClient } from "@/lib/supabase/server";
import type { Resource, ResourceType } from "@/lib/types/database";

export async function getAllResources(limit?: number): Promise<Resource[]> {
  try {
    const supabase = createServerClient();
    let query = supabase
      .from("resources")
      .select("*, exam:exams(slug, title)")
      .eq("is_active", true)
      .order("is_featured", { ascending: false })
      .order("sort_order")
      .order("created_at", { ascending: false });

    if (limit) {
      query = query.limit(limit);
    }

    const { data } = await query;
    return data || [];
  } catch {
    return [];
  }
}

export async function getFeaturedResources(
  limit: number = 6
): Promise<Resource[]> {
  try {
    const supabase = createServerClient();
    const { data } = await supabase
      .from("resources")
      .select("*, exam:exams(slug, title)")
      .eq("is_active", true)
      .eq("is_featured", true)
      .order("sort_order")
      .order("created_at", { ascending: false })
      .limit(limit);
    return data || [];
  } catch {
    return [];
  }
}

export async function getResourcesForExam(
  examId: string,
  limit?: number
): Promise<Resource[]> {
  try {
    const supabase = createServerClient();
    let query = supabase
      .from("resources")
      .select("*, exam:exams(slug, title)")
      .eq("is_active", true)
      .eq("exam_id", examId)
      .order("is_featured", { ascending: false })
      .order("sort_order")
      .order("created_at", { ascending: false });

    if (limit) {
      query = query.limit(limit);
    }

    const { data } = await query;
    return data || [];
  } catch {
    return [];
  }
}

export async function getResourcesByType(
  resourceType: ResourceType,
  limit?: number
): Promise<Resource[]> {
  try {
    const supabase = createServerClient();
    let query = supabase
      .from("resources")
      .select("*, exam:exams(slug, title)")
      .eq("is_active", true)
      .eq("resource_type", resourceType)
      .order("is_featured", { ascending: false })
      .order("sort_order")
      .order("created_at", { ascending: false });

    if (limit) {
      query = query.limit(limit);
    }

    const { data } = await query;
    return data || [];
  } catch {
    return [];
  }
}
