(function(){
  'use strict';
  function ready(fn){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',fn,{once:true});else fn();}
  function inject(){
    if(document.getElementById('zetaVisualUpgrade'))return;
    var s=document.createElement('style');
    s.id='zetaVisualUpgrade';
    s.textContent=''
      +'.zvu-progress{position:fixed;top:0;left:0;width:0;height:3px;background:linear-gradient(90deg,#18a9a1,#64d7d0);z-index:99999;transition:width .08s linear}'
      +'.zvu-reveal{opacity:0;transform:translateY(22px);transition:opacity .7s ease,transform .7s ease}.zvu-reveal.zvu-visible{opacity:1;transform:none}'
      +'.zvu-backtop{position:fixed;right:22px;bottom:82px;width:42px;height:42px;border:1px solid #dbe6ea;border-radius:50%;background:#fff;color:#071b2b;box-shadow:0 10px 28px rgba(7,27,43,.14);display:grid;place-items:center;cursor:pointer;z-index:9997;opacity:0;pointer-events:none;transform:translateY(10px);transition:.25s;font-weight:900}.zvu-backtop.show{opacity:1;pointer-events:auto;transform:none}.zvu-backtop:hover{background:#071b2b;color:#fff;border-color:#071b2b}'
      +'.zvu-section-kicker{display:inline-flex;align-items:center;gap:8px}.zvu-section-kicker:before{content:"";width:24px;height:2px;background:#18a9a1;display:inline-block}'
      +'.card .card-body{transition:.25s}.card:hover .card-body{transform:translateY(-2px)}'
      +'.contact-item,.area,.stat-box,.why-item{transition:transform .25s ease,box-shadow .25s ease,border-color .25s ease}.contact-item:hover,.area:hover,.stat-box:hover{box-shadow:0 16px 35px rgba(7,27,43,.09)}'
      +'@media(prefers-reduced-motion:reduce){.zvu-reveal{opacity:1;transform:none;transition:none}.zvu-progress{display:none}}'
      +'@media(max-width:700px){.zvu-backtop{right:12px;bottom:72px;width:40px;height:40px}}';
    document.head.appendChild(s);
  }
  function enhance(){
    inject();
    var progress=document.createElement('div');progress.className='zvu-progress';document.body.appendChild(progress);
    var top=document.createElement('button');top.className='zvu-backtop';top.type='button';top.setAttribute('aria-label','Back to top');top.textContent='↑';document.body.appendChild(top);
    function scroll(){var h=document.documentElement.scrollHeight-window.innerHeight;progress.style.width=(h>0?(window.scrollY/h*100):0)+'%';top.classList.toggle('show',window.scrollY>450);}
    window.addEventListener('scroll',scroll,{passive:true});scroll();top.onclick=function(){window.scrollTo({top:0,behavior:'smooth'});};
    var selectors='.hero-copy,.hero-visual,.trust-strip,.intro,.stats-section,.why,.areas,.section,.contact,.product-detail-hero,.news-detail,.detail-footer,.footer';
    var nodes=document.querySelectorAll(selectors);var io='IntersectionObserver' in window?new IntersectionObserver(function(entries){entries.forEach(function(e){if(e.isIntersecting){e.target.classList.add('zvu-visible');io.unobserve(e.target);}});},{threshold:.08}):null;
    nodes.forEach(function(n){n.classList.add('zvu-reveal');if(io)io.observe(n);else n.classList.add('zvu-visible');});
    document.querySelectorAll('a[target="_blank"]').forEach(function(a){if(!a.rel)a.rel='noopener noreferrer';});
  }
  ready(enhance);
})();
