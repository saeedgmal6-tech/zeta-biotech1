(function(){
  'use strict';
  function addSchema(id, data){
    try{
      var old=document.getElementById(id);
      if(old) old.remove();
      var node=document.createElement('script');
      node.type='application/ld+json';
      node.id=id;
      node.textContent=JSON.stringify(data);
      document.head.appendChild(node);
    }catch(e){}
  }
  function textMeta(selector, value){
    try{
      var node=document.querySelector(selector);
      if(node && value) node.setAttribute('content',value);
    }catch(e){}
  }
  function registerPwa(){
    if(!('serviceWorker' in navigator)) return;
    window.addEventListener('load', function(){
      navigator.serviceWorker.register('/sw.js', {scope:'/'}).catch(function(){});
    });
  }
  function accessibility(){
    try{
      document.documentElement.classList.add('zeta-enterprise-ready');
      document.querySelectorAll('img').forEach(function(img){
        if(!img.getAttribute('alt')) img.setAttribute('alt','ZETA BIOTECH');
        img.loading=img.loading||'lazy';
        img.decoding=img.decoding||'async';
      });
      document.querySelectorAll('a[target="_blank"]').forEach(function(a){
        var rel=(a.getAttribute('rel')||'').split(/\s+/).filter(Boolean);
        if(rel.indexOf('noopener')<0) rel.push('noopener');
        if(rel.indexOf('noreferrer')<0) rel.push('noreferrer');
        a.setAttribute('rel',rel.join(' '));
      });
    }catch(e){}
  }
  function structuredData(){
    var canonical=(document.querySelector('link[rel="canonical"]')||{}).href||location.href.split('#')[0];
    var title=document.title||'ZETA BIOTECH';
    var description=(document.querySelector('meta[name="description"]')||{}).content||'ZETA BIOTECH — شركة أدوية وحلول صحية';
    addSchema('zetaWebPageSchema',{
      '@context':'https://schema.org',
      '@type':'WebPage',
      name:title,
      description:description,
      url:canonical,
      isPartOf:{'@type':'WebSite',name:'ZETA BIOTECH',url:'https://zeta-biotech.com/'}
    });
    var path=location.pathname;
    if(path.indexOf('product-details.html')>=0){
      var id=new URLSearchParams(location.search).get('id');
      var product={};
      try{ product=window.zetaProduct || {}; }catch(e){}
      var name=product.nameAr||product.nameEn||title.replace(' — ZETA BIOTECH','');
      addSchema('zetaBreadcrumbSchema',{
        '@context':'https://schema.org','@type':'BreadcrumbList','itemListElement':[
          {'@type':'ListItem',position:1,name:'ZETA BIOTECH',item:'https://zeta-biotech.com/'},
          {'@type':'ListItem',position:2,name:name,item:canonical}
        ]
      });
      if(name){
        addSchema('zetaProductSchema',{
          '@context':'https://schema.org','@type':'Product',name:name,url:canonical,description:description,
          brand:{'@type':'Brand',name:'ZETA BIOTECH'}
        });
      }
    } else if(path.indexOf('news-details.html')>=0){
      addSchema('zetaNewsBreadcrumbSchema',{
        '@context':'https://schema.org','@type':'BreadcrumbList','itemListElement':[
          {'@type':'ListItem',position:1,name:'ZETA BIOTECH',item:'https://zeta-biotech.com/'},
          {'@type':'ListItem',position:2,name:title,item:canonical}
        ]
      });
      addSchema('zetaArticleSchema',{
        '@context':'https://schema.org','@type':'Article',headline:title,description:description,url:canonical,publisher:{'@type':'Organization',name:'ZETA BIOTECH',url:'https://zeta-biotech.com/'}
      });
    }
  }
  function init(){
    registerPwa();
    accessibility();
    structuredData();
    textMeta('meta[name="robots"]','index,follow');
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();
})();
