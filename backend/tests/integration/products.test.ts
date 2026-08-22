import { describe, it, expect, afterAll, beforeAll } from "bun:test";
import {
  createTestApp,
  testRequest,
  cleanupTestData,
  getAuthToken,
  TEST_PREFIX,
} from "../../src/utils/test-helpers";

const app = createTestApp();

// Dependency: kita perlu kategori untuk membuat produk
let testCategoryId: string;
let createdProductId: string;
let adminToken: string;

describe("Product Routes — /api/products", () => {
  // Setup: buat kategori test sebagai dependency
  beforeAll(async () => {
    adminToken = await getAuthToken(app, "ADMIN");

    const res = await testRequest(app, "POST", "/api/categories", {
      body: { name: `${TEST_PREFIX}Kategori Produk Test` },
      token: adminToken,
    });
    const data = (await res.json()) as { id: string };
    testCategoryId = data.id;
  });

  afterAll(async () => {
    await cleanupTestData();
  });

  // =====================================================
  // CREATE
  // =====================================================
  describe("POST /api/products", () => {
    it("harus berhasil membuat produk baru (201)", async () => {
      const res = await testRequest(app, "POST", "/api/products", {
        body: {
          name: `${TEST_PREFIX}Laptop Asus`,
          categoryId: testCategoryId,
          stock: 10,
          buyPrice: 5000000,
          sellPrice: 6500000,
        },
        token: adminToken,
      });

      expect(res.status).toBe(201);
      const data = (await res.json()) as {
        id: string;
        name: string;
        stock: number;
        buyPrice: number;
        sellPrice: number;
        categoryId: string;
      };
      expect(data.id).toBeDefined();
      expect(data.name).toBe(`${TEST_PREFIX}Laptop Asus`);
      expect(data.stock).toBe(10);
      expect(data.buyPrice).toBe(5000000);
      expect(data.sellPrice).toBe(6500000);
      expect(data.categoryId).toBe(testCategoryId);
      createdProductId = data.id;
    });

    it("harus gagal jika body tidak valid (422)", async () => {
      const res = await testRequest(app, "POST", "/api/products", {
        body: {
          name: "", // minLength: 1
          categoryId: testCategoryId,
          stock: -1, // minimum: 0
          buyPrice: 0,
          sellPrice: 0,
        },
        token: adminToken,
      });

      // Elysia validation error
      expect(res.status).toBe(422);
    });
  });

  // =====================================================
  // GET ALL
  // =====================================================
  describe("GET /api/products", () => {
    it("harus mengembalikan array produk dengan relasi category", async () => {
      const res = await testRequest(app, "GET", "/api/products", {
        token: adminToken,
      });

      expect(res.status).toBe(200);
      const data = (await res.json()) as Array<{
        id: string;
        category: { id: string; name: string };
      }>;
      expect(Array.isArray(data)).toBe(true);

      // Cek produk test ada dan include relasi category
      const testProduct = data.find((p) => p.id === createdProductId);
      expect(testProduct).toBeDefined();
      expect(testProduct!.category).toBeDefined();
      expect(testProduct!.category.id).toBe(testCategoryId);
    });
  });

  // =====================================================
  // GET BY ID
  // =====================================================
  describe("GET /api/products/:id", () => {
    it("harus mengembalikan produk by ID", async () => {
      const res = await testRequest(
        app,
        "GET",
        `/api/products/${createdProductId}`,
        { token: adminToken },
      );

      expect(res.status).toBe(200);
      const data = (await res.json()) as {
        id: string;
        name: string;
        category: { id: string };
      };
      expect(data.id).toBe(createdProductId);
      expect(data.name).toBe(`${TEST_PREFIX}Laptop Asus`);
      expect(data.category).toBeDefined();
    });

    it("harus mengembalikan 404 jika produk tidak ditemukan", async () => {
      const fakeId = "00000000-0000-0000-0000-000000000000";
      const res = await testRequest(app, "GET", `/api/products/${fakeId}`, {
        token: adminToken,
      });

      expect(res.status).toBe(404);
      const data = (await res.json()) as { message: string };
      expect(data.message).toBe("Produk tidak ditemukan");
    });
  });

  // =====================================================
  // UPDATE
  // =====================================================
  describe("PUT /api/products/:id", () => {
    it("harus berhasil update produk", async () => {
      const res = await testRequest(
        app,
        "PUT",
        `/api/products/${createdProductId}`,
        {
          body: {
            name: `${TEST_PREFIX}Laptop Asus Updated`,
            categoryId: testCategoryId,
            stock: 15,
            buyPrice: 5200000,
            sellPrice: 6800000,
          },
          token: adminToken,
        },
      );

      expect(res.status).toBe(200);
      const data = (await res.json()) as {
        name: string;
        stock: number;
        sellPrice: number;
      };
      expect(data.name).toBe(`${TEST_PREFIX}Laptop Asus Updated`);
      expect(data.stock).toBe(15);
      expect(data.sellPrice).toBe(6800000);
    });
  });

  // =====================================================
  // DELETE
  // =====================================================
  describe("DELETE /api/products/:id", () => {
    it("harus berhasil menghapus produk", async () => {
      const res = await testRequest(
        app,
        "DELETE",
        `/api/products/${createdProductId}`,
        { token: adminToken },
      );

      expect(res.status).toBe(200);
      const data = (await res.json()) as { message: string };
      expect(data.message).toBe("Produk berhasil dihapus");
    });
  });
});
