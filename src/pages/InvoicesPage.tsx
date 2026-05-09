import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { FileText, Search, MessageCircle, FileDown, Calendar, Filter, ChevronRight, User, ShoppingBag, Clock } from 'lucide-react';
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
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold font-heading">Invoices Hub</h2>
          <p className="text-xs text-text-muted">Quick share & manage billing</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-half text-text-muted group-focus-within:text-primary transition-colors" size={16} />
          <input 
            type="text" 
            placeholder="Search by customer or product..." 
            className="pl-11 h-12 text-sm bg-white/[0.03]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex p-1 glass bg-white/5 rounded-2xl overflow-hidden">
          {(['today', 'yesterday', 'all'] as const).map((f) => (
            <button 
              key={f}
              onClick={() => setDateFilter(f)}
              className={`flex-1 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${dateFilter === f ? 'bg-primary text-white shadow-lg' : 'text-text-muted'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Invoice List */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col gap-3"
      >
        {filteredInvoices.length > 0 ? (
          filteredInvoices.map((invoice) => (
            <InvoiceCard key={invoice.id} invoice={invoice} variants={itemVariants} />
          ))
        ) : (
          <div className="glass p-12 text-center flex flex-col items-center gap-3 opacity-60">
             <FileText size={40} className="text-text-muted" />
             <p className="text-sm font-medium">No invoices found for this period.</p>
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
      className="glass p-4 flex flex-col gap-4 border-l-4 card-hover overflow-hidden relative"
      style={{ borderLeftColor: isPaid ? '#10b981' : '#f59e0b' }}
    >
      <div className="flex justify-between items-start">
        <div className="flex gap-3">
           <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-primary border border-white/10">
              <FileText size={20} />
           </div>
           <div>
              <h4 className="text-sm font-bold truncate max-w-[150px]">{invoice.customerName}</h4>
              <p className="text-[10px] text-text-muted font-medium flex items-center gap-1">
                 <Clock size={10} /> {format(new Date(invoice.date), 'hh:mm a')}
              </p>
           </div>
        </div>
        <div className="text-right">
           <p className="text-sm font-black">₹{invoice.price.toLocaleString()}</p>
           <span className={`text-[8px] font-bold px-2 py-0.5 rounded-md uppercase tracking-tighter ${isPaid ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-500'}`}>
              {isPaid ? 'Fully Paid' : `Due: ₹${balance}`}
           </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-1">
         <button 
            onClick={handleWhatsApp}
            className="flex items-center justify-center gap-2 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 text-[10px] font-black border border-emerald-500/20 active:scale-95 transition-all"
         >
            <MessageCircle size={14} /> SEND WHATSAPP
         </button>
         <button 
            onClick={() => generateInvoice(invoice)}
            className="flex items-center justify-center gap-2 h-10 rounded-xl bg-primary/10 text-primary text-[10px] font-black border border-primary/20 active:scale-95 transition-all"
         >
            <FileDown size={14} /> DOWNLOAD PDF
         </button>
      </div>

      {/* Details Snapshot */}
      <div className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-xl border border-white/5">
         <ShoppingBag size={12} className="text-text-muted" />
         <p className="text-[10px] font-bold text-text-muted truncate">
            Items: {invoice.productName} {invoice.items ? `+ ${invoice.items.length - 1} more` : ''}
         </p>
      </div>
    </motion.div>
  );
};

export default InvoicesPage;
