import { getServerLocale } from "@/lib/i18n/get-locale.server";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getPath, interpolate } from "@/lib/i18n/format";

export function getServerTranslator() {
  const locale = getServerLocale();
  const dict = getDictionary(locale);

  function t(key: string, vars?: Record<string, string | number>): string {
    const value = getPath(dict, key);
    if (typeof value !== "string") return key;
    return interpolate(value, vars);
  }

  function tList<T = string>(key: string): T[] {
    const value = getPath(dict, key);
    return Array.isArray(value) ? value : [];
  }

  return { locale, t, tList };
}
