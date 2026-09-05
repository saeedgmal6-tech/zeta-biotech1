(function(){'use strict';
function ready(){
  var root=document.getElementById('zetaDatabaseAssistant');
  if(!root)return false;
  var panel=root.querySelector('.znext-ai-panel');
  var head=root.querySelector('.znext-ai-head');
  var button=root.querySelector('.znext-ai-btn');
  if(!panel||!head||!button)return false;

  var styleId='zeta-ai-navigation-polish-style';
  if(!document.getElementById(styleId)){
    var style=document.createElement('style');
    style.id=styleId;
    style.textContent='\n#zetaDatabaseAssistant{position:fixed!important;z-index:2147483000!important;pointer-events:none!important;transition:filter .2s ease}\n#zetaDatabaseAssistant .znext-ai-btn{pointer-events:auto!important;cursor:grab!important;width:66px!important;height:66px!important;border-radius:50%!important;border:1px solid rgba(255,255,255,.55)!important;background:linear-gradient(145deg,#0b3148,#0a8d7c)!important;color:#fff!important;font-size:14px!important;font-weight:900!important;letter-spacing:.2px!important;box-shadow:0 14px 38px rgba(4,31,45,.30),inset 0 1px 0 rgba(255,255,255,.35)!important;backdrop-filter:blur(14px)!important;-webkit-backdrop-filter:blur(14px)!important;transition:transform .22s ease,box-shadow .22s ease!important}\n#zetaDatabaseAssistant .znext-ai-btn:hover{transform:translateY(-3px) scale(1.04)!important;box-shadow:0 20px 46px rgba(4,31,45,.36),inset 0 1px 0 rgba(255,255,255,.4)!important}\n#zetaDatabaseAssistant .znext-ai-btn:active{cursor:grabbing!important;transform:scale(.97)!important}\n#zetaDatabaseAssistant .znext-ai-panel{pointer-events:auto!important;border:1px solid rgba(215,231,235,.9)!important;border-radius:24px!important;box-shadow:0 28px 75px rgba(4,25,38,.25)!important;background:rgba(255,255,255,.97)!important;backdrop-filter:blur(18px)!important;-webkit-backdrop-filter:blur(18px)!important}\n#zetaDatabaseAssistant .znext-ai-head{padding:15px 17px!important;background:linear-gradient(135deg,#071b2b,#0b5361)!important;color:#fff!important;border:0!important;cursor:grab!important}\n#zetaDatabaseAssistant .znext-ai-close{color:#fff!important;background:rgba(255,255,255,.12)!important;border:1px solid rgba(255,255,255,.18)!important;border-radius:10px!important;width:32px!important;height:32px!important}\n#zetaDatabaseAssistant .znext-ai-body{background:linear-gradient(180deg,#f8fbfc,#fff)!important}\n#zetaDatabaseAssistant .znext-ai-form{padding:11px!important;border-top:1px solid #e4edef!important;background:#fff!important}\n#zetaDatabaseAssistant .znext-ai-form input{border:1px solid #d5e3e7!important;border-radius:13px!important;outline:0!important}\n#zetaDatabaseAssistant .znext-ai-form button{border:0!important;border-radius:13px!important;background:#0b8b7a!important;color:#fff!important;font-weight:800!important}\n#zetaDatabaseAssistant .zeta-ai-result{border:1px solid #dce9ec!important;border-radius:16px!important;background:#fff!important;box-shadow:0 8px 24px rgba(7,27,43,.07)!important}\n#zetaDatabaseAssistant .zeta-ai-route{border-radius:12px!important;font-weight:800!important;transition:transform .18s ease,box-shadow .18s ease!important}\n#zetaDatabaseAssistant .zeta-ai-route:hover{transform:translateY(-1px)!important;box-shadow:0 8px 18px rgba(7,27,43,.12)!important}\n@media(max-width:600px){#zetaDatabaseAssistant{right:14px!important;bottom:14px!important;width:calc(100vw - 28px)!important}#zetaDatabaseAssistant .znext-ai-panel{width:100%!important}#zetaDatabaseAssistant .znext-ai-btn{width:62px!important;height:62px!important}}\n';
    document.head.appendChild(style);
  }

  if(button.dataset.zetaPolished!=='1'){
    button.dataset.zetaPolished='1';
    button.title='اسألني';
    button.addEventListener('mousedown',function(e){e.stopPropagation()});
    button.addEventListener('touchstart',function(e){e.stopPropagation()},{passive:false});
  }

  root.querySelectorAll('.zeta-ai-product').forEach(function(a){
    if(a.dataset.zetaNavFixed==='1')return;
    a.dataset.zetaNavFixed='1';
    a.setAttribute('href','#products');
    a.addEventListener('click',function(e){
      e.preventDefault();
      e.stopPropagation();
      var el=document.getElementById('products');
      if(el){el.scrollIntoView({behavior:'smooth',block:'start'});history.replaceState(null,'','#products');}
      panel.classList.remove('show');
    });
  });

  root.querySelectorAll('.zeta-ai-route[data-zeta-route]').forEach(function(a){
    if(a.dataset.zetaNavFixed==='1')return;
    a.dataset.zetaNavFixed='1';
    a.addEventListener('click',function(e){
      var id=a.getAttribute('href');
      if(!id||id.charAt(0)!=='#')return;
      e.preventDefault();
      var el=document.querySelector(id);
      if(el){el.scrollIntoView({behavior:'smooth',block:'start'});history.replaceState(null,'',id);}
      panel.classList.remove('show');
    });
  });
  return true;
}
function boot(){
  if(ready())return;
  var observer=new MutationObserver(function(){ready()});
  observer.observe(document.documentElement,{childList:true,subtree:true});
  setTimeout(function(){ready()},250);
  setTimeout(function(){ready()},1000);
  setTimeout(function(){ready()},2500);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();