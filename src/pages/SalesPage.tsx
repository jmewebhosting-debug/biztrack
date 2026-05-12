import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { Plus, Search, Calendar, RefreshCcw, Trash2, ChevronDown, FileDown, TrendingUp, ArrowUpRight, Edit2, ShoppingBag, X, Phone, MessageCircle, AlertCircle, CheckCircle2 } from 'lucide-react';
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black font-heading tracking-tight">Sales Records</h2>
          <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest">Growth & Revenue Tracking</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="btn-primary flex items-center gap-2 h-11 px-5 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20"
        >
          <Plus size={18} /> Add Sale
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-3.5">
        <div className="glass p-4 bg-white/[0.02] border-white/5 flex flex-col gap-1 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/5 rounded-full blur-2xl" />
          <p className="text-[8px] uppercase font-black text-text-muted tracking-widest relative z-10">Total Revenue</p>
          <h3 className="text-xl font-black relative z-10">₹{totalRevenue.toLocaleString()}</h3>
        </div>
        <div className="glass p-4 bg-white/[0.02] border-white/5 flex flex-col gap-1 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-full blur-2xl" />
          <p className="text-[8px] uppercase font-black text-text-muted tracking-widest relative z-10">Net Profit</p>
          <h3 className="text-xl font-black text-emerald-400 relative z-10">₹{totalProfit.toLocaleString()}</h3>
        </div>
      </div>

      <div className="flex gap-3">
        <div className="relative group flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-half text-text-muted group-focus-within:text-primary transition-colors" size={16} />
          <input 
            type="text" 
            placeholder="Search items or customers..." 
            className="pl-11 h-12 text-sm bg-white/[0.04] border-white/5 rounded-2xl"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="relative group w-36">
          <Calendar className="absolute left-3.5 top-1/2 -translate-y-half text-text-muted group-focus-within:text-primary transition-colors" size={14} />
          <input 
            type="date" 
            className="pl-9 h-12 text-[10px] font-black bg-white/[0.04] border-white/5 rounded-2xl pr-2 uppercase"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
        </div>
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col gap-4"
      >
        {filteredSales.length > 0 ? (
          filteredSales.map((sale) => (
            <SaleCard key={sale.id} sale={sale} onEdit={() => setEditingSale(sale)} onDelete={() => handleDelete(sale.id)} />
          ))
        ) : (
          <div className="glass p-16 text-center flex flex-col items-center gap-4 opacity-60 border-dashed border-2">
             <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                <TrendingUp size={32} className="text-text-muted opacity-30" />
             </div>
             <p className="text-sm font-bold text-text-muted">No sales found.</p>
          </div>
        )}
      </motion.div>

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
      variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
      className="glass overflow-hidden flex flex-col border border-white/5 shadow-xl hover:border-primary/20 transition-all duration-300"
    >
      {/* Top Section */}
      <div className="p-4 flex justify-between items-start bg-white/[0.02]">
        <div className="flex gap-3.5">
           <div className={`w-11 h-11 rounded-2xl flex items-center justify-center border ${
             sale.category === 'Software' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : 
             sale.category === 'VPS' ? 'bg-purple-500/10 border-purple-500/20 text-purple-400' : 
             'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
           }`}>
              <ShoppingBag size={22} />
           </div>
           <div className="flex flex-col gap-0.5">
              <h4 className="text-base font-bold text-text-main leading-tight">{sale.productName}</h4>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-black text-text-muted uppercase tracking-tighter bg-white/5 px-1.5 py-0.5 rounded">{sale.customerName}</span>
                <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-tighter ${margin > 50 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/5 text-text-muted'}`}>
                  {margin}% Margin
                </span>
                {sale.discount && sale.discount > 0 && (
                  <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-tighter bg-amber-500/10 text-amber-500">
                    -₹{sale.discount} Discount
                  </span>
                )}
              </div>
           </div>
        </div>
        <div className="flex flex-col items-end">
           <p className="text-lg font-black text-gradient leading-none">₹{sale.price.toLocaleString()}</p>
           <p className="text-[9px] font-black uppercase tracking-widest mt-1.5 text-emerald-400 flex items-center gap-1">
              <ArrowUpRight size={10} /> +₹{sale.profit.toLocaleString()}
           </p>
        </div>
      </div>

      {/* Timeline Section */}
      <div className="grid grid-cols-2 gap-4 py-3 border-y border-white/5 bg-white/[0.01] px-4">
        <div className="flex flex-col gap-1">
          <p className="text-[8px] text-text-muted uppercase font-black tracking-widest">Sale Date</p>
          <div className="flex items-center gap-2 text-[11px] font-bold">
            <Calendar size={12} className="text-primary" />
            <span>{format(new Date(sale.date), 'dd MMM yyyy')}</span>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-[8px] text-text-muted uppercase font-black tracking-widest">Renewal</p>
          <div className={`flex items-center gap-2 text-[11px] font-black ${isExpired ? 'text-rose-400' : 'text-emerald-400'}`}>
            <RefreshCcw size={12} className={isExpired ? 'animate-spin-slow' : ''} />
            <span>{format(new Date(sale.renewalDate), 'dd MMM yyyy')}</span>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex border-t border-white/5 bg-white/[0.01]">
         <button 
            onClick={() => generateInvoice(sale)}
            className="flex-1 flex items-center justify-center gap-2 h-12 text-primary hover:bg-primary/10 transition-all font-black text-[9px] tracking-wider uppercase border-r border-white/5"
         >
            <FileDown size={14} /> Invoice
         </button>
         {sale.phone && (
           <button 
              onClick={() => {
                const msg = `Hello ${sale.customerName}, your invoice for ${sale.productName} (INR ${sale.price}) is ready. Thank you!`;
                window.open(`https://wa.me/${sale.phone.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`, '_blank');
              }}
              className="flex-1 flex items-center justify-center gap-2 h-12 text-emerald-400 hover:bg-emerald-500/10 transition-all font-black text-[9px] tracking-wider uppercase border-r border-white/5"
           >
              <MessageCircle size={14} /> WhatsApp
           </button>
         )}
         <div className="flex">
            <button onClick={onEdit} className="w-12 h-12 flex items-center justify-center text-text-muted hover:text-white hover:bg-white/5 transition-all border-r border-white/5">
              <Edit2 size={14} />
            </button>
            <button onClick={onDelete} className="w-12 h-12 flex items-center justify-center text-rose-400 hover:bg-rose-500/10 transition-all">
              <Trash2 size={14} />
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
  const [gatewayCharges, setGatewayCharges] = useState('');
  const [discount, setDiscount] = useState('');
  const [productSearch, setProductSearch] = useState('');

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
    const discountVal = discount === '' ? 0 : parseFloat(discount);
    const finalPrice = totalPrice - discountVal;
    const paid = amountPaid === '' ? finalPrice : parseFloat(amountPaid);
    const charges = gatewayCharges === '' ? 0 : parseFloat(gatewayCharges);

    const newSale: Sale = {
      productName: items.length === 1 ? items[0].name : `${items.length} Items Combo`,
      category: items.length === 1 ? items[0].category : 'Software',
      cost: totalCost,
      price: finalPrice,
      profit: finalPrice - totalCost - charges,
      gatewayCharges: charges,
      discount: discountVal,
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
      const msg = `Hello ${customerName}, your invoice for ${newSale.productName} (INR ${totalPrice}) is ready. Thank you!`;
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
            <h3 className="text-xl font-bold font-heading">New Sale (Combo)</h3>
            <p className="text-[11px] text-text-muted font-bold uppercase tracking-widest">Multi-item Invoicing</p>
          </div>
          <button onClick={onClose} className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-text-muted hover:text-white transition-colors">
            <X size={22} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="px-6 pb-8 flex flex-col gap-5 overflow-y-auto">
          {/* Customer Selection */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase font-black text-text-muted tracking-widest ml-1">Customer Name</label>
            <input 
              required
              list="customers-list"
              placeholder="Select or type new customer"
              className="h-12 text-[15px] bg-white/[0.04] border-white/5 focus:border-primary/30"
              value={customerName}
              onChange={e => handleCustomerChange(e.target.value)}
            />
            <datalist id="customers-list">
              {customerList.map(c => <option key={c} value={c} />)}
            </datalist>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase font-black text-text-muted tracking-widest ml-1">WhatsApp Number</label>
            <div className="relative">
              <Phone size={14} className="absolute left-4 top-1/2 -translate-y-half text-text-muted" />
              <input 
                placeholder="+91 00000 00000"
                className="h-12 pl-11 text-[15px] bg-white/[0.04] border-white/5"
                value={customerPhone}
                onChange={e => setCustomerPhone(e.target.value)}
              />
            </div>
          </div>

          {/* Item Selection */}
          <div className="flex flex-col gap-3 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
            <label className="text-[10px] uppercase font-black text-primary tracking-widest">Catalog Items</label>
            <div className="relative">
              <Search size={14} className="absolute left-4 top-1/2 -translate-y-half text-text-muted" />
              <input
                type="text"
                placeholder="Search catalog..."
                className="h-10 pl-10 mb-1 text-xs bg-white/[0.04] border-white/5 rounded-xl w-full"
                value={productSearch}
                onChange={e => setProductSearch(e.target.value)}
              />
            </div>
            <div className="relative mt-1">
              <select 
                onChange={(e) => {
                  handleAddItem(e.target.value);
                  e.target.value = "";
                }} 
                value=""
                className="h-12 text-xs bg-white/[0.04] border-white/5"
              >
                <option value="" disabled>Pick products...</option>
                {products.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase())).map(p => (
                  <option key={p.id} value={p.id}>{p.name} (₹{p.price})</option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-half text-text-muted pointer-events-none" size={16} />
            </div>

            {/* Selected Items List */}
            <div className="flex flex-col gap-2.5 mt-1">
              {items.map((item, index) => (
                <div key={index} className="flex justify-between items-center p-3.5 rounded-xl bg-white/[0.03] border border-white/5 shadow-sm">
                   <div className="min-w-0">
                      <p className="text-xs font-bold truncate text-text-main">{item.name}</p>
                      <p className="text-[10px] font-black text-emerald-400">₹{item.price.toLocaleString()}</p>
                   </div>
                   <button type="button" onClick={() => removeItem(index)} className="w-9 h-9 rounded-xl flex items-center justify-center text-rose-400 hover:bg-rose-400/10 transition-all">
                      <Trash2 size={16} />
                   </button>
                </div>
              ))}
              {items.length === 0 && (
                <div className="py-8 text-center border-2 border-dashed border-white/5 rounded-2xl opacity-30">
                   <ShoppingBag size={28} className="mx-auto mb-2" />
                   <p className="text-[10px] font-black uppercase tracking-widest">Cart is empty</p>
                </div>
              )}
            </div>
          </div>

          {/* Pricing Summary */}
          <div className="grid grid-cols-2 gap-4">
             <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                <p className="text-[9px] uppercase font-black text-text-muted tracking-widest">Total Cost</p>
                <p className="text-lg font-black">₹{totalCost.toLocaleString()}</p>
             </div>
             <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20">
                <p className="text-[9px] uppercase font-black text-primary tracking-widest">Total Price</p>
                <p className="text-lg font-black text-primary">₹{Math.max(0, totalPrice - (parseFloat(discount) || 0)).toLocaleString()}</p>
             </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase font-black text-amber-400 tracking-widest ml-1">Discount Given (₹)</label>
            <input 
              type="number" 
              placeholder="0"
              className="h-14 text-xl font-black text-amber-400 bg-white/[0.04] border-white/5 text-center"
              value={discount}
              onChange={e => setDiscount(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-black text-emerald-400 tracking-widest ml-1">Payment Received</label>
              <input 
                type="number" 
                placeholder={totalPrice.toString()}
                className="h-14 text-xl font-black text-emerald-400 bg-white/[0.04] border-white/5 text-center"
                value={amountPaid}
                onChange={e => setAmountPaid(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-black text-rose-400 tracking-widest ml-1">PG Charges (Fee)</label>
              <input 
                type="number" 
                placeholder="0"
                className="h-14 text-xl font-black text-rose-400 bg-white/[0.04] border-white/5 text-center"
                value={gatewayCharges}
                onChange={e => setGatewayCharges(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase font-black text-text-muted ml-1">Sale Date</label>
                <input type="date" value={saleDate} onChange={e => setSaleDate(e.target.value)} className="h-12 text-[13px] bg-white/[0.04] border-white/5" />
             </div>
             <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase font-black text-text-muted ml-1">Validity</label>
                <select value={validityDays} onChange={e => setValidityDays(e.target.value)} className="h-12 text-[13px] bg-white/[0.04] border-white/5">
                   <option value="30">30 Days</option>
                   <option value="90">90 Days</option>
                   <option value="365">1 Year</option>
                   <option value="0">Lifetime</option>
                </select>
             </div>
          </div>

          <div className="flex items-center justify-between p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                   <MessageCircle size={20} />
                </div>
                <div>
                   <p className="text-[11px] font-black uppercase tracking-tighter">Auto-WhatsApp</p>
                   <p className="text-[9px] text-text-muted font-bold">Redirect to customer</p>
                </div>
             </div>
             <button 
                type="button"
                onClick={() => setAutoWhatsApp(!autoWhatsApp)}
                className={`w-12 h-6 rounded-full relative transition-all ${autoWhatsApp ? 'bg-emerald-500' : 'bg-white/10'}`}
             >
                <motion.div 
                   animate={{ x: autoWhatsApp ? 26 : 4 }}
                   className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-lg" 
                />
             </button>
          </div>

          <button type="submit" className="btn-primary h-15 text-sm font-black uppercase tracking-widest mt-2 shadow-2xl">
            Confirm & Save Sale Record
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
    gatewayCharges: (sale.gatewayCharges || 0).toString(),
    validityDays: sale.validityDays.toString(),
    notes: sale.notes || '',
    saleDate: format(new Date(sale.date), 'yyyy-MM-dd')
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const price = parseFloat(formData.price);
    const cost = parseFloat(formData.cost);
    const amountPaid = parseFloat(formData.amountPaid);
    const charges = parseFloat(formData.gatewayCharges);
    const date = new Date(formData.saleDate + 'T12:00:00');
    const validity = parseInt(formData.validityDays);
    const renewalDate = validity === 0 ? addDays(date, 36500) : addDays(date, validity);

    await db.sales.update(sale.id!, {
      customerName: formData.customerName,
      productName: formData.productName,
      category: formData.category,
      price,
      cost,
      profit: price - cost - charges,
      gatewayCharges: charges,
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
            <h3 className="text-xl font-bold font-heading">Edit Record</h3>
            <p className="text-[11px] text-text-muted font-bold uppercase tracking-widest">Update transaction</p>
          </div>
          <button onClick={onClose} className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-text-muted">
            <X size={22} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="px-6 pb-8 flex flex-col gap-5 modal-form-container">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase font-black text-text-muted tracking-widest ml-1">Customer</label>
            <input required className="h-12 text-[15px] bg-white/[0.04] border-white/5" value={formData.customerName} onChange={e => setFormData({...formData, customerName: e.target.value})} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase font-black text-text-muted tracking-widest ml-1">Item Name</label>
            <input required className="h-12 text-[15px] bg-white/[0.04] border-white/5" value={formData.productName} onChange={e => setFormData({...formData, productName: e.target.value})} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-black text-text-muted tracking-widest ml-1">Cost (₹)</label>
              <input required type="number" className="h-12 text-[15px] bg-white/[0.04] border-white/5" value={formData.cost} onChange={e => setFormData({...formData, cost: e.target.value})} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-black text-text-muted tracking-widest ml-1">Price (₹)</label>
              <input required type="number" className="h-12 text-[15px] bg-white/[0.04] border-white/5" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-black text-emerald-400 tracking-widest ml-1">Amount Paid (₹)</label>
              <input required type="number" className="h-12 text-[15px] font-black text-emerald-400 bg-white/[0.04] border-white/5" value={formData.amountPaid} onChange={e => setFormData({...formData, amountPaid: e.target.value})} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-black text-rose-400 tracking-widest ml-1">PG Charges (₹)</label>
              <input required type="number" className="h-12 text-[15px] font-black text-rose-400 bg-white/[0.04] border-white/5" value={formData.gatewayCharges} onChange={e => setFormData({...formData, gatewayCharges: e.target.value})} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-black text-text-muted tracking-widest ml-1">Sale Date</label>
              <input type="date" className="h-12 text-[15px] bg-white/[0.04] border-white/5" value={formData.saleDate} onChange={e => setFormData({...formData, saleDate: e.target.value})} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-black text-text-muted tracking-widest ml-1">Validity</label>
              <select className="h-12 text-[15px] bg-white/[0.04] border-white/5" value={formData.validityDays} onChange={e => setFormData({...formData, validityDays: e.target.value})}>
                <option value="30">30 Days</option>
                <option value="90">90 Days</option>
                <option value="365">1 Year</option>
                <option value="0">Lifetime</option>
              </select>
            </div>
          </div>

          <div className="mt-4">
            <button type="submit" className="btn-primary w-full h-15 text-sm font-black uppercase tracking-widest shadow-2xl">Update Record</button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default SalesPage;
