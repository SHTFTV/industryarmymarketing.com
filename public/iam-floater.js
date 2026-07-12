(function () {
  "use strict";

  var DEFAULT_CONFIG = {
    enabled: true,
    position: "bottom-right",
    enabledPages: ["*"],
    hiddenPages: [],
  };

  var ID = "iam-floater";
  var PANEL_ID = "iam-floater-panel";
  var POSITIONS = ["bottom-right", "bottom-left", "top-right", "top-left"];
  var MAIL = "mailto:partnerships@industryarmymarketing.com";

  function normalizeConfig() {
    var incoming = window.__IAM_FLOATER_CONFIG__ || {};
    var config = Object.assign({}, DEFAULT_CONFIG, incoming);
    config.enabled = config.enabled !== false;
    config.position = POSITIONS.indexOf(config.position) >= 0 ? config.position : DEFAULT_CONFIG.position;
    config.enabledPages = Array.isArray(config.enabledPages) && config.enabledPages.length ? config.enabledPages : DEFAULT_CONFIG.enabledPages;
    config.hiddenPages = Array.isArray(config.hiddenPages) ? config.hiddenPages : DEFAULT_CONFIG.hiddenPages;
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
    if (position.indexOf("left") >= 0) element.style.left = "max(14px, env(safe-area-inset-left))";
    if (position.indexOf("right") >= 0) element.style.right = "max(14px, env(safe-area-inset-right))";
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }

  function verticalLabel(text, color, size, weight, opacity) {
    return (
      '<span style="' + [
        "writing-mode:vertical-rl",
        "transform:rotate(180deg)",
        "color:" + color,
        "font-size:" + size + "px",
        "font-weight:" + weight,
        "letter-spacing:0.18em",
        "text-transform:uppercase",
        "line-height:1",
        "opacity:" + opacity,
        "white-space:nowrap",
      ].join(";") + '">' + escapeHtml(text) + '</span>'
    );
  }

  // EyeSpyr wordmark: "Eye" neon-green, "S" white, "pyr" neon-green.
  function eyespyrVerticalLabel(size, weight, opacity) {
    var wrap = [
      "writing-mode:vertical-rl",
      "transform:rotate(180deg)",
      "font-size:" + size + "px",
      "font-weight:" + weight,
      "letter-spacing:0.18em",
      "text-transform:uppercase",
      "line-height:1",
      "opacity:" + opacity,
      "white-space:nowrap",
      "display:inline-flex",
    ].join(";");
    return (
      '<span style="' + wrap + '">' +
        '<span style="color:#caff00;">Eye</span>' +
        '<span style="color:#ffffff;">S</span>' +
        '<span style="color:#caff00;">pyr</span>' +
      '</span>'
    );
  }

  function eyespyrInlineWordmark() {
    return (
      '<span style="font-weight:900;letter-spacing:0.02em;">' +
        '<span style="color:#caff00;">Eye</span>' +
        '<span style="color:#ffffff;">S</span>' +
        '<span style="color:#caff00;">pyr</span>' +
      '</span>'
    );
  }

  function buildPanel() {
    var panel = document.getElementById(PANEL_ID);
    if (panel) return panel;
    panel = document.createElement("div");
    panel.id = PANEL_ID;
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-label", "EyeSpyr TALC IAM network three-pack panel");
    panel.style.cssText = [
      "position:fixed","inset:0","z-index:2147483646",
      "display:none","align-items:center","justify-content:center",
      "background:rgba(0,0,0,0.72)","backdrop-filter:blur(6px)",
      "font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",
      "padding:24px","box-sizing:border-box",
    ].join(";");

    var rowStyle = [
      "display:flex","align-items:center","gap:12px",
      "padding:14px 14px","border-radius:8px",
      "background:rgba(255,255,255,0.03)",
      "border:1px solid rgba(202,255,0,0.22)",
      "color:#f4f4f4","text-decoration:none",
      "transition:background 140ms ease, border-color 140ms ease",
    ].join(";");
    var badgeStyle = [
      "flex:0 0 auto","width:34px","height:34px","border-radius:6px",
      "display:inline-flex","align-items:center","justify-content:center",
      "font-weight:900","font-size:14px","letter-spacing:0.02em",
    ].join(";");

    function row(href, badgeBg, badgeColor, badge, title, note, titleHtml) {
      return (
        '<a href="' + href + '" style="' + rowStyle + '">' +
          '<span style="' + badgeStyle + 'background:' + badgeBg + ';color:' + badgeColor + ';">' + escapeHtml(badge) + '</span>' +
          '<span style="min-width:0;flex:1;">' +
            '<strong style="display:block;font-size:14px;font-weight:800;line-height:1.1;color:#f4f4f4;">' + (titleHtml || escapeHtml(title)) + '</strong>' +
            '<span style="display:block;margin-top:3px;font-size:11px;line-height:1.2;color:rgba(244,244,244,0.65);">' + escapeHtml(note) + '</span>' +
          '</span>' +
        '</a>'
      );
    }

    panel.innerHTML =
      '<div style="width:min(420px,100%);padding:22px;border:1px solid rgba(202,255,0,0.55);border-radius:12px;background:linear-gradient(145deg,#101010,#050505);box-shadow:0 0 40px rgba(202,255,0,0.18),0 20px 60px rgba(0,0,0,0.6);box-sizing:border-box;">' +
        '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;">' +
          '<span style="color:#caff00;font-size:10px;font-weight:900;letter-spacing:0.18em;text-transform:uppercase;">THE STACK · 3 LAYERS</span>' +
          '<button type="button" data-iam-close style="background:transparent;border:0;color:rgba(244,244,244,0.7);font-size:20px;line-height:1;cursor:pointer;padding:4px 8px;">×</button>' +
        '</div>' +
        '<strong style="display:block;color:#f4f4f4;font-size:18px;line-height:1.2;margin-bottom:14px;">One team. One record.</strong>' +
        '<div style="display:flex;flex-direction:column;gap:8px;">' +
          row(MAIL, "#0b0b0b", "#caff00", "\u{1F441}", "EyeSpyr", "Verification standard · Coming soon", eyespyrInlineWordmark()) +
          row(MAIL, "#ff5b8a", "#0b0b0b", "T", "TALC.tv", "Network property · Coming soon") +
          row("/",  "#ff9a3c", "#0b0b0b", "I", "IAM", "Industry Army Marketing") +
        '</div>' +
        '<a href="' + MAIL + '" style="display:block;margin-top:14px;color:rgba(202,255,0,0.9);font-size:11px;letter-spacing:0.04em;text-decoration:none;">partnerships@industryarmymarketing.com</a>' +
      '</div>';

    panel.addEventListener("click", function (e) {
      var t = e.target;
      if (t === panel || (t && t.getAttribute && t.getAttribute("data-iam-close") !== null)) {
        panel.style.display = "none";
      }
    });

    document.body.appendChild(panel);
    return panel;
  }

  function openPanel() {
    var panel = buildPanel();
    panel.style.display = "flex";
  }

  function buildFloater(config) {
    var element = document.getElementById(ID);
    if (!element) {
      element = document.createElement("div");
      element.id = ID;
      element.setAttribute("data-iam-floater", "true");
      document.body.appendChild(element);
    }
    element.setAttribute("aria-label", "EyeSpyr TALC IAM stack");

    var railBtnStyle = [
      "background:transparent","border:0","padding:0","margin:0","cursor:pointer",
      "display:inline-flex","align-items:center","justify-content:center",
    ].join(";");

    element.innerHTML =
      '<div style="display:flex;flex-direction:column;align-items:center;gap:18px;padding:16px 10px 12px;flex:1;">' +
        '<button type="button" data-iam-rail="eyespyr" style="' + railBtnStyle + '" aria-label="EyeSpyr partnerships">' +
          '<span style="display:inline-flex;flex-direction:column;align-items:center;gap:12px;">' +
            verticalLabel("Partnerships", "#caff00", 10, 800, 0.85) +
            eyespyrVerticalLabel(15, 900, 1) +
          '</span>' +
        '</button>' +
        '<span style="width:1px;height:14px;background:rgba(244,244,244,0.18);"></span>' +
        '<button type="button" data-iam-rail="talc" style="' + railBtnStyle + '" aria-label="TALC.tv">' +
          verticalLabel("TALC.tv", "#f4f4f4", 15, 900, 1) +
        '</button>' +
        '<span style="width:1px;height:14px;background:rgba(244,244,244,0.18);"></span>' +
        '<button type="button" data-iam-rail="iam" style="' + railBtnStyle + '" aria-label="IAM Industry Army Marketing">' +
          verticalLabel("IAM", "#caff00", 15, 900, 1) +
        '</button>' +
        '<button type="button" data-iam-rail="learn" style="' + railBtnStyle + 'margin-top:4px;" aria-label="Learn more">' +
          verticalLabel("Learn more", "rgba(244,244,244,0.55)", 10, 700, 1) +
        '</button>' +
      '</div>' +
      '<button type="button" data-iam-open style="' +
        [
          "appearance:none","border:0","cursor:pointer",
          "margin:0","padding:12px 6px 14px",
          "background:transparent",
          "border-top:1px solid rgba(202,255,0,0.35)",
          "color:#f4f4f4","font-family:inherit",
          "font-size:11px","font-weight:900","letter-spacing:0.14em",
          "line-height:1.25","text-transform:uppercase","text-align:center",
          "width:100%","box-sizing:border-box",
        ].join(";") +
        '" aria-label="Open EyeSpyr TALC IAM network three-pack panel">' +
        'Open<br>EyeSpyr<br>TALC<br>IAM<br>Network<br>Three-<br>Pack<br>Panel' +
      '</button>' +
      '<span style="display:block;width:8px;height:8px;border-radius:50%;background:#7bd44a;box-shadow:0 0 8px rgba(123,212,74,0.9);margin:8px auto 10px;"></span>';

    element.style.cssText = [
      "position:fixed",
      "z-index:2147483647",
      "width:64px",
      "max-height:calc(100vh - 40px)",
      "display:flex","flex-direction:column","align-items:stretch",
      "border:1px solid rgba(123,212,74,0.55)",
      "border-radius:14px",
      "background:linear-gradient(180deg,#0d0f0c,#050605)",
      "box-shadow:0 0 24px rgba(123,212,74,0.18), 0 14px 35px rgba(0,0,0,0.5)",
      "font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",
      "letter-spacing:0",
      "opacity:1",
      "box-sizing:border-box",
      "overflow:hidden",
    ].join(";");

    applyPosition(element, config.position);

    var openBtn = element.querySelector('[data-iam-open]');
    if (openBtn) {
      openBtn.addEventListener("click", openPanel);
      openBtn.addEventListener("mouseenter", function () { openBtn.style.background = "rgba(202,255,0,0.09)"; });
      openBtn.addEventListener("mouseleave", function () { openBtn.style.background = "transparent"; });
    }
    var rails = element.querySelectorAll('[data-iam-rail]');
    for (var i = 0; i < rails.length; i++) {
      rails[i].addEventListener("click", openPanel);
    }

    return element;
  }

  function refresh() {
    var config = normalizeConfig();
    var existing = document.getElementById(ID);
    if (!shouldShow(config)) {
      if (existing) existing.style.display = "none";
      return;
    }
    var element = buildFloater(config);
    element.style.display = "flex";
  }

  function destroy() {
    var existing = document.getElementById(ID);
    if (existing) existing.remove();
    var panel = document.getElementById(PANEL_ID);
    if (panel) panel.remove();
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

  window.IAMFloater = { refresh: refresh, destroy: destroy, getConfig: normalizeConfig, open: openPanel };

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