/**
 * Activates Tailwind in the Docusaurus build.
 *
 * Docusaurus owns its PostCSS pipeline and does not read a root
 * postcss.config.js, so Tailwind has to be injected through this hook.
 */
module.exports = function tailwindPlugin() {
  return {
    name: "cadence-tailwind",
    configurePostCss(postcssOptions) {
      postcssOptions.plugins.push(
        require("tailwindcss"),
        require("autoprefixer"),
      );
      return postcssOptions;
    },
  };
};
