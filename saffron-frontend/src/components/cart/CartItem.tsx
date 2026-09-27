import type { CartItem as CartItemType } from "../../types/cart";
import { useCartStore } from "../../features/cart/cartStore";
import { useSettingsStore } from "../../features/settings/settingsStore";
import QuantitySelector from "../product/QuantitySelector";
import { resolveMediaUrl } from "../../utils/media";

interface CartItemProps {
  item: CartItemType;
}

export default function CartItem({ item }: CartItemProps) {
  const currency = useSettingsStore((s) => s.settings?.currency_symbol || "ل.س");
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);

  // سعر الوحدة = السعر الأساسي + إضافات الخيارات
  const basePrice = parseFloat(item.price);
  const extrasSum = item.selected_options.reduce(
    (sum, o) => sum + parseFloat(o.extra_price),
    0
  );
  const unitPrice = basePrice + extrasSum;
  const lineTotal = unitPrice * item.quantity;

  return (
    <div className="flex gap-3 p-3 bg-white rounded-xl border border-gray-100">
      {/* الصورة */}
      <div className="w-20 h-20 flex-shrink-0 rounded-lg bg-cream overflow-hidden">
        {resolveMediaUrl(item.image) ? (
          <img
            src={resolveMediaUrl(item.image) || undefined}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-2xl text-primary/30">
            🍽️
          </div>
        )}
      </div>

      {/* التفاصيل */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h4 className="font-bold text-primary text-sm line-clamp-1">
            {item.name}
          </h4>
          <button
            onClick={() => removeItem(item.uid)}
            className="flex-shrink-0 text-gray-400 hover:text-red-500 transition p-1"
            aria-label="حذف"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3"
              />
            </svg>
          </button>
        </div>

        {/* الخيارات المُختارة */}
        {item.selected_options.length > 0 && (
          <ul className="text-xs text-gray-500 mb-2 space-y-0.5">
            {item.selected_options.map((opt, i) => (
              <li key={i}>
                {opt.option_name}: <span className="text-ink">{opt.value_name}</span>
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

        {/* الكمية والسعر */}
        <div className="flex items-center justify-between mt-auto pt-1">
          <QuantitySelector
            value={item.quantity}
            onChange={(q) => updateQuantity(item.uid, q)}
            min={1}
            max={99}
          />

          <div className="text-left">
            <div className="font-bold text-primary text-sm">
              {lineTotal.toLocaleString("ar-SY")} {currency}
            </div>
            {item.quantity > 1 && (
              <div className="text-xs text-gray-400">
                {unitPrice.toLocaleString("ar-SY")} × {item.quantity}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
