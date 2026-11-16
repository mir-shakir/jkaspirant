import Link from "next/link";
import { GroupList, Row } from "@/components/ui";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Page Not Found",
  description: "The page you are looking for does not exist.",
  noIndex: true,
});

export default function NotFound() {
  return (
    <div className="page-shell py-12">
      <p className="section-kicker">404</p>
      <h1 className="mt-2 text-[32px] leading-tight">This page isn&apos;t here.</h1>
      <p className="mt-2 text-[15px] text-[hsl(var(--muted))]">It may have moved. Try one of these instead.</p>
      <GroupList className="mt-6">
        <Row href="/notifications" title="Latest updates" />
        <Row href="/exams" title="Exams" />
        <Row href="/calendar" title="Exam calendar" />
      </GroupList>
      <Link href="/" className="btn-secondary mt-4 w-full">
        Go to home
      </Link>
    </div>
  );
}
