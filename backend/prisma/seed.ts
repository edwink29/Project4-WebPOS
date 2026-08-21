import { prisma } from "../src/lib/db/prisma"; // Sesuaikan path ini dengan letak file prisma.ts Anda

async function main() {
  const hashedPassword = await Bun.password.hash("admin123");

  const admin = await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      password: hashedPassword,
      name: "Administrator Toko",
      role: "ADMIN",
    },
  });

  console.log("✅ Seed admin berhasil:", admin.username);
}

main()
  .catch((e) => {
    console.error("❌ Gagal seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
