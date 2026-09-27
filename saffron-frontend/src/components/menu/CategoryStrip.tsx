import type { Category } from "../../types/category";

interface CategoryStripProps {
  categories: Category[];
  activeSlug: string | null;
  onSelect: (slug: string | null) => void;
}

export default function CategoryStrip({ categories, activeSlug, onSelect }: CategoryStripProps) {
  return (
    <nav className="category-nav" aria-label="فئات المنيو">
      <div className="page-shell category-nav-inner">
        <span className="category-label">تذوّق ما تحب</span>
        <div className="category-scroll">
          <CategoryChip label="الكل" active={activeSlug === null} onClick={() => onSelect(null)} />
          {categories.map((cat) => (
            <CategoryChip key={cat.id} label={cat.name} active={activeSlug === cat.slug} onClick={() => onSelect(cat.slug)} />
          ))}
        </div>
      </div>
    </nav>
  );
}

function CategoryChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`category-chip ${active ? "is-active" : ""}`} aria-pressed={active}>
      {label}
    </button>
  );
}
