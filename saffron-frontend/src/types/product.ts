import type { Category } from "./category";

export interface OptionValue {
  id: number;
  name: string;
  extra_price: string;
  sort_order: number;
}

export interface ProductOption {
  id: number;
  name: string;
  type: "single" | "multiple";
  is_required: boolean;
  sort_order: number;
  values: OptionValue[];
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  price: string;
  old_price: string | null;
  is_featured: boolean;
  is_active: boolean;
  category?: Category;
  options?: ProductOption[];
}
