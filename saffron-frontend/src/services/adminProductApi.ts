import apiClient from "./apiClient";
import type { Product } from "../types/product";
import { adminUploadApi } from "./adminUploadApi";

interface PaginatedProducts {
  data: Product[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface ProductFormOption {
  name: string;
  type: "single" | "multiple";
  is_required: boolean;
  sort_order: number;
  values: {
    name: string;
    extra_price: number;
    sort_order: number;
  }[];
}

export interface ProductFormData {
  category_id: number;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  price: number;
  old_price?: number | null;
  is_featured: boolean;
  is_active: boolean;
  options?: ProductFormOption[];
}

interface ProductFilters {
  category_id?: number;
  search?: string;
  is_active?: boolean;
  page?: number;
}

export const adminProductApi = {
  uploadImage: (file: File) => adminUploadApi.image(file, "products"),
  getAll: async (filters: ProductFilters = {}): Promise<PaginatedProducts> => {
    const params = new URLSearchParams();
    if (filters.category_id) params.append("category_id", String(filters.category_id));
    if (filters.search) params.append("search", filters.search);
    if (filters.is_active !== undefined) {
      params.append("is_active", filters.is_active ? "1" : "0");
    }
    if (filters.page) params.append("page", String(filters.page));

    const res = await apiClient.get<PaginatedProducts>(
      `/admin/products?${params.toString()}`
    );
    return res.data;
  },

  getOne: async (id: number): Promise<Product> => {
    const res = await apiClient.get<{ data: Product }>(`/admin/products/${id}`);
    return res.data.data;
  },

  create: async (data: ProductFormData): Promise<Product> => {
    const res = await apiClient.post<{ data: Product }>("/admin/products", data);
    return res.data.data;
  },

  update: async (id: number, data: ProductFormData): Promise<Product> => {
    const res = await apiClient.patch<{ data: Product }>(
      `/admin/products/${id}`,
      data
    );
    return res.data.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/admin/products/${id}`);
  },
};
