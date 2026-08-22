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
let testSupplierId: string;
let createdPurchaseId: string;
let adminToken: string;

const INITIAL_STOCK = 5;
const INITIAL_BUY_PRICE = 8000;

describe("Purchase Routes — /api/purchases", () => {
  // Setup: buat category, product, dan supplier sebagai dependency
  beforeAll(async () => {
    adminToken = await getAuthToken(app, "ADMIN");

    // Buat kategori
    const catRes = await testRequest(app, "POST", "/api/categories", {
      body: { name: `${TEST_PREFIX}Kategori Purchase Test` },
      token: adminToken,
    });
    const catData = (await catRes.json()) as { id: string };
    testCategoryId = catData.id;

    // Buat produk dengan stok awal 5
    const prodRes = await testRequest(app, "POST", "/api/products", {
      body: {
        name: `${TEST_PREFIX}Produk Purchase Test`,
        categoryId: testCategoryId,
        stock: INITIAL_STOCK,
        buyPrice: INITIAL_BUY_PRICE,
        sellPrice: 12000,
      },
      token: adminToken,
    });
    const prodData = (await prodRes.json()) as { id: string };
    testProductId = prodData.id;

    // Buat supplier
    const supRes = await testRequest(app, "POST", "/api/suppliers", {
      body: {
        name: `${TEST_PREFIX}Supplier Purchase Test`,
        phone: "021-1112233",
      },
      token: adminToken,
    });
    const supData = (await supRes.json()) as { id: string };
    testSupplierId = supData.id;
  });

  afterAll(async () => {
    await cleanupTestData();
  });

  // =====================================================
  // CREATE PURCHASE
  // =====================================================
  describe("POST /api/purchases", () => {
    it("harus berhasil membuat purchase dan stok bertambah (201)", async () => {
      const newBuyPrice = 7500;
      const quantity = 10;

      const res = await testRequest(app, "POST", "/api/purchases", {
        body: {
          supplierId: testSupplierId,
          items: [
            {
              productId: testProductId,
              quantity,
              buyPrice: newBuyPrice,
            },
          ],
        },
        token: adminToken,
      });

      expect(res.status).toBe(201);
      const data = (await res.json()) as {
        id: string;
        totalAmount: number;
        items: Array<{
          productId: string;
          quantity: number;
          buyPrice: number;
        }>;
      };

      expect(data.id).toBeDefined();
      expect(data.totalAmount).toBe(newBuyPrice * quantity); // 7500 * 10 = 75000
      expect(data.items).toHaveLength(1);
      expect(data.items[0]!.quantity).toBe(quantity);
      expect(data.items[0]!.buyPrice).toBe(newBuyPrice);
      createdPurchaseId = data.id;

      // Verifikasi stok bertambah di database
      const product = await prisma.product.findUnique({
        where: { id: testProductId },
      });
      expect(product!.stock).toBe(INITIAL_STOCK + quantity); // 5 + 10 = 15

      // Verifikasi harga beli ter-update ke harga terbaru
      expect(product!.buyPrice).toBe(newBuyPrice);
    });

    it("harus gagal jika supplier tidak ditemukan (400)", async () => {
      const res = await testRequest(app, "POST", "/api/purchases", {
        body: {
          supplierId: "00000000-0000-0000-0000-000000000000",
          items: [
            {
              productId: testProductId,
              quantity: 1,
              buyPrice: 5000,
            },
          ],
        },
        token: adminToken,
      });

      expect(res.status).toBe(400);
      const data = (await res.json()) as { message: string };
      expect(data.message).toBe("Supplier tidak ditemukan");
    });

    it("harus gagal jika produk tidak ditemukan (400)", async () => {
      const res = await testRequest(app, "POST", "/api/purchases", {
        body: {
          supplierId: testSupplierId,
          items: [
            {
              productId: "00000000-0000-0000-0000-000000000000",
              quantity: 1,
              buyPrice: 5000,
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
  // GET ALL PURCHASES
  // =====================================================
  describe("GET /api/purchases", () => {
    it("harus mengembalikan array purchase dengan relasi supplier & items", async () => {
      const res = await testRequest(app, "GET", "/api/purchases", {
        token: adminToken,
      });

      expect(res.status).toBe(200);
      const data = (await res.json()) as Array<{
        id: string;
        supplier: { name: string };
        items: Array<{ product: { name: string } }>;
      }>;
      expect(Array.isArray(data)).toBe(true);

      // Cek purchase test ada
      const testPurchase = data.find((p) => p.id === createdPurchaseId);
      expect(testPurchase).toBeDefined();
      expect(testPurchase!.supplier).toBeDefined();
      expect(testPurchase!.items.length).toBeGreaterThanOrEqual(1);
      expect(testPurchase!.items[0]!.product).toBeDefined();
    });
  });

  // =====================================================
  // GET PURCHASE BY ID
  // =====================================================
  describe("GET /api/purchases/:id", () => {
    it("harus mengembalikan purchase by ID", async () => {
      const res = await testRequest(
        app,
        "GET",
        `/api/purchases/${createdPurchaseId}`,
        { token: adminToken },
      );

      expect(res.status).toBe(200);
      const data = (await res.json()) as {
        id: string;
        totalAmount: number;
        supplier: { name: string };
        items: Array<{ productId: string }>;
      };
      expect(data.id).toBe(createdPurchaseId);
      expect(data.totalAmount).toBe(75000);
      expect(data.supplier).toBeDefined();
      expect(data.items).toHaveLength(1);
    });

    it("harus mengembalikan 404 jika purchase tidak ditemukan", async () => {
      const fakeId = "00000000-0000-0000-0000-000000000000";
      const res = await testRequest(app, "GET", `/api/purchases/${fakeId}`, {
        token: adminToken,
      });

      expect(res.status).toBe(404);
      const data = (await res.json()) as { message: string };
      expect(data.message).toBe("Transaksi pembelian tidak ditemukan");
    });
  });
});
