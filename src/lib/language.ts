export type Language = "zh" | "en" | "ja";
export type Locale = "zh-CN" | "en-US" | "ja-JP";

const LOCALE_LANGUAGE_MAP: Record<Locale, Language> = {
  "zh-CN": "zh",
  "en-US": "en",
  "ja-JP": "ja",
};

// locale（zh-CN）→ 短码（zh），未匹配时默认 zh
export function toLanguage(locale: string): Language {
  return LOCALE_LANGUAGE_MAP[locale as Locale] || "zh";
}

// 短码（zh）→ locale（zh-CN），未匹配时默认 zh-CN
export function toLocale(lang: Language): Locale {
  const entry = Object.entries(LOCALE_LANGUAGE_MAP).find(([, v]) => v === lang);
  return (entry?.[0] as Locale) || "zh-CN";
}
