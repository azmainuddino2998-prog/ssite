import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Plus, Minus, ShoppingCart } from 'lucide-react';
import { De } from '../lib/sdk';
import { Product, CartItem } from '../types';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { Chatbot } from './Chatbot';

const COLOR_PALETTE = ['#3674be', '#d26181', '#ceb13d', '#c6414c', '#171f2b', '#50aa61'];

export const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [activeColorIndex, setActiveColorIndex] = useState(0);
  const [activeSize, setActiveSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [addedNotification, setAddedNotification] = useState(false);

  useEffect(() => {
    if (!id) return;
    De.entities.Product.get(id)
      .then((res) => {
        setProduct(res);
        // Pre-select first size if available
        if (res.sizes) {
          const szs = res.sizes.split(',').map((s) => s.trim());
          if (szs.length > 0) setActiveSize(szs[0]);
        }
      })
      .catch((err) => console.error('Failed to load product details:', err))
      .finally(() => setIsLoading(false));
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;

    const cart: CartItem[] = JSON.parse(localStorage.getItem('kozzak_cart') || '[]');
    const existingItem = cart.find(
      (item) => item.product_id === product.id && item.size === activeSize
    );

    const price = product.discount_price && product.discount_price < product.price
      ? product.discount_price
      : product.price;

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.push({
        product_id: product.id,
        product_title: product.title,
        product_image: product.images?.[0] || '',
        price: price,
        quantity: quantity,
        size: activeSize,
        color: COLOR_PALETTE[activeColorIndex],
      });
    }

    localStorage.setItem('kozzak_cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cart-updated'));

    // Trigger feedback notification
    setAddedNotification(true);
    setTimeout(() => setAddedNotification(false), 2500);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-obsidian flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-cobalt/30 border-t-cobalt rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-obsidian flex flex-col items-center justify-center gap-4 text-silver">
        <p className="text-silver/50">Product not found</p>
        <Link to="/" className="text-cobalt text-sm hover:underline">
          Go Home
        </Link>
      </div>
    );
  }

  const images = product.images || [];
  const sizesList = product.sizes ? product.sizes.split(',').map((s) => s.trim()) : [];
  const activeColor = COLOR_PALETTE[activeColorIndex % COLOR_PALETTE.length];

  const handleNextImage = () => {
    setActiveImageIndex((prev) => (prev + 1) % Math.max(images.length, 1));
  };

  const handlePrevImage = () => {
    setActiveImageIndex((prev) => (prev - 1 + Math.max(images.length, 1)) % Math.max(images.length, 1));
  };

  return (
    <div className="min-h-screen bg-obsidian text-silver relative">
      <Navbar />

      {/* Dynamic Radial Ambient Background Glow */}
      <div
        className="fixed inset-0 pointer-events-none transition-all duration-1000 opacity-20 z-0"
        style={{
          background: `radial-gradient(ellipse at 30% 50%, ${activeColor}40 0%, transparent 60%)`,
        }}
      />

      <div className="pt-20 sm:pt-24 pb-24 sm:pb-16 max-w-7xl mx-auto px-3 sm:px-6 md:px-8 relative z-10">
        {/* Back link */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-silver/50 hover:text-silver text-xs sm:text-sm mb-6 sm:mb-8 transition-colors cursor-pointer"
        >
          <ChevronLeft size={16} />
          <span>Back to Store</span>
        </Link>

        {/* Product details grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Images Gallery */}
          <div className="relative">
            <div className="glass-card rounded-2xl overflow-hidden aspect-[3/4] sm:aspect-[4/3] lg:aspect-[3/4] relative max-h-[550px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeImageIndex}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.4 }}
                  className="absolute inset-0"
                >
                  {images[activeImageIndex] ? (
                    <img
                      src={images[activeImageIndex]}
                      alt={product.title}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full bg-secondary flex items-center justify-center text-silver/30 text-xs">
                      No Image Available
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Prev / Next slideshow triggers */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full glass flex items-center justify-center text-silver/70 hover:text-white z-10 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                    aria-label="Previous Image"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full glass flex items-center justify-center text-silver/70 hover:text-white z-10 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                    aria-label="Next Image"
                  >
                    <ChevronRight size={18} />
                  </button>
                </>
              )}
            </div>

            {/* Micro thumbnail slider */}
            {images.length > 1 && (
              <div className="flex gap-2.5 sm:gap-3 mt-4 justify-start sm:justify-center overflow-x-auto pb-2 scrollbar-hide touch-scroll">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${
                      idx === activeImageIndex ? 'border-cobalt glow-blue' : 'border-transparent opacity-50 hover:opacity-80'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info Column */}
          <div className="flex flex-col justify-center">
            <p className="text-cobalt text-[10px] sm:text-xs tracking-[0.25em] sm:tracking-[0.3em] uppercase mb-1.5 sm:mb-2 font-semibold">
              {product.category}
            </p>
            <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-silver mb-3 sm:mb-4 leading-tight">
              {product.title}
            </h1>

            {/* Price Tags */}
            <div className="flex items-center gap-3 sm:gap-4 mb-5 sm:mb-6 flex-wrap">
              {product.discount_price && product.discount_price < product.price ? (
                <>
                  <span className="text-2xl sm:text-3xl font-bold text-cobalt">৳{product.discount_price}</span>
                  <span className="text-lg sm:text-xl text-silver/30 line-through">৳{product.price}</span>
                  <span className="text-xs bg-cobalt/20 text-cobalt px-2.5 py-1 rounded-full font-semibold">
                    {Math.round((1 - product.discount_price / product.price) * 100)}% OFF
                  </span>
                </>
              ) : (
                <span className="text-2xl sm:text-3xl font-bold text-cobalt">৳{product.price}</span>
              )}
            </div>

            {/* Description */}
            <p className="text-silver/60 text-xs sm:text-sm leading-relaxed mb-6">
              {product.description}
            </p>

            <p className="text-silver/40 text-xs mb-5">
              SKU: <span className="font-mono text-silver/70">{product.sku}</span>
            </p>

            {/* Color Swatches */}
            <div className="mb-5 sm:mb-6">
              <p className="text-silver/70 text-xs sm:text-sm mb-2.5 font-medium">Color</p>
              <div className="flex gap-2.5 sm:gap-3 flex-wrap">
                {COLOR_PALETTE.map((color, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveColorIndex(idx)}
                    className={`w-8 h-8 rounded-full transition-all cursor-pointer min-w-[32px] min-h-[32px] ${
                      idx === activeColorIndex
                        ? 'ring-2 ring-silver ring-offset-2 ring-offset-obsidian scale-110'
                        : 'opacity-60 hover:opacity-90'
                    }`}
                    style={{ backgroundColor: color }}
                    title={`Color option ${idx + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* Size Selectors */}
            {sizesList.length > 0 && (
              <div className="mb-5 sm:mb-6">
                <p className="text-silver/70 text-xs sm:text-sm mb-2.5 font-medium">Size</p>
                <div className="flex gap-2 sm:gap-3 flex-wrap">
                  {sizesList.map((sz) => (
                    <button
                      key={sz}
                      onClick={() => setActiveSize(sz)}
                      className={`px-3.5 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer min-w-[44px] min-h-[38px] flex items-center justify-center ${
                        activeSize === sz
                          ? 'bg-cobalt text-white glow-blue'
                          : 'glass text-silver/60 hover:text-silver'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="mb-6 sm:mb-8">
              <p className="text-silver/70 text-xs sm:text-sm mb-2.5 font-medium">Quantity</p>
              <div className="flex items-center gap-3 sm:gap-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-lg glass flex items-center justify-center text-silver/70 hover:text-white cursor-pointer transition-colors active:scale-95"
                  aria-label="Decrease Quantity"
                >
                  <Minus size={16} />
                </button>
                <span className="text-silver text-base sm:text-lg font-semibold w-8 text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 rounded-lg glass flex items-center justify-center text-silver/70 hover:text-white cursor-pointer transition-colors active:scale-95"
                  aria-label="Increase Quantity"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* Desktop / Inline Add To Cart CTA */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddToCart}
                className="w-full py-3.5 sm:py-4 rounded-xl bg-cobalt text-white text-sm sm:text-base font-semibold flex items-center justify-center gap-3 glow-blue transition-all cursor-pointer"
              >
                <ShoppingCart size={18} />
                <span>Add to Cart</span>
              </motion.button>

              {/* Added Feedback */}
              <AnimatePresence>
                {addedNotification && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute -top-12 left-1/2 -translate-x-1/2 bg-green-600 text-white text-xs font-semibold px-4 py-2 rounded-full shadow-lg whitespace-nowrap z-30"
                  >
                    Successfully added to your shopping cart!
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Sticky Mobile Bottom Bar */}
            <div className="fixed bottom-0 left-0 right-0 p-3 bg-obsidian/95 backdrop-blur-md border-t border-silver/10 z-40 lg:hidden flex items-center justify-between gap-3 shadow-2xl">
              <div>
                <p className="text-[10px] text-silver/40 uppercase tracking-wider">Total Price</p>
                <p className="text-cobalt font-bold text-base">
                  ৳{(product.discount_price && product.discount_price < product.price ? product.discount_price : product.price) * quantity}
                </p>
              </div>
              <button
                onClick={handleAddToCart}
                className="px-6 py-3 rounded-xl bg-cobalt text-white text-xs font-semibold flex items-center justify-center gap-2 glow-blue cursor-pointer"
              >
                <ShoppingCart size={16} />
                <span>Add to Cart</span>
              </button>
            </div>

            {/* Delivery charge details */}
            <div className="mt-4 glass-light rounded-xl p-3.5 sm:p-4">
              <p className="text-silver/50 text-xs leading-relaxed">
                Delivery: ৳{product.delivery_charge_dhaka || 80} (Dhaka) • ৳
                {product.delivery_charge_outside || 150} (Outside Dhaka) • Free (Shop Pickup)
              </p>
              {product.cod_available && (
                <p className="text-gold text-xs font-medium mt-1.5 flex items-center gap-1">
                  <span>✓</span>
                  <span>Cash on Delivery Available</span>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
      <Chatbot />
    </div>
  );
};
export default ProductDetail;
