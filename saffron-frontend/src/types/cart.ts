export interface SelectedOption {
  option_id: number;
  option_name: string;
  value_id: number;
  value_name: string;
  extra_price: string;
}

export interface CartItem {
  /** مفتاح فريد لتمييز السطر حتى لو تكرر المنتج بخيارات مختلفة */
  uid: string;
  product_id: number;
  name: string;
  price: string;
  quantity: number;
  image: string | null;
  selected_options: SelectedOption[];
}

export interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "uid">) => void;
  removeItem: (uid: string) => void;
  updateQuantity: (uid: string, qty: number) => void;
  clearCart: () => void;
  getSubtotal: () => number;
  getTotal: (taxRate: number) => number;
}
