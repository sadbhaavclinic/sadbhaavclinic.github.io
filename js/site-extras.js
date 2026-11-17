/* Site extras (Nov 2026): larger-text toggle on every page. */
(function(){
 /* ---------- 1. Larger text ---------- */
 var K='rpc-bigtext',root=document.documentElement;
 try{if(localStorage.getItem(K)==='1')root.classList.add('big-text');}catch(e){}
 function label(){return root.classList.contains('big-text')?'A− Normal text':'A+ Larger text';}
 var strip=document.querySelector('p.phone');
 var b=document.createElement('a');b.href='#';b.className='a11y-size';b.setAttribute('role','button');b.textContent=label();
 b.addEventListener('click',function(e){e.preventDefault();root.classList.toggle('big-text');b.textContent=label();
  try{localStorage.setItem(K,root.classList.contains('big-text')?'1':'0');}catch(x){}});
 if(strip){b.className+=' ml-2';strip.appendChild(b);}else{b.className+=' a11y-float';document.body.appendChild(b);}

})();

/* Amazon store by visitor region: links written as amazon.in are sent to the visitor's own Amazon store.
   The India affiliate tag is kept only on amazon.in. Links whose text names a store (e.g. "Amazon US") are left alone. */
(function(){
 var tz='';try{tz=Intl.DateTimeFormat().resolvedOptions().timeZone||'';}catch(e){}
 var lang=(navigator.language||'').toLowerCase();
 var Z={'Asia/Kolkata':'in','Asia/Calcutta':'in','Europe/London':'co.uk','Europe/Dublin':'co.uk','Europe/Isle_of_Man':'co.uk','Europe/Jersey':'co.uk','Europe/Guernsey':'co.uk',
  'Europe/Berlin':'de','Europe/Vienna':'de','Europe/Zurich':'de','Europe/Busingen':'de','Europe/Luxembourg':'de','Europe/Paris':'fr','Europe/Monaco':'fr','Europe/Madrid':'es','Atlantic/Canary':'es',
  'Europe/Rome':'it','Europe/Amsterdam':'nl','Europe/Brussels':'com.be','Europe/Stockholm':'se','Europe/Warsaw':'pl','Europe/Istanbul':'com.tr','Asia/Tokyo':'co.jp',
  'Asia/Dubai':'ae','Asia/Muscat':'ae','Asia/Riyadh':'sa','Asia/Singapore':'sg','Africa/Cairo':'eg','America/Mexico_City':'com.mx','America/Tijuana':'com.mx','America/Monterrey':'com.mx','America/Cancun':'com.mx'};
 var CA=/^America\/(Toronto|Vancouver|Edmonton|Winnipeg|Halifax|St_Johns|Regina|Moncton|Montreal|Whitehorse|Yellowknife|Iqaluit|Glace_Bay|Goose_Bay|Swift_Current|Dawson_Creek|Fort_Nelson|Rankin_Inlet|Cambridge_Bay|Inuvik|Atikokan|Creston|Dawson)$/;
 var s=Z[tz];
 if(!s){
  if(/^Australia\//.test(tz)||tz==='Pacific/Auckland'||tz==='Pacific/Chatham')s='com.au';
  else if(CA.test(tz))s='ca';
  else if(/^America\/(Sao_Paulo|Fortaleza|Recife|Bahia|Belem|Manaus|Cuiaba|Campo_Grande|Porto_Velho|Boa_Vista|Rio_Branco|Maceio|Araguaina|Santarem|Noronha|Eirunepe)$/.test(tz))s='com.br';
  else if(!tz&&/-in$/.test(lang))s='in';
  else s='com';
 }
 if(s==='in')return;
 var NAMED=/amazon\s*(india|us|uk|\.in|\.com|\.co\.uk|canada|australia|germany)/i;
 function fix(a){
  if(!a||a.getAttribute('data-geo-done')||a.hasAttribute('data-no-geo'))return;
  var h=a.getAttribute('href')||'';
  var m=h.match(/^https?:\/\/(www\.)?amazon\.in\/(.*)$/i); if(!m)return;
  var tx=(a.textContent||'').replace(/\s+/g,' ').trim();if(NAMED.test(tx)||/^(india|us|usa|uk|canada|australia|germany)$/i.test(tx))return;
  var rest=m[2].replace(/([?&])tag=[^&#]*&?/,'$1').replace(/[?&]$/,'');
  a.setAttribute('href','https://www.amazon.'+s+'/'+rest);a.setAttribute('data-geo-done','1');
 }
 function all(){var L=document.querySelectorAll('a[href*="amazon.in/"]');for(var i=0;i<L.length;i++)fix(L[i]);}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',all);else all();
 ['click','auxclick','contextmenu','mousedown','touchstart'].forEach(function(ev){document.addEventListener(ev,function(e){var a=e.target&&e.target.closest?e.target.closest('a[href*="amazon.in/"]'):null;if(a)fix(a);},true);});
 if(window.MutationObserver){var t;new MutationObserver(function(){clearTimeout(t);t=setTimeout(all,200);}).observe(document.documentElement,{childList:true,subtree:true});}
})();
