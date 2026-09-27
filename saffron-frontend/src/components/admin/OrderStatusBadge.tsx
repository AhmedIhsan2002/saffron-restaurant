import type { OrderStatus } from "../../types/order";

export const statusLabels: Record<OrderStatus, string> = {
  pending: "قيد المراجعة",
  preparing: "قيد التحضير",
  served: "تم التقديم",
  cancelled: "ملغي",
};

export const statusColors: Record<OrderStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  preparing: "bg-blue-100 text-blue-800 border-blue-200",
  served: "bg-green-100 text-green-800 border-green-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
};

interface OrderStatusBadgeProps {
  status: OrderStatus;
}

export default function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  return (
    <span
      className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${statusColors[status]}`}
    >
      {statusLabels[status]}
    </span>
  );
}