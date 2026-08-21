import Link from "next/link";
import { Navbar } from "@/components/marketing/Navbar";
import { Footer } from "@/components/marketing/Footer";
import { GridPreview } from "@/components/marketing/GridPreview";
import { PricingCards } from "@/components/PricingCards";
import { getServerTranslator } from "@/lib/i18n/server-t";

export default function LandingPage() {
  const { t, tList } = getServerTranslator();
  const features = tList<{ title: string; description: string }>("marketing.features.items");

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1">
        <section className="mx-auto max-w-6xl px-6 pb-16 pt-20 text-center md:pt-28">
          <h1 className="mx-auto max-w-3xl text-4xl font-semibold tracking-tight text-fg md:text-6xl">
            {t("marketing.hero.title")}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-fg-muted">{t("marketing.hero.subtitle")}</p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/signup" className="btn-accent px-6 py-3 text-base">
              {t("marketing.hero.ctaPrimary")}
            </Link>
            <Link href="/pricing" className="btn-secondary px-6 py-3 text-base">
              {t("marketing.hero.ctaSecondary")}
            </Link>
          </div>
          <p className="mt-4 text-sm text-fg-faint">{t("marketing.hero.note")}</p>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-24">
          <GridPreview />
        </section>

        <section id="funktionen" className="mx-auto max-w-6xl px-6 pb-24">
          <div className="mx-auto mb-12 max-w-xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-fg">{t("marketing.features.title")}</h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            {features.map((feature) => (
              <div key={feature.title} className="card p-6">
                <h3 className="font-semibold text-fg">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-fg-muted">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="preise" className="mx-auto max-w-6xl px-6 pb-24">
          <div className="mx-auto mb-12 max-w-xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-fg">{t("marketing.pricing.title")}</h2>
            <p className="mt-3 text-fg-muted">{t("marketing.pricing.subtitle")}</p>
          </div>
          <PricingCards mode="public" />
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-28">
          <div className="card flex flex-col items-center gap-5 px-8 py-14 text-center">
            <h2 className="text-2xl font-semibold tracking-tight text-fg md:text-3xl">
              {t("marketing.cta.title")}
            </h2>
            <Link href="/signup" className="btn-accent px-6 py-3 text-base">
              {t("marketing.cta.button")}
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
