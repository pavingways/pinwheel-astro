import { defineCollection, z } from "astro:content";

// Blog collection schema
const blogCollection = defineCollection({
  schema: z.object({
    id: z.string().optional(),
    title: z.string(),
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
  }),
});

// Export collections
export const collections = {
  blog: blogCollection,
  pages: pagesCollection,
};
