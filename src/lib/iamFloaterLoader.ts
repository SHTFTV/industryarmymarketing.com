type IamFloaterPosition = "bottom-right" | "bottom-left" | "top-right" | "top-left";

type IamFloaterConfig = {
  enabled: boolean;
  position: IamFloaterPosition;
  enabledPages: string[];
  hiddenPages: string[];
  scriptUrl: string;
  timeoutMs: number;
  label: string;
  title: string;
  subtitle: string;
  cta: string;
  href: string;
};

declare global {
  interface Window {
    __IAM_FLOATER_CONFIG__?: IamFloaterConfig;
    __IAM_FLOATER_LOADER_INSTALLED__?: boolean;
    IAMFloater?: {
      refresh?: () => void;
      destroy?: () => void;
    };
  }
}

const LOCAL_FLOATER_SCRIPT = "/iam-floater.js";

const DEFAULT_CONFIG: IamFloaterConfig = {
  enabled: true,
  position: "bottom-right",
  enabledPages: ["*"],
  hiddenPages: [],
  scriptUrl: LOCAL_FLOATER_SCRIPT,
  timeoutMs: 3500,
  label: "THE STACK",
  title: "EyeSpyr · TALC · IAM",
  subtitle: "Verification · Network · SEO",
  cta: "Explore",
  href: "/",
};

const parseBoolean = (value: string | boolean | undefined, fallback: boolean) => {
  if (typeof value === "boolean") return value;
  if (!value) return fallback;
  return ["1", "true", "yes", "on"].includes(value.trim().toLowerCase());
};

const parseNumber = (value: string | boolean | undefined, fallback: number) => {
  if (typeof value !== "string") return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const parseList = (value: string | boolean | undefined, fallback: string[]) => {
  if (typeof value !== "string" || !value.trim()) return fallback;

  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return parsed.map(String).filter(Boolean);
    }
  } catch {
    // Fall through to comma-separated parsing.
  }

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

const parseVisibilityRules = () => {
  const raw = import.meta.env.VITE_IAM_FLOATER_VISIBILITY_RULES;
  if (typeof raw !== "string" || !raw.trim()) {
    return {
      enabledPages: parseList(import.meta.env.VITE_IAM_FLOATER_ENABLED_PAGES, DEFAULT_CONFIG.enabledPages),
      hiddenPages: parseList(import.meta.env.VITE_IAM_FLOATER_HIDDEN_PAGES, DEFAULT_CONFIG.hiddenPages),
    };
  }

  try {
    const parsed = JSON.parse(raw) as Partial<Pick<IamFloaterConfig, "enabledPages" | "hiddenPages">>;
    return {
      enabledPages: Array.isArray(parsed.enabledPages) ? parsed.enabledPages.map(String) : DEFAULT_CONFIG.enabledPages,
      hiddenPages: Array.isArray(parsed.hiddenPages) ? parsed.hiddenPages.map(String) : DEFAULT_CONFIG.hiddenPages,
    };
  } catch {
    return {
      enabledPages: DEFAULT_CONFIG.enabledPages,
      hiddenPages: DEFAULT_CONFIG.hiddenPages,
    };
  }
};

const parsePosition = (value: string | boolean | undefined): IamFloaterPosition => {
  const positions: IamFloaterPosition[] = ["bottom-right", "bottom-left", "top-right", "top-left"];
  return typeof value === "string" && positions.includes(value as IamFloaterPosition)
    ? (value as IamFloaterPosition)
    : DEFAULT_CONFIG.position;
};

const createConfig = (): IamFloaterConfig => {
  const visibilityRules = parseVisibilityRules();

  return {
    ...DEFAULT_CONFIG,
    enabled: parseBoolean(import.meta.env.VITE_IAM_FLOATER_ENABLED, DEFAULT_CONFIG.enabled),
    position: parsePosition(import.meta.env.VITE_IAM_FLOATER_POSITION),
    enabledPages: visibilityRules.enabledPages,
    hiddenPages: visibilityRules.hiddenPages,
    scriptUrl:
      typeof import.meta.env.VITE_IAM_FLOATER_SCRIPT_URL === "string" && import.meta.env.VITE_IAM_FLOATER_SCRIPT_URL.trim()
        ? import.meta.env.VITE_IAM_FLOATER_SCRIPT_URL.trim()
        : DEFAULT_CONFIG.scriptUrl,
    timeoutMs: parseNumber(import.meta.env.VITE_IAM_FLOATER_LOAD_TIMEOUT_MS, DEFAULT_CONFIG.timeoutMs),
    label:
      typeof import.meta.env.VITE_IAM_FLOATER_LABEL === "string" && import.meta.env.VITE_IAM_FLOATER_LABEL.trim()
        ? import.meta.env.VITE_IAM_FLOATER_LABEL.trim()
        : DEFAULT_CONFIG.label,
    title:
      typeof import.meta.env.VITE_IAM_FLOATER_TITLE === "string" && import.meta.env.VITE_IAM_FLOATER_TITLE.trim()
        ? import.meta.env.VITE_IAM_FLOATER_TITLE.trim()
        : DEFAULT_CONFIG.title,
    subtitle:
      typeof import.meta.env.VITE_IAM_FLOATER_SUBTITLE === "string" && import.meta.env.VITE_IAM_FLOATER_SUBTITLE.trim()
        ? import.meta.env.VITE_IAM_FLOATER_SUBTITLE.trim()
        : DEFAULT_CONFIG.subtitle,
    cta:
      typeof import.meta.env.VITE_IAM_FLOATER_CTA === "string" && import.meta.env.VITE_IAM_FLOATER_CTA.trim()
        ? import.meta.env.VITE_IAM_FLOATER_CTA.trim()
        : DEFAULT_CONFIG.cta,
    href:
      typeof import.meta.env.VITE_IAM_FLOATER_HREF === "string" && import.meta.env.VITE_IAM_FLOATER_HREF.trim()
        ? import.meta.env.VITE_IAM_FLOATER_HREF.trim()
        : DEFAULT_CONFIG.href,
  };
};

const matchPath = (path: string, rule: string) => {
  if (rule === "*") return true;
  if (rule.endsWith("/*")) return path === rule.slice(0, -2) || path.startsWith(rule.slice(0, -1));
  return path === rule;
};

const shouldShow = (config: IamFloaterConfig) => {
  const path = window.location.pathname || "/";
  return (
    config.enabled &&
    config.enabledPages.some((rule) => matchPath(path, rule)) &&
    !config.hiddenPages.some((rule) => matchPath(path, rule))
  );
};

const applyFallbackPosition = (element: HTMLElement, position: IamFloaterPosition) => {
  element.style.top = "auto";
  element.style.right = "auto";
  element.style.bottom = "auto";
  element.style.left = "auto";

  if (position.includes("top")) element.style.top = "max(18px, env(safe-area-inset-top))";
  if (position.includes("bottom")) element.style.bottom = "max(18px, env(safe-area-inset-bottom))";
  if (position.includes("left")) element.style.left = "max(18px, env(safe-area-inset-left))";
  if (position.includes("right")) element.style.right = "max(18px, env(safe-area-inset-right))";
};

const showDirectFallback = (config: IamFloaterConfig) => {
  const existing = document.getElementById("iam-floater-fallback") as HTMLAnchorElement | null;
  const fallback = existing ?? document.createElement("a");

  fallback.id = "iam-floater-fallback";
  fallback.href = config.href;
  fallback.setAttribute("aria-label", `${config.cta} with ${config.title}`);
  fallback.textContent = `${config.label} · ${config.cta}`;
  fallback.style.cssText = [
    "position:fixed",
    "z-index:2147483647",
    "display:inline-flex",
    "align-items:center",
    "gap:10px",
    "max-width:calc(100vw - 36px)",
    "padding:12px 16px",
    "border:1px solid rgba(202,255,0,0.75)",
    "border-radius:8px",
    "background:#0d0d0d",
    "color:#caff00",
    "box-shadow:0 0 22px rgba(202,255,0,0.22)",
    "font:700 13px/1.2 Inter,system-ui,sans-serif",
    "letter-spacing:0",
    "text-decoration:none",
    "text-transform:uppercase",
  ].join(";");

  applyFallbackPosition(fallback, config.position);

  if (shouldShow(config)) {
    if (!fallback.parentElement) document.body.appendChild(fallback);
    fallback.style.display = "inline-flex";
  } else {
    fallback.style.display = "none";
  }
};

const loadScript = (src: string, config: IamFloaterConfig) => {
  const existing = document.querySelector<HTMLScriptElement>('script[data-iam-floater-loader="true"]');
  if (existing?.src.endsWith(src) && window.IAMFloater?.refresh) {
    window.IAMFloater.refresh();
    return;
  }

  existing?.remove();

  let settled = false;
  const script = document.createElement("script");
  script.src = src;
  script.defer = true;
  script.dataset.iamFloaterLoader = "true";

  const useLocalFallback = () => {
    if (src === LOCAL_FLOATER_SCRIPT) {
      showDirectFallback(config);
      return;
    }
    loadScript(LOCAL_FLOATER_SCRIPT, { ...config, scriptUrl: LOCAL_FLOATER_SCRIPT });
  };

  script.onload = () => {
    if (window.IAMFloater?.refresh) {
      settled = true;
      window.IAMFloater.refresh();
      return;
    }
    useLocalFallback();
  };

  script.onerror = () => {
    settled = true;
    useLocalFallback();
  };

  window.setTimeout(() => {
    if (!settled && !window.IAMFloater?.refresh) {
      settled = true;
      useLocalFallback();
    }
  }, config.timeoutMs);

  document.body.appendChild(script);
};

const refreshFloater = () => {
  const config = window.__IAM_FLOATER_CONFIG__;
  if (!config) return;

  if (!shouldShow(config)) {
    window.IAMFloater?.destroy?.();
    const fallback = document.getElementById("iam-floater-fallback");
    if (fallback) fallback.style.display = "none";
    return;
  }

  window.IAMFloater?.refresh?.();
  const fallback = document.getElementById("iam-floater-fallback");
  if (fallback) showDirectFallback(config);
};

const patchHistoryNavigation = () => {
  const dispatchNavigation = () => window.dispatchEvent(new Event("iam-floater:navigation"));

  const patch = (method: "pushState" | "replaceState") => {
    const original = history[method];
    history[method] = function patchedHistory(this: History, ...args: Parameters<History["pushState"]>) {
      const result = original.apply(this, args);
      dispatchNavigation();
      return result;
    } as History[typeof method];
  };

  patch("pushState");
  patch("replaceState");
  window.addEventListener("popstate", dispatchNavigation);
  window.addEventListener("hashchange", dispatchNavigation);
  window.addEventListener("iam-floater:navigation", refreshFloater);
};

export const installIamFloaterLoader = () => {
  if (typeof window === "undefined" || window.__IAM_FLOATER_LOADER_INSTALLED__) return;

  window.__IAM_FLOATER_LOADER_INSTALLED__ = true;
  window.__IAM_FLOATER_CONFIG__ = createConfig();
  patchHistoryNavigation();

  const start = () => {
    const config = window.__IAM_FLOATER_CONFIG__ ?? DEFAULT_CONFIG;
    if (!config.enabled) return;
    loadScript(config.scriptUrl, config);
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
};