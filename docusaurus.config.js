// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion
require("dotenv").config();
const lightCodeTheme = require("prism-react-renderer/themes/github");
const darkCodeTheme = require("prism-react-renderer/themes/dracula");

const theme = require("shiki/themes/nord.json");
const { remarkCodeHike } = require("@code-hike/mdx");

const hasTypesense =
  process.env.TYPESENSE_NODE && process.env.TYPESENSE_SEARCH_ONLY_API_KEY;

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "Cadence",
  tagline: "The Best Programming Language for Consumer DeFi",
  favicon: "favicon.ico",

  // Set the production url of your site here
  url: "https://cadence-lang.org",
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: "/",

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: "Flow", // Usually your GitHub org/user name.
  projectName: "Cadence", // Usually your repo name.

  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  presets: [
    [
      "classic",
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          lastVersion: "current",
          versions: {
            current: {
              label: "1.0",
            },
          },
          beforeDefaultRemarkPlugins: [
            [
              remarkCodeHike,
              { theme, lineNumbers: true, showCopyButton: true },
            ],
          ],
          sidebarPath: require.resolve("./sidebars.js"),
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl: "https://github.com/onflow/cadence-lang.org/tree/main",
        },

        //TODO
        //blog: {
        //  showReadingTime: true,
        // Please change this to your repo.
        // Remove this to remove the "edit this page" links.
        //  editUrl:
        //    'https://github.com/onflow/cadence-lang.org',
        //},

        theme: {
          customCss: [
            require.resolve("@code-hike/mdx/styles.css"),
            require.resolve("./src/css/custom.css"),
          ],
        },
        ...(process.env.GTAG
          ? {
            gtag: {
              trackingID: process.env.GTAG,
              anonymizeIP: true,
            },
          }
          : {}),
      }),
    ],
  ],

  themes: [hasTypesense && "docusaurus-theme-search-typesense"].filter(Boolean),

  plugins: [
    [
      "docusaurus-plugin-llms",
      {
        title: "Cadence",
        description:
          "Cadence is a resource-oriented programming language for smart contracts on the Flow blockchain. " +
          "Cadence 1.0 introduces capability-based access control, strict resource ownership, and entitlements — " +
          "making smart contracts safer to audit and harder to misuse than account-based languages. " +
          "Resources can only exist in one place at a time and must be explicitly moved, preventing common bugs like double-spending. " +
          "Cadence transactions are written in the language itself, allowing multiple calls to multiple functions across multiple contracts in a single atomic, user-signed operation.",
        version: "1.0",
        generateLLMsTxt: true,
        generateLLMsFullTxt: true,
        generateMarkdownFiles: true,
        excludeImports: true,
        removeDuplicateHeadings: true,
        includeBlog: false,
        includeOrder: [
          "language/**",
          "tutorial/**",
          "design-patterns*",
          "anti-patterns*",
          "contract-upgrades*",
          "security-best-practices*",
          "solidity-to-cadence*",
          "testing-framework*",
          "measuring-time*",
          "project-development-tips*",
          "json-cadence-spec*",
          "cadence-migration-guide/**",
          "why*",
        ],
        includeUnmatchedLast: true,
        rootContent:
          "This file is an llms.txt index for cadence-lang.org following the " +
          "llmstxt.org standard. Supplementary resources:\n\n" +
          "- Cadence source repository: https://github.com/onflow/cadence\n" +
          "- Flow Playground (browser-based Cadence IDE): https://play.flow.com/\n" +
          "- Flow developer documentation (companion llms.txt): https://developers.flow.com/llms.txt\n",
      },
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        logo: {
          alt: 'Cadence',
          src: 'img/logo.svg',
        },
        items: [
          {
            label: "Learn",
            to: "/docs",
            position: "right",
          },
          {
            href: "https://play.flow.com/",
            label: "Playground",
            position: "right",
          },
          {
            label: "Community",
            to: "/community",
            position: "right",
          },
          {
            href: "https://flow.com/flow-responsible-disclosure/",
            label: "Security",
            position: "right",
          },
          {
            label: "Language Reference",
            position: "right",
            to: "/docs/language",
          },
          {
            href: "https://github.com/onflow/cadence",
            position: "right",
            className: "header-github-link",
            "aria-label": "GitHub repository",
          },
          {
            href: "https://discord.com/invite/J6fFnh2xx6",
            position: "right",
            className: "header-discord-link",
            "aria-label": "Discord project",
          },
        ],
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
      typesense: hasTypesense && {
        // Replace this with the name of your index/collection.
        // It should match the "index_name" entry in the scraper's "config.json" file.
        typesenseCollectionName: "cadence_lang",

        typesenseServerConfig: {
          nodes: [
            {
              host: process.env.TYPESENSE_NODE,
              port: 443,
              protocol: "https",
            },
          ],
          apiKey: process.env.TYPESENSE_SEARCH_ONLY_API_KEY,
        },

        // Optional: Typesense search parameters: https://typesense.org/docs/0.24.0/api/search.html#search-parameters
        typesenseSearchParameters: {},

        // Optional
        contextualSearch: true,
      },
    }),
  scripts: [
    {
      src: '/hotjar.js',
      async: true,
    },
  ],
};

module.exports = config;
