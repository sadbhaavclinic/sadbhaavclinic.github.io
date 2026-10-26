/* Spot the Diagnosis: filters, shuffle, self-scoring (saved per device), case of the day. */
(function () {
  var KEY = "rpc-spot-v1";
  var tools = document.getElementById("qc-tools"), list = document.getElementById("qc-list");
  if (!tools || !list) return;
  tools.hidden = false;
  var cases = [].slice.call(list.querySelectorAll(".quiz-case"));
  var sections = [].slice.call(list.querySelectorAll(".qc-section"));
  var total = cases.length, filter = "all", mode = "", shuffled = false;

  var score = {};
  try { score = JSON.parse(localStorage.getItem(KEY) || "{}") || {}; } catch (e) { score = {}; }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(score)); } catch (e) {} }

  function mark(c) {
    var n = c.dataset.n, v = score[n];
    c.classList.toggle("qc-got", v === 1);
    c.classList.toggle("qc-miss", v === 0);
    var bs = c.querySelectorAll(".qc-self button");
    for (var i = 0; i < bs.length; i++) bs[i].classList.toggle("on", String(v) === bs[i].dataset.r);
  }
  function stats() {
    var seen = 0, got = 0, miss = 0;
    for (var k in score) { seen++; if (score[k] === 1) got++; else if (score[k] === 0) miss++; }
    document.getElementById("qc-stats").textContent = "Marked " + seen + " of " + total + " · got " + got + " · missed " + miss +
      (seen ? " · " + Math.round(100 * got / seen) + "% correct" : "");
    document.getElementById("qc-bar-fill").style.width = (100 * seen / total) + "%";
  }

  cases.forEach(function (c) {
    var d = c.querySelector("details");
    var box = document.createElement("div");
    box.className = "qc-self";
    box.innerHTML = 'Did you get it? <button type="button" data-r="1">Yes, got it</button> <button type="button" data-r="0">No, missed it</button>';
    d.appendChild(box);
    box.addEventListener("click", function (e) {
      var b = e.target.closest("button"); if (!b) return;
      var r = Number(b.dataset.r);
      if (score[c.dataset.n] === r) delete score[c.dataset.n]; else score[c.dataset.n] = r;
      save(); mark(c); stats();
    });
    mark(c);
  });

  function apply() {
    var shown = 0;
    cases.forEach(function (c) {
      var n = c.dataset.n, ok = filter === "all" || c.dataset.sub === filter;
      if (mode === "unseen") ok = ok && !(n in score);
      if (mode === "missed") ok = ok && score[n] === 0;
      c.hidden = !ok; if (ok) shown++;
    });
    sections.forEach(function (h) {
      var code = h.id.slice(4);
      h.hidden = shuffled || !(filter === "all" || filter === code) ||
        !cases.some(function (c) { return c.dataset.sub === code && !c.hidden; });
    });
    document.getElementById("qc-empty").hidden = shown > 0;
  }

  tools.querySelector(".qc-chips").addEventListener("click", function (e) {
    var b = e.target.closest(".qc-chip"); if (!b) return;
    filter = b.dataset.f;
    [].forEach.call(tools.querySelectorAll(".qc-chip"), function (x) { x.classList.toggle("on", x === b); });
    apply();
  });
  function toggleMode(id, m) {
    var b = document.getElementById(id);
    b.addEventListener("click", function () {
      mode = mode === m ? "" : m;
      document.getElementById("qc-unseen").classList.toggle("on", mode === "unseen");
      document.getElementById("qc-missed").classList.toggle("on", mode === "missed");
      apply();
    });
  }
  toggleMode("qc-unseen", "unseen"); toggleMode("qc-missed", "missed");

  document.getElementById("qc-shuffle").addEventListener("click", function () {
    var arr = cases.slice();
    for (var i = arr.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = arr[i]; arr[i] = arr[j]; arr[j] = t; }
    arr.forEach(function (c) { list.appendChild(c); });
    shuffled = true; this.textContent = "Shuffle again"; apply();
    list.scrollIntoView({ behavior: "smooth", block: "start" });
  });
  function go(c) {
    c.hidden = false;
    var d = c.querySelector("details"); if (d) d.open = false;
    c.scrollIntoView({ behavior: "smooth", block: "center" });
    c.classList.add("qc-flash"); setTimeout(function () { c.classList.remove("qc-flash"); }, 1600);
  }
  document.getElementById("qc-random").addEventListener("click", function () {
    var pool = cases.filter(function (c) { return !c.hidden; });
    if (pool.length) go(pool[Math.floor(Math.random() * pool.length)]);
  });
  document.getElementById("qc-reset").addEventListener("click", function () {
    if (!window.confirm("Clear your saved answers on this device?")) return;
    score = {}; save(); cases.forEach(mark); stats(); apply();
  });

  // Case of the day: the same case for everyone on a given date.
  var day = Math.floor(Date.now() / 86400000);
  var today = cases[(day * 37) % total];
  var tl = document.getElementById("qc-today-link");
  tl.textContent = "Case " + today.dataset.n + " (" + today.querySelector(".qc-tag").textContent + ")";
  tl.href = "#case-" + today.dataset.n;
  tl.addEventListener("click", function (e) { e.preventDefault(); go(today); });

  stats(); apply();
})();
