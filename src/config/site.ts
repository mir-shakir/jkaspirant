export const siteConfig = {
  name: "JK Aspirant",
  description:
    "Clear JKSSB exam updates from official notices: dates, posts, eligibility, past cut-offs and rank tools.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://jkaspirant.in",
  ogImage: "/og-default.png",
  // Partner channel (run by a friend of the owner): study material and updates.
  telegramUrl: process.env.NEXT_PUBLIC_TELEGRAM_URL || "https://t.me/JkExamSpark_jkssb",
  telegramName: "JKExamSPARK (JKSSB)",
  // Google Analytics 4 measurement ID (public by nature). Set NEXT_PUBLIC_GA_ID to "off" to disable.
  gaId: process.env.NEXT_PUBLIC_GA_ID === "off" ? "" : process.env.NEXT_PUBLIC_GA_ID || "G-FCTHK220S8",
  creator: "JK Aspirant",
  keywords: [
    "JKSSB",
    "Kashmir jobs",
    "JKSSB notifications",
    "JKSSB syllabus",
    "JKSSB previous papers",
    "JK government jobs",
  ],
} as const;

export const mainNav = [
  { href: "/notifications", label: "Updates" },
  { href: "/exams", label: "Exams" },
  { href: "/calendar", label: "Calendar" },
  { href: "/tools", label: "Tools" },
] as const;
