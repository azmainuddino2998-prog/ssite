import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { De } from '../lib/sdk';
import { Product, Category } from '../types';
import { Navbar } from './Navbar';
import { Hero } from './Hero';
import { ProductCard } from './ProductCard';
import { Footer } from './Footer';

export const Home: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const featuredScrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    Promise.all([
      De.entities.Product.filter({ status: 'active' }, '-created_date', 20),
      De.entities.Category.list('order', 20),
    ])
      .then(([prods, cats]) => {
        setProducts(prods);
        setCategories(cats);
      })
      .catch((err) => console.error('Failed to load homepage data:', err))
      .finally(() => setIsLoading(false));
  }, []);

  const handleScrollFeatured = (direction: number) => {
    if (featuredScrollRef.current) {
      featuredScrollRef.current.scrollBy({
        left: direction * 300,
        behavior: 'smooth',
      });
    }
  };

  const featuredProducts = products.filter((p) => p.featured);
  const bestSellers = products.filter((p) => p.best_seller);

  // Fallback to all products if no featured items
  const displayFeatured = featuredProducts.length > 0 ? featuredProducts : products;

  return (
    <div className="min-h-screen bg-obsidian text-silver">
      <Navbar />
      <Hero />

      {/* Featured Products Section */}
      <section className="py-12 sm:py-16 md:py-20 max-w-7xl mx-auto px-3 sm:px-6 md:px-8">
        <div className="flex items-center justify-between mb-6 sm:mb-10">
          <div>
            <p className="text-cobalt text-[10px] sm:text-xs tracking-[0.25em] sm:tracking-[0.3em] uppercase mb-1 sm:mb-2 font-semibold">Our Collection</p>
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-silver">Featured Products</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleScrollFeatured(-1)}
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full glass flex items-center justify-center text-silver/70 hover:text-white cursor-pointer transition-colors active:scale-95"
              aria-label="Scroll Featured Left"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => handleScrollFeatured(1)}
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full glass flex items-center justify-center text-silver/70 hover:text-white cursor-pointer transition-colors active:scale-95"
              aria-label="Scroll Featured Right"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-cobalt/30 border-t-cobalt rounded-full animate-spin" />
          </div>
        ) : (
          <div
            ref={featuredScrollRef}
            className="flex gap-3 sm:gap-5 md:gap-6 overflow-x-auto pb-4 scrollbar-hide snap-x touch-scroll"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {displayFeatured.map((prod) => (
              <div key={prod.id} className="min-w-[200px] sm:min-w-[250px] md:min-w-[280px] snap-start shrink-0">
                <ProductCard product={prod} />
              </div>
            ))}
            {products.length === 0 && (
              <p className="text-silver/30 text-sm py-8">
                No products added yet. Add products from the admin panel.
              </p>
            )}
          </div>
        )}
      </section>

      {/* Categories Grid Section */}
      <section className="py-12 sm:py-16 md:py-20 max-w-7xl mx-auto px-3 sm:px-6 md:px-8">
        <div className="text-center mb-8 sm:mb-12">
          <p className="text-cobalt text-[10px] sm:text-xs tracking-[0.25em] sm:tracking-[0.3em] uppercase mb-1 sm:mb-2 font-semibold">Browse By</p>
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-silver">Categories</h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
          {categories.map((cat, idx) => (
            <Link key={cat.id} to={`/category/${encodeURIComponent(cat.name)}`}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ y: -6 }}
                className="glass-card rounded-xl overflow-hidden group cursor-pointer aspect-square relative border border-silver/5"
              >
                {cat.image ? (
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="absolute inset-0 bg-slate-800" />
                )}
                {/* darken overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-obsidian/95 via-obsidian/40 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
                  <h3 className="text-silver font-display text-sm sm:text-base md:text-lg font-semibold truncate">
                    {cat.name}
                  </h3>
                  <p className="text-cobalt text-[10px] sm:text-xs tracking-wider uppercase mt-0.5 sm:mt-1 flex items-center gap-1 font-medium">
                    <span>Explore</span>
                    <ChevronRight size={12} />
                  </p>
                </div>
              </motion.div>
            </Link>
          ))}
          {categories.length === 0 && !isLoading && (
            <p className="text-silver/30 text-sm col-span-full text-center py-10">
              No categories yet. Add them from the admin panel.
            </p>
          )}
        </div>
      </section>

      {/* Best Sellers Section */}
      {bestSellers.length > 0 && (
        <section className="py-12 sm:py-16 md:py-20 max-w-7xl mx-auto px-3 sm:px-6 md:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <p className="text-cobalt text-[10px] sm:text-xs tracking-[0.25em] sm:tracking-[0.3em] uppercase mb-1 sm:mb-2 font-semibold">Most Popular</p>
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-silver">Best Sellers</h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {bestSellers.slice(0, 8).map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
};
export default Home;
