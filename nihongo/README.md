# Mochi Nihongo 🍡

Moderne, klare Lern-App für Japanisch (Hiragana & Katakana) nach Stephen Krashens Natural Approach.
Reines HTML/CSS/JS – kein Build nötig, installierbar als PWA, Fortschritt nur lokal (localStorage).

## Starten
```
cd nihongo && python3 -m http.server 8000   # dann http://localhost:8000
```

## Aufbau
- `js/data.js` – Kana mit Merkbildern, Wörter, Geschichten, Methodentexte
- `js/illus.js` – SVG-Illustrationen (Maskottchen „Mochi“)
- `js/app.js` – Router, Onboarding, Lektionen, Quiz, Wiederholung (Leitner), Geschichten

## Methode
Input-Hypothese (i+1: Wörter/Geschichten nach Kenntnisstand), affektiver Filter (keine Timer/Leben/Strafen),
Monitor (Tipps freiwillig), natürliche Reihenfolge (leicht → schwer), stille Phase (erst Hören/Lesen).
Ergänzend: Merkbilder (Dual Coding) und Spaced Repetition. Details in der App unter „Methode“.
