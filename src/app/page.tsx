import Link from "next/link";
import { Navbar } from "@/components/marketing/Navbar";
import { Footer } from "@/components/marketing/Footer";
import { GridPreview } from "@/components/marketing/GridPreview";
import { PricingCards } from "@/components/PricingCards";

const FEATURES = [
  {
    title: "Ein Jahr, ein Blick",
    description:
      "Einnahmen, Fixkosten und Sparziele für ein ganzes Kalenderjahr in einer Tabelle – Monat für Monat editierbar.",
  },
  {
    title: "Sofort sehen, was übrig bleibt",
    description:
      "„Rest zum Ausgeben“ wird live berechnet und in Rot hervorgehoben, sobald du ins Minus rutschst.",
  },
  {
    title: "Sparpockets mit Kontoständen",
    description:
      "Lege Sparziele an und verfolge den kumulierten Kontostand über das Jahr – automatisch, ohne Excel-Formeln.",
  },
  {
    title: "Rückwärts rechnen",
    description:
      "Trag im Januar dein Jahresziel für Dezember ein und sieh sofort, wie viel du monatlich beiseitelegen musst.",
  },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1">
        <section className="mx-auto max-w-6xl px-6 pb-16 pt-20 text-center md:pt-28">
          <h1 className="mx-auto max-w-3xl text-4xl font-semibold tracking-tight text-ink-950 md:text-6xl">
            Dein Geld, ein sauberer Plan pro Jahr.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-ink-500">
            Finanzplan ist die einfachste Art, Einnahmen, Fixkosten und Sparziele
            Monat für Monat zu planen – clean wie ein Spreadsheet, smart wie ein
            Finanzcoach.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/signup" className="btn-accent px-6 py-3 text-base">
              Kostenlos starten
            </Link>
            <Link href="/pricing" className="btn-secondary px-6 py-3 text-base">
              Preise ansehen
            </Link>
          </div>
          <p className="mt-4 text-sm text-ink-400">
            Keine Kreditkarte nötig · in 2 Minuten startklar
          </p>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-24">
          <GridPreview />
        </section>

        <section id="funktionen" className="mx-auto max-w-6xl px-6 pb-24">
          <div className="mx-auto mb-12 max-w-xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-ink-950">
              Alles, was du für deinen Finanzplan brauchst
            </h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            {FEATURES.map((feature) => (
              <div key={feature.title} className="card p-6">
                <h3 className="font-semibold text-ink-950">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-500">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section id="preise" className="mx-auto max-w-6xl px-6 pb-24">
          <div className="mx-auto mb-12 max-w-xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-ink-950">
              Ein Tarif, der mit dir wächst
            </h2>
            <p className="mt-3 text-ink-500">
              Monatlich kündbar, jederzeit up- oder downgradebar.
            </p>
          </div>
          <PricingCards mode="public" />
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-28">
          <div className="card flex flex-col items-center gap-5 px-8 py-14 text-center">
            <h2 className="text-2xl font-semibold tracking-tight text-ink-950 md:text-3xl">
              Bereit für einen klaren Kopf beim Geld?
            </h2>
            <Link href="/signup" className="btn-accent px-6 py-3 text-base">
              Kostenlos starten
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
