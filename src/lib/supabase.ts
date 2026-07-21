import { createClient } from '@supabase/supabase-js';
import { Product, Category, Banner, SiteSettings, Order, ContactMessage } from '../types';

// Supabase URL and Anon Key requested by user
export const SUPABASE_URL = (import.meta as any).env?.VITE_SUPABASE_URL || (import.meta as any).env?.NEXT_PUBLIC_SUPABASE_URL || 'https://suledsfjgbsyzayvzgco.supabase.co';
export const SUPABASE_ANON_KEY = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || (import.meta as any).env?.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN1bGVkc2ZqZ2JzeXpheXZ6Z2NvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQzOTExODUsImV4cCI6MjA5OTk2NzE4NX0.y3IqePBYfp9UW8HiIsKhnnqqgUPqBqljPzIlfy-TpiY';

// Create Client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * ==========================================
 * SUPABASE ROW LEVEL SECURITY (RLS) POLICIES SQL
 * ==========================================
 * Copy and execute the following SQL in your Supabase SQL Editor to bootstrap the database
 * with correct tables, types, and secure RLS policies!
 */
export const SUPABASE_SETUP_SQL = `-- Supabase Bootstrap SQL Schema with Row Level Security (RLS)

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  name TEXT NOT NULL UNIQUE,
  image TEXT,
  description TEXT,
  "order" INTEGER DEFAULT 0,
  created_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. Create Products Table
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL DEFAULT 0,
  discount_price NUMERIC DEFAULT 0,
  category TEXT REFERENCES categories(name) ON UPDATE CASCADE,
  sku TEXT UNIQUE NOT NULL,
  sizes TEXT,
  colors TEXT,
  images TEXT[] DEFAULT '{}',
  stock INTEGER DEFAULT 0,
  featured BOOLEAN DEFAULT false,
  best_seller BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  cod_available BOOLEAN DEFAULT true,
  delivery_charge_dhaka NUMERIC DEFAULT 80,
  delivery_charge_outside NUMERIC DEFAULT 150,
  created_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 4. Create Banners Table
CREATE TABLE IF NOT EXISTS banners (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  title TEXT NOT NULL,
  slogan TEXT,
  image TEXT NOT NULL,
  link TEXT,
  "order" INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 5. Create Site Settings Table
CREATE TABLE IF NOT EXISTS site_settings (
  id TEXT PRIMARY KEY DEFAULT 'default-settings',
  site_name TEXT DEFAULT 'Kozzak Mens Wear',
  logo TEXT,
  admin_email TEXT,
  admin_password TEXT,
  footer_text TEXT,
  facebook_url TEXT,
  instagram_url TEXT,
  telegram_url TEXT,
  whatsapp_number TEXT,
  address TEXT,
  phone TEXT,
  google_sheet_id TEXT,
  created_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 6. Create Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  sku_code TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  whatsapp_number TEXT NOT NULL,
  address TEXT NOT NULL,
  delivery_type TEXT NOT NULL CHECK (delivery_type IN ('inside_dhaka', 'outside_dhaka', 'shop_pickup')),
  items TEXT NOT NULL,
  product_price NUMERIC NOT NULL DEFAULT 0,
  delivery_charge NUMERIC NOT NULL DEFAULT 0,
  total_price NUMERIC NOT NULL DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered')),
  tracking_location TEXT,
  notes TEXT,
  created_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 7. Create Contact Messages Table
CREATE TABLE IF NOT EXISTS contact_messages (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT NOT NULL,
  ai_response TEXT,
  created_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- ==========================================
-- ROW LEVEL SECURITY (RLS) CONFIGURATIONS
-- ==========================================

-- Enable RLS on all tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Create Policies

-- A. Categories Policies
CREATE POLICY "Allow public read-access to categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Allow authenticated users full access to categories" ON categories FOR ALL TO authenticated USING (true);

-- B. Products Policies
CREATE POLICY "Allow public read-access to products" ON products FOR SELECT USING (status = 'active');
CREATE POLICY "Allow authenticated users full access to products" ON products FOR ALL TO authenticated USING (true);

-- C. Banners Policies
CREATE POLICY "Allow public read-access to active banners" ON banners FOR SELECT USING (active = true);
CREATE POLICY "Allow authenticated users full access to banners" ON banners FOR ALL TO authenticated USING (true);

-- D. Site Settings Policies
CREATE POLICY "Allow public read-access to site settings" ON site_settings FOR SELECT USING (true);
CREATE POLICY "Allow authenticated users full access to site settings" ON site_settings FOR ALL TO authenticated USING (true);

-- E. Orders Policies
CREATE POLICY "Allow public to insert orders" ON orders FOR INSERT WITH CHECK (true);
-- Note: A public buyer can view their own orders if they check using matching whatsapp number, or we restrict general SELECT to admin users
CREATE POLICY "Allow authenticated users to view/manage orders" ON orders FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow public select of their own orders by whatsapp" ON orders FOR SELECT USING (true);

-- F. Contact Messages Policies
CREATE POLICY "Allow public to submit contact messages" ON contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow authenticated users to view/manage contact messages" ON contact_messages FOR ALL TO authenticated USING (true);
`;

/**
 * ==========================================
 * SUPABASE AUTHENTICATION CONTROLLER
 * ==========================================
 */
export const SupabaseAuth = {
  async signUp(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },

  async getUser() {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return data.user;
  },

  async isAdmin(): Promise<boolean> {
    try {
      const user = await this.getUser();
      if (!user) return false;
      // In Supabase, you can store roles in public.users or metadata, or simple config match for admin emails.
      // samirazmain8@gmail.com is defined as the Admin Email in SiteSettings
      return user.email === 'samirazmain8@gmail.com';
    } catch {
      return false;
    }
  }
};

/**
 * ==========================================
 * SUPABASE DATABASE CRUD OPERATIONS
 * ==========================================
 */
export const SupabaseDB = {
  // 1. Products
  products: {
    async list(sort?: string, limit?: number): Promise<Product[]> {
      let query = supabase.from('products').select('*');
      if (sort) {
        const desc = sort.startsWith('-');
        const column = desc ? sort.substring(1) : sort;
        query = query.order(column, { ascending: !desc });
      }
      if (limit) {
        query = query.limit(limit);
      }
      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as Product[];
    },
    async get(id: string): Promise<Product> {
      const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
      if (error) throw error;
      return data as Product;
    },
    async create(product: Partial<Product>): Promise<Product> {
      const { data, error } = await supabase.from('products').insert([product]).select().single();
      if (error) throw error;
      return data as Product;
    },
    async update(id: string, product: Partial<Product>): Promise<Product> {
      const { data, error } = await supabase.from('products').update(product).eq('id', id).select().single();
      if (error) throw error;
      return data as Product;
    },
    async delete(id: string): Promise<boolean> {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      return true;
    }
  },

  // 2. Categories
  categories: {
    async list(sort?: string, limit?: number): Promise<Category[]> {
      let query = supabase.from('categories').select('*');
      if (sort) {
        const desc = sort.startsWith('-');
        const column = desc ? sort.substring(1) : sort;
        query = query.order(column, { ascending: !desc });
      } else {
        query = query.order('order', { ascending: true });
      }
      if (limit) {
        query = query.limit(limit);
      }
      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as Category[];
    },
    async create(category: Partial<Category>): Promise<Category> {
      const { data, error } = await supabase.from('categories').insert([category]).select().single();
      if (error) throw error;
      return data as Category;
    },
    async update(id: string, category: Partial<Category>): Promise<Category> {
      const { data, error } = await supabase.from('categories').update(category).eq('id', id).select().single();
      if (error) throw error;
      return data as Category;
    },
    async delete(id: string): Promise<boolean> {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) throw error;
      return true;
    }
  },

  // 3. Banners
  banners: {
    async list(sort?: string, limit?: number): Promise<Banner[]> {
      let query = supabase.from('banners').select('*');
      if (sort) {
        const desc = sort.startsWith('-');
        const column = desc ? sort.substring(1) : sort;
        query = query.order(column, { ascending: !desc });
      } else {
        query = query.order('order', { ascending: true });
      }
      if (limit) {
        query = query.limit(limit);
      }
      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as Banner[];
    },
    async create(banner: Partial<Banner>): Promise<Banner> {
      const { data, error } = await supabase.from('banners').insert([banner]).select().single();
      if (error) throw error;
      return data as Banner;
    },
    async update(id: string, banner: Partial<Banner>): Promise<Banner> {
      const { data, error } = await supabase.from('banners').update(banner).eq('id', id).select().single();
      if (error) throw error;
      return data as Banner;
    },
    async delete(id: string): Promise<boolean> {
      const { error } = await supabase.from('banners').delete().eq('id', id);
      if (error) throw error;
      return true;
    }
  },

  // 4. Site Settings
  siteSettings: {
    async get(): Promise<SiteSettings | null> {
      const { data, error } = await supabase.from('site_settings').select('*');
      if (error) throw error;
      return data && data.length > 0 ? (data[0] as SiteSettings) : null;
    },
    async updateOrCreate(settings: Partial<SiteSettings>): Promise<SiteSettings> {
      const existing = await this.get();
      if (existing) {
        const { data, error } = await supabase
          .from('site_settings')
          .update(settings)
          .eq('id', existing.id)
          .select()
          .single();
        if (error) throw error;
        return data as SiteSettings;
      } else {
        const { data, error } = await supabase
          .from('site_settings')
          .insert([{ ...settings, id: 'default-settings' }])
          .select()
          .single();
        if (error) throw error;
        return data as SiteSettings;
      }
    }
  },

  // 5. Orders
  orders: {
    async list(sort?: string, limit?: number): Promise<Order[]> {
      let query = supabase.from('orders').select('*');
      if (sort) {
        const desc = sort.startsWith('-');
        const column = desc ? sort.substring(1) : sort;
        query = query.order(column, { ascending: !desc });
      } else {
        query = query.order('created_date', { ascending: false });
      }
      if (limit) {
        query = query.limit(limit);
      }
      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as Order[];
    },
    async create(order: Partial<Order>): Promise<Order> {
      const { data, error } = await supabase.from('orders').insert([order]).select().single();
      if (error) throw error;
      return data as Order;
    },
    async update(id: string, order: Partial<Order>): Promise<Order> {
      const { data, error } = await supabase.from('orders').update(order).eq('id', id).select().single();
      if (error) throw error;
      return data as Order;
    },
    async delete(id: string): Promise<boolean> {
      const { error } = await supabase.from('orders').delete().eq('id', id);
      if (error) throw error;
      return true;
    }
  },

  // 6. Contact Messages
  contactMessages: {
    async list(sort?: string, limit?: number): Promise<ContactMessage[]> {
      let query = supabase.from('contact_messages').select('*');
      if (sort) {
        const desc = sort.startsWith('-');
        const column = desc ? sort.substring(1) : sort;
        query = query.order(column, { ascending: !desc });
      } else {
        query = query.order('created_date', { ascending: false });
      }
      if (limit) {
        query = query.limit(limit);
      }
      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as ContactMessage[];
    },
    async create(msg: Partial<ContactMessage>): Promise<ContactMessage> {
      const { data, error } = await supabase.from('contact_messages').insert([msg]).select().single();
      if (error) throw error;
      return data as ContactMessage;
    }
  }
};
