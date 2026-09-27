import { useCartStore } from "../../features/cart/cartStore";
import { useSettingsStore } from "../../features/settings/settingsStore";

interface CartSummaryProps {
  onCheckout: () => void;
}

export default function CartSummary({ onCheckout }: CartSummaryProps) {
  const settings = useSettingsStore((s) => s.settings);
  const getSubtotal = useCartStore((s) => s.getSubtotal);
  const getTotal = useCartStore((s) => s.getTotal);
  const itemsCount = useCartStore((s) =>
    s.items.reduce((sum, i) => sum + i.quantity, 0)
  );

  const currency = settings?.currency_symbol || "ل.س";
  const taxRate = settings?.tax_rate ?? 0;

  const subtotal = getSubtotal();
  const total = getTotal(taxRate);
  const taxAmount = total - subtotal;

  if (itemsCount === 0) return null;

  return (
    <div className="border-t border-gray-200 bg-white p-4 space-y-3">
      {/* المجموع الفرعي */}
      <div className="flex justify-between text-sm text-gray-600">
        <span>المجموع الفرعي</span>
        <span className="font-semibold">
          {subtotal.toLocaleString("ar-SY")} {currency}
        </span>
      </div>

      {/* الضريبة (إن وُجدت) */}
      {taxRate > 0 && (
        <div className="flex justify-between text-sm text-gray-600">
          <span>الضريبة ({taxRate}%)</span>
          <span className="font-semibold">
            {taxAmount.toLocaleString("ar-SY")} {currency}
          </span>
        </div>
      )}

      {/* الإجمالي */}
      <div className="flex justify-between text-base font-bold text-primary pt-3 border-t border-gray-100">
        <span>الإجمالي</span>
        <span>
          {total.toLocaleString("ar-SY")} {currency}
        </span>
      </div>

      {/* زر إتمام الطلب */}
      <button
        onClick={onCheckout}
        className="w-full bg-accent text-white py-3 rounded-full font-bold hover:opacity-90 transition shadow-md"
      >
        إتمام الطلب
      </button>
    </div>
  );
}