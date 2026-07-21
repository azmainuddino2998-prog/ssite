import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Trash2, Minus, Plus, Check, Send } from 'lucide-react';
import { De } from '../lib/sdk';
import { CartItem, Order, SiteSettings } from '../types';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

export const Cart: React.FC = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [customer, setCustomer] = useState({
    customer_name: '',
    whatsapp_number: '',
    address: '',
    delivery_type: 'inside_dhaka' as 'inside_dhaka' | 'outside_dhaka' | 'shop_pickup'
  });
  const [isOrdered, setIsOrdered] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  const auth = JSON.parse(localStorage.getItem('kozzak_auth') || 'null');
  const isAdmin = auth && auth.role === 'admin';

  useEffect(() => {
    setCartItems(JSON.parse(localStorage.getItem('kozzak_cart') || '[]'));
    De.entities.SiteSettings.list()
      .then((res) => {
        if (res && res.length > 0) {
          setSettings(res[0]);
        }
      })
      .catch((err) => console.error('Failed to load site settings in Cart:', err));
  }, []);

  const saveCart = (items: CartItem[]) => {
    setCartItems(items);
    localStorage.setItem('kozzak_cart', JSON.stringify(items));
    window.dispatchEvent(new Event('cart-updated'));
  };

  const handleUpdateQuantity = (idx: number, delta: number) => {
    const updated = [...cartItems];
    updated[idx].quantity = Math.max(1, updated[idx].quantity + delta);
    saveCart(updated);
  };

  const handleRemoveItem = (idx: number) => {
    const updated = [...cartItems];
    updated.splice(idx, 1);
    saveCart(updated);
  };

  const productTotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const deliveryCharge =
    customer.delivery_type === 'shop_pickup'
      ? 0
      : customer.delivery_type === 'inside_dhaka'
      ? 80
      : 150;
  const grandTotal = productTotal + deliveryCharge;

  const generateOrderSku = () => 'KZK-' + Date.now().toString(36).toUpperCase();

  const getWhatsAppMessage = (orderSku: string) => {
    const itemsText = cartItems
      .map((item) => `• ${item.product_title} (${item.size || 'N/A'}, ${item.color || 'N/A'}) x${item.quantity} - ৳${item.price * item.quantity}`)
      .join('\n');

    const deliveryLabel =
      customer.delivery_type === 'shop_pickup'
        ? 'Shop Pickup (Free)'
        : customer.delivery_type === 'inside_dhaka'
        ? 'Inside Dhaka (৳80)'
        : 'Outside Dhaka (৳150)';

    const phoneLabel = isAdmin ? '*WhatsApp:*' : '*Phone:*';

    return `🛍️ *New Order - Kozzak Mens Wear*

*Customer:* ${customer.customer_name}
${phoneLabel} ${customer.whatsapp_number}
*Address:* ${customer.address}
*Delivery:* ${deliveryLabel}

*Items:*
${itemsText}

*Product Total:* ৳${productTotal}
*Delivery:* ৳${deliveryCharge}
*Total:* ৳${grandTotal}

*SKU:* ${orderSku}`;
  };

  const handlePlaceOrder = async () => {
    if (!customer.customer_name || !customer.whatsapp_number || !customer.address || cartItems.length === 0) {
      return;
    }

    setIsSubmitting(true);
    const skuCode = generateOrderSku();
    const itemsDescription = cartItems
      .map((item) => `${item.product_title} (${item.size}, ${item.color}) x${item.quantity}`)
      .join(', ');

    const newOrder: Partial<Order> = {
      customer_name: customer.customer_name,
      whatsapp_number: customer.whatsapp_number,
      address: customer.address,
      delivery_type: customer.delivery_type,
      items: itemsDescription,
      product_price: productTotal,
      delivery_charge: deliveryCharge,
      total_price: grandTotal,
      sku_code: skuCode,
      status: 'pending',
      tracking_location: 'Dhaka', // Default tracking starting location
      notes: ''
    };

    try {
      // 1. Save to Local REST DB (so it displays on Admin Orders page!)
      await De.entities.Order.create(newOrder);
    } catch (err) {
      console.error('Failed to create order on backend:', err);
    }

    try {
      // 2. Invoke spreadsheet logging trigger (handled safely by Express!)
      await De.functions.invoke('recordOrderToSheets', { order: newOrder });
    } catch (err) {
      console.error('Failed to record order to sheets:', err);
    }

    // 3. Clear cart
    saveCart([]);

    // 4. Open WhatsApp Web ONLY if admin
    if (isAdmin) {
      const adminWhatsApp = settings?.whatsapp_number || '';
      const cleanPhone = adminWhatsApp.replace(/[^0-9]/g, '');
      const waUrl = cleanPhone 
        ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(getWhatsAppMessage(skuCode))}`
        : `https://wa.me/?text=${encodeURIComponent(getWhatsAppMessage(skuCode))}`;
      window.open(waUrl, '_blank');
    }

    setIsSubmitting(false);
    setIsOrdered(true);
  };

  if (isOrdered) {
    return (
      <div className="min-h-screen bg-obsidian text-silver flex flex-col justify-between">
        <Navbar />
        <div className="pt-24 flex flex-col items-center justify-center min-h-[60vh] gap-4 px-4 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center border border-green-500/30"
          >
            <Check size={36} className="text-green-500" />
          </motion.div>
          <h2 className="font-display text-2xl md:text-3xl font-bold text-silver">Order Placed!</h2>
          <p className="text-silver/40 text-sm max-w-md">
            {isAdmin
              ? "Your order has been saved successfully. We've opened WhatsApp to complete your message checkout submission."
              : "Your order has been placed successfully! We will contact you shortly to confirm your delivery."}
          </p>
          <Link
            to="/"
            className="px-6 py-3 bg-cobalt text-white text-sm font-semibold rounded-xl glow-blue hover:scale-105 active:scale-95 transition-all mt-6"
          >
            Continue Shopping
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

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
          <span>Continue Shopping</span>
        </Link>

        <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-silver mb-6 sm:mb-10 tracking-wide">
          Your Shopping Cart
        </h1>

        {cartItems.length === 0 ? (
          <div className="text-center py-16 sm:py-20 glass rounded-2xl border border-silver/5 px-4">
            <p className="text-silver/40 text-sm sm:text-base mb-6">Your shopping cart is currently empty</p>
            <Link
              to="/category"
              className="px-6 py-3.5 bg-cobalt text-white text-xs sm:text-sm font-semibold rounded-xl glow-blue hover:scale-105 active:scale-95 transition-all inline-block"
            >
              Browse Catalog
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
            {/* Products List & User info Form */}
            <div className="lg:col-span-7 space-y-6">
              {/* Product items loop */}
              <div className="space-y-3 sm:space-y-4">
                {cartItems.map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="glass-card rounded-xl p-3.5 sm:p-4 flex flex-row items-center gap-3 sm:gap-4 border border-silver/5 justify-between"
                  >
                    {/* Thumbnail */}
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden shrink-0 bg-obsidian/40 border border-silver/10">
                      {item.product_image ? (
                        <img
                          src={item.product_image}
                          alt={item.product_title}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-full h-full bg-secondary" />
                      )}
                    </div>

                    {/* Meta info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-silver text-xs sm:text-sm font-medium truncate">
                        {item.product_title}
                      </h3>
                      <p className="text-silver/40 text-[10px] sm:text-xs mt-0.5 truncate">
                        Size: {item.size || 'Standard'} • Color:{' '}
                        <span
                          className="inline-block w-2.5 h-2.5 rounded-full align-middle ml-1"
                          style={{ backgroundColor: item.color }}
                        />
                      </p>
                      <p className="text-cobalt text-xs sm:text-sm font-semibold mt-1">
                        ৳{item.price}
                      </p>

                      {/* Quantity adjusting buttons */}
                      <div className="flex items-center gap-2 sm:gap-3 mt-1.5">
                        <button
                          onClick={() => handleUpdateQuantity(idx, -1)}
                          className="w-6 h-6 sm:w-7 sm:h-7 rounded glass flex items-center justify-center text-silver/60 hover:text-white cursor-pointer active:scale-95"
                          aria-label="Decrease Quantity"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="text-silver text-xs sm:text-sm font-semibold w-4 text-center">{item.quantity}</span>
                        <button
                          onClick={() => handleUpdateQuantity(idx, 1)}
                          className="w-6 h-6 sm:w-7 sm:h-7 rounded glass flex items-center justify-center text-silver/60 hover:text-white cursor-pointer active:scale-95"
                          aria-label="Increase Quantity"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>

                    {/* Actions & Price */}
                    <div className="flex flex-col items-end justify-between h-full shrink-0">
                      <button
                        onClick={() => handleRemoveItem(idx)}
                        className="text-silver/30 hover:text-destructive p-1 rounded transition-colors cursor-pointer"
                        title="Remove item"
                        aria-label="Remove item"
                      >
                        <Trash2 size={16} />
                      </button>
                      <span className="text-silver text-xs sm:text-sm font-bold mt-2">
                        ৳{item.price * item.quantity}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Delivery info form */}
              <div className="glass-card rounded-xl p-4 sm:p-6 space-y-4 border border-silver/5">
                <h3 className="text-silver font-semibold text-xs sm:text-sm tracking-wider uppercase mb-2">
                  Customer & Delivery Details
                </h3>
                <input
                  value={customer.customer_name}
                  onChange={(e) => setCustomer({ ...customer, customer_name: e.target.value })}
                  placeholder="Your Name *"
                  className="w-full bg-transparent border border-silver/10 rounded-lg px-3.5 sm:px-4 py-3 text-silver text-xs sm:text-sm placeholder:text-silver/30 focus:border-cobalt outline-none transition-colors"
                  required
                />
                <input
                  value={customer.whatsapp_number}
                  onChange={(e) => setCustomer({ ...customer, whatsapp_number: e.target.value })}
                  placeholder={isAdmin ? "WhatsApp Number *" : "Phone Number *"}
                  className="w-full bg-transparent border border-silver/10 rounded-lg px-3.5 sm:px-4 py-3 text-silver text-xs sm:text-sm placeholder:text-silver/30 focus:border-cobalt outline-none transition-colors"
                  required
                />
                <input
                  value={customer.address}
                  onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                  placeholder="Full Delivery Address *"
                  className="w-full bg-transparent border border-silver/10 rounded-lg px-3.5 sm:px-4 py-3 text-silver text-xs sm:text-sm placeholder:text-silver/30 focus:border-cobalt outline-none transition-colors"
                  required
                />

                {/* Delivery Option Toggle buttons */}
                <div>
                  <p className="text-silver/50 text-xs mb-2 font-medium">Delivery Location</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {[
                      { value: 'inside_dhaka', label: 'Inside Dhaka', price: '৳80' },
                      { value: 'outside_dhaka', label: 'Outside Dhaka', price: '৳150' },
                      { value: 'shop_pickup', label: 'Shop Pickup', price: 'Free' }
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() =>
                          setCustomer({
                            ...customer,
                            delivery_type: option.value as 'inside_dhaka' | 'outside_dhaka' | 'shop_pickup'
                          })
                        }
                        className={`p-3 rounded-lg text-center text-xs transition-all cursor-pointer flex flex-row sm:flex-col items-center justify-between sm:justify-center ${
                          customer.delivery_type === option.value
                            ? 'bg-cobalt text-white glow-blue font-semibold'
                            : 'glass text-silver/60 hover:text-silver'
                        }`}
                      >
                        <span>{option.label}</span>
                        <span className="font-bold sm:mt-1">{option.price}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Receipt Preview Column */}
            <div className="lg:col-span-5 space-y-6">
              <div className="glass-card rounded-xl p-4 sm:p-6 border border-silver/5">
                <h3 className="text-silver font-semibold text-xs sm:text-sm tracking-wider uppercase mb-4">
                  Order Summary
                </h3>
                <div className="space-y-3 text-xs sm:text-sm">
                  <div className="flex justify-between text-silver/60">
                    <span>Products Subtotal</span>
                    <span>৳{productTotal}</span>
                  </div>
                  <div className="flex justify-between text-silver/60">
                    <span>Delivery Charge</span>
                    <span>৳{deliveryCharge}</span>
                  </div>
                  <div className="border-t border-silver/10 pt-3 flex justify-between text-silver font-semibold text-base sm:text-lg">
                    <span>Total Payable</span>
                    <span className="text-cobalt font-bold">৳{grandTotal}</span>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handlePlaceOrder}
                  disabled={
                    !customer.customer_name ||
                    !customer.whatsapp_number ||
                    !customer.address ||
                    isSubmitting
                  }
                  className={`w-full mt-6 py-3.5 sm:py-4 rounded-xl text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2.5 transition-all disabled:opacity-30 cursor-pointer ${
                    isAdmin ? 'bg-green-600 hover:bg-green-700' : 'bg-cobalt hover:bg-cobalt-light glow-blue'
                  }`}
                >
                  <Send size={16} />
                  <span>{isSubmitting ? 'Processing...' : (isAdmin ? 'Order via WhatsApp' : 'Place Order')}</span>
                </motion.button>
              </div>

              {/* Receipt Code Preview block */}
              {isAdmin && (
                <div className="glass-card rounded-xl p-4 sm:p-6 border border-silver/5">
                  <h3 className="text-silver/40 text-xs tracking-wider uppercase mb-3">
                    Order Receipt Preview
                  </h3>
                  <div className="bg-obsidian/50 rounded-lg p-3.5 font-mono text-[11px] text-silver/60 leading-relaxed whitespace-pre-wrap overflow-x-auto">
                    {cartItems.length > 0
                      ? getWhatsAppMessage('KZK-PREVIEW')
                      : 'Add items to see receipt preview'}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};
export default Cart;
