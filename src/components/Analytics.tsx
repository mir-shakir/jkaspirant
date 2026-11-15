"use client";

import { useEffect } from "react";
import Script from "next/script";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/config/site";
import { track } from "@/lib/analytics";

/**
 * Google Analytics 4. Loaded after the page is interactive so it never slows
 * first paint. Page views on navigation come from GA4's own "enhanced
 * measurement" (keep it switched on in the GA property).
 *
 * Any link or button can report a click without client code by carrying
 * data-event="name" (plus optional data-event-label).
 */
export function Analytics() {
  const pathname = usePathname();
  const id = siteConfig.gaId;
  const enabled = !!id && !pathname.startsWith("/admin");

  useEffect(() => {
    if (!enabled) return;
    const onClick = (e: MouseEvent) => {
      const el = (e.target as HTMLElement | null)?.closest<HTMLElement>("[data-event]");
      if (el?.dataset.event) track(el.dataset.event, { label: el.dataset.eventLabel, page: window.location.pathname });
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [enabled]);

  if (!enabled) return null;
  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${id}`} strategy="afterInteractive" />
      <Script id="ga4-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${id}');`}
      </Script>
    </>
  );
}
