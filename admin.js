/* ===== Dashboard admin BEM FITS — versi Supabase (pengganti admin*.php, berita-admin.html, oprec-admin.html) ===== */
(function () {
  const bem = window.bem, sb = bem.sb;
  const Q = new URLSearchParams(location.search);
  const PAGE = document.body.dataset.page;
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const ucfirst = s => { s = String(s || ''); return s.charAt(0).toUpperCase() + s.slice(1); };
  const fdate = v => v ? new Date(v.length === 10 ? v + 'T00:00:00' : v).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '';
  const fdt = v => v ? new Date(v).toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';
  const hex = n => { const a = new Uint8Array(n); crypto.getRandomValues(a); return Array.from(a, b => b.toString(16).padStart(2, '0')).join(''); };
  const setFlash = m => sessionStorage.setItem('bem_flash', m);
  const takeFlash = () => { const m = sessionStorage.getItem('bem_flash') || ''; sessionStorage.removeItem('bem_flash'); return m; };

  const STATUS = { form: 'Menunggu Wawancara', wawancara: 'Tahap Wawancara', selesai: 'Selesai Wawancara · Menunggu Hasil Seleksi', lulus: 'Lulus', tidak_lulus: 'Tidak Lulus' };
  const DEPT = bem.DEPARTEMEN;
  const KATEGORI = { kegiatan: 'Kegiatan', pengumuman: 'Pengumuman', prestasi: 'Prestasi' };
  const LABELS = { nama: 'Nama lengkap', nim: 'NIM', prodi: 'Program studi', kelas: 'Kelas', angkatan: 'Angkatan', wa: 'Nomor WhatsApp', email: 'Email', aktif: 'Mahasiswa aktif FITS', pkkmb: 'Mengikuti PKKMB dan memiliki sertifikat', polkm: 'Mengikuti PO, LKM, atau kegiatan sejenis', hmps: 'Pengalaman di HMPS minimal satu tahun', magang: 'Pengalaman magang', pengalaman: 'Pengalaman organisasi', dept1: 'Pilihan departemen 1', dept2: 'Pilihan departemen 2', alasan: 'Alasan memilih departemen', kemampuan: 'Kemampuan yang dimiliki', alasanBEM: 'Alasan ingin bergabung BEM FITS', fungsiBEM: 'Pemahaman fungsi BEM', kontribusi: 'Kontribusi yang ingin diberikan', waktu: 'Komitmen waktu', konflik: 'Cara menghadapi konflik', bersediaAgenda: 'Bersedia mengikuti agenda', bersediaAturan: 'Bersedia menaati aturan', persetujuan: 'Pernyataan komitmen' };
  const NAV = [['dashboard', 'admin.html', '▦', 'Dashboard'], ['oprec', 'oprec-admin.html', '♙', 'Data Pendaftar OPREC'], ['berita', 'berita-admin.html', '▤', 'Kelola Berita']];

  const style = document.createElement('style');
  style.textContent = '.bulk-bar{display:flex;align-items:center;gap:14px;padding:0 22px 14px;flex-wrap:wrap}.bulk-bar .chk{display:inline-flex;align-items:center;gap:8px;font-size:12px;font-weight:700;cursor:pointer}.bulk-bar .btn[disabled]{opacity:.45;cursor:not-allowed}.col-chk{width:42px;text-align:center}.col-chk input,.bulk-bar input{width:16px;height:16px;accent-color:#2196a8;cursor:pointer}td .btn+.btn{margin-left:6px}.danger-row{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:18px 22px;flex-wrap:wrap}.danger-zone{border:1px solid #f6d3d0}';
  document.head.appendChild(style);

  function shell(active, eyebrow, heading, nama) {
    const links = NAV.map(([k, href, icon, label]) => `<a class="side-link${k === active ? ' active' : ''}" href="${href}"><span class="side-icon">${icon}</span>${label}</a>`).join('');
    const mlinks = NAV.map(([k, href, , label]) => `<a class="${k === active ? 'active' : ''}" href="${href}">${label}</a>`).join('');
    return `<div class="layout"><aside class="sidebar"><div class="brand"><img src="logo-bem.png" alt="Logo BEM FITS"><div><strong>BEM FITS</strong><small>IPI Garut · Admin</small></div></div>
<div class="side-label">Menu utama</div>${links}
<div class="side-label">Website</div>
<a class="side-link" href="index.html#/berita"><span class="side-icon">↗</span>Halaman Berita</a>
<a class="side-link" href="index.html#/oprec"><span class="side-icon">↗</span>Open Recruitment</a>
<a class="side-link" href="index.html#/profil"><span class="side-icon">↗</span>Profil Organisasi</a>
<div class="side-bottom"><a href="index.html#/beranda">← Lihat website</a><a href="#" id="logoutLink">↪ Keluar dari akun</a></div></aside>
<main class="main"><div class="mobile-brand"><img src="logo-bem.png" alt=""><strong>BEM FITS · ADMIN</strong></div>
<nav class="mobile-nav">${mlinks}<a href="#" id="logoutLinkMobile">Keluar</a></nav>
<header class="topbar"><div><div class="eyebrow">${esc(eyebrow)}</div><h1>${esc(heading)}</h1></div><div class="account"><div class="avatar">${esc((nama || 'A').trim().charAt(0).toUpperCase())}</div><div><strong>${esc(nama)}</strong><small>Administrator</small></div></div></header>
<div id="content"></div></main></div>`;
  }

  /* ---------------- DASHBOARD ---------------- */
  async function pageDashboard(c, me) {
    const cnt = async (t, f) => { let q = sb.from(t).select('*', { count: 'exact', head: true }); if (f) q = f(q); const { count } = await q; return count || 0; };
    const [tu, ta, tb, users, news] = await Promise.all([
      cnt('profiles'), cnt('profiles', q => q.eq('role', 'admin')), cnt('berita'),
      sb.from('profiles').select('nama,nim,email,role,created_at').order('created_at', { ascending: false }).limit(8),
      sb.from('berita').select('judul,kategori,tanggal').order('tanggal', { ascending: false }).limit(5)
    ]);
    const U = users.data || [], B = news.data || [];
    c.innerHTML = `<section class="welcome"><h2>Selamat datang, ${esc(me.nama)} 👋</h2><p>Kelola informasi dan pantau aktivitas portal BEM FITS IPI Garut dari satu tempat. Ringkasan di bawah ini diambil langsung dari database.</p></section>
<section class="stats"><article class="stat"><div><div class="stat-top">Total akun mahasiswa <span class="stat-icon">♙</span></div><strong>${tu}</strong><small>Semua akun terdaftar</small></div></article><article class="stat"><div><div class="stat-top">Akun administrator <span class="stat-icon">⚙</span></div><strong>${ta}</strong><small>Pengelola sistem</small></div></article><article class="stat"><div><div class="stat-top">Publikasi berita <span class="stat-icon">▤</span></div><strong>${tb}</strong><small>Artikel dalam database</small></div></article></section>
<div class="section-grid"><section class="panel"><div class="panel-head"><h3>Akun terbaru</h3><span>${U.length} akun ditampilkan</span></div><div class="table-scroll"><table><thead><tr><th>Nama</th><th>NIM</th><th>Peran</th><th>Terdaftar</th></tr></thead><tbody>${U.length ? U.map(u => `<tr><td><strong>${esc(u.nama)}</strong><br><span class="muted">${esc(u.email)}</span></td><td>${esc(u.nim)}</td><td><span class="pill ${u.role === 'admin' ? 'admin' : ''}">${esc(ucfirst(u.role))}</span></td><td>${fdate(u.created_at)}</td></tr>`).join('') : '<tr><td colspan="4" class="empty">Belum ada data akun.</td></tr>'}</tbody></table></div></section>
<section class="panel"><div class="panel-head"><h3>Berita terbaru</h3><span><a href="berita-admin.html" style="color:var(--teal);font-weight:800;text-decoration:none">Kelola →</a></span></div><div class="news-list">${B.length ? B.map(b => `<div class="news-item"><strong>${esc(b.judul)}</strong><small>${esc(ucfirst(b.kategori))} · ${fdate(b.tanggal)}</small></div>`).join('') : '<div class="empty">Belum ada berita di database.</div>'}</div></section></div>
<div class="quick-links"><a href="oprec-admin.html">♙ Lihat hasil form OPREC</a><a href="index.html#/beranda">↗ Buka website</a><a href="berita-admin.html">▤ Kelola berita</a><a href="index.html#/berita">Lihat halaman berita</a></div>`;
  }

  /* ---------------- OPREC ---------------- */
  async function deleteApps(ids, backUrl) {
    const { data, error } = await sb.from('oprec_applications').delete().in('id', ids).select('id,berkas');
    if (error || !data) { alert('Gagal menghapus data pendaftar: ' + (error ? error.message : 'tidak diizinkan')); return; }
    const files = [];
    data.forEach(r => { if (r.berkas && typeof r.berkas === 'object') Object.values(r.berkas).forEach(p => { if (typeof p === 'string') files.push(p); }); });
    if (files.length) await sb.storage.from('oprec').remove(files);
    setFlash(data.length ? `${data.length} data pendaftar berhasil dihapus permanen beserta ${files.length} berkas PDF-nya.` : 'Data pendaftar tidak ditemukan (mungkin sudah dihapus).');
    location.href = backUrl;
  }

  async function pageOprec(c) {
    const search = (Q.get('q') || '').trim();
    const filter = STATUS[Q.get('status')] ? Q.get('status') : '';
    const selId = parseInt(Q.get('id'), 10) || 0;
    const flash = takeFlash();
    const [openRes, listRes] = await Promise.all([
      sb.rpc('oprec_is_open'),
      sb.from('oprec_applications').select('id,nama,nim,prodi,dept1,dept2,email,status,departemen_final,created_at').order('created_at', { ascending: false })
    ]);
    const open = openRes.data !== false;
    const all = listRes.data || [];
    const err = listRes.error ? `<div class="error">Data pendaftaran belum bisa dimuat: ${esc(listRes.error.message)}</div>` : '';
    const flashHtml = (err) + (flash ? `<div class="flash">${esc(flash)}</div>` : '');
    const backQs = new URLSearchParams(); if (search) backQs.set('q', search); if (filter) backQs.set('status', filter);
    const listUrl = 'oprec-admin.html' + (backQs.toString() ? '?' + backQs : '');

    if (selId) {
      const { data: a } = await sb.from('oprec_applications').select('*').eq('id', selId).maybeSingle();
      if (!a) { c.innerHTML = flashHtml + `<div class="error">Pendaftar tidak ditemukan.</div><a class="back" href="${listUrl}">← Kembali ke daftar pendaftar</a>`; return; }
      const cur = STATUS[a.status] ? a.status : 'form';
      const files = (a.berkas && typeof a.berkas === 'object') ? Object.entries(a.berkas) : [];
      c.innerHTML = flashHtml + `<a class="back" href="${listUrl}">← Kembali ke daftar pendaftar</a>
<section class="panel"><div class="panel-head"><h3>Tahapan seleksi</h3><span class="pill s-${esc(cur)}">${esc(STATUS[cur])}</span></div>${cur === 'selesai' ? '<div class="flash" style="margin:16px 22px 0">✅ Pendaftar ini sudah selesai diwawancarai dan sedang menunggu hasil seleksi.</div>' : ''}
<form id="statusForm" class="status-form"><div class="status-grid"><div><label>Tahap / hasil</label><select id="statusSelect">${Object.entries(STATUS).map(([k, l]) => `<option value="${k}"${k === cur ? ' selected' : ''}>${esc(l)}${k === 'form' ? ' (setelah form diisi)' : ''}</option>`).join('')}</select></div>
<div><label>Jadwal wawancara <span class="muted">(wajib untuk Tahap Wawancara)</span></label><input type="text" id="jadwal" maxlength="200" value="${esc(a.jadwal_wawancara || '')}" placeholder="Contoh: Senin, 27 Okt 2026 · 10.00 WIB · Ruang BEM FITS"></div>
<div id="deptBox"><label>Departemen penempatan <span class="muted">(wajib jika Lulus)</span></label><select id="departemen"><option value="">Pilih departemen</option>${Object.entries(DEPT).map(([k, l]) => `<option value="${k}"${a.departemen_final === k ? ' selected' : ''}>${esc(l)}${a.dept1 === k ? ' (pilihan 1)' : (a.dept2 === k ? ' (pilihan 2)' : '')}</option>`).join('')}</select></div>
<div class="wide"><label>Catatan untuk pendaftar <span class="muted">(opsional, tampil di halaman pendaftar)</span></label><textarea id="catatan" rows="3" maxlength="1000">${esc(a.catatan_admin || '')}</textarea></div></div>
<div style="padding:0 22px 20px"><button class="btn" type="submit">Simpan tahapan</button><span class="muted" style="margin-left:12px">Pendaftar langsung melihat perubahan ini.</span></div></form></section>
<section class="panel"><div class="panel-head"><h3>${esc(a.nama)}</h3><span>ID pendaftaran #${a.id} · ${fdt(a.created_at)}</span></div><div class="detail-grid">${Object.entries(LABELS).map(([k, l]) => `<div class="answer"><label>${esc(l)}</label><p>${String(a[k] ?? '').trim() ? esc(a[k]).replace(/\n/g, '<br>') : '—'}</p></div>`).join('')}</div>
<div class="files"><strong>Berkas yang diunggah</strong><br>${files.length ? files.map(([f, p]) => `<a href="#" class="pdf" data-path="${esc(p)}">${esc(f)} · Lihat PDF ↗</a>`).join('') : '<p class="muted">Data berkas tidak tersedia.</p>'}</div></section>
<section class="panel danger-zone"><div class="panel-head"><h3>Hapus data pendaftar</h3><span class="muted">Tindakan permanen</span></div><div class="danger-row"><p class="muted" style="margin:0;white-space:normal">Menghapus pendaftaran ini beserta seluruh berkas PDF yang diunggah. Pendaftar dapat mendaftar ulang jika OPREC masih dibuka.</p><button type="button" id="delThis" class="btn danger">🗑 Hapus pendaftar ini</button></div></section>`;

      const sel = c.querySelector('#statusSelect'), deptBox = c.querySelector('#deptBox');
      const toggle = () => { deptBox.style.display = sel.value === 'lulus' ? '' : 'none'; };
      sel.addEventListener('change', toggle); toggle();
      c.querySelector('#statusForm').addEventListener('submit', async e => {
        e.preventDefault();
        const status = sel.value, jadwal = c.querySelector('#jadwal').value.trim(), catatan = c.querySelector('#catatan').value.trim(), dept = c.querySelector('#departemen').value;
        let msg = '';
        if (status === 'wawancara' && !jadwal) msg = 'Isi jadwal wawancara (tanggal, jam, dan tempat) sebelum memindahkan pendaftar ke tahap wawancara.';
        else if (status === 'lulus' && !DEPT[dept]) msg = 'Pilih departemen penempatan sebelum menyatakan pendaftar LULUS.';
        else if (jadwal.length > 200) msg = 'Jadwal wawancara maksimal 200 karakter.';
        if (msg) { alert(msg); return; }
        const { data, error } = await sb.from('oprec_applications').update({
          status, jadwal_wawancara: jadwal || null, catatan_admin: catatan || null,
          departemen_final: status === 'lulus' ? dept : null, status_updated_at: new Date().toISOString()
        }).eq('id', a.id).select('id');
        if (error || !data || !data.length) { alert('Gagal menyimpan tahapan seleksi' + (error ? ': ' + error.message : ' (tidak diizinkan).')); return; }
        setFlash('Tahapan seleksi berhasil diperbarui. Pendaftar langsung melihatnya di halaman Open Recruitment.');
        location.href = 'oprec-admin.html?id=' + a.id;
      });
      c.querySelectorAll('a.pdf').forEach(l => l.addEventListener('click', async e => {
        e.preventDefault();
        const w = window.open('', '_blank');
        const { data, error } = await sb.storage.from('oprec').createSignedUrl(l.dataset.path, 300);
        if (error || !data) { if (w) w.close(); alert('Berkas tidak dapat dibuka: ' + (error ? error.message : '')); return; }
        if (w) w.location.href = data.signedUrl; else location.href = data.signedUrl;
      }));
      c.querySelector('#delThis').addEventListener('click', () => {
        if (confirm(`Hapus permanen pendaftaran ${a.nama}? Data dan berkas PDF-nya tidak bisa dikembalikan.`)) deleteApps([a.id], listUrl);
      });
      return;
    }

    const counts = { form: 0, wawancara: 0, selesai: 0, lulus: 0, tidak_lulus: 0 };
    all.forEach(r => { if (counts[r.status] !== undefined) counts[r.status]++; });
    const qq = search.toLowerCase();
    const rows = all.filter(r => (!filter || r.status === filter) && (!qq || [r.nama, r.nim, r.email, r.prodi].some(v => String(v || '').toLowerCase().includes(qq))));
    c.innerHTML = flashHtml + `<section class="panel oprec-toggle"><div class="toggle-row"><div><div class="toggle-title">Status pendaftaran OPREC <span class="pill ${open ? '' : 'closed'}">${open ? 'DIBUKA' : 'DITUTUP'}</span></div><p class="muted" style="margin:6px 0 0;white-space:normal">${open ? 'Mahasiswa yang sudah login bisa mengisi dan mengirim formulir.' : 'Formulir disembunyikan dan pengiriman ditolak server. Mahasiswa melihat pemberitahuan bahwa pendaftaran ditutup.'}</p></div>
<button type="button" id="toggleOpen" class="btn ${open ? 'danger' : ''}">${open ? '⏸ Tutup Pendaftaran' : '▶ Buka Pendaftaran'}</button></div></section>
<section class="stats" style="grid-template-columns:minmax(0,1fr)"><article class="stat"><div class="stat-top">Total pendaftar OPREC <span class="stat-icon">♙</span></div><strong>${all.length}</strong><small>Tersimpan di database</small></article></section>
<section class="panel"><div class="panel-head"><h3>Daftar calon pengurus</h3><span>${rows.length} hasil</span></div>
<form class="search" method="get"><input name="q" value="${esc(search)}" placeholder="Cari nama, NIM, email, atau program studi…"><select name="status"><option value="">Semua status</option>${Object.entries(STATUS).map(([k, l]) => `<option value="${k}"${filter === k ? ' selected' : ''}>${esc(l)} (${counts[k]})</option>`).join('')}</select><button class="btn" type="submit">Cari pendaftar</button>${search || filter ? '<a class="btn secondary" href="oprec-admin.html">Reset</a>' : ''}</form>
<div class="bulk-bar"><label class="chk"><input type="checkbox" id="checkAll"> Pilih semua</label><span class="muted" id="bulkInfo">0 dipilih</span><button type="button" class="btn danger sm" id="bulkBtn" disabled>🗑 Hapus terpilih</button></div>
<div class="table-scroll"><table><thead><tr><th class="col-chk"></th><th>Calon pengurus</th><th>NIM</th><th>Program studi</th><th>Pilihan departemen</th><th>Status</th><th>Waktu daftar</th><th>Aksi</th></tr></thead><tbody>${rows.length ? rows.map(r => `<tr><td class="col-chk"><input type="checkbox" class="rowChk" value="${r.id}" aria-label="Pilih ${esc(r.nama)}"></td><td><strong>${esc(r.nama)}</strong><span class="muted">${esc(r.email)}</span></td><td>${esc(r.nim)}</td><td>${esc(r.prodi)}</td><td>${esc(r.dept1)}<br><span class="muted">Alternatif: ${esc(r.dept2)}</span></td><td><span class="pill s-${esc(r.status)}">${esc(STATUS[r.status] || STATUS.form)}</span>${r.status === 'lulus' && r.departemen_final ? `<br><span class="muted">${esc(DEPT[r.departemen_final] || r.departemen_final)}</span>` : ''}</td><td>${fdt(r.created_at)}</td><td><a class="btn" href="oprec-admin.html?id=${r.id}${search ? '&q=' + encodeURIComponent(search) : ''}">Lihat jawaban</a> <button type="button" class="btn danger delOne" data-id="${r.id}" data-nama="${esc(r.nama)}">Hapus</button></td></tr>`).join('') : `<tr><td colspan="8" class="empty">${search || filter ? 'Tidak ada pendaftar yang cocok.' : 'Belum ada pendaftaran OPREC yang tersimpan.'}</td></tr>`}</tbody></table></div></section>`;

    c.querySelector('#toggleOpen').addEventListener('click', async () => {
      if (!confirm(open ? 'Tutup pendaftaran OPREC sekarang?' : 'Buka pendaftaran OPREC sekarang?')) return;
      const { error } = await sb.from('app_meta').upsert({ k: 'oprec_open', v: open ? '0' : '1' });
      if (error) { alert('Gagal mengubah status pendaftaran: ' + error.message); return; }
      setFlash(open ? 'Pendaftaran OPREC DITUTUP. Formulir tidak lagi bisa diisi atau dikirim.' : 'Pendaftaran OPREC DIBUKA. Mahasiswa yang sudah login kini bisa mengisi formulir.');
      location.reload();
    });
    const all_ = c.querySelector('#checkAll'), btn = c.querySelector('#bulkBtn'), info = c.querySelector('#bulkInfo');
    const chks = [...c.querySelectorAll('.rowChk')];
    const sync = () => { const n = chks.filter(x => x.checked).length; info.textContent = n + ' dipilih'; btn.disabled = n === 0; all_.checked = chks.length > 0 && n === chks.length; all_.indeterminate = n > 0 && n < chks.length; };
    all_.addEventListener('change', () => { chks.forEach(x => { x.checked = all_.checked; }); sync(); });
    chks.forEach(x => x.addEventListener('change', sync)); sync();
    btn.addEventListener('click', () => {
      const ids = chks.filter(x => x.checked).map(x => parseInt(x.value, 10));
      if (!ids.length) { alert('Pilih minimal satu pendaftar.'); return; }
      if (confirm(`Hapus permanen ${ids.length} data pendaftar yang dipilih beserta berkas PDF-nya?\nTindakan ini tidak bisa dibatalkan.`)) deleteApps(ids, listUrl);
    });
    c.querySelectorAll('.delOne').forEach(b => b.addEventListener('click', () => {
      if (confirm(`Hapus permanen pendaftaran "${b.dataset.nama}"?\nData dan berkas PDF-nya tidak bisa dikembalikan.`)) deleteApps([parseInt(b.dataset.id, 10)], listUrl);
    }));
  }

  /* ---------------- BERITA ---------------- */
  const imgUrl = p => p ? sb.storage.from('berita').getPublicUrl(p).data.publicUrl : '';

  async function pageBerita(c, me) {
    const mode = Q.get('mode') || '';
    const editId = parseInt(Q.get('id'), 10) || 0;
    const isForm = mode === 'baru' || mode === 'edit';
    const flash = takeFlash();
    const flashHtml = flash ? `<div class="flash">${esc(flash)}</div>` : '';

    if (isForm) {
      let d = { judul: '', kategori: 'kegiatan', deskripsi: '', gambar: null, tanggal: new Date().toISOString().slice(0, 10) };
      if (mode === 'edit') {
        const { data } = await sb.from('berita').select('judul,kategori,deskripsi,gambar,tanggal').eq('id', editId).maybeSingle();
        if (!data) { setFlash('Berita tidak ditemukan.'); location.href = 'berita-admin.html'; return; }
        d = data;
      }
      c.innerHTML = flashHtml + `<a class="back" href="berita-admin.html">← Kembali ke daftar berita</a><div class="error" id="formErr" hidden></div>
<section class="panel"><div class="panel-head"><h3>${mode === 'edit' ? 'Ubah data berita' : 'Berita baru'}</h3><span>${mode === 'edit' ? 'ID #' + editId : 'Pengupload: ' + esc(me.nama)}</span></div>
<form id="beritaForm" autocomplete="off"><div class="form-grid">
<div class="field full"><label for="judul">Judul berita</label><input id="judul" maxlength="120" required value="${esc(d.judul)}" placeholder="Contoh: BEM FITS Gelar Seminar Literasi"></div>
<div class="field"><label for="kategori">Kategori</label><select id="kategori">${Object.entries(KATEGORI).map(([k, l]) => `<option value="${k}"${d.kategori === k ? ' selected' : ''}>${l}</option>`).join('')}</select></div>
<div class="field"><label for="tanggal">Tanggal publikasi</label><input id="tanggal" type="date" required value="${esc(d.tanggal)}"></div>
<div class="field full"><label for="gambar">Gambar berita (opsional)</label>
${d.gambar ? `<img id="imgPreview" class="preview" src="${esc(imgUrl(d.gambar))}" alt="Gambar saat ini"><label class="check"><input type="checkbox" id="hapusGambar"> Hapus gambar saat ini</label>` : '<img id="imgPreview" class="preview" alt="" hidden>'}
<input id="gambar" type="file" accept="image/jpeg,image/png,image/webp,image/gif"><small>JPG, PNG, WEBP, atau GIF · maks. 3 MB. Tampil di kartu berita beranda dan halaman detail. Rasio 16:9 disarankan.</small></div>
<div class="field full"><label for="deskripsi">Isi / deskripsi berita</label><textarea id="deskripsi" required placeholder="Tulis isi berita. Pisahkan paragraf dengan satu baris kosong.">${esc(d.deskripsi)}</textarea><small>Paragraf dipisahkan baris kosong. Kartu di beranda menampilkan 140 karakter pertama; halaman detail menampilkan seluruhnya.</small></div></div>
<div class="form-actions"><button class="btn" type="submit" id="saveBtn">${mode === 'edit' ? 'Simpan perubahan' : 'Terbitkan berita'}</button><a class="btn secondary" href="berita-admin.html">Batal</a></div></form></section>`;

      const fileIn = c.querySelector('#gambar');
      fileIn.addEventListener('change', () => { const p = c.querySelector('#imgPreview'); if (fileIn.files[0]) { p.src = URL.createObjectURL(fileIn.files[0]); p.hidden = false; } });
      c.querySelector('#beritaForm').addEventListener('submit', async e => {
        e.preventDefault();
        const f = { judul: c.querySelector('#judul').value.trim(), kategori: c.querySelector('#kategori').value, deskripsi: c.querySelector('#deskripsi').value.trim(), tanggal: c.querySelector('#tanggal').value };
        const file = fileIn.files[0];
        const EXT = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif' };
        const errs = [];
        if (!f.judul) errs.push('Judul wajib diisi.'); else if (f.judul.length > 120) errs.push('Judul maksimal 120 karakter.');
        if (!KATEGORI[f.kategori]) errs.push('Kategori tidak valid.');
        if (!f.deskripsi) errs.push('Deskripsi wajib diisi.');
        if (!/^\d{4}-\d{2}-\d{2}$/.test(f.tanggal)) errs.push('Tanggal tidak valid.');
        if (file) { if (file.size > 3 * 1024 * 1024) errs.push('Ukuran gambar maksimal 3 MB.'); else if (!EXT[file.type]) errs.push('Gambar harus berformat JPG, PNG, WEBP, atau GIF.'); }
        const box = c.querySelector('#formErr');
        const showErr = list => { box.innerHTML = list.map(x => `<div>${esc(x)}</div>`).join(''); box.hidden = false; box.scrollIntoView({ behavior: 'smooth', block: 'center' }); };
        if (errs.length) { showErr(errs); return; }
        box.hidden = true;
        const btn = c.querySelector('#saveBtn'); btn.disabled = true;
        let imgName = d.gambar || null, uploaded = null;
        if (file) {
          uploaded = 'berita_' + hex(10) + '.' + EXT[file.type];
          const { error } = await sb.storage.from('berita').upload(uploaded, file, { contentType: file.type, upsert: false });
          if (error) { btn.disabled = false; showErr(['Gambar gagal diunggah: ' + error.message]); return; }
          imgName = uploaded;
        } else if (mode === 'edit' && c.querySelector('#hapusGambar') && c.querySelector('#hapusGambar').checked) imgName = null;
        let res;
        if (mode === 'edit') res = await sb.from('berita').update({ judul: f.judul, kategori: f.kategori, deskripsi: f.deskripsi, gambar: imgName, tanggal: f.tanggal }).eq('id', editId).select('id');
        else res = await sb.from('berita').insert({ judul: f.judul, kategori: f.kategori, deskripsi: f.deskripsi, gambar: imgName, tanggal: f.tanggal, nama_pengupload: String(me.nama).slice(0, 100) }).select('id');
        if (res.error || !res.data || !res.data.length) {
          if (uploaded) sb.storage.from('berita').remove([uploaded]);
          btn.disabled = false; showErr(['Terjadi kesalahan saat menyimpan: ' + (res.error ? res.error.message : 'tidak diizinkan.')]); return;
        }
        if (d.gambar && d.gambar !== imgName) sb.storage.from('berita').remove([d.gambar]);
        setFlash(mode === 'edit' ? 'Berita berhasil diperbarui.' : 'Berita baru berhasil ditambahkan.');
        location.href = 'berita-admin.html';
      });
      return;
    }

    const search = (Q.get('q') || '').trim(), kat = KATEGORI[Q.get('kategori')] ? Q.get('kategori') : '';
    const { data, error } = await sb.from('berita').select('id,judul,kategori,deskripsi,gambar,tanggal,nama_pengupload').order('tanggal', { ascending: false }).order('id', { ascending: false });
    const all = data || [], qq = search.toLowerCase();
    const rows = all.filter(r => (!kat || r.kategori === kat) && (!qq || [r.judul, r.deskripsi, r.nama_pengupload].some(v => String(v || '').toLowerCase().includes(qq))));
    c.innerHTML = (error ? `<div class="error">Data berita belum bisa dimuat: ${esc(error.message)}</div>` : '') + flashHtml + `
<section class="stats" style="grid-template-columns:minmax(0,1fr)"><article class="stat"><div class="stat-top">Total publikasi berita <span class="stat-icon">▤</span></div><strong>${all.length}</strong><small>Artikel tersimpan di database</small></article></section>
<section class="panel"><div class="panel-head"><h3>Daftar berita</h3><a class="btn" href="berita-admin.html?mode=baru">+ Tambah berita</a></div>
<form class="search" method="get"><input name="q" value="${esc(search)}" placeholder="Cari judul, isi, atau nama pengupload…"><select name="kategori"><option value="">Semua kategori</option>${Object.entries(KATEGORI).map(([k, l]) => `<option value="${k}"${kat === k ? ' selected' : ''}>${l}</option>`).join('')}</select><button class="btn" type="submit">Cari</button>${search || kat ? '<a class="btn secondary" href="berita-admin.html">Reset</a>' : ''}</form>
<div class="table-scroll"><table><thead><tr><th>Gambar</th><th>Judul</th><th>Kategori</th><th>Tanggal</th><th>Pengupload</th><th>Aksi</th></tr></thead><tbody>${rows.length ? rows.map(r => {
      const sum = String(r.deskripsi || '').replace(/\s+/g, ' '); const short = sum.length > 90 ? sum.slice(0, 89) + '…' : sum;
      return `<tr><td>${r.gambar ? `<img class="thumb" src="${esc(imgUrl(r.gambar))}" alt="">` : '<span class="thumb thumb-empty">—</span>'}</td><td class="wrap"><strong>${esc(r.judul)}</strong><span class="muted">${esc(short)}</span></td><td><span class="pill ${esc(r.kategori)}">${esc(KATEGORI[r.kategori] || ucfirst(r.kategori))}</span></td><td>${fdate(r.tanggal)}</td><td>${esc(r.nama_pengupload)}</td><td><div class="actions"><a class="btn secondary sm" target="_blank" rel="noopener" href="berita-detail.html?id=${r.id}">Lihat</a><a class="btn sm" href="berita-admin.html?mode=edit&id=${r.id}">Edit</a><button type="button" class="btn danger sm delBerita" data-id="${r.id}">Hapus</button></div></td></tr>`;
    }).join('') : `<tr><td colspan="6" class="empty">${search || kat ? 'Tidak ada berita yang cocok.' : 'Belum ada berita. Klik “Tambah berita” untuk membuat yang pertama.'}</td></tr>`}</tbody></table></div></section>`;
    c.querySelectorAll('.delBerita').forEach(b => b.addEventListener('click', async () => {
      if (!confirm('Hapus berita ini secara permanen?')) return;
      const { data: del, error: e } = await sb.from('berita').delete().eq('id', parseInt(b.dataset.id, 10)).select('gambar');
      if (e || !del || !del.length) { alert('Gagal menghapus berita' + (e ? ': ' + e.message : ' (tidak diizinkan).')); return; }
      if (del[0].gambar) await sb.storage.from('berita').remove([del[0].gambar]);
      setFlash('Berita berhasil dihapus.'); location.reload();
    }));
  }

  /* ---------------- ROUTER ---------------- */
  async function init() {
    const app = document.getElementById('app');
    let s;
    try { s = await bem.session(); } catch (e) { s = { logged_in: false }; }
    if (!s.logged_in || s.role !== 'admin') {
      location.replace('login.html?redirect=' + (PAGE === 'oprec' ? 'oprec-admin' : PAGE === 'berita' ? 'berita-admin' : 'admin'));
      return;
    }
    const mode = Q.get('mode');
    const META = {
      dashboard: ['Panel kontrol', 'Dashboard Admin'],
      oprec: ['Panel kontrol · Open Recruitment', 'Data Pendaftar OPREC'],
      berita: ['Panel kontrol · Berita & Publikasi', mode === 'edit' ? 'Edit Berita' : mode === 'baru' ? 'Tambah Berita' : 'Kelola Berita']
    }[PAGE];
    app.innerHTML = shell(PAGE, META[0], META[1], s.nama);
    const out = async e => { e.preventDefault(); await bem.logout(); location.href = 'index.html#/beranda'; };
    ['logoutLink', 'logoutLinkMobile'].forEach(id => { const el = document.getElementById(id); if (el) el.addEventListener('click', out); });
    const c = document.getElementById('content');
    try {
      await ({ dashboard: pageDashboard, oprec: pageOprec, berita: pageBerita }[PAGE])(c, s);
    } catch (e) {
      console.error(e);
      c.innerHTML = '<div class="error">Terjadi kesalahan saat memuat halaman: ' + esc(e.message || e) + '</div>';
    }
  }
  init();
})();
