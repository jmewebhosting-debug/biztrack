import React from 'react';
import { TrendingUp, TrendingDown, ArrowUpRight, Plus, ShoppingBag, CreditCard, Box, Users, Wallet, IndianRupee, Target, RefreshCcw, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useFinanceSummary } from '../hooks/useFinance';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { motion } from 'framer-motion';
import { format, isAfter } from 'date-fns';

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
};

const StatCard: React.FC<{
  title: string;
  value: number;
  icon: React.ReactNode;
  trend?: string;
  trendUp?: boolean;
  color: 'blue' | 'green' | 'red' | 'purple';
  delay?: number;
}> = ({ title, value, icon, trend, trendUp = true, color, delay = 0 }) => {
  const colors = {
    blue: { bg: 'rgba(99,102,241,0.08)', border: 'rgba(99,102,241,0.2)', text: '#818cf8', glow: 'rgba(99,102,241,0.15)' },
    green: { bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.2)', text: '#34d399', glow: 'rgba(16,185,129,0.15)' },
    red: { bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)', text: '#f87171', glow: 'rgba(239,68,68,0.15)' },
    purple: { bg: 'rgba(168,85,247,0.08)', border: 'rgba(168,85,247,0.2)', text: '#c084fc', glow: 'rgba(168,85,247,0.15)' },
  };
  const c = colors[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="glass p-4 flex flex-col gap-2.5 relative overflow-hidden"
      style={{ background: c.bg, borderColor: c.border }}
    >
      <div className="absolute top-0 right-0 w-20 h-20 rounded-full blur-2xl opacity-30" style={{ background: c.glow, transform: 'translate(30%, -30%)' }} />
      <div className="flex justify-between items-start relative z-10">
        <div className="p-2 rounded-xl border" style={{ background: c.glow, borderColor: c.border }}>
          {React.cloneElement(icon as React.ReactElement, { size: 15, color: c.text })}
        </div>
        {trend && (
          <div className="flex items-center gap-0.5 text-[9px] font-extrabold px-2 py-0.5 rounded-full border"
            style={{
              color: trendUp ? '#34d399' : '#f87171',
              background: trendUp ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
              borderColor: trendUp ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'
            }}>
            <ArrowUpRight size={9} style={{ transform: trendUp ? 'none' : 'rotate(180deg)' }} />
            {trend}
          </div>
        )}
      </div>
      <div className="relative z-10">
        <p className="text-text-muted text-[9px] font-extrabold uppercase tracking-widest">{title}</p>
        <h3 className="text-xl font-bold font-heading mt-0.5 tracking-tight" style={{ color: c.text }}>
          ₹{value.toLocaleString()}
        </h3>
      </div>
    </motion.div>
  );
};

const Dashboard: React.FC = () => {
  const { revenue, profit, expenses, net, recentSales } = useFinanceSummary();

  const expiringToday = useLiveQuery(async () => {
    const sales = await db.sales.toArray();
    const now = new Date();
    return sales.filter(s => {
      const renewal = new Date(s.renewalDate);
      const diffDays = Math.ceil((renewal.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays <= 7 && diffDays >= 0 && s.status === 'active';
    });
  }, []) || [];

  const overdueSales = useLiveQuery(async () => {
    const sales = await db.sales.toArray();
    return sales.filter(s => isAfter(new Date(), new Date(s.renewalDate)) && s.status === 'active');
  }, []) || [];

  const MONTHLY_TARGET = 50000;
  const progressPct = Math.min((profit / MONTHLY_TARGET) * 100, 100);

  return (
    <div className="flex flex-col gap-5 pb-20">
      {/* Greeting Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-0.5"
      >
        <p className="text-text-muted text-xs font-semibold">{format(new Date(), 'EEEE, dd MMM yyyy')}</p>
        <h2 className="text-2xl font-bold font-heading">{getGreeting()} 👋</h2>
        <p className="text-text-muted text-sm">Here's your business at a glance.</p>
      </motion.div>

      {/* Alert: Overdue Renewals */}
      {overdueSales.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass p-4 flex items-center gap-3 border-l-4"
          style={{ borderLeftColor: '#ef4444', background: 'rgba(239,68,68,0.05)' }}
        >
          <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 flex-shrink-0">
            <AlertTriangle size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-rose-400">{overdueSales.length} Renewal{overdueSales.length > 1 ? 's' : ''} Overdue!</p>
            <p className="text-[10px] text-text-muted truncate">
              {overdueSales.slice(0, 2).map(s => s.customerName).join(', ')}{overdueSales.length > 2 ? ` +${overdueSales.length - 2} more` : ''}
            </p>
          </div>
          <Link to="/sales" className="text-[10px] font-extrabold text-rose-400 bg-rose-500/10 px-3 py-1.5 rounded-lg border border-rose-500/20 flex-shrink-0">
            View
          </Link>
        </motion.div>
      )}

      {/* Expiring Soon */}
      {expiringToday.length > 0 && overdueSales.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass p-4 flex items-center gap-3 border-l-4"
          style={{ borderLeftColor: '#f59e0b', background: 'rgba(245,158,11,0.05)' }}
        >
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 flex-shrink-0">
            <RefreshCcw size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-amber-400">{expiringToday.length} Expiring in 7 Days</p>
            <p className="text-[10px] text-text-muted truncate">
              {expiringToday.slice(0, 2).map(s => s.customerName).join(', ')}
            </p>
          </div>
          <Link to="/sales" className="text-[10px] font-extrabold text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20 flex-shrink-0">
            View
          </Link>
        </motion.div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard title="Revenue" value={revenue} icon={<IndianRupee />} color="blue" delay={0} />
        <StatCard title="Gross Profit" value={profit} icon={<TrendingUp />} color="green" delay={0.05} />
        <StatCard title="Expenses" value={expenses} icon={<TrendingDown />} color="red" trendUp={false} delay={0.1} />
        <StatCard title="Net Balance" value={net} icon={<CreditCard />} color={net >= 0 ? 'purple' : 'red'} delay={0.15} />
      </div>

      {/* Monthly Goal */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass p-5 flex flex-col gap-3"
        style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.06), rgba(168,85,247,0.06))' }}
      >
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-bold flex items-center gap-2">
            <Target size={15} className="text-primary" /> Monthly Target
          </h3>
          <span className="text-[10px] font-extrabold text-primary bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20">
            ₹{MONTHLY_TARGET.toLocaleString()} Goal
          </span>
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between items-end">
            <span className="text-xs text-text-muted">
              {progressPct >= 100 ? '🎉 Target Achieved!' : `${Math.round(progressPct)}% complete`}
            </span>
            <span className="text-sm font-bold">₹{profit.toLocaleString()}</span>
          </div>
          <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
              className="h-full rounded-full"
              style={{ background: progressPct >= 100 ? 'linear-gradient(90deg, #10b981, #06d6a0)' : 'linear-gradient(90deg, #6366f1, #a855f7)' }}
            />
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-bold text-text-muted uppercase tracking-widest px-1">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            { to: '/sales', icon: <Plus size={18} />, label: 'New Sale', bg: 'rgba(99,102,241,0.1)', border: 'rgba(99,102,241,0.2)', iconBg: '#6366f1' },
            { to: '/expenses', icon: <Wallet size={18} />, label: 'Add Expense', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)', iconBg: '#ef4444' },
            { to: '/products', icon: <Box size={18} />, label: 'Catalog', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.2)', iconBg: '#10b981' },
            { to: '/dues', icon: <Users size={18} />, label: 'Dues', bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.2)', iconBg: '#3b82f6' },
          ].map((item, i) => (
            <motion.div
              key={item.to}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.25 + i * 0.05 }}
            >
              <Link
                to={item.to}
                className="flex items-center gap-3 p-4 glass card-hover"
                style={{ background: item.bg, borderColor: item.border }}
              >
                <div className="p-2 rounded-xl text-white flex-shrink-0" style={{ background: item.iconBg }}>
                  {item.icon}
                </div>
                <span className="text-sm font-bold">{item.label}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recent Sales */}
      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-sm font-bold text-text-muted uppercase tracking-widest">Recent Sales</h3>
          <Link to="/sales" className="text-xs font-bold text-primary hover:underline">View All →</Link>
        </div>
        <div className="flex flex-col gap-2.5">
          {recentSales.length > 0 ? (
            recentSales.map((sale, i) => (
              <motion.div
                key={sale.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.05 }}
                className="glass p-4 flex items-center justify-between card-hover"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-sm flex-shrink-0"
                    style={{ background: sale.category === 'Software' ? '#6366f1' : sale.category === 'VPS' ? '#a855f7' : '#10b981' }}>
                    {sale.category[0]}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold truncate max-w-[130px]">{sale.productName}</h4>
                    <p className="text-[10px] text-text-muted">{sale.customerName} • {format(new Date(sale.date), 'dd MMM')}</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold">₹{sale.price.toLocaleString()}</p>
                  <p className="text-[10px] text-emerald-400 font-medium">+₹{sale.profit.toLocaleString()}</p>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="glass p-10 text-center flex flex-col items-center gap-3 opacity-60">
              <ShoppingBag size={36} className="text-text-muted" />
              <p className="text-sm font-medium">No sales recorded yet.</p>
              <Link to="/sales" className="text-xs font-bold text-primary">Record your first sale →</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
