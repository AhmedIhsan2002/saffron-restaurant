import type { SelectedOption } from "./cart";

export type OrderStatus = "pending" | "preparing" | "served" | "cancelled";

export interface OrderItem {
  id: number;
  product_id: number | null;
  name: string;
  price: string;
  quantity: number;
  options: SelectedOption[];
  line_total: string;
}

export interface Order {
  id: number;
  order_number: string;
  table_number: string;
  guest_name: string | null;
  notes: string | null;
  subtotal: string;
  total: string;
  status: OrderStatus;
  created_at: string;
  items: OrderItem[];
}

export interface CreateOrderPayload {
  table_number: string;
  guest_name?: string;
  notes?: string;
  items: {
    product_id: number;
    quantity: number;
    options?: { option_id: number; value_ids: number[] }[];
  }[];
}