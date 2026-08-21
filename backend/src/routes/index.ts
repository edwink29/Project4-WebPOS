import { Elysia } from "elysia";
import { categoryRoutes } from "./categories";
import { customerRoutes } from "./customers";
import { supplierRoutes } from "./suppliers";
import { productRoutes } from "./products";
import { orderRoutes } from "./orders";
import { purchaseRoutes } from "./purchases";
import { authRoutes } from "./auth";
import jwt from "@elysiajs/jwt";

export interface UserPayload {
  id: string;
  username: string;
  role: "ADMIN" | "CASHIER";
}

export const apiRoutes = new Elysia({ prefix: "/api" })
  .use(categoryRoutes)
  .use(customerRoutes)
  .use(supplierRoutes)
  .use(productRoutes)
  .use(orderRoutes)
  .use(purchaseRoutes)
  .use(authRoutes)
  .use(
    jwt({
      name: "jwt",
      secret: process.env.JWT_SECRET || "super-secret-key-pos",
    }),
  )
  .derive(async ({ jwt, headers }) => {
    const authHeader = headers["authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return { user: null };
    }

    const token = authHeader.split(" ")[1];
    const payload = await jwt.verify(token);

    return { user: (payload as unknown as UserPayload) || null };
  })
  // Buat Macro Otorisasi
  .macro(({ onBeforeHandle }) => ({
    requireRole(role: "ADMIN" | "CASHIER") {
      onBeforeHandle(
        ({
          user,
          set,
        }: {
          user: UserPayload | null;
          set: { status?: number | string };
        }) => {
          if (!user) {
            set.status = 401;
            return { message: "Silakan login terlebih dahulu" };
          }
          if (user.role !== role) {
            set.status = 403;
            return { message: `Akses ditolak: Hanya untuk ${role}` };
          }
        },
      );
    },
  }))
  .group("/v1", (app) =>
    app
      .use(orderRoutes)
      .guard({ requireRole: "ADMIN" }, (adminApp) =>
        adminApp.use(productRoutes),
      ),
  );
