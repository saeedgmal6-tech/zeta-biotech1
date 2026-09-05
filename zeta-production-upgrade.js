(function(){
  'use strict';
  var VERSION='2026-09-05-production-1';
  var state={page:1,pageSize:9,category:'',form:''};
  function ready(fn){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',fn);else fn();}
  function addStyle(){
    if(document.getElementById('zetaProductionUpgradeStyle'))return;
    var s=document.createElement('style');s.id='zetaProductionUpgradeStyle';
    s.textContent=''+
      '.zpu-toolbar{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin:-18px 0 28px;padding:12px;border:1px solid var(--line,#dbe6ea);background:rgba(255,255,255,.82);border-radius:14px}'+
      '.zpu-toolbar label{font-size:11px;font-weight:800;color:var(--navy,#071b2b);display:flex;align-items:center;gap:7px}'+
      '.zpu-toolbar select{border:1px solid var(--line,#dbe6ea);background:#fff;border-radius:9px;padding:9px 12px;color:var(--navy,#071b2b);font-size:11px;min-width:145px;outline:0}'+
      '.zpu-count{margin-inline-start:auto;font-size:11px;color:var(--muted,#64727c);font-weight:700}'+
      '.zpu-pagination{display:flex;justify-content:center;align-items:center;gap:7px;margin-top:28px;flex-wrap:wrap}'+
      '.zpu-page{min-width:38px;height:38px;border:1px solid var(--line,#dbe6ea);background:#fff;border-radius:9px;color:var(--navy,#071b2b);font-size:11px;font-weight:800;cursor:pointer}'+
      '.zpu-page:hover,.zpu-page.active{border-color:var(--teal,#18a9a1);color:var(--teal,#18a9a1)}'+
      '.zpu-page:disabled{opacity:.45;cursor:not-allowed}'+
      '.zpu-skip{position:absolute;top:8px;inset-inline-start:8px;z-index:9999;background:var(--navy,#071b2b);color:#fff;padding:10px 14px;border-radius:8px;transform:translateY(-160%);transition:.2s;font-size:12px;font-weight:800}'+
      '.zpu-skip:focus{transform:translateY(0)}'+
      '.zpu-focus:focus-visible{outline:3px solid var(--teal,#18a9a1);outline-offset:3px}'+
      '@media(max-width:650px){.zpu-toolbar{align-items:stretch}.zpu-toolbar label{width:100%;justify-content:space-between}.zpu-toolbar select{flex:1}.zpu-count{width:100%;margin:0;text-align:center}}';
    document.head.appendChild(s);
  }
  function skipLink(){
    if(document.querySelector('.zpu-skip'))return;
    var a=document.createElement('a');a.className='zpu-skip';a.href='#main-content';a.textContent=document.documentElement.lang==='en'?'Skip to content':'تخطي إلى المحتوى';document.body.insertBefore(a,document.body.firstChild);
    var main=document.querySelector('main');if(main&&!main.id)main.id='main-content';
  }
  function accessibility(){
    try{
      document.querySelectorAll('button,a,input,select,textarea').forEach(function(el){el.classList.add('zpu-focus');});
      document.querySelectorAll('img').forEach(function(img){if(!img.alt)img.alt='ZETA BIOTECH';if(!img.loading)img.loading='lazy';if(!img.decoding)img.decoding='async';});
      var menu=document.getElementById('menu');var nav=document.getElementById('nav');
      if(menu&&nav){menu.setAttribute('aria-expanded',nav.classList.contains('open')?'true':'false');menu.addEventListener('click',function(){setTimeout(function(){menu.setAttribute('aria-expanded',nav.classList.contains('open')?'true':'false');},0);});document.addEventListener('keydown',function(e){if(e.key==='Escape'&&nav.classList.contains('open')){menu.click();menu.focus();}});}
      var grids=['productsGrid','brochuresGrid','newsGrid'];grids.forEach(function(id){var g=document.getElementById(id);if(g&&!g.getAttribute('aria-live'))g.setAttribute('aria-live','polite');});
    }catch(e){}
  }
  function textOf(card){return String(card.innerText||card.textContent||'').trim().toLowerCase();}
  function getField(card,labels){
    var t=textOf(card);for(var i=0;i<labels.length;i++){var p=t.indexOf(labels[i]);if(p>=0)return t.slice(p,p+120);}return t;
  }
  function collectProductCards(){var g=document.getElementById('productsGrid');return g?Array.prototype.slice.call(g.children).filter(function(c){return c.nodeType===1&&!c.classList.contains('empty');}):[];}
  function values(cards){
    var cats={},forms={};
    cards.forEach(function(c){var t=textOf(c);var m=t.match(/(?:category|التصنيف)\s*:?\s*([^\n]+)/i);if(m&&m[1])cats[m[1].trim()]=1;var f=t.match(/(?:dosage form|الشكل الدوائي)\s*:?\s*([^\n]+)/i);if(f&&f[1])forms[f[1].trim()]=1;});
    return {cats:Object.keys(cats).sort(),forms:Object.keys(forms).sort()};
  }
  function ensureToolbar(){
    var grid=document.getElementById('productsGrid');if(!grid)return null;
    var old=document.getElementById('zpuProductToolbar');if(old)return old;
    var toolbar=document.createElement('div');toolbar.id='zpuProductToolbar';toolbar.className='zpu-toolbar';
    toolbar.innerHTML='<label><span data-ar="التصنيف" data-en="Category">التصنيف</span><select id="zpuCategory"><option value="">الكل</option></select></label><label><span data-ar="الشكل الدوائي" data-en="Dosage form">الشكل الدوائي</span><select id="zpuForm"><option value="">الكل</option></select></label><span id="zpuCount" class="zpu-count" aria-live="polite"></span>';
    grid.parentNode.insertBefore(toolbar,grid);
    var pager=document.createElement('div');pager.id='zpuPagination';pager.className='zpu-pagination';grid.parentNode.appendChild(pager);
    var cat=document.getElementById('zpuCategory'),form=document.getElementById('zpuForm');
    cat.addEventListener('change',function(){state.category=cat.value;state.page=1;apply();});form.addEventListener('change',function(){state.form=form.value;state.page=1;apply();});
    return toolbar;
  }
  function syncOptions(cards){
    var vf=values(cards),cat=document.getElementById('zpuCategory'),form=document.getElementById('zpuForm');if(!cat||!form)return;
    var currentCat=state.category,currentForm=state.form;
    cat.innerHTML='<option value="">'+(document.documentElement.lang==='en'?'All categories':'الكل')+'</option>';
    form.innerHTML='<option value="">'+(document.documentElement.lang==='en'?'All dosage forms':'الكل')+'</option>';
    vf.cats.forEach(function(v){var o=document.createElement('option');o.value=v;o.textContent=v;cat.appendChild(o);});
    vf.forms.forEach(function(v){var o=document.createElement('option');o.value=v;o.textContent=v;form.appendChild(o);});
    cat.value=vf.cats.indexOf(currentCat)>=0?currentCat:'';form.value=vf.forms.indexOf(currentForm)>=0?currentForm:'';state.category=cat.value;state.form=form.value;
  }
  function matches(card){
    var t=textOf(card);var cat=state.category.toLowerCase(),form=state.form.toLowerCase();
    if(cat&&!t.includes(cat))return false;if(form&&!t.includes(form))return false;return true;
  }
  function pagination(total){
    var pager=document.getElementById('zpuPagination');if(!pager)return;pager.innerHTML='';var pages=Math.max(1,Math.ceil(total/state.pageSize));if(state.page>pages)state.page=pages;
    if(pages<=1){pager.style.display='none';return;}pager.style.display='flex';
    var prev=document.createElement('button');prev.className='zpu-page';prev.type='button';prev.textContent='‹';prev.disabled=state.page===1;prev.setAttribute('aria-label','Previous page');prev.onclick=function(){state.page--;apply();};pager.appendChild(prev);
    for(var i=1;i<=pages;i++){(function(n){var b=document.createElement('button');b.className='zpu-page'+(n===state.page?' active':'');b.type='button';b.textContent=n;b.setAttribute('aria-label','Page '+n);if(n===state.page)b.setAttribute('aria-current','page');b.onclick=function(){state.page=n;apply();};pager.appendChild(b);})(i);}
    var next=document.createElement('button');next.className='zpu-page';next.type='button';next.textContent='›';next.disabled=state.page===pages;next.setAttribute('aria-label','Next page');next.onclick=function(){state.page++;apply();};pager.appendChild(next);
  }
  function apply(){
    var cards=collectProductCards();if(!cards.length){var c=document.getElementById('zpuCount');if(c)c.textContent='';return;}
    syncOptions(cards);var matched=cards.filter(matches);var start=(state.page-1)*state.pageSize,end=start+state.pageSize;
    cards.forEach(function(c){c.style.display='none';});matched.slice(start,end).forEach(function(c){c.style.display='';});
    var count=document.getElementById('zpuCount');if(count)count.textContent=(document.documentElement.lang==='en'?'Showing ':'عرض ')+Math.min(end,matched.length)+' '+(document.documentElement.lang==='en'?'of ':'من ')+matched.length;
    pagination(matched.length);
  }
  function productEnhancement(){
    var grid=document.getElementById('productsGrid');if(!grid)return;
    ensureToolbar();
    var observer=new MutationObserver(function(){clearTimeout(grid._zpuTimer);grid._zpuTimer=setTimeout(apply,30);});observer.observe(grid,{childList:true,subtree:true});
    setTimeout(apply,200);setTimeout(apply,1000);
  }
  function dynamicSeo(){
    try{
      var path=location.pathname,full=location.origin+location.pathname+location.search;
      if(path.indexOf('product-details.html')>=0||path.indexOf('news-details.html')>=0){
        var canonical=document.querySelector('link[rel="canonical"]');if(!canonical){canonical=document.createElement('link');canonical.rel='canonical';document.head.appendChild(canonical);}canonical.href=full;
        var og=document.querySelector('meta[property="og:url"]');if(og)og.content=full;
        var desc=document.querySelector('meta[name="description"]');var title=document.title||'ZETA BIOTECH';var h=document.querySelector('h1');if(desc&&h&&(!desc.content||desc.content.indexOf('ZETA BIOTECH')>=0))desc.content=(h.textContent||title).trim()+' — ZETA BIOTECH';
        var schema=document.getElementById(path.indexOf('product-details.html')>=0?'zetaProductSchema':'zetaArticleSchema');if(schema){try{var data=JSON.parse(schema.textContent);data.url=full;if(path.indexOf('product-details.html')>=0&&h)data.name=(h.textContent||'').trim();if(path.indexOf('news-details.html')>=0&&h)data.headline=(h.textContent||'').trim();schema.textContent=JSON.stringify(data);}catch(e){}}
      }
    }catch(e){}
  }
  function performance(){
    try{
      if('connection' in navigator){var c=navigator.connection;if(c&&c.saveData)document.documentElement.classList.add('zeta-save-data');}
      if('requestIdleCallback' in window)window.requestIdleCallback(function(){accessibility();dynamicSeo();});
    }catch(e){}
  }
  function init(){addStyle();skipLink();accessibility();productEnhancement();dynamicSeo();performance();}
  ready(init);
  window.ZetaProductionUpgrade={version:VERSION,refresh:function(){try{apply();dynamicSeo();accessibility();}catch(e){}}};
})();
