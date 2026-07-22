import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Home } from './components/Home';
import { Category } from './components/Category';
import { BestSellers } from './components/BestSellers';
import { ProductDetail } from './components/ProductDetail';
import { Cart } from './components/Cart';
import { OrderTracking } from './components/OrderTracking';
import { Contact } from './components/Contact';
import { Login } from './components/Login';
import { Admin } from './components/Admin';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Chatbot } from './components/Chatbot';
import { De } from './lib/sdk';

function SiteSettingsLoader() {
  useEffect(() => {
    const updateSiteDetails = () => {
      De.entities.SiteSettings.list()
        .then((res) => {
          if (res && res.length > 0) {
            const settings = res[0];
            // 1. Update document title
            if (settings.site_title) {
              document.title = settings.site_title;
            } else if (settings.site_name) {
              document.title = settings.site_name;
            }

            // 2. Update favicon
            if (settings.favicon) {
              let link = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
              if (!link) {
                link = document.createElement('link');
                link.rel = 'icon';
                document.head.appendChild(link);
              }
              link.href = settings.favicon;
            }
          }
        })
        .catch((err) => console.error('Failed to update site details:', err));
    };

    updateSiteDetails();
    const interval = setInterval(updateSiteDetails, 4000);
    return () => clearInterval(interval);
  }, []);

  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <SiteSettingsLoader />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/category" element={<Category />} />
        <Route path="/category/:name" element={<Category />} />
        <Route path="/best-sellers" element={<BestSellers />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/order-tracking" element={<OrderTracking />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute requireAdmin>
              <Admin />
            </ProtectedRoute>
          }
        />
      </Routes>
      <Chatbot />
    </BrowserRouter>
  );
}
