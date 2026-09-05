(function(){'use strict';
function ready(){
  var root=document.getElementById('zetaDatabaseAssistant');
  if(!root)return false;
  var panel=root.querySelector('.znext-ai-panel');
  var head=root.querySelector('.znext-ai-head');
  var button=root.querySelector('.znext-ai-btn');
  var form=root.querySelector('.znext-ai-form');
  var input=root.querySelector('.znext-ai-form input');
  var body=root.querySelector('.znext-ai-body');
  if(!panel||!head||!button)return false;

  var styleId='zeta-ai-navigation-polish-style';
  if(!document.getElementById(styleId)){
    var style=document.createElement('style');
    style.id=styleId;
    style.textContent='\n#zetaDatabaseAssistant{position:fixed!important;z-index:2147483000!important;pointer-events:none!important;filter:drop-shadow(0 18px 40px rgba(3,25,38,.08));max-width:calc(100vw - 20px)!important}\n#zetaDatabaseAssistant .znext-ai-btn{pointer-events:auto!important;cursor:grab!important;width:72px!important;height:72px!important;padding:0!important;border-radius:50%!important;border:1px solid rgba(255,255,255,.68)!important;background:linear-gradient(145deg,#061a2a 0%,#0b5364 52%,#0a9a84 100%)!important;color:#fff!important;font-size:12px!important;font-weight:900!important;letter-spacing:.25px!important;line-height:1.1!important;box-shadow:0 18px 44px rgba(3,27,42,.34),inset 0 1px 0 rgba(255,255,255,.38),inset 0 -8px 20px rgba(0,0,0,.10)!important;backdrop-filter:blur(16px)!important;-webkit-backdrop-filter:blur(16px)!important;transition:transform .22s ease,box-shadow .22s ease,filter .22s ease!important;user-select:none!important;-webkit-user-select:none!important;touch-action:none!important}\n#zetaDatabaseAssistant .znext-ai-btn:before{content:\"Z\";display:block;font-family:Arial,Helvetica,sans-serif;font-size:27px;font-weight:950;line-height:27px;letter-spacing:-1.5px;margin:0 auto 3px;opacity:.98;text-shadow:0 2px 8px rgba(0,0,0,.22)}\n#zetaDatabaseAssistant .znext-ai-btn:hover{transform:translateY(-4px) scale(1.045)!important;filter:saturate(1.08)!important;box-shadow:0 24px 54px rgba(3,27,42,.40),inset 0 1px 0 rgba(255,255,255,.44),inset 0 -8px 20px rgba(0,0,0,.10)!important}\n#zetaDatabaseAssistant .znext-ai-btn:active{cursor:grabbing!important;transform:scale(.97)!important}\n#zetaDatabaseAssistant .znext-ai-panel{pointer-events:auto!important;width:min(430px,calc(100vw - 24px))!important;max-width:calc(100vw - 24px)!important;max-height:min(720px,calc(100vh - 28px))!important;display:flex!important;flex-direction:column!important;overflow:hidden!important;border:1px solid rgba(211,229,234,.95)!important;border-radius:26px!important;box-shadow:0 30px 90px rgba(3,25,38,.27),0 5px 18px rgba(3,25,38,.08)!important;background:rgba(255,255,255,.985)!important;backdrop-filter:blur(20px)!important;-webkit-backdrop-filter:blur(20px)!important}\n#zetaDatabaseAssistant .znext-ai-head{flex:0 0 auto!important;padding:16px 18px!important;background:linear-gradient(135deg,#061a2a 0%,#075566 55%,#0a806f 100%)!important;color:#fff!important;border:0!important;cursor:grab!important;user-select:none!important;-webkit-user-select:none!important}\n#zetaDatabaseAssistant .znext-ai-head strong{font-size:16px!important;letter-spacing:.1px!important}\n#zetaDatabaseAssistant .znext-ai-close{color:#fff!important;background:rgba(255,255,255,.13)!important;border:1px solid rgba(255,255,255,.20)!important;border-radius:11px!important;width:34px!important;height:34px!important;font-size:20px!important;line-height:1!important}\n#zetaDatabaseAssistant .znext-ai-body{flex:1 1 auto!important;min-height:0!important;overflow-y:auto!important;overflow-x:hidden!important;-webkit-overflow-scrolling:touch!important;overscroll-behavior:contain!important;scrollbar-width:thin!important;background:linear-gradient(180deg,#f7fbfc 0%,#fff 100%)!important;padding-bottom:4px!important}\n#zetaDatabaseAssistant .znext-ai-form{flex:0 0 auto!important;padding:12px!important;gap:9px!important;border-top:1px solid #e2edef!important;background:rgba(255,255,255,.98)!important;display:flex!important;align-items:center!important;position:relative!important;z-index:3!important}\n#zetaDatabaseAssistant .znext-ai-form input{height:46px!important;min-width:0!important;flex:1 1 auto!important;border:1px solid #d2e2e6!important;border-radius:14px!important;outline:0!important;background:#fbfdfe!important;box-shadow:inset 0 1px 2px rgba(4,28,42,.04)!important;transition:border-color .18s ease,box-shadow .18s ease!important}\n#zetaDatabaseAssistant .znext-ai-form input:focus{border-color:#0a8b7a!important;box-shadow:0 0 0 4px rgba(10,139,122,.10)!important;background:#fff!important}\n#zetaDatabaseAssistant .znext-ai-form button{flex:0 0 auto!important;min-width:70px!important;height:46px!important;border:0!important;border-radius:14px!important;background:linear-gradient(135deg,#087f72,#0aa58d)!important;color:#fff!important;font-weight:900!important;box-shadow:0 8px 18px rgba(8,127,114,.20)!important;cursor:pointer!important;transition:transform .18s ease,box-shadow .18s ease!important}\n#zetaDatabaseAssistant .znext-ai-form button:hover{transform:translateY(-1px)!important;box-shadow:0 11px 24px rgba(8,127,114,.25)!important}\n#zetaDatabaseAssistant .zeta-ai-result{border:1px solid #dce9ec!important;border-radius:17px!important;background:#fff!important;box-shadow:0 9px 26px rgba(7,27,43,.075)!important;transition:transform .18s ease,box-shadow .18s ease!important;overflow-wrap:anywhere!important}\n#zetaDatabaseAssistant .zeta-ai-result:hover{transform:translateY(-2px)!important;box-shadow:0 13px 30px rgba(7,27,43,.10)!important}\n#zetaDatabaseAssistant .zeta-ai-route{border-radius:13px!important;font-weight:900!important;background:linear-gradient(135deg,#087f72,#0a9a84)!important;box-shadow:0 8px 18px rgba(8,127,114,.16)!important;transition:transform .18s ease,box-shadow .18s ease!important}\n#zetaDatabaseAssistant .zeta-ai-route:hover{transform:translateY(-1px)!important;box-shadow:0 11px 24px rgba(8,127,114,.22)!important}\n@media(max-width:600px){#zetaDatabaseAssistant{right:12px!important;bottom:12px!important;max-width:calc(100vw - 24px)!important}#zetaDatabaseAssistant .znext-ai-panel{width:calc(100vw - 24px)!important;max-width:calc(100vw - 24px)!important;max-height:calc(100vh - 24px)!important;border-radius:22px!important}#zetaDatabaseAssistant .znext-ai-head{padding:13px 14px!important}#zetaDatabaseAssistant .znext-ai-body{min-height:0!important}#zetaDatabaseAssistant .znext-ai-form{padding:9px!important;gap:7px!important}#zetaDatabaseAssistant .znext-ai-form input{height:44px!important;font-size:14px!important}#zetaDatabaseAssistant .znext-ai-form button{height:44px!important;min-width:64px!important}#zetaDatabaseAssistant .znext-ai-btn{width:64px!important;height:64px!important;font-size:10px!important}#zetaDatabaseAssistant .znext-ai-btn:before{font-size:24px!important;line-height:24px!important}}\n';
    document.head.appendChild(style);
  }

  if(button.dataset.zetaPolished!=='1'){
    button.dataset.zetaPolished='1';
    button.title='Z.B.ask me';
    button.setAttribute('aria-label','Z.B.ask me');
    button.textContent='Z.B.ask me';
    button.addEventListener('mousedown',function(e){e.stopPropagation()});
    button.addEventListener('touchstart',function(e){e.stopPropagation()},{passive:false});
  }

  var title=head.querySelector('strong');
  if(title)title.textContent='Z.B.ask me';

  if(form&&input&&form.dataset.zetaInputFixed!=='1'){
    form.dataset.zetaInputFixed='1';
    form.addEventListener('submit',function(){
      setTimeout(function(){input.value='';input.focus()},0);
    });
  }

  root.querySelectorAll('.zeta-ai-product').forEach(function(a){
    if(a.dataset.zetaNavFixed==='1')return;
    a.dataset.zetaNavFixed='1';
    a.setAttribute('href','#products');
    a.addEventListener('click',function(e){
      e.preventDefault();
      e.stopPropagation();
      var el=document.getElementById('products');
      if(el){el.scrollIntoView({behavior:'smooth',block:'start'});try{history.replaceState(null,'','#products')}catch(x){location.hash='products'}}
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
      if(el){el.scrollIntoView({behavior:'smooth',block:'start'});try{history.replaceState(null,'',id)}catch(x){location.hash=id}}
      panel.classList.remove('show');
    });
  });

  if(button.dataset.zetaDragFixed!=='1'){
    button.dataset.zetaDragFixed='1';
    var moving=false;
    var moved=false;
    var sx=0;
    var sy=0;
    var ox=0;
    var oy=0;
    var pointerId=null;
    function point(e){return{x:e.clientX,y:e.clientY}}
    function start(e){
      if(e.button!==undefined&&e.button!==0)return;
      var pt=point(e),rect=root.getBoundingClientRect();
      moving=true;moved=false;pointerId=e.pointerId;
      sx=pt.x;sy=pt.y;ox=rect.left;oy=rect.top;
      root.style.left=ox+'px';root.style.top=oy+'px';root.style.right='auto';root.style.bottom='auto';
      if(button.setPointerCapture&&e.pointerId!==undefined)try{button.setPointerCapture(e.pointerId)}catch(x){}
      e.preventDefault();
    }
    function move(e){
      if(!moving)return;
      var pt=point(e),dx=pt.x-sx,dy=pt.y-sy;
      if(Math.abs(dx)>5||Math.abs(dy)>5)moved=true;
      if(!moved)return;
      var maxX=Math.max(0,window.innerWidth-root.offsetWidth),maxY=Math.max(0,window.innerHeight-root.offsetHeight);
      root.style.left=Math.max(0,Math.min(maxX,ox+dx))+'px';
      root.style.top=Math.max(0,Math.min(maxY,oy+dy))+'px';
      e.preventDefault();
    }
    function end(e){
      if(!moving)return;
      moving=false;
      if(moved){
        root.dataset.zetaSuppressClick='1';
        setTimeout(function(){delete root.dataset.zetaSuppressClick},120);
        var rect=root.getBoundingClientRect();
        try{localStorage.setItem('zeta-ai-position',JSON.stringify({left:Math.round(rect.left),top:Math.round(rect.top)}))}catch(x){}
      }
      if(button.releasePointerCapture&&pointerId!==null)try{button.releasePointerCapture(pointerId)}catch(x){}
      pointerId=null;
    }
    button.addEventListener('pointerdown',start,{passive:false});
    button.addEventListener('pointermove',move,{passive:false});
    button.addEventListener('pointerup',end,{passive:false});
    button.addEventListener('pointercancel',end,{passive:false});
    button.addEventListener('click',function(e){
      if(root.dataset.zetaSuppressClick==='1'){e.preventDefault();e.stopImmediatePropagation();return}
    },true);
    try{
      var saved=JSON.parse(localStorage.getItem('zeta-ai-position')||'null');
      if(saved&&Number.isFinite(saved.left)&&Number.isFinite(saved.top)){
        root.style.left=Math.max(0,Math.min(window.innerWidth-root.offsetWidth,saved.left))+'px';
        root.style.top=Math.max(0,Math.min(window.innerHeight-root.offsetHeight,saved.top))+'px';
        root.style.right='auto';root.style.bottom='auto';
      }
    }catch(x){}
  }
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