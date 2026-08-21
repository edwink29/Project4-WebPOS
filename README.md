# 🛒 Point of Sale (POS) & Dashboard System

Aplikasi Point of Sale (POS) full-stack dengan **Bun + Elysia.js** (Backend), **React + TypeScript + TailwindCSS** (Frontend), dan **PostgreSQL + Prisma ORM** (Database).

---

## Panduan Menjalankan Project

### 1. Clone Repositori
```bash
git clone <URL_REPOSITORI_ANDA>
cd project4-Web-Point-of-Sale
```

### 2. Setup Database PostgreSQL
Pastikan PostgreSQL lokal sudah aktif, lalu buat database baru bernama `pos_db`:
```sql
CREATE DATABASE pos_db;
```

---

### 3. Setup & Jalankan Backend

Buka terminal di root project:

```bash
cd backend

# 1. Install dependencies
bun install

# 2. Salin template environment file
cp .env.example .env
# (Di Windows PowerShell jika cp tidak jalan, gunakan: copy .env.example .env)

# 3. Sesuaikan isi backend/.env dengan password PostgreSQL lokal Anda:
# DATABASE_URL="postgresql://postgres:password_kamu@localhost:5432/pos_db?schema=public"
# JWT_SECRET="super-secret-key-pos"

# 4. Jalankan migrasi database & seed akun admin bawaan
bunx prisma migrate dev --name init
bun run ./prisma/seed.ts

# 5. Jalankan server backend (berjalan di http://localhost:3000)
bun run dev
```

---

### 4. Setup & Jalankan Frontend

Buka **terminal baru**:

```bash
cd frontend

# 1. Install dependencies
bun install

# 2. Salin template environment file
cp .env.example .env
# (Di Windows PowerShell: copy .env.example .env)

# 3. Pastikan isi frontend/.env mengarah ke backend Anda:
# Untuk development lokal:
# VITE_API_BASE_URL=http://localhost:3000/api

# 4. Jalankan server frontend (berjalan di http://localhost:5173)
bun run dev
```

Buka browser Anda di **`http://localhost:5173`**.

---

## Akun Login Default

| Role | Username | Password |
|---|---|---|
| **Admin** | `admin` | `admin123` |

---

## Menjalankan Testing (Bun Test)

Untuk menjalankan seluruh pengujian **Unit Testing** dan **Integration Testing** (57 test cases):

```bash
cd backend
bun test
```

> **Detail Test:**
> - `bun test tests/unit` : Menguji fungsi utilitas, kalkulasi transaksi, dan validasi auth.
> - `bun test tests/integration` : Menguji seluruh endpoint API langsung terhadap database PostgreSQL.

---

## 🌐 Catatan Deployment (Production)

- **Backend**: Dapat di-deploy di **Railway / Render** dengan build command `bun install` dan start command `bun start` (pastikan set `DATABASE_URL` dan `JWT_SECRET` di environment variables).
- **Frontend**: Dapat di-deploy di **Vercel** (sudah dilengkapi file [`vercel.json`](file:///d:/Learn%20Code/Magang/backup/project4-Web-Point-of-Sale/frontend/vercel.json) untuk handling SPA routing). Set `VITE_API_BASE_URL` di Vercel menuju URL backend production Anda.
