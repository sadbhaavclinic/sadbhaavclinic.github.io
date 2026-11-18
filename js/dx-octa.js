/* RPC Rounds Diagnostics Lab: simulated OCT angiography (OCTA) reports.
   En-face slabs are drawn from a procedural capillary model; a structural B-scan carries a red flow overlay.
   Coordinates in mm: n = nasal (+) / temporal (-), y = superior (+); fovea (or disc centre in disc mode) at 0,0.
   Teaching simulation only: not a reproduction of any device. */
var DXOA=(function(){
 function rng(seed){var s=seed>>>0||1;return function(){s=(s*1664525+1013904223)>>>0;return s/4294967296}}
 function hsh(a,b,s){var h=(Math.imul(a,374761393)+Math.imul(b,668265263)+Math.imul(s,1442695041))|0;h=Math.imul(h^(h>>>13),1274126177);h^=h>>>16;return (h>>>0)/4294967296}
 function cl(v,a,b){return v<a?a:v>b?b:v}
 function ss(e0,e1,x){var t=cl((x-e0)/(e1-e0),0,1);return t*t*(3-2*t)}
 function wor(x,y,c,s){var gx=Math.floor(x/c),gy=Math.floor(y/c),f1=9,f2=9;for(var i=-1;i<=1;i++)for(var j=-1;j<=1;j++){var cx=gx+i,cy=gy+j,px=(cx+0.1+0.8*hsh(cx,cy,s))*c,py=(cy+0.1+0.8*hsh(cx,cy,s+17))*c,d=Math.sqrt((x-px)*(x-px)+(y-py)*(y-py))/c;if(d<f1){f2=f1;f1=d}else if(d<f2)f2=d}return[f1,f2]}
 function vn(x,y,c,s){var gx=Math.floor(x/c),gy=Math.floor(y/c),fx=x/c-gx,fy=y/c-gy,a=hsh(gx,gy,s),b=hsh(gx+1,gy,s),d=hsh(gx,gy+1,s),e=hsh(gx+1,gy+1,s),ux=fx*fx*(3-2*fx),uy=fy*fy*(3-2*fy);return a+(b-a)*ux+(d-a)*uy+(a-b-d+e)*ux*uy}
 var SL={scp:'s',dcp:'d',outer:'o',cc:'c',vit:'v',rpc:'r'};
 var NAME={scp:'Superficial capillary plexus',dcp:'Deep capillary plexus',outer:'Outer retina',cc:'Choriocapillaris',vit:'Vitreoretinal interface',rpc:'Radial peripapillary capillaries'};
 function txt(x,t,X,Y,o){o=o||{};x.font=(o.b?'bold ':'')+(o.s||12)+'px Arial,sans-serif';x.fillStyle=o.c||'#1b2a3a';x.textAlign=o.a||'left';x.fillText(t,X,Y);x.textAlign='left'}
 /* ---------- perfusion model ---------- */
 function fazR(f,th,slab){var F=f.faz||{},r=(F.r==null?0.29:F.r)*(slab==='dcp'?1.12:1),irr=F.irr==null?0.06:F.irr,sd=F.seed||3;return r*(1+irr*(0.6*Math.sin(2*th+sd)+0.45*Math.sin(3*th+sd*1.7)+0.35*Math.sin(5*th+sd*2.3)))}
 function angIn(a,a1,a2){a1=(a1%360+360)%360;a2=(a2%360+360)%360;return a1<=a2?(a>=a1&&a<=a2):(a>=a1||a<=a2)}
 function angDist(a,a1,a2){if(angIn(a,a1,a2))return 0;var d1=Math.abs(((a-a1+540)%360)-180),d2=Math.abs(((a-a2+540)%360)-180);return Math.min(d1,d2)}
 function zoneVal(z,n,y){var e=z.e==null?0.06:z.e,cx=z.n||0,cy=z.y||0;
  if(z.sec){var dx=n-cx,dy=y-cy,r=Math.sqrt(dx*dx+dy*dy),a=(Math.atan2(dy,dx)*180/Math.PI+360)%360,da=angDist(a,z.sec[0],z.sec[1])*Math.PI/180*Math.max(r,0.3);var r0=z.r0||0,r1=z.r1==null?99:z.r1;return(1-ss(0,e,da))*ss(r0-e,r0+e*0.2,r)*(1-ss(r1-e*0.2,r1+e,r))}
  var rx=z.rx||z.r,ry=z.ry||z.r,ro=(z.rot||0)*Math.PI/180,dx=n-cx,dy=y-cy,u=dx*Math.cos(ro)+dy*Math.sin(ro),v=-dx*Math.sin(ro)+dy*Math.cos(ro),q=Math.sqrt(u*u/(rx*rx)+v*v/(ry*ry));
  if(z.irr){var th=Math.atan2(v,u);q/=1+z.irr*(0.5*Math.sin(3*th+(z.s||1))+0.35*Math.sin(5*th+(z.s||1)*2)+0.25*Math.sin(7*th))}
  return 1-ss(-e*0.5,e*0.5,(q-1)*Math.min(rx,ry))}
 function perf(f,slab,n,y,ves){var code=SL[slab],P=1;
  if(!ves&&(slab==='scp'||slab==='dcp')&&f.mode!=='disc'){var F=f.faz||{},dx=n-(F.n||0),dy=y-(F.y||0),r=Math.sqrt(dx*dx+dy*dy),R=fazR(f,Math.atan2(dy,dx),slab);P*=ss(R-0.012,R+0.035,r)}
  (f.np||[]).forEach(function(z){if((z.sl||'sd').indexOf(code)<0)return;if(ves&&!z.ves)return;P*=1-(z.d==null?1:z.d)*zoneVal(z,n,y)});return P}
 /* ---------- large retinal vessels ---------- */
 function tree(f){if(f._tree)return f._tree;var r=rng((f.seed||7)*31+5),segs=[],S=f.size||3,H=S/2,disc=f.mode==='disc';
  function ad(a,b){var d=a-b;while(d>Math.PI)d-=2*Math.PI;while(d<-Math.PI)d+=2*Math.PI;return d}
  function grow(x,y,ang,w,dep,y0){var st=0.035;for(var i=0;i<260;i++){var nx=x+Math.cos(ang)*st,ny=y+Math.sin(ang)*st;
    if(Math.abs(nx)>H+0.15||Math.abs(ny)>H+0.15)break;
    if(!disc){var rr=Math.sqrt(nx*nx+ny*ny);if(rr<fazR(f,Math.atan2(ny,nx),'scp')+(S>4?0.3:0.05)+w)break;if(nx<-0.25&&ny*y0<0)break}
    segs.push([x,y,nx,ny,w]);x=nx;y=ny;
    var want=disc?Math.atan2(y,x)+(y>0?0.25:-0.25)*(x<0?1:-1)*0.6:Math.atan2(-y,-x);ang+=(r()-0.5)*0.3+(disc?0.04:0.07)*ad(want,ang);w*=disc?0.996:0.991;
    if(r()<(disc?0.045:(S>4?0.035:0.09))&&w>0.013&&dep<(S>4?2:4)){var b=ang+(r()<0.5?1:-1)*(0.55+r()*0.55);grow(x,y,b,w*0.68,dep+1,y0||y)}
    if(w<0.009)break}}
  if(disc){[[130,0.12],[232,0.12],[60,0.09],[300,0.09],[168,0.05],[192,0.05],[15,0.05],[345,0.05]].forEach(function(t){var a=t[0]*Math.PI/180;grow(Math.cos(a)*0.2,Math.sin(a)*0.2,a,t[1],0,Math.sin(a))})}
  else if(S>4){[1,-1].forEach(function(sg){var pts=[];for(var t=0;t<=1.0001;t+=0.025)pts.push([3.3-6.6*t,sg*(1.25+0.85*Math.sin(Math.PI*t*0.85))]);
     for(var i=0;i<pts.length-1;i++){segs.push([pts[i][0],pts[i][1],pts[i+1][0],pts[i+1][1],0.085-0.035*i/pts.length]);if(i%9===4){var p=pts[i];grow(p[0],p[1],Math.atan2(-p[1],-p[0])+(r()-0.5)*0.5,0.026,2,p[1])}if(i%10===7){var q=pts[i];grow(q[0],q[1],Math.atan2(q[1],q[0]*0.3)+(r()-0.5)*0.4,0.032,2,q[1])}}});
   [[3.2,0.18],[3.2,-0.2],[-3.2,0.45],[-3.2,-0.45]].forEach(function(q){grow(q[0],q[1],Math.atan2(-q[1],-q[0]),0.028,1,q[1])})}
  else{var N=7;for(var k=0;k<N;k++){var a=2*Math.PI*k/N+r()*0.4,R=H*1.35,x=Math.cos(a)*R,y=Math.sin(a)*R;x=cl(x,-H-0.1,H+0.1);y=cl(y,-H-0.1,H+0.1);if(Math.abs(y)<0.18&&x<0)y=y<0?-0.25:0.25;grow(x,y,Math.atan2(-y,-x)+(r()-0.5)*0.3,(x>0?0.03:0.024),0,y)}}
  f._tree=segs;return segs}
 /* ---------- drawing helpers ---------- */
 function mk(Wp){var c=document.createElement('canvas');c.width=Wp;c.height=Wp;var x=c.getContext('2d');x.fillStyle='#000';x.fillRect(0,0,Wp,Wp);return c}
 function T(f,Wp){var S=f.size||3,sc=Wp/S,R=f.eye!=='L';return{sc:sc,x:function(n){return((R?n:-n)+S/2)*sc},y:function(y){return(S/2-y)*sc}}}
 function line(x,t,a,b,c,d,w,al){x.strokeStyle='rgba(255,255,255,'+(al==null?0.95:al)+')';x.lineWidth=Math.max(0.8,w*t.sc);x.lineCap='round';x.beginPath();x.moveTo(t.x(a),t.y(b));x.lineTo(t.x(c),t.y(d));x.stroke()}
 function wig(x,t,r,n,y,len,w,al,steps){var a=r()*6.28,px=n,py=y;for(var i=0;i<(steps||12);i++){a+=(r()-0.5)*1.6;var nx=px+Math.cos(a)*len/(steps||12),ny=py+Math.sin(a)*len/(steps||12);line(x,t,px,py,nx,ny,w,al);px=nx;py=ny}}
 function mnvDraw(x,t,m,r,al){var mature=m.mature,pcv=m.type==='pcv',k=pcv?5:(mature?4:7),a0=r()*6.28;
  function br(px,py,a,len,w,d){var nx=px+Math.cos(a)*len,ny=py+Math.sin(a)*len;line(x,t,px,py,nx,ny,w,al);if(d<=0)return;var nb=mature?(r()<0.45?2:1):2;for(var i=0;i<nb;i++)br(nx,ny,a+(r()-0.5)*(mature?0.7:1.2),len*(0.7+r()*0.15),w*(mature?0.8:0.66),d-1)}
  for(var i=0;i<k;i++){var a=m.fan?(m.dir||0)*Math.PI/180+(i/(k-1)-0.5)*m.fan*Math.PI/180:a0+i*2*Math.PI/k+(r()-0.5)*0.4;br(m.n,m.y,a,m.r*(mature?0.36:0.27),mature?0.05:(pcv?0.018:0.03),mature?3:5)}
  if(!mature&&!pcv){for(var j=0;j<3;j++){var rr=m.r*(0.55+0.2*j),pa=0;for(var s=0;s<=40;s++){var an=s/40*6.283,q=rr*(1+0.15*Math.sin(5*an+j)),nx=m.n+Math.cos(an)*q,ny=m.y+Math.sin(an)*q*(m.ry||1);if(s)line(x,t,pa[0],pa[1],nx,ny,0.012,al*0.7);pa=[nx,ny]}}}
  if(pcv)(m.polyps||[]).forEach(function(p){x.beginPath();x.arc(t.x(p[0]),t.y(p[1]),Math.max(3,(p[2]||0.08)*t.sc),0,6.283);x.fillStyle='rgba(255,255,255,'+(0.35*al)+')';x.fill();x.lineWidth=2;x.strokeStyle='rgba(255,255,255,'+al+')';x.stroke()})}
 function lesions(f,slab,x,t){var r=rng((f.seed||7)*97+slab.length*13),c=SL[slab];
  function has(o,def){return (o.sl||def).indexOf(c)>=0}
  (f.ma||[]).forEach(function(p){if(!has({sl:p[2]},'sd'))return;x.beginPath();x.arc(t.x(p[0]),t.y(p[1]),Math.max(2.2,0.032*t.sc),0,6.283);x.fillStyle='rgba(255,255,255,0.95)';x.fill()});
  (f.irma||[]).forEach(function(p){if(!has(p,'s'))return;wig(x,t,r,p.n,p.y,p.l||0.5,p.w||0.024,c==='s'?0.9:0.5,14)});
  (f.coll||[]).forEach(function(p){if(!has(p,'sd'))return;for(var i=0;i<p.pts.length-1;i++){var a=p.pts[i],b=p.pts[i+1],mx=(a[0]+b[0])/2+(r()-0.5)*0.12,my=(a[1]+b[1])/2+(r()-0.5)*0.12;line(x,t,a[0],a[1],mx,my,p.w||0.03,0.95);line(x,t,mx,my,b[0],b[1],p.w||0.03,0.95)}});
  (f.nv||[]).forEach(function(p){if(!has(p,'v'))return;var al=c==='v'?0.95:0.45;for(var i=0;i<14;i++){var a=i/14*6.283;wig(x,t,r,p.n+Math.cos(a)*p.r*0.2,p.y+Math.sin(a)*p.r*0.2,p.r*0.9,0.016,al,10)}for(var j=0;j<2;j++){x.beginPath();x.arc(t.x(p.n),t.y(p.y),p.r*(0.6+0.3*j)*t.sc,0,6.283);x.lineWidth=1;x.strokeStyle='rgba(255,255,255,'+al*0.6+')';x.stroke()}});
  (f.tel||[]).forEach(function(p){if(!has(p,'ds'))return;var al=c==='d'?0.95:0.55;for(var i=0;i<26;i++){var q=Math.sqrt(r()),a=r()*6.283;wig(x,t,r,p.n+Math.cos(a)*p.rx*q,p.y+Math.sin(a)*p.ry*q,0.18,c==='d'?0.03:0.022,al,6)}
   if(p.ra&&c==='s'){var q2=p.ra;line(x,t,q2[0]-0.5,q2[1]+0.25,q2[0],q2[1],0.05,0.95);line(x,t,q2[0],q2[1],q2[0]+0.02,q2[1]-0.02,0.07,1)}});
  (f.outerFlow||[]).forEach(function(p){if(c!=='o')return;for(var i=0;i<16;i++){var q=Math.sqrt(r()),a=r()*6.283;wig(x,t,r,p.n+Math.cos(a)*p.rx*q,p.y+Math.sin(a)*p.ry*q,0.16,0.02,0.85,6)}});
  if(f.mnv){var m=f.mnv,sl=m.sl||(m.type===1||m.type==='pcv'||m.mature?'oc':m.type===3?'od':'o');if(sl.indexOf(c)>=0){var al=c==='o'?0.95:(c==='c'?0.85:0.6);if(m.type===3&&c==='d')al=0.7;var mm={};for(var k in m)mm[k]=m[k];if(m.type===3)mm.r=m.r*(c==='o'?1:1.3);mnvDraw(x,t,mm,rng((f.seed||7)*5+3),al)}}
  if(c==='c'&&f.chv){var cv=f.chv,rr=rng((f.seed||7)*11);x.save();if(cv.r){x.beginPath();x.ellipse(t.x(cv.n||0),t.y(cv.y||0),(cv.rx||cv.r)*t.sc,(cv.ry||cv.r)*t.sc,0,0,6.283);x.clip()}
   for(var i=0;i<(cv.k||9);i++){var px=(rr()-0.5)*(f.size||3)*1.1,py=(rr()-0.5)*(f.size||3)*1.1,a=rr()*6.28;for(var s=0;s<30;s++){a+=(rr()-0.5)*0.5;var nx=px+Math.cos(a)*0.09,ny=py+Math.sin(a)*0.09;line(x,t,px,py,nx,ny,cv.w||0.09,cv.a||0.6);px=nx;py=ny}}x.restore()}}
 /* ---------- one en-face slab ---------- */
 function slabImg(f,slab,Wp){var S=f.size||3,t=T(f,Wp),disc=f.mode==='disc';
  var vc=mk(Wp),vx=vc.getContext('2d'),segs=tree(f),va=slab==='scp'||slab==='rpc'?1:(slab==='vit'?0.07:(f.proj||0)*({dcp:1,outer:0.8,cc:0.6}[slab]||0));
  if(va>0)segs.forEach(function(s){line(vx,t,s[0],s[1],s[2],s[3],s[4],va)});
  var lc=mk(Wp),lx=lc.getContext('2d');lesions(f,slab,lx,t);
  var V=vx.getImageData(0,0,Wp,Wp).data,L=lx.getImageData(0,0,Wp,Wp).data;
  var out=document.createElement('canvas');out.width=Wp;out.height=Wp;var ox=out.getContext('2d'),img=ox.createImageData(Wp,Wp),d=img.data,r=rng((f.seed||7)+slab.length*101),R=f.eye!=='L',dens=f.dens||1;
  var cS=S>4?0.13:0.115,cD=S>4?0.11:0.095,seg=f.segErr,sh=f.shadow||[],cvd=f.cvoid||0;
  for(var py=0;py<Wp;py++)for(var px=0;px<Wp;px++){var X=(px+0.5)/t.sc-S/2,Y=S/2-(py+0.5)/t.sc,n=R?X:-X,i=(py*Wp+px)*4,v=0,nz=r();
   if(slab==='scp'||slab==='dcp'||slab==='rpc'){var P=perf(f,slab,n,Y,false),m;
    if(slab==='rpc'){var rr=Math.sqrt(X*X+Y*Y),th=Math.atan2(Y,X),w=wor(th*Math.max(rr,0.5),rr*0.28,0.05,5);m=Math.exp(-Math.pow((w[1]-w[0])/0.09,2));var w2=wor(X,Y,0.055,9);m=Math.max(m*0.95,0.45*Math.exp(-Math.pow((w2[1]-w2[0])/0.07,2)));if(rr<0.9)m=Math.max(m,0.5+0.35*vn(X,Y,0.05,3));v=0.07+0.04*nz+0.8*dens*m*P*(rr>2.6?1-0.3*ss(2.6,3.3,rr):1)}
    else{var c=slab==='scp'?cS:cD,wx=X+0.035*(vn(X,Y,0.2,61)-0.5),wy=Y+0.035*(vn(X,Y,0.2,67)-0.5),w1=wor(wx,wy,c,slab==='scp'?11:23),w3=wor(wx,wy,c*0.5,slab==='scp'?41:53);m=Math.max(Math.exp(-Math.pow((w1[1]-w1[0])/0.13,2)),0.55*Math.exp(-Math.pow((w3[1]-w3[0])/0.12,2)));v=0.07+0.03*nz+(slab==='dcp'?0.78:0.72)*dens*m*P*(0.75+0.25*nz)}}
   else if(slab==='cc'){var w4=wor(X,Y,0.026,71),g=ss(0.12,0.42,w4[0]);v=(0.3+0.4*g)*(0.88+0.18*vn(X,Y,0.1,77))+0.05*nz;var Pc=perf(f,'cc',n,Y,false);v*=0.25+0.75*Pc;if(cvd){var w5=wor(X,Y,0.16,91);if(hsh(Math.floor(X/0.16),Math.floor(Y/0.16),93)<cvd&&w5[0]<0.28)v*=0.35}}
   else{v=0.025+0.035*nz;if(slab==='outer'&&seg&&n>=Math.min(seg[0],seg[1])&&n<=Math.max(seg[0],seg[1])){var w6=wor(X,Y,cD,23);v+=(seg[2]||0.6)*0.85*Math.exp(-Math.pow((w6[1]-w6[0])/0.075,2))*perf(f,'dcp',n,Y,false)}}
   var Pv=perf(f,slab,n,Y,true),vv=V[i]/255*Pv*(slab==='scp'||slab==='rpc'?0.95:0.8),ll=L[i]/255;v=Math.max(v,vv,ll*0.95);
   for(var k=0;k<sh.length;k++){var z=sh[k];v*=1-(z.d||0.8)*zoneVal(z,n,Y)}
   var gv=Math.round(cl(Math.pow(v,0.9),0,1)*255);d[i]=d[i+1]=d[i+2]=gv;d[i+3]=255}
  (f.motion||[]).forEach(function(m){var y0=Math.round(t.y(m.y)),dx=Math.round((m.dx||0.06)*t.sc);for(var py=y0+1;py<Wp;py++){var row=d.slice(py*Wp*4,(py+1)*Wp*4);for(var px=0;px<Wp;px++){var sx=cl(px-dx,0,Wp-1),i=(py*Wp+px)*4;d[i]=row[sx*4];d[i+1]=row[sx*4+1];d[i+2]=row[sx*4+2]}}
   for(var q=0;q<(m.h||2);q++)for(var px2=0;px2<Wp;px2++){var i2=((y0+q)*Wp+px2)*4;if(i2<d.length){var bv=m.black?0:225;d[i2]=d[i2+1]=d[i2+2]=bv}}});
  ox.putImageData(img,0,0);
  var fin=document.createElement('canvas');fin.width=Wp;fin.height=Wp;var fx=fin.getContext('2d');if('filter' in fx)fx.filter='blur(0.35px)';fx.drawImage(out,0,0);fx.filter='none';return fin}
 /* ---------- B-scan with flow overlay ---------- */
 function bscan(f,BW,BH){var S=f.size||3,R=f.eye!=='L',b=f.b||{},bl=f.bl||0,r=rng((f.seed||7)*7+1),c=document.createElement('canvas');c.width=BW;c.height=BH;var x=c.getContext('2d'),img=x.createImageData(BW,BH),d=img.data,um=2.5;
  var segs=tree(f),cross=[];segs.forEach(function(s){if((s[1]-bl)*(s[3]-bl)<=0&&s[1]!==s[3]){var tt=(bl-s[1])/(s[3]-s[1]),nn=s[0]+tt*(s[2]-s[0]);cross.push([nn,s[4]])}});
  var chv=[];for(var k=0;k<26;k++)chv.push([(r()-0.5)*S*1.1,0.3+r()*0.6,0.025+r()*0.05,0.1+r()*0.2]);
  function ped(n){var h=0,typ='';(b.ped||[]).forEach(function(p){var dx=(n-p.n)/p.w;if(Math.abs(dx)<1){var sh=p.peaked?Math.pow(1-Math.abs(dx),1.6):Math.sqrt(1-dx*dx);if(p.flat)sh=Math.min(1,(1-dx*dx)*2.2)*(0.88+0.12*Math.sin(n*9+1));var hh=p.h*sh;if(hh>h){h=hh;typ=p}}});return[h,typ]}
  function bump(list,n){var h=0,o=null;(list||[]).forEach(function(p){var dx=(n-p.n)/p.w;if(Math.abs(dx)<1){var hh=p.h*Math.sqrt(1-dx*dx);if(hh>h){h=hh;o=p}}});return[h,o]}
  var fl=[];
  for(var px=0;px<BW;px++){var X=(px+0.5)/BW*S-S/2,n=R?X:-X,fd=Math.sqrt(X*X+bl*bl),pd=ped(n),srf=bump(b.srf,n),shr=bump(b.shrm,n);
   var zBM=Math.round(BH*0.7+(b.bow||0)*Math.pow(X/(S/2),2)*-1+(b.tilt||0)*X/(S/2)),rpeT=zBM-Math.round(pd[0]/um),ga=(b.ga||[]).some(function(g){return Math.abs(n-g.n)<g.w});
   var Ti=(130*(1-Math.exp(-Math.pow(fd/0.42,2)))+(n>0?18*ss(0.4,1.5,n):0))*(b.thin||1)/um,To=(ga?0.45:1)*(118+40*Math.exp(-Math.pow(fd/0.35,2)))/um;
   var lift=srf[0]/um+shr[0]/um,zP=rpeT-lift,zO=zP-To,gi=1-Math.exp(-Math.pow(fd/0.33,2)),opl=5*gi,zIL=zO-opl-Ti,
    zNFL=zIL+Ti*0.2,zGCL=zNFL+Ti*0.3,zIPL=zGCL+Ti*0.22,zINL=zIPL+Ti*0.28,chT=(b.chT||260)/um;
   var Ps=perf(f,'scp',n,bl,false),Pd=perf(f,'dcp',n,bl,false),Pc=perf(f,'cc',n,bl,false),vcr=0,vw=0;cross.forEach(function(q){var dq=Math.abs(q[0]-n);if(dq<q[1]*0.6){vcr=1;vw=q[1]}});
   var thick=b.edema?b.edema*Math.exp(-Math.pow(fd/0.9,2)):0;
   for(var py=0;py<BH;py++){var v,red=0,z=py,i=(py*BW+px)*4,nz=r();
    if(z<zIL-thick/um){v=0.03;(f.nv||[]).forEach(function(q){var dq=(n-q.n)/(q.r*0.9);if(Math.abs(bl-q.y)<q.r&&Math.abs(dq)<1&&z>zIL-thick/um-16*Math.sqrt(1-dq*dq)*(0.7+0.3*Math.sin(n*60))){v=0.35+0.3*nz;if(nz<0.4)red=1}})}
    else if(z<zP){var zi=z;if(thick)zi=zIL+(z-(zIL-thick/um))*(zP-zIL)/(zP-zIL+thick/um);
     if(zi<zNFL)v=0.78;else if(zi<zGCL)v=0.42;else if(zi<zIPL)v=0.55;else if(zi<zINL)v=0.22;else if(zi<zO)v=0.58;else if(zi<zP-16)v=0.12;else if(zi<zP-14)v=0.45;else if(zi<zP-11)v=0.13;else if(zi<zP-8)v=0.85;else v=0.4;
     if(ga&&zi>zP-16)v=0.15;
     if(fd<0.25&&zi<zO)v=Math.min(v,0.45);
     if(b.pamm&&Math.abs(n-b.pamm.n)<b.pamm.w&&zi>=zIPL&&zi<zO)v=0.75;
     (b.cyst||[]).forEach(function(cy){var dz=(zi-(zIL+(zP-zIL)*cy.z))/(cy.rz/um),dx2=(n-cy.n)/cy.rx;if(dx2*dx2+dz*dz<1)v=0.02});
     if(!ga&&!(fd<0.2)){if(zi>zGCL-Ti*0.18&&zi<zGCL+1&&nz<0.34*Ps)red=1;if(Math.abs(zi-zIPL)<1.6&&nz<0.2*Pd)red=1;if(Math.abs(zi-zINL)<2.2&&nz<0.36*Pd)red=1}
     if(vcr&&zi>zNFL-1&&zi<zNFL+vw*1000/um*0.9){red=nz<0.8?1:0;v=0.3}
     (b.outerFlow||[]).forEach(function(o){if(Math.abs(n-o.n)<o.w&&zi>zO&&zi<zP-10&&nz<0.3)red=1});
     if(b.t3&&Math.abs(n-b.t3.n)<b.t3.w&&zi>zINL&&nz<0.55){red=1;v=Math.max(v,0.55)}}
    else if(z<rpeT){var inS=srf[0]>0&&z<zP+srf[0]/um,inH=shr[0]>0&&z>=rpeT-shr[0]/um;
     if(inH){v=0.55+0.2*nz;if(shr[1].flow&&nz<0.28)red=1}else v=0.03+0.02*nz;
     if(b.t3&&Math.abs(n-b.t3.n)<b.t3.w&&nz<0.5)red=1}
    else if(z<rpeT+6){v=ga?0.25:0.95;if(pd[0]>0&&z>rpeT+3)v=0.9}
    else if(z<zBM&&pd[0]>0){var p=pd[1];if(p.fv){v=0.38+0.25*nz;if(nz<0.28)red=1}else if(p.peaked&&p.polyp){var dpc=Math.abs(n-p.n)/p.w;v=dpc<0.35?0.5:0.05;if(dpc<0.35&&nz<0.6)red=1}else v=0.03+0.02*nz}
    else{var dc=z-zBM;if(dc<5){v=0.55;if(nz<0.6*Pc)red=1}else if(dc<chT){v=0.45+0.15*nz;var dd=dc/chT;chv.forEach(function(cv){var dx3=(n-cv[0])/cv[2],dz3=(dd-cv[1])/(cv[3]*0.35);if(dx3*dx3+dz3*dz3<1){v=0.12;if(nz<0.22)red=1}})}else v=0.5*Math.exp(-(dc-chT)/40)+0.05*nz;
     if(ga)v=Math.min(1,v+0.3);if(vcr&&dc<chT)v*=0.8}
    if(vcr&&z>zNFL+3&&z<zBM&&!red)v*=0.72;
    (b.floater||[]).forEach(function(fq){if(Math.abs(n-fq.n)<fq.w){if(z>zIL-40&&z<zIL-26)v=0.6;else if(z>zIL)v*=0.35}});
    if(f.proj&&vcr&&z>zINL&&z<zBM+6&&nz<0.35*f.proj)red=1;
    var g=Math.round(cl(v*(0.85+0.3*r()),0,1)*235);if(red){d[i]=235;d[i+1]=60;d[i+2]=50}else{d[i]=d[i+1]=d[i+2]=g}d[i+3]=255}
   fl.push([zIL,zINL,zO,zP,rpeT,zBM])}
  x.putImageData(img,0,0);
  if(b.seg){x.setLineDash([5,4]);x.lineWidth=1.4;[['top','#36c5f0'],['bot','#f2c94c']].forEach(function(q){x.strokeStyle=q[1];x.beginPath();for(var px=0;px<BW;px++){var X=(px+0.5)/BW*S-S/2,n=R?X:-X,L=fl[px],zz=q[0]==='top'?L[2]:L[5]+2;var e=b.seg.err;if(e&&n>=Math.min(e[0],e[1])&&n<=Math.max(e[0],e[1])){var mid=(e[0]+e[1])/2,half=Math.abs(e[1]-e[0])/2,s2=Math.cos((n-mid)/half*Math.PI/2);if(q[0]==='top')zz=L[2]-(L[2]-L[1]+8)*s2*(e[2]||1)}if(px)x.lineTo(px,zz);else x.moveTo(px,zz)}x.stroke()});x.setLineDash([])}
  return c}
 /* ---------- disc sector chart ---------- */
 var SEC=[['T',135,225],['ST',95,135],['SN',55,95],['N',305,55],['IN',265,305],['IT',225,265]];
 function sectorVD(f){var out={},tot=0,tn=0;SEC.forEach(function(s){var sum=0,cnt=0;for(var rr=1.0;rr<=1.95;rr+=0.08)for(var a=0;a<360;a+=3){if(!angIn(a,s[1],s[2]))continue;var n=Math.cos(a*Math.PI/180)*rr,y=Math.sin(a*Math.PI/180)*rr;sum+=perf(f,'rpc',n,y,false);cnt++}out[s[0]]=Math.round(51*(f.dens||1)*sum/cnt+(hsh(s[1],3,f.seed||7)-0.5)*2);tot+=sum;tn+=cnt});out.all=Math.round(51*(f.dens||1)*tot/tn);return out}
 function sectorChart(x,f,X,Y,Rr,vd){var R=f.eye!=='L',cx=X+Rr,cy=Y+Rr;function col(v){return v<42?'#e0605c':v<47?'#f2c94c':'#6fcf97'}
  SEC.forEach(function(s){var a1=s[1],a2=s[2];if(a2<a1)a2+=360;var A1=(R?-a2:-(180-a1)),A2=(R?-a1:-(180-a2));x.beginPath();x.moveTo(cx,cy);x.arc(cx,cy,Rr,A1*Math.PI/180,A2*Math.PI/180);x.closePath();x.fillStyle=col(vd[s[0]]);x.fill();x.strokeStyle='#fff';x.lineWidth=2;x.stroke();
   var am=(a1+a2)/2,sx=R?Math.cos(am*Math.PI/180):-Math.cos(am*Math.PI/180),sy=-Math.sin(am*Math.PI/180);txt(x,s[0],cx+sx*Rr*0.62,cy+sy*Rr*0.62-3,{a:'center',s:11,b:1});txt(x,String(vd[s[0]]),cx+sx*Rr*0.62,cy+sy*Rr*0.62+12,{a:'center',s:12})});
  x.beginPath();x.arc(cx,cy,Rr*0.3,0,6.283);x.fillStyle='#fff';x.fill();txt(x,String(vd.all),cx,cy+5,{a:'center',s:14,b:1});
  txt(x,'Peripapillary RPC density (%) by sector',X+Rr,Y+2*Rr+20,{a:'center',s:12,c:'#33414f'});
  [['#6fcf97','normal'],['#f2c94c','borderline'],['#e0605c','low']].forEach(function(q,i){x.fillStyle=q[0];x.fillRect(X+i*90,Y+2*Rr+32,12,12);txt(x,q[1],X+i*90+16,Y+2*Rr+42,{s:11,c:'#33414f'})})}
 /* ---------- metrics ---------- */
 function metrics(f){var M=f.metrics||{},o={},S=f.size||3;
  if(f.mode!=='disc'){var A=0,F=f.faz||{};for(var k=0;k<90;k++){var a=k/90*2*Math.PI,rr=0;while(rr<1.4){var n=(F.n||0)+Math.cos(a)*rr,y=(F.y||0)+Math.sin(a)*rr;if(perf(f,'scp',n,y,false)>0.5)break;rr+=0.01}A+=0.5*rr*rr*(2*Math.PI/90)}o.faz=M.faz!=null?M.faz:Math.round(A*100)/100;
   var sS=0,sD=0,cnt=0;for(var gx=-S/2+0.05;gx<S/2;gx+=0.1)for(var gy=-S/2+0.05;gy<S/2;gy+=0.1){sS+=perf(f,'scp',gx,gy,false);sD+=perf(f,'dcp',gx,gy,false);cnt++}
   o.vds=M.vds!=null?M.vds:Math.round((S>4?47.5:49.5)*(f.dens||1)*sS/cnt*10)/10;o.vdd=M.vdd!=null?M.vdd:Math.round((S>4?52:54)*(f.dens||1)*sD/cnt*10)/10;
   if(f.mnv)o.flow=M.flow!=null?M.flow:Math.round(Math.PI*Math.pow(f.mnv.r*0.85,2)*100)/100}
  o.q=M.q||f.q||8;return o}
 function table(x,X,Y,rows){txt(x,'Measure',X,Y,{b:1,c:'#1D4E89'});txt(x,'Value',X+230,Y,{b:1,c:'#1D4E89'});txt(x,'Typical',X+300,Y,{b:1,c:'#1D4E89'});
  rows.forEach(function(r,i){var yy=Y+20+i*19;txt(x,r[0],X,yy,{s:12});txt(x,String(r[1]),X+230,yy,{s:12,b:1,c:r[3]?'#b3261e':'#1b2a3a'});txt(x,r[2],X+300,yy,{s:12,c:'#55606c'})});return Y+20+rows.length*19}
 function notes(x,X,Y,list,wd){var yy=Y;(list||[]).forEach(function(t){var w=t.split(' '),l='';x.font='12px Arial,sans-serif';w.forEach(function(s){if(x.measureText(l+s).width>wd){txt(x,l,X,yy,{s:12});yy+=16;l=''}l+=s+' '});txt(x,l,X,yy,{s:12});yy+=19});return yy}
 /* ---------- render ---------- */
 function render(f){var disc=f.mode==='disc',slabs=f.slabs||(disc?['rpc']:['scp','dcp','outer','cc']),Wp=disc?300:220,gap=14,W=1060,top=80,S=f.size||(disc?4.5:3);f.size=S;f._tree=null;
  var H=disc?470:(top+Wp+40+210+60);var cv=document.createElement('canvas');cv.width=W*2;cv.height=H*2;var x=cv.getContext('2d');x.scale(2,2);x.fillStyle='#fff';x.fillRect(0,0,W,H);
  txt(x,'OCT angiography · SIMULATED TEACHING REPORT',16,24,{b:1,s:15});
  txt(x,'Eye: '+(f.eye==='L'?'OS (left eye)':'OD (right eye)')+'   Age: '+(f.age||60)+'   Scan: '+S+' × '+S+' mm '+(disc?'optic disc':'macula')+'   Signal quality: '+metrics(f).q+'/10'+(f.note?'   '+f.note:''),16,44,{s:12.5,c:'#33414f'});
  slabs.forEach(function(s,k){var X0=16+k*(Wp+gap);txt(x,NAME[s]||s,X0,top-8,{b:1,s:12});var im=slabImg(f,s,Wp);x.drawImage(im,X0,top,Wp,Wp);
   txt(x,f.eye==='L'?'T':'N',X0+Wp-12,top+Wp/2+4,{s:11,c:'#ffd166',b:1});txt(x,f.eye==='L'?'N':'T',X0+4,top+Wp/2+4,{s:11,c:'#ffd166',b:1});
   if(!disc&&k===0){var yb=top+(S/2-(f.bl||0))*Wp/S;x.strokeStyle='rgba(80,220,120,0.9)';x.lineWidth=1.2;x.beginPath();x.moveTo(X0,yb);x.lineTo(X0+Wp,yb);x.stroke();txt(x,'B-scan',X0+16,yb-4,{s:10,c:'#7cf0a0'})}});
  var mt=metrics(f);
  if(disc){var vd=sectorVD(f);if(f.secOver)for(var q in f.secOver)vd[q]=f.secOver[q];sectorChart(x,f,16+Wp+40,top+10,120,vd);
   var rows=[['Signal quality',mt.q+'/10','7–10',mt.q<7],['Whole peripapillary RPC density',vd.all+' %','47–55',vd.all<47]];SEC.forEach(function(s){rows.push(['  '+s[0]+' sector',vd[s[0]]+' %','46–56',vd[s[0]]<46])});
   var yN=table(x,640,top+4,rows);txt(x,'Notes',640,yN+10,{b:1,c:'#1D4E89'});notes(x,640,yN+30,f.notes||['Disc-centred scan; RPC slab from the ILM to the posterior border of the RNFL.'],390)}
  else{var by=top+Wp+40;txt(x,'Structural B-scan with flow overlay (red = detected flow)',16,by-8,{b:1,s:12});var bs=bscan(f,640,210);x.drawImage(bs,16,by,640,210);x.strokeStyle='#d5e3f3';x.strokeRect(16,by,640,210);
   txt(x,f.eye==='L'?'N':'T',22,by+16,{s:11,c:'#ffd166',b:1});txt(x,f.eye==='L'?'T':'N',644,by+16,{s:11,c:'#ffd166',b:1});
   var t3=S>4?['43–51','4.5','6 × 6 mm']:['44–52','',''];var rows=[['Signal quality',mt.q+'/10','7–10',mt.q<7],['FAZ area (superficial)',mt.faz.toFixed(2)+' mm²','0.15–0.35',mt.faz>0.35||mt.faz<0.12],['Vessel density, superficial',mt.vds.toFixed(1)+' %',t3[0],mt.vds<(S>4?43:44)],['Vessel density, deep',mt.vdd.toFixed(1)+' %',S>4?'48–56':'49–57',mt.vdd<(S>4?48:49)]];
   if(mt.flow!=null)rows.push(['Lesion flow area (outer slab)',mt.flow.toFixed(2)+' mm²','none',true]);
   var yN=table(x,680,by+4,rows);txt(x,'Notes',680,yN+10,{b:1,c:'#1D4E89'});notes(x,680,yN+30,f.notes||['Slabs: superficial = ILM to IPL; deep = IPL to OPL; outer retina = OPL to Bruch\'s membrane; choriocapillaris = 10 µm below Bruch\'s membrane.'],360)}
  txt(x,'RPC Rounds Diagnostics Lab · simulation for teaching; red values are outside the typical range for this simulated device',16,H-12,{s:10.5,c:'#8a96a3'});
  return'<img src="'+cv.toDataURL('image/png')+'" alt="Simulated OCT angiography report" style="display:block;width:100%;min-width:640px;height:auto">'}
 return{render:render}
})();
if(typeof module!=='undefined')module.exports=DXOA;
