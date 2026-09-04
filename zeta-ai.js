(function(){
'use strict';
var SOURCES=['site','products','brochures','news','certifications','jobs','faqs','testimonials'];
var STOP='من في على عن إلى الي و أو مع هذا هذه ذلك التي الذي هو هي هم نحن ان إن لا ما ماذا كيف هل لماذا متى أين كم the and or with from for this that what how why when where is are can you your about tell give show please'.split(/\s+/);
var knowledge=[];
var aliases={
 'واتساب':['whatsapp','واتساب','واتس','واتس اب','رقم الواتساب'], 'واتس':['whatsapp','واتساب'],
 'هاتف':['phone','telephone','mobile','هاتف','تليفون','موبايل','رقم'], 'تليفون':['phone','telephone','هاتف'],
 'بريد':['email','mail','البريد','ايميل','إيميل','البريد الالكتروني'], 'ايميل':['email','mail'],
 'خريطة':['maps','google maps','خريطة','الموقع','العنوان','لوكيشن'], 'عنوان':['address','العنوان','location'],
 'موزع':['distributor','distribution','موزع','توزيع','وكيل'], 'توزيع':['distributor','distribution','موزع','توزيع','وكيل'], 'وكيل':['distributor','distribution','موزع','وكيل'],
 'وظيفة':['job','jobs','career','careers','وظيفة','وظائف','توظيف'], 'وظائف':['job','jobs','career','careers'], 'توظيف':['job','jobs','career'],
 'منتج':['product','products','منتج','منتجات','دواء','ادوية','دواء'], 'منتجات':['product','products','منتج','منتجات'], 'دواء':['product','products','medicine','drug'], 'ادوية':['product','products','medicine'],
 'بروشور':['brochure','brochures','pdf','بروشور','بروشورات','كتالوج'], 'بروشورات':['brochure','brochures','pdf'],
 'خبر':['news','خبر','اخبار','أخبار'], 'اخبار':['news','خبر'], 'شهادة':['certification','certificate','quality','شهادة','جودة'], 'جودة':['quality','certification','جودة'],
 'شركة':['company','about','company profile','شركة','الشركة','نبذة'], 'نبذة':['company','about','overview','نبذة'], 'تواصل':['contact','phone','email','whatsapp','maps','تواصل'], 'التواصل':['contact','phone','email','whatsapp','maps'],
 'سعر':['price','pricing','سعر','السعر'], 'اسعار':['price','pricing','سعر'], 'استخدام':['indication','indications','uses','استخدام','استخدامات'], 'استخدامات':['indication','indications','uses'],
 'مادة':['active ingredient','ingredient','المادة الفعالة'], 'فعالة':['active ingredient','المادة الفعالة'], 'تركيز':['strength','concentration','التركيز'], 'عبوة':['pack size','package','العبوة']
};
function ar(){return (localStorage.getItem('zeta-lang')||'ar')==='ar'}
function esc(v){return String(v==null?'':v).replace(/[&<>\"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]})}
function norm(v){return String(v==null?'':v).toLowerCase().replace(/[أإآ]/g,'ا').replace(/ة/g,'ه').replace(/ى/g,'ي').replace(/[ًٌٍَُِّْـ]/g,'').replace(/[\u200f\u200e]/g,'').replace(/[^\p{L}\p{N}]+/gu,' ').trim()}
function terms(q){return norm(q).split(/\s+/).filter(function(x){return x.length>1&&STOP.indexOf(x)<0})}
function textOf(x){var out=[];function walk(v){if(v==null)return;if(typeof v==='string'||typeof v==='number'||typeof v==='boolean'){out.push(String(v));return}if(Array.isArray(v)){v.forEach(walk);return}if(typeof v==='object')Object.keys(v).forEach(function(k){if(k!=='hidden')walk(v[k])})}walk(x);return out.join(' ')}
function add(type,title,x,extra){var raw=textOf(x)+' '+String(extra||'');if(raw.trim())knowledge.push({type:type,title:title||'',raw:raw,source:x})}
async function get(path){try{var r=await fetch('/content/'+path+'.json?v='+Date.now(),{cache:'no-store'});return r.ok?await r.json():{};}catch(e){return{}}}
async function build(){
 var all=await Promise.all(SOURCES.map(get));
 var site=all[0]||{},products=(all[1].products||[]),brochures=(all[2].brochures||[]),news=(all[3].news||[]),certs=(all[4].certifications||[]),jobs=(all[5].jobs||[]),faqs=(all[6].faqs||[]),tests=(all[7].testimonials||[]);
 knowledge=[];
 var c=site.company||{};
 add('company','ZETA BIOTECH',site,'ZETA BIOTECH company pharmaceutical medicine healthcare Egypt');
 add('company','بيانات التواصل',{name:c.name||'ZETA BIOTECH',email:c.email,notificationEmail:c.notificationEmail,phone:c.phone,whatsapp:c.whatsapp,addressAr:c.addressAr,addressEn:c.addressEn,googleMaps:c.googleMaps,facebook:c.facebook,instagram:c.instagram,linkedin:c.linkedin,overviewAr:c.overviewAr,overviewEn:c.overviewEn});
 products.filter(function(x){return !x.hidden}).forEach(function(x){add('product',x.nameAr||x.nameEn||x.name||'Product',x,'product products medicine دواء منتج منتجات');});
 brochures.filter(function(x){return !x.hidden}).forEach(function(x){add('brochure',x.titleAr||x.titleEn||x.title||'Brochure',x,'brochure brochures pdf بروشور');});
 news.filter(function(x){return !x.hidden}).forEach(function(x){add('news',x.titleAr||x.titleEn||x.title||'News',x,'news خبر اخبار');});
 certs.filter(function(x){return !x.hidden}).forEach(function(x){add('certification',x.titleAr||x.titleEn||x.title||'Certification',x,'certification quality شهادة جودة');});
 jobs.filter(function(x){return !x.hidden}).forEach(function(x){add('job',x.titleAr||x.titleEn||x.title||'Job',x,'job jobs career وظيفة وظائف توظيف');});
 faqs.filter(function(x){return !x.hidden}).forEach(function(x){add('faq',x.questionAr||x.questionEn||x.question||'FAQ',x,'faq frequently asked questions سؤال شائع'));});
 tests.filter(function(x){return !x.hidden}).forEach(function(x){add('testimonial',x.name||x.title||'Testimonial',x,'testimonial شهادة عميل'));});
 var visible='';try{visible=(document.body&&document.body.innerText)||'';}catch(e){}
 if(visible.length>40)add('website','المحتوى الظاهر على الموقع',{text:visible},'website homepage navigation sections site content محتوى الموقع');
 return knowledge;
}
function score(item,ts,q){
 var t=norm(item.title+' '+item.raw), title=norm(item.title), n=0;
 ts.forEach(function(z){
  if(t.indexOf(z)>=0)n+=3;
  if(title.indexOf(z)>=0)n+=8;
  (aliases[z]||[]).forEach(function(s){if(t.indexOf(norm(s))>=0)n+=5;});
 });
 var nq=norm(q);if(nq.length>3&&t.indexOf(nq)>=0)n+=25;
 return n;
}
function label(type){return {company:'الشركة',product:'منتج',brochure:'بروشور',news:'خبر',certification:'شهادة/جودة',job:'وظيفة',faq:'سؤال شائع',testimonial:'شهادة عميل',website:'الموقع'}[type]||'معلومة'}
function pick(a,e){return ar()?(a||e||''):(e||a||'')}
function productText(s){var lines=[];lines.push(pick(s.descriptionAr,s.descriptionEn)||pick(s.indicationAr,s.indicationEn)||pick(s.nameAr,s.nameEn)||pick(s.name,''));if(s.activeIngredientAr||s.activeIngredientEn)lines.push((ar()?'المادة الفعالة: ':'Active ingredient: ')+pick(s.activeIngredientAr,s.activeIngredientEn));if(s.strength)lines.push((ar()?'التركيز: ':'Strength: ')+s.strength);if(s.dosageForm)lines.push((ar()?'الشكل الدوائي: ':'Dosage form: ')+s.dosageForm);if(s.packSize)lines.push((ar()?'العبوة: ':'Pack size: ')+s.packSize);if(s.registrationNo)lines.push((ar()?'رقم التسجيل: ':'Registration no.: ')+s.registrationNo);if(s.indicationAr||s.indicationEn)lines.push((ar()?'الاستخدامات: ':'Indications: ')+pick(s.indicationAr,s.indicationEn));return lines.filter(Boolean).join('<br>')}
function fallback(q){var l=knowledge.filter(function(x){return x.type!=='website'}).slice(0,8);if(!l.length)return ar()?'قاعدة المعرفة جاهزة، لكن لا توجد بيانات منشورة حاليًا في لوحة الموقع.':'The knowledge base is ready, but there is no published CMS data yet.';var topic=terms(q).slice(0,3).join(' ');return (ar()?'لم أجد إجابة حرفية على "'+esc(q)+'"، لكن هذه أقرب المعلومات المتاحة بخصوص '+esc(topic||'سؤالك')+':':'I could not find an exact answer to "'+esc(q)+'", but these are the closest available website records:')+'<br><br>'+l.map(function(x){return '• <b>'+label(x.type)+':</b> '+esc(x.title)}).join('<br>')}
function answer(q){
 var ts=terms(q);if(!ts.length)return ar()?'اكتب سؤالك، وسأبحث في كل معلومات الموقع.':'Ask your question and I will search the website knowledge.';
 var ranked=knowledge.map(function(x){return {item:x,score:score(x,ts,q)}}).filter(function(x){return x.score>0}).sort(function(a,b){return b.score-a.score});
 if(!ranked.length)return fallback(q);
 var best=ranked[0].item,s=best.source||{},out='';
 if(best.type==='faq')out=pick(s.answerAr,s.answerEn)||textOf(s);
 else if(best.type==='product')out=productText(s);
 else if(best.type==='company')out=pick(s.overviewAr,s.overviewEn)||pick(s.descriptionAr,s.descriptionEn)||textOf(s);
 else if(best.type==='job')out=pick(s.descriptionAr,s.descriptionEn)||pick(s.titleAr,s.titleEn)||textOf(s);
 else if(best.type==='website')out=ar()?'وجدت هذه المعلومات في المحتوى المنشور على الموقع:<br><br>'+esc(best.raw.slice(0,1800)):'I found this information in the published website content:<br><br>'+esc(best.raw.slice(0,1800));
 else out=pick(s.descriptionAr,s.descriptionEn)||pick(s.bodyAr,s.bodyEn)||pick(s.textAr,s.textEn)||textOf(s);
 var related=ranked.slice(1,4).map(function(r){return '• '+label(r.item.type)+': '+esc(r.item.title)}).join('<br>');
 if(related)out+='<br><br><b>'+(ar()?'معلومات مرتبطة:':'Related information:')+'</b><br>'+related;
 return out||fallback(q);
}
function renderAssistant(){
 var host=document.getElementById('znextAssistant');
 if(!host){host=document.createElement('div');host.id='znextAssistant';host.className='znext-assistant';host.innerHTML='<div class="znext-ai-panel" id="znextAiPanel"><div class="znext-ai-head">🤖 ZETA BIOTECH AI</div><div class="znext-ai-body" id="znextAiBody"><div class="znext-ai-msg">'+(ar()?'مرحبًا! أنا مساعد ZETA BIOTECH. أبحث في معلومات الشركة والمنتجات والبروشورات والأخبار والشهادات والوظائف وFAQ ومحتوى الموقع الظاهر.':'Hello! I search ZETA BIOTECH company, products, brochures, news, certifications, careers, FAQs and visible website content.')+'</div></div><form class="znext-ai-form" id="znextAiForm"><input id="znextAiInput" autocomplete="off" placeholder="'+(ar()?'اسأل عن أي معلومة في الموقع...':'Ask about anything on the website...')+'"><button>↗</button></form></div><button class="znext-ai-btn" id="znextAiBtn">🤖 '+(ar()?'المساعد الذكي':'AI Assistant')+'</button></div>';document.body.appendChild(host)}
 var btn=document.getElementById('znextAiBtn'),panel=document.getElementById('znextAiPanel'),form=document.getElementById('znextAiForm'),input=document.getElementById('znextAiInput'),body=document.getElementById('znextAiBody');
 if(btn)btn.onclick=function(){panel.classList.toggle('show');if(panel.classList.contains('show'))input.focus()};
 if(form&&!form.dataset.zetaKnowledge){form.dataset.zetaKnowledge='2';form.onsubmit=async function(e){e.preventDefault();var q=String(input.value||'').trim();if(!q)return;body.innerHTML+='<div class="znext-ai-msg znext-ai-user">'+esc(q)+'</div>';input.value='';var msg=document.createElement('div');msg.className='znext-ai-msg';msg.innerHTML='⏳ '+(ar()?'أبحث في قاعدة معرفة الموقع والمحتوى المنشور...':'Searching the website knowledge base and published content...');body.appendChild(msg);await build();msg.innerHTML=answer(q);body.scrollTop=body.scrollHeight;}}
}
function boot(){renderAssistant();build();setTimeout(build,2500);}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
setInterval(build,120000);
})();
