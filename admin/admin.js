const config=window.SALON_CONFIG||{};
const configured=Boolean(config.supabaseUrl&&config.supabaseAnonKey&&window.supabase);
let client=null;
let services=[];
let demoMode=!configured;
const DEMO_KEY='salonStillDemoServices';
const defaultServices=[{"id": "fr-01", "category": "Frizerske usluge", "name": "Šišanje", "price_min": 700, "price_max": 1000, "currency": "RSD", "active": true, "sort_order": 1}, {"id": "fr-02", "category": "Frizerske usluge", "name": "Feniranje", "price_min": 700, "price_max": 1000, "currency": "RSD", "active": true, "sort_order": 2}, {"id": "fr-03", "category": "Frizerske usluge", "name": "Navijanje", "price_min": 700, "price_max": 1000, "currency": "RSD", "active": true, "sort_order": 3}, {"id": "fr-04", "category": "Frizerske usluge", "name": "Svečane frizure", "price_min": 1000, "price_max": 1500, "currency": "RSD", "active": true, "sort_order": 4}, {"id": "fr-05", "category": "Frizerske usluge", "name": "Frizure sa nadogradnjom na klipse (iznajmljivanje)", "price_min": 2500, "price_max": 3000, "currency": "RSD", "active": true, "sort_order": 5}, {"id": "fr-06", "category": "Frizerske usluge", "name": "Farbanje", "price_min": 1300, "price_max": 2500, "currency": "RSD", "active": true, "sort_order": 6}, {"id": "fr-07", "category": "Frizerske usluge", "name": "Nijansiranje", "price_min": 6000, "price_max": 12000, "currency": "RSD", "active": true, "sort_order": 7}, {"id": "fr-08", "category": "Frizerske usluge", "name": "Izvlačenje pramenova", "price_min": 6000, "price_max": 12000, "currency": "RSD", "active": true, "sort_order": 8}, {"id": "fr-09", "category": "Frizerske usluge", "name": "Balayage", "price_min": 6000, "price_max": 12000, "currency": "RSD", "active": true, "sort_order": 9}, {"id": "fr-10", "category": "Frizerske usluge", "name": "Prelivi", "price_min": 1000, "price_max": 2000, "currency": "RSD", "active": true, "sort_order": 10}, {"id": "fr-11", "category": "Frizerske usluge", "name": "Keratinsko ispravljanje", "price_min": 8000, "price_max": 20000, "currency": "RSD", "active": true, "sort_order": 11}, {"id": "fr-12", "category": "Frizerske usluge", "name": "Minival", "price_min": 6000, "price_max": 10000, "currency": "RSD", "active": true, "sort_order": 12}, {"id": "ko-01", "category": "Kozmetičke usluge", "name": "Nadogradnja noktiju", "price_min": 2000, "price_max": 2000, "currency": "RSD", "active": true, "sort_order": 1}, {"id": "ko-02", "category": "Kozmetičke usluge", "name": "Korekcija noktiju", "price_min": 1800, "price_max": 1800, "currency": "RSD", "active": true, "sort_order": 2}, {"id": "ko-03", "category": "Kozmetičke usluge", "name": "Izlivanje noktiju", "price_min": 2500, "price_max": 2500, "currency": "RSD", "active": true, "sort_order": 3}, {"id": "ko-04", "category": "Kozmetičke usluge", "name": "Gel na noktima", "price_min": 1500, "price_max": 1500, "currency": "RSD", "active": true, "sort_order": 4}, {"id": "ko-05", "category": "Kozmetičke usluge", "name": "Gel na noge", "price_min": 1500, "price_max": 1500, "currency": "RSD", "active": true, "sort_order": 5}, {"id": "ko-06", "category": "Kozmetičke usluge", "name": "Šminkanje", "price_min": 3500, "price_max": 3500, "currency": "RSD", "active": true, "sort_order": 6}, {"id": "ko-07", "category": "Kozmetičke usluge", "name": "Oblikovanje i farbanje obrva", "price_min": 1000, "price_max": 1000, "currency": "RSD", "active": true, "sort_order": 7}];

const $=s=>document.querySelector(s);
const loginView=$('#loginView'),appView=$('#appView'),modal=$('#modal'),table=$('#serviceTable');
const money=v=>new Intl.NumberFormat('sr-RS').format(Number(v))+' RSD';
const priceLabel=s=>Number(s.price_min)===Number(s.price_max)?money(s.price_min):`${money(s.price_min)} – ${money(s.price_max)}`;

function showMessage(el,text){el.textContent=text;setTimeout(()=>{if(el.textContent===text)el.textContent=''},3500)}
function sortServices(){services.sort((a,b)=>(a.category||'').localeCompare(b.category||'','sr')||Number(a.sort_order||0)-Number(b.sort_order||0)||(a.name||'').localeCompare(b.name||'','sr'))}
function saveDemo(){localStorage.setItem(DEMO_KEY,JSON.stringify(services))}
function loadDemo(){try{const x=JSON.parse(localStorage.getItem(DEMO_KEY));return Array.isArray(x)&&x.length?x:structuredClone(defaultServices)}catch{return structuredClone(defaultServices)}}

async function init(){
  if(configured){
    client=supabase.createClient(config.supabaseUrl,config.supabaseAnonKey);
    const {data}=await client.auth.getSession();
    if(data.session){showApp();await loadServices()} else showLogin();
    client.auth.onAuthStateChange((_e,session)=>{session?showApp():showLogin()});
  }else{
    demoMode=true;
    showApp();
    services=loadDemo();
    render();
    $('#setupNotice').classList.remove('hidden');
    $('#setupNotice').innerHTML='<strong>Demo mode:</strong> Supabase nije podešen. Promene se čuvaju samo u ovom browseru. Za stvarni live admin panel, popunite <code>config.js</code> nakon Supabase podešavanja i primenite <code>supabase.sql</code>.';
  }
}
function showLogin(){loginView.classList.remove('hidden');appView.classList.add('hidden')}
function showApp(){loginView.classList.add('hidden');appView.classList.remove('hidden')}

async function loadServices(){
  if(demoMode){services=loadDemo();render();return}
  const {data,error}=await client.from('services').select('*').order('category').order('sort_order');
  if(error){$('#setupNotice').classList.remove('hidden');$('#setupNotice').textContent='Nije moguće učitati cenovnik. Proverite Supabase tabelu i RLS pravila.';return}
  services=data||[];render();
}
function render(){
  sortServices();
  const q=($('#searchInput').value||'').trim().toLowerCase();
  const visible=services.filter(s=>!q||s.name.toLowerCase().includes(q)||s.category.toLowerCase().includes(q));
  table.innerHTML=visible.map(s=>`<tr><td><strong>${escapeHtml(s.name)}</strong></td><td>${escapeHtml(s.category)}</td><td>${priceLabel(s)}</td><td><span class="status ${s.active?'on':'off'}">${s.active?'Aktivna':'Skrivena'}</span></td><td><div class="actions"><button class="small" data-edit="${s.id}">Uredi</button><button class="small danger" data-delete="${s.id}">Obriši</button></div></td></tr>`).join('')||'<tr><td colspan="5">Nema usluga.</td></tr>';
  $('#serviceCount').textContent=services.length;$('#categoryCount').textContent=new Set(services.map(s=>s.category)).size;
  $('#categories').innerHTML=[...new Set(services.map(s=>s.category))].map(c=>`<option value="${escapeHtml(c)}">`).join('');
}
function escapeHtml(v){return String(v).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))}

$('#loginForm').addEventListener('submit',async e=>{e.preventDefault();const msg=$('#loginMessage');
  if(demoMode){showApp();return}
  const {error}=await client.auth.signInWithPassword({email:$('#loginEmail').value.trim(),password:$('#loginPassword').value});
  if(error)showMessage(msg,'Prijava nije uspela. Proverite email i lozinku.');
});
$('#logoutBtn').addEventListener('click',async()=>{if(demoMode){showLogin();return}await client.auth.signOut()});
$('#searchInput').addEventListener('input',render);
$('#addBtn').addEventListener('click',()=>openModal());
$('#modalClose').addEventListener('click',closeModal);
modal.addEventListener('click',e=>{if(e.target===modal)closeModal()});

table.addEventListener('click',e=>{const edit=e.target.closest('[data-edit]');const del=e.target.closest('[data-delete]');if(edit){const s=services.find(x=>x.id===edit.dataset.edit);if(s)openModal(s)}if(del)deleteService(del.dataset.delete)});

function openModal(s){
  $('#modalTitle').textContent=s?'Uredi uslugu':'Dodaj uslugu';
  $('#serviceId').value=s?.id||'';$('#serviceName').value=s?.name||'';$('#serviceCategory').value=s?.category||'';$('#priceMin').value=s?.price_min??'';$('#priceMax').value=s?.price_max??'';$('#currency').value=s?.currency||'RSD';$('#active').checked=s?.active!==false;$('#formMessage').textContent='';
  modal.classList.remove('hidden');modal.setAttribute('aria-hidden','false');$('#serviceName').focus();
}
function closeModal(){modal.classList.add('hidden');modal.setAttribute('aria-hidden','true')}

$('#serviceForm').addEventListener('submit',async e=>{e.preventDefault();
  const id=$('#serviceId').value||crypto.randomUUID();
  const item={id,category:$('#serviceCategory').value.trim(),name:$('#serviceName').value.trim(),price_min:Number($('#priceMin').value),price_max:Number($('#priceMax').value),currency:$('#currency').value.trim()||'RSD',active:$('#active').checked,sort_order:services.filter(s=>s.category===$('#serviceCategory').value.trim()).length+1};
  if(item.price_max<item.price_min){showMessage($('#formMessage'),'Maksimalna cena ne može biti manja od minimalne.');return}
  if(demoMode){const i=services.findIndex(s=>s.id===id);if(i>=0)services[i]={...services[i],...item};else services.push(item);saveDemo();render();closeModal();return}
  const {error}=services.some(s=>s.id===id)?await client.from('services').update(item).eq('id',id):await client.from('services').insert(item);
  if(error){showMessage($('#formMessage'),'Čuvanje nije uspelo. Proverite dozvole u Supabase.');return}
  await loadServices();closeModal();
});

async function deleteService(id){
  const s=services.find(x=>x.id===id);if(!s||!confirm(`Obrisati uslugu „${s.name}“?`))return;
  if(demoMode){services=services.filter(x=>x.id!==id);saveDemo();render();return}
  const {error}=await client.from('services').delete().eq('id',id);if(error){alert('Brisanje nije uspelo.');return}await loadServices();
}

init();
