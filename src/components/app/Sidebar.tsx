"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { PLANS, type PlanId } from "@/lib/plans";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { useTranslation } from "@/lib/i18n/useTranslation";

type Pocket = { id: string; name: string };

type Props = {
  email: string | null;
  plan: PlanId;
  pockets: Pocket[];
};

function HomeIcon() {
  return (
    <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a1.5 1.5 0 0 1 2.122 0l8.955 8.955M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75" />
    </svg>
  );
}

function GridIcon() {
  return (
    <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
    </svg>
  );
}

function CapitalIcon() {
  return (
    <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

function PiggyIcon() {
  return (
    <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a4.5 4.5 0 0 0-4.5-4.5h-6a4.5 4.5 0 0 0-4.5 4.5v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
    </svg>
  );
}

function TipsIcon() {
  return (
    <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.297 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 0 1 0 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 0 1 0-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={clsx("h-3.5 w-3.5 transition-transform", open && "rotate-90")}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2.5}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
    </svg>
  );
}

export function Sidebar({ email, plan, pockets }: Props) {
  const pathname = usePathname();
  const { t } = useTranslation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [pocketsOpen, setPocketsOpen] = useState(true);
  const pocketsAvailable = PLANS[plan].savingsPocketLimit > 0;

  const linkClass = (active: boolean) =>
    clsx(
      "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
      active ? "bg-surface-alt text-fg" : "text-fg-muted hover:bg-surface-alt hover:text-fg",
    );

  const navContent = (
    <>
      <Link href="/dashboard" className="flex items-center gap-2 px-3 py-1" onClick={() => setMobileOpen(false)}>
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-ink-950 text-sm font-semibold text-white">
          L
        </span>
        <span className="text-[15px] font-semibold tracking-tight text-fg">Leviro</span>
      </Link>

      <nav className="mt-6 flex flex-1 flex-col gap-0.5 overflow-y-auto">
        <Link href="/" className={linkClass(false)} onClick={() => setMobileOpen(false)}>
          <HomeIcon />
          {t("nav.home")}
        </Link>
        <Link href="/dashboard" className={linkClass(pathname?.startsWith("/dashboard") ?? false)} onClick={() => setMobileOpen(false)}>
          <GridIcon />
          {t("nav.dashboard")}
        </Link>
        <Link href="/capital" className={linkClass(pathname?.startsWith("/capital") ?? false)} onClick={() => setMobileOpen(false)}>
          <CapitalIcon />
          {t("nav.capital")}
        </Link>

        <button
          type="button"
          onClick={() => setPocketsOpen((v) => !v)}
          className={clsx(linkClass(pathname?.startsWith("/pockets") ?? false), "w-full justify-between")}
        >
          <span className="flex items-center gap-2.5">
            <PiggyIcon />
            {t("nav.savingsPlans")}
          </span>
          <ChevronIcon open={pocketsOpen} />
        </button>
        {pocketsOpen ? (
          <div className="ml-7 flex flex-col gap-0.5 border-l border-line pl-3">
            {!pocketsAvailable ? (
              <Link href="/pricing" className="py-1.5 text-xs text-fg-faint hover:text-accent-600 dark:hover:text-accent-400">
                🔒 {t("nav.pocketsUpgrade")}
              </Link>
            ) : pockets.length === 0 ? (
              <span className="py-1.5 text-xs text-fg-faint">{t("nav.noPockets")}</span>
            ) : (
              pockets.map((pocket) => (
                <Link
                  key={pocket.id}
                  href={`/pockets/${pocket.id}`}
                  onClick={() => setMobileOpen(false)}
                  className={clsx(
                    "truncate rounded-md py-1.5 text-sm transition-colors",
                    pathname === `/pockets/${pocket.id}`
                      ? "font-medium text-fg"
                      : "text-fg-muted hover:text-fg",
                  )}
                >
                  {pocket.name}
                </Link>
              ))
            )}
          </div>
        ) : null}

        <Link href="/tips" className={linkClass(pathname?.startsWith("/tips") ?? false)} onClick={() => setMobileOpen(false)}>
          <TipsIcon />
          {t("nav.tips")}
        </Link>
        <Link href="/settings" className={linkClass(pathname?.startsWith("/settings") ?? false)} onClick={() => setMobileOpen(false)}>
          <SettingsIcon />
          {t("nav.settings")}
        </Link>
      </nav>

      <div className="mt-4 space-y-3 border-t border-line pt-4">
        <div className="flex items-center justify-between">
          <Link
            href="/pricing"
            className="rounded-full bg-surface-alt px-2.5 py-1 text-xs font-medium text-fg-muted hover:text-fg"
          >
            {PLANS[plan].name}-{t("nav.planSuffix")}
          </Link>
          <div className="flex items-center gap-1">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </div>
        {email ? <p className="truncate px-1 text-xs text-fg-faint">{email}</p> : null}
        <form action="/auth/signout" method="post">
          <button type="submit" className="btn-ghost w-full justify-start text-sm">
            {t("nav.signOut")}
          </button>
        </form>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="flex items-center justify-between border-b border-line bg-surface px-4 py-3 md:hidden">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-ink-950 text-sm font-semibold text-white">
            L
          </span>
          <span className="text-[15px] font-semibold tracking-tight text-fg">Leviro</span>
        </Link>
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label="Menü öffnen"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-fg-muted hover:bg-surface-alt"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
          </svg>
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            aria-label="Menü schließen"
            className="absolute inset-0 bg-ink-950/40"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 flex w-72 flex-col bg-surface px-4 py-5">{navContent}</div>
        </div>
      ) : null}

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-line bg-surface px-4 py-5 md:flex">
        {navContent}
      </aside>
    </>
  );
}
