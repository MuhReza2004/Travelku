# TravelKu — Sistem Internal Manajemen Pemesanan Paket Wisata

TravelKu adalah sistem internal berbasis web untuk agen perjalanan. Staf agen dapat mencatat, memfilter, mengubah status, dan mengekspor pemesanan paket wisata pelanggan.

---

## Cara Menjalankan di Lokal

### Prasyarat

- Node.js 18+ (direkomendasikan 20.x LTS)
- npm 9+
- Akun Supabase (gratis di [supabase.com](https://supabase.com))

### Langkah-langkah

```bash
# 1. Clone repositori
git clone <url-repo>
cd travelku

# 2. Install dependensi
npm install

# 3. Buat file .env (jika belum ada)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxxxx

# 4. Jalankan migrasi database
#    Buka Supabase Dashboard → SQL Editor → paste isi supabase/migrations/0001_create_bookings.sql → Run

# 5. (Opsional) Nonaktifkan email confirmation
#    Supabase Dashboard → Authentication → Settings → Disable "Confirm email"

# 6. Jalankan dev server
npm run dev

# 7. Buka http://localhost:3000, daftar akun staf baru, lalu mulai gunakan
```

### Perintah lain

| Perintah | Fungsi |
|----------|--------|
| `npm run dev` | Dev server (port 3000) |
| `npm run build` | Build produksi |
| `npm run start` | Jalankan production server |
| `npm run lint` | ESLint |
| `npx tsc --noEmit` | Type-check |

---

## Stack & Alasan

| Teknologi | Alasan |
|-----------|--------|
| **Next.js 16 (App Router)** | React full-stack, routing built-in, middleware untuk auth |
| **TypeScript 5** | Type safety, maintainability jangka panjang |
| **Tailwind CSS v4** | Utility-first, styling cepat tanpa file CSS terpisah |
| **Supabase** | Backend-as-a-Service: database Postgres, auth, RLS — gratis untuk prototyping |
| **@supabase/ssr** | Cookie-based session management untuk Next.js App Router |

### Arsitektur

```
Client Components ──fetch()──> /api/* (REST API, JSON) ──> Supabase
                                   │
                              @supabase/ssr cookie-based auth
```

Tidak ada server action atau akses Supabase langsung dari UI. Semua komunikasi data melalui REST API di `/api/*` dengan format JSON. Middleware Edge melindungi rute yang membutuhkan autentikasi.

---

## Daftar Fitur

### ✅ Selesai

**Auth**
- [x] Registrasi staf baru (nama, email, password)
- [x] Login dengan email/password
- [x] Logout
- [x] Session cookie-based (via @supabase/ssr)
- [x] Proteksi rute via Edge Middleware
- [x] RLS (Row-Level Security) di database
- [x] Error handling pesan asli dari server (tidak hardcode)

**Manajemen Pemesanan (CRUD)**
- [x] Tambah pemesanan baru — otomatis status "Menunggu"
- [x] Lihat daftar pemesanan (tabel, urut terbaru di atas)
- [x] Edit pemesanan
- [x] Hapus pemesanan (dengan konfirmasi)
- [x] Ubah status: Menunggu → Dikonfirmasi/Dibatalkan, Dikonfirmasi → Selesai/Dibatalkan
- [x] Final state (Selesai/Dibatalkan) tidak bisa diubah

**Filter & Pencarian**
- [x] Filter berdasarkan status
- [x] Filter berdasarkan paket wisata (partial match)
- [x] Filter berdasarkan rentang tanggal keberangkatan
- [x] Pencarian berdasarkan nama pemesan / kontak (partial match)

**Ringkasan**
- [x] Total pemesanan
- [x] Estimasi pendapatan (hanya Dikonfirmasi + Selesai)
- [x] Count per status
- [x] Semua ringkasan mengikuti filter aktif

**Lain-lain**
- [x] Validasi input sisi server (peserta ≥ 1, harga ≥ 0, tanggal tidak lampau, kontak wajib)
- [x] Pagination (20 per halaman)
- [x] Export daftar ke CSV
- [x] Tampilan responsive (mobile-friendly)

### ❌ Belum

- [ ] Modul Paket Wisata terpisah (relasi antar tabel)
- [ ] Validasi kapasitas paket (kuota)
- [ ] Riwayat siapa membuat/mengubah pemesanan (audit log)
- [ ] Role / level akses staf
- [ ] Unit test / integration test
- [ ] CI/CD pipeline

---

## Asumsi & Keputusan Teknis

1. **Semua staf bisa mengelola semua pemesanan.** Tidak ada pembatasan akses per staf. `created_by` tetap dicatat untuk referensi tapi tidak membatasi aksi.

2. **Tidak ada modul Paket Wisata terpisah.** Nama paket diinput manual sebagai teks bebas. Ini menyederhanakan MVP. Modul paket bisa ditambahkan nanti sebagai tabel relasi.

3. **Session dikelola via cookie (`@supabase/ssr`), bukan JWT di localStorage.** Cookie lebih aman dari XSS dan middleware bisa membaca cookie langsung tanpa JavaScript.

4. **Email confirmation di Supabase harus dinonaktifkan** agar registrasi langsung login tanpa verifikasi email. Jika tidak dinonaktifkan, setelah registrasi user harus login manual.

5. **RLS (Row-Level Security) aktif** di semua tabel. Policies mengizinkan semua staf terautentikasi untuk membaca/menulis. Anon key tidak bisa mengakses data apa pun.

6. **Tidak menggunakan Server Actions.** Seluruh komunikasi FE–BE melalui REST API (`/api/*`) dengan format JSON, agar arsitektur lebih jelas dan mudah diganti frontend-nya di masa depan.

7. **Tidak ada test framework.** Belum ada unit test atau integration test. Disarankan menambahkan Vitest + Playwright untuk proyek production.

8. **Pagination 20 per halaman.** Ukuran halaman bisa diubah via query parameter `page_size` (maks 100).
