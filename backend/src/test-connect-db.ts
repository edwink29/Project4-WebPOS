import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

// 1. Buat connection pool menggunakan pg
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// 2. Hubungkan pool ke adapter Prisma
const adapter = new PrismaPg(pool);

// 3. Masukkan adapter ke dalam PrismaClient
const prisma = new PrismaClient({ adapter });

async function main() {
  try {
    await prisma.$connect();

    // 💡 TULIS BARIS INI untuk memaksa query nyata ke PostgreSQL:
    await prisma.$queryRaw`SELECT 1`;

    console.log("✅ HORE! Database berhasil terhubung!");
  } catch (error) {
    console.error("❌ GAGAL terhubung ke database:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
