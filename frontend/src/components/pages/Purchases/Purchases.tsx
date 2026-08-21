import { useState, useEffect } from "react";
import { productService } from "@/services/ProductServices";
import { supplierService } from "@/services/SupplierServices";
import { purchaseService } from "@/services/PurchaseServices";
import type { Product } from "@/types/Products";
import type { Supplier } from "@/types/Suppliers";
import Button from "@/components/ui/Button";
import type { RestockItem } from "@/types/Purchases";

const formatRupiah = (number: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(number);
};

const PurchasePage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  const [selectedSupplierId, setSelectedSupplierId] = useState<string>("");
  const [restockList, setRestockList] = useState<RestockItem[]>([]);

  const [searchProduct, setSearchProduct] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [prodData, suppData] = await Promise.all([
          productService.getAll(),
          supplierService.getAll(),
        ]);
        setProducts(prodData);
        setSuppliers(suppData);
      } catch (err) {
        alert(err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchProduct.toLowerCase()),
  );

  const addToRestock = (product: Product) => {
    setRestockList((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [
        ...prev,
        {
          product,
          quantity: 1,
          buyPrice: product.buyPrice, // Gunakan harga beli awal sebagai default
        },
      ];
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) return;
    setRestockList((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item,
      ),
    );
  };

  const updateBuyPrice = (productId: string, buyPrice: number) => {
    if (buyPrice < 0) return;
    setRestockList((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, buyPrice } : item,
      ),
    );
  };

  const removeFromRestock = (productId: string) => {
    setRestockList((prev) =>
      prev.filter((item) => item.product.id !== productId),
    );
  };

  const totalAmount = restockList.reduce(
    (sum, item) => sum + item.buyPrice * item.quantity,
    0,
  );

  const handleCheckout = async () => {
    if (!selectedSupplierId) {
      alert("Pilih Supplier terlebih dahulu!");
      return;
    }

    if (restockList.length === 0) {
      alert("Daftar barang kulakan masih kosong!");
      return;
    }

    try {
      setIsSubmitting(true);
      await purchaseService.create({
        supplierId: selectedSupplierId,
        items: restockList.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
          buyPrice: item.buyPrice,
        })),
      });

      alert("Transaksi Pembelian / Restok Berhasil!");

      setRestockList([]);
      setSelectedSupplierId("");
      const updatedProducts = await productService.getAll();
      setProducts(updatedProducts);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Gagal memproses pembelian");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 text-gray-500 animate-pulse">
        Memuat halaman restok...
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-3 sm:p-5 md:p-6 min-h-[calc(100vh-80px)] bg-gray-50">
      {/* SISI KIRI: Katalog Pilih Produk Restok */}
      <div className="flex-1 flex flex-col gap-4">
        <div className="bg-white p-3 sm:p-4 rounded-xl shadow-sm border border-gray-200">
          <input
            type="text"
            placeholder="Cari barang yang akan direstok..."
            value={searchProduct}
            onChange={(e) => setSearchProduct(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:border-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 overflow-y-auto max-h-125 lg:max-h-155 pr-1">
          {filteredProducts.length === 0 ? (
            <div className="col-span-full py-12 text-center text-gray-400">
              Produk tidak ditemukan
            </div>
          ) : (
            filteredProducts.map((p) => (
              <div
                key={p.id}
                onClick={() => addToRestock(p)}
                className="bg-white border rounded-xl p-3.5 flex flex-col justify-between shadow-sm cursor-pointer transition-all hover:shadow-md hover:border-blue-500"
              >
                <div>
                  <span className="inline-block px-2 py-0.5 text-[10px] font-semibold text-purple-600 bg-purple-50 rounded mb-1.5">
                    {p.category?.name ?? "Umum"}
                  </span>
                  <h3 className="font-semibold text-gray-800 text-sm line-clamp-2">
                    {p.name}
                  </h3>
                </div>

                <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-gray-400">Modal Saat Ini</p>
                    <p className="font-bold text-gray-700 text-sm">
                      {formatRupiah(p.buyPrice)}
                    </p>
                  </div>
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-blue-100 text-blue-700">
                    Stok: {p.stock}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* SISI KANAN: Form Nota Pembelian / Kulakan */}
      <div className="w-full lg:w-96 bg-white border border-gray-200 rounded-xl p-4 sm:p-5 shadow-sm flex flex-col justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-800 pb-3 border-b mb-3 flex justify-between items-center">
            <span>Nota Restok (Pembelian)</span>
            <span className="text-xs font-normal text-gray-500">
              {restockList.length} Item
            </span>
          </h2>

          {/* Pilih Supplier (Wajib) */}
          <div className="mb-3">
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Supplier / Distributor *
            </label>
            <select
              value={selectedSupplierId}
              onChange={(e) => setSelectedSupplierId(e.target.value)}
              className="w-full p-2 text-sm border border-gray-300 rounded-lg outline-none focus:border-blue-500 bg-gray-50"
            >
              <option value="">-- Pilih Supplier --</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} {s.phone ? `(${s.phone})` : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Daftar Barang Restok */}
          <div className="space-y-3 overflow-y-auto max-h-65 sm:max-h-80 lg:max-h-85 pr-1 mb-3">
            {restockList.length === 0 ? (
              <div className="py-8 text-center text-gray-400 text-xs sm:text-sm">
                Klik produk di sebelah kiri untuk menambah daftar restok
              </div>
            ) : (
              restockList.map((item) => (
                <div
                  key={item.product.id}
                  className="p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-2"
                >
                  <div className="flex justify-between items-start">
                    <p className="font-semibold text-xs text-gray-800 truncate pr-2">
                      {item.product.name}
                    </p>
                    <button
                      onClick={() => removeFromRestock(item.product.id)}
                      className="text-[10px] text-red-500 hover:underline"
                    >
                      Hapus
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    {/* Input Jumlah Masuk */}
                    <div>
                      <label className="block text-[10px] text-gray-500">
                        Jumlah Restok
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          updateQuantity(
                            item.product.id,
                            Number(e.target.value),
                          )
                        }
                        className="w-full p-1 text-xs border rounded bg-white font-semibold"
                      />
                    </div>

                    {/* Input Harga Beli Terbaru */}
                    <div>
                      <label className="block text-[10px] text-gray-500">
                        Harga Beli / Stk (Rp)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={item.buyPrice}
                        onChange={(e) =>
                          updateBuyPrice(
                            item.product.id,
                            Number(e.target.value),
                          )
                        }
                        className="w-full p-1 text-xs border rounded bg-white font-semibold"
                      />
                    </div>
                  </div>

                  <div className="text-right pt-1 border-t border-gray-200">
                    <span className="text-[10px] text-gray-400">
                      Subtotal:{" "}
                    </span>
                    <span className="text-xs font-bold text-gray-800">
                      {formatRupiah(item.buyPrice * item.quantity)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Ringkasan & Submit */}
        <div className="border-t pt-3 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs sm:text-sm font-semibold text-gray-600">
              Total Pengeluaran Restok
            </span>
            <span className="text-lg sm:text-xl font-extrabold text-purple-600">
              {formatRupiah(totalAmount)}
            </span>
          </div>

          <Button
            variant="primary"
            className="w-full py-2.5 sm:py-3 font-bold text-xs sm:text-sm bg-purple-600 hover:bg-purple-700"
            onClick={handleCheckout}
            disabled={
              isSubmitting || restockList.length === 0 || !selectedSupplierId
            }
          >
            {isSubmitting ? "Memproses..." : "Simpan Transaction Restok"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PurchasePage;
