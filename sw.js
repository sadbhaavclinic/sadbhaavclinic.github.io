/* RPC Rounds offline service worker (Nov 2026) */
var V='rpc-v1',PAGES='rpc-pages-v1',ASSETS='rpc-assets-v1',MAXPAGES=200;
var CORE=['offline.html','ophthalmology.html','start-here.html','desk-reference.html','flashcard-review.html','js/flashcards.json','js/flashcard-review.js','images/rpc-icon-192.png'];
self.addEventListener('install',function(e){e.waitUntil(caches.open(PAGES).then(function(c){return c.addAll(CORE).catch(function(){});}).then(function(){return self.skipWaiting();}));});
self.addEventListener('activate',function(e){e.waitUntil(caches.keys().then(function(ks){return Promise.all(ks.filter(function(k){return [PAGES,ASSETS].indexOf(k)<0;}).map(function(k){return caches.delete(k);}));}).then(function(){return self.clients.claim();}));});
function trim(name,max){caches.open(name).then(function(c){c.keys().then(function(ks){if(ks.length>max){c.delete(ks[0]).then(function(){trim(name,max);});}});});}
self.addEventListener('fetch',function(e){var r=e.request;if(r.method!=='GET')return;var u=new URL(r.url);if(u.origin!==location.origin)return;
 if(r.mode==='navigate'||(r.headers.get('accept')||'').indexOf('text/html')>=0){
  e.respondWith(fetch(r).then(function(res){var cp=res.clone();if(res.ok)caches.open(PAGES).then(function(c){c.put(u.pathname==='/'?'/index.html':u.pathname,cp);trim(PAGES,MAXPAGES);});return res;})
   .catch(function(){return caches.match(u.pathname==='/'?'/index.html':u.pathname,{ignoreSearch:true}).then(function(m){return m||caches.match('offline.html');});}));return;}
 if(/\.(css|js|json|png|jpe?g|webp|svg|gif|woff2?|ttf|ico)$/i.test(u.pathname)){
  e.respondWith(caches.open(ASSETS).then(function(c){return c.match(r,{ignoreSearch:/\.(png|jpe?g|webp|svg|gif)$/i.test(u.pathname)}).then(function(m){var f=fetch(r).then(function(res){if(res.ok)c.put(r,res.clone());trim(ASSETS,400);return res;}).catch(function(){return m;});return m||f;});}));}
});
