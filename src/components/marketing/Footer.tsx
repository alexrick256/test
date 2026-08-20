import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-ink-100">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-10 text-sm text-ink-500 md:flex-row">
        <p>© {new Date().getFullYear()} Finanzplan. Alle Rechte vorbehalten.</p>
        <div className="flex items-center gap-6">
          <Link href="/pricing" className="hover:text-ink-800">
            Preise
          </Link>
          <Link href="/login" className="hover:text-ink-800">
            Anmelden
          </Link>
        </div>
      </div>
    </footer>
  );
}
