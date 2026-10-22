/* ===== BEM FITS — lapisan API Supabase (pengganti api/*.php) =====
   Dimuat SETELAH supabase-js dan SEBELUM script.js / login.js.
   Anon key aman berada di browser: keamanan data dijaga oleh RLS di database. */
(function () {
  const SUPABASE_URL = 'https://zhjfxbzjgtwpqxuotvwb.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpoamZ4YnpqZ3R3cHF4dW90dndiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI2MTQ0MTIsImV4cCI6MjEwODE5MDQxMn0.I7BqCVZkhlXZFC2YBeNQvRqPMj6Mop58zcJQ4vofHcM';

  const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: true, autoRefreshToken: true }
  });

  const DEPARTEMEN = {
    relasi: 'Departemen Relasi', advokasi: 'Departemen Advokasi', minat: 'Departemen Minat Bakat',
    kominfo: 'Departemen Kominfo', keorganisasian: 'Departemen Keorganisasian'
  };
  const STATUS_VALID = ['form', 'wawancara', 'selesai', 'lulus', 'tidak_lulus'];

  async function userId() {
    const { data } = await sb.auth.getSession();
    return data.session ? data.session.user.id : null;
  }

  async function oprecOpen() {
    try {
      const { data, error } = await sb.rpc('oprec_is_open');
      return error ? true : data !== false;
    } catch (_) { return true; }
  }

  // Pendaftaran milik akun yang sedang login (null jika belum mengisi).
  async function myApplication() {
    const uid = await userId();
    if (!uid) return null;
    const { data, error } = await sb.from('oprec_applications')
      .select('id,nama,status,jadwal_wawancara,catatan_admin,departemen_final,created_at,status_updated_at')
      .eq('user_id', uid).maybeSingle();
    if (error || !data) return null;
    if (!STATUS_VALID.includes(data.status)) data.status = 'form';
    data.departemen_label = (data.status === 'lulus' && data.departemen_final)
      ? (DEPARTEMEN[data.departemen_final] || data.departemen_final) : null;
    return data;
  }

  // Bentuk sama dengan respons api/check_session.php lama.
  async function session() {
    const open = await oprecOpen();
    const { data } = await sb.auth.getSession();
    if (!data.session) return { logged_in: false, oprec_open: open };
    const { data: prof } = await sb.from('profiles').select('nama,nim,email,role')
      .eq('id', data.session.user.id).maybeSingle();
    return {
      logged_in: true,
      role: (prof && prof.role) || 'user',
      nama: (prof && prof.nama) || data.session.user.email,
      nim: prof && prof.nim,
      oprec_open: open,
      oprec_application: await myApplication()
    };
  }

  async function login(identifier, password) {
    const WRONG = 'NIM/email atau kata sandi salah.';
    let email = String(identifier || '').trim();
    if (!email.includes('@')) {
      const { data } = await sb.rpc('email_for_login', { identifier: email });
      if (!data) throw new Error(WRONG);
      email = data;
    }
    const { data, error } = await sb.auth.signInWithPassword({ email: email.toLowerCase(), password });
    if (error) {
      if (/email not confirmed/i.test(error.message)) throw new Error('Email belum dikonfirmasi. Periksa kotak masuk emailmu.');
      throw new Error(WRONG);
    }
    const { data: prof } = await sb.from('profiles').select('nama,role').eq('id', data.user.id).maybeSingle();
    return { success: true, role: (prof && prof.role) || 'user', nama: (prof && prof.nama) || email };
  }

  async function register({ nama, nim, email, password }) {
    nama = String(nama || '').trim(); nim = String(nim || '').trim(); email = String(email || '').trim().toLowerCase();
    if (!nama || !nim || !email || !password) throw new Error('Semua kolom wajib diisi.');
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new Error('Format email tidak valid.');
    if (password.length < 8) throw new Error('Kata sandi minimal 8 karakter.');
    const { data: taken } = await sb.rpc('email_for_login', { identifier: nim });
    if (taken) throw new Error('NIM atau email sudah terdaftar.');
    const { data, error } = await sb.auth.signUp({ email, password, options: { data: { nama, nim } } });
    if (error) {
      if (/already|registered|database error/i.test(error.message)) throw new Error('NIM atau email sudah terdaftar.');
      throw new Error(error.message || 'Akun belum dapat dibuat.');
    }
    if (data.session) await sb.auth.signOut();   // alur lama: setelah daftar, pengguna login manual
    return { success: true, needs_confirm: !data.session && !!data.user, message: 'Akun berhasil dibuat. Silakan login.' };
  }

  async function logout() { try { await sb.auth.signOut(); } catch (_) {} }

  function newsWithUrl(n) {
    n.gambar_url = n.gambar ? sb.storage.from('berita').getPublicUrl(n.gambar).data.publicUrl : null;
    return n;
  }
  async function getNews() {
    const { data, error } = await sb.from('berita')
      .select('id,judul,kategori,deskripsi,gambar,tanggal,nama_pengupload')
      .order('tanggal', { ascending: false }).order('id', { ascending: false });
    if (error) throw error;
    return data.map(newsWithUrl);
  }
  async function getNewsById(id) {
    const { data, error } = await sb.from('berita')
      .select('id,judul,kategori,deskripsi,gambar,tanggal,nama_pengupload').eq('id', id).maybeSingle();
    if (error) throw error;
    return data ? newsWithUrl(data) : null;
  }

  function randHex(bytes) {
    const a = new Uint8Array(bytes); crypto.getRandomValues(a);
    return Array.from(a, b => b.toString(16).padStart(2, '0')).join('');
  }

  // Mengembalikan objek {success, message, ...} seperti JSON api/submit_oprec.php lama.
  async function submitOprec(form) {
    const fail = (message, extra) => Object.assign({ success: false, message }, extra || {});
    const uid = await userId();
    if (!uid) return fail('Kamu harus login terlebih dahulu sebelum mengisi formulir OPREC.', { login_required: true });
    if (!(await oprecOpen())) return fail('Pendaftaran OPREC saat ini sedang ditutup.', { closed: true });
    if (await myApplication()) return fail('Kamu sudah mengisi formulir OPREC. Pantau tahapan seleksimu di halaman Open Recruitment.', { already_applied: true });

    const fields = ['nama','nim','prodi','kelas','angkatan','wa','email','aktif','pkkmb','polkm','hmps','magang','pengalaman','dept1','dept2','alasan','kemampuan','alasanBEM','fungsiBEM','kontribusi','waktu','konflik','bersediaAgenda','bersediaAturan','persetujuan'];
    const fd = new FormData(form);
    const row = {};
    for (const f of fields) {
      row[f] = String(fd.get(f) ?? '').trim();
      if (row[f] === '') return fail('Mohon lengkapi semua kolom wajib sebelum mengirim formulir.');
    }
    if (!/^\d{6,20}$/.test(row.nim)) return fail('NIM hanya boleh berisi angka (6–20 digit).');
    if (!/^\d{9,15}$/.test(row.wa)) return fail('Nomor WhatsApp hanya boleh berisi angka (9–15 digit).');
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(row.email)) return fail('Format email tidak valid.');
    if (row.persetujuan !== 'Setuju') return fail('Pernyataan komitmen wajib disetujui.');
    row.email = row.email.toLowerCase();

    const uploadFields = ['buktiAktif','sertifPKKMB','sertifPOLKM','buktiOrg','cv','faktaIntegritas'];
    for (const f of uploadFields) {
      const file = fd.get(f);
      if (!(file instanceof File) || !file.size) return fail('Semua berkas PDF wajib diunggah. Periksa kembali berkas: ' + f + '.');
      if (file.size > 5 * 1024 * 1024) return fail('Ukuran setiap berkas maksimal 5 MB. Periksa berkas: ' + f + '.');
      if ((await file.slice(0, 5).text()) !== '%PDF-') return fail('Semua berkas harus berformat PDF. Periksa berkas: ' + f + '.');
    }

    const uploaded = {};
    const cleanup = () => { const paths = Object.values(uploaded); if (paths.length) sb.storage.from('oprec').remove(paths); };
    for (const f of uploadFields) {
      const path = uid + '/' + f + '_' + randHex(12) + '.pdf';
      const { error } = await sb.storage.from('oprec').upload(path, fd.get(f), { contentType: 'application/pdf', upsert: false });
      if (error) { cleanup(); console.error('Upload gagal', f, error); return fail('Gagal mengunggah berkas (' + f + '): ' + error.message); }
      uploaded[f] = path;
    }

    const { data, error } = await sb.from('oprec_applications')
      .insert(Object.assign({}, row, { user_id: uid, berkas: uploaded })).select('id').single();
    if (error) {
      cleanup();
      console.error('Simpan pendaftaran gagal', error);
      if (error.code === '23505') {
        if (/user_id/.test(error.message + (error.details || ''))) return fail('Kamu sudah mengisi formulir OPREC.', { already_applied: true });
        return fail('NIM atau email ini sudah pernah digunakan untuk pendaftaran OPREC.');
      }
      if (error.code === '42501') return fail('Pendaftaran ditutup atau kamu tidak diizinkan mengirim formulir ini.');
      return fail('Pendaftaran belum berhasil disimpan. Silakan coba kembali.');
    }
    return { success: true, message: 'Formulir berhasil disimpan.', application_id: data.id };
  }

  window.bem = { sb, session, login, register, logout, getNews, getNewsById, submitOprec, myApplication, DEPARTEMEN };
})();
