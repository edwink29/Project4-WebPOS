import { describe, it, expect, afterAll, beforeAll } from "bun:test";
import {
  createTestApp,
  testRequest,
  cleanupTestData,
  TEST_PREFIX,
} from "../../src/utils/test-helpers";

const app = createTestApp();
const testUsername = `${TEST_PREFIX}auth_user_${Date.now()}`;
const testPassword = "password123456";

describe("Auth Routes — /api/auth", () => {
  afterAll(async () => {
    await cleanupTestData();
  });

  // =====================================================
  // REGISTER
  // =====================================================
  describe("POST /api/auth/register", () => {
    it("harus berhasil register user baru (201)", async () => {
      const res = await testRequest(app, "POST", "/api/auth/register", {
        body: {
          username: testUsername,
          password: testPassword,
          name: `${TEST_PREFIX}Auth Test User`,
          role: "CASHIER",
        },
      });

      expect(res.status).toBe(201);
      const data = (await res.json()) as { message: string; userId: string };
      expect(data.message).toBe("User berhasil dibuat");
      expect(data.userId).toBeDefined();
    });

    it("harus gagal register jika username sudah ada (400)", async () => {
      const res = await testRequest(app, "POST", "/api/auth/register", {
        body: {
          username: testUsername,
          password: testPassword,
          name: `${TEST_PREFIX}Duplicate User`,
          role: "CASHIER",
        },
      });

      expect(res.status).toBe(400);
      const data = (await res.json()) as { message: string };
      expect(data.message).toBe("Username sudah digunakan");
    });

    it("harus gagal register jika password terlalu pendek", async () => {
      const res = await testRequest(app, "POST", "/api/auth/register", {
        body: {
          username: `${TEST_PREFIX}short_pw_${Date.now()}`,
          password: "123",
          name: `${TEST_PREFIX}Short PW User`,
          role: "CASHIER",
        },
      });

      // Elysia validation menolak minLength: 6
      expect(res.status).toBe(422);
    });
  });

  // =====================================================
  // LOGIN
  // =====================================================
  describe("POST /api/auth/login", () => {
    it("harus berhasil login dengan credential valid", async () => {
      const res = await testRequest(app, "POST", "/api/auth/login", {
        body: {
          username: testUsername,
          password: testPassword,
        },
      });

      expect(res.status).toBe(200);
      const data = (await res.json()) as {
        message: string;
        token: string;
        user: { id: string; username: string; name: string; role: string };
      };
      expect(data.message).toBe("Login berhasil");
      expect(data.token).toBeDefined();
      expect(typeof data.token).toBe("string");
      expect(data.user.username).toBe(testUsername);
      expect(data.user.role).toBe("CASHIER");
    });

    it("harus gagal login jika password salah (401)", async () => {
      const res = await testRequest(app, "POST", "/api/auth/login", {
        body: {
          username: testUsername,
          password: "wrongpassword",
        },
      });

      expect(res.status).toBe(401);
      const data = (await res.json()) as { message: string };
      expect(data.message).toBe("Username atau password salah");
    });

    it("harus gagal login jika username tidak ada (401)", async () => {
      const res = await testRequest(app, "POST", "/api/auth/login", {
        body: {
          username: "nonexistent_user_xyz",
          password: "anypassword",
        },
      });

      expect(res.status).toBe(401);
      const data = (await res.json()) as { message: string };
      expect(data.message).toBe("Username atau password salah");
    });
  });
});
