import apiClient from "./apiClient";
import type { AdminUser } from "../types/admin";

interface LoginResponse {
  success: boolean;
  token: string;
  admin: AdminUser;
}

export const authApi = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const res = await apiClient.post<LoginResponse>("/admin/login", {
      email,
      password,
    });
    return res.data;
  },

  me: async (): Promise<AdminUser> => {
    const res = await apiClient.get<{ admin: AdminUser }>("/admin/me");
    return res.data.admin;
  },

  logout: async (): Promise<void> => {
    await apiClient.post("/admin/logout");
  },
};