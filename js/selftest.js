/* RPC Rounds self-test: multiple-choice quizzes and flip cards.
   Each <div class="selftest" data-mode="quiz|cards"> holds a <script type="application/json"> with its data. */
(function () {
  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  function buildQuiz(box, data) {
    var answered = 0, correct = 0, total = data.length;
    var score = el("p", "st-score", "Score: 0 / " + total);
    data.forEach(function (q, qi) {
      var item = el("div", "st-q");
      item.appendChild(el("p", "st-stem", (qi + 1) + ". " + q.q));
      var opts = el("div", "st-opts");
      var expl = el("p", "st-expl");
      expl.hidden = true;
      q.o.forEach(function (text, oi) {
        var b = el("button", "st-opt", text);
        b.type = "button";
        b.addEventListener("click", function () {
          if (item.dataset.done) return;
          item.dataset.done = "1";
          answered++;
          var right = oi === q.a;
          if (right) correct++;
          [].forEach.call(opts.children, function (c, ci) {
            c.disabled = true;
            if (ci === q.a) c.classList.add("st-right");
          });
          if (!right) b.classList.add("st-wrong");
          expl.textContent = (right ? "Correct. " : "Not quite. ") + q.e;
          expl.hidden = false;
          score.textContent = "Score: " + correct + " / " + total + (answered === total ? " (finished)" : "");
        });
        opts.appendChild(b);
      });
      item.appendChild(opts);
      item.appendChild(expl);
      box.appendChild(item);
    });
    var bar = el("div", "st-bar");
    bar.appendChild(score);
    var reset = el("button", "st-reset", "Try again");
    reset.type = "button";
    reset.addEventListener("click", function () {
      [].forEach.call(box.querySelectorAll(".st-q,.st-bar"), function (n) { n.remove(); });
      buildQuiz(box, data);
    });
    bar.appendChild(reset);
    box.appendChild(bar);
  }

  function buildCards(box, data) {
    var i = 0;
    var card = el("button", "st-card");
    card.type = "button";
    card.setAttribute("aria-live", "polite");
    var front = el("div", "st-front"), back = el("div", "st-back");
    card.appendChild(front);
    card.appendChild(back);
    var count = el("span", "st-count");
    function show() {
      var c = data[i];
      front.textContent = c.f;
      back.innerHTML = "";
      back.appendChild(el("div", "st-btitle", c.f));
      c.b.forEach(function (line) { back.appendChild(el("div", "st-line", line)); });
      card.classList.remove("st-flipped");
      count.textContent = (i + 1) + " / " + data.length;
    }
    card.addEventListener("click", function () { card.classList.toggle("st-flipped"); });
    var nav = el("div", "st-nav");
    var prev = el("button", "st-reset", "← Previous"), next = el("button", "st-reset", "Next →"),
        shuf = el("button", "st-reset", "Shuffle");
    [prev, next, shuf].forEach(function (b) { b.type = "button"; });
    prev.addEventListener("click", function () { i = (i - 1 + data.length) % data.length; show(); });
    next.addEventListener("click", function () { i = (i + 1) % data.length; show(); });
    shuf.addEventListener("click", function () {
      for (var k = data.length - 1; k > 0; k--) {
        var j = Math.floor(Math.random() * (k + 1)), t = data[k]; data[k] = data[j]; data[j] = t;
      }
      i = 0; show();
    });
    nav.appendChild(prev); nav.appendChild(count); nav.appendChild(next); nav.appendChild(shuf);
    box.appendChild(card);
    box.appendChild(nav);
    show();
  }

  function init() {
    [].forEach.call(document.querySelectorAll(".selftest"), function (box) {
      var src = box.querySelector('script[type="application/json"]');
      if (!src) return;
      var data;
      try { data = JSON.parse(src.textContent); } catch (e) { return; }
      if (box.getAttribute("data-mode") === "cards") buildCards(box, data);
      else buildQuiz(box, data);
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
