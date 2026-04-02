import { DateTime } from "luxon";
import { InputPathToUrlTransformPlugin, HtmlBasePlugin } from "@11ty/eleventy";
import pluginRss from "@11ty/eleventy-plugin-rss";

export default function (eleventyConfig) {
  // --- Plugins ---
  eleventyConfig.addPlugin(InputPathToUrlTransformPlugin);
  eleventyConfig.addPlugin(HtmlBasePlugin);
  eleventyConfig.addPlugin(pluginRss);

  // --- Passthrough Copy ---
  eleventyConfig.addPassthroughCopy("src/assets");
  eleventyConfig.addPassthroughCopy("src/uploads");
  eleventyConfig.addPassthroughCopy("src/admin");

  // --- Date Filters ---
  eleventyConfig.addFilter("readableDate", (dateObj, locale = "en") => {
    const loc = locale === "vi" ? "vi" : "en";
    return DateTime.fromJSDate(dateObj, { zone: "utc" }).setLocale(loc).toLocaleString(DateTime.DATE_FULL);
  });

  eleventyConfig.addFilter("dateToISO", (dateObj) => {
    return DateTime.fromJSDate(dateObj, { zone: "utc" }).toISO();
  });

  eleventyConfig.addFilter("dateToRfc3339", (dateObj) => {
    return DateTime.fromJSDate(dateObj, { zone: "utc" }).toISO();
  });

  // --- Utility Filters ---
  eleventyConfig.addFilter("limit", (arr, limit) => {
    return arr.slice(0, limit);
  });

  eleventyConfig.addFilter("excerpt", (content, length = 200) => {
    if (!content) return "";
    const text = content.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
    return text.length > length ? text.substring(0, length) + "..." : text;
  });

  eleventyConfig.addFilter("getFeatured", (posts) => {
    return posts.filter((post) => post.data.featured);
  });

  eleventyConfig.addFilter("getByCategory", (posts, category) => {
    return posts.filter((post) => post.data.category === category);
  });

  eleventyConfig.addFilter("localeUrl", (url, targetLocale) => {
    if (!url) return url;
    return url.replace(/^\/(en|vi)\//, `/${targetLocale}/`);
  });

  // --- Collections ---
  eleventyConfig.addCollection("posts_en", function (collectionApi) {
    return collectionApi
      .getFilteredByGlob("./src/en/posts/*.md")
      .sort((a, b) => b.date - a.date);
  });

  eleventyConfig.addCollection("posts_vi", function (collectionApi) {
    return collectionApi
      .getFilteredByGlob("./src/vi/posts/*.md")
      .sort((a, b) => b.date - a.date);
  });

  // --- Shortcodes ---
  eleventyConfig.addShortcode("year", () => `${new Date().getFullYear()}`);

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data",
    },
    templateFormats: ["njk", "md", "html"],
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
  };
}
