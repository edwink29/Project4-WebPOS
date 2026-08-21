import { Elysia, t } from "elysia";
import { prisma } from "../lib/db/prisma";
import { createPurchaseTransaction } from "../utils/purchase";

export const purchaseRoutes = new Elysia({ prefix: "/purchases" })
  // 1. GET All Purchases (Riwayat Kulakan)
  .get("/", async () => {
    return await prisma.purchase.findMany({
      include: {
        supplier: true,
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  })

  // 2. GET Purchase By ID
  .get(
    "/:id",
    async ({ params: { id }, set }) => {
      const purchase = await prisma.purchase.findUnique({
        where: { id },
        include: {
          supplier: true,
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      if (!purchase) {
        set.status = 404;
        return { message: "Transaksi pembelian tidak ditemukan" };
      }

      return purchase;
    },
    {
      params: t.Object({ id: t.String() }),
    },
  )

  // 3. POST Create Purchase (Restok Barang dari Supplier)
  .post(
    "/",
    async ({ body, set }) => {
      try {
        const result = await createPurchaseTransaction(body);
        set.status = 201;
        return result;
      } catch (error: unknown) {
        set.status = 400;
        return {
          message:
            error instanceof Error
              ? error.message
              : "Gagal memproses pembelian",
        };
      }
    },
    {
      body: t.Object({
        supplierId: t.String(),
        items: t.Array(
          t.Object({
            productId: t.String(),
            quantity: t.Number({ minimum: 1 }),
            buyPrice: t.Number({ minimum: 0 }), // Harga Beli Modal dari Supplier
          }),
          { minItems: 1 },
        ),
      }),
    },
  );
