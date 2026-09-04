(function(){
'use strict';
var A={
 product:['منتج','منتجات','دواء','ادوية','أدوية','product','products','medicine'],
 brochure:['بروشور','بروشورات','كتالوج','pdf','ملف','brochure','brochures'],
 news:['خبر','اخبار','أخبار','تحديث','news','updates'],
 contact:['تواصل','التواصل','اتصال','هاتف','تليفون','واتساب','واتس','ايميل','إيميل','بريد','خريطة','عنوان','phone','whatsapp','email','maps','location'],
 company:['شركة','الشركة','عن الشركة','نبذة','من نحن','company','about','profile'],
 distributor:['موزع','موزعين','توزيع','وكيل','وكلاء','distributor','distribution'],
 job:['وظيفة','وظائف','توظيف','شغل','فرصة عمل','careers','career','jobs','job'],
 certification:['شهادة','شهادات','اعتماد','اعتمادات','جودة','certification','certifications','quality'],
 faq:['سؤال','اسئلة','أسئلة','شائع','faq','faqs','question']
};
function n(v){return String(v==null?'':v).toLowerCase().replace(/[أإآ]/g,'ا').replace(/ة/g,'ه').replace(/ى/g,'ي').replace(/[ًٌٍَُِّْـ]/g,'').replace(/[^\p{L}\p{N}]+/gu,' ').trim()}
function ar(){return (localStorage.getItem('zeta-lang')||'ar')==='ar'}
function has(q,k){var x=n(q);return A[k].some(function(v){var y=n(v);return x===y||x.indexOf(y)>=0})}
function section(k){var m={product:'#products',brochure:'#brochures',news:'#news',contact:'#contact',company:'#about',distributor:'#zetaCommercial',job:'#zetaJobs',certification:'#zetaCertifications',faq:'#zetaFaq'};return m[k]||'#home'}
function title(k){var m={product:['المنتجات','Products'],brochure:['البروشورات','Brochures'],news:['الأخبار','News'],contact:['التواصل','Contact'],company:['عن الشركة','About ZETA BIOTECH'],distributor:['التوزيع والشراكة','Distribution & Partnership'],job:['الوظائف','Careers'],certification:['الشهادات والاعتمادات','Certifications'],faq:['الأسئلة الشائعة','FAQs']};return ar()?m[k][0]:m[k][1]}
function removeOld(){var x=document.getElementById('znextAssistant');if(x&&!x.getAttribute('data-zeta-db-ai'))x.remove()}
function ensureSection(k){var id=section(k).slice(1);if(document.getElementById(id))return;if(k==='job'||k==='certification'||k==='faq'||k==='distributor'){var main=document.querySelector('main');if(!main)return;var s=document.createElement('section');s.id=id;s.className='section gray';s.innerHTML='<div class="container"><div style="background:#fff;border:1px solid #dce7ea;border-radius:20px;padding:26px"><span class="kicker">'+k.toUpperCase()+'</span><h2>'+title(k)+'</h2><p>'+({job:ar()?'لا توجد وظائف منشورة حاليًا. يمكنك العودة لهذا القسم لاحقًا.':'No job vacancies are currently published. You can return to this section later.',certification:ar()?'لا توجد شهادات منشورة حاليًا. يمكنك العودة لهذا القسم لاحقًا.':'No certifications are currently published. You can return to this section later.',faq:ar()?'لا توجد أسئلة شائعة منشورة حاليًا. يمكنك العودة لهذا القسم لاحقًا.':'No FAQs are currently published. You can return to this section later.',distributor:ar()?'يمكنك تقديم طلب موزع من هذا القسم والتواصل مع فريق ZETA BIOTECH.':'You can submit a distributor request from this section and contact the ZETA BIOTECH team.'}[k])+'</p></div></div>';main.appendChild(s)}}
function reply(q){
 var keys=['product','brochure','news','contact','company','distributor','job','certification','faq'];
 var found=keys.filter(function(k){return has(q,k)});
 if(!found.length){
  if(/^(اهلا|مرحبا|السلام عليكم|hello|hi|hey)$/.test(n(q)))return ar()?'أهلًا بك في ZETA BIOTECH. اسألني عن أي موضوع، وسأوجهك مباشرة للقسم المناسب.':'Welcome to ZETA BIOTECH. Ask about any topic and I will take you directly to the right section.';
  return ar()?'حدد لي الموضوع وسأوجهك مباشرة: المنتجات، البروشورات، الأخبار، عن الشركة، التواصل، الوظائف، الشهادات، التوزيع أو الأسئلة الشائعة.':'Tell me the topic and I will take you directly to the right section: Products, Brochures, News, About, Contact, Careers, Certifications, Distribution or FAQs.';
 }
 var k=found[0];ensureSection(k);var href=section(k);
 if(k==='product'&& (has(q,'ingredient')||has(q,'strength')))href='#products';
 return (ar()?'تمام. سؤالك يخص قسم «'+title(k)+'». اضغط هنا للانتقال مباشرة للقسم حتى لو كانت البيانات داخله فارغة حاليًا.':'Sure. Your question belongs to the “'+title(k)+'” section. Tap here to go directly to that section even if it is currently empty.')+'<br><br><a href="'+href+'" style="display:inline-flex;align-items:center;justify-content:center;padding:11px 16px;border-radius:10px;background:#071b2b;color:#fff;text-decoration:none;font-weight:800">'+(ar()?'فتح القسم ↗':'Open section ↗')+'</a>';
}
function install(){
 removeOld();
 var old=document.querySelector('[data-zeta-db-ai="1"]');if(old)return;
 var h=document.createElement('div');h.className='znext-assistant';h.setAttribute('data-zeta-db-ai','1');h.id='zetaDatabaseAssistant';
 h.innerHTML='<div class="znext-ai-panel" id="zetaDbPanel"><div class="znext-ai-head">🤖 ZETA BIOTECH Assistant</div><div class="znext-ai-body" id="zetaDbBody"><div class="znext-ai-msg">'+(ar()?'اسألني عن أي شيء في الموقع وسأوجهك للقسم المختص مباشرة.':'Ask me about anything on the website and I will take you directly to the relevant section.')+'</div></div><form class="znext-ai-form" id="zetaDbForm"><input id="zetaDbInput" autocomplete="off" placeholder="'+(ar()?'اكتب سؤالك...':'Ask a question...')+'"><button>↗</button></form></div><button class="znext-ai-btn" id="zetaDbBtn">🤖 '+(ar()?'المساعد الذكي':'AI Assistant')+'</button>';
 document.body.appendChild(h);
 document.getElementById('zetaDbBtn').onclick=function(){document.getElementById('zetaDbPanel').classList.toggle('show')};
 document.getElementById('zetaDbForm').onsubmit=function(e){e.preventDefault();var i=document.getElementById('zetaDbInput'),q=i.value.trim();if(!q)return;var b=document.getElementById('zetaDbBody');b.innerHTML+='<div class="znext-ai-msg znext-ai-user">'+q.replace(/[&<>]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;'}[c]})+'</div><div class="znext-ai-msg">'+reply(q)+'</div>';i.value='';b.scrollTop=b.scrollHeight;};
}
function boot(){install();var mo=new MutationObserver(function(){removeOld();if(!document.getElementById('zetaDatabaseAssistant'))install()});mo.observe(document.body,{childList:true,subtree:true});setInterval(function(){removeOld();if(!document.getElementById('zetaDatabaseAssistant'))install()},1000)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();