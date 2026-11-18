/* RPC Rounds Diagnostics Lab: simulated ocular B-scan ultrasound with a standardised A-scan trace.
   Geometry (mm): probe at 0,0; globe centre at 0,13, radius 12. Wall angles (deg) from the posterior pole. Teaching simulation only. */
var DXU=(function(){
 function rng(seed){var s=seed>>>0||1;return function(){s=(s*1664525+1013904223)>>>0;return s/4294967296}}
 function cl(v,a,b){return Math.max(a,Math.min(b,v))}
 var CY=13,R0=12,D2R=Math.PI/180;
 function wallR(c,phi){var r=R0;if(c.staph)r+=c.staph*Math.exp(-Math.pow(phi/(c.staphW||22),2));if(c.cup&&c.nerve!=null)r+=c.cup*Math.exp(-Math.pow((phi-c.nerve)/3,2));return r}
 function wp(c,phi,h){var r=wallR(c,phi)-(h||0);return[r*Math.sin(phi*D2R),CY+r*Math.cos(phi*D2R)]}
 function memb(c,m){var P=m.pts,out=[];for(var i=0;i<P.length-1;i++){var a=P[i],b=P[i+1],n=Math.max(1,Math.ceil(Math.max(Math.abs(b[0]-a[0])/0.4,Math.abs(b[1]-a[1])/0.12)));for(var j=0;j<=n;j++){var t=j/n,tt=m.smooth?(1-Math.cos(t*Math.PI))/2:t;out.push(wp(c,a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*tt))}}return out}
 function render(c){var W=560,H=430,AH=c.ascan===false?0:120,cv=document.createElement('canvas'),TW=W+300;cv.width=TW*2;cv.height=(H+AH+70)*2;var x=cv.getContext('2d');x.scale(2,2);x.fillStyle='#fff';x.fillRect(0,0,TW,H+AH+70);
  var im=document.createElement('canvas');im.width=W;im.height=H;var ix=im.getContext('2d'),img=ix.createImageData(W,H),d=img.data,r=rng(c.seed||9),sc=H/40,ox=W/2;
  var L=c.les||[],M=[];L.forEach(function(l){if(l.dome&&!l.pts){var q=l.dome,P=[];for(var k=-1;k<=1.0001;k+=0.1)P.push([q[0]+k*q[1],q[2]*Math.pow(Math.max(0,1-k*k),l.round||0.5)]);l.pts=P}});L.forEach(function(l){if(l.pts)M.push({p:memb(c,l),b:l.b!=null?l.b:({rd:0.95,pvd:0.32,schisis:0.75,cd:0.9,hyaloid:0.4,memb:0.6}[l.t]||0.7),w:l.w||({rd:0.28,pvd:0.18,schisis:0.22,cd:0.55,hyaloid:0.2}[l.t]||0.25)})});
  var shadows=[];L.forEach(function(l){if(l.t==='calc'||l.t==='fb'||l.t==='drusen'){var p=l.t==='drusen'?wp(c,c.nerve||0,0.4):(l.x!=null?[l.x,l.y]:wp(c,l.phi,l.h||0));shadows.push({a:Math.atan2(p[0],p[1]),d:Math.hypot(p[0],p[1]),w:(l.r||0.6)/Math.hypot(p[0],p[1]),k:l.t==='fb'?0.08:0.15,rev:l.t==='fb'})}});
  for(var py=0;py<H;py++)for(var px=0;px<W;px++){var X=(px-ox)/sc,Y=py/sc;if(c.oil){var r0=Math.hypot(X,Y);if(r0>2){var a0=Math.atan2(X,Y),r1=2+(r0-2)/1.45;X=r1*Math.sin(a0);Y=r1*Math.cos(a0)}}var ang=Math.atan2(X,Y),rr=Math.hypot(X,Y),i=(py*W+px)*4,v=0;
   if(Math.abs(ang)>34*D2R||Y<0.5){d[i]=d[i+1]=d[i+2]=0;d[i+3]=255;continue}
   var dx=X,dy=Y-CY,dist=Math.hypot(dx,dy),phi=Math.atan2(dx,dy)/D2R,wr=wallR(c,phi),inside=dist<wr-0.3;
   var n=r();v=0.02*n;
   /* anterior near-field noise */
   if(Y<3.5)v+=0.35*(1-Y/3.5)*r();
   if(inside){var vit=c.vit||0;if(vit){var dens=vit*(c.layer?cl((dy+R0*0.2)/(R0*1.0),0,1):1);if(r()<dens*0.07)v+=0.35+0.4*r()}
    if(c.endo){if(r()<c.endo*0.12)v+=0.25+0.35*r()}
    if(c.ast&&dist<wr-2.5&&r()<c.ast*0.025)v+=0.8+0.2*r();
    if(c.oil)v+=0.05*r()}
   /* wall complex */
   var wd=Math.abs(dist-wr),wt=0.5*(c.thick||1);if(wd<wt)v=Math.max(v,(0.8+0.2*r())*(1-wd/wt*0.45));
   if(c.tsign&&dist>wr+wt&&dist<wr+wt+1.4&&Math.abs(phi-(c.nerve||0))<40)v=Math.min(v,0.03);
   /* orbit fat behind wall */
   if(dist>wr+wt){var od=dist-wr-wt,fat=(0.38+0.32*r())*Math.exp(-od/11)*(c.oil?0.25:1);if(!(c.tsign&&od<1.4&&Math.abs(phi-(c.nerve||0))<40))v=Math.max(v,fat);
    if(c.nerve!=null){var na=phi-c.nerve,nw=(c.onw||2.0)+od*0.08,lat=Math.abs(Math.sin(na*D2R)*dist);if(lat<nw/2&&od<18)v=0.04+0.05*r()}}
   /* lesions */
   L.forEach(function(l){if(l.t==='mass'){var df=phi-l.phi,hd=wr-dist;if(hd<-0.2)return;var h=l.h,w=l.w,inm=false,edge=0;
     if(l.shape==='mushroom'){var neck=w*0.42,hc=h*0.72,hh=h*0.3,inM=function(a,b){return(b>-0.1&&b<=h*0.5&&Math.abs(a)<neck*Math.sqrt(Math.max(0,1-Math.pow(b/(h*1.1),2))))||(Math.pow(a/w,2)+Math.pow((b-hc)/hh,2)<1)};if(inM(df,hd)){inm=true;if(!inM(df,hd+0.3)||!inM(df+0.9,hd)||!inM(df-0.9,hd))edge=0.1}}
     else{if(Math.abs(df)<w){var hm=h*Math.pow(1-Math.pow(df/w,2),l.flat?1:0.5);if(hd<hm&&hd>-0.1){inm=true;edge=hm-hd}}}
     if(inm){var rf=l.refl==null?0.5:l.refl;v=(edge>0&&edge<0.35)?0.9:rf*(0.55+0.45*r());if(l.cav&&Math.hypot(df*0.2,hd-h*0.45)<h*0.18)v=0.05}
     if(l.exc&&Math.abs(df)<w*0.7&&dist>wr&&dist<wr+wt+0.8)v=Math.min(v,0.08)}
    if(l.t==='lens'){var q=[l.x,l.y],e2=Math.pow((X-q[0])/2.2,2)+Math.pow((Y-q[1])/1.6,2);if(Math.abs(e2-1)<0.12)v=Math.max(v,0.9);else if(e2<1)v=Math.max(v,0.12*r())}
    if(l.t==='dot'&&Math.hypot(X-l.x,Y-l.y)<(l.r||0.35))v=0.95;
    if(l.t==='fb'){if(Math.hypot(X-l.x,Y-l.y)<0.45)v=1}
    if(l.t==='calc'){var p2=wp(c,l.phi,l.h||0);if(Math.hypot(X-p2[0],Y-p2[1])<(l.r||0.6))v=1}
    if(l.t==='drusen'){var p3=wp(c,c.nerve||0,0.3);if(Math.hypot(X-p3[0],Y-p3[1])<0.55)v=1}
    if(l.t==='blood'){var p4=wp(c,l.phi,0),hd2=wr-dist,df2=phi-l.phi;if(hd2>0&&hd2<l.h*Math.sqrt(Math.max(0,1-Math.pow(df2/l.w,2))))v=Math.max(v,0.25+0.25*r())}});
   M.forEach(function(m){var best=9;for(var k=0;k<m.p.length;k++){var q=m.p[k],dd=Math.hypot(X-q[0],Y-q[1]);if(dd<best)best=dd}if(best<m.w)v=Math.max(v,m.b*(0.8+0.2*r())*(1-best/m.w*0.3))});
   shadows.forEach(function(s){if(rr>s.d+0.3&&Math.abs(ang-s.a)<s.w){v*=s.k;if(s.rev&&((rr-s.d)%1.6)<0.25)v=Math.max(v,0.55*(1-(rr-s.d)/14))}});
   var g=Math.round(cl(Math.pow(v,0.85),0,1)*255*(c.gain||1));g=Math.min(255,g);d[i]=d[i+1]=d[i+2]=g;d[i+3]=255}
  ix.putImageData(img,0,0);
  x.fillStyle='#1b2a3a';x.font='bold 15px Arial,sans-serif';x.fillText('B-scan ultrasound · SIMULATED TEACHING REPORT',16,22);x.font='13px Arial,sans-serif';x.fillStyle='#33414f';
  x.fillText('Eye: '+(c.eye==='L'?'OS':'OD')+'   Age: '+(c.age||'')+'   Probe: 10 MHz   Gain: '+(c.gainDb||80)+' dB   Scan: '+(c.scan||'transverse through the posterior pole'),16,42);
  x.fillStyle='#000';x.fillRect(16,52,W,H);x.drawImage(im,16,52);x.fillStyle='#fff';x.font='11px Arial,sans-serif';x.fillText('probe',16+W/2-14,64);x.fillText('marker ▸',22,64);
  /* A-scan along chosen ray */
  if(AH){var pa=(c.ascanAng||0)*D2R,wr0=wallR(c,c.ascanAng||0),a=Math.atan2(wr0*Math.sin(pa),CY+wr0*Math.cos(pa)),ay=52+H+10;x.fillStyle='#0b1622';x.fillRect(16,ay,W,AH);x.strokeStyle='#5fd17a';x.lineWidth=1.2;x.beginPath();
   for(var k2=0;k2<W;k2++){var depth=k2/W*40,qx=Math.round(ox+Math.sin(a)*depth*sc),qy=Math.round(Math.cos(a)*depth*sc),val=0;if(qx>=0&&qx<W&&qy>=0&&qy<H){var j=(qy*W+qx)*4;val=d[j]/255}var yy=ay+AH-6-(AH-14)*Math.pow(val,1.3);if(k2===0)x.moveTo(16+k2,yy);else x.lineTo(16+k2,yy)}x.stroke();
   x.fillStyle='#9fb3c8';x.font='10px Arial,sans-serif';x.fillText('Standardised A-scan along the '+(c.ascanAng?'marked':'central')+' ray (depth 0–40 mm)',22,ay+12);
   x.strokeStyle='rgba(255,210,60,0.8)';x.setLineDash([4,4]);x.beginPath();x.moveTo(16+ox,52);x.lineTo(16+ox+Math.sin(a)*40*sc,52+Math.cos(a)*40*sc);x.stroke();x.setLineDash([])}
  /* side notes */
  var sx=W+36,sy=80;x.fillStyle='#1D4E89';x.font='bold 14px Arial,sans-serif';x.fillText('Dynamic and A-scan notes',sx,sy);x.font='13px Arial,sans-serif';x.fillStyle='#1b2a3a';
  (c.dyn||['Mobility: —','After-movement: —']).forEach(function(t,i){var words=t.split(' '),line='',yy=sy+24+i*44;words.forEach(function(w){if(x.measureText(line+w).width>250){x.fillText(line,sx,yy);yy+=17;line=''}line+=w+' '});x.fillText(line,sx,yy)});
  x.fillStyle='#8a96a3';x.font='11px Arial,sans-serif';x.fillText('RPC Rounds Diagnostics Lab · simulation for teaching',TW-300,H+AH+64);
  return'<img src="'+cv.toDataURL('image/png')+'" alt="Simulated B-scan ultrasound" style="display:block;width:100%;min-width:640px;height:auto">'}
 return{render:render}
})();
if(typeof module!=='undefined')module.exports=DXU;
