"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useTranslation } from "@/lib/i18n/useTranslation";

export function AuthPendingContent({ email }: { email: string }) {
  const { t } = useTranslation();
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState<{ type: "info" | "error"; text: string } | null>(null);

  async function handleResend() {
    setResending(true);
    setMessage(null);
    const supabase = createClient();
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?flow=signup&next=${encodeURIComponent("/onboarding")}`,
      },
    });
    setResending(false);
    setMessage(
      error ? { type: "error", text: error.message } : { type: "info", text: t("auth.pending.resent") },
    );
  }

  async function handleSignOut() {
    await fetch("/auth/signout", { method: "POST" });
    window.location.href = "/";
  }

  return (
    <div className="w-full max-w-sm text-center">
      <span className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-50 text-3xl dark:bg-accent-950/50">
        ✉️
      </span>
      <h1 className="text-2xl font-semibold tracking-tight text-fg">{t("auth.pending.title")}</h1>
      <p className="mt-1.5 text-sm text-fg-muted">{t("auth.pending.subtitle", { email })}</p>

      {message ? (
        <p className={`mt-4 text-sm ${message.type === "error" ? "text-negative" : "text-positive"}`}>
          {message.text}
        </p>
      ) : null}

      <button onClick={handleResend} disabled={resending} className="btn-primary mt-8 w-full">
        {resending ? t("auth.loading") : t("auth.pending.resend")}
      </button>
      <button onClick={handleSignOut} className="btn-ghost mt-3 w-full">
        {t("auth.pending.signOut")}
      </button>
    </div>
  );
}
