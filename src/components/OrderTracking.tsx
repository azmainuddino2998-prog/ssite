import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ChevronLeft, Search, AlertCircle, Clock, CheckCircle2, Package, Truck, MapPin } from 'lucide-react';
import { De } from '../lib/sdk';
import { Order } from '../types';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

const STATUS_STEPS = [
  { key: 'pending', label: 'Order Placed', icon: Clock },
  { key: 'confirmed', label: 'Confirmed', icon: CheckCircle2 },
  { key: 'processing', label: 'Processing', icon: Package },
  { key: 'shipped', label: 'Shipped', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: MapPin }
];

const DIVISIONS = [
  { name: 'Dhaka', x: 52, y: 52 },
  { name: 'Chittagong', x: 72, y: 68 },
  { name: 'Rajshahi', x: 28, y: 35 },
  { name: 'Khulna', x: 35, y: 65 },
  { name: 'Sylhet', x: 75, y: 30 },
  { name: 'Barisal', x: 48, y: 72 },
  { name: 'Rangpur', x: 30, y: 18 },
  { name: 'Mymensingh', x: 55, y: 35 }
];

export const OrderTracking: React.FC = () => {
  const [skuInput, setSkuInput] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [searchInitiated, setSearchInitiated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorOccurred, setErrorOccurred] = useState(false);

  const handleTrackOrder = async () => {
    if (!skuInput.trim()) return;

    setIsLoading(true);
    setErrorOccurred(false);
    setOrder(null);
    setSearchInitiated(true);

    try {
      const results = await De.entities.Order.filter({
        sku_code: skuInput.trim().toUpperCase()
      });

      if (results.length > 0) {
        setOrder(results[0]);
      } else {
        setErrorOccurred(true);
      }
    } catch (err) {
      console.error('Error tracking order:', err);
      setErrorOccurred(true);
    } finally {
      setIsLoading(false);
    }
  };

  const currentStatusIndex = order
    ? STATUS_STEPS.findIndex((step) => step.key === order.status)
    : -1;

  const currentLocationNode = order?.tracking_location
    ? DIVISIONS.find((div) => div.name.toLowerCase() === order.tracking_location?.toLowerCase())
    : DIVISIONS[0]; // Fallback to Dhaka

  return (
    <div className="min-h-screen bg-obsidian text-silver">
      <Navbar />

      <div className="pt-24 pb-16 max-w-3xl mx-auto px-4">
        {/* Back navigation */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-silver/40 hover:text-silver text-sm mb-8 transition-colors"
        >
          <ChevronLeft size={16} />
          <span>Home</span>
        </Link>

        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-cobalt text-xs tracking-[0.3em] uppercase mb-2">Track Your Package</p>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-silver">
            Order Tracking
          </h1>
        </div>

        {/* Search Box */}
        <div className="glass-card rounded-xl p-6 flex gap-3 mb-8 border border-silver/5">
          <input
            value={skuInput}
            onChange={(e) => setSkuInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleTrackOrder()}
            placeholder="Enter SKU Code (e.g. KZK-XXXXXX)"
            className="flex-1 bg-transparent text-silver text-sm placeholder:text-silver/20 outline-none px-2"
          />
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleTrackOrder}
            disabled={isLoading}
            className="px-6 py-2 bg-cobalt text-white rounded-lg text-sm flex items-center gap-2 font-semibold glow-blue cursor-pointer disabled:opacity-30"
          >
            <Search size={16} />
            <span>Track</span>
          </motion.button>
        </div>

        {/* Loading Spinner */}
        {isLoading && (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 border-2 border-cobalt/30 border-t-cobalt rounded-full animate-spin" />
          </div>
        )}

        {/* Error / Not Found card */}
        {errorOccurred && !isLoading && (
          <div className="glass-card rounded-xl p-8 text-center border border-silver/5">
            <AlertCircle size={48} className="text-destructive/50 mx-auto mb-4" />
            <p className="text-silver/50">No order found with SKU code: "{skuInput}"</p>
          </div>
        )}

        {/* Order tracking layout block */}
        {order && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Status Steps timeline card */}
            <div className="glass-card rounded-xl p-6 border border-silver/5">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-0 mb-6">
                {STATUS_STEPS.map((step, idx) => {
                  const isActive = idx <= currentStatusIndex;
                  const Icon = step.icon;
                  return (
                    <div key={step.key} className="flex flex-col items-center flex-1 relative w-full md:w-auto">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                          isActive ? 'bg-cobalt text-white glow-blue' : 'glass text-silver/30'
                        }`}
                      >
                        <Icon size={18} />
                      </div>
                      <p className={`text-[11px] mt-2 text-center font-medium ${isActive ? 'text-cobalt' : 'text-silver/30'}`}>
                        {step.label}
                      </p>

                      {/* Connection lines on desktop */}
                      {idx < STATUS_STEPS.length - 1 && (
                        <div
                          className={`hidden md:block absolute top-5 left-[60%] w-[80%] h-0.5 ${
                            idx < currentStatusIndex ? 'bg-cobalt' : 'bg-silver/10'
                          }`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Visual Map location card */}
            <div className="glass-card rounded-xl p-6 border border-silver/5">
              <h3 className="text-silver/60 text-xs tracking-wider uppercase mb-4 font-semibold">
                Package Location Map
              </h3>
              <div className="relative w-full aspect-[3/4] max-w-xs mx-auto bg-obsidian/30 rounded-xl p-4 border border-silver/5">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  {/* Outer Map Contour Outline of Bangladesh */}
                  <path
                    d="M30,8 L40,5 L55,8 L65,12 L78,20 L82,30 L80,40 L75,35 L72,45 L78,55 L80,65 L75,75 L70,80 L60,78 L50,82 L45,85 L38,80 L32,75 L28,70 L30,60 L25,55 L22,45 L25,35 L22,25 L25,18 Z"
                    fill="rgba(37,99,235,0.03)"
                    stroke="rgba(37,99,235,0.25)"
                    strokeWidth="0.75"
                  />

                  {/* Divisions markers */}
                  {DIVISIONS.map((div) => (
                    <g key={div.name}>
                      <circle cx={div.x} cy={div.y} r="1.2" fill="rgba(226,232,240,0.25)" />
                      <text
                        x={div.x}
                        y={div.y - 3.5}
                        textAnchor="middle"
                        fill="rgba(226,232,240,0.35)"
                        fontSize="3"
                        fontFamily="sans-serif"
                        className="pointer-events-none select-none font-medium"
                      >
                        {div.name}
                      </text>
                    </g>
                  ))}

                  {/* Pulsing Active Tracker Ring */}
                  {currentLocationNode && (
                    <g>
                      <circle cx={currentLocationNode.x} cy={currentLocationNode.y} r="3.5" fill="rgba(37,99,235,0.3)">
                        <animate
                          attributeName="r"
                          values="3.5;6.5;3.5"
                          dur="2.5s"
                          repeatCount="indefinite"
                        />
                        <animate
                          attributeName="opacity"
                          values="0.4;1;0.4"
                          dur="2.5s"
                          repeatCount="indefinite"
                        />
                      </circle>
                      <circle cx={currentLocationNode.x} cy={currentLocationNode.y} r="1.8" fill="#2563EB" />
                    </g>
                  )}
                </svg>
              </div>

              <p className="text-center text-silver/40 text-sm mt-4">
                Current Status Location:{' '}
                <span className="text-cobalt font-semibold">
                  {order.tracking_location || 'Dhaka'}
                </span>
              </p>
            </div>

            {/* Package Details summary */}
            <div className="glass-card rounded-xl p-6 border border-silver/5">
              <h3 className="text-silver/60 text-xs tracking-wider uppercase mb-3 font-semibold">
                Order Details
              </h3>
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-silver/40">SKU Code</span>
                  <span className="text-silver font-semibold">{order.sku_code}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-silver/40">Customer</span>
                  <span className="text-silver">{order.customer_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-silver/40">Items</span>
                  <span className="text-silver max-w-[70%] text-right truncate" title={order.items}>
                    {order.items}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-silver/40">Grand Total</span>
                  <span className="text-cobalt font-bold">৳{order.total_price}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-silver/40">Status</span>
                  <span className="text-gold font-medium uppercase text-xs bg-gold/10 px-2 py-0.5 rounded">
                    {order.status}
                  </span>
                </div>
                {order.notes && (
                  <div className="border-t border-silver/5 pt-3 mt-1 text-xs text-silver/40">
                    <p className="font-semibold text-silver/50 uppercase tracking-widest text-[9px] mb-1">Seller Notes</p>
                    <p className="italic leading-relaxed">{order.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      <Footer />
    </div>
  );
};
export default OrderTracking;
