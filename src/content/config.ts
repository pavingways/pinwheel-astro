import { defineCollection, z } from "astro:content";

// Blog collection schema
const blogCollection = defineCollection({
  schema: z.object({
    id: z.string().optional(),
    title: z.string(),
    meta_title: z.string().optional(),
    description: z.string().optional(),
    subtitle: z.string().optional().default("subtitle"),
    date: z.date().optional(),
    image: z.string().optional(),
    author: z.string().optional().default("author"),
    categories: z.array(z.string()).default(["others"]),
    draft: z.boolean().optional(),
    featured: z.boolean().optional().default(true),
    language: z.string().default("de"),
    // URL of the same post in the other language, e.g. /en/blog/some-slug
    translation: z.string().optional(),
  }),
});

// Pages collection schema
const pagesCollection = defineCollection({
  schema: z.object({
    id: z.string().optional(),
    title: z.string(),
    meta_title: z.string().optional(),
    description: z.string().optional(),
    image: z.string().optional(),
    layout: z.string().optional(),
    draft: z.boolean().optional(),
    // URL of the same page in the other language, e.g. /en/imprint
    translation: z.string().optional(),
    // hub pages (leistungen/services): whole-card links rendered by the route.
    // descriptions must stay plain text — a card is one <a>, nested links are invalid
    services: z
      .array(
        z.object({
          title: z.string(),
          anchor: z.string(),
          url: z.string(),
          description: z.string(),
        })
      )
      .optional(),
    audiences: z
      .object({
        title: z.string(),
        links: z.array(z.object({ label: z.string(), url: z.string() })),
      })
      .optional(),
  }),
});

// Case studies: one folder per language (de/..., en/...), so slugs look
// like "de/vhv-kundenportal"; drafts are excluded from list pages and routes
const caseStudiesCollection = defineCollection({
  schema: z.object({
    title: z.string(),
    meta_title: z.string().optional(),
    description: z.string().optional(),
    client: z.string(),
    industry: z.string().optional(),
    platforms: z.array(z.string()).default([]),
    stack: z.array(z.string()).default([]),
    duration: z.string().optional(),
    quote: z
      .object({
        text: z.string(),
        author: z.string(),
      })
      .optional(),
    draft: z.boolean().default(false),
    // URL of the same case study in the other language
    translation: z.string().optional(),
  }),
});

// Export collections
export const collections = {
  blog: blogCollection,
  pages: pagesCollection,
  casestudies: caseStudiesCollection,
};
