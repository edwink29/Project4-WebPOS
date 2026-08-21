import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { apiRoutes } from "../routes";
import { prisma } from "../lib/db/prisma";

/**
 * Prefix unik untuk semua data test agar mudah diidentifikasi dan di-cleanup.
 */
export const TEST_PREFIX = "__TEST__";

/**
 * Membuat instance Elysia app yang siap untuk testing.
 * Menggunakan app.handle() tanpa perlu listen() sehingga tidak ada port conflict.
 */
export function createTestApp() {
  return new Elysia().use(cors()).use(apiRoutes);
}

export type TestApp = ReturnType<typeof createTestApp>;

/**
 * Helper untuk mengirim request ke test app.
 * Mengembalikan Response object langsung tanpa tipe `any`.
 */
export async function testRequest(
  app: TestApp,
  method: string,
  path: string,
  options?: {
    body?: Record<string, unknown>;
    token?: string;
  },
): Promise<Response> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (options?.token) {
    headers["Authorization"] = `Bearer ${options.token}`;
  }

  const requestInit: RequestInit = {
    method,
    headers,
  };

  if (options?.body) {
    requestInit.body = JSON.stringify(options.body);
  }

  const url = `http://localhost${path}`;
  const request = new Request(url, requestInit);

  return app.handle(request);
}

/**
 * Register user test dan login untuk mendapatkan JWT token.
 */
export async function getAuthToken(
  app: TestApp,
  role: "ADMIN" | "CASHIER" = "ADMIN",
): Promise<string> {
  const username = `${TEST_PREFIX}user_${role.toLowerCase()}_${Date.now()}`;

  // Register
  await testRequest(app, "POST", "/api/auth/register", {
    body: {
      username,
      password: "testpassword123",
      name: `${TEST_PREFIX}Test User ${role}`,
      role,
    },
  });

  // Login
  const loginRes = await testRequest(app, "POST", "/api/auth/login", {
    body: {
      username,
      password: "testpassword123",
    },
  });

  const loginData = (await loginRes.json()) as { token: string };
  return loginData.token;
}

/**
 * Membersihkan semua data test dari database.
 * Urutan delete mengikuti foreign key constraints.
 */
export async function cleanupTestData() {
  // 1. Hapus Orders yang punya items dengan produk test / customer test
  const testOrders = await prisma.order.findMany({
    where: {
      OR: [
        { customer: { name: { startsWith: TEST_PREFIX } } },
        { items: { some: { product: { name: { startsWith: TEST_PREFIX } } } } },
      ],
    },
  });
  for (const order of testOrders) {
    await prisma.order.delete({ where: { id: order.id } }).catch(() => {});
  }

  // 2. Hapus Purchases yang punya items dengan produk test / supplier test
  const testPurchases = await prisma.purchase.findMany({
    where: {
      OR: [
        { supplier: { name: { startsWith: TEST_PREFIX } } },
        {
          items: { some: { product: { name: { startsWith: TEST_PREFIX } } } },
        },
      ],
    },
  });
  for (const purchase of testPurchases) {
    await prisma.purchase
      .delete({ where: { id: purchase.id } })
      .catch(() => {});
  }

  // 3. Hapus Products test
  await prisma.product
    .deleteMany({
      where: { name: { startsWith: TEST_PREFIX } },
    })
    .catch(() => {});

  // 4. Hapus Categories test
  await prisma.category
    .deleteMany({
      where: { name: { startsWith: TEST_PREFIX } },
    })
    .catch(() => {});

  // 5. Hapus Customers test
  await prisma.customer
    .deleteMany({
      where: { name: { startsWith: TEST_PREFIX } },
    })
    .catch(() => {});

  // 6. Hapus Suppliers test
  await prisma.supplier
    .deleteMany({
      where: { name: { startsWith: TEST_PREFIX } },
    })
    .catch(() => {});

  // 7. Hapus Users test
  await prisma.user
    .deleteMany({
      where: { username: { startsWith: TEST_PREFIX } },
    })
    .catch(() => {});
}
