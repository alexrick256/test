"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { PLANS, type PlanId } from "@/lib/plans";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { useTranslation } from "@/lib/i18n/useTranslation";

export function AppNav({ email, plan }: { email: string | null; plan: PlanId }) {
  const pathname = usePathname();
  const { t } = useTranslation();

  const links = [
    { href: "/dashboard", label: t("nav.dashboard") },
    { href: "/settings", label: t("nav.settings") },
  ];

  return (
    <header className="border-b border-line bg-surface">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5">
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-ink-950 text-sm font-semibold text-white">
              L
            </span>
            <span className="text-[15px] font-semibold tracking-tight text-fg">Leviro</span>
          </Link>
          <nav className="hidden items-center gap-1 sm:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={clsx(
                  "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                  pathname?.startsWith(link.href)
                    ? "bg-surface-alt text-fg"
                    : "text-fg-muted hover:text-fg",
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/pricing"
            className="hidden rounded-full bg-surface-alt px-3 py-1 text-xs font-medium text-fg-muted hover:text-fg sm:inline-flex"
          >
            {PLANS[plan].name}-{t("nav.planSuffix")}
          </Link>
          <LanguageSwitcher />
          <ThemeToggle />
          <span className="hidden text-sm text-fg-faint md:inline">{email}</span>
          <form action="/auth/signout" method="post">
            <button type="submit" className="btn-ghost text-sm">
              {t("nav.signOut")}
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
