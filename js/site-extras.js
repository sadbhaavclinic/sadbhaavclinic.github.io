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

/* Reader tools on blog pages: "On this page" contents, Save for later, Print. Print styles for all pages. */
(function(){
 function ready(fn){if(document.readyState!=='loading')fn();else document.addEventListener('DOMContentLoaded',fn);}
 var css='.rpc-aud{font-size:13.5px;color:#5f6b7a;margin:-6px 0 10px}.rpc-aud a{color:#1D4E89}@media print{.rpc-aud{display:none}}.rpc-tools{display:flex;flex-wrap:wrap;gap:8px;margin:-4px 0 14px}.rpc-tools button,.rpc-tools a{font:600 13.5px/1 system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;padding:8px 12px;border-radius:18px;border:1px solid #C9D7E8;background:#fff;color:#1D4E89;cursor:pointer;text-decoration:none!important}.rpc-tools button:hover,.rpc-tools a:hover{border-color:#1D4E89}.rpc-tools .on{background:#1D4E89;color:#fff;border-color:#1D4E89}'
 +'.rpc-toc{border:1px solid #D5E3F3;border-radius:8px;background:#F7FAFD;padding:10px 16px;margin:0 0 22px}.rpc-toc summary{cursor:pointer;font-weight:700;color:#1D4E89;font-size:15px}.rpc-toc ol{margin:8px 0 2px;padding-left:20px;columns:2;column-gap:28px}.rpc-toc li{font-size:14.5px;margin:0 0 5px;break-inside:avoid}.rpc-toc a{color:#1D4E89}.text h2[id],.text h3[id],.text h4[id]{scroll-margin-top:84px}@media(max-width:700px){.rpc-toc ol{columns:1}}'
 +'[data-theme="dark"] .rpc-toc,.dark .rpc-toc{background:transparent}'
 +'@media print{nav,.navbar,footer,.ftco-footer,aside,.rpc-side,.rpc-tools,.rpc-toc,#bcw-tab,#bcw-panel,#sadbhaav-search-btn,#sadbhaav-search-overlay,.rpc-dark-btn,#ftco-loader,.top-strip,.rpc-strip,.related-posts,.cite-box,.rpc-cta,.book-promo,.sidebar-okat,.calc-strip,iframe,video{display:none!important}'
 +'body{background:#fff!important;color:#000!important;font-size:12pt}.col-lg-9,.col-lg-8{flex:0 0 100%!important;max-width:100%!important}a{color:#000!important;text-decoration:none!important}img{max-width:60%!important}.hero-wrap,.hero-wrap-2{display:none!important}table{page-break-inside:auto}tr,figure,.key60{page-break-inside:avoid}h2,h3,h4{page-break-after:avoid}.ftco-animate{opacity:1!important;visibility:visible!important;transform:none!important}'
 +'.rpc-print-foot{display:block!important;margin-top:16px;font-size:9pt;color:#555}}.rpc-print-foot{display:none}';
 var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
 window.addEventListener('beforeprint',function(){document.querySelectorAll('details').forEach(function(d){if(!d.open){d.setAttribute('data-pclosed','1');d.open=true;}});});
 window.addEventListener('afterprint',function(){document.querySelectorAll('details[data-pclosed]').forEach(function(d){d.open=false;d.removeAttribute('data-pclosed');});});
 function store(){try{return JSON.parse(localStorage.getItem('rpcSaved')||'[]')}catch(e){return []}}
 function save(a){try{localStorage.setItem('rpcSaved',JSON.stringify(a));return true}catch(e){return false}}
 window.rpcSaved={get:store,set:save};
 ready(function(){
  if(!document.body.classList.contains('theme-blog'))return;
  var col=document.querySelector('.col-lg-9')||document.querySelector('.col-lg-8'); if(!col)return;
  var h1=col.querySelector('h1'); var text=col.querySelector('.text'); if(!h1)return;
  var here=(location.pathname.split('/').pop()||'index.html');
  var title=(document.title||'').split(' | ')[0];
  // toolbar
  var bar=document.createElement('div');bar.className='rpc-tools';
  var sv=document.createElement('button');sv.type='button';
  function paint(){var on=store().some(function(x){return x.u===here});sv.className=on?'on':'';sv.textContent=on?'✓ Saved':'☆ Save for later';sv.setAttribute('aria-pressed',on?'true':'false');}
  sv.addEventListener('click',function(){var a=store();var i=a.findIndex(function(x){return x.u===here});if(i>=0)a.splice(i,1);else a.unshift({u:here,t:title,d:new Date().toISOString().slice(0,10)});if(!save(a)){sv.textContent='Saving is blocked in this browser';return;}paint();});
  paint();bar.appendChild(sv);
  var ls=document.createElement('a');ls.href='saved-pages.html';ls.textContent='My saved pages';bar.appendChild(ls);
  var pr=document.createElement('button');pr.type='button';pr.textContent='⎙ Print or save as PDF';pr.addEventListener('click',function(){window.print();});bar.appendChild(pr);
  if(here!=='saved-pages.html'){var ab=h1.nextElementSibling;(ab&&ab.classList.contains('rpc-aud')?ab:h1).insertAdjacentElement('afterend',bar);}
  // print footer
  var pf=document.createElement('p');pf.className='rpc-print-foot';pf.textContent='Printed from RPC Rounds, sadbhaavclinic.com/'+here+'. Check the website for the latest version.';(text||col).appendChild(pf);
  // contents
  if(!text||document.querySelector('.rpc-toc'))return;
  var hs=[].filter.call(text.querySelectorAll('h2,h3'),function(h){return !h.classList.contains('heading')&&!h.classList.contains('h5')&&!h.closest('.related-posts,.cite-box,.book-promo,figure,.selftest,.key60,.dr-tool,#mocktest,.okat-vol,.rpc-cta')&&h.textContent.trim().length>1;});
  if(hs.length<4)return;
  var used={};
  var ol=document.createElement('ol');
  hs.forEach(function(h){if(!h.id){var b=h.textContent.trim().toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,50)||'s';var id=b,k=2;while(document.getElementById(id)||used[id])id=b+'-'+(k++);used[id]=1;h.id=id;}
   var li=document.createElement('li'),a=document.createElement('a');a.href='#'+h.id;a.textContent=h.textContent.trim();li.appendChild(a);ol.appendChild(li);});
  var d=document.createElement('details');d.className='rpc-toc';d.open=window.innerWidth>=700;var s=document.createElement('summary');s.textContent='On this page ('+hs.length+' sections)';d.appendChild(s);d.appendChild(ol);
  var anchor=text.querySelector('.key60')||text.querySelector('p.text-muted');
  if(anchor)anchor.insertAdjacentElement('afterend',d);else text.insertBefore(d,text.firstChild);
 });
})();
