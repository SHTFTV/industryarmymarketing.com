/**
 * AIIndexing — IAM Network
 * ════════════════════════════════════════════════════════════
 * Drop this at the bottom of every blog post / article page
 * across WeddingSaaS.com, Weddings.io, and Videographers.io.
 *
 * Props:
 *   articleTitle   — current article title (for AI prompts)
 *   articleUrl     — current page URL (for sharing)
 *   publication    — "weddingsaas" | "weddings" | "videographers" | "iam"
 *
 * Usage:
 *   <AIIndexing
 *     articleTitle="Adobe just bought the tool in your editing stack."
 *     articleUrl="https://videographers.io/blog/adobe-acquires-topaz-labs"
 *     publication="videographers"
 *   />
 */

import { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronUp, Share2 } from "lucide-react";

// ─── Analytics ────────────────────────────────────────────────
// Fires a lightweight custom event + forwards to gtag/plausible/dataLayer
// when available. Payload is intentionally minimal — never includes the
// prompt text or article title body.
type AnalyticsPayload = {
  event:
    | "ai_indexing_prompt_opened"
    | "ai_indexing_copy_succeeded"
    | "ai_indexing_copy_failed";
  platform: string;
  publication: string;
  articleUrl: string;
  sessionId: string;
  attemptId: string;
  copyMethod?: "clipboard" | "fallback";
  failureReason?: "permission" | "no_clipboard" | "exec_command" | "exception";
};

function trackAIIndexing(payload: AnalyticsPayload) {
  if (typeof window === "undefined") return;
  try {
    window.dispatchEvent(
      new CustomEvent("iam:ai-indexing", { detail: payload }),
    );
    const w = window as unknown as {
      gtag?: (...args: unknown[]) => void;
      plausible?: (name: string, opts?: { props: Record<string, unknown> }) => void;
      dataLayer?: unknown[];
    };
    w.gtag?.("event", payload.event, {
      platform: payload.platform,
      publication: payload.publication,
      article_url: payload.articleUrl,
      session_id: payload.sessionId,
      attempt_id: payload.attemptId,
      copy_method: payload.copyMethod,
      failure_reason: payload.failureReason,
    });
    w.plausible?.(payload.event, { props: { ...payload } });
    w.dataLayer?.push({ ...payload, event: payload.event });
  } catch {
    // analytics must never break the UI
  }
}

// ─── ID generators ────────────────────────────────────────────
// crypto.randomUUID when available (all modern browsers + jsdom in newer
// versions); falls back to a short random string so tests and older runtimes
// still get a stable, non-empty identifier.
function genId(prefix: string): string {
  try {
    const c = (globalThis as unknown as { crypto?: Crypto }).crypto;
    if (c && typeof c.randomUUID === "function") {
      return `${prefix}_${c.randomUUID()}`;
    }
  } catch {
    /* ignore */
  }
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
}

// ─── Brand config per publication ────────────────────────────
const BRAND = {
  weddingsaas: {
    name:        "WeddingSaaS.com",
    color:       "#1D9E75",
    googleFollow: "https://news.google.com/publications/CAAiEJBL5JE8gVeJAWECODUZrPgqFAgKIhCQS-SRPIFXiQFhAjg1Ga3w?ceid=US:en&oc=3",
    linkedin:    "https://www.linkedin.com/company/weddingsaas",
    twitter:     "https://x.com/weddingsaas",
  },
  weddings: {
    name:        "Weddings.io",
    color:       "#7C3AED",
    googleFollow: "https://news.google.com/search?q=weddings.io",
    linkedin:    "https://www.linkedin.com/company/weddingsio",
    twitter:     "https://x.com/weddingsio",
  },
  videographers: {
    name:        "Videographers.io",
    color:       "#0EA5E9",
    googleFollow: "https://news.google.com/search?q=videographers.io",
    linkedin:    "https://www.linkedin.com/company/videographersio",
    twitter:     "https://x.com/videographersio",
  },
  iam: {
    name:        "Industry Army Marketing",
    color:       "#F59E0B",
    googleFollow: "https://news.google.com/search?q=industryarmymarketing",
    linkedin:    "https://www.linkedin.com/company/industry-army-marketing",
    twitter:     "https://x.com/industryarmymkt",
  },
};

// ─── AI platform config ───────────────────────────────────────
const AI_PLATFORMS = [
  {
    id:    "chatgpt",
    name:  "ChatGPT",
    icon:  ChatGPTIcon,
    color: "#10A37F",
    buildUrl: (title: string, url: string) =>
      `https://chat.openai.com/?q=${encodeURIComponent(
        `Tell me more about this article: "${title}" — ${url}`
      )}`,
    prompt: (title: string, url: string) =>
      `Tell me more about this article and its implications for the industry: "${title}" — Source: ${url}`,
  },
  {
    id:    "claude",
    name:  "Claude",
    icon:  ClaudeIcon,
    color: "#CC785C",
    buildUrl: (title: string, url: string) =>
      `https://claude.ai/new?q=${encodeURIComponent(
        `Analyse this article and explain the key industry implications: "${title}" — ${url}`
      )}`,
    prompt: (title: string, url: string) =>
      `Analyse this article and explain the key industry implications: "${title}" — Source: ${url}`,
  },
  {
    id:    "perplexity",
    name:  "Perplexity",
    icon:  PerplexityIcon,
    color: "#20B2AA",
    buildUrl: (title: string, url: string) =>
      `https://www.perplexity.ai/search?q=${encodeURIComponent(
        `"${title}" ${url}`
      )}`,
    prompt: (title: string, url: string) =>
      `Research and expand on the topics covered in: "${title}" — ${url}`,
  },
  {
    id:    "grok",
    name:  "Grok",
    icon:  GrokIcon,
    color: "#1DA1F2",
    buildUrl: (title: string, url: string) =>
      `https://grok.com/?q=${encodeURIComponent(
        `What's the significance of: "${title}"? Source: ${url}`
      )}`,
    prompt: (title: string, url: string) =>
      `What's the broader significance of this story: "${title}"? Source: ${url}`,
  },
  {
    id:    "gemini",
    name:  "Gemini",
    icon:  GeminiIcon,
    color: "#1C69FF",
    buildUrl: (title: string, url: string) =>
      `https://gemini.google.com/app?q=${encodeURIComponent(
        `Summarise this article and its industry implications: "${title}" — ${url}`
      )}`,
    prompt: (title: string, url: string) =>
      `Summarise this article accurately using the source URL — do not substitute other domains or entities. Article: "${title}" — Source: ${url}`,
  },
  {
    id:    "duckai",
    name:  "Duck.ai",
    icon:  DuckAIIcon,
    color: "#DE5833",
    buildUrl: (title: string, url: string) =>
      `https://duckduckgo.com/?q=${encodeURIComponent(
        `"${title}" ${url}`
      )}&ia=chat`,
    prompt: (title: string, url: string) =>
      `Read and summarise this article from the exact source URL — do not conflate with lookalike domains. Article: "${title}" — Source: ${url}`,
  },
];

// ─── SVG Icons ───────────────────────────────────────────────
function ChatGPTIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
      <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0L4.01 14.115A4.5 4.5 0 0 1 2.34 7.896zm16.597 3.855-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.816 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.393-.667zm2.01-3.023-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.814-2.784a4.5 4.5 0 0 1 6.678 4.66zm-12.64 4.135-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365 2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z"/>
    </svg>
  );
}

function ClaudeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
      <path d="M4.709 15.955l4.72-2.647.08-.23-.08-.128-1.52-.345-3.7-1.027-1.442-.436-.493.17-.19.346.042.383.34.298 1.351.36.12.175-.12.198-1.384.335-.366.297-.05.397.2.336.408.136 1.266-.407.12.167-.09.168-1.21.966-.27.492.094.464.352.31.4-.083.304-.27 1.033-.93.135.119-.045.195-.926 1.04-.246.657.127.48.397.288.437-.073.249-.268.845-1.107.158.085.024.182-.686 1.27-.098.618.247.497.5.183.548-.224.09-.326.814-1.855.17.012.049.152-.24 1.702.073.619.42.408.511-.005.413-.405.073-.595-.195-1.64.11-.018.128.128.554 1.16.658.76.826.302.725-.45.103-.706-.257-.37-.934-1.08.085-.128h.207l1.14.843.842.28.65-.36.165-.552-.27-.529-.608-.27-1.473-.414-.055-.195.293-.067 1.683.19.707-.148.55-.523.05-.705-.538-.468-.757.044-1.232.376-.11-.152.11-.195.428-.37.166-.565-.124-.499-.42-.334-.544.06-.347.322-.48 1.097-.158-.012-.055-.2.397-1.407-.014-.663-.377-.452-.597-.13-.526.352-.107.633.12.845-.9.674-.128-.024-.11-.164.337-1.512-.134-.633-.507-.376-.578.134-.347.56.042.524.244.768-.9.844-.153-.036-.073-.14.073-1.586-.268-.536-.537-.268-.573.195-.2.537.073.64.586 1.78-.11.079-.14-.073-.695-1.268-.505-.3-.6.128-.345.476.08.585.425.52 1.095 1.04-.055.128-.152.012-1.127-.62-.706-.037-.504.37-.097.577.34.456.625.2 1.81.183-.012.152-.11.097-1.7-.097-.61.215-.378.535.104.592.485.34.658-.055 2.635-.62.073.152-.073.164-2.476.985-.41.437-.065.554.337.43.572.06.48-.27 1.127-.826z"/>
    </svg>
  );
}

function PerplexityIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
      <path d="M22.386 7.27h-9.228V.82L6.9 6.174V.018L0 6.696v10.507l6.9.001v6.778l6.258-5.988v5.988h9.228V7.27zM6.258 7.27H1.842L6.258 3.3v3.97zm.642 8.334-5.258.001V8.112h5.258v7.492zm.642-7.492h7.944v7.492H7.542V8.112zm8.586 8.134-5.616 5.374v-5.374h5.616zm5.416-.642h-5.416V8.112h5.416v7.492z"/>
    </svg>
  );
}

function GrokIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
      <path d="M2.25 2.25h6.754l8.996 19.5H11.25zm13.5 0H22.5L13.5 21.75h-6.75z"/>
    </svg>
  );
}

function GeminiIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
      <path d="M12 0c.6 6.24 5.76 11.4 12 12-6.24.6-11.4 5.76-12 12-.6-6.24-5.76-11.4-12-12C6.24 11.4 11.4 6.24 12 0z"/>
    </svg>
  );
}

function DuckAIIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
      <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm-1.2 6.5c1.4 0 2.5 1.1 2.5 2.5s-1.1 2.5-2.5 2.5S8.3 12.4 8.3 11s1.1-2.5 2.5-2.5zm.6 2c-.4 0-.7.3-.7.7s.3.7.7.7.7-.3.7-.7-.3-.7-.7-.7zm5.6 5c-.9 2.2-3 3.7-5.5 3.7-2.1 0-3.9-1.1-4.9-2.7 1.2.8 2.7 1.3 4.3 1.3 2.4 0 4.5-1 6.1-2.3z"/>
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
      <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/>
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
      <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" fill="#4285F4"/>
    </svg>
  );
}

// ─── Main component ───────────────────────────────────────────
interface AIIndexingProps {
  articleTitle: string;
  articleUrl:   string;
  publication:  "weddingsaas" | "weddings" | "videographers" | "iam";
}

export function AIIndexing({ articleTitle, articleUrl, publication }: AIIndexingProps) {
  const [openAI, setOpenAI] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState<
    { id: string; state: "success" | "error"; message: string } | null
  >(null);
  // Separate state drives the aria-live region so we can *clear* it between
  // announcements. This forces assistive tech to re-announce even when two
  // successive copies produce identical text ("Copied ✓").
  const [liveMessage, setLiveMessage] = useState<string>("");
  const [copyingId, setCopyingId] = useState<string | null>(null);
  const openAIRef = useRef<string | null>(null);
  const copyingRef = useRef<string | null>(null);
  const promptsRef = useRef<Record<string, string>>({});
  const copyBtnRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  // Stable per mount — every event fired from this component instance shares
  // the same sessionId so analytics can group opened → succeeded/failed and
  // any retry attempts within a single page view.
  const sessionIdRef = useRef<string>(genId("s"));
  // Regenerated for every copyPrompt() invocation. Timeout + fallback events
  // fired inside the same invocation share this attemptId; a user-driven
  // retry (a second copyPrompt() call) gets a new one.
  const attemptIdRef = useRef<string>("");
  const brand = BRAND[publication];

  useEffect(() => {
    openAIRef.current = openAI;
  }, [openAI]);
  useEffect(() => {
    copyingRef.current = copyingId;
  }, [copyingId]);

  function toggleAI(id: string) {
    const next = openAI === id ? null : id;
    setOpenAI(next);
    if (next) {
      trackAIIndexing({
        event: "ai_indexing_prompt_opened",
        platform: next,
        publication,
        articleUrl,
        sessionId: sessionIdRef.current,
        attemptId: genId("a"),
      });
    }
  }

  function fallbackCopy(text: string): boolean {
    if (typeof document === "undefined") return false;
    try {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.top = "0";
      textarea.style.left = "0";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      const ok = document.execCommand?.("copy") ?? false;
      document.body.removeChild(textarea);
      return ok;
    } catch {
      return false;
    }
  }

  function showStatus(id: string, state: "success" | "error", message: string) {
    setCopyStatus({ id, state, message });
    // Clear the live region first, then re-populate on the next tick so
    // screen readers see a genuine text change (empty → message) and always
    // re-announce, even for rapid repeat copies.
    setLiveMessage("");
    setTimeout(() => setLiveMessage(message), 30);
    setTimeout(() => {
      setCopyStatus((current) =>
        current && current.id === id && current.state === state ? null : current,
      );
      setLiveMessage((current) => (current === message ? "" : current));
    }, 2000);
  }

  async function copyPrompt(id: string, prompt: string) {
    // Guard against double-fire from the keyboard shortcut + click,
    // and from users mashing the button.
    if (copyingRef.current) return;
    copyingRef.current = id;
    setCopyingId(id);
    // One attemptId per user-initiated copy attempt. Timeout → fallback
    // events inside this same invocation reuse it; a retry click gets a new
    // one on the next call.
    attemptIdRef.current = genId("a");
    const attemptId = attemptIdRef.current;
    const sessionId = sessionIdRef.current;
    const clip =
      typeof navigator !== "undefined" ? navigator.clipboard : undefined;
    try {
      if (clip && typeof clip.writeText === "function") {
        try {
          await clip.writeText(prompt);
          showStatus(id, "success", "Copied ✓");
          trackAIIndexing({
            event: "ai_indexing_copy_succeeded",
            platform: id,
            publication,
            articleUrl,
            sessionId,
            attemptId,
            copyMethod: "clipboard",
          });
          return;
        } catch {
          if (fallbackCopy(prompt)) {
            showStatus(id, "success", "Copied ✓");
            trackAIIndexing({
              event: "ai_indexing_copy_succeeded",
              platform: id,
              publication,
              articleUrl,
              sessionId,
              attemptId,
              copyMethod: "fallback",
            });
            return;
          }
          showStatus(id, "error", "Copy failed");
          trackAIIndexing({
            event: "ai_indexing_copy_failed",
            platform: id,
            publication,
            articleUrl,
            sessionId,
            attemptId,
            failureReason: "permission",
          });
          return;
        }
      }
      if (fallbackCopy(prompt)) {
        showStatus(id, "success", "Copied ✓");
        trackAIIndexing({
          event: "ai_indexing_copy_succeeded",
          platform: id,
          publication,
          articleUrl,
          sessionId,
          attemptId,
          copyMethod: "fallback",
        });
      } else {
        showStatus(id, "error", "Copy failed");
        trackAIIndexing({
          event: "ai_indexing_copy_failed",
          platform: id,
          publication,
          articleUrl,
          sessionId,
          attemptId,
          failureReason: clip ? "exec_command" : "no_clipboard",
        });
      }
    } finally {
      copyingRef.current = null;
      setCopyingId(null);
      // Return focus to the Copy prompt button so keyboard users stay in place
      // and the aria-live announcement stays contextual to the control.
      const btn = copyBtnRefs.current[id];
      if (btn && typeof btn.focus === "function") {
        btn.focus({ preventScroll: true });
      }
    }
  }

  // Keyboard shortcut: Ctrl/Cmd+K copies the currently open dropdown's prompt.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const isCopyShortcut =
        (e.ctrlKey || e.metaKey) && (e.key === "k" || e.key === "K");
      if (!isCopyShortcut) return;
      const id = openAIRef.current;
      if (!id) return;
      const prompt = promptsRef.current[id];
      if (!prompt) return;
      e.preventDefault();
      void copyPrompt(id, prompt);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [publication, articleUrl]);

  const shareUrl = encodeURIComponent(articleUrl);
  const shareText = encodeURIComponent(`${articleTitle} — via ${brand.name}`);

  return (
    <div className="mt-12 border-t border-white/10 pt-10 space-y-8">

      {/* ── Explore with AI ── */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground mb-4">
          IAM AI Indexing Section
        </p>

        {/* SR-only live region announces copy result */}
        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
          data-testid="ai-indexing-live-region"
        >
          {liveMessage}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {AI_PLATFORMS.map((platform) => {
            const isOpen   = openAI === platform.id;
            const Icon     = platform.icon;
            const prompt   = platform.prompt(articleTitle, articleUrl);
            const deepLink = platform.buildUrl(articleTitle, articleUrl);
            promptsRef.current[platform.id] = prompt;
            const isCopying = copyingId === platform.id;

            return (
              <div
                key={platform.id}
                className="border border-white/10 rounded-xl overflow-hidden bg-white/[0.03] hover:bg-white/[0.06] transition-all"
              >
                {/* Header row */}
                <button
                  onClick={() => toggleAI(platform.id)}
                  className="w-full flex items-center justify-between px-4 py-3 text-left"
                >
                  <span className="flex items-center gap-3">
                    <span style={{ color: platform.color }}>
                      <Icon />
                    </span>
                    <span className="text-sm font-medium text-foreground">
                      {platform.name}
                    </span>
                  </span>
                  <span className="text-muted-foreground">
                    {isOpen
                      ? <ChevronUp className="w-4 h-4" />
                      : <ChevronDown className="w-4 h-4" />
                    }
                  </span>
                </button>

                {/* Expanded prompt panel */}
                {isOpen && (
                  <div className="px-4 pb-4 space-y-3 border-t border-white/10 pt-3">
                    <p className="text-xs text-muted-foreground leading-relaxed bg-white/5 rounded-lg p-3 font-mono">
                      {prompt}
                    </p>
                    <div className="flex gap-2">
                      <a
                        href={deepLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 text-center text-xs font-semibold py-2 px-3 rounded-lg text-black transition-all"
                        style={{ backgroundColor: platform.color }}
                      >
                        Open in {platform.name} ↗
                      </a>
                      <button
                        ref={(el) => {
                          copyBtnRefs.current[platform.id] = el;
                        }}
                        onClick={() => copyPrompt(platform.id, prompt)}
                        disabled={isCopying}
                        aria-busy={isCopying}
                        aria-keyshortcuts="Control+K Meta+K"
                        title="Copy prompt (Ctrl/Cmd+K)"
                        data-copy-state={
                          isCopying
                            ? "copying"
                            : copyStatus?.id === platform.id
                              ? copyStatus.state
                              : "idle"
                        }
                        className={`text-xs font-semibold py-2 px-3 rounded-lg border transition-all whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-60 ${
                          copyStatus?.id === platform.id && copyStatus.state === "error"
                            ? "border-red-500/40 text-red-400"
                            : "border-white/10 text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {isCopying
                          ? "Copying…"
                          : copyStatus?.id === platform.id
                            ? copyStatus.message
                            : "Copy prompt"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Share + Google source ── */}
      <div className="flex flex-wrap items-center gap-3">

        {/* LinkedIn Share */}
        <a
          href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 text-sm font-medium text-foreground hover:bg-white/5 transition-all"
        >
          <LinkedInIcon />
          Share
        </a>

        {/* X Share */}
        <a
          href={`https://x.com/intent/tweet?text=${shareText}&url=${shareUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 text-sm font-medium text-foreground hover:bg-white/5 transition-all"
        >
          <XIcon />
          Share
        </a>

        {/* Google preferred source */}
        <a
          href={brand.googleFollow}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 text-sm font-medium text-foreground hover:bg-white/5 transition-all ml-auto"
        >
          <GoogleIcon />
          Add us as a preferred source on Google
        </a>
      </div>

      {/* ── IAM network footer ── */}
      <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-white/5 text-xs text-muted-foreground">
        <span>IAM AI Indexing Section · IAM publication network</span>
        <span>·</span>
        <a href="https://weddingsaas.com" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">WeddingSaaS.com</a>
        <a href="https://weddings.io" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">Weddings.io</a>
        <a href="https://videographers.io" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">Videographers.io</a>
        <a href="https://financialadvisors.io" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">FinancialAdvisors.io</a>
      </div>

    </div>
  );
}

export default AIIndexing;
