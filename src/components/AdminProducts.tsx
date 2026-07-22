import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Plus, X, Loader2, Check, Save, Pencil, Trash2 } from 'lucide-react';
import { De } from '../lib/sdk';
import { Product, Category } from '../types';
import { uploadFileToSupabaseStorage } from '../lib/supabase';

export const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [form, setForm] = useState<Partial<Product>>({
    title: '',
    description: '',
    price: 0,
    discount_price: 0,
    category: '',
    sku: '',
    sizes: '',
    colors: '',
    images: [],
    stock: 0,
    featured: false,
    best_seller: false,
    status: 'active',
    cod_available: true,
    delivery_charge_dhaka: 80,
    delivery_charge_outside: 150
  });

  const loadData = () => {
    setIsLoading(true);
    Promise.all([
      De.entities.Product.list('-created_date', 100),
      De.entities.Category.list('order', 50)
    ])
      .then(([prods, cats]) => {
        setProducts(prods);
        setCategories(cats);
      })
      .catch((err) => console.error('Failed to load products list:', err))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const resetForm = () => {
    setForm({
      title: '',
      description: '',
      price: 0,
      discount_price: 0,
      category: '',
      sku: '',
      sizes: '',
      colors: '',
      images: [],
      stock: 0,
      featured: false,
      best_seller: false,
      status: 'active',
      cod_available: true,
      delivery_charge_dhaka: 80,
      delivery_charge_outside: 150
    });
    setEditingId(null);
  };

  const handleEditClick = (product: Product) => {
    setForm({
      ...product,
      images: product.images || []
    });
    setEditingId(product.id);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files: File[] = Array.from(e.target.files);
    if (files.length === 0) return;

    for (const file of files) {
      try {
        const file_url = await uploadFileToSupabaseStorage(file);
        setForm((prev) => ({
          ...prev,
          images: [...(prev.images || []), file_url]
        }));
      } catch (err) {
        console.error('File upload failed:', err);
      }
    }
  };

  const handleRemoveImage = (idxToRemove: number) => {
    setForm((prev) => ({
      ...prev,
      images: (prev.images || []).filter((_, idx) => idx !== idxToRemove)
    }));
  };

  const handleSaveProduct = async () => {
    if (!form.title || !form.price || !form.sku) {
      return;
    }

    setIsSaving(true);
    setSaveSuccess(false);

    try {
      if (editingId) {
        const { id, created_date, updated_date, ...payload } = form as any;
        await De.entities.Product.update(editingId, payload);
      } else {
        await De.entities.Product.create(form);
      }
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
      resetForm();
      loadData();
    } catch (err) {
      console.error('Failed to save product:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await De.entities.Product.delete(id);
        loadData();
      } catch (err) {
        console.error('Failed to delete product:', err);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl text-silver font-bold">Product Management</h2>
        <button
          onClick={resetForm}
          className="px-4 py-2 bg-cobalt text-white rounded-lg text-sm flex items-center gap-2 cursor-pointer glow-blue hover:scale-105 active:scale-95 transition-all"
        >
          <Plus size={16} />
          <span>Add Product</span>
        </button>
      </div>

      {/* Editor Panel */}
      <div className="glass-card rounded-xl p-6 space-y-4 border border-silver/5">
        <h3 className="text-silver font-semibold text-sm">
          {editingId ? 'Edit Product' : 'New Product'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Product Title *"
            className="bg-transparent border border-silver/10 rounded-lg px-4 py-3 text-silver text-sm focus:border-cobalt outline-none transition-colors"
          />
          <input
            value={form.sku}
            onChange={(e) => setForm({ ...form, sku: e.target.value })}
            placeholder="SKU Code *"
            className="bg-transparent border border-silver/10 rounded-lg px-4 py-3 text-silver text-sm focus:border-cobalt outline-none transition-colors"
          />
          <input
            value={form.price || ''}
            onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
            type="number"
            placeholder="Price *"
            className="bg-transparent border border-silver/10 rounded-lg px-4 py-3 text-silver text-sm focus:border-cobalt outline-none transition-colors"
          />
          <input
            value={form.discount_price || ''}
            onChange={(e) => setForm({ ...form, discount_price: Number(e.target.value) })}
            type="number"
            placeholder="Discount Price"
            className="bg-transparent border border-silver/10 rounded-lg px-4 py-3 text-silver text-sm focus:border-cobalt outline-none transition-colors"
          />
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="bg-obsidian border border-silver/10 rounded-lg px-4 py-3 text-silver text-sm focus:border-cobalt outline-none transition-colors"
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>
          <input
            value={form.sizes}
            onChange={(e) => setForm({ ...form, sizes: e.target.value })}
            placeholder="Sizes (e.g. S, M, L, XL)"
            className="bg-transparent border border-silver/10 rounded-lg px-4 py-3 text-silver text-sm focus:border-cobalt outline-none transition-colors"
          />
          <input
            value={form.colors}
            onChange={(e) => setForm({ ...form, colors: e.target.value })}
            placeholder="Colors (e.g. Blue, Black, White)"
            className="bg-transparent border border-silver/10 rounded-lg px-4 py-3 text-silver text-sm focus:border-cobalt outline-none transition-colors"
          />
          <input
            value={form.stock || ''}
            onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
            type="number"
            placeholder="Stock"
            className="bg-transparent border border-silver/10 rounded-lg px-4 py-3 text-silver text-sm focus:border-cobalt outline-none transition-colors"
          />
          <input
            value={form.delivery_charge_dhaka || ''}
            onChange={(e) => setForm({ ...form, delivery_charge_dhaka: Number(e.target.value) })}
            type="number"
            placeholder="Delivery Charge Inside Dhaka (৳)"
            className="bg-transparent border border-silver/10 rounded-lg px-4 py-3 text-silver text-sm focus:border-cobalt outline-none transition-colors"
          />
          <input
            value={form.delivery_charge_outside || ''}
            onChange={(e) =>
              setForm({ ...form, delivery_charge_outside: Number(e.target.value) })
            }
            type="number"
            placeholder="Delivery Charge Outside Dhaka (৳)"
            className="bg-transparent border border-silver/10 rounded-lg px-4 py-3 text-silver text-sm focus:border-cobalt outline-none transition-colors"
          />
        </div>

        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Description"
          rows={3}
          className="w-full bg-transparent border border-silver/10 rounded-lg px-4 py-3 text-silver text-sm focus:border-cobalt outline-none resize-none transition-colors"
        />

        {/* Feature Switches */}
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 text-silver/60 text-sm cursor-pointer select-none">
            <input
              type="checkbox"
              checked={form.featured || false}
              onChange={(e) => setForm({ ...form, featured: e.target.checked })}
              className="accent-cobalt w-4 h-4 rounded"
            />
            <span>Featured</span>
          </label>
          <label className="flex items-center gap-2 text-silver/60 text-sm cursor-pointer select-none">
            <input
              type="checkbox"
              checked={form.best_seller || false}
              onChange={(e) => setForm({ ...form, best_seller: e.target.checked })}
              className="accent-cobalt w-4 h-4 rounded"
            />
            <span>Best Seller</span>
          </label>
          <label className="flex items-center gap-2 text-silver/60 text-sm cursor-pointer select-none">
            <input
              type="checkbox"
              checked={form.cod_available !== false}
              onChange={(e) => setForm({ ...form, cod_available: e.target.checked })}
              className="accent-cobalt w-4 h-4 rounded"
            />
            <span>COD Available</span>
          </label>
        </div>

        {/* Upload images */}
        <div>
          <p className="text-silver/60 text-xs mb-2">Product Images</p>
          <div className="flex flex-wrap gap-3 mb-3">
            {(form.images || []).map((img, idx) => (
              <div
                key={idx}
                className="relative w-20 h-20 rounded-lg overflow-hidden border border-silver/10 group bg-obsidian"
              >
                <img src={img} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(idx)}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500/80 flex items-center justify-center text-white cursor-pointer"
                >
                  <X size={10} />
                </button>
              </div>
            ))}
            <label className="w-20 h-20 rounded-lg border border-dashed border-silver/20 flex items-center justify-center cursor-pointer hover:border-cobalt transition-colors">
              <Plus size={20} className="text-silver/30" />
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
          <div className="flex gap-2 max-w-md">
            <input
              type="text"
              id="new-image-url-input"
              placeholder="Or paste an image URL to add..."
              className="flex-1 bg-transparent border border-silver/10 rounded-lg px-3 py-2 text-silver text-xs focus:border-cobalt outline-none transition-colors"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  const val = (e.target as HTMLInputElement).value.trim();
                  if (val) {
                    setForm((prev) => ({ ...prev, images: [...(prev.images || []), val] }));
                    (e.target as HTMLInputElement).value = '';
                  }
                }
              }}
            />
            <button
              type="button"
              onClick={() => {
                const input = document.getElementById('new-image-url-input') as HTMLInputElement;
                const val = input?.value.trim();
                if (val) {
                  setForm((prev) => ({ ...prev, images: [...(prev.images || []), val] }));
                  input.value = '';
                }
              }}
              className="px-3 py-2 bg-silver/5 hover:bg-silver/10 border border-silver/10 text-silver rounded-lg text-xs cursor-pointer"
            >
              Add URL
            </button>
          </div>
        </div>

        {/* Form CTAs */}
        <div className="flex items-center gap-3">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleSaveProduct}
            disabled={isSaving || !form.title || !form.price || !form.sku}
            className="px-6 py-3 bg-cobalt text-white rounded-lg text-sm font-semibold flex items-center gap-2 relative overflow-hidden cursor-pointer disabled:opacity-30"
          >
            {isSaving ? (
              <Loader2 size={16} className="animate-spin" />
            ) : saveSuccess ? (
              <Check size={16} />
            ) : (
              <Save size={16} />
            )}
            <span>{isSaving ? 'Saving...' : saveSuccess ? 'Saved!' : 'Save Product'}</span>
          </motion.button>
          {editingId && (
            <button
              onClick={resetForm}
              className="px-4 py-3 glass text-silver/60 rounded-lg text-sm cursor-pointer hover:text-silver"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Products Grid Listing */}
      {isLoading ? (
        <div className="flex justify-center py-10">
          <div className="w-8 h-8 border-2 border-cobalt/30 border-t-cobalt rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-3">
          {products.map((prod) => (
            <div
              key={prod.id}
              className="glass-card rounded-xl p-4 flex items-center gap-4 border border-silver/5 justify-between"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 bg-obsidian/40 border border-silver/10">
                  {prod.images?.[0] ? (
                    <img
                      src={prod.images[0]}
                      alt={prod.title}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full bg-secondary" />
                  )}
                </div>
                <div className="min-w-0">
                  <h4 className="text-silver text-sm font-medium truncate">{prod.title}</h4>
                  <p className="text-silver/40 text-xs truncate mt-0.5">
                    {prod.category || 'No Category'} • SKU: {prod.sku} • ৳{prod.price}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleEditClick(prod)}
                  className="w-8 h-8 rounded-lg glass flex items-center justify-center text-cobalt hover:bg-cobalt/10 transition-colors cursor-pointer"
                  title="Edit Product"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => handleDeleteProduct(prod.id)}
                  className="w-8 h-8 rounded-lg glass flex items-center justify-center text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                  title="Delete Product"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}

          {products.length === 0 && (
            <p className="text-silver/30 text-sm text-center py-8">
              No products found. Add your first product above.
            </p>
          )}
        </div>
      )}
    </div>
  );
};
export default AdminProducts;
