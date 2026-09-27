import type { Product } from "../../types/product";
import ProductCard from "./ProductCard";
import Skeleton from "../common/Skeleton";

interface ProductGridProps {
  products: Product[];
  loading?: boolean;
  onOpen: (product: Product) => void;
}

export default function ProductGrid({ products, loading = false, onOpen }: ProductGridProps) {
  if (loading) {
    return (
      <div className="product-grid" aria-busy="true" aria-label="جاري تحميل المنتجات">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="product-skeleton"><Skeleton className="skeleton-image" /><div className="skeleton-copy"><Skeleton className="h-4 w-3/4" /><Skeleton className="h-3 w-full" /><Skeleton className="h-3 w-1/2" /></div></div>
        ))}
      </div>
    );
  }

  return <div className="product-grid">{products.map((product) => <ProductCard key={product.id} product={product} onOpen={onOpen} />)}</div>;
}
