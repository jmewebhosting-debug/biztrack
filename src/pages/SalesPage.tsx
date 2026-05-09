import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { Plus, Search, Calendar, RefreshCcw, Trash2, ChevronDown, FileDown, TrendingUp, ArrowUpRight, Edit2, ShoppingBag, X, Phone, MessageCircle } from 'lucide-react';
import { generateInvoice } from '../utils/pdf';
import { format, addDays } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import type { Category, Sale } from '../types';

const SalesPage: React.FC = () => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const sales = useLiveQuery(() => db.sales.reverse().toArray()) || [];

  const filteredSales = sales.filter(s => {
    const matchesSearch = s.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDate = dateFilter ? format(new Date(s.date), 'yyyy-MM-dd') === dateFilter : true;
    return matchesSearch && matchesDate;
  });
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

      <div className="flex gap-3">
        <div className="relative group flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-half text-text-muted group-focus-within:text-primary transition-colors" size={16} />
          <input 
            type="text" 
            placeholder="Search items or customers..." 
            className="pl-11 h-11 text-sm bg-white/[0.03]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="relative group w-36">
          <Calendar className="absolute left-3.5 top-1/2 -translate-y-half text-text-muted group-focus-within:text-primary transition-colors" size={14} />
          <input 
            type="date" 
            className="pl-9 h-11 text-[10px] font-bold bg-white/[0.03] pr-2"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
          {dateFilter && (
            <button 
              onClick={() => setDateFilter('')}
              className="absolute right-2 top-1/2 -translate-y-half p-1 rounded-full bg-white/5 hover:bg-white/10"
            >
              <Plus size={12} className="rotate-45" />
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-3.5">
        {filteredSales.length > 0 ? (
          filteredSales.map((sale) => (
            <SaleCard key={sale.id} sale={sale} onEdit={() => setEditingSale(sale)} onDelete={() => handleDelete(sale.id)} />
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
        {editingSale && (
          <EditSaleModal sale={editingSale} onClose={() => setEditingSale(null)} />
        )}
      </AnimatePresence>
    </div>
  );
};

const SaleCard: React.FC<{ sale: Sale; onEdit: () => void; onDelete: () => void }> = ({ sale, onEdit, onDelete }) => {
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
          {sale.phone && (
            <button 
              onClick={() => {
                const msg = `Hello ${sale.customerName}, your invoice for ${sale.productName} (INR ${sale.price}) is ready. Thank you for choosing us!`;
                window.open(`https://wa.me/${sale.phone.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`, '_blank');
              }}
              className="h-8 w-8 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 transition-all flex items-center justify-center"
            >
              <MessageCircle size={14} />
            </button>
          )}
          <button 
            onClick={onEdit}
            className="h-8 w-8 rounded-xl bg-white/5 hover:bg-white/10 text-text-muted border border-white/10 transition-all flex items-center justify-center"
          >
            <Edit2 size={12} />
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
  const sales = useLiveQuery(() => db.sales.toArray()) || [];
  const customers = useLiveQuery(() => db.customers.toArray()) || [];
  
  const customerList = Array.from(new Set(sales.map(s => s.customerName))).sort();
  const today = format(new Date(), 'yyyy-MM-dd');

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [saleDate, setSaleDate] = useState(today);
  const [validityDays, setValidityDays] = useState('30');
  const [notes, setNotes] = useState('');
  const [amountPaid, setAmountPaid] = useState('');
  const [items, setItems] = useState<any[]>([]);
  const [autoWhatsApp, setAutoWhatsApp] = useState(true);

  const handleCustomerChange = (name: string) => {
    setCustomerName(name);
    const existing = customers.find(c => c.name.toLowerCase() === name.toLowerCase());
    if (existing?.phone) {
      setCustomerPhone(existing.phone);
    }
  };
  
  const handleAddItem = (productId: string) => {
    const product = products.find(p => p.id === parseInt(productId));
    if (product) {
      setItems([...items, {
        name: product.name,
        category: product.category,
        cost: product.cost,
        price: product.price
      }]);
    }
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const totalCost = items.reduce((acc, item) => acc + item.cost, 0);
  const totalPrice = items.reduce((acc, item) => acc + item.price, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return alert('Add at least one item');
    
    const date = new Date(saleDate + 'T12:00:00');
    const validity = parseInt(validityDays);
    const renewalDate = validity === 0 ? addDays(date, 36500) : addDays(date, validity);
    const paid = amountPaid === '' ? totalPrice : parseFloat(amountPaid);

    const newSale: Sale = {
      productName: items.length === 1 ? items[0].name : `${items.length} Items Combo`,
      category: items.length === 1 ? items[0].category : 'Software',
      cost: totalCost,
      price: totalPrice,
      profit: totalPrice - totalCost,
      date,
      customerName,
      validityDays: validity,
      renewalDate,
      status: 'active',
      notes,
      items,
      amountPaid: paid,
      phone: customerPhone
    };

    const saleId = await db.sales.add(newSale);

    // Save/Update Customer
    const existingCustomer = await db.customers.where('name').equalsIgnoreCase(customerName).first();
    if (existingCustomer) {
      await db.customers.update(existingCustomer.id!, { phone: customerPhone });
    } else {
      await db.customers.add({ name: customerName, phone: customerPhone, totalSpent: totalPrice, lastPurchaseDate: new Date() });
    }

    // Auto-create Due if not fully paid
    if (paid < totalPrice) {
      await db.dues.add({
        personName: customerName,
        type: 'to-receive',
        amount: totalPrice - paid,
        date: new Date(),
        status: 'pending',
        note: `Balance for ${newSale.productName}`,
        saleId: saleId as number
      });
    }

    if (autoWhatsApp && customerPhone) {
      const msg = `Hello ${customerName}, your invoice for ${newSale.productName} (INR ${totalPrice}) is ready. Thank you for choosing us!`;
      window.open(`https://wa.me/${customerPhone.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`, '_blank');
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      <motion.div 
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="bottom-sheet w-full max-w-md z-50 flex flex-col max-h-[90vh]"
      >
        <div className="sheet-handle" />
        <div className="px-6 py-4 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold font-heading">New Sale (Combo Mode)</h3>
            <p className="text-[11px] text-text-muted">Add multiple items to one invoice</p>
          </div>
          <button onClick={onClose} className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-text-muted hover:text-white transition-colors">
            <X size={22} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="px-6 pb-8 flex flex-col gap-5 overflow-y-auto">
          {/* Customer Selection */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase font-extrabold text-text-muted tracking-[0.15em] ml-1">Customer Name</label>
            <input 
              required
              list="customers-list"
              placeholder="Select or type new customer"
              className="h-12 text-[15px]"
              value={customerName}
              onChange={e => handleCustomerChange(e.target.value)}
            />
            <datalist id="customers-list">
              {customerList.map(c => <option key={c} value={c} />)}
            </datalist>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase font-extrabold text-text-muted tracking-[0.15em] ml-1">WhatsApp Number</label>
            <div className="relative">
              <Phone size={14} className="absolute left-4 top-1/2 -translate-y-half text-text-muted" />
              <input 
                placeholder="+91 00000 00000"
                className="h-12 pl-11 text-[15px]"
                value={customerPhone}
                onChange={e => setCustomerPhone(e.target.value)}
              />
            </div>
          </div>

          {/* Item Selection */}
          <div className="flex flex-col gap-3 p-4 rounded-2xl bg-white/5 border border-white/10">
            <label className="text-[10px] uppercase font-extrabold text-primary tracking-[0.15em]">Add Items from Catalog</label>
            <div className="relative">
              <select 
                onChange={(e) => {
                  handleAddItem(e.target.value);
                  e.target.value = "";
                }} 
                value=""
                className="h-11 text-xs"
              >
                <option value="" disabled>Pick items to add...</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name} (₹{p.price})</option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-half text-text-muted pointer-events-none" size={16} />
            </div>

            {/* Selected Items List */}
            <div className="flex flex-col gap-2 mt-2">
              {items.map((item, index) => (
                <div key={index} className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/5">
                   <div className="min-w-0">
                      <p className="text-xs font-bold truncate">{item.name}</p>
                      <p className="text-[10px] text-text-muted">₹{item.price.toLocaleString()}</p>
                   </div>
                   <button type="button" onClick={() => removeItem(index)} className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-400/10">
                      <Trash2 size={14} />
                   </button>
                </div>
              ))}
              {items.length === 0 && (
                <div className="py-6 text-center border-2 border-dashed border-white/5 rounded-xl opacity-40">
                   <ShoppingBag size={24} className="mx-auto mb-2" />
                   <p className="text-[10px] font-medium">No items added yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Pricing Summary */}
          <div className="grid grid-cols-2 gap-4">
             <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <p className="text-[9px] uppercase font-bold text-text-muted">Total Cost</p>
                <p className="text-sm font-bold">₹{totalCost.toLocaleString()}</p>
             </div>
             <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20">
                <p className="text-[9px] uppercase font-bold text-primary">Total Price</p>
                <p className="text-sm font-bold text-primary">₹{totalPrice.toLocaleString()}</p>
             </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase font-extrabold text-emerald-400 tracking-[0.15em] ml-1">Amount Paid (Leave blank for full)</label>
            <input 
              type="number" 
              placeholder={totalPrice.toString()}
              className="h-12 text-[15px] font-bold text-emerald-400"
              value={amountPaid}
              onChange={e => setAmountPaid(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase font-extrabold text-text-muted ml-1">Sale Date</label>
                <input type="date" value={saleDate} onChange={e => setSaleDate(e.target.value)} className="h-12 text-[13px]" />
             </div>
             <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase font-extrabold text-text-muted ml-1">Validity</label>
                <select value={validityDays} onChange={e => setValidityDays(e.target.value)} className="h-12 text-[13px]">
                   <option value="30">30 Days</option>
                   <option value="90">90 Days</option>
                   <option value="365">365 Days</option>
                   <option value="0">Life-time</option>
                </select>
             </div>
          </div>

          <div className="flex flex-col gap-1.5">
             <label className="text-[10px] uppercase font-extrabold text-text-muted ml-1">Internal Notes</label>
             <textarea 
               placeholder="IP, Login, Keys..."
               value={notes}
               onChange={e => setNotes(e.target.value)}
               className="p-3 text-xs"
               rows={2}
             />
          </div>

          <div className="flex items-center justify-between p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
             <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                   <MessageCircle size={18} />
                </div>
                <div>
                   <p className="text-[11px] font-bold">Auto-WhatsApp</p>
                   <p className="text-[9px] text-text-muted">Redirect after saving</p>
                </div>
             </div>
             <button 
                type="button"
                onClick={() => setAutoWhatsApp(!autoWhatsApp)}
                className={`w-12 h-6 rounded-full relative transition-all ${autoWhatsApp ? 'bg-emerald-500' : 'bg-white/10'}`}
             >
                <motion.div 
                   animate={{ x: autoWhatsApp ? 26 : 4 }}
                   className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm" 
                />
             </button>
          </div>

          <button type="submit" className="btn-primary h-14 text-base mt-2 shadow-primary/30">
            Confirm & Save Sale
          </button>
        </form>
      </motion.div>
    </div>
  );
};

const EditSaleModal: React.FC<{ sale: Sale; onClose: () => void }> = ({ sale, onClose }) => {
  const [formData, setFormData] = useState({
    customerName: sale.customerName,
    productName: sale.productName,
    category: sale.category,
    price: sale.price.toString(),
    cost: sale.cost.toString(),
    amountPaid: (sale.amountPaid || sale.price).toString(),
    validityDays: sale.validityDays.toString(),
    notes: sale.notes || '',
    saleDate: format(new Date(sale.date), 'yyyy-MM-dd')
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const price = parseFloat(formData.price);
    const cost = parseFloat(formData.cost);
    const amountPaid = parseFloat(formData.amountPaid);
    const date = new Date(formData.saleDate + 'T12:00:00');
    const validity = parseInt(formData.validityDays);
    const renewalDate = validity === 0 ? addDays(date, 36500) : addDays(date, validity);

    await db.sales.update(sale.id!, {
      customerName: formData.customerName,
      productName: formData.productName,
      category: formData.category,
      price,
      cost,
      profit: price - cost,
      amountPaid,
      date,
      validityDays: validity,
      renewalDate,
      notes: formData.notes
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
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
            <h3 className="text-xl font-bold font-heading">Edit Sale Record</h3>
            <p className="text-[11px] text-text-muted">Update transaction details</p>
          </div>
          <button onClick={onClose} className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-text-muted">
            <Plus size={22} className="rotate-45" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="px-6 pb-8 flex flex-col gap-5 modal-form-container">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase font-extrabold text-text-muted tracking-[0.15em] ml-1">Customer</label>
            <input required className="h-12 text-[15px]" value={formData.customerName} onChange={e => setFormData({...formData, customerName: e.target.value})} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase font-extrabold text-text-muted tracking-[0.15em] ml-1">Item Name</label>
            <input required className="h-12 text-[15px]" value={formData.productName} onChange={e => setFormData({...formData, productName: e.target.value})} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-extrabold text-text-muted tracking-[0.15em] ml-1">Cost (₹)</label>
              <input required type="number" className="h-12 text-[15px]" value={formData.cost} onChange={e => setFormData({...formData, cost: e.target.value})} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-extrabold text-text-muted tracking-[0.15em] ml-1">Price (₹)</label>
              <input required type="number" className="h-12 text-[15px]" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase font-extrabold text-text-muted tracking-[0.15em] ml-1">Amount Paid (₹)</label>
            <input required type="number" className="h-12 text-[15px] font-bold text-emerald-400" value={formData.amountPaid} onChange={e => setFormData({...formData, amountPaid: e.target.value})} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-extrabold text-text-muted tracking-[0.15em] ml-1">Sale Date</label>
              <input type="date" className="h-12 text-[15px]" value={formData.saleDate} onChange={e => setFormData({...formData, saleDate: e.target.value})} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-extrabold text-text-muted tracking-[0.15em] ml-1">Validity</label>
              <select className="h-12 text-[15px]" value={formData.validityDays} onChange={e => setFormData({...formData, validityDays: e.target.value})}>
                <option value="30">30 Days</option>
                <option value="90">90 Days</option>
                <option value="365">365 Days</option>
                <option value="0">Life-time</option>
              </select>
            </div>
          </div>

          <div className="mt-4">
            <button type="submit" className="btn-primary w-full h-14 text-base shadow-primary/40">Update Record</button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default SalesPage;
