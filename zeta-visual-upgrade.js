(function(){
  'use strict';
  function ready(fn){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',fn,{once:true});else fn();}
  function inject(){
    if(document.getElementById('zetaVisualUpgrade'))return;
    var s=document.createElement('style');
    s.id='zetaVisualUpgrade';
    s.textContent=''
      +'.zvu-progress{position:fixed;top:0;left:0;width:0;height:3px;background:linear-gradient(90deg,#18a9a1,#64d7d0,#8be3cf);z-index:99999;transition:width .08s linear}'
      +'.zvu-reveal{opacity:0;transform:translateY(22px);transition:opacity .7s ease,transform .7s ease}.zvu-reveal.zvu-visible{opacity:1;transform:none}'
      +'.zvu-backtop{position:fixed;right:22px;bottom:82px;width:42px;height:42px;border:1px solid #dbe6ea;border-radius:50%;background:#fff;color:#071b2b;box-shadow:0 10px 28px rgba(7,27,43,.14);display:grid;place-items:center;cursor:pointer;z-index:9997;opacity:0;pointer-events:none;transform:translateY(10px);transition:.25s;font-weight:900}.zvu-backtop.show{opacity:1;pointer-events:auto;transform:none}.zvu-backtop:hover{background:#071b2b;color:#fff;border-color:#071b2b}'
      +'.zvu-section-kicker{display:inline-flex;align-items:center;gap:8px}.zvu-section-kicker:before{content:"";width:24px;height:2px;background:#18a9a1;display:inline-block}'
      +'.card .card-body{transition:.25s}.card:hover .card-body{transform:translateY(-2px)}'
      +'.contact-item,.area,.stat-box,.why-item{transition:transform .25s ease,box-shadow .25s ease,border-color .25s ease}.contact-item:hover,.area:hover,.stat-box:hover{box-shadow:0 16px 35px rgba(7,27,43,.09)}'
      +':root{--zeta-aqua:#18a9a1;--zeta-mint:#e8f8f5;--zeta-blue:#0b5f73;--zeta-sky:#62cdd1;--zeta-gold:#d8a84e;--zeta-lavender:#7567c8;--zeta-coral:#e77b67;--zeta-soft-blue:#eef7fb;--zeta-soft-gold:#fbf6e9}'
      +'body{background:linear-gradient(180deg,#f3fbfa 0%,#ffffff 18%,#f5fafc 48%,#ffffff 76%,#f2faf9 100%);background-attachment:fixed}'
      +'.topbar{background:linear-gradient(90deg,#061724,#0b3043 52%,#0b5f73);border-bottom:1px solid rgba(255,255,255,.08)}'
      +'.header{background:rgba(255,255,255,.88);box-shadow:0 8px 30px rgba(7,27,43,.05);border-bottom-color:rgba(24,169,161,.14)}'
      +'.header nav a{transition:color .25s ease,transform .25s ease}.header nav a:hover{transform:translateY(-1px)}'
      +'.language{border-color:rgba(24,169,161,.35);background:linear-gradient(180deg,#fff,#f3fbfa);box-shadow:0 5px 18px rgba(24,169,161,.08)}'
      +'.btn.primary{background:linear-gradient(135deg,#071b2b,#0b5f73);border-color:#0b5f73;box-shadow:0 12px 28px rgba(7,27,43,.18)}'
      +'.btn.primary:hover{background:linear-gradient(135deg,#18a9a1,#0b7773);border-color:#18a9a1;box-shadow:0 14px 30px rgba(24,169,161,.22)}'
      +'.btn.ghost:hover{background:linear-gradient(135deg,#f0fbfa,#eef7fb);border-color:rgba(24,169,161,.35)}'
      +'.hero{background:radial-gradient(circle at 12% 15%,rgba(24,169,161,.13),transparent 32%),radial-gradient(circle at 92% 65%,rgba(117,103,200,.10),transparent 30%),linear-gradient(135deg,#f4fbfa 0%,#ffffff 52%,#eef7fb 100%);position:relative;overflow:hidden}.hero:after{content:"";position:absolute;left:-120px;bottom:-180px;width:420px;height:420px;border-radius:50%;background:radial-gradient(circle,rgba(216,168,78,.12),transparent 68%);pointer-events:none}'
      +'.hero-copy h1{background:linear-gradient(135deg,#071b2b 20%,#0b5f73 68%,#18a9a1);-webkit-background-clip:text;background-clip:text;color:transparent}'
      +'.eyebrow>span:first-child{background:linear-gradient(90deg,#18a9a1,#62cdd1)}'
      +'.hero-stats b{color:#0b7773}.hero-stats div{position:relative}.hero-stats div:before{content:"";width:4px;height:4px;border-radius:50%;background:#d8a84e;position:absolute;right:-17px;top:9px}'
      +'.visual-card{background:linear-gradient(145deg,#061724 0%,#0b3043 48%,#0b5f73 100%);border:1px solid rgba(98,205,209,.22);box-shadow:0 35px 90px rgba(7,27,43,.24),inset 0 1px 0 rgba(255,255,255,.08)}'
      +'.visual-card:after{content:"";position:absolute;inset:10px;border:1px solid rgba(255,255,255,.06);border-radius:21px;pointer-events:none}'
      +'.floating-chip{box-shadow:0 18px 40px rgba(7,27,43,.14);border-color:rgba(24,169,161,.18)}'
      +'.floating-chip>span{background:linear-gradient(135deg,#e8f8f5,#eef7fb);color:#0b7773}'
      +'.orbit-a{border-color:rgba(24,169,161,.28)}.orbit-b{border-color:rgba(117,103,200,.13)}'
      +'.trust-strip{background:linear-gradient(90deg,#eaf8f6,#ffffff,#f3f1fc);border-color:rgba(24,169,161,.14);box-shadow:0 12px 35px rgba(7,27,43,.045)}'
      +'.trust-inner i{background:#d8a84e;box-shadow:0 0 0 4px rgba(216,168,78,.10)}'
      +'.intro{background:linear-gradient(180deg,rgba(232,248,245,.72),#ffffff 72%);border-top:1px solid rgba(24,169,161,.08);border-bottom:1px solid rgba(24,169,161,.06);position:relative}.intro:before{content:"";position:absolute;inset:0;background:radial-gradient(circle at 85% 30%,rgba(117,103,200,.08),transparent 25%);pointer-events:none}'
      +'.section,.areas{position:relative}.section:nth-of-type(even){background:linear-gradient(180deg,#ffffff,#f5fafc)}.section-title h2,.section-head h2{background:linear-gradient(135deg,#071b2b,#0b5f73);-webkit-background-clip:text;background-clip:text;color:transparent}'
      +'.section-head{position:relative}.section-head:after{content:"";position:absolute;right:0;bottom:-18px;width:90px;height:3px;border-radius:3px;background:linear-gradient(90deg,#18a9a1,#62cdd1,#d8a84e)}'
      +'.search{box-shadow:0 8px 24px rgba(7,27,43,.05);border-color:rgba(24,169,161,.18);background:rgba(255,255,255,.9)}.search:focus-within{border-color:#18a9a1;box-shadow:0 0 0 4px rgba(24,169,161,.08)}'
      +'.card{border-color:rgba(7,27,43,.08);box-shadow:0 8px 26px rgba(7,27,43,.035);background:linear-gradient(180deg,#fff,#fbfdfd);position:relative;overflow:hidden}.card:before{content:"";position:absolute;right:0;top:0;width:100%;height:3px;background:linear-gradient(90deg,#18a9a1,#62cdd1);opacity:.75;transition:.25s}.card:nth-child(3n+2):before{background:linear-gradient(90deg,#7567c8,#a49be0)}.card:nth-child(3n):before{background:linear-gradient(90deg,#d8a84e,#efd18a)}'
      +'.card:hover{border-color:rgba(24,169,161,.28);box-shadow:0 22px 50px rgba(7,27,43,.11);transform:translateY(-5px)}'
      +'.card-image{background:radial-gradient(circle at 50% 40%,#ffffff 0%,#f1f8f8 72%,#e9f4f5 100%)}'
      +'.card h3{color:#0b3043}.meta{color:#0b7773}.small-btn{border-color:rgba(24,169,161,.18);background:linear-gradient(180deg,#fff,#f8fcfc)}.small-btn:hover{background:#e8f8f5;border-color:#18a9a1}'
      +'.stats-section{background:linear-gradient(180deg,#eef8f8 0%,#f9fcfd 50%,#eef7fb 100%);border-top:1px solid rgba(24,169,161,.08);border-bottom:1px solid rgba(24,169,161,.08);position:relative}.stats-section:before{content:"";position:absolute;inset:0;background:radial-gradient(circle at 18% 45%,rgba(24,169,161,.10),transparent 24%),radial-gradient(circle at 82% 55%,rgba(117,103,200,.08),transparent 24%);pointer-events:none}'
      +'.stat-box{position:relative;overflow:hidden;background:rgba(255,255,255,.86);border-color:rgba(24,169,161,.12);box-shadow:0 12px 32px rgba(7,27,43,.055)}.stat-box:before{content:"";position:absolute;right:0;top:0;width:5px;height:100%;background:linear-gradient(180deg,#18a9a1,#62cdd1)}.stat-box:nth-child(2):before{background:linear-gradient(180deg,#7567c8,#a49be0)}.stat-box:nth-child(3):before{background:linear-gradient(180deg,#d8a84e,#efd18a)}.stat-box:nth-child(4):before{background:linear-gradient(180deg,#e77b67,#f0ad9f)}.stat-box b{background:linear-gradient(135deg,#071b2b,#0b5f73);-webkit-background-clip:text;background-clip:text;color:transparent}'
      +'.why{background:radial-gradient(circle at 8% 20%,rgba(24,169,161,.28),transparent 30%),radial-gradient(circle at 88% 80%,rgba(117,103,200,.16),transparent 28%),linear-gradient(135deg,#061724,#08283a 55%,#0b5f73);position:relative}.why:after{content:"";position:absolute;inset:0;background:linear-gradient(120deg,transparent 35%,rgba(255,255,255,.025) 50%,transparent 65%);pointer-events:none}.why-item{background:linear-gradient(145deg,rgba(255,255,255,.085),rgba(24,169,161,.035));border-color:rgba(255,255,255,.14);backdrop-filter:blur(8px)}.why-item:hover{transform:translateY(-4px);border-color:rgba(98,205,209,.45);background:linear-gradient(145deg,rgba(255,255,255,.12),rgba(24,169,161,.08));box-shadow:0 20px 45px rgba(0,0,0,.16)}'
      +'.areas{background:linear-gradient(180deg,#f7fbfc,#ffffff 52%,#f5faf9)}.area{position:relative;overflow:hidden;background:linear-gradient(145deg,#ffffff,#f1f9f8);border-color:rgba(24,169,161,.12);box-shadow:0 10px 28px rgba(7,27,43,.045)}.area:before{content:"";position:absolute;right:0;top:0;width:100%;height:4px;background:linear-gradient(90deg,#18a9a1,#62cdd1)}.area:nth-child(2):before{background:linear-gradient(90deg,#7567c8,#a49be0)}.area:nth-child(3):before{background:linear-gradient(90deg,#d8a84e,#efd18a)}.area:nth-child(4):before{background:linear-gradient(90deg,#e77b67,#f0ad9f)}.area:hover{transform:translateY(-5px);border-color:rgba(24,169,161,.3);box-shadow:0 18px 38px rgba(7,27,43,.09)}'
      +'.contact{background:radial-gradient(circle at 88% 20%,rgba(117,103,200,.22),transparent 26%),radial-gradient(circle at 12% 75%,rgba(24,169,161,.24),transparent 30%),linear-gradient(135deg,#061724,#08283a 55%,#0b5f73);position:relative;overflow:hidden}.contact:after{content:"";position:absolute;right:-180px;bottom:-220px;width:500px;height:500px;border-radius:50%;border:1px solid rgba(98,205,209,.12);box-shadow:0 0 0 45px rgba(98,205,209,.025),0 0 0 90px rgba(98,205,209,.018);pointer-events:none}'
      +'.contact-glow{background:radial-gradient(circle,#18a9a1,rgba(24,169,161,0));opacity:.22}.contact-item{background:linear-gradient(145deg,rgba(255,255,255,.10),rgba(255,255,255,.035));border-color:rgba(255,255,255,.15);backdrop-filter:blur(10px)}.contact-item:hover{border-color:rgba(98,205,209,.62);box-shadow:0 20px 42px rgba(0,0,0,.18);transform:translateY(-4px)}.contact-icon{background:linear-gradient(135deg,rgba(24,169,161,.24),rgba(98,205,209,.10));box-shadow:inset 0 0 0 1px rgba(98,205,209,.08)}'
      +'.contact-form input,.contact-form textarea{background:rgba(255,255,255,.075);border-color:rgba(255,255,255,.16)}.contact-form input:focus,.contact-form textarea:focus{border-color:#62cdd1;box-shadow:0 0 0 3px rgba(98,205,209,.10)}'
      +'.product-detail-hero{background:radial-gradient(circle at 8% 15%,rgba(24,169,161,.14),transparent 30%),radial-gradient(circle at 90% 80%,rgba(117,103,200,.08),transparent 28%),linear-gradient(135deg,#eef9f7,#fff 52%,#eef7fb)}'
      +'.product-detail-image{background:linear-gradient(145deg,#061724,#0b3043 52%,#0b5f73);border:1px solid rgba(98,205,209,.18);box-shadow:0 35px 80px rgba(7,27,43,.20)}'
      +'.detail-line{background:linear-gradient(90deg,#18a9a1,#62cdd1,#d8a84e);border-radius:3px}.detail-facts{border-color:rgba(24,169,161,.16);background:rgba(255,255,255,.76)}.detail-facts b{color:#0b3043}'
      +'.detail-footer{background:linear-gradient(135deg,#eaf7f5,#f5f1fb);border-top:1px solid rgba(24,169,161,.08)}'
      +'.news-detail{background:linear-gradient(180deg,#f5fbfa,#fff 38%,#f7fbfc)}.news-hero img{box-shadow:0 25px 55px rgba(7,27,43,.12);border:1px solid rgba(24,169,161,.12)}'
      +'.footer{background:linear-gradient(135deg,#061724,#08283a 55%,#0b5f73)!important;color:#fff}.footer-inner{border-top:1px solid rgba(98,205,209,.15)}.footer a{color:rgba(255,255,255,.82)}.footer a:hover{color:#62d8d0}'
      +'.zeta-ai-widget,.ai-widget,.zeta-ai-float{box-shadow:0 20px 55px rgba(7,27,43,.20)}'
      +'@media(prefers-reduced-motion:reduce){.zvu-reveal{opacity:1;transform:none;transition:none}.zvu-progress{display:none}}'
      +'@media(max-width:700px){body{background:#f7fbfc}.zvu-backtop{right:12px;bottom:72px;width:40px;height:40px}.hero-copy h1{letter-spacing:-1px}.section-head:after{width:60px}.card:hover,.area:hover,.contact-item:hover{transform:none}.why{background:linear-gradient(145deg,#061724,#0b5f73)}}';
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
