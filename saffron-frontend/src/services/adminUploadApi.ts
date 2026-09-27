import apiClient from "./apiClient";

export const adminUploadApi = {
  image: async (file: File, folder: "products" | "categories"): Promise<string> => {
    const form = new FormData();
    form.append("image", file);
    form.append("folder", folder);
    const res = await apiClient.post<{ url: string }>("/admin/uploads/image", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.url;
  },
};
