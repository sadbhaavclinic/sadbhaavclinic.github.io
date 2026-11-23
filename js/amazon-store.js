/* RPC Rounds: show each reader their own Amazon store first.
   - Guesses the reader's country from the browser time zone (then language).
   - Where a page offers several Amazon stores side by side, moves the reader's store to the front.
   - Where a page offers only an Amazon India link, points it to the reader's store (US, UK, Canada, Australia).
   - Adds the right affiliate tag to any amazon.com, .co.uk or .ca link that lacks one
     (site-extras.js sends untagged amazon.in links to the local store but drops the tag).
   - Changes nothing else for readers in India or where the country cannot be guessed.
   No cookies, no tracking, nothing is sent anywhere. */
(function () {
  var S = {
    us: { host: "www.amazon.com", tag: "dhavalb20-20", name: "Amazon US" },
    uk: { host: "www.amazon.co.uk", tag: "dhavalb2007-21", name: "Amazon UK" },
    ca: { host: "www.amazon.ca", tag: "dhavalb200c-20", name: "Amazon Canada" },
    "in": { host: "www.amazon.in", tag: "dhavalb20-21", name: "Amazon India" },
    au: { host: "www.amazon.com.au", tag: "", name: "Amazon Australia" }
  };
  function storeOf(host) {
    host = (host || "").toLowerCase();
    if (/amazon\.co\.uk$/.test(host)) return "uk";
    if (/amazon\.com\.au$/.test(host)) return "au";
    if (/amazon\.ca$/.test(host)) return "ca";
    if (/amazon\.in$/.test(host)) return "in";
    if (/amazon\.com$/.test(host)) return "us";
    return null;
  }
  function guess() {
    var tz = "";
    try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ""; } catch (e) {}
    if (/^Asia\/(Kolkata|Calcutta)$/.test(tz)) return "in";
    if (/^Australia\//.test(tz) || /^Pacific\/(Auckland|Chatham)$/.test(tz)) return "au";
    if (/^Europe\/(London|Belfast)$/.test(tz)) return "uk";
    if (/^America\/(Toronto|Vancouver|Edmonton|Winnipeg|Halifax|St_Johns|Regina|Montreal|Moncton|Whitehorse|Yellowknife|Iqaluit|Glace_Bay|Goose_Bay)$/.test(tz)) return "ca";
    if (/^America\/(New_York|Chicago|Denver|Los_Angeles|Phoenix|Anchorage|Detroit|Boise|Juneau|Sitka|Nome|Adak|Yakutat|Metlakatla|Menominee|Indiana\/|Kentucky\/|North_Dakota\/)/.test(tz) || tz === "Pacific/Honolulu") return "us";
    var langs = (navigator.languages && navigator.languages.length) ? navigator.languages : [navigator.language || ""];
    for (var i = 0; i < langs.length; i++) {
      var l = String(langs[i]).toLowerCase();
      if (/-gb$/.test(l)) return "uk";
      if (/-ca$/.test(l)) return "ca";
      if (/-(au|nz)$/.test(l)) return "au";
      if (/-in$/.test(l) || /^(hi|gu|mr|ta|te|bn|kn|ml|pa)(-|$)/.test(l)) return "in";
    }
    return null;
  }
  function retarget(a, c) {
    try {
      var u = new URL(a.href);
      u.host = S[c].host;
      if (S[c].tag) u.searchParams.set("tag", S[c].tag); else u.searchParams["delete"]("tag");
      a.href = u.toString();
      var t = a.textContent;
      if (/Amazon(\.in| India)/.test(t)) a.textContent = t.replace(/Amazon(\.in| India)/, S[c].name);
      if (!S[c].tag) {
        var r = (a.getAttribute("rel") || "").replace(/\bsponsored\b/, "").trim();
        a.setAttribute("rel", r || "noopener");
      }
    } catch (e) {}
  }
  function repair() {
    var L = document.querySelectorAll('a[href*="amazon."]');
    for (var i = 0; i < L.length; i++) {
      var a = L[i], st = storeOf(a.hostname);
      if (!st || !S[st].tag || a.closest("script")) continue;
      try {
        var u = new URL(a.href);
        if (u.searchParams.get("tag")) continue;
        u.searchParams.set("tag", S[st].tag);
        a.href = u.toString();
        var r = a.getAttribute("rel") || "noopener";
        if (!/\bsponsored\b/.test(r)) a.setAttribute("rel", (r + " sponsored").trim());
      } catch (e) {}
    }
  }
  function run() {
    repair();
    var c = guess();
    if (!c) return;
    var links = Array.prototype.slice.call(document.querySelectorAll('a[href*="amazon."]'));
    var groups = [];
    links.forEach(function (a) {
      var st = storeOf(a.hostname);
      if (!st) return;
      var p = a.parentNode, g = null;
      for (var i = 0; i < groups.length; i++) if (groups[i].p === p) g = groups[i];
      if (!g) { g = { p: p, items: [] }; groups.push(g); }
      g.items.push({ a: a, st: st });
    });
    groups.forEach(function (g) {
      var stores = {};
      g.items.forEach(function (x) { stores[x.st] = 1; });
      if (Object.keys(stores).length > 1) {
        var first = g.items[0].a, mine = null;
        g.items.forEach(function (x) { if (!mine && x.st === c) mine = x.a; });
        if (!mine || mine === first) return;
        var fc = first.className, mc = mine.className;
        first.className = mc; mine.className = fc;
        var m = /^(.*?)(Amazon.*)$/.exec(first.textContent);
        if (m && m[1]) { first.textContent = m[2]; mine.textContent = m[1] + mine.textContent; }
        first.parentNode.insertBefore(mine, first);
      } else if (c !== "in") {
        g.items.forEach(function (x) { if (x.st === "in") retarget(x.a, c); });
      }
    });
  }
  function start() {
    run();
    if (window.MutationObserver) {
      var t;
      new MutationObserver(function () { clearTimeout(t); t = setTimeout(repair, 150); })
        .observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ["href"] });
    }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
