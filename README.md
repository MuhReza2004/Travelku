# TravelKu — Sistem Internal Manajemen Pemesanan Paket Wisata

TravelKu adalah sistem internal berbasis web untuk agen perjalanan. Staf agen dapat mencatat, memfilter, mengubah status, mengelola paket wisata, dan mengekspor pemesanan pelanggan.

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
# (Opsional) Untuk validasi email saat login. Dapatkan dari Supabase Dashboard → Project Settings → API → service_role key
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# 4. Jalankan migrasi database
#    Buka Supabase Dashboard → SQL Editor → paste isi supabase/migrations/0002_add_packages_audit_roles.sql → Run

# 5. Nonaktifkan email confirmation
#    Supabase Dashboard → Authentication → Settings → Disable "Confirm email"

# 6. Jalankan dev server
npm run dev

# 7. Buka http://localhost:3000, daftar akun staf baru, lalu mulai gunakan
```

### Perintah lain

| Perintah              | Fungsi                          |
| --------------------- | ------------------------------- |
| `npm run dev`         | Dev server (port 3000)          |
| `npm run build`       | Build produksi                  |
| `npm run start`       | Jalankan production server      |
| `npm run lint`        | ESLint                          |
| `npm run typecheck`   | Type-check (tsc --noEmit)       |
| `npm test`            | Unit test (Vitest)              |
| `npm run test:watch`  | Test mode watch                 |
| `npm run test:api`    | API integration test            |
| `npm run test:e2e`    | E2E test (Playwright, headless) |
| `npm run test:e2e:ui` | E2E test (with browser)         |
| `npm run ci`          | Type-check + lint + unit test   |

---

## Stack & Alasan

| Teknologi                   | Alasan                                                                        |
| --------------------------- | ----------------------------------------------------------------------------- |
| **Next.js 16 (App Router)** | React full-stack, routing built-in, middleware untuk auth                     |
| **TypeScript 5**            | Type safety, maintainability jangka panjang                                   |
| **Tailwind CSS v4**         | Utility-first, styling cepat tanpa file CSS terpisah                          |
| **Supabase**                | Backend-as-a-Service: database Postgres, auth, RLS — gratis untuk prototyping |
| **@supabase/ssr**           | Cookie-based session management untuk Next.js App Router                      |

### Arsitektur

```
Client Components ──fetch()──> /api/* (REST API, JSON) ──> Supabase
                                   │
                              @supabase/ssr cookie-based auth
```

Tidak ada server action atau akses Supabase langsung dari UI. Semua komunikasi data melalui REST API di `/api/*` dengan format JSON. Middleware Edge melindungi rute yang membutuhkan autentikasi.

---

## REST API

| Method | Path                        | Auth | Deskripsi                                                  |
| ------ | --------------------------- | ---- | ---------------------------------------------------------- |
| POST   | `/api/auth/register`        | ✗    | Daftar staf baru                                           |
| POST   | `/api/auth/login`           | ✗    | Login (set session cookie)                                 |
| POST   | `/api/auth/logout`          | ✓    | Hapus session                                              |
| GET    | `/api/auth/me`              | ✓    | Profile staf saat ini                                      |
| GET    | `/api/bookings`             | ✓    | List booking (filter, search, pagination via query params) |
| POST   | `/api/bookings`             | ✓    | Buat booking baru                                          |
| GET    | `/api/bookings/[id]`        | ✓    | Detail booking                                             |
| PUT    | `/api/bookings/[id]`        | ✓    | Update booking (hanya admin atau pemilik)                  |
| DELETE | `/api/bookings/[id]`        | ✓    | Hapus booking (hanya admin atau pemilik)                   |
| PATCH  | `/api/bookings/[id]/status` | ✓    | Ubah status (validasi flow)                                |
| GET    | `/api/packages`             | ✓    | List paket wisata                                          |
| POST   | `/api/packages`             | ✓    | Buat paket (admin only)                                    |
| PUT    | `/api/packages/[id]`        | ✓    | Update paket (admin only)                                  |
| DELETE | `/api/packages/[id]`        | ✓    | Hapus paket (admin only)                                   |

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
- [x] Role staf: admin dan staff — disimpan di tabel `staff`

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

**Paket Wisata**

- [x] CRUD paket wisata (admin: semua; staff: read-only)
- [x] Tabel paket dengan daftar, harga, kapasitas
- [x] Dropdown pemilihan paket di form booking (auto-fill harga)
- [x] Validasi kapasitas paket sebelum booking (menghitung all confirmed bookings)

**Audit Log**

- [x] Riwayat siapa membuat/mengubah/menghapus booking
- [x] Catat perubahan sebelum/sesudah tiap update
- [x] Log otomatis untuk tiap transisi status

**Role & Akses**

- [x] Admin: akses penuh ke semua fitur termasuk CRUD paket
- [x] Staff: hanya bisa edit/hapus booking milik sendiri
- [x] Status change: admin bisa ubah status booking siapa pun, staff hanya booking sendiri

**Lain-lain**

- [x] Validasi input sisi server (peserta ≥ 1, harga ≥ 0, tanggal tidak lampau, kontak wajib)
- [x] Pagination (20 per halaman)
- [x] Export daftar ke CSV
- [x] Tampilan responsive (mobile-friendly)

### ✅ Selesai

**Testing**

- [x] Unit test untuk utils (formatCurrency, formatDate, dll)
- [x] Unit test untuk validasi booking
- [x] Integration test (API endpoints via HTTP)
- [x] End-to-end test (Playwright — register, booking, status)

**CI/CD**

- [x] GitHub Actions CI (type-check + lint + unit test tiap push/PR)
- [x] Deploy preview di Vercel dari PR

link domain deploy:https://travelku-seven.vercel.app/auth/login

---

## Asumsi & Keputusan Teknis

1. **Session dikelola via cookie (`@supabase/ssr`), bukan JWT di localStorage.** Cookie lebih aman dari XSS dan middleware bisa membaca cookie langsung tanpa JavaScript.

2. **Email confirmation di Supabase harus dinonaktifkan** agar registrasi langsung login tanpa verifikasi email. Jika tidak dinonaktifkan, setelah registrasi user harus login manual.

3. **RLS (Row-Level Security) aktif** di semua tabel. Policies mengizinkan semua staf terautentikasi untuk membaca/menulis. Anon key tidak bisa mengakses data apa pun.

4. **Tidak menggunakan Server Actions.** Seluruh komunikasi FE–BE melalui REST API (`/api/*`) dengan format JSON, agar arsitektur lebih jelas dan mudah diganti frontend-nya di masa depan.

5. **Pagination 20 per halaman.** Ukuran halaman bisa diubah via query parameter `page_size` (maks 100).

6. **Tidak ada test framework.** Belum ada unit test atau integration test. Disarankan menambahkan Vitest + Playwright untuk proyek production.

---

## Struktur File Penting

```
supabase/migrations/0002_add_packages_audit_roles.sql   -- Semua migrasi DB
lib/types.ts                                             -- Shared TypeScript types
lib/helpers/audit.ts                                     -- Audit log + capacity check + role check
lib/api/client.ts                                        -- Fetch wrapper (error handling, 401 redirect)
lib/supabase/server.ts                                   -- Supabase client untuk API routes
app/api/bookings/route.ts                                -- GET (list) / POST booking
app/api/bookings/[id]/route.ts                           -- GET / PUT / DELETE booking
app/api/bookings/[id]/status/route.ts                    -- PATCH status booking
app/api/packages/route.ts                                -- GET (list) / POST package
app/api/packages/[id]/route.ts                           -- GET / PUT / DELETE package
app/api/auth/*                                           -- Login, register, logout, me
middleware.ts                                            -- Edge Middleware (auth guard)
app/page.tsx                                             -- Dashboard utama (tabs: Pemesanan / Paket Wisata)
components/bookings/                                     -- Booking UI (table, form, filters, etc.)
components/packages/                                     -- Package UI (tab, form dialog, etc.)
```
