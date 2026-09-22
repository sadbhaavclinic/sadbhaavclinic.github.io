/* =========================================================
   Sadbhaav Clinic — Floating "My Books" Widget
   =========================================================
   Fully self-injecting: needs NO div on the page. Just add
   this one line before </body> on any page:

     <script src="book-carousel/book-carousel.js"></script>

   (adjust the path if a page lives in a subfolder)

   TO PUBLISH A NEW BOOK IN FUTURE:
   Open book-carousel/books.json, add one new entry at the
   top, save, upload. Every page updates automatically —
   you never touch this file or any page again.

   This widget rotates through books marked "featured": true in
   books.json (up to FEATURED_COUNT of them), plus one permanent
   "See all X books" slide linking to the full catalog page
   (CATALOG_URL, below). If no book is marked featured, it falls
   back to showing the newest FEATURED_COUNT books instead. The
   full list is always shown on mykindlebooks.html regardless.
   ========================================================= */

(function () {
  // Figure out the right relative path to books.json regardless
  // of which folder this script was loaded from. document.currentScript
  // reliably points to THIS script tag (unlike scanning all <script>
  // tags, which breaks if other scripts load after this one).
  var thisScript = document.currentScript;
  if (!thisScript) {
    // Fallback for older browsers: find the tag whose src ends in book-carousel.js
    var scripts = document.getElementsByTagName("script");
    for (var i = scripts.length - 1; i >= 0; i--) {
      if (/book-carousel\.js(\?.*)?$/.test(scripts[i].src)) {
        thisScript = scripts[i];
        break;
      }
    }
  }
  var basePath = thisScript.src.replace(/book-carousel\.js(\?.*)?$/, "");
  var DATA_URL = basePath + "books.json";
  var AUTO_ROTATE_MS = 4500;
  var FEATURED_COUNT = 6; // how many books to rotate in the small floating widget
  var CATALOG_URL = "mykindlebooks.html"; // the full, categorized book list

  var style = document.createElement("style");
  style.textContent = `
    #bcw-tab {
      position: fixed;
      bottom: 90px;
      right: 20px;
      z-index: 997;
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: var(--brand-accent, #F96D00);
      box-shadow: 0 4px 12px rgba(0,0,0,0.25);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 26px;
      transition: transform .2s ease, box-shadow .2s ease;
      border: none;
    }
    #bcw-tab:hover {
      transform: scale(1.08);
      box-shadow: 0 6px 16px rgba(0,0,0,0.3);
    }
    #bcw-panel {
      position: fixed;
      bottom: 155px;
      right: 20px;
      z-index: 998;
      width: 250px;
      max-width: calc(100vw - 40px);
      background: #fff;
      border-radius: 10px;
      box-shadow: 0 10px 34px -10px rgba(0,0,0,0.35);
      padding: 16px;
      font-family: Roboto, Arial, sans-serif;
      display: none;
    }
    #bcw-panel.bcw-open { display: block; }
    #bcw-panel .bcw-head {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }
    #bcw-panel .bcw-head strong {
      font-size: 14px;
      color: var(--brand-secondary, #6b4423);
    }
    #bcw-panel .bcw-close {
      cursor: pointer;
      font-size: 18px;
      color: #999;
      line-height: 1;
      background: none;
      border: none;
    }
    #bcw-panel .bcw-close:hover { color: #333; }
    .bcw-slide { display: none; text-align: center; }
    .bcw-slide.bcw-active { display: block; }
    .bcw-cover-wrap {
      width: 100%;
      height: 130px;
      border-radius: 6px;
      margin-bottom: 8px;
      background: #f5f4f0;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }
    .bcw-cover-wrap img { max-width: 100%; max-height: 100%; }
    .bcw-cover-fallback { font-size: 38px; }
    .bcw-book-title {
      font-size: 13.5px;
      font-weight: 600;
      margin: 4px 0 2px 0;
      color: #222;
    }
    .bcw-book-sub {
      font-size: 11.5px;
      color: #777;
      margin: 0 0 10px 0;
      min-height: 28px;
    }
    .bcw-buy-btn {
      display: inline-block;
      background: var(--brand-accent, #F96D00);
      color: #fff !important;
      text-decoration: none !important;
      font-size: 12.5px;
      font-weight: 600;
      padding: 6px 16px;
      border-radius: 4px;
    }
    .bcw-buy-btn:hover { opacity: .88; }
    .bcw-dots { text-align: center; margin-top: 10px; }
    .bcw-dot {
      display: inline-block;
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #ddd;
      margin: 0 3px;
      cursor: pointer;
    }
    .bcw-dot.bcw-active-dot { background: var(--brand-accent, #F96D00); }
    .bcw-seeall-icon {
      font-size: 34px;
      margin-bottom: 8px;
    }
    .bcw-seeall-title {
      font-size: 13.5px;
      font-weight: 600;
      margin: 4px 0 2px 0;
      color: #222;
    }
    .bcw-seeall-sub {
      font-size: 11.5px;
      color: #777;
      margin: 0 0 10px 0;
      min-height: 28px;
    }
    .bcw-seeall-btn {
      display: inline-block;
      background: var(--brand-secondary, #6b4423);
      color: #fff !important;
      text-decoration: none !important;
      font-size: 12.5px;
      font-weight: 600;
      padding: 6px 16px;
      border-radius: 4px;
    }
    .bcw-seeall-btn:hover { opacity: .88; }
    @media (max-width: 480px) {
      #bcw-tab { bottom: 84px; right: 16px; width: 50px; height: 50px; font-size: 22px; }
      #bcw-panel { bottom: 142px; right: 16px; }
    }
  `;
  document.head.appendChild(style);

  var tab = document.createElement("button");
  tab.id = "bcw-tab";
  tab.setAttribute("aria-label", "My Books");
  tab.innerHTML = "📚";
  document.body.appendChild(tab);

  var panel = document.createElement("div");
  panel.id = "bcw-panel";
  panel.innerHTML =
    '<div class="bcw-head"><strong>📚 By Dr. Dhaval Patel</strong>' +
    '<button class="bcw-close" aria-label="Close">&times;</button></div>' +
    '<div class="bcw-slides"></div>' +
    '<div class="bcw-dots"></div>';
  document.body.appendChild(panel);

  tab.addEventListener("click", function () {
    panel.classList.toggle("bcw-open");
  });
  panel.querySelector(".bcw-close").addEventListener("click", function () {
    panel.classList.remove("bcw-open");
  });

  var slidesEl = panel.querySelector(".bcw-slides");
  var dotsEl = panel.querySelector(".bcw-dots");

  fetch(DATA_URL)
    .then(function (res) { return res.json(); })
    .then(function (allBooks) {
      if (!allBooks || !allBooks.length) return;

      var totalCount = allBooks.length;
      var featuredBooks = allBooks.filter(function (b) { return b.featured === true; });
      var books = (featuredBooks.length > 0 ? featuredBooks : allBooks).slice(0, FEATURED_COUNT);
      var totalSlides = books.length + 1; // +1 for the permanent "see all" slide

      books.forEach(function (book, i) {
        var slide = document.createElement("div");
        slide.className = "bcw-slide" + (i === 0 ? " bcw-active" : "");
        slide.innerHTML =
          '<div class="bcw-cover-wrap">' +
          '<img src="' + book.cover + '" alt="' + book.title + ' cover" ' +
          'onerror="this.parentElement.innerHTML=\'<span class=\\\'bcw-cover-fallback\\\'>📖</span>\'">' +
          '</div>' +
          '<p class="bcw-book-title">' + book.title + '</p>' +
          '<p class="bcw-book-sub">' + (book.subtitle || "") + '</p>' +
          '<a class="bcw-buy-btn" href="' + book.amazonUrl + '" target="_blank" rel="noopener">View on Amazon</a>';
        slidesEl.appendChild(slide);

        var dot = document.createElement("span");
        dot.className = "bcw-dot" + (i === 0 ? " bcw-active-dot" : "");
        dot.addEventListener("click", function () { showSlide(i); });
        dotsEl.appendChild(dot);
      });

      // Permanent final slide: always present, links to the full catalog page.
      var seeAllIndex = books.length;
      var seeAllSlide = document.createElement("div");
      seeAllSlide.className = "bcw-slide";
      seeAllSlide.innerHTML =
        '<div class="bcw-seeall-icon">📚</div>' +
        '<p class="bcw-seeall-title">See all my books</p>' +
        '<p class="bcw-seeall-sub">Browse the full categorized list</p>' +
        '<a class="bcw-seeall-btn" href="' + CATALOG_URL + '">Browse All Books</a>';
      slidesEl.appendChild(seeAllSlide);

      var seeAllDot = document.createElement("span");
      seeAllDot.className = "bcw-dot";
      seeAllDot.setAttribute("aria-label", "See all books");
      seeAllDot.addEventListener("click", function () { showSlide(seeAllIndex); });
      dotsEl.appendChild(seeAllDot);

      var current = 0;
      var slideEls = slidesEl.querySelectorAll(".bcw-slide");
      var dotEls = dotsEl.querySelectorAll(".bcw-dot");

      function showSlide(index) {
        slideEls[current].classList.remove("bcw-active");
        dotEls[current].classList.remove("bcw-active-dot");
        current = index;
        slideEls[current].classList.add("bcw-active");
        dotEls[current].classList.add("bcw-active-dot");
      }

      if (totalSlides > 1) {
        setInterval(function () {
          showSlide((current + 1) % totalSlides);
        }, AUTO_ROTATE_MS);
      }
    })
    .catch(function (err) {
      console.error("Book widget: could not load books.json", err);
    });
})();
