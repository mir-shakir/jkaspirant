"use client";

import { useEffect, useState } from "react";
import { track } from "@/lib/analytics";

const KINDS = [
  { key: "wrong_info", label: "Wrong information" },
  { key: "feature", label: "Feature request" },
  { key: "complaint", label: "Complaint" },
  { key: "other", label: "Something else" },
] as const;

export function FeedbackForm() {
  const [kind, setKind] = useState("");
  const [message, setMessage] = useState("");
  const [contact, setContact] = useState("");
  const [website, setWebsite] = useState(""); // hidden from people; bots fill it
  const [page, setPage] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const from = p.get("page");
    if (from) setPage(from);
    const k = p.get("type");
    if (k && KINDS.some((x) => x.key === k)) setKind(k);
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!kind) return setError("Pick what this is about.");
    if (message.trim().length < 5) return setError("Please write a little more.");
    setState("sending");
    try {
      const r = await fetch("/api/feedback", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ kind, message, contact, page, website }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) {
        setError(d.error || "Couldn't send. Please try again.");
        setState("idle");
        return;
      }
      track("feedback_sent", { kind });
      setState("sent");
    } catch {
      setError("Couldn't send. Check your connection and try again.");
      setState("idle");
    }
  }

  if (state === "sent")
    return (
      <div className="surface-card p-5">
        <p className="text-[17px] font-semibold">Thank you. We&apos;ve got it.</p>
        <p className="mt-1.5 text-[14.5px] text-[hsl(var(--muted))]">
          {kind === "wrong_info" ? "We'll check it against the official notice and fix it if it's wrong." : "We read every message."}
          {contact ? " If we need more detail, we'll get in touch." : ""}
        </p>
      </div>
    );

  return (
    <form onSubmit={submit} className="surface-card p-4 sm:p-5">
      <p className="mb-2 text-[13px] font-medium">What is this about?</p>
      <div className="flex flex-wrap gap-2">
        {KINDS.map((k) => (
          <button
            key={k.key}
            type="button"
            aria-pressed={kind === k.key}
            onClick={() => setKind(k.key)}
            className={`h-10 rounded-full px-4 text-[13.5px] font-medium transition-colors ${
              kind === k.key ? "bg-[hsl(var(--foreground))] text-[hsl(var(--background))]" : "bg-[hsl(var(--panel-soft))] text-[hsl(var(--foreground))]"
            }`}
          >
            {k.label}
          </button>
        ))}
      </div>

      <label htmlFor="fb-message" className="mb-1.5 mt-4 block text-[13px] font-medium">
        Your message
      </label>
      <textarea
        id="fb-message"
        rows={5}
        maxLength={2000}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder={kind === "wrong_info" ? "What's wrong, and where did you see the correct information?" : "Tell us in your own words."}
        className="field min-h-[120px] py-3"
      />
      {page && <p className="mt-1.5 text-[12px] text-[hsl(var(--muted))]">About the page: {page}</p>}

      <label htmlFor="fb-contact" className="mb-1.5 mt-4 block text-[13px] font-medium">
        Email or phone <span className="font-normal text-[hsl(var(--muted))]">(optional, only if you want a reply)</span>
      </label>
      <input id="fb-contact" type="text" maxLength={120} value={contact} onChange={(e) => setContact(e.target.value)} autoComplete="email" className="field" />

      {/* Honeypot: hidden from people, filled by bots */}
      <div aria-hidden className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="fb-website">Website</label>
        <input id="fb-website" type="text" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
      </div>

      {error && <p className="mt-3 text-[13.5px] text-[hsl(var(--accent))]">{error}</p>}
      <button type="submit" disabled={state === "sending"} className="btn-primary mt-4 w-full">
        {state === "sending" ? "Sending…" : "Send"}
      </button>
      <p className="mt-2 text-[12px] text-[hsl(var(--muted))]">We store your message and, if you give it, your contact. Nothing else. See the privacy page.</p>
    </form>
  );
}
