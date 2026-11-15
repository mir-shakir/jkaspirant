export const siteConfig = {
  name: "JK Aspirant",
  description:
    "Your one-stop resource for JKSSB and JKPSC exam notifications, syllabi, previous papers, cut-offs, and important dates.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://jkaspirant.in",
  ogImage: "/og-default.png",
  telegramUrl: process.env.NEXT_PUBLIC_TELEGRAM_URL || "",
  creator: "JK Aspirant",
  keywords: [
    "JKSSB",
    "JKPSC",
    "Kashmir jobs",
    "JKSSB notifications",
    "JKSSB syllabus",
    "JKSSB previous papers",
    "JK government jobs",
  ],
} as const;

export const mainNav = [
  { href: "/notifications", label: "Updates" },
  { href: "/tools", label: "Tools" },
  { href: "/exams", label: "Exams" },
  { href: "/resources", label: "Papers" },
] as const;
