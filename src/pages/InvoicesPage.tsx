import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { FileText, Search, MessageCircle, FileDown, Calendar, Filter, ChevronRight, User, ShoppingBag, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { format, isSameDay, subDays } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { generateInvoice } from '../utils/pdf';

const InvoicesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState<'today' | 'yesterday' | 'all'>('today');
  
  const sales = useLiveQuery(() => db.sales.reverse().toArray()) || [];

  const filteredInvoices = sales.filter(s => {
    const matchesSearch = s.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         s.productName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const saleDate = new Date(s.date);
    let matchesDate = true;
    if (dateFilter === 'today') matchesDate = isSameDay(saleDate, new Date());
    else if (dateFilter === 'yesterday') matchesDate = isSameDay(saleDate, subDays(new Date(), 1));

    return matchesSearch && matchesDate;
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="flex flex-col gap-6 max-w-md mx-auto">
      <div className="flex justify-between items-center px-1">
        <div>
          <h2 className="text-2xl font-black font-heading tracking-tight">Invoices Hub</h2>
          <p className="text-[11px] text-text-muted font-bold uppercase tracking-widest">Billing & Distribution</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
           <FileText size={20} />
        </div>
      </div>

      {/* Modern Search & Filters */}
      <div className="flex flex-col gap-3">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-half text-text-muted group-focus-within:text-primary transition-colors" size={16} />
          <input 
            type="text" 
            placeholder="Search by customer or product..." 
            className="pl-11 h-13 text-sm bg-white/[0.04] border-white/5 rounded-2xl focus:border-primary/30 focus:bg-white/[0.06] transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex p-1.5 glass bg-white/[0.02] rounded-2xl border border-white/5">
          {(['today', 'yesterday', 'all'] as const).map((f) => (
            <button 
              key={f}
              onClick={() => setDateFilter(f)}
              className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${dateFilter === f ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-text-muted hover:text-text-main'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Redesigned Invoice List */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col gap-4"
      >
        {filteredInvoices.length > 0 ? (
          filteredInvoices.map((invoice) => (
            <InvoiceCard key={invoice.id} invoice={invoice} variants={itemVariants} />
          ))
        ) : (
          <div className="glass p-16 text-center flex flex-col items-center gap-4 opacity-60 border-dashed border-2">
             <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                <FileText size={32} className="text-text-muted opacity-30" />
             </div>
             <p className="text-sm font-bold text-text-muted">No invoices found.</p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

const InvoiceCard: React.FC<{ invoice: any; variants: any }> = ({ invoice, variants }) => {
  const isPaid = !invoice.amountPaid || invoice.amountPaid >= invoice.price;
  const balance = invoice.price - (invoice.amountPaid || 0);

  const handleWhatsApp = () => {
    if (!invoice.phone) return alert('No phone number saved for this customer!');
    const msg = `Hello ${invoice.customerName}, your invoice for ${invoice.productName} (INR ${invoice.price}) is ready. Thank you!`;
    window.open(`https://wa.me/${invoice.phone.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <motion.div 
      variants={variants}
      className="glass overflow-hidden flex flex-col border border-white/5 shadow-xl hover:border-primary/20 transition-all duration-300"
    >
      {/* Top Section */}
      <div className="p-4 flex justify-between items-start bg-white/[0.02]">
        <div className="flex gap-3.5">
           <div className={`w-11 h-11 rounded-2xl flex items-center justify-center border ${isPaid ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-500'}`}>
              {isPaid ? <CheckCircle2 size={22} /> : <AlertCircle size={22} />}
           </div>
           <div className="flex flex-col gap-0.5">
              <h4 className="text-base font-bold text-text-main leading-tight">{invoice.customerName}</h4>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-black text-text-muted uppercase tracking-tighter bg-white/5 px-1.5 py-0.5 rounded">INV-{invoice.id?.toString().padStart(4, '0')}</span>
                <span className="text-[10px] text-text-muted flex items-center gap-1 font-medium">
                  <Clock size={10} /> {format(new Date(invoice.date), 'dd MMM, hh:mm a')}
                </span>
              </div>
           </div>
        </div>
        <div className="flex flex-col items-end">
           <p className="text-lg font-black text-text-main leading-none">₹{invoice.price.toLocaleString()}</p>
           <p className={`text-[9px] font-black uppercase tracking-widest mt-1.5 ${isPaid ? 'text-emerald-400' : 'text-amber-500'}`}>
              {isPaid ? 'Fully Settled' : `Pending: ₹${balance}`}
           </p>
        </div>
      </div>

      {/* Product Summary */}
      <div className="px-4 pb-4">
        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white/[0.03] border border-white/5">
           <ShoppingBag size={14} className="text-primary" />
           <p className="text-[11px] font-bold text-text-main/80 truncate">
              {invoice.productName} {invoice.items && invoice.items.length > 1 ? `(+${invoice.items.length - 1} more items)` : ''}
           </p>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex border-t border-white/5 bg-white/[0.01]">
         <button 
            onClick={handleWhatsApp}
            className="flex-1 flex items-center justify-center gap-2.5 h-13 text-emerald-400 hover:bg-emerald-500/10 transition-all font-black text-[10px] tracking-wider uppercase border-r border-white/5"
         >
            <MessageCircle size={16} /> Share WhatsApp
         </button>
         <button 
            onClick={() => generateInvoice(invoice)}
            className="flex-1 flex items-center justify-center gap-2.5 h-13 text-primary hover:bg-primary/10 transition-all font-black text-[10px] tracking-wider uppercase"
         >
            <FileDown size={16} /> Get PDF Invoice
         </button>
      </div>
    </motion.div>
  );
};

export default InvoicesPage;
