import { useState, useEffect } from "react";
import { productService } from "@/services/ProductServices";
import { customerService } from "@/services/CustomerServices";
import { categoryService } from "@/services/CategoryServices";
import { orderService } from "@/services/OrderServices";
import type { Product } from "@/types/Products";
import type { Customer } from "@/types/Customers";
import type { Category } from "@/types/Categories";
import Button from "@/components/ui/Button";
import type { CartItem } from "@/types/Orders";

const formatRupiah = (number: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(number);
};

const OrderPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [payment, setPayment] = useState<number | "">("");

  const [searchProduct, setSearchProduct] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Load awal Data Master
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [prodData, custData, catData] = await Promise.all([
          productService.getAll(),
          customerService.getAll(),
          categoryService.getAll(),
        ]);
        setProducts(prodData);
        setCustomers(custData);
        setCategories(catData);
      } catch (err) {
        alert(err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // Filter Produk
  const filteredProducts = products.filter((p) => {
    const matchSearch = p.name
      .toLowerCase()
      .includes(searchProduct.toLowerCase());
    const matchCategory =
      selectedCategory === "ALL" || p.categoryId === selectedCategory;
    return matchSearch && matchCategory;
  });

  // Fungsi Keranjang
  const addToCart = (product: Product) => {
    if (product.stock <= 0) {
      alert("Stok produk ini sedang habis!");
      return;
    }

    setCart((prev) => {
      // 1. Cek apakah produk sudah ada di keranjang
      const existing = prev.find((item) => item.product.id === product.id);

      if (existing) {
        // Cek apakah jumlah melebihi stok yang tersedia
        if (existing.quantity >= product.stock) {
          alert(
            `Jumlah di keranjang sudah mencapai batas stok (${product.stock})`,
          );
          return prev;
        }

        // 2. Jika sudah ada, cukup petakan array dan tambah quantity tepat +1
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }

      // 3. Jika belum ada, tambahkan sebagai item baru dengan quantity = 1
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            if (newQty > item.product.stock) {
              alert(`Stok maksimal hanya ${item.product.stock}`);
              return item;
            }
            return { ...item, quantity: newQty };
          }
          return item;
        })
        .filter((item) => item.quantity > 0),
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const totalAmount = cart.reduce(
    (sum, item) => sum + item.product.sellPrice * item.quantity,
    0,
  );

  const numericPayment = Number(payment) || 0;
  const change = numericPayment - totalAmount;

  // Handle Checkout
  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert("Keranjang masih kosong!");
      return;
    }

    if (numericPayment < totalAmount) {
      alert("Uang pembayaran kurang dari total belanja!");
      return;
    }

    try {
      setIsSubmitting(true);
      await orderService.create({
        customerId: selectedCustomerId || undefined,
        payment: numericPayment,
        items: cart.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
      });

      alert("Transaksi Penjualan Berhasil!");

      // Reset Form & Refetch Produk untuk Refresh Stok
      setCart([]);
      setPayment("");
      setSelectedCustomerId("");
      const updatedProducts = await productService.getAll();
      setProducts(updatedProducts);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Gagal memproses transaksi");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 text-gray-500 animate-pulse">
        Memuat halaman kasir...
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-3 sm:p-5 md:p-6 min-h-[calc(100vh-80px)] bg-gray-50">
      {/* SISI KIRI: Katalog Produk */}
      <div className="flex-1 flex flex-col gap-4">
        {/* Filter Bar (Pencarian & Dropdown Kategori) */}
        <div className="bg-white p-3 sm:p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Cari produk..."
              value={searchProduct}
              onChange={(e) => setSearchProduct(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:border-blue-500"
            />
          </div>

          <div className="w-full sm:w-56">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:border-blue-500 bg-white"
            >
              <option value="ALL">-- Semua Kategori --</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id.toString()}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Grid Produk Responsif (1 col HP, 2 col tablet kecil, 3 col tablet besar, 4 col desktop) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 overflow-y-auto max-h-125 lg:max-h-155 pr-1">
          {filteredProducts.length === 0 ? (
            <div className="col-span-full py-12 text-center text-gray-400">
              Produk tidak ditemukan
            </div>
          ) : (
            filteredProducts.map((p) => (
              <div
                key={p.id}
                onClick={() => addToCart(p)}
                className={`bg-white border rounded-xl p-3.5 flex flex-col justify-between shadow-sm cursor-pointer transition-all hover:shadow-md ${
                  p.stock <= 0
                    ? "opacity-50 pointer-events-none bg-gray-100"
                    : "hover:border-blue-500"
                }`}
              >
                <div>
                  <span className="inline-block px-2 py-0.5 text-[10px] font-semibold text-blue-600 bg-blue-50 rounded mb-1.5">
                    {p.category?.name ?? "Umum"}
                  </span>
                  <h3 className="font-semibold text-gray-800 text-sm line-clamp-2">
                    {p.name}
                  </h3>
                </div>

                <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-gray-400">Harga</p>
                    <p className="font-bold text-blue-600 text-sm">
                      {formatRupiah(p.sellPrice)}
                    </p>
                  </div>
                  <span
                    className={`text-[11px] font-medium px-2 py-0.5 rounded ${
                      p.stock > 10
                        ? "bg-green-100 text-green-700"
                        : p.stock > 0
                          ? "bg-amber-100 text-amber-700"
                          : "bg-red-100 text-red-700"
                    }`}
                  >
                    Stok: {p.stock}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* SISI KANAN: Keranjang & Detail Pembayaran */}
      <div className="w-full lg:w-96 bg-white border border-gray-200 rounded-xl p-4 sm:p-5 shadow-sm flex flex-col justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-800 pb-3 border-b mb-3 flex justify-between items-center">
            <span>Keranjang Belanja</span>
            <span className="text-xs font-normal text-gray-500">
              {cart.length} Item
            </span>
          </h2>

          {/* Opsi Customer / Member */}
          <div className="mb-3">
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Pelanggan / Member (Opsional)
            </label>
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="w-full p-2 text-sm border border-gray-300 rounded-lg outline-none focus:border-blue-500 bg-gray-50"
            >
              <option value="">-- Umum (Non-Member) --</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.phone ? `(${c.phone})` : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Daftar Barang di Keranjang */}
          <div className="space-y-2 overflow-y-auto max-h-55 sm:max-h-70 lg:max-h-75 pr-1 mb-3">
            {cart.length === 0 ? (
              <div className="py-8 text-center text-gray-400 text-xs sm:text-sm">
                Klik produk di sebelah kiri untuk menambah keranjang
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.product.id}
                  className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg border border-gray-100"
                >
                  <div className="flex-1 pr-2">
                    <p className="font-semibold text-xs text-gray-800 truncate">
                      {item.product.name}
                    </p>
                    <p className="text-[11px] text-gray-500">
                      {formatRupiah(item.product.sellPrice)}
                    </p>
                  </div>

                  {/* Qty +/- */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => updateQuantity(item.product.id, -1)}
                      className="w-6 h-6 flex items-center justify-center bg-white border border-gray-300 rounded text-gray-600 font-bold hover:bg-gray-100 text-xs"
                    >
                      -
                    </button>
                    <span className="w-5 text-center text-xs font-bold">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.product.id, 1)}
                      className="w-6 h-6 flex items-center justify-center bg-white border border-gray-300 rounded text-gray-600 font-bold hover:bg-gray-100 text-xs"
                    >
                      +
                    </button>
                  </div>

                  {/* Subtotal & Hapus */}
                  <div className="text-right pl-3">
                    <p className="font-bold text-xs text-gray-800">
                      {formatRupiah(item.product.sellPrice * item.quantity)}
                    </p>
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-[10px] text-red-500 hover:underline"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Ringkasan & Form Bayar */}
        <div className="border-t pt-3 space-y-2.5">
          <div className="flex justify-between items-center">
            <span className="text-xs sm:text-sm font-semibold text-gray-600">
              Total Belanja
            </span>
            <span className="text-lg sm:text-xl font-extrabold text-blue-600">
              {formatRupiah(totalAmount)}
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Nominal Bayar (Rp)
            </label>
            <input
              type="number"
              placeholder="0"
              min="0"
              value={payment}
              onChange={(e) =>
                setPayment(e.target.value === "" ? "" : Number(e.target.value))
              }
              className="w-full p-2 text-sm font-bold border border-gray-300 rounded-lg outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex justify-between items-center text-xs pt-0.5">
            <span className="text-gray-500">Kembalian:</span>
            <span
              className={`font-bold ${
                change < 0 ? "text-red-500" : "text-green-600"
              }`}
            >
              {change < 0 ? "Uang Kurang" : formatRupiah(change)}
            </span>
          </div>

          <Button
            variant="primary"
            className="w-full py-2.5 sm:py-3 mt-1 font-bold text-xs sm:text-sm"
            onClick={handleCheckout}
            disabled={
              isSubmitting || cart.length === 0 || numericPayment < totalAmount
            }
          >
            {isSubmitting ? "Memproses..." : "Bayar & Selesaikan Transaksi"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OrderPage;
