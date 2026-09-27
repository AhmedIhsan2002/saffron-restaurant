import { useCallback, useEffect, useState } from "react";
import { adminCategoryApi } from "../../services/adminCategoryApi";
import { useToastStore } from "../../features/toast/toastStore";
import type { Category } from "../../types/category";
import CategoryFormModal from "../admin/CategoryFormModal";
import EmptyState from "../../components/common/EmptyState";
import ErrorState from "../../components/common/ErrorState";
import { resolveMediaUrl } from "../../utils/media";

export default function CategoriesPage() {
  const showToast = useToastStore((s) => s.show);

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [deletingId, setDeletingId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await adminCategoryApi.getAll();
      setCategories(data);
    } catch (err) {
      console.error(err);
      setError("تعذّر تحميل الفئات");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setEditingCategory(cat);
    setFormOpen(true);
  };

  const handleSaved = (saved: Category, isNew: boolean) => {
    if (isNew) {
      setCategories((prev) => [...prev, saved]);
    } else {
      setCategories((prev) =>
        prev.map((c) => (c.id === saved.id ? saved : c))
      );
    }
  };

  const handleDelete = async (cat: Category) => {
    const confirmed = window.confirm(
      `هل تريد حذف الفئة «${cat.name}»؟\nهذا الإجراء لا يمكن التراجع عنه.`
    );
    if (!confirmed) return;

    setDeletingId(cat.id);

    try {
      await adminCategoryApi.delete(cat.id);
      setCategories((prev) => prev.filter((c) => c.id !== cat.id));
      showToast("تم حذف الفئة", "success");
    } catch (err: unknown) {
      const apiErr = err as {
        response?: { status?: number; data?: { message?: string; hint?: string } };
      };

      if (apiErr.response?.status === 409) {
        showToast(
          apiErr.response.data?.message ||
            "لا يمكن حذف هذه الفئة لارتباطها بمنتجات",
          "error",
          5000
        );
      } else {
        showToast("تعذّر حذف الفئة", "error");
      }
    } finally {
      setDeletingId(null);
    }
  };

  // فلترة محلية (بحث)
  const filtered = categories.filter((cat) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      cat.name.toLowerCase().includes(q) ||
      cat.slug.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      {/* الرأس */}
      <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-primary">الفئات</h1>
          <p className="text-sm text-gray-500 mt-1">
            إدارة فئات المنيو ({categories.length})
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="bg-accent text-white px-5 py-2.5 rounded-full font-bold hover:opacity-90 transition shadow-md flex items-center gap-2"
        >
          <span className="text-lg leading-none">+</span>
          إضافة فئة
        </button>
      </div>

      {/* البحث */}
      <div className="bg-white rounded-2xl shadow-sm p-4 mb-4">
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
            placeholder="ابحث باسم الفئة أو slug..."
            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 pr-10 pl-4 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
          />
        </div>
      </div>

      {/* الجدول */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="📁"
            title={search ? "لا توجد نتائج" : "لا توجد فئات"}
            description={
              search
                ? `لا توجد فئة تطابق "${search}"`
                : "ابدأ بإضافة أول فئة لمنيوك"
            }
            action={
              !search ? (
                <button
                  onClick={handleOpenCreate}
                  className="bg-accent text-white px-6 py-2 rounded-full font-semibold hover:opacity-90"
                >
                  إضافة فئة
                </button>
              ) : undefined
            }
          />
        ) : (
          <>
            {/* عرض سطح المكتب */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr className="text-right">
                    <th className="px-4 py-3 font-bold text-gray-600 w-12">#</th>
                    <th className="px-4 py-3 font-bold text-gray-600">الفئة</th>
                    <th className="px-4 py-3 font-bold text-gray-600">المعرّف</th>
                    <th className="px-4 py-3 font-bold text-gray-600">المنتجات</th>
                    <th className="px-4 py-3 font-bold text-gray-600">الترتيب</th>
                    <th className="px-4 py-3 font-bold text-gray-600">الحالة</th>
                    <th className="px-4 py-3 font-bold text-gray-600">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((cat) => (
                    <tr key={cat.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3 text-gray-400 font-mono text-xs">
                        {cat.id}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {cat.image ? (
                            <img
                              src={resolveMediaUrl(cat.image) || undefined}
                              alt={cat.name}
                              className="w-10 h-10 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-cream flex items-center justify-center text-primary/40">
                              📁
                            </div>
                          )}
                          <span className="font-semibold text-ink">
                            {cat.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-500">
                        {cat.slug}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-block bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs font-bold">
                          {cat.products_count ?? 0}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{cat.sort_order}</td>
                      <td className="px-4 py-3">
                        {cat.is_active ? (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-semibold">
                            ✓ نشطة
                          </span>
                        ) : (
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full font-semibold">
                            معطّلة
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleOpenEdit(cat)}
                            className="text-xs text-primary hover:underline font-semibold"
                          >
                            تعديل
                          </button>
                          <button
                            onClick={() => handleDelete(cat)}
                            disabled={deletingId === cat.id}
                            className="text-xs text-red-600 hover:underline font-semibold disabled:opacity-50"
                          >
                            {deletingId === cat.id ? "..." : "حذف"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* عرض الهاتف */}
            <div className="md:hidden divide-y divide-gray-50">
              {filtered.map((cat) => (
                <div key={cat.id} className="p-4">
                  <div className="flex items-start gap-3 mb-3">
                    {cat.image ? (
                      <img
                        src={resolveMediaUrl(cat.image) || undefined}
                        alt={cat.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-cream flex items-center justify-center text-primary/40 text-xl">
                        📁
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="font-bold text-primary">{cat.name}</h3>
                        {!cat.is_active && (
                          <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                            معطّلة
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 font-mono">
                        {cat.slug}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {cat.products_count ?? 0} منتج • ترتيب {cat.sort_order}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenEdit(cat)}
                      className="flex-1 text-sm py-2 rounded-lg bg-gray-100 text-primary font-semibold hover:bg-gray-200 transition"
                    >
                      تعديل
                    </button>
                    <button
                      onClick={() => handleDelete(cat)}
                      disabled={deletingId === cat.id}
                      className="flex-1 text-sm py-2 rounded-lg bg-red-50 text-red-600 font-semibold hover:bg-red-100 transition disabled:opacity-50"
                    >
                      {deletingId === cat.id ? "..." : "حذف"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* النموذج */}
      <CategoryFormModal
        open={formOpen}
        category={editingCategory}
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
        <div
          key={i}
          className="h-12 bg-gray-100 rounded-lg animate-pulse"
        />
      ))}
    </div>
  );
}