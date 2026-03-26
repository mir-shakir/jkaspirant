"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

const navItems = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/notifications", label: "Notifications" },
  { href: "/admin/exams", label: "Exams" },
  { href: "/admin/papers", label: "Papers" },
  { href: "/admin/cutoffs", label: "Cut-offs" },
  { href: "/admin/syllabus", label: "Syllabus" },
  { href: "/admin/dates", label: "Exam Dates" },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/admin/login");
  }

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900">
      <div className="p-4">
        <Link href="/admin" className="text-lg font-bold text-gray-900 dark:text-white">Admin</Link>
      </div>
      <nav className="flex-1 space-y-1 px-3">
        {navItems.map((item) => {
          const isActive = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href} className={`block rounded-md px-3 py-2 text-sm font-medium transition-colors ${isActive ? "bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400" : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"}`}>
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-gray-200 p-3 dark:border-gray-800">
        <button onClick={handleLogout} className="w-full rounded-md px-3 py-2 text-left text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800">
          Sign Out
        </button>
      </div>
    </aside>
  );
}
