import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, User, ShoppingCart, Package } from 'lucide-react';
import { De } from '../lib/sdk';
import { supabase } from '../supabaseClient';

export const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [logoUrl, setLogoUrl] = useState<string>('');
  const [siteName, setSiteName] = useState<string>('KOZZAK');
  const location = useLocation();

  useEffect(() => {
    De.entities.SiteSettings.list()
      .then((res) => {
        if (res && res.length > 0) {
          setLogoUrl(res[0].logo || '');
          setSiteName(res[0].site_name || 'KOZZAK');
        }
      })
      .catch((err) => console.error('Failed to load site logo settings:', err));
  }, []);

  useEffect(() => {
    const updateCartCount = () => {
      const cart = JSON.parse(localStorage.getItem('kozzak_cart') || '[]');
      setCartCount(cart.length);
    };

    updateCartCount();
    window.addEventListener('cart-updated', updateCartCount);
    return () => window.removeEventListener('cart-updated', updateCartCount);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Category', path: '/category' },
    { label: 'Best Seller', path: '/best-sellers' },
    { label: 'Contact Us', path: '/contact' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? 'glass py-2.5 sm:py-3 shadow-lg' : 'bg-transparent py-3.5 sm:py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 md:px-8 flex items-center justify-between min-h-[44px]">
        {/* Mobile Menu Toggle */}
        <button
          className="lg:hidden text-silver/80 hover:text-white p-2.5 rounded-lg focus:outline-none transition-colors active:bg-silver/10 cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center -ml-1"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        {/* Desktop Navigation Links */}
        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`text-xs xl:text-sm tracking-widest uppercase transition-colors duration-300 font-medium relative py-1 ${
                isActive(link.path)
                  ? 'text-cobalt font-semibold'
                  : 'text-silver/70 hover:text-silver'
              }`}
            >
              {link.label}
              {isActive(link.path) && (
                <motion.span
                  layoutId="activeNavIndicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-cobalt rounded-full glow-blue"
                />
              )}
            </Link>
          ))}
        </div>

        {/* Logo (Centered on Desktop, adapted on Mobile) */}
        <Link
          to="/"
          className="lg:absolute lg:left-1/2 lg:-translate-x-1/2 flex items-center justify-center gap-2 max-w-[140px] sm:max-w-[180px] md:max-w-[220px]"
        >
          {logoUrl ? (
            <img 
              src={logoUrl} 
              alt={siteName} 
              className="h-8 sm:h-10 md:h-12 w-auto object-contain transition-transform hover:scale-105"
              referrerPolicy="no-referrer"
            />
          ) : (
            <h1 className="font-display text-base sm:text-xl md:text-2xl font-bold tracking-[0.15em] sm:tracking-[0.2em] text-silver truncate">
              {siteName}
            </h1>
          )}
        </Link>

        {/* Action Icons */}
        <div className="flex items-center gap-1 sm:gap-2 md:gap-4">
          <button
            onClick={async () => {
              const { data } = await supabase.auth.getSession();
              const auth = JSON.parse(localStorage.getItem('kozzak_auth') || 'null');
              const email = data?.session?.user?.email?.toLowerCase() || auth?.email?.toLowerCase();
              if (email === 'samirazmain8@gmail.com') {
                window.location.href = '/admin';
              } else {
                window.location.href = '/login';
              }
            }}
            className="text-silver/70 hover:text-cobalt p-2 rounded-lg transition-colors cursor-pointer min-w-[40px] min-h-[40px] flex items-center justify-center"
            title="User Account / Admin"
            aria-label="User Account"
          >
            <User size={19} />
          </button>
          <Link
            to="/cart"
            className="relative text-silver/70 hover:text-cobalt p-2 rounded-lg transition-colors cursor-pointer min-w-[40px] min-h-[40px] flex items-center justify-center"
            title="Shopping Cart"
            aria-label="Shopping Cart"
          >
            <ShoppingCart size={19} />
            {cartCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-cobalt rounded-full text-[10px] flex items-center justify-center text-white font-bold glow-blue">
                {cartCount}
              </span>
            )}
          </Link>
          <Link
            to="/order-tracking"
            className="text-silver/70 hover:text-cobalt p-2 rounded-lg transition-colors cursor-pointer min-w-[40px] min-h-[40px] flex items-center justify-center"
            title="Track Order"
            aria-label="Track Order"
          >
            <Package size={19} />
          </Link>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="lg:hidden fixed inset-0 top-[57px] bg-obsidian/80 backdrop-blur-sm z-40"
            />

            {/* Menu Items */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden fixed left-3 right-3 top-[64px] z-50 glass-card rounded-2xl overflow-hidden border border-silver/10 p-4 shadow-2xl"
            >
              <div className="flex flex-col gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileOpen(false)}
                    className={`text-xs sm:text-sm tracking-widest uppercase px-4 py-3.5 rounded-xl font-medium transition-all flex items-center justify-between ${
                      isActive(link.path)
                        ? 'bg-cobalt text-white font-semibold glow-blue'
                        : 'text-silver/80 hover:text-white hover:bg-silver/5'
                    }`}
                  >
                    <span>{link.label}</span>
                    {isActive(link.path) && <span className="w-2 h-2 rounded-full bg-white animate-pulse" />}
                  </Link>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
};
export default Navbar;
