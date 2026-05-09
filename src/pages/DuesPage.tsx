import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { Plus, Users, ArrowUpCircle, ArrowDownCircle, CheckCircle2, History, Trash2, IndianRupee, MessageCircle, AlertCircle, Clock, ChevronDown } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import type { Due } from '../types';

const DuesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dues' | 'providers'>('dues');
  const [isAdding, setIsAdding] = useState(false);
  
  const dues = useLiveQuery(() => db.dues.reverse().toArray()) || [];
  const providerTx = useLiveQuery(() => db.providerTransactions.reverse().toArray()) || [];
  const providers = useLiveQuery(() => db.providers.toArray()) || [];

  const toReceive = dues.filter(d => d.type === 'to-receive' && d.status === 'pending').reduce((acc, d) => acc + d.amount, 0);
  const toPay = dues.filter(d => d.type === 'to-pay' && d.status === 'pending').reduce((acc, d) => acc + d.amount, 0);

  const handleClearDue = async (id?: number) => {
    if (!id) return;
    await db.dues.update(id, { status: 'cleared' });
  };

  const handleDeleteDue = async (id?: number) => {
    if (!id) return;
    if (confirm('Delete this record?')) await db.dues.delete(id);
  };

  const sendWhatsAppReminder = (name: string, amount: number) => {
    const message = `Hi ${name}, this is a friendly reminder for the pending amount of ₹${amount}. Please clear it at your earliest convenience. Thank you!`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold font-heading">Dues & Ledger</h2>
          <p className="text-xs text-text-muted">Manage debts and provider payments</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="btn-primary flex items-center gap-2 py-2 px-4 text-sm"
        >
          <Plus size={18} /> Add Entry
        </button>
      </div>

      {/* Summary Stats */}
      {activeTab === 'dues' && (
        <div className="grid grid-cols-2 gap-3">
          <div className="glass p-4 bg-blue-500/5 border-blue-500/20">
            <p className="text-[10px] uppercase font-bold text-text-muted tracking-widest">To Receive</p>
            <h3 className="text-lg font-bold text-blue-400 mt-1">₹{toReceive.toLocaleString()}</h3>
          </div>
          <div className="glass p-4 bg-rose-500/5 border-rose-500/20">
            <p className="text-[10px] uppercase font-bold text-text-muted tracking-widest">To Pay</p>
            <h3 className="text-lg font-bold text-rose-400 mt-1">₹{toPay.toLocaleString()}</h3>
          </div>
        </div>
      )}

      <div className="flex p-1 glass bg-white/5 rounded-2xl overflow-hidden">
        <button 
          onClick={() => setActiveTab('dues')}
          className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all ${activeTab === 'dues' ? 'bg-primary text-white shadow-lg' : 'text-text-muted'}`}
        >
          Customer Dues
        </button>
        <button 
          onClick={() => setActiveTab('providers')}
          className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all ${activeTab === 'providers' ? 'bg-primary text-white shadow-lg' : 'text-text-muted'}`}
        >
          Provider Ledger
        </button>
      </div>

      <div className="flex flex-col gap-4">
        {activeTab === 'dues' ? (
          dues.length > 0 ? (
            dues.map((due) => (
              <DueCard 
                key={due.id} 
                due={due} 
                onClear={() => handleClearDue(due.id)} 
                onDelete={() => handleDeleteDue(due.id)}
                onRemind={() => sendWhatsAppReminder(due.personName, due.amount)}
              />
            ))
          ) : (
            <div className="glass p-12 text-center flex flex-col items-center gap-3 opacity-60">
              <Users size={40} className="text-text-muted" />
              <p className="text-sm font-medium">Clear ledger, no pending dues!</p>
            </div>
          )
        ) : (
          <div className="flex flex-col gap-3">
            {providerTx.length > 0 ? (
              providerTx.map(tx => (
                <div key={tx.id} className="glass p-4 flex justify-between items-center card-hover">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-xl ${tx.type === 'refund' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/5 text-text-muted'}`}>
                      {tx.type === 'refund' ? <History size={20} /> : <IndianRupee size={20} />}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold">{providers.find(p => p.id === tx.providerId)?.name || 'Provider'}</h4>
                      <div className="flex items-center gap-2 text-[10px] text-text-muted font-medium mt-0.5">
                        <span className="uppercase tracking-wider">{tx.type}</span>
                        <span>•</span>
                        <span>{format(new Date(tx.date), 'dd MMM yyyy')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-base font-bold ${tx.type === 'refund' ? 'text-emerald-400' : 'text-text-main'}`}>
                      {tx.type === 'refund' ? '+' : '-'}₹{tx.amount.toLocaleString()}
                    </p>
                    {tx.note && <p className="text-[9px] text-text-muted truncate max-w-[100px] italic">"{tx.note}"</p>}
                  </div>
                </div>
              ))
            ) : (
              <div className="glass p-12 text-center flex flex-col items-center gap-3 opacity-60">
                 <History size={40} className="text-text-muted" />
                 <p className="text-sm font-medium">No provider transactions yet.</p>
              </div>
            )}
          </div>
        )}
      </div>

      <AnimatePresence>
        {isAdding && (
          <AddEntryModal activeTab={activeTab} onClose={() => setIsAdding(false)} />
        )}
      </AnimatePresence>
    </div>
  );
};

const DueCard: React.FC<{ due: Due; onClear: () => void; onDelete: () => void; onRemind: () => void }> = ({ due, onClear, onDelete, onRemind }) => {
  const daysPending = differenceInDays(new Date(), new Date(due.date));
  const isUrgent = daysPending > 15 && due.status === 'pending';

  return (
    <motion.div 
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={`glass p-5 border-l-4 card-hover overflow-hidden relative ${due.status === 'cleared' ? 'opacity-50' : ''}`}
      style={{ borderLeftColor: due.status === 'cleared' ? '#64748b' : due.type === 'to-receive' ? '#3b82f6' : '#ef4444' }}
    >
      {isUrgent && (
        <div className="absolute top-0 right-0 bg-rose-500 text-white text-[8px] font-bold px-3 py-1 rounded-bl-xl flex items-center gap-1">
          <AlertCircle size={10} /> URGENT
        </div>
      )}

      <div className="flex justify-between items-start">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${due.type === 'to-receive' ? 'bg-blue-500/10 text-blue-400' : 'bg-rose-500/10 text-rose-400'}`}>
            {due.type === 'to-receive' ? <ArrowDownCircle size={24} /> : <ArrowUpCircle size={24} />}
          </div>
          <div>
            <h4 className="text-base font-bold leading-tight">{due.personName}</h4>
            <div className="flex items-center gap-2 text-[10px] text-text-muted font-medium mt-1">
              <span className="flex items-center gap-1"><Clock size={12} /> {daysPending} days ago</span>
              <span>•</span>
              <span className="uppercase tracking-wider">{due.type === 'to-receive' ? 'Receivable' : 'Payable'}</span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className={`text-xl font-bold ${due.type === 'to-receive' ? 'text-blue-400' : 'text-rose-400'}`}>
            ₹{due.amount.toLocaleString()}
          </p>
          <span className={`text-[10px] font-bold mt-1 block uppercase tracking-widest ${due.status === 'cleared' ? 'text-emerald-500' : 'text-amber-500'}`}>
            {due.status}
          </span>
        </div>
      </div>

      <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/5">
         <p className="text-[10px] text-text-muted italic truncate max-w-[150px]">{due.note || 'No description provided'}</p>
         <div className="flex gap-2">
            {due.status === 'pending' && (
              <>
                <button onClick={onClear} className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 transition-all flex items-center gap-2 text-[10px] font-bold">
                  <CheckCircle2 size={14} /> CLEAR
                </button>
                {due.type === 'to-receive' && (
                  <button onClick={onRemind} className="p-2 rounded-xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 transition-all">
                    <MessageCircle size={14} />
                  </button>
                )}
              </>
            )}
            <button onClick={onDelete} className="p-2 rounded-xl bg-white/5 text-text-muted hover:text-rose-400 border border-white/10 transition-all">
              <Trash2 size={14} />
            </button>
         </div>
      </div>
    </motion.div>
  );
};

const AddEntryModal: React.FC<{ activeTab: 'dues' | 'providers'; onClose: () => void }> = ({ activeTab, onClose }) => {
  const providers = useLiveQuery(() => db.providers.toArray()) || [];
  const [formData, setFormData] = useState({
    name: '',
    type: activeTab === 'dues' ? 'to-receive' : 'payment',
    amount: '',
    providerId: '',
    note: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'dues') {
      await db.dues.add({
        personName: formData.name,
        type: formData.type as any,
        amount: parseFloat(formData.amount),
        date: new Date(),
        status: 'pending',
        note: formData.note
      });
    } else {
      if (!formData.providerId) return alert('Select a provider');
      await db.providerTransactions.add({
        providerId: parseInt(formData.providerId),
        type: formData.type as any,
        amount: parseFloat(formData.amount),
        date: new Date(),
        note: formData.note
      });
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
        className="bottom-sheet w-full max-w-md z-50 flex flex-col shadow-2xl"
      >
        <div className="sheet-handle" />
        <div className="px-6 py-4 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold font-heading">{activeTab === 'dues' ? 'New Due Record' : 'Provider Ledger'}</h3>
            <p className="text-[11px] text-text-muted">Manage your ledger entries</p>
          </div>
          <button onClick={onClose} className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-text-muted transition-all hover:bg-white/10">
            <Plus size={22} className="rotate-45" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 pb-8 flex flex-col gap-5 modal-form-container">
          {activeTab === 'dues' ? (
            <>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase font-extrabold text-text-muted tracking-[0.15em] ml-1">Client Name</label>
                <input required placeholder="Enter full name" className="h-12 text-[15px]" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase font-extrabold text-text-muted tracking-[0.15em] ml-1">Type of Due</label>
                <div className="grid grid-cols-2 gap-3">
                  <button type="button" onClick={() => setFormData({...formData, type: 'to-receive'})} className={`py-3.5 text-xs font-bold rounded-2xl border transition-all ${formData.type === 'to-receive' ? 'bg-blue-500 border-blue-500 text-white shadow-lg' : 'bg-white/5 border-white/10 text-text-muted'}`}>Receivable</button>
                  <button type="button" onClick={() => setFormData({...formData, type: 'to-pay'})} className={`py-3.5 text-xs font-bold rounded-2xl border transition-all ${formData.type === 'to-pay' ? 'bg-rose-500 border-rose-500 text-white shadow-lg' : 'bg-white/5 border-white/10 text-text-muted'}`}>Payable</button>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase font-extrabold text-text-muted tracking-[0.15em] ml-1">Select Provider</label>
                <div className="flex flex-col gap-2">
                  <div className="relative">
                    <select required value={formData.providerId} onChange={(e) => setFormData({...formData, providerId: e.target.value})} className="h-12 w-full text-[15px]" >
                      <option value="">Choose Provider...</option>
                      {providers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-half text-text-muted pointer-events-none" size={18} />
                  </div>
                  <button type="button" onClick={async () => {
                    const name = prompt('New Provider Name:');
                    if (name) {
                      const id = await db.providers.add({ name, balance: 0 });
                      setFormData({...formData, providerId: id.toString()});
                    }
                  }} className="text-[11px] text-primary font-bold self-start px-1">+ Add New Provider</button>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase font-extrabold text-text-muted tracking-[0.15em] ml-1">Transaction</label>
                <div className="grid grid-cols-2 gap-3">
                  <button type="button" onClick={() => setFormData({...formData, type: 'payment'})} className={`py-3.5 text-xs font-bold rounded-2xl border transition-all ${formData.type === 'payment' ? 'bg-primary border-primary text-white shadow-primary/30' : 'bg-white/5 border-white/10 text-text-muted'}`}>Payment Sent</button>
                  <button type="button" onClick={() => setFormData({...formData, type: 'refund'})} className={`py-3.5 text-xs font-bold rounded-2xl border transition-all ${formData.type === 'refund' ? 'bg-emerald-500 border-emerald-500 text-white shadow-emerald-500/30' : 'bg-white/5 border-white/10 text-text-muted'}`}>Refund</button>
                </div>
              </div>
            </>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase font-extrabold text-text-muted tracking-[0.15em] ml-1">Amount (₹)</label>
            <input required type="number" placeholder="0" className="h-12 text-[15px]" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase font-extrabold text-text-muted tracking-[0.15em] ml-1">Notes</label>
            <textarea placeholder="Details about this entry..." rows={2} className="p-4 text-[15px]" value={formData.note} onChange={(e) => setFormData({...formData, note: e.target.value})} />
          </div>

          <div className="mt-4">
            <button type="submit" className="btn-primary w-full h-14 text-base shadow-primary/30">Save Ledger Record</button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default DuesPage;
