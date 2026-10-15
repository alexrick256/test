# 05 – Risiken, Datenschutz, offene Fragen

## 1. Risiken

| Risiko | Wahrscheinlichkeit | Wirkung | Gegenmaßnahme |
|---|---|---|---|
| Wirte wechseln nicht vom Telefon | hoch | hoch | Telefon voll integrieren (manuelle Eingabe), Vor-Ort-Onboarding |
| Etablierte Anbieter senken Preise | mittel | mittel | Einfachheit, Fixpreis, lokale Nähe, schneller Support |
| Google bündelt Reservierung selbst | mittel | hoch | Als Backend-Partner integrieren statt konkurrieren |
| Spam-/Fake-Buchungen | mittel | mittel | Captcha, Rate-Limit, SMS-Verifizierung bei Verdacht |
| SMS-Kosten fressen Marge | mittel | mittel | Kontingent, E-Mail/WhatsApp-Alternativen, Preisanpassung |
| Doppelbuchungen durch Race Conditions | gering | hoch | Transaktionen/Locks, Tests unter Last |
| Wirte nutzen Tool nach 2 Wochen nicht mehr | mittel | hoch | Aktivierungs-Check, Anruf nach Woche 1, Push-Erinnerungen |
| Zahlungsbereitschaft zu gering | mittel | hoch | Früh validieren, Free-Tarif als Einstieg, Wert über No-Show-Ersparnis zeigen |

## 2. Datenschutz (DSGVO)

**Rollen**
- Restaurant = Verantwortlicher für seine Gästedaten.
- Wir = Auftragsverarbeiter → **AV-Vertrag (Art. 28 DSGVO)** mit jedem Restaurant,
  automatisch beim Onboarding akzeptiert.

**Datensparsamkeit**
- Pflicht: Name, Handynummer, Zeit, Personenzahl. Optional: E-Mail, Hinweise.
- Keine Werbenutzung der Gästedaten, kein Weiterverkauf.

**Einwilligung und Transparenz**
- Hinweis zur Verarbeitung im Buchungsformular, Link zur Datenschutzerklärung des Restaurants.
- SMS-Erinnerungen dienen der Vertragsdurchführung. Marketing-SMS nur mit gesonderter Einwilligung.

**Löschfristen** (zu bestätigen mit Rechtsberatung)
- Reservierungsdaten nach z. B. 90 Tagen anonymisieren oder löschen,
  sofern keine Aufbewahrungspflicht besteht.
- Gast kann über den Verwaltungslink Löschung verlangen.

**Technisch**
- Hosting in der EU, Verschlüsselung im Transit und at-rest.
- Zugriffskontrolle über RLS, Audit-Log für Zugriffe im Dashboard.
- Subunternehmerliste (Hosting, SMS, E-Mail) offenlegen.

**Widget**
- Keine Tracking-Cookies, kein Third-Party-Tracking.
- Impressum und Datenschutz-Links im Widget.

> Dies ist keine Rechtsberatung. Vor dem Launch sollten AV-Vertrag, Datenschutzerklärung
> und Löschkonzept juristisch geprüft werden.

## 3. Rechtliches (Kurzliste)

- Allgemeine Geschäftsbedingungen und Impressum
- AV-Vertrag
- Regelung zu Anzahlung/Stornogebühren (Verantwortung beim Restaurant, Muster-Text bereitstellen)
- TKG/UWG-Vorgaben für SMS-Kommunikation prüfen
- Markenrecherche zum Namen "Tisch" (Arbeitstitel) vor Launch

## 4. Offene Fragen

1. **Name und Marke:** Passt "Tisch" oder ist die Domain/Marke nicht verfügbar?
2. **Region zuerst:** Welche Stadt oder welches Land für die Pilotphase?
3. **Tischplan vs. Kapazität:** Reicht der vereinfachte Modus für die Mehrheit?
4. **SMS vs. WhatsApp:** Was akzeptieren Gäste lieber, was kostet weniger?
5. **Preis:** Welcher Preis erzeugt Zahlungsbereitschaft ohne Hürde? (Pilotgespräche)
6. **Team:** Solo-Gründung oder mit Vertriebspartner (Vor-Ort-Verkauf ist entscheidend)?
7. **Finanzierung:** Bootstrapping oder Förderprogramme?

## 5. Nächste Schritte

1. 20–30 Wirtsgespräche führen (Fragenkatalog siehe Go-to-Market, Phase 0).
2. Klick-Dummy der Buchungsseite und Landingpage mit Warteliste.
3. Namens- und Domainprüfung.
4. Entscheidung über Tischplan-/Kapazitätsmodell.
5. MVP-Entwicklung nach Roadmap (M1–M5) starten.
