export interface LocaleDef {
  path: string;
  codes: string[];
  name: string;
  flag?: string;
}

// Languages that have their own URL tree (/de/..., /en/...)
export const SUPPORTED_LANGUAGES = ["de", "en"];

// Name of the cookie / localStorage key that stores the visitor's language.
// Must match the inline scripts in Base.astro and pages/index.astro.
export const LANGUAGE_STORAGE_KEY = "language_selection";

// Prefix a site-relative URL with a locale: localizeUrl("/blog/", "de") -> "/de/blog/"
export function localizeUrl(url: string, locale?: string): string {
  const lang = locale && SUPPORTED_LANGUAGES.includes(locale) ? locale : "de";
  const path = url.startsWith("/") ? url : `/${url}`;
  return path === "/" ? `/${lang}/` : `/${lang}${path}`;
}

// German page slugs and their real English counterparts (only pages that
// exist in both languages — fallback redirect routes are deliberately absent)
const DE_TO_EN_PAGES: Record<string, string> = {
  ueberuns: "about",
  impressum: "imprint",
  datenschutz: "privacy",
};

// For a given pathname, return the URL of the page in each language,
// or null when no real translation exists (e.g. /de/technologien).
// Blog posts are single-language (language frontmatter decides the tree),
// so only the blog index and the category pages pair up 1:1.
export function getHreflangAlternates(
  pathname: string
): { de: string; en: string } | null {
  const clean = pathname.replace(/^\/+|\/+$/g, "");
  const [locale, ...rest] = clean.split("/");
  if (!SUPPORTED_LANGUAGES.includes(locale)) return null;
  const subpath = rest.join("/");

  let de: string | null = null;
  let en: string | null = null;

  if (subpath === "") {
    de = "";
    en = "";
  } else if (subpath === "blog" || subpath === "categories" || subpath.startsWith("categories/")) {
    de = subpath;
    en = subpath;
  } else if (locale === "de" && subpath in DE_TO_EN_PAGES) {
    de = subpath;
    en = DE_TO_EN_PAGES[subpath];
  } else if (locale === "en") {
    const pair = Object.entries(DE_TO_EN_PAGES).find(([, enSlug]) => enSlug === subpath);
    if (pair) {
      de = pair[0];
      en = subpath;
    }
  }

  if (de === null || en === null) return null;
  const format = (lang: string, slug: string) => (slug ? `/${lang}/${slug}/` : `/${lang}/`);
  return { de: format("de", de), en: format("en", en) };
}
