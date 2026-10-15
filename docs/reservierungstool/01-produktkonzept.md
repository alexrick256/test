# 01 – Produktkonzept

## 1. Problem

Viele Restaurants nehmen Reservierungen noch per Telefon, WhatsApp oder Zettel entgegen.

**Seite der Restaurants**
- Telefon klingelt im Service-Stress; verpasste Anrufe sind verlorene Gäste.
- Doppelbuchungen und Übertragungsfehler bei Zettelwirtschaft.
- No-Shows kosten Umsatz und lassen sich ohne Erinnerung kaum verhindern.
- Bestehende Tools (OpenTable, TheFork, Resy) sind zu teuer, zu komplex
  oder verlangen eine Provision pro Gast und machen abhängig von einer Plattform.

**Seite der Gäste**
- Sie wollen spontan und außerhalb der Öffnungszeiten buchen.
- Sie wollen keinen Account anlegen und keine App installieren.
- Sie vergessen Termine, wenn sie keine Erinnerung bekommen.

## 2. Zielgruppe

**Primär:** Inhabergeführte Restaurants mit 20–60 Plätzen, 1–3 Standorte,
kein eigenes IT-Personal, aktuell Telefon/WhatsApp/Zettel oder ein veraltetes Tool.

**Sekundär:** Cafés, Bars, Bistros und Hotelrestaurants.

**Nicht im Fokus (zunächst):** Ketten, Gastronomie mit Tischmanagement per Kasse
(POS-Integration), Fine Dining mit komplexem Event- und Menü-Booking.

**Personas**

- *Maria, 48, Inhaberin eines italienischen Restaurants (40 Plätze).*
  Will weniger Telefonstress, keine Technik-Einarbeitung, keine Provision.
- *Jonas, 29, Gast.* Will auf dem Handy in unter 15 Sekunden einen Tisch haben.

## 3. Leitprinzipien

1. **Zero Friction für Gäste:** kein Account, keine App, maximal 4 Eingabeschritte.
2. **Setup in 5 Minuten:** Öffnungszeiten, Tische, Slot-Dauer. Mehr nicht.
3. **Überall einbettbar:** Link, QR-Code, ein Script-Tag fürs Widget.
4. **Mobile first:** Das Dashboard des Wirts ist ein Handy-Dashboard.
5. **Ehrliche Preise:** Fixpreis statt Provision.
6. **Weniger ist mehr:** Jedes Feature muss den Alltag des Wirts messbar erleichtern.

## 4. Funktionen

### 4.1 Gäste-Buchung (öffentlicher Link / Widget)

1. Datum und Personenzahl wählen.
2. Verfügbare Uhrzeiten sehen (nur tatsächlich buchbare Slots).
3. Name und Handynummer eingeben (optional: Hinweis, z. B. Allergien, Kinderstuhl).
4. Bestätigung per SMS oder WhatsApp mit Link zum Ändern/Stornieren.
5. Erinnerung 24 Stunden vorher mit "Bestätigen / Stornieren"-Link.

**Randfälle**
- Ausgebucht: Warteliste oder alternativer Slot wird vorgeschlagen.
- Große Gruppen (ab konfigurierbarer Größe): Anfrage statt Sofortbuchung.
- Kurzfristig: Buchungen nur bis X Stunden vor Termin (einstellbar).

### 4.2 Restaurant-Dashboard (Handy-first)

- **Tagesansicht:** Liste und Zeitleiste der Reservierungen, Tische, Auslastung.
- **Push-Benachrichtigung** bei neuer, geänderter oder stornierter Reservierung.
- **Telefonreservierung nachtragen** in unter 10 Sekunden.
- **Tag/Slot sperren** (Ruhetag, Betriebsferien, Private Feier).
- **Gast-Status:** erschienen / No-Show / storniert.
- **Notizen** pro Reservierung.

### 4.3 Einrichtung (Onboarding)

1. Restaurantname und Adresse.
2. Öffnungszeiten (mit Mittags-/Abendservice).
3. Tische: Anzahl und Plätze, oder vereinfacht "Gesamtkapazität".
4. Standard-Aufenthaltsdauer (z. B. 90 Min., nach Gruppengröße anpassbar).
5. Link, QR-Code und Embed-Snippet werden sofort angezeigt.

### 4.4 Später (nach MVP)

- Kreditkartengarantie / Anzahlung bei Gruppen oder Stoßzeiten (Stripe)
- Statistiken (Auslastung, No-Show-Quote, Stammgäste)
- Google-Reservierung ("Reserve with Google") und Instagram-Button
- Warteliste mit automatischem Nachrücken
- Mehrere Standorte und Team-Rollen
- Gästeprofile / Stammgast-Erkennung
- Entdeckungsportal ("Tisch finden")

## 5. User Flows

### Gast bucht

```
Link/QR öffnen → Datum + Personen → Uhrzeit wählen
→ Name + Handynummer → Absenden → SMS/WhatsApp-Bestätigung
→ (24h vorher) Erinnerung → erscheint oder storniert per Link
```

### Wirt richtet ein

```
Registrieren (E-Mail) → Restaurantdaten → Öffnungszeiten
→ Tische → Link/QR/Widget erhalten → Link in Google/Instagram eintragen
```

### Wirt nimmt Telefonbuchung auf

```
Dashboard → "+" → Datum/Zeit/Personen/Name → Speichern (Slot wird belegt)
```

## 6. Abgrenzung (Was wir bewusst nicht tun)

- Keine Gäste-App und kein Gäste-Login im MVP.
- Kein POS-, Kassen- oder Warenwirtschaftsmodul.
- Kein Bestell- oder Liefersystem.
- Kein Bewertungsportal.
