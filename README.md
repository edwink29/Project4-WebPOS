# 🛒 Point of Sale (POS) & Dashboard System

Aplikasi Point of Sale (POS) full-stack dengan **Bun + Elysia.js** (Backend), **React + TypeScript + TailwindCSS** (Frontend), dan **PostgreSQL + Prisma ORM** (Database).

---

## Panduan Menjalankan Project

### 1. Clone Repositori
```bash
git clone <URL_REPOSITORI_ANDA>
cd project4-Web-Point-of-Sale
```

### 2. Setup Database
Pastikan PostgreSQL sudah aktif, lalu buat database `pos_db`:
```sql
CREATE DATABASE pos_db;
```

---

### 3. Jalankan Backend
Buka terminal dan jalankan:
```bash
cd backend

# 1. Install dependencies
bun install

# 2. Buat file .env (jika belum ada) dan sesuaikan password postgres kamu
# DATABASE_URL="postgresql://postgres:password_kamu@localhost:5432/pos_db?schema=public"
# JWT_SECRET="super-secret-key-pos"

# 3. Migrasi database & isi data awal akun admin
bunx prisma migrate dev --name init
bun run ./prisma/seed.ts

# 4. Jalankan backend server (http://localhost:3000)
bun run dev
```

---

### 4. Jalankan Frontend
Buka terminal baru dan jalankan:
```bash
cd frontend

# 1. Install dependencies
bun install

# 2. Jalankan frontend server (http://localhost:5173)
bun run dev
```

Buka browser di **`http://localhost:5173`**.

---

## Akun Login Default

| Role | Username | Password |
|---|---|---|
| **Admin** | `admin` | `admin123` |

---

## Menjalankan Testing (Bun Test)

Untuk menjalankan **Unit Testing** dan **Integration Testing** (57 test cases):

```bash
cd backend
bun test
```

> **Detail Test:**
> - `bun test tests/unit` : Menguji logika transaksi, kalkulasi stok, dan validasi auth.
> - `bun test tests/integration` : Menguji semua endpoint API langsung ke PostgreSQL.
