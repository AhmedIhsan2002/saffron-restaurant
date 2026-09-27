import { useEffect } from "react";
import type { Order } from "../../types/order";
import OrderStatusBadge from "./OrderStatusBadge";

interface OrderDetailsDrawerProps {
  order: Order | null;
  onClose: () => void;
}

export default function OrderDetailsDrawer({
  order,
  onClose,
}: OrderDetailsDrawerProps) {
  useEffect(() => {
    if (!order) return;

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = original;
    };
  }, [order, onClose]);

  if (!order) return null;

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
      {/* الخلفية */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-[fadeIn_150ms_ease-out]"
        onClick={onClose}
      />

      {/* الدرج */}
      <aside className="absolute top-0 left-0 h-full w-full max-w-md bg-white shadow-2xl flex flex-col animate-[slideInLeft_250ms_ease-out]">
        {/* الرأس */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-primary">تفاصيل الطلب</h2>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500"
            aria-label="إغلاق"
          >
            ✕
          </button>
        </div>

        {/* المحتوى */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {/* رقم الطلب + الحالة */}
          <div className="text-center py-4 border-b border-gray-100">
            <p className="text-sm text-gray-500 mb-1">رقم الطلب</p>
            <p className="text-2xl font-bold text-primary tracking-wider mb-3">
              {order.order_number}
            </p>
            <OrderStatusBadge status={order.status} />
          </div>

          {/* معلومات أساسية */}
          <div className="space-y-2 text-sm">
            <Row label="رقم الطاولة" value={order.table_number} />
            {order.guest_name && <Row label="اسم الزبون" value={order.guest_name} />}
            {order.notes && (
              <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-xl">
                <p className="text-xs font-bold text-yellow-800 mb-1">
                  ملاحظات الزبون
                </p>
                <p className="text-sm text-yellow-900">{order.notes}</p>
              </div>
            )}
          </div>

          {/* العناصر */}
          <div>
            <p className="font-bold text-primary mb-3">
              العناصر ({order.items.length})
            </p>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="bg-gray-50 rounded-xl p-3 text-sm"
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className="font-semibold text-ink">{item.name}</span>
                    <span className="text-xs text-gray-500 flex-shrink-0">
                      × {item.quantity}
                    </span>
                  </div>

                  {item.options.length > 0 && (
                    <ul className="text-xs text-gray-500 mb-2 space-y-0.5">
                      {item.options.map((opt, i) => (
                        <li key={i}>
                          {opt.option_name}: {opt.value_name}
                          {parseFloat(opt.extra_price) > 0 && (
                            <span className="text-accent">
                              {" "}
                              (+{parseFloat(opt.extra_price).toLocaleString("ar-SY")})
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className="text-left text-sm font-bold text-primary">
                    {parseFloat(item.line_total).toLocaleString("ar-SY")} ل.س
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* الإجمالي */}
          <div className="border-t border-gray-100 pt-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>المجموع الفرعي</span>
              <span>{parseFloat(order.subtotal).toLocaleString("ar-SY")} ل.س</span>
            </div>
            <div className="flex justify-between text-lg font-bold text-primary">
              <span>الإجمالي</span>
              <span>{parseFloat(order.total).toLocaleString("ar-SY")} ل.س</span>
            </div>
          </div>

          <div className="text-xs text-gray-400 text-center">
            أُنشئ في:{" "}
            {new Date(order.created_at).toLocaleString("ar-SY", {
              dateStyle: "short",
              timeStyle: "short",
            })}
          </div>
        </div>
      </aside>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-1.5 border-b border-gray-100">
      <span className="text-gray-500">{label}</span>
      <span className="font-semibold text-ink">{value}</span>
    </div>
  );
}