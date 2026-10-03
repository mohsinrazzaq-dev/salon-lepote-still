document.addEventListener("DOMContentLoaded", async () => {
  const config = window.SALON_CONFIG || {};

  const toggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".nav-links");
  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Zatvori meni" : "Otvori meni");
    });
    nav.querySelectorAll("a").forEach(a => a.addEventListener("click", () => {
      nav.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Otvori meni");
    }));
  }

  const lightbox = document.getElementById("lightbox");
  const lightboxImage = document.getElementById("lightboxImage");
  let lastGalleryTrigger = null;
  const closeLightbox = () => {
    if (!lightbox) return;
    lightbox.classList.remove("open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.classList.remove("no-scroll");
    lightboxImage?.removeAttribute("src");
    lastGalleryTrigger?.focus();
    lastGalleryTrigger = null;
  };
  document.querySelectorAll(".gallery-item").forEach(item => {
    item.addEventListener("click", () => {
      lastGalleryTrigger = item;
      if (lightboxImage) {
        lightboxImage.src = item.dataset.full;
        lightboxImage.alt = item.querySelector("img")?.alt || "Galerija";
      }
      lightbox?.classList.add("open");
      lightbox?.setAttribute("aria-hidden", "false");
      requestAnimationFrame(() => lightbox?.querySelector(".lightbox-close")?.focus());
      document.body.classList.add("no-scroll");
    });
  });
  document.querySelector(".lightbox-close")?.addEventListener("click", closeLightbox);
  lightbox?.addEventListener("click", e => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape") closeLightbox(); });

  const lazyVideos = document.querySelectorAll("video.lazy-video");
  const loadVideo = (video) => {
    if (video.dataset.loaded === "true") return;
    const src = video.dataset.src;
    if (!src) return;
    const poster = video.dataset.poster;
    if (poster) video.poster = poster;
    video.src = src;
    video.dataset.loaded = "true";
    video.load();
    video.play().catch(() => {});
  };
  if ("IntersectionObserver" in window) {
    const videoObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { loadVideo(entry.target); observer.unobserve(entry.target); }
      });
    }, { rootMargin: "300px 0px" });
    lazyVideos.forEach(video => videoObserver.observe(video));
  } else lazyVideos.forEach(loadVideo);

  document.querySelectorAll(".video-card").forEach(card => {
    const video = card.querySelector("video");
    const button = card.querySelector(".sound-toggle");
    if (!video || !button) return;
    video.muted = true; video.volume = 1;
    button.addEventListener("click", () => {
      video.muted = !video.muted;
      if (!video.muted) { video.volume = 1; button.textContent = "🔊 Isključi zvuk"; video.play().catch(() => {}); }
      else button.textContent = "🔇 Uključi zvuk";
    });
    video.addEventListener("volumechange", () => {
      button.textContent = (video.muted || video.volume === 0) ? "🔇 Uključi zvuk" : "🔊 Isključi zvuk";
    });
  });

  const defaultServices = [
    {id:"fr-01",category:"Frizerske usluge",name:"Šišanje",price_min:700,price_max:1000,currency:"RSD",active:true,sort_order:1},
    {id:"fr-02",category:"Frizerske usluge",name:"Feniranje",price_min:700,price_max:1000,currency:"RSD",active:true,sort_order:2},
    {id:"fr-03",category:"Frizerske usluge",name:"Navijanje",price_min:700,price_max:1000,currency:"RSD",active:true,sort_order:3},
    {id:"fr-04",category:"Frizerske usluge",name:"Svečane frizure",price_min:1000,price_max:1500,currency:"RSD",active:true,sort_order:4},
    {id:"fr-05",category:"Frizerske usluge",name:"Frizure sa nadogradnjom na klipse (iznajmljivanje)",price_min:2500,price_max:3000,currency:"RSD",active:true,sort_order:5},
    {id:"fr-06",category:"Frizerske usluge",name:"Farbanje",price_min:1300,price_max:2500,currency:"RSD",active:true,sort_order:6},
    {id:"fr-07",category:"Frizerske usluge",name:"Nijansiranje",price_min:6000,price_max:12000,currency:"RSD",active:true,sort_order:7},
    {id:"fr-08",category:"Frizerske usluge",name:"Izvlačenje pramenova",price_min:6000,price_max:12000,currency:"RSD",active:true,sort_order:8},
    {id:"fr-09",category:"Frizerske usluge",name:"Balayage",price_min:6000,price_max:12000,currency:"RSD",active:true,sort_order:9},
    {id:"fr-10",category:"Frizerske usluge",name:"Prelivi",price_min:1000,price_max:2000,currency:"RSD",active:true,sort_order:10},
    {id:"fr-11",category:"Frizerske usluge",name:"Keratinsko ispravljanje",price_min:8000,price_max:20000,currency:"RSD",active:true,sort_order:11},
    {id:"fr-12",category:"Frizerske usluge",name:"Minival",price_min:6000,price_max:10000,currency:"RSD",active:true,sort_order:12},
    {id:"ko-01",category:"Kozmetičke usluge",name:"Nadogradnja noktiju",price_min:2000,price_max:2000,currency:"RSD",active:true,sort_order:1},
    {id:"ko-02",category:"Kozmetičke usluge",name:"Korekcija noktiju",price_min:1800,price_max:1800,currency:"RSD",active:true,sort_order:2},
    {id:"ko-03",category:"Kozmetičke usluge",name:"Izlivanje noktiju",price_min:2500,price_max:2500,currency:"RSD",active:true,sort_order:3},
    {id:"ko-04",category:"Kozmetičke usluge",name:"Gel na noktima",price_min:1500,price_max:1500,currency:"RSD",active:true,sort_order:4},
    {id:"ko-05",category:"Kozmetičke usluge",name:"Gel na noge",price_min:1500,price_max:1500,currency:"RSD",active:true,sort_order:5},
    {id:"ko-06",category:"Kozmetičke usluge",name:"Šminkanje",price_min:3500,price_max:3500,currency:"RSD",active:true,sort_order:6},
    {id:"ko-07",category:"Kozmetičke usluge",name:"Oblikovanje i farbanje obrva",price_min:1000,price_max:1000,currency:"RSD",active:true,sort_order:7}
  ];

  function money(v){ return new Intl.NumberFormat('sr-RS').format(Number(v)) + ' RSD'; }
  function priceLabel(s){
    const min=Number(s.price_min), max=Number(s.price_max);
    return min===max ? money(min) : `${money(min)} – ${money(max)}`;
  }
  function renderPricing(services){
    const box=document.getElementById('pricingList'); if(!box) return;
    const active=(services||[]).filter(s=>s.active!==false).sort((a,b)=> (a.category||'').localeCompare(b.category||'','sr') || Number(a.sort_order||0)-Number(b.sort_order||0));
    const groups=active.reduce((m,s)=>{(m[s.category]??=[]).push(s);return m;},{});
    if(!active.length){ box.innerHTML='<div class="pricing-empty">Cenovnik trenutno nije dostupan.</div>'; return; }
    box.innerHTML=Object.entries(groups).map(([cat,items])=>`<div class="price-group"><div class="price-group-head"><span>${cat}</span><i></i></div>${items.map(s=>`<div class="price-row"><span>${s.name}</span><strong>${priceLabel(s)}</strong></div>`).join('')}</div>`).join('');
    const select=document.getElementById('service');
    if(select){
      const current=select.value;
      select.innerHTML='<option value="">Izaberite uslugu</option>'+active.map(s=>`<option value="${String(s.name).replaceAll('"','&quot;')}">${s.name} — ${priceLabel(s)}</option>`).join('');
      if(current) select.value=current;
    }
  }

  async function loadServices(){
    let services=null;
    if(config.supabaseUrl && config.supabaseAnonKey && window.supabase){
      try{
        const client=window.supabase.createClient(config.supabaseUrl,config.supabaseAnonKey);
        const {data,error}=await client.from('services').select('*').eq('active',true).order('category').order('sort_order');
        if(!error && Array.isArray(data) && data.length) services=data;
      }catch(e){}
    }
    if(!services){
      try{
        const r=await fetch('data/services.json',{cache:'no-store'});
        if(r.ok) services=await r.json();
      }catch(e){}
    }
    renderPricing(services||defaultServices);
  }

  // Booking -> WhatsApp
  const form=document.getElementById('bookingForm');
  if(form){
    const dateInput=document.getElementById('date');
    const today=new Date();
    const localToday=new Date(today.getTime()-today.getTimezoneOffset()*60000).toISOString().split('T')[0];
    dateInput.min=localToday;
    form.addEventListener('submit',e=>{
      e.preventDefault();
      const name=document.getElementById('name').value.trim();
      const phone=document.getElementById('phone').value.trim();
      const service=document.getElementById('service').value;
      const date=document.getElementById('date').value;
      const time=document.getElementById('time').value;
      const note=document.getElementById('note').value.trim();
      const msg=`Zdravo, želela/želeo bih da zakažem termin.\n\nIme: ${name}\nTelefon: ${phone}\nUsluga: ${service}\nDatum: ${date}\nVreme: ${time}`+(note?`\nNapomena: ${note}`:'');
      const url='https://wa.me/381638920968?text='+encodeURIComponent(msg);
      const popup=window.open(url,'_blank','noopener,noreferrer');
      const message=document.getElementById('formMessage');
      message.textContent=popup?'WhatsApp je otvoren sa pripremljenim zahtevom. Molimo pošaljite poruku radi potvrde.':'Ako se WhatsApp nije otvorio, kliknite na WhatsApp dugme na stranici.';
    });
  }

  const backTop=document.getElementById('backTop');
  let scrollTicking=false;
  window.addEventListener('scroll',()=>{
    if(scrollTicking)return; scrollTicking=true;
    requestAnimationFrame(()=>{ if(window.scrollY>500) backTop.classList.add('show'); else backTop.classList.remove('show'); scrollTicking=false; });
  },{passive:true});
  backTop?.addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}));

  await loadServices();
});
