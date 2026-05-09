import React from 'react';
import { TrendingUp, TrendingDown, ArrowUpRight, Plus, ShoppingBag, CreditCard, Box, Users, Wallet, IndianRupee } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useFinanceSummary } from '../hooks/useFinance';
import { motion } from 'framer-motion';

const StatCard: React.FC<{ 
  title: string; 
  value: number; 
  icon: React.ReactNode; 
  trend?: string;
  color: 'blue' | 'green' | 'red' | 'purple'
}> = ({ title, value, icon, trend, color }) => {
  const colors = {
    blue: 'from-blue-500/20 to-indigo-500/20 text-blue-400',
    green: 'from-emerald-500/20 to-teal-500/20 text-emerald-400',
    red: 'from-rose-500/20 to-red-500/20 text-rose-400',
    purple: 'from-purple-500/20 to-pink-500/20 text-purple-400',
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass p-5 flex flex-col gap-3 relative overflow-hidden"
    >
      <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${colors[color]} blur-2xl opacity-50 -mr-10 -mt-10`} />
      <div className="flex justify-between items-start">
        <div className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/80">
          {icon}
        </div>
        {trend && (
          <div className="flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full">
            <ArrowUpRight size={12} />
            {trend}
          </div>
        )}
      </div>
      <div>
        <p className="text-text-muted text-sm font-medium">{title}</p>
        <h3 className="text-2xl font-bold font-heading mt-1">₹{value.toLocaleString()}</h3>
      </div>
    </motion.div>
  );
};

const Dashboard: React.FC = () => {
  const { revenue, profit, expenses, net, recentSales } = useFinanceSummary();

  return (
    <div className="flex flex-col gap-6 pb-20">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold font-heading">Hi, Sir! 👋</h2>
        <p className="text-text-muted text-sm">Here's what's happening with your business.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <StatCard title="Revenue" value={revenue} icon={<IndianRupee size={20} />} color="blue" trend="+12%" />
        <StatCard title="Profit" value={profit} icon={<TrendingUp size={20} />} color="green" trend="+8%" />
        <StatCard title="Expenses" value={expenses} icon={<TrendingDown size={20} />} color="red" />
        <StatCard title="Net Cash" value={net} icon={<CreditCard size={20} />} color="purple" />
      </div>

      <div className="glass p-5 flex flex-col gap-4 bg-gradient-to-br from-primary/5 to-purple-500/5">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-bold flex items-center gap-2 tracking-wide uppercase"><TrendingUp size={16} className="text-primary" /> Monthly Goal</h3>
          <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">₹50,000 Target</span>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-end">
             <span className="text-xs text-text-muted">Progress ({Math.round((profit / 50000) * 100)}%)</span>
             <span className="text-sm font-bold">₹{profit.toLocaleString()}</span>
          </div>
          <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
             <motion.div 
               initial={{ width: 0 }}
               animate={{ width: `${Math.min((profit / 50000) * 100, 100)}%` }}
               transition={{ duration: 1, ease: "easeOut" }}
               className="h-full bg-gradient-to-r from-primary to-purple-500"
             />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold font-heading px-1">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-3">
          <Link to="/sales" className="flex items-center gap-3 p-4 glass card-hover bg-primary/10 border-primary/20">
            <div className="p-2 rounded-full bg-primary text-white"><Plus size={18} /></div>
            <span className="text-sm font-medium">New Sale</span>
          </Link>
          <Link to="/products" className="flex items-center gap-3 p-4 glass card-hover bg-emerald-500/10 border-emerald-500/20">
            <div className="p-2 rounded-full bg-emerald-500 text-white"><Box size={18} /></div>
            <span className="text-sm font-medium">Catalog</span>
          </Link>
          <Link to="/expenses" className="flex items-center gap-3 p-4 glass card-hover bg-rose-500/10 border-rose-500/20">
            <div className="p-2 rounded-full bg-rose-500 text-white"><Wallet size={18} /></div>
            <span className="text-sm font-medium">Expense</span>
          </Link>
          <Link to="/dues" className="flex items-center gap-3 p-4 glass card-hover bg-blue-500/10 border-blue-500/20">
            <div className="p-2 rounded-full bg-blue-500 text-white"><Users size={18} /></div>
            <span className="text-sm font-medium">Dues</span>
          </Link>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-lg font-semibold font-heading">Recent Sales</h3>
          <Link to="/sales" className="text-xs font-medium text-primary hover:underline">View All</Link>
        </div>
        <div className="flex flex-col gap-3">
          {recentSales.length > 0 ? (
            recentSales.map((sale) => (
              <div key={sale.id} className="glass p-4 flex items-center justify-between card-hover">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-bold text-primary">
                    {sale.category[0]}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold">{sale.productName}</h4>
                    <p className="text-[10px] text-text-muted">{sale.customerName} • {new Date(sale.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">₹{sale.price.toLocaleString()}</p>
                  <p className="text-[10px] text-emerald-400">Profit: ₹{sale.profit.toLocaleString()}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="glass p-8 text-center flex flex-col items-center gap-2 opacity-60">
              <ShoppingBag size={32} className="text-text-muted" />
              <p className="text-sm">No sales recorded yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
