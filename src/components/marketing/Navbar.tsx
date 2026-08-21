import Link from "next/link";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { getServerTranslator } from "@/lib/i18n/server-t";

export function Navbar() {
  const { t } = getServerTranslator();

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-ink-950 text-sm font-semibold text-white">
            L
          </span>
          <span className="text-[15px] font-semibold tracking-tight text-fg">Leviro</span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-fg-muted md:flex">
          <Link href="/#funktionen" className="hover:text-fg">
            {t("marketing.nav.features")}
          </Link>
          <Link href="/pricing" className="hover:text-fg">
            {t("marketing.nav.pricing")}
          </Link>
        </nav>
        <div className="flex items-center gap-1.5">
          <LanguageSwitcher />
          <ThemeToggle />
          <Link href="/login" className="btn-ghost">
            {t("marketing.nav.login")}
          </Link>
          <Link href="/signup" className="btn-primary">
            {t("marketing.nav.getStarted")}
          </Link>
        </div>
      </div>
    </header>
  );
}
