import { Link } from "react-router-dom";
import { useCartStore } from "../../features/cart/cartStore";
import { useSettingsStore } from "../../features/settings/settingsStore";
import logoMark from "../../assets/generated/logo-mark.png";
import ThemeToggle from "../common/ThemeToggle";

interface PublicHeaderProps {
  onCartClick: () => void;
}

export default function PublicHeader({ onCartClick }: PublicHeaderProps) {
  const settings = useSettingsStore((s) => s.settings);
  const cartCount = useCartStore((s) =>
    s.items.reduce((sum, item) => sum + item.quantity, 0)
  );
  const restaurantName = settings?.restaurant_name || "شفرة";

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link to="/" className="brand-lockup" aria-label={`العودة إلى ${restaurantName}`}>
          <span className="brand-mark-wrap">
            <img src={logoMark} alt="" className="brand-mark" />
          </span>
          <span className="brand-copy">
            <span className="brand-name">{restaurantName}</span>
            <span className="brand-caption">مذاق شامي يُحكى</span>
          </span>
        </Link>

        <div className="header-actions">
          <ThemeToggle />
          <a className="header-link" href="#menu">المنيو</a>
          <button
            onClick={onCartClick}
            className="cart-button"
            aria-label={`السلة ${cartCount > 0 ? `(${cartCount} عنصر)` : "فارغة"}`}
          >
            <span className="cart-icon" aria-hidden="true">↙</span>
            <span className="cart-label">السلة</span>
            {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
          </button>
        </div>
      </div>
    </header>
  );
}
