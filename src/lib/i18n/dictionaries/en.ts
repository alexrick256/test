import type { Dictionary } from "@/lib/i18n/types";

const en: Dictionary = {
  nav: {
    dashboard: "Yearly view",
    settings: "Settings",
    planSuffix: "plan",
    signOut: "Sign out",
  },
  marketing: {
    nav: { features: "Features", pricing: "Pricing", login: "Log in", getStarted: "Start for free" },
    hero: {
      title: "Your money, one clean plan per year.",
      subtitle:
        "Leviro is the simplest way to plan income, fixed costs, and savings goals month by month – clean like a spreadsheet, smart like a finance coach.",
      ctaPrimary: "Start for free",
      ctaSecondary: "View pricing",
      note: "No credit card required · ready in 2 minutes",
    },
    features: {
      title: "Everything you need for your financial plan",
      items: [
        {
          title: "One year, one view",
          description:
            "Income, fixed costs, and savings goals for a whole calendar year in one table – editable month by month.",
        },
        {
          title: "See what's left instantly",
          description:
            "\"Left to spend\" is calculated live and highlighted in red the moment you go negative.",
        },
        {
          title: "Savings pockets with balances",
          description:
            "Set up savings goals and track the cumulative balance over the year – automatically, no spreadsheet formulas.",
        },
        {
          title: "Work backwards",
          description:
            "Enter your December year-end goal in January and instantly see how much to set aside each month.",
        },
      ],
    },
    pricing: {
      title: "A plan that grows with you",
      subtitle: "Cancel anytime, upgrade or downgrade whenever you like.",
    },
    cta: { title: "Ready for a clear head about money?", button: "Start for free" },
  },
  footer: {
    rights: "All rights reserved.",
    pricing: "Pricing",
    login: "Log in",
  },
  auth: {
    login: { title: "Welcome back", subtitle: "Log in to open your financial plan." },
    signup: { title: "Create your account", subtitle: "Start for free – no payment method required." },
    google: "Continue with Google",
    orEmail: "or with email",
    email: "Email",
    password: "Password",
    passwordHint: "At least 8 characters",
    submitLogin: "Log in",
    submitSignup: "Create account",
    loading: "One moment…",
    noAccount: "Don't have an account?",
    registerLink: "Sign up for free",
    hasAccount: "Already have an account?",
    loginLink: "Log in",
    signupSuccess: "Almost there! Please confirm your email address using the link we just sent you.",
    genericError: "Something went wrong.",
  },
  pricing: {
    plans: {
      free: {
        tagline: "For a first overview of your money.",
        features: ["Income & expenses per month", "Up to 3 fixed-cost categories", "\"Left to spend\" calculated live"],
      },
      pro: {
        tagline: "For anyone who wants to save with a purpose.",
        features: ["Up to 5 fixed-cost categories", "Up to 3 savings pockets", "Account overview with balances"],
      },
      max: {
        tagline: "For full visibility, down to the last detail.",
        features: ["Up to 20 fixed-cost categories", "Up to 20 savings pockets", "Account overview with balances"],
      },
    },
    badge: "Most popular",
    perMonth: "/ month",
    currentPlan: "Current plan",
    downgradeHint: "Downgrade via customer portal",
    switchTo: "Switch to {{plan}}",
    startFree: "Start for free",
    startNow: "Start now",
    redirecting: "Redirecting…",
    checkoutError: "Checkout could not be started.",
    pageTitle: "Pricing",
    pageSubtitle: "Cancel anytime. Upgrade or downgrade whenever you like via the customer portal.",
  },
  dashboard: {
    title: "Yearly view",
    subtitle: "Click a cell to edit income, fixed costs, or savings pockets.",
    addYear: "Add next year",
  },
  grid: {
    income: "Income",
    fixedCosts: "Fixed costs",
    pockets: "Savings pockets",
    remaining: "Left to spend",
    accounts: "Accounts",
    accountPrefix: "Account",
    addCategory: "+ Fixed-cost category",
    addPocket: "+ Savings pocket",
    categoryNamePlaceholder: "e.g. Rent",
    pocketNamePlaceholder: "e.g. Vacation",
    add: "Add",
    cancel: "Cancel",
    delete: "Delete",
    deleteConfirm: "Really delete? All values for this year will be lost.",
    limitReachedCategories: "Limit reached ({{limit}} categories).",
    limitReachedPockets: "Limit reached ({{limit}} savings pockets).",
    upgrade: "Upgrade plan",
    pocketsLocked: "Savings pockets are available from the Pro plan.",
    onboardingTip:
      "Tip: In January, enter how much you'd like to have saved in a pocket by December – the savings calculator below instantly shows how much to set aside each month, and whether that's feasible with your \"left to spend\".",
  },
  savingsCalculator: {
    title: "Savings goal calculator",
    subtitle: "How much do you need to set aside each month to reach your December goal?",
    pocketLabel: "Savings pocket",
    targetLabel: "Goal by December {{year}}",
    targetPlaceholder: "e.g. 2000",
    fromMonthLabel: "Start saving from which month?",
    requiredText: "You need to deposit {{amount}} per month.",
    feasibleText: "Feasible – your \"left to spend\" in {{month}} is enough.",
    notFeasibleText: "Not feasible without adjustments – your \"left to spend\" in {{month}} is only {{amount}}.",
    months: [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December",
    ],
  },
  settings: {
    title: "Settings",
    subtitle: "Manage your categories, savings pockets, and subscription.",
    billing: {
      title: "Subscription",
      currentPlanText: "You're currently on the {{plan}} plan.",
      nextBilling: "Next billing on {{date}}.",
      expiresOn: "Expires on {{date}}.",
      viewPlans: "View plans",
      managePlan: "Manage subscription",
      portalError: "Could not open the customer portal.",
    },
    categories: {
      title: "Fixed-cost categories",
      description: "Freely nameable categories like rent, insurance, or phone contract.",
    },
    pockets: {
      title: "Savings pockets",
      description: "Savings goals like vacation, emergency fund, or a new car.",
      locked: "Savings pockets are available from the Pro plan.",
    },
    manage: {
      empty: "No entries yet.",
      add: "+ Add",
      limitReached: "Limit reached.",
      upgrade: "Upgrade plan",
      delete: "Delete",
      addError: "Could not create entry.",
      renameError: "Could not rename entry.",
      deleteError: "Could not delete entry.",
      cancel: "Cancel",
    },
  },
  onboarding: {
    step1: {
      title: "What's your monthly income?",
      subtitle: "Your average net income available each month.",
      label: "Monthly income",
      placeholder: "e.g. 3200",
      next: "Next",
    },
    step2: {
      title: "What fixed costs do you have?",
      subtitle: "Pick the categories that fit or add your own. Amounts can be adjusted anytime.",
      presets: { rent: "Rent", electricity: "Electricity", phone: "Phone", internet: "Internet" },
      customPlaceholder: "Custom category",
      addCustom: "+ Custom category",
      amountPlaceholder: "Amount",
      back: "Back",
      next: "Next",
    },
    step3: {
      title: "How much do you want to save each month?",
      subtitle: "A fixed amount that will automatically become a savings pocket.",
      tip: "Rule of thumb: set aside about 20% of your income – that would be {{amount}} per month here.",
      applySuggestion: "Use suggestion",
      label: "Monthly savings amount",
      placeholder: "e.g. 400",
      pocketName: "Savings",
      freeNotice:
        "Savings pockets aren't saved on the Free plan. Upgrade to Pro to automatically track your savings goal.",
      back: "Back",
      finish: "Finish",
      skip: "Skip",
    },
    progress: "Step {{current}} of {{total}}",
  },
};

export default en;
