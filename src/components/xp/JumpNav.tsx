"use client";

import { useEffect, useState } from "react";

/** Sticky chips that jump to sections of a long page and highlight where you are. */
export function JumpNav({ items }: { items: { id: string; label: string }[] }) {
  const [active, setActive] = useState(items[0]?.id);
  useEffect(() => {
    // The current section is the last heading that has scrolled under the bars.
    let frame = 0;
    const update = () => {
      frame = 0;
      let current = items[0]?.id;
      for (const i of items) {
        const el = document.getElementById(i.id);
        if (el && el.getBoundingClientRect().top < 150) current = i.id;
      }
      setActive(current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [items]);
  useEffect(() => {
    document.getElementById(`jump-${active}`)?.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
  }, [active]);
  if (items.length < 2) return null;
  return (
    <nav aria-label="On this page" className="sticky top-14 z-40 -mx-4 mt-5 border-b bg-[hsl(var(--background)/0.94)] backdrop-blur-md sm:-mx-6">
      <div className="no-scrollbar flex gap-1.5 overflow-x-auto px-4 py-2 sm:px-6">
        {items.map((i) => (
          <a
            key={i.id}
            id={`jump-${i.id}`}
            href={`#${i.id}`}
            className={`flex h-9 shrink-0 items-center rounded-full px-3.5 text-[13px] font-medium transition-colors ${
              active === i.id ? "bg-[hsl(var(--foreground))] text-[hsl(var(--background))]" : "bg-[hsl(var(--panel-soft))] text-[hsl(var(--muted))]"
            }`}
          >
            {i.label}
          </a>
        ))}
      </div>
    </nav>
  );
}
