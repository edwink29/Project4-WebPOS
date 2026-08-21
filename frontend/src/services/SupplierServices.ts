import { environment } from "@/constants/environment";
import { fetchAPI } from "@/utils/fetch";
import type { Supplier } from "@/types/Suppliers";

export const supplierService = {
  getAll: async (): Promise<Supplier[]> => {
    return fetchAPI<Supplier[]>(`${environment.API_URL}/suppliers`, {
      method: "GET",
    });
  },

  create: async (data: Omit<Supplier, "id">): Promise<Supplier> => {
    return fetchAPI<Supplier>(`${environment.API_URL}/suppliers`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  update: async (id: string, data: Omit<Supplier, "id">): Promise<Supplier> => {
    return fetchAPI<Supplier>(`${environment.API_URL}/suppliers/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string): Promise<void> => {
    return fetchAPI<void>(`${environment.API_URL}/suppliers/${id}`, {
      method: "DELETE",
    });
  },
};
