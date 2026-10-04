const config = window.SALON_CONFIG || {};
const configured = Boolean(config.supabaseUrl && config.supabaseAnonKey && window.supabase);
let client = null;
let services = [];
let demoMode = !configured;
const DEMO_KEY = 'salonStillDemoServices';
const RESET_URL = `${window.location.origin}/reset-password.html`;

const defaultServices = [{ "id": "fr-01", "category": "Frizerske usluge", "name": "Šišanje", "price_min": 700, "price_max": 1000, "currency": "RSD", "active": true, "sort_order": 1 }, { "id": "fr-02", "category": "Frizerske usluge", "name": "Feniranje", "price_min": 700, "price_max": 1000, "currency": "RSD", "active": true, "sort_order": 2 }, { "id": "fr-03", "category": "Frizerske usluge", "name": "Navijanje", "price_min": 700, "price_max": 1000, "currency": "RSD", "active": true, "sort_order": 3 }, { "id": "fr-04", "category": "Frizerske usluge", "name": "Svečane frizure", "price_min": 1000, "price_max": 1500, "currency": "RSD", "active": true, "sort_order": 4 }, { "id": "fr-05", "category": "Frizerske usluge", "name": "Frizure sa nadogradnjom na klipse (iznajmljivanje)", "price_min": 2500, "price_max": 3000, "currency": "RSD", "active": true, "sort_order": 5 }, { "id": "fr-06", "category": "Frizerske usluge", "name": "Farbanje", "price_min": 1300, "price_max": 2500, "currency": "RSD", "active": true, "sort_order": 6 }, { "id": "fr-07", "category": "Frizerske usluge", "name": "Nijansiranje", "price_min": 6000, "price_max": 12000, "currency": "RSD", "active": true, "sort_order": 7 }, { "id": "fr-08", "category": "Frizerske usluge", "name": "Izvlačenje pramenova", "price_min": 6000, "price_max": 12000, "currency": "RSD", "active": true, "sort_order": 8 }, { "id": "fr-09", "category": "Frizerske usluge", "name": "Balayage", "price_min": 6000, "price_max": 12000, "currency": "RSD", "active": true, "sort_order": 9 }, { "id": "fr-10", "category": "Frizerske usluge", "name": "Prelivi", "price_min": 1000, "price_max": 2000, "currency": "RSD", "active": true, "sort_order": 10 }, { "id": "fr-11", "category": "Frizerske usluge", "name": "Keratinsko ispravljanje", "price_min": 8000, "price_max": 20000, "currency": "RSD", "active": true, "sort_order": 11 }, { "id": "fr-12", "category": "Frizerske usluge", "name": "Minival", "price_min": 6000, "price_max": 10000, "currency": "RSD", "active": true, "sort_order": 12 }, { "id": "ko-01", "category": "Kozmetičke usluge", "name": "Nadogradnja noktiju", "price_min": 2000, "price_max": 2000, "currency": "RSD", "active": true, "sort_order": 1 }, { "id": "ko-02", "category": "Kozmetičke usluge", "name": "Korekcija noktiju", "price_min": 1800, "price_max": 1800, "currency": "RSD", "active": true, "sort_order": 2 }, { "id": "ko-03", "category": "Kozmetičke usluge", "name": "Izlivanje noktiju", "price_min": 2500, "price_max": 2500, "currency": "RSD", "active": true, "sort_order": 3 }, { "id": "ko-04", "category": "Kozmetičke usluge", "name": "Gel na noktima", "price_min": 1500, "price_max": 1500, "currency": "RSD", "active": true, "sort_order": 4 }, { "id": "ko-05", "category": "Kozmetičke usluge", "name": "Gel na noge", "price_min": 1500, "price_max": 1500, "currency": "RSD", "active": true, "sort_order": 5 }, { "id": "ko-06", "category": "Kozmetičke usluge", "name": "Šminkanje", "price_min": 3500, "price_max": 3500, "currency": "RSD", "active": true, "sort_order": 6 }, { "id": "ko-07", "category": "Kozmetičke usluge", "name": "Oblikovanje i farbanje obrva", "price_min": 1000, "price_max": 1000, "currency": "RSD", "active": true, "sort_order": 7 }];

const $ = s => document.querySelector(s);
const loginView = $('#loginView'), appView = $('#appView'), modal = $('#modal'), table = $('#serviceTable');
const money = v => new Intl.NumberFormat('sr-RS').format(Number(v)) + ' RSD';
const priceLabel = s => Number(s.price_min) === Number(s.price_max) ? money(s.price_min) : `${money(s.price_min)} – ${money(s.price_max)}`;

function showMessage(el, text, type = '') {
  el.textContent = text;
  el.className = `message ${type}`.trim();
}

function sortServices() {
  services.sort((a, b) =>
    (a.category || '').localeCompare(b.category || '', 'sr') ||
    Number(a.sort_order || 0) - Number(b.sort_order || 0) ||
    (a.name || '').localeCompare(b.name || '', 'sr')
  );
}

function saveDemo() { localStorage.setItem(DEMO_KEY, JSON.stringify(services)); }
function loadDemo() {
  try {
    const x = JSON.parse(localStorage.getItem(DEMO_KEY));
    return Array.isArray(x) && x.length ? x : structuredClone(defaultServices);
  } catch {
    return structuredClone(defaultServices);
  }
}

async function init() {
  if (configured) {
    client = supabase.createClient(config.supabaseUrl, config.supabaseAnonKey);
    const { data } = await client.auth.getSession();
    if (data.session) { showApp(); await loadServices(); } else showLogin();
    client.auth.onAuthStateChange((_event, session) => {
      if (session) { showApp(); loadServices(); } else showLogin();
    });
  } else {
    demoMode = true;
    showApp();
    services = loadDemo();
    render();
    $('#setupNotice').classList.remove('hidden');
    $('#setupNotice').innerHTML = '<strong>Demo mode:</strong> Supabase nije podešen. Promene se čuvaju samo u ovom browseru. Za stvarni live admin panel, popunite <code>config.js</code> i primenite <code>supabase.sql</code>.';
  }
}

function showLogin() {
  loginView.classList.remove('hidden');
  appView.classList.add('hidden');
}
function showApp() {
  loginView.classList.add('hidden');
  appView.classList.remove('hidden');
}

async function loadServices() {
  if (demoMode) { services = loadDemo(); render(); return; }
  const { data, error } = await client.from('services').select('*').order('category').order('sort_order');
  if (error) {
    console.error('Supabase services error:', error);
    $('#setupNotice').classList.remove('hidden');
    $('#setupNotice').textContent = `Nije moguće učitati cenovnik: ${error.message}`;
    return;
  }
  $('#setupNotice').classList.add('hidden');
  services = data || [];
  render();
}

function render() {
  sortServices();
  const q = ($('#searchInput').value || '').trim().toLowerCase();
  const visible = services.filter(s =>
    !q ||
    String(s.name || '').toLowerCase().includes(q) ||
    String(s.category || '').toLowerCase().includes(q)
  );

  table.innerHTML = visible.map(s => `
    <tr>
      <td><strong>${escapeHtml(s.name)}</strong></td>
      <td>${escapeHtml(s.category)}</td>
      <td>${priceLabel(s)}</td>
      <td><span class="status ${s.active ? 'on' : 'off'}">${s.active ? 'Aktivna' : 'Skrivena'}</span></td>
      <td><div class="actions"><button class="small" data-edit="${escapeHtml(s.id)}">Uredi</button><button class="small danger" data-delete="${escapeHtml(s.id)}">Obriši</button></div></td>
    </tr>`).join('') || '<tr><td colspan="5">Nema usluga.</td></tr>';

  $('#serviceCount').textContent = services.length;
  $('#categoryCount').textContent = new Set(services.map(s => s.category)).size;
  $('#categories').innerHTML = [...new Set(services.map(s => s.category))]
    .map(c => `<option value="${escapeHtml(c)}">`).join('');
}

function escapeHtml(v) {
  return String(v).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
  })[c]);
}

$('#loginForm').addEventListener('submit', async e => {
  e.preventDefault();
  const msg = $('#loginMessage');
  showMessage(msg, '');
  if (demoMode) { showApp(); return; }

  const email = $('#loginEmail').value.trim();
  const password = $('#loginPassword').value;
  const button = e.submitter;
  if (button) button.disabled = true;

  const { error } = await client.auth.signInWithPassword({ email, password });
  if (error) showMessage(msg, 'Prijava nije uspela. Proverite email i lozinku.', 'error');

  if (button) button.disabled = false;
});

/* =========================
   PASSWORD RESET
========================= */

function setupPasswordReset() {
  const loginForm = $('#loginForm');
  const loginMessage = $('#loginMessage');
  const loginEmail = $('#loginEmail');

  if (!loginForm || !loginMessage || !loginEmail) {
    console.error('Password reset: login elements not found.');
    return;
  }

  // Prevent duplicate UI
  if ($('#forgotPasswordBtn')) return;

  // Create Forgot Password link
  const forgotButton = document.createElement('button');
  forgotButton.type = 'button';
  forgotButton.id = 'forgotPasswordBtn';

  forgotButton.textContent = 'Zaboravili ste lozinku?';

  forgotButton.style.cssText = `
    display:block;
    width:100%;
    margin-top:14px;
    padding:10px;
    border:0;
    background:transparent;
    color:#9a6c91;
    font-size:14px;
    font-weight:600;
    cursor:pointer;
  `;

  loginForm.appendChild(forgotButton);

  // Create reset box
  const resetBox = document.createElement('div');
  resetBox.id = 'forgotPasswordBox';

  resetBox.style.cssText = `
    display:none;
    margin-top:18px;
    padding:20px;
    border:1px solid #eadfe8;
    border-radius:14px;
    background:#faf7fa;
  `;

  resetBox.innerHTML = `
    <p style="
      margin:0 0 14px;
      color:#777;
      font-size:13px;
      line-height:1.5;
    ">
      Unesite email adresu admin naloga. 
      Poslaćemo vam link za promenu lozinke.
    </p>

    <button
      type="button"
      id="sendResetBtn"
      class="primary"
      style="width:100%;"
    >
      Pošalji link za resetovanje
    </button>

    <p
      id="resetMessage"
      class="message"
      style="margin-top:12px;"
    ></p>
  `;

  loginForm.parentNode.appendChild(resetBox);

  // Toggle reset box
  forgotButton.addEventListener('click', () => {
    const isOpen = resetBox.style.display === 'block';

    resetBox.style.display = isOpen ? 'none' : 'block';

    if (!isOpen) {
      loginEmail.focus();
    }
  });

  // Send reset email
  $('#sendResetBtn').addEventListener('click', async () => {
    const email = loginEmail.value.trim();
    const msg = $('#resetMessage');
    const button = $('#sendResetBtn');

    msg.textContent = '';
    msg.className = 'message';

    if (!email) {
      showMessage(
        msg,
        'Prvo unesite email admin naloga.',
        'error'
      );

      loginEmail.focus();
      return;
    }

    if (demoMode) {
      showMessage(
        msg,
        'Reset lozinke nije dostupan u Demo modu.',
        'error'
      );
      return;
    }

    button.disabled = true;
    button.textContent = 'Slanje...';

    try {
      const { error } =
        await client.auth.resetPasswordForEmail(email, {
          redirectTo:
            'https://salonlepotestill.com/reset-password.html'
        });

      if (error) {
        console.error(
          'Password reset error:',
          error
        );

        showMessage(
          msg,
          'Slanje nije uspelo. Ako ste pokušali više puta, sačekajte da se email limit resetuje.',
          'error'
        );

        return;
      }

      showMessage(
        msg,
        'Link za resetovanje je poslat. Proverite Inbox i Spam.',
        'success'
      );

    } catch (error) {
      console.error(
        'Unexpected password reset error:',
        error
      );

      showMessage(
        msg,
        'Došlo je do greške. Pokušajte ponovo kasnije.',
        'error'
      );

    } finally {
      button.disabled = false;
      button.textContent =
        'Pošalji link za resetovanje';
    }
  });
}

$('#logoutBtn').addEventListener('click', async () => {
  if (demoMode) { showLogin(); return; }
  await client.auth.signOut();
});

$('#searchInput').addEventListener('input', render);
$('#addBtn').addEventListener('click', () => openModal());
$('#modalClose').addEventListener('click', closeModal);
modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });

table.addEventListener('click', e => {
  const edit = e.target.closest('[data-edit]');
  const del = e.target.closest('[data-delete]');
  if (edit) { const s = services.find(x => x.id === edit.dataset.edit); if (s) openModal(s); }
  if (del) deleteService(del.dataset.delete);
});

function openModal(s) {
  $('#modalTitle').textContent = s ? 'Uredi uslugu' : 'Dodaj uslugu';
  $('#serviceId').value = s?.id || '';
  $('#serviceName').value = s?.name || '';
  $('#serviceCategory').value = s?.category || '';
  $('#priceMin').value = s?.price_min ?? '';
  $('#priceMax').value = s?.price_max ?? '';
  $('#currency').value = s?.currency || 'RSD';
  $('#active').checked = s?.active !== false;
  $('#formMessage').textContent = '';
  modal.classList.remove('hidden');
  modal.setAttribute('aria-hidden', 'false');
  $('#serviceName').focus();
}

function closeModal() { modal.classList.add('hidden'); modal.setAttribute('aria-hidden', 'true'); }

$('#serviceForm').addEventListener('submit', async e => {
  e.preventDefault();
  const id = $('#serviceId').value || crypto.randomUUID();
  const category = $('#serviceCategory').value.trim();
  const item = {
    id,
    category,
    name: $('#serviceName').value.trim(),
    price_min: Number($('#priceMin').value),
    price_max: Number($('#priceMax').value),
    currency: $('#currency').value.trim() || 'RSD',
    active: $('#active').checked,
    sort_order: services.filter(s => s.category === category && s.id !== id).length + 1
  };

  if (!item.name || !item.category) { showMessage($('#formMessage'), 'Popunite sva obavezna polja.', 'error'); return; }
  if (item.price_max < item.price_min) { showMessage($('#formMessage'), 'Maksimalna cena ne može biti manja od minimalne.', 'error'); return; }

  if (demoMode) {
    const i = services.findIndex(s => s.id === id);
    if (i >= 0) services[i] = { ...services[i], ...item }; else services.push(item);
    saveDemo(); render(); closeModal(); return;
  }

  const exists = services.some(s => s.id === id);
  const result = exists
    ? await client.from('services').update(item).eq('id', id)
    : await client.from('services').insert(item);

  if (result.error) {
    console.error('Save service error:', result.error);
    showMessage($('#formMessage'), 'Čuvanje nije uspelo. Proverite Supabase dozvole.', 'error');
    return;
  }

  await loadServices();
  closeModal();
});

async function deleteService(id) {
  const s = services.find(x => x.id === id);
  if (!s || !confirm(`Obrisati uslugu „${s.name}“?`)) return;

  if (demoMode) {
    services = services.filter(x => x.id !== id);
    saveDemo(); render(); return;
  }

  const { error } = await client.from('services').delete().eq('id', id);
  if (error) { alert('Brisanje nije uspelo.'); return; }
  await loadServices();
}

setupPasswordReset();
init();