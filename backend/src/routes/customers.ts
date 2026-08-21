import { Elysia, t } from "elysia";
import { prisma } from "../lib/db/prisma";

export const customerRoutes = new Elysia({ prefix: "/customers" })
  .get("/", async () => {
    return await prisma.customer.findMany({
      orderBy: { createdAt: "desc" },
    });
  })

  .get(
    "/:id",
    async ({ params: { id }, set }) => {
      const customer = await prisma.customer.findUnique({
        where: { id },
      });

      if (!customer) {
        set.status = 404;
        return { message: "Customer tidak ditemukan" };
      }

      return customer;
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
      const customer = await prisma.customer.create({
        data: body,
      });
      set.status = 201;
      return customer;
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
      const customer = await prisma.customer.update({
        where: { id },
        data: body,
      });
      return customer;
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
      await prisma.customer.delete({
        where: { id },
      });
      return { message: "Customer berhasil dihapus" };
    },
    {
      params: t.Object({
        id: t.String(),
      }),
    },
  );
