import { describe, it, expect, afterAll } from "bun:test";
import {
  createTestApp,
  testRequest,
  cleanupTestData,
  TEST_PREFIX,
} from "../../src/utils/test-helpers";

const app = createTestApp();

let createdCustomerId: string;

describe("Customer Routes — /api/customers", () => {
  afterAll(async () => {
    await cleanupTestData();
  });

  // =====================================================
  // CREATE
  // =====================================================
  describe("POST /api/customers", () => {
    it("harus berhasil membuat customer baru (201)", async () => {
      const res = await testRequest(app, "POST", "/api/customers", {
        body: {
          name: `${TEST_PREFIX}Budi Santoso`,
          phone: "081234567890",
          address: "Jl. Test No. 1",
        },
      });

      expect(res.status).toBe(201);
      const data = (await res.json()) as {
        id: string;
        name: string;
        phone: string;
        address: string;
      };
      expect(data.id).toBeDefined();
      expect(data.name).toBe(`${TEST_PREFIX}Budi Santoso`);
      expect(data.phone).toBe("081234567890");
      expect(data.address).toBe("Jl. Test No. 1");
      createdCustomerId = data.id;
    });

    it("harus berhasil membuat customer tanpa phone & address (201)", async () => {
      const res = await testRequest(app, "POST", "/api/customers", {
        body: {
          name: `${TEST_PREFIX}Customer Tanpa Detail`,
        },
      });

      expect(res.status).toBe(201);
      const data = (await res.json()) as { id: string; name: string };
      expect(data.id).toBeDefined();
      expect(data.name).toBe(`${TEST_PREFIX}Customer Tanpa Detail`);
    });
  });

  // =====================================================
  // GET ALL
  // =====================================================
  describe("GET /api/customers", () => {
    it("harus mengembalikan array customer", async () => {
      const res = await testRequest(app, "GET", "/api/customers");

      expect(res.status).toBe(200);
      const data = (await res.json()) as Array<{ id: string }>;
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThanOrEqual(1);
    });
  });

  // =====================================================
  // GET BY ID
  // =====================================================
  describe("GET /api/customers/:id", () => {
    it("harus mengembalikan customer by ID", async () => {
      const res = await testRequest(
        app,
        "GET",
        `/api/customers/${createdCustomerId}`,
      );

      expect(res.status).toBe(200);
      const data = (await res.json()) as { id: string; name: string };
      expect(data.id).toBe(createdCustomerId);
      expect(data.name).toBe(`${TEST_PREFIX}Budi Santoso`);
    });

    it("harus mengembalikan 404 jika customer tidak ditemukan", async () => {
      const fakeId = "00000000-0000-0000-0000-000000000000";
      const res = await testRequest(
        app,
        "GET",
        `/api/customers/${fakeId}`,
      );

      expect(res.status).toBe(404);
      const data = (await res.json()) as { message: string };
      expect(data.message).toBe("Customer tidak ditemukan");
    });
  });

  // =====================================================
  // UPDATE
  // =====================================================
  describe("PUT /api/customers/:id", () => {
    it("harus berhasil update customer", async () => {
      const res = await testRequest(
        app,
        "PUT",
        `/api/customers/${createdCustomerId}`,
        {
          body: {
            name: `${TEST_PREFIX}Budi Updated`,
            phone: "089876543210",
            address: "Jl. Update No. 2",
          },
        },
      );

      expect(res.status).toBe(200);
      const data = (await res.json()) as {
        id: string;
        name: string;
        phone: string;
      };
      expect(data.name).toBe(`${TEST_PREFIX}Budi Updated`);
      expect(data.phone).toBe("089876543210");
    });
  });

  // =====================================================
  // DELETE
  // =====================================================
  describe("DELETE /api/customers/:id", () => {
    it("harus berhasil menghapus customer", async () => {
      const res = await testRequest(
        app,
        "DELETE",
        `/api/customers/${createdCustomerId}`,
      );

      expect(res.status).toBe(200);
      const data = (await res.json()) as { message: string };
      expect(data.message).toBe("Customer berhasil dihapus");
    });
  });
});
