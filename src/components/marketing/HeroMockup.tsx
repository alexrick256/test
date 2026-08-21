// TODO: fotorealistisches Hero-Bild einfügen (Hand hält Smartphone mit
// Leviro-Logo auf dem Display). Dieser Platzhalter ist eine reine
// CSS/SVG-Illustration, kein echtes Foto – bei Bedarf gegen ein
// generiertes/fotografiertes Bild austauschen und diese Komponente durch
// z. B. ein <Image src="/hero.jpg" /> ersetzen.
export function HeroMockup() {
  return (
    <div className="relative mx-auto flex w-full max-w-xs flex-col items-center">
      <div className="absolute inset-0 -z-10 rounded-full bg-accent-200/40 blur-3xl dark:bg-accent-900/30" />

      <div className="w-[220px] rounded-[2.25rem] border-[6px] border-ink-950 bg-ink-950 shadow-popover sm:w-[240px]">
        <div className="overflow-hidden rounded-[1.75rem] bg-surface">
          <div className="h-6 bg-ink-950" />
          <div className="flex flex-col items-center gap-4 bg-gradient-to-b from-accent-500 to-accent-700 px-6 py-10">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-2xl font-bold text-accent-600 shadow-card">
              L
            </span>
            <span className="text-sm font-medium text-white/90">Leviro</span>
          </div>
          <div className="space-y-2 p-4">
            <div className="h-3 w-3/4 rounded-full bg-surface-alt" />
            <div className="h-3 w-1/2 rounded-full bg-surface-alt" />
            <div className="mt-3 h-16 rounded-lg bg-surface-alt" />
          </div>
          <div className="h-6" />
        </div>
      </div>

      <div className="mt-6 flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-ink-950 text-base font-semibold text-white">
          L
        </span>
        <span className="text-xl font-semibold tracking-tight text-fg">Leviro</span>
      </div>
    </div>
  );
}
