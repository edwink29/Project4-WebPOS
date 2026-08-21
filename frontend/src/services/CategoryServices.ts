import { environment } from "@/constants/environment";
import { fetchAPI } from "@/utils/fetch";
import type { Category } from "@/types/Categories";

export const categoryService = {
  getAll: async (): Promise<Category[]> => {
    return fetchAPI<Category[]>(`${environment.API_URL}/categories`, {
      method: "GET",
    });
  },

  create: async (name: string): Promise<Category> => {
    return fetchAPI<Category>(`${environment.API_URL}/categories`, {
      method: "POST",
      body: JSON.stringify({ name }),
    });
  },

  update: async (id: number | string, name: string): Promise<Category> => {
    return fetchAPI<Category>(`${environment.API_URL}/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify({ name }),
    });
  },

  delete: async (id: number | string): Promise<void> => {
    return fetchAPI<void>(`${environment.API_URL}/categories/${id}`, {
      method: "DELETE",
    });
  },
};
