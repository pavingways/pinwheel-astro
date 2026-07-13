import rss from "@astrojs/rss";
import config from "@config/config.json";
import { getCollection } from "astro:content";

export async function GET(context) {
  // -index.md is list-page metadata, not a post
  const posts = await getCollection(
    "blog",
    ({ slug, data }) => !data.draft && data.language === "en" && !slug.startsWith("-")
  );
  const sorted = posts.sort((a, b) => (b.data.date ?? 0) - (a.data.date ?? 0));
  return rss({
    title: "PavingWays Blog (English)",
    description:
      "News and insights from the PavingWays team and the world of mobile software development",
    site: context.site ?? config.site.base_url,
    items: sorted.map((post) => ({
      title: post.data.title,
      link: `/en/blog/${post.slug}/`,
      // some historic posts have no date; rss rejects undefined pubDate
      ...(post.data.date ? { pubDate: post.data.date } : {}),
    })),
    customData: "<language>en</language>",
  });
}
