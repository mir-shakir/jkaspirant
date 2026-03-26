import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-950">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              JK Aspirant
            </h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Your trusted resource for JKSSB &amp; JKPSC exam preparation.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Quick Links
            </h3>
            <ul className="mt-2 space-y-1">
              <li>
                <Link
                  href="/exams"
                  className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                >
                  All Exams
                </Link>
              </li>
              <li>
                <Link
                  href="/notifications"
                  className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                >
                  Notifications
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Official Links
            </h3>
            <ul className="mt-2 space-y-1">
              <li>
                <a
                  href="https://jkssb.nic.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                >
                  JKSSB Official
                </a>
              </li>
              <li>
                <a
                  href="https://jkpsc.nic.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                >
                  JKPSC Official
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-200 pt-4 text-center text-xs text-gray-500 dark:border-gray-800 dark:text-gray-500">
          &copy; {new Date().getFullYear()} JK Aspirant. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
