import { describe, it, expect, afterAll } from "bun:test";
import { registerUser, verifyUserCredentials } from "../../src/utils/auth";
import { cleanupTestData, TEST_PREFIX } from "../../src/utils/test-helpers";

describe("Unit Tests — Auth Utilities (src/utils/auth.ts)", () => {
  const username = `${TEST_PREFIX}unit_auth_${Date.now()}`;
  const password = "securePassword123";

  afterAll(async () => {
    await cleanupTestData();
  });

  it("registerUser harus berhasil mendaftarkan user dan meng-hash password", async () => {
    const result = await registerUser({
      username,
      password,
      name: `${TEST_PREFIX}Unit Auth User`,
      role: "ADMIN",
    });

    expect(result.message).toBe("User berhasil dibuat");
    expect(result.userId).toBeDefined();
  });

  it("registerUser harus throw error jika username sudah terdaftar", async () => {
    expect(
      registerUser({
        username,
        password,
        name: `${TEST_PREFIX}Duplicate Unit User`,
        role: "ADMIN",
      }),
    ).rejects.toThrow("Username sudah digunakan");
  });

  it("verifyUserCredentials harus berhasil memverifikasi user dengan password yang benar", async () => {
    const user = await verifyUserCredentials({
      username,
      password,
    });

    expect(user.username).toBe(username);
    expect(user.role).toBe("ADMIN");
  });

  it("verifyUserCredentials harus throw error jika password salah", async () => {
    expect(
      verifyUserCredentials({
        username,
        password: "wrongPassword999",
      }),
    ).rejects.toThrow("Username atau password salah");
  });

  it("verifyUserCredentials harus throw error jika username tidak ada", async () => {
    expect(
      verifyUserCredentials({
        username: "unknown_user_12345",
        password,
      }),
    ).rejects.toThrow("Username atau password salah");
  });
});
