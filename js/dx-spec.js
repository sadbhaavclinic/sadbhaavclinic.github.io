/* RPC Rounds Diagnostics Lab: simulated specular microscopy (endothelial mosaic + analysis). Teaching simulation only.
   c: {eye, age, cd (cells/mm2), cv (%), hex (%), cct, gutt (0..1), guttSize, dark (dark bodies), vesicle, ice, blur, note, rows} */
var DXS=(function(){
 function rng(seed){var s=seed>>>0||1;return function(){s=(s*1664525+1013904223)>>>0;return s/4294967296}}
 function mosaic(c,W,H){var r=rng(c.seed||5),cd=c.cd||2600,area=1e6/cd,umpp=0.75,side=Math.sqrt(area*2/Math.sqrt(3))/umpp,pts=[];
  /* hex lattice, jittered; jitter grows with pleomorphism (100 - hex) and polymegathism (cv) */
  var jit=Math.min(0.48,0.06+(100-(c.hex||65))/100*0.6),sz=(c.cv||30)/100;
  for(var row=-2,y=0;y<H+side*2;row++,y=row*side*0.866){for(var col=-2;col*side<W+side*2;col++){var x=col*side+(row%2?side/2:0);
    if(sz>0.33&&r()<(sz-0.33)*0.9)continue; /* drop points: big cells */
    pts.push([x+(r()-0.5)*2*jit*side,y+(r()-0.5)*2*jit*side])}}
  if(sz>0.3){for(var k=0;k<pts.length*(sz-0.3)*0.8;k++)pts.push([r()*W,r()*H])} /* extra small cells */
  /* grid lookup */
  var G=Math.max(8,side*1.2),gw=Math.ceil(W/G)+4,gh=Math.ceil(H/G)+4,grid={};pts.forEach(function(p,i){var gx=Math.floor(p[0]/G)+2,gy=Math.floor(p[1]/G)+2,k=gx+','+gy;(grid[k]=grid[k]||[]).push(i)});
  var cv=document.createElement('canvas');cv.width=W;cv.height=H;var x=cv.getContext('2d'),img=x.createImageData(W,H),d=img.data,bw=Math.max(1.2,side*0.075);
  var gt=[];if(c.gutt){var n=Math.round(c.gutt*W*H/1800);for(var j=0;j<n;j++)gt.push([r()*W,r()*H,(c.guttSize||1)*(4+r()*6)])}
  var ves=c.vesicle?[[W*0.45,H*0.5,W*0.13]]:[];
  for(var py=0;py<H;py++)for(var px=0;px<W;px++){var gx=Math.floor(px/G)+2,gy=Math.floor(py/G)+2,b1=1e9,b2=1e9,bi=-1;
   for(var a=-1;a<=1;a++)for(var b=-1;b<=1;b++){var L=grid[(gx+a)+','+(gy+b)];if(!L)continue;for(var q=0;q<L.length;q++){var p=pts[L[q]],dd=(p[0]-px)*(p[0]-px)+(p[1]-py)*(p[1]-py);if(dd<b1){b2=b1;b1=dd;bi=L[q]}else if(dd<b2)b2=dd}}
   var e=Math.sqrt(b2)-Math.sqrt(b1),v;
   if(c.ice){v=e<bw*1.6?0.85:0.25+0.1*((bi*7919)%10)/10}else{v=e<bw?0.12:0.62+0.16*((bi*7919)%10)/10}
   v+=(r()-0.5)*0.08;
   gt.forEach(function(g){var dd=Math.hypot(px-g[0],py-g[1]);if(dd<g[2])v=dd<g[2]*0.75?0.08+0.05*r():Math.max(v,0.9)});
   ves.forEach(function(s){var dd=Math.hypot(px-s[0],py-s[1]);if(Math.abs(dd-s[2])<3)v=0.12;else if(dd<s[2])v=0.45+0.1*r()});
   if(c.dark&&((bi*31)%Math.round(1/c.dark))===0&&e>bw)v=0.15;
   var gg=Math.round(Math.max(0,Math.min(1,v))*255);d[(py*W+px)*4]=d[(py*W+px)*4+1]=d[(py*W+px)*4+2]=gg;d[(py*W+px)*4+3]=255}
  x.putImageData(img,0,0);if(c.blur){var t=document.createElement('canvas'),f=c.blur;t.width=Math.round(W/f);t.height=Math.round(H/f);var tx=t.getContext('2d');tx.drawImage(cv,0,0,t.width,t.height);x.imageSmoothingEnabled=true;x.drawImage(t,0,0,W,H)}return cv}
 function render(c){var W=1000,H=470,cv=document.createElement('canvas');cv.width=W*2;cv.height=H*2;var x=cv.getContext('2d');x.scale(2,2);x.fillStyle='#fff';x.fillRect(0,0,W,H);
  x.fillStyle='#1b2a3a';x.font='bold 15px Arial,sans-serif';x.fillText('Specular microscopy · SIMULATED TEACHING REPORT',16,22);x.font='13px Arial,sans-serif';x.fillStyle='#33414f';x.fillText('Eye: '+(c.eye==='L'?'OS':'OD')+'   Age: '+(c.age||'')+'   Area: central   '+(c.note||''),16,42);
  var m=mosaic(c,400,360);x.drawImage(m,16,56);x.strokeStyle='#1b2a3a';x.strokeRect(16,56,400,360);x.fillStyle='#fff';x.fillRect(30,396,133,4);x.fillStyle='#fff';x.font='11px Arial,sans-serif';x.fillText('100 µm',36,392);
  var X0=450,y=80,rows=[['CD (cell density)',(c.cd==null?'—':Math.round(c.cd))+' cells/mm²',c.flags&&c.flags.cd],['AVG (mean cell area)',c.cd?Math.round(1e6/c.cd)+' µm²':'—',c.flags&&c.flags.cd],['CV (coefficient of variation)',(c.cv==null?'—':Math.round(c.cv))+' %',c.flags&&c.flags.cv],['HEX (hexagonal cells)',(c.hex==null?'—':Math.round(c.hex))+' %',c.flags&&c.flags.hex],['CCT (central thickness)',(c.cct||'—')+' µm',c.flags&&c.flags.cct],['Cells analysed',c.cd==null?'—':''+(c.n||(90+((c.seed||5)*37)%70)),false]];
  x.fillStyle='#1D4E89';x.font='bold 14px Arial,sans-serif';x.fillText('Analysis',X0,y-8);
  rows.forEach(function(rw,i){var yy=y+18+i*28;x.fillStyle='#33414f';x.font='14px Arial,sans-serif';x.fillText(rw[0],X0,yy);x.fillStyle=rw[2]?'#b3261e':'#1b2a3a';x.font=(rw[2]?'bold ':'')+'14px Arial,sans-serif';x.fillText(rw[1],X0+330-x.measureText(rw[1]).width,yy)});
  /* histogram of cell areas */
  var hx=X0,hy=y+200,hw=330,hh=110,r=rng((c.seed||5)+99),mu=c.cd?1e6/c.cd:400,sd=mu*(c.cv||30)/100,bins=new Array(12).fill(0);for(var i=0;i<400;i++){var u=r()+r()+r()-1.5,v=mu+u*sd*1.4;var bi=Math.floor(v/(mu*2.4/12));if(bi>=0&&bi<12)bins[bi]++}var mx=Math.max.apply(null,bins);
  if(c.cd!=null){x.fillStyle='#33414f';x.font='12px Arial,sans-serif';x.fillText('Cell area distribution (µm²)',hx,hy-6);bins.forEach(function(b,k){var bh=hh*b/mx;x.fillStyle='#7aa6d6';x.fillRect(hx+k*(hw/12)+1,hy+hh-bh,hw/12-2,bh)});x.strokeStyle='#33414f';x.beginPath();x.moveTo(hx,hy+hh);x.lineTo(hx+hw,hy+hh);x.stroke();
  x.fillStyle='#5f6b7a';x.font='11px Arial,sans-serif';x.fillText('0',hx,hy+hh+12);x.fillText(Math.round(mu*2.4)+'',hx+hw-24,hy+hh+12)}
  if(c.warn){x.fillStyle='#b3261e';x.font='bold 12px Arial,sans-serif';c.warn.split('|').forEach(function(t,i){x.fillText('⚠ '+t,X0,hy+hh+34+i*16)})}
  x.fillStyle='#8a96a3';x.font='11px Arial,sans-serif';x.fillText('RPC Rounds Diagnostics Lab · simulation for teaching',W-300,H-8);
  return'<img src="'+cv.toDataURL('image/png')+'" alt="Simulated specular microscopy" style="display:block;width:100%;min-width:640px;height:auto">'}
 return{render:render}
})();
if(typeof module!=='undefined')module.exports=DXS;
