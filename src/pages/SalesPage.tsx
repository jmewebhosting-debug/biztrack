import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { Plus, Search, Calendar, RefreshCcw, Trash2, ChevronDown, FileDown, TrendingUp, ArrowUpRight } from 'lucide-react';
import { generateInvoice } from '../utils/pdf';
import { format, addDays } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import type { Category, Sale } from '../types';

const SalesPage: React.FC = () => {
  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const sales = useLiveQuery(() => db.sales.reverse().toArray()) || [];

  const filteredSales = sales.filter(s => 
    s.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.customerName.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const totalRevenue = filteredSales.reduce((acc, s) => acc + s.price, 0);
  const totalProfit = filteredSales.reduce((acc, s) => acc + s.profit, 0);

  const handleDelete = async (id?: number) => {
    if (!id) return;
    if (confirm('Are you sure you want to delete this record?')) {
      await db.sales.delete(id);
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold font-heading">Sales Records</h2>
          <p className="text-xs text-text-muted">Tracking your software & VPS growth</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="btn-primary flex items-center gap-2 py-2 px-4 text-sm"
        >
          <Plus size={18} /> Add Sale
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="glass p-4 bg-primary/5 border-primary/20">
          <p className="text-[10px] uppercase font-bold text-text-muted tracking-widest">Total Revenue</p>
          <h3 className="text-lg font-bold mt-1">₹{totalRevenue.toLocaleString()}</h3>
        </div>
        <div className="glass p-4 bg-emerald-500/5 border-emerald-500/20">
          <p className="text-[10px] uppercase font-bold text-text-muted tracking-widest">Net Profit</p>
          <h3 className="text-lg font-bold text-emerald-400 mt-1">₹{totalProfit.toLocaleString()}</h3>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
        <input 
          type="text" 
          placeholder="Search product or customer..." 
          className="pl-12"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-4">
        {filteredSales.length > 0 ? (
          filteredSales.map((sale) => (
            <SaleCard key={sale.id} sale={sale} onDelete={() => handleDelete(sale.id)} />
          ))
        ) : (
          <div className="glass p-12 text-center flex flex-col items-center gap-4 opacity-60">
             <div className="p-4 rounded-full bg-white/5">
                <TrendingUp size={40} className="text-text-muted" />
             </div>
             <p className="text-sm font-medium">No sales matches your search.</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isAdding && (
          <AddSaleModal onClose={() => setIsAdding(false)} />
        )}
      </AnimatePresence>
    </div>
  );
};

const SaleCard: React.FC<{ sale: Sale; onDelete: () => void }> = ({ sale, onDelete }) => {
  const isExpired = new Date(sale.renewalDate) < new Date();
  const margin = Math.round((sale.profit / sale.price) * 100);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass p-5 flex flex-col gap-4 border-l-4 card-hover overflow-hidden relative"
      style={{ borderLeftColor: sale.category === 'Software' ? '#60a5fa' : sale.category === 'VPS' ? '#c084fc' : '#34d399' }}
    >
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full bg-white/5 border border-white/10 uppercase tracking-widest ${
              sale.category === 'Software' ? 'text-blue-400' : sale.category === 'VPS' ? 'text-purple-400' : 'text-emerald-400'
            }`}>
              {sale.category}
            </span>
            <span className="text-[9px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">{margin}% Margin</span>
          </div>
          <h3 className="text-base font-bold mt-1 leading-tight">{sale.productName}</h3>
          <p className="text-xs text-text-muted">Customer: <span className="text-text-main font-semibold">{sale.customerName}</span></p>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-xl font-bold text-gradient">₹{sale.price.toLocaleString()}</span>
          <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
            <ArrowUpRight size={10} /> Profit: ₹{sale.profit.toLocaleString()}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 py-3 border-y border-white/5 bg-white/[0.02] -mx-5 px-5">
        <div className="flex flex-col gap-1">
          <p className="text-[9px] text-text-muted uppercase font-bold tracking-wider">Sale Date</p>
          <div className="flex items-center gap-2 text-xs font-medium">
            <Calendar size={14} className="text-primary" />
            <span>{format(new Date(sale.date), 'dd MMM yyyy')}</span>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-[9px] text-text-muted uppercase font-bold tracking-wider">Renewal</p>
          <div className={`flex items-center gap-2 text-xs font-bold ${isExpired ? 'text-rose-400' : 'text-emerald-400'}`}>
            <RefreshCcw size={14} className={isExpired ? 'animate-spin-slow' : ''} />
            <span>{format(new Date(sale.renewalDate), 'dd MMM yyyy')}</span>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
           {isExpired && (
             <span className="text-[10px] font-bold text-rose-400 animate-pulse-subtle px-2 py-0.5 rounded-full bg-rose-400/10 border border-rose-400/20">
               RENEWAL DUE
             </span>
           )}
           {sale.notes && (
              <span className="text-[10px] text-text-muted truncate max-w-[120px] italic">"{sale.notes}"</span>
           )}
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => generateInvoice(sale)}
            className="p-2 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary transition-all flex items-center gap-2 text-[10px] font-bold border border-primary/20"
          >
            <FileDown size={14} /> INVOICE
          </button>
          <button onClick={onDelete} className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-all">
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const AddSaleModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const products = useLiveQuery(() => db.products.toArray()) || [];
  const [formData, setFormData] = useState({
    productName: '',
    category: 'Software' as Category,
    cost: '',
    price: '',
    customerName: '',
    validityDays: '30',
    notes: ''
  });

  const handleProductSelect = (productId: string) => {
    const product = products.find(p => p.id === parseInt(productId));
    if (product) {
      setFormData({
        ...formData,
        productName: product.name,
        category: product.category,
        cost: product.cost.toString(),
        price: product.price.toString(),
        notes: product.specs
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cost = parseFloat(formData.cost);
    const price = parseFloat(formData.price);
    const date = new Date();
    const validity = parseInt(formData.validityDays);
    const renewalDate = validity === 0 ? addDays(date, 36500) : addDays(date, validity);

    const newSale: Sale = {
      productName: formData.productName,
      category: formData.category,
      cost,
      price,
      profit: price - cost,
      date,
      customerName: formData.customerName,
      validityDays: validity,
      renewalDate,
      status: 'active',
      notes: formData.notes
    };

    await db.sales.add(newSale);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div 
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="bottom-sheet flex flex-col"
      >
        <div className="sheet-handle" />
        <div className="p-6 pt-2 border-b border-white/5 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold font-heading">Record New Sale</h3>
            <p className="text-[10px] text-text-muted">Fill in the deal details below</p>
          </div>
          <button onClick={onClose} className="p-3 rounded-2xl bg-white/5 text-text-muted hover:text-white transition-colors">
            <Plus size={24} className="rotate-45" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5 max-h-[80vh] overflow-y-auto pb-12">
          {products.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-bold text-text-muted tracking-widest ml-1">Quick Pick from Catalog</label>
              <div className="relative">
                <select 
                  onChange={(e) => handleProductSelect(e.target.value)} 
                  defaultValue=""
                  className="w-full h-12"
                >
                  <option value="" disabled>Select a template...</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} (₹{p.price})</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" size={18} />
              </div>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase font-bold text-text-muted tracking-widest ml-1">Product Category</label>
            <div className="grid grid-cols-3 gap-2">
              {['Software', 'VPS', 'Linux'].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setFormData({...formData, category: cat as Category})}
                  className={`py-3.5 text-xs font-bold rounded-2xl border transition-all ${
                    formData.category === cat ? 'bg-primary border-primary text-white shadow-lg shadow-primary/30' : 'bg-white/5 border-white/10 text-text-muted'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase font-bold text-text-muted tracking-widest ml-1">Product Details</label>
            <input 
              required
              placeholder="e.g. 8GB VPS - US MASTER" 
              className="h-12 text-base"
              value={formData.productName}
              onChange={(e) => setFormData({...formData, productName: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-bold text-text-muted tracking-widest ml-1">Cost (₹)</label>
              <input 
                required
                type="number" 
                placeholder="0"
                className="h-12 text-base"
                value={formData.cost}
                onChange={(e) => setFormData({...formData, cost: e.target.value})}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-bold text-text-muted tracking-widest ml-1">Price (₹)</label>
              <input 
                required
                type="number" 
                placeholder="0"
                className="h-12 text-base font-bold text-primary"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase font-bold text-text-muted tracking-widest ml-1">Customer Name</label>
            <input 
              required
              placeholder="Enter customer full name"
              className="h-12 text-base"
              value={formData.customerName}
              onChange={(e) => setFormData({...formData, customerName: e.target.value})}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase font-bold text-text-muted tracking-widest ml-1">Validity Period</label>
            <div className="relative">
              <select 
                value={formData.validityDays}
                onChange={(e) => setFormData({...formData, validityDays: e.target.value})}
                className="w-full h-12"
              >
                <option value="30">Monthly (30 Days)</option>
                <option value="90">Quarterly (90 Days)</option>
                <option value="365">Yearly (365 Days)</option>
                <option value="0">Life-time Access</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" size={18} />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase font-bold text-text-muted tracking-widest ml-1">Sale Notes</label>
            <textarea 
              placeholder="Serial keys, VPS IP, login details..."
              value={formData.notes}
              rows={3}
              className="p-4"
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
            />
          </div>

          <div className="flex gap-4 mt-4">
            <button type="submit" className="btn-primary flex-1 h-14 text-base shadow-primary/40">Save Sale Record</button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default SalesPage;
