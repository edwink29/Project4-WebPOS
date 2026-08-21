import { useState, useEffect } from "react";
import type { Customer } from "@/types/Customers";
import Button from "@/components/ui/Button";
import { supplierService } from "@/services/SupplierServices";
import { AddSupplierModal } from "./AddSuppliers";
import { EditSupplierModal } from "./EditSuppliers";
import type { Supplier } from "@/types/Suppliers";

const SuppliersPage = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(
    null,
  );

  const [refreshKey, setRefreshKey] = useState<number>(0);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await supplierService.getAll();
        setSuppliers(data);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Gagal memuat data pelanggan");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomers();
  }, [refreshKey]);

  const handleRefresh = () => setRefreshKey((prev) => prev + 1);

  const handleOpenEdit = (customer: Customer) => {
    setSelectedSupplier(customer);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    const confirmDelete = window.confirm(
      `Apakah Anda yakin ingin menghapus pelanggan "${name}"?`,
    );

    if (!confirmDelete) return;

    try {
      await supplierService.delete(id);
      handleRefresh();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Gagal menghapus pelanggan");
    }
  };

  return (
    <div className="p-6 md:p-0">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Daftar Supplier</h1>

        <Button
          variant="primary"
          size="md"
          onClick={() => setIsAddModalOpen(true)}
        >
          + Tambah Supplier
        </Button>
      </div>

      {isLoading && (
        <p className="animate-pulse text-gray-500">Memuat data supplier...</p>
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
              <th className="w-16 border border-gray-300 p-2 text-center">
                No
              </th>
              <th className="border border-gray-300 p-2">Nama Supplier</th>
              <th className="border border-gray-300 p-2">No. Telepon</th>
              <th className="border border-gray-300 p-2">Alamat</th>
              <th className="w-40 border border-gray-300 p-2 text-center">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody>
            {suppliers.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="border border-gray-300 p-4 text-center text-gray-500"
                >
                  Belum ada data pelanggan
                </td>
              </tr>
            ) : (
              suppliers.map((item, index) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="border border-gray-300 p-2 text-center">
                    {index + 1}
                  </td>
                  <td className="border border-gray-300 p-2">{item.name}</td>
                  <td className="border border-gray-300 p-2">
                    {item.phone || "-"}
                  </td>
                  <td className="border border-gray-300 p-2">
                    {item.address || "-"}
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

      <AddSupplierModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleRefresh}
      />

      {selectedSupplier && (
        <EditSupplierModal
          key={selectedSupplier.id}
          isOpen={isEditModalOpen}
          supplier={selectedSupplier}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedSupplier(null);
          }}
          onSuccess={handleRefresh}
        />
      )}
    </div>
  );
};

export default SuppliersPage;
