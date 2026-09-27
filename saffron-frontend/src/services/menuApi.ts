import apiClient from "./apiClient";
import type { Category } from "../types/category";
import type { Product } from "../types/product";

export const menuApi = {
  getCategories: async (): Promise<Category[]> => {
    const res = await apiClient.get<{ data: Category[] }>("/categories");
    return res.data.data;
  },

  getCategoryProducts: async (slug: string): Promise<Product[]> => {
    const res = await apiClient.get<{ data: Product[] }>(
      `/categories/${slug}/products`
    );
    return res.data.data;
  },

  getFeaturedProducts: async (): Promise<Product[]> => {
    const res = await apiClient.get<{ data: Product[] }>("/products/featured");
    return res.data.data;
  },

  getProduct: async (id: number): Promise<Product> => {
    const res = await apiClient.get<{ data: Product }>(`/products/${id}`);
    return res.data.data;
  },

  searchProducts: async (q: string): Promise<Product[]> => {
    const res = await apiClient.get<{ data: Product[] }>("/products/search", {
      params: { q },
    });
    return res.data.data;
  },
};