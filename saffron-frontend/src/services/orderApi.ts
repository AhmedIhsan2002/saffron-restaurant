import apiClient from "./apiClient";
import type { CreateOrderPayload, Order } from "../types/order";

interface CreateOrderResponse {
  success: boolean;
  order_number: string;
  public_token: string;
  status: string;
  total: string;
  order: Order;
}

export const orderApi = {
  create: async (payload: CreateOrderPayload): Promise<CreateOrderResponse> => {
    const res = await apiClient.post<CreateOrderResponse>("/orders", payload);
    return res.data;
  },

  getStatus: async (publicToken: string): Promise<Order> => {
    const res = await apiClient.get<{ data: Order }>(
      `/order-status/${publicToken}`
    );
    return res.data.data;
  },
};
