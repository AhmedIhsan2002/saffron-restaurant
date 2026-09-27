import { useEffect, useMemo, useState } from "react";
import type { Product } from "../../types/product";
import type { SelectedOption } from "../../types/cart";
import { useSettingsStore } from "../../features/settings/settingsStore";
import { useCartStore } from "../../features/cart/cartStore";
import { useToastStore } from "../../features/toast/toastStore";
import Modal from "../common/Modal";
import OptionGroup from "./OptionGroup";
import QuantitySelector from "./QuantitySelector";
import { resolveMediaUrl } from "../../utils/media";
import heroImage from "../../assets/generated/hero-grill.jpg";

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
}

export default function ProductModal({ product, onClose }: ProductModalProps) {
  const settings = useSettingsStore((s) => s.settings);
  const addItem = useCartStore((s) => s.addItem);
  const showToast = useToastStore((s) => s.show);

  const currency = settings?.currency_symbol || "ل.س";

  const [quantity, setQuantity] = useState(1);
  // خريطة: optionId → valueIds[]
  const [selections, setSelections] = useState<Record<number, number[]>>({});
  const [errors, setErrors] = useState<Record<number, string>>({});

  // إعادة الضبط عند تغيير المنتج
  useEffect(() => {
    if (!product) return;
    setQuantity(1);

    // تهيئة الخيارات: single مع قيمة افتراضية = أول قيمة، multiple = []
    const initial: Record<number, number[]> = {};
    product.options?.forEach((opt) => {
      if (opt.type === "single" && opt.values.length > 0) {
        initial[opt.id] = [opt.values[0].id];
      } else {
        initial[opt.id] = [];
      }
    });
    setSelections(initial);
    setErrors({});
  }, [product]);

  // السعر الإجمالي = (السعر + إضافات) × الكمية
  const { totalPrice, selectedOptionsSnapshot } = useMemo(() => {
    if (!product) {
      return { unitPrice: 0, totalPrice: 0, selectedOptionsSnapshot: [] };
    }

    const basePrice = parseFloat(product.price);
    let extrasSum = 0;
    const snapshot: SelectedOption[] = [];

    product.options?.forEach((opt) => {
      const selectedIds = selections[opt.id] || [];
      selectedIds.forEach((valueId) => {
        const value = opt.values.find((v) => v.id === valueId);
        if (value) {
          extrasSum += parseFloat(value.extra_price);
          snapshot.push({
            option_id: opt.id,
            option_name: opt.name,
            value_id: value.id,
            value_name: value.name,
            extra_price: value.extra_price,
          });
        }
      });
    });

    const unit = basePrice + extrasSum;
    return {
      unitPrice: unit,
      totalPrice: unit * quantity,
      selectedOptionsSnapshot: snapshot,
    };
  }, [product, selections, quantity]);

  // التحقق من الخيارات المطلوبة
  const validate = (): boolean => {
    if (!product) return false;

    const newErrors: Record<number, string> = {};
    product.options?.forEach((opt) => {
      if (opt.is_required) {
        const selected = selections[opt.id] || [];
        if (selected.length === 0) {
          newErrors[opt.id] = `«${opt.name}» مطلوب`;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddToCart = () => {
    if (!product) return;

    if (!validate()) {
      // مرّر لأعلى المودال (إن كان الخطأ أعلى)
      return;
    }

    addItem({
      product_id: product.id,
      name: product.name,
      price: product.price,
      quantity,
      image: product.image,
      selected_options: selectedOptionsSnapshot,
    });

    showToast(`أُضيف «${product.name}» إلى السلة`, "success");
    onClose();
  };

  if (!product) return null;

  const hasDiscount =
    product.old_price && parseFloat(product.old_price) > parseFloat(product.price);

  return (
    <Modal open={!!product} onClose={onClose} maxWidth="md">
      {/* الصورة */}
      <div className="relative aspect-video md:aspect-[16/9] bg-gradient-to-br from-cream to-gray-100">
        {resolveMediaUrl(product.image) ? (
          <img
            src={resolveMediaUrl(product.image) || heroImage}
            alt={product.name}
            className="w-full h-full object-cover"
            onError={(event) => { event.currentTarget.src = heroImage; }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl text-primary/30">
            🍽️
          </div>
        )}

        {/* زر الإغلاق فوق الصورة */}
        <button
          onClick={onClose}
          className="absolute top-3 left-3 w-9 h-9 flex items-center justify-center rounded-full bg-white/90 backdrop-blur hover:bg-white text-gray-700 shadow-md transition"
          aria-label="إغلاق"
        >
          ✕
        </button>

        {product.is_featured && (
          <span className="absolute top-3 right-3 bg-accent text-white text-xs font-bold px-3 py-1 rounded-full shadow">
            مميّز
          </span>
        )}
      </div>

      {/* التفاصيل */}
      <div className="p-5">
        <h2 className="text-2xl font-bold text-primary mb-2">{product.name}</h2>

        {product.description && (
          <p className="text-gray-600 text-sm leading-relaxed mb-4">
            {product.description}
          </p>
        )}

        {/* السعر الأساسي */}
        <div className="flex items-baseline gap-3 mb-6">
          <span className="text-2xl font-bold text-primary">
            {parseFloat(product.price).toLocaleString("ar-SY")} {currency}
          </span>
          {hasDiscount && (
            <span className="text-base text-gray-400 line-through">
              {parseFloat(product.old_price!).toLocaleString("ar-SY")}
            </span>
          )}
        </div>

        {/* الخيارات */}
        {product.options && product.options.length > 0 && (
          <div className="mb-4">
            {product.options
              .sort((a, b) => a.sort_order - b.sort_order)
              .map((opt) => (
                <OptionGroup
                  key={opt.id}
                  option={opt}
                  selectedValueIds={selections[opt.id] || []}
                  onChange={(valueIds) =>
                    setSelections((prev) => ({ ...prev, [opt.id]: valueIds }))
                  }
                  error={errors[opt.id]}
                />
              ))}
          </div>
        )}

        {/* الكمية */}
        <div className="flex items-center justify-between mb-6 pt-4 border-t border-gray-100">
          <span className="font-bold text-primary">الكمية</span>
          <QuantitySelector value={quantity} onChange={setQuantity} />
        </div>

        {/* زر الإضافة (ثابت أسفل) */}
        <button
          onClick={handleAddToCart}
          className="w-full bg-accent text-white py-4 rounded-full font-bold text-lg hover:opacity-90 transition shadow-lg flex items-center justify-center gap-3"
        >
          <span>أضف إلى السلة</span>
          <span className="bg-white/20 px-3 py-1 rounded-full text-base">
            {totalPrice.toLocaleString("ar-SY")} {currency}
          </span>
        </button>
      </div>
    </Modal>
  );
}
