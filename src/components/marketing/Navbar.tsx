import Link from "next/link";

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-ink-100 bg-ink-50/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-ink-950 text-sm font-semibold text-white">
            F
          </span>
          <span className="text-[15px] font-semibold tracking-tight text-ink-950">
            Finanzplan
          </span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-ink-600 md:flex">
          <Link href="/#funktionen" className="hover:text-ink-950">
            Funktionen
          </Link>
          <Link href="/pricing" className="hover:text-ink-950">
            Preise
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/login" className="btn-ghost">
            Anmelden
          </Link>
          <Link href="/signup" className="btn-primary">
            Kostenlos starten
          </Link>
        </div>
      </div>
    </header>
  );
}
