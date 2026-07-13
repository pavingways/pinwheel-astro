import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import AutoImport from "astro-auto-import";
import { defineConfig } from "astro/config";
import fs from "node:fs";
import path from "node:path";
import remarkCollapse from "remark-collapse";
import remarkToc from "remark-toc";
import config from "./src/config/config.json";

// Posts only exist under their own language tree (/de/blog or /en/blog),
// so each old unprefixed /blog/<slug> URL needs an explicit per-post target.
// (cwd, not import.meta.url: the config is re-bundled under dist/ at build time)
const blogDir = path.resolve(process.cwd(), "src/content/blog");
const blogRedirects = {};
for (const file of fs.readdirSync(blogDir)) {
  if (!file.endsWith(".mdx") || file.startsWith("-")) continue;
  const slug = file.replace(/\.mdx$/, "");
  const frontmatter = fs.readFileSync(path.join(blogDir, file), "utf8");
  // drafts are not built, so a redirect would point at a 404
  if (/^draft:\s*true/m.test(frontmatter)) continue;
  const match = frontmatter.match(/^language:\s*["']?([A-Za-z-]+)/m);
  const lang = match && match[1].toLowerCase().startsWith("en") ? "en" : "de";
  blogRedirects[`/blog/${slug}`] = `/${lang}/blog/${slug}`;
}

// https://astro.build/config
export default defineConfig({
  output: "static",
  i18n: {
    defaultLocale: "de",
    locales: [
      {
        path: "de",
        codes: ["de", "de-CH", "de-DE"],
        name: "Deutsch",
        flag: '🇨🇭🇩🇪'
      }, {
        path: "en",
        codes: ["en", "en-US", "en-GB", "en-CA"],
        name: "English",
        flag: "🇺🇸"
      // }, {
      //   path: "fr",
      //   codes: ["fr", "fr-BR", "fr-CA"],
      //   name: "Français",
      //   flag: "🇫🇷"
      // }, {
      //   path: "it",
      //   codes: ["it", "it-IT"],
      //   name: "Italiano",
      //   flag: "🇮🇹"
      }],
    routing: {
      prefixDefaultLocale: true,
      // keep our own language-detecting page at "/" instead of a forced redirect
      redirectToDefaultLocale: false
    }
    // no fallback: en -> de. It generated noindex redirect stubs (e.g.
    // /en/technologien -> /de/technologien) and they shadow real pages that
    // share the same route pattern, like /en/categories/[category].
  },
  // Old unprefixed German URLs moved to /de/... — the static build generates
  // meta-refresh redirect pages for them (GitHub Pages has no server redirects)
  redirects: {
    "/technologien": "/de/technologien",
    "/datenschutz": "/de/datenschutz",
    "/impressum": "/de/impressum",
    "/ueberuns": "/de/ueberuns",
    "/mobile-apps-fuer-digitalagenturen": "/de/mobile-apps-fuer-digitalagenturen",
    "/mobile-apps-fuer-kmu-und-startups": "/de/mobile-apps-fuer-kmu-und-startups",
    "/enterprise-mobile-apps": "/de/enterprise-mobile-apps",
    "/blog": "/de/blog",
    // old paginated lists were dominated by English posts and the German
    // tree no longer paginates (6 posts) — send them to the English pages
    "/blog/page/[slug]": "/en/blog/page/[slug]",
    ...blogRedirects,
    "/categories": "/de/categories",
    "/categories/[category]": "/de/categories/[category]"
  },
  site: config.site.base_url ? config.site.base_url : "https://pumptrack.pilatustools.com",
  base: config.site.base_path ? config.site.base_path : "/",
  trailingSlash: "ignore",
  integrations: [
    react(),
    sitemap({
      // /fr/ and /it/ are meta-refresh stubs to /de/, not real pages
      filter: (page) => !/\/(fr|it)\/$/.test(page),
      i18n: {
        defaultLocale: "de",
        locales: {
          de: "de",
          en: "en"
        }
      }
    }),
    tailwind({
      config: {
        applyBaseStyles: false
      }
    }),
    AutoImport({
      imports: [
        "@shortcodes/Button",
        "@shortcodes/Accordion",
        "@shortcodes/Notice",
        "@shortcodes/Video",
        "@shortcodes/Youtube",
        "@shortcodes/Blockquote",
        "@shortcodes/Badge",
        "@shortcodes/ContentBlock",
        "@shortcodes/Changelog"
      ]
    }),
    mdx()
  ],
  markdown: {
    remarkPlugins: [
      remarkToc,
      [
        remarkCollapse,
        {
          test: "Table of contents"
        }
      ]
    ],
    shikiConfig: {
      theme: "one-dark-pro",
      wrap: true
    },
    extendDefaultPlugins: true
  }
});
