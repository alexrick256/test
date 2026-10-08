# Mochi Nihongo 🍡

Japanisch spielerisch erwerben (nach Stephen Krashens Natural Approach). Reines HTML/CSS/JS, kein Build, installierbar als PWA, Fortschritt nur lokal.

## Starten
```
cd nihongo && python3 -m http.server 8000   # dann http://localhost:8000
```

## Inhalte (alles in `js/data.js` erweiterbar)
- **Schrift:** Hiragana & Katakana (mit Merkbildern) und 233 Kanji von N5 bis N1 (Sätze à 5, mit Beispielwort)
- **Sprache:** 24 Themen (Alltag, Reisen, Anime, Arbeit, Kultur …) und 9 Geschichten, verteilt auf N5–N1
- **Dashboard:** Tagesziel in Minuten (aktive Lernzeit), Fortschrittsringe je JLPT-Stufe, Tagesaufgaben, Wochenverlauf
- Schrift und Sprache sind getrennte Lernwege; Ziele (Alltag, Reisen, Anime …) und Niveau steuern die Empfehlungen
- Hinweis: kuratierte Auswahl, kein vollständiger JLPT-Wortschatz (N1 bräuchte >2.000 Kanji)

## Lernlogik
- **Erst lernen, dann Test:** Entdecken → Üben → benoteter Test (Note 1–6, bestanden ab Note 3) mit Wiederholungen aus früher Gelerntem. Fortschritt zählt erst nach bestandenem Test.
- **Stufen nacheinander:** N5 → N4 → … → N1; die nächste Stufe wird erst nach 100 % der vorherigen freigeschaltet.
- **Schreiben:** Strichfolge mit Zahlen und Pfeilen, Nachzeichnen oder aus dem Kopf, Benotung nach Genauigkeit von Form, Reihenfolge und Richtung. Strichdaten: [KanjiVG](https://kanjivg.tagaini.net) © Ulrich Apel, CC BY-SA 3.0 (`js/strokes.js`).
- **Sprechen:** Web Speech API (`ja-JP`) erkennt die Aussprache, die App benotet die Übereinstimmung. Funktioniert in Chrome/Edge/Safari über HTTPS, nicht in jeder Vorschau.

## Tagesring & Wochenring
- **Täglich:** vier Fertigkeiten (Hören, Lesen, Sprechen, Schreiben), getrennt üben unter `#/skill/<name>`. Punkte nur für richtige Leistungen, pro Aufgabenart und Inhalt höchstens einmal am Tag. Ohne Spracherkennung entfällt „Sprechen“.
- **Woche:** Tage mit geschlossenem Tagesring (Standard 5 von 7, einstellbar).
- **Wiederholung:** Boxen 1–7 mit +18 h, 3, 7, 14, 30, 60, 120 Tagen; Fehler holen den Eintrag nach 10 Minuten zurück. Gelesene Geschichten kommen satzweise in die Wiederholung. Bei mehr als 25 fälligen Einträgen pausiert Neues.
