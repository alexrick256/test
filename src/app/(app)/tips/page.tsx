import { getServerTranslator } from "@/lib/i18n/server-t";

export default function TipsPage() {
  const { t, tList } = getServerTranslator();
  const tips = tList<{ title: string; description: string }>("tips.items");

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-fg">{t("tips.pageTitle")}</h1>
        <p className="mt-1 text-sm text-fg-muted">{t("tips.pageSubtitle")}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {tips.map((tip, i) => (
          <div key={tip.title} className="card p-5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-50 text-sm font-semibold text-accent-700 dark:bg-accent-950/50 dark:text-accent-400">
              {i + 1}
            </span>
            <h2 className="mt-3 font-semibold text-fg">{tip.title}</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-fg-muted">{tip.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
