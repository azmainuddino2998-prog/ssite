import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const mainImage = product.images?.[0] || '';
  const discountAmount = product.discount_price && product.discount_price < product.price
    ? Math.round((1 - product.discount_price / product.price) * 100)
    : 0;

  return (
    <Link to={`/product/${product.id}`} className="group">
      <motion.div
        whileHover={{ y: -6 }}
        transition={{ duration: 0.3 }}
        className="glass-card rounded-xl overflow-hidden cursor-pointer flex flex-col h-full"
      >
        {/* Image Container */}
        <div className="aspect-[3/4] overflow-hidden bg-obsidian/40 relative">
          {mainImage ? (
            <img
              src={mainImage}
              alt={product.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-silver/20 text-xs">
              No Image
            </div>
          )}

          {/* Discount Badge */}
          {discountAmount > 0 && (
            <div className="absolute top-3 left-3 bg-cobalt text-white text-[10px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider glow-blue">
              {discountAmount}% OFF
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-3 sm:p-4 flex flex-col flex-1">
          <p className="text-silver/40 text-[9px] sm:text-[10px] tracking-widest uppercase mb-0.5 sm:mb-1 truncate">{product.category}</p>
          <h3 className="text-silver font-display text-xs sm:text-sm font-medium group-hover:text-cobalt transition-colors line-clamp-1 mb-2 leading-tight">
            {product.title}
          </h3>

          <div className="mt-auto flex items-baseline gap-1.5 sm:gap-2 flex-wrap">
            {product.discount_price ? (
              <>
                <span className="text-cobalt font-semibold text-xs sm:text-sm md:text-base">৳{product.discount_price}</span>
                <span className="text-silver/30 text-[10px] sm:text-xs line-through">৳{product.price}</span>
              </>
            ) : (
              <span className="text-cobalt font-semibold text-xs sm:text-sm md:text-base">৳{product.price}</span>
            )}
          </div>
        </div>
      </motion.div>
    </Link>
  );
};
