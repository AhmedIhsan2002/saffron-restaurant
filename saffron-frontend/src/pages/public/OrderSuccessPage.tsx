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
  pending: "bg-yellow-100 text-yellow-800",
  preparing: "bg-blue-100 text-blue-800",
  served: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function OrderSuccessPage() {
  const { publicToken } = useParams<{ publicToken: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const currency = useSettingsStore((s) => s.settings?.currency_symbol || "ل.س");

  useEffect(() => {
    if (!publicToken) return;

    let cancelled = false;

    orderApi
      .getStatus(publicToken)
      .then((data) => {
        if (!cancelled) setOrder(data);
      })
      .catch(() => {
        if (!cancelled) setError("لم نتمكن من جلب تفاصيل الطلب");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [publicToken]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 text-center">
      {/* أيقونة النجاح */}
      <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
        <svg
          className="w-10 h-10 text-green-600"
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
      </div>

      <h1 className="text-2xl md:text-3xl font-bold text-primary mb-2">
        تم استلام طلبك
      </h1>
      <p className="text-gray-600 mb-8">
        سنبدأ بتجهيزه قريبًا. شكرًا لك.
      </p>

      {/* بطاقة رقم الطلب */}
      <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
        <p className="text-sm text-gray-500 mb-1">رقم الطلب</p>
        <p className="text-3xl font-bold text-primary tracking-wider mb-4">
          {order?.order_number || "جاري تجهيز الرقم"}
        </p>

        {loading && (
          <div className="flex justify-center">
            <span className="inline-block w-6 h-6 border-2 border-gray-200 border-t-primary rounded-full animate-spin" />
          </div>
        )}

        {order && (
          <>
            <div className="flex items-center justify-center gap-3 text-sm text-gray-600">
              <span>الطاولة: {order.table_number}</span>
              <span>•</span>
              <span>
                {parseFloat(order.total).toLocaleString("ar-SY")} {currency}
              </span>
            </div>

            <div className="mt-4">
              <span
                className={`inline-block px-4 py-1.5 rounded-full text-sm font-bold ${
                  statusColors[order.status]
                }`}
              >
                {statusLabels[order.status]}
              </span>
            </div>
          </>
        )}

        {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
      </div>

      {/* الأزرار */}
      <div className="flex flex-col gap-3">
        <Link
          to={`/order-status/${publicToken}`}
          className="bg-primary text-white py-3 rounded-full font-bold hover:bg-accent transition"
        >
          تتبّع الطلب
        </Link>
        <Link
          to="/"
          className="text-gray-600 py-2 text-sm hover:text-primary transition"
        >
          العودة للمنيو
        </Link>
      </div>
    </div>
  );
}
