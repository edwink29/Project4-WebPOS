import { useState, useEffect } from "react";
import type { Category } from "@/types/Categories";
import Button from "@/components/ui/Button";
import AddCategoryModal from "./AddCategories";
import { categoryService } from "@/services/CategoryServices";
import EditCategoryModal from "./EditCategories";

const CategoriesPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );

  const [refreshKey, setRefreshKey] = useState<number>(0);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const data = await categoryService.getAll();
        setCategories(data);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Terjadi kesalahan yang tidak diketahui");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, [refreshKey]);

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleOpenEdit = (category: Category) => {
    setSelectedCategory(category);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (id: number | string, name: string) => {
    const confirmDelete = window.confirm(
      `Apakah Anda yakin ingin menghapus kategori "${name}"?`,
    );

    if (!confirmDelete) return;

    try {
      await categoryService.delete(id);
      handleRefresh();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Gagal menghapus kategori");
    }
  };

  return (
    <div className="p-6 md:p-0">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Daftar Kategori</h1>

        <Button
          variant="primary"
          className="cursor-pointer"
          size="md"
          onClick={() => setIsModalOpen(true)}
        >
          + Tambah Kategori
        </Button>
      </div>

      {isLoading && (
        <p className="animate-pulse text-gray-500">Memuat data...</p>
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
              <th className="border border-gray-300 p-2">No</th>
              <th className="border border-gray-300 p-2">Nama Kategori</th>
              <th className="border border-gray-300 p-2 w-40 text-center">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 ? (
              <tr>
                <td
                  colSpan={2}
                  className="border border-gray-300 p-4 text-center text-gray-500"
                >
                  Belum ada data
                </td>
              </tr>
            ) : (
              categories.map((item, index) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="border border-gray-300 p-2">{index + 1}</td>
                  <td className="border border-gray-300 p-2">{item.name}</td>
                  <td className="border border-gray-300 p-2 text-center">
                    <div className="flex justify-center gap-2">
                      <Button
                        size="sm"
                        className="cursor-pointer"
                        variant="outline"
                        onClick={() => handleOpenEdit(item)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        className="cursor-pointer"
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

      <AddCategoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleRefresh}
      />

      {selectedCategory && (
        <EditCategoryModal
          key={selectedCategory.id}
          isOpen={isEditModalOpen}
          category={selectedCategory}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedCategory(null);
          }}
          onSuccess={handleRefresh}
        />
      )}
    </div>
  );
};

export default CategoriesPage;
