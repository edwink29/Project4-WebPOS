import { environment } from "@/constants/environment";
import { fetchAPI } from "@/utils/fetch";
import type { Purchase, PurchasePayload } from "@/types/Purchases";

export const purchaseService = {
  getAll: async (): Promise<Purchase[]> => {
    return fetchAPI<Purchase[]>(`${environment.API_URL}/purchases`, {
      method: "GET",
    });
  },

  getById: async (id: string): Promise<Purchase> => {
    return fetchAPI<Purchase>(`${environment.API_URL}/purchases/${id}`, {
      method: "GET",
    });
  },

  create: async (data: PurchasePayload): Promise<Purchase> => {
    return fetchAPI<Purchase>(`${environment.API_URL}/purchases`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};
