import { useEffect, useMemo, useState } from "react";
import ProductModal from "../../components/product/ProductModal";
import { menuApi } from "../../services/menuApi";
import { settingsApi } from "../../services/settingsApi";
import { useSettingsStore } from "../../features/settings/settingsStore";
import PublicHeader from "../../components/menu/PublicHeader";
import HeroBanner from "../../components/menu/HeroBanner";
import CategoryStrip from "../../components/menu/CategoryStrip";
import ProductGrid from "../../components/menu/ProductGrid";
import SearchBar from "../../components/menu/SearchBar";
import EmptyState from "../../components/common/EmptyState";
import CartDrawer from "../../components/cart/CartDrawer";
import ErrorState from "../../components/common/ErrorState";
import type { Category } from "../../types/category";
import type { Product } from "../../types/product";

export default function HomePage() {
  const setSettings = useSettingsStore((s) => s.setSettings);
  const settings = useSettingsStore((s) => s.settings);
  const ordersClosed = settings?.orders_open === false;
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        const [publicSettings, cats, featured] = await Promise.all([
          settingsApi.getPublic(),
          menuApi.getCategories(),
          menuApi.getFeaturedProducts(),
        ]);
        if (cancelled) return;
        setSettings(publicSettings);
        setCategories(cats);
        setProducts(featured);
      } catch {
        if (!cancelled) setError("تعذّر الاتصال بالخادم، تحقق من اتصالك");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [setSettings]);

  useEffect(() => {
    if (loading) return;
    let cancelled = false;
    async function loadFiltered() {
      try {
        setLoading(true);
        setError(null);
        const result = search.trim().length >= 2
          ? await menuApi.searchProducts(search.trim())
          : activeSlug
            ? await menuApi.getCategoryProducts(activeSlug)
            : await menuApi.getFeaturedProducts();
        if (!cancelled) setProducts(result);
      } catch {
        if (!cancelled) setError("تعذّر تحميل المنتجات");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    const timer = setTimeout(loadFiltered, search ? 300 : 0);
    return () => { cancelled = true; clearTimeout(timer); };
  // loading هنا guard مقصود لمنع إعادة طلب featured مرتين عند التحميل الأول.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSlug, search]);

  const emptyContent = useMemo(() => {
    if (search.trim().length >= 2) {
      return <EmptyState icon="⌕" title="لم نعثر على طلبك" description={`لا توجد أطباق تطابق «${search}»`} action={<button onClick={() => setSearch("")} className="text-button">مسح البحث</button>} />;
    }
    return <EmptyState icon="✦" title="المنيو قيد التحضير" description="سنضيف أطباقًا جديدة قريبًا" />;
  }, [search]);

  const handleOpenProduct = async (product: Product) => {
    setActiveProduct(product);
    try { setActiveProduct(await menuApi.getProduct(product.id)); } catch { /* نستخدم البيانات المختصرة */ }
  };

  return (
    <>
      <PublicHeader onCartClick={() => setCartOpen(true)} />
      {ordersClosed && <div className="closed-notice"><strong>استقبال الطلبات مغلق حاليًا</strong><span>{settings?.working_hours ? `نستقبل الطلبات من ${settings.working_hours.open} إلى ${settings.working_hours.close}` : "الرجاء المحاولة خلال أوقات العمل"}</span></div>}
      {!activeSlug && !search && <HeroBanner />}
      {categories.length > 0 && <CategoryStrip categories={categories} activeSlug={activeSlug} onSelect={(slug) => { setActiveSlug(slug); setSearch(""); }} />}

      {!activeSlug && !search && (
        <section className="experience-section page-shell reveal-up" aria-label="تجربة شفرة">
          <div className="experience-grid">
            <article className="experience-card"><h3>نكهة تُحضّر ببطء</h3><p>مكونات طازجة، وصفات شامية أصيلة، ولمسة عصرية تجعل كل طبق حكاية صغيرة على طاولتك.</p></article>
            <article className="experience-card light"><h3>اطلب بسهولة</h3><p>اختر طبقك، خصصه كما تحب، وأرسل طلبك مباشرة من طاولتك.</p></article>
            <article className="experience-card accent"><h3>لأن التفاصيل تهم</h3><p>نعتني بالتقديم، الجودة، واللحظة التي تجمعكم حول الطعام.</p></article>
          </div>
        </section>
      )}

      <main id="menu" className="page-shell menu-section">
        <div className="menu-heading">
          <div>
            <p className="eyebrow dark"><span /> من مطبخنا إلى طاولتك</p>
            <h2>{activeSlug || search ? "اختر ما تشتهي" : "أطباقنا المميزة"}</h2>
          </div>
          <div className="menu-search"><SearchBar value={search} onChange={setSearch} /></div>
        </div>
        {error && <ErrorState message={error} onRetry={() => window.location.reload()} />}
        {!error && !loading && products.length === 0 && emptyContent}
        {!error && (loading || products.length > 0) && <ProductGrid products={products} loading={loading} onOpen={handleOpenProduct} />}
        <div className="menu-signature"><span>✦</span> نختار الأفضل، ونترك لك متعة الاختيار <span>✦</span></div>
      </main>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      <ProductModal product={activeProduct} onClose={() => setActiveProduct(null)} />
    </>
  );
}
