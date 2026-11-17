/* RPC Rounds: schematic line drawings of ophthalmic instruments (SVG). Teaching drawings, not to scale. */
var DXI=(function(){
 var ST='#5b6b7c',FILL='url(#stl)',LW=1.6;
 function defs(){return'<defs><linearGradient id="stl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4f6f8"/><stop offset="0.5" stop-color="#cfd6de"/><stop offset="1" stop-color="#9aa6b2"/></linearGradient><linearGradient id="gold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff3c4"/><stop offset="1" stop-color="#c9a227"/></linearGradient><linearGradient id="plas" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#d9e4ef"/></linearGradient></defs>'}
 function P(d,f,w){return'<path d="'+d+'" fill="'+(f||FILL)+'" stroke="'+ST+'" stroke-width="'+(w||LW)+'" stroke-linejoin="round" stroke-linecap="round"/>'}
 function L(d,w,c){return'<path d="'+d+'" fill="none" stroke="'+(c||ST)+'" stroke-width="'+(w||LW)+'" stroke-linecap="round" stroke-linejoin="round"/>'}
 function knurl(x0,x1,y,h){var s='';for(var x=x0+6;x<x1-4;x+=7)s+=L('M'+x+' '+(y-h/2+2)+' l4 '+(h-4),0.8,'#7f8c99');return s}
 function roundHandle(x0,x1,y,h){h=h||18;return P('M'+x0+' '+(y-h/2+3)+' Q'+x0+' '+(y-h/2)+' '+(x0+6)+' '+(y-h/2)+' L'+x1+' '+(y-h/2+3)+' L'+x1+' '+(y+h/2-3)+' L'+(x0+6)+' '+(y+h/2)+' Q'+x0+' '+(y+h/2)+' '+x0+' '+(y+h/2-3)+'Z')+knurl(x0+30,x1-30,y,h)}
 function ringHandle(y){return'<ellipse cx="78" cy="'+(y-26)+'" rx="30" ry="18" fill="none" stroke="'+ST+'" stroke-width="7"/><ellipse cx="78" cy="'+(y+26)+'" rx="30" ry="18" fill="none" stroke="'+ST+'" stroke-width="7"/>'}
 /* ---------- tips (drawn at origin pointing right, length ~60) ---------- */
 var TIP={
  plain:function(){return P('M0 -5 L58 -1.2 Q62 0 58 1.2 L0 5Z')},
  toothed:function(){return P('M0 -5 L56 -1.6 L60 -6 L62 -1 L62 1 L60 6 L56 1.6 L0 5Z')},
  tying:function(){return P('M0 -5 L40 -3 L62 -3 L62 3 L40 3 L0 5Z')+L('M42 0 L60 0',0.8)},
  utrata:function(){return P('M0 -5 L44 -2 Q52 -1 56 6 L58 14 L54 8 Q50 3 44 2 L0 5Z')},
  mcpherson:function(){return P('M0 -5 L30 -2 L58 -22 L61 -19 L34 2 L0 5Z')},
  colibri:function(){return P('M0 -5 L36 -2 Q54 -2 60 12 L57 13 Q50 3 36 2 L0 5Z')+L('M58 12 l4 2',1)},
  kelman:function(){return P('M0 -5 L32 -2 L58 -16 L62 -12 L36 3 L0 5Z')+L('M40 -4 l14 -8 M41 -1 l14 -8',0.6)},
  serr:function(){return P('M0 -6 L60 -3 L62 0 L60 3 L0 6Z')+(function(){var s='';for(var x=6;x<58;x+=4)s+=L('M'+x+' -4 L'+x+' 4',0.6);return s})()},
  ilm:function(){return P('M0 -3 L50 -1.5 L58 -5 L62 -4 L56 0 L62 4 L58 5 L50 1.5 L0 3Z')},
  scissorStraight:function(){return P('M0 -6 L58 -1 L60 0 L0 0Z')+P('M0 0 L60 0 L58 1 L0 6Z')},
  scissorCurved:function(){return P('M0 -6 Q34 -6 58 6 L60 7 Q34 0 0 0Z')+P('M0 0 Q34 0 60 7 L57 9 Q34 6 0 6Z')},
  scissorAngled:function(){return P('M0 -5 L24 -2 L56 -20 L58 -18 L28 2 L0 0Z')+P('M0 0 L28 2 L59 -17 L57 -14 L28 5 L0 5Z')},
  blunt:function(){return P('M0 -7 L56 -3 Q64 0 56 3 L0 7Z')+L('M0 0 L58 0',0.8)},
  needleCurved:function(){return P('M0 -6 Q36 -6 56 4 Q60 8 56 9 Q36 2 0 2Z')+P('M0 2 Q36 2 56 9 Q50 10 34 7 L0 6Z')},
  needleStraight:function(){return P('M0 -6 L60 -2 L60 2 L0 6Z')+L('M0 0 L60 0',0.8)},
  keratome:function(){return P('M0 -2 L18 -2 L22 -14 L56 -10 L64 0 L56 10 L22 14 L18 2 L0 2Z','#e9eef3')+L('M22 0 L64 0',0.6)},
  crescent:function(){return P('M0 -2 L20 -2 Q24 -14 44 -14 Q64 -12 64 0 Q64 12 44 14 Q24 14 20 2 L0 2Z','#e9eef3')},
  fifteen:function(){return P('M0 -2 L20 -2 L64 0 L20 5 L0 2Z','#e9eef3')},
  mvr:function(){return P('M0 -2 L24 -2 L36 -7 L64 0 L36 7 L24 2 L0 2Z','#e9eef3')},
  bp11:function(){return P('M0 -6 L20 -6 L64 -6 L20 10 L0 6Z','#e9eef3')},
  bp15:function(){return P('M0 -6 L30 -6 Q58 -6 62 2 Q58 10 30 8 L0 6Z','#e9eef3')},
  sinskey:function(){return L('M0 0 L44 0 L54 -10 L62 -10 L64 -4',2.2)},
  kuglen:function(){return L('M0 0 L50 0 Q62 0 62 -8 Q62 -14 56 -14 Q50 -14 52 -8',2.2)},
  muscle:function(){return L('M0 0 L30 0 Q62 0 62 -24 Q62 -40 46 -40 L40 -40',3.2)+'<circle cx="40" cy="-40" r="3.4" fill="#9aa6b2" stroke="'+ST+'"/>'},
  tenotomy:function(){return L('M0 0 L34 0 Q58 0 58 -18 Q58 -28 48 -28',2.2)},
  irisHook:function(){return L('M0 0 L50 0 L50 -12 L58 -12',1.8)},
  chopper:function(){return L('M0 0 L54 0 L54 12',2.4)+P('M51 10 L54 18 L57 10Z','#9aa6b2',1)},
  nagahara:function(){return L('M0 0 L50 0 L60 10 L56 16',2.4)},
  dialer:function(){return L('M0 0 L54 0 L58 -6',2)+'<circle cx="58" cy="-7" r="2.6" fill="#9aa6b2" stroke="'+ST+'"/>'},
  spatula:function(){return P('M0 -1.5 L30 -1.5 L34 -5 L62 -4 Q66 0 62 4 L34 5 L30 1.5 L0 1.5Z')},
  repositor:function(){return P('M0 -1.5 L36 -1.5 L60 -3 Q64 0 60 3 L36 1.5 L0 1.5Z')},
  cystitome:function(){return L('M0 0 L56 0 L62 8',1.4)},
  cannula:function(){return L('M0 0 L50 0 Q58 0 62 6',2.4)},
  simcoe:function(){return L('M0 -3 L50 -3 Q58 -3 62 3',2.2)+L('M0 3 L46 3 Q52 3 56 7',2.2)},
  rycroft:function(){return L('M0 0 L46 0 L62 -10',1.8)},
  lacrimal:function(){return L('M0 0 L40 0 Q58 0 62 12',2.6)+'<circle cx="62" cy="12" r="2.2" fill="#9aa6b2"/>'},
  hydro:function(){return L('M0 0 L50 0 Q58 0 62 5',2.2)+P('M59 3 L66 6 L63 9 L58 7Z','#cfd6de',1)},
  bowman:function(){return L('M0 0 L62 0',2.4)+'<circle cx="62" cy="0" r="1.8" fill="#9aa6b2"/>'},
  dilator:function(){return P('M0 -5 L40 -4 L62 -0.8 L62 0.8 L40 4 L0 5Z')},
  curette:function(){return L('M0 0 L44 0',2.6)+'<ellipse cx="54" cy="0" rx="9" ry="6.5" fill="#cfd6de" stroke="'+ST+'" stroke-width="1.6"/><ellipse cx="55" cy="0" rx="5" ry="3.5" fill="#f4f6f8" stroke="'+ST+'"/>'},
  trocar:function(){return P('M0 -6 L30 -6 L30 -3 L60 -2 L66 0 L60 2 L30 3 L30 6 L0 6Z','#e9eef3')},
  vitrector:function(){return P('M0 -3.5 L60 -3.5 Q64 0 60 3.5 L0 3.5Z')+'<rect x="50" y="-3.5" width="6" height="3" fill="#33414f"/>'},
  lightpipe:function(){return P('M0 -3 L60 -3 L60 3 L0 3Z')+'<path d="M60 0 L80 -10 L80 10Z" fill="#fff6a8" opacity="0.8"/>'},
  laser:function(){return P('M0 -3 L52 -3 Q62 -3 64 6 L60 6 Q58 3 52 3 L0 3Z')+'<circle cx="62" cy="10" r="3" fill="#ff5a4e" opacity="0.8"/>'},
  depressor:function(){return P('M0 -4 L40 -4 Q46 -16 58 -14 Q66 -10 60 -4 Q56 0 60 4 Q66 10 58 14 Q46 16 40 4 L0 4Z')},
  cryo:function(){return P('M0 -6 L50 -6 L50 -3 L60 -3 Q66 0 60 3 L50 3 L50 6 L0 6Z')+'<circle cx="63" cy="0" r="7" fill="#dff3ff" opacity="0.7"/>'},
  bipolar:function(){return P('M0 -6 L60 -2 L62 0 L0 -1Z')+P('M0 1 L62 0 L60 2 L0 6Z')},
  trephine:function(){return P('M0 -14 L60 -14 L60 14 L0 14Z','#e9eef3')+L('M60 -14 L60 14',2.6)},
  spoonEvisc:function(){return L('M0 0 L30 0',3)+'<ellipse cx="46" cy="0" rx="18" ry="10" fill="#cfd6de" stroke="'+ST+'" stroke-width="2"/><ellipse cx="47" cy="0" rx="13" ry="6" fill="#f4f6f8" stroke="#7f8c99"/>'},
  spoonWells:function(){return L('M0 0 L26 0',3)+'<ellipse cx="44" cy="0" rx="20" ry="13" fill="#cfd6de" stroke="'+ST+'" stroke-width="2"/><rect x="34" y="-3" width="26" height="6" rx="3" fill="#ffffff" stroke="'+ST+'"/>'},
  vectis:function(){return L('M0 0 L28 0',2.6)+'<ellipse cx="46" cy="0" rx="18" ry="9" fill="none" stroke="'+ST+'" stroke-width="2.6"/>'+L('M34 -3 L58 -3 M34 3 L58 3',0.8)},
  caliper:function(){return''}
 };
 function tipAt(name,x,y,s,rot){return'<g transform="translate('+x+' '+y+') rotate('+(rot||0)+') scale('+(s||1)+')">'+(TIP[name]||TIP.plain)()+'</g>'}
 function inset(name,lab){return'<g><circle cx="770" cy="140" r="112" fill="#ffffff" stroke="#c9d6e6" stroke-width="2"/><clipPath id="ci"><circle cx="770" cy="140" r="110"/></clipPath><g clip-path="url(#ci)">'+tipAt(name,700,150,2.4)+'</g><text x="770" y="275" text-anchor="middle" font-size="14" fill="#5f6b7a" font-family="Arial">'+(lab||'Tip, magnified')+'</text></g>'}
 /* ---------- whole instruments ---------- */
 function forceps(f){var y=150,s='';s+=P('M60 '+(y-3)+' Q66 '+(y-8)+' 90 '+(y-11)+' L330 '+(y-20)+' L560 '+(y-6)+' L600 '+(y-4)+' L600 '+(y-1)+' L560 '+(y-2)+' L330 '+(y-12)+' L90 '+(y-4)+'Z');s+=P('M60 '+(y+3)+' Q66 '+(y+8)+' 90 '+(y+11)+' L330 '+(y+20)+' L560 '+(y+6)+' L600 '+(y+4)+' L600 '+(y+1)+' L560 '+(y+2)+' L330 '+(y+12)+' L90 '+(y+4)+'Z');
  s+=knurl(200,320,y-14,8)+knurl(200,320,y+14,8);if(f.lock)s+=L('M380 '+(y-14)+' L380 '+(y+14),1.4);s+=tipAt(f.tip,598,y,1,0);return s+inset(f.tip)}
 function artery(f){var y=150;return ringHandle(y)+L('M104 '+(y-24)+' L330 '+(y-3)+' M104 '+(y+24)+' L330 '+(y+3),6)+'<circle cx="335" cy="'+y+'" r="6" fill="#cfd6de" stroke="'+ST+'"/>'+L('M150 '+(y-18)+' l18 8 M150 '+(y+18)+' l18 -8',3)+P('M335 '+(y-5)+(f.curved?' Q470 '+(y-6)+' 560 '+(y+16)+' L562 '+(y+22)+' Q470 '+(y+4)+' 335 '+(y+5):' L560 '+(y-2)+' L562 '+y+' L560 '+(y+2)+' L335 '+(y+5))+'Z')+inset('serr','Serrated jaws, magnified')}
 function springScissors(f){var y=150;return P('M60 '+(y-4)+' Q60 '+(y-14)+' 90 '+(y-18)+' L380 '+(y-14)+' L430 '+(y-3)+' L430 '+(y)+' L380 '+(y-8)+' L90 '+(y-10)+'Z')+P('M60 '+(y+4)+' Q60 '+(y+14)+' 90 '+(y+18)+' L380 '+(y+14)+' L430 '+(y+3)+' L430 '+(y)+' L380 '+(y+8)+' L90 '+(y+10)+'Z')+knurl(160,330,y-13,7)+knurl(160,330,y+13,7)+'<circle cx="432" cy="'+y+'" r="4" fill="#cfd6de" stroke="'+ST+'"/>'+L('M436 '+y+' L540 '+y,4)+tipAt(f.tip,540,y,1,0)+inset(f.tip,'Blades, magnified')}
 function ringScissors(f){var y=150;return ringHandle(y)+L('M104 '+(y-24)+' L330 '+(y-2)+' M104 '+(y+24)+' L330 '+(y+2),6)+'<circle cx="335" cy="'+y+'" r="6" fill="#cfd6de" stroke="'+ST+'"/>'+'<g transform="translate(335 '+y+') scale('+(f.big?4:3.4)+',1.6)">'+TIP[f.tip]()+'</g>'+inset(f.tip,'Blades, magnified')}
 function needleHolder(f){var y=150;return P('M60 '+(y-4)+' Q60 '+(y-14)+' 90 '+(y-18)+' L420 '+(y-12)+' L520 '+(y-4)+' L520 '+(y)+' L420 '+(y-6)+' L90 '+(y-10)+'Z')+P('M60 '+(y+4)+' Q60 '+(y+14)+' 90 '+(y+18)+' L420 '+(y+12)+' L520 '+(y+4)+' L520 '+(y)+' L420 '+(y+6)+' L90 '+(y+10)+'Z')+knurl(150,320,y-13,7)+knurl(150,320,y+13,7)+(f.lock?L('M260 '+(y-12)+' l10 12 l-10 12',2.4):'')+tipAt(f.tip,520,y,1.3,0)+inset(f.tip,'Jaws, magnified')}
 function knife(f){var y=150,h=f.bp?P('M40 '+(y-9)+' L330 '+(y-9)+' L360 '+(y-5)+' L360 '+(y+5)+' L330 '+(y+9)+' L40 '+(y+9)+'Z')+knurl(80,300,y,16):roundHandle(40,330,y,f.plastic?24:18);if(f.plastic)h=h.replace(/url\(#stl\)/,'url(#plas)');return h+L('M330 '+y+' L'+(f.bp?360:520)+' '+y,f.bp?0.1:3)+tipAt(f.tip,f.bp?360:520,y,f.bp?2:1.4,0)+inset(f.tip,'Blade, magnified')}
 function rod(f){var y=150;return roundHandle(40,330,y,f.thick?20:16)+L('M330 '+y+' L'+(f.short?470:540)+' '+y,f.w||3)+tipAt(f.tip,f.short?470:540,y,1.2,0)+inset(f.tip)}
 function cannulaD(f){var y=150;return P('M150 '+(y-10)+' L250 '+(y-8)+' L250 '+(y+8)+' L150 '+(y+10)+'Z','url(#plas)')+P('M120 '+(y-14)+' L152 '+(y-14)+' L152 '+(y+14)+' L120 '+(y+14)+'Z','url(#plas)')+(f.tip==='simcoe'?L('M250 '+(y-3)+' L540 '+(y-3)+' M250 '+(y+3)+' L540 '+(y+3),2)+P('M60 '+(y+20)+' L120 '+(y+6)+' L120 '+(y+14)+' L66 '+(y+30)+'Z','#e9eef3',1):L('M250 '+y+' L540 '+y,2.4))+tipAt(f.tip,540,y,1.2,0)+inset(f.tip)}
 function wireSpec(){return'<circle cx="110" cy="150" r="24" fill="none" stroke="'+ST+'" stroke-width="4"/>'+L('M128 134 L400 96 M128 166 L400 204',4)+L('M400 96 Q520 60 600 96 Q620 112 600 122 Q520 96 420 112 L400 96',4)+L('M400 204 Q520 240 600 204 Q620 188 600 178 Q520 204 420 188 L400 204',4)}
 function solidSpec(){return P('M80 120 L520 120 L520 132 L80 132Z')+P('M80 168 L520 168 L520 180 L80 180Z')+P('M500 100 Q560 100 600 126 L596 132 Q560 112 500 116Z')+P('M500 200 Q560 200 600 174 L596 168 Q560 188 500 184Z')+'<rect x="240" y="132" width="10" height="36" fill="#cfd6de" stroke="'+ST+'"/><circle cx="245" cy="150" r="12" fill="#cfd6de" stroke="'+ST+'"/>'+L('M233 150 l24 0',1.4)+inset('blunt','Solid blades with a screw to set the gap')}
 function desmarres(){return roundHandle(40,330,150,18)+L('M330 150 L520 150',5)+'<path d="M520 150 Q560 150 570 120 Q575 100 600 100 Q640 100 640 140 L640 200 Q640 210 630 210" fill="none" stroke="'+ST+'" stroke-width="9" stroke-linecap="round"/>'+inset('blunt','Curved saddle plate (side view)')}
 function chalazion(){return'<ellipse cx="560" cy="140" rx="50" ry="36" fill="none" stroke="'+ST+'" stroke-width="10"/><ellipse cx="560" cy="160" rx="50" ry="36" fill="#cfd6de" stroke="'+ST+'" stroke-width="2"/>'+L('M150 150 L510 150 M150 165 L510 165',7)+'<circle cx="250" cy="157" r="16" fill="#cfd6de" stroke="'+ST+'"/>'+L('M240 157 l20 0',1.4)+inset('blunt','Ring on one side, solid plate on the other')}
 function caliper(){var s=P('M80 140 L560 140 L560 160 L80 160Z');for(var x=100;x<540;x+=10)s+=L('M'+x+' 140 l0 '+(x%50===0?10:6),0.8);s+=P('M120 160 L130 160 L118 250 L112 250Z')+P('M300 160 L310 160 L322 250 L316 250Z')+'<circle cx="420" cy="150" r="12" fill="#cfd6de" stroke="'+ST+'"/>';return s+'<text x="320" y="128" font-size="14" fill="#33414f" font-family="Arial">0 to 20 mm scale</text>'+inset('dilator','Pointed legs')}
 function schiotz(){return P('M300 60 L340 60 L340 250 L300 250Z','#e9eef3')+P('M230 250 L410 250 L410 262 L230 262Z')+P('M314 262 L326 262 L326 290 L314 290Z')+'<path d="M320 60 L320 30 M300 60 Q320 20 420 26" fill="none" stroke="'+ST+'" stroke-width="3"/><rect x="380" y="20" width="70" height="40" fill="#fff" stroke="'+ST+'"/><text x="386" y="45" font-size="13" font-family="Arial" fill="#33414f">0 – 20</text>'+'<rect x="270" y="120" width="30" height="24" fill="url(#gold)" stroke="'+ST+'"/><text x="200" y="136" font-size="13" font-family="Arial" fill="#33414f">weight</text>'+inset('plain','Concave footplate rests on the cornea')}
 function ring(f){if(f.t==='ctr')return'<path d="M450 150 m-120 0 a120 120 0 1 0 240 0 a120 110 0 1 0 -232 -10" fill="none" stroke="#1D4E89" stroke-width="4"/><circle cx="330" cy="150" r="8" fill="none" stroke="#1D4E89" stroke-width="3"/><circle cx="562" cy="140" r="8" fill="none" stroke="#1D4E89" stroke-width="3"/>'+inset('plain','Open ring with an eyelet at each end');
  if(f.t==='malyugin')return'<path d="M360 80 L540 80 L540 240 L360 240Z" fill="none" stroke="#c0392b" stroke-width="4"/>'+[[360,80],[540,80],[540,240],[360,240]].map(function(p){return'<circle cx="'+p[0]+'" cy="'+p[1]+'" r="14" fill="none" stroke="#c0392b" stroke-width="4"/>'}).join('')+inset('irisHook','Scrolls hold the pupil margin');
  if(f.t==='irishooks')return[0,1,2,3].map(function(i){var y=70+i*50;return L('M180 '+y+' L560 '+y+' L560 '+(y-14)+' L572 '+(y-14),2)+'<rect x="300" y="'+(y-7)+'" width="18" height="14" rx="3" fill="#ff9f43" stroke="'+ST+'"/>'}).join('')+inset('irisHook','Flexible hook with a silicone stop');
  if(f.t==='iol1')return'<circle cx="450" cy="150" r="60" fill="#eaf4ff" stroke="#1D4E89" stroke-width="2.4"/><path d="M500 115 Q560 60 600 90 Q560 80 515 130 M400 185 Q340 240 300 210 Q340 220 385 170" fill="#eaf4ff" stroke="#1D4E89" stroke-width="2.4"/>'+inset('plain','Single-piece acrylic: thick, broad haptics');
  if(f.t==='iol3')return'<circle cx="450" cy="150" r="60" fill="#eaf4ff" stroke="#1D4E89" stroke-width="2.4"/><path d="M505 120 Q600 70 640 120 M395 180 Q300 230 260 180" fill="none" stroke="#2c7be5" stroke-width="2"/>'+inset('plain','Three-piece: thin PMMA or PVDF haptics');
  if(f.t==='aciol')return'<circle cx="450" cy="150" r="56" fill="#eaf4ff" stroke="#1D4E89" stroke-width="2.4"/><path d="M500 125 L620 90 L640 110 L600 130 M500 175 L620 210 L640 190 L600 170 M400 125 L280 90 L260 110 L300 130 M400 175 L280 210 L260 190 L300 170" fill="none" stroke="#1D4E89" stroke-width="3"/>'+inset('plain','Four-point angle-supported footplates');
  if(f.t==='band')return'<rect x="120" y="120" width="560" height="22" rx="6" fill="#cfe6ff" stroke="#5b6b7c"/><path d="M200 190 L320 190 L320 210 L200 210Z M200 190 Q260 172 320 190" fill="#cfe6ff" stroke="#5b6b7c"/><text x="200" y="240" font-size="13" font-family="Arial" fill="#33414f">tyre (grooved) under the band</text>'+inset('plain','Silicone band and tyre');
  return''}
 function lens(f){var t=f.t,s='';if(t==='gonio3'){s='<circle cx="380" cy="150" r="90" fill="#eef6ff" stroke="'+ST+'" stroke-width="3"/>';[0,120,240].forEach(function(a){var r=a*Math.PI/180;s+='<path d="M'+(380+60*Math.cos(r))+' '+(150+60*Math.sin(r))+' l'+(25*Math.cos(r+0.6))+' '+(25*Math.sin(r+0.6))+' l'+(25*Math.cos(r-0.9))+' '+(25*Math.sin(r-0.9))+'Z" fill="#b9d8f5" stroke="'+ST+'"/>'});s+='<circle cx="380" cy="150" r="34" fill="#dcecff" stroke="'+ST+'"/>';return s+inset('plain','Central lens and three mirrors at different angles')}
  if(t==='gonio1')return'<circle cx="380" cy="150" r="80" fill="#eef6ff" stroke="'+ST+'" stroke-width="3"/><path d="M340 130 l40 -50 l40 50Z" fill="#b9d8f5" stroke="'+ST+'"/><circle cx="380" cy="160" r="26" fill="#dcecff" stroke="'+ST+'"/>'+L('M460 150 L640 150',10)+inset('plain','Single mirror with a handle');
  if(t==='hand')return'<ellipse cx="380" cy="150" rx="22" ry="95" fill="#eef6ff" stroke="'+ST+'" stroke-width="3"/><path d="M372 60 Q360 150 372 240 M388 60 Q400 150 388 240" fill="none" stroke="#9fc4ea"/><rect x="350" y="45" width="60" height="20" rx="6" fill="#33414f"/><rect x="350" y="235" width="60" height="20" rx="6" fill="#33414f"/><text x="430" y="150" font-size="18" font-family="Arial" fill="#33414f">'+(f.lab||'')+'</text>'+inset('plain','Double aspheric condensing lens');
  if(t==='jcc')return'<circle cx="300" cy="150" r="80" fill="#eef6ff" stroke="'+ST+'" stroke-width="3"/>'+L('M240 90 L360 210',2,'#c0392b')+L('M360 90 L240 210',2,'#2c7be5')+'<circle cx="250" cy="100" r="6" fill="#c0392b"/><circle cx="350" cy="100" r="6" fill="#fff" stroke="#2c7be5" stroke-width="2"/>'+L('M380 150 L640 150',10)+inset('plain','Red dots = minus axis, white = plus axis');
  if(t==='maddox')return'<circle cx="380" cy="150" r="90" fill="#ffe2e0" stroke="'+ST+'" stroke-width="3"/>'+(function(){var q='';for(var x=310;x<=450;x+=14)q+=L('M'+x+' '+(150-Math.sqrt(Math.max(0,8100-(x-380)*(x-380)))+4)+' L'+x+' '+(150+Math.sqrt(Math.max(0,8100-(x-380)*(x-380)))-4),6,'#e57373');return q})()+inset('plain','Parallel red glass rods');
  if(t==='prism')return(function(){var q='';for(var i=0;i<8;i++){var x=160+i*60,h=20+i*5;q+='<path d="M'+x+' '+(150-h)+' L'+(x+50)+' '+(150-h+6)+' L'+(x+50)+' '+(150+h-6)+' L'+x+' '+(150+h)+'Z" fill="#eaf4ff" stroke="'+ST+'"/><text x="'+(x+10)+'" y="'+(150+h+18)+'" font-size="12" font-family="Arial">'+[1,2,4,6,8,10,12,16][i]+'</text>'}return q})()+inset('plain','Prisms of increasing power in a bar');
  if(t==='pinhole')return'<circle cx="380" cy="150" r="80" fill="#33414f" stroke="'+ST+'" stroke-width="3"/>'+[[0,0],[-26,-26],[26,-26],[-26,26],[26,26],[0,-36],[0,36],[-36,0],[36,0]].map(function(p){return'<circle cx="'+(380+p[0])+'" cy="'+(150+p[1])+'" r="4" fill="#fff"/>'}).join('')+inset('plain','Multiple pinholes in an occluder');
  return''}

 function misc(f){var t=f.t,y=150;
  if(t==='jaeger')return roundHandle(40,300,y,18)+L('M300 150 L420 150',5)+P('M420 128 Q560 118 640 132 L640 168 Q560 182 420 172Z','#e9eef3')+inset('plain','Broad flat plate protects the globe');
  if(t==='towel')return ringHandle(y)+L('M104 '+(y-24)+' L330 '+(y-3)+' M104 '+(y+24)+' L330 '+(y+3),6)+'<circle cx="335" cy="'+y+'" r="6" fill="#cfd6de" stroke="'+ST+'"/>'+L('M335 '+y+' Q470 '+(y-70)+' 560 '+(y+8)+' M335 '+y+' Q470 '+(y+70)+' 560 '+(y-8),5)+inset('dilator','Sharp curved points that cross');
  if(t==='muller')return ringHandle(y)+L('M104 '+(y-24)+' L300 '+(y-4)+' M104 '+(y+24)+' L300 '+(y+4),6)+L('M160 '+(y-14)+' l40 28',2.4)+L('M300 '+(y-4)+' L520 '+(y-60)+' M300 '+(y+4)+' L520 '+(y+60),6)+[[-60,-1],[60,1]].map(function(q){var yy=y+q[0];return[0,1,2].map(function(i){return L('M520 '+(yy-10+i*10)+' l22 '+(q[1]*6),3)}).join('')}).join('')+inset('plain','Blunt rakes spread the wound');
  if(t==='kerrison')return P('M80 220 L130 120 L150 125 L105 225Z')+P('M150 200 L190 120 L210 125 L172 205Z')+L('M160 120 L600 120 M180 130 L560 130',8)+P('M590 112 L640 112 L640 136 L600 136Z')+inset('plain','Upward-biting punch at the end of a shaft');
  if(t==='bulldog')return P('M300 120 L560 120 L580 140 L560 150 L300 150Z')+P('M300 160 L560 160 L580 160 L560 182 L300 182Z')+'<path d="M300 120 Q250 150 300 182" fill="none" stroke="'+ST+'" stroke-width="6"/>'+inset('serr','Small spring clamp with serrated jaws');
  if(t==='spud')return roundHandle(40,330,y,16)+L('M330 150 L540 150',3)+P('M540 146 L572 142 Q584 150 572 158 L540 154Z')+inset('repositor','Blunt flattened spud (golf-club tip)');
  if(t==='burr')return P('M40 128 L330 128 L330 172 L40 172Z','#e9eef3')+'<circle cx="80" cy="150" r="8" fill="#33414f"/>'+L('M330 150 L540 150',3)+'<circle cx="548" cy="150" r="9" fill="#cfd6de" stroke="'+ST+'"/>'+(function(){var q='';for(var a=0;a<6.28;a+=0.6)q+=L('M548 150 l'+(9*Math.cos(a))+' '+(9*Math.sin(a)),0.8);return q})()+inset('plain','Rotating burr removes a rust ring');
  if(t==='diamond')return roundHandle(40,300,y,22)+'<rect x="300" y="138" width="60" height="24" fill="#e9eef3" stroke="'+ST+'"/>'+(function(){var q='';for(var x=305;x<360;x+=6)q+=L('M'+x+' 138 l0 8',0.8);return q})()+L('M360 150 L520 150',3)+tipAt('mvr',520,150,1.3,0)+inset('mvr','Diamond blade with a micrometer to set depth');
  if(t==='weck')return L('M60 150 L460 150',6,'#d9b38c')+P('M460 136 L560 150 L460 164Z','#f2f5d7')+inset('plain','Cellulose sponge on a stick');
  if(t==='ovd')return P('M80 130 L380 130 L380 170 L80 170Z','url(#plas)')+'<rect x="60" y="140" width="20" height="20" fill="#cfd6de" stroke="'+ST+'"/><rect x="100" y="134" width="240" height="32" fill="#eaf4ff" opacity="0.8"/>'+P('M380 142 L410 145 L410 155 L380 158Z','url(#plas)')+L('M410 150 L560 150 Q570 150 576 158',2.2)+inset('cannula','Viscoelastic syringe with a cannula');
  if(t==='plug')return P('M380 120 Q420 110 460 120 L452 136 L440 136 L440 190 Q420 200 400 190 L400 136 L388 136Z','#cfe6ff')+inset('plain','Cap sits on the punctum; shaft in the canaliculus');
  if(t==='schirmer')return'<rect x="160" y="110" width="400" height="44" fill="#ffffff" stroke="'+ST+'"/>'+L('M200 110 L200 154',1.4,'#c0392b')+(function(){var q='';for(var i=1;i<=35;i++){var x=200+i*10;q+=L('M'+x+' 154 l0 '+(i%5?5:10),0.8)}return q})()+'<path d="M160 110 L200 110 L200 132 L160 132Z" fill="#f4f6f8" stroke="'+ST+'"/><rect x="200" y="112" width="140" height="40" fill="#cfe6ff" opacity="0.6"/>'+inset('plain','Notched filter-paper strip with a mm scale');
  if(t==='fluor')return'<rect x="160" y="120" width="400" height="30" fill="#ffffff" stroke="'+ST+'"/><rect x="480" y="120" width="80" height="30" fill="#ff9f1c" stroke="'+ST+'"/>'+inset('plain','Orange tip impregnated with fluorescein');
  if(t==='amsler'){var q='<rect x="240" y="20" width="260" height="260" fill="#fff" stroke="'+ST+'" stroke-width="2"/>';for(var i=0;i<=20;i++){q+=L('M'+(240+i*13)+' 20 L'+(240+i*13)+' 280',0.6,'#33414f')+L('M240 '+(20+i*13)+' L500 '+(20+i*13),0.6,'#33414f')}return q+'<circle cx="370" cy="150" r="5" fill="#000"/>'+inset('plain','Grid of 5 mm squares with a central dot');}
  if(t==='placido'){var q='<circle cx="380" cy="150" r="120" fill="#fff" stroke="'+ST+'" stroke-width="2"/>';for(var r=110;r>10;r-=20)q+='<circle cx="380" cy="150" r="'+r+'" fill="none" stroke="#000" stroke-width="9"/>';return q+'<circle cx="380" cy="150" r="6" fill="#fff" stroke="'+ST+'"/>'+L('M500 150 L660 150',12)+inset('plain','Concentric rings with a central peephole');}
  if(t==='trial')return'<circle cx="380" cy="150" r="70" fill="#eef6ff" stroke="'+ST+'" stroke-width="8"/>'+L('M450 150 L620 150',10)+'<text x="470" y="140" font-size="16" font-family="Arial" fill="#c0392b">− 2.00</text>'+inset('plain','Metal rim and handle marked with the power');
  if(t==='punch')return roundHandle(40,330,y,18)+L('M330 150 L520 150',5)+P('M520 140 L590 140 L590 160 L520 160Z')+'<rect x="560" y="142" width="16" height="10" fill="#33414f"/>'+inset('trephine','Small punch removes a disc of tissue');
  return''}
 function render(f){var k=f.k,b='';var KEEP={diamond:1,spud:1,punch:1,bulldog:1};
  if(k==='forceps')b=forceps(f);else if(k==='artery')b=artery(f);else if(k==='sscissors')b=springScissors(f);else if(k==='rscissors')b=ringScissors(f);else if(k==='nholder')b=needleHolder(f);else if(k==='knife')b=knife(f);else if(k==='rod')b=rod(f);else if(k==='cannula')b=cannulaD(f);
  else if(k==='wirespec')b=wireSpec();else if(k==='solidspec')b=solidSpec();else if(k==='desmarres')b=desmarres();else if(k==='chalazion')b=chalazion();else if(k==='caliper')b=caliper();else if(k==='schiotz')b=schiotz();else if(k==='ring')b=ring(f);else if(k==='lens')b=lens(f);else if(k==='misc')b=misc(f);
  if(['wirespec','solidspec','desmarres','chalazion','caliper','schiotz','ring','lens'].indexOf(k)>=0||(k==='misc'&&!KEEP[f.t]))b=b.replace(/<g><circle cx="770"[\s\S]*?<\/text><\/g>/,'');
  return'<svg viewBox="0 0 900 300" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Line drawing of an ophthalmic instrument" style="background:#fbfcfe">'+defs()+b+'<text x="14" y="290" font-size="12" fill="#8a96a3" font-family="Arial">RPC Rounds · schematic drawing, not to scale</text></svg>'}
 return{render:render}
})();
if(typeof module!=='undefined')module.exports=DXI;
