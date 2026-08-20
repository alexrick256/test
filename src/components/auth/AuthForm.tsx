"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Mode = "login" | "signup";

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const next = searchParams.get("next") ?? "/dashboard";
  const plan = searchParams.get("plan");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);
    const supabase = createClient();

    try {
      if (mode === "signup") {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(
              plan ? `/pricing?plan=${plan}` : next,
            )}`,
          },
        });
        if (signUpError) throw signUpError;
        setInfo("Fast geschafft! Bitte bestätige deine E-Mail-Adresse über den Link, den wir dir geschickt haben.");
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
        router.push(next);
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Etwas ist schiefgelaufen.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setError(null);
    setOauthLoading(true);
    const supabase = createClient();
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
    if (oauthError) {
      setError(oauthError.message);
      setOauthLoading(false);
    }
  }

  return (
    <div className="w-full max-w-sm">
      <h1 className="text-2xl font-semibold tracking-tight text-ink-950">
        {mode === "login" ? "Willkommen zurück" : "Konto erstellen"}
      </h1>
      <p className="mt-1.5 text-sm text-ink-500">
        {mode === "login"
          ? "Melde dich an, um deinen Finanzplan zu öffnen."
          : "Kostenlos starten – kein Zahlungsmittel nötig."}
      </p>

      <button
        type="button"
        onClick={handleGoogle}
        disabled={oauthLoading}
        className="btn-secondary mt-7 w-full"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.88c2.27-2.09 3.57-5.17 3.57-8.82z"
          />
          <path
            fill="#34A853"
            d="M12 24c3.24 0 5.96-1.08 7.95-2.91l-3.88-3c-1.08.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.27v3.1A12 12 0 0 0 12 24z"
          />
          <path
            fill="#FBBC05"
            d="M5.27 14.28A7.2 7.2 0 0 1 4.89 12c0-.79.14-1.56.38-2.28v-3.1H1.27A12 12 0 0 0 0 12c0 1.94.46 3.77 1.27 5.38l4-3.1z"
          />
          <path
            fill="#EA4335"
            d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.69 1.27 6.62l4 3.1c.95-2.85 3.6-4.97 6.73-4.97z"
          />
        </svg>
        Mit Google fortfahren
      </button>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-ink-100" />
        <span className="text-xs text-ink-400">oder mit E-Mail</span>
        <div className="h-px flex-1 bg-ink-100" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="label">
            E-Mail
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input mt-1.5"
            placeholder="du@beispiel.de"
          />
        </div>
        <div>
          <label htmlFor="password" className="label">
            Passwort
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={8}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input mt-1.5"
            placeholder="Mindestens 8 Zeichen"
          />
        </div>

        {error ? <p className="text-sm text-negative">{error}</p> : null}
        {info ? <p className="text-sm text-positive">{info}</p> : null}

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "Einen Moment…" : mode === "login" ? "Anmelden" : "Konto erstellen"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-500">
        {mode === "login" ? (
          <>
            Noch kein Konto?{" "}
            <Link href="/signup" className="font-medium text-ink-900 hover:underline">
              Kostenlos registrieren
            </Link>
          </>
        ) : (
          <>
            Bereits ein Konto?{" "}
            <Link href="/login" className="font-medium text-ink-900 hover:underline">
              Anmelden
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
