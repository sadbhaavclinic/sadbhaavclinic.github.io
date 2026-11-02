(function(){
 var KEY='rpc-cards-v1',DAY=86400000,app=document.getElementById('fcApp');if(!app)return;
 var st={};try{st=JSON.parse(localStorage.getItem(KEY)||'{}')||{};}catch(e){}
 st.c=st.c||{};st.sel=st.sel||null;st.nd=st.nd||{};st.per=st.per||20;
 function save(){try{localStorage.setItem(KEY,JSON.stringify(st));}catch(e){}}
 var $=function(i){return document.getElementById(i)},D=null,cur=null,queue=[];
 function today(){var d=new Date();return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate();}
 function sel(){return st.sel||['C','L','G','R','U','N','P','O','T','X','B','Z'];}
 function fmt(ms){var m=ms/60000;if(m<60)return Math.max(1,Math.round(m))+' min';var d=ms/DAY;if(d<30)return Math.round(d)+' d';return Math.round(d/30)+' mo';}
 function next(c,r){var s=st.c[c.id]||{i:0,e:2.5,n:0},i=s.i,e=s.e,ni,ne=e,now=Date.now();
  if(r===0){ni=0;ne=Math.max(1.3,e-0.2);return {i:0,e:ne,n:0,d:now+10*60000};}
  if(r===1){ni=i?Math.max(1,i*1.2):1;ne=Math.max(1.3,e-0.15);}
  if(r===2){ni=i?i*e:1;if(s.n===1&&i<3)ni=3;}
  if(r===3){ni=i?i*e*1.3:4;ne=e+0.15;}
  return {i:ni,e:ne,n:(s.n||0)+1,d:now+ni*DAY};}
 function build(){var now=Date.now(),s=sel(),due=[],nw=[];
  D.c.forEach(function(c){if(s.indexOf(c.s)<0)return;var x=st.c[c.id];if(x){if(x.d<=now)due.push(c);}else nw.push(c);});
  due.sort(function(a,b){return st.c[a.id].d-st.c[b.id].d;});
  var t=today(),used=st.nd[t]||0,left=Math.max(0,st.per-used);
  // stable shuffle of new cards by id hash so order is varied across pages
  nw.sort(function(a,b){return h(a.id)-h(b.id);});
  queue=due.concat(nw.slice(0,left));stats(due.length,Math.min(left,nw.length));}
 function h(s){var x=0;for(var i=0;i<s.length;i++)x=(x*31+s.charCodeAt(i))|0;return x;}
 function stats(d,n){var learned=Object.keys(st.c).length;$('fcStats').textContent='Due now: '+d+' · New today: '+n+' · Cards learned: '+learned+' of '+D.c.length;}
 function show(){if(!queue.length){$('fcCard').hidden=true;$('fcDone').hidden=false;return;}
  cur=queue[0];$('fcDone').hidden=true;$('fcCard').hidden=false;
  $('fcMeta').innerHTML='<span>'+(st.c[cur.id]?'Review':'New')+'</span> · from <a href="'+cur.p+'">'+(D.t[cur.p]||cur.p)+'</a>';
  $('fcFront').innerHTML=cur.f;$('fcBack').innerHTML='<ul>'+cur.b.map(function(x){return '<li>'+x+'</li>';}).join('')+'</ul>';
  $('fcBack').hidden=true;$('fcRate').hidden=true;$('fcShow').hidden=false;
  for(var r=0;r<4;r++){var n=next(cur,r);$('fcI'+r).textContent=fmt(n.d-Date.now());}}
 $('fcShow').addEventListener('click',function(){$('fcBack').hidden=false;$('fcRate').hidden=false;$('fcShow').hidden=true;});
 [].forEach.call(document.querySelectorAll('.fc-r'),function(b){b.addEventListener('click',function(){var r=+b.dataset.r,isNew=!st.c[cur.id];
  st.c[cur.id]=next(cur,r);if(isNew){var t=today();st.nd[t]=(st.nd[t]||0)+1;}save();queue.shift();
  if(r===0)queue.splice(Math.min(queue.length,4),0,cur);
  var now=Date.now(),d=0;queue.forEach(function(c){if(st.c[c.id])d++;});stats(d,queue.length-d);show();});});
 function chips(){var s=sel();[].forEach.call(document.querySelectorAll('.fc-s'),function(b){b.setAttribute('aria-pressed',String(s.indexOf(b.dataset.s)>=0));});}
 [].forEach.call(document.querySelectorAll('.fc-s'),function(b){b.addEventListener('click',function(){var s=sel().slice(),k=b.dataset.s,i=s.indexOf(k);if(i>=0)s.splice(i,1);else s.push(k);st.sel=s;save();chips();build();show();});});
 $('fcAll').addEventListener('click',function(){st.sel=null;save();chips();build();show();});
 $('fcNone').addEventListener('click',function(){st.sel=[];save();chips();build();show();});
 $('fcNew').value=String(st.per);$('fcNew').addEventListener('change',function(){st.per=+this.value;save();build();show();});
 $('fcReset').addEventListener('click',function(){if(!window.confirm('Reset all flashcard progress on this device?'))return;st={c:{},sel:st.sel,nd:{},per:st.per};save();build();show();});
 document.addEventListener('keydown',function(e){if(!cur||$('fcCard').hidden)return;if(e.key===' '&&!$('fcShow').hidden){e.preventDefault();$('fcShow').click();}else if(!$('fcRate').hidden&&'1234'.indexOf(e.key)>=0){document.querySelector('.fc-r[data-r="'+(+e.key-1)+'"]').click();}});
 fetch('js/flashcards.json').then(function(r){return r.json();}).then(function(d){D=d;chips();build();show();}).catch(function(){$('fcStats').textContent='Could not load the cards. Please check your connection and reload.';});
})();
