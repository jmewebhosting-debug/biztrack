import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { Users, Search, ChevronRight, TrendingUp, Crown, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

const CustomersPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const customerStats = useLiveQuery(async () => {
    const sales = await db.sales.toArray();
    const stats: Record<string, { totalSpent: number; orderCount: number; lastOrder: Date; profit: number; categories: Set<string> }> = {};

    sales.forEach(sale => {
      if (!stats[sale.customerName]) {
        stats[sale.customerName] = { totalSpent: 0, orderCount: 0, lastOrder: new Date(0), profit: 0, categories: new Set() };
      }
      stats[sale.customerName].totalSpent += sale.price;
      stats[sale.customerName].orderCount += 1;
      stats[sale.customerName].profit += sale.profit;
      stats[sale.customerName].categories.add(sale.category);
      if (new Date(sale.date) > stats[sale.customerName].lastOrder) {
        stats[sale.customerName].lastOrder = new Date(sale.date);
      }
    });

    return Object.entries(stats)
      .map(([name, data]) => ({ name, ...data, categories: Array.from(data.categories) }))
      .sort((a, b) => b.totalSpent - a.totalSpent);
  }, []);

  const filteredCustomers = customerStats?.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const totalCustomers = customerStats?.length || 0;
  const totalRevenue = customerStats?.reduce((acc, c) => acc + c.totalSpent, 0) || 0;
  const avgOrderValue = totalCustomers > 0 ? totalRevenue / (customerStats?.reduce((acc, c) => acc + c.orderCount, 0) || 1) : 0;

  const getTierInfo = (spent: number, count: number) => {
    if (spent >= 10000 || count >= 5) return { label: 'VIP', color: '#f59e0b', icon: <Crown size={10} /> };
    if (spent >= 5000 || count >= 3) return { label: 'Regular', color: '#6366f1', icon: <Star size={10} /> };
    return { label: 'New', color: '#94a3b8', icon: null };
  };

  const avatarColors = ['#6366f1', '#a855f7', '#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#06b6d4'];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold font-heading">Customer CRM</h2>
        <p className="text-xs text-text-muted">Your complete client intelligence hub</p>
      </div>

      {/* Summary Row */}
      {totalCustomers > 0 && (
        <div className="grid grid-cols-3 gap-2.5">
          <div className="glass p-3.5 flex flex-col gap-1" style={{ background: 'rgba(99,102,241,0.06)' }}>
            <p className="text-[8px] uppercase font-extrabold text-text-muted tracking-widest">Clients</p>
            <p className="text-lg font-bold text-primary">{totalCustomers}</p>
          </div>
          <div className="glass p-3.5 flex flex-col gap-1" style={{ background: 'rgba(16,185,129,0.06)' }}>
            <p className="text-[8px] uppercase font-extrabold text-text-muted tracking-widest">Revenue</p>
            <p className="text-lg font-bold text-emerald-400">₹{(totalRevenue / 1000).toFixed(1)}K</p>
          </div>
          <div className="glass p-3.5 flex flex-col gap-1" style={{ background: 'rgba(168,85,247,0.06)' }}>
            <p className="text-[8px] uppercase font-extrabold text-text-muted tracking-widest">Avg Order</p>
            <p className="text-lg font-bold text-purple-400">₹{Math.round(avgOrderValue).toLocaleString()}</p>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-half text-text-muted" size={16} />
        <input
          type="text"
          placeholder="Search customer..."
          className="pl-11 h-11 text-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Customer List */}
      <div className="flex flex-col gap-3">
        {filteredCustomers.length > 0 ? (
          filteredCustomers.map((customer, i) => {
            const tier = getTierInfo(customer.totalSpent, customer.orderCount);
            const avatarColor = avatarColors[i % avatarColors.length];
            const margin = customer.profit > 0 ? Math.round((customer.profit / customer.totalSpent) * 100) : 0;

            return (
              <motion.div
                key={customer.name}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="glass p-4 flex flex-col gap-3 card-hover"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* Rank + Avatar */}
                    <div className="relative">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-xl flex-shrink-0"
                        style={{ background: `linear-gradient(135deg, ${avatarColor}, ${avatarColor}99)` }}>
                        {customer.name[0].toUpperCase()}
                      </div>
                      {i < 3 && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-extrabold text-white"
                          style={{ background: i === 0 ? '#f59e0b' : i === 1 ? '#94a3b8' : '#cd7f32' }}>
                          #{i + 1}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm truncate max-w-[110px]">{customer.name}</h3>
                        <span className="text-[8px] font-extrabold px-1.5 py-0.5 rounded-full flex items-center gap-0.5"
                          style={{ color: tier.color, background: `${tier.color}18`, border: `1px solid ${tier.color}30` }}>
                          {tier.icon} {tier.label}
                        </span>
                      </div>
                      <p className="text-[10px] text-text-muted mt-0.5">
                        {customer.orderCount} orders • Last: {format(customer.lastOrder, 'dd MMM yy')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-base font-bold" style={{ background: 'linear-gradient(to right, #6366f1, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                      ₹{customer.totalSpent.toLocaleString()}
                    </p>
                    <p className="text-[10px] text-text-muted">Lifetime Value</p>
                  </div>
                </div>

                {/* Stats Row */}
                <div className="flex gap-2 pt-2 border-t border-white/5">
                  <div className="flex-1 text-center">
                    <p className="text-[8px] uppercase font-extrabold text-text-muted tracking-widest">Profit</p>
                    <p className="text-xs font-bold text-emerald-400 mt-0.5">₹{customer.profit.toLocaleString()}</p>
                  </div>
                  <div className="w-px bg-white/5" />
                  <div className="flex-1 text-center">
                    <p className="text-[8px] uppercase font-extrabold text-text-muted tracking-widest">Margin</p>
                    <p className="text-xs font-bold text-primary mt-0.5">{margin}%</p>
                  </div>
                  <div className="w-px bg-white/5" />
                  <div className="flex-1 text-center">
                    <p className="text-[8px] uppercase font-extrabold text-text-muted tracking-widest">Services</p>
                    <p className="text-xs font-bold mt-0.5">{customer.categories.slice(0, 2).join(', ')}</p>
                  </div>
                </div>
              </motion.div>
            );
          })
        ) : (
          <div className="glass p-12 text-center flex flex-col items-center gap-3 opacity-60">
            <Users size={40} className="text-text-muted" />
            <p className="text-sm font-medium">
              {searchTerm ? 'No customers match your search.' : 'No customers yet. Add your first sale!'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomersPage;
