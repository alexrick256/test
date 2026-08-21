export type Dictionary = {
  nav: {
    dashboard: string;
    settings: string;
    planSuffix: string;
    signOut: string;
  };
  marketing: {
    nav: { features: string; pricing: string; login: string; getStarted: string };
    hero: {
      title: string;
      subtitle: string;
      ctaPrimary: string;
      ctaSecondary: string;
      note: string;
    };
    features: {
      title: string;
      items: { title: string; description: string }[];
    };
    pricing: { title: string; subtitle: string };
    cta: { title: string; button: string };
  };
  footer: {
    rights: string;
    pricing: string;
    login: string;
  };
  auth: {
    login: { title: string; subtitle: string };
    signup: { title: string; subtitle: string };
    google: string;
    orEmail: string;
    email: string;
    password: string;
    passwordHint: string;
    submitLogin: string;
    submitSignup: string;
    loading: string;
    noAccount: string;
    registerLink: string;
    hasAccount: string;
    loginLink: string;
    signupSuccess: string;
    genericError: string;
  };
  pricing: {
    plans: {
      free: { tagline: string; features: string[] };
      pro: { tagline: string; features: string[] };
      max: { tagline: string; features: string[] };
    };
    badge: string;
    perMonth: string;
    currentPlan: string;
    downgradeHint: string;
    switchTo: string;
    startFree: string;
    startNow: string;
    redirecting: string;
    checkoutError: string;
    pageTitle: string;
    pageSubtitle: string;
  };
  dashboard: {
    title: string;
    subtitle: string;
    addYear: string;
  };
  grid: {
    income: string;
    fixedCosts: string;
    pockets: string;
    remaining: string;
    accounts: string;
    accountPrefix: string;
    addCategory: string;
    addPocket: string;
    categoryNamePlaceholder: string;
    pocketNamePlaceholder: string;
    add: string;
    cancel: string;
    delete: string;
    deleteConfirm: string;
    limitReachedCategories: string;
    limitReachedPockets: string;
    upgrade: string;
    pocketsLocked: string;
    onboardingTip: string;
  };
  savingsCalculator: {
    title: string;
    subtitle: string;
    pocketLabel: string;
    targetLabel: string;
    targetPlaceholder: string;
    fromMonthLabel: string;
    requiredText: string;
    feasibleText: string;
    notFeasibleText: string;
    months: string[];
  };
  settings: {
    title: string;
    subtitle: string;
    billing: {
      title: string;
      currentPlanText: string;
      nextBilling: string;
      expiresOn: string;
      viewPlans: string;
      managePlan: string;
      portalError: string;
    };
    categories: { title: string; description: string };
    pockets: { title: string; description: string; locked: string };
    currency: { title: string; description: string };
    manage: {
      empty: string;
      add: string;
      limitReached: string;
      upgrade: string;
      delete: string;
      addError: string;
      renameError: string;
      deleteError: string;
      cancel: string;
    };
  };
  onboarding: {
    close: string;
    currency: string;
    step1: {
      title: string;
      subtitle: string;
      label: string;
      placeholder: string;
      next: string;
    };
    step2: {
      title: string;
      subtitle: string;
      presets: { rent: string; electricity: string; phone: string; internet: string };
      customPlaceholder: string;
      addCustom: string;
      amountPlaceholder: string;
      back: string;
      next: string;
    };
    step3: {
      title: string;
      subtitle: string;
      tip: string;
      applySuggestion: string;
      label: string;
      placeholder: string;
      pocketName: string;
      freeNotice: string;
      back: string;
      finish: string;
      skip: string;
    };
    progress: string;
  };
};
