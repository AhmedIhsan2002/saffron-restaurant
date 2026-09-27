import type { Product } from "../../types/product";
import { useSettingsStore } from "../../features/settings/settingsStore";
import heroImage from "../../assets/generated/hero-grill.jpg";
import hummusImage from "../../assets/generated/hummus.jpg";
import tawookImage from "../../assets/generated/shish-tawook.jpg";
import knafehImage from "../../assets/generated/knafeh.jpg";
import fattoushImage from "../../assets/generated/fattoush.jpg";
import { resolveMediaUrl } from "../../utils/media";

interface ProductCardProps {
  product: Product;
  onOpen: (product: Product) => void;
}

function fallbackImage(slug: string) {
  if (slug.includes("hummus")) return hummusImage;
  if (slug.includes("tawook") || slug.includes("kebab")) return tawookImage;
  if (slug.includes("knafeh") || slug.includes("dessert")) return knafehImage;
  if (slug.includes("fattoush") || slug.includes("salad")) return fattoushImage;
  return heroImage;
}

export default function ProductCard({ product, onOpen }: ProductCardProps) {
  const settings = useSettingsStore((s) => s.settings);
  const currency = settings?.currency_symbol || "ل.س";
  const image = resolveMediaUrl(product.image) || fallbackImage(product.slug);
  const hasDiscount = product.old_price && parseFloat(product.old_price) > parseFloat(product.price);

  return (
    <article className="product-card">
      <button className="product-image-button" onClick={() => onOpen(product)} aria-label={`عرض ${product.name}`}>
        <img src={image} alt={product.name} className="product-image" loading="lazy" onError={(event) => { event.currentTarget.src = fallbackImage(product.slug); }} />
        <span className="image-shade" />
        {product.is_featured && <span className="product-ribbon">اختيار الشيف</span>}
        {hasDiscount && <span className="discount-ribbon">خصم</span>}
      </button>
      <div className="product-card-body">
        <div className="product-title-row">
          <h3>{product.name}</h3>
          <span className="product-price">{parseFloat(product.price).toLocaleString("ar-SY")} <small>{currency}</small></span>
        </div>
        {product.description && <p className="product-description">{product.description}</p>}
        <div className="product-footer">
          {hasDiscount ? <span className="old-price">{parseFloat(product.old_price!).toLocaleString("ar-SY")} {currency}</span> : <span className="product-note">يُحضّر عند الطلب</span>}
          <button className="product-action" onClick={() => onOpen(product)}>التفاصيل <span aria-hidden="true">+</span></button>
        </div>
      </div>
    </article>
  );
}
