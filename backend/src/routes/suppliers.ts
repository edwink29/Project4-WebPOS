import { Elysia, t } from "elysia";
import { prisma } from "../lib/db/prisma";

export const supplierRoutes = new Elysia({ prefix: "/suppliers" })
  .get("/", async () => {
    return await prisma.supplier.findMany({
      orderBy: { createdAt: "desc" },
    });
  })

  .get(
    "/:id",
    async ({ params: { id }, set }) => {
      const supplier = await prisma.supplier.findUnique({
        where: { id },
      });

      if (!supplier) {
        set.status = 404;
        return { message: "Supplier tidak ditemukan" };
      }

      return supplier;
    },
    {
      params: t.Object({
        id: t.String(),
      }),
    },
  )

  .post(
    "/",
    async ({ body, set }) => {
      const supplier = await prisma.supplier.create({
        data: body,
      });
      set.status = 201;
      return supplier;
    },
    {
      body: t.Object({
        name: t.String({ minLength: 1 }),
        phone: t.Optional(t.String()),
        address: t.Optional(t.String()),
      }),
    },
  )

  .put(
    "/:id",
    async ({ params: { id }, body }) => {
      const supplier = await prisma.supplier.update({
        where: { id },
        data: body,
      });
      return supplier;
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      body: t.Object({
        name: t.String({ minLength: 1 }),
        phone: t.Optional(t.String()),
        address: t.Optional(t.String()),
      }),
    },
  )

  .delete(
    "/:id",
    async ({ params: { id } }) => {
      await prisma.supplier.delete({
        where: { id },
      });
      return { message: "Supplier berhasil dihapus" };
    },
    {
      params: t.Object({
        id: t.String(),
      }),
    },
  );
