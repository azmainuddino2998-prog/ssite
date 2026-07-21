import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Download, Loader2, Check, Save } from 'lucide-react';
import { De } from '../lib/sdk';
import { Order } from '../types';

const STATUS_OPTIONS = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
const DIVISION_OPTIONS = ['Dhaka', 'Chittagong', 'Rajshahi', 'Khulna', 'Sylhet', 'Barisal', 'Rangpur', 'Mymensingh'];

export const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [successId, setSuccessId] = useState<string | null>(null);

  const loadOrders = () => {
    setIsLoading(true);
    De.entities.Order.list('-created_date', 100)
      .then(setOrders)
      .catch((err) => console.error('Failed to load orders list:', err))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleFieldChange = (orderId: string, field: keyof Order, value: any) => {
    setOrders((prev) =>
      prev.map((ord) => (ord.id === orderId ? { ...ord, [field]: value } : ord))
    );
  };

  const handleSaveOrder = async (order: Order) => {
    setSavingId(order.id);
    setSuccessId(null);

    try {
      await De.entities.Order.update(order.id, {
        status: order.status,
        tracking_location: order.tracking_location,
        notes: order.notes
      });
      setSuccessId(order.id);
      setTimeout(() => setSuccessId(null), 2000);
    } catch (err) {
      console.error('Failed to save order updates:', err);
    } finally {
      setSavingId(null);
    }
  };

  const handleExportCSV = () => {
    const headers = [
      'SKU',
      'Customer',
      'WhatsApp',
      'Address',
      'Delivery',
      'Items',
      'Product Price',
      'Delivery Charge',
      'Total',
      'Status',
      'Location',
      'Notes',
      'Date'
    ];

    const rows = orders.map((ord) => [
      ord.sku_code,
      ord.customer_name,
      ord.whatsapp_number,
      ord.address,
      ord.delivery_type,
      ord.items,
      ord.product_price,
      ord.delivery_charge,
      ord.total_price,
      ord.status,
      ord.tracking_location || '',
      ord.notes || '',
      ord.created_date?.slice(0, 10) || ''
    ]);

    const csvContent =
      [headers, ...rows]
        .map((row) => row.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(','))
        .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'orders.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl text-silver font-bold">Order Management</h2>
        {orders.length > 0 && (
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 glass text-silver/60 hover:text-silver rounded-lg text-sm flex items-center gap-2 transition-all cursor-pointer"
          >
            <Download size={16} />
            <span>Export CSV</span>
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <div className="w-8 h-8 border-2 border-cobalt/30 border-t-cobalt rounded-full animate-spin" />
        </div>
      ) : orders.length === 0 ? (
        <p className="text-silver/30 text-sm text-center py-8">No orders logged yet.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((ord) => (
            <div
              key={ord.id}
              className="glass-card rounded-xl p-5 space-y-3 border border-silver/5"
            >
              {/* Top buyer summary */}
              <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
                <div>
                  <p className="text-cobalt text-xs font-mono tracking-wider font-semibold">
                    {ord.sku_code}
                  </p>
                  <h4 className="text-silver font-semibold mt-1">{ord.customer_name}</h4>
                  <p className="text-silver/40 text-xs mt-0.5">
                    {ord.whatsapp_number} • {ord.address}
                  </p>
                </div>
                <div className="md:text-right">
                  <p className="text-cobalt font-bold text-lg">৳{ord.total_price}</p>
                  <p className="text-silver/30 text-xs mt-1">
                    {ord.created_date?.slice(0, 10)}
                  </p>
                </div>
              </div>

              {/* Items Ordered description list */}
              <div className="bg-obsidian/30 p-3 rounded-lg border border-silver/5">
                <p className="text-silver/60 text-xs leading-relaxed">
                  <span className="font-semibold text-silver/40 mr-2">Items:</span>
                  {ord.items}
                </p>
              </div>

              {/* Status forms & locations triggers */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div>
                  <label className="text-silver/40 text-xs block mb-1">Status</label>
                  <select
                    value={ord.status}
                    onChange={(e) => handleFieldChange(ord.id, 'status', e.target.value)}
                    className="w-full bg-obsidian border border-silver/10 rounded-lg px-3 py-2 text-silver text-sm outline-none focus:border-cobalt transition-colors"
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-silver/40 text-xs block mb-1">Tracking Location</label>
                  <select
                    value={ord.tracking_location || ''}
                    onChange={(e) => handleFieldChange(ord.id, 'tracking_location', e.target.value)}
                    className="w-full bg-obsidian border border-silver/10 rounded-lg px-3 py-2 text-silver text-sm outline-none focus:border-cobalt transition-colors"
                  >
                    <option value="">Select Location</option>
                    {DIVISION_OPTIONS.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-1">
                  <label className="text-silver/40 text-xs block mb-1">Admin Notes</label>
                  <input
                    value={ord.notes || ''}
                    onChange={(e) => handleFieldChange(ord.id, 'notes', e.target.value)}
                    placeholder="Courier notes, status detail..."
                    className="w-full bg-obsidian border border-silver/10 rounded-lg px-3 py-2 text-silver text-sm outline-none focus:border-cobalt transition-colors"
                  />
                </div>

                <div className="flex">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleSaveOrder(ord)}
                    disabled={savingId === ord.id}
                    className="px-5 py-2.5 bg-cobalt text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 relative overflow-hidden cursor-pointer w-full"
                  >
                    {savingId === ord.id ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : successId === ord.id ? (
                      <Check size={14} />
                    ) : (
                      <Save size={14} />
                    )}
                    <span>
                      {savingId === ord.id ? 'Saving...' : successId === ord.id ? 'Saved!' : 'Save'}
                    </span>
                  </motion.button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default AdminOrders;
