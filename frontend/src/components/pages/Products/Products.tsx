import { useState, useEffect } from "react";
import type { Product } from "@/types/Products";
import Button from "@/components/ui/Button";
import { productService } from "@/services/ProductServices";
import { AddProductModal } from "./AddProducts";
import { EditProductModal } from "./EditProducts";

const formatRupiah = (number: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(number);
};

const ProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const [refreshKey, setRefreshKey] = useState<number>(0);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await productService.getAll();
        setProducts(data);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Gagal memuat data produk");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [refreshKey]);

  const handleRefresh = () => setRefreshKey((prev) => prev + 1);

  const handleOpenEdit = (product: Product) => {
    setSelectedProduct(product);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    const confirmDelete = window.confirm(
      `Apakah Anda yakin ingin menghapus produk "${name}"?`,
    );

    if (!confirmDelete) return;

    try {
      await productService.delete(id);
      handleRefresh();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Gagal menghapus produk");
    }
  };

  return (
    <div className="p-6 md:p-0">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Daftar Produk</h1>

        <Button
          variant="primary"
          size="md"
          onClick={() => setIsAddModalOpen(true)}
        >
          + Tambah Produk
        </Button>
      </div>

      {isLoading && (
        <p className="animate-pulse text-gray-500">Memuat data produk...</p>
      )}

      {!isLoading && error && (
        <div className="rounded bg-red-100 p-3 text-sm text-red-700">
          Error: {error}
        </div>
      )}

      {!isLoading && !error && (
        <table className="w-full border-collapse border border-gray-300 text-left text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="w-12 border border-gray-300 p-2 text-center">
                No
              </th>
              <th className="border border-gray-300 p-2">Nama Produk</th>
              <th className="border border-gray-300 p-2">Kategori</th>
              <th className="w-20 border border-gray-300 p-2 text-center">
                Stok
              </th>
              <th className="border border-gray-300 p-2 text-right">
                Harga Beli
              </th>
              <th className="border border-gray-300 p-2 text-right">
                Harga Jual
              </th>
              <th className="w-36 border border-gray-300 p-2 text-center">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="border border-gray-300 p-4 text-center text-gray-500"
                >
                  Belum ada data produk
                </td>
              </tr>
            ) : (
              products.map((item, index) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="border border-gray-300 p-2 text-center">
                    {index + 1}
                  </td>
                  <td className="border border-gray-300 p-2 font-medium">
                    {item.name}
                  </td>
                  <td className="border border-gray-300 p-2">
                    {item.category?.name ?? "-"}
                  </td>
                  <td className="border border-gray-300 p-2 text-center">
                    {item.stock}
                  </td>
                  <td className="border border-gray-300 p-2 text-right">
                    {formatRupiah(item.buyPrice)}
                  </td>
                  <td className="border border-gray-300 p-2 text-right font-medium text-green-600">
                    {formatRupiah(item.sellPrice)}
                  </td>
                  <td className="border border-gray-300 p-2 text-center">
                    <div className="flex justify-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenEdit(item)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleDelete(item.id, item.name)}
                      >
                        Hapus
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}

      {/* Modal Tambah */}
      <AddProductModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleRefresh}
      />

      {/* Modal Edit */}
      {selectedProduct && (
        <EditProductModal
          key={selectedProduct.id}
          isOpen={isEditModalOpen}
          product={selectedProduct}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedProduct(null);
          }}
          onSuccess={handleRefresh}
        />
      )}
    </div>
  );
};

export default ProductsPage;
