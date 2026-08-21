import { cookies } from "next/headers";
import { DEFAULT_LOCALE, LOCALE_COOKIE, isValidLocale, type Locale } from "@/lib/i18n/locales";

export function getServerLocale(): Locale {
  const cookieValue = cookies().get(LOCALE_COOKIE)?.value;
  return isValidLocale(cookieValue) ? cookieValue : DEFAULT_LOCALE;
}
