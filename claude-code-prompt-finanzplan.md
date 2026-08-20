# Claude Code Prompt: Finanzplan-SaaS

Baue eine moderne, super clean designte Web-App namens **"Finanzplan"** (Arbeitstitel), mit der Nutzer ihre monatlichen Einnahmen und Ausgaben planen und Sparziele verfolgen können. Die App wird im Abo-Modell mit drei Tarifen angeboten (Free, Pro, Max).

## Tech-Stack
- Next.js (App Router) + TypeScript
- Tailwind CSS für ein cleanes, minimalistisches Design (viel Weißraum, klare Typografie, dezente Akzentfarbe, keine überladenen UI-Elemente)
- Supabase (Auth + Postgres-Datenbank) für Nutzerverwaltung und Datenpersistenz
- Stripe für Abo-Zahlungen (3 Preisstufen, monatlich kündbar)
- Deployment-fähig für Vercel

## Kernkonzept
Der Nutzer plant sein Geld pro Kalenderjahr, Monat für Monat, in einer Tabellen-/Grid-Ansicht (Zeilen = Kategorien, Spalten = Monate Jan–Dez).

### 1. Einnahmen
- Nutzer trägt sein monatliches Gehalt/Einnahmen ein (pro Monat einzeln editierbar, damit auch unregelmäßige Einnahmen abgebildet werden können)

### 2. Fixkosten
- Frei benennbare Kategorien (z. B. "Miete", "Versicherung", "Handyvertrag")
- Nutzer legt Name und Betrag pro Monat fest, Beträge sind jederzeit änderbar
- Anzahl der Fixkosten-Kategorien ist je nach Tarif begrenzt (siehe unten)

### 3. Sparpockets (nur Pro & Max)
- Frei benennbare Sparziele (z. B. "Urlaub", "Notgroschen", "Neues Auto")
- Nutzer entscheidet pro Monat individuell, wie viel er in welches Sparpocket einzahlt (auch 0€ oder unregelmäßig möglich)
- Anzahl der Sparpockets ist je nach Tarif begrenzt

### 4. Berechnete Zeilen (nicht editierbar, automatisch)
- **"Rest zum Ausgeben"**: Einnahmen – Summe Fixkosten – Summe aller Sparpocket-Einzahlungen des jeweiligen Monats
- **"Konten"**: Ein Block mit einer Zeile pro Sparpocket, die den **kumulierten Kontostand** dieses Sparpockets zeigt (Summe aller bisherigen Einzahlungen des Jahres bis zu diesem Monat). Diese Zeilen-Namen leiten sich automatisch aus den vom Nutzer vergebenen Sparpocket-Namen ab und sind selbst nicht umbenennbar.

**Wichtiger Effekt, der im Onboarding/Tooltip erklärt werden soll:** Wenn man z. B. im Januar direkt einträgt, dass man am Jahresende (Dezember) einen bestimmten Betrag gespart haben möchte, kann rückwärts gerechnet werden, wie viel pro Monat dafür beiseitegelegt werden muss – und der Nutzer sieht sofort, ob das mit seinem "Rest zum Ausgeben" überhaupt machbar ist, ohne ins Minus zu rutschen.

## Tarif-Struktur (Feature-Gating)

| Feature | Free | Pro | Max |
|---|---|---|---|
| Einnahmen/Ausgaben-Übersicht | ✅ | ✅ | ✅ |
| Fixkosten (frei benennbar) | 3 | 5 | 20 |
| Sparpockets | 0 | 3 | 20 |
| "Rest zum Ausgeben" | ✅ | ✅ | ✅ |
| Konten-Übersicht | – | ✅ | ✅ |

Die Limits müssen serverseitig durchgesetzt werden (nicht nur im UI), z. B. beim Versuch, eine weitere Kategorie anzulegen, die über dem Tarif-Limit liegt.

## Seitenstruktur
1. **Landingpage**: Kurzes, klares Wertversprechen, Screenshot/Demo der Tabellenansicht, Preisübersicht (3 Karten Free/Pro/Max), CTA "Kostenlos starten"
2. **Auth**: Login/Registrierung (Supabase Auth, E-Mail + evtl. Google-Login)
3. **Dashboard/Jahresansicht**: Die zentrale Grid-Ansicht mit Jahr-Auswahl (mehrere Jahre möglich), Zeilen für Einnahmen, Fixkosten, Sparpockets, Rest zum Ausgeben, Konten
4. **Einstellungen**: Kategorien verwalten (umbenennen, löschen, neu anlegen im Rahmen des Tarif-Limits), Abo verwalten (Stripe Customer Portal)
5. **Pricing-Seite**: Für Upgrade/Downgrade

## UX-Anforderungen
- Alles soll sich anfühlen wie eine simple, übersichtliche Tabelle – kein Buchhaltungs-Look, sondern eher wie ein cleanes Spreadsheet-Tool (Vorbild: Notion/Linear-Ästhetik)
- Inline-Editing der Zahlen direkt in der Tabelle (Klick auf Zelle → editierbar)
- Automatische Neuberechnung von "Rest zum Ausgeben" und "Konten" in Echtzeit
- Negative Werte bei "Rest zum Ausgeben" visuell hervorheben (z. B. rot), damit sofort sichtbar ist, wenn man ins Minus rutscht
- Mobile-responsive, auch wenn Haupt-Use-Case Desktop ist

## Auftrag an Claude Code
1. Setze das Projekt-Grundgerüst auf (Next.js + TypeScript + Tailwind + Supabase-Client + Stripe-Integration)
2. Entwirf das Datenbankschema (Users, Subscriptions/Tarif, Jahre, Fixkosten-Kategorien, Sparpockets, monatliche Werte)
3. Baue die Landingpage inkl. Pricing-Sektion
4. Baue Auth-Flow mit Supabase
5. Baue die zentrale Grid/Tabellen-Ansicht mit Inline-Editing und Live-Berechnung
6. Implementiere das Tarif-Feature-Gating (Frontend + Backend-Validierung)
7. Integriere Stripe für Checkout und Customer Portal (3 Preis-Produkte)
8. Sorge für ein cleanes, konsistentes Design-System (Farben, Typografie, Spacing) über das ganze Produkt hinweg

Frage nach, falls für die Umsetzung wichtige Details fehlen (z. B. konkrete Preise pro Tarif, Zahlungsanbieter-Präferenz, gewünschter Produktname/Branding).
