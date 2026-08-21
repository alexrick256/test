import Link from "next/link";
import { getServerTranslator } from "@/lib/i18n/server-t";

export function Footer() {
  const { t } = getServerTranslator();

  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-10 text-sm text-fg-muted md:flex-row">
        <p>© {new Date().getFullYear()} Leviro. {t("footer.rights")}</p>
        <div className="flex items-center gap-6">
          <Link href="/pricing" className="hover:text-fg">
            {t("footer.pricing")}
          </Link>
          <Link href="/login" className="hover:text-fg">
            {t("footer.login")}
          </Link>
        </div>
      </div>
    </footer>
  );
}
