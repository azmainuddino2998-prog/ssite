export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  discount_price: number;
  category: string;
  sku: string;
  sizes: string; // comma-separated e.g. "S, M, L, XL"
  colors: string; // comma-separated e.g. "Navy, Black, White"
  images: string[];
  stock: number;
  featured: boolean;
  best_seller: boolean;
  status: 'active' | 'inactive';
  cod_available: boolean;
  delivery_charge_dhaka: number;
  delivery_charge_outside: number;
  created_date?: string;
  updated_date?: string;
}

export interface Category {
  id: string;
  name: string;
  image: string;
  description: string;
  order: number;
  created_date?: string;
}

export interface Banner {
  id: string;
  title: string;
  slogan: string;
  image: string;
  link?: string;
  order: number;
  active: boolean;
  created_date?: string;
}

export interface SiteSettings {
  id: string;
  site_name: string;
  site_title?: string;
  favicon?: string;
  logo: string;
  admin_email: string;
  admin_password?: string;
  footer_text: string;
  facebook_url?: string;
  instagram_url?: string;
  telegram_url?: string;
  whatsapp_number: string;
  address?: string;
  phone?: string;
  google_sheet_id?: string;
  created_date?: string;
}

export interface Order {
  id: string;
  sku_code: string;
  customer_name: string;
  whatsapp_number: string;
  address: string;
  delivery_type: 'inside_dhaka' | 'outside_dhaka' | 'shop_pickup';
  items: string; // Description of items ordered
  product_price: number;
  delivery_charge: number;
  total_price: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered';
  tracking_location?: string;
  notes?: string;
  created_date?: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  ai_response?: string;
  created_date?: string;
}

export interface CartItem {
  product_id: string;
  product_title: string;
  product_image: string;
  price: number;
  quantity: number;
  size: string;
  color: string;
}
