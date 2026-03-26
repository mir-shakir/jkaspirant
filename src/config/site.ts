export const siteConfig = {
  name: "JK Aspirant",
  description:
    "Your one-stop resource for JKSSB and JKPSC exam notifications, syllabi, previous papers, cut-offs, and important dates.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://jkaspirant.tech",
  ogImage: "/og-default.png",
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
