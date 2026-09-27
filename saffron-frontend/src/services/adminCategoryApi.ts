import apiClient from "./apiClient";
import type { Category } from "../types/category";
import { adminUploadApi } from "./adminUploadApi";

interface CategoriesResponse {
  data: Category[];
}

interface CategoryResponse {
  success: boolean;
  data: Category;
}

export interface CategoryFormData {
  name: string;
  slug: string;
  image?: string | null;
  sort_order?: number;
  is_active?: boolean;
}

export const adminCategoryApi = {
  uploadImage: (file: File) => adminUploadApi.image(file, "categories"),
  getAll: async (): Promise<Category[]> => {
    const res = await apiClient.get<CategoriesResponse>("/admin/categories");
    return res.data.data;
  },

  getOne: async (id: number): Promise<Category> => {
    const res = await apiClient.get<CategoryResponse>(`/admin/categories/${id}`);
    return res.data.data;
  },

  create: async (data: CategoryFormData): Promise<Category> => {
    const res = await apiClient.post<CategoryResponse>("/admin/categories", data);
    return res.data.data;
  },

  update: async (id: number, data: CategoryFormData): Promise<Category> => {
    const res = await apiClient.patch<CategoryResponse>(
      `/admin/categories/${id}`,
      data
    );
    return res.data.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/admin/categories/${id}`);
  },
};
