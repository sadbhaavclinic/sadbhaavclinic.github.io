/* =========================================================
   Sadbhaav Clinic — Site-wide Search Widget
   =========================================================
   Self-injecting: needs NO div on the page. Just add this
   one line before </body> on any page:

     <script src="site-search/search-widget.js"></script>

   Searches across all patient pages AND RPC Rounds blog
   articles from one box — works entirely client-side, no
   server needed. Rebuild site-search/search-index.json
   whenever you add new pages (ask Claude to regenerate it).
   ========================================================= */

(function () {
  var scripts = document.getElementsByTagName("script");
  var thisScript = document.currentScript || scripts[scripts.length - 1];
  var basePath = thisScript.src.replace(/search-widget\.js(\?.*)?$/, "");
  var INDEX_URL = basePath + "search-index.json";

  var style = document.createElement("style");
  style.textContent = `
    #sadbhaav-search-btn {
      position: fixed;
      top: 14px;
      right: 14px;
      z-index: 1001;
      width: 42px;
      height: 42px;
      border-radius: 50%;
      background: #fff;
      border: 1px solid #e2e2e2;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 17px;
      color: var(--brand-secondary, #6b4423);
      transition: transform .15s ease;
    }
    #sadbhaav-search-btn:hover { transform: scale(1.08); }
    @media (max-width: 767px) {
      #sadbhaav-search-btn { top: auto; bottom: 150px; right: 20px; }
    }
    #sadbhaav-search-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.45);
      z-index: 1002;
      display: none;
      align-items: flex-start;
      justify-content: center;
      padding: 8vh 16px 16px;
    }
    #sadbhaav-search-overlay.open { display: flex; }
    #sadbhaav-search-box {
      background: #fff;
      border-radius: 10px;
      width: 100%;
      max-width: 560px;
      max-height: 74vh;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    }
    #sadbhaav-search-input-row {
      display: flex;
      align-items: center;
      border-bottom: 1px solid #eee;
      padding: 14px 16px;
      gap: 10px;
    }
    #sadbhaav-search-input-row .fa-search { color: #999; font-size: 16px; }
    #sadbhaav-search-input {
      border: none;
      outline: none;
      flex: 1;
      font-size: 16px;
      font-family: inherit;
    }
    #sadbhaav-search-close {
      background: none;
      border: none;
      font-size: 22px;
      color: #999;
      cursor: pointer;
      line-height: 1;
      padding: 0 4px;
    }
    #sadbhaav-search-results {
      overflow-y: auto;
      padding: 6px 0;
    }
    .sadbhaav-search-hint {
      padding: 24px 16px;
      text-align: center;
      color: #999;
      font-size: 14px;
    }
    .sadbhaav-search-result {
      display: block;
      padding: 10px 16px;
      text-decoration: none !important;
      border-bottom: 1px solid #f5f5f5;
    }
    .sadbhaav-search-result:hover, .sadbhaav-search-result.active {
      background: #fdf6ee;
    }
    .sadbhaav-search-result-title {
      font-size: 14.5px;
      font-weight: 600;
      color: #222;
      margin-bottom: 2px;
    }
    .sadbhaav-search-result-desc {
      font-size: 12.5px;
      color: #888;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  `;
  document.head.appendChild(style);

  var btn = document.createElement("button");
  btn.id = "sadbhaav-search-btn";
  btn.setAttribute("aria-label", "Search this site");
  btn.innerHTML = '<span class="fa fa-search"></span>';
  document.body.appendChild(btn);

  var overlay = document.createElement("div");
  overlay.id = "sadbhaav-search-overlay";
  overlay.innerHTML =
    '<div id="sadbhaav-search-box">' +
      '<div id="sadbhaav-search-input-row">' +
        '<span class="fa fa-search"></span>' +
        '<input id="sadbhaav-search-input" type="text" placeholder="Search the site (e.g. cataract, LASIK, glaucoma classification)...">' +
        '<button id="sadbhaav-search-close" aria-label="Close">&times;</button>' +
      '</div>' +
      '<div id="sadbhaav-search-results"><p class="sadbhaav-search-hint">Start typing to search across patient pages and the RPC Rounds blog.</p></div>' +
    '</div>';
  document.body.appendChild(overlay);

  var input = overlay.querySelector("#sadbhaav-search-input");
  var resultsEl = overlay.querySelector("#sadbhaav-search-results");
  var closeBtn = overlay.querySelector("#sadbhaav-search-close");
  var searchIndex = null;
  var activeIndex = -1;

  function openSearch() {
    overlay.classList.add("open");
    setTimeout(function () { input.focus(); }, 50);
    if (!searchIndex) {
      fetch(INDEX_URL)
        .then(function (r) { return r.json(); })
        .then(function (data) { searchIndex = data; })
        .catch(function () {
          resultsEl.innerHTML = '<p class="sadbhaav-search-hint">Search is temporarily unavailable.</p>';
        });
    }
  }
  function closeSearch() {
    overlay.classList.remove("open");
    input.value = "";
    activeIndex = -1;
    resultsEl.innerHTML = '<p class="sadbhaav-search-hint">Start typing to search across patient pages and the RPC Rounds blog.</p>';
  }

  btn.addEventListener("click", openSearch);
  closeBtn.addEventListener("click", closeSearch);
  overlay.addEventListener("click", function (e) {
    if (e.target === overlay) closeSearch();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && overlay.classList.contains("open")) closeSearch();
  });

  function renderResults(matches, query) {
    if (!matches.length) {
      resultsEl.innerHTML = '<p class="sadbhaav-search-hint">No pages found for "' + query + '".</p>';
      return;
    }
    resultsEl.innerHTML = matches.slice(0, 10).map(function (m, i) {
      return '<a href="' + m.url + '" class="sadbhaav-search-result" data-idx="' + i + '">' +
        '<div class="sadbhaav-search-result-title">' + m.title + '</div>' +
        '<div class="sadbhaav-search-result-desc">' + (m.desc || '') + '</div>' +
        '</a>';
    }).join('');
    activeIndex = -1;
  }

  input.addEventListener("input", function () {
    var q = input.value.trim().toLowerCase();
    if (!q) {
      resultsEl.innerHTML = '<p class="sadbhaav-search-hint">Start typing to search across patient pages and the RPC Rounds blog.</p>';
      return;
    }
    if (!searchIndex) return;
    var matches = searchIndex.filter(function (p) {
      return p.title.toLowerCase().indexOf(q) !== -1 || (p.desc || '').toLowerCase().indexOf(q) !== -1;
    });
    renderResults(matches, input.value.trim());
  });

  input.addEventListener("keydown", function (e) {
    var items = resultsEl.querySelectorAll(".sadbhaav-search-result");
    if (!items.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      activeIndex = Math.min(activeIndex + 1, items.length - 1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      activeIndex = Math.max(activeIndex - 1, 0);
    } else if (e.key === "Enter") {
      if (activeIndex >= 0 && items[activeIndex]) {
        window.location.href = items[activeIndex].getAttribute("href");
      } else if (items[0]) {
        window.location.href = items[0].getAttribute("href");
      }
      return;
    } else {
      return;
    }
    items.forEach(function (el) { el.classList.remove("active"); });
    items[activeIndex].classList.add("active");
    items[activeIndex].scrollIntoView({ block: "nearest" });
  });
})();
