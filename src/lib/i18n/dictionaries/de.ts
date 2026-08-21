import type { Dictionary } from "@/lib/i18n/types";

const de: Dictionary = {
  nav: {
    dashboard: "Jahresansicht",
    settings: "Einstellungen",
    planSuffix: "Tarif",
    signOut: "Abmelden",
  },
  marketing: {
    nav: { features: "Funktionen", pricing: "Preise", login: "Anmelden", getStarted: "Kostenlos starten" },
    hero: {
      title: "Dein Geld, ein sauberer Plan pro Jahr.",
      subtitle:
        "Leviro ist die einfachste Art, Einnahmen, Fixkosten und Sparziele Monat für Monat zu planen – clean wie ein Spreadsheet, smart wie ein Finanzcoach.",
      ctaPrimary: "Kostenlos starten",
      ctaSecondary: "Preise ansehen",
      note: "Keine Kreditkarte nötig · in 2 Minuten startklar",
    },
    features: {
      title: "Alles, was du für deinen Finanzplan brauchst",
      items: [
        {
          title: "Ein Jahr, ein Blick",
          description:
            "Einnahmen, Fixkosten und Sparziele für ein ganzes Kalenderjahr in einer Tabelle – Monat für Monat editierbar.",
        },
        {
          title: "Sofort sehen, was übrig bleibt",
          description:
            "„Rest zum Ausgeben“ wird live berechnet und in Rot hervorgehoben, sobald du ins Minus rutschst.",
        },
        {
          title: "Sparpockets mit Kontoständen",
          description:
            "Lege Sparziele an und verfolge den kumulierten Kontostand über das Jahr – automatisch, ohne Excel-Formeln.",
        },
        {
          title: "Rückwärts rechnen",
          description:
            "Trag im Januar dein Jahresziel für Dezember ein und sieh sofort, wie viel du monatlich beiseitelegen musst.",
        },
      ],
    },
    pricing: {
      title: "Ein Tarif, der mit dir wächst",
      subtitle: "Monatlich kündbar, jederzeit up- oder downgradebar.",
    },
    cta: { title: "Bereit für einen klaren Kopf beim Geld?", button: "Kostenlos starten" },
  },
  footer: {
    rights: "Alle Rechte vorbehalten.",
    pricing: "Preise",
    login: "Anmelden",
  },
  auth: {
    login: { title: "Willkommen zurück", subtitle: "Melde dich an, um deinen Finanzplan zu öffnen." },
    signup: { title: "Konto erstellen", subtitle: "Kostenlos starten – kein Zahlungsmittel nötig." },
    google: "Mit Google fortfahren",
    orEmail: "oder mit E-Mail",
    email: "E-Mail",
    password: "Passwort",
    passwordHint: "Mindestens 8 Zeichen",
    submitLogin: "Anmelden",
    submitSignup: "Konto erstellen",
    loading: "Einen Moment…",
    noAccount: "Noch kein Konto?",
    registerLink: "Kostenlos registrieren",
    hasAccount: "Bereits ein Konto?",
    loginLink: "Anmelden",
    signupSuccess:
      "Fast geschafft! Bitte bestätige deine E-Mail-Adresse über den Link, den wir dir geschickt haben.",
    genericError: "Etwas ist schiefgelaufen.",
  },
  pricing: {
    plans: {
      free: {
        tagline: "Für den ersten Überblick über dein Geld.",
        features: [
          "Einnahmen & Ausgaben pro Monat",
          "Bis zu 5 Fixkosten-Kategorien",
          "„Rest zum Ausgeben“ live berechnet",
        ],
      },
      pro: {
        tagline: "Für alle, die gezielt sparen wollen.",
        features: ["Bis zu 10 Fixkosten-Kategorien", "Bis zu 3 Sparpockets", "Konten-Übersicht mit Kontoständen"],
      },
      max: {
        tagline: "Für den vollen Durchblick, jedes Detail.",
        features: [
          "Bis zu 20 Fixkosten-Kategorien",
          "Bis zu 20 Sparpockets",
          "Konten-Übersicht mit Kontoständen",
        ],
      },
    },
    badge: "Beliebteste Wahl",
    perMonth: "/ Monat",
    currentPlan: "Aktueller Tarif",
    downgradeHint: "Downgrade über Kundenportal",
    switchTo: "Zu {{plan}} wechseln",
    startFree: "Kostenlos starten",
    startNow: "Jetzt starten",
    redirecting: "Weiterleitung…",
    checkoutError: "Checkout konnte nicht gestartet werden.",
    pageTitle: "Preise",
    pageSubtitle: "Monatlich kündbar. Up- und Downgrade jederzeit über das Kundenportal.",
  },
  dashboard: {
    title: "Jahresansicht",
    subtitle: "Klicke auf eine Zelle, um Einnahmen, Fixkosten oder Sparpockets zu bearbeiten.",
    addYear: "Nächstes Jahr hinzufügen",
  },
  grid: {
    income: "Einnahmen",
    fixedCosts: "Fixkosten",
    pockets: "Sparpockets",
    remaining: "Rest zum Ausgeben",
    accounts: "Konten",
    accountPrefix: "Konto",
    addCategory: "+ Fixkosten-Kategorie",
    addPocket: "+ Sparpocket",
    categoryNamePlaceholder: "z. B. Miete",
    pocketNamePlaceholder: "z. B. Urlaub",
    add: "Hinzufügen",
    cancel: "Abbrechen",
    delete: "Löschen",
    deleteConfirm: "Wirklich löschen? Alle Werte in diesem Jahr gehen verloren.",
    limitReachedCategories: "Limit erreicht ({{limit}} Kategorien).",
    limitReachedPockets: "Limit erreicht ({{limit}} Sparpockets).",
    upgrade: "Tarif upgraden",
    pocketsLocked: "Sparpockets sind ab dem Pro-Tarif verfügbar.",
    onboardingTip:
      "Tipp: Trag im Januar direkt ein, wie viel du bis Dezember in einem Sparpocket angespart haben möchtest – der Sparziel-Rechner unten zeigt dir sofort, wie viel du pro Monat beiseitelegen musst und ob das mit deinem „Rest zum Ausgeben“ machbar ist.",
  },
  savingsCalculator: {
    title: "Sparziel-Rechner",
    subtitle: "Wie viel musst du monatlich beiseitelegen, um dein Jahresziel im Dezember zu erreichen?",
    pocketLabel: "Sparpocket",
    targetLabel: "Ziel bis Dezember {{year}}",
    targetPlaceholder: "z. B. 2000",
    fromMonthLabel: "Ab welchem Monat sparen?",
    requiredText: "Du musst {{amount}} pro Monat einzahlen.",
    feasibleText: "Machbar – „Rest zum Ausgeben“ im {{month}} reicht aus.",
    notFeasibleText: "Nicht machbar ohne Anpassung – „Rest zum Ausgeben“ im {{month}} beträgt nur {{amount}}.",
    months: [
      "Januar", "Februar", "März", "April", "Mai", "Juni",
      "Juli", "August", "September", "Oktober", "November", "Dezember",
    ],
  },
  settings: {
    title: "Einstellungen",
    subtitle: "Verwalte deine Kategorien, Sparpockets und dein Abo.",
    billing: {
      title: "Abo",
      currentPlanText: "Du bist aktuell im {{plan}}-Tarif.",
      nextBilling: "Nächste Abrechnung am {{date}}.",
      expiresOn: "Läuft am {{date}} aus.",
      viewPlans: "Tarife ansehen",
      managePlan: "Abo verwalten",
      portalError: "Kundenportal konnte nicht geöffnet werden.",
    },
    categories: {
      title: "Fixkosten-Kategorien",
      description: "Frei benennbare Kategorien wie Miete, Versicherung oder Handyvertrag.",
    },
    pockets: {
      title: "Sparpockets",
      description: "Sparziele wie Urlaub, Notgroschen oder ein neues Auto.",
      locked: "Sparpockets sind ab dem Pro-Tarif verfügbar.",
    },
    currency: {
      title: "Währung",
      description: "In welcher Währung sollen Beträge in Leviro angezeigt werden?",
    },
    manage: {
      empty: "Noch keine Einträge.",
      add: "+ Hinzufügen",
      limitReached: "Limit erreicht.",
      upgrade: "Tarif upgraden",
      delete: "Löschen",
      addError: "Fehler beim Anlegen.",
      renameError: "Fehler beim Umbenennen.",
      deleteError: "Fehler beim Löschen.",
      cancel: "Abbrechen",
    },
  },
  onboarding: {
    close: "Schließen",
    currency: "Währung",
    step1: {
      title: "Wie hoch sind deine monatlichen Einnahmen?",
      subtitle: "Dein Netto-Einkommen, das dir im Schnitt pro Monat zur Verfügung steht.",
      label: "Monatliche Einnahmen",
      placeholder: "z. B. 3200",
      next: "Weiter",
    },
    step2: {
      title: "Welche Fixkosten hast du?",
      subtitle: "Wähle passende Kategorien aus oder füge eigene hinzu. Beträge kannst du jederzeit anpassen.",
      presets: { rent: "Miete", electricity: "Strom", phone: "Handy", internet: "Internet" },
      customPlaceholder: "Eigene Kategorie",
      addCustom: "+ Eigene Kategorie",
      amountPlaceholder: "Betrag",
      back: "Zurück",
      next: "Weiter",
    },
    step3: {
      title: "Wie viel möchtest du monatlich sparen?",
      subtitle: "Ein fester Betrag, der dir automatisch als Sparpocket angelegt wird.",
      tip: "Faustregel: Lege ca. 20% deiner Einnahmen zurück – das wären hier {{amount}} im Monat.",
      applySuggestion: "Vorschlag übernehmen",
      label: "Monatlicher Sparbetrag",
      placeholder: "z. B. 400",
      pocketName: "Sparen",
      freeNotice:
        "Im Free-Tarif werden Sparpockets nicht gespeichert. Upgrade auf Pro, um dein Sparziel automatisch zu verfolgen.",
      back: "Zurück",
      finish: "Fertig",
      skip: "Überspringen",
    },
    progress: "Schritt {{current}} von {{total}}",
  },
};

export default de;
