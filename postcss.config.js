// tailwindcss and autoprefixer are injected by the @astrojs/tailwind
// integration (astro.config.mjs) — listing them here again would run both
// plugins twice and triggers Vite's "PostCSS plugin did not pass the `from`
// option" warning.
module.exports = {
  plugins: {},
};
