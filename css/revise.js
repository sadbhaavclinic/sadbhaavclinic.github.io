/* Revision checklists on subspecialty hubs and the master revision page.
   Progress is saved on the reader's device only (localStorage key rpc-revise-v1). */
(function () {
  var KEY = "rpc-revise-v1", st = {};
  try { st = JSON.parse(localStorage.getItem(KEY) || "{}") || {}; } catch (e) { st = {}; }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) {} }
  function upd(box) {
    var hub = box.dataset.hub, items = box.querySelectorAll("input[type=checkbox]"), n = 0;
    [].forEach.call(items, function (c) { if (c.checked) n++; c.closest("li").classList.toggle("done", c.checked); });
    var out = box.querySelector(".rev-count"); if (out) out.textContent = "Revised " + n + " of " + items.length;
    var bar = box.querySelector(".rev-bar-fill"); if (bar) bar.style.width = (100 * n / items.length) + "%";
    [].forEach.call(document.querySelectorAll('.rev-sum[data-hub="' + hub + '"]'), function (s) {
      s.querySelector(".rev-sum-n").textContent = n + "/" + items.length;
      s.querySelector(".rev-bar-fill").style.width = (100 * n / items.length) + "%";
    });
  }
  [].forEach.call(document.querySelectorAll(".rev-plan[data-hub]"), function (box) {
    var hub = box.dataset.hub, done = st[hub] || [];
    [].forEach.call(box.querySelectorAll("input[type=checkbox]"), function (c, i) {
      c.checked = done.indexOf(i) >= 0;
      c.addEventListener("change", function () {
        var arr = [];
        [].forEach.call(box.querySelectorAll("input[type=checkbox]"), function (x, j) { if (x.checked) arr.push(j); });
        st[hub] = arr; save(); upd(box);
      });
    });
    upd(box);
  });
  // Summary rows on the master page when the hub lists are not on this page
  [].forEach.call(document.querySelectorAll(".rev-sum[data-hub]"), function (s) {
    if (document.querySelector('.rev-plan[data-hub="' + s.dataset.hub + '"]')) return;
    var tot = +s.dataset.total, n = (st[s.dataset.hub] || []).length;
    s.querySelector(".rev-sum-n").textContent = n + "/" + tot;
    s.querySelector(".rev-bar-fill").style.width = (100 * n / tot) + "%";
  });
})();
