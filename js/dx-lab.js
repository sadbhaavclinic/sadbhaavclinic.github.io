/* RPC Rounds Diagnostics Lab: shared Learn / Quiz / Test interface for simulated reports. */
var DXLAB=(function(){
 var css='.dxl{font-size:16px}.dxl .dxl-tabs{display:flex;flex-wrap:wrap;gap:6px;margin:0 0 12px}.dxl .dxl-tabs button,.dxl .dxl-chip{border:1px solid #1D4E89;background:#fff;color:#1D4E89;border-radius:18px;padding:6px 14px;font-size:14px;cursor:pointer}.dxl .dxl-tabs button[aria-pressed=true],.dxl .dxl-chip[aria-pressed=true]{background:#1D4E89;color:#fff}'
 +'.dxl .dxl-chips{display:flex;flex-wrap:wrap;gap:6px;margin:0 0 10px}.dxl .dxl-chip{padding:3px 10px;font-size:13px}.dxl .dxl-list{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:6px;margin:0 0 12px}.dxl .dxl-item{text-align:left;border:1px solid #d5e3f3;background:#fff;border-radius:8px;padding:8px 10px;font-size:14px;cursor:pointer;color:#1b2a3a}.dxl .dxl-item:hover,.dxl .dxl-item[aria-current=true]{border-color:#1D4E89;background:#f2f7fd}.dxl .dxl-item small{display:block;color:#5f6b7a;font-size:12px}'
 +'.dxl .dxl-fig{overflow-x:auto;-webkit-overflow-scrolling:touch;border:1px solid #d5e3f3;border-radius:8px;background:#fff;margin:0 0 10px}.dxl .dxl-fig svg{display:block;width:100%;min-width:640px;height:auto}.dxl .dxl-pair{display:grid;grid-template-columns:1fr;gap:10px}@media(min-width:1500px){.dxl .dxl-pair{grid-template-columns:1fr 1fr}}'
 +'.dxl .dxl-q{font-weight:700;margin:6px 0}.dxl .dxl-opts{display:grid;gap:6px;margin:0 0 10px}.dxl .dxl-opt{text-align:left;border:1px solid #c9d6e6;background:#fff;border-radius:8px;padding:8px 12px;font-size:15px;cursor:pointer;color:#1b2a3a}.dxl .dxl-opt.ok{border-color:#1e7a3a;background:#eaf6ee}.dxl .dxl-opt.no{border-color:#b3261e;background:#fbeceb}.dxl .dxl-opt:disabled{cursor:default;opacity:1}'
 +'.dxl .dxl-exp{border-left:4px solid #1D4E89;background:#f6f9fd;padding:10px 14px;border-radius:0 8px 8px 0;margin:0 0 10px}.dxl .dxl-exp ol{margin:6px 0 6px 18px;padding:0}.dxl .dxl-exp li{margin:3px 0}.dxl .dxl-pearl{font-size:14px;color:#33414f;margin:6px 0 0}.dxl .dxl-bar{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin:8px 0}.dxl .dxl-btn{border:1px solid #1D4E89;background:#1D4E89;color:#fff;border-radius:18px;padding:7px 16px;font-size:14px;cursor:pointer}.dxl .dxl-btn.ghost{background:#fff;color:#1D4E89}.dxl .dxl-meta{font-size:13px;color:#5f6b7a}.dxl .dxl-score{font-size:22px;font-weight:700;color:#1D4E89}'
 +'.dxl .dxl-cap{margin:4px 0 4px;font-weight:700;font-size:14px;color:#1D4E89}.dxl .dxl-rev{border:1px solid #d5e3f3;border-radius:8px;margin:6px 0;background:#fff}.dxl .dxl-rev summary{cursor:pointer;padding:8px 12px;font-size:14px}.dxl .dxl-rev div{padding:0 12px 10px}';
 function el(h){var d=document.createElement('div');d.innerHTML=h;return d.firstChild}
 function esc(t){return String(t).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
 function shuffle(a,seed){a=a.slice();var s=seed||Date.now()%2147483647;for(var i=a.length-1;i>0;i--){s=(s*48271)%2147483647;var j=s%(i+1),t=a[i];a[i]=a[j];a[j]=t}return a}
 function init(o){
  if(!document.getElementById('dxl-css')){var st=document.createElement('style');st.id='dxl-css';st.textContent=css;document.head.appendChild(st)}
  var TX={read:o.read||'How to read this report',unit:o.unit||'Case',units:o.units||'cases',note:o.note||'All reports are computer-generated simulations for teaching. They are not real patients and not a medical device.'};var root=o.root,C=(function(L){var c=[];L.forEach(function(k){if(c.indexOf(k.cat)<0)c.push(k.cat)});return L.map(function(k,i){return[k,i]}).sort(function(x,y){return c.indexOf(x[0].cat)-c.indexOf(y[0].cat)||x[1]-y[1]}).map(function(x){return x[0]})})(o.cases),KEY='rpcDxLab-'+o.name,mode='learn',cur=null;
  root.className='dxl';
  root.innerHTML='<div class="dxl-tabs" role="group" aria-label="Mode"><button type="button" data-m="learn" aria-pressed="true">Learn (atlas)</button><button type="button" data-m="quiz" aria-pressed="false">Quiz</button><button type="button" data-m="test" aria-pressed="false">Test ('+Math.min(20,C.length)+' '+TX.units+')</button></div><div class="dxl-body"></div><p class="dxl-meta">'+TX.note+'</p>';
  var body=root.querySelector('.dxl-body');
  [].forEach.call(root.querySelectorAll('.dxl-tabs button'),function(b){b.onclick=function(){mode=b.dataset.m;[].forEach.call(root.querySelectorAll('.dxl-tabs button'),function(x){x.setAttribute('aria-pressed',x===b?'true':'false')});show()}});
  function fig(k){var h=o.render(k);return '<div class="'+(k.fields&&k.fields.length>1?'dxl-pair':'')+'">'+h.map(function(s,i){var lb=k.fields&&k.fields[i]&&k.fields[i].label;return(lb?'<div><p class="dxl-cap">'+esc(lb)+'</p>':'<div>')+'<div class="dxl-fig">'+s+'</div></div>'}).join('')+'</div>'}
  function exp(k,res){return '<div class="dxl-exp">'+(res!=null?'<p style="margin:0 0 4px"><b>'+(res?'Correct.':'Not quite.')+'</b> Answer: '+esc(k.o[k.a])+'</p>':'<p style="margin:0 0 4px"><b>'+esc(k.title)+'</b></p>')+'<p style="margin:0"><b>'+TX.read+'</b></p><ol>'+k.steps.map(function(s){return'<li>'+esc(s)+'</li>'}).join('')+'</ol><p class="dxl-pearl"><b>Pearl:</b> '+esc(k.pearl)+'</p></div>'}
  function cats(){var c=[];C.forEach(function(k){if(c.indexOf(k.cat)<0)c.push(k.cat)});return c}
  var fcat='All';
  function learn(){var L=C.filter(function(k){return fcat==='All'||k.cat===fcat});if(!cur||L.indexOf(cur)<0)cur=L[0];
   body.innerHTML='<div class="dxl-chips">'+['All'].concat(cats()).map(function(c){return'<button type="button" class="dxl-chip" aria-pressed="'+(c===fcat)+'">'+esc(c)+'</button>'}).join('')+'</div><div class="dxl-list">'+L.map(function(k,i){return'<button type="button" class="dxl-item" data-i="'+C.indexOf(k)+'" aria-current="'+(k===cur)+'">'+esc(k.title)+'<small>'+esc(k.cat)+'</small></button>'}).join('')+'</div><div class="dxl-view"></div>';
   [].forEach.call(body.querySelectorAll('.dxl-chip'),function(b){b.onclick=function(){fcat=b.textContent;cur=null;learn()}});
   [].forEach.call(body.querySelectorAll('.dxl-item'),function(b){b.onclick=function(){cur=C[+b.dataset.i];[].forEach.call(body.querySelectorAll('.dxl-item'),function(x){x.setAttribute('aria-current',x===b?'true':'false')});view();body.querySelector('.dxl-view').scrollIntoView({behavior:'smooth',block:'start'})}});
   view();function view(){body.querySelector('.dxl-view').innerHTML=fig(cur)+exp(cur,null)}}
  /* quiz: endless random order, session score */
  var qOrder=[],qi=0,qs={n:0,ok:0};
  function quiz(){if(!qOrder.length||qi>=qOrder.length){qOrder=shuffle(C);qi=0}var k=qOrder[qi];var opts=shuffle(k.o.map(function(t,i){return{t:t,i:i}}),Date.now()%99991+qi);
   body.innerHTML='<div class="dxl-bar"><span class="dxl-meta">'+TX.unit+' '+(qi+1)+' of '+C.length+' · score this session: '+qs.ok+'/'+qs.n+'</span></div>'+fig(k)+'<p class="dxl-q">'+esc(k.q)+'</p><div class="dxl-opts">'+opts.map(function(x){return'<button type="button" class="dxl-opt" data-i="'+x.i+'">'+esc(x.t)+'</button>'}).join('')+'</div><div class="dxl-after"></div>';
   [].forEach.call(body.querySelectorAll('.dxl-opt'),function(b){b.onclick=function(){var r=+b.dataset.i===k.a;qs.n++;if(r)qs.ok++;[].forEach.call(body.querySelectorAll('.dxl-opt'),function(x){x.disabled=true;if(+x.dataset.i===k.a)x.classList.add('ok');else if(x===b)x.classList.add('no')});
    body.querySelector('.dxl-after').innerHTML=exp(k,r)+'<div class="dxl-bar"><button type="button" class="dxl-btn">Next case</button></div>';body.querySelector('.dxl-after .dxl-btn').onclick=function(){qi++;quiz();root.scrollIntoView({behavior:'smooth'})}}})}
  /* test: 20 random cases, answers hidden until the end */
  var T=null;
  function test(){if(!T){var best=0;try{best=+localStorage.getItem(KEY)||0}catch(e){}
    body.innerHTML='<p>'+Math.min(20,C.length)+' random '+TX.units+', one answer each, no feedback until the end. Aim for 80% or more.'+(best?' Your best score on this device: <b>'+best+'%</b>.':'')+'</p><div class="dxl-bar"><button type="button" class="dxl-btn">Start test</button></div>';
    body.querySelector('.dxl-btn').onclick=function(){T={L:shuffle(C).slice(0,20),i:0,ans:[],t0:Date.now()};test()};return}
   if(T.i>=T.L.length){var ok=0;T.L.forEach(function(k,i){if(T.ans[i]===k.a)ok++});var pc=Math.round(ok/T.L.length*100),mins=Math.round((Date.now()-T.t0)/60000);
    try{if(pc>(+localStorage.getItem(KEY)||0))localStorage.setItem(KEY,pc)}catch(e){}
    body.innerHTML='<p class="dxl-score">'+ok+' / '+T.L.length+' ('+pc+'%)</p><p class="dxl-meta">Time: about '+mins+' min. Open each case to review.</p>'+T.L.map(function(k,i){var r=T.ans[i]===k.a;return'<details class="dxl-rev"><summary>'+(r?'✅':'❌')+' '+(i+1)+'. '+esc(k.title)+'</summary><div data-i="'+i+'"></div></details>'}).join('')+'<div class="dxl-bar"><button type="button" class="dxl-btn">New test</button></div>';
    [].forEach.call(body.querySelectorAll('.dxl-rev'),function(d){d.addEventListener('toggle',function(){var box=d.querySelector('div');if(d.open&&!box.innerHTML){var i=+box.dataset.i,k=T.L[i];box.innerHTML=fig(k)+'<p class="dxl-q">'+esc(k.q)+'</p><p>Your answer: '+(T.ans[i]!=null?esc(k.o[T.ans[i]]):'—')+'</p>'+exp(k,T.ans[i]===k.a)}})});
    body.querySelector('.dxl-bar .dxl-btn').onclick=function(){T=null;test()};return}
   var k=T.L[T.i],opts=shuffle(k.o.map(function(t,i){return{t:t,i:i}}),T.t0%9973+T.i);
   body.innerHTML='<div class="dxl-bar"><span class="dxl-meta">Question '+(T.i+1)+' of '+T.L.length+'</span></div>'+fig(k)+'<p class="dxl-q">'+esc(k.q)+'</p><div class="dxl-opts">'+opts.map(function(x){return'<button type="button" class="dxl-opt" data-i="'+x.i+'">'+esc(x.t)+'</button>'}).join('')+'</div>';
   [].forEach.call(body.querySelectorAll('.dxl-opt'),function(b){b.onclick=function(){T.ans[T.i]=+b.dataset.i;T.i++;test();root.scrollIntoView({behavior:'smooth'})}})}
  function show(){if(mode==='learn')learn();else if(mode==='quiz')quiz();else test()}
  show();
 }
 return{init:init};
})();
