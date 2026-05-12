/**
 * BasicLaw embed loader — same-origin as the script URL.
 * Usage:
 * <script async src="https://basiclaw.app/embed/loader.js"
 *   data-variant="ask|audit" data-country="GH" data-theme="auto"
 *   data-accent="#2563eb" data-border="rounded" data-locale="en"
 *   data-audit-type="general"></script>
 * <div data-basiclaw-embed></div>
 */
(function () {
  "use strict";
  var script = document.currentScript;
  if (!script || script.tagName !== "SCRIPT") return;

  var scriptUrl;
  try {
    scriptUrl = new URL(script.src, window.location.href);
  } catch (e) {
    return;
  }

  var trustedOrigin = scriptUrl.origin;
  var variant = (script.getAttribute("data-variant") || "ask").toLowerCase();
  var path = variant === "audit" ? "/embed/audit" : "/embed/ask";

  function attr(name) {
    var v = script.getAttribute(name);
    return v == null ? "" : String(v).trim();
  }

  var params = [];
  function add(key, value) {
    if (!value) return;
    params.push(encodeURIComponent(key) + "=" + encodeURIComponent(value));
  }

  add("country", attr("data-country"));
  add("jurisdiction", attr("data-jurisdiction"));
  add("theme", attr("data-theme"));
  add("accent", attr("data-accent"));
  add("border", attr("data-border"));
  add("locale", attr("data-locale"));
  add("auditType", attr("data-audit-type"));

  var qs = params.length ? "?" + params.join("&") : "";
  var iframeSrc = trustedOrigin + path + qs;

  var mount =
    document.querySelector("[data-basiclaw-embed]") ||
    document.getElementById("basiclaw-embed") ||
    script.nextElementSibling;

  if (!mount || !(mount instanceof HTMLElement)) {
    return;
  }

  var iframe = document.createElement("iframe");
  iframe.setAttribute("title", "BasicLaw legal assistant");
  iframe.setAttribute("src", iframeSrc);
  iframe.setAttribute("loading", "lazy");
  iframe.setAttribute("referrerpolicy", "strict-origin-when-cross-origin");
  iframe.style.width = "100%";
  iframe.style.height = "560px";
  iframe.style.border = "0";
  iframe.style.display = "block";

  mount.innerHTML = "";
  mount.appendChild(iframe);

  window.addEventListener("message", function (ev) {
    if (ev.origin !== trustedOrigin) return;
    var data = ev.data;
    if (!data || data.source !== "basiclaw" || data.type !== "resize") return;
    var h = Number(data.height);
    if (!isFinite(h) || h < 120) return;
    var capped = Math.min(Math.ceil(h), 4000);
    iframe.style.height = capped + "px";
  });
})();
