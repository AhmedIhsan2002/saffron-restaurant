import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { orderApi } from "../../services/orderApi";
import { useSettingsStore } from "../../features/settings/settingsStore";
import type { Order, OrderStatus } from "../../types/order";

const statusLabels: Record<OrderStatus, string> = {
  pending: "قيد المراجعة",
  preparing: "قيد التحضير",
  served: "تم التقديم",
  cancelled: "ملغي",
};

const statusColors: Record<OrderStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  preparing: "bg-blue-100 text-blue-800 border-blue-200",
  served: "bg-green-100 text-green-800 border-green-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
};

const statusSteps: OrderStatus[] = ["pending", "preparing", "served"];

export default function OrderStatusPage() {
  const { publicToken } = useParams<{ publicToken: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const currency = useSettingsStore((s) => s.settings?.currency_symbol || "ل.س");

  const load = () => {
    if (!publicToken) return;
    setLoading(true);
    setError(null);

    orderApi
      .getStatus(publicToken)
      .then(setOrder)
      .catch(() => setError("لم نتمكن من جلب حالة الطلب"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [publicToken]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10 flex justify-center">
        <span className="inline-block w-8 h-8 border-3 border-gray-200 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10 text-center">
        <p className="text-xl font-bold text-primary mb-4">
          {error || "الطلب غير موجود"}
        </p>
        <Link to="/" className="text-accent hover:underline">
          العودة للمنيو
        </Link>
      </div>
    );
  }

  const currentStepIndex = statusSteps.indexOf(order.status);
  const isCancelled = order.status === "cancelled";

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-primary">حالة الطلب</h1>
        <button
          onClick={load}
          className="text-sm text-accent hover:underline"
        >
          تحديث
        </button>
      </div>

      {/* رقم الطلب */}
      <div className="bg-white rounded-2xl shadow-sm p-5 mb-6">
        <p className="text-sm text-gray-500 mb-1">رقم الطلب</p>
        <p className="text-2xl font-bold text-primary tracking-wider mb-4">
          {order.order_number}
        </p>

        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>طاولة: {order.table_number}</span>
          <span>
            {parseFloat(order.total).toLocaleString("ar-SY")} {currency}
          </span>
        </div>
      </div>

      {/* شريط الحالة */}
      <div className="bg-white rounded-2xl shadow-sm p-5 mb-6">
        <p className="text-sm font-bold text-primary mb-4">الحالة الحالية</p>

        <div
          className={`inline-block px-4 py-2 rounded-full border font-bold text-sm mb-6 ${statusColors[order.status]}`}
        >
          {statusLabels[order.status]}
        </div>

        {/* Steps */}
        {!isCancelled && (
          <div className="relative">
            <div className="absolute top-4 right-4 left-4 h-0.5 bg-gray-200" />
            <div
              className="absolute top-4 right-4 h-0.5 bg-accent transition-all duration-500"
              style={{
                width: `calc((100% - 2rem) * ${
                  currentStepIndex / (statusSteps.length - 1)
                })`,
              }}
            />

            <div className="relative flex justify-between">
              {statusSteps.map((step, index) => {
                const isDone = index <= currentStepIndex;
                return (
                  <div key={step} className="flex flex-col items-center gap-2">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center border-4 border-white z-10 transition ${
                        isDone ? "bg-accent" : "bg-gray-200"
                      }`}
                    >
                      {isDone && (
                        <svg
                          className="w-4 h-4 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={3}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </div>
                    <span
                      className={`text-xs font-semibold ${
                        isDone ? "text-primary" : "text-gray-400"
                      }`}
                    >
                      {statusLabels[step]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {isCancelled && (
          <p className="text-sm text-red-600 mt-2">
            تم إلغاء هذا الطلب. إن كان لديك استفسار، تواصل مع الموظف.
          </p>
        )}
      </div>

      {/* تفاصيل العناصر */}
      <div className="bg-white rounded-2xl shadow-sm p-5 mb-6">
        <p className="text-sm font-bold text-primary mb-4">
          عناصر الطلب ({order.items.length})
        </p>

        <div className="space-y-3">
          {order.items.map((item) => (
            <div
              key={item.id}
              className="flex items-start justify-between gap-3 text-sm"
            >
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-ink">{item.name}</p>
                {item.options.length > 0 && (
                  <p className="text-xs text-gray-500 mt-0.5">
                    {item.options.map((o) => o.value_name).join(" • ")}
                  </p>
                )}
              </div>
              <div className="text-left">
                <p className="font-bold text-primary">
                  {parseFloat(item.line_total).toLocaleString("ar-SY")}
                </p>
                <p className="text-xs text-gray-400">× {item.quantity}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-between pt-4 border-t border-gray-100 mt-4 font-bold text-primary">
          <span>الإجمالي</span>
          <span>
            {parseFloat(order.total).toLocaleString("ar-SY")} {currency}
          </span>
        </div>
      </div>

      <Link
        to="/"
        className="block text-center text-gray-500 py-2 text-sm hover:text-primary transition"
      >
        العودة للمنيو
      </Link>
    </div>
  );
}
