import Link from "next/link";

interface ToolCardProps {
  href?: string;
  kicker: string;
  title: string;
  description: string;
  soon?: boolean;
}

export function ToolCard({ href, kicker, title, description, soon }: ToolCardProps) {
  const body = (
    <>
      <div className="flex items-center justify-between">
        <p className="section-kicker">{kicker}</p>
        {soon ? <span className="tag">Soon</span> : <span className="stamp">Live</span>}
      </div>
      <h3 className="mt-2 text-xl leading-snug">{title}</h3>
      <p className="mt-1.5 text-sm leading-6 text-[hsl(var(--muted))]">{description}</p>
      {!soon && (
        <p className="mt-3 text-sm font-semibold text-[hsl(var(--accent))]">Open tool →</p>
      )}
    </>
  );

  if (soon || !href) {
    return <div className="surface-card p-4 opacity-70">{body}</div>;
  }
  return (
    <Link href={href} className="surface-card block p-4 transition hover:border-[hsl(var(--accent)/0.6)]">
      {body}
    </Link>
  );
}
