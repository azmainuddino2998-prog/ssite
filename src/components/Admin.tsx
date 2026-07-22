import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  LayoutDashboard,
  Shirt,
  FolderOpen,
  Image,
  Package,
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  X,
  Eye
} from 'lucide-react';
import { AdminDashboard } from './AdminDashboard';
import { AdminProducts } from './AdminProducts';
import { AdminCategories } from './AdminCategories';
import { AdminBanners } from './AdminBanners';
import { AdminOrders } from './AdminOrders';
import { AdminContactMessages } from './AdminContactMessages';
import { AdminSiteSettings } from './AdminSiteSettings';
import { De } from '../lib/sdk';
import { SiteSettings } from '../types';
import { supabase } from '../supabaseClient';

type TabKey = 'dashboard' | 'products' | 'categories' | 'banners' | 'orders' | 'messages' | 'settings';

export const Admin: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [siteName, setSiteName] = useState('KOZZAK MENS WEAR');
  const navigate = useNavigate();

  useEffect(() => {
    // Auth Guard check: strictly require samirazmain8@gmail.com for admin panel
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      const session = data?.session;
      const auth = JSON.parse(localStorage.getItem('kozzak_auth') || 'null');

      const userEmail = session?.user?.email?.toLowerCase() || auth?.email?.toLowerCase();
      const isAdminUser = userEmail === 'samirazmain8@gmail.com';

      if (!isAdminUser) {
        navigate('/login');
        return;
      }
    };

    checkAuth();

    // Fetch site settings for dynamic name
    De.entities.SiteSettings.list()
      .then((res) => {
        if (res && res.length > 0 && res[0].site_name) {
          setSiteName(res[0].site_name);
        }
      })
      .catch((err) => console.error('Error fetching settings in Admin:', err));
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut().catch(() => {});
    localStorage.removeItem('kozzak_auth');
    navigate('/login');
  };

  const tabs = [
    { key: 'dashboard' as TabKey, label: 'Dashboard', icon: LayoutDashboard },
    { key: 'products' as TabKey, label: 'Products', icon: Shirt },
    { key: 'categories' as TabKey, label: 'Categories', icon: FolderOpen },
    { key: 'banners' as TabKey, label: 'Banners', icon: Image },
    { key: 'orders' as TabKey, label: 'Orders', icon: Package },
    { key: 'messages' as TabKey, label: 'Messages', icon: MessageSquare },
    { key: 'settings' as TabKey, label: 'Site Settings', icon: Settings }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <AdminDashboard setActiveTab={setActiveTab} />;
      case 'products':
        return <AdminProducts />;
      case 'categories':
        return <AdminCategories />;
      case 'banners':
        return <AdminBanners />;
      case 'orders':
        return <AdminOrders />;
      case 'messages':
        return <AdminContactMessages />;
      case 'settings':
        return <AdminSiteSettings />;
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-obsidian text-silver flex">
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-obsidian/80 backdrop-blur-sm z-30 lg:hidden"
        />
      )}

      {/* Mobile Sidebar Toggle Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-3 left-3 z-50 w-10 h-10 rounded-lg glass flex items-center justify-center text-silver shadow-lg active:scale-95 transition-all"
        aria-label="Toggle Admin Navigation Menu"
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 glass border-r border-silver/5 transform lg:transform-none lg:opacity-100 transition-all duration-300 flex flex-col justify-between ${
          sidebarOpen ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0 lg:translate-x-0'
        }`}
      >
        <div className="p-6 space-y-8">
          {/* Logo / Branding */}
          <div
            onClick={() => navigate('/')}
            className="flex items-center gap-3 cursor-pointer group hover:opacity-90 transition-all duration-300 bg-silver/5 p-3.5 rounded-xl border border-silver/5 hover:border-cobalt/40 select-none"
            title="Go to website storefront"
          >
            <div className="w-9 h-9 rounded bg-cobalt glow-blue flex items-center justify-center font-display font-bold text-white group-hover:scale-105 transition-transform duration-300 shrink-0">
              {siteName.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col overflow-hidden">
              <h2 className="font-display font-bold text-xs tracking-wider text-silver uppercase group-hover:text-cobalt transition-colors truncate">
                {siteName}
              </h2>
              <span className="text-[9px] text-silver/40 group-hover:text-silver/70 transition-colors uppercase tracking-widest font-mono mt-0.5">
                View Site &rarr;
              </span>
            </div>
          </div>

          {/* Navigation Menu Links */}
          <nav className="space-y-1.5">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => {
                    setActiveTab(tab.key);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium tracking-wide transition-all cursor-pointer ${
                    isActive
                      ? 'bg-cobalt text-white glow-blue'
                      : 'text-silver/50 hover:text-silver hover:bg-silver/5'
                  }`}
                >
                  <Icon size={16} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* View Site & Logout at bottom */}
        <div className="p-6 space-y-2 border-t border-silver/5">
          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium tracking-wide text-cobalt hover:bg-cobalt/10 transition-all cursor-pointer border border-cobalt/20"
          >
            <Eye size={16} />
            <span>View Storefront</span>
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium tracking-wide text-destructive hover:bg-destructive/10 transition-all cursor-pointer"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Admin Dashboard Workspace area */}
      <main className="flex-1 lg:pl-64 min-w-0 min-h-screen">
        <header className="h-16 border-b border-silver/5 flex items-center justify-between pl-16 pr-6 md:px-10 lg:pl-10">
          <h2 className="text-xs md:text-sm font-semibold text-silver/40 uppercase tracking-widest truncate">
            Control Room / {activeTab}
          </h2>
          <div className="flex items-center gap-4 shrink-0">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-cobalt/10 hover:bg-cobalt border border-cobalt/30 hover:border-cobalt text-xs font-semibold tracking-wide text-silver hover:text-white transition-all duration-300 cursor-pointer glow-blue group"
              title="Go back to public store website"
            >
              <Eye size={14} className="text-cobalt group-hover:text-white transition-colors duration-300" />
              <span>View Site</span>
            </button>
            <div className="hidden sm:flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs text-silver/60 font-mono">SYSTEM ONLINE</span>
            </div>
          </div>
        </header>

        <div className="p-6 md:p-10 max-w-6xl mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};
export default Admin;
