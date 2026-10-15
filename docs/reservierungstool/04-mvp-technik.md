# 04 – MVP & Technik

## 1. MVP-Umfang

**Im MVP enthalten**
- Restaurant-Registrierung und Onboarding-Assistent
- Öffentliche Buchungsseite unter eigenem Link, QR-Code-Download
- Slot-Berechnung mit Kapazitätsprüfung
- Bestätigung per E-Mail und SMS, Link zum Stornieren/Ändern
- Erinnerung 24 h vorher
- Handy-Dashboard: Tagesansicht, manuelle Eingabe, Sperrzeiten, Status
- Web-Push oder E-Mail-Benachrichtigung bei neuer Buchung

**Nicht im MVP**
- Zahlungen/Anzahlung, Statistiken, Mehrfachstandorte, Teamrollen
- Google-/Instagram-Integration, Entdeckungsportal
- WhatsApp (zunächst SMS, WhatsApp als Fast-Follower)

## 2. Architektur

```
Gast (Browser)                    Wirt (Browser / PWA)
     │                                   │
     ▼                                   ▼
┌─────────────────────────────────────────────┐
│ Next.js (App Router, TypeScript)            │
│  • /r/[slug]        öffentliche Buchung     │
│  • /embed/[slug]    Widget (iframe)         │
│  • /dashboard       Wirt (Auth)             │
│  • /api/...         Route Handlers          │
└──────────┬───────────────────┬──────────────┘
           │                   │
           ▼                   ▼
   PostgreSQL (Supabase)   Jobs / Cron
   + Row Level Security    (Erinnerungen, Cleanup)
           │                   │
           └──────┬────────────┘
                  ▼
        SMS/E-Mail-Anbieter (z. B. Twilio, Resend)
```

**Stack-Empfehlung** (passt zum bestehenden Repo-Stack Next.js + Supabase + Tailwind)

| Bereich | Wahl | Begründung |
|---|---|---|
| Frontend/Backend | Next.js + TypeScript | schnell, ein Deployment |
| Datenbank/Auth | Supabase (Postgres) | RLS, Auth, Realtime inklusive |
| Styling | Tailwind CSS | schnelle, konsistente UI |
| SMS | Twilio oder vergleichbar | Standard, DACH-Abdeckung |
| E-Mail | Resend o. ä. | einfach, günstig |
| Hosting | Vercel + Supabase (EU-Region) | DSGVO-konforme Region wählen |
| Zahlungen (später) | Stripe | Abos + Anzahlungen |

## 3. Datenmodell (vereinfacht)

```sql
restaurants (
  id uuid pk, owner_id uuid fk -> auth.users,
  slug text unique, name text, address text, phone text,
  timezone text default 'Europe/Berlin',
  default_duration_min int default 90,
  slot_interval_min int default 15,
  min_lead_time_min int default 60,       -- spätestens X Min. vor Termin
  max_days_ahead int default 60,
  max_online_party_size int default 8,    -- darüber: Anfrage
  created_at timestamptz
)

opening_periods (            -- Service-Zeiten, z. B. Mittag/Abend
  id, restaurant_id fk, weekday int (0-6),
  opens time, closes time, last_seating time
)

tables (
  id, restaurant_id fk, label text,
  seats_min int, seats_max int, combinable bool default false
)

blocked_periods (           -- Ruhetage, Feiern, Ferien
  id, restaurant_id fk, starts_at timestamptz, ends_at timestamptz,
  table_id fk null, reason text
)

reservations (
  id uuid pk, restaurant_id fk,
  starts_at timestamptz, ends_at timestamptz,
  party_size int, table_id fk null,
  guest_name text, guest_phone text, guest_email text null,
  note text,
  status text check (status in
    ('pending','confirmed','cancelled','seated','completed','no_show')),
  source text check (source in ('online','manual','widget')),
  manage_token text unique,   -- Link zum Stornieren/Ändern
  created_at timestamptz
)

notifications (
  id, reservation_id fk, kind text,   -- confirm/remind/cancel
  channel text, scheduled_for timestamptz, sent_at timestamptz, status text
)
```

Wichtig
- Alle Zeiten in UTC speichern, Darstellung in der Zeitzone des Restaurants.
- RLS: Wirte sehen nur ihr Restaurant. Gäste greifen nur über `manage_token` zu.
- Gastdaten minimal halten, Löschfristen definieren (siehe Datenschutz-Dokument).

## 4. Slot-Logik (Kern des Produkts)

Eingabe: `restaurant, date, party_size` → Ausgabe: Liste buchbarer Startzeiten.

1. Öffnungszeiten für das Datum laden, `blocked_periods` abziehen.
2. Kandidaten-Starts im Raster `slot_interval_min` zwischen `opens` und `last_seating`.
3. Aufenthaltsdauer bestimmen (Standard, ggf. nach Gruppengröße gestaffelt).
4. Für jeden Kandidaten prüfen, ob eine **Tischzuweisung** existiert:
   - passende Tische (`seats_min ≤ party_size ≤ seats_max`), ohne Überschneidung mit
     bestehenden Reservierungen im Intervall `[start, start + dauer)`,
   - sonst kombinierbare Tische, falls erlaubt.
5. Mindestvorlaufzeit und maximalen Buchungshorizont anwenden.
6. Nur Zeiten mit Zuweisung zurückgeben.

**Vereinfachter Modus** (für Restaurants ohne Tischplan): statt einzelner Tische nur
`Gesamtkapazität` pro Zeitslot. Prüfung: Summe der Personen aller überlappenden
Reservierungen + neue Gruppe ≤ Kapazität. So ist das Setup minimal.

**Race Conditions vermeiden:** Buchung in einer DB-Transaktion mit Sperre auf Restaurant
und Zeitfenster (z. B. `SELECT ... FOR UPDATE` bzw. Advisory Lock pro Restaurant),
Verfügbarkeit in der Transaktion erneut prüfen, bevor eingefügt wird.

## 5. Benachrichtigungen

| Ereignis | Gast | Wirt |
|---|---|---|
| Neue Buchung | SMS + E-Mail Bestätigung | Push/E-Mail |
| 24 h vorher | SMS Erinnerung + Bestätigen/Stornieren | – |
| Stornierung durch Gast | Bestätigung | Push |
| Stornierung durch Wirt | SMS mit Entschuldigung | – |

Versand über eine Queue-Tabelle (`notifications`) und einen Cron-Worker (z. B. minütlich).
Idempotent, mit Wiederholungen und Fehlerstatus.

## 6. Widget / Embed

```html
<script src="https://tisch.app/widget.js" data-restaurant="trattoria-rossi" async></script>
```

- Lädt einen Button oder inline-Formular, öffnet die Buchung als Overlay (iframe).
- Farbe und Sprache über `data-`-Attribute konfigurierbar.
- Keine Cookies auf Kundenseiten ohne Einwilligung (Datenschutz).

## 7. Qualität & Sicherheit

- Rate-Limiting und Captcha (z. B. Cloudflare Turnstile) gegen Spam-Buchungen.
- SMS-Verifizierung optional bei Verdacht auf Missbrauch.
- Eingabevalidierung serverseitig, Telefonnummern normalisieren (E.164).
- Tests: Unit-Tests für Slot-Logik (viele Randfälle), E2E für Buchungsfluss.
- Barrierefreiheit: Tastaturbedienung, Kontraste, Screenreader-Labels.
- Mehrsprachigkeit von Anfang an (i18n), zunächst DE, dann EN.

## 8. Roadmap

| Meilenstein | Inhalt | Dauer (grob) |
|---|---|---|
| M1 | Datenmodell, Auth, Onboarding, Slot-Logik inkl. Tests | 2 Wochen |
| M2 | Öffentliche Buchungsseite, Bestätigung per E-Mail | 1–2 Wochen |
| M3 | Dashboard (Tagesansicht, manuelle Buchung, Sperren) | 2 Wochen |
| M4 | SMS, Erinnerungen, Stornolink, Push | 1–2 Wochen |
| M5 | Widget, QR-Code, Polishing, Pilot-Start | 1 Woche |
| Danach | Zahlungen, Statistiken, WhatsApp, Google-Integration | laufend |
