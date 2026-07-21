import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Facebook, Instagram, Send } from 'lucide-react';
import { De } from '../lib/sdk';
import { SiteSettings } from '../types';

export const Footer: React.FC = () => {
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    De.entities.SiteSettings.list()
      .then((res) => {
        if (res.length > 0) {
          setSettings(res[0]);
        }
      })
      .catch((err) => console.error('Failed to load settings:', err));
  }, []);

  return (
    <footer className="glass-light border-t border-silver/5 mt-20">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Logo and Tagline */}
          <div>
            {settings?.logo ? (
              <img 
                src={settings.logo} 
                alt={settings.site_name} 
                className="h-10 w-auto object-contain mb-4 rounded"
                referrerPolicy="no-referrer"
              />
            ) : (
              <h2 className="font-display text-2xl font-bold tracking-[0.15em] text-silver mb-4">
                {settings?.site_name || 'KOZZAK'}
              </h2>
            )}
            <p className="text-silver/40 text-sm leading-relaxed max-w-xs">
              {settings?.footer_text ||
                "Premium men's fashion for the modern gentleman. Crafted with precision, worn with confidence."}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm tracking-widest uppercase text-silver/60 mb-4">Quick Links</h3>
            <div className="flex flex-col gap-3">
              <Link to="/" className="text-silver/40 hover:text-cobalt text-sm transition-colors">
                Home
              </Link>
              <Link to="/category" className="text-silver/40 hover:text-cobalt text-sm transition-colors">
                Categories
              </Link>
              <Link to="/best-sellers" className="text-silver/40 hover:text-cobalt text-sm transition-colors">
                Best Sellers
              </Link>
              <Link to="/contact" className="text-silver/40 hover:text-cobalt text-sm transition-colors">
                Contact Us
              </Link>
              <Link to="/order-tracking" className="text-silver/40 hover:text-cobalt text-sm transition-colors">
                Track Order
              </Link>
            </div>
          </div>

          {/* Contact and Social Links */}
          <div>
            <h3 className="text-sm tracking-widest uppercase text-silver/60 mb-4">Contact</h3>
            <div className="flex flex-col gap-3">
              {settings?.address && (
                <div className="flex items-start gap-2 text-silver/40 text-sm">
                  <MapPin size={14} className="mt-0.5 shrink-0 text-cobalt" />
                  <span>{settings.address}</span>
                </div>
              )}
              {settings?.phone && (
                <a
                  href={`tel:${settings.phone}`}
                  className="flex items-center gap-2 text-silver/40 hover:text-cobalt text-sm transition-colors"
                >
                  <Phone size={14} className="shrink-0 text-cobalt" />
                  <span>{settings.phone}</span>
                </a>
              )}
              {settings?.admin_email && (
                <a
                  href={`mailto:${settings.admin_email}`}
                  className="flex items-center gap-2 text-silver/40 hover:text-cobalt text-sm transition-colors"
                >
                  <Mail size={14} className="shrink-0 text-cobalt" />
                  <span>{settings.admin_email}</span>
                </a>
              )}
            </div>

            {/* Social handles */}
            <div className="flex items-center gap-4 mt-6">
              <a
                href={settings?.facebook_url || 'https://facebook.com'}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full glass-card flex items-center justify-center text-silver/40 hover:text-cobalt transition-colors"
              >
                <Facebook size={16} />
              </a>
              <a
                href={settings?.instagram_url || 'https://instagram.com'}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full glass-card flex items-center justify-center text-silver/40 hover:text-cobalt transition-colors"
              >
                <Instagram size={16} />
              </a>
              <a
                href={settings?.telegram_url || 'https://telegram.org'}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full glass-card flex items-center justify-center text-silver/40 hover:text-cobalt transition-colors"
              >
                <Send size={16} />
              </a>
            </div>
          </div>
        </div>

        {/* copyright */}
        <div className="border-t border-silver/5 mt-12 pt-8 text-center">
          <p className="text-silver/30 text-xs tracking-wider">
            © {new Date().getFullYear()} {settings?.site_name || 'Kozzak Mens Wear'}. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
export default Footer;
