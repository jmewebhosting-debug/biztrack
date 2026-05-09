import React, { useState } from 'react';
import { Home, ShoppingCart, Wallet, Users, Settings, Sun, Moon, X, PieChart, Users2, Package, TrendingUp, LayoutGrid, FileText } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/db';
import { startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label, active, onClick }) => (
  <Link
    to={to}
    onClick={onClick}
    className="flex flex-col items-center gap-0.5 relative py-2 flex-1 transition-all active:scale-90"
  >
    <motion.div
      animate={{ scale: active ? 1.1 : 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      className="transition-colors duration-200"
      style={{ color: active ? '#818cf8' : '#475569' }}
    >
      {icon}
    </motion.div>
    <span className="text-[9px] font-bold tracking-tight transition-colors duration-200"
      style={{ color: active ? '#818cf8' : '#475569' }}>
      {label}
    </span>
    {active && (
      <motion.div
        layoutId="nav-indicator"
        className="absolute -top-1 w-6 h-1 rounded-full"
        style={{ background: 'linear-gradient(90deg, #6366f1, #a855f7)', boxShadow: '0 0 8px rgba(99,102,241,0.6)' }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
    )}
  </Link>
);

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const [isLight, setIsLight] = useState(localStorage.getItem('theme') === 'light');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Live monthly profit for header badge
  const monthProfit = useLiveQuery(async () => {
    const now = new Date();
    const start = startOfMonth(now);
    const end = endOfMonth(now);
    const sales = await db.sales.toArray();
    const expenses = await db.expenses.toArray();
    const monthSales = sales.filter(s => isWithinInterval(new Date(s.date), { start, end }));
    const monthExpenses = expenses.filter(e => isWithinInterval(new Date(e.date), { start, end }));
    const profit = monthSales.reduce((acc, s) => acc + s.profit, 0);
    const exp = monthExpenses.reduce((acc, e) => acc + e.amount, 0);
    return profit - exp;
  }, []) ?? null;

  const lastBackup = localStorage.getItem('last_backup_date');
  const needsBackup = !lastBackup || (Date.now() - new Date(lastBackup).getTime()) > 7 * 24 * 60 * 60 * 1000;

  React.useEffect(() => {
    if (isLight) {
      document.body.classList.add('light');
      localStorage.setItem('theme', 'light');
    } else {
      document.body.classList.remove('light');
      localStorage.setItem('theme', 'dark');
    }
  }, [isLight]);

  const mainNavItems = [
    { to: '/', icon: <Home size={20} />, label: 'Home' },
    { to: '/invoices', icon: <FileText size={20} />, label: 'Invoices' },
    { to: '/sales', icon: <ShoppingCart size={20} />, label: 'Sales' },
    { to: '/dues', icon: <Users size={20} />, label: 'Dues' },
    { to: '/stats', icon: <TrendingUp size={20} />, label: 'Stats' },
  ];

  const extraNavItems = [
    { to: '/customers', icon: <Users2 size={22} />, label: 'Customer CRM', desc: 'Client intelligence & lifetime value', color: '#6366f1' },
    { to: '/products', icon: <Package size={22} />, label: 'Product Catalog', desc: 'Manage service templates & pricing', color: '#10b981' },
    { to: '/settings', icon: <Settings size={22} />, label: 'App Settings', desc: 'Security, backups & preferences', color: '#a855f7' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-bg-dark text-text-main overflow-x-hidden">

      {/* ─── Header ─── */}
      <header className="px-5 py-3 flex justify-between items-center sticky top-0 z-30 glass-dark">
        <div className="flex flex-col gap-0">
          <h1 className="text-lg font-extrabold font-heading tracking-tighter text-gradient leading-tight">
            Business Tracker
          </h1>
          {monthProfit !== null && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full animate-pulse-subtle"
                  style={{ background: monthProfit >= 0 ? '#10b981' : '#ef4444' }} />
                <span className="text-[9px] font-extrabold uppercase tracking-widest"
                  style={{ color: monthProfit >= 0 ? '#34d399' : '#f87171' }}>
                  {monthProfit >= 0 ? '+' : ''}₹{Math.abs(monthProfit).toLocaleString()} this month
                </span>
              </div>
              {needsBackup && (
                <div className="flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                   <div className="w-1 h-1 rounded-full bg-amber-500" />
                   <span className="text-[7px] font-black text-amber-500 uppercase tracking-tighter">BACKUP NEEDED</span>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsLight(!isLight)}
            className="p-2.5 rounded-xl transition-all"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            {isLight ? <Moon size={17} color="#94a3b8" /> : <Sun size={17} color="#94a3b8" />}
          </button>
          <button
            onClick={() => setIsMenuOpen(true)}
            className="p-2.5 rounded-xl transition-all"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <LayoutGrid size={17} color="#94a3b8" />
          </button>
        </div>
      </header>

      {/* ─── Main Content ─── */}
      <main className="flex-1 px-4 pt-5 pb-28 app-container overflow-y-auto">
        {children}
      </main>

      {/* ─── Bottom Navigation ─── */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 glass-dark border-t border-white/5">
        <div className="max-w-600px mx-auto flex justify-around items-center px-2 pb-safe pt-1.5"
          style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}>
          {mainNavItems.map((item) => (
            <NavItem
              key={item.to}
              to={item.to}
              icon={item.icon}
              label={item.label}
              active={location.pathname === item.to}
            />
          ))}
        </div>
      </nav>

      {/* ─── More Menu Drawer ─── */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 z-60 bg-black/70 backdrop-blur-md"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 220 }}
              className="fixed bottom-0 left-0 right-0 z-70 rounded-t-drawer border-t border-white/8 max-w-600px mx-auto"
              style={{
                background: 'rgba(15, 23, 42, 0.96)',
                backdropFilter: 'blur(40px)',
                boxShadow: '0 -20px 60px rgba(0,0,0,0.5)',
                paddingBottom: 'max(2rem, env(safe-area-inset-bottom))',
              }}
            >
              {/* Handle */}
              <div className="w-10 h-1 rounded-full bg-white/10 mx-auto mt-3 mb-5" />

              <div className="px-6">
                <div className="flex justify-between items-center mb-5">
                  <div>
                    <h3 className="text-lg font-bold font-heading">More Options</h3>
                    <p className="text-xs text-text-muted">Advanced tools & settings</p>
                  </div>
                  <button
                    onClick={() => setIsMenuOpen(false)}
                    className="p-2.5 rounded-2xl transition-all"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    <X size={20} color="#94a3b8" />
                  </button>
                </div>

                <div className="flex flex-col gap-3 mb-6">
                  {extraNavItems.map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-4 p-4 rounded-2xl transition-all group"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                    >
                      <div className="p-3 rounded-xl flex-shrink-0 transition-all"
                        style={{ background: `${item.color}18`, border: `1px solid ${item.color}25` }}>
                        {React.cloneElement(item.icon as React.ReactElement, { color: item.color })}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold">{item.label}</h4>
                        <p className="text-[10px] text-text-muted mt-0.5">{item.desc}</p>
                      </div>
                      <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: 'rgba(255,255,255,0.05)' }}>
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                          <path d="M2 5h6M5 2l3 3-3 3" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    </Link>
                  ))}
                </div>

                <div className="pt-4 border-t border-white/5 flex items-center justify-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-subtle" />
                  <p className="text-[10px] text-text-muted uppercase tracking-[0.2em] font-bold">
                    Business Tracker Pro v2.0
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MainLayout;
