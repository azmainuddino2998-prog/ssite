import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Plus, X, Loader2, Check, Save, FileSpreadsheet, Database, Copy, ShieldAlert, KeyRound, Radio } from 'lucide-react';
import { De } from '../lib/sdk';
import { SiteSettings } from '../types';
import { supabase, SUPABASE_SETUP_SQL, SUPABASE_URL, SUPABASE_ANON_KEY } from '../lib/supabase';

export const AdminSiteSettings: React.FC = () => {
  const [dbSettings, setDbSettings] = useState<SiteSettings | null>(null);
  const [form, setForm] = useState<Partial<SiteSettings>>({
    site_name: 'Kozzak Mens Wear',
    logo: '',
    admin_email: '',
    admin_password: '',
    footer_text: '',
    facebook_url: '',
    instagram_url: '',
    telegram_url: '',
    whatsapp_number: '',
    address: '',
    phone: '',
    google_sheet_id: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [useSupabase, setUseSupabase] = useState(localStorage.getItem('kozzak_use_supabase') === 'true');
  const [copiedSql, setCopiedSql] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'unchecked' | 'checking' | 'connected' | 'error'>('unchecked');
  const [connectionError, setConnectionError] = useState('');

  const testSupabaseConnection = async () => {
    setConnectionStatus('checking');
    setConnectionError('');
    try {
      const { error } = await supabase.from('categories').select('count', { count: 'exact', head: true });
      if (error) {
        if (error.code === '42P01' || error.message?.includes('does not exist')) {
          setConnectionStatus('connected');
          setConnectionError('Connected to Supabase! Note: The tables do not exist yet. Please copy and run the bootstrap SQL below in your Supabase SQL Editor.');
        } else {
          throw error;
        }
      } else {
        setConnectionStatus('connected');
      }
    } catch (err: any) {
      console.error('Supabase connection test failed:', err);
      setConnectionStatus('error');
      setConnectionError(err.message || 'Failed to connect. Please verify your Supabase URL & Key.');
    }
  };

  const handleToggleSupabase = (val: boolean) => {
    setUseSupabase(val);
    localStorage.setItem('kozzak_use_supabase', String(val));
  };

  useEffect(() => {
    De.entities.SiteSettings.list()
      .then((res) => {
        if (res.length > 0) {
          setDbSettings(res[0]);
          setForm({ ...form, ...res[0] });
        }
      })
      .catch((err) => console.error('Failed to load site settings:', err))
      .finally(() => setIsLoading(false));
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const { file_url } = await De.integrations.Core.UploadFile({ file });
      setForm((prev) => ({ ...prev, logo: file_url }));
    } catch (err) {
      console.error('Logo upload failed:', err);
    }
  };

  const handleFaviconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const { file_url } = await De.integrations.Core.UploadFile({ file });
      setForm((prev) => ({ ...prev, favicon: file_url }));
    } catch (err) {
      console.error('Favicon upload failed:', err);
    }
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      if (dbSettings) {
        const { id, created_date, updated_date, ...payload } = form as any;
        await De.entities.SiteSettings.update(dbSettings.id, payload);
      } else {
        const newRecord = await De.entities.SiteSettings.create(form);
        setDbSettings(newRecord);
      }

      if (form.admin_password) {
        localStorage.setItem('kozzak_admin_pw', form.admin_password);
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err) {
      console.error('Failed to save settings:', err);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-2 border-cobalt/30 border-t-cobalt rounded-full animate-spin" />
      </div>
    );
  }

  // extract sheet id if paste complete URL
  const sheetId = form.google_sheet_id
    ? form.google_sheet_id.match(/[-\w]{25,}/)?.[0] || form.google_sheet_id
    : '';

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl text-silver font-bold">Site Management</h2>

      <div className="glass-card rounded-xl p-6 space-y-5 border border-silver/5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-silver/60 text-xs tracking-wider uppercase mb-2 block font-medium">
              Site Name
            </label>
            <input
              value={form.site_name}
              onChange={(e) => setForm({ ...form, site_name: e.target.value })}
              className="w-full bg-transparent border border-silver/10 rounded-lg px-4 py-3 text-silver text-sm focus:border-cobalt outline-none transition-colors"
            />
          </div>
          <div>
            <label className="text-silver/60 text-xs tracking-wider uppercase mb-2 block font-medium">
              Browser Tab Title (Meta Title)
            </label>
            <input
              value={form.site_title || ''}
              onChange={(e) => setForm({ ...form, site_title: e.target.value })}
              placeholder="e.g., Kozzak Mens Wear | Premium Men's Fashion Store"
              className="w-full bg-transparent border border-silver/10 rounded-lg px-4 py-3 text-silver text-sm focus:border-cobalt outline-none transition-colors"
            />
          </div>
        </div>

        {/* Logo upload */}
        <div>
          <label className="text-silver/60 text-xs tracking-wider uppercase mb-2 block font-medium">
            Logo
          </label>
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            {form.logo && (
              <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-silver/10 bg-obsidian/40 flex items-center justify-center p-2 shrink-0">
                <img src={form.logo} alt="Logo" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                <button
                  type="button"
                  onClick={() => setForm({ ...form, logo: '' })}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500/80 flex items-center justify-center text-white cursor-pointer"
                >
                  <X size={10} />
                </button>
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <label className="w-20 h-20 rounded-lg border border-dashed border-silver/20 flex items-center justify-center cursor-pointer hover:border-cobalt transition-colors shrink-0">
                <Plus size={20} className="text-silver/30" />
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </label>
              <div className="flex-1 w-full space-y-1">
                <input
                  type="text"
                  value={form.logo || ''}
                  onChange={(e) => setForm({ ...form, logo: e.target.value })}
                  placeholder="Or paste image URL (e.g., https://...)"
                  className="w-full bg-transparent border border-silver/10 rounded-lg px-4 py-3 text-silver text-sm focus:border-cobalt outline-none transition-colors"
                />
                <span className="text-[10px] text-silver/30">Upload a logo file or paste a high-quality web image URL.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Favicon upload */}
        <div>
          <label className="text-silver/60 text-xs tracking-wider uppercase mb-2 block font-medium">
            Favicon (Browser Tab Icon)
          </label>
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            {form.favicon && (
              <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-silver/10 bg-obsidian/40 flex items-center justify-center p-2 shrink-0">
                <img src={form.favicon} alt="Favicon" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                <button
                  type="button"
                  onClick={() => setForm({ ...form, favicon: '' })}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500/80 flex items-center justify-center text-white cursor-pointer"
                >
                  <X size={10} />
                </button>
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <label className="w-16 h-16 rounded-lg border border-dashed border-silver/20 flex items-center justify-center cursor-pointer hover:border-cobalt transition-colors shrink-0">
                <Plus size={20} className="text-silver/30" />
                <input type="file" accept="image/*,image/x-icon" onChange={handleFaviconUpload} className="hidden" />
              </label>
              <div className="flex-1 w-full space-y-1">
                <input
                  type="text"
                  value={form.favicon || ''}
                  onChange={(e) => setForm({ ...form, favicon: e.target.value })}
                  placeholder="Or paste favicon image URL (e.g., https://.../favicon.png)"
                  className="w-full bg-transparent border border-silver/10 rounded-lg px-4 py-3 text-silver text-sm focus:border-cobalt outline-none transition-colors"
                />
                <span className="text-[10px] text-silver/30">Upload a favicon (.png, .ico) or paste a high-quality web icon URL.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Credentials */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-silver/60 text-xs tracking-wider uppercase mb-2 block font-medium">
              Admin Email
            </label>
            <input
              value={form.admin_email}
              onChange={(e) => setForm({ ...form, admin_email: e.target.value })}
              className="w-full bg-transparent border border-silver/10 rounded-lg px-4 py-3 text-silver text-sm focus:border-cobalt outline-none transition-colors"
            />
          </div>
          <div>
            <label className="text-silver/60 text-xs tracking-wider uppercase mb-2 block font-medium">
              Admin Password
            </label>
            <input
              value={form.admin_password}
              onChange={(e) => setForm({ ...form, admin_password: e.target.value })}
              type="password"
              className="w-full bg-transparent border border-silver/10 rounded-lg px-4 py-3 text-silver text-sm focus:border-cobalt outline-none transition-colors"
              placeholder="Enter new password"
            />
          </div>
        </div>

        {/* Description / Footer */}
        <div>
          <label className="text-silver/60 text-xs tracking-wider uppercase mb-2 block font-medium">
            Footer Text
          </label>
          <textarea
            value={form.footer_text}
            onChange={(e) => setForm({ ...form, footer_text: e.target.value })}
            rows={2}
            className="w-full bg-transparent border border-silver/10 rounded-lg px-4 py-3 text-silver text-sm focus:border-cobalt outline-none resize-none transition-colors"
          />
        </div>

        {/* Contacts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-silver/60 text-xs tracking-wider uppercase mb-2 block font-medium">
              Phone
            </label>
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full bg-transparent border border-silver/10 rounded-lg px-4 py-3 text-silver text-sm focus:border-cobalt outline-none transition-colors"
            />
          </div>
          <div>
            <label className="text-silver/60 text-xs tracking-wider uppercase mb-2 block font-medium">
              WhatsApp Number
            </label>
            <input
              value={form.whatsapp_number}
              onChange={(e) => setForm({ ...form, whatsapp_number: e.target.value })}
              className="w-full bg-transparent border border-silver/10 rounded-lg px-4 py-3 text-silver text-sm focus:border-cobalt outline-none transition-colors"
            />
          </div>
        </div>

        {/* Address */}
        <div>
          <label className="text-silver/60 text-xs tracking-wider uppercase mb-2 block font-medium">
            Address
          </label>
          <input
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            className="w-full bg-transparent border border-silver/10 rounded-lg px-4 py-3 text-silver text-sm focus:border-cobalt outline-none transition-colors"
          />
        </div>

        {/* Social URL links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-silver/60 text-xs tracking-wider uppercase mb-2 block font-medium">
              Facebook URL
            </label>
            <input
              value={form.facebook_url}
              onChange={(e) => setForm({ ...form, facebook_url: e.target.value })}
              className="w-full bg-transparent border border-silver/10 rounded-lg px-4 py-3 text-silver text-sm focus:border-cobalt outline-none transition-colors"
            />
          </div>
          <div>
            <label className="text-silver/60 text-xs tracking-wider uppercase mb-2 block font-medium">
              Instagram URL
            </label>
            <input
              value={form.instagram_url}
              onChange={(e) => setForm({ ...form, instagram_url: e.target.value })}
              className="w-full bg-transparent border border-silver/10 rounded-lg px-4 py-3 text-silver text-sm focus:border-cobalt outline-none transition-colors"
            />
          </div>
          <div>
            <label className="text-silver/60 text-xs tracking-wider uppercase mb-2 block font-medium">
              Telegram URL
            </label>
            <input
              value={form.telegram_url}
              onChange={(e) => setForm({ ...form, telegram_url: e.target.value })}
              className="w-full bg-transparent border border-silver/10 rounded-lg px-4 py-3 text-silver text-sm focus:border-cobalt outline-none transition-colors"
            />
          </div>
        </div>

        {/* Google Sheet Sync */}
        <div>
          <label className="text-silver/60 text-xs tracking-wider uppercase mb-2 block font-medium">
            Google Sheet URL or ID (for order logging)
          </label>
          <input
            value={form.google_sheet_id || ''}
            onChange={(e) => setForm({ ...form, google_sheet_id: e.target.value })}
            placeholder="e.g. 1aBCdEfGhIjKlMnOpQrStUvWxYz..."
            className="w-full bg-transparent border border-silver/10 rounded-lg px-4 py-3 text-silver text-sm focus:border-cobalt outline-none transition-colors"
          />
          <p className="text-silver/30 text-xs mt-1 leading-relaxed">
            Specify a Google Sheet ID to record transaction receipts.
          </p>
        </div>

        {sheetId && (
          <div className="glass-light rounded-lg p-4 flex items-center gap-3">
            <FileSpreadsheet size={18} className="text-green-500 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-silver/60 text-xs font-semibold">Google Sheet Sync Active</p>
              <a
                href={`https://docs.google.com/spreadsheets/d/${sheetId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-cobalt text-xs hover:underline break-all"
              >
                Open Google Spreadsheet →
              </a>
            </div>
          </div>
        )}

        {/* Form CTA buttons */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleSaveSettings}
          disabled={isSaving}
          className="px-6 py-3 bg-cobalt text-white rounded-lg text-sm font-semibold flex items-center gap-2 relative overflow-hidden cursor-pointer"
        >
          {isSaving ? (
            <Loader2 size={16} className="animate-spin" />
          ) : saveSuccess ? (
            <Check size={16} />
          ) : (
            <Save size={16} />
          )}
          <span>{isSaving ? 'Saving...' : saveSuccess ? 'Saved!' : 'Save Settings'}</span>
        </motion.button>
      </div>

      {/* Supabase Integration Panel */}
      <div className="glass-card rounded-xl p-6 border border-silver/5 space-y-6 mt-8">
        <div className="flex items-center gap-3 border-b border-silver/10 pb-4">
          <div className="p-2 rounded-lg bg-cobalt/10 text-cobalt">
            <Database size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-silver font-display">Supabase Integration</h3>
            <p className="text-xs text-silver/40">Connect your web application to a live cloud relational database & authentication</p>
          </div>
        </div>

        {/* Configuration Values */}
        <div className="space-y-4">
          <div>
            <span className="text-silver/60 text-xs tracking-wider uppercase mb-1 block font-medium">Supabase URL</span>
            <code className="block bg-obsidian/60 border border-silver/5 rounded px-3 py-2 text-xs text-cobalt font-mono break-all">
              {SUPABASE_URL}
            </code>
          </div>

          <div>
            <span className="text-silver/60 text-xs tracking-wider uppercase mb-1 block font-medium">Supabase Anon Key</span>
            <code className="block bg-obsidian/60 border border-silver/5 rounded px-3 py-2 text-xs text-silver/40 font-mono break-all max-h-20 overflow-y-auto">
              {SUPABASE_ANON_KEY}
            </code>
          </div>
        </div>

        {/* Connection Tester */}
        <div className="p-4 rounded-xl bg-obsidian/40 border border-silver/5 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <Radio size={16} className={connectionStatus === 'checking' ? 'text-yellow-500 animate-pulse' : connectionStatus === 'connected' ? 'text-green-500' : connectionStatus === 'error' ? 'text-red-500' : 'text-silver/30'} />
              <span className="text-sm font-semibold text-silver">
                Connection Status:{' '}
                {connectionStatus === 'unchecked' && <span className="text-silver/40 font-medium">Not Tested</span>}
                {connectionStatus === 'checking' && <span className="text-yellow-500 font-medium">Verifying Cloud Node...</span>}
                {connectionStatus === 'connected' && <span className="text-green-500 font-medium">Connected</span>}
                {connectionStatus === 'error' && <span className="text-red-500 font-medium">Failed</span>}
              </span>
            </div>
            <button
              onClick={testSupabaseConnection}
              disabled={connectionStatus === 'checking'}
              className="px-4 py-2 bg-silver/5 hover:bg-silver/10 text-silver text-xs rounded-lg font-semibold transition-all cursor-pointer"
            >
              {connectionStatus === 'checking' ? 'Testing...' : 'Test Connection'}
            </button>
          </div>

          {connectionError && (
            <p className={`text-xs p-3 rounded-lg leading-relaxed ${connectionStatus === 'error' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-cobalt/10 text-cobalt border border-cobalt/20'}`}>
              {connectionError}
            </p>
          )}
        </div>

        {/* Active Toggle Switch */}
        <div className="p-4 rounded-xl bg-cobalt/5 border border-cobalt/10 flex items-center justify-between">
          <div className="space-y-1 pr-4">
            <h4 className="text-sm font-bold text-silver">Use Supabase Database (Cloud Sync Mode)</h4>
            <p className="text-xs text-silver/40 leading-relaxed">
              When enabled, all storefront products, catalog categories, active banners, site-wide configurations, customer order logs, and contact messages will load and save directly from/to your Supabase instance.
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={useSupabase}
              onChange={(e) => handleToggleSupabase(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-silver/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-silver/80 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cobalt peer-checked:after:bg-white"></div>
          </label>
        </div>

        {/* SQL Bootstrap Script */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-silver/60 text-xs tracking-wider uppercase font-medium">Supabase Setup & RLS Bootstrap SQL</span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(SUPABASE_SETUP_SQL);
                setCopiedSql(true);
                setTimeout(() => setCopiedSql(false), 2000);
              }}
              className="text-xs text-cobalt hover:underline flex items-center gap-1.5 cursor-pointer"
            >
              {copiedSql ? <Check size={12} /> : <Copy size={12} />}
              <span>{copiedSql ? 'Copied SQL!' : 'Copy SQL Script'}</span>
            </button>
          </div>

          <pre className="p-4 bg-obsidian/80 border border-silver/5 rounded-xl text-[10px] text-silver/50 font-mono overflow-auto max-h-60 leading-normal select-all">
            {SUPABASE_SETUP_SQL}
          </pre>
        </div>

        {/* RLS Security Guidelines Explained */}
        <div className="p-5 rounded-xl bg-obsidian/40 border border-silver/5 space-y-4">
          <div className="flex items-center gap-2">
            <ShieldAlert size={18} className="text-cobalt" />
            <h4 className="text-sm font-bold text-silver">Supabase Row Level Security (RLS) Guardrails</h4>
          </div>

          <p className="text-xs text-silver/40 leading-relaxed">
            We have enabled strict **Row Level Security (RLS)** in the bootstrap SQL script above to keep your data fully secure. Here is how your data is protected:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-2 p-3 rounded-lg bg-silver/5 border border-silver/5">
              <span className="font-semibold text-silver block">🔓 Public Storefront Operations</span>
              <ul className="list-disc list-inside space-y-1 text-silver/40 leading-relaxed">
                <li>Read-only access to categories, active banners, and site configuration.</li>
                <li>Read-only access to active products (where status = 'active').</li>
                <li>Submit-only access to write orders and custom customer support messages.</li>
              </ul>
            </div>

            <div className="space-y-2 p-3 rounded-lg bg-cobalt/5 border border-cobalt/10">
              <span className="font-semibold text-cobalt block">🔐 Admin & Auth Controls</span>
              <ul className="list-disc list-inside space-y-1 text-silver/40 leading-relaxed">
                <li>Only authenticated admin users are granted permission to create, update, or delete catalog records.</li>
                <li>Administrative access applies to products, orders, site-settings, and contact forms.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default AdminSiteSettings;
