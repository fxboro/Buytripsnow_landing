/* ── CONFIG: replace before going live ── */
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycby5_vUSvE0OHJxPtdXaDSohv9CH35diPkTu17Jo-gT-RS5pswkZS98EaWo70rVA0DM/exec';

/* ── NAV SCROLL ── */
const nav = document.getElementById('mainNav');
window.addEventListener('scroll',()=>nav.classList.toggle('scrolled',scrollY>50),{passive:true});

/* ── SCROLL REVEAL ── */
new IntersectionObserver((entries,obs)=>{
  entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('vis');obs.unobserve(e.target);}});
},{threshold:.1,rootMargin:'0px 0px -36px 0px'})
.observe.bind(document.querySelectorAll('.reveal').forEach(el=>
  new IntersectionObserver((en,o)=>{en.forEach(e=>{if(e.isIntersecting){e.target.classList.add('vis');o.unobserve(e.target);}});},{threshold:.1,rootMargin:'0px 0px -36px 0px'}).observe(el)
));

/* ── PACKAGE BUTTON → pre-select in form ── */
function selectPackage(name,adultPrice,childPrice){
  scrollToForm();
  setTimeout(()=>{
    document.querySelectorAll('.pick').forEach(p=>p.classList.remove('sel'));
    document.querySelectorAll('[name="pkg"]').forEach(r=>{
      const cleanName=name.replace(/&amp;/g,'&');
      if(r.value.startsWith(cleanName)){
        r.checked=true;
        r.closest('.pick').classList.add('sel');
      }
    });
  },600);
  trackEvent('pkg_select',name);
  if(typeof fbq!=='undefined')fbq('track','ViewContent',{content_name:name,value:adultPrice,currency:'EUR'});
}

function scrollToForm(){
  document.getElementById('enquiry-form').scrollIntoView({behavior:'smooth',block:'start'});
}

/* ── PACKAGE PICKS IN FORM ── */
document.querySelectorAll('.pick').forEach(card=>{
  card.addEventListener('click',()=>{
    document.querySelectorAll('.pick').forEach(c=>c.classList.remove('sel'));
    card.classList.add('sel');
    document.getElementById('pkg-err').style.display='none';
  });
});

/* ── MULTI-STEP FORM ── */
let cur=1;
const TOTAL=4;

function step(dir){
  if(dir===1&&!validate(cur))return;
  cur=Math.max(1,Math.min(TOTAL,cur+dir));
  // panels
  document.querySelectorAll('.panel').forEach(p=>p.classList.remove('active'));
  document.getElementById('panel-'+cur).classList.add('active');
  // tabs
  document.querySelectorAll('.tab').forEach((t,i)=>{
    const s=i+1;
    t.classList.toggle('active',s===cur);
    t.classList.toggle('done',s<cur);
    t.setAttribute('aria-selected',s===cur?'true':'false');
  });
  // prev button
  document.getElementById('prevBtn').style.visibility=cur>1?'visible':'hidden';
  // next button
  const nb=document.getElementById('nextBtn');
  if(cur===TOTAL){
    nb.innerHTML='Submit Enquiry <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5 2l5 4.5L5 11"/></svg>';
    nb.classList.add('submit');
    nb.onclick=submitForm;
    buildSummary();
  } else {
    nb.innerHTML='Next Step <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5 2l5 4.5L5 11"/></svg>';
    nb.classList.remove('submit');
    nb.onclick=()=>step(1);
  }
  trackEvent('form_step','Step '+cur);
  document.getElementById('enquiry-form').scrollIntoView({behavior:'smooth',block:'start'});
}

function validate(s){
  let ok=true;
  if(s===1){
    [{id:'ff-fn',el:'firstName',fn:v=>v.trim().length>0},
     {id:'ff-ln',el:'lastName', fn:v=>v.trim().length>0},
     {id:'ff-em',el:'email',    fn:v=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)},
     {id:'ff-ph',el:'phone',    fn:v=>v.trim().length>5}
    ].forEach(({id,el,fn})=>{
      const wrap=document.getElementById(id);
      const val=document.getElementById(el).value;
      if(!fn(val)){wrap.classList.add('err');ok=false;}
      else wrap.classList.remove('err');
    });
  }
  if(s===2){
    const selPkg=document.querySelector('[name="pkg"]:checked');
    const pe=document.getElementById('pkg-err');
    if(!selPkg){pe.style.display='block';ok=false;}else pe.style.display='none';
    const adEl=document.getElementById('ff-ad');
    if(!document.getElementById('numAdults').value){adEl.classList.add('err');ok=false;}else adEl.classList.remove('err');
    const dtEl=document.getElementById('ff-dt');
    if(!document.getElementById('depDate').value){dtEl.classList.add('err');ok=false;}else dtEl.classList.remove('err');
  }
  if(s===4){
    const ce=document.getElementById('consent-err');
    if(!document.getElementById('consent1').checked){ce.style.display='block';ok=false;}else ce.style.display='none';
  }
  return ok;
}

function buildSummary(){
  const pkg=document.querySelector('[name="pkg"]:checked');
  const d=id=>document.getElementById(id);
  document.getElementById('summaryBox').innerHTML=
    `<strong style="display:block;font-family:'Cormorant Garamond',serif;font-size:16px;color:var(--ink);margin-bottom:8px">Your Enquiry Summary</strong>`+
    `<b>Name:</b> ${esc(d('firstName').value)} ${esc(d('lastName').value)}<br>`+
    `<b>Email:</b> ${esc(d('email').value)}<br>`+
    `<b>Phone:</b> ${esc(d('phone').value)}<br>`+
    `<b>Package:</b> ${pkg?esc(pkg.value):'—'}<br>`+
    `<b>Adults:</b> ${esc(d('numAdults').value)}`+
    (d('numChildren').value?` &nbsp;·&nbsp; <b>Children (9–14):</b> ${esc(d('numChildren').value)}`:'')+'<br>'+
    `<b>Departure:</b> ${esc(d('depDate').value)}`+
    (d('depCity').value?` &nbsp;·&nbsp; ${esc(d('depCity').value)}`:'')+'<br>'+
    (d('specialReq').value?`<b>Special Requests:</b> ${esc(d('specialReq').value)}`:'');
}

function esc(s){return(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}

/* ── SUBMIT → GOOGLE SHEETS ── */
async function submitForm(){
  if(!validate(4))return;
  const nb=document.getElementById('nextBtn');
  const prev=nb.innerHTML;
  nb.disabled=true;
  nb.innerHTML='<span class="spin"></span> Submitting…';
  const pkg=document.querySelector('[name="pkg"]:checked');
  const d=id=>document.getElementById(id).value;
  const payload={
    timestamp:     new Date().toISOString(),
    firstName:     d('firstName'),lastName:d('lastName'),
    email:         d('email'),phone:d('phone'),
    country:       d('country'),howHeard:d('howHeard'),
    selectedPkg:   pkg?pkg.value:'',
    numAdults:     d('numAdults'),numChildren:d('numChildren'),
    depDate:       d('depDate'),depCity:d('depCity'),
    budget:        d('budget'),hotelPref:d('hotelPref'),
    flightClass:   d('flightClass'),dietReq:d('dietReq'),
    specialReq:    d('specialReq'),prevExp:d('prevExp'),
    contactPref:   d('contactPref'),
    marketing:     document.getElementById('consent2').checked?'Yes':'No',
    source:        'Germany 2026 Landing Page'
  };
  try{
    await fetch(SCRIPT_URL,{method:'POST',mode:'no-cors',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
    showSuccess(payload);
  }catch(e){
    document.getElementById('submitErr').classList.add('show');
    nb.disabled=false;nb.innerHTML=prev;
  }
}

function showSuccess(p){
  document.querySelectorAll('.panel').forEach(el=>el.style.display='none');
  document.getElementById('formNav').style.display='none';
  document.querySelector('.form-tabs').style.display='none';
  document.getElementById('formSuccess').classList.add('show');
  trackEvent('form_submit',p.selectedPkg);
  if(typeof fbq!=='undefined')fbq('track','Lead',{content_name:p.selectedPkg});
  if(typeof gtag!=='undefined')gtag('event','conversion',{send_to:'G-B0F08RWG2D/CONVERSION_LABEL'});
}

/* ── COOKIE CONSENT LOGIC ── */
function checkConsent(){
  const cookieBanner = document.getElementById('cookieBanner');
  const consent = localStorage.getItem('buytripsnow_consent');
  if(consent === 'true'){
    loadTrackingScripts();
  } else if(consent === null){
    setTimeout(() => {
      if(cookieBanner) cookieBanner.classList.add('show');
    }, 2000);
  }
}

function acceptCookies(){
  const cookieBanner = document.getElementById('cookieBanner');
  localStorage.setItem('buytripsnow_consent', 'true');
  if(cookieBanner) cookieBanner.classList.remove('show');
  loadTrackingScripts();
}

function declineCookies(){
  const cookieBanner = document.getElementById('cookieBanner');
  localStorage.setItem('buytripsnow_consent', 'false');
  if(cookieBanner) cookieBanner.classList.remove('show');
}

window.addEventListener('load', checkConsent);
