/* RPC Rounds Diagnostics Lab: simulated static perimetry printout (24-2 / 10-2).
   Teaching simulation only. Values come from a simple model of normal sensitivity plus defect patterns,
   with seeded noise so each case always looks the same. Not a medical device, not for clinical use. */
var DXP=(function(){
 function rng(seed){var s=seed>>>0||1;return function(){s=(s*1664525+1013904223)>>>0;return s/4294967296}}
 function gauss(r){var u=r()||1e-9,v=r();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v)}
 function grid(test){var P=[];if(test==='10-2'){for(var y=9;y>=-9;y-=2)for(var x=-9;x<=9;x+=2)if(x*x+y*y<=100)P.push([x,y]);return P}
  var rows={21:[-9,-3,3,9],15:[-15,-9,-3,3,9,15],9:[-21,-15,-9,-3,3,9,15,21],3:[-27,-21,-15,-9,-3,3,9,15,21]};
  [21,15,9,3,-3,-9,-15,-21].forEach(function(y){rows[Math.abs(y)].forEach(function(x){P.push([x,y])})});return P}
 /* coordinates are stored for a RIGHT eye: negative x = nasal field. Left eyes are mirrored at draw time. */
 function isBS(x,y,test){return test!=='10-2'&&x===15&&Math.abs(y)===3}
 function normal(x,y,age){var e=Math.sqrt(x*x+y*y);return 33.2-0.19*e-0.065*(age-50)-(y>0?0.035*y:0)}
 function sd(x,y){var e=Math.sqrt(x*x+y*y);return 1.3+0.06*e}
 /* ---- defect library: each returns dB loss at (x,y) [right-eye coords] ---- */
 function arcRegion(x,y,sup){ // nerve-fibre-shaped region in one hemifield, sparing temporal wedge
  if(sup?y<=0:y>=0)return 0;var ay=Math.abs(y),e=Math.sqrt(x*x+y*y);if(x>=21&&ay<=9)return 0;if(e<6)return 0.3;
  if(x>9&&ay<=3)return 0;return 1}
 var D={
  depress:function(p){return function(){return p.db}},
  nasalStep:function(p){return function(x,y){var s=p.sup?y>0:y<0;if(!s)return 0;var ay=Math.abs(y);if(x<=-15&&ay<=9)return p.db*(x<=-21?1:0.7);if(x<=-9&&ay<=3)return p.db*0.4;return 0}},
  arcuate:function(p){return function(x,y){var r=arcRegion(x,y,p.sup);if(!r)return 0;var e=Math.sqrt(x*x+y*y),band=e>=(p.inner||9)&&e<=(p.outer||26);
   var nasal=x<0?1:(x<=9?0.85:0.75);return band?p.db*r*nasal:(e<(p.inner||9)&&p.para?p.db*0.6:0)}},
  paracentral:function(p){return function(x,y){var s=p.sup?y>0:y<0;if(!s)return 0;var d=Math.sqrt(Math.pow(x-(p.cx||-4),2)+Math.pow(y-(p.sup?1:-1)*(p.cy||4),2));return d<=(p.r||5)?p.db:(d<=(p.r||5)+3?p.db*0.4:0)}},
  hemi:function(p){return function(x,y){var s=p.sup?y>0:y<0;if(!s)return 0;return p.db*(Math.sqrt(x*x+y*y)<=(p.spare||0)?0:1)}},
  tunnel:function(p){return function(x,y){var e=Math.sqrt(x*x+y*y);return e>(p.r||10)?Math.min(p.db,(e-(p.r||10))*p.slope+p.db*0.5):0}},
  ring:function(p){return function(x,y){var e=Math.sqrt(x*x+y*y);return(e>=p.r1&&e<=p.r2)?p.db:0}},
  central:function(p){return function(x,y){var d=Math.sqrt(Math.pow(x-(p.cx||0),2)+Math.pow(y-(p.cy||0),2));return d<=p.r?p.db:(d<=p.r+3?p.db*0.4:0)}},
  cecocentral:function(p){return function(x,y){if(Math.abs(y)>p.h)return 0;return(x>=-4&&x<=17)?p.db:0}},
  blindspot:function(p){return function(x,y){var d=Math.sqrt(Math.pow(x-15,2)+y*y);return d<=p.r?p.db:0}},
  /* neuro: field side in visual-field terms. temporalR/L = temporal hemifield of right/left eye. side 'L' = left half of each eye's field */
  vhalf:function(p){return function(x,y,eye){var fx=eye==='L'?-x:x; /* fx: screen x (left negative) */
   var side=p.side==='L'?fx<0:fx>0;if(!side)return 0;if(p.quad==='sup'&&y<0)return 0;if(p.quad==='inf'&&y>0)return 0;
   if(p.spare&&Math.sqrt(x*x+y*y)<=p.spare)return 0;var g=p.incong&&eye===p.incongEye?p.incong:1;return p.db*g}},
  bitemp:function(p){return function(x,y,eye){var fx=eye==='L'?-x:x,temporal=eye==='L'?fx<0:fx>0;if(!temporal)return 0;if(p.quad==='sup'&&y<0)return 0;return p.db*(p.quad==='supdense'&&y<0?0.45:1)}},
  junction:function(p){return function(x,y,eye){if(eye===p.eye){var e=Math.sqrt(x*x+y*y);return e<=p.r?p.db:p.db*0.5}var fx=eye==='L'?-x:x,temporal=eye==='L'?fx<0:fx>0;return(temporal&&y>0)?p.db2:0}},
  lid:function(p){return function(x,y){return y>=(p.y||15)?p.db*(y>=21?1:0.7):0}},
  rim:function(p){return function(x,y){var e=Math.sqrt(x*x+y*y);return e>=(p.r||24)?p.db:0}},
  region:function(p){return function(x,y){if(p.half==='sup'&&y<0)return 0;if(p.half==='inf'&&y>0)return 0;var e=Math.sqrt(x*x+y*y);
   if(p.emin!=null&&e<p.emin)return 0;if(p.emax!=null&&e>p.emax)return 0;if(p.xmin!=null&&x<p.xmin)return 0;if(p.xmax!=null&&x>p.xmax)return 0;
   if(p.ymin!=null&&y<p.ymin)return 0;if(p.ymax!=null&&y>p.ymax)return 0;return p.db}},
  scatter:function(p){return function(x,y){var h=Math.abs((x*73856093)^(y*19349663)^(p.k||5))%(p.mod||5);return h===0?p.db:(h===1?p.db*0.4:0)}},
  spots:function(p){return function(x,y){for(var i=0;i<p.pts.length;i++)if(p.pts[i][0]===x&&p.pts[i][1]===y)return p.pts[i][2];return 0}}
 };
 function compute(c){
  var test=c.test||'24-2',P=grid(test),r=rng(c.seed||7),age=c.age||60,fns=(c.defects||[]).map(function(d){return D[d.t](d)}),eye=c.eye||'R';
  var pts=P.map(function(p){var x=p[0],y=p[1],n=normal(x,y,age),loss=0;fns.forEach(function(f){loss+=f(x,y,eye)||0});
   var noise=gauss(r)*(c.noise||1.45)*(0.75+loss/12);if(c.fp)noise+=r()<c.fp/40?6+r()*6:0;var v=n-loss+noise+(c.shift||0);
   if(isBS(x,y,test))v=c.bsNormal===false?v:Math.max(0,Math.round(r()*3));return{x:x,y:y,n:n,v:Math.max(0,Math.min(40,Math.round(v))),bs:isBS(x,y,test)}});
  var use=pts.filter(function(p){return!p.bs});
  use.forEach(function(p){p.td=p.v-Math.round(p.n)});
  var sorted=use.map(function(p){return p.td}).sort(function(a,b){return b-a}),k=Math.max(0,Math.round(use.length*0.15)-1),ref=sorted[k];
  /* General height: 85th percentile, but never below 0 adjustment when field is supernormal */
  use.forEach(function(p){p.pd=p.td-ref;var s=sd(p.x,p.y);p.ptd=prob(p.td/s);p.ppd=prob(p.pd/s)});
  var W=0,S=0;use.forEach(function(p){var w=1/Math.pow(sd(p.x,p.y),2);W+=w;S+=w*p.td});var MD=S/W;
  var V=0;use.forEach(function(p){var w=1/Math.pow(sd(p.x,p.y),2);V+=w*Math.pow(p.td-MD,2)});var PSD=Math.sqrt(V/W);
  /* VFI-like index */
  var vw=0,vs=0;use.forEach(function(p){var e=Math.sqrt(p.x*p.x+p.y*p.y),w=e<4.5?3.3:e<10?1.3:e<16?0.8:e<22?0.57:0.43,pc;
   if(MD>-20?p.ppd===0:p.ptd===0)pc=100;else pc=Math.max(0,100-Math.abs(p.td)/Math.max(1,p.n)*100);vw+=w;vs+=w*pc});
  var VFI=Math.round(vs/vw);
  var fovea=Math.round(normal(0,0,age)-(c.foveaLoss||0)+gauss(r)*0.8);
  return{pts:pts,MD:MD,PSD:PSD,VFI:VFI,pMD:pIdx(-MD,[2,2.6,3,3.7]),pPSD:pIdx(PSD,[2.1,2.5,2.9,3.5]),ght:ght(use,MD,c),fovea:Math.max(0,fovea),test:test,age:age,eye:eye};
 }
 function prob(z){return z<=-2.576?4:z<=-2.326?3:z<=-2.054?2:z<=-1.645?1:0}
 function pIdx(v,t){return v>=t[3]?4:v>=t[2]?3:v>=t[1]?2:v>=t[0]?1:0}
 function ght(use,MD,c){if(c.ght)return c.ght;if((c.fpPct||0)>=15)return'Abnormally high sensitivity';
  var Z=[[function(p){return Math.abs(p.y)<=9&&p.x>=-9&&p.x<=3}],[function(p){return p.x<=-15&&Math.abs(p.y)<=9}],[function(p){return Math.abs(p.y)>=9&&p.x<=-3&&p.x>=-15}],[function(p){return Math.abs(p.y)>=15&&p.x>=-3}],[function(p){return p.x>=9&&Math.abs(p.y)>=9}]];
  var mx=0,both=0;Z.forEach(function(z){var a=0,b=0;use.forEach(function(p){if(z[0](p)){if(p.y>0)a+=p.ppd;else b+=p.ppd}});mx=Math.max(mx,Math.abs(a-b));if(a>=12&&b>=12)both=1});
  if(mx>=6||both)return'Outside normal limits';if(mx>=4)return'Borderline';if(MD<-4)return'General reduction of sensitivity';return'Within normal limits'}
 /* ---- drawing ---- */
 var SYM=['', 'p5','p2','p1','p05'];
 function esc(t){return String(t).replace(/[&<>]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;'}[c]})}
 function svg(c,R,opt){opt=opt||{};var t=R.test,ten=t==='10-2',sc=ten?11:5.4,W=760,H=670,mir=R.eye==='L'?-1:1,eyeLbl=R.eye==='L'?'OS (left eye)':'OD (right eye)';
  function X(x){return x*mir}
  var o='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+W+' '+H+'" class="dxp-svg" role="img" aria-label="Simulated visual field printout"><defs>'
  +'<pattern id="pp5" width="4" height="4" patternUnits="userSpaceOnUse"><rect width="4" height="4" fill="#fff"/><circle cx="2" cy="2" r=".6" fill="#000"/></pattern>'
  +'<pattern id="pp2" width="3" height="3" patternUnits="userSpaceOnUse"><rect width="3" height="3" fill="#fff"/><circle cx="1.5" cy="1.5" r=".8" fill="#000"/></pattern>'
  +'<pattern id="pp1" width="3" height="3" patternUnits="userSpaceOnUse"><rect width="3" height="3" fill="#fff"/><rect width="1.5" height="1.5" fill="#000"/><rect x="1.5" y="1.5" width="1.5" height="1.5" fill="#000"/></pattern>'
  +'</defs><rect width="'+W+'" height="'+H+'" fill="#fff"/>'
  +'<style>.dxp-svg text{font-family:Arial,Helvetica,sans-serif;fill:#111}.dxp-t{font-size:12px}.dxp-s{font-size:10.5px}.dxp-h{font-size:13px;font-weight:700}.dxp-n{font-size:'+(ten?9:10.5)+'px}.dxp-g{font-size:9.5px;fill:#444}</style>';
  /* header */
  var rel=c.rel||{fl:'0/14',fp:2,fn:3};
  o+='<text x="16" y="22" class="dxp-h">Central '+t+' threshold test · SIMULATED TEACHING PRINTOUT</text>'
   +'<text x="16" y="40" class="dxp-t">Eye: '+eyeLbl+'   Age: '+R.age+'   Stimulus: III, white   Background: 31.5 asb   Strategy: SITA Standard</text>'
   +'<text x="16" y="56" class="dxp-t">Fixation losses: '+rel.fl+'   False POS errors: '+rel.fp+'%   False NEG errors: '+rel.fn+'%   Test duration: '+(rel.dur||'06:12')+'   Fovea: '+(c.foveaOff?'OFF':R.fovea+' dB')+'</text>'
   +'<text x="16" y="72" class="dxp-t">Pupil: '+(c.pupil||'4.0')+' mm   Visual acuity: '+(c.va||'6/6')+'   Rx: '+(c.rx||'+2.50 DS')+'</text>';
  /* plots */
  function frame(cx,cy,title){var r=ten?115:155,rv=ten?115:125;return'<text x="'+cx+'" y="'+(cy-(ten?122:142))+'" text-anchor="middle" class="dxp-s" font-weight="700">'+title+'</text><line x1="'+(cx-r)+'" y1="'+cy+'" x2="'+(cx+r)+'" y2="'+cy+'" stroke="#000" stroke-width=".8"/><line x1="'+cx+'" y1="'+(cy-rv)+'" x2="'+cx+'" y2="'+(cy+rv)+'" stroke="#000" stroke-width=".8"/>'}
  var cx1=200,cy1=250,cx2=560;
  /* numeric threshold */
  o+=frame(cx1,cy1,'Threshold (dB)');
  R.pts.forEach(function(p){var px=cx1+X(p.x)*sc,py=cy1-p.y*sc;o+='<text x="'+px+'" y="'+(py+4)+'" text-anchor="middle" class="dxp-n">'+(p.bs&&p.v<1?'&lt;0':p.v)+'</text>'});
  /* greyscale: interpolated like a real printout */
  var gs='',step=ten?1:3,lim=ten?10:28,pv=R.pts,gsc=ten?11:4.6;
  for(var gy=lim-step/2;gy>-lim;gy-=step)for(var gx=-lim+step/2;gx<lim;gx+=step){var ws=0,vs=0,near=99;
   pv.forEach(function(p){var d=Math.sqrt(Math.pow(p.x-gx,2)+Math.pow(p.y-gy,2));near=Math.min(near,d);if(d<(ten?2.9:8.5)){var w=1/Math.pow(d+0.6,2);ws+=w;vs+=w*p.v}});
   if(near>(ten?1.5:4.3)||!ws)continue;var v=vs/ws,g=v>=31?250:v>=26?220:v>=21?180:v>=16?140:v>=11?100:v>=6?65:v>=1?35:8,w=step*gsc;
   gs+='<rect x="'+(cx2+X(gx)*gsc-w/2)+'" y="'+(cy1-gy*gsc-w/2)+'" width="'+(w+.3)+'" height="'+(w+.3)+'" fill="rgb('+g+','+g+','+g+')"/>'}
  o+=gs+frame(cx2,cy1,'Greyscale');
  /* deviation plots */
  var cy3=500,sc2=ten?7:2.65,cxa=120,cxb=300,cxc=470,cxd=640;
  function dev(cx,key,title){var r=78,s='<text x="'+cx+'" y="'+(cy3-r-6)+'" text-anchor="middle" class="dxp-s" font-weight="700">'+title+'</text><line x1="'+(cx-r)+'" y1="'+cy3+'" x2="'+(cx+r)+'" y2="'+cy3+'" stroke="#000" stroke-width=".7"/><line x1="'+cx+'" y1="'+(cy3-r)+'" x2="'+cx+'" y2="'+(cy3+r)+'" stroke="#000" stroke-width=".7"/>';
   R.pts.forEach(function(p){if(p.bs)return;s+='<text x="'+(cx+X(p.x)*sc2)+'" y="'+(cy3-p.y*sc2+3.5)+'" text-anchor="middle" class="dxp-g" style="font-size:'+(ten?7:8)+'px">'+p[key]+'</text>'});return s}
  function probp(cx,key,title){var r=78,s='<text x="'+cx+'" y="'+(cy3-r-6)+'" text-anchor="middle" class="dxp-s" font-weight="700">'+title+'</text><line x1="'+(cx-r)+'" y1="'+cy3+'" x2="'+(cx+r)+'" y2="'+cy3+'" stroke="#000" stroke-width=".7"/><line x1="'+cx+'" y1="'+(cy3-r)+'" x2="'+cx+'" y2="'+(cy3+r)+'" stroke="#000" stroke-width=".7"/>';
   var z=ten?5:6.5;R.pts.forEach(function(p){if(p.bs)return;var px=cx+X(p.x)*sc2,py=cy3-p.y*sc2,k=p[key];
    if(k===0)s+='<circle cx="'+px+'" cy="'+py+'" r="1" fill="#000"/>';else s+='<rect x="'+(px-z/2)+'" y="'+(py-z/2)+'" width="'+z+'" height="'+z+'" fill="'+(k===4?'#000':'url(#pp'+(k===1?'5':k===2?'2':'1')+')')+'" stroke="#000" stroke-width=".4"/>'});return s}
  o+=dev(cxa,'td','Total deviation')+dev(cxb,'pd','Pattern deviation')+probp(cxc,'ptd','Total deviation probability')+probp(cxd,'ppd','Pattern deviation probability');
  /* legend + indices */
  var ly=608;o+='<text x="16" y="'+ly+'" class="dxp-s">Probability:</text>';[['p5','&lt; 5%'],['p2','&lt; 2%'],['p1','&lt; 1%'],['p05','&lt; 0.5%']].forEach(function(l,i){var x=90+i*72;o+='<rect x="'+x+'" y="'+(ly-9)+'" width="9" height="9" fill="'+(l[0]==='p05'?'#000':'url(#p'+l[0]+')')+'" stroke="#000" stroke-width=".4"/><text x="'+(x+13)+'" y="'+ly+'" class="dxp-s">'+l[1]+'</text>'});
  function pt(p){return p?'  P &lt; '+['','5','2','1','0.5'][p]+'%':''}
  o+='<text x="16" y="'+(ly+24)+'" class="dxp-t"><tspan font-weight="700">GHT:</tspan> '+esc(R.ght)+'</text>'
   +'<text x="16" y="'+(ly+42)+'" class="dxp-t"><tspan font-weight="700">VFI:</tspan> '+R.VFI+'%   <tspan font-weight="700">MD:</tspan> '+R.MD.toFixed(2)+' dB'+pt(R.pMD)+'   <tspan font-weight="700">PSD:</tspan> '+R.PSD.toFixed(2)+' dB'+pt(R.pPSD)+'</text>'
   +'<text x="744" y="'+(ly+42)+'" text-anchor="end" class="dxp-g">RPC Rounds Diagnostics Lab · simulation for teaching</text>';
  return o+'</svg>';
 }
 function render(c){var R=compute(c);return{svg:svg(c,R),R:R}}
 return{render:render,compute:compute};
})();
if(typeof module!=='undefined')module.exports=DXP;
