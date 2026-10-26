/* RPC Rounds sidebar helper.
   To update "New on RPC Rounds", edit the NEW list below (newest first, max ~6).
   Each item: [page file, short title]. Nothing else on the site needs changing. */
(function () {
  var NEW = [
    ["made-easy-series.html", "Made Easy series: 11 ready reckoners"],
    ["visual-pathway-field-defects-made-easy.html", "Visual pathway and fields made easy"],
    ["pupil-made-easy.html", "Pupils made easy"],
    ["corneal-dystrophies-made-easy.html", "Corneal dystrophies made easy"],
    ["electrophysiology-made-easy.html", "ERG, EOG and VEP made easy"],
    ["eye-embryology-made-easy.html", "Eye embryology made easy"]
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
  });
})();
