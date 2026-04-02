import React, { useEffect, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { HomeLayout } from "fumadocs-ui/layouts/home";
import { baseOptions } from "@/lib/layout.shared";
import {
  ArrowRight,
  Terminal,
  Cpu,
  ShieldCheck,
  Zap,
  Box,
  ChevronRight,
  Github,
  Copy,
  Check,
  MessageCircleIcon,
} from "lucide-react";
import { MorphingAscii } from "@/components/MorphingAscii";
import { SITE_URL } from "@/lib/site";
import {
  AISearch,
  AISearchPanel,
  AISearchTrigger,
} from "@/components/search";

// ════════ DATA ════════
const nftPillars = [
  {
    title: "Resource Oriented",
    label: "SAFETY",
    desc: "Assets live in account storage as first-class objects. They cannot be lost, duplicated, or forgotten. The type system enforces physical-world scarcity.",
  },
  {
    title: "Capabilities",
    label: "ACCESS",
    desc: "Security via object-capabilities. Authority is granted by holding a reference to a resource, removing the need for error-prone permission lists.",
  },
];

const defiPillars = [
  {
    title: "Atomic Multi-Step Transactions",
    label: "EXPERIENCE",
    desc: "Compose complex DeFi flows — claim, swap, restake — in a single transaction. Everything succeeds or everything reverts. No intermediary contracts needed.",
  },
  {
    title: "User-Custodied Assets",
    label: "SAFETY",
    desc: "User assets stay in user accounts, not in contract storage. Combined with a strong static type system and capability-based access control, Cadence eliminates entire classes of DeFi vulnerabilities.",
  },
  {
    title: "Composable DeFi Primitives",
    label: "COMPOSABILITY",
    desc: "Resources flow freely between contracts, enabling seamless integration of lending, swapping, and yield strategies. Build new DeFi functionality on top of any standard.",
  },
];

const nftSnippet = `// The system enforces ownership
access(all) resource NFT {
    access(all) let id: UInt64
    init() { self.id = self.uuid }
}

// Moves are explicit and safe
access(all) fun transfer(token: @NFT) {
    // '@' denotes a resource that MUST be handled
    Receiver.deposit(token: <- token)
}`;

const defiSnippet = `import "DeFiActions"
import "FlowToken"
import "IncrementFiStakingConnectors"
import "IncrementFiPoolLiquidityConnectors"
import "SwapConnectors"

// Schedule daily yield compounding with Flow Actions
transaction(stakingPoolId: UInt64, executionEffort: UInt64) {
    prepare(signer: auth(Storage, Capabilities) &Account) {

        // Compose DeFi actions atomically: Claim → Zap → Restake
        let operationID = DeFiActions.createUniqueIdentifier()
        
        // Source: Claim staking rewards
        let rewardsSource = IncrementFiStakingConnectors.PoolRewardsSource(
            userCertificate: signer.capabilities.storage
                .issue<&StakingPool>(/storage/userCertificate),
            pid: stakingPoolId,
            uniqueID: operationID
        )
        
        // Swapper: Convert single reward token → LP tokens
        let zapper = IncrementFiPoolLiquidityConnectors.Zapper(
            token0Type: Type<@FlowToken.Vault>(),
            token1Type: Type<@RewardToken.Vault>(),
            stableMode: false,
            uniqueID: operationID
        )
        
        // Compose: Wrap rewards source with zapper
        let lpSource = SwapConnectors.SwapSource(
            swapper: zapper,
            source: rewardsSource,
            uniqueID: operationID
        )
        
        // Sink: Restake LP tokens back into pool
        let poolSink = IncrementFiStakingConnectors.PoolSink(
            pid: stakingPoolId,
            staker: signer.address,
            uniqueID: operationID
        )
    }
}`;

// ════════ HIGHLIGHTER ════════
const getHighlightedCode = createServerFn({ method: "GET" }).handler(
  async () => {
    try {
      const { codeToHtml } = await import("shiki");
      const cadenceGrammar = (await import("@/lib/cadence.tmLanguage.json"))
        .default;

      const highlight = async (code: string) => codeToHtml(code, {
        lang: "cadence",
        // @ts-expect-error type mismatches but custom lang works
        langs: [cadenceGrammar as never],
        themes: { light: "github-light", dark: "github-dark" },
      });

      return {
        nft: await highlight(nftSnippet),
        defi: await highlight(defiSnippet),
      };
    } catch (e) {
      return {
        nft: `<pre><code>${nftSnippet}</code></pre>`,
        defi: `<pre><code>${defiSnippet}</code></pre>`,
      };
    }
  },
);

export const Route = createFileRoute("/")({
  component: Home,
  loader: () => getHighlightedCode(),
  head: () => ({
    meta: [
      { title: 'Cadence - Smart Contracts Built for the AI Era' },
      {
        name: 'description',
        content:
          'Cadence is a safe, resource-oriented programming language built for the Flow blockchain. Designed for digital ownership and optimized for AI-driven development.',
      },
      { property: 'og:title', content: 'Cadence - Smart Contracts Built for the AI Era' },
      {
        property: 'og:description',
        content:
          'A safe, resource-oriented programming language built for the Flow blockchain. Designed for digital ownership and optimized for AI-driven development.',
      },
      { property: 'og:url', content: SITE_URL },
      { property: 'og:type', content: 'website' },
      { property: 'og:image', content: `${SITE_URL}/og/home` },
      { property: 'og:site_name', content: 'Cadence' },
      { property: 'og:logo', content: `${SITE_URL}/img/logo.svg` },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: 'Cadence - Smart Contracts Built for the AI Era' },
      {
        name: 'twitter:description',
        content:
          'A safe, resource-oriented programming language built for the Flow blockchain. Designed for digital ownership and optimized for AI-driven development.',
      },
      { name: 'twitter:image', content: `${SITE_URL}/og/home` },
    ],
  }),
});

// ════════ COMPONENTS ════════

const mcpClients = [
  { value: "claude-code", label: "Claude Code" },
  { value: "cursor", label: "Cursor" },
  { value: "windsurf", label: "Windsurf" },
  { value: "claude-desktop", label: "Claude Desktop" },
  { value: "vscode", label: "VS Code" },
  { value: "antigravity", label: "Antigravity" },
  { value: "opencode", label: "OpenCode" },
] as const;

function CommandDisplay({ render, text, typingKey }: {
  render: React.ReactNode;
  text: string;
  typingKey: number;
}) {
  const { displayed, typing } = useTypewriter(text, typingKey, 25);
  const charCount = displayed.length;

  return (
    <div className="flex items-center gap-2 font-mono text-[13px] sm:text-sm min-w-0 overflow-hidden">
      <span className="text-neutral-400 dark:text-[#555] select-none shrink-0">$</span>
      <span className="font-medium whitespace-nowrap overflow-hidden relative">
        {/* Invisible full text for layout */}
        <span className="invisible" aria-hidden>{render}</span>
        {/* Visible clipped text with syntax highlighting */}
        <span
          className="absolute inset-0"
          style={{ clipPath: `inset(0 ${100 - (text.length > 0 ? (charCount / text.length) * 100 : 100)}% 0 0)` }}
        >
          {render}
        </span>
        {/* Blinking cursor during typing */}
        {typing && (
          <span className="inline-block w-[2px] h-[1.1em] bg-[var(--accent)] ml-[1px] align-middle animate-pulse" />
        )}
      </span>
    </div>
  );
}

function useTypewriter(text: string, key: number, speed = 30) {
  const [displayed, setDisplayed] = useState(text);
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    if (key === 0) { setDisplayed(text); return; }
    setTyping(true);
    setDisplayed("");
    let i = 0;
    const id = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) { clearInterval(id); setTyping(false); }
    }, speed);
    return () => clearInterval(id);
  }, [text, key, speed]);

  return { displayed, typing };
}

// Terminal syntax highlight tokens (dark-first since site defaults to dark)
const S = {
  cmd: "text-yellow-500 dark:text-yellow-400",        // command binary
  pkg: "text-green-600 dark:text-[#00EF8B]",          // package / value
  flag: "text-blue-500 dark:text-blue-400",           // --flags
  url: "text-cyan-600 dark:text-cyan-400",            // URLs
  dim: "text-neutral-500 dark:text-neutral-500",      // subcommands
} as const;

type McpMode = "remote" | "local";

type HeroCommand = {
  key: string;
  label: string;
  copyText: string | ((client: string, mode: McpMode) => string);
  render: (client: string, mode: McpMode) => React.ReactNode;
  hint: string;
  href: string;
  hasClientSelect?: boolean;
  hasModeSelect?: boolean;
};

const heroCommands: HeroCommand[] = [
  {
    key: "skills",
    label: "skills",
    copyText: "npx skills add outblock/cadence-lang.org",
    render: () => (
      <>
        <span className={S.cmd}>npx</span>{" "}
        <span className={S.dim}>skills add</span>{" "}
        <span className={S.pkg}>outblock/cadence-lang.org</span>
      </>
    ),
    hint: "Install the Cadence skill for your AI coding agent",
    href: "/docs/ai-tools/skills",
  },
  {
    key: "mcp",
    label: "mcp",
    copyText: (client: string, mode: McpMode) =>
      mode === "remote"
        ? `npx install-mcp https://cadence-mcp.up.railway.app/mcp --client ${client} --oauth no`
        : `npx install-mcp @outblock/cadence-mcp --client ${client}`,
    render: (_client: string, mode: McpMode) =>
      mode === "remote" ? (
        <>
          <span className={S.cmd}>npx</span>{" "}
          <span className={S.dim}>install-mcp</span>{" "}
          <span className={S.url}>cadence-mcp…/mcp</span>{" "}
          <span className={S.flag}>--client</span>{" "}
          <span className={S.pkg}>{_client}</span>
        </>
      ) : (
        <>
          <span className={S.cmd}>npx</span>{" "}
          <span className={S.dim}>install-mcp</span>{" "}
          <span className={S.pkg}>@outblock/cadence-mcp</span>{" "}
          <span className={S.flag}>--client</span>{" "}
          <span className={S.pkg}>{_client}</span>
        </>
      ),
    hint: "Install the Cadence MCP server",
    href: "/docs/ai-tools/mcp-server",
    hasClientSelect: true,
    hasModeSelect: true,
  },
];

function Home() {
  const highlightedCode = Route.useLoaderData();
  const [copied, setCopied] = useState(false);
  const [activeCmd, setActiveCmd] = useState(0);
  const [mcpClient, setMcpClient] = useState<string>(mcpClients[0].value);
  const [mcpMode, setMcpMode] = useState<McpMode>("remote");
  const [typingKey, setTypingKey] = useState(0);
  const [activeCodeTab, setActiveCodeTab] = useState<"nft" | "defi">("nft");
  const codeContainerRef = useRef<HTMLDivElement>(null);
  const codeInnerRef = useRef<HTMLDivElement>(null);
  const [codeHeight, setCodeHeight] = useState<string>("auto");

  useEffect(() => {
    if (codeInnerRef.current) {
      setCodeHeight(`${codeInnerRef.current.scrollHeight}px`);
    }
  }, [activeCodeTab]);

  const current = heroCommands[activeCmd];
  const commandText = typeof current.copyText === "function"
    ? current.copyText(mcpClient, mcpMode)
    : current.copyText;

  const copyCommand = () => {
    navigator.clipboard.writeText(commandText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AISearch>
      <AISearchPanel />
      <AISearchTrigger
        position="float"
        className="bg-fd-primary text-fd-primary-foreground px-4 py-2.5 rounded-full text-sm font-medium"
      >
        <MessageCircleIcon className="size-4" />
        Ask Cadence AI
      </AISearchTrigger>
      <HomeLayout {...baseOptions()}>
        <div className="relative min-h-screen overflow-x-hidden bg-[#FAFAFA] dark:bg-black text-neutral-900 dark:text-white selection:bg-[var(--accent)] selection:text-black font-sans transition-colors duration-300">
          {/* Subtle Grid Background */}
          <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

          {/* Glow effect at top */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-[#00FF94]/10 rounded-full blur-[120px] pointer-events-none" />

          {/* ════════ HERO ════════ */}
          <section className="relative pt-32 pb-24 px-6 overflow-hidden flex flex-col justify-center min-h-[90vh]">
            <div className="max-w-7xl mx-auto w-full z-10 grid lg:grid-cols-2 gap-12 items-center">

              {/* Left Column: Copy & CTA */}
              <div className="flex flex-col items-start text-left">

                <h1 className="text-5xl lg:text-7xl font-bold tracking-tight mb-8 leading-tight">
                  Smart Contracts Built for <br className="md:hidden" />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent)] to-blue-500">
                    the AI Era.
                  </span>
                </h1>
                <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-8 max-w-lg leading-relaxed">
                  Cadence is a safe, resource-oriented programming language built for the Flow blockchain. Designed for digital ownership and optimized for AI-driven development.
                </p>

                <div className="flex items-center gap-3 mb-8">
                  {heroCommands.map((cmd, i) => (
                    <React.Fragment key={cmd.key}>
                      {i > 0 && <span className="text-neutral-300 dark:text-neutral-700">·</span>}
                      <button
                        onClick={() => { setActiveCmd(i); setCopied(false); setTypingKey(k => k + 1); }}
                        className={`text-xs font-mono underline-offset-4 transition-colors ${activeCmd === i
                          ? "text-[var(--accent)] underline"
                          : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 hover:underline"
                          }`}
                      >
                        {cmd.label}
                      </button>
                    </React.Fragment>
                  ))}
                </div>

                {/* Command Box */}
                <div className="relative w-full max-w-[calc(100vw-3rem)] sm:max-w-lg mb-2 group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-[var(--accent)]/30 to-blue-500/30 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
                  <div className="relative flex items-center justify-between bg-white dark:bg-[#111] border border-black/10 dark:border-white/10 rounded-xl p-2 pl-6 shadow-2xl overflow-hidden backdrop-blur-xl transition-colors duration-300">
                    <CommandDisplay
                      render={current.render(mcpClient, mcpMode)}
                      text={commandText}
                      typingKey={typingKey}
                    />
                    <button
                      onClick={copyCommand}
                      className="p-3 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-colors text-neutral-500 dark:text-[#888] hover:text-black dark:hover:text-white shrink-0"
                    >
                      {copied ? (
                        <Check className="w-5 h-5 text-[var(--accent)]" />
                      ) : (
                        <Copy className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-10">
                  {current.hasModeSelect && (
                    <div className="inline-flex text-xs font-mono bg-neutral-100 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-lg overflow-hidden">
                      {(["remote", "local"] as const).map((m) => (
                        <button
                          key={m}
                          onClick={() => { setMcpMode(m); setCopied(false); setTypingKey(k => k + 1); }}
                          className={`px-2.5 py-1.5 transition-colors ${mcpMode === m
                            ? "bg-[var(--accent)]/15 text-[var(--accent)]"
                            : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                          }`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  )}
                  {current.hasClientSelect && (
                    <div className="relative">
                      <select
                        value={mcpClient}
                        onChange={(e) => { setMcpClient(e.target.value); setCopied(false); setTypingKey(k => k + 1); }}
                        className="appearance-none text-xs font-mono bg-neutral-100 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-lg pl-3 pr-7 py-1.5 text-neutral-700 dark:text-neutral-300 outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/30 transition-all cursor-pointer hover:border-black/20 dark:hover:border-white/20"
                      >
                        {mcpClients.map((c) => (
                          <option key={c.value} value={c.value}>{c.label}</option>
                        ))}
                      </select>
                      <ChevronRight className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 rotate-90 text-neutral-400 dark:text-neutral-500 pointer-events-none" />
                    </div>
                  )}
                  <span className="text-xs text-neutral-400 dark:text-neutral-600 font-mono truncate hidden sm:inline">
                    {current.hint}
                  </span>
                  <a
                    href={current.href}
                    className="text-xs font-mono text-[var(--accent)] hover:underline underline-offset-4 shrink-0 flex items-center gap-1"
                  >
                    docs <ArrowRight className="w-3 h-3" />
                  </a>
                </div>

                <div className="flex flex-wrap items-center gap-6">
                  <Link
                    to="/docs/$"
                    className="h-12 px-6 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-black font-medium flex items-center gap-2 hover:bg-neutral-800 dark:hover:bg-gray-200 transition-colors"
                  >
                    Read the Docs <ArrowRight className="w-4 h-4" />
                  </Link>
                  <a
                    href="https://github.com/onflow/cadence"
                    target="_blank"
                    rel="noreferrer"
                    className="h-12 px-6 rounded-lg bg-black/5 dark:bg-white/5 text-neutral-900 dark:text-white font-medium flex items-center gap-2 hover:bg-black/10 dark:hover:bg-white/10 border border-black/10 dark:border-white/10 transition-colors"
                  >
                    <Github className="w-4 h-4" /> GitHub
                  </a>
                </div>
              </div>

              {/* Right Column: Animation */}
              <div className="relative flex items-center justify-center lg:justify-end">
                <MorphingAscii />
              </div>

            </div>
          </section>

          {/* ════════ BORDERED SECTION ════════ */}
          <section className="relative py-24 px-6 z-10">
            <div className="max-w-7xl mx-auto">
              <div className="grid lg:grid-cols-12 gap-16">
                <div className="lg:col-span-4 min-w-0">
                  <h3 className="text-2xl font-bold border-b border-black/10 dark:border-white/10 pb-4 mb-12">
                    Architectural Pillars
                  </h3>
                  <div className="space-y-10">
                    {(activeCodeTab === "nft" ? nftPillars : defiPillars).map((p, i) => (
                      <div key={`${activeCodeTab}-${i}`} className="group animate-[fadeIn_300ms_ease-in-out]">
                        <div className="text-[10px] font-mono text-green-600 dark:text-[var(--accent)] mb-2 opacity-80 dark:opacity-50 group-hover:opacity-100 transition-opacity">
                          {p.label}
                        </div>
                        <h4 className="text-xl font-bold mb-3">{p.title}</h4>
                        <p className="text-sm text-neutral-600 dark:text-[#888] leading-relaxed">
                          {p.desc}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="lg:col-span-8 min-w-0 lg:sticky lg:top-40 lg:self-start h-fit">
                  <div className="border border-black/10 dark:border-white/10 bg-white dark:bg-[#0A0A0A] rounded-xl overflow-hidden shadow-2xl">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between px-2 sm:px-4 py-2 border-b border-black/5 dark:border-white/5 bg-neutral-50 dark:bg-[#111] gap-2 sm:gap-0">
                      <div className="flex gap-2 items-center px-2 sm:px-0">
                        <div className="w-3 h-3 rounded-full bg-red-500/80" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                        <div className="w-3 h-3 rounded-full bg-green-500/80" />
                      </div>
                      <div className="flex items-center gap-1 bg-black/5 dark:bg-white/5 p-1 rounded-lg self-start sm:self-auto">
                        <button
                          onClick={() => setActiveCodeTab("nft")}
                          className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${activeCodeTab === "nft" ? "bg-white dark:bg-white/10 text-neutral-900 dark:text-white shadow-sm" : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"}`}
                        >
                          NFT
                        </button>
                        <button
                          onClick={() => setActiveCodeTab("defi")}
                          className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${activeCodeTab === "defi" ? "bg-white dark:bg-white/10 text-neutral-900 dark:text-white shadow-sm" : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"}`}
                        >
                          DeFi
                        </button>
                      </div>
                    </div>
                    <div className="overflow-hidden transition-[height] duration-300 ease-in-out" ref={codeContainerRef} style={{ height: codeHeight }}>
                      <div
                        key={activeCodeTab}
                        className="not-fumadocs-codeblock homepage-code p-4 sm:p-6 overflow-x-auto text-sm font-mono leading-relaxed [&_pre]:!bg-transparent [&_code]:!bg-transparent [&_pre]:!p-0 [&_code]:!p-0 animate-[fadeIn_200ms_ease-in-out]"
                        ref={codeInnerRef}
                        dangerouslySetInnerHTML={{
                          __html: activeCodeTab === "nft" ? highlightedCode.nft : highlightedCode.defi,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </section>

          {/* ════════ PARADIGM SHIFT ════════ */}
          <section className="relative py-32 px-6 bg-black/[0.02] dark:bg-white/[0.01] border-t border-black/5 dark:border-white/5">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-20">
                <span className="text-green-600 dark:text-[var(--accent)] font-mono text-xs tracking-widest uppercase mb-4 block">
                  The Paradigm Shift
                </span>
                <h2 className="text-4xl md:text-5xl font-bold">
                  LEDGER VS. RESOURCES
                </h2>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white dark:bg-[#0A0A0A] border border-black/10 dark:border-white/10 rounded-2xl p-10 hover:border-black/20 dark:hover:border-white/20 transition-colors shadow-sm dark:shadow-none">
                  <div className="flex items-center gap-3 mb-8 opacity-40">
                    <div className="w-4 h-4 rounded-sm border border-neutral-800 dark:border-white" />
                    <span className="text-xs font-mono uppercase tracking-widest">
                      The Old Way (Ledger)
                    </span>
                  </div>
                  <h4 className="text-2xl font-bold mb-4">
                    Centralized Accounting
                  </h4>
                  <p className="text-neutral-600 dark:text-[#666] leading-relaxed mb-8">
                    Assets are just entries in a contract's private dictionary. To
                    move value, you update two numbers. This "ledger" model is
                    prone to reentrancy bugs.
                  </p>
                  <div className="p-6 bg-red-500/5 border border-red-500/10 rounded-lg font-mono text-sm text-red-400/60 leading-relaxed">
                    mapping(address ={">"} uint) balances;
                    <br />
                    function transfer(address to, uint val) {"{"} <br />
                    &nbsp;&nbsp;balances[msg.sender] -= val;
                    <br />
                    &nbsp;&nbsp;balances[to] += val;
                    <br />
                    {"}"}
                  </div>
                </div>

                <div className="bg-white dark:bg-[#0A0A0A] border border-green-500/20 dark:border-[var(--accent)]/20 rounded-2xl p-10 relative overflow-hidden shadow-sm dark:shadow-none">
                  <div className="absolute top-0 right-0 p-6">
                    <Zap className="w-6 h-6 text-green-600/50 dark:text-[var(--accent)]/50" />
                  </div>
                  <div className="flex items-center gap-3 mb-8 text-green-600 dark:text-[var(--accent)]">
                    <Box className="w-4 h-4" />
                    <span className="text-xs font-mono uppercase tracking-widest">
                      The Cadence Way
                    </span>
                  </div>
                  <h4 className="text-2xl font-bold mb-4 text-neutral-900 dark:text-white">
                    Direct Ownership
                  </h4>
                  <p className="text-neutral-600 dark:text-[#888] leading-relaxed mb-8">
                    Assets are objects stored directly in the user's account. To
                    move value, you physically move the object. Impossible to
                    duplicate.
                  </p>
                  <div className="p-6 bg-[var(--accent)]/5 border border-[var(--accent)]/20 rounded-lg font-mono text-sm text-[var(--accent)]/80 leading-relaxed">
                    let vault {"<-"} account.withdraw(amount: 10.0)
                    <br />
                    receiver.deposit(vault: {"<-"} vault)
                    <br />
                    <span className="text-white/40 mt-2 block">
                      // vault is now empty, reentrancy impossible
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>
                  {/* ════════ VIDEO PRESENTATION ════════ */}
                  <section className="relative py-24 px-6 z-10 border-t border-black/5 dark:border-white/5 bg-black/5 dark:bg-black/50">
                    <div className="text-center mb-16">
                      <span className="text-green-600 dark:text-[var(--accent)] font-mono text-xs tracking-widest uppercase mb-4 block">
                        Watch The Intro
                      </span>
                      <h2 className="text-3xl md:text-5xl font-bold">
                        BUILT FOR CONSUMER APPS & DEFI
                      </h2>
                    </div>
                    <div className="max-w-5xl mx-auto w-full relative group">
                      <div className="absolute -inset-1 bg-gradient-to-r from-[var(--accent)]/20 via-transparent to-blue-500/20 rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition duration-1000"></div>
                      <div className="relative border border-black/10 dark:border-white/10 bg-white dark:bg-[#0A0A0A] rounded-2xl overflow-hidden shadow-2xl p-2 backdrop-blur-3xl transform transition-transform duration-500 hover:scale-[1.01]">
                        <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black/5 dark:bg-black/50 border border-black/5 dark:border-white/5 shadow-inner">
                          <iframe
                            title="Cadence Intro Video"
                            src="https://www.youtube.com/embed/6SE8bvTmmQc?si=DTMmGOHf3wyqIDTF&autoplay=0&rel=0&modestbranding=1"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                            className="absolute top-0 left-0 w-full h-full"
                          ></iframe>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* ════════ SCALE & TRUST ════════ */}
                  <section className="relative py-24 px-6 border-t border-black/5 dark:border-white/5">
                    <div className="max-w-7xl mx-auto">
                      <div className="flex items-center gap-6 mb-16">
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-black/10 dark:to-white/10" />
                        <span className="font-mono text-xs text-neutral-500 dark:text-[#666] uppercase tracking-widest">
                          Built For Scale
                        </span>
                        <div className="h-px flex-1 bg-gradient-to-l from-transparent to-black/10 dark:to-white/10" />
                      </div>

                      <div className="flex flex-wrap justify-center gap-12 md:gap-24 opacity-30 grayscale hover:grayscale-0 transition-all duration-500">
                        <span className="text-2xl font-black tracking-tighter">
                          NBA TOP SHOT
                        </span>
                        <span className="text-2xl font-black tracking-tighter">
                          NFL ALL DAY
                        </span>
                        <span className="text-2xl font-black tracking-tighter">
                          TICKETMASTER
                        </span>
                        <span className="text-2xl font-black tracking-tighter">
                          DISNEY
                        </span>
                      </div>
                    </div>
                  </section>

                  {/* ════════ FOOTER ════════ */}
                  <footer className="relative py-16 px-6 border-t border-black/5 dark:border-white/5 bg-neutral-100 dark:bg-[#050505]">
                    <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-start">
                      <div>
                        <Terminal className="text-green-600 dark:text-[#00FF94] w-8 h-8 mb-6" />
                        <p className="text-sm text-neutral-600 dark:text-[#666] leading-relaxed max-w-sm">
                          Cadence is the standard for programmable ownership. Integrated
                          with the AI agents of tomorrow.
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-12 sm:justify-items-end">
                        <div className="space-y-4">
                          <div className="text-xs font-bold uppercase tracking-widest text-neutral-500 dark:text-[#888]">
                            Ecosystem
                          </div>
                          <div className="flex flex-col gap-3 text-sm text-neutral-600 dark:text-[#555]">
                            <Link
                              to="/docs/$"
                              className="hover:text-black dark:hover:text-white transition-colors"
                            >
                              Documentation
                            </Link>
                            <a
                              href="https://play.flow.com"
                              className="hover:text-black dark:hover:text-white transition-colors"
                            >
                              Playground
                            </a>
                            <a
                              href="https://github.com/onflow/cadence"
                              className="hover:text-black dark:hover:text-white transition-colors"
                            >
                              GitHub
                            </a>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div className="text-xs font-bold uppercase tracking-widest text-neutral-500 dark:text-[#888]">
                            Community
                          </div>
                          <div className="flex flex-col gap-3 text-sm text-neutral-600 dark:text-[#555]">
                            <Link
                              to="/community"
                              className="hover:text-black dark:hover:text-white transition-colors"
                            >
                              Discord
                            </Link>
                            <a href="#" className="hover:text-black dark:hover:text-white transition-colors">
                              Forum
                            </a>
                            <a href="#" className="hover:text-black dark:hover:text-white transition-colors">
                              Twitter
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-black/5 dark:border-white/5 flex flex-col md:flex-row justify-between gap-4">
                      <span className="text-xs text-neutral-500 dark:text-[#444]">
                        © 2026 Flow Foundation. All rights reserved.
                      </span>
                      <span className="text-xs font-mono text-neutral-500 dark:text-[#444]">
                        POWERED BY FLOW NETWORK
                      </span>
                    </div>
                  </footer>
                </div >
              </HomeLayout >
            </AISearch >
            );
}
