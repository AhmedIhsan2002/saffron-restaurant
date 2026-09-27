import { useNavigate } from "react-router-dom";
import { useCartStore } from "../../features/cart/cartStore";
import CartItem from "../../components/cart/CartItem";
import CartSummary from "../../components/cart/CartSummary";
import EmptyCartState from "../../components/cart/EmptyCartState";

export default function CartPage() {
  const items = useCartStore((s) => s.items);
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10">
        <EmptyCartState onClose={() => navigate("/")} />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 pb-40">
      <h1 className="text-2xl font-bold text-primary mb-6">سلة التسوق</h1>

      <div className="space-y-3">
        {items.map((item) => (
          <CartItem key={item.uid} item={item} />
        ))}
      </div>

      <div className="mt-6">
        <CartSummary onCheckout={() => navigate("/checkout")} />
      </div>
    </div>
  );
}
