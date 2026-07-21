import { Product, Category, Banner, SiteSettings, Order, ContactMessage } from '../types';
import { SupabaseDB } from './supabase';

class EntityService<T> {
  entityName: string;
  constructor(entityName: string) {
    this.entityName = entityName;
  }

  private getSupabaseService(): any {
    const isEnabled = localStorage.getItem('kozzak_use_supabase') === 'true';
    if (!isEnabled) return null;

    switch (this.entityName) {
      case 'Product':
        return SupabaseDB.products;
      case 'Category':
        return SupabaseDB.categories;
      case 'Banner':
        return SupabaseDB.banners;
      case 'SiteSettings':
        return {
          list: async () => {
            const res = await SupabaseDB.siteSettings.get();
            return res ? [res] : [];
          },
          get: async (_id: string) => {
            const res = await SupabaseDB.siteSettings.get();
            if (!res) throw new Error('Not found');
            return res;
          },
          create: async (data: any) => {
            return SupabaseDB.siteSettings.updateOrCreate(data);
          },
          update: async (_id: string, data: any) => {
            return SupabaseDB.siteSettings.updateOrCreate(data);
          },
          delete: async (_id: string) => {
            return { success: true };
          },
          filter: async (_query: any) => {
            const res = await SupabaseDB.siteSettings.get();
            return res ? [res] : [];
          }
        };
      case 'Order':
        return SupabaseDB.orders;
      case 'ContactMessage':
        return {
          list: async (sort?: string, limit?: number) => {
            return SupabaseDB.contactMessages.list(sort, limit);
          },
          get: async (id: string) => {
            const list = await SupabaseDB.contactMessages.list();
            const item = list.find((x) => x.id === id);
            if (!item) throw new Error('Not found');
            return item;
          },
          create: async (data: any) => {
            return SupabaseDB.contactMessages.create(data);
          },
          update: async (_id: string, _data: any) => {
            throw new Error('Update not supported on ContactMessages');
          },
          delete: async (_id: string) => {
            return { success: true };
          },
          filter: async (query: any) => {
            const list = await SupabaseDB.contactMessages.list();
            return list.filter((item: any) => {
              for (const key in query) {
                if (query[key] !== item[key]) {
                  return false;
                }
              }
              return true;
            });
          }
        };
      default:
        return null;
    }
  }

  async list(sort?: string, limit?: number): Promise<T[]> {
    const sb = this.getSupabaseService();
    if (sb) {
      try {
        return await sb.list(sort, limit);
      } catch (err) {
        console.warn(`Supabase select failed, falling back to local API:`, err);
      }
    }

    const url = new URL(`/api/entities/${this.entityName}`, window.location.origin);
    if (sort) url.searchParams.set('sort', sort);
    if (limit) url.searchParams.set('limit', String(limit));
    const res = await fetch(url.toString());
    return res.json();
  }

  async filter(query: any, sort?: string, limit?: number): Promise<T[]> {
    const sb = this.getSupabaseService();
    if (sb) {
      try {
        if (sb.filter) {
          return await sb.filter(query, sort, limit);
        } else {
          // generic client-side filter
          const all = await sb.list(sort, limit);
          return all.filter((item: any) => {
            for (const key in query) {
              if (query[key] !== item[key]) {
                return false;
              }
            }
            return true;
          });
        }
      } catch (err) {
        console.warn(`Supabase filter failed, falling back to local API:`, err);
      }
    }

    const url = new URL(`/api/entities/${this.entityName}`, window.location.origin);
    url.searchParams.set('q', JSON.stringify(query));
    if (sort) url.searchParams.set('sort', sort);
    if (limit) url.searchParams.set('limit', String(limit));
    const res = await fetch(url.toString());
    return res.json();
  }

  async get(id: string): Promise<T> {
    const sb = this.getSupabaseService();
    if (sb) {
      try {
        return await sb.get(id);
      } catch (err) {
        console.warn(`Supabase get failed, falling back to local API:`, err);
      }
    }

    const res = await fetch(`/api/entities/${this.entityName}/${id}`);
    if (!res.ok) throw new Error('Not found');
    return res.json();
  }

  async create(data: Partial<T>): Promise<T> {
    const sb = this.getSupabaseService();
    if (sb) {
      try {
        return await sb.create(data);
      } catch (err) {
        console.warn(`Supabase insert failed, falling back to local API:`, err);
      }
    }

    const res = await fetch(`/api/entities/${this.entityName}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  }

  async update(id: string, data: Partial<T>): Promise<T> {
    const sb = this.getSupabaseService();
    if (sb) {
      try {
        return await sb.update(id, data);
      } catch (err) {
        console.warn(`Supabase update failed, falling back to local API:`, err);
      }
    }

    const res = await fetch(`/api/entities/${this.entityName}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  }

  async delete(id: string): Promise<{ success: boolean }> {
    const sb = this.getSupabaseService();
    if (sb) {
      try {
        const success = await sb.delete(id);
        return { success };
      } catch (err) {
        console.warn(`Supabase delete failed, falling back to local API:`, err);
      }
    }

    const res = await fetch(`/api/entities/${this.entityName}/${id}`, {
      method: 'DELETE',
    });
    return res.json();
  }
}

export const De = {
  entities: {
    Product: new EntityService<Product>('Product'),
    Category: new EntityService<Category>('Category'),
    Banner: new EntityService<Banner>('Banner'),
    SiteSettings: new EntityService<SiteSettings>('SiteSettings'),
    Order: new EntityService<Order>('Order'),
    ContactMessage: new EntityService<ContactMessage>('ContactMessage'),
  },
  integrations: {
    Core: {
      async InvokeLLM(args: { prompt: string }): Promise<string> {
        const res = await fetch('/api/integrations/Core/InvokeLLM', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(args),
        });
        const data = await res.json();
        return data.response;
      },
      async UploadFile(args: { file: File }): Promise<{ file_url: string }> {
        const formData = new FormData();
        formData.append('file', args.file);
        const res = await fetch('/api/integrations/Core/UploadFile', {
          method: 'POST',
          body: formData,
        });
        return res.json();
      }
    }
  },
  functions: {
    async invoke(funcName: string, args: any): Promise<any> {
      const res = await fetch(`/api/functions/${funcName}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(args),
      });
      return res.json();
    }
  }
};
