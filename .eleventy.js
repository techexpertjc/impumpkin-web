const { DateTime } = require("luxon");
const sitemap = require("@quasibit/eleventy-plugin-sitemap");
const pluginRss = require("@11ty/eleventy-plugin-rss");
const markdownIt = require("markdown-it");
const markdownItAnchor = require("markdown-it-anchor");

module.exports = function (eleventyConfig) {
  // ─── Passthrough copies (assets that don't need processing) ───
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addPassthroughCopy({ "src/admin": "admin" });
  eleventyConfig.addPassthroughCopy({ "src/robots.txt": "robots.txt" });
  eleventyConfig.addPassthroughCopy({ "src/favicon.ico": "favicon.ico" });

  // ─── Watch CSS/JS so live reload works ───
  eleventyConfig.addWatchTarget("./src/assets/");

  // ─── Plugins ───
  eleventyConfig.addPlugin(sitemap, {
    sitemap: {
      hostname: "https://pumpkinblog.web.app", // replace with custom domain when ready
    },
  });
  eleventyConfig.addPlugin(pluginRss);

  // ─── Markdown configuration ───
  const md = markdownIt({ html: true, linkify: true, typographer: true });
  md.use(markdownItAnchor, {
    permalink: markdownItAnchor.permalink.headerLink(),
  });
  eleventyConfig.setLibrary("md", md);

  // ─── Date filters ───
  eleventyConfig.addFilter("readableDate", (dateObj, locale = "en") => {
    return DateTime.fromJSDate(dateObj, { zone: "utc" })
      .setLocale(locale)
      .toLocaleString(DateTime.DATE_FULL);
  });

  eleventyConfig.addFilter("htmlDateString", (dateObj) => {
    return DateTime.fromJSDate(dateObj, { zone: "utc" }).toFormat("yyyy-LL-dd");
  });

  eleventyConfig.addFilter("year", () => `${new Date().getFullYear()}`);

  eleventyConfig.addFilter("monthYear", (dateObj, locale = "en") => {
    return DateTime.fromJSDate(dateObj, { zone: "utc" })
      .setLocale(locale)
      .toFormat("LLL · yyyy");
  });

  eleventyConfig.addFilter("romanNumeral", (n) => {
    const r = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "XIII", "XIV", "XV", "XVI", "XVII", "XVIII", "XIX", "XX"];
    return r[n] || `${n}`;
  });

  // ─── Helpful array filters ───
  eleventyConfig.addFilter("limit", (arr, n) => arr.slice(0, n));

  // Route arc lift: returns the y-offset for the bezier midpoint between two
  // map coordinates so that short routes get small arcs and long routes get
  // bigger flight-path-like arcs. Caps at 60 to avoid theatrical loops.
  eleventyConfig.addFilter("routeArc", (a, b) => {
    const dx = b.mapX - a.mapX;
    const dy = b.mapY - a.mapY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    return Math.max(8, Math.min(60, dist * 0.45));
  });

  eleventyConfig.addFilter("featured", (posts) =>
    posts.filter((p) => p.data.featured)
  );

  // ─── Collections ───
  eleventyConfig.addCollection("posts", (collectionApi) => {
    return collectionApi
      .getFilteredByGlob("src/posts/*.md")
      .sort((a, b) => b.date - a.date);
  });

  // Chronological (oldest first) — used by the atlas/journey blogs page
  // so the map's drawn route reads as a story from earliest trip to latest.
  eleventyConfig.addCollection("journey", (collectionApi) => {
    return collectionApi
      .getFilteredByGlob("src/posts/*.md")
      .sort((a, b) => a.date - b.date);
  });

  eleventyConfig.addCollection("featuredPosts", (collectionApi) => {
    return collectionApi
      .getFilteredByGlob("src/posts/*.md")
      .filter((post) => post.data.featured)
      .sort((a, b) => b.date - a.date)
      .slice(0, 3);
  });

  // ─── Shortcodes ───
  eleventyConfig.addShortcode("currentYear", () => `${new Date().getFullYear()}`);

  return {
    dir: {
      input: "src",
      includes: "_includes",
      data: "_data",
      output: "_site",
    },
    templateFormats: ["md", "njk", "html", "liquid"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    dataTemplateEngine: "njk",
  };
};
