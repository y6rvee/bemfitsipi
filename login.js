/* ===== LOGIN BEM FITS (DYNAMIC) ===== */
const form = document.getElementById('loginForm');
const nimInput = document.getElementById('nim');
const passInput = document.getElementById('password');
const errNim = document.getElementById('errNim');
const errPass = document.getElementById('errPass');
const btnLogin = document.getElementById('btnLogin');

/* ✅ FIX 1: Toggle Password (KEMBALI DITAMBAHKAN) */
document.getElementById('togglePass').addEventListener('click', () => {
    const isPass = passInput.type === 'password';
    passInput.type = isPass ? 'text' : 'password';
    document.getElementById('eyeOpen').style.display = isPass ? 'none' : 'block';
    document.getElementById('eyeClosed').style.display = isPass ? 'block' : 'none';
});

/* ✅ FIX 2: Lupa Sandi (KEMBALI DITAMBAHKAN) */
document.getElementById('forgotLink').addEventListener('click', e => {
    e.preventDefault();
    showToast('📧 Tautan reset sandi telah dikirim ke email kampus kamu (demo).');
});

/* ===== TUJUAN SETELAH LOGIN (?redirect=...) — hanya nilai dalam daftar ini yang diterima ===== */
const REDIRECTS = {
    oprec: { user: 'index.html#/oprec', admin: 'index.html#/oprec' },
    admin: { user: 'index.html#/beranda', admin: 'admin.html' },
    'oprec-admin': { user: 'index.html#/beranda', admin: 'oprec-admin.html' },
    'berita-admin': { user: 'index.html#/beranda', admin: 'berita-admin.html' }
};
function afterLoginUrl(role) {
    const key = new URLSearchParams(location.search).get('redirect');
    const r = key && Object.prototype.hasOwnProperty.call(REDIRECTS, key) ? REDIRECTS[key] : null;
    if (r) return role === 'admin' ? r.admin : r.user;
    return role === 'admin' ? 'admin.html' : 'index.html#/beranda';
}

/* ===== VALIDASI + SUBMIT KE API ===== */
form.addEventListener('submit', async e => {
    e.preventDefault();
    let ok = true;
    errNim.textContent = '';
    errPass.textContent = '';
    nimInput.closest('.field').classList.remove('invalid');
    passInput.closest('.field').classList.remove('invalid');

    const id = nimInput.value.trim();
    const pass = passInput.value;

    if (!id) {
        errNim.textContent = 'NIM atau email wajib diisi.';
        nimInput.closest('.field').classList.add('invalid');
        ok = false;
    }
    if (!pass) {
        errPass.textContent = 'Kata sandi wajib diisi.';
        passInput.closest('.field').classList.add('invalid');
        ok = false;
    }
    if (!ok) return;

    // Loading state
    btnLogin.disabled = true;
    btnLogin.querySelector('.btn-label').textContent = 'Memeriksa...';
    btnLogin.querySelector('.btn-spinner').hidden = false;

    try {
        const result = await window.bem.login(id, pass);

        btnLogin.querySelector('.btn-label').textContent = '✓ Berhasil Masuk';
        showToast('🎉 Selamat datang, ' + result.nama + '!');
        setTimeout(() => { window.location.href = afterLoginUrl(result.role); }, 1200);
    } catch (error) {
        btnLogin.disabled = false;
        btnLogin.querySelector('.btn-label').textContent = 'Masuk';
        btnLogin.querySelector('.btn-spinner').hidden = true;
        passInput.closest('.field').classList.add('invalid');
        errPass.textContent = error.message || 'Terjadi kesalahan server.';
    }
});

/* ===== TOAST ===== */
const toast = document.getElementById('toast');
let t;
function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(t);
    t = setTimeout(() => toast.classList.remove('show'), 3400);
}

/* Enter key focus flow */
nimInput.addEventListener('keydown', e => { if (e.key === 'Enter') passInput.focus(); });