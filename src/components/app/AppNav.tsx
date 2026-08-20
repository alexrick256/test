"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { PLANS, type PlanId } from "@/lib/plans";

export function AppNav({ email, plan }: { email: string | null; plan: PlanId }) {
  const pathname = usePathname();

  const links = [
    { href: "/dashboard", label: "Jahresansicht" },
    { href: "/settings", label: "Einstellungen" },
  ];

  return (
    <header className="border-b border-ink-100 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5">
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-ink-950 text-sm font-semibold text-white">
              F
            </span>
            <span className="text-[15px] font-semibold tracking-tight text-ink-950">
              Finanzplan
            </span>
          </Link>
          <nav className="hidden items-center gap-1 sm:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={clsx(
                  "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                  pathname?.startsWith(link.href)
                    ? "bg-ink-100 text-ink-950"
                    : "text-ink-500 hover:text-ink-900",
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/pricing"
            className="hidden rounded-full bg-ink-50 px-3 py-1 text-xs font-medium text-ink-600 hover:bg-ink-100 sm:inline-flex"
          >
            {PLANS[plan].name}-Tarif
          </Link>
          <span className="hidden text-sm text-ink-400 md:inline">{email}</span>
          <form action="/auth/signout" method="post">
            <button type="submit" className="btn-ghost text-sm">
              Abmelden
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
