import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ChevronLeft } from 'lucide-react';
import { De } from '../lib/sdk';
import { Product, Category as CategoryType } from '../types';
import { Navbar } from './Navbar';
import { ProductCard } from './ProductCard';
import { Footer } from './Footer';
import { Chatbot } from './Chatbot';

export const Category: React.FC = () => {
  const { name: urlCategoryName } = useParams<{ name?: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('');

  useEffect(() => {
    Promise.all([
      De.entities.Product.filter({ status: 'active' }, '-created_date', 100),
      De.entities.Category.list('order', 50),
    ])
      .then(([prods, cats]) => {
        setProducts(prods);
        setCategories(cats);
      })
      .catch((err) => console.error('Failed to load category data:', err))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    if (urlCategoryName) {
      setActiveCategory(decodeURIComponent(urlCategoryName));
    } else {
      setActiveCategory('');
    }
  }, [urlCategoryName]);

  const filteredProducts = activeCategory
    ? products.filter((p) => p.category === activeCategory)
    : products;

  return (
    <div className="min-h-screen bg-obsidian text-silver">
      <Navbar />

      <div className="pt-20 sm:pt-24 pb-12 sm:pb-16 max-w-7xl mx-auto px-3 sm:px-6 md:px-8">
        {/* Back navigation */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-silver/50 hover:text-silver text-xs sm:text-sm mb-6 sm:mb-8 transition-colors cursor-pointer"
        >
          <ChevronLeft size={16} />
          <span>Back to Home</span>
        </Link>

        {/* Header */}
        <div className="text-center mb-6 sm:mb-10">
          <p className="text-cobalt text-[10px] sm:text-xs tracking-[0.25em] sm:tracking-[0.3em] uppercase mb-1 sm:mb-2 font-semibold">Shop Catalog</p>
          <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-silver uppercase tracking-wide">
            {activeCategory || 'All Products'}
          </h1>
        </div>

        {/* Horizontal Filter Bar with Scroll on Mobile */}
        <div className="flex overflow-x-auto pb-3 mb-8 sm:mb-12 scrollbar-hide sm:flex-wrap sm:justify-center gap-2 sm:gap-3 touch-scroll -mx-3 px-3 sm:mx-0 sm:px-0">
          <button
            onClick={() => setActiveCategory('')}
            className={`px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-medium transition-all cursor-pointer shrink-0 ${
              !activeCategory ? 'bg-cobalt text-white glow-blue' : 'glass text-silver/60 hover:text-silver'
            }`}
          >
            All Products
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.name)}
              className={`px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-medium transition-all cursor-pointer shrink-0 ${
                activeCategory === cat.name
                  ? 'bg-cobalt text-white glow-blue'
                  : 'glass text-silver/60 hover:text-silver'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-cobalt/30 border-t-cobalt rounded-full animate-spin" />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-silver/30 text-base sm:text-lg">No products found in this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {filteredProducts.map((prod, idx) => (
              <motion.div
                key={prod.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
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
export default Category;
