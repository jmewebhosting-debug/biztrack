import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { Users, Search, Phone, Mail, MapPin, Trash2, Edit2, MessageCircle, ShoppingBag, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

const CustomersPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const customers = useLiveQuery(() => db.customers.toArray()) || [];
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.phone && c.phone.includes(searchTerm))
  ).sort((a, b) => (b.totalSpent || 0) - (a.totalSpent || 0));

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 }
  };

  const handleDelete = async (id?: number) => {
    if (id && confirm('Are you sure? This will not delete their sale records.')) {
      await db.customers.delete(id);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold font-heading">Customers CRM</h2>
          <p className="text-xs text-text-muted">Manage your client directory</p>
        </div>
      </div>

      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-half text-text-muted group-focus-within:text-primary transition-colors" size={16} />
        <input 
          type="text" 
          placeholder="Search customers by name or phone..." 
          className="pl-11 h-12 text-sm bg-white/[0.03]"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 gap-3.5"
      >
        {filteredCustomers.length > 0 ? (
          filteredCustomers.map((customer) => (
            <CustomerCard 
              key={customer.id} 
              customer={customer} 
              onDelete={() => handleDelete(customer.id)} 
              onViewHistory={() => setSelectedCustomer(customer)}
              variants={itemVariants}
            />
          ))
        ) : (
          <div className="glass p-12 text-center flex flex-col items-center gap-3 opacity-60">
             <Users size={40} className="text-text-muted" />
             <p className="text-sm">No customers found.</p>
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {selectedCustomer && (
          <HistoryDrawer 
            customer={selectedCustomer} 
            onClose={() => setSelectedCustomer(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const CustomerCard: React.FC<{ customer: any; onDelete: () => void; onViewHistory: () => void; variants: any }> = ({ customer, onDelete, onViewHistory, variants }) => {
  const isVIP = (customer.totalSpent || 0) > 10000;
  
  return (
    <motion.div 
      variants={variants}
      className="glass p-5 flex flex-col gap-4 card-hover relative overflow-hidden"
    >
      {isVIP && (
         <div className="absolute top-0 right-0 bg-amber-500 text-white text-[7px] font-black px-3 py-1 rounded-bl-lg flex items-center gap-1 shadow-lg shadow-amber-500/20">
            👑 VIP CLIENT
         </div>
      )}
      <div className="flex justify-between items-start" onClick={onViewHistory}>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black text-xl border border-primary/20">
            {customer.name[0]}
          </div>
          <div>
            <h4 className="text-base font-bold">{customer.name}</h4>
            {customer.phone && (
              <div className="flex items-center gap-1.5 text-[10px] text-text-muted font-bold mt-0.5">
                <Phone size={10} className="text-primary" />
                {customer.phone}
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
           <div className={`flex items-center gap-1 text-[9px] font-bold px-2 py-1 rounded-lg ${isVIP ? 'text-amber-500 bg-amber-500/10' : 'text-emerald-400 bg-emerald-400/10'}`}>
              <ShoppingBag size={10} /> ₹{(customer.totalSpent || 0).toLocaleString()}
           </div>
           {customer.lastPurchaseDate && (
             <span className="text-[8px] text-text-muted uppercase font-bold tracking-tighter">
                Last: {format(new Date(customer.lastPurchaseDate), 'dd MMM yy')}
             </span>
           )}
        </div>
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-white/5">
        <div className="flex gap-2">
           {customer.phone && (
             <button 
                onClick={(e) => { e.stopPropagation(); window.open(`https://wa.me/${customer.phone.replace(/\D/g, '')}`, '_blank'); }}
                className="h-9 px-4 rounded-xl bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-all flex items-center gap-2 text-[10px] font-bold border border-emerald-500/20"
             >
                <MessageCircle size={14} /> WHATSAPP
             </button>
           )}
           <button 
              onClick={(e) => { e.stopPropagation(); onViewHistory(); }}
              className="h-9 px-4 rounded-xl bg-white/5 text-text-muted hover:bg-white/10 transition-all flex items-center gap-2 text-[10px] font-bold border border-white/10"
           >
              <Calendar size={14} /> HISTORY
           </button>
        </div>
        <div className="flex gap-2">
          <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-2 rounded-xl bg-rose-500/5 text-rose-400 hover:bg-rose-500/10 border border-rose-500/10 transition-all">
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const HistoryDrawer: React.FC<{ customer: any; onClose: () => void }> = ({ customer, onClose }) => {
  const sales = useLiveQuery(() => db.sales.where('customerName').equalsIgnoreCase(customer.name).reverse().toArray()) || [];

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm" />
      <motion.div 
        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} 
        className="fixed inset-y-0 right-0 w-full max-w-[360px] z-[70] glass-dark border-l border-white/10 p-6 flex flex-col gap-6"
      >
        <div className="flex justify-between items-center">
           <div>
              <h3 className="text-xl font-bold font-heading">{customer.name}</h3>
              <p className="text-xs text-text-muted">Purchase History</p>
           </div>
           <button onClick={onClose} className="p-2 rounded-xl bg-white/5 text-text-muted"><Trash2 size={20} className="rotate-45" /></button>
        </div>

        <div className="flex flex-col gap-3 overflow-y-auto pr-2">
           {sales.map(s => (
             <div key={s.id} className="p-4 rounded-2xl bg-white/5 border border-white/5 flex justify-between items-center">
                <div>
                   <h4 className="text-sm font-bold">{s.productName}</h4>
                   <p className="text-[10px] text-text-muted">{format(new Date(s.date), 'dd MMM yyyy')}</p>
                </div>
                <div className="text-right">
                   <p className="text-sm font-bold">₹{s.price.toLocaleString()}</p>
                   <p className="text-[9px] text-emerald-400">Profit: ₹{s.profit.toLocaleString()}</p>
                </div>
             </div>
           ))}
           {sales.length === 0 && <p className="text-center text-xs text-text-muted py-10">No transactions found.</p>}
        </div>
      </motion.div>
    </>
  );
};

export default CustomersPage;
