import { environment } from "@/constants/environment";
import { fetchAPI } from "@/utils/fetch";
import type { Customer } from "@/types/Customers";

export const customerService = {
  getAll: async (): Promise<Customer[]> => {
    return fetchAPI<Customer[]>(`${environment.API_URL}/customers`, {
      method: "GET",
    });
  },

  create: async (data: Omit<Customer, "id">): Promise<Customer> => {
    return fetchAPI<Customer>(`${environment.API_URL}/customers`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  update: async (id: string, data: Omit<Customer, "id">): Promise<Customer> => {
    return fetchAPI<Customer>(`${environment.API_URL}/customers/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string): Promise<void> => {
    return fetchAPI<void>(`${environment.API_URL}/customers/${id}`, {
      method: "DELETE",
    });
  },
};
