import { describe, it, expect, beforeAll, afterAll } from "bun:test";
import { prisma } from "../../src/lib/db/prisma";
import { createOrderTransaction } from "../../src/utils/order";
import { cleanupTestData, TEST_PREFIX } from "../../src/utils/test-helpers";

describe("Unit Tests — Order Utilities (src/utils/order.ts)", () => {
  let testCategoryId: string;
  let testProductId: string;
  let testCustomerId: string;

  beforeAll(async () => {
    // 1. Setup Kategori
    const category = await prisma.category.create({
      data: { name: `${TEST_PREFIX}Unit Order Category` },
    });
    testCategoryId = category.id;

    // 2. Setup Produk (Stok: 25, Modal: 20000, Jual: 30000)
    const product = await prisma.product.create({
      data: {
        name: `${TEST_PREFIX}Unit Test Product`,
        categoryId: testCategoryId,
        stock: 25,
        buyPrice: 20000,
        sellPrice: 30000,
      },
    });
    testProductId = product.id;

    // 3. Setup Customer
    const customer = await prisma.customer.create({
      data: {
        name: `${TEST_PREFIX}Unit Customer`,
        phone: "08123456789",
      },
    });
    testCustomerId = customer.id;
  });

  afterAll(async () => {
    await cleanupTestData();
  });

  it("createOrderTransaction harus menghitung subtotal, total, kembalian, snapshot harga & memotong stok dengan tepat", async () => {
    const order = await createOrderTransaction({
      customerId: testCustomerId,
      payment: 100000,
      items: [{ productId: testProductId, quantity: 2 }],
    });

    expect(order.totalAmount).toBe(60000); // 30000 * 2
    expect(order.payment).toBe(100000);
    expect(order.change).toBe(40000); // 100000 - 60000
    expect(order.items.length).toBe(1);
    expect(order.items[0]!.quantity).toBe(2);
    expect(order.items[0]!.sellPrice).toBe(30000);
    expect(order.items[0]!.buyPrice).toBe(20000);

    // Cek stok produk berkurang dari 25 -> 23
    const product = await prisma.product.findUnique({
      where: { id: testProductId },
    });
    expect(product!.stock).toBe(23);
  });

  it("createOrderTransaction harus throw error jika stok produk tidak mencukupi", async () => {
    expect(
      createOrderTransaction({
        payment: 5000000,
        items: [{ productId: testProductId, quantity: 9999 }],
      }),
    ).rejects.toThrow("tidak mencukupi");
  });

  it("createOrderTransaction harus throw error jika pembayaran kurang dari total tagihan", async () => {
    expect(
      createOrderTransaction({
        payment: 1000, // Tagihan 30000
        items: [{ productId: testProductId, quantity: 1 }],
      }),
    ).rejects.toThrow("Uang pembayaran kurang");
  });

  it("createOrderTransaction harus throw error jika productId tidak ditemukan", async () => {
    expect(
      createOrderTransaction({
        payment: 50000,
        items: [
          {
            productId: "00000000-0000-0000-0000-000000000000",
            quantity: 1,
          },
        ],
      }),
    ).rejects.toThrow("tidak ditemukan");
  });
});
