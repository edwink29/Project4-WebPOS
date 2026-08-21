import { environment } from "@/constants/environment";
import { fetchAPI } from "@/utils/fetch";
import type { LoginPayload, LoginResponse } from "@/types/Auth";

export const authService = {
  login: async (payload: LoginPayload): Promise<LoginResponse> => {
    return fetchAPI<LoginResponse>(`${environment.API_URL}/auth/login`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user_role");
    window.location.href = "/login";
  },
};
