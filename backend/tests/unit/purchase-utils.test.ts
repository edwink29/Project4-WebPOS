import { describe, it, expect, beforeAll, afterAll } from "bun:test";
import { prisma } from "../../src/lib/db/prisma";
import { createPurchaseTransaction } from "../../src/utils/purchase";
import { cleanupTestData, TEST_PREFIX } from "../../src/utils/test-helpers";

describe("Unit Tests — Purchase Utilities (src/utils/purchase.ts)", () => {
  let testCategoryId: string;
  let testProductId: string;
  let testSupplierId: string;

  beforeAll(async () => {
    // 1. Setup Kategori
    const category = await prisma.category.create({
      data: { name: `${TEST_PREFIX}Unit Purchase Category` },
    });
    testCategoryId = category.id;

    // 2. Setup Produk (Stok awal: 10, Modal awal: 5000, Jual: 8000)
    const product = await prisma.product.create({
      data: {
        name: `${TEST_PREFIX}Unit Restock Product`,
        categoryId: testCategoryId,
        stock: 10,
        buyPrice: 5000,
        sellPrice: 8000,
      },
    });
    testProductId = product.id;

    // 3. Setup Supplier
    const supplier = await prisma.supplier.create({
      data: {
        name: `${TEST_PREFIX}Unit Supplier`,
        phone: "021-998877",
      },
    });
    testSupplierId = supplier.id;
  });

  afterAll(async () => {
    await cleanupTestData();
  });

  it("createPurchaseTransaction harus menambah stok produk & mengupdate modal buyPrice", async () => {
    const newBuyPrice = 5500;
    const addedQty = 20;

    const purchase = await createPurchaseTransaction({
      supplierId: testSupplierId,
      items: [
        {
          productId: testProductId,
          quantity: addedQty,
          buyPrice: newBuyPrice,
        },
      ],
    });

    expect(purchase.totalAmount).toBe(newBuyPrice * addedQty); // 110000
    expect(purchase.items.length).toBe(1);
    expect(purchase.items[0]!.buyPrice).toBe(newBuyPrice);

    // Cek database: stok bertambah 10 + 20 = 30 & buyPrice di-update ke 5500
    const product = await prisma.product.findUnique({
      where: { id: testProductId },
    });
    expect(product!.stock).toBe(30);
    expect(product!.buyPrice).toBe(newBuyPrice);
  });

  it("createPurchaseTransaction harus throw error jika supplier tidak ditemukan", async () => {
    expect(
      createPurchaseTransaction({
        supplierId: "00000000-0000-0000-0000-000000000000",
        items: [
          {
            productId: testProductId,
            quantity: 5,
            buyPrice: 5000,
          },
        ],
      }),
    ).rejects.toThrow("Supplier tidak ditemukan");
  });

  it("createPurchaseTransaction harus throw error jika productId tidak ditemukan", async () => {
    expect(
      createPurchaseTransaction({
        supplierId: testSupplierId,
        items: [
          {
            productId: "00000000-0000-0000-0000-000000000000",
            quantity: 5,
            buyPrice: 5000,
          },
        ],
      }),
    ).rejects.toThrow("tidak ditemukan");
  });
});
