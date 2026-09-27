export interface Category {
  id: number;
  name: string;
  slug: string;
  image: string | null;
  sort_order: number;
  is_active: boolean;
  products_count?: number;
}