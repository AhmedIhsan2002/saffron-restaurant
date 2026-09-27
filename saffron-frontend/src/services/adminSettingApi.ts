import apiClient from "./apiClient";

export interface AdminSetting {
  key: string;
  value: string | null;
  type: "string" | "integer" | "boolean" | "json";
  group: string;
}

interface SettingsResponse {
  data: AdminSetting[];
}

export const adminSettingApi = {
  getAll: async (): Promise<AdminSetting[]> => {
    const res = await apiClient.get<SettingsResponse>("/admin/settings");
    return res.data.data;
  },

  update: async (settings: AdminSetting[]): Promise<void> => {
    await apiClient.patch("/admin/settings", { settings });
  },
};