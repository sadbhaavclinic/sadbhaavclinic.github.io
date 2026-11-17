/* RPC Rounds Diagnostics Lab: simulated fluorescein (FFA) and indocyanine green (ICGA) angiograms.
   Procedural fundus model drawn on canvas; frames at chosen times. Teaching simulation only.
   Model coordinates in mm: X + = nasal, Y + = superior; fovea at 0,0; disc at X 4.5. */
var DXA=(function(){
 function rng(seed){var s=seed>>>0||1;return function(){s=(s*1664525+1013904223)>>>0;return s/4294967296}}
 function cl(v,a,b){return Math.max(a,Math.min(b,v))}
 function sm(a,b,x){var t=cl((x-a)/(b-a),0,1);return t*t*(3-2*t)}
 var S=400,K=31;
 /* ---------- vessel tree ---------- */
 function tree(c){var r=rng((c.seed||7)*7+3),V=[],DX=4.5,DY=0.25;
  function seg(pts,w0,w1,type,reg){V.push({p:pts,w0:w0,w1:w1,t:type,reg:reg})}
  function arcade(sup,type,off){var pts=[],sg=sup?1:-1;for(var i=0;i<=40;i++){var th=(8+i*4)*Math.PI/180,rr=4.5-1.35*Math.sin(th)+2.4*Math.max(0,(th*180/Math.PI-100)/100)+off+(r()-0.5)*0.06;pts.push([rr*Math.cos(th)+(i<3?(DX-4.45)*(1-i/3):0),sg*(rr*Math.sin(th))+(i<3?sg*DY*(1-i/3)*0.4:0)])}
   pts[0]=[DX-0.2,DY*sg*0.5];return pts}
  function branch(x,y,ang,len,w,type,reg,depth,toward){var pts=[[x,y]],a=ang,n=Math.max(4,Math.round(len/0.25));
   var bend=(r()-0.5)*0.12;for(var i=1;i<=n;i++){a+=(r()-0.5)*0.25+bend;if(toward){var ta=Math.atan2(-y,-x);a+=Math.sin(ta-a)*0.06}x+=Math.cos(a)*len/n;y+=Math.sin(a)*len/n;if(toward&&Math.hypot(x,y)<0.75+r()*0.5)break;pts.push([x,y])}
   seg(pts,w,w*0.35,type,reg);
   if(depth>0)for(var k=2;k<pts.length-1;k+=3+Math.floor(r()*2)){if(r()<0.5){var p=pts[k];branch(p[0],p[1],a+(r()<0.5?1:-1)*(0.5+r()*0.6),len*0.45,w*0.55,type,reg,depth-1,toward)}}}
  ['A','V'].forEach(function(t){[true,false].forEach(function(sup){var pts=arcade(sup,t,t==='V'?0.22:-0.12),w=t==='V'?0.16:0.12,reg=sup?'ST':'IT';seg(pts,w,w*0.45,t,reg);
    for(var i=4;i<pts.length-2;i+=5+Math.floor(r()*3)){var p=pts[i],ta=Math.atan2(-p[1],-p[0]);
     if(Math.hypot(p[0],p[1])<6.5)branch(p[0],p[1],ta+(r()-0.5)*0.4,Math.hypot(p[0],p[1])*0.7,w*0.45,t,reg,0,true);
     var oa=Math.atan2(p[1],p[0]);branch(p[0],p[1],oa+(r()-0.5)*0.5,2.5+r()*2,w*0.55,t,reg,1,false)}});
   [[0.7,'SN'],[-0.7,'IN'],[0.15,'SN'],[-0.2,'IN']].forEach(function(q,j){branch(DX+0.2,DY+q[0]*0.3,q[0]*1.6+(j>1?0.0:0),4+r()*2,t==='V'?0.12:0.09,t,q[1],1,false)})});
  /* small macular twigs from disc (papillomacular) */
  for(var j=0;j<4;j++)branch(DX-0.6,DY+(j-1.5)*0.35,Math.PI+(j-1.5)*0.15,2.6,0.05,j%2?'A':'V',j<2?'IT':'ST',1,true);
  return V}
 /* choroidal (ICG) large vessels: from 4 vortex areas toward the posterior pole */
 function chor(c){var r=rng((c.seed||7)*13+5),L=[];function vv(x,y,a,w,n,d){var pts=[[x,y]];for(var k=0;k<n;k++){a+=(r()-0.5)*0.6;x+=Math.cos(a)*0.5;y+=Math.sin(a)*0.5;pts.push([x,y]);if(Math.hypot(x,y)<0.9)break;if(d>0&&k>1&&r()<0.22)vv(x,y,a+(r()<0.5?0.7:-0.7),w*0.6,Math.round(n*0.5),d-1)}L.push({p:pts,w0:w,w1:w*0.55})}
  [[-7.5,7],[7.5,7],[-7.5,-7],[7.5,-7]].forEach(function(v){for(var i=0;i<5;i++){var x=v[0]+(r()-0.5)*3,y=v[1]+(r()-0.5)*3;vv(x,y,Math.atan2(-y,-x)+(r()-0.5)*1.0,0.2+r()*0.14,15,1)}});return L}
 /* ---------- time curves ---------- */
 function fa(c,t){var d=c.delay||0,arm=c.arm||0;return{
  bg:t<10+arm?0:(t<14+arm?(t-10-arm)/4*0.55:(t<60?0.55+0.1*sm(14,30,t):0.65-0.3*sm(60,600,t))),
  A:function(dl){var tt=t-arm-d-(dl||0);return tt<11?0:(tt<14?(tt-11)/3:(tt<120?1:1-0.68*sm(120,600,tt)))},
  V:function(dl){var tt=t-arm-d-(dl||0);return tt<15?{e:0,f:0}:(tt<24?{e:sm(15,19,tt),f:sm(17,24,tt)}:{e:tt<120?1:1-0.68*sm(120,600,tt),f:tt<120?1:1-0.68*sm(120,600,tt)})},
  late:sm(60,600,t),early:1-sm(25,90,t)}}
 /* ---------- drawing helpers ---------- */
 function P(c,x,y){return[S/2+(c.eye==='L'?-1:1)*x*K,S/2-y*K]}
 function blob(ctx,c,x,y,rmm,col,a,hard){var p=P(c,x,y),R=rmm*K;if(R<0.5||a<=0.002)return;var g=ctx.createRadialGradient(p[0],p[1],0,p[0],p[1],R);var q=hard?0.8:0.25;
  g.addColorStop(0,'rgba('+col+','+a+')');g.addColorStop(q,'rgba('+col+','+a*(hard?1:0.75)+')');g.addColorStop(1,'rgba('+col+',0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(p[0],p[1],R,0,7);ctx.fill()}
 function line(ctx,c,pts,w0,w1,col,glow){if(glow){var m=col.match(/rgba\((\d+),(\d+),(\d+),([\d.]+)\)/);if(m)line(ctx,c,pts,w0*2.2,w1*2.2,'rgba('+m[1]+','+m[2]+','+m[3]+','+(m[4]*0.18)+')')}
  var n=pts.length,ch=Math.max(1,Math.min(3,Math.floor(n/3)));ctx.strokeStyle=col;ctx.lineCap='round';ctx.lineJoin='round';
  for(var k=0;k<ch;k++){var i0=Math.floor(k*(n-1)/ch),i1=Math.floor((k+1)*(n-1)/ch),w=w0+(w1-w0)*((i0+i1)/2)/n;ctx.lineWidth=Math.max(0.6,w*K);ctx.beginPath();for(var i=i0;i<=i1;i++){var a=P(c,pts[i][0],pts[i][1]);if(i===i0)ctx.moveTo(a[0],a[1]);else ctx.lineTo(a[0],a[1])}ctx.stroke()}}
 function flame(ctx,c,x,y,r,seed){var q=rng(seed||1),ang=Math.atan2(y-0.25,x-4.5);for(var i=0;i<4;i++){var o=(q()-0.5)*r*1.2,lx=x+Math.cos(ang)*o*1.5-Math.sin(ang)*o*0.4,ly=y+Math.sin(ang)*o*1.5+Math.cos(ang)*o*0.4,p=P(c,lx,ly),R=r*(0.7+0.5*q())*K;ctx.save();ctx.translate(p[0],p[1]);ctx.rotate(-(c.eye==='L'?Math.PI-ang:ang));ctx.scale(1,0.45);var g2=ctx.createRadialGradient(0,0,0,0,0,R);g2.addColorStop(0,'rgba(0,0,0,0.9)');g2.addColorStop(0.6,'rgba(0,0,0,0.75)');g2.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g2;ctx.beginPath();ctx.arc(0,0,R,0,7);ctx.fill();ctx.restore()}}
 function clus(ctx,c,x,y,r,col,a,hard,seed,elong){var q=rng(seed||1),ang=Math.atan2(y-0.25,x-4.5);for(var i=0;i<6;i++){var d=r*0.55*q(),t=q()*6.28,el=elong?(q()-0.5)*r*1.6:0;blob(ctx,c,x+Math.cos(t)*d+Math.cos(ang)*el,y+Math.sin(t)*d+Math.sin(ang)*el,r*(0.45+0.35*q()),col,a,hard)}}
 function noise(r,n,lo,hi){var cv=document.createElement('canvas');cv.width=cv.height=n;var x=cv.getContext('2d'),im=x.createImageData(n,n);for(var i=0;i<n*n;i++){var v=255*(lo+(hi-lo)*r());im.data[i*4]=im.data[i*4+1]=im.data[i*4+2]=v;im.data[i*4+3]=255}x.putImageData(im,0,0);return cv}
 function g(v){v=Math.round(cl(v,0,1)*255);return v+','+v+','+v}
 function inNP(c,x,y){return(c.les||[]).some(function(L){return L.t==='np'&&Math.hypot(x-L.x,y-L.y)<L.r*0.85})}
 /* ---------- one frame ---------- */
 function frame(c,t,V,CH){var cv=document.createElement('canvas');cv.width=cv.height=S;var ctx=cv.getContext('2d'),r=rng((c.seed||7)*31+Math.round(t)),icg=c.dye==='icg',T=fa(c,icg?t/6:t),L=c.les||[];
  ctx.fillStyle='#000';ctx.fillRect(0,0,S,S);ctx.imageSmoothingEnabled=true;
  var bg=icg?(t<6?0:0.32*sm(6,30,t)+0.18*sm(60,600,t)-0.12*sm(900,1800,t)):T.bg;bg*=c.bgk||1;
  /* choroidal background */
  ctx.globalAlpha=1;var n1=noise(rng((c.seed||7)*5),36,0.78,1);ctx.drawImage(n1,0,0,S,S);ctx.globalCompositeOperation='multiply';ctx.fillStyle='rgba('+g(bg)+',1)';ctx.fillRect(0,0,S,S);ctx.globalCompositeOperation='source-over';
  if(icg){var LR=120,lo=document.createElement('canvas');lo.width=lo.height=LR;var lx=lo.getContext('2d'),sc=K*LR/S,ev=sm(6,20,t)*(1-sm(60,600,t)),late=sm(600,1500,t),mid=1-ev-late;
   lx.lineCap='round';lx.lineJoin='round';lx.strokeStyle='#fff';CH.forEach(function(v){for(var i=1;i<v.p.length;i++){var a1=v.p[i-1],b1=v.p[i];lx.lineWidth=Math.max(1,(v.w0+(v.w1-v.w0)*i/v.p.length)*sc);lx.beginPath();lx.moveTo(LR/2+(c.eye==='L'?-1:1)*a1[0]*sc,LR/2-a1[1]*sc);lx.lineTo(LR/2+(c.eye==='L'?-1:1)*b1[0]*sc,LR/2-b1[1]*sc);lx.stroke()}});
   ctx.globalAlpha=cl(0.6*ev+0.12*Math.max(0,mid),0,1);ctx.globalCompositeOperation='screen';ctx.drawImage(lo,0,0,S,S);ctx.globalCompositeOperation='source-over';
   if(late>0){var dk=document.createElement('canvas');dk.width=dk.height=LR;var dx2=dk.getContext('2d');dx2.drawImage(lo,0,0);dx2.globalCompositeOperation='source-in';dx2.fillStyle='#000';dx2.fillRect(0,0,LR,LR);ctx.globalAlpha=0.35*late;ctx.drawImage(dk,0,0,S,S)}ctx.globalAlpha=1}
  /* macular pigment and FAZ */
  var f=P(c,0,0),gm=ctx.createRadialGradient(f[0],f[1],0,f[0],f[1],1.6*K);gm.addColorStop(0,'rgba(0,0,0,'+(icg?0.25:0.7)+')');gm.addColorStop(0.3,'rgba(0,0,0,'+(icg?0.15:0.4)+')');gm.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=gm;ctx.beginPath();ctx.arc(f[0],f[1],1.6*K,0,7);ctx.fill();
  /* capillary texture (retinal), absent over non-perfusion */
  if(!icg){var cap=0.35*T.A(0)*(1-0.5*T.late);if(cap>0){var nc=noise(r,140,0,1);ctx.globalAlpha=cap*0.5;ctx.globalCompositeOperation='screen';ctx.drawImage(nc,0,0,S,S);ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over'}
   blob(ctx,c,0,0,(c.faz||0.3),'0,0,0',0.75*T.A(0),false)}
  /* lesions under the vessels (choroid/RPE level and non-perfusion) */
  L.forEach(function(l){var x=l.x||0,y=l.y||0;
   if(l.t==='np')clus(ctx,c,x,y,l.r,'0,0,0',0.5*(icg?0.2:1)*cl(T.A(0)*1.2,0,1),false,Math.round(x*7+y*13+50));
   if(l.t==='block')clus(ctx,c,x,y,l.r,'0,0,0',0.8,true,Math.round(x*11+y*5+80),0);
   if(l.t==='window'){var a=icg?0.15:cl(bg*1.25*(1-0.6*T.late),0,0.95);blob(ctx,c,x,y,l.r,g(1),a,true)}
   if(l.t==='drusen')(l.list||[]).forEach(function(q){blob(ctx,c,q[0],q[1],q[2]||0.12,g(1),icg?0.05:cl(bg*0.9+0.25*T.late,0,0.9),true)});
   if(l.t==='ped'){var a2=icg?(l.icg==null?0.05:l.icg):(0.15+0.75*sm(20,400,t));blob(ctx,c,x,y,l.r,g(1),a2*(icg?1:1),true)}
   if(l.t==='stain'){blob(ctx,c,x,y,l.r,g(1),icg?0.1:(0.1+0.6*sm(30,600,t)),true)}
   if(l.t==='hypo')(l.list||[]).forEach(function(q){blob(ctx,c,q[0],q[1],q[2]||0.25,'0,0,0',icg?0.75*sm(60,600,t):0.0,true)});
   if(l.t==='hyperperm'&&icg)(l.list||[]).forEach(function(q){blob(ctx,c,q[0],q[1],q[2]||0.8,g(1),0.45*sm(120,600,t)*(1-0.4*sm(900,1800,t)),false)});
   if(l.t==='plaque'&&icg)blob(ctx,c,x,y,l.r,g(1),0.2+0.5*sm(300,1500,t),true);
   if(l.t==='scar'&&l.prp&&!l.list){l.list=[];for(var gx=-7;gx<=7;gx+=0.62)for(var gy=-7;gy<=7;gy+=0.62){var ox=gx+((Math.round(gy/0.62)%2)?0.31:0),rr3=Math.hypot(ox,gy);if(rr3>4.4&&rr3<7.5&&Math.hypot(ox-4.5,gy-0.25)>1.6)l.list.push([ox,gy,0.2])}}
   if(l.t==='scar'){(l.list||[]).forEach(function(q){blob(ctx,c,q[0],q[1],(q[2]||0.18)*1.25,g(1),icg?0.05:0.15+0.45*sm(30,600,t),true);blob(ctx,c,q[0],q[1],(q[2]||0.18)*0.85,'0,0,0',0.75,true)})}});
  /* vessels */
  V.forEach(function(v){if(v.t==='A'){var dl=(c.adelay&&c.adelay[v.reg])||0,a=T.A(dl);if(icg)a=0.75*sm(5,15,t)*(1-0.85*sm(120,900,t));var w=v.w0;line(ctx,c,v.p,v.w0,v.w1,'rgba('+g(0.15+0.8*a)+','+(0.3+0.7*a)+')',1)}
   else{var dv=(c.vdelay&&c.vdelay[v.reg])||0,s=T.V(dv);if(icg){var q=0.7*sm(8,22,t)*(1-0.85*sm(120,900,t));s={e:q,f:q}}
    line(ctx,c,v.p,v.w0,v.w1,'rgba('+g(0.12+0.8*s.e)+','+(0.3+0.7*Math.max(s.e,0.01))+')',1);if(s.f<s.e)line(ctx,c,v.p,v.w0*0.45,v.w1*0.45,'rgba('+g(0.12+0.8*s.f)+',1)');
    if(c.vasc&&(c.vasc==='all'||c.vasc===v.reg)&&!icg)line(ctx,c,v.p,v.w0*2.2,v.w1*2.2,'rgba(255,255,255,'+0.35*sm(60,600,t)+')')}});
  L.forEach(function(l){if(l.t==='np'&&!icg)clus(ctx,c,l.x,l.y,l.r*0.9,'0,0,0',0.32*cl(T.A(0)*1.2,0,1),false,Math.round(l.x*7+l.y*13+50))});
  /* optic disc */
  var dp=[4.5,0.25],da=icg?0.25+0.2*sm(8,30,t)-0.2*sm(300,1500,t):(0.08+0.4*T.A(0)+0.3*sm(14,30,t-(c.delay||0))-0.4*T.late);if(icg)blob(ctx,c,dp[0],dp[1],0.85,'0,0,0',0.55,true);else blob(ctx,c,dp[0],dp[1],0.85,g(1),da,true);
  if(c.discLeak&&!icg)blob(ctx,c,dp[0],dp[1],0.85+0.8*sm(30,600,t),g(1),0.25+0.6*sm(20,600,t),false);
  if(!icg&&t>200&&!c.discLeak)blob(ctx,c,dp[0],dp[1],0.9,g(1),0.12*T.late,true);
  /* retinal / leaking lesions over the vessels */
  L.forEach(function(l){var x=l.x||0,y=l.y||0;
   if(l.t==='ma')(l.list||[]).forEach(function(q){var a=icg?0.1:cl(T.A(0),0,1)*(0.85-0.25*T.late);blob(ctx,c,q[0],q[1],0.1,g(1),a,true);if(l.leak&&!icg)blob(ctx,c,q[0],q[1],0.1+0.25*T.late,g(1),0.35*T.late,false)});
   if(l.t==='leak'&&!icg)blob(ctx,c,x,y,l.r*(0.5+0.7*sm(20,600,t)),g(1),(l.a||0.8)*sm(16,400,t),false);
   if(l.t==='cme'&&!icg){var a=0.95*sm(90,600,t),R0=(l.r||1);for(var i=0;i<12;i++){var an=i/12*Math.PI*2;blob(ctx,c,Math.cos(an)*0.42*R0,Math.sin(an)*0.42*R0,0.26*R0,g(1),a*0.85,false)}blob(ctx,c,0,0,0.4*R0,g(1),a,false)}
   if(l.t==='cnv'){if(icg){blob(ctx,c,x,y,l.r,g(1),0.25+0.4*sm(120,1200,t),false)}else{var e=T.A(0)*(1-T.late),rc=rng(57);for(var i2=0;i2<22;i2++){var a3=rc()*6.28,o2=l.r*0.55*Math.sqrt(rc()),o3=rc()*6.28,qx=x+Math.cos(o3)*o2,qy=y+Math.sin(o3)*o2,pts3=[[qx,qy]];for(var q3=0;q3<4;q3++){a3+=(rc()-0.5)*1.3;qx+=Math.cos(a3)*l.r*0.22;qy+=Math.sin(a3)*l.r*0.22;pts3.push([qx,qy])}line(ctx,c,pts3,0.045,0.025,'rgba(255,255,255,'+0.85*e+')')}blob(ctx,c,x,y,l.r*0.85,g(1),0.6*e,true);blob(ctx,c,x,y,l.r*(0.9+0.8*sm(30,600,t)),g(1),0.9*sm(20,400,t),false)}}
   if(l.t==='occult'&&!icg){var rq=rng(91);for(var j=0;j<70;j++){var rr=l.r*Math.sqrt(rq()),aa=rq()*6.28;blob(ctx,c,x+rr*Math.cos(aa),y+rr*Math.sin(aa),0.14,g(1),0.75*sm(60,600,t),false)}blob(ctx,c,x,y,l.r,g(1),0.25*sm(120,600,t),false)}
   if(l.t==='ink'&&!icg){blob(ctx,c,x,y,0.1+(l.r||0.6)*sm(25,600,t),g(1),0.95*sm(14,30,t),false);blob(ctx,c,x,y,0.08,g(1),0.9*sm(14,30,t),true)}
   if(l.t==='smoke'&&!icg){blob(ctx,c,x,y,0.1+0.15*sm(20,90,t),g(1),0.95*sm(14,40,t),true);var h=1.8*sm(30,400,t);for(var k2=0;k2<12;k2++){var yy=y+h*k2/12;blob(ctx,c,x+Math.sin(k2)*0.05,yy,0.1+0.08*k2/12,g(1),0.8*sm(30,300,t),false)}var top=y+h;blob(ctx,c,x,top,0.15+0.6*sm(200,600,t),g(1),0.8*sm(200,600,t),false)}
   if(l.t==='nve'||l.t==='nvd'){var nx=l.t==='nvd'?4.5:x,ny=l.t==='nvd'?0.25:y,R=l.r||0.8;if(!icg){var e2=T.A(0);for(var i3=0;i3<14;i3++){var an3=i3/14*Math.PI*2+0.2;line(ctx,c,[[nx,ny],[nx+Math.cos(an3)*R*0.7,ny+Math.sin(an3)*R*0.7],[nx+Math.cos(an3+0.3)*R,ny+Math.sin(an3+0.3)*R]],0.03,0.02,'rgba(255,255,255,'+0.85*e2*(1-T.late)+')')}blob(ctx,c,nx,ny,R*(0.8+1.1*sm(25,600,t)),g(1),0.95*sm(20,300,t),false)}}
   if(l.t==='polyp'&&icg)(l.list||[[x,y,0.3]]).forEach(function(q){var a=0.9*sm(10,40,t)*(1-0.3*sm(600,1800,t));blob(ctx,c,q[0],q[1],q[2]*1.3,g(1),a*0.5,false);blob(ctx,c,q[0],q[1],q[2],g(1),a,true);blob(ctx,c,q[0],q[1],q[2]*0.45,g(0.5),a*0.6,true)});
   if(l.t==='polyp'&&!icg)(l.list||[]).forEach(function(q){blob(ctx,c,q[0],q[1],q[2]*1.5,g(1),0.5*sm(20,400,t),false)});
   if(l.t==='bvn'&&icg){var rr2=rng(77),aB=0.55*sm(8,30,t)*(1-0.75*sm(300,1200,t));blob(ctx,c,x,y,l.r,g(1),0.18*sm(8,30,t)+0.25*sm(300,1500,t),false);for(var m=0;m<26;m++){var a0=rr2()*6.28,o0=l.r*0.7*Math.sqrt(rr2()),o1=rr2()*6.28,px=x+Math.cos(o1)*o0,py=y+Math.sin(o1)*o0,pts=[[px,py]];for(var q2=0;q2<5;q2++){a0+=(rr2()-0.5)*1.2;px+=Math.cos(a0)*l.r*0.22;py+=Math.sin(a0)*l.r*0.22;pts.push([px,py])}line(ctx,c,pts,0.045,0.025,'rgba(255,255,255,'+aB+')')}}
   if(l.t==='placoid')(l.list||[]).forEach(function(q){var e=icg?0.7:(1-sm(40,300,t)),lt=icg?0:sm(60,600,t);blob(ctx,c,q[0],q[1],q[2]||0.5,'0,0,0',0.75*e,true);blob(ctx,c,q[0],q[1],q[2]||0.5,g(1),0.7*lt,true)});
   if(l.t==='hemo'){if(l.boat){var pb=P(c,x,y+l.r*0.35);ctx.save();ctx.beginPath();ctx.rect(0,pb[1],S,S);ctx.clip();blob(ctx,c,x,y,l.r,'0,0,0',0.95,true);ctx.restore()}else if(l.r>0.9)blob(ctx,c,x,y,l.r,'0,0,0',0.95,true);else flame(ctx,c,x,y,l.r*1.7,Math.round(x*17+y*3+40))}
   if(l.t==='spots'&&!icg)(l.list||[]).forEach(function(q){blob(ctx,c,q[0],q[1],q[2]||0.2,g(1),0.7*sm(60,600,t),false)})});
  /* grain and circular field */
  var ng=noise(r,200,0,1);ctx.globalAlpha=0.08;ctx.globalCompositeOperation='overlay';ctx.drawImage(ng,0,0,S,S);ctx.globalAlpha=1;ctx.globalCompositeOperation='destination-in';ctx.fillStyle='#000';ctx.beginPath();ctx.arc(S/2,S/2,S/2-2,0,7);ctx.fill();ctx.globalCompositeOperation='source-over';
  return cv}
 function tlabel(t){var m=Math.floor(t/60),s=Math.round(t%60);return m+':'+(s<10?'0':'')+s}
 function phase(t,icg){if(icg)return t<120?'Early':(t<900?'Middle':'Late');return t<45?'Early':t<240?'Mid':'Late'}
 function render(c){var icg=c.dye==='icg',times=c.times||(icg?[60,600,1800]:[16,40,600]),V=tree(c),CH=chor(c),n=times.length,cols=n===4?2:n,rows=n===4?2:1,FW=360,gap=12,W=cols*FW+(cols+1)*gap,Hh=62,H=Hh+rows*(FW+28)+gap+16;
  var cv=document.createElement('canvas');cv.width=W*2;cv.height=H*2;var x=cv.getContext('2d');x.scale(2,2);x.fillStyle='#fff';x.fillRect(0,0,W,H);
  x.fillStyle='#1b2a3a';x.font='bold 15px Arial,sans-serif';x.fillText((icg?'Indocyanine green angiogram':'Fundus fluorescein angiogram')+' · SIMULATED TEACHING REPORT',gap,22);
  x.font='13px Arial,sans-serif';x.fillText('Eye: '+(c.eye==='L'?'OS (left eye)':'OD (right eye)')+'   Age: '+(c.age||'')+'   Field: 50°, macula centred'+(c.note?'   '+c.note:''),gap,42);
  times.forEach(function(t,i){var cx=gap+(i%cols)*(FW+gap),cy=Hh+Math.floor(i/cols)*(FW+28),f=frame(c,t,V,CH);x.fillStyle='#000';x.fillRect(cx,cy,FW,FW);x.drawImage(f,cx,cy,FW,FW);
   x.fillStyle='#fff';x.font='bold 13px Arial,sans-serif';x.fillText(tlabel(t),cx+8,cy+FW-10);x.font='12px Arial,sans-serif';x.fillText(c.eye==='L'?'OS':'OD',cx+FW-28,cy+18);
   x.fillStyle='#33414f';x.font='13px Arial,sans-serif';x.fillText((c.labels&&c.labels[i]?c.labels[i]:phase(t,icg))+' phase',cx,cy+FW+18)});
  x.fillStyle='#8a96a3';x.font='11px Arial,sans-serif';x.fillText('RPC Rounds Diagnostics Lab · simulation for teaching',W-300,H-6);
  return'<img src="'+cv.toDataURL('image/png')+'" alt="Simulated '+(icg?'ICG':'fluorescein')+' angiogram" style="display:block;width:100%;min-width:640px;height:auto">'}
 return{render:render}
})();
if(typeof module!=='undefined')module.exports=DXA;
