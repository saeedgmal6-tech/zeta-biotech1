(function(){
  'use strict';
  var VERSION='2026-09-05-global-translation-1';
  var initialized=false;
  var sourceLanguage='ar';
  var languages={
    ar:'العربية',en:'English',fr:'Français',es:'Español',de:'Deutsch',it:'Italiano',pt:'Português',nl:'Nederlands',ru:'Русский',uk:'Українська',pl:'Polski',tr:'Türkçe',el:'Ελληνικά',sv:'Svenska',no:'Norsk',da:'Dansk',fi:'Suomi',cs:'Čeština',sk:'Slovenčina',hu:'Magyar',ro:'Română',bg:'Български',sr:'Српски',hr:'Hrvatski',sl:'Slovenščina',he:'עברית',fa:'فارسی',ur:'اردو',hi:'हिन्दी',bn:'বাংলা',ta:'தமிழ்',te:'తెలుగు',ml:'മലയാളം',kn:'ಕನ್ನಡ',mr:'मराठी',gu:'ગુજરાતી',pa:'ਪੰਜਾਬੀ',ne:'नेपाली',id:'Bahasa Indonesia',ms:'Bahasa Melayu',vi:'Tiếng Việt',th:'ไทย',zh-CN:'简体中文',zh-TW:'繁體中文',ja:'日本語',ko:'한국어',sw:'Kiswahili',am:'አማርኛ',af:'Afrikaans',sq:'Shqip',hy:'Հայերեն',az:'Azərbaycan',eu:'Euskara',be:'Беларуская',ca:'Català',et:'Eesti',gl:'Galego',is:'Íslenska',ga:'Gaeilge',ka:'ქართული',lv:'Latviešu',lt:'Lietuvių',mk:'Македонски',mt:'Malti',cy:'Cymraeg',bs:'Bosanski',kk:'Қазақша',ky:'Кыргызча',mn:'Монгол',uz:'O‘zbek',tg:'Тоҷикӣ',tk:'Türkmençe',ps:'پښتو',my:'မြန်မာ',km:'ខ្មែរ',lo:'ລາວ',si:'සිංහල'};
  function ready(fn){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',fn);else fn();}
  function addStyle(){
    if(document.getElementById('zetaGlobalTranslateStyle'))return;
    var s=document.createElement('style');s.id='zetaGlobalTranslateStyle';
    s.textContent=''+
      '.zgt-wrap{position:relative;display:inline-flex;align-items:center;gap:8px;z-index:10001}'+
      '.zgt-button{display:inline-flex;align-items:center;gap:7px;height:38px;padding:0 13px;border:1px solid rgba(255,255,255,.22);border-radius:10px;background:rgba(255,255,255,.08);color:#fff;font:800 12px/1 Arial,sans-serif;cursor:pointer;white-space:nowrap;transition:.2s}'+
      '.zgt-button:hover,.zgt-button:focus-visible{background:rgba(255,255,255,.15);outline:0;transform:translateY(-1px)}'+
      '.zgt-icon{font-size:16px;line-height:1}'+
      '.zgt-current{max-width:120px;overflow:hidden;text-overflow:ellipsis}'+
      '.zgt-menu{position:absolute;top:calc(100% + 8px);inset-inline-end:0;width:230px;max-height:360px;overflow:auto;padding:8px;border:1px solid #dbe6ea;border-radius:14px;background:#fff;box-shadow:0 18px 50px rgba(7,27,43,.18);display:none}'+
      '.zgt-wrap.open .zgt-menu{display:block}'+
      '.zgt-option{width:100%;display:flex;align-items:center;justify-content:space-between;gap:10px;border:0;background:#fff;color:#071b2b;text-align:start;padding:10px 11px;border-radius:9px;font:700 12px/1.2 Arial,sans-serif;cursor:pointer}'+
      '.zgt-option:hover,.zgt-option:focus-visible{background:#eef8f7;outline:0;color:#138f89}'+
      '.zgt-option.active{background:#e8f6f5;color:#138f89}'+
      '.zgt-google-host{position:fixed!important;left:-10000px!important;top:-10000px!important;width:1px!important;height:1px!important;overflow:hidden!important;opacity:0!important;pointer-events:none!important}'+
      'body{top:0!important}'+
      '.goog-te-banner-frame,.goog-te-balloon-frame,.skiptranslate{display:none!important}'+
      '@media(max-width:650px){.zgt-button{height:36px;padding:0 10px}.zgt-current{max-width:90px}.zgt-menu{width:215px;max-height:300px}}';
    document.head.appendChild(s);
  }
  function ensureGoogleHost(){
    var host=document.getElementById('google_translate_element');
    if(!host){host=document.createElement('div');host.id='google_translate_element';host.className='zgt-google-host';document.body.appendChild(host);}
    return host;
  }
  function loadGoogle(){
    if(window.google&&window.google.translate&&window.google.translate.TranslateElement){initGoogle();return;}
    window.zetaGoogleTranslateInit=function(){initGoogle();};
    if(document.getElementById('zetaGoogleTranslateScript'))return;
    var script=document.createElement('script');script.id='zetaGoogleTranslateScript';script.async=true;script.src='https://translate.google.com/translate_a/element.js?cb=zetaGoogleTranslateInit';document.head.appendChild(script);
  }
  function initGoogle(){
    if(initialized)return;
    try{
      ensureGoogleHost();
      new window.google.translate.TranslateElement({pageLanguage:sourceLanguage,autoDisplay:false,multilanguagePage:true},'google_translate_element');
      initialized=true;
      waitForCombo();
    }catch(e){setTimeout(initGoogle,800);}
  }
  function waitForCombo(){
    var tries=0;
    var timer=setInterval(function(){
      tries++;
      var combo=document.querySelector('.goog-te-combo');
      if(combo){clearInterval(timer);window.ZetaGlobalTranslate={setLanguage:setLanguage,reset:function(){setLanguage('ar');}};}
      if(tries>40)clearInterval(timer);
    },250);
  }
  function setLanguage(code){
    var combo=document.querySelector('.goog-te-combo');
    if(!combo){loadGoogle();setTimeout(function(){setLanguage(code);},900);return;}
    if(code==='ar'){
      var current=combo.value;
      if(current==='ar'){updateCurrent('ar');return;}
      combo.value='ar';
    }else combo.value=code;
    combo.dispatchEvent(new Event('change'));
    updateCurrent(code);
    closeMenu();
  }
  function updateCurrent(code){
    var current=document.getElementById('zgtCurrent');if(current)current.textContent=languages[code]||code;document.querySelectorAll('.zgt-option').forEach(function(b){b.classList.toggle('active',b.getAttribute('data-lang')===code);});
  }
  function closeMenu(){var w=document.getElementById('zgtWrap');if(w)w.classList.remove('open');}
  function buildMenu(){
    var old=document.getElementById('language');
    if(old)old.style.display='none';
    if(document.getElementById('zgtWrap'))return;
    var anchor=old&&old.parentNode?old.parentNode:document.querySelector('.header-inner');
    if(!anchor)return;
    var wrap=document.createElement('div');wrap.id='zgtWrap';wrap.className='zgt-wrap';
    var button=document.createElement('button');button.type='button';button.className='zgt-button';button.setAttribute('aria-haspopup','listbox');button.setAttribute('aria-expanded','false');button.innerHTML='<span class="zgt-icon">🌐</span><span id="zgtCurrent" class="zgt-current">العربية</span><span>⌄</span>';
    var menu=document.createElement('div');menu.className='zgt-menu';menu.setAttribute('role','listbox');
    Object.keys(languages).forEach(function(code){var option=document.createElement('button');option.type='button';option.className='zgt-option'+(code==='ar'?' active':'');option.setAttribute('role','option');option.setAttribute('data-lang',code);option.innerHTML='<span>'+languages[code]+'</span><small>'+code+'</small>';option.addEventListener('click',function(){setLanguage(code);});menu.appendChild(option);});
    button.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();var open=wrap.classList.toggle('open');button.setAttribute('aria-expanded',open?'true':'false');loadGoogle();});
    document.addEventListener('click',function(e){if(!wrap.contains(e.target))closeMenu();});
    wrap.appendChild(button);wrap.appendChild(menu);
    if(old&&old.parentNode)old.parentNode.replaceChild(wrap,old);else anchor.appendChild(wrap);
  }
  function observeDynamic(){
    try{var observer=new MutationObserver(function(){if(initialized){var combo=document.querySelector('.goog-te-combo');if(combo&&document.documentElement.lang!==sourceLanguage&&document.body.getAttribute('data-zeta-translate-reinit')!=='1'){document.body.setAttribute('data-zeta-translate-reinit','1');}}});observer.observe(document.body,{childList:true,subtree:true});}catch(e){}
  }
  function init(){addStyle();ensureGoogleHost();buildMenu();loadGoogle();observeDynamic();}
  ready(init);
  window.ZetaGlobalTranslateVersion=VERSION;
})();
