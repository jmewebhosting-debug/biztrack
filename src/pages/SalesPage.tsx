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
    <div className="flex flex-col gap-6">
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
      <div className="grid grid-cols-2 gap-2.5">
        <div className="glass p-3.5 bg-primary/5 border-primary/20 flex flex-col gap-1">
          <p className="text-[8px] uppercase font-extrabold text-text-muted tracking-widest">Total Revenue</p>
          <h3 className="text-base font-bold">₹{totalRevenue.toLocaleString()}</h3>
        </div>
        <div className="glass p-3.5 bg-emerald-500/5 border-emerald-500/20 flex flex-col gap-1">
          <p className="text-[8px] uppercase font-extrabold text-text-muted tracking-widest">Net Profit</p>
          <h3 className="text-base font-bold text-emerald-400">₹{totalProfit.toLocaleString()}</h3>
        </div>
      </div>

      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-half text-text-muted group-focus-within:text-primary transition-colors" size={16} />
        <input 
          type="text" 
          placeholder="Search items or customers..." 
          className="pl-11 h-11 text-sm bg-white/[0.03]"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-3.5">
        {filteredSales.length > 0 ? (
          filteredSales.map((sale) => (
            <SaleCard key={sale.id} sale={sale} onDelete={() => handleDelete(sale.id)} />
          ))
        ) : (
          <div className="glass p-12 text-center flex flex-col items-center gap-3 opacity-60">
             <div className="p-4 rounded-full bg-white/5">
                <TrendingUp size={32} className="text-text-muted" />
             </div>
             <p className="text-sm font-medium">No sales matches found.</p>
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
      className="glass p-4 flex flex-col gap-3.5 border-l-4 card-hover overflow-hidden relative"
      style={{ borderLeftColor: sale.category === 'Software' ? '#60a5fa' : sale.category === 'VPS' ? '#c084fc' : '#34d399' }}
    >
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <span className={`text-[8px] font-extrabold px-2 py-0.5 rounded-full bg-white/5 border border-white/10 uppercase tracking-widest ${
              sale.category === 'Software' ? 'text-blue-400' : sale.category === 'VPS' ? 'text-purple-400' : 'text-emerald-400'
            }`}>
              {sale.category}
            </span>
            <span className="text-[8px] font-extrabold text-emerald-400 bg-emerald-400/5 px-2 py-0.5 rounded-full uppercase tracking-tighter">{margin}% Margin</span>
          </div>
          <h3 className="text-sm font-bold mt-1 leading-tight">{sale.productName}</h3>
          <p className="text-[10px] text-text-muted">Client: <span className="text-text-main font-semibold">{sale.customerName}</span></p>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-lg font-extrabold text-gradient">₹{sale.price.toLocaleString()}</span>
          <span className="text-[9px] text-emerald-400 font-bold flex items-center gap-1 mt-0.5">
            <ArrowUpRight size={10} /> +₹{sale.profit.toLocaleString()}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 py-2.5 border-y border-white/5 bg-white/[0.01] -mx-4 px-4">
        <div className="flex flex-col gap-0.5">
          <p className="text-[8px] text-text-muted uppercase font-extrabold tracking-widest">Sale Date</p>
          <div className="flex items-center gap-1.5 text-[11px] font-medium">
            <Calendar size={12} className="text-primary" />
            <span>{format(new Date(sale.date), 'dd MMM yy')}</span>
          </div>
        </div>
        <div className="flex flex-col gap-0.5">
          <p className="text-[8px] text-text-muted uppercase font-extrabold tracking-widest">Renewal</p>
          <div className={`flex items-center gap-1.5 text-[11px] font-bold ${isExpired ? 'text-rose-400' : 'text-emerald-400'}`}>
            <RefreshCcw size={12} className={isExpired ? 'animate-spin-slow' : ''} />
            <span>{format(new Date(sale.renewalDate), 'dd MMM yy')}</span>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
           {isExpired && (
             <span className="text-[8px] font-extrabold text-rose-400 animate-pulse-subtle px-1.5 py-0.5 rounded bg-rose-400/10 border border-rose-400/20 uppercase">
               Overdue
             </span>
           )}
           {sale.notes && (
              <span className="text-[9px] text-text-muted truncate max-w-[110px] italic">"{sale.notes}"</span>
           )}
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => generateInvoice(sale)}
            className="h-8 px-3 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary transition-all flex items-center gap-1.5 text-[9px] font-extrabold border border-primary/20"
          >
            <FileDown size={12} /> INVOICE
          </button>
          <button onClick={onDelete} className="h-8 w-8 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-all flex items-center justify-center">
            <Trash2 size={12} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const AddSaleModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const products = useLiveQuery(() => db.products.toArray()) || [];
  const today = format(new Date(), 'yyyy-MM-dd');
  const [formData, setFormData] = useState({
    productName: '',
    category: 'Software' as Category,
    cost: '',
    price: '',
    customerName: '',
    validityDays: '30',
    notes: '',
    saleDate: today
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
    const date = formData.saleDate ? new Date(formData.saleDate + 'T12:00:00') : new Date();
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
        className="absolute inset-0 bg-black/80 backdrop-blur-md" 
        onClick={onClose} 
      />
      <motion.div 
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="bottom-sheet w-full max-w-md z-50 flex flex-col"
      >
        <div className="sheet-handle" />
        <div className="px-6 py-4 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold font-heading">Record New Sale</h3>
            <p className="text-[11px] text-text-muted">Fill in the deal details</p>
          </div>
          <button onClick={onClose} className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-text-muted hover:text-white transition-colors">
            <Plus size={22} className="rotate-45" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="px-6 pb-8 flex flex-col gap-5 modal-form-container">
          {products.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-extrabold text-text-muted tracking-[0.15em] ml-1">Quick Selection</label>
              <div className="relative">
                <select 
                  onChange={(e) => handleProductSelect(e.target.value)} 
                  defaultValue=""
                  className="h-12 text-[15px]"
                >
                  <option value="" disabled>Pick from catalog...</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} (₹{p.price})</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-half text-text-muted pointer-events-none" size={18} />
              </div>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase font-extrabold text-text-muted tracking-[0.15em] ml-1">Service Type</label>
            <div className="grid grid-cols-3 gap-3">
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
            <label className="text-[10px] uppercase font-extrabold text-text-muted tracking-[0.15em] ml-1">Item Name</label>
            <input 
              required
              placeholder="e.g. 8GB VPS - US MASTER" 
              className="h-12 text-[15px]"
              value={formData.productName}
              onChange={(e) => setFormData({...formData, productName: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-extrabold text-text-muted tracking-[0.15em] ml-1">Cost (₹)</label>
              <input 
                required
                type="number" 
                placeholder="0"
                className="h-12 text-[15px]"
                value={formData.cost}
                onChange={(e) => setFormData({...formData, cost: e.target.value})}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-extrabold text-text-muted tracking-[0.15em] ml-1">Price (₹)</label>
              <input 
                required
                type="number" 
                placeholder="0"
                className="h-12 text-[15px] font-bold text-primary"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase font-extrabold text-text-muted tracking-[0.15em] ml-1">Customer</label>
            <input 
              required
              placeholder="Full name"
              className="h-12 text-[15px]"
              value={formData.customerName}
              onChange={(e) => setFormData({...formData, customerName: e.target.value})}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase font-extrabold text-text-muted tracking-[0.15em] ml-1">📅 Sale Date</label>
            <input 
              type="date"
              className="h-12 text-[15px]"
              value={formData.saleDate}
              max={today}
              onChange={(e) => setFormData({...formData, saleDate: e.target.value})}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase font-extrabold text-text-muted tracking-[0.15em] ml-1">Validity</label>
            <div className="relative">
              <select 
                value={formData.validityDays}
                onChange={(e) => setFormData({...formData, validityDays: e.target.value})}
                className="h-12 text-[15px]"
              >
                <option value="30">Monthly (30 Days)</option>
                <option value="90">Quarterly (90 Days)</option>
                <option value="365">Yearly (365 Days)</option>
                <option value="0">Life-time</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-half text-text-muted pointer-events-none" size={18} />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase font-extrabold text-text-muted tracking-[0.15em] ml-1">Notes</label>
            <textarea 
              placeholder="IP, Login, Keys..."
              value={formData.notes}
              rows={2}
              className="p-4 text-[15px]"
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
            />
          </div>

          <div className="mt-4">
            <button type="submit" className="btn-primary w-full h-14 text-base shadow-primary/40">Save Sale Record</button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default SalesPage;
