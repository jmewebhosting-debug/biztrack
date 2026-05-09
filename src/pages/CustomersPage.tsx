import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { Users, Search, ShoppingBag, TrendingUp, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const CustomersPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const customerStats = useLiveQuery(async () => {
    const sales = await db.sales.toArray();
    const stats: Record<string, { totalSpent: number, orderCount: number, lastOrder: Date }> = {};

    sales.forEach(sale => {
      if (!stats[sale.customerName]) {
        stats[sale.customerName] = { totalSpent: 0, orderCount: 0, lastOrder: new Date(0) };
      }
      stats[sale.customerName].totalSpent += sale.price;
      stats[sale.customerName].orderCount += 1;
      if (new Date(sale.date) > stats[sale.customerName].lastOrder) {
        stats[sale.customerName].lastOrder = new Date(sale.date);
      }
    });

    return Object.entries(stats)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.totalSpent - a.totalSpent);
  }, []);

  const filteredCustomers = customerStats?.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-2xl font-bold font-heading">Customer CRM</h2>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
        <input 
          type="text" 
          placeholder="Search customer name..." 
          className="pl-12"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-3">
        {filteredCustomers.length > 0 ? (
          filteredCustomers.map((customer) => (
            <motion.div 
              key={customer.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass p-5 flex justify-between items-center group cursor-pointer hover:border-primary/30 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center text-primary font-bold text-xl border border-primary/10">
                  {customer.name[0]}
                </div>
                <div>
                  <h3 className="font-bold text-base">{customer.name}</h3>
                  <p className="text-[10px] text-text-muted uppercase tracking-widest font-medium">
                    {customer.orderCount} Orders • Last: {customer.lastOrder.toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-xs text-text-muted font-medium mb-1">Lifetime Value</p>
                  <p className="text-lg font-bold text-gradient">₹{customer.totalSpent.toLocaleString()}</p>
                </div>
                <ChevronRight size={18} className="text-text-muted group-hover:text-primary transition-colors" />
              </div>
            </motion.div>
          ))
        ) : (
          <div className="glass p-12 text-center flex flex-col items-center gap-3 opacity-60">
             <Users size={40} className="text-text-muted" />
             <p className="text-sm">No customers found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomersPage;
