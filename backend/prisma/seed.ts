import { prisma } from "../src/lib/db/prisma";

async function main() {
  // 1. Seed Admin
  const hashedAdminPassword = await Bun.password.hash("admin123");
  const admin = await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      password: hashedAdminPassword,
      name: "Administrator Toko",
      role: "ADMIN",
    },
  });
  console.log("✅ Seed admin berhasil:", admin.username);

  // 2. Seed Kasir
  const hashedKasirPassword = await Bun.password.hash("kasir123");
  const kasir = await prisma.user.upsert({
    where: { username: "kasir1" },
    update: {},
    create: {
      username: "kasir1",
      password: hashedKasirPassword,
      name: "Kasir Toko",
      role: "CASHIER",
    },
  });
  console.log("✅ Seed kasir berhasil:", kasir.username);
}

main()
  .catch((e) => {
    console.error("❌ Gagal seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
