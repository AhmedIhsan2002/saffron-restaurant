import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCartStore } from "../../features/cart/cartStore";
import CartItem from "./CartItem";
import CartSummary from "./CartSummary";
import EmptyCartState from "./EmptyCartState";

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

export default function CartDrawer({ open, onClose }: CartDrawerProps) {
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);
  const navigate = useNavigate();

  // إغلاق بـ ESC + منع تمرير الصفحة
  useEffect(() => {
    if (!open) return;

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleEsc);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = originalOverflow;
    };
  }, [open, onClose]);

  const handleCheckout = () => {
    onClose();
    navigate("/checkout");
  };

  if (!open) return null;

  const isEmpty = items.length === 0;

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
      {/* الخلفية */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-[fadeIn_150ms_ease-out]"
        onClick={onClose}
      />

      {/* الدرج */}
      <aside
        className={`absolute top-0 right-0 h-full w-full max-w-md bg-cream shadow-2xl flex flex-col animate-[slideInRight_250ms_ease-out]`}
      >
        {/* الرأس */}
        <div className="flex items-center justify-between p-4 bg-primary text-white">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold">سلة التسوق</span>
            {!isEmpty && (
              <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
                {items.reduce((sum, i) => sum + i.quantity, 0)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            {!isEmpty && (
              <button
                onClick={() => {
                  if (confirm("هل تريد إفراغ السلة بالكامل؟")) clearCart();
                }}
                className="text-xs opacity-75 hover:opacity-100 px-2 py-1 rounded"
              >
                إفراغ
              </button>
            )}

            <button
              onClick={onClose}
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/10 transition"
              aria-label="إغلاق"
            >
              ✕
            </button>
          </div>
        </div>

        {/* المحتوى */}
        {isEmpty ? (
          <div className="flex-1 flex items-center justify-center p-4">
            <EmptyCartState onClose={onClose} />
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {items.map((item) => (
                <CartItem key={item.uid} item={item} />
              ))}
            </div>

            <CartSummary onCheckout={handleCheckout} />
          </>
        )}
      </aside>
    </div>
  );
}