/* ======================================================
   BEM FITS IPI GARUT — Interaktivitas
====================================================== */

/* ===== DATA BERITA: seluruhnya dari database (Supabase (tabel berita)), dikelola lewat berita-admin.html ===== */
const NEWS = [];
const NEWS_GRADIENTS = [['#1F3A68','#1A5C70'],['#0A1E3F','#2A4B85'],['#1A5C70','#2196A8'],['#2A4B85','#4A79D6'],['#0A1E3F','#1A5C70'],['#1F3A68','#2196A8']];

/* ===== DATA KEPENGURUSAN ===== */
const DEPARTMENTS = [
  { icon: '📋', name: 'Sekretaris Umum', koor: 'Andini Putri', desc: 'Pengelola administrasi, surat menyurat, dan notulensi organisasi.' },
  { icon: '💰', name: 'Bendahara Umum', koor: 'Bagas Pratama', desc: 'Pengelolaan keuangan organisasi yang transparan dan akuntabel.' },
  { icon: '📢', name: 'Kemenko Kemahasiswaan', koor: 'Citra Dewi', desc: 'Koordinasi HMJ dan UKM, penalaran, serta pengembangan minat bakat.' },
  { icon: '📚', name: 'Kemenko Akademik', koor: 'Dandi Firmansyah', desc: 'Advokasi akademik, bank materi, dan pengembangan keilmuan mahasiswa.' },
  { icon: '🤝', name: 'Kemenko Sosial', koor: 'Eka Lestari', desc: 'Bakti sosial, pengabdian masyarakat, dan kepedulian sosial kampus.' },
  { icon: '🎨', name: 'Kemenko Kreatif', koor: 'Fajar Nugraha', desc: 'Media kreatif, dokumentasi, publikasi, dan penguatan citra organisasi.' },
  { icon: '🚀', name: 'Kemenko Inovasi', koor: 'Gita Maharani', desc: 'Inkubasi ide, riset muda, dan penguatan budaya startup mahasiswa.' },
  { icon: '🌱', name: 'Kemenko Lingkungan', koor: 'Hendra Saputra', desc: 'Gerakan peduli lingkungan dan keberlanjutan di lingkungan kampus.' },
];

/* ===== LOADER ===== */
window.addEventListener('load', () => {
  setTimeout(() => document.getElementById('loader').classList.add('hide'), 700);
});

/* ===== ROUTER ===== */
const PAGES = ['beranda', 'profil', 'berita', 'layanan', 'kepengurusan', 'oprec', 'admin'];

function route() {
  const hash = (location.hash.replace('#/', '') || 'beranda').split('?')[0];
  let page = PAGES.includes(hash) ? hash : 'beranda';
  if (page === 'admin') { window.location.replace('admin.html'); return; }

  PAGES.forEach(p => {
    document.getElementById('page-' + p).classList.toggle('active', p === page);
    document.querySelectorAll(`[data-nav="${p}"]`).forEach(a =>
      a.classList.toggle('active', p === page));
  });

  if (typeof setMenu === 'function') setMenu(false);
  window.scrollTo({ top: 0, behavior: 'instant' });

  // refresh reveal observer untuk elemen halaman baru
  requestAnimationFrame(() => observeReveals());
  if (page === 'beranda') initCounters();
}
window.addEventListener('hashchange', route);

/* ===== NAVBAR SCROLL ===== */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

/* ===== HAMBURGER ===== */
const NAV_BREAKPOINT = 1280; // harus sama dengan breakpoint drawer di style.css
const hamburgerBtn = document.getElementById('hamburger');
const navLinksEl = document.getElementById('navLinks');
const navOverlay = document.getElementById('navOverlay');
const navAuthEl = document.querySelector('.nav-auth');
const navActionsEl = document.querySelector('.nav-actions');

function setMenu(open) {
  hamburgerBtn.classList.toggle('open', open);
  navLinksEl.classList.toggle('open', open);
  if (navOverlay) navOverlay.classList.toggle('show', open);
  document.body.style.overflow = open ? 'hidden' : '';
}
hamburgerBtn.addEventListener('click', () => setMenu(!navLinksEl.classList.contains('open')));
if (navOverlay) navOverlay.addEventListener('click', () => setMenu(false));
document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });
navLinksEl.addEventListener('click', e => {
  if (e.target.closest('a')) setMenu(false);
});

// Di layar kecil, chip akun + tombol Login/Logout dipindah ke dalam drawer
// supaya tidak menumpuk dengan logo. Di desktop dikembalikan ke navbar.
const navMQ = window.matchMedia('(max-width:' + NAV_BREAKPOINT + 'px)');
function placeNavAuth() {
  if (!navAuthEl) return;
  if (navMQ.matches) navLinksEl.appendChild(navAuthEl);
  else navActionsEl.insertBefore(navAuthEl, hamburgerBtn);
  if (!navMQ.matches) setMenu(false);
}
placeNavAuth();
if (navMQ.addEventListener) navMQ.addEventListener('change', placeNavAuth);
else navMQ.addListener(placeNavAuth);

/* ===== CURSOR GLOW ===== */
const glow = document.getElementById('cursorGlow');
window.addEventListener('mousemove', e => {
  glow.style.left = e.clientX + 'px';
  glow.style.top = e.clientY + 'px';
  glow.style.opacity = '1';
}, { passive: true });

/* ===== REVEAL ON SCROLL ===== */
let revealObserver;
function observeReveals() {
  if (revealObserver) revealObserver.disconnect();
  revealObserver = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (en.isIntersecting) { en.target.classList.add('visible'); revealObserver.unobserve(en.target); }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.page.active .reveal:not(.visible)').forEach(el => revealObserver.observe(el));
}

/* ===== COUNTERS ===== */
function initCounters() {
  document.querySelectorAll('#page-beranda .counter').forEach(el => {
    const target = +el.dataset.target;
    let started = false;
    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !started) {
        started = true;
        const dur = 1600, t0 = performance.now();
        const step = now => {
          const p = Math.min((now - t0) / dur, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(target * eased) + (p === 1 ? '+' : '');
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
        obs.disconnect();
      }
    }, { threshold: 0.4 });
    obs.observe(el);
  });
}

/* ===== RENDER BERITA ===== */
function thumbGradient(g) {
  return `background:
    radial-gradient(circle at 80% 20%, ${g[1]}cc, transparent 60%),
    radial-gradient(circle at 20% 90%, #4A79D655, transparent 55%),
    linear-gradient(135deg, ${g[0]}, ${g[1]});`;
}

function escapeNewsText(value) {
  return String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
}

function newsCard(n, preview = false) {
  const title = n.judul || n.title || '';
  const desc = n.deskripsi || n.desc || '';
  const dateRaw = n.tanggal || n.date || '';
  const date = dateRaw ? (isNaN(Date.parse(dateRaw)) ? dateRaw : new Date(dateRaw + (dateRaw.length === 10 ? 'T00:00:00' : '')).toLocaleDateString('id-ID',{day:'numeric',month:'short',year:'numeric'})) : '';
  const author = n.nama_pengupload || n.pengupload || n.author || 'BEM FITS';
  const category = n.kategori || n.cat || 'kegiatan';
  const categoryLabel = n.catLabel || ({kegiatan:'Kegiatan',pengumuman:'Pengumuman',prestasi:'Prestasi'}[category] || 'Berita');
  const gradient = n.g || NEWS_GRADIENTS[(parseInt(n.id, 10) || 0) % NEWS_GRADIENTS.length];
  const isDb = n.id !== undefined && n.id !== null;
  const summary = isDb && desc.length > 140 ? desc.replace(/\s+/g, ' ').slice(0, 140).trimEnd() + '…' : desc;
  const hasImg = !!n.gambar_url;
  const thumb = hasImg
    ? `<img class="thumb-img" src="${escapeNewsText(n.gambar_url)}" alt="${escapeNewsText(title)}" loading="lazy">`
    : `<div class="thumb-bg" style="${thumbGradient(gradient)}"></div>`;
  return `
  <article class="news-card reveal" data-cat="${escapeNewsText(category)}" tabindex="0" role="button" aria-label="Buka berita: ${escapeNewsText(title)}" data-news-id="${escapeNewsText(n.id ?? '')}">
    <div class="news-thumb">
      ${thumb}
      <span class="cat">${escapeNewsText(categoryLabel)}</span>
    </div>
    <div class="news-body">
      <span class="news-date">📅 ${escapeNewsText(date)}</span>
      <h3>${escapeNewsText(title)}</h3>
      <p>${escapeNewsText(summary)}</p>
      <span class="news-more">Baca Selengkapnya →</span>
    </div>
  </article>`;
}

function openNewsDetail(n) {
  const id = n.id;
  if (id !== undefined && id !== null && String(id).trim() !== '') {
    window.location.href = `berita-detail.html?id=${encodeURIComponent(id)}`;
    return;
  }
  const params = new URLSearchParams({
    judul: n.judul || n.title || 'Berita BEM FITS',
    deskripsi: n.deskripsi || n.desc || '',
    tanggal: n.tanggal || n.date || '',
    kategori: n.kategori || n.cat || 'kegiatan',
    pengupload: n.nama_pengupload || n.pengupload || n.author || 'BEM FITS'
  });
  window.location.href = `berita-detail.html?${params.toString()}`;
}

document.addEventListener('click', event => {
  const card = event.target.closest('.news-card');
  if (!card) return;
  const id = card.dataset.newsId;
  const all = window.loadedNews || NEWS;
  const item = all.find(n => String(n.id ?? '') === id && id !== '') ||
    all.find(n => (n.judul || n.title) === card.querySelector('h3')?.textContent);
  if (item) openNewsDetail(item);
});
document.addEventListener('keydown', event => {
  if ((event.key === 'Enter' || event.key === ' ') && event.target.matches('.news-card')) {
    event.preventDefault(); event.target.click();
  }
});


/* filter berita */
document.querySelectorAll('#newsFilter .filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('#newsFilter .filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const f = btn.dataset.filter;
    document.querySelectorAll('#newsGrid .news-card').forEach(card => {
      const show = f === 'semua' || card.dataset.cat === f;
      card.classList.toggle('hidden-card', !show);
      if (show) { card.classList.remove('visible'); requestAnimationFrame(() => card.classList.add('visible')); }
    });
  });
});

/* ===== RENDER KEPENGURUSAN ===== */
const deptGrid = document.getElementById('deptGrid');
if (deptGrid) deptGrid.innerHTML = DEPARTMENTS.map((d, i) => `
  <div class="dept-card reveal ${i % 3 === 1 ? 'd1' : i % 3 === 2 ? 'd2' : ''}">
    <div class="dept-icon">${d.icon}</div>
    <h4>${d.name}</h4>
    <span class="dept-koor">${d.koor}</span>
    <p>${d.desc}</p>
  </div>`).join('');

/* ===== TILT EFFECT (leader cards) ===== */
document.querySelectorAll('[data-tilt]').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    card.style.transform = `perspective(700px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) translateY(-6px)`;
  });
  card.addEventListener('mouseleave', () => { card.style.transform = ''; });
});

/* ===== MODAL LAYANAN ===== */
const backdrop = document.getElementById('modalBackdrop');
const modalTitle = document.getElementById('modalTitle');
const modalForm = document.getElementById('modalForm');
const modalSuccess = document.getElementById('modalSuccess');

document.querySelectorAll('.service-action').forEach(btn => {
  btn.addEventListener('click', () => {
    modalTitle.textContent = btn.dataset.service;
    modalForm.hidden = false;
    modalForm.reset();
    modalSuccess.hidden = true;
    backdrop.classList.add('show');
  });
});

document.getElementById('modalClose').addEventListener('click', closeModal);
document.getElementById('modalDone').addEventListener('click', closeModal);
backdrop.addEventListener('click', e => { if (e.target === backdrop) closeModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

function closeModal() { backdrop.classList.remove('show'); }

modalForm.addEventListener('submit', e => {
  e.preventDefault();
  modalForm.hidden = true;
  modalSuccess.hidden = false;
});

/* ===== TOAST ===== */
const toast = document.getElementById('toast');
let toastTimer;
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3200);
}

/* klik kartu berita */
document.addEventListener('click', e => {
  const card = e.target.closest('.news-card');
  if (card) showToast('📰 Berita lengkap akan segera tersedia di portal BEM FITS.');
});

/* ===== INIT ===== */
route();
if (window.scrollY > 40) navbar.classList.add('scrolled');
if (window.scrollY > 40) navbar.classList.add('scrolled');

/* ===== CEK SESI & ROLE (ADMIN / USER) ===== */
async function checkUserRole() {
    const profileName = document.getElementById('profileName');
    const adminLink = document.getElementById('navAdminLink');
    const loginLink = document.getElementById('loginNavLink');
    const logoutButton = document.getElementById('btnLogoutAction');

    // Gunakan session server sebagai satu-satunya sumber status login.
    let session = { logged_in: false };
    try {
        session = await window.bem.session();
    } catch (e) {
        console.error('Gagal cek sesi PHP:', e);
    }

    const isLoggedIn = session.logged_in === true;
    window.bemSession = session;
    updateOprecGate();
    const name = isLoggedIn ? session.nama : '';
    const role = isLoggedIn ? session.role : '';
    window.currentUserRole = role || null;

    // Bersihkan cache login versi lama agar tidak membuat UI seolah-olah login.
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    localStorage.removeItem('userNim');

    document.querySelectorAll('.guest-only').forEach(el => el.style.display = isLoggedIn ? 'none' : '');
    document.querySelectorAll('.user-only').forEach(el => el.style.display = isLoggedIn ? '' : 'none');

    if (profileName) {
        profileName.textContent = name ? 'Akun · ' + name : 'Akun';
        profileName.style.display = isLoggedIn ? 'inline-flex' : 'none';
        profileName.href = '#/profil';
        profileName.classList.add('profile-nav-link');
        profileName.title = name ? 'Profil ' + name : 'Profil akun';
    }
    if (loginLink) loginLink.style.display = isLoggedIn ? 'none' : '';
    if (logoutButton) logoutButton.style.display = isLoggedIn ? '' : 'none';
    if (adminLink) adminLink.hidden = !(isLoggedIn && role === 'admin');
    document.body.classList.toggle('is-admin', isLoggedIn && role === 'admin');

    // Pastikan route diperiksa setelah role dari server diketahui.
    if (location.hash === '#/admin') {
        if (isLoggedIn && role === 'admin') window.location.replace('admin.html');
        else location.hash = '#/beranda';
    }
}

/* ===== FETCH BERITA DARI DATABASE ===== */
async function loadNews() {
    const previewGrid = document.getElementById('newsPreview');
    const newsGrid = document.getElementById('newsGrid');
    const emptyMsg = msg => `<p class="news-empty" style="grid-column:1/-1;text-align:center;color:var(--muted-dark)">${msg}</p>`;
    try {
        const dbNews = await window.bem.getNews();
        if (!Array.isArray(dbNews)) throw new Error('Format data berita tidak valid');
        window.loadedNews = dbNews;

        if (previewGrid) previewGrid.innerHTML = dbNews.length ? dbNews.slice(0, 3).map(n => newsCard(n, true)).join('') : emptyMsg('Belum ada berita.');
        if (newsGrid) newsGrid.innerHTML = dbNews.length ? dbNews.map(n => newsCard(n)).join('') : emptyMsg('Belum ada berita.');

        observeReveals(); // Refresh animasi
    } catch (e) {
        console.error("Gagal memuat berita", e);
        if (previewGrid) previewGrid.innerHTML = emptyMsg('Berita belum dapat dimuat.');
        if (newsGrid) newsGrid.innerHTML = emptyMsg('Berita belum dapat dimuat.');
    }
}

// Panggil saat halaman dimuat
document.addEventListener('DOMContentLoaded', () => {
    checkUserRole();
    loadNews();
});

async function logout() {
    try {
        await window.bem.logout();
    } catch (e) {}
    window.currentUserRole = null;
    window.bemSession = { logged_in: false };
    // Hanya mengganti hash TIDAK me-reload halaman (sudah di index.html), jadi
    // status login di UI tidak ter-update. Paksa reload agar semua state bersih.
    history.replaceState(null, '', 'index.html#/beranda');
    window.location.reload();
}
/* ===== GERBANG OPREC: wajib login + status buka/tutup dari admin ===== */
const OPREC_STATUS_LABEL = { form: 'Menunggu Wawancara', wawancara: 'Tahap Wawancara', selesai: 'Selesai Wawancara · Menunggu Hasil', lulus: 'Lulus', tidak_lulus: 'Tidak Lulus' };

function renderOprecTracker(a) {
    const esc = escapeNewsText;
    const fmt = v => v ? new Date(String(v).replace(' ', 'T')).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
    const st = a.status;
    const interviewDone = st === 'selesai' || st === 'lulus' || st === 'tidak_lulus';
    const decided = st === 'lulus' || st === 'tidak_lulus';
    const s2 = interviewDone ? 'done' : (st === 'wawancara' ? 'current' : 'pending');
    const s3 = st === 'lulus' ? 'pass' : (st === 'tidak_lulus' ? 'fail' : 'pending');
    const jadwal = a.jadwal_wawancara ? `<div class="trk-box">🗓️ <b>Jadwal wawancara:</b> ${esc(a.jadwal_wawancara)}</div>` : '';
    const note = a.catatan_admin ? `<div class="trk-box">💬 <b>Catatan panitia:</b> ${esc(a.catatan_admin)}</div>` : '';
    const result = st === 'lulus'
        ? '<div class="trk-result pass">🎉 Selamat! Kamu dinyatakan LULUS seleksi pengurus BEM FITS.'
          + (a.departemen_label ? `<span class="dept">Ditempatkan di: ${esc(a.departemen_label)}</span>` : '') + '</div>'
        : st === 'tidak_lulus'
        ? '<div class="trk-result fail">Mohon maaf, kamu belum lulus seleksi kali ini. Terima kasih sudah mendaftar dan tetap semangat berkontribusi.</div>'
        : '';
    return `
    <div class="trk-head"><span class="trk-badge s-${esc(st)}">${esc(OPREC_STATUS_LABEL[st] || '')}</span>
      <h2>Halo, ${esc(a.nama)}!</h2>
      <p>Formulir pendaftaranmu sudah kami terima. Satu akun hanya bisa mengisi satu kali, jadi pantau tahapan seleksimu di bawah ini.</p></div>
    <ol class="trk-steps">
      <li class="trk-step done"><span class="trk-dot">✓</span><div><h3>1. Pengisian Formulir</h3><p>Selesai${a.created_at ? ' pada ' + esc(fmt(a.created_at)) : ''}. Nomor pendaftaran #${esc(a.id)}.</p></div></li>
      <li class="trk-step ${s2}"><span class="trk-dot">${s2 === 'done' ? '✓' : '2'}</span><div><h3>2. Wawancara</h3>
        <p>${s2 === 'pending' ? 'Menunggu panitia menentukan jadwal wawancara.' : (s2 === 'current' ? 'Wawancara dijadwalkan. Mohon hadir tepat waktu.' : 'Kamu sudah selesai diwawancarai.')}</p>${jadwal}</div></li>
      <li class="trk-step ${s3}"><span class="trk-dot">${s3 === 'pass' ? '✓' : (s3 === 'fail' ? '✕' : '3')}</span><div><h3>3. Hasil Seleksi</h3>
        <p>${decided ? 'Hasil seleksi sudah diumumkan.' : (st === 'selesai' ? 'Wawancaramu sudah selesai. Panitia sedang menentukan hasil seleksi.' : 'Menunggu hasil seleksi setelah wawancara.')}</p>${result}${note}</div></li>
    </ol>`;
}

function updateOprecGate() {
    const s = window.bemSession;
    const form = document.getElementById('oprecForm');
    if (!s || !form) return;
    const loggedIn = s.logged_in === true;
    const open = s.oprec_open !== false;
    const app = loggedIn ? (s.oprec_application || null) : null;
    const show = (id, on) => { const el = document.getElementById(id); if (el) el.hidden = !on; };
    show('oprecChecking', false);
    // Yang sudah mengisi selalu melihat tahapan seleksinya (walau pendaftaran ditutup) dan tidak bisa mengisi lagi.
    const track = document.getElementById('oprecStatusGate');
    if (track) { if (app) track.innerHTML = renderOprecTracker(app); track.hidden = !app; }
    show('oprecClosedGate', !app && !open);
    show('oprecLoginGate', !app && open && !loggedIn);
    // Form hanya tampil untuk user login, belum pernah mengisi, saat pendaftaran dibuka (dan bukan saat popup sukses).
    const popup = document.getElementById('oprecPopup');
    const justSubmitted = popup && !popup.hidden;
    if (!justSubmitted) form.hidden = !(open && loggedIn && !app);
}

/* ===== FORM OPREC: VALIDASI WAJIB + POPUP HIJAU SETELAH DATABASE SUKSES ===== */
function initOprecForm() {
    const form = document.getElementById('oprecForm');
    const popup = document.getElementById('oprecPopup');
    const popupNumber = document.getElementById('oprecPopupNumber');
    const closePopup = document.getElementById('oprecPopupClose');
    if (!form || !popup) return;

    // Pastikan setiap kontrol formulir (kecuali tombol) wajib diisi.
    form.querySelectorAll('input, select, textarea').forEach(field => {
        if (field.type !== 'button' && field.type !== 'submit' && field.type !== 'reset') {
            field.required = true;
        }
    });

    // NIM & nomor WhatsApp: hanya angka (karakter lain dibuang saat mengetik/menempel).
    form.querySelectorAll('[data-digits]').forEach(input => {
        input.addEventListener('input', () => {
            const clean = input.value.replace(/\D+/g, '');
            if (clean !== input.value) input.value = clean;
        });
    });

    // Berkas: maksimal 5 MB, harus PDF.
    const MAX_FILE_BYTES = 5 * 1024 * 1024;
    function checkFile(input) {
        const f = input.files && input.files[0];
        let msg = '';
        if (f) {
            if (f.size > MAX_FILE_BYTES) msg = 'Ukuran berkas maksimal 5 MB (berkas ini ' + (f.size / 1048576).toFixed(1) + ' MB).';
            else if (!/\.pdf$/i.test(f.name) && f.type !== 'application/pdf') msg = 'Berkas harus berformat PDF.';
        }
        if (msg) { window.alert(msg); input.value = ''; }
        input.classList.toggle('invalid-file', !!msg);
        return !msg;
    }
    form.querySelectorAll('input[type="file"]').forEach(input => input.addEventListener('change', () => checkFile(input)));

    function hideSuccessPopup() {
        popup.hidden = true;
        document.body.style.overflow = '';
    }
    closePopup?.addEventListener('click', hideSuccessPopup);
    document.getElementById('oprecAgain')?.addEventListener('click', () => {
        form.reset();
        form.hidden = false;
        hideSuccessPopup();
        form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    popup.addEventListener('click', event => {
        if (event.target === popup) hideSuccessPopup();
    });
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && !popup.hidden) hideSuccessPopup();
    });

    form.addEventListener('submit', async event => {
        event.preventDefault();

        // Validasi browser: jangan kirim jika ada kolom atau berkas wajib yang kosong.
        if (!form.reportValidity()) return;
        for (const input of form.querySelectorAll('input[type="file"]')) {
            const f = input.files && input.files[0];
            if (f && f.size > MAX_FILE_BYTES) { checkFile(input); return; }
        }

        const submitButton = form.querySelector('button[type="submit"]');
        const originalText = submitButton ? submitButton.textContent : 'Kirim Pendaftaran';
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = 'Mengirim...';
        }

        try {
            const result = await window.bem.submitOprec(form);

            // Sesi habis atau pendaftaran ditutup saat form diisi: segarkan gerbang.
            if (result.login_required || result.closed || result.already_applied) {
                window.alert(result.message);
                await checkUserRole();
                return;
            }

            // 201 berarti tersimpan. Jangan mensyaratkan response.ok saja; gunakan isi JSON.
            if (!result.success) {
                window.alert(result.message || 'Pendaftaran gagal disimpan. Silakan periksa kembali formulir.');
                return;
            }

            // Popup hanya muncul setelah server memastikan data berhasil masuk database.
            if (popupNumber) popupNumber.textContent = result.application_id
                ? 'Nomor pendaftaran: #' + result.application_id
                : 'Pendaftaran kamu sudah tercatat.';
            form.hidden = true;
            popup.hidden = false;
            checkUserRole(); // muat tahapan seleksi di belakang popup; form tidak akan tampil lagi
            document.body.style.overflow = 'hidden';
            closePopup?.focus();
        } catch (error) {
            console.error('Gagal mengirim formulir OPREC:', error);
            window.alert('Tidak dapat menghubungi server. Periksa koneksi internetmu, lalu coba lagi.');
        } finally {
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = originalText;
            }
        }
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initOprecForm, { once: true });
} else {
    initOprecForm();
}
