import { prisma } from "../lib/db/prisma";

export interface CreatePurchaseItemInput {
  productId: string;
  quantity: number;
  buyPrice: number;
}

export interface CreatePurchaseInput {
  supplierId: string;
  items: CreatePurchaseItemInput[];
}

/**
 * Memproses transaksi pembelian/kulakan (Purchase):
 * 1. Validasi keberadaan supplier & produk
 * 2. Hitung subtotal & total pembayaran pengadaan
 * 3. Tambah stok produk & perbarui modal harga beli terbaru
 * 4. Buat entri Purchase & PurchaseItems secara atomic
 */
export async function createPurchaseTransaction(input: CreatePurchaseInput) {
  const { supplierId, items } = input;

  return await prisma.$transaction(async (tx) => {
    // 1. Pastikan Supplier Ada
    const supplier = await tx.supplier.findUnique({
      where: { id: supplierId },
    });

    if (!supplier) {
      throw new Error("Supplier tidak ditemukan");
    }

    // 2. Ambil Data Produk
    const productIds = items.map((i) => i.productId);
    const products = await tx.product.findMany({
      where: { id: { in: productIds } },
    });

    let totalAmount = 0;
    const purchaseItemsData = [];

    for (const item of items) {
      const product = products.find((p) => p.id === item.productId);

      if (!product) {
        throw new Error(`Produk ID ${item.productId} tidak ditemukan`);
      }

      const subtotal = item.buyPrice * item.quantity;
      totalAmount += subtotal;

      // Simpan snapshot item restok
      purchaseItemsData.push({
        productId: product.id,
        quantity: item.quantity,
        buyPrice: item.buyPrice,
      });

      // TAMBAH STOK PRODUK & Update harga beli terbaru jika berubah
      await tx.product.update({
        where: { id: product.id },
        data: {
          stock: product.stock + item.quantity,
          buyPrice: item.buyPrice,
        },
      });
    }

    // 3. Buat Nota Pembelian
    const newPurchase = await tx.purchase.create({
      data: {
        supplierId,
        totalAmount,
        items: {
          createMany: {
            data: purchaseItemsData,
          },
        },
      },
      include: {
        items: true,
      },
    });

    return newPurchase;
  });
}
