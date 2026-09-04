(function(){
'use strict';
var SOURCES=['site','products','brochures','news','certifications','jobs','faqs','testimonials'];
var knowledge=[];
var history=[];
var aliases={
 'واتساب':['whatsapp','واتساب','واتس','واتس اب','واتسآب'],
 'هاتف':['phone','telephone','mobile','هاتف','تليفون','موبايل','رقم'],
 'بريد':['email','mail','البريد','ايميل','إيميل','بريد إلكتروني'],
 'خريطة':['maps','google maps','خريطة','الموقع','لوكيشن','location'],
 'عنوان':['address','location','العنوان'],
 'موزع':['distributor','distribution','موزع','توزيع','وكيل'],
 'وظيفة':['job','jobs','career','careers','وظيفة','وظائف','توظيف'],
 'منتج':['product','products','منتج','منتجات','دواء','ادوية','دواء'],
 'بروشور':['brochure','brochures','pdf','بروشور','بروشورات','كتالوج','ملف'],
 'خبر':['news','خبر','اخبار','أخبار','تحديث','تحديثات'],
 'شهادة':['certification','certificate','quality','شهادة','شهادات','جودة','اعتماد','اعتمادات'],
 'شركة':['company','about','company profile','شركة','الشركة','نبذة'],
 'تواصل':['contact','phone','email','whatsapp','maps','تواصل','اتصال'],
 'سعر':['price','pricing','سعر','السعر','تكلفة'],
 'استخدام':['indication','indications','uses','استخدام','استخدامات','دواعي'],
 'مادة':['active ingredient','ingredient','المادة الفعالة','مادة فعالة'],
 'تركيز':['strength','concentration','التركيز'],
 'عبوة':['pack size','package','العبوة','عبوة']
};
var stop='من في على عن إلى الي و أو مع هذا هذه ذلك التي الذي هو هي هم نحن ان إن لا لم لن ما ماذا كيف هل لماذا متى أين كم يا انا انت انتو هو هي the and or with from for this that what how why when where is are can you your about tell give show please'.split(/\s+/);
function ar(){return (localStorage.getItem('zeta-lang')||'ar')==='ar'}
function esc(v){return String(v==null?'':v).replace(/[&<>\"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]})}
function norm(v){return String(v==null?'':v).toLowerCase().replace(/[أإآ]/g,'ا').replace(/ة/g,'ه').replace(/ى/g,'ي').replace(/[ًٌٍَُِّْـ]/g,'').replace(/[\u200f\u200e]/g,'').replace(/[^\p{L}\p{N}]+/gu,' ').trim()}
function terms(q){return norm(q).split(/\s+/).filter(function(x){return x.length>1&&stop.indexOf(x)<0})}
function textOf(x){var out=[];function walk(v){if(v==null)return;if(typeof v==='string'||typeof v==='number'||typeof v==='boolean'){out.push(String(v));return}if(Array.isArray(v)){v.forEach(walk);return}if(typeof v==='object')Object.keys(v).forEach(function(k){if(k!=='hidden')walk(v[k])})}walk(x);return out.join(' ')}
function add(type,title,x){var raw=textOf(x);if(raw.trim())knowledge.push({type:type,title:title||'',raw:raw,source:x})}
async function get(path){try{var r=await fetch('/content/'+path+'.json?v='+Date.now(),{cache:'no-store'});return r.ok?await r.json():{};}catch(e){return{}}}
async function build(){var all=await Promise.all(SOURCES.map(get));knowledge=[];var site=all[0]||{},products=(all[1].products||[]),brochures=(all[2].brochures||[]),news=(all[3].news||[]),certs=(all[4].certifications||[]),jobs=(all[5].jobs||[]),faqs=(all[6].faqs||[]),tests=(all[7].testimonials||[]),c=site.company||{};
 add('company','ZETA BIOTECH',site.company||{}); add('home','الصفحة الرئيسية',site.home||{}); add('about','عن الشركة',site.about||{}); add('contact','بيانات التواصل',{name:c.name||'ZETA BIOTECH',email:c.email,notificationEmail:c.notificationEmail,phone:c.phone,whatsapp:c.whatsapp,addressAr:c.addressAr||c.address&&c.address.ar,addressEn:c.addressEn||c.address&&c.address.en,googleMaps:c.googleMaps,facebook:c.facebook,instagram:c.instagram,linkedin:c.linkedin,overviewAr:c.overviewAr||c.overview&&c.overview.ar,overviewEn:c.overviewEn||c.overview&&c.overview.en});
 products.filter(function(x){return !x.hidden}).forEach(function(x){add('product',x.nameAr||x.nameEn||x.name||'Product',x)});
 brochures.filter(function(x){return !x.hidden}).forEach(function(x){add('brochure',x.titleAr||x.titleEn||x.title||'Brochure',x)});
 news.filter(function(x){return !x.hidden}).forEach(function(x){add('news',x.titleAr||x.titleEn||x.title||'News',x)});
 certs.filter(function(x){return !x.hidden}).forEach(function(x){add('certification',x.titleAr||x.titleEn||x.title||'Certification',x)});
 jobs.filter(function(x){return !x.hidden}).forEach(function(x){add('job',x.titleAr||x.titleEn||x.title||'Job',x)});
 faqs.filter(function(x){return !x.hidden}).forEach(function(x){add('faq',x.questionAr||x.questionEn||x.question||'FAQ',x)});
 tests.filter(function(x){return !x.hidden}).forEach(function(x){add('testimonial',x.name||x.title||'Testimonial',x)});
 return knowledge;
}
function expandTerms(ts){var out=ts.slice();ts.forEach(function(z){Object.keys(aliases).forEach(function(k){var a=aliases[k]||[];if(z===norm(k)||a.some(function(v){return norm(v)===z})){out.push(norm(k));a.forEach(function(v){out.push(norm(v))})}})});return out.filter(function(v,i,a){return v&&a.indexOf(v)===i})}
function score(item,ts,q){var t=norm(item.title+' '+item.raw),title=norm(item.title),n=0;ts.forEach(function(z){if(z.length<2)return;if(t.indexOf(z)>=0)n+=2;if(title.indexOf(z)>=0)n+=8});var nq=norm(q);if(nq.length>3&&t.indexOf(nq)>=0)n+=20;return n}
function pick(a,e){return ar()?(a||e||''):(e||a||'')}
function label(type){return {company:'الشركة',home:'الموقع',about:'عن الشركة',contact:'التواصل',product:'منتج',brochure:'بروشور',news:'خبر',certification:'شهادة/جودة',job:'وظيفة',faq:'سؤال شائع',testimonial:'شهادة عميل'}[type]||'معلومة'}
function intent(q){var n=norm(q);function has(a){return a.some(function(x){return n.indexOf(norm(x))>=0})}return {
 contact:has(['تواصل','اتصال','whatsapp','واتساب','هاتف','تليفون','موبايل','email','ايميل','بريد','خريطة','عنوان','location','maps']),
 product:has(['منتج','منتجات','product','products','دواء','ادوية','medicine']),
 brochure:has(['بروشور','بروشورات','brochure','brochures','pdf','كتالوج']),
 news:has(['خبر','اخبار','أخبار','news','تحديثات','تحديث']),
 certification:has(['شهادة','شهادات','جودة','اعتماد','certification','quality']),
 job:has(['وظيفة','وظائف','توظيف','job','jobs','career']),
 distributor:has(['موزع','موزعين','توزيع','وكيل','distributor','distribution']),
 company:has(['شركة','الشركة','نبذة','عن الشركة','company','about']),
 price:has(['سعر','السعر','price','pricing','تكلفة'])
 };}
function emptySection(type){var m={product:['لا توجد منتجات منشورة حاليًا في قاعدة بيانات الموقع.','No products are currently published in the website database.'],brochure:['لا توجد بروشورات منشورة حاليًا.','No brochures are currently published.'],news:['لا توجد أخبار منشورة حاليًا.','No news items are currently published.'],certification:['لا توجد شهادات أو اعتمادات منشورة حاليًا.','No certifications are currently published.'],job:['لا توجد وظائف شاغرة منشورة حاليًا.','No job vacancies are currently published.']};return m[type]?pick(m[type][0],m[type][1]):''}
function contactAnswer(s){var rows=[];if(s.phone)rows.push((ar()?'الهاتف: ':'Phone: ')+esc(s.phone));if(s.whatsapp)rows.push((ar()?'WhatsApp: ':'WhatsApp: ')+esc(s.whatsapp));if(s.email)rows.push((ar()?'البريد الإلكتروني: ':'Email: ')+esc(s.email));if(s.addressAr||s.addressEn||s.address)rows.push((ar()?'العنوان: ':'Address: ')+esc(pick(s.addressAr||s.address&&s.address.ar,s.addressEn||s.address&&s.address.en)));if(s.googleMaps)rows.push('<a href="'+esc(s.googleMaps)+'" target="_blank" rel="noopener">'+(ar()?'فتح موقع الشركة على الخريطة ↗':'Open company location ↗')+'</a>');return rows.length?rows.join('<br>'):(ar()?'بيانات التواصل لم تُضف بعد في قاعدة بيانات الموقع.':'Contact details have not been added to the website database yet.')}
function productText(s){var lines=[];lines.push(pick(s.nameAr,s.nameEn)||s.name||'');if(s.descriptionAr||s.descriptionEn)lines.push(pick(s.descriptionAr,s.descriptionEn));if(s.activeIngredientAr||s.activeIngredientEn)lines.push((ar()?'المادة الفعالة: ':'Active ingredient: ')+pick(s.activeIngredientAr,s.activeIngredientEn));if(s.strength)lines.push((ar()?'التركيز: ':'Strength: ')+s.strength);if(s.dosageForm)lines.push((ar()?'الشكل الدوائي: ':'Dosage form: ')+s.dosageForm);if(s.packSize)lines.push((ar()?'العبوة: ':'Pack size: ')+s.packSize);if(s.registrationNo)lines.push((ar()?'رقم التسجيل: ':'Registration no.: ')+s.registrationNo);if(s.indicationAr||s.indicationEn)lines.push((ar()?'الاستخدامات: ':'Indications: ')+pick(s.indicationAr,s.indicationEn));return lines.filter(Boolean).join('<br>')}
function localAnswer(q){var ts=expandTerms(terms(q));var i=intent(q);if(i.distributor)return ar()?'للتوزيع، استخدم قسم «كن موزعًا معتمدًا» في الموقع لإرسال بيانات شركتك وبدء التواصل التجاري.':'For distribution, use the “Become an Authorized Distributor” section to submit your company details.';if(i.contact){var c=knowledge.find(function(x){return x.type==='contact'});return contactAnswer(c?c.source:{});}var wanted=[];if(i.product)wanted.push('product');if(i.brochure)wanted.push('brochure');if(i.news)wanted.push('news');if(i.certification)wanted.push('certification');if(i.job)wanted.push('job');if(i.company)wanted.push('company','about');if(wanted.length){var matches=knowledge.filter(function(x){return wanted.indexOf(x.type)>=0});if(!matches.length)return emptySection(wanted[0]);if(wanted.length===1&&wanted[0]!== 'company'){if(wanted[0]==='product'||wanted[0]==='brochure'||wanted[0]==='news'||wanted[0]==='certification'||wanted[0]==='job'){var scored=matches.map(function(x){return {x:x,s:score(x,ts,q)}}).sort(function(a,b){return b.s-a.s});if(scored[0]&&scored[0].s>0){var best=scored[0].x,s=best.source||{};if(best.type==='product')return productText(s);return pick(s.descriptionAr,s.descriptionEn)||pick(s.bodyAr,s.bodyEn)||pick(s.textAr,s.textEn)||textOf(s)}}}return matches.slice(0,8).map(function(x){return '• <b>'+label(x.type)+'</b>: '+esc(x.title)}).join('<br>');}
if(i.price)return ar()?'أسعار المنتجات غير منشورة في قاعدة البيانات الحالية. إذا كنت تقصد منتجًا محددًا، اكتب اسم المنتج وسأبحث عنه.':'Product prices are not published in the current database. If you mean a specific product, type its name and I will search for it.';
if(!ts.length)return ar()?'اكتب سؤالك وسأبحث في قاعدة بيانات ZETA BIOTECH المحلية.':'Ask your question and I will search the local ZETA BIOTECH database.';
var ranked=knowledge.map(function(x){return {item:x,score:score(x,ts,q)}}).filter(function(x){return x.score>0}).sort(function(a,b){return b.score-a.score});if(!ranked.length)return ar()?'لم أجد هذه المعلومة في قاعدة بيانات ZETA BIOTECH الحالية. جرّب اسم المنتج أو الموضوع بشكل أوضح، أو اسألني عن الشركة، المنتجات، البروشورات، الأخبار، الجودة، الوظائف أو التواصل.':'I could not find that information in the current ZETA BIOTECH database. Try a product name or clearer topic, or ask about the company, products, brochures, news, quality, careers or contact.';var best=ranked[0].item,s=best.source||{},out=best.type==='product'?productText(s):(pick(s.descriptionAr,s.descriptionEn)||pick(s.bodyAr,s.bodyEn)||pick(s.textAr,s.textEn)||pick(s.overviewAr,s.overviewEn)||pick(s.overview&&s.overview.ar,s.overview&&s.overview.en)||textOf(s));var related=ranked.slice(1,4).map(function(r){return '• '+label(r.item.type)+': '+esc(r.item.title)}).join('<br>');if(related)out+='<br><br><b>'+(ar()?'معلومات مرتبطة:':'Related:')+'</b><br>'+related;return out|| (ar()?'لم أجد إجابة منشورة لهذا السؤال.':'I could not find a published answer for this question.');}
function render(){var old=document.getElementById('znextAssistant');if(old&&old.getAttribute('data-zeta-ai')!=='true')old.remove();var host=document.getElementById('znextAssistant');if(!host){host=document.createElement('div');host.id='znextAssistant';host.className='znext-assistant';document.body.appendChild(host)}host.setAttribute('data-zeta-ai','true');host.innerHTML='<div class="znext-ai-panel" id="znextAiPanel"><div class="znext-ai-head">🤖 ZETA BIOTECH AI <span style="float:right;font-size:11px;opacity:.75">'+(ar()?'قاعدة معرفة محلية':'Local Knowledge Base')+'</span></div><div class="znext-ai-body" id="znextAiBody"><div class="znext-ai-msg">'+(ar()?'مرحبًا! أنا مساعد ZETA BIOTECH المحلي. أبحث في قاعدة بيانات الموقع وأجيب حسب المعلومات المنشورة فقط.':'Hello! I am the local ZETA BIOTECH assistant. I search the website database and answer from published information only.')+'</div></div><form class="znext-ai-form" id="znextAiForm"><input id="znextAiInput" autocomplete="off" placeholder="'+(ar()?'اسأل أي سؤال...':'Ask anything...')+'"><button type="submit">↗</button></form></div><button class="znext-ai-btn" id="znextAiBtn">🤖 '+(ar()?'المساعد الذكي':'AI Assistant')+'</button></div>';var btn=document.getElementById('znextAiBtn'),panel=document.getElementById('znextAiPanel'),form=document.getElementById('znextAiForm'),input=document.getElementById('znextAiInput'),body=document.getElementById('znextAiBody');btn.onclick=function(){panel.classList.toggle('show');if(panel.classList.contains('show'))input.focus()};form.onsubmit=async function(e){e.preventDefault();var q=String(input.value||'').trim();if(!q)return;body.innerHTML+='<div class="znext-ai-msg znext-ai-user">'+esc(q)+'</div>';input.value='';var msg=document.createElement('div');msg.className='znext-ai-msg';msg.innerHTML='⏳ '+(ar()?'أبحث في قاعدة البيانات...':'Searching the database...');body.appendChild(msg);history.push({role:'user',content:q});await build();var a=localAnswer(q);history.push({role:'assistant',content:a.replace(/<[^>]+>/g,' ').slice(0,3000)});msg.innerHTML=a;body.scrollTop=body.scrollHeight};}
function boot(){render();build();setTimeout(render,700);setTimeout(build,2500)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();setInterval(function(){build()},120000);
})();
