/* RPC Rounds Diagnostics Lab: simulated OCT reports (macular B-scan + thickness map, RNFL, ganglion cell).
   Drawn on canvas from a simple layer model with seeded speckle. Teaching simulation only. */
var DXO=(function(){
 function rng(seed){var s=seed>>>0||1;return function(){s=(s*1664525+1013904223)>>>0;return s/4294967296}}
 function G(x,c,w){return Math.exp(-Math.pow((x-c)/w,2))}
 function clamp(v,a,b){return Math.max(a,Math.min(b,v))}
 /* ---------- macular B-scan model (x in mm, -3..3, + = nasal; depths in µm) ---------- */
 function layers(x,c){var f=c.fovea||0,xx=x-f,pit=(c.pitSharp?Math.exp(-Math.pow(Math.abs(xx)/c.pitSharp,4)):G(xx,0,0.45))*(c.pit==null?1:c.pit),ring=G(Math.abs(xx),1.1,1.3),nas=x>0?x:0;
  var th={RNFL:(8+22*nas/3)*(1-pit),GCL:46*(1-pit)*ring+4,IPL:36*(1-pit)*(0.6+0.4*ring)+3,INL:34*(1-pit*0.95)*(0.7+0.3*ring),OPL:24*(1-pit*0.6)+2,ONL:58+42*pit,IS:24,OS:22,IZ:10,RPE:20};
  (c.mods||[]).forEach(function(m){if(m.t==='inner'){var g=zone(x,m);['RNFL','GCL','IPL','INL'].forEach(function(k){th[k]*=1+(m.k-1)*g})}
   if(m.t==='onl'){var g2=zone(x,m);th.ONL*=1+(m.k-1)*g2}
   if(m.t==='thick'){var g3=zone(x,m);['INL','OPL','ONL'].forEach(function(k){th[k]*=1+(m.k-1)*g3})}});
  return th}
 function zone(x,m){if(m.x0==null)return 1;var w=m.soft||0.15;if(x<m.x0-w||x>m.x1+w)return 0;if(x>=m.x0&&x<=m.x1)return 1;return x<m.x0?1-(m.x0-x)/w:1-(x-m.x1)/w}
 function dome(x,m){var d=Math.abs(x-m.x)/m.w;if(d>=1)return 0;return m.h*(m.peak?Math.pow(1-d,1.6):Math.sqrt(1-d*d))}
 var REF={vit:6,RNFL:215,GCL:105,IPL:165,INL:70,OPL:160,ONL:55,ELM:140,IS:85,OS:225,IZ:140,RPE:245,cho:115};
 function bscan(c,W,H){var cv=document.createElement('canvas');cv.width=W;cv.height=H;var ctx=cv.getContext('2d'),img=ctx.createImageData(W,H),d=img.data,r=rng(c.seed||5);
  var sy=H/760,BM0=520,choT=c.choroid||270,VES=[];for(var q=0;q<70;q++){var tt=0.2+r()*0.75;VES.push([-3+r()*6,tt,0.06+tt*0.2,0.04+tt*0.12])}
  for(var px=0;px<W;px++){var x=-3+6*px/(W-1),th=layers(x,c),M=c.mods||[];
   var bm=BM0+(c.staph?c.staph*x*x*-1:0)+(c.tilt||0)*x;
   /* RPE elevation (PED / drusen) */
   var ped=0,pedC=0;M.forEach(function(m){if(m.t==='ped'||m.t==='drusen'){var hh=m.t==='drusen'?m.list.reduce(function(a,q){return Math.max(a,dome(x,{x:q[0],w:q[1],h:q[2]}))},0):dome(x,m);if(hh>ped){ped=hh;pedC=m.c==null?(m.t==='drusen'?150:20):m.c}}});
   var rpeTop=bm-th.RPE-ped;
   /* subretinal space: SRF, SHRM, vitelliform */
   var srf=0,sub=[];M.forEach(function(m){if(m.t==='srf'||m.t==='shrm'||m.t==='vit'){var hh=dome(x,m);if(hh>0)sub.push([m.t,hh,m.c]);srf+=hh}});
   var photoBot=rpeTop-srf;
   /* EZ/ONL loss zones */
   var ezLoss=0,rpeLoss=0,ezThin=0;M.forEach(function(m){if(m.t==='ez'){var ze=zone(x,m)*(m.k||1);ezLoss=Math.max(ezLoss,ze);if(m.thin)ezThin=Math.max(ezThin,ze)}if(m.t==='ga')ezThin=Math.max(ezThin,zone(x,m));if(m.t==='ga'){var z=zone(x,m);ezLoss=Math.max(ezLoss,z);rpeLoss=Math.max(rpeLoss,z)}});
   var outer=(th.IS+th.OS+th.IZ)*(1-0.85*ezThin),onl=th.ONL*(1-(M.some(function(m){return m.t==='ga'})?0.75*rpeLoss:0.35*ezThin));
   /* intraretinal fluid extra thickness */
   var cyst=[];M.forEach(function(m){if(m.t==='cysts')m.list.forEach(function(q){var hh=dome(x,{x:q[0],w:q[1],h:q[2]});if(hh>0)cyst.push([q[3]||'INL',hh])})});
   var ex0={};M.forEach(function(m){if(m.t==='cysts')m.list.forEach(function(q){var L=q[3]||'INL',hs=q[2]*1.05*G(x,q[0],q[1]*1.25);ex0[L]=Math.max(ex0[L]||0,hs)})});var E=0;Object.keys(ex0).forEach(function(k){E+=ex0[k]});var extra={INL:E*0.4,OPL:E*0.3,ONL:E*0.3};
   /* hole */
   var hole=0,holeW=0,lam=0;M.forEach(function(m){if(m.t==='hole'){holeW=m.w;if(Math.abs(x-(c.fovea||0))<m.w*1.25)hole=1}if(m.t==='lamellar'&&Math.abs(x-(c.fovea||0))<m.w)lam=1-Math.pow(Math.abs(x-(c.fovea||0))/m.w,3)});var lamM=M.filter(function(m){return m.t==='lamellar'})[0],lx=Math.abs(x-(c.fovea||0));
   var seq=[['IS',outer*0.45],['ELM',3],['ONL',onl+(extra.ONL||0)],['OPL',th.OPL+(extra.OPL||0)],['INL',th.INL+(extra.INL||0)],['IPL',th.IPL],['GCL',th.GCL],['RNFL',th.RNFL]];
   /* build depth -> material list going up from photoBot */
   var bands=[],y=photoBot;
   bands.push(['OS',y-outer*0.55,y]);y-=outer*0.55;
   seq.forEach(function(s){bands.push([s[0],y-s[1],y]);y-=s[1]});
   var ilm=y;
   /* lift for VMT / ERM */
   var erm=M.filter(function(m){return m.t==='erm'})[0],vmt=M.filter(function(m){return m.t==='vmt'})[0];
   if(vmt){var lift=dome(x,{x:c.fovea||0,w:vmt.w,h:vmt.h,peak:true}),il0=ilm,sp=photoBot-il0;bands.forEach(function(b){b[1]-=lift*(photoBot-b[1])/sp;b[2]-=lift*(photoBot-b[2])/sp});ilm-=lift}
   if(erm){var wav=erm.k*Math.sin(x*9+1)*8;ilm+=wav;bands[bands.length-1][1]+=wav}
   if(lam>0){var cut=lam*(seq[7][1]+seq[6][1]+seq[5][1]+seq[4][1]*0.7);bands=bands.map(function(b){return[b[0],Math.max(b[1],ilm+cut),b[2]]});ilm+=cut}
   for(var py=0;py<H;py++){var z=py/sy,v;
    if(z<ilm){v=REF.vit;
     M.forEach(function(m){if(m.t==='hyaloid'){var hz=m.y0+(m.curve||0)*x*x;if(Math.abs(z-hz)<3&&(m.x0==null||(x>m.x0&&x<m.x1)))v=150}
      if(m.t==='operculum'&&Math.abs(x-(c.fovea||0))<m.w&&z>m.y&&z<m.y+m.h)v=150});
     if(vmt){var vy=ilm-((Math.abs(x-(c.fovea||0))<vmt.w*1.2)?0:200);if(Math.abs(x-(c.fovea||0))>vmt.w*0.15){var hy=ilm-4-Math.pow(Math.max(0,Math.abs(x-(c.fovea||0))-vmt.w*0.15),0.7)*120;if(Math.abs(z-hy)<2.5)v=170}}
     if(lamM&&lamM.lhep&&lx>lamM.w*0.7&&lx<lamM.w*2.4&&z>ilm-24*Math.sin(Math.PI*(lx-lamM.w*0.7)/(lamM.w*1.7)))v=125;
     if(erm){var gap=(Math.sin(x*5.3+0.7)>0.55)?6:0,top=ilm-6-gap-(erm.th||8);if(z>top&&z<ilm-gap)v=245}}
    else if(z<photoBot&&!(hole&&Math.abs(x-(c.fovea||0))<holeW*(0.45+0.8*(z-ilm)/(photoBot-ilm)))){v=REF.vit;for(var i=0;i<bands.length;i++){var b=bands[i];if(z>=b[1]&&z<b[2]){v=REF[b[0]];if(b[0]==='OS')v=REF.OS*(1-0.9*ezLoss);if(b[0]==='IS'||b[0]==='ELM')v=REF[b[0]]*(1-0.6*ezLoss);break}}
     if(Math.abs(z-ilm)<4)v=Math.max(v,230);
     if(lamM&&lx>lamM.w*0.55&&lx<lamM.w*1.9){var Lo=bands.filter(function(b){return b[0]==='OPL'})[0];if(Lo&&z>Lo[1]+(Lo[2]-Lo[1])*0.35&&z<Lo[2]+6)v=10}
     /* cysts */
     cyst.forEach(function(q){var L=bands.filter(function(b){return b[0]===q[0]})[0];if(L){var mid=Math.max((L[1]+L[2])/2,ilm+12+q[1]/2);if(Math.abs(z-mid)<q[1]/2&&z>ilm+10&&z<photoBot-8)v=8}});
     /* exudates */
     M.forEach(function(m){if(m.t==='hex'){m.list.forEach(function(q){var L=bands.filter(function(b){return b[0]==='OPL'})[0];if(L&&Math.abs(x-q)<0.05&&Math.abs(z-L[1])<9)v=250})}
      if(m.t==='schisis'){var L2=bands.filter(function(b){return b[0]===(m.layer||'ONL')})[0];if(L2&&zone(x,m)>0.5&&z>L2[1]&&z<L2[2]){v=(Math.abs(Math.sin(x*60))<0.25)?150:10}}
      if(m.t==='hyper'&&zone(x,m)>0){var L3=bands.filter(function(b){return(m.L||['RNFL','GCL','IPL','INL']).indexOf(b[0])>=0});L3.forEach(function(b){if(z>=b[1]&&z<b[2])v=Math.min(250,v+(m.v||90)*zone(x,m))})}});
     if(c.pseudo&&z>photoBot-10)v=Math.max(v,60)}
    else if(z<photoBot){v=REF.vit}
    else if(z<rpeTop){v=REF.vit;var acc=photoBot;for(var j=sub.length-1;j>=0;j--){}if(sub.some(function(s){return s[0]==='srf'}))v=10;sub.forEach(function(s){if(s[0]==='shrm'&&z>rpeTop-s[1])v=s[2]||190;if(s[0]==='vit'&&z>rpeTop-s[1])v=s[2]||200})}
    else if(z<bm-th.RPE+0.01&&ped>0&&z<rpeTop+th.RPE){v=REF.RPE*(1-0.9*rpeLoss)}
    else if(z<bm-th.RPE){v=pedC}
    else if(z<bm){v=REF.RPE*(1-0.9*rpeLoss);if(c.dls&&ped>0)v=REF.RPE}
    else if(z<bm+choT){var t=(z-bm)/choT;v=REF.cho*(1-0.25*t)+(rpeLoss*110*(1-t));for(var q=0;q<VES.length;q++){var e=VES[q];if(Math.pow((x-e[0])/e[2],2)+Math.pow((t-e[1])/e[3],2)<1){v=28;break}}}
    else v=clamp(150-(z-bm-choT)*0.6,25,150);
    /* ped content when elevated */
    if(ped>0&&z>=rpeTop&&z<rpeTop+th.RPE)v=REF.RPE*(1-0.9*rpeLoss);
    if(ped>0&&z>=rpeTop+th.RPE&&z<bm-0.01)v=c.dls&&z>bm-12?220:pedC;
    /* shadow artefacts */
    M.forEach(function(m){if(m.t==='shadow'&&Math.abs(x-m.x)<m.w&&z>(m.from||0))v*=0.25});
    if(z>bm&&ped>0&&pedC>140)v*=0.85;
    var n=v*(0.55+0.9*r())+(r()-0.5)*14;if(r()<0.004)n+=80;
    var k=(py*W+px)*4,g=clamp(Math.round(n),0,255);d[k]=d[k+1]=d[k+2]=g;d[k+3]=255}}
  ctx.putImageData(img,0,0);
  /* light blur for realism */
  var cv2=document.createElement('canvas');cv2.width=W;cv2.height=H;var c2=cv2.getContext('2d');c2.filter='blur(0.8px)';c2.drawImage(cv,0,0);return cv2}
 /* ---------- drawing helpers ---------- */
 function txt(ctx,s,x,y,o){o=o||{};ctx.font=(o.b?'bold ':'')+(o.s||12)+'px Arial';ctx.fillStyle=o.c||'#111';ctx.textAlign=o.a||'left';ctx.fillText(s,x,y)}
 function fundus(ctx,X,Y,S,c,mode){ctx.save();ctx.beginPath();ctx.rect(X,Y,S,S);ctx.clip();var g=ctx.createRadialGradient(X+S/2,Y+S/2,S*0.1,X+S/2,Y+S/2,S*0.7);g.addColorStop(0,'#555');g.addColorStop(1,'#1c1c1c');ctx.fillStyle=g;ctx.fillRect(X,Y,S,S);
  var nas=(c.eye==='L'?-1:1),dx=X+S/2+nas*S*(mode==='disc'?0:0.33),dy=Y+S/2,fx=X+S/2-(mode==='disc'?nas*S*0.33:0),fy=Y+S/2;
  ctx.strokeStyle='rgba(20,20,20,.9)';ctx.lineWidth=2.4;[[-1,1],[1,1],[-1,-1],[1,-1]].forEach(function(q){ctx.beginPath();ctx.moveTo(dx,dy);ctx.bezierCurveTo(dx-nas*S*0.15,dy+q[1]*S*0.3,fx-nas*S*0.05,fy+q[1]*S*0.32,fx-nas*S*0.45,fy+q[1]*S*0.16);ctx.stroke()});
  ctx.lineWidth=1.2;ctx.strokeStyle='rgba(30,30,30,.8)';for(var i=0;i<6;i++){ctx.beginPath();ctx.moveTo(dx,dy);ctx.lineTo(dx+nas*S*0.25*Math.cos(i),dy+S*0.25*Math.sin(i*1.7));ctx.stroke()}
  if(c.ppa){ctx.fillStyle='#d9d9d9';ctx.beginPath();ctx.ellipse(dx-nas*S*0.045,dy,S*0.085,S*0.1,0,0,7);ctx.fill()}var tq=c.tiltDisc?0.6:1;ctx.fillStyle='#bdbdbd';ctx.beginPath();ctx.ellipse(dx,dy,S*0.07*tq,S*0.085,c.tiltDisc?nas*0.35:0,0,7);ctx.fill();ctx.fillStyle='#e8e8e8';ctx.beginPath();ctx.ellipse(dx,dy,S*0.07*(c.cd||0.4),S*0.085*(c.cdv||c.cd||0.4),0,0,7);ctx.fill();
  ctx.fillStyle='rgba(0,0,0,.35)';ctx.beginPath();ctx.arc(fx,fy,S*0.06,0,7);ctx.fill();
  (c.slo||[]).forEach(function(s){ctx.fillStyle=s.col||'rgba(230,230,200,.8)';for(var i=0;i<(s.n||12);i++){var a=i*2.399,rr=S*(s.r||0.1)*Math.sqrt((i+0.5)/(s.n||12));ctx.beginPath();ctx.arc(fx+(s.dx||0)*S+rr*Math.cos(a),fy+(s.dy||0)*S+rr*Math.sin(a),s.sz||2,0,7);ctx.fill()}});
  ctx.restore();return{dx:dx,dy:dy,fx:fx,fy:fy}}
 function heat(t){var s=[[150,'#1d2b8f'],[200,'#2f6fd6'],[240,'#2fb0c8'],[270,'#2ea84c'],[300,'#d7d72a'],[340,'#f08a24'],[400,'#e0321f'],[500,'#ffffff']];for(var i=1;i<s.length;i++)if(t<=s[i][0]){var a=s[i-1],b=s[i],f=(t-a[0])/(b[0]-a[0]);return mix(a[1],b[1],f)}return'#fff'}
 function mix(a,b,f){f=clamp(f,0,1);var p=function(h,i){return parseInt(h.substr(1+2*i,2),16)};return'rgb('+[0,1,2].map(function(i){return Math.round(p(a,i)+(p(b,i)-p(a,i))*f)}).join(',')+')'}
 var NORM={C:270,IS:335,IN:340,II:330,IT:320,OS:290,ON:310,OI:285,OT:275},SD={C:20,IS:16,IN:16,II:16,IT:15,OS:14,ON:14,OI:14,OT:13};
 function flag(k,v){var z=(v-NORM[k])/SD[k];return z<-2.33||z>2.33?'#f2b8b2':(z<-1.64||z>1.64?'#f7e38a':'#bfe5c2')}
 function macula(c){var W=760,H=560,cv=document.createElement('canvas');cv.width=W*2;cv.height=H*2;var ctx=cv.getContext('2d');ctx.scale(2,2);ctx.fillStyle='#fff';ctx.fillRect(0,0,W,H);
  txt(ctx,'Macular cube / line scan · SIMULATED TEACHING REPORT',14,22,{b:1,s:13});txt(ctx,'Eye: '+(c.eye==='L'?'OS (left eye)':'OD (right eye)')+'   Age: '+(c.age||60)+'   Scan: horizontal line through the fovea, 6 mm   Signal strength: '+(c.ss||'8/10'),14,40);
  var P=fundus(ctx,14,56,220,c,'mac');ctx.strokeStyle='#39d353';ctx.lineWidth=2;ctx.beginPath();var fo=(c.fovea||0)*220/6*(c.eye==='L'?-1:1);ctx.moveTo(14+10,P.fy);ctx.lineTo(14+210,P.fy);ctx.stroke();ctx.fillStyle='#39d353';ctx.beginPath();ctx.moveTo(14+210,P.fy);ctx.lineTo(14+200,P.fy-5);ctx.lineTo(14+200,P.fy+5);ctx.fill();
  txt(ctx,'Infrared fundus image with scan line',14,292,{s:10.5,c:'#444'});
  var b=bscan(c,500,240);if(c.eye==='L'){ctx.save();ctx.translate(248+500,56);ctx.scale(-1,1);ctx.drawImage(b,0,0);ctx.restore()}else ctx.drawImage(b,248,56);
  txt(ctx,c.eye==='L'?'N':'T',254,72,{c:'#fff',b:1});txt(ctx,c.eye==='L'?'T':'N',738,72,{c:'#fff',b:1,a:'right'});ctx.fillStyle='#fff';ctx.fillRect(728,250,2,63);txt(ctx,'200 µm',724,290,{s:9.5,c:'#fff',a:'right'});
  /* thickness map */
  var S=c.sect||{},V={};Object.keys(NORM).forEach(function(k){V[k]=Math.round(NORM[k]+(S[k]||0))});
  var cx=130,cy=420,R=[16,48,105];/* ETDRS 1,3,6 mm scaled */
  for(var yy=-R[2];yy<=R[2];yy+=2)for(var xx=-R[2];xx<=R[2];xx+=2){var rr=Math.sqrt(xx*xx+yy*yy);if(rr>R[2])continue;var ang=Math.atan2(-yy,xx*(c.eye==='L'?-1:1)),q=Math.abs(ang)<Math.PI/4?'N':Math.abs(ang)>3*Math.PI/4?'T':ang>0?'S':'I';
   var kk=rr<R[0]?'C':(rr<R[1]?'I':'O')+q,v=kk==='C'?V.C:V[kk];var rad=rr/R[2]*3;var pitv=V.C+(rr<R[0]?(-30*(1-rr/R[0])):0);ctx.fillStyle=heat(kk==='C'?pitv:v+(rr<R[1]?0:-(rad-1.5)*6));ctx.fillRect(cx+xx-1,cy+yy-1,2.2,2.2)}
  ctx.strokeStyle='#000';ctx.lineWidth=0.8;R.forEach(function(r){ctx.beginPath();ctx.arc(cx,cy,r,0,7);ctx.stroke()});[1,3,5,7].forEach(function(i){var a=i*Math.PI/4;ctx.beginPath();ctx.moveTo(cx+R[0]*Math.cos(a),cy+R[0]*Math.sin(a));ctx.lineTo(cx+R[2]*Math.cos(a),cy+R[2]*Math.sin(a));ctx.stroke()});
  txt(ctx,'Retinal thickness map (ILM–RPE)',cx,308,{a:'center',s:11,b:1});
  /* ETDRS grid numbers */
  var gx=390,gy=420;ctx.lineWidth=1;var pos={C:[0,0],IS:[0,-32],II:[0,32],IN:[32,0],IT:[-32,0],OS:[0,-74],OI:[0,74],ON:[74,0],OT:[-74,0]};if(c.eye==='L'){pos.IN=[-32,0];pos.IT=[32,0];pos.ON=[-74,0];pos.OT=[74,0]}
  [100,52,18].forEach(function(r){ctx.beginPath();ctx.arc(gx,gy,r,0,7);ctx.stroke()});[1,3,5,7].forEach(function(i){var a=i*Math.PI/4;ctx.beginPath();ctx.moveTo(gx+18*Math.cos(a),gy+18*Math.sin(a));ctx.lineTo(gx+100*Math.cos(a),gy+100*Math.sin(a));ctx.stroke()});
  Object.keys(pos).forEach(function(k){var p=pos[k];ctx.fillStyle=flag(k,V[k]);ctx.fillRect(gx+p[0]-17,gy+p[1]-9,34,17);txt(ctx,String(V[k]),gx+p[0],gy+p[1]+5,{a:'center',s:12,b:k==='C'})});
  txt(ctx,'ETDRS grid thickness (µm)',gx,308,{a:'center',s:11,b:1});
  var vol=0;Object.keys(V).forEach(function(k){vol+=V[k]});var cst=V.C;
  txt(ctx,'Central subfield thickness: '+cst+' µm',520,360,{b:1});txt(ctx,'Cube volume: '+(vol/9*0.0283).toFixed(1)+' mm³',520,380);txt(ctx,'Cube average thickness: '+Math.round(vol/9)+' µm',520,400);
  [['#bfe5c2','Within normal (5–95%)'],['#f7e38a','Borderline (1–5% or 95–99%)'],['#f2b8b2','Outside normal (<1% or >99%)']].forEach(function(l,i){ctx.fillStyle=l[0];ctx.fillRect(520,428+i*20,14,12);txt(ctx,l[1],540,438+i*20,{s:11})});
  txt(ctx,'RPC Rounds Diagnostics Lab · simulation for teaching',W-14,H-10,{a:'right',s:10,c:'#555'});
  return cv}
 /* ---------- RNFL / disc report ---------- */
 function tsnit(a){/* a in degrees 0..360 along T-S-N-I-T, returns normal µm */return 70+60*G(a,90,32)+62*G(a,270,32)+8*G(a,180,40)}
 function rnflVal(a,c){var sh=c.shiftT||0,aw=a<=180?a+sh*Math.sin(Math.PI*a/180):a-sh*Math.sin(Math.PI*(a-180)/180),v=tsnit(aw),M=c.rnfl||{};
  if(M.diffuse)v*=M.diffuse;if(M.sup)v-=M.sup*G(a,M.supAt||80,M.w||28);if(M.inf)v-=M.inf*G(a,M.infAt||280,M.w||28);if(M.temp)v-=M.temp*(G(a,0,25)+G(a,360,25));if(M.nasal)v-=M.nasal*G(a,180,30);if(M.swell)v+=M.swell*(0.7+0.3*Math.sin(a*Math.PI/180*2+1));
  if(M.spike)M.spike.forEach(function(s){if(Math.abs(a-s[0])<s[1])v+=s[2]});return Math.max(M.floor||35,v)}
 function rnfl(c){var W=760,H=520,cv=document.createElement('canvas');cv.width=W*2;cv.height=H*2;var ctx=cv.getContext('2d');ctx.scale(2,2);ctx.fillStyle='#fff';ctx.fillRect(0,0,W,H);
  txt(ctx,'Optic disc cube / RNFL circle scan · SIMULATED TEACHING REPORT',14,22,{b:1,s:13});txt(ctx,'Eye: '+(c.eye==='L'?'OS (left eye)':'OD (right eye)')+'   Age: '+(c.age||60)+'   Signal strength: '+(c.ss||'8/10')+'   Scan circle diameter 3.46 mm',14,40);
  var P=fundus(ctx,14,56,200,c,'disc');ctx.strokeStyle='#39d353';ctx.lineWidth=1.6;ctx.beginPath();ctx.arc(P.dx,P.dy,40,0,7);ctx.stroke();
  /* TSNIT graph */
  var gx=250,gy=70,gw=480,gh=170,Y=function(v){return gy+gh-v/200*gh};var r=rng(c.seed||3);
  function band(lo,hi,col){ctx.fillStyle=col;ctx.beginPath();for(var a=0;a<=360;a+=4)ctx.lineTo(gx+a/360*gw,Y(tsnit(a)*hi));for(var a2=360;a2>=0;a2-=4)ctx.lineTo(gx+a2/360*gw,Y(tsnit(a2)*lo));ctx.closePath();ctx.fill()}
  ctx.fillStyle='#fff';ctx.fillRect(gx,gy,gw,gh);band(0,0.72,'#f2b8b2');band(0.72,0.82,'#f7e38a');band(0.82,1.22,'#bfe5c2');ctx.strokeStyle='#888';ctx.lineWidth=.8;ctx.strokeRect(gx,gy,gw,gh);
  /* redraw upper white */
  ctx.strokeStyle='#999';ctx.lineWidth=.5;for(var t=0;t<=200;t+=50){ctx.beginPath();ctx.moveTo(gx,Y(t));ctx.lineTo(gx+gw,Y(t));ctx.stroke();txt(ctx,String(t),gx-6,Y(t)+4,{a:'right',s:9.5,c:'#555'})}
  ctx.strokeStyle='#000';ctx.lineWidth=1.8;ctx.beginPath();var vals=[];for(var a=0;a<=360;a+=3){var v=rnflVal(a,c)+(r()-0.5)*6;vals.push([a,v]);ctx.lineTo(gx+a/360*gw,Y(v))}ctx.stroke();
  ['T','S','N','I','T'].forEach(function(l,i){txt(ctx,l,gx+i*gw/4,gy+gh+14,{a:'center',b:1})});txt(ctx,'RNFL thickness (µm) along the circle: temporal – superior – nasal – inferior – temporal',gx,gy-6,{s:10.5,c:'#444'});
  /* quadrants & clock hours */
  function avg(a0,a1){var s=0,n=0;vals.forEach(function(q){var a=q[0];if((a0<a1&&a>=a0&&a<a1)||(a0>a1&&(a>=a0||a<a1))){s+=q[1];n++}});return Math.round(s/n)}
  function nm(a0,a1){var s=0,n=0;for(var a=0;a<360;a+=3)if((a0<a1&&a>=a0&&a<a1)||(a0>a1&&(a>=a0||a<a1))){s+=tsnit(a);n++}return s/n}
  function col(v,n){return v<n*0.72?'#f2b8b2':v<n*0.82?'#f7e38a':v>n*1.3?'#fff':'#bfe5c2'}
  var Q=[['T',315,45],['S',45,135],['N',135,225],['I',225,315]],cx=120,cy=390,R1=70;
  Q.forEach(function(q,i){var v=avg(q[1],q[2]),n=nm(q[1],q[2]);var ang={T:Math.PI,S:-Math.PI/2,N:0,I:Math.PI/2}[q[0]];if(c.eye==='L'&&(q[0]==='T'||q[0]==='N'))ang=Math.PI-ang;
   ctx.fillStyle=col(v,n);ctx.beginPath();ctx.moveTo(cx,cy);ctx.arc(cx,cy,R1,ang-Math.PI/4,ang+Math.PI/4);ctx.closePath();ctx.fill();ctx.strokeStyle='#666';ctx.stroke();txt(ctx,String(v),cx+Math.cos(ang)*R1*0.6,cy+Math.sin(ang)*R1*0.6+4,{a:'center',b:1});txt(ctx,q[0],cx+Math.cos(ang)*(R1+10),cy+Math.sin(ang)*(R1+10)+4,{a:'center',s:10})});
  txt(ctx,'Quadrants (µm)',cx,300,{a:'center',b:1,s:11});
  var cx2=330;for(var h=0;h<12;h++){var ang2=-Math.PI/2+h*Math.PI/6,aa=c.eye==='L'?((90-h*30)%360+360)%360:(90+h*30)%360,v2=avg((aa+345)%360,(aa+15)%360),n2=nm((aa+345)%360,(aa+15)%360);
   ctx.fillStyle=col(v2,n2);ctx.beginPath();ctx.moveTo(cx2,cy);ctx.arc(cx2,cy,R1,ang2-Math.PI/12,ang2+Math.PI/12);ctx.closePath();ctx.fill();ctx.strokeStyle='#666';ctx.stroke();txt(ctx,String(v2),cx2+Math.cos(ang2)*R1*0.72,cy+Math.sin(ang2)*R1*0.72+4,{a:'center',s:9.5})}
  txt(ctx,'Clock hours (µm)',cx2,300,{a:'center',b:1,s:11});
  var all=Math.round(vals.reduce(function(s,q){return s+q[1]},0)/vals.length),nAll=nm(0,360);
  var D=c.disc||{};txt(ctx,'Average RNFL thickness: '+all+' µm',470,330,{b:1});ctx.fillStyle=col(all,nAll);ctx.fillRect(700,319,22,14);
  [['Rim area',(D.rim||1.25).toFixed(2)+' mm²'],['Disc area',(D.disc||1.9).toFixed(2)+' mm²'],['Average C/D ratio',(D.cd||0.45).toFixed(2)],['Vertical C/D ratio',(D.vcd||D.cd||0.42).toFixed(2)],['Cup volume',(D.cv||0.12).toFixed(2)+' mm³'],['RNFL symmetry (with fellow eye)',D.sym||'88%']].forEach(function(l,i){txt(ctx,l[0],470,356+i*20);txt(ctx,l[1],740,356+i*20,{a:'right'})});
  [['#bfe5c2','Within normal'],['#f7e38a','Borderline (<5%)'],['#f2b8b2','Outside normal (<1%)']].forEach(function(l,i){ctx.fillStyle=l[0];ctx.fillRect(452+i*100,488,12,10);txt(ctx,l[1],467+i*100,497,{s:9})});
  txt(ctx,'RPC Rounds Diagnostics Lab · simulation for teaching',W-14,H-6,{a:'right',s:10,c:'#555'});return cv}
 /* ---------- ganglion cell report ---------- */
 var GN=[['ST',84],['S',84],['SN',85],['IN',84],['I',82],['IT',83]];
 function gcl(c){var W=760,H=330,cv=document.createElement('canvas');cv.width=W*2;cv.height=H*2;var ctx=cv.getContext('2d');ctx.scale(2,2);ctx.fillStyle='#fff';ctx.fillRect(0,0,W,H);
  txt(ctx,'Ganglion cell + IPL analysis · SIMULATED TEACHING REPORT',14,22,{b:1,s:13});txt(ctx,'Eye: '+(c.eye==='L'?'OS (left eye)':'OD (right eye)')+'   Age: '+(c.age||60)+'   Elliptical annulus 1–4 mm around the fovea',14,40);
  var S=c.gc||{},cx=150,cy=185,rx=120,ry=100,mir=c.eye==='L'?-1:1;
  for(var y=-ry;y<=ry;y+=2)for(var x=-rx;x<=rx;x+=2){var e=Math.sqrt(x*x/(rx*rx)+y*y/(ry*ry));if(e>1)continue;var inner=e<0.28;var ang=Math.atan2(-y,x*mir)*180/Math.PI;/* nasal = 0 */
   var sec=ang>=0?(ang<60?'SN':ang<120?'S':'ST'):(ang>-60?'IN':ang>-120?'I':'IT');var dv=S[sec]||0;
   var v=inner?40+e/0.28*30:84+dv-(e-0.6)*12;if(S.vert&&((S.vert==='nasal'&&x*mir>0)||(S.vert==='temporal'&&x*mir<0)))v-=S.vdb||22;ctx.fillStyle=heat(v*3.2);ctx.fillRect(cx+x-1,cy+y-1,2.3,2.3)}
  ctx.strokeStyle='#000';ctx.beginPath();ctx.ellipse(cx,cy,rx,ry,0,0,7);ctx.stroke();ctx.beginPath();ctx.ellipse(cx,cy,rx*0.28,ry*0.28,0,0,7);ctx.stroke();
  txt(ctx,'GCL+IPL thickness map',cx,72,{a:'center',b:1,s:11});
  /* sector chart */
  var sx=440,sy=185,R=80;GN.forEach(function(g,i){var a0=[-150,-90,-30,30,90,150][i];var ang=a0*Math.PI/180;if(mir<0)ang=Math.PI-ang;var v=Math.round(g[1]+(S[g[0]]||0)-((S.vert==='nasal'&&['SN','IN'].indexOf(g[0])>=0)||(S.vert==='temporal'&&['ST','IT'].indexOf(g[0])>=0)?(S.vdb||22)*0.9:0));
   var ccol=v<g[1]-14?'#f2b8b2':v<g[1]-9?'#f7e38a':'#bfe5c2';ctx.fillStyle=ccol;ctx.beginPath();ctx.moveTo(sx,sy);ctx.arc(sx,sy,R,ang-Math.PI/6,ang+Math.PI/6);ctx.closePath();ctx.fill();ctx.strokeStyle='#666';ctx.stroke();ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(sx,sy,R*0.3,0,7);ctx.fill();
   txt(ctx,String(v),sx+Math.cos(ang)*R*0.65,sy+Math.sin(ang)*R*0.65+4,{a:'center',b:1});txt(ctx,g[0],sx+Math.cos(ang)*(R+14),sy+Math.sin(ang)*(R+14)+4,{a:'center',s:10})});
  txt(ctx,'Sectors (µm)',sx,72,{a:'center',b:1,s:11});
  var vals=GN.map(function(g){return g[1]+(S[g[0]]||0)-((S.vert==='nasal'&&['SN','IN'].indexOf(g[0])>=0)||(S.vert==='temporal'&&['ST','IT'].indexOf(g[0])>=0)?(S.vdb||22)*0.9:0)});
  txt(ctx,'Average GCL+IPL: '+Math.round(vals.reduce(function(a,b){return a+b},0)/6)+' µm',570,140,{b:1});txt(ctx,'Minimum GCL+IPL: '+Math.round(Math.min.apply(null,vals)-4)+' µm',570,162);
  txt(ctx,'Nasal and temporal are relative',570,200,{s:10,c:'#555'});txt(ctx,'to the fovea of this eye.',570,214,{s:10,c:'#555'});
  txt(ctx,'RPC Rounds Diagnostics Lab · simulation for teaching',W-14,H-8,{a:'right',s:10,c:'#555'});return cv}
 function render(f){var cv=f.kind==='rnfl'?rnfl(f):f.kind==='gcl'?gcl(f):macula(f);return'<img src="'+cv.toDataURL('image/png')+'" alt="Simulated OCT report" style="display:block;width:100%;min-width:640px;height:auto">'}
 return{render:render};
})();
