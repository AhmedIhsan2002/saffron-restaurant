import apiClient from "./apiClient";
import type { Order, OrderStatus } from "../types/order";

interface PaginatedOrders {
  data: Order[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  links: {
    next: string | null;
    prev: string | null;
  };
}

interface StatsResponse {
  data: {
    pending: number;
    preparing: number;
    served: number;
    cancelled: number;
    today: number;
    today_revenue: string;
  };
}

interface OrderFilters {
  status?: OrderStatus;
  search?: string;
  page?: number;
  date?: string;
}

export const adminOrderApi = {
  getOrders: async (filters: OrderFilters = {}): Promise<PaginatedOrders> => {
    const params = new URLSearchParams();
    if (filters.status) params.append("status", filters.status);
    if (filters.search) params.append("search", filters.search);
    if (filters.page) params.append("page", String(filters.page));
    if (filters.date) params.append("date", filters.date);

    const res = await apiClient.get<PaginatedOrders>(
      `/admin/orders?${params.toString()}`
    );
    return res.data;
  },

  getOrder: async (id: number): Promise<Order> => {
    const res = await apiClient.get<{ data: Order }>(`/admin/orders/${id}`);
    return res.data.data;
  },

  updateStatus: async (id: number, status: OrderStatus): Promise<Order> => {
    const res = await apiClient.patch<{ data: Order }>(
      `/admin/orders/${id}/status`,
      { status }
    );
    return res.data.data;
  },

  getStats: async (): Promise<StatsResponse["data"]> => {
    const res = await apiClient.get<StatsResponse>("/admin/orders/stats");
    return res.data.data;
  },
};