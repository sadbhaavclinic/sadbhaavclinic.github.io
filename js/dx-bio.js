/* RPC Rounds Diagnostics Lab: simulated optical biometry printout (both eyes). Teaching simulation only.
   Per eye: al, acd, lt, cct, wtw, k1, k2, ax (axis of K1, flat), snr, mode, status, krep (three K readings), note, warn. */
var DXB=(function(){
 function f(v,d){return(v==null||v==='')?'—':Number(v).toFixed(d)}
 function scan(x,X,Y,W,H,e,seed){var s=seed||3;function r(){s=(s*1664525+1013904223)>>>0;return s/4294967296}
  x.fillStyle='#0b1622';x.fillRect(X,Y,W,H);x.strokeStyle='#2a3d52';x.lineWidth=1;for(var i=1;i<6;i++){x.beginPath();x.moveTo(X+W*i/6,Y);x.lineTo(X+W*i/6,Y+H);x.stroke()}
  var al=e.al||23.5,acd=e.acd||3.1,lt=e.lt||4.5,mm=function(z){return X+12+(W-24)*z/34},base=Y+H-12,amp=H-24,snr=e.snr==null?20:e.snr,ret=e.ret==null?1:e.ret,oil=e.oil;
  var peaks=[[0,1,0.5],[0.55,0.5,0.4]];if(e.status!=='aphakic'){if(e.status==='pseudophakic'){peaks.push([acd+0.55,0.95,0.35]);peaks.push([acd+1.5,0.75,0.35])}else{peaks.push([acd+0.55,0.55*(e.lensAmp||1),0.4]);peaks.push([acd+0.55+lt,0.45*(e.lensAmp||1),0.4])}}
  peaks.push([al,0.95*ret,0.35]);peaks.push([al+0.25,0.5*ret,0.3]);if(e.extra)e.extra.forEach(function(p){peaks.push(p)});
  x.strokeStyle='#5fd17a';x.lineWidth=1.3;x.beginPath();for(var px=0;px<=W-24;px++){var z=34*px/(W-24),v=0;peaks.forEach(function(p){v+=p[1]*Math.exp(-Math.pow((z-p[0])/(p[2]*0.18),2))});v+=(r()-0.5)*0.9/Math.max(2,snr)+0.02*r();var yy=base-amp*Math.max(0,Math.min(1.05,v));if(px===0)x.moveTo(X+12+px,yy);else x.lineTo(X+12+px,yy)}x.stroke();
  x.fillStyle='#9fb3c8';x.font='10px Arial,sans-serif';[0,10,20,30].forEach(function(z){x.fillText(z+' mm',mm(z)-8,Y+H-1)});
  if(e.al&&ret>0.15){x.strokeStyle='#f4c430';x.setLineDash([3,3]);x.beginPath();x.moveTo(mm(al),Y+4);x.lineTo(mm(al),base);x.stroke();x.setLineDash([])}}
 function eye(x,X,Y,W,e,lab){var row=function(k,v,u,flag,yy){x.fillStyle='#33414f';x.font='13px Arial,sans-serif';x.fillText(k,X,yy);x.fillStyle=flag?'#b3261e':'#1b2a3a';x.font=(flag?'bold ':'')+'13px Arial,sans-serif';var t=v+(u?' '+u:'');x.fillText(t,X+W-10-x.measureText(t).width,yy)};
  x.fillStyle='#1D4E89';x.font='bold 15px Arial,sans-serif';x.fillText(lab,X,Y);x.fillStyle='#33414f';x.font='12px Arial,sans-serif';
  x.fillText('Status: '+(e.status||'phakic')+' · Vitreous: '+(e.oil?'silicone oil':'vitreous body')+' · Mode: '+(e.mode||'standard'),X,Y+18);
  scan(x,X,Y+28,W-10,120,e,e.seed);
  var F=e.flags||{},yy=Y+172,km=(e.k1+e.k2)/2,cyl=e.k2-e.k1;
  row('AL (axial length)',f(e.al,2),'mm',F.al,yy);row('SNR',e.snr==null?'—':f(e.snr,1),'',F.snr,yy+20);row('ACD (epithelium–lens)',f(e.acd,2),'mm',F.acd,yy+40);row('LT (lens thickness)',e.status==='phakic'||!e.status?f(e.lt,2):'—','mm',F.lt,yy+60);row('CCT',f(e.cct,0),'µm',F.cct,yy+80);row('WTW',f(e.wtw,1),'mm',F.wtw,yy+100);
  row('K1 (flat)',f(e.k1,2)+' D @ '+(e.ax||0)+'°','',F.k,yy+130);row('K2 (steep)',f(e.k2,2)+' D @ '+(((e.ax||0)+90)%180)+'°','',F.k,yy+150);row('Mean K',f(km,2),'D',F.k,yy+170);row('Corneal cylinder',f(cyl,2)+' D @ '+(((e.ax||0)+90)%180)+'°','',F.cyl,yy+190);
  if(e.krep){x.fillStyle='#33414f';x.font='12px Arial,sans-serif';x.fillText('Repeat K (three scans), mean K: '+e.krep.map(function(v){return f(v,2)}).join(' · ')+' D',X,yy+214)}
  if(e.warn){x.fillStyle='#b3261e';x.font='bold 12px Arial,sans-serif';var w=e.warn.split('|');w.forEach(function(t,i){x.fillText('⚠ '+t,X,yy+234+i*16)})}}
 function render(c){var W=1100,H=c.h||560,cv=document.createElement('canvas');cv.width=W*2;cv.height=H*2;var x=cv.getContext('2d');x.scale(2,2);x.fillStyle='#fff';x.fillRect(0,0,W,H);
  x.fillStyle='#1b2a3a';x.font='bold 15px Arial,sans-serif';x.fillText('Optical biometry · SIMULATED TEACHING REPORT',16,24);x.font='13px Arial,sans-serif';x.fillStyle='#33414f';x.fillText('Age: '+(c.age||'')+'   Refractive index setting: standard   '+(c.note||''),16,44);
  x.strokeStyle='#d5e3f3';x.beginPath();x.moveTo(W/2,56);x.lineTo(W/2,H-30);x.stroke();
  eye(x,16,78,W/2-26,c.R||{},'OD (right eye)');eye(x,W/2+14,78,W/2-26,c.L||{},'OS (left eye)');
  x.fillStyle='#8a96a3';x.font='11px Arial,sans-serif';x.fillText('RPC Rounds Diagnostics Lab · simulation for teaching; values in red are outside expected limits',16,H-10);
  return'<img src="'+cv.toDataURL('image/png')+'" alt="Simulated biometry printout" style="display:block;width:100%;min-width:640px;height:auto">'}
 return{render:render}
})();
if(typeof module!=='undefined')module.exports=DXB;
