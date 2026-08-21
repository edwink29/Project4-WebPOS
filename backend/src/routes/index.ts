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
  .macro({
    // "STAFF" = boleh lihat data (GET) siapa saja yang login,
    // tapi ubah data (POST/PUT/DELETE) wajib ADMIN
    requireRole: (role: "ADMIN" | "CASHIER" | "STAFF") => ({
      beforeHandle({ user, set, request }: any) {
        if (!user) {
          set.status = 401;
          return { message: "Silakan login terlebih dahulu" };
        }

        if (role === "STAFF") {
          if (request.method !== "GET" && user.role !== "ADMIN") {
            set.status = 403;
            return { message: "Akses ditolak: Hanya untuk ADMIN" };
          }
          return;
        }

        if (user.role !== role && user.role !== "ADMIN") {
          set.status = 403;
          return { message: `Akses ditolak: Hanya untuk ${role}` };
        }
      },
    }),
  })
  .use(authRoutes)

  // Master data — GET boleh ADMIN & CASHIER (lihat produk buat jualan),
  // POST/PUT/DELETE khusus ADMIN
  .guard({ requireRole: "STAFF" }, (staffApp) =>
    staffApp
      .use(categoryRoutes)
      .use(customerRoutes)
      .use(supplierRoutes)
      .use(productRoutes),
  )

  // Purchase (restok) — KHUSUS ADMIN, semua method
  .guard({ requireRole: "ADMIN" }, (adminApp) => adminApp.use(purchaseRoutes))

  // Transaksi penjualan — ADMIN & CASHIER boleh akses
  .guard({ requireRole: "CASHIER" }, (cashierApp) =>
    cashierApp.use(orderRoutes),
  );
