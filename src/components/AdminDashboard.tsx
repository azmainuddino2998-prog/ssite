import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  ShoppingCart,
  Shirt,
  Clock,
  DollarSign
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { De } from '../lib/sdk';
import { Order, Product } from '../types';

const COLORS = ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export const AdminDashboard: React.FC<{ setActiveTab?: (tab: any) => void }> = ({ setActiveTab }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      De.entities.Order.list('-created_date', 100),
      De.entities.Product.list('-created_date', 100)
    ])
      .then(([ordList, prodList]) => {
        setOrders(ordList);
        setProducts(prodList);
      })
      .catch((err) => console.error('Failed to load dashboard metrics:', err))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-cobalt/30 border-t-cobalt rounded-full animate-spin" />
      </div>
    );
  }

  // Calculate stats
  const totalRevenue = orders.reduce((sum, order) => sum + (order.total_price || 0), 0);
  const totalOrdersCount = orders.length;
  const totalProductsCount = products.length;
  const pendingOrdersCount = orders.filter((o) => o.status === 'pending').length;

  // Build PieChart data for order status distributions
  const statusCounts = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'].map((status) => ({
    name: status.charAt(0).toUpperCase() + status.slice(1),
    value: orders.filter((o) => o.status === status).length
  })).filter((item) => item.value > 0);

  // Build Last 7 days revenue BarChart data
  const revenueByDate: { [key: string]: number } = {};
  orders.forEach((order) => {
    const dateStr = order.created_date?.slice(0, 10) || 'Unknown';
    revenueByDate[dateStr] = (revenueByDate[dateStr] || 0) + (order.total_price || 0);
  });

  const revenueChartData = Object.entries(revenueByDate)
    .slice(-7)
    .map(([date, amount]) => ({
      date: date.slice(5), // Keep only MM-DD for neatness
      amount
    }));

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl text-silver font-bold">Dashboard</h2>

      {/* Top Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue', value: `৳${totalRevenue}`, icon: DollarSign, color: 'text-gold', targetTab: 'orders' },
          { label: 'Total Orders', value: totalOrdersCount, icon: ShoppingCart, color: 'text-cobalt', targetTab: 'orders' },
          { label: 'Products', value: totalProductsCount, icon: Shirt, color: 'text-green-500', targetTab: 'products' },
          { label: 'Pending Orders', value: pendingOrdersCount, icon: Clock, color: 'text-orange-400', targetTab: 'orders' }
        ].map((card) => (
          <div
            key={card.label}
            onClick={() => setActiveTab?.(card.targetTab)}
            className="glass-card rounded-xl p-5 border border-silver/5 cursor-pointer hover:bg-silver/5 hover:border-cobalt/40 hover:-translate-y-1 active:translate-y-0 transition-all duration-300 group select-none"
            title={`Manage ${card.label}`}
          >
            <div className="flex items-center justify-between mb-3">
              <card.icon size={20} className={`${card.color} group-hover:scale-110 transition-transform duration-300`} />
              <span className="text-[10px] text-silver/20 group-hover:text-cobalt/60 transition-colors uppercase tracking-wider font-mono">Manage →</span>
            </div>
            <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
            <p className="text-silver/40 text-xs mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue chart */}
        <div className="glass-card rounded-xl p-6 border border-silver/5">
          <h3 className="text-silver/60 text-xs tracking-wider uppercase mb-4">
            Revenue (Last 7 Days)
          </h3>
          <div className="h-64">
            {revenueChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueChartData}>
                  <XAxis
                    dataKey="date"
                    stroke="rgba(226,232,240,0.1)"
                    tick={{ fill: 'rgba(226,232,240,0.4)', fontSize: 11 }}
                  />
                  <YAxis
                    stroke="rgba(226,232,240,0.1)"
                    tick={{ fill: 'rgba(226,232,240,0.4)', fontSize: 11 }}
                  />
                  <Tooltip
                    contentStyle={{
                      background: '#0E121B',
                      border: '1px solid rgba(226,232,240,0.1)',
                      borderRadius: '8px',
                      color: '#E2E8F0'
                    }}
                  />
                  <Bar dataKey="amount" fill="#2563EB" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-silver/30 text-sm">
                No revenue logs yet
              </div>
            )}
          </div>
        </div>

        {/* Order status breakdown */}
        <div className="glass-card rounded-xl p-6 border border-silver/5">
          <h3 className="text-silver/60 text-xs tracking-wider uppercase mb-4">
            Order Status
          </h3>
          <div className="h-64">
            {statusCounts.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusCounts}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {statusCounts.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: '#0E121B',
                      border: '1px solid rgba(226,232,240,0.1)',
                      borderRadius: '8px',
                      color: '#E2E8F0'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-silver/30 text-sm">
                No orders logged yet
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default AdminDashboard;
