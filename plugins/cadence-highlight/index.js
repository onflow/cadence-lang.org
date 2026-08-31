const path = require("path");

/**
 * Highlights the homepage Cadence snippets with Shiki at build time.
 *
 * The redesign did this in a TanStack server function using Shiki v1's
 * dual-theme output. Docusaurus is static and is pinned to shiki 0.14
 * (Code Hike depends on it), so instead each snippet is rendered twice —
 * once per theme — and the homepage CSS shows the one matching the active
 * colour mode. Same grammar, same github-light / github-dark themes.
 */
module.exports = function cadenceHighlightPlugin(_context, options) {
  const { snippets = {} } = options || {};

  return {
    name: "cadence-highlight",

    async loadContent() {
      const { getHighlighter } = require("shiki");
      const grammar = require(
        path.resolve(__dirname, "../../src/lib/cadence.tmLanguage.json"),
      );

      const escape = (s) =>
        s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

      let highlighter;
      try {
        highlighter = await getHighlighter({
          themes: ["github-light", "github-dark"],
          langs: [
            { id: "cadence", scopeName: grammar.scopeName, grammar },
          ],
        });
      } catch (e) {
        // Never fail the build over syntax colouring.
        const out = {};
        for (const [key, code] of Object.entries(snippets)) {
          out[key] = {
            light: `<pre><code>${escape(code)}</code></pre>`,
            dark: `<pre><code>${escape(code)}</code></pre>`,
          };
        }
        return out;
      }

      const out = {};
      for (const [key, code] of Object.entries(snippets)) {
        const render = (theme) => {
          try {
            return highlighter.codeToHtml(code, { lang: "cadence", theme });
          } catch (e) {
            return `<pre><code>${escape(code)}</code></pre>`;
          }
        };
        out[key] = { light: render("github-light"), dark: render("github-dark") };
      }
      return out;
    },

    async contentLoaded({ content, actions }) {
      actions.setGlobalData(content);
    },
  };
};
