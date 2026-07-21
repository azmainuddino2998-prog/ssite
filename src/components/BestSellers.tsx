import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ChevronLeft } from 'lucide-react';
import { De } from '../lib/sdk';
import { Product } from '../types';
import { Navbar } from './Navbar';
import { ProductCard } from './ProductCard';
import { Footer } from './Footer';
import { Chatbot } from './Chatbot';

export const BestSellers: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    De.entities.Product.filter({ best_seller: true, status: 'active' }, '-created_date', 50)
      .then(setProducts)
      .catch((err) => console.error('Failed to load best sellers:', err))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-obsidian text-silver">
      <Navbar />

      <div className="pt-24 pb-16 max-w-7xl mx-auto px-4">
        {/* Back Link */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-silver/40 hover:text-silver text-sm mb-8 transition-colors"
        >
          <ChevronLeft size={16} />
          <span>Home</span>
        </Link>

        {/* Title */}
        <div className="text-center mb-12">
          <p className="text-cobalt text-xs tracking-[0.3em] uppercase mb-2">Most Popular</p>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-silver uppercase tracking-wide">
            Best Sellers
          </h1>
        </div>

        {/* Grid or Empty message */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-cobalt/30 border-t-cobalt rounded-full animate-spin" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-silver/30 text-lg">No best sellers yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((prod, idx) => (
              <motion.div
                key={prod.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
              >
                <ProductCard product={prod} />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <Footer />
      <Chatbot />
    </div>
  );
};
export default BestSellers;
