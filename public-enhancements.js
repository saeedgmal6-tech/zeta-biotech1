(function(){
  function ready(fn){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',fn);else fn()}
  function add(tag,attrs,html){var e=document.createElement(tag);Object.keys(attrs||{}).forEach(function(k){e.setAttribute(k,attrs[k])});if(html!==undefined)e.innerHTML=html;return e}
  function lang(){return localStorage.getItem('zeta-lang')||'ar'}
  ready(function(){
    var products=document.getElementById('productsGrid');
    if(products){
      var head=products.parentElement.querySelector('.section-head');
      if(head && !document.getElementById('categoryFilter')){
        var tools=add('div',{class:'catalog-tools'});
        tools.appendChild(add('select',{id:'categoryFilter','aria-label':'Category'},'<option value="">كل التصنيفات / All Categories</option>'));
        tools.appendChild(add('select',{id:'formFilter','aria-label':'Dosage form'},'<option value="">كل الأشكال / All Forms</option>'));
        head.appendChild(tools)
      }
    }
    var sections=document.querySelector('main');
    if(sections){
      if(!document.getElementById('quality')){var q=add('section',{class:'section',id:'quality'},'<div class="container"><div class="section-head"><div><span class="kicker">QUALITY & CERTIFICATIONS</span><h2 data-ar="الجودة والاعتمادات" data-en="Quality & Certifications">الجودة والاعتمادات</h2><p data-ar="نلتزم بالمعايير ونوثق جودة أعمالنا." data-en="We are committed to standards and documented quality.">نلتزم بالمعايير ونوثق جودة أعمالنا.</p></div></div><div class="grid" id="qualityGrid"></div></div>');sections.appendChild(q)}
      if(!document.getElementById('careers')){var j=add('section',{class:'section gray',id:'careers'},'<div class="container"><div class="section-head"><div><span class="kicker">CAREERS</span><h2 data-ar="الوظائف" data-en="Careers">الوظائف</h2><p data-ar="انضم إلى فريق ZETA BIOTECH." data-en="Join the ZETA BIOTECH team.">انضم إلى فريق ZETA BIOTECH.</p></div></div><div class="grid" id="jobsGrid"></div></div>');sections.appendChild(j)}
    }
    var nav=document.getElementById('nav');
    if(nav && !nav.querySelector('a[href="#quality"]'))nav.insertAdjacentHTML('beforeend','<a href="#quality" data-ar="الجودة" data-en="Quality">الجودة</a><a href="#careers" data-ar="الوظائف" data-en="Careers">الوظائف</a>');
    var form=document.getElementById('contactForm');
    if(form && !document.getElementById('contactCompany')){var c=add('input',{id:'contactCompany',placeholder:'الشركة / Company'});var em=add('input',{id:'contactEmail',type:'email',placeholder:'البريد الإلكتروني / Email'});var ph=add('input',{id:'contactPhone',placeholder:'الهاتف / Phone'});form.insertBefore(c,document.getElementById('contactSubject'));form.insertBefore(em,document.getElementById('contactSubject'));form.insertBefore(ph,document.getElementById('contactSubject'))}
    var s=document.createElement('script');s.src='/site.js?v=20260904';s.defer=false;document.body.appendChild(s);
    document.addEventListener('click',function(e){var a=e.target.closest('a[href*="product-details.html?id="]');if(a)fetch('/api/analytics',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({type:'product',id:new URL(a.href).searchParams.get('id')})}).catch(function(){});var n=e.target.closest('a[href*="news-details.html?id="]');if(n)fetch('/api/analytics',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({type:'news',id:new URL(n.href).searchParams.get('id')})}).catch(function(){});if(a&&window.open){}}
    );
    fetch('/api/analytics',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({type:'page',path:location.pathname})}).catch(function(){});
  });
})();
