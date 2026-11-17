/* RPC Rounds sidebar helper.
   To update "New on RPC Rounds", edit the NEW list below (newest first, max ~6).
   Each item: [page file, short title]. Nothing else on the site needs changing. */
(function () {
  var NEW = [
    ["eye-drop-chart-maker.html", "Eye Drop Chart Maker"],
    ["eye-surgery-consent-form-generator.html", "Consent Form Generator"],
    ["cataract-surgery-estimate-iol-choice-form.html", "Surgery Estimate and Lens Choice"],
    ["eye-clinic-registers-logs-printable.html", "Clinic Registers and Logs"],
    ["medicine-dispensing-label-printer.html", "Medicine Label Printer"],
    ["spectacle-prescription-generator.html", "Spectacle Prescription"]
  ];
  function ready(fn) { if (document.readyState !== "loading") fn(); else document.addEventListener("DOMContentLoaded", fn); }
  ready(function () {
    var side = document.querySelector(".rpc-side");
    if (!side) return;
    var here = (location.pathname.split("/").pop() || "index.html").replace(/\.html$/, "") + ".html";

    var ul = document.getElementById("rpc-new");
    if (ul) {
      ul.innerHTML = "";
      NEW.forEach(function (n) {
        if (n[0] === here) return;
        var li = document.createElement("li"), a = document.createElement("a");
        a.href = n[0]; a.textContent = n[1]; li.appendChild(a); ul.appendChild(li);
      });
    }

    // Highlight the section the reader is in: the current page, or the hub in the breadcrumb.
    var targets = [here];
    document.querySelectorAll(".breadcrumbs a").forEach(function (a) {
      var h = (a.getAttribute("href") || "").split("#")[0];
      if (h && h.indexOf("http") !== 0 && h !== "index.html") targets.push(h.replace(/^\.\//, ""));
    });
    side.querySelectorAll("a[href]").forEach(function (a) {
      var h = a.getAttribute("href");
      if (a.classList.contains("rs-n") || targets.indexOf(h) < 0) return;
      a.classList.add("rs-active");
      a.setAttribute("aria-current", h === here ? "page" : "true");
      var li = a.closest("li"); if (li) li.classList.add("rs-on");
      var d = a.closest("details"); if (d) d.open = true;
    });

    // Highlight the navbar tab for this section.
    var nav = document.querySelector(".rpc-nav");
    if (nav) {
      var hit = null;
      // First look for this exact page, then for the hub in the breadcrumb.
      [[here], targets].forEach(function (want) {
        [].forEach.call(nav.querySelectorAll("[data-nav]"), function (li) {
          if (hit) return;
          [].forEach.call(li.querySelectorAll("a[href]"), function (a) {
            if (!hit && want.indexOf(a.getAttribute("href")) >= 0) { hit = li; a.classList.add("active"); }
          });
        });
      });
      if (!hit && /okat-decoded/.test(here)) hit = nav.querySelector('[data-nav="books"]');
      if (hit) hit.classList.add("active");
    }
  });
})();
