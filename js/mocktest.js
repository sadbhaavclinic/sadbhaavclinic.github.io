/* RPC Rounds timed mock test.
   Page holds <div id="mocktest"></div> and <script type="application/json" id="mock-data">
   {"id":"...","title":"...","minutes":50,"scoring":"plain|neet","q":[{"q":stem,"o":[4 options],"a":index,"e":explanation,"w":why-not,"p":pearl,"t":topic}]} */
(function () {
  var root = document.getElementById('mocktest');
  var src = document.getElementById('mock-data');
  if (!root || !src) return;
  var D = JSON.parse(src.textContent);
  var N = D.q.length, KEY = 'rpc-mock-' + D.id;
  var S; // state: {ans:[], flag:[], cur, left, practice, started, done}

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function btn(cls, text, fn) {
    var b = el('button', cls, text);
    b.type = 'button';
    b.addEventListener('click', fn);
    return b;
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }
  function load() { try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { return null; } }
  function clear() { try { localStorage.removeItem(KEY); } catch (e) {} }
  function fmt(s) { s = Math.max(0, Math.round(s)); var m = Math.floor(s / 60); return m + ':' + ('0' + (s % 60)).slice(-2); }
  function L(i) { return 'ABCDE'.charAt(i); }

  var timer = null;
  function tick() {
    if (!S || S.done || S.practice) return;
    S.left -= 1;
    var t = root.querySelector('.mt-time');
    if (t) {
      t.textContent = fmt(S.left);
      t.classList.toggle('mt-low', S.left <= 300);
    }
    if (S.left % 10 === 0) save();
    if (S.left <= 0) finish(true);
  }

  /* ---------- start screen ---------- */
  function start() {
    clearInterval(timer);
    root.innerHTML = '';
    var box = el('div', 'mt-start');
    box.appendChild(el('h3', 'mt-title', D.title));
    var ul = el('ul', 'mt-facts');
    [N + ' single-best-answer questions', D.minutes + ' minutes (about one minute per question)',
     D.scoring === 'neet' ? 'Scored +4 for correct, −1 for wrong, 0 for unanswered (NEET-PG style), plus a plain score' : 'One mark per correct answer; no negative marking',
     'Flag questions to revisit; the navigator shows what is left',
     'Full explanations and a topic-wise breakdown at the end'].forEach(function (t) { ul.appendChild(el('li', null, t)); });
    box.appendChild(ul);
    var old = load();
    var row = el('div', 'mt-actions');
    if (old && !old.done && old.ans) {
      row.appendChild(btn('mt-btn mt-primary', 'Resume where you left off (' + old.ans.filter(function (a) { return a !== null; }).length + '/' + N + ' answered)', function () { S = old; exam(); }));
    }
    row.appendChild(btn('mt-btn ' + (old && !old.done ? '' : 'mt-primary'), 'Start timed test', function () { begin(false); }));
    row.appendChild(btn('mt-btn', 'Practice mode (untimed, answers shown as you go)', function () { begin(true); }));
    box.appendChild(row);
    if (old && old.done) {
      box.appendChild(el('p', 'mt-muted', 'Last attempt: ' + old.score + ' / ' + N + '.'));
    }
    root.appendChild(box);
  }

  function begin(practice) {
    S = { ans: [], flag: [], cur: 0, left: D.minutes * 60, practice: practice, done: false, t0: Date.now() };
    for (var i = 0; i < N; i++) { S.ans.push(null); S.flag.push(false); }
    save();
    exam();
  }

  /* ---------- exam view ---------- */
  function exam() {
    clearInterval(timer);
    root.innerHTML = '';
    var top = el('div', 'mt-top');
    top.appendChild(el('span', 'mt-count'));
    if (!S.practice) top.appendChild(el('span', 'mt-time', fmt(S.left)));
    else top.appendChild(el('span', 'mt-muted', 'Practice mode'));
    top.appendChild(btn('mt-btn mt-submit', 'Submit test', function () {
      var un = S.ans.filter(function (a) { return a === null; }).length;
      if (!un || confirm(un + ' question' + (un > 1 ? 's are' : ' is') + ' unanswered. Submit anyway?')) finish(false);
    }));
    root.appendChild(top);
    root.appendChild(el('div', 'mt-qbox'));
    var nav = el('div', 'mt-navrow');
    nav.appendChild(btn('mt-btn', '← Previous', function () { go(S.cur - 1); }));
    nav.appendChild(btn('mt-btn mt-flagbtn', 'Flag', function () { S.flag[S.cur] = !S.flag[S.cur]; save(); draw(); }));
    nav.appendChild(btn('mt-btn mt-primary', 'Next →', function () { go(S.cur + 1); }));
    root.appendChild(nav);
    var grid = el('div', 'mt-grid');
    grid.setAttribute('aria-label', 'Question navigator');
    for (var i = 0; i < N; i++) (function (i) { grid.appendChild(btn('mt-cell', String(i + 1), function () { go(i); })); })(i);
    root.appendChild(grid);
    var key = el('p', 'mt-muted mt-key');
    key.innerHTML = '<span class="mt-sw mt-sw-a"></span> answered &nbsp; <span class="mt-sw mt-sw-f"></span> flagged &nbsp; <span class="mt-sw"></span> not answered';
    root.appendChild(key);
    draw();
    if (!S.practice) timer = setInterval(tick, 1000);
  }

  function go(i) {
    if (i < 0 || i >= N) return;
    S.cur = i; save(); draw();
    var top = root.querySelector('.mt-top');
    if (top && top.getBoundingClientRect().top < 0) root.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function draw() {
    var q = D.q[S.cur], box = root.querySelector('.mt-qbox');
    root.querySelector('.mt-count').textContent = 'Question ' + (S.cur + 1) + ' of ' + N +
      ' · ' + S.ans.filter(function (a) { return a !== null; }).length + ' answered';
    box.innerHTML = '';
    if (q.t) box.appendChild(el('span', 'mt-topic', q.t));
    box.appendChild(el('p', 'mt-stem', (S.cur + 1) + '. ' + q.q));
    var opts = el('div', 'mt-opts');
    var shown = S.practice && S.ans[S.cur] !== null;
    q.o.forEach(function (t, oi) {
      var b = btn('mt-opt', L(oi) + '.  ' + t, function () {
        if (S.practice && S.ans[S.cur] !== null) return;
        S.ans[S.cur] = (S.ans[S.cur] === oi && !S.practice) ? null : oi;
        save(); draw();
      });
      b.setAttribute('aria-pressed', S.ans[S.cur] === oi ? 'true' : 'false');
      if (S.ans[S.cur] === oi) b.classList.add('mt-chosen');
      if (shown) {
        b.disabled = true;
        if (oi === q.a) b.classList.add('mt-right');
        else if (oi === S.ans[S.cur]) b.classList.add('mt-wrong');
      }
      opts.appendChild(b);
    });
    box.appendChild(opts);
    if (shown) box.appendChild(explain(q, S.ans[S.cur]));
    var fb = root.querySelector('.mt-flagbtn');
    fb.textContent = S.flag[S.cur] ? 'Unflag' : 'Flag';
    fb.classList.toggle('mt-on', S.flag[S.cur]);
    [].forEach.call(root.querySelectorAll('.mt-cell'), function (c, i) {
      c.className = 'mt-cell' + (S.ans[i] !== null ? ' mt-a' : '') + (S.flag[i] ? ' mt-f' : '') + (i === S.cur ? ' mt-cur' : '');
      if (S.practice && S.ans[i] !== null) c.className += S.ans[i] === D.q[i].a ? ' mt-ok' : ' mt-bad';
    });
  }

  function explain(q, chosen) {
    var d = el('div', 'mt-expl');
    var head = el('p', 'mt-verdict');
    head.textContent = chosen === null ? 'Not answered. Correct answer: ' + L(q.a) + '.' :
      (chosen === q.a ? 'Correct: ' + L(q.a) + '.' : 'Your answer: ' + L(chosen) + '. Correct answer: ' + L(q.a) + '.');
    head.classList.add(chosen === q.a ? 'mt-v-ok' : 'mt-v-bad');
    d.appendChild(head);
    if (q.e) d.appendChild(el('p', null, q.e));
    if (q.w) { var w = el('p'); w.appendChild(el('strong', null, 'Why not the others: ')); w.appendChild(document.createTextNode(q.w)); d.appendChild(w); }
    if (q.p) { var p = el('p', 'mt-pearl'); p.appendChild(el('strong', null, 'Pearl: ')); p.appendChild(document.createTextNode(q.p)); d.appendChild(p); }
    return d;
  }

  /* ---------- results ---------- */
  function finish(timeUp) {
    clearInterval(timer);
    var right = 0, wrong = 0, topics = {};
    D.q.forEach(function (q, i) {
      var t = q.t || 'General';
      topics[t] = topics[t] || [0, 0];
      topics[t][1]++;
      if (S.ans[i] === q.a) { right++; topics[t][0]++; } else if (S.ans[i] !== null) wrong++;
    });
    S.done = true; S.score = right; save();
    root.innerHTML = '';
    var r = el('div', 'mt-result');
    if (timeUp) r.appendChild(el('p', 'mt-v-bad', 'Time is up. Your answers have been submitted.'));
    r.appendChild(el('h3', 'mt-title', 'Your score: ' + right + ' / ' + N + ' (' + Math.round(100 * right / N) + '%)'));
    var facts = right + ' correct · ' + wrong + ' wrong · ' + (N - right - wrong) + ' unanswered';
    if (D.scoring === 'neet') facts += ' · NEET-style marks: ' + (4 * right - wrong) + ' / ' + 4 * N;
    if (!S.practice) facts += ' · time used ' + fmt(D.minutes * 60 - S.left);
    r.appendChild(el('p', 'mt-muted', facts));
    var band = right / N >= 0.75 ? 'Excellent. You are well prepared for this level.' :
      right / N >= 0.6 ? 'Good. Review the wrong answers and your weakest topics below.' :
      right / N >= 0.45 ? 'Borderline. Focus revision on the topics with the lowest scores.' :
      'Keep going. Work through the explanations, then retake the test in a week.';
    r.appendChild(el('p', null, band));

    var tw = el('div', 'table-responsive');
    var tb = el('table', 'table table-bordered table-sm mt-ttable');
    tb.innerHTML = '<thead><tr><th>Topic</th><th>Score</th><th style="width:40%"></th></tr></thead>';
    var body = el('tbody');
    Object.keys(topics).sort(function (a, b) { return topics[a][0] / topics[a][1] - topics[b][0] / topics[b][1]; }).forEach(function (t) {
      var tr = el('tr'), pc = Math.round(100 * topics[t][0] / topics[t][1]);
      tr.appendChild(el('td', null, t));
      tr.appendChild(el('td', null, topics[t][0] + ' / ' + topics[t][1]));
      var td = el('td'), bar = el('div', 'mt-bar'), fill = el('span');
      fill.style.width = pc + '%';
      bar.appendChild(fill); td.appendChild(bar); tr.appendChild(td);
      body.appendChild(tr);
    });
    tb.appendChild(body); tw.appendChild(tb); r.appendChild(tw);

    var acts = el('div', 'mt-actions');
    acts.appendChild(btn('mt-btn mt-primary', 'Retake this test', function () { clear(); begin(false); }));
    acts.appendChild(btn('mt-btn', 'Back to start', function () { start(); }));
    r.appendChild(acts);

    r.appendChild(el('h3', 'mt-title mt-rev-h', 'Review answers'));
    var filt = el('div', 'mt-actions mt-filter');
    var list = el('div', 'mt-review');
    function show(kind) {
      list.innerHTML = '';
      [].forEach.call(filt.children, function (b) { b.classList.toggle('mt-on', b.dataset.k === kind); });
      D.q.forEach(function (q, i) {
        var a = S.ans[i];
        if (kind === 'wrong' && a === q.a) return;
        if (kind === 'flag' && !S.flag[i]) return;
        var item = el('div', 'mt-ritem ' + (a === q.a ? 'mt-ritem-ok' : 'mt-ritem-bad'));
        item.appendChild(el('p', 'mt-stem', (i + 1) + '. ' + q.q));
        var ol = el('ul', 'mt-ropts');
        q.o.forEach(function (t, oi) {
          var li = el('li', oi === q.a ? 'mt-right' : (oi === a ? 'mt-wrong' : null), L(oi) + '. ' + t);
          ol.appendChild(li);
        });
        item.appendChild(ol);
        item.appendChild(explain(q, a));
        list.appendChild(item);
      });
      if (!list.children.length) list.appendChild(el('p', 'mt-muted', 'Nothing to show here.'));
    }
    [['all', 'All questions'], ['wrong', 'Wrong or unanswered'], ['flag', 'Flagged']].forEach(function (k) {
      var b = btn('mt-btn', k[1], function () { show(k[0]); });
      b.dataset.k = k[0];
      filt.appendChild(b);
    });
    r.appendChild(filt);
    r.appendChild(list);
    root.appendChild(r);
    show('wrong');
    root.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  start();
})();
