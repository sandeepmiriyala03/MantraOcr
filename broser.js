/*!
 * @yuktishaalaa/yuktai v1.0.0
 * Universal WCAG Accessibility Engine
 * https://www.npmjs.com/package/@yuktishaalaa/yuktai
 * MIT License
 */
(function () {
  "use strict";

  // ── Guard: prevent double init ────────────────────────────────────────────
  if (window.__yuktai_initialized__) return;
  window.__yuktai_initialized__ = true;

  // ── Config ────────────────────────────────────────────────────────────────
  var CONFIG   = (window.YUKTAI_CONFIG) || {};
  var POSITION = CONFIG.position || "left";
  var VERSION  = "1.0.0";

  // ── State ─────────────────────────────────────────────────────────────────
  var _live     = null;
  var _fab      = null;
  var _panel    = null;
  var _active   = false;
  var _dyslexia = null;
  var _observer = null;
  var _settings = {
    highContrast : false,
    reduceMotion : false,
    autoFix      : true,
    dyslexiaFont : false,
    fontScale    : 100
  };

  // ── Constants ─────────────────────────────────────────────────────────────
  var FONT_STEPS = [80, 90, 100, 110, 120, 130, 140, 150];
  var LMARK = { nav:"navigation", header:"banner", footer:"contentinfo", main:"main", aside:"complementary" };
  var OPTIONS = [
    { id:"highContrast", label:"High Contrast",         desc:"Boosts contrast on all elements",      icon:"◑"  },
    { id:"reduceMotion", label:"Reduce Motion",          desc:"Disables all CSS animations",          icon:"⏸"  },
    { id:"autoFix",      label:"Auto-fix ARIA",          desc:"Continuously watches new DOM nodes",   icon:"♿" },
    { id:"dyslexiaFont", label:"Dyslexia Friendly",      desc:"Wider letter & word spacing",          icon:"Aa" }
  ];

  // ── WCAG Engine ───────────────────────────────────────────────────────────
  function applyFixes(config) {
    var report = { fixed: 0, scanned: 0, renderTime: 0 };
    if (typeof document === "undefined") return report;
    var start = performance.now();
    var els = document.querySelectorAll("*");
    report.scanned = els.length;

    els.forEach(function (el) {
      var h = el;
      var tag = h.tagName.toLowerCase();

      // Document
      if (tag === "html" && !h.getAttribute("lang")) { h.setAttribute("lang", "en"); report.fixed++; }

      // Skip link
      if (tag === "body" && !document.querySelector("[data-yuktai-skip]")) {
        var sk = document.createElement("a");
        sk.href = "#main-content";
        sk.setAttribute("data-yuktai-skip", "true");
        sk.setAttribute("aria-label", "Skip to main content");
        sk.textContent = "Skip to main content";
        sk.style.cssText = "position:fixed;top:-40px;left:0;background:#0d9488;color:#fff;padding:8px 16px;z-index:99999;font-family:system-ui;font-size:14px;border-radius:0 0 6px 0;text-decoration:none;font-weight:600;transition:top 0.2s ease;box-shadow:0 2px 8px rgba(0,0,0,0.2);";
        sk.addEventListener("focus", function () { sk.style.top = "0"; });
        sk.addEventListener("blur",  function () { sk.style.top = "-40px"; });
        h.insertBefore(sk, h.firstChild);
        report.fixed++;
        var main = document.querySelector("main,[role='main']");
        if (main && !main.getAttribute("tabindex")) main.setAttribute("tabindex", "-1");
      }

      // Headings
      if (["h1","h2","h3","h4","h5","h6"].indexOf(tag) > -1) {
        if (!h.innerText.trim() && !h.getAttribute("aria-label")) { h.setAttribute("aria-label", tag.toUpperCase() + " section"); report.fixed++; }
        if (h.hasAttribute("onclick") && !h.getAttribute("tabindex")) { h.setAttribute("tabindex", "0"); report.fixed++; }
      }

      // Images
      if (tag === "img" && !h.hasAttribute("alt")) { h.setAttribute("alt", ""); h.setAttribute("aria-hidden", "true"); report.fixed++; }
      if (tag === "area" && !h.getAttribute("alt")) { h.setAttribute("alt", h.getAttribute("title") || "map area"); report.fixed++; }

      // SVG
      if (tag === "svg") {
        if (!h.getAttribute("aria-hidden") && !h.getAttribute("aria-label") && !el.querySelector("title")) { h.setAttribute("aria-hidden", "true"); report.fixed++; }
        if (!h.getAttribute("focusable")) h.setAttribute("focusable", "false");
      }

      // Canvas
      if (tag === "canvas") {
        if (!h.getAttribute("role"))      { h.setAttribute("role", "img"); report.fixed++; }
        if (!h.getAttribute("aria-label")){ h.setAttribute("aria-label", h.getAttribute("title") || "graphic"); report.fixed++; }
      }

      // IFrame
      if (tag === "iframe" && !h.getAttribute("title") && !h.getAttribute("aria-label")) {
        h.setAttribute("title", "embedded content"); h.setAttribute("aria-label", "embedded content"); report.fixed++;
      }

      // Media
      if (["video","audio"].indexOf(tag) > -1 && !el.querySelector("track") && !h.getAttribute("aria-label")) {
        h.setAttribute("aria-label", h.getAttribute("title") || (tag + " player")); report.fixed++;
      }

      // Buttons
      if (tag === "button") {
        if (!h.innerText.trim() && !h.getAttribute("aria-label")) { h.setAttribute("aria-label", h.getAttribute("title") || "button"); report.fixed++; }
        if (h.hasAttribute("disabled") && !h.getAttribute("aria-disabled")) { h.setAttribute("aria-disabled", "true"); report.fixed++; }
      }

      // Links
      if (tag === "a") {
        if (!h.innerText.trim() && !h.getAttribute("aria-label")) { h.setAttribute("aria-label", h.getAttribute("title") || "link"); report.fixed++; }
        if (h.target === "_blank") {
          if (!h.rel || h.rel.indexOf("noopener") === -1) { h.rel = "noopener noreferrer"; report.fixed++; }
          var lbl = h.getAttribute("aria-label") || h.innerText.trim() || "link";
          if (lbl.indexOf("opens in new window") === -1) { h.setAttribute("aria-label", lbl + " (opens in new window)"); report.fixed++; }
        }
        if (!h.href && !h.getAttribute("role")) { h.setAttribute("role", "button"); h.setAttribute("tabindex", "0"); report.fixed++; }
      }

      // Clickable non-interactive
      var isClick = h.hasAttribute("onclick") || (window.getComputedStyle(h).cursor === "pointer");
      if (isClick && ["button","a","input","select","textarea","details","summary"].indexOf(tag) === -1) {
        if (!h.getAttribute("role")) { h.setAttribute("role", "button"); report.fixed++; }
        if (h.tabIndex < 0) { h.tabIndex = 0; report.fixed++; }
        if (!h.onkeydown) { h.onkeydown = function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); h.click(); } }; }
      }

      // Forms
      if (["input","select","textarea"].indexOf(tag) > -1) {
        if (!h.getAttribute("aria-label") && !h.getAttribute("aria-labelledby")) {
          h.setAttribute("aria-label", h.getAttribute("placeholder") || h.getAttribute("name") || h.getAttribute("title") || tag); report.fixed++;
        }
        if (h.hasAttribute("required")  && !h.getAttribute("aria-required"))  { h.setAttribute("aria-required", "true");  report.fixed++; }
        if (h.hasAttribute("disabled")  && !h.getAttribute("aria-disabled"))  { h.setAttribute("aria-disabled", "true");  report.fixed++; }
        if (h.hasAttribute("readonly")  && !h.getAttribute("aria-readonly"))  { h.setAttribute("aria-readonly", "true");  report.fixed++; }
        if (tag === "input" && !h.autocomplete) {
          var n = h.name || "";
          if (h.type === "email" || n.indexOf("email") > -1)                   { h.autocomplete = "email";           report.fixed++; }
          else if (h.type === "tel" || n.indexOf("tel") > -1)                  { h.autocomplete = "tel";             report.fixed++; }
          else if (h.type === "password")                                       { h.autocomplete = "current-password";report.fixed++; }
          else if (n === "name" || n.indexOf("fullname") > -1)                 { h.autocomplete = "name";            report.fixed++; }
        }
      }

      // Fieldset
      if (tag === "fieldset" && !el.querySelector("legend") && !h.getAttribute("aria-label")) {
        h.setAttribute("aria-label", "form group"); report.fixed++;
      }

      // Tables
      if (tag === "table") {
        if (!el.querySelector("th") && !h.getAttribute("role"))               { h.setAttribute("role", "grid");       report.fixed++; }
        if (!el.querySelector("caption") && !h.getAttribute("aria-label"))    { h.setAttribute("aria-label", "data table"); report.fixed++; }
      }
      if (tag === "th" && !h.getAttribute("scope")) { h.setAttribute("scope", h.closest("thead") ? "col" : "row"); report.fixed++; }

      // Landmarks
      if (LMARK[tag] && !h.getAttribute("role")) { h.setAttribute("role", LMARK[tag]); report.fixed++; }

      // Multiple landmarks
      if (["nav","section","article","aside"].indexOf(tag) > -1) {
        var siblings = document.querySelectorAll(tag);
        if (siblings.length > 1 && !h.getAttribute("aria-label") && !h.getAttribute("aria-labelledby")) {
          var heading = el.querySelector("h1,h2,h3,h4,h5,h6");
          if (heading && heading.innerText.trim()) { h.setAttribute("aria-label", heading.innerText.trim()); report.fixed++; }
        }
      }

      // Details / Summary / Dialog
      if (tag === "details" && !el.querySelector("summary")) { var s = document.createElement("summary"); s.textContent = "More details"; h.prepend(s); report.fixed++; }
      if (tag === "summary" && !h.innerText.trim() && !h.getAttribute("aria-label")) { h.setAttribute("aria-label", "Toggle details"); report.fixed++; }
      if (tag === "dialog") {
        if (!h.getAttribute("role"))      { h.setAttribute("role", "dialog"); report.fixed++; }
        if (!h.getAttribute("aria-label") && !h.getAttribute("aria-labelledby")) {
          var dh = el.querySelector("h1,h2,h3,h4,h5,h6");
          h.setAttribute("aria-label", dh ? dh.innerText.trim() : "dialog"); report.fixed++;
        }
      }

      // Inline elements
      if (tag === "abbr" && !h.getAttribute("title")) { h.setAttribute("title", h.innerText.trim() || "abbreviation"); report.fixed++; }
      if (tag === "time" && !h.getAttribute("datetime") && h.innerText.trim()) { h.setAttribute("datetime", h.innerText.trim()); report.fixed++; }
      if (tag === "progress") {
        if (!h.getAttribute("aria-label")) { h.setAttribute("aria-label", h.getAttribute("title") || "progress"); report.fixed++; }
        if (!h.getAttribute("aria-valuenow")) { h.setAttribute("aria-valuenow", String(h.value || 0)); h.setAttribute("aria-valuemax", String(h.max || 1)); report.fixed++; }
      }

      // ARIA widget roles
      var role = h.getAttribute("role") || "";
      if (role === "tab"      && !h.getAttribute("aria-selected")) { h.setAttribute("aria-selected", "false"); report.fixed++; }
      if (role === "option"   && !h.getAttribute("aria-selected")) { h.setAttribute("aria-selected", "false"); report.fixed++; }
      if (role === "checkbox" && !h.getAttribute("aria-checked"))  { h.setAttribute("aria-checked",  "false"); report.fixed++; }
      if (role === "radio"    && !h.getAttribute("aria-checked"))  { h.setAttribute("aria-checked",  "false"); report.fixed++; }
      if (role === "combobox" && !h.getAttribute("aria-expanded")) { h.setAttribute("aria-expanded", "false"); h.setAttribute("aria-haspopup", "listbox"); report.fixed++; }
      if (role === "slider"   && !h.getAttribute("aria-valuenow")) { h.setAttribute("aria-valuenow", "0"); h.setAttribute("aria-valuemin", "0"); h.setAttribute("aria-valuemax", "100"); report.fixed++; }
      if ((role === "alert" || role === "status") && !h.getAttribute("aria-live")) {
        h.setAttribute("aria-live", role === "alert" ? "assertive" : "polite");
        h.setAttribute("aria-atomic", "true"); report.fixed++;
      }

      // Visual preferences
      var skip = ["html","head","meta","script","style","link","noscript"];
      if (config && config.highContrast && skip.indexOf(tag) === -1) h.style.filter = "contrast(1.15) brightness(1.05)";
      if (config && config.reduceMotion) { h.style.transition = "none"; h.style.animation = "none"; }
    });

    // Live region
    if (!_live) {
      _live = document.createElement("div");
      _live.setAttribute("aria-live", "polite");
      _live.setAttribute("aria-atomic", "true");
      _live.style.cssText = "position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden;";
      document.body.appendChild(_live);
    }

    report.renderTime = parseFloat((performance.now() - start).toFixed(2));
    return report;
  }

  function startObserver(config) {
    if (_observer) return;
    _observer = new MutationObserver(function () { applyFixes(config); });
    _observer.observe(document.body, { childList: true, subtree: true, attributes: false });
  }

  function stopObserver() {
    if (_observer) { _observer.disconnect(); _observer = null; }
  }

  function announce(msg) {
    if (_live) _live.textContent = msg;
  }

  // ── FAB ───────────────────────────────────────────────────────────────────
  function buildFAB() {
    _fab = document.createElement("button");
    _fab.setAttribute("aria-label", "Open yuktai-a11y accessibility options");
    _fab.setAttribute("aria-haspopup", "dialog");
    _fab.setAttribute("aria-expanded", "false");
    _fab.setAttribute("title", "@yuktishaalaa/yuktai — Accessibility");
    _fab.innerHTML = '<svg viewBox="0 0 24 24" style="width:24px;height:24px;fill:#fff;" aria-hidden="true"><path d="M12 2a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm9 4.5l-5-.5-2-.2V5l-4 .5-4-.5v.8L4 6.5 3 7l1 3 4-.5v2.3L6 17h2l2-4.5L12 14l2 2.5L16 17h2l-2-4.2V9.5l4 .5 1-3z"/></svg>';
    _fab.style.cssText = [
      "position:fixed",
      "bottom:24px",
      POSITION + ":24px",
      "width:52px",
      "height:52px",
      "border-radius:50%",
      "background:#0d9488",
      "border:none",
      "cursor:pointer",
      "display:flex",
      "align-items:center",
      "justify-content:center",
      "box-shadow:0 4px 16px rgba(13,148,136,0.4)",
      "z-index:999999",
      "transition:background 0.2s ease,transform 0.15s ease,box-shadow 0.2s ease",
      "outline:none"
    ].join(";");

    _fab.addEventListener("click",      function () { _panel ? closePanel() : openPanel(); });
    _fab.addEventListener("mouseenter", function () { _fab.style.transform = "scale(1.1)"; _fab.style.boxShadow = "0 6px 20px rgba(13,148,136,0.5)"; });
    _fab.addEventListener("mouseleave", function () { _fab.style.transform = "scale(1)";   _fab.style.boxShadow = "0 4px 16px rgba(13,148,136,0.4)"; });
    _fab.addEventListener("focus",      function () { _fab.style.boxShadow = "0 0 0 4px rgba(13,148,136,0.45)"; });
    _fab.addEventListener("blur",       function () { _fab.style.boxShadow = "0 4px 16px rgba(13,148,136,0.4)"; });

    document.body.appendChild(_fab);
  }

  // ── Panel HTML ────────────────────────────────────────────────────────────
  function buildPanelHTML() {
    var toggleRows = OPTIONS.map(function (o, i) {
      var chk = _settings[o.id] ? "checked" : "";
      var bg  = _settings[o.id] ? "#0d9488" : "#cbd5e1";
      var lft = _settings[o.id] ? "19px"    : "3px";
      return (
        '<div style="display:flex;align-items:center;justify-content:space-between;padding:11px 18px;gap:12px;">' +
          '<div style="display:flex;align-items:center;gap:10px;flex:1;">' +
            '<span aria-hidden="true" style="width:32px;height:32px;border-radius:8px;background:#f0fdfa;color:#0d9488;display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0;">' + o.icon + '</span>' +
            '<div>' +
              '<p style="margin:0;font-size:13px;font-weight:600;color:#0f172a;line-height:1.3;">' + o.label + '</p>' +
              '<p style="margin:0;font-size:11px;color:#94a3b8;margin-top:1px;">' + o.desc + '</p>' +
            '</div>' +
          '</div>' +
          '<label aria-label="Toggle ' + o.label + '" style="position:relative;display:inline-flex;width:42px;height:24px;cursor:pointer;flex-shrink:0;">' +
            '<input type="checkbox" data-s="' + o.id + '" ' + chk + ' style="opacity:0;width:0;height:0;position:absolute;"/>' +
            '<span style="position:absolute;inset:0;border-radius:99px;background:' + bg + ';transition:background 0.2s;"></span>' +
            '<span style="position:absolute;top:3px;left:' + lft + ';width:18px;height:18px;background:#fff;border-radius:50%;transition:left 0.2s;box-shadow:0 1px 4px rgba(0,0,0,0.25);pointer-events:none;"></span>' +
          '</label>' +
        '</div>' +
        (i < OPTIONS.length - 1 ? '<div style="height:1px;background:#f1f5f9;margin:0 18px;"></div>' : "")
      );
    }).join("");

    var fontBars = FONT_STEPS.map(function (s) {
      return '<button data-step="' + s + '" aria-label="Set text size to ' + s + '%" style="flex:1;height:5px;border-radius:99px;border:none;cursor:pointer;padding:0;background:' + (s <= _settings.fontScale ? "#0d9488" : "#e2e8f0") + ';transition:background 0.15s;"></button>';
    }).join("");

    return (
      // Header
      '<div style="padding:16px 18px 14px;border-bottom:1px solid #f1f5f9;display:flex;align-items:flex-start;justify-content:space-between;">' +
        '<div>' +
          '<div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;">' +
            '<span style="font-size:10px;font-weight:700;padding:2px 8px;border-radius:99px;background:#f0fdfa;color:#0d9488;letter-spacing:0.04em;font-family:monospace;">yuktai v' + VERSION + '</span>' +
            (_active ? '<span style="font-size:10px;font-weight:700;padding:2px 8px;border-radius:99px;background:#dcfce7;color:#15803d;border:1px solid #bbf7d0;">● ACTIVE</span>' : "") +
          '</div>' +
          '<p style="margin:0 0 2px;font-size:15px;font-weight:700;color:#0f172a;">Accessibility</p>' +
          '<p style="margin:0;font-size:12px;color:#64748b;">Auto WCAG fixes · Open Source</p>' +
        '</div>' +
        '<button data-close aria-label="Close accessibility panel" style="background:none;border:none;cursor:pointer;padding:6px;color:#94a3b8;font-size:20px;line-height:1;border-radius:6px;transition:color 0.15s;" onmouseover="this.style.color=\'#0f172a\'" onmouseout="this.style.color=\'#94a3b8\'">×</button>' +
      '</div>' +

      // Toggles
      '<div style="padding:6px 0;">' + toggleRows + '</div>' +

      // Font size
      '<div style="padding:12px 18px 16px;border-top:1px solid #f1f5f9;">' +
        '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">' +
          '<p style="margin:0;font-size:13px;font-weight:600;color:#0f172a;">Text Size</p>' +
          '<span class="y-fl" style="font-size:12px;font-weight:700;color:#0d9488;background:#f0fdfa;padding:2px 10px;border-radius:99px;">' + _settings.fontScale + '%</span>' +
        '</div>' +
        '<div style="display:flex;align-items:center;gap:8px;">' +
          '<button data-dec aria-label="Decrease text size" style="width:32px;height:32px;border-radius:8px;border:1px solid #e2e8f0;background:#fff;cursor:pointer;font-size:18px;display:flex;align-items:center;justify-content:center;flex-shrink:0;color:#0f172a;transition:border-color 0.15s;">−</button>' +
          '<div style="flex:1;display:flex;gap:3px;align-items:center;">' + fontBars + '</div>' +
          '<button data-inc aria-label="Increase text size" style="width:32px;height:32px;border-radius:8px;border:1px solid #e2e8f0;background:#fff;cursor:pointer;font-size:18px;display:flex;align-items:center;justify-content:center;flex-shrink:0;color:#0f172a;transition:border-color 0.15s;">+</button>' +
        '</div>' +
      '</div>' +

      // Report badge
      '<div class="y-rep" role="status" style="display:none;margin:0 14px 4px;padding:9px 12px;background:#f0fdfa;border:1px solid #99f6e4;border-radius:8px;font-size:12px;color:#0f766e;font-weight:600;font-family:monospace;"></div>' +

      // Footer
      '<div style="display:flex;gap:8px;padding:12px 14px 16px;">' +
        '<button data-reset style="flex:1;padding:9px 0;font-size:13px;font-weight:500;border-radius:10px;border:1px solid #e2e8f0;background:#fff;color:#64748b;cursor:pointer;transition:border-color 0.15s,background 0.15s;">Reset</button>' +
        '<button data-apply style="flex:2;padding:9px 0;font-size:13px;font-weight:700;border-radius:10px;border:none;background:#0d9488;color:#fff;cursor:pointer;transition:background 0.15s;letter-spacing:0.01em;">Apply Settings</button>' +
      '</div>'
    );
  }

  // ── Panel open / close ────────────────────────────────────────────────────
  function openPanel() {
    _fab.setAttribute("aria-expanded", "true");
    _panel = document.createElement("div");
    _panel.setAttribute("role",       "dialog");
    _panel.setAttribute("aria-modal", "true");
    _panel.setAttribute("aria-label", "yuktai-a11y accessibility options");
    _panel.style.cssText = [
      "position:fixed",
      "bottom:24px",
      POSITION + ":88px",
      "width:320px",
      "background:#ffffff",
      "border:1px solid #e2e8f0",
      "border-radius:18px",
      "box-shadow:0 12px 40px rgba(0,0,0,0.12),0 2px 8px rgba(0,0,0,0.06)",
      "z-index:999998",
      "overflow:hidden",
      "font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif"
    ].join(";");
    _panel.innerHTML = buildPanelHTML();
    document.body.appendChild(_panel);
    _bindEvents();
    document.addEventListener("mousedown", _outsideClick);
    document.addEventListener("keydown",   _escKey);
    // Focus first interactive element
    setTimeout(function () {
      var first = _panel.querySelector("button,input");
      if (first) first.focus();
    }, 50);
  }

  function closePanel() {
    if (_panel) { _panel.remove(); _panel = null; }
    _fab.setAttribute("aria-expanded", "false");
    _fab.focus();
    document.removeEventListener("mousedown", _outsideClick);
    document.removeEventListener("keydown",   _escKey);
  }

  function _outsideClick(e) {
    if (_panel && !_panel.contains(e.target) && !_fab.contains(e.target)) closePanel();
  }

  function _escKey(e) {
    if (e.key === "Escape") closePanel();
  }

  // ── Panel events ──────────────────────────────────────────────────────────
  function _bindEvents() {
    _panel.querySelector("[data-close]").addEventListener("click", closePanel);

    _panel.querySelectorAll("input[data-s]").forEach(function (inp) {
      inp.addEventListener("change", function (e) {
        var key = e.target.dataset.s;
        _settings[key] = e.target.checked;
        var lbl = e.target.closest("label");
        lbl.querySelectorAll("span")[0].style.background = e.target.checked ? "#0d9488" : "#cbd5e1";
        lbl.querySelectorAll("span")[1].style.left       = e.target.checked ? "19px"    : "3px";
      });
    });

    _panel.querySelectorAll("[data-step]").forEach(function (b) {
      b.addEventListener("click", function () { _settings.fontScale = parseInt(b.dataset.step); _updateFont(); });
    });

    _panel.querySelector("[data-dec]").addEventListener("click", function () {
      var i = FONT_STEPS.indexOf(_settings.fontScale);
      if (i > 0) { _settings.fontScale = FONT_STEPS[i - 1]; _updateFont(); }
    });

    _panel.querySelector("[data-inc]").addEventListener("click", function () {
      var i = FONT_STEPS.indexOf(_settings.fontScale);
      if (i < FONT_STEPS.length - 1) { _settings.fontScale = FONT_STEPS[i + 1]; _updateFont(); }
    });

    _panel.querySelector("[data-apply]").addEventListener("click", _doApply);
    _panel.querySelector("[data-reset]").addEventListener("click", _doReset);
  }

  function _updateFont() {
    if (!_panel) return;
    _panel.querySelector(".y-fl").textContent = _settings.fontScale + "%";
    _panel.querySelectorAll("[data-step]").forEach(function (b) {
      b.style.background = parseInt(b.dataset.step) <= _settings.fontScale ? "#0d9488" : "#e2e8f0";
    });
  }

  // ── Apply / Reset ─────────────────────────────────────────────────────────
  function _doApply() {
    var config = {
      enabled:      true,
      highContrast: _settings.highContrast,
      reduceMotion: _settings.reduceMotion,
      autoFix:      _settings.autoFix
    };

    var r = applyFixes(config);
    if (_settings.autoFix) startObserver(config);

    document.documentElement.style.fontSize = _settings.fontScale + "%";

    if (_settings.dyslexiaFont && !_dyslexia) {
      _dyslexia = document.createElement("style");
      _dyslexia.textContent = "body,body *{font-family:'Georgia',serif!important;letter-spacing:.06em!important;word-spacing:.12em!important;line-height:1.9!important;}";
      document.head.appendChild(_dyslexia);
    } else if (!_settings.dyslexiaFont && _dyslexia) {
      _dyslexia.remove(); _dyslexia = null;
    }

    _active = true;
    _fab.style.background = "#0f766e";
    _fab.style.boxShadow  = "0 4px 16px rgba(15,118,110,0.4)";

    // Active dot
    if (!_fab.querySelector(".y-dot")) {
      var dot = document.createElement("span");
      dot.className = "y-dot";
      dot.setAttribute("aria-hidden", "true");
      dot.style.cssText = "position:absolute;top:4px;right:4px;width:10px;height:10px;border-radius:50%;background:#5eead4;border:2px solid #fff;";
      _fab.appendChild(dot);
    }

    console.log("[yuktai-a11y] " + r.fixed + " fixes applied across " + r.scanned + " nodes in " + r.renderTime + "ms.");
    announce("yuktai-a11y active. " + r.fixed + " accessibility fixes applied.");

    var rep = _panel && _panel.querySelector(".y-rep");
    if (rep) {
      rep.style.display = "block";
      rep.textContent = r.fixed > 0
        ? "✓ " + r.fixed + " fixes applied · " + r.scanned + " nodes · " + r.renderTime + "ms"
        : "✓ 0 fixes needed · " + r.scanned + " nodes clean · " + r.renderTime + "ms";
    }

    closePanel();
  }

  function _doReset() {
    stopObserver();
    document.documentElement.style.fontSize = "";
    if (_dyslexia) { _dyslexia.remove(); _dyslexia = null; }
    document.querySelectorAll("*").forEach(function (h) {
      h.style.filter = ""; h.style.transition = ""; h.style.animation = "";
    });
    Object.assign(_settings, { highContrast:false, reduceMotion:false, autoFix:true, dyslexiaFont:false, fontScale:100 });
    _active = false;
    _fab.style.background = "#0d9488";
    _fab.style.boxShadow  = "0 4px 16px rgba(13,148,136,0.4)";
    var dot = _fab.querySelector(".y-dot");
    if (dot) dot.remove();
    announce("yuktai-a11y disabled. All settings reset.");
    closePanel();
  }

  // ── Init ──────────────────────────────────────────────────────────────────
  function init() {
    // Focus ring styles
    var style = document.createElement("style");
    style.textContent = "*:focus-visible{outline:3px solid #0d9488!important;outline-offset:2px!important;box-shadow:0 0 0 5px rgba(13,148,136,0.2)!important;}";
    document.head.appendChild(style);

    buildFAB();
    console.log("[yuktai-a11y] @yuktishaalaa/yuktai v" + VERSION + " loaded ✅");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  // ── Public API ────────────────────────────────────────────────────────────
  window.yuktai = {
    version : VERSION,
    apply   : _doApply,
    reset   : _doReset,
    scan    : function () { return applyFixes({}); },
    engine  : { applyFixes: applyFixes, startObserver: startObserver, stopObserver: stopObserver, announce: announce }
  };

})();