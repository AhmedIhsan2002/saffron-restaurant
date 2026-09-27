import { useCallback, useEffect, useMemo, useState } from "react";
import { adminOrderApi } from "../../services/adminOrderApi";
import { useToastStore } from "../../features/toast/toastStore";
import type { Order, OrderStatus } from "../../types/order";
import OrderStatusDropdown from "../../components/admin/OrderStatusDropdown";
import OrderDetailsDrawer from "../../components/admin/OrderDetailsDrawer";
import { statusLabels } from "../../components/admin/OrderStatusBadge";
import EmptyState from "../../components/common/EmptyState";
import ErrorState from "../../components/common/ErrorState";

interface Stats {
  pending: number;
  preparing: number;
  served: number;
  cancelled: number;
  today: number;
  today_revenue: string;
}

type StatusFilter = OrderStatus | "all";

export default function OrdersPage() {
  const showToast = useToastStore((s) => s.show);

  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Debounce للبحث
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  // إعادة تعيين الصفحة عند تغيير الفلاتر
  useEffect(() => {
    setPage(1);
  }, [statusFilter, debouncedSearch]);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await adminOrderApi.getOrders({
        status: statusFilter === "all" ? undefined : statusFilter,
        search: debouncedSearch.trim() || undefined,
        page,
      });

      setOrders(res.data);
      setLastPage(res.meta.last_page);
      setTotal(res.meta.total);
    } catch (err) {
      console.error(err);
      setError("تعذّر تحميل الطلبات");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, debouncedSearch, page]);

  const loadStats = useCallback(async () => {
    try {
      const data = await adminOrderApi.getStats();
      setStats(data);
    } catch {
      // فشل الإحصائيات ليس حرجًا
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const handleStatusChange = async (order: Order, newStatus: OrderStatus) => {
    try {
      const updated = await adminOrderApi.updateStatus(order.id, newStatus);
      // حدّث الطلب في القائمة
      setOrders((prev) =>
        prev.map((o) => (o.id === updated.id ? { ...o, status: updated.status } : o))
      );
      // حدّث المودال إن كان مفتوحًا
      if (selectedOrder?.id === updated.id) {
        setSelectedOrder({ ...selectedOrder, status: updated.status });
      }
      // حدّث الإحصائيات
      loadStats();
      showToast(`تم تحديث الحالة إلى «${statusLabels[newStatus]}»`, "success");
    } catch {
      showToast("فشل تحديث الحالة", "error");
    }
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString("ar-SY", {
      dateStyle: "short",
      timeStyle: "short",
    });

  const filters: { key: StatusFilter; label: string }[] = useMemo(
    () => [
      { key: "all", label: "الكل" },
      { key: "pending", label: "قيد المراجعة" },
      { key: "preparing", label: "قيد التحضير" },
      { key: "served", label: "تم التقديم" },
      { key: "cancelled", label: "ملغي" },
    ],
    []
  );

  return (
    <div>
      {/* الرأس */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-primary">الطلبات</h1>
        <p className="text-sm text-gray-500 mt-1">
          إدارة طلبات الزبائن وتحديث حالاتها
        </p>
      </div>

      {/* الإحصائيات */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <StatCard
            label="قيد المراجعة"
            value={stats.pending}
            color="bg-yellow-50 border-yellow-200 text-yellow-800"
          />
          <StatCard
            label="قيد التحضير"
            value={stats.preparing}
            color="bg-blue-50 border-blue-200 text-blue-800"
          />
          <StatCard
            label="تم التقديم"
            value={stats.served}
            color="bg-green-50 border-green-200 text-green-800"
          />
          <StatCard
            label="طلبات اليوم"
            value={stats.today}
            color="bg-purple-50 border-purple-200 text-purple-800"
            hint={`${parseFloat(stats.today_revenue).toLocaleString("ar-SY")} ل.س`}
          />
        </div>
      )}

      {/* الفلاتر */}
      <div className="bg-white rounded-2xl shadow-sm p-4 mb-4 space-y-3">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setStatusFilter(f.key)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold transition ${
                statusFilter === f.key
                  ? "bg-primary text-white shadow"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="relative">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث برقم الطلب أو رقم الطاولة..."
            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 pr-10 pl-4 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
          />
        </div>
      </div>

      {/* الجدول */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState message={error} onRetry={loadOrders} />
        ) : orders.length === 0 ? (
          <EmptyState
            icon="📋"
            title="لا توجد طلبات"
            description={
              debouncedSearch || statusFilter !== "all"
                ? "لا توجد نتائج مطابقة للفلاتر الحالية"
                : "لم يستقبل المطعم أي طلبات بعد"
            }
          />
        ) : (
          <>
            {/* عرض سطح المكتب */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr className="text-right">
                    <th className="px-4 py-3 font-bold text-gray-600">رقم الطلب</th>
                    <th className="px-4 py-3 font-bold text-gray-600">الطاولة</th>
                    <th className="px-4 py-3 font-bold text-gray-600">الزبون</th>
                    <th className="px-4 py-3 font-bold text-gray-600">العناصر</th>
                    <th className="px-4 py-3 font-bold text-gray-600">الإجمالي</th>
                    <th className="px-4 py-3 font-bold text-gray-600">الحالة</th>
                    <th className="px-4 py-3 font-bold text-gray-600">التاريخ</th>
                    <th className="px-4 py-3 font-bold text-gray-600">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {orders.map((order) => (
                    <tr
                      key={order.id}
                      className="hover:bg-gray-50 cursor-pointer transition"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <td className="px-4 py-3 font-mono text-xs font-bold text-primary">
                        {order.order_number}
                      </td>
                      <td className="px-4 py-3 text-gray-700">{order.table_number}</td>
                      <td className="px-4 py-3 text-gray-700">
                        {order.guest_name || "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {order.items.length}
                      </td>
                      <td className="px-4 py-3 font-semibold text-primary">
                        {parseFloat(order.total).toLocaleString("ar-SY")} ل.س
                      </td>
                      <td
                        className="px-4 py-3"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <OrderStatusDropdown
                          current={order.status}
                          onChange={(s) => handleStatusChange(order, s)}
                        />
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {formatDate(order.created_at)}
                      </td>
                      <td
                        className="px-4 py-3"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="text-xs text-accent hover:underline"
                        >
                          التفاصيل
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* عرض الهاتف (بطاقات) */}
            <div className="md:hidden divide-y divide-gray-50">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="p-4 hover:bg-gray-50 transition"
                  onClick={() => setSelectedOrder(order)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-mono text-xs font-bold text-primary">
                        {order.order_number}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        طاولة {order.table_number}
                        {order.guest_name && ` • ${order.guest_name}`}
                      </p>
                    </div>
                    <div onClick={(e) => e.stopPropagation()}>
                      <OrderStatusDropdown
                        current={order.status}
                        onChange={(s) => handleStatusChange(order, s)}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">
                      {order.items.length} عنصر
                    </span>
                    <span className="font-bold text-primary">
                      {parseFloat(order.total).toLocaleString("ar-SY")} ل.س
                    </span>
                  </div>

                  <p className="text-xs text-gray-400 mt-2">
                    {formatDate(order.created_at)}
                  </p>
                </div>
              ))}
            </div>

            {/* الترقيم */}
            {lastPage > 1 && (
              <div className="flex items-center justify-between p-4 border-t border-gray-100">
                <span className="text-xs text-gray-500">
                  إجمالي {total} طلب
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1.5 text-sm rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    السابق
                  </button>
                  <span className="px-3 py-1.5 text-sm font-semibold text-primary">
                    {page} / {lastPage}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
                    disabled={page === lastPage}
                    className="px-3 py-1.5 text-sm rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    التالي
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* تفاصيل الطلب */}
      <OrderDetailsDrawer
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
  hint,
}: {
  label: string;
  value: number;
  color: string;
  hint?: string;
}) {
  return (
    <div className={`border-2 rounded-2xl p-4 ${color}`}>
      <p className="text-xs font-semibold opacity-80 mb-1">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
      {hint && <p className="text-xs opacity-75 mt-1">{hint}</p>}
    </div>
  );
}

function LoadingState() {
  return (
    <div className="p-8 space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="h-12 bg-gray-100 rounded-lg animate-pulse"
        />
      ))}
    </div>
  );
}