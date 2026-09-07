(function(){
  'use strict';
  if(window.__zetaHeroMotionLoaded)return;
  window.__zetaHeroMotionLoaded=true;

  function ready(fn){
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',fn,{once:true});
    else fn();
  }

  function collectImages(){
    var urls=[];
    var nodes=document.querySelectorAll('#productsGrid img,.card-image img,.product-card img');
    for(var i=0;i<nodes.length;i++){
      var src=nodes[i].currentSrc||nodes[i].src||nodes[i].getAttribute('src');
      if(src && urls.indexOf(src)===-1)urls.push(src);
      if(urls.length>=6)break;
    }
    if(!urls.length){
      var logo=document.querySelector('.logo img,.visual-card img');
      if(logo){var fallback=logo.currentSrc||logo.src;if(fallback)urls.push(fallback);}
    }
    return urls;
  }

  function inject(){
    if(document.getElementById('zetaHeroMotionStyle'))return;
    var style=document.createElement('style');
    style.id='zetaHeroMotionStyle';
    style.textContent=''
      +'.zeta-hero-motion{position:absolute;inset:0;z-index:4;pointer-events:none;overflow:hidden}'
      +'.zeta-hero-motion:before{content:"";position:absolute;width:420px;height:420px;right:50px;top:-35px;border-radius:50%;background:radial-gradient(circle,rgba(24,169,161,.18),rgba(24,169,161,.02) 52%,transparent 72%);filter:blur(2px);animation:zetaHeroGlow 7s ease-in-out infinite}'
      +'.zeta-hero-motion .zhm-ring{position:absolute;right:55px;top:5px;width:390px;height:390px;border:1px solid rgba(98,205,209,.22);border-radius:50%;animation:zetaHeroSpin 24s linear infinite}'
      +'.zeta-hero-motion .zhm-ring:before,.zeta-hero-motion .zhm-ring:after{content:"";position:absolute;border:1px dashed rgba(117,103,200,.20);border-radius:50%}'
      +'.zeta-hero-motion .zhm-ring:before{inset:34px;transform:rotate(55deg)}.zeta-hero-motion .zhm-ring:after{inset:75px;transform:rotate(-35deg)}'
      +'.zhm-orb{position:absolute;width:12px;height:12px;border-radius:50%;background:#62cdd1;box-shadow:0 0 24px rgba(98,205,209,.8);animation:zetaHeroOrbit 9s linear infinite}.zhm-orb.o1{right:246px;top:6px}.zhm-orb.o2{right:58px;top:193px;background:#7567c8;animation-delay:-3s}.zhm-orb.o3{right:245px;bottom:0;background:#d8a84e;animation-delay:-6s}'
      +'.zhm-image-stack{position:absolute;right:94px;top:28px;width:300px;height:345px;perspective:1000px}'
      +'.zhm-image{position:absolute;right:0;top:22px;width:255px;height:300px;border-radius:28px;overflow:hidden;background:linear-gradient(145deg,#071b2b,#0b5f73);border:1px solid rgba(255,255,255,.22);box-shadow:0 34px 80px rgba(7,27,43,.30),0 0 0 1px rgba(98,205,209,.08);opacity:0;transform:translate3d(45px,22px,-80px) rotateY(-13deg) scale(.88);transition:opacity .8s ease,transform 1s cubic-bezier(.2,.75,.2,1);backface-visibility:hidden}'
      +'.zhm-image.is-active{opacity:1;transform:translate3d(0,0,0) rotateY(0) scale(1);z-index:5}.zhm-image.is-prev{opacity:.30;transform:translate3d(-28px,-18px,-100px) rotateY(12deg) scale(.84);z-index:3}.zhm-image.is-next{opacity:.18;transform:translate3d(30px,28px,-150px) rotateY(-18deg) scale(.76);z-index:2}'
      +'.zhm-image img{width:100%;height:100%;object-fit:contain;padding:22px;filter:drop-shadow(0 20px 25px rgba(0,0,0,.18));animation:zetaProductFloat 5s ease-in-out infinite}'
      +'.zhm-image:after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(255,255,255,.10),transparent 28%,rgba(7,27,43,.10));pointer-events:none}'
      +'.zhm-label{position:absolute;right:15px;bottom:15px;left:15px;padding:10px 12px;border-radius:14px;background:rgba(7,27,43,.72);border:1px solid rgba(255,255,255,.14);backdrop-filter:blur(10px);color:#fff;display:flex;align-items:center;justify-content:space-between;gap:10px;font-size:10px;letter-spacing:.12em;text-transform:uppercase}'
      +'.zhm-label b{font-size:11px;letter-spacing:.06em}.zhm-label span{color:#62cdd1}'
      +'.zhm-pill{position:absolute;right:8px;top:70px;padding:9px 12px;border-radius:999px;background:rgba(255,255,255,.90);border:1px solid rgba(24,169,161,.20);box-shadow:0 18px 40px rgba(7,27,43,.15);color:#0b5f73;font-size:10px;font-weight:900;letter-spacing:.12em;animation:zetaChipFloat 4.5s ease-in-out infinite}'
      +'.zhm-pill.p2{right:auto;left:0;top:auto;bottom:84px;color:#7567c8;animation-delay:-2.1s}.zhm-pulse{position:absolute;right:214px;top:154px;width:84px;height:84px;border-radius:50%;border:1px solid rgba(98,205,209,.22);animation:zetaPulse 2.8s ease-out infinite}'
      +'.hero-visual{position:relative}.visual-card{transition:opacity .7s ease,transform .7s ease}.hero-motion-ready .visual-card{opacity:.22;transform:scale(.96)}'
      +'@keyframes zetaHeroSpin{to{transform:rotate(360deg)}}@keyframes zetaHeroOrbit{to{transform:rotate(360deg) translateX(190px) rotate(-360deg)}}@keyframes zetaHeroGlow{0%,100%{transform:translate3d(0,0,0) scale(1);opacity:.65}50%{transform:translate3d(-12px,14px,0) scale(1.08);opacity:1}}@keyframes zetaProductFloat{0%,100%{transform:translateY(0) rotate(-1deg)}50%{transform:translateY(-10px) rotate(1deg)}}@keyframes zetaChipFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-9px)}}@keyframes zetaPulse{0%{transform:scale(.72);opacity:.65}100%{transform:scale(1.55);opacity:0}}'
      +'@media(max-width:800px){.zeta-hero-motion:before{right:50%;transform:translateX(50%);top:5px;width:330px;height:330px}.zeta-hero-motion .zhm-ring{right:50%;transform:translateX(50%);top:0;width:300px;height:300px}.zhm-image-stack{right:50%;transform:translateX(50%);top:5px;width:260px;height:305px}.zhm-image{width:220px;height:270px;right:20px}.zhm-pill{right:0}.zhm-pill.p2{left:0;bottom:48px}.zhm-orb.o1{right:calc(50% + 72px);top:0}.zhm-orb.o2{right:calc(50% - 145px);top:145px}.zhm-orb.o3{right:calc(50% + 72px);bottom:0}.zhm-pulse{right:calc(50% - 42px);top:122px}.hero-motion-ready .visual-card{opacity:.08}}'
      +'@media(prefers-reduced-motion:reduce){.zeta-hero-motion *{animation:none!important;transition:none!important}}';
    document.head.appendChild(style);
  }

  function build(){
    var visual=document.querySelector('.hero-visual');
    if(!visual || document.getElementById('zetaHeroMotion'))return;
    var urls=collectImages();
    if(!urls.length)return;
    inject();
    var layer=document.createElement('div');
    layer.id='zetaHeroMotion';
    layer.className='zeta-hero-motion';
    layer.innerHTML='<div class="zhm-ring"></div><i class="zhm-orb o1"></i><i class="zhm-orb o2"></i><i class="zhm-orb o3"></i><i class="zhm-pulse"></i><div class="zhm-image-stack"></div><div class="zhm-pill">QUALITY / TRUST</div><div class="zhm-pill p2">CARE / CURE</div>';
    visual.appendChild(layer);
    var stack=layer.querySelector('.zhm-image-stack');
    for(var i=0;i<urls.length;i++){
      var card=document.createElement('div');
      card.className='zhm-image'+(i===0?' is-active':i===1?' is-next':'');
      card.innerHTML='<img src="'+urls[i].replace(/"/g,'&quot;')+'" alt="ZETA BIOTECH pharmaceutical product"><div class="zhm-label"><b>ZETA BIOTECH</b><span>PHARMA</span></div>';
      stack.appendChild(card);
    }
    visual.classList.add('hero-motion-ready');
    var cards=stack.querySelectorAll('.zhm-image');
    if(cards.length<2)return;
    var index=0;
    function show(next){
      index=next%cards.length;
      for(var j=0;j<cards.length;j++){
        cards[j].classList.remove('is-active','is-prev','is-next');
      }
      cards[index].classList.add('is-active');
      cards[(index-1+cards.length)%cards.length].classList.add('is-prev');
      cards[(index+1)%cards.length].classList.add('is-next');
    }
    window.setInterval(function(){show(index+1)},5200);

    visual.addEventListener('mousemove',function(event){
      if(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
      var rect=visual.getBoundingClientRect();
      var x=(event.clientX-rect.left)/rect.width-.5;
      var y=(event.clientY-rect.top)/rect.height-.5;
      stack.style.transform='translate3d('+(x*-10)+'px,'+(y*-8)+'px,0)';
      layer.querySelector('.zhm-ring').style.transform='translate3d('+(x*8)+'px,'+(y*5)+'px,0)';
    });
    visual.addEventListener('mouseleave',function(){stack.style.transform='';layer.querySelector('.zhm-ring').style.transform='';});
  }

  ready(function(){
    var attempts=0;
    var timer=window.setInterval(function(){
      attempts++;
      build();
      if(document.getElementById('zetaHeroMotion')||attempts>=20)window.clearInterval(timer);
    },750);
  });
})();