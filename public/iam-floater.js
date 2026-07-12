(function () {
  "use strict";

  var DEFAULT_CONFIG = {
    enabled: true,
    position: "bottom-right",
    enabledPages: ["*"],
    hiddenPages: [],
    label: "SEO PACKAGES",
    title: "Industry Army Marketing",
    subtitle: "$10 territory SEO",
    cta: "Get started",
    href: "/pricing",
  };

  var ID = "iam-floater";
  var POSITIONS = ["bottom-right", "bottom-left", "top-right", "top-left"];

  function normalizeConfig() {
    var incoming = window.__IAM_FLOATER_CONFIG__ || {};
    var config = Object.assign({}, DEFAULT_CONFIG, incoming);

    config.enabled = config.enabled !== false;
    config.position = POSITIONS.indexOf(config.position) >= 0 ? config.position : DEFAULT_CONFIG.position;
    config.enabledPages = Array.isArray(config.enabledPages) && config.enabledPages.length ? config.enabledPages : DEFAULT_CONFIG.enabledPages;
    config.hiddenPages = Array.isArray(config.hiddenPages) ? config.hiddenPages : DEFAULT_CONFIG.hiddenPages;
    config.label = String(config.label || DEFAULT_CONFIG.label);
    config.title = String(config.title || DEFAULT_CONFIG.title);
    config.subtitle = String(config.subtitle || DEFAULT_CONFIG.subtitle);
    config.cta = String(config.cta || DEFAULT_CONFIG.cta);
    config.href = String(config.href || DEFAULT_CONFIG.href);

    return config;
  }

  function matchPath(path, rule) {
    if (rule === "*") return true;
    if (typeof rule !== "string" || !rule) return false;
    if (rule.slice(-2) === "/*") {
      var base = rule.slice(0, -2);
      return path === base || path.indexOf(base + "/") === 0;
    }
    return path === rule;
  }

  function shouldShow(config) {
    var path = window.location.pathname || "/";
    return (
      config.enabled &&
      config.enabledPages.some(function (rule) { return matchPath(path, rule); }) &&
      !config.hiddenPages.some(function (rule) { return matchPath(path, rule); })
    );
  }

  function applyPosition(element, position) {
    element.style.top = "auto";
    element.style.right = "auto";
    element.style.bottom = "auto";
    element.style.left = "auto";

    if (position.indexOf("top") >= 0) element.style.top = "max(18px, env(safe-area-inset-top))";
    if (position.indexOf("bottom") >= 0) element.style.bottom = "max(18px, env(safe-area-inset-bottom))";
    if (position.indexOf("left") >= 0) element.style.left = "max(18px, env(safe-area-inset-left))";
    if (position.indexOf("right") >= 0) element.style.right = "max(18px, env(safe-area-inset-right))";
  }

  function buildFloater(config) {
    var element = document.getElementById(ID);
    if (!element) {
      element = document.createElement("a");
      element.id = ID;
      element.setAttribute("data-iam-floater", "true");
      element.addEventListener("mouseenter", function () {
        element.style.transform = "translateY(-3px)";
        element.style.boxShadow = "0 0 30px rgba(202,255,0,0.34), 0 18px 45px rgba(0,0,0,0.45)";
      });
      element.addEventListener("mouseleave", function () {
        element.style.transform = "translateY(0)";
        element.style.boxShadow = "0 0 24px rgba(202,255,0,0.22), 0 14px 35px rgba(0,0,0,0.4)";
      });
      document.body.appendChild(element);
    }

    element.href = config.href;
    element.setAttribute("aria-label", config.cta + " with " + config.title);
    element.innerHTML =
      '<span style="display:block;color:#caff00;font-size:11px;font-weight:900;line-height:1;text-transform:uppercase;">' +
      escapeHtml(config.label) +
      '</span><strong style="display:block;margin-top:5px;color:#f4f4f4;font-size:15px;line-height:1.1;">' +
      escapeHtml(config.title) +
      '</strong><span style="display:block;margin-top:4px;color:rgba(244,244,244,0.72);font-size:12px;line-height:1.2;">' +
      escapeHtml(config.subtitle) +
      '</span><em style="display:inline-flex;margin-top:10px;color:#0b0b0b;background:#caff00;border-radius:5px;padding:7px 9px;font-style:normal;font-size:12px;font-weight:900;line-height:1;text-transform:uppercase;">' +
      escapeHtml(config.cta) +
      '</em>';

    element.style.cssText = [
      "position:fixed",
      "z-index:2147483647",
      "width:210px",
      "max-width:calc(100vw - 36px)",
      "padding:15px",
      "border:1px solid rgba(202,255,0,0.72)",
      "border-radius:8px",
      "background:linear-gradient(145deg,#101010,#050505)",
      "box-shadow:0 0 24px rgba(202,255,0,0.22), 0 14px 35px rgba(0,0,0,0.4)",
      "font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",
      "letter-spacing:0",
      "text-decoration:none",
      "transition:transform 160ms ease, box-shadow 160ms ease, opacity 160ms ease",
      "opacity:1",
      "box-sizing:border-box",
    ].join(";");

    applyPosition(element, config.position);
    return element;
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function refresh() {
    var config = normalizeConfig();
    var existing = document.getElementById(ID);

    if (!shouldShow(config)) {
      if (existing) existing.style.display = "none";
      return;
    }

    var element = buildFloater(config);
    element.style.display = "block";
  }

  function destroy() {
    var existing = document.getElementById(ID);
    if (existing) existing.remove();
  }

  function patchHistory(method) {
    var original = history[method];
    if (!original || original.__iamFloaterPatched) return;

    history[method] = function () {
      var result = original.apply(this, arguments);
      window.dispatchEvent(new Event("iam-floater:navigation"));
      return result;
    };
    history[method].__iamFloaterPatched = true;
  }

  window.IAMFloater = {
    refresh: refresh,
    destroy: destroy,
    getConfig: normalizeConfig,
  };

  patchHistory("pushState");
  patchHistory("replaceState");
  window.addEventListener("popstate", refresh);
  window.addEventListener("hashchange", refresh);
  window.addEventListener("iam-floater:navigation", refresh);

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", refresh, { once: true });
  } else {
    refresh();
  }
})();