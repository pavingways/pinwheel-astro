import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import AutoImport from "astro-auto-import";
import { defineConfig } from "astro/config";
import remarkCollapse from "remark-collapse";
import remarkToc from "remark-toc";
import config from "./src/config/config.json";

// https://astro.build/config
export default defineConfig({
  i18n: {
    defaultLocale: "en",
    locales: [
      {
        path: "en",
        codes: ["en", "en-US", "en-GB", "en-CA"],
        name: "English",
        flag: "🇺🇸"
      }, {
        path: "de",
        codes: ["de", "de-CH", "de-DE"],
        name: "Deutsch",
        flag: '🇨🇭🇩🇪'
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
      prefixDefaultLocale: false
    },
    fallback: {
      de: "en",
      // fr: "en",
      // it: "en"
    }
  },
  site: config.site.base_url ? config.site.base_url : "https://skatepark.pilatustools.com",
  base: config.site.base_path ? config.site.base_path : "/",
  trailingSlash: config.site.trailing_slash ? config.site.trailing_slash : "ignore",
  integrations: [
    react(),
    sitemap(),
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
