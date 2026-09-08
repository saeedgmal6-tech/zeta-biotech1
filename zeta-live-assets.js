(function(){
'use strict';

var RAW='https://raw.githubusercontent.com/saeedgmal6-tech/zeta-biotech1/main/';

function resolve(value){
  var src=String(value||'').trim();
  if(!src)return src;
  if(/^https?:\/\//i.test(src)||/^data:/i.test(src)||/^blob:/i.test(src))return src;
  if(/^\/assets\/uploads\//i.test(src))return RAW+src.replace(/^\//,'');
  if(/^assets\/uploads\//i.test(src))return RAW+src;
  return src;
}

function scan(){
  document.querySelectorAll('img[src],source[src],a[href]').forEach(function(el){
    var attr=el.tagName==='A'?'href':'src';
    var old=el.getAttribute(attr);
    var next=resolve(old);
    if(next&&next!==old)el.setAttribute(attr,next);
  });
}

function boot(){
  scan();
  setTimeout(scan,250);
  setTimeout(scan,900);
  setTimeout(scan,1800);
  setTimeout(scan,3200);
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
window.ZetaResolveAssetUrl=resolve;
})();
