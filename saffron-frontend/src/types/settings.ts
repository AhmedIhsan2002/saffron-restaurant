export interface PublicSettings {
  restaurant_name: string;
  restaurant_tagline: string;
  restaurant_address: string;
  restaurant_phone: string;
  currency: string;
  currency_symbol: string;
  tax_rate: number;
  orders_open: boolean;
  working_hours: { open: string; close: string };
}