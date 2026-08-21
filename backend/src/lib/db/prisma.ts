import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

// 1. Buat connection pool menggunakan pg
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// 2. Pasang ke adapter Prisma
const adapter = new PrismaPg(pool);

// 3. Masukkan adapter ke constructor PrismaClient
export const prisma = new PrismaClient({ adapter });
