import { prisma } from "../lib/db/prisma";

export interface CreateOrderItemInput {
  productId: string;
  quantity: number;
}

export interface CreateOrderInput {
  customerId?: string;
  payment: number;
  items: CreateOrderItemInput[];
}

/**
 * Memproses transaksi penjualan (Order):
 * 1. Validasi keberadaan produk & ketersediaan stok
 * 2. Hitung subtotal, total harga, dan snapshot harga beli/jual
 * 3. Potong stok produk
 * 4. Validasi pembayaran & hitung uang kembalian
 * 5. Buat entri Order & OrderItems secara atomic
 */
export async function createOrderTransaction(input: CreateOrderInput) {
  const { customerId, payment, items } = input;

  return await prisma.$transaction(async (tx) => {
    const productIds = items.map((i) => i.productId);
    const products = await tx.product.findMany({
      where: { id: { in: productIds } },
    });

    let totalAmount = 0;
    const orderItemsData = [];

    for (const item of items) {
      const product = products.find((p) => p.id === item.productId);

      if (!product) {
        throw new Error(`Produk ID ${item.productId} tidak ditemukan`);
      }

      if (product.stock < item.quantity) {
        throw new Error(
          `Stok produk "${product.name}" tidak mencukupi (Sisa: ${product.stock})`,
        );
      }

      const subtotal = product.sellPrice * item.quantity;
      totalAmount += subtotal;

      // Simpan data item beserta snapshot harga saat transaksi terjadi
      orderItemsData.push({
        productId: product.id,
        quantity: item.quantity,
        sellPrice: product.sellPrice,
        buyPrice: product.buyPrice,
      });

      // Potong Stok Produk
      await tx.product.update({
        where: { id: product.id },
        data: { stock: product.stock - item.quantity },
      });
    }

    // Cek Pembayaran
    if (payment < totalAmount) {
      throw new Error(
        `Uang pembayaran kurang. Total: ${totalAmount}, Dibayar: ${payment}`,
      );
    }

    const change = payment - totalAmount;

    // Buat Header Transaksi Order
    const newOrder = await tx.order.create({
      data: {
        customerId: customerId || null,
        totalAmount,
        payment,
        change,
        items: {
          createMany: {
            data: orderItemsData,
          },
        },
      },
      include: {
        items: true,
      },
    });

    return newOrder;
  });
}
