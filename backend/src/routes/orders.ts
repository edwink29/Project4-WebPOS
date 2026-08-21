import { Elysia, t } from "elysia";
import { prisma } from "../lib/db/prisma";
import { createOrderTransaction } from "../utils/order";

export const orderRoutes = new Elysia({ prefix: "/orders" })
  // 1. GET All Orders (Termasuk detail item & customer)
  .get("/", async () => {
    return await prisma.order.findMany({
      include: {
        customer: true,
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  })

  // 2. GET Order By ID
  .get(
    "/:id",
    async ({ params: { id }, set }) => {
      const order = await prisma.order.findUnique({
        where: { id },
        include: {
          customer: true,
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      if (!order) {
        set.status = 404;
        return { message: "Transaksi tidak ditemukan" };
      }

      return order;
    },
    {
      params: t.Object({ id: t.String() }),
    },
  )

  // 3. POST Create Order (Transaksi Penjualan)
  .post(
    "/",
    async ({ body, set }) => {
      try {
        const result = await createOrderTransaction(body);
        set.status = 201;
        return result;
      } catch (error: unknown) {
        set.status = 400;
        return {
          message:
            error instanceof Error
              ? error.message
              : "Gagal memproses transaksi",
        };
      }
    },
    {
      body: t.Object({
        customerId: t.Optional(t.String()),
        payment: t.Number({ minimum: 0 }),
        items: t.Array(
          t.Object({
            productId: t.String(),
            quantity: t.Number({ minimum: 1 }),
          }),
          { minItems: 1 },
        ),
      }),
    },
  );
