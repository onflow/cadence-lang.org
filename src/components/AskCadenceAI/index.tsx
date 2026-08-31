import React, { useEffect, useRef, useState } from "react";
import { MessageCircleIcon, X, Send, Loader2 } from "lucide-react";

/**
 * Floating "Ask Cadence AI" assistant.
 *
 * Replaces the redesign's fumadocs <AISearchTrigger> / <AISearchPanel>, which
 * are fumadocs-only components. Streams plain text from /api/chat (a Vercel
 * Function); no API key ever reaches the browser.
 */

type Msg = { role: "user" | "assistant"; content: string };

export default function AskCadenceAI() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages, busy]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => () => abortRef.current?.abort(), []);

  async function send() {
    const question = input.trim();
    if (!question || busy) return;

    const next: Msg[] = [...messages, { role: "user", content: question }];
    setMessages(next);
    setInput("");
    setBusy(true);
    setError(null);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
        signal: controller.signal,
      });

      if (res.status === 429) throw new Error("Too many requests — give it a minute.");
      if (res.status === 503) throw new Error("The assistant isn't configured yet.");
      if (!res.ok || !res.body) throw new Error("The assistant is unavailable right now.");

      setMessages((m) => [...m, { role: "assistant", content: "" }]);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setMessages((m) => {
          const copy = [...m];
          copy[copy.length - 1] = {
            role: "assistant",
            content: copy[copy.length - 1].content + chunk,
          };
          return copy;
        });
      }
    } catch (e: any) {
      if (e?.name !== "AbortError") setError(e?.message ?? "Something went wrong.");
    } finally {
      setBusy(false);
      abortRef.current = null;
    }
  }

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Ask Cadence AI"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-accent px-4 py-2.5 text-sm font-medium text-black shadow-lg transition-transform hover:scale-105"
        >
          <MessageCircleIcon className="h-4 w-4" aria-hidden="true" />
          Ask Cadence AI
        </button>
      )}

      {open && (
        <div
          role="dialog"
          aria-label="Ask Cadence AI"
          className="fixed bottom-6 right-6 z-50 flex h-[min(600px,80vh)] w-[min(400px,calc(100vw-3rem))] flex-col overflow-hidden rounded-2xl border border-black/10 bg-white shadow-2xl dark:border-white/10 dark:bg-[#0A0A0A]"
        >
          <div className="flex items-center justify-between border-b border-black/5 px-4 py-3 dark:border-white/5">
            <span className="text-sm font-semibold">Ask Cadence AI</span>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="rounded-lg p-1.5 text-neutral-500 hover:bg-black/5 dark:hover:bg-white/10"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          <div ref={listRef} className="flex-1 space-y-4 overflow-y-auto p-4">
            {messages.length === 0 && (
              <p className="text-sm leading-relaxed text-neutral-500">
                Ask anything about Cadence — resources, capabilities,
                entitlements, transactions. Answers cite the docs where
                relevant.
              </p>
            )}
            {messages.map((m, i) => (
              <div
                key={i}
                className={
                  m.role === "user"
                    ? "ml-auto max-w-[85%] rounded-2xl bg-black/5 px-3 py-2 text-sm dark:bg-white/10"
                    : "max-w-[95%] whitespace-pre-wrap text-sm leading-relaxed"
                }
              >
                {m.content ||
                  (busy && i === messages.length - 1 ? "…" : "")}
              </div>
            ))}
            {error && (
              <p role="alert" className="text-sm text-red-500">
                {error}
              </p>
            )}
          </div>

          <div className="border-t border-black/5 p-3 dark:border-white/5">
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void send();
                  }
                }}
                placeholder="Ask about Cadence…"
                aria-label="Your question"
                className="max-h-32 flex-1 resize-none rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-accent dark:border-white/10"
              />
              <button
                onClick={() => void send()}
                disabled={busy || !input.trim()}
                aria-label="Send"
                className="rounded-lg bg-accent p-2 text-black disabled:opacity-40"
              >
                {busy ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Send className="h-4 w-4" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
