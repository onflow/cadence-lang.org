const fs = require("fs");
const path = require("path");
const globby = require("globby");

module.exports = function markdownExportPlugin(context, options = {}) {
  const { siteDir, baseUrl } = context;
  const docsDir = options.docsDir ?? path.join(siteDir, "docs");
  const outDirRel = options.outDirRel ?? "md"; // build/md

  async function copyTree(srcDir, outDir) {
    if (!fs.existsSync(srcDir)) return;
    const mdPaths = await globby(["**/*.md", "**/*.mdx"], { cwd: srcDir });
    for (const rel of mdPaths) {
      const src = path.join(srcDir, rel);
      // Keep the original extension so MDX shortcodes remain intact
      // If filename is index.md, remove it from the path
      let dest = path.join(outDir, outDirRel, rel);
      if (path.basename(rel) === "index.md" || path.basename(rel) === "index.mdx") {
        const dir = path.dirname(rel);
        const ext = path.extname(rel);
        // Remove the index.md from the path: foo/bar/index.md -> foo/bar.md
        dest = path.join(outDir, outDirRel, dir + ext);
      }
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.copyFileSync(src, dest);
    }
  }

  return {
    name: "markdown-export",
    async postBuild({ outDir, routes }) {
      // 1) Copy docs source to build/md
      await copyTree(docsDir, outDir);

      // 2) Emit a path map: HTML route -> Markdown URL (best effort)
      const map = {};
      for (const r of routes) {
        const p = r.path; // e.g. /docs/intro
        // naive mirror: /docs/foo -> /md/foo(.mdx|.md). We'll try .mdx first.
        if (p.startsWith(baseUrl + "docs")) {
          const rel = p.replace(baseUrl, "").replace(/^docs\/?/, "");
          map[p] = `${baseUrl}${outDirRel}/${rel.replace(/\/$/, "")}.mdx`;
        }
      }
      fs.mkdirSync(path.join(outDir, outDirRel), { recursive: true });
      fs.writeFileSync(
        path.join(outDir, outDirRel, "_index.json"),
        JSON.stringify(map, null, 2)
      );

      // 3) Emit a well-known manifest for LLM crawlers
      const llmsTxt =
        Object.entries(map)
          .map(([htmlUrl, mdUrl]) => `${htmlUrl} -> ${mdUrl}`)
          .join("\n") + "\n";
      const wellKnownDir = path.join(outDir, ".well-known");
      fs.mkdirSync(wellKnownDir, { recursive: true });
      fs.writeFileSync(path.join(wellKnownDir, "llms.txt"), llmsTxt);

      // 4) Generate llms-full.txt - a single file with all markdown content
      let fullContent = "# Cadence Language Documentation - Complete Documentation\n\n";
      fullContent += "This file contains all documentation in Markdown format.\n\n";
      fullContent += "---\n\n";
      
      // Read and combine all markdown files
      const mdFiles = await globby(["**/*.md", "**/*.mdx"], { 
        cwd: path.join(outDir, outDirRel),
        absolute: false
      });
      
      for (const mdFile of mdFiles.sort()) {
        const fullPath = path.join(outDir, outDirRel, mdFile);
        if (fs.existsSync(fullPath)) {
          const content = fs.readFileSync(fullPath, "utf-8");
          fullContent += `\n# File: /md/${mdFile}\n\n`;
          fullContent += content;
          fullContent += "\n\n---\n\n";
        }
      }
      
      fs.writeFileSync(path.join(outDir, "llms-full.txt"), fullContent);
      
      // 5) Copy llms.txt to build output
      const llmsTxtPath = path.join(siteDir, "static", "llms.txt");
      if (fs.existsSync(llmsTxtPath)) {
        fs.copyFileSync(llmsTxtPath, path.join(outDir, "llms.txt"));
      }
    },
    injectHtmlTags() {
      return {
        headTags: [
          // Discovery hint that Markdown is available
          { tagName: "meta", attributes: { name: "llm:available-format", content: "text/markdown" } },
        ],
      };
    },
  };
};
