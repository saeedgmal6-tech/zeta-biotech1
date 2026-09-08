(function(){
'use strict';

function addStyles(){
  if(document.getElementById('zetaProduct3DStyles'))return;
  var s=document.createElement('style');
  s.id='zetaProduct3DStyles';
  s.textContent=''
  +'.zeta-product-3d{position:relative;perspective:1100px;isolation:isolate;overflow:visible}'
  +'.zeta-product-3d::before{content:"";position:absolute;left:12%;right:12%;bottom:5%;height:18%;background:radial-gradient(ellipse,rgba(7,27,43,.22),transparent 70%);filter:blur(12px);transform:translateZ(-40px);z-index:-1;pointer-events:none}'
  +'.zeta-product-3d img{transform:translate3d(0,0,0) rotateX(0) rotateY(0) scale(1);transform-style:preserve-3d;backface-visibility:hidden;will-change:transform;transition:transform .22s cubic-bezier(.2,.8,.2,1),filter .22s ease;filter:drop-shadow(0 20px 24px rgba(7,27,43,.16))}'
  +'.zeta-product-3d:hover img{filter:drop-shadow(0 30px 34px rgba(7,27,43,.22))}'
  +'.zeta-product-3d::after{content:"";position:absolute;inset:8%;border-radius:50%;background:radial-gradient(circle at 35% 30%,rgba(97,217,210,.18),transparent 34%),radial-gradient(circle at 70% 65%,rgba(117,103,200,.12),transparent 40%);pointer-events:none;z-index:-1}'
  +'.zeta-product-3d[data-zeta-3d-ready="true"]{animation:zetaProductFloat 6s ease-in-out infinite}'
  +'@keyframes zetaProductFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}'
  +'@media(max-width:700px){.zeta-product-3d[data-zeta-3d-ready="true"]{animation:none}.zeta-product-3d img{transition:transform .28s ease}}'
  +'@media(prefers-reduced-motion:reduce){.zeta-product-3d[data-zeta-3d-ready="true"]{animation:none}.zeta-product-3d img{transition:none}}';
  document.head.appendChild(s);
}

function wrapImage(img){
  if(!img||img.dataset.zeta3d==='1')return;
  if(!img.src||img.src.indexOf('data:')===0)return;
  var parent=img.parentElement;
  if(parent&&parent.classList.contains('zeta-product-3d'))return;
  var wrap=document.createElement('div');
  wrap.className='zeta-product-3d';
  wrap.setAttribute('data-zeta-3d-ready','false');
  wrap.style.cssText='position:relative;display:block;width:100%;height:100%;min-height:120px;';
  if(parent){
    parent.insertBefore(wrap,img);
    wrap.appendChild(img);
  }else return;
  img.dataset.zeta3d='1';
  img.decoding='async';
  img.loading=img.loading||'lazy';
  img.addEventListener('load',function(){wrap.setAttribute('data-zeta-3d-ready','true')},{once:true});
  if(img.complete)wrap.setAttribute('data-zeta-3d-ready','true');
  wrap.addEventListener('pointermove',function(e){
    if(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    var r=wrap.getBoundingClientRect();
    var x=(e.clientX-r.left)/r.width-.5;
    var y=(e.clientY-r.top)/r.height-.5;
    var rx=(-y*10).toFixed(2);
    var ry=(x*14).toFixed(2);
    img.style.transform='translate3d('+(x*7).toFixed(2)+'px,'+(y*5).toFixed(2)+'px,18px) rotateX('+rx+'deg) rotateY('+ry+'deg) scale(1.035)';
  });
  wrap.addEventListener('pointerleave',function(){img.style.transform='translate3d(0,0,0) rotateX(0) rotateY(0) scale(1)';});
  wrap.addEventListener('touchmove',function(e){
    if(!e.touches||!e.touches[0])return;
    var r=wrap.getBoundingClientRect();
    var x=(e.touches[0].clientX-r.left)/r.width-.5;
    var y=(e.touches[0].clientY-r.top)/r.height-.5;
    img.style.transform='translate3d('+(x*5).toFixed(2)+'px,'+(y*4).toFixed(2)+'px,14px) rotateX('+(-y*7).toFixed(2)+'deg) rotateY('+(x*9).toFixed(2)+'deg) scale(1.02)';
  },{passive:true});
}

function scan(){
  addStyles();
  var imgs=document.querySelectorAll('img');
  imgs.forEach(function(img){
    var src=String(img.currentSrc||img.src||'');
    if(!src)return;
    if(/product|upload|assets\/uploads|content\/products/i.test(src)||img.closest('#products,.products,.product,.product-card,.product-grid,.product-detail,.product-gallery,.featured-products'))wrapImage(img);
  });
}

function boot(){
  scan();
  setTimeout(scan,900);
  setTimeout(scan,2200);
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
