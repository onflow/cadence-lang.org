/**
 * scripts/update-ai-files.ts
 *
 * Updates skills/cadence/SKILL.md using Claude when content docs change.
 * llms.txt / llms-full.txt are already handled dynamically by the app routes,
 * so we only need to keep SKILL.md in sync here.
 */

import Anthropic from "@anthropic-ai/sdk";
import { readdir, readFile, writeFile } from "fs/promises";
import { join, relative } from "path";

// ── helpers ────────────────────────────────────────────────────────────────

function stripFrontmatter(content: string): string {
    return content.replace(/^---[\s\S]*?---\n?/, "").trim();
}

function extractTitle(content: string, fallback: string): string {
    const m = content.match(/^---[\s\S]*?title:\s*["']?([^\n"']+)["']?[\s\S]*?---/);
    return m ? m[1].trim() : fallback;
}

function toUrl(relPath: string): string {
    return (
        "/docs/" +
        relPath
            .replace(/\\/g, "/")
            .replace(/\.mdx?$/, "")
            .replace(/(\/index|index)$/, "")
    );
}

async function walk(dir: string): Promise<string[]> {
    const entries = await readdir(dir, { withFileTypes: true });
    const files: string[] = [];
    for (const e of entries) {
        const full = join(dir, e.name);
        if (e.isDirectory()) files.push(...(await walk(full)));
        else if (/\.mdx?$/.test(e.name)) files.push(full);
    }
    return files;
}

// ── main ──────────────────────────────────────────────────────────────────

async function main() {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
        console.error("❌ ANTHROPIC_API_KEY is not set");
        process.exit(1);
    }

    const root = process.cwd();
    const contentDir = join(root, "content", "docs");

    // 1. Read all MDX files and build a text dump for Claude context
    const paths = (await walk(contentDir)).sort();

    const docsDump = (
        await Promise.all(
            paths.map(async (p) => {
                const raw = await readFile(p, "utf-8");
                const rel = relative(contentDir, p);
                const url = toUrl(rel);
                const title = extractTitle(raw, url.split("/").pop() ?? url);
                const body = stripFrontmatter(raw);
                return `# ${title} (${url})\n\n${body}`;
            })
        )
    )
        .join("\n\n---\n\n")
        .slice(0, 120_000); // stay within Claude's context window

    // 2. Update SKILL.md via Claude
    const existingSkill = await readFile(
        join(root, "skills", "cadence", "SKILL.md"),
        "utf-8"
    );

    console.log("🤖 Calling Claude to update SKILL.md …");

    const client = new Anthropic({ apiKey });
    const message = await client.messages.create({
        model: "claude-opus-4-5",
        max_tokens: 8192,
        messages: [
            {
                role: "user",
                content: `You are maintaining a SKILL.md file for the Cadence programming language.
The SKILL.md is consumed by AI coding agents as a compact, high-signal cheat-sheet.

Rules:
- Preserve the existing YAML frontmatter and overall structure exactly.
- Only update sections whose information has changed or is missing vs the latest docs.
- Do NOT pad with fluff; every sentence must add information density.
- Output ONLY the updated SKILL.md content — no preamble, no explanation.

<current_skill>
${existingSkill}
</current_skill>

<latest_docs>
${docsDump}
</latest_docs>`,
            },
        ],
    });

    const updated =
        message.content[0].type === "text" ? message.content[0].text : existingSkill;

    await writeFile(join(root, "skills", "cadence", "SKILL.md"), updated, "utf-8");
    console.log("✅ Updated skills/cadence/SKILL.md");
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
