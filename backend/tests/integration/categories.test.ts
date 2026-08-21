import { describe, it, expect, afterAll, beforeAll } from "bun:test";
import {
  createTestApp,
  testRequest,
  cleanupTestData,
  getAuthToken,
  TEST_PREFIX,
} from "../../src/utils/test-helpers";

const app = createTestApp();

// Variabel untuk menyimpan ID data test yang dibuat
let createdCategoryId: string;
let adminToken: string;

describe("Category Routes — /api/categories", () => {
  beforeAll(async () => {
    adminToken = await getAuthToken(app, "ADMIN");
  });

  afterAll(async () => {
    await cleanupTestData();
  });

  // =====================================================
  // CREATE
  // =====================================================
  describe("POST /api/categories", () => {
    it("harus berhasil membuat kategori baru (201)", async () => {
      const res = await testRequest(app, "POST", "/api/categories", {
        body: {
          name: `${TEST_PREFIX}Elektronik`,
        },
        token: adminToken,
      });

      expect(res.status).toBe(201);
      const data = (await res.json()) as {
        id: string;
        name: string;
        createdAt: string;
        updatedAt: string;
      };
      expect(data.id).toBeDefined();
      expect(data.name).toBe(`${TEST_PREFIX}Elektronik`);
      createdCategoryId = data.id;
    });
  });

  // =====================================================
  // GET ALL
  // =====================================================
  describe("GET /api/categories", () => {
    it("harus mengembalikan array kategori", async () => {
      const res = await testRequest(app, "GET", "/api/categories", {
        token: adminToken,
      });

      expect(res.status).toBe(200);
      const data = (await res.json()) as Array<{ id: string; name: string }>;
      expect(Array.isArray(data)).toBe(true);

      // Pastikan kategori test ada di list
      const testCat = data.find((c) => c.id === createdCategoryId);
      expect(testCat).toBeDefined();
      expect(testCat!.name).toBe(`${TEST_PREFIX}Elektronik`);
    });
  });

  // =====================================================
  // UPDATE
  // =====================================================
  describe("PUT /api/categories/:id", () => {
    it("harus berhasil update nama kategori", async () => {
      const res = await testRequest(
        app,
        "PUT",
        `/api/categories/${createdCategoryId}`,
        {
          body: {
            name: `${TEST_PREFIX}Elektronik Updated`,
          },
          token: adminToken,
        },
      );

      expect(res.status).toBe(200);
      const data = (await res.json()) as { id: string; name: string };
      expect(data.name).toBe(`${TEST_PREFIX}Elektronik Updated`);
    });
  });

  // =====================================================
  // DELETE
  // =====================================================
  describe("DELETE /api/categories/:id", () => {
    it("harus berhasil menghapus kategori", async () => {
      const res = await testRequest(
        app,
        "DELETE",
        `/api/categories/${createdCategoryId}`,
        { token: adminToken },
      );

      expect(res.status).toBe(200);
    });
  });
});
