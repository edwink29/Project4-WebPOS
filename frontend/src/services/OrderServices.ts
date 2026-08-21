import { environment } from "@/constants/environment";
import type { OrderPayload } from "@/types/Orders";
import { fetchAPI } from "@/utils/fetch";

export const orderService = {
  create: async (data: OrderPayload) => {
    return fetchAPI(`${environment.API_URL}/orders`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};
