// JSON-LD builders. The Organization node is emitted on every page by
// Base.astro; page types add their own nodes via Base's `schemas` prop.
import config from "@config/config.json";
import social from "@config/social.json";
import i18nAll from "../i18n.json";

const BASE = config.site.base_url;
export const ORG_ID = `${BASE}/#organization`;

function absolute(path: string): string {
  return path.startsWith("http") ? path : `${BASE}${path}`;
}

// PavingWays as ProfessionalService (subtype of Organization/LocalBusiness)
export function organizationSchema() {
  const params = i18nAll.i18n_en["config.params"];
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": ORG_ID,
    name: "PavingWays GmbH",
    legalName: "PavingWays GmbH",
    url: `${BASE}/`,
    logo: absolute(config.site.logo),
    foundingDate: "2006",
    description:
      "Mobile app development for iOS and Android: requirements engineering, development, CI/CD automation with fastlane, app store deployment, maintenance and app marketing. Since 2006.",
    address: {
      "@type": "PostalAddress",
      streetAddress: params.location1,
      postalCode: "6045",
      addressLocality: "Meggen",
      addressRegion: "LU",
      addressCountry: "CH",
    },
    telephone: params.phone,
    email: params.email,
    areaServed: ["CH", "DE"],
    knowsLanguage: ["de", "en"],
    sameAs: [social.linkedin, social.github, social.youtube, social.twitter].filter(Boolean),
  };
}

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absolute(item.path),
    })),
  };
}

export function serviceSchema(opts: { name: string; description?: string; path: string; locale?: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: opts.name,
    description: opts.description,
    url: absolute(opts.path),
    inLanguage: opts.locale ?? "de",
    provider: { "@id": ORG_ID },
    areaServed: ["CH", "DE"],
  };
}

export function personSchema(opts: { name: string; jobTitle: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: opts.name,
    jobTitle: opts.jobTitle,
    worksFor: { "@id": ORG_ID },
  };
}

export function blogPostingSchema(opts: {
  title: string;
  description?: string;
  path: string;
  date?: Date;
  author?: string;
  locale?: string;
  image?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: opts.title,
    description: opts.description,
    url: absolute(opts.path),
    mainEntityOfPage: absolute(opts.path),
    datePublished: opts.date ? opts.date.toISOString() : undefined,
    inLanguage: opts.locale ?? "de",
    image: opts.image ? absolute(opts.image) : undefined,
    author: opts.author
      ? { "@type": "Person", name: opts.author, worksFor: { "@id": ORG_ID } }
      : { "@id": ORG_ID },
    publisher: { "@id": ORG_ID },
  };
}

// strip enough markdown for JSON-LD answer text
function stripMarkdown(md: string): string {
  return md
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[*_`«»]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// Extracts Q/A pairs from a page body's FAQ section:
// an H2 named "Häufige Fragen" / "Frequently asked questions" followed by
// "### question" blocks. Returns null when the page has no FAQ section.
export function faqSchemaFromMarkdown(body: string) {
  // $(?![\s\S]) = absolute end of string (plain $ would match any line end under /m)
  const section = body.match(
    /^##\s+(?:Häufige Fragen|Frequently asked questions)\s*$([\s\S]*?)(?=^##\s|$(?![\s\S]))/im
  );
  if (!section) return null;

  const pairs = [...section[1].matchAll(/^###\s+(.+)$\n([\s\S]*?)(?=^###\s|$(?![\s\S]))/gim)].map(
    ([, question, answer]) => ({
      "@type": "Question",
      name: stripMarkdown(question),
      acceptedAnswer: { "@type": "Answer", text: stripMarkdown(answer) },
    })
  );
  if (pairs.length === 0) return null;

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: pairs,
  };
}
