/* Reader tools (Nov 2026) for RPC Rounds blog pages:
   1. Dark mode toggle (saved on this device: rpc-theme).
   2. Recently read pages (saved on this device: rpc-recent-v1) and a "Continue where you left off" box
      on pages that contain <div id="rpc-continue"></div>, with revision progress from rpc-revise-v1. */
(function(){
 var root=document.documentElement,TK='rpc-theme',RK='rpc-recent-v1';
 function get(k){try{return localStorage.getItem(k);}catch(e){return null;}}
 function set(k,v){try{localStorage.setItem(k,v);}catch(e){}}
 /* 1. Dark mode */
 function isDark(){return root.getAttribute('data-theme')==='dark';}
 var b=document.createElement('a');b.href='#';b.className='rpc-dark-btn';b.setAttribute('role','button');
 function lab(){b.textContent=isDark()?'\u2600':'\u263E';var t=isDark()?'Switch to light mode':'Switch to dark mode';b.setAttribute('aria-label',t);b.title=t;b.setAttribute('aria-pressed',isDark()?'true':'false');}
 b.addEventListener('click',function(e){e.preventDefault();if(isDark()){root.removeAttribute('data-theme');set(TK,'light');}else{root.setAttribute('data-theme','dark');set(TK,'dark');}lab();});
 lab();document.body.appendChild(b);
 /* 2. Remember this page if it is an article (has a 60-second box, quiz or lead and an h1) */
 var h1=document.querySelector('h1'),path=location.pathname.split('/').pop()||'index.html';
 var isArticle=h1&&(document.querySelector('.key60,.selftest,#mocktest,p.lead'))&&!/^(ophthalmology|start-here|index)\.html$/.test(path);
 var list=[];try{list=JSON.parse(get(RK)||'[]')||[];}catch(e){list=[];}
 if(isArticle){
  var t=(document.title||h1.textContent).split(' | ')[0].trim();
  list=list.filter(function(x){return x.u!==path;});list.unshift({u:path,t:t,d:Date.now()});list=list.slice(0,8);set(RK,JSON.stringify(list));
 }
 /* 4. How to cite: today's date and copy button */
 (function(){var d=new Date(),mo=['January','February','March','April','May','June','July','August','September','October','November','December'];
  var ds=d.getDate()+' '+mo[d.getMonth()]+' '+d.getFullYear();
  [].forEach.call(document.querySelectorAll('.cite-date'),function(s){s.textContent=ds;});
  [].forEach.call(document.querySelectorAll('.cite-copy'),function(btn){btn.addEventListener('click',function(){
   var t=btn.parentNode.querySelector('.cite-text').textContent;
   function ok(){btn.textContent='Copied';setTimeout(function(){btn.textContent='Copy citation';},1800);}
   if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(t).then(ok,function(){});}
   else{var a=document.createElement('textarea');a.value=t;document.body.appendChild(a);a.select();try{document.execCommand('copy');ok();}catch(e){}document.body.removeChild(a);}
  });});})();
 /* 3. Continue box */
 var box=document.getElementById('rpc-continue');if(!box)return;
 var rv={};try{rv=JSON.parse(get('rpc-revise-v1')||'{}')||{};}catch(e){rv={};}
 var ticked=0;for(var k in rv){if(rv[k]&&rv[k].length)ticked+=rv[k].length;}
 if(!list.length&&!ticked){box.style.display='none';return;}
 function ago(d){var m=Math.round((Date.now()-d)/60000);if(m<60)return m<=1?'just now':m+' min ago';var h=Math.round(m/60);if(h<24)return h+' h ago';var dd=Math.round(h/24);return dd===1?'yesterday':dd+' days ago';}
 function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
 var h='<h3>Continue where you left off</h3>';
 if(list.length){h+='<ul>'+list.slice(0,5).map(function(x){return '<li><a href="'+esc(x.u)+'">'+esc(x.t)+'</a><span class="rc-meta">'+ago(x.d)+'</span></li>';}).join('')+'</ul>';}
 if(ticked){h+='<p class="rc-prog">Revision progress: <b>'+ticked+'</b> topic'+(ticked===1?'':'s')+' ticked as revised. <a href="revise-ophthalmology.html">See all checklists</a></p>';}
 h+='<button type="button" class="rc-clear">Clear this list</button> <span class="rc-meta">Saved only on this device.</span>';
 box.className='rpc-continue';box.innerHTML=h;
 box.querySelector('.rc-clear').addEventListener('click',function(){set(RK,'[]');box.style.display='none';});
})();
