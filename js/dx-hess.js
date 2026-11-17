/* RPC Rounds Diagnostics Lab: simulated Hess (Lees screen) charts from a simple muscle model. Teaching simulation only.
   c.u: underaction 0..1 per muscle, keys like 'R_LR', 'L_SO'; c.o: primary overaction; c.mag: degrees per unit (default 12). */
var DXH=(function(){
 var S2=Math.SQRT1_2,M={LR:{a:[1,0],f:[1,0]},MR:{a:[-1,0],f:[-1,0]},SR:{a:[0,1],f:[S2,S2]},IR:{a:[0,-1],f:[S2,-S2]},SO:{a:[0,-1],f:[-S2,-S2]},IO:{a:[0,1],f:[-S2,S2]}},
  Y={LR:'MR',MR:'LR',SR:'IO',IO:'SR',IR:'SO',SO:'IR'};
 function act(eye,m){var d=M[m],s=eye==='L'?-1:1;return{a:[d.a[0]*s,d.a[1]],f:[d.f[0]*s,d.f[1]]}}
 function w(g,f){return Math.max(0,0.35+0.55*(g[0]*f[0]+g[1]*f[1]))}
 function pos(c,eye,g){var mag=c.mag||12,dx=0,dy=0,oth=eye==='R'?'L':'R',U=c.u||{},O=c.o||{};
  Object.keys(M).forEach(function(m){var k=eye+'_'+m,A=act(eye,m),ww=w(g,A.f);if(U[k]){dx-=U[k]*ww*A.a[0]*mag;dy-=U[k]*ww*A.a[1]*mag}if(O[k]){dx+=O[k]*ww*A.a[0]*mag;dy+=O[k]*ww*A.a[1]*mag}
   var k2=oth+'_'+m;if(U[k2]){var ym=Y[m],B=act(eye,ym),w2=w(g,B.f);dx+=U[k2]*w2*B.a[0]*mag*(c.hering||0.5);dy+=U[k2]*w2*B.a[1]*mag*(c.hering||0.5)}});
  var mm=Math.hypot(dx,dy),cap=c.cap||12;if(mm>cap){dx*=cap/mm;dy*=cap/mm}
  if(c.dev&&c.dev[eye]){dx+=c.dev[eye][0];dy+=c.dev[eye][1]}
  return[g[0]*15+dx,g[1]*15+dy]}
 function chart(x,X,Y0,S,c,eye){var sc=S/80,cx=X+S/2,cy=Y0+S/2,P=function(p){return[cx+p[0]*sc,cy-p[1]*sc]};
  x.fillStyle='#fff';x.fillRect(X,Y0,S,S);x.strokeStyle='#e3e9f1';x.lineWidth=1;for(var v=-40;v<=40;v+=5){x.beginPath();x.moveTo(cx+v*sc,Y0);x.lineTo(cx+v*sc,Y0+S);x.stroke();x.beginPath();x.moveTo(X,cy-v*sc);x.lineTo(X+S,cy-v*sc);x.stroke()}
  x.strokeStyle='#9fb3c8';x.beginPath();x.moveTo(cx,Y0);x.lineTo(cx,Y0+S);x.moveTo(X,cy);x.lineTo(X+S,cy);x.stroke();x.strokeStyle='#1b2a3a';x.strokeRect(X,Y0,S,S);
  /* expected squares */
  x.setLineDash([5,4]);x.strokeStyle='#8a96a3';[15,30].forEach(function(q){x.strokeRect(cx-q*sc,cy-q*sc,2*q*sc,2*q*sc)});x.setLineDash([]);
  var ring=function(k){var G=[[-k,k],[0,k],[k,k],[k,0],[k,-k],[0,-k],[-k,-k],[-k,0]];return G.map(function(g){return pos(c,eye,g)})};
  x.save();x.beginPath();x.rect(X,Y0,S,S);x.clip();var col=eye==='R'?'#b3261e':'#1D4E89';x.strokeStyle=col;x.fillStyle=col;x.lineWidth=2;
  [1,2].forEach(function(k){var R=ring(k);x.beginPath();R.forEach(function(p,i){var q=P(p);if(i)x.lineTo(q[0],q[1]);else x.moveTo(q[0],q[1])});x.closePath();x.stroke();R.forEach(function(p){var q=P(p);x.beginPath();x.arc(q[0],q[1],3.2,0,7);x.fill()})});
  var c0=P(pos(c,eye,[0,0]));x.beginPath();x.arc(c0[0],c0[1],4,0,7);x.fill();x.restore();
  x.fillStyle='#1b2a3a';x.font='bold 14px Arial,sans-serif';x.fillText(eye==='R'?'Right eye (left eye fixing)':'Left eye (right eye fixing)',X,Y0-10);
  x.font='11px Arial,sans-serif';x.fillStyle='#5f6b7a';x.fillText('Patient\'s left',X+4,cy-4);x.fillText('Patient\'s right',X+S-82,cy-4);x.fillText('Up',cx+4,Y0+14);x.fillText('Down',cx+4,Y0+S-6)}
 function render(c){var W=1000,H=560,cv=document.createElement('canvas');cv.width=W*2;cv.height=H*2;var x=cv.getContext('2d');x.scale(2,2);x.fillStyle='#fff';x.fillRect(0,0,W,H);
  x.fillStyle='#1b2a3a';x.font='bold 15px Arial,sans-serif';x.fillText('Hess chart (Lees screen) · SIMULATED TEACHING REPORT',16,22);x.font='13px Arial,sans-serif';x.fillStyle='#33414f';x.fillText('Age: '+(c.age||'')+'   Inner field 15°, outer field 30°; dashed squares = expected positions   '+(c.note||''),16,42);
  chart(x,40,84,430,c,'L');chart(x,530,84,430,c,'R');
  x.fillStyle='#8a96a3';x.font='11px Arial,sans-serif';x.fillText('Charts are drawn as the patient sees them. RPC Rounds Diagnostics Lab · simulation for teaching',16,H-10);
  return'<img src="'+cv.toDataURL('image/png')+'" alt="Simulated Hess chart" style="display:block;width:100%;min-width:640px;height:auto">'}
 return{render:render,pos:pos}
})();
if(typeof module!=='undefined')module.exports=DXH;
