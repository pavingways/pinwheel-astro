import rss from "@astrojs/rss";
import config from "@config/config.json";
import { getCollection } from "astro:content";

export async function GET(context) {
  // -index.md is list-page metadata, not a post
  const posts = await getCollection(
    "blog",
    ({ slug, data }) => !data.draft && data.language === "de" && !slug.startsWith("-")
  );
  const sorted = posts.sort((a, b) => (b.data.date ?? 0) - (a.data.date ?? 0));
  return rss({
    title: "PavingWays Blog (Deutsch)",
    description:
      "News und Einblicke vom Team PavingWays und aus der Welt der Mobilen Softwareentwicklung",
    site: context.site ?? config.site.base_url,
    items: sorted.map((post) => ({
      title: post.data.title,
      link: `/de/blog/${post.slug}/`,
      // some historic posts have no date; rss rejects undefined pubDate
      ...(post.data.date ? { pubDate: post.data.date } : {}),
    })),
    customData: "<language>de</language>",
  });
}
