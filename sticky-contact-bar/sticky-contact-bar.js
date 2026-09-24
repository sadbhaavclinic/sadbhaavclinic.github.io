/* =========================================================
   Sadbhaav Clinic — Mobile Sticky Call + WhatsApp Bar
   =========================================================
   Self-injecting: needs NO div on the page. Just add this
   one line before </body> on any page:

     <script src="sticky-contact-bar/sticky-contact-bar.js"></script>

   Shows only on mobile/small screens (desktop already has a
   clear Book Appointment option in the nav). Gives patients
   who prefer calling a direct option, alongside WhatsApp.
   ========================================================= */

(function () {
  var PHONE_DISPLAY = "+91 70169 12180";
  var PHONE_TEL = "tel:+917016912180";
  var WHATSAPP_URL = "https://api.whatsapp.com/send?phone=917016912180&text=" +
    encodeURIComponent("Hi, I'd like to book an appointment.");

  var style = document.createElement("style");
  style.textContent = `
    #sadbhaav-sticky-bar {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      z-index: 999;
      display: none;
      background: #fff;
      box-shadow: 0 -2px 10px rgba(0,0,0,0.12);
      padding: 8px 10px;
      padding-bottom: calc(8px + env(safe-area-inset-bottom, 0px));
    }
    @media (max-width: 767px) {
      #sadbhaav-sticky-bar { display: flex; gap: 8px; }
      body { padding-bottom: 62px; }
    }
    #sadbhaav-sticky-bar a {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 11px 8px;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 600;
      text-decoration: none !important;
    }
    #sadbhaav-sticky-bar .sadbhaav-call-btn {
      background: var(--brand-secondary, #6b4423);
      color: #fff !important;
    }
    #sadbhaav-sticky-bar .sadbhaav-wa-btn {
      background: #25D366;
      color: #fff !important;
    }
  `;
  document.head.appendChild(style);

  var bar = document.createElement("div");
  bar.id = "sadbhaav-sticky-bar";
  bar.innerHTML =
    '<a href="' + PHONE_TEL + '" class="sadbhaav-call-btn" aria-label="Call ' + PHONE_DISPLAY + '">' +
    '<span class="fa fa-phone"></span> Call Now</a>' +
    '<a href="' + WHATSAPP_URL + '" target="_blank" rel="noopener" class="sadbhaav-wa-btn" aria-label="WhatsApp us">' +
    '<span class="fa fa-whatsapp"></span> WhatsApp</a>';
  document.body.appendChild(bar);
})();
