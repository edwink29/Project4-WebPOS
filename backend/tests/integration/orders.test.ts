import { describe, it, expect, afterAll, beforeAll } from "bun:test";
import { prisma } from "../../src/lib/db/prisma";
import {
  createTestApp,
  testRequest,
  cleanupTestData,
  getAuthToken,
  TEST_PREFIX,
} from "../../src/utils/test-helpers";

const app = createTestApp();

// Dependency IDs
let testCategoryId: string;
let testProductId: string;
let testCustomerId: string;
let createdOrderId: string;
let adminToken: string;

describe("Order Routes — /api/orders", () => {
  // Setup: buat category, product, dan customer sebagai dependency
  beforeAll(async () => {
    adminToken = await getAuthToken(app, "ADMIN");

    // Buat kategori
    const catRes = await testRequest(app, "POST", "/api/categories", {
      body: { name: `${TEST_PREFIX}Kategori Order Test` },
      token: adminToken,
    });
    const catData = (await catRes.json()) as { id: string };
    testCategoryId = catData.id;

    // Buat produk dengan stok 20
    const prodRes = await testRequest(app, "POST", "/api/products", {
      body: {
        name: `${TEST_PREFIX}Produk Order Test`,
        categoryId: testCategoryId,
        stock: 20,
        buyPrice: 10000,
        sellPrice: 15000,
      },
      token: adminToken,
    });
    const prodData = (await prodRes.json()) as { id: string };
    testProductId = prodData.id;

    // Buat customer
    const custRes = await testRequest(app, "POST", "/api/customers", {
      body: {
        name: `${TEST_PREFIX}Customer Order Test`,
        phone: "081111111111",
      },
      token: adminToken,
    });
    const custData = (await custRes.json()) as { id: string };
    testCustomerId = custData.id;
  });

  afterAll(async () => {
    await cleanupTestData();
  });

  // =====================================================
  // CREATE ORDER
  // =====================================================
  describe("POST /api/orders", () => {
    it("harus berhasil membuat order dan stok berkurang (201)", async () => {
      const res = await testRequest(app, "POST", "/api/orders", {
        body: {
          customerId: testCustomerId,
          payment: 50000,
          items: [
            {
              productId: testProductId,
              quantity: 3,
            },
          ],
        },
        token: adminToken,
      });

      expect(res.status).toBe(201);
      const data = (await res.json()) as {
        id: string;
        totalAmount: number;
        payment: number;
        change: number;
        items: Array<{
          productId: string;
          quantity: number;
          sellPrice: number;
          buyPrice: number;
        }>;
      };

      expect(data.id).toBeDefined();
      expect(data.totalAmount).toBe(45000); // 15000 * 3
      expect(data.payment).toBe(50000);
      expect(data.change).toBe(5000); // 50000 - 45000
      expect(data.items).toHaveLength(1);
      expect(data.items[0]!.quantity).toBe(3);
      expect(data.items[0]!.sellPrice).toBe(15000);
      expect(data.items[0]!.buyPrice).toBe(10000);
      createdOrderId = data.id;

      // Verifikasi stok berkurang di database
      const product = await prisma.product.findUnique({
        where: { id: testProductId },
      });
      expect(product!.stock).toBe(17); // 20 - 3
    });

    it("harus berhasil membuat order tanpa customer (umum)", async () => {
      const res = await testRequest(app, "POST", "/api/orders", {
        body: {
          payment: 30000,
          items: [
            {
              productId: testProductId,
              quantity: 2,
            },
          ],
        },
        token: adminToken,
      });

      expect(res.status).toBe(201);
      const data = (await res.json()) as {
        id: string;
        totalAmount: number;
        customerId: string | null;
      };
      expect(data.totalAmount).toBe(30000); // 15000 * 2
      expect(data.customerId).toBeNull();
    });

    it("harus gagal jika stok tidak mencukupi (400)", async () => {
      const res = await testRequest(app, "POST", "/api/orders", {
        body: {
          payment: 999999999,
          items: [
            {
              productId: testProductId,
              quantity: 9999, // Stok pasti tidak cukup
            },
          ],
        },
        token: adminToken,
      });

      expect(res.status).toBe(400);
      const data = (await res.json()) as { message: string };
      expect(data.message).toContain("Stok produk");
      expect(data.message).toContain("tidak mencukupi");
    });

    it("harus gagal jika pembayaran kurang (400)", async () => {
      const res = await testRequest(app, "POST", "/api/orders", {
        body: {
          payment: 1, // Pembayaran terlalu kecil
          items: [
            {
              productId: testProductId,
              quantity: 1,
            },
          ],
        },
        token: adminToken,
      });

      expect(res.status).toBe(400);
      const data = (await res.json()) as { message: string };
      expect(data.message).toContain("Uang pembayaran kurang");
    });

    it("harus gagal jika produk tidak ditemukan (400)", async () => {
      const res = await testRequest(app, "POST", "/api/orders", {
        body: {
          payment: 100000,
          items: [
            {
              productId: "00000000-0000-0000-0000-000000000000",
              quantity: 1,
            },
          ],
        },
        token: adminToken,
      });

      expect(res.status).toBe(400);
      const data = (await res.json()) as { message: string };
      expect(data.message).toContain("tidak ditemukan");
    });
  });

  // =====================================================
  // GET ALL ORDERS
  // =====================================================
  describe("GET /api/orders", () => {
    it("harus mengembalikan array order dengan relasi customer & items", async () => {
      const res = await testRequest(app, "GET", "/api/orders", {
        token: adminToken,
      });

      expect(res.status).toBe(200);
      const data = (await res.json()) as Array<{
        id: string;
        customer: { name: string } | null;
        items: Array<{
          product: { name: string };
        }>;
      }>;
      expect(Array.isArray(data)).toBe(true);

      // Cek order test ada
      const testOrder = data.find((o) => o.id === createdOrderId);
      expect(testOrder).toBeDefined();
      expect(testOrder!.customer).toBeDefined();
      expect(testOrder!.items.length).toBeGreaterThanOrEqual(1);
      expect(testOrder!.items[0]!.product).toBeDefined();
    });
  });

  // =====================================================
  // GET ORDER BY ID
  // =====================================================
  describe("GET /api/orders/:id", () => {
    it("harus mengembalikan order by ID", async () => {
      const res = await testRequest(
        app,
        "GET",
        `/api/orders/${createdOrderId}`,
        { token: adminToken },
      );

      expect(res.status).toBe(200);
      const data = (await res.json()) as {
        id: string;
        totalAmount: number;
        customer: { name: string };
        items: Array<{ productId: string }>;
      };
      expect(data.id).toBe(createdOrderId);
      expect(data.totalAmount).toBe(45000);
      expect(data.customer).toBeDefined();
      expect(data.items).toHaveLength(1);
    });

    it("harus mengembalikan 404 jika order tidak ditemukan", async () => {
      const fakeId = "00000000-0000-0000-0000-000000000000";
      const res = await testRequest(app, "GET", `/api/orders/${fakeId}`, {
        token: adminToken,
      });

      expect(res.status).toBe(404);
      const data = (await res.json()) as { message: string };
      expect(data.message).toBe("Transaksi tidak ditemukan");
    });
  });
});
