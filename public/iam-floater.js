(function () {
  "use strict";

  var DEFAULT_CONFIG = {
    enabled: true,
    position: "bottom-right",
    enabledPages: ["*"],
    hiddenPages: [],
    label: "THE STACK",
    heading: "One team. One record.",
    subtitle: "Verification · Network · SEO",
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
    config.heading = String(config.heading || DEFAULT_CONFIG.heading);
    config.subtitle = String(config.subtitle || DEFAULT_CONFIG.subtitle);

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
      element = document.createElement("div");
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

    element.setAttribute("aria-label", "The IAM stack: EyeSpyr, TALC, Industry Army Marketing");

    var rowStyle = [
      "display:flex","align-items:center","gap:10px",
      "padding:9px 10px","border-radius:6px",
      "background:rgba(255,255,255,0.03)",
      "border:1px solid rgba(202,255,0,0.18)",
      "color:#f4f4f4","text-decoration:none",
      "transition:background 140ms ease, border-color 140ms ease",
    ].join(";");
    var badgeStyle = [
      "flex:0 0 auto","width:26px","height:26px","border-radius:5px",
      "display:inline-flex","align-items:center","justify-content:center",
      "background:#caff00","color:#0b0b0b","font-weight:900","font-size:12px",
      "letter-spacing:0.02em",
    ].join(";");
    var titleStyle = "display:block;font-size:13px;font-weight:800;line-height:1.1;color:#f4f4f4;";
    var noteStyle  = "display:block;margin-top:2px;font-size:11px;line-height:1.2;color:rgba(244,244,244,0.65);";

    function row(href, badge, title, note) {
      return (
        '<a href="' + href + '" style="' + rowStyle + '">' +
          '<span style="' + badgeStyle + '">' + escapeHtml(badge) + '</span>' +
          '<span style="min-width:0;">' +
            '<strong style="' + titleStyle + '">' + escapeHtml(title) + '</strong>' +
            '<span style="' + noteStyle + '">' + escapeHtml(note) + '</span>' +
          '</span>' +
        '</a>'
      );
    }

    element.innerHTML =
      '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">' +
        '<span style="color:#caff00;font-size:10px;font-weight:900;line-height:1;letter-spacing:0.14em;text-transform:uppercase;">' +
          escapeHtml(config.label) +
        '</span>' +
        '<span style="color:rgba(244,244,244,0.5);font-size:10px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;">3&nbsp;LAYERS</span>' +
      '</div>' +
      '<strong style="display:block;color:#f4f4f4;font-size:14px;line-height:1.15;margin-bottom:10px;">' +
        escapeHtml(config.heading) +
      '</strong>' +
      '<div style="display:flex;flex-direction:column;gap:6px;">' +
        row("mailto:partnerships@industryarmymarketing.com", "👁", "EyeSpyr",  "Coming soon") +
        row("mailto:partnerships@industryarmymarketing.com", "T", "TALC.tv", "Coming soon") +
        row("/",         "I",  "IAM",      "Industry Army Marketing") +
      '</div>' +
      '<a href="mailto:partnerships@industryarmymarketing.com" style="display:block;margin-top:10px;color:rgba(202,255,0,0.85);font-size:10px;line-height:1.3;letter-spacing:0.04em;text-decoration:none;">' +
        'partnerships@industryarmymarketing.com' +
      '</a>';

    // Row hover
    var rows = element.querySelectorAll('a[href]');
    for (var i = 0; i < rows.length; i++) {
      rows[i].addEventListener("mouseenter", function (e) {
        e.currentTarget.style.background = "rgba(202,255,0,0.09)";
        e.currentTarget.style.borderColor = "rgba(202,255,0,0.45)";
      });
      rows[i].addEventListener("mouseleave", function (e) {
        e.currentTarget.style.background = "rgba(255,255,255,0.03)";
        e.currentTarget.style.borderColor = "rgba(202,255,0,0.18)";
      });
    }

    element.style.cssText = [
      "position:fixed",
      "z-index:2147483647",
      "width:246px",
      "max-width:calc(100vw - 36px)",
      "padding:14px",
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