import apiClient from "./apiClient";
import type { PublicSettings } from "../types/settings";

export const settingsApi = {
  getPublic: async (): Promise<PublicSettings> => {
    const res = await apiClient.get<{ data: PublicSettings }>(
      "/settings/public"
    );
    return res.data.data;
  },
};