/* Site extras (Nov 2026): larger-text toggle on every page. */
(function(){
 /* ---------- 1. Larger text ---------- */
 var K='rpc-bigtext',root=document.documentElement;
 try{if(localStorage.getItem(K)==='1')root.classList.add('big-text');}catch(e){}
 function label(){return root.classList.contains('big-text')?'A− Normal text':'A+ Larger text';}
 var strip=document.querySelector('p.phone');
 var b=document.createElement('a');b.href='#';b.className='a11y-size';b.setAttribute('role','button');b.textContent=label();
 b.addEventListener('click',function(e){e.preventDefault();root.classList.toggle('big-text');b.textContent=label();
  try{localStorage.setItem(K,root.classList.contains('big-text')?'1':'0');}catch(x){}});
 if(strip){b.className+=' ml-2';strip.appendChild(b);}else{b.className+=' a11y-float';document.body.appendChild(b);}

})();
