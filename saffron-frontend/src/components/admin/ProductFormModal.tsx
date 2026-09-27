import { useEffect, useState, type FormEvent } from "react";
import Modal from "../common/Modal";
import {
  adminProductApi,
  type ProductFormData,
  type ProductFormOption,
} from "../../services/adminProductApi";
import { useToastStore } from "../../features/toast/toastStore";
import type { Product } from "../../types/product";
import type { Category } from "../../types/category";
import OptionsEditor from "./OptionsEditor";
import { resolveMediaUrl } from "../../utils/media";

interface ProductFormModalProps {
  open: boolean;
  product: Product | null;
  categories: Category[];
  onClose: () => void;
  onSaved: () => void;
}

export default function ProductFormModal({
  open,
  product,
  categories,
  onClose,
  onSaved,
}: ProductFormModalProps) {
  const showToast = useToastStore((s) => s.show);
  const isEdit = !!product;

  // حقول أساسية
  const [categoryId, setCategoryId] = useState<number | "">("");
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [price, setPrice] = useState<number>(0);
  const [oldPrice, setOldPrice] = useState<number | "">("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [isActive, setIsActive] = useState(true);

  // خيارات
  const [options, setOptions] = useState<ProductFormOption[]>([]);

  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  // تعبئة النموذج
  useEffect(() => {
    if (!open) return;

    if (product) {
      setCategoryId(product.category?.id || "");
      setName(product.name);
      setSlug(product.slug);
      setDescription(product.description || "");
      setImage(product.image || "");
      setImageFile(null);
      setPrice(parseFloat(product.price));
      setOldPrice(product.old_price ? parseFloat(product.old_price) : "");
      setIsFeatured(product.is_featured);
      setIsActive(true);

      // تحويل الخيارات من Product إلى ProductFormOption
      const opts: ProductFormOption[] =
        product.options?.map((opt) => ({
          name: opt.name,
          type: opt.type,
          is_required: opt.is_required,
          sort_order: opt.sort_order,
          values: opt.values.map((v) => ({
            name: v.name,
            extra_price: parseFloat(v.extra_price),
            sort_order: v.sort_order,
          })),
        })) || [];

      setOptions(opts);
    } else {
      // إنشاء جديد
      setCategoryId(categories[0]?.id || "");
      setName("");
      setSlug("");
      setDescription("");
      setImage("");
      setImageFile(null);
      setPrice(0);
      setOldPrice("");
      setIsFeatured(false);
      setIsActive(true);
      setOptions([]);
    }

    setErrors({});
    setGeneralError(null);
  }, [open, product, categories]);

  // توليد slug تلقائيًا
  const handleNameChange = (value: string) => {
    setName(value);
    if (!isEdit && !slug) {
      const auto = value
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .slice(0, 60);
      setSlug(auto);
    }
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!categoryId) errs.category_id = "الفئة مطلوبة";
    if (!name.trim()) errs.name = "اسم المنتج مطلوب";
    if (!slug.trim()) errs.slug = "المعرّف مطلوب";
    else if (!/^[a-z0-9-]+$/.test(slug.trim())) {
      errs.slug = "المعرّف يقبل أحرفًا إنجليزية صغيرة وأرقامًا وشرطات";
    }
    if (price < 0) errs.price = "السعر لا يمكن أن يكون سالبًا";
    if (oldPrice !== "" && oldPrice <= price) {
      errs.old_price = "السعر القديم يجب أن يكون أكبر من السعر الحالي";
    }
    if (!isEdit && !imageFile && !image.trim()) errs.image = "صورة المنتج مطلوبة للمنتج الجديد";

    // تحقق الخيارات
    options.forEach((opt, i) => {
      if (!opt.name.trim()) {
        errs[`options.${i}.name`] = `الخيار ${i + 1}: الاسم مطلوب`;
      }
      if (opt.values.length === 0) {
        errs[`options.${i}.values`] = `الخيار ${i + 1}: يحتاج قيمة واحدة على الأقل`;
      }
      opt.values.forEach((v, vi) => {
        if (!v.name.trim()) {
          errs[`options.${i}.values.${vi}`] = `الخيار ${i + 1}، القيمة ${vi + 1}: الاسم مطلوب`;
        }
      });
    });

    setErrors(errs);

    if (Object.keys(errs).length > 0) {
      setGeneralError("يرجى تصحيح الأخطاء المُعلَّمة");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (saving) return;

    setGeneralError(null);
    if (!validate()) return;

    setSaving(true);

    try {
      const uploadedImage = imageFile ? await adminProductApi.uploadImage(imageFile) : image.trim() || null;
      const payload: ProductFormData = {
        category_id: Number(categoryId),
        name: name.trim(),
        slug: slug.trim(),
        description: description.trim() || null,
        image: uploadedImage,
        price,
        old_price: oldPrice === "" ? null : oldPrice,
        is_featured: isFeatured,
        is_active: isActive,
        options: options.map((opt) => ({
          name: opt.name.trim(),
          type: opt.type,
          is_required: opt.is_required,
          sort_order: opt.sort_order,
          values: opt.values.map((v) => ({
            name: v.name.trim(),
            extra_price: v.extra_price,
            sort_order: v.sort_order,
          })),
        })),
      };

      if (product) {
        await adminProductApi.update(product.id, payload);
        showToast("تم تحديث المنتج بنجاح", "success");
      } else {
        await adminProductApi.create(payload);
        showToast("تم إنشاء المنتج بنجاح", "success");
      }

      onSaved();
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
        Object.entries(apiErr.response.data.errors).forEach(([k, msgs]) => {
          fe[k] = msgs[0];
        });
        setErrors(fe);
        setGeneralError("تحقق من الحقول المُعلَّمة");
      } else if (apiErr.response?.data?.message) {
        setGeneralError(apiErr.response.data.message);
      } else {
        setGeneralError("تعذّر حفظ المنتج، حاول مجددًا");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "تعديل المنتج" : "إضافة منتج جديد"}
      maxWidth="lg"
      disableBackdropClose
    >
      <form onSubmit={handleSubmit} className="p-5 space-y-5" noValidate>
        {generalError && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
            {generalError}
          </div>
        )}

        {/* الفئة + الاسم */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-primary mb-2">
              الفئة <span className="text-red-500">*</span>
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(Number(e.target.value))}
              disabled={saving}
              className={`w-full px-4 py-2.5 rounded-xl border-2 focus:outline-none transition ${
                errors.category_id
                  ? "border-red-300 focus:border-red-500"
                  : "border-gray-200 focus:border-accent"
              }`}
            >
              <option value="">— اختر —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {errors.category_id && (
              <p className="mt-1 text-sm text-red-600">{errors.category_id}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-bold text-primary mb-2">
              اسم المنتج <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="مثال: حمص بالطحينة"
              disabled={saving}
              className={`w-full px-4 py-2.5 rounded-xl border-2 focus:outline-none transition ${
                errors.name
                  ? "border-red-300 focus:border-red-500"
                  : "border-gray-200 focus:border-accent"
              }`}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>
        </div>

        {/* Slug + الصورة */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-primary mb-2">
              المعرّف (slug) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase())}
              placeholder="hummus"
              dir="ltr"
              disabled={saving}
              className={`w-full px-4 py-2.5 rounded-xl border-2 focus:outline-none transition font-mono text-sm ${
                errors.slug
                  ? "border-red-300 focus:border-red-500"
                  : "border-gray-200 focus:border-accent"
              }`}
            />
            {errors.slug && (
              <p className="mt-1 text-sm text-red-600">{errors.slug}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-bold text-primary mb-2">
              صورة المنتج <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              <input type="file" accept="image/jpeg,image/png,image/webp" disabled={saving} onChange={(e) => setImageFile(e.target.files?.[0] || null)} className="w-full px-3 py-2 rounded-xl border-2 border-gray-200 text-sm" />
              <input type="text" value={image} onChange={(e) => setImage(e.target.value)} placeholder="أو ضع رابط صورة خارجيًا" dir="ltr" disabled={saving} className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-accent transition text-sm" />
              {(imageFile || image) && <img src={imageFile ? URL.createObjectURL(imageFile) : resolveMediaUrl(image) || undefined} alt="معاينة المنتج" className="h-24 w-32 rounded-xl object-cover border border-gray-200" />}
              <p className="text-xs text-gray-500">الصيغ: JPG / PNG / WEBP — الحد الأقصى 5MB</p>
              {errors.image && <p className="text-sm text-red-600">{errors.image}</p>}
            </div>
          </div>
        </div>

        {/* الوصف */}
        <div>
          <label className="block text-sm font-bold text-primary mb-2">
            الوصف <span className="text-gray-400 font-normal">(اختياري)</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            maxLength={2000}
            disabled={saving}
            placeholder="وصف مختصر للمنتج..."
            className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-accent transition text-sm resize-none"
          />
        </div>

        {/* الأسعار */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-primary mb-2">
              السعر <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
              min={0}
              step="any"
              dir="ltr"
              disabled={saving}
              className={`w-full px-4 py-2.5 rounded-xl border-2 focus:outline-none transition ${
                errors.price
                  ? "border-red-300 focus:border-red-500"
                  : "border-gray-200 focus:border-accent"
              }`}
            />
            {errors.price && (
              <p className="mt-1 text-sm text-red-600">{errors.price}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-bold text-primary mb-2">
              السعر القديم <span className="text-gray-400 font-normal">(اختياري)</span>
            </label>
            <input
              type="number"
              value={oldPrice}
              onChange={(e) =>
                setOldPrice(e.target.value === "" ? "" : parseFloat(e.target.value) || 0)
              }
              min={0}
              step="any"
              dir="ltr"
              disabled={saving}
              placeholder="—"
              className={`w-full px-4 py-2.5 rounded-xl border-2 focus:outline-none transition ${
                errors.old_price
                  ? "border-red-300 focus:border-red-500"
                  : "border-gray-200 focus:border-accent"
              }`}
            />
            {errors.old_price && (
              <p className="mt-1 text-sm text-red-600">{errors.old_price}</p>
            )}
          </div>
        </div>

        {/* الحالات */}
        <div className="flex gap-4 flex-wrap">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              disabled={saving}
              className="w-4 h-4 accent-accent"
            />
            <span className="text-sm font-semibold">مميّز</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              disabled={saving}
              className="w-4 h-4 accent-accent"
            />
            <span className="text-sm font-semibold">نشط</span>
          </label>
        </div>

        {/* الخيارات */}
        <div className="border-t border-gray-100 pt-5">
          <h3 className="text-sm font-bold text-primary mb-3">
            الخيارات والقيم
          </h3>
          <OptionsEditor options={options} onChange={setOptions} />
        </div>

        {/* الأزرار */}
        <div className="flex gap-3 pt-2 border-t border-gray-100">
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
              "إنشاء المنتج"
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
