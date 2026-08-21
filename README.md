# Leviro

Eine clean designte Web-App zum Planen von monatlichen Einnahmen, Fixkosten und
Sparzielen – pro Kalenderjahr in einer Tabellenansicht, mit Live-Berechnung
und drei Abo-Tarifen (Free, Pro, Max). Mehrsprachig (DE/EN/ES) und mit Dark Mode.

## Tech-Stack

- **Next.js 14** (App Router) + TypeScript
- **Tailwind CSS** für das Design-System, inkl. Dark Mode (Klassen-basiert)
- **Supabase** (Auth + Postgres) für Nutzerverwaltung und Datenpersistenz
- **Stripe** für Abo-Zahlungen (Checkout + Customer Portal, 3 Preisstufen)
- Eigenes leichtgewichtiges i18n-System (DE/EN/ES, umschaltbar im Header)
- Deployment-fähig für **Vercel**

## ⚠️ Update für bereits laufende Projekte

Falls dein Supabase-Projekt bereits mit einer früheren Version läuft, müssen
alle SQL-Dateien unter [`supabase/migrations/`](./supabase/migrations/) der
Reihe nach im SQL-Editor ausgeführt werden:

1. `0002_onboarding.sql` – fügt das Onboarding-Flag zu `profiles` hinzu und
   markiert bestehende Nutzer automatisch als "bereits onboarded". **Ohne
   diese Migration schlägt das Onboarding mit einem Fehler
   ("Could not find the 'onboarding_completed_at' column…") fehl und der
   Nutzer landet in einer Schleife zurück am Anfang des Wizards.**
2. `0003_raise_fixed_cost_limits.sql` – hebt die Fixkosten-Limits an (Free 5,
   Pro 10).
3. `0004_currency_preference.sql` – fügt die persönliche Anzeige-Währung zu
   `profiles` hinzu.

Bei einem **neuen** Projekt reicht `schema.sql` allein, alle Spalten sind
dort bereits enthalten.

## Getting Started

### 1. Abhängigkeiten installieren

```bash
npm install
```

### 2. Supabase-Projekt einrichten

1. Neues Projekt auf [supabase.com](https://supabase.com) anlegen.
2. Im SQL-Editor den Inhalt von [`supabase/schema.sql`](./supabase/schema.sql)
   ausführen. Das legt alle Tabellen, RLS-Policies, Trigger (inkl. serverseitiger
   Tarif-Limit-Durchsetzung) und die automatische Profil-/Free-Subscription-
   Anlage bei Registrierung an.
3. Falls Google-Login gewünscht ist: unter **Authentication → Providers →
   Google** aktivieren und OAuth-Client-ID/Secret hinterlegen. Die App
   funktioniert auch ohne Google-Login (E-Mail/Passwort reicht).
4. Projekt-URL, `anon`-Key und `service_role`-Key aus **Project Settings →
   API** entnehmen.

### 3. Stripe einrichten

1. Drei Produkte mit je einem monatlichen Preis anlegen: **Pro** und **Max**
   (Free ist kostenlos und braucht kein Stripe-Produkt).
2. Preis-IDs (`price_...`) in die Umgebungsvariablen eintragen (siehe unten).
3. Webhook-Endpoint auf `https://<deine-domain>/api/stripe/webhook` anlegen,
   mit den Events `checkout.session.completed`,
   `customer.subscription.created`, `customer.subscription.updated`,
   `customer.subscription.deleted`. Das Webhook-Secret in die Env-Variable
   `STRIPE_WEBHOOK_SECRET` eintragen.
4. Für lokale Entwicklung kann `stripe listen --forward-to
   localhost:3000/api/stripe/webhook` verwendet werden.

### 4. Umgebungsvariablen

`.env.example` nach `.env.local` kopieren und ausfüllen:

```bash
cp .env.example .env.local
```

| Variable | Beschreibung |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Projekt-URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public Key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service_role Key (nur serverseitig, für den Stripe-Webhook) |
| `NEXT_PUBLIC_SITE_URL` | Basis-URL der App (für Stripe-Redirects) |
| `STRIPE_SECRET_KEY` | Stripe Secret Key |
| `STRIPE_WEBHOOK_SECRET` | Signing Secret des Stripe-Webhooks |
| `NEXT_PUBLIC_STRIPE_PRICE_PRO` | Price-ID des Pro-Tarifs |
| `NEXT_PUBLIC_STRIPE_PRICE_MAX` | Price-ID des Max-Tarifs |

### 5. Entwicklung starten

```bash
npm run dev
```

App läuft unter `http://localhost:3000`.

## Angenommene Defaults (bitte bei Bedarf anpassen)

Da im Auftrag konkrete Preise und einige Details offengelassen wurden, sind
folgende Annahmen getroffen worden:

- **Preise**: Free 0 €, Pro 6,99 €/Monat, Max 14,99 €/Monat (`src/lib/plans.ts`).
  Einfach anpassbar, die tatsächliche Abrechnung erfolgt aber ausschließlich
  über die in Stripe hinterlegten Preise.
- **Login**: E-Mail/Passwort + optional Google OAuth (Google-Button ist immer
  sichtbar, funktioniert aber erst nach Aktivierung des Providers in Supabase).
- **Produktname**: "Leviro".
- **Standardsprache**: Deutsch, umschaltbar auf Englisch/Spanisch über den
  Header (Auswahl wird in einem Cookie gespeichert).
- **Sparziel im Onboarding bei Free-Tarif**: Der Tarifvergleich sieht 0
  Sparpockets für Free vor. Der Spar-Tipp im Onboarding wird trotzdem allen
  angezeigt, aber nur bei Pro/Max wird tatsächlich ein Sparpocket angelegt.

## Neue Funktionen in diesem Update

- **Dark Mode**: Umschaltbar über den Mond/Sonne-Button im Header, Auswahl
  wird in `localStorage` gespeichert. Technisch über CSS-Variablen + Tailwind
  `darkMode: "class"` umgesetzt (`src/app/globals.css`, `tailwind.config.ts`).
- **Mehrsprachigkeit**: DE/EN/ES umschaltbar im Header. Server-Komponenten
  lesen die Sprache aus einem Cookie (`src/lib/i18n/get-locale.server.ts`),
  Client-Komponenten über `useTranslation()` (`src/lib/i18n/useTranslation.ts`).
  Übersetzungstexte liegen in `src/lib/i18n/dictionaries/{de,en,es}.ts`.
- **Fixkosten/Sparpockets direkt im Grid löschbar**: Papierkorb-Icon beim
  Hovern über eine Zeile in der Jahresansicht (zusätzlich zur Verwaltung in
  den Einstellungen).
- **Onboarding-Wizard**: Nach der Registrierung (`/onboarding`, 3 Schritte:
  Einnahmen → Fixkosten-Auswahl → Sparziel mit Tipp) werden die Werte für das
  aktuelle Jahr in alle 12 Monate übernommen und bleiben danach frei editierbar.
  Bereits bestehende Nutzer werden durch die Migration übersprungen (siehe oben).
- **E-Mail-Bestätigung repariert & erzwungen**: Neue `/auth/confirmed`-Erfolgs-
  und `/auth/pending`-Sperrseite (mit "Link erneut senden"), Middleware
  blockiert Nutzer ohne bestätigte E-Mail (`user.email_confirmed_at`) vom
  Dashboard, unabhängig von der Supabase-"Confirm email"-Einstellung.
- **Linke Navigation**: Ersetzt die alte obere Navbar im eingeloggten Bereich.
  Home / Jahresansicht / Sparpläne (Accordion mit Link zur neuen
  Sparplan-Detailseite `/pockets/[id]`) / Spartipps (`/tips`, 8 Tipps) /
  Einstellungen. Auf Mobile als Menü-Icon mit Drawer eingeklappt.
- **"Auf ganzes Jahr kopieren"**: Kopier-Icon in jeder Fixkosten-/
  Sparpocket-Zelle (beim Hovern sichtbar), überträgt den Wert auf alle 12
  Monate, mit Bestätigungsdialog bei abweichenden Werten und Toast-Feedback.
- **Hero-Bereich** auf der Landingpage mit Smartphone-Mockup (reine
  CSS/SVG-Illustration als Platzhalter, `// TODO` in
  `src/components/marketing/HeroMockup.tsx` markiert eine Stelle für ein
  echtes Foto).

## Architektur

```
src/
  app/
    page.tsx                 Landingpage inkl. Pricing-Sektion
    pricing/                 Eigenständige Preisseite (Upgrade/Downgrade)
    login/, signup/          Auth-Formulare (Supabase Auth)
    auth/callback/           OAuth/Magic-Link Callback
    (app)/                   Geschützter Bereich (Middleware + Layout-Check)
      dashboard/              Jahres-Grid mit Inline-Editing
      settings/                Kategorien/Sparpockets verwalten, Abo verwalten
    api/
      categories/, pockets/   CRUD mit serverseitiger Tarif-Limit-Prüfung
      values/                 Upsert der monatlichen Werte (Einnahmen, Fixkosten, Sparpockets)
      years/                  Neues Planungsjahr anlegen
      stripe/                 Checkout-Session, Customer-Portal-Session, Webhook
  components/
    dashboard/                Grid, editierbare Zellen, Sparziel-Rechner
    settings/                 Kategorie-/Sparpocket-Verwaltung, Billing-Karte
    marketing/                Landingpage-Bausteine
  lib/
    plans.ts                  Tarif-Konfiguration (Limits, Preise, Stripe-Price-IDs)
    calculations.ts           Rest-zum-Ausgeben, kumulierte Kontostände, Rückwärtsrechnung
    supabase/                 Browser-/Server-/Admin-Clients
    stripe.ts                 Stripe-SDK-Singleton
supabase/
  schema.sql                  Tabellen, RLS-Policies, Tarif-Limit-Trigger
```

## Tarif-Feature-Gating

Die Limits (Fixkosten-Kategorien, Sparpockets) sind **serverseitig** über zwei
Ebenen durchgesetzt, nicht nur im UI:

1. Die API-Routen (`/api/categories`, `/api/pockets`) prüfen den aktuellen
   Tarif und die vorhandene Anzahl, bevor sie einen Insert ausführen.
2. Zusätzlich verhindern Postgres-Trigger (`enforce_fixed_cost_category_limit`,
   `enforce_savings_pocket_limit`) in `supabase/schema.sql` das Anlegen weiterer
   Einträge über das Limit hinaus – selbst bei direktem DB-Zugriff unter
   Umgehung der API. Row Level Security sorgt zusätzlich dafür, dass Nutzer
   ausschließlich ihre eigenen Daten lesen/schreiben können.
3. Der Tarif selbst (`subscriptions.plan`) kann von Nutzern nicht direkt
   geändert werden (RLS erlaubt nur `select`), sondern ausschließlich durch
   den Stripe-Webhook über den Service-Role-Key.

## Bekannte Follow-ups

- `npm audit` zeigt noch einige High-Severity-Advisories in Next.js' intern
  gebündeltem `postcss` sowie ein Next.js-eigenes Advisory, die erst mit einem
  Umstieg auf Next.js 15/16 vollständig behoben sind (breaking API-Changes bei
  `cookies()` und dynamischen Route-Params). Für einen produktiven Rollout vor
  dem Launch empfehlenswert.
- E2E-Tests (z. B. Playwright) sind nicht enthalten und sollten vor dem
  Launch ergänzt werden.
