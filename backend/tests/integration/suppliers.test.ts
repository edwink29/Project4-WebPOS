import { describe, it, expect, afterAll, beforeAll } from "bun:test";
import {
  createTestApp,
  testRequest,
  cleanupTestData,
  getAuthToken,
  TEST_PREFIX,
} from "../../src/utils/test-helpers";

const app = createTestApp();

let createdSupplierId: string;
let adminToken: string;

describe("Supplier Routes — /api/suppliers", () => {
  beforeAll(async () => {
    adminToken = await getAuthToken(app, "ADMIN");
  });

  afterAll(async () => {
    await cleanupTestData();
  });

  // =====================================================
  // CREATE
  // =====================================================
  describe("POST /api/suppliers", () => {
    it("harus berhasil membuat supplier baru (201)", async () => {
      const res = await testRequest(app, "POST", "/api/suppliers", {
        body: {
          name: `${TEST_PREFIX}PT Sumber Makmur`,
          phone: "021-5551234",
          address: "Jl. Industri No. 10",
        },
        token: adminToken,
      });

      expect(res.status).toBe(201);
      const data = (await res.json()) as {
        id: string;
        name: string;
        phone: string;
        address: string;
      };
      expect(data.id).toBeDefined();
      expect(data.name).toBe(`${TEST_PREFIX}PT Sumber Makmur`);
      expect(data.phone).toBe("021-5551234");
      createdSupplierId = data.id;
    });

    it("harus berhasil membuat supplier tanpa phone & address (201)", async () => {
      const res = await testRequest(app, "POST", "/api/suppliers", {
        body: {
          name: `${TEST_PREFIX}Supplier Minimal`,
        },
        token: adminToken,
      });

      expect(res.status).toBe(201);
      const data = (await res.json()) as { id: string; name: string };
      expect(data.id).toBeDefined();
    });
  });

  // =====================================================
  // GET ALL
  // =====================================================
  describe("GET /api/suppliers", () => {
    it("harus mengembalikan array supplier", async () => {
      const res = await testRequest(app, "GET", "/api/suppliers", {
        token: adminToken,
      });

      expect(res.status).toBe(200);
      const data = (await res.json()) as Array<{ id: string }>;
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThanOrEqual(1);
    });
  });

  // =====================================================
  // GET BY ID
  // =====================================================
  describe("GET /api/suppliers/:id", () => {
    it("harus mengembalikan supplier by ID", async () => {
      const res = await testRequest(
        app,
        "GET",
        `/api/suppliers/${createdSupplierId}`,
        { token: adminToken },
      );

      expect(res.status).toBe(200);
      const data = (await res.json()) as { id: string; name: string };
      expect(data.id).toBe(createdSupplierId);
      expect(data.name).toBe(`${TEST_PREFIX}PT Sumber Makmur`);
    });

    it("harus mengembalikan 404 jika supplier tidak ditemukan", async () => {
      const fakeId = "00000000-0000-0000-0000-000000000000";
      const res = await testRequest(app, "GET", `/api/suppliers/${fakeId}`, {
        token: adminToken,
      });

      expect(res.status).toBe(404);
      const data = (await res.json()) as { message: string };
      expect(data.message).toBe("Supplier tidak ditemukan");
    });
  });

  // =====================================================
  // UPDATE
  // =====================================================
  describe("PUT /api/suppliers/:id", () => {
    it("harus berhasil update supplier", async () => {
      const res = await testRequest(
        app,
        "PUT",
        `/api/suppliers/${createdSupplierId}`,
        {
          body: {
            name: `${TEST_PREFIX}PT Sumber Updated`,
            phone: "021-9998877",
            address: "Jl. Industri No. 20",
          },
          token: adminToken,
        },
      );

      expect(res.status).toBe(200);
      const data = (await res.json()) as { id: string; name: string };
      expect(data.name).toBe(`${TEST_PREFIX}PT Sumber Updated`);
    });
  });

  // =====================================================
  // DELETE
  // =====================================================
  describe("DELETE /api/suppliers/:id", () => {
    it("harus berhasil menghapus supplier", async () => {
      const res = await testRequest(
        app,
        "DELETE",
        `/api/suppliers/${createdSupplierId}`,
        { token: adminToken },
      );

      expect(res.status).toBe(200);
      const data = (await res.json()) as { message: string };
      expect(data.message).toBe("Supplier berhasil dihapus");
    });
  });
});
