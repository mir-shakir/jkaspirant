"use client";

import { useEffect, useState } from "react";
import { track } from "@/lib/analytics";

/** One message box, an optional way to reply, nothing else. */
export function ContactForm() {
  const [message, setMessage] = useState("");
  const [contact, setContact] = useState("");
  const [website, setWebsite] = useState(""); // hidden from people; bots fill it
  const [page, setPage] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const from = new URLSearchParams(window.location.search).get("page");
    if (from) setPage(from);
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (message.trim().length < 5) return setError("Please write a little more.");
    setState("sending");
    try {
      const r = await fetch("/api/feedback", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message, contact, page, website }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) {
        setError(d.error || "Couldn't send. Please try again.");
        setState("idle");
        return;
      }
      track("contact_sent");
      setState("sent");
    } catch {
      setError("Couldn't send. Check your connection and try again.");
      setState("idle");
    }
  }

  if (state === "sent")
    return (
      <div className="surface-card p-5">
        <p className="text-[17px] font-semibold">Thank you, we&apos;ve got your message.</p>
        <p className="mt-1.5 text-[14.5px] text-[hsl(var(--muted))]">
          {contact ? "We'll get back to you if a reply is needed." : "If you'd like a reply next time, leave an email or phone number."}
        </p>
      </div>
    );

  return (
    <form onSubmit={submit} className="surface-card p-4 sm:p-5">
      <label htmlFor="c-message" className="mb-1.5 block text-[13px] font-medium">
        Message
      </label>
      <textarea
        id="c-message"
        rows={6}
        maxLength={2000}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="A correction, a question, a suggestion or a complaint"
        className="field min-h-[140px] py-3"
      />

      <label htmlFor="c-contact" className="mb-1.5 mt-4 block text-[13px] font-medium">
        Email or phone <span className="font-normal text-[hsl(var(--muted))]">(optional, if you&apos;d like a reply)</span>
      </label>
      <input id="c-contact" type="text" maxLength={120} value={contact} onChange={(e) => setContact(e.target.value)} autoComplete="email" className="field" />

      {/* Honeypot: hidden from people, filled by bots */}
      <div aria-hidden className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="c-website">Website</label>
        <input id="c-website" type="text" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
      </div>

      {error && <p className="mt-3 text-[13.5px] text-[hsl(var(--accent))]">{error}</p>}
      <button type="submit" disabled={state === "sending"} className="btn-primary mt-4 w-full">
        {state === "sending" ? "Sending…" : "Send"}
      </button>
    </form>
  );
}
