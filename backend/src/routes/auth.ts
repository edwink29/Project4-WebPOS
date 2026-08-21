import { Elysia, t } from "elysia";
import { jwt } from "@elysiajs/jwt";
import { registerUser, verifyUserCredentials } from "../utils/auth";

export const authRoutes = new Elysia({ prefix: "/auth" })
  .use(
    jwt({
      name: "jwt",
      secret: process.env.JWT_SECRET || "super-secret-key-pos",
    }),
  )
  // Register User
  .post(
    "/register",
    async ({ body, set }) => {
      try {
        const result = await registerUser(body);
        set.status = 201;
        return result;
      } catch (error: unknown) {
        set.status = 400;
        return {
          message:
            error instanceof Error
              ? error.message
              : "Gagal membuat user",
        };
      }
    },
    {
      body: t.Object({
        username: t.String(),
        password: t.String({ minLength: 6 }),
        name: t.String(),
        role: t.Union([t.Literal("ADMIN"), t.Literal("CASHIER")]),
      }),
    },
  )

  // Login
  .post(
    "/login",
    async ({ body, jwt, set }) => {
      try {
        const user = await verifyUserCredentials(body);

        const token = await jwt.sign({
          id: user.id,
          username: user.username,
          role: user.role,
        });

        return {
          message: "Login berhasil",
          token,
          user: {
            id: user.id,
            username: user.username,
            name: user.name,
            role: user.role,
          },
        };
      } catch (error: unknown) {
        set.status = 401;
        return {
          message:
            error instanceof Error
              ? error.message
              : "Username atau password salah",
        };
      }
    },
    {
      body: t.Object({
        username: t.String(),
        password: t.String(),
      }),
    },
  );