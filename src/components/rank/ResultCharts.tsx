// Server-rendered SVG charts for a closed rank tool. One highlight colour and a
// neutral context colour (--chart-hi / --chart-base, validated in both themes);
// hover shows the exact numbers through <title>; every chart has its numbers in
// text nearby, so nothing depends on colour alone.

const fmt = (n: number) => n.toLocaleString("en-IN");

/** How shared scores spread, in 5-mark bands, with the expected open-merit cut-off marked. */
export function ScoreSpread({
  histogram,
  cutoff,
  from,
  to,
  bucketWidth = 5,
}: {
  histogram: { bucket: number; count: number }[];
  cutoff: number;
  from: number;
  to: number; // last band start shown
  bucketWidth?: number;
}) {
  const bands: { start: number; count: number }[] = [];
  for (let b = from; b <= to; b += bucketWidth) bands.push({ start: b, count: histogram.find((h) => h.bucket === b)?.count ?? 0 });
  const below = histogram.filter((h) => h.bucket < from).reduce((s, h) => s + h.count, 0);
  const max = Math.max(...bands.map((b) => b.count));
  const W = 340;
  const H = 180;
  const padL = 12;
  const padB = 22;
  const top = 30;
  const slot = (W - padL * 2) / bands.length;
  const barW = slot - 2; // 2px surface gap between bars
  const y = (n: number) => top + (H - padB - top) * (1 - n / max);
  const xOf = (score: number) => padL + ((score - from) / (bands.length * bucketWidth)) * (W - padL * 2);
  const cx = xOf(cutoff);
  const peak = bands.reduce((a, b) => (b.count > a.count ? b : a));

  return (
    <figure className="surface-card p-4">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={`Bar chart of shared scores in ${bucketWidth}-mark bands. Most scores fall between ${peak.start} and ${peak.start + bucketWidth}. Expected open-merit cut-off ${cutoff}.`}>
        {/* baseline */}
        <line x1={padL} x2={W - padL} y1={H - padB} y2={H - padB} stroke="hsl(var(--line))" strokeWidth="1" />
        {bands.map((b, i) => {
          const x = padL + i * slot + 1;
          const hi = b.start + bucketWidth > cutoff;
          const h = H - padB - y(b.count);
          return (
            <g key={b.start}>
              <title>{`${b.start} to ${b.start + bucketWidth - 0.25}: ${fmt(b.count)} scores`}</title>
              {/* generous hit area for hover */}
              <rect x={x - 1} y={top} width={slot} height={H - padB - top} fill="transparent" />
              {b.count > 0 && (
                <path
                  d={roundTop(x, H - padB, barW, Math.max(h, 2), Math.min(4, barW / 2))}
                  fill={hi ? "hsl(var(--chart-hi))" : "hsl(var(--chart-base))"}
                />
              )}
            </g>
          );
        })}
        {/* cut-off marker */}
        <line x1={cx} x2={cx} y1={14} y2={H - padB} stroke="hsl(var(--foreground))" strokeWidth="1.5" strokeDasharray="3 3" />
        <text
          x={cx > W * 0.6 ? cx - 4 : cx + 4}
          y={11}
          fontSize="10.5"
          textAnchor={cx > W * 0.6 ? "end" : "start"}
          fill="hsl(var(--foreground))"
          className="font-mono-num"
        >
          OM cut-off ≈ {cutoff}
        </text>
        {/* peak label */}
        <text x={padL + bands.indexOf(peak) * slot + slot / 2} y={y(peak.count) - 4} fontSize="10" textAnchor="middle" fill="hsl(var(--muted))" className="font-mono-num">
          {fmt(peak.count)}
        </text>
        {/* x labels every 20 marks */}
        {bands
          .filter((b) => b.start % 20 === 0)
          .map((b) => (
            <text key={b.start} x={xOf(b.start)} y={H - 6} fontSize="10" textAnchor="middle" fill="hsl(var(--muted))" className="font-mono-num">
              {b.start}
            </text>
          ))}
      </svg>
      <figcaption className="mt-2 text-[12.5px] leading-5 text-[hsl(var(--muted))]">
        Number of scores in each {bucketWidth}-mark band. Red bands reach the expected open-merit cut-off.
        {below > 0 ? ` ${fmt(below)} scores below ${from} not shown.` : ""}
      </figcaption>
    </figure>
  );
}

/** Bar with rounded top corners, square at the baseline. */
function roundTop(x: number, base: number, w: number, h: number, r: number) {
  const rr = Math.min(r, h, w / 2);
  const t = base - h;
  return `M${x},${base}V${t + rr}Q${x},${t} ${x + rr},${t}H${x + w - rr}Q${x + w},${t} ${x + w},${t + rr}V${base}Z`;
}
