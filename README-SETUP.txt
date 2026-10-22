BEM FITS IPI GARUT — SETUP (SUPABASE)

Website ini sekarang HANYA memakai Supabase (tidak ada lagi MySQL / phpMyAdmin / PDO).

ARSITEKTUR
- Semua akses data lewat bem-api.js (supabase-js di browser). Konfigurasi ada di bagian atas bem-api.js:
  SUPABASE_URL dan SUPABASE_ANON_KEY (anon key memang boleh di browser; keamanan dijaga oleh RLS).
- Autentikasi: Supabase Auth (email + kata sandi; login bisa memakai NIM lewat fungsi RPC email_for_login).
- Tabel: profiles (nama, nim, email, role), berita, oprec_applications, app_meta (pengaturan, mis. oprec_open).
- Storage bucket: berita (gambar berita, publik) dan oprec (berkas PDF pendaftar, privat).
- Fungsi RPC: oprec_is_open, email_for_login.
- File PHP (index.html, login.html, dll.) hanya halaman HTML statis; tidak ada kode server/PHP yang mengakses database.
  Situs bisa di-hosting di hosting statis mana pun.

MENJALANKAN
1. Letakkan folder htdocs di web server (atau hosting statis), buka index.html.
2. Pengunjung bisa menjelajah sebagai tamu. Pengguna daftar lewat Login > Aktivasi Akun.

MEMBUAT ADMIN
Daftarkan akun biasa, lalu di Supabase > SQL Editor jalankan:
   UPDATE public.profiles SET role = 'admin' WHERE nim = 'NIM_ADMIN_YANG_DIPILIH';

CATATAN KEAMANAN
- Pastikan RLS aktif di semua tabel dan kebijakan (policy) membatasi tulis/baca data OPREC hanya untuk pemilik & admin.
- Jangan pernah menaruh service_role key di kode front-end.
- Batas ukuran: PDF OPREC maks. 5 MB per berkas; gambar berita maks. 3 MB.
