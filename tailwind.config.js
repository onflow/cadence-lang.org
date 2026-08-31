/** @type {import('tailwindcss').Config} */
module.exports = {
  // Docusaurus toggles themes with data-theme on <html>, not a `dark` class.
  darkMode: ["class", '[data-theme="dark"]'],
  content: [
    "./src/**/*.{js,jsx,ts,tsx,mdx}",
    "./docs/**/*.mdx",
    "./docusaurus.config.{js,ts}",
  ],
  // Infima (Docusaurus' CSS framework) already provides a reset. Enabling
  // Tailwind's preflight on top of it restyles every docs page, so the
  // homepage carries its own resets instead.
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {
      colors: {
        // Exposed as raw channels so Tailwind can apply opacity modifiers
        // (`bg-accent/10`), which it cannot do through a plain var() color.
        accent: "rgb(var(--accent-rgb) / <alpha-value>)",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
      },
      animation: {
        fadeIn: "fadeIn 300ms ease-in-out",
      },
    },
  },
  plugins: [],
};
