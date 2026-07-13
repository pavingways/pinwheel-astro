import i18nAll from "../i18n.json";

export interface LocaleDef {
  path: string;
  codes: string[];
  name: string;
  flag?: string;
}

// Languages that have their own URL tree (/de/..., /en/...)
export const SUPPORTED_LANGUAGES = ["de", "en"];

// UI strings for a locale (defaults to "de", the default locale)
export function getI18nStrings(locale?: string): Record<string, any> {
  return locale === "en" ? i18nAll.i18n_en : i18nAll.i18n_de;
}

// Name of the cookie / localStorage key that stores the visitor's language.
// Must match the inline scripts in Base.astro and pages/index.astro.
export const LANGUAGE_STORAGE_KEY = "language_selection";

// Prefix a site-relative URL with a locale: localizeUrl("/blog/", "de") -> "/de/blog/"
export function localizeUrl(url: string, locale?: string): string {
  const lang = locale && SUPPORTED_LANGUAGES.includes(locale) ? locale : "de";
  const path = url.startsWith("/") ? url : `/${url}`;
  return path === "/" ? `/${lang}/` : `/${lang}${path}`;
}

// Ensure a site-relative URL ends with a trailing slash: /en/imprint -> /en/imprint/
export function withTrailingSlash(url: string): string {
  return url.endsWith("/") ? url : `${url}/`;
}

// Structural 1:1 pairs — pages whose slug is identical in both language
// trees (home, blog index, category pages). Pages with diverging slugs
// (/de/impressum vs /en/imprint) and paired blog posts declare their
// counterpart via `translation:` frontmatter instead; the route passes it
// to Base.astro, which prefers it over this fallback.
export function getHreflangAlternates(
  pathname: string
): { de: string; en: string } | null {
  const clean = pathname.replace(/^\/+|\/+$/g, "");
  const [locale, ...rest] = clean.split("/");
  if (!SUPPORTED_LANGUAGES.includes(locale)) return null;
  const subpath = rest.join("/");

  const isStructural =
    subpath === "" ||
    subpath === "blog" ||
    subpath === "categories" ||
    subpath.startsWith("categories/");
  if (!isStructural) return null;

  const format = (lang: string) => (subpath ? `/${lang}/${subpath}/` : `/${lang}/`);
  return { de: format("de"), en: format("en") };
}

// Where the language switcher should send the visitor: the page's own
// translation when one exists, otherwise the nearest sensible index
// (blog pages fall back to the other blog index, everything else to home).
export function getLanguageSwitchUrl(
  lang: string,
  alternates: { de: string; en: string } | null,
  pathname: string
): string {
  const target = alternates?.[lang as "de" | "en"];
  if (target) return target;
  if (/^\/(de|en)\/blog(\/|$)/.test(pathname)) return `/${lang}/blog/`;
  return `/${lang}/`;
}
