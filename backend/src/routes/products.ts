import { Elysia, t } from "elysia";
import { prisma } from "../lib/db/prisma";

export const productRoutes = new Elysia({ prefix: "/products" })
  .get("/", async () => {
    return await prisma.product.findMany({
      include: {
        category: true,
      },
      orderBy: { createdAt: "desc" },
    });
  })

  .get(
    "/:id",
    async ({ params: { id }, set }) => {
      const product = await prisma.product.findUnique({
        where: { id },
        include: {
          category: true,
        },
      });

      if (!product) {
        set.status = 404;
        return { message: "Produk tidak ditemukan" };
      }

      return product;
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
      const product = await prisma.product.create({
        data: body,
      });
      set.status = 201;
      return product;
    },
    {
      body: t.Object({
        categoryId: t.String(),
        name: t.String({ minLength: 1 }),
        stock: t.Number({ minimum: 0 }),
        buyPrice: t.Number({ minimum: 0 }),
        sellPrice: t.Number({ minimum: 0 }),
      }),
    },
  )

  .put(
    "/:id",
    async ({ params: { id }, body }) => {
      const product = await prisma.product.update({
        where: { id },
        data: body,
      });
      return product;
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      body: t.Object({
        categoryId: t.String(),
        name: t.String({ minLength: 1 }),
        stock: t.Number({ minimum: 0 }),
        buyPrice: t.Number({ minimum: 0 }),
        sellPrice: t.Number({ minimum: 0 }),
      }),
    },
  )

  .delete(
    "/:id",
    async ({ params: { id } }) => {
      await prisma.product.delete({
        where: { id },
      });
      return { message: "Produk berhasil dihapus" };
    },
    {
      params: t.Object({
        id: t.String(),
      }),
    },
  );
