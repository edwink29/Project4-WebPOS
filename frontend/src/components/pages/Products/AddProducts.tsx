import { useState, useEffect } from "react";
import Button from "@/components/ui/Button";
import { productService } from "@/services/ProductServices";
import { categoryService } from "@/services/CategoryServices";
import type { Category } from "@/types/Categories";
import type { AddProductProps } from "@/types/Products";

export const AddProductModal = ({
  isOpen,
  onClose,
  onSuccess,
}: AddProductProps) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState<string>("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [stock, setStock] = useState<number>(0);
  const [buyPrice, setBuyPrice] = useState<number>(0);
  const [sellPrice, setSellPrice] = useState<number>(0);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Ambil daftar kategori untuk pilihan dropdown
  useEffect(() => {
    if (isOpen) {
      categoryService
        .getAll()
        .then((data) => {
          setCategories(data);
          if (data.length > 0) setCategoryId(data[0].id.toString());
        })
        .catch(() => setErrorMessage("Gagal memuat opsi kategori"));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !categoryId) return;

    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      await productService.create({
        name,
        categoryId,
        stock: Number(stock),
        buyPrice: Number(buyPrice),
        sellPrice: Number(sellPrice),
      });

      setName("");
      setStock(0);
      setBuyPrice(0);
      setSellPrice(0);
      onSuccess();
      onClose();
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : "Gagal menambahkan produk",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-xl font-bold text-gray-800">Tambah Produk</h2>

        {errorMessage && (
          <div className="mb-4 rounded bg-red-100 p-3 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Nama Produk *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-gray-300 p-2 text-sm outline-none focus:border-blue-500"
              placeholder="Contoh: Minyak Goreng 1L"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Kategori *
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full rounded-lg border border-gray-300 p-2 text-sm outline-none focus:border-blue-500"
            >
              <option value="" disabled>
                -- Pilih Kategori --
              </option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Stok
              </label>
              <input
                type="number"
                min="0"
                value={stock}
                onChange={(e) => setStock(Number(e.target.value))}
                className="w-full rounded-lg border border-gray-300 p-2 text-sm outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Harga Beli
              </label>
              <input
                type="number"
                min="0"
                value={buyPrice}
                onChange={(e) => setBuyPrice(Number(e.target.value))}
                className="w-full rounded-lg border border-gray-300 p-2 text-sm outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Harga Jual
              </label>
              <input
                type="number"
                min="0"
                value={sellPrice}
                onChange={(e) => setSellPrice(Number(e.target.value))}
                className="w-full rounded-lg border border-gray-300 p-2 text-sm outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
