/* RPC Rounds Diagnostics Lab: simulated Scheimpflug-style corneal tomography ("4 maps") report.
   Teaching simulation only: drawn from a simple model of corneal curvature, elevation and thickness. */
var DXT=(function(){
 function G(d2,w){return Math.exp(-d2/(w*w))}
 function rng(seed){var s=seed>>>0||1;return function(){s=(s*1664525+1013904223)>>>0;return s/4294967296}}
 function model(c){var r=rng(c.seed||9),irr=[];for(var i=0;i<(c.irreg||0);i++)irr.push([(r()-0.5)*6,(r()-0.5)*6,(r()-0.5)*2.4*(c.irrAmp||1),0.7+r()*0.9]);
  var cone=c.cone||null,Km=c.Km||43.5,cyl=c.cyl||0.6,ax=(c.axis==null?90:c.axis)*Math.PI/180,skew=(c.skew||0)*Math.PI/180;
  function K(x,y){var rr=x*x+y*y,rad=Math.sqrt(rr),th=Math.atan2(y,x),a=ax+(y<0?skew:0),k=Km+cyl/2*Math.cos(2*(th-a))*(1-0.012*rr)-(c.qflat==null?0.12:c.qflat)*rr;
   if(c.is)k+=c.is*(-y/3)*0.5;
   if(cone)k+=cone.amp*G(Math.pow(x-cone.x,2)+Math.pow(y-cone.y,2),cone.w||1.4);
   if(c.pmd)k+=c.pmd.amp*G(Math.pow(y-(c.pmd.y||-2.6),2),0.9)*G(x*x,3.2)+c.pmd.amp*0.6*G(Math.pow(rad-2.9,2),0.5)/(1+Math.exp(3*(y-0.6)))-c.pmd.amp*0.35*G(y*y,1.3)*G(x*x,2);
   if(c.oz){var dx=x-(c.oz.dx||0),dy=y-(c.oz.dy||0),q=Math.sqrt(dx*dx+dy*dy),R=c.oz.r||3;k+=c.oz.d*(q<R?-(1-Math.pow(q/R,4)):0)+Math.abs(c.oz.d)*0.45*(c.oz.d>0?1:-1)*G(Math.pow(q-R-0.4,2),0.6);}
   if(c.island)k+=c.island*G(x*x+y*y,0.7);
   if(c.flatSup)k-=c.flatSup*G(Math.pow(y-2.8,2),1.2);
   if(c.ptg)k-=c.ptg*G(Math.pow(x-(c.ptgSide||3.5),2),1.2)*G(y*y,2.2);
   irr.forEach(function(b){k+=b[2]*G(Math.pow(x-b[0],2)+Math.pow(y-b[1],2),b[3])});
   if(c.globus)k+=c.globus*(1-rr/30);return k}
  function Ef(x,y){var rr=x*x+y*y,th=Math.atan2(y,x),e=-cyl*0.55*rr*Math.cos(2*(th-ax));if(cone)e+=(cone.ef||cone.amp*2.2)*G(Math.pow(x-cone.x,2)+Math.pow(y-cone.y,2),(cone.w||1.4)*1.1)-(cone.ef||cone.amp*2.2)*0.18;
   if(c.oz)e+=c.oz.d*(-2.2)*G(Math.pow(x-(c.oz.dx||0),2)+Math.pow(y-(c.oz.dy||0),2),2.2)+c.oz.d*1.0;
   if(c.pmd)e+=c.pmd.amp*1.6*G(Math.pow(y+1.8,2),1.1)*G(x*x,4)-c.pmd.amp*0.4;
   irr.forEach(function(b){e+=b[2]*3*G(Math.pow(x-b[0],2)+Math.pow(y-b[1],2),b[3])});if(c.globus)e+=c.globus*1.5*G(rr,3)-c.globus*0.6;if(c.efOff)e+=c.efOff;return e}
  function Eb(x,y){var rr=x*x+y*y,th=Math.atan2(y,x),e=-(c.bcyl==null?cyl*0.25+0.3:c.bcyl)*1.2*rr*Math.cos(2*(th-ax));if(cone)e+=(cone.eb||cone.amp*5)*G(Math.pow(x-cone.x,2)+Math.pow(y-cone.y,2),(cone.w||1.4)*1.05)-(cone.eb||cone.amp*5)*0.18;
   if(c.pmd)e+=c.pmd.amp*2.6*G(Math.pow(y+1.8,2),1.1)*G(x*x,4)-c.pmd.amp*0.6;if(c.globus)e+=c.globus*2.5*G(rr,3)-c.globus;if(c.ebOff)e+=c.ebOff;if(c.ebump)e+=c.ebump.amp*G(Math.pow(x-c.ebump.x,2)+Math.pow(y-c.ebump.y,2),c.ebump.w||1.3)-c.ebump.amp*0.15;return e}
  function P(x,y){var rr=x*x+y*y,t=(c.cct||545)+(c.pslope==null?8.5:c.pslope)*rr,tx=x-(c.thx==null?-0.3:c.thx),ty=y-(c.thy==null?-0.4:c.thy);t-=6*G(tx*tx+ty*ty,1.5);
   if(cone)t-=(cone.thin||cone.amp*5)*G(Math.pow(x-cone.x,2)+Math.pow(y-cone.y,2),(cone.w||1.4)*1.15);
   if(c.pmd)t-=c.pmd.thin*G(Math.pow(y-(c.pmd.y||-2.6)+0.4,2),0.7)*G(x*x,6);if(c.terrien)t-=c.terrien*G(Math.pow(y-3.2,2),0.6)*G(x*x,5);
   if(c.oz)t-=c.oz.abl*G(Math.pow(x-(c.oz.dx||0),2)+Math.pow(y-(c.oz.dy||0),2),(c.oz.r||3)*0.9);if(c.globus)t-=c.globus*25*(1-rr/40);if(c.oedema)t+=c.oedema*G(rr,2.5);return t}
  return{K:K,Ef:Ef,Eb:Eb,P:P}}
 var KS=[[34,'#2b0a6e'],[37,'#1f2fbf'],[39.5,'#1d6fe0'],[41,'#22a7e6'],[42.3,'#2dc9a4'],[43.3,'#3fbf3f'],[44.3,'#93d33a'],[45.3,'#e4e43a'],[46.5,'#f5b62a'],[48,'#f07a23'],[50,'#e0321f'],[53,'#b0122f'],[57,'#c2188e'],[62,'#7d1fa8'],[70,'#4a0f5c']];
 var ES=[[-60,'#1d2b8f'],[-35,'#1d6fe0'],[-20,'#22a7e6'],[-8,'#3fbf9a'],[0,'#3fbf3f'],[8,'#c9de3a'],[16,'#f5c22a'],[25,'#f07a23'],[40,'#e0321f'],[70,'#9b1030']];
 var PS=[[300,'#7d1030'],[400,'#d0201c'],[450,'#f05a23'],[490,'#f5a52a'],[520,'#e8e03a'],[550,'#7fcf3a'],[590,'#30bf6a'],[650,'#22a7e6'],[750,'#1d4fd0'],[900,'#1d1a8f']];
 function col(v,S){if(v<=S[0][0])return S[0][1];for(var i=1;i<S.length;i++)if(v<=S[i][0]){var a=S[i-1],b=S[i],f=(v-a[0])/(b[0]-a[0]);return mix(a[1],b[1],f)}return S[S.length-1][1]}
 function mix(a,b,f){var p=function(h,i){return parseInt(h.substr(1+2*i,2),16)};return'rgb('+[0,1,2].map(function(i){return Math.round(p(a,i)+(p(b,i)-p(a,i))*f)}).join(',')+')'}
 function txt(ctx,s,x,y,o){o=o||{};ctx.font=(o.b?'bold ':'')+(o.s||12)+'px Arial';ctx.fillStyle=o.c||'#111';ctx.textAlign=o.a||'left';ctx.fillText(s,x,y)}
 function map(ctx,cx,cy,R,f,S,title,eye,mark,mask){var sc=R/4;for(var py=-R;py<=R;py+=2)for(var px=-R;px<=R;px+=2){if(px*px+py*py>R*R)continue;var x=px/sc,y=-py/sc;
   if(mask&&mask(x,y)){ctx.fillStyle='#fff';ctx.fillRect(cx+px-1,cy+py-1,2.2,2.2);continue}ctx.fillStyle=col(f(x,y),S);ctx.fillRect(cx+px-1,cy+py-1,2.2,2.2)}
  ctx.strokeStyle='#333';ctx.lineWidth=.8;ctx.beginPath();ctx.arc(cx,cy,R,0,7);ctx.stroke();[1,2,3].forEach(function(k){ctx.strokeStyle='rgba(0,0,0,.25)';ctx.beginPath();ctx.arc(cx,cy,k*sc,0,7);ctx.stroke()});
  ctx.strokeStyle='rgba(0,0,0,.35)';ctx.beginPath();ctx.moveTo(cx-R,cy);ctx.lineTo(cx+R,cy);ctx.moveTo(cx,cy-R);ctx.lineTo(cx,cy+R);ctx.stroke();
  txt(ctx,title,cx,cy-R-8,{a:'center',b:1,s:12});txt(ctx,eye==='L'?'N':'T',cx-R-2,cy+4,{a:'right',s:10,c:'#555'});txt(ctx,eye==='L'?'T':'N',cx+R+3,cy+4,{s:10,c:'#555'});
  /* grid values every 2 mm */
  [-2,0,2].forEach(function(yy){[-2,0,2].forEach(function(xx){var v=f(xx,yy);txt(ctx,(Math.abs(v)<100?v.toFixed(1):Math.round(v)).toString(),cx+xx*sc,cy-yy*sc+4,{a:'center',s:9.5,c:'#000'})})});
  if(mark){ctx.strokeStyle='#000';ctx.lineWidth=1.4;ctx.beginPath();ctx.arc(cx+mark[0]*sc,cy-mark[1]*sc,5,0,7);ctx.stroke()}}
 function bar(ctx,x,y,S,lab,step){var n=S.length;for(var i=0;i<n;i++){ctx.fillStyle=S[i][1];ctx.fillRect(x,y+i*13,14,13);txt(ctx,String(S[i][0]),x+18,y+i*13+10,{s:9})}txt(ctx,lab,x,y-5,{s:9,c:'#444'})}
 function compute(c){var m=model(c),best={v:1e9},km={v:-1e9},ks=[];
  for(var y=-4;y<=4;y+=0.1)for(var x=-4;x<=4;x+=0.1){if(x*x+y*y>16)continue;var p=m.P(x,y);if(p<best.v)best={v:p,x:x,y:y};if(x*x+y*y<=9.6){var k=m.K(x,y);if(k>km.v)km={v:k,x:x,y:y}}}
  /* sim K at 3 mm: average along steep and flat meridians */
  var ax=(c.axis==null?90:c.axis)*Math.PI/180,f1=0,f2=0,n=0;for(var rr=0.5;rr<=1.5;rr+=0.25){[1,-1].forEach(function(s){f2+=m.K(s*rr*Math.cos(ax),s*rr*Math.sin(ax));f1+=m.K(s*rr*Math.cos(ax+Math.PI/2),s*rr*Math.sin(ax+Math.PI/2));n++})}
  var K2=f2/n,K1=f1/n;if(K1>K2){var t=K1;K1=K2;K2=t}
  var ebT=m.Eb(best.x,best.y),efT=m.Ef(best.x,best.y),cct=m.P(0,0);
  var is=0;[[0,-1.5],[-0.8,-1.3],[0.8,-1.3]].forEach(function(p){is+=m.K(p[0],p[1])});[[0,1.5],[-0.8,1.3],[0.8,1.3]].forEach(function(p){is-=m.K(p[0],p[1])});is/=3;
  var dist=Math.sqrt(best.x*best.x+best.y*best.y);
  var D=c.badd!=null?c.badd:Math.min(20,0.25+Math.max(0,km.v-46.5)*0.28+Math.max(0,ebT-6)*0.12+Math.max(0,efT-4)*0.08+Math.max(0,520-best.v)*0.012+Math.max(0,dist-0.7)*0.4+Math.max(0,is-1)*0.25);
  var ARC=337.5/((K1+K2)/2+Math.max(0,km.v-(K1+K2)/2)*0.5),PRC=6.45-Math.max(0,ebT-4)*0.02-(c.cone?(c.cone.eb||c.cone.amp*5)*0.009:0);
  function g(v,t,inv){for(var i=0;i<t.length;i++)if(inv?v>t[i]:v>=t[i])return i;return t.length}
  var A=g(ARC,[7.25,7.05,6.35,6.15],1),B=g(PRC,[5.9,5.7,5.15,4.95],1),C=g(best.v,[490,450,400,300],1);
  return{m:m,K1:K1,K2:K2,Kmax:km,thin:best,cct:cct,ebT:ebT,efT:efT,is:is,D:D,abc:'A'+A+' B'+B+' C'+C+' D'+(c.dva||'-')}}
 function render(c){var W=760,H=640,cv=document.createElement('canvas');cv.width=W*2;cv.height=H*2;var ctx=cv.getContext('2d');ctx.scale(2,2);ctx.fillStyle='#fff';ctx.fillRect(0,0,W,H);
  var R=compute(c),m=R.m,eye=c.eye||'R',mir=eye==='L'?-1:1;
  function F(fn){return function(x,y){return fn(x*mir,y)}}/* model coords: +x = nasal; screen for OS mirrored */
  txt(ctx,'Corneal tomography: 4 maps refractive · SIMULATED TEACHING REPORT',14,22,{b:1,s:13});
  txt(ctx,'Eye: '+(eye==='L'?'OS (left eye)':'OD (right eye)')+'   Age: '+(c.age||30)+'   Quality: '+(c.qs||'OK')+(c.note?'   '+c.note:''),14,40);
  var mask=c.maskSup?function(x,y){return y>c.maskSup}:null;
  var R0=100,cx1=150,cx2=420,cy1=170,cy2=420;
  map(ctx,cx1,cy1,R0,F(m.K),KS,'Axial / sagittal curvature (front), D',eye,null,mask);
  map(ctx,cx2,cy1,R0,F(m.Ef),ES,'Elevation (front), BFS, µm',eye,null,mask);
  map(ctx,cx1,cy2,R0,F(m.P),PS,'Corneal thickness, µm',eye,[R.thin.x*mir,R.thin.y],mask);
  map(ctx,cx2,cy2,R0,F(m.Eb),ES,'Elevation (back), BFS, µm',eye,[R.thin.x*mir,R.thin.y],mask);
  bar(ctx,262,72,KS,'D');bar(ctx,532,72,ES,'µm');bar(ctx,262,322,PS,'µm');
  /* indices */
  var X=572,Y=330;function row(l,v,c2){txt(ctx,l,X,Y);txt(ctx,v,W-14,Y,{a:'right',b:1,c:c2||'#111'});Y+=18}
  var ax=c.axis==null?90:c.axis;
  txt(ctx,'Front',X,Y-12,{b:1,s:11,c:'#1D4E89'});
  row('K1 (flat)',R.K1.toFixed(1)+' D');row('K2 (steep)',R.K2.toFixed(1)+' D');row('Km',((R.K1+R.K2)/2).toFixed(1)+' D');row('Astigmatism',(R.K2-R.K1).toFixed(1)+' D @ '+Math.round(ax)+'°');
  row('K max',R.Kmax.v.toFixed(1)+' D',R.Kmax.v>=49?'#b3261e':R.Kmax.v>=47.2?'#a15c00':null);row('Q value (8 mm)',(c.Q!=null?c.Q:-0.25).toFixed(2));
  Y+=6;txt(ctx,'Pachymetry',X,Y,{b:1,s:11,c:'#1D4E89'});Y+=14;
  row('Central (apex)',Math.round(R.cct)+' µm');row('Thinnest',Math.round(R.thin.v)+' µm',R.thin.v<470?'#b3261e':R.thin.v<500?'#a15c00':null);
  row('Thinnest at (x, y)',(R.thin.x*mir).toFixed(1)+', '+R.thin.y.toFixed(1)+' mm');
  Y+=6;txt(ctx,'Ectasia screening',X,Y,{b:1,s:11,c:'#1D4E89'});Y+=14;
  row('Back elev. (thinnest)',(R.ebT>=0?'+':'')+Math.round(R.ebT)+' µm',R.ebT>16?'#b3261e':R.ebT>12?'#a15c00':null);
  row('I–S value (3 mm)',R.is.toFixed(1)+' D',R.is>1.4?'#b3261e':R.is>1?'#a15c00':null);
  row('BAD-D (simulated)',R.D.toFixed(2),R.D>=2.6?'#b3261e':R.D>=1.6?'#a15c00':'#1e7a3a');row('ABCD grade',R.abc);
  txt(ctx,'Examiner\'s view; circles at 2, 4, 6 mm;',X,Y+6,{s:9,c:'#555'});txt(ctx,'small ring = thinnest point.',X,Y+18,{s:9,c:'#555'});
  txt(ctx,'RPC Rounds Diagnostics Lab · simulation for teaching',W-14,H-8,{a:'right',s:10,c:'#555'});
  return'<img src="'+cv.toDataURL('image/png')+'" alt="Simulated corneal tomography report" style="display:block;width:100%;min-width:640px;height:auto">'}
 return{render:render,compute:function(c){var R=compute(c);delete R.m;return R}};
})();
if(typeof module!=='undefined')module.exports=DXT;
