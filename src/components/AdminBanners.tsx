import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Plus, X, Loader2, Check, Save, Pencil, Trash2 } from 'lucide-react';
import { De } from '../lib/sdk';
import { Banner } from '../types';

export const AdminBanners: React.FC = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [form, setForm] = useState<Partial<Banner>>({
    title: '',
    slogan: '',
    image: '',
    order: 0,
    active: true
  });

  const loadBanners = () => {
    setIsLoading(true);
    De.entities.Banner.list('order', 50)
      .then(setBanners)
      .catch((err) => console.error('Failed to load banners list:', err))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadBanners();
  }, []);

  const resetForm = () => {
    setForm({
      title: '',
      slogan: '',
      image: '',
      order: 0,
      active: true
    });
    setEditingId(null);
  };

  const handleEditClick = (banner: Banner) => {
    setForm(banner);
    setEditingId(banner.id);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const { file_url } = await De.integrations.Core.UploadFile({ file });
      setForm((prev) => ({ ...prev, image: file_url }));
    } catch (err) {
      console.error('Banner image upload failed:', err);
    }
  };

  const handleSaveBanner = async () => {
    if (!form.title || !form.image) return;

    setIsSaving(true);
    setSaveSuccess(false);

    try {
      if (editingId) {
        const { id, created_date, ...payload } = form as any;
        await De.entities.Banner.update(editingId, payload);
      } else {
        await De.entities.Banner.create(form);
      }
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
      resetForm();
      loadBanners();
    } catch (err) {
      console.error('Failed to save banner:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteBanner = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this banner?')) {
      try {
        await De.entities.Banner.delete(id);
        loadBanners();
      } catch (err) {
        console.error('Failed to delete banner:', err);
      }
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl text-silver font-bold">Banner Management</h2>

      {/* Editor Panel */}
      <div className="glass-card rounded-xl p-6 space-y-4 border border-silver/5">
        <h3 className="text-silver font-semibold text-sm">
          {editingId ? 'Edit Banner' : 'New Banner'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Banner Title *"
            className="bg-transparent border border-silver/10 rounded-lg px-4 py-3 text-silver text-sm focus:border-cobalt outline-none transition-colors"
          />
          <input
            value={form.order || ''}
            onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
            type="number"
            placeholder="Display Order"
            className="bg-transparent border border-silver/10 rounded-lg px-4 py-3 text-silver text-sm focus:border-cobalt outline-none transition-colors"
          />
        </div>

        <input
          value={form.slogan}
          onChange={(e) => setForm({ ...form, slogan: e.target.value })}
          placeholder="Slogan / Tagline"
          className="w-full bg-transparent border border-silver/10 rounded-lg px-4 py-3 text-silver text-sm focus:border-cobalt outline-none transition-colors"
        />

        {/* Upload Thumbnail */}
        <div>
          <p className="text-silver/60 text-xs mb-2">Banner Image *</p>
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            {form.image && (
              <div className="relative w-40 h-20 rounded-lg overflow-hidden border border-silver/10 shrink-0 bg-obsidian">
                <img src={form.image} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                <button
                  type="button"
                  onClick={() => setForm({ ...form, image: '' })}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500/80 flex items-center justify-center text-white cursor-pointer"
                >
                  <X size={10} />
                </button>
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <label className="w-40 h-20 rounded-lg border border-dashed border-silver/20 flex items-center justify-center cursor-pointer hover:border-cobalt transition-colors shrink-0">
                <Plus size={20} className="text-silver/30" />
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </label>
              <div className="flex-1 w-full space-y-1">
                <input
                  type="text"
                  value={form.image || ''}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                  placeholder="Or paste image URL (e.g., https://...)"
                  className="w-full bg-transparent border border-silver/10 rounded-lg px-4 py-3 text-silver text-sm focus:border-cobalt outline-none transition-colors"
                />
                <span className="text-[10px] text-silver/30">Upload a file or paste an absolute web image URL.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Active Toggle */}
        <label className="flex items-center gap-2 text-silver/60 text-sm cursor-pointer select-none">
          <input
            type="checkbox"
            checked={form.active !== false}
            onChange={(e) => setForm({ ...form, active: e.target.checked })}
            className="accent-cobalt w-4 h-4 rounded"
          />
          <span>Active</span>
        </label>

        {/* Action triggers */}
        <div className="flex items-center gap-3">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleSaveBanner}
            disabled={isSaving || !form.title || !form.image}
            className="px-6 py-3 bg-cobalt text-white rounded-lg text-sm font-semibold flex items-center gap-2 relative overflow-hidden cursor-pointer disabled:opacity-30"
          >
            {isSaving ? (
              <Loader2 size={16} className="animate-spin" />
            ) : saveSuccess ? (
              <Check size={16} />
            ) : (
              <Save size={16} />
            )}
            <span>{isSaving ? 'Saving...' : saveSuccess ? 'Saved!' : 'Save Banner'}</span>
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

      {/* List */}
      {isLoading ? (
        <div className="flex justify-center py-10">
          <div className="w-8 h-8 border-2 border-cobalt/30 border-t-cobalt rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-3">
          {banners.map((banner) => (
            <div
              key={banner.id}
              className="glass-card rounded-xl p-4 flex items-center gap-4 border border-silver/5 justify-between"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-24 h-14 rounded-lg overflow-hidden shrink-0 bg-obsidian/40 border border-silver/10">
                  <img src={banner.image} alt={banner.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-silver text-sm font-medium truncate">{banner.title}</h4>
                  <p className="text-silver/40 text-xs truncate mt-0.5">
                    {banner.slogan || 'No Slogan'} • {banner.active ? 'Active' : 'Inactive'}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleEditClick(banner)}
                  className="w-8 h-8 rounded-lg glass flex items-center justify-center text-cobalt hover:bg-cobalt/10 transition-colors cursor-pointer"
                  title="Edit Banner"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => handleDeleteBanner(banner.id)}
                  className="w-8 h-8 rounded-lg glass flex items-center justify-center text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                  title="Delete Banner"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}

          {banners.length === 0 && (
            <p className="text-silver/30 text-sm text-center py-8">No banners yet.</p>
          )}
        </div>
      )}
    </div>
  );
};
export default AdminBanners;
