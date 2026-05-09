import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { format, startOfDay, subDays } from 'date-fns';
import { TrendingUp, Award, Box, Zap } from 'lucide-react';

const StatsPage: React.FC = () => {
  const sales = useLiveQuery(() => db.sales.toArray()) || [];
  
  // Prepare data for Daily Sales Chart
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), i);
    const daySales = sales.filter(s => format(new Date(s.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd'));
    return {
      name: format(date, 'dd MMM'),
      revenue: daySales.reduce((acc, s) => acc + s.price, 0),
      profit: daySales.reduce((acc, s) => acc + s.profit, 0),
    };
  }).reverse();

  // Prepare data for Category Distribution
  const categoryData = [
    { name: 'Software', value: sales.filter(s => s.category === 'Software').length, color: '#6366f1' },
    { name: 'VPS', value: sales.filter(s => s.category === 'VPS').length, color: '#a855f7' },
    { name: 'Linux', value: sales.filter(s => s.category === 'Linux').length, color: '#10b981' },
  ].filter(c => c.value > 0);

  // Top Products
  const productCounts = sales.reduce((acc, s) => {
    acc[s.productName] = (acc[s.productName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topProducts = Object.entries(productCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-2xl font-bold font-heading">Analytics</h2>

      {/* Revenue Trend */}
      <div className="glass p-5 flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-bold flex items-center gap-2"><TrendingUp size={16} className="text-primary" /> Revenue Trend (7 Days)</h3>
          <span className="text-[10px] text-text-muted">Live Data</span>
        </div>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={last7Days}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis hide />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                itemStyle={{ fontSize: '12px' }}
              />
              <Area type="monotone" dataKey="revenue" stroke="#6366f1" fillOpacity={1} fill="url(#colorRev)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Category Share */}
        <div className="glass p-5 flex flex-col gap-4">
           <h3 className="text-sm font-bold flex items-center gap-2"><Box size={16} className="text-purple-400" /> Sales Share</h3>
           <div className="h-[180px] w-full flex items-center">
             <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Pie
                   data={categoryData}
                   innerRadius={60}
                   outerRadius={80}
                   paddingAngle={5}
                   dataKey="value"
                 >
                   {categoryData.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={entry.color} />
                   ))}
                 </Pie>
                 <Tooltip />
               </PieChart>
             </ResponsiveContainer>
             <div className="flex flex-col gap-2 pr-4">
               {categoryData.map(c => (
                 <div key={c.name} className="flex items-center gap-2 text-[10px]">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
                    <span className="text-text-muted">{c.name}</span>
                 </div>
               ))}
             </div>
           </div>
        </div>

        {/* Top Performers */}
        <div className="glass p-5 flex flex-col gap-4">
           <h3 className="text-sm font-bold flex items-center gap-2"><Award size={16} className="text-emerald-400" /> Best Sellers</h3>
           <div className="flex flex-col gap-3 mt-2">
             {topProducts.length > 0 ? topProducts.map((p, i) => (
               <div key={p.name} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                 <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-white/20">#{i+1}</span>
                    <span className="text-xs font-bold truncate max-w-[120px]">{p.name}</span>
                 </div>
                 <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-lg">{p.count} Sold</span>
               </div>
             )) : (
               <p className="text-xs text-text-muted text-center py-8">Not enough data</p>
             )}
           </div>
        </div>
      </div>

      {/* Insights */}
      <div className="glass p-5 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-primary/20">
         <h3 className="text-sm font-bold flex items-center gap-2 text-primary"><Zap size={16} /> Quick Insight</h3>
         <p className="text-xs text-text-muted mt-2 leading-relaxed">
           Your most profitable category this month is <strong>{categoryData.sort((a,b) => b.value - a.value)[0]?.name || 'N/A'}</strong>. 
           Consider focusing more on <strong>{topProducts[0]?.name || 'new products'}</strong> as it shows high customer demand.
         </p>
      </div>
    </div>
  );
};

export default StatsPage;
