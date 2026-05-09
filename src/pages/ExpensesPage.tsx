import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { Plus, Wallet, Calendar, User, Trash2, TrendingDown, Filter, ChevronDown } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import type { Expense } from '../types';

const ExpensesPage: React.FC = () => {
  const [isAdding, setIsAdding] = useState(false);
  const [filterMember, setFilterMember] = useState('');
  
  const expenses = useLiveQuery(() => db.expenses.reverse().toArray()) || [];
  const accounts = useLiveQuery(() => db.accounts.toArray()) || [];

  const filteredExpenses = filterMember 
    ? expenses.filter(e => e.member?.toLowerCase().includes(filterMember.toLowerCase()))
    : expenses;

  const totalExpense = filteredExpenses.reduce((acc, e) => acc + e.amount, 0);
  const dailyAvg = totalExpense / 30; // Rough estimate

  const handleDelete = async (id?: number) => {
    if (!id) return;
    if (confirm('Delete this expense record?')) {
      await db.expenses.delete(id);
    }
  };

  const getAccountName = (id: number) => {
    return accounts.find(a => a.id === id)?.name || 'Unknown';
  };

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold font-heading">Expenses</h2>
          <p className="text-xs text-text-muted">Monitor your cash outflows</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="btn-primary flex items-center gap-2 py-2 px-4 text-sm"
        >
          <Plus size={18} /> Add Expense
        </button>
      </div>

      {/* Expense Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="glass p-4 bg-rose-500/5 border-rose-500/20">
          <p className="text-[10px] uppercase font-bold text-text-muted tracking-widest">Total Spent</p>
          <h3 className="text-lg font-bold text-rose-400 mt-1">₹{totalExpense.toLocaleString()}</h3>
        </div>
        <div className="glass p-4 bg-white/5 border-white/10">
          <p className="text-[10px] uppercase font-bold text-text-muted tracking-widest">Daily Avg</p>
          <h3 className="text-lg font-bold mt-1">₹{Math.round(dailyAvg).toLocaleString()}</h3>
        </div>
      </div>

      <div className="relative">
        <Filter className="absolute left-4 top-1/2 -translate-y-half text-text-muted" size={18} />
        <input 
          type="text" 
          placeholder="Filter by member name..." 
          className="pl-12"
          value={filterMember}
          onChange={(e) => setFilterMember(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-4">
        {filteredExpenses.length > 0 ? (
          filteredExpenses.map((expense) => (
            <motion.div 
              key={expense.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass p-5 flex justify-between items-center card-hover border-r-4 border-r-rose-500/30"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                  <TrendingDown size={24} />
                </div>
                <div>
                  <h4 className="text-sm font-bold leading-tight">{expense.category}</h4>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-[10px] text-text-muted font-medium">
                    <span className="flex items-center gap-1"><Calendar size={12} className="text-primary" /> {format(new Date(expense.date), 'dd MMM yyyy')}</span>
                    <span className="flex items-center gap-1"><Wallet size={12} className="text-primary" /> {getAccountName(expense.accountId)}</span>
                    {expense.member && <span className="flex items-center gap-1"><User size={12} className="text-primary" /> {expense.member}</span>}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-base font-bold text-rose-400">-₹{expense.amount.toLocaleString()}</p>
                  {expense.note && <p className="text-[9px] text-text-muted italic truncate max-w-[80px]">{expense.note}</p>}
                </div>
                <button onClick={() => handleDelete(expense.id)} className="p-2 rounded-xl bg-white/5 text-text-muted hover:text-rose-400 transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="glass p-12 text-center flex flex-col items-center gap-3 opacity-60">
             <div className="p-4 rounded-full bg-white/5">
                <Wallet size={40} className="text-text-muted" />
             </div>
             <p className="text-sm font-medium">No expenses found.</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isAdding && (
          <AddExpenseModal onClose={() => setIsAdding(false)} />
        )}
      </AnimatePresence>
    </div>
  );
};

const AddExpenseModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const accounts = useLiveQuery(() => db.accounts.toArray()) || [];
  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    accountId: '',
    member: '',
    note: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.accountId) return alert('Please select an account');

    const newExpense: Expense = {
      category: formData.category,
      amount: parseFloat(formData.amount),
      date: new Date(),
      accountId: parseInt(formData.accountId),
      member: formData.member,
      note: formData.note
    };

    await db.expenses.add(newExpense);
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
        className="bottom-sheet flex flex-col shadow-2xl"
      >
        <div className="sheet-handle" />
        <div className="p-6 pt-2 border-b border-white/5 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold font-heading">New Expense</h3>
            <p className="text-[10px] text-text-muted">Record an outgoing payment</p>
          </div>
          <button onClick={onClose} className="p-3 rounded-2xl bg-white/5 text-text-muted">
             <Plus size={24} className="rotate-45" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5 modal-form-container">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase font-bold text-text-muted tracking-widest ml-1">Expense Category</label>
            <input required placeholder="e.g. Server Bill, Office Rent, Tea" className="h-12 text-base" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase font-bold text-text-muted tracking-widest ml-1">Amount (₹)</label>
            <input required type="number" placeholder="0" className="h-12 text-base font-bold text-rose-400" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase font-bold text-text-muted tracking-widest ml-1">Paid From</label>
            <div className="relative">
              <select required value={formData.accountId} onChange={(e) => setFormData({...formData, accountId: e.target.value})} className="h-12" >
                <option value="">Select Bank / Wallet</option>
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.id}>{acc.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-half text-text-muted pointer-events-none" size={18} />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase font-bold text-text-muted tracking-widest ml-1">Spent By (Optional)</label>
            <input placeholder="Member name" className="h-12 text-base" value={formData.member} onChange={(e) => setFormData({...formData, member: e.target.value})} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase font-bold text-text-muted tracking-widest ml-1">Short Note</label>
            <textarea placeholder="Any details..." rows={2} className="p-4" value={formData.note} onChange={(e) => setFormData({...formData, note: e.target.value})} />
          </div>

          <div className="flex gap-3 mt-4">
            <button type="submit" className="btn-primary flex-1 h-14 text-base shadow-rose-500/30 bg-rose-500 hover:bg-rose-600">Save Expense</button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default ExpensesPage;
