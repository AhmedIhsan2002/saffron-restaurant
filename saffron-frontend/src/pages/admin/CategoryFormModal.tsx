import { useEffect, useState, type FormEvent } from "react";
import Modal from "../../components/common/Modal";
import {
  adminCategoryApi,
  type CategoryFormData,
} from "../../services/adminCategoryApi";
import { useToastStore } from "../../features/toast/toastStore";
import type { Category } from "../../types/category";
import { resolveMediaUrl } from "../../utils/media";

interface CategoryFormModalProps {
  open: boolean;
  category: Category | null; // null = إنشاء جديد
  onClose: () => void;
  onSaved: (category: Category, isNew: boolean) => void;
}

export default function CategoryFormModal({
  open,
  category,
  onClose,
  onSaved,
}: CategoryFormModalProps) {
  const showToast = useToastStore((s) => s.show);
  const isEdit = !!category;

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [image, setImage] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [sortOrder, setSortOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);

  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  // إعادة ضبط النموذج عند الفتح
  useEffect(() => {
    if (!open) return;

    if (category) {
      setName(category.name);
      setSlug(category.slug);
      setImage(category.image || "");
      setImageFile(null);
      setSortOrder(category.sort_order);
      setIsActive(category.is_active);
    } else {
      setName("");
      setSlug("");
      setImage("");
      setImageFile(null);
      setSortOrder(0);
      setIsActive(true);
    }

    setErrors({});
    setGeneralError(null);
  }, [open, category]);

  // توليد slug تلقائيًا من الاسم (فقط عند الإنشاء، ولم يُكتب يدويًا)
  const handleNameChange = (value: string) => {
    setName(value);
    if (!isEdit && !slug) {
      const autoSlug = value
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .slice(0, 60);
      setSlug(autoSlug);
    }
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!name.trim()) errs.name = "الاسم مطلوب";
    else if (name.trim().length < 2) errs.name = "الاسم قصير جدًا";

    if (!slug.trim()) errs.slug = "المعرّف (slug) مطلوب";
    else if (!/^[a-z0-9-]+$/.test(slug.trim())) {
      errs.slug = "المعرّف يقبل أحرفًا إنجليزية صغيرة وأرقامًا وشرطات فقط";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (saving) return;

    setGeneralError(null);
    if (!validate()) return;

    setSaving(true);

    try {
      const uploadedImage = imageFile ? await adminCategoryApi.uploadImage(imageFile) : image.trim() || null;
      const payload: CategoryFormData = {
        name: name.trim(),
        slug: slug.trim(),
        image: uploadedImage,
        sort_order: sortOrder,
        is_active: isActive,
      };

      const result = category
        ? await adminCategoryApi.update(category.id, payload)
        : await adminCategoryApi.create(payload);

      showToast(
        isEdit ? "تم تحديث الفئة بنجاح" : "تم إنشاء الفئة بنجاح",
        "success"
      );

      onSaved(result, !isEdit);
      onClose();
    } catch (err: unknown) {
      const apiErr = err as {
        response?: {
          status?: number;
          data?: { message?: string; errors?: Record<string, string[]> };
        };
      };

      if (apiErr.response?.status === 422 && apiErr.response.data?.errors) {
        const fe: Record<string, string> = {};
        Object.entries(apiErr.response.data.errors).forEach(([key, msgs]) => {
          fe[key] = msgs[0];
        });
        setErrors(fe);
        setGeneralError("تحقق من الحقول المُعلَّمة");
      } else if (apiErr.response?.data?.message) {
        setGeneralError(apiErr.response.data.message);
      } else {
        setGeneralError("تعذّر حفظ الفئة، حاول مجددًا");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "تعديل الفئة" : "إضافة فئة جديدة"}
      maxWidth="md"
      disableBackdropClose
    >
      <form onSubmit={handleSubmit} className="p-5 space-y-5" noValidate>
        {generalError && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
            {generalError}
          </div>
        )}

        {/* الاسم */}
        <div>
          <label className="block text-sm font-bold text-primary mb-2">
            اسم الفئة <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="مثال: مقبلات"
            className={`w-full px-4 py-2.5 rounded-xl border-2 focus:outline-none transition ${
              errors.name
                ? "border-red-300 focus:border-red-500"
                : "border-gray-200 focus:border-accent"
            }`}
            disabled={saving}
            autoFocus
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
          )}
        </div>

        {/* Slug */}
        <div>
          <label className="block text-sm font-bold text-primary mb-2">
            المعرّف (slug) <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value.toLowerCase())}
            placeholder="مثال: appetizers"
            dir="ltr"
            className={`w-full px-4 py-2.5 rounded-xl border-2 focus:outline-none transition font-mono text-sm ${
              errors.slug
                ? "border-red-300 focus:border-red-500"
                : "border-gray-200 focus:border-accent"
            }`}
            disabled={saving}
          />
          {errors.slug && (
            <p className="mt-1 text-sm text-red-600">{errors.slug}</p>
          )}
          <p className="mt-1 text-xs text-gray-400">
            يُستخدم في الروابط. أحرف إنجليزية وأرقام وشرطات فقط.
          </p>
        </div>

        {/* الصورة */}
        <div>
          <label className="block text-sm font-bold text-primary mb-2">
            صورة الفئة <span className="text-gray-400 font-normal">(اختيارية)</span>
          </label>
          <div className="space-y-2">
            <input type="file" accept="image/jpeg,image/png,image/webp" disabled={saving} onChange={(e) => setImageFile(e.target.files?.[0] || null)} className="w-full px-3 py-2 rounded-xl border-2 border-gray-200 text-sm" />
            <input type="text" value={image} onChange={(e) => setImage(e.target.value)} placeholder="أو ضع رابط صورة خارجيًا" dir="ltr" className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-accent transition text-sm" disabled={saving} />
            {(imageFile || image) && <img src={imageFile ? URL.createObjectURL(imageFile) : resolveMediaUrl(image) || undefined} alt="معاينة الفئة" className="h-24 w-32 rounded-xl object-cover border border-gray-200" />}
            <p className="text-xs text-gray-500">الصيغ: JPG / PNG / WEBP — الحد الأقصى 5MB</p>
          </div>
        </div>

        {/* الترتيب + الحالة */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-primary mb-2">
              الترتيب
            </label>
            <input
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
              min={0}
              max={9999}
              className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-accent transition"
              disabled={saving}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-primary mb-2">
              الحالة
            </label>
            <button
              type="button"
              onClick={() => setIsActive((s) => !s)}
              disabled={saving}
              className={`w-full px-4 py-2.5 rounded-xl border-2 font-semibold transition ${
                isActive
                  ? "bg-green-50 border-green-200 text-green-800"
                  : "bg-gray-50 border-gray-200 text-gray-600"
              }`}
            >
              {isActive ? "✓ نشطة" : "○ معطّلة"}
            </button>
          </div>
        </div>

        {/* الأزرار */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="flex-1 py-3 rounded-full border-2 border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition disabled:opacity-50"
          >
            إلغاء
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 py-3 rounded-full bg-accent text-white font-bold hover:opacity-90 transition shadow-md disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <span className="inline-block w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                جاري الحفظ...
              </>
            ) : isEdit ? (
              "حفظ التعديلات"
            ) : (
              "إنشاء الفئة"
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
