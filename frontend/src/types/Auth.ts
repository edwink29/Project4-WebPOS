export interface LoginPayload {
  username: string;
  password: string;
}

export interface UserAuth {
  id: string;
  username: string;
  name: string;
  role: "ADMIN" | "CASHIER";
}

export interface LoginResponse {
  message: string;
  token: string;
  user: UserAuth;
}
