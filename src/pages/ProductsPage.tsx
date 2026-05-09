import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { Plus, Box, Edit2, Trash2, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Category } from '../types';

const ProductsPage: React.FC = () => {
  const [isAdding, setIsAdding] = useState(false);
  const products = useLiveQuery(() => db.products.toArray()) || [];

  const handleDelete = async (id?: number) => {
    if (!id) return;
    if (confirm('Delete this product template?')) {
      await db.products.delete(id);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold font-heading">Product Catalog</h2>
        <button 
          onClick={() => setIsAdding(true)}
          className="btn-primary flex items-center gap-2 py-2 px-4 text-sm"
        >
          <Plus size={18} /> New Template
        </button>
      </div>

      <p className="text-xs text-text-muted px-1">Save your common VPS/Software specs here to reuse them during sales.</p>

      <div className="grid grid-cols-1 gap-4">
        {products.length > 0 ? (
          products.map((product) => (
            <motion.div 
              key={product.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass p-5 border-l-4 border-l-primary flex justify-between items-start"
            >
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full bg-white/5 border border-white/10 uppercase tracking-widest ${
                    product.category === 'Software' ? 'text-blue-400' : product.category === 'VPS' ? 'text-purple-400' : 'text-emerald-400'
                  }`}>
                    {product.category}
                  </span>
                </div>
                <h3 className="text-lg font-bold">{product.name}</h3>
                <div className="flex flex-col gap-1">
                   <p className="text-[10px] text-text-muted flex items-center gap-1"><Layers size={10} /> {product.specs}</p>
                   <p className="text-sm font-bold text-gradient mt-1">₹{product.price.toLocaleString()} <span className="text-[10px] text-text-muted font-normal italic">(Cost: ₹{product.cost})</span></p>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="p-2 rounded-lg bg-white/5 text-text-muted hover:text-white transition-all"><Edit2 size={16} /></button>
                <button onClick={() => handleDelete(product.id)} className="p-2 rounded-lg bg-rose-500/5 text-rose-400 hover:bg-rose-500/10 transition-all"><Trash2 size={16} /></button>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="glass p-12 text-center flex flex-col items-center gap-3 opacity-60">
             <Box size={40} className="text-text-muted" />
             <p className="text-sm">Your catalog is empty. Add your first product!</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isAdding && (
          <AddProductModal onClose={() => setIsAdding(false)} />
        )}
      </AnimatePresence>
    </div>
  );
};

const AddProductModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: 'Software' as Category,
    cost: '',
    price: '',
    specs: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await db.products.add({
      name: formData.name,
      category: formData.category,
      cost: parseFloat(formData.cost),
      price: parseFloat(formData.price),
      specs: formData.specs
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <motion.div 
        initial={{ y: '100%' }} 
        animate={{ y: 0 }} 
        exit={{ y: '100%' }} 
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="bottom-sheet w-full max-w-md z-50 flex flex-col" 
      >
        <div className="sheet-handle" />
        <div className="p-6 pt-2 border-b border-white/5 flex justify-between items-center">
          <h3 className="text-xl font-bold font-heading">New Product Template</h3>
          <button onClick={onClose} className="p-2 rounded-xl bg-white/5 text-text-muted">
            <Plus size={24} className="rotate-45" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4 modal-form-container">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-text-muted">Category</label>
            <div className="grid grid-cols-3 gap-2">
              {['Software', 'VPS', 'Linux'].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setFormData({...formData, category: cat as Category})}
                  className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                    formData.category === cat ? 'bg-primary border-primary text-white' : 'bg-white/5 border-white/10 text-text-muted'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-text-muted">Template Name</label>
            <input required placeholder="e.g. 8GB VPS - US Master" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-text-muted">Base Cost (₹)</label>
              <input required type="number" placeholder="0" value={formData.cost} onChange={(e) => setFormData({...formData, cost: e.target.value})} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-text-muted">Selling Price (₹)</label>
              <input required type="number" placeholder="0" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-text-muted">Specifications</label>
            <textarea required placeholder="8GB RAM, 4 vCPU, 100GB SSD..." rows={3} value={formData.specs} onChange={(e) => setFormData({...formData, specs: e.target.value})} />
          </div>

          <div className="flex gap-3 mt-4">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" className="btn-primary flex-1">Save Template</button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default ProductsPage;
