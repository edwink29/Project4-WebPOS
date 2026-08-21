import { environment } from "@/constants/environment";
import { fetchAPI } from "@/utils/fetch";
import type { Product, ProductFormInput } from "@/types/Products";

export const productService = {
  getAll: async (): Promise<Product[]> => {
    return fetchAPI<Product[]>(`${environment.API_URL}/products`, {
      method: "GET",
    });
  },

  create: async (data: ProductFormInput): Promise<Product> => {
    return fetchAPI<Product>(`${environment.API_URL}/products`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  update: async (id: string, data: ProductFormInput): Promise<Product> => {
    return fetchAPI<Product>(`${environment.API_URL}/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string): Promise<void> => {
    return fetchAPI<void>(`${environment.API_URL}/products/${id}`, {
      method: "DELETE",
    });
  },
};
