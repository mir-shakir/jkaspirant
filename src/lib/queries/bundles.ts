import { createServerClient } from "@/lib/supabase/server";
import type { Bundle, BundleFile, Order, Coupon } from "@/lib/types/database";

export async function getAllBundles(): Promise<Bundle[]> {
  try {
    const supabase = createServerClient();
    const { data } = await supabase
      .from("bundles")
      .select("*, bundle_exams(exam:exams(id, slug, title)), files:bundle_files(*)")
      .eq("is_active", true)
      .order("created_at", { ascending: false });
    return (data || []).map(flattenBundleExams);
  } catch { return []; }
}

export async function getBundleBySlug(slug: string): Promise<Bundle | null> {
  try {
    const supabase = createServerClient();
    const { data } = await supabase
      .from("bundles")
      .select("*, bundle_exams(exam:exams(id, slug, title)), files:bundle_files(*)")
      .eq("slug", slug)
      .eq("is_active", true)
      .single();
    return data ? flattenBundleExams(data) : null;
  } catch { return null; }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function flattenBundleExams(row: any): Bundle {
  const { bundle_exams, ...rest } = row;
  const exams = (bundle_exams || [])
    .map((be: { exam: { id: string; slug: string; title: string } | null }) => be.exam)
    .filter(Boolean);
  return { ...rest, exams };
}

export async function getBundleSlugs(): Promise<string[]> {
  try {
    const supabase = createServerClient();
    const { data } = await supabase.from("bundles").select("slug").eq("is_active", true);
    return (data || []).map((row) => row.slug);
  } catch { return []; }
}

export async function getOrderByToken(token: string): Promise<Order | null> {
  try {
    const supabase = createServerClient();
    const { data } = await supabase
      .from("orders")
      .select("*, bundle:bundles(title, slug)")
      .eq("download_token", token)
      .in("status", ["paid", "free"])
      .single();
    return data;
  } catch { return null; }
}

export async function getBundleFiles(bundleId: string): Promise<BundleFile[]> {
  try {
    const supabase = createServerClient();
    const { data } = await supabase
      .from("bundle_files")
      .select("*")
      .eq("bundle_id", bundleId)
      .order("sort_order");
    return data || [];
  } catch { return []; }
}

export async function createSignedDownloadUrls(
  files: BundleFile[]
): Promise<{ fileName: string; url: string; fileSizeKb: number | null }[]> {
  const supabase = createServerClient();
  const results = [];
  for (const file of files) {
    const { data, error } = await supabase.storage
      .from("bundles")
      .createSignedUrl(file.storage_path, 3600);
    if (!error && data?.signedUrl) {
      results.push({ fileName: file.file_name, url: data.signedUrl, fileSizeKb: file.file_size_kb });
    }
  }
  return results;
}

export async function validateCoupon(
  code: string
): Promise<{ valid: boolean; coupon?: Coupon; reason?: string }> {
  try {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("coupons")
      .select("*")
      .eq("code", code.toUpperCase())
      .eq("is_active", true)
      .single();
    if (error || !data) return { valid: false, reason: "Invalid coupon code" };
    if (data.expires_at && new Date(data.expires_at) < new Date()) return { valid: false, reason: "Coupon has expired" };
    if (data.max_uses !== null && data.times_used >= data.max_uses) return { valid: false, reason: "Coupon usage limit reached" };
    return { valid: true, coupon: data };
  } catch { return { valid: false, reason: "Error validating coupon" }; }
}

export async function createOrder(params: {
  bundleId: string;
  buyerEmail: string;
  amountPaidPaise: number;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  couponId?: string;
  status: "pending" | "paid" | "free";
}): Promise<Order> {
  const supabase = createServerClient();
  const tokenExpiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();
  const { data, error } = await supabase
    .from("orders")
    .insert({
      bundle_id: params.bundleId,
      buyer_email: params.buyerEmail,
      amount_paid_paise: params.amountPaidPaise,
      razorpay_order_id: params.razorpayOrderId || null,
      razorpay_payment_id: params.razorpayPaymentId || null,
      coupon_id: params.couponId || null,
      status: params.status,
      token_expires_at: tokenExpiresAt,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateOrderPayment(
  razorpayOrderId: string,
  razorpayPaymentId: string
): Promise<Order | null> {
  try {
    const supabase = createServerClient();
    const { data } = await supabase
      .from("orders")
      .update({ status: "paid", razorpay_payment_id: razorpayPaymentId })
      .eq("razorpay_order_id", razorpayOrderId)
      .select("*, bundle:bundles(title, slug)")
      .single();
    return data;
  } catch { return null; }
}

export async function incrementCouponUsage(couponId: string): Promise<void> {
  const supabase = createServerClient();
  await supabase.rpc("increment_coupon_usage", { coupon_id: couponId });
}
