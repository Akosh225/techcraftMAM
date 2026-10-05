/* TechCraft — скрипты сайта.
   1. Прелоадер
   2. Фон: анимированные волны из частиц (canvas 2D)
   3. Анимации появления, бургер-меню, плавная прокрутка к якорям
   4. Фильтр и поиск проектов + модальное окно
   5. Аккордеон FAQ
   6. Валидация формы
   7. Кнопка Наверх
   8. Анимации при скролле */

/* ===== 1. Прелоадер ===== */
(function(){
var preloader=document.querySelector('.preloader');
if(preloader){
 window.addEventListener('load',function(){
  setTimeout(function(){preloader.classList.add('hidden')},400);
 });
}
})();

/* ===== 2. Фон-canvas ===== */
(function(){
var c=document.getElementById('bg');if(!c||!c.getContext)return;
var g=c.getContext('2d'),W=0,H=0,scale=1,PI=Math.PI,
reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches,t0=performance.now();
var ALPHA=[.95,.7,.5,.32,.18];
function mk(o,n){o.bk=[[],[],[],[],[]];for(var i=0;i<n;i++){var u=Math.random();u=u<.08?-Math.random()*.06:Math.pow(Math.random(),1.7);var k=u<0?0:Math.min(4,Math.floor(u*5.5));o.bk[k].push([Math.random(),u,.6+Math.random()*.9])}return o}
var waves=[
mk({b:.6,a:.12,k:1.3,s:.33,p:0,a2:.045,k2:2.9,s2:.5,th:.5,al:.62,f:.2},9000),
mk({b:.72,a:.1,k:1.9,s:-.27,p:2.1,a2:.04,k2:3.7,s2:-.42,th:.42,al:.9,f:.3},9000)];
var stars=[];for(var i=0;i<260;i++)stars.push([Math.random(),Math.random()*.9,.5+Math.random()*.9,Math.random()*6.28,.4+Math.random()*1.2]);
function Y(w,nx,t){return H*(w.b+w.a*Math.sin(nx*w.k*PI+w.p+t*w.s)+w.a2*Math.sin(nx*w.k2*PI+t*w.s2))}
function size(){var d=Math.min(window.devicePixelRatio||1,1.5);W=c.clientWidth;H=c.clientHeight;c.width=W*d;c.height=H*d;g.setTransform(d,0,0,d,0,0);scale=Math.max(.45,Math.min(1.2,W*H/1300000))}
function draw(t){
g.clearRect(0,0,W,H);
var h=g.createRadialGradient(W*.46,H*.42,0,W*.46,H*.42,H*.4);h.addColorStop(0,'rgba(120,125,140,.16)');h.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=h;g.fillRect(0,0,W,H);
g.fillStyle='#fff';
for(var i=0;i<stars.length;i++){var s=stars[i];g.globalAlpha=.15+.4*(.5+.5*Math.sin(t*s[4]+s[3]));g.fillRect(s[0]*W,s[1]*H,s[2],s[2])}
for(var wi=0;wi<waves.length;wi++){
var w=waves[wi],top=H*(w.b-w.a-w.a2),gr=g.createLinearGradient(0,top,0,H);
gr.addColorStop(0,'rgba(235,238,245,'+(.5*w.al)+')');gr.addColorStop(.55,'rgba(150,155,170,'+(.22*w.al)+')');gr.addColorStop(1,'rgba(0,0,0,0)');
g.globalAlpha=1;g.beginPath();g.moveTo(0,H);
for(var x=0;x<=W+10;x+=10)g.lineTo(x,Y(w,x/W,t));
g.lineTo(W+10,H);g.closePath();g.fillStyle=gr;g.fill();
g.fillStyle='#fff';
for(var k=0;k<5;k++){
g.globalAlpha=ALPHA[k]*w.al;var arr=w.bk[k],n=Math.floor(arr.length*scale);
for(var j=0;j<n;j++){var q=arr[j],nx=q[0];g.fillRect(nx*W,Y(w,nx,t)+q[1]*w.th*H,q[2],q[2])}}
}
g.globalAlpha=1}
size();
if(reduce){draw(1.5)}else{(function loop(now){draw((now-t0)/1000+1.5);requestAnimationFrame(loop)})(performance.now())}
var rt;window.addEventListener('resize',function(){clearTimeout(rt);rt=setTimeout(function(){size();if(reduce)draw(1.5)},100)});
})();

/* ===== 2. Анимации и меню ===== */
(function(){
var b=document.body,burger=document.querySelector('.burger'),mq=window.matchMedia('(min-width: 1200px)');
function set(o){b.classList.toggle('menu-open',o);burger.setAttribute('aria-expanded',o);burger.setAttribute('aria-label',o?'Закрыть меню':'Открыть меню')}
document.querySelectorAll('.appear,.hero-photo').forEach(function(el){el.addEventListener('animationend',function(){el.classList.add('is-in')},{once:true})});
requestAnimationFrame(function(){requestAnimationFrame(function(){
var a=document.querySelector('.appear'),ok=a&&a.getAnimations&&a.getAnimations().some(function(x){return x.playState==='running'||x.playState==='finished'});
if(!ok)document.querySelectorAll('.appear,.hero-photo').forEach(function(el){el.classList.add('is-in')})})});
document.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('a[href^="#"]');if(!a)return;var id=a.getAttribute('href').slice(1),t=id?document.getElementById(id):document.body;e.preventDefault();set(false);if(t)t.scrollIntoView({behavior:'smooth',block:'start'})});
burger.addEventListener('click',function(){set(!b.classList.contains('menu-open'))});
document.querySelectorAll('nav a').forEach(function(a){a.addEventListener('click',function(){set(false)})});
document.addEventListener('keydown',function(e){if(e.key==='Escape')set(false)});
(mq.addEventListener?mq.addEventListener('change',function(e){if(e.matches)set(false)}):mq.addListener(function(e){if(e.matches)set(false)}));
})();

/* ===== 3. Портфолио: фильтр + поиск + модальное окно ===== */
(function(){
var cards=[].slice.call(document.querySelectorAll('#case-list .case'));
if(!cards.length)return;
var btns=[].slice.call(document.querySelectorAll('[data-filter]')),q=document.getElementById('search'),
empty=document.getElementById('empty'),count=document.getElementById('count'),cat='all';
function apply(){
 var s=q.value.trim().toLowerCase(),n=0;
 cards.forEach(function(c){
  var ok=(cat==='all'||c.dataset.category===cat)&&(!s||c.textContent.toLowerCase().indexOf(s)>-1||c.dataset.stack.toLowerCase().indexOf(s)>-1);
  c.hidden=!ok;if(ok)n++;
 });
 empty.hidden=n>0;count.textContent='Показано проектов: '+n+' из '+cards.length;
}
btns.forEach(function(b){b.addEventListener('click',function(){
 cat=b.dataset.filter;btns.forEach(function(x){x.setAttribute('aria-pressed',x===b)});apply();
})});
q.addEventListener('input',apply);apply();
var dlg=document.getElementById('case-dialog');
if(dlg&&dlg.showModal){
 document.addEventListener('click',function(e){
  var open=e.target.closest('[data-open]');
  if(open){
   var c=open.closest('.case'),img=c.querySelector('img');
   dlg.querySelector('img').src=img.getAttribute('src');dlg.querySelector('img').alt=img.alt;
   dlg.querySelector('h3').textContent=c.querySelector('h3').textContent;
   dlg.querySelector('.d-text').textContent=c.querySelector('p').textContent;
   dlg.querySelector('.d-client').textContent=c.dataset.client;
   dlg.querySelector('.d-stack').textContent=c.dataset.stack;
   dlg.querySelector('.d-result').textContent=c.dataset.result;
   dlg.showModal();return;
  }
  if(e.target.closest('[data-close]')||e.target===dlg)dlg.close();
 });
}
})();

/* ===== 4. Аккордеон FAQ ===== */
(function(){
var btns=[].slice.call(document.querySelectorAll('.acc-btn'));
btns.forEach(function(b){b.addEventListener('click',function(){
 var was=b.getAttribute('aria-expanded')==='true';
 btns.forEach(function(x){x.setAttribute('aria-expanded','false');document.getElementById(x.getAttribute('aria-controls')).hidden=true});
 if(!was){b.setAttribute('aria-expanded','true');document.getElementById(b.getAttribute('aria-controls')).hidden=false}
})});
})();

/* ===== 5. Форма обратной связи: валидация ===== */
(function(){
var form=document.getElementById('contact-form');if(!form)return;
var status=document.getElementById('form-status');
var rules={
 name:function(v){if(!v)return 'Введите имя';if(v.length<2)return 'Имя — минимум 2 символа';return ''},
 email:function(v){if(!v)return 'Введите email';if(!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v))return 'Некорректный email, пример: name@mail.com';return ''},
 phone:function(v){if(!v)return 'Введите телефон';if(!/^\+?[0-9\s\-()]{10,18}$/.test(v)||v.replace(/\D/g,'').length<10)return 'Телефон: от 10 цифр, пример: +7 700 123-45-67';return ''},
 service:function(v){return v?'':'Выберите услугу'},
 message:function(v){if(!v)return 'Опишите задачу';if(v.length<10)return 'Сообщение — минимум 10 символов';return ''}
};
function check(name){
 var el=form.elements[name],msg=rules[name](el.value.trim());
 document.getElementById(name+'-error').textContent=msg;
 el.setAttribute('aria-invalid',msg?'true':'false');return !msg;
}
function checkConsent(){
 var el=form.elements.consent,ok=el.checked;
 document.getElementById('consent-error').textContent=ok?'':'Необходимо согласие на обработку данных';return ok;
}
Object.keys(rules).forEach(function(n){
 form.elements[n].addEventListener('blur',function(){check(n)});
 form.elements[n].addEventListener('input',function(){if(form.elements[n].getAttribute('aria-invalid')==='true')check(n)});
});
form.addEventListener('submit',function(e){
 e.preventDefault();status.hidden=true;
 var ok=true,first=null;
 Object.keys(rules).forEach(function(n){if(!check(n)){ok=false;if(!first)first=form.elements[n]}});
 if(!checkConsent()){ok=false;if(!first)first=form.elements.consent}
 if(!ok){first.focus();return}
 var name=form.elements.name.value.trim();
 status.textContent='Спасибо, '+name+'! Заявка отправлена (демо). Мы свяжемся с вами в течение двух рабочих дней.';
 status.hidden=false;form.reset();
 Object.keys(rules).forEach(function(n){form.elements[n].setAttribute('aria-invalid','false')});
});
})();

/* ===== 6. Кнопка Наверх ===== */
(function(){
var btn=document.querySelector('.scroll-top');if(!btn)return;
var showAfter=300;
function update(){
 btn.classList.toggle('visible',window.scrollY>showAfter);
}
window.addEventListener('scroll',update,{passive:true});
update();
btn.addEventListener('click',function(){window.scrollTo({top:0,behavior:'smooth'})});
})();

/* ===== 7. Анимации при скролле (Intersection Observer) ===== */
(function(){
if(!('IntersectionObserver'in window))return;
var observer=new IntersectionObserver(function(entries){
 entries.forEach(function(entry){
  if(entry.isIntersecting){
   entry.target.classList.add('visible');
  }
 });
},{threshold:.1,rootMargin:'0px 0px -50px 0px'});
document.querySelectorAll('.scroll-reveal,.scroll-reveal-left,.scroll-reveal-right,.scroll-reveal-scale').forEach(function(el){
 observer.observe(el);
})();

/* Анимация чисел в статистике */
var numObserver=new IntersectionObserver(function(entries){
 entries.forEach(function(entry){
  if(entry.isIntersecting&&!entry.target.classList.contains('animated')){
   entry.target.classList.add('animated');
   var target=parseInt(entry.target.dataset.target,10),current=0,duration=2000,start=performance.now();
   function update(now){
    var elapsed=now-start,progress=Math.min(elapsed/duration,1),ease=1-Math.pow(1-progress,3);
    entry.target.textContent=Math.floor(current+(target-current)*ease);
    if(progress<1)requestAnimationFrame(update);
    else entry.target.textContent=target;
   }
   requestAnimationFrame(update);
  }
 });
},{threshold:.5});
document.querySelectorAll('.stat-number').forEach(function(el){numObserver.observe(el)});
})();

/* ===== 8. Переключатель темы ===== */
(function(){
console.log('Theme toggle script loaded');
var toggle=document.querySelector('.theme-toggle');
console.log('Toggle button found:', !!toggle);
if(!toggle){
 console.log('Toggle button not found');
 return;
}
var saved=localStorage.getItem('theme');
console.log('Saved theme:', saved);
if(saved==='light')document.body.classList.add('light-theme');
toggle.addEventListener('click',function(){
 document.body.classList.toggle('light-theme');
 localStorage.setItem('theme',document.body.classList.contains('light-theme')?'light':'dark');
 console.log('Theme toggled, current:', document.body.classList.contains('light-theme')?'light':'dark');
});
})();

/* ===== 9. Модальное окно с формой ===== */
(function(){
console.log('Modal script loaded');
var overlay=document.getElementById('contact-modal');
var closeBtn=document.querySelector('.modal-close');
var openBtns=document.querySelectorAll('[data-open-modal]');
console.log('Modal elements found:', !!overlay, !!closeBtn, openBtns.length);
if(!overlay||!closeBtn){
 console.log('Modal elements not found');
 return;
}
function open(){
 console.log('Opening modal');
 overlay.classList.add('open');
 overlay.setAttribute('aria-hidden','false');
 document.body.style.overflow='hidden';
}
function close(){
 console.log('Closing modal');
 overlay.classList.remove('open');
 overlay.setAttribute('aria-hidden','true');
 document.body.style.overflow='';
}
closeBtn.addEventListener('click',close);
overlay.addEventListener('click',function(e){if(e.target===overlay)close()});
document.addEventListener('keydown',function(e){if(e.key==='Escape')close()});
openBtns.forEach(function(btn){
 console.log('Adding click listener to button:', btn);
 btn.addEventListener('click',function(e){
  e.preventDefault();
  open();
 });
});
/* Валидация модальной формы */
var modalForm=document.getElementById('modal-form');
if(modalForm){
 var status=document.getElementById('modal-status');
 var rules={
  name:function(v){if(!v)return 'Введите имя';if(v.length<2)return 'Имя — минимум 2 символа';return ''},
  email:function(v){if(!v)return 'Введите email';if(!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v))return 'Некорректный email';return ''},
  message:function(v){if(!v)return 'Опишите задачу';if(v.length<10)return 'Сообщение — минимум 10 символов';return ''}
 };
 function check(name){
  var el=modalForm.elements[name],msg=rules[name](el.value.trim());
  document.getElementById('modal-'+name+'-error').textContent=msg;
  el.setAttribute('aria-invalid',msg?'true':'false');return !msg;
 }
 Object.keys(rules).forEach(function(n){
  modalForm.elements[n].addEventListener('blur',function(){check(n)});
  modalForm.elements[n].addEventListener('input',function(){if(modalForm.elements[n].getAttribute('aria-invalid')==='true')check(n)});
 });
 modalForm.addEventListener('submit',function(e){
  e.preventDefault();status.hidden=true;
  var ok=true,first=null;
  Object.keys(rules).forEach(function(n){if(!check(n)){ok=false;if(!first)first=modalForm.elements[n]}});
  if(!ok){first.focus();return}
  var name=modalForm.elements.name.value.trim();
  status.textContent='Спасибо, '+name+'! Заявка отправлена (демо).';
  status.hidden=false;modalForm.reset();
  Object.keys(rules).forEach(function(n){modalForm.elements[n].setAttribute('aria-invalid','false')});
  setTimeout(close,2000);
 });
}
})();

/* ===== 10. Частицы на фоне ===== */
(function(){
console.log('Particles script loaded');
if(window.matchMedia('(max-width: 768px)').matches){
 console.log('Particles disabled on mobile');
 return;
}
var particles=[];
var particleCount=50;
var mouseX=window.innerWidth/2;
var mouseY=window.innerHeight/2;
var idleTimer=null;
var isIdle=false;
var idleThreshold=10000;

/* Координаты для буквы M (относительные 0-100) */
var mShape=[
 [10,10],[10,90],[20,50],[30,90],[40,90],[50,50],[60,90],[70,90],[80,50],[90,90],[90,10],
 [15,20],[15,80],[25,50],[35,80],[45,80],[55,50],[65,80],[75,80],[85,50],[85,20]
];

function createParticle(x,y){
 var p=document.createElement('div');
 p.className='bg-particle';
 p.style.left=x+'px';
 p.style.top=y+'px';
 document.body.appendChild(p);
 return{el:p,x:x,y:y,targetX:x,targetY:y};
}

function initParticles(){
 console.log('Initializing particles...');
 for(var i=0;i<particleCount;i++){
  particles.push(createParticle(Math.random()*window.innerWidth,Math.random()*window.innerHeight));
 }
 console.log('Particles created:', particles.length);
}

function updateParticles(){
 particles.forEach(function(p){
  var dx=p.targetX-p.x;
  var dy=p.targetY-p.y;
  p.x+=dx*.05;
  p.y+=dy*.05;
  p.el.style.left=p.x+'px';
  p.el.style.top=p.y+'px';
 });
 requestAnimationFrame(updateParticles);
}

document.addEventListener('mousemove',function(e){
 mouseX=e.clientX;
 mouseY=e.clientY;
 clearTimeout(idleTimer);
 if(isIdle){
  isIdle=false;
  resetTargets();
 }
 idleTimer=setTimeout(function(){
  isIdle=true;
  formM();
 },idleThreshold);
});

function resetTargets(){
 particles.forEach(function(p,i){
  p.targetX=mouseX+(Math.random()-0.5)*200;
  p.targetY=mouseY+(Math.random()-0.5)*200;
 });
}

function formM(){
 var centerX=window.innerWidth/2;
 var centerY=window.innerHeight/2;
 var scale=Math.min(window.innerWidth,window.innerHeight)/150;
 particles.forEach(function(p,i){
  var point=mShape[i%mShape.length];
  p.targetX=centerX+(point[0]-50)*scale;
  p.targetY=centerY+(point[1]-50)*scale;
 });
}

initParticles();
resetTargets();
updateParticles();
})();
