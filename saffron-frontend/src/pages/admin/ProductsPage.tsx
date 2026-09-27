import { useCallback, useEffect, useState } from "react";
import { adminProductApi } from "../../services/adminProductApi";
import { adminCategoryApi } from "../../services/adminCategoryApi";
import { useToastStore } from "../../features/toast/toastStore";
import type { Product } from "../../types/product";
import type { Category } from "../../types/category";
import ProductFormModal from "../../components/admin/ProductFormModal";
import EmptyState from "../../components/common/EmptyState";
import ErrorState from "../../components/common/ErrorState";
import { resolveMediaUrl } from "../../utils/media";

export default function ProductsPage() {
  const showToast = useToastStore((s) => s.show);

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<number | "all">("all");
  const [activeFilter, setActiveFilter] = useState<"all" | "active" | "inactive">(
    "all"
  );
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Debounce البحث
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  // إعادة تعيين الصفحة عند تغيير الفلاتر
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, categoryFilter, activeFilter]);

  // تحميل الفئات (مرة واحدة)
  useEffect(() => {
    adminCategoryApi.getAll().then(setCategories).catch(console.error);
  }, []);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await adminProductApi.getAll({
        search: debouncedSearch.trim() || undefined,
        category_id: categoryFilter === "all" ? undefined : categoryFilter,
        is_active:
          activeFilter === "all" ? undefined : activeFilter === "active",
        page,
      });

      setProducts(res.data);
      setLastPage(res.meta.last_page);
      setTotal(res.meta.total);
    } catch (err) {
      console.error(err);
      setError("تعذّر تحميل المنتجات");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, categoryFilter, activeFilter, page]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setFormOpen(true);
  };

  const handleOpenEdit = async (product: Product) => {
    try {
      // نجلب التفاصيل الكاملة مع الخيارات
      const full = await adminProductApi.getOne(product.id);
      setEditingProduct(full);
      setFormOpen(true);
    } catch {
      showToast("تعذّر تحميل تفاصيل المنتج", "error");
    }
  };

  const handleSaved = () => {
    // أعد الجلب للحفاظ على الترتيب والصفحة
    loadProducts();
  };

  const handleDelete = async (product: Product) => {
    const confirmed = window.confirm(
      `هل تريد حذف «${product.name}»؟\nهذا الإجراء لا يمكن التراجع عنه.`
    );
    if (!confirmed) return;

    setDeletingId(product.id);

    try {
      await adminProductApi.delete(product.id);
      setProducts((prev) => prev.filter((p) => p.id !== product.id));
      setTotal((t) => t - 1);
      showToast("تم حذف المنتج", "success");
    } catch (err: unknown) {
      const apiErr = err as {
        response?: { status?: number; data?: { message?: string; hint?: string } };
      };

      if (apiErr.response?.status === 409) {
        const hint = apiErr.response.data?.hint
          ? `\n${apiErr.response.data.hint}`
          : "";
        showToast(
          (apiErr.response.data?.message || "لا يمكن حذف المنتج") + hint,
          "error",
          5000
        );
      } else {
        showToast("تعذّر حذف المنتج", "error");
      }
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      {/* الرأس */}
      <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-primary">المنتجات</h1>
          <p className="text-sm text-gray-500 mt-1">
            إدارة منتجات المنيو ({total})
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="bg-accent text-white px-5 py-2.5 rounded-full font-bold hover:opacity-90 transition shadow-md flex items-center gap-2"
        >
          <span className="text-lg leading-none">+</span>
          إضافة منتج
        </button>
      </div>

      {/* الفلاتر */}
      <div className="bg-white rounded-2xl shadow-sm p-4 mb-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* البحث */}
          <div className="relative md:col-span-2">
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
              placeholder="ابحث بالاسم أو slug..."
              className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 pr-10 pl-4 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
            />
          </div>

          {/* الفئة */}
          <select
            value={categoryFilter}
            onChange={(e) =>
              setCategoryFilter(
                e.target.value === "all" ? "all" : Number(e.target.value)
              )
            }
            className="bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
          >
            <option value="all">جميع الفئات</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* فلتر الحالة */}
        <div className="flex gap-2">
          {(["all", "active", "inactive"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition ${
                activeFilter === f
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {f === "all" ? "الكل" : f === "active" ? "نشطة" : "معطّلة"}
            </button>
          ))}
        </div>
      </div>

      {/* الجدول */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState message={error} onRetry={loadProducts} />
        ) : products.length === 0 ? (
          <EmptyState
            icon="🍽️"
            title="لا توجد منتجات"
            description={
              debouncedSearch || categoryFilter !== "all" || activeFilter !== "all"
                ? "لا توجد نتائج مطابقة للفلاتر"
                : "ابدأ بإضافة أول منتج"
            }
            action={
              !debouncedSearch && categoryFilter === "all" && activeFilter === "all" ? (
                <button
                  onClick={handleOpenCreate}
                  className="bg-accent text-white px-6 py-2 rounded-full font-semibold hover:opacity-90"
                >
                  إضافة منتج
                </button>
              ) : undefined
            }
          />
        ) : (
          <>
            {/* سطح المكتب */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr className="text-right">
                    <th className="px-4 py-3 font-bold text-gray-600">المنتج</th>
                    <th className="px-4 py-3 font-bold text-gray-600">الفئة</th>
                    <th className="px-4 py-3 font-bold text-gray-600">السعر</th>
                    <th className="px-4 py-3 font-bold text-gray-600">خيارات</th>
                    <th className="px-4 py-3 font-bold text-gray-600">الحالة</th>
                    <th className="px-4 py-3 font-bold text-gray-600">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {p.image ? (
                            <img
                              src={resolveMediaUrl(p.image) || undefined}
                              alt={p.name}
                              className="w-10 h-10 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-cream flex items-center justify-center text-primary/40">
                              🍽️
                            </div>
                          )}
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-ink">
                                {p.name}
                              </span>
                              {p.is_featured && (
                                <span className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full font-bold">
                                  مميّز
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-gray-400 font-mono">
                              {p.slug}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {p.category?.name || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-bold text-primary">
                          {parseFloat(p.price).toLocaleString("ar-SY")}
                        </div>
                        {p.old_price && (
                          <div className="text-xs text-gray-400 line-through">
                            {parseFloat(p.old_price).toLocaleString("ar-SY")}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {p.options?.length || 0}
                      </td>
                      <td className="px-4 py-3">
                        {p.is_active ? (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-semibold">
                            ✓ نشط
                          </span>
                        ) : (
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full font-semibold">
                            معطّل
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleOpenEdit(p)}
                            className="text-xs text-primary hover:underline font-semibold"
                          >
                            تعديل
                          </button>
                          <button
                            onClick={() => handleDelete(p)}
                            disabled={deletingId === p.id}
                            className="text-xs text-red-600 hover:underline font-semibold disabled:opacity-50"
                          >
                            {deletingId === p.id ? "..." : "حذف"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* الهاتف */}
            <div className="md:hidden divide-y divide-gray-50">
              {products.map((p) => (
                <div key={p.id} className="p-4">
                  <div className="flex items-start gap-3 mb-3">
                    {p.image ? (
                      <img
                        src={resolveMediaUrl(p.image) || undefined}
                        alt={p.name}
                        className="w-14 h-14 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-lg bg-cream flex items-center justify-center text-primary/40 text-xl">
                        🍽️
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <h3 className="font-bold text-primary">{p.name}</h3>
                        {p.is_featured && (
                          <span className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full">
                            مميّز
                          </span>
                        )}
                        {!p.is_active && (
                          <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                            معطّل
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">
                        {p.category?.name} • {p.options?.length || 0} خيار
                      </p>
                      <p className="font-bold text-primary mt-1">
                        {parseFloat(p.price).toLocaleString("ar-SY")} ل.س
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenEdit(p)}
                      className="flex-1 text-sm py-2 rounded-lg bg-gray-100 text-primary font-semibold hover:bg-gray-200 transition"
                    >
                      تعديل
                    </button>
                    <button
                      onClick={() => handleDelete(p)}
                      disabled={deletingId === p.id}
                      className="flex-1 text-sm py-2 rounded-lg bg-red-50 text-red-600 font-semibold hover:bg-red-100 transition disabled:opacity-50"
                    >
                      {deletingId === p.id ? "..." : "حذف"}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* الترقيم */}
            {lastPage > 1 && (
              <div className="flex items-center justify-between p-4 border-t border-gray-100">
                <span className="text-xs text-gray-500">
                  إجمالي {total} منتج
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

      {/* النموذج */}
      <ProductFormModal
        open={formOpen}
        product={editingProduct}
        categories={categories}
        onClose={() => setFormOpen(false)}
        onSaved={handleSaved}
      />
    </div>
  );
}

function LoadingState() {
  return (
    <div className="p-8 space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-14 bg-gray-100 rounded-lg animate-pulse" />
      ))}
    </div>
  );
}