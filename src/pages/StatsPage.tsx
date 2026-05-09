import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import { format, subDays } from 'date-fns';
import { TrendingUp, TrendingDown, Award, Box, Zap, BarChart2 } from 'lucide-react';

const COLORS = {
  Software: '#6366f1',
  VPS: '#a855f7',
  Linux: '#10b981',
  Others: '#f59e0b',
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass p-3 text-xs" style={{ minWidth: 140 }}>
        <p className="font-bold text-text-muted mb-1">{label}</p>
        {payload.map((p: any) => (
          <p key={p.dataKey} style={{ color: p.color }} className="font-semibold">
            {p.name}: ₹{p.value?.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const StatsPage: React.FC = () => {
  const [chartRange, setChartRange] = useState<7 | 14 | 30>(7);

  const sales = useLiveQuery(() => db.sales.toArray()) || [];
  const expenses = useLiveQuery(() => db.expenses.toArray()) || [];

  // Prepare combined Revenue vs Expense chart data
  const chartData = Array.from({ length: chartRange }, (_, i) => {
    const date = subDays(new Date(), chartRange - 1 - i);
    const dayKey = format(date, 'yyyy-MM-dd');

    const daySales = sales.filter(s => format(new Date(s.date), 'yyyy-MM-dd') === dayKey);
    const dayExpenses = expenses.filter(e => format(new Date(e.date), 'yyyy-MM-dd') === dayKey);

    return {
      name: format(date, chartRange === 30 ? 'dd MMM' : 'dd MMM'),
      revenue: daySales.reduce((acc, s) => acc + s.price, 0),
      profit: daySales.reduce((acc, s) => acc + s.profit, 0),
      expenses: dayExpenses.reduce((acc, e) => acc + e.amount, 0),
    };
  });

  // Category Distribution (all categories including Others)
  const categoryMap: Record<string, { count: number; revenue: number; color: string }> = {};

  sales.forEach(s => {
    const cat = s.category || 'Others';
    if (!categoryMap[cat]) {
      categoryMap[cat] = {
        count: 0,
        revenue: 0,
        color: (COLORS as any)[cat] || '#f59e0b',
      };
    }
    categoryMap[cat].count += 1;
    categoryMap[cat].revenue += s.price;
  });

  const categoryData = Object.entries(categoryMap).map(([name, data]) => ({
    name,
    value: data.count,
    revenue: data.revenue,
    color: data.color,
  }));

  // Total summary
  const totalRevenue = sales.reduce((acc, s) => acc + s.price, 0);
  const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
  const totalProfit = sales.reduce((acc, s) => acc + s.profit, 0);
  const netBalance = totalProfit - totalExpenses;

  // Top Products
  const productCounts = sales.reduce((acc, s) => {
    acc[s.productName] = (acc[s.productName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topProducts = Object.entries(productCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Expense breakdown by category
  const expenseCatMap: Record<string, number> = {};
  expenses.forEach(e => {
    expenseCatMap[e.category] = (expenseCatMap[e.category] || 0) + e.amount;
  });
  const topExpenseCategories = Object.entries(expenseCatMap)
    .map(([name, amount]) => ({ name, amount }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-2xl font-bold font-heading">Analytics</h2>

      {/* Summary Totals */}
      <div className="grid grid-cols-2 gap-3">
        <div className="glass p-4 bg-primary/5 border-primary/20 flex flex-col gap-1">
          <p className="text-[9px] uppercase font-extrabold text-text-muted tracking-widest flex items-center gap-1">
            <TrendingUp size={10} /> Revenue
          </p>
          <h3 className="text-lg font-bold text-primary">₹{totalRevenue.toLocaleString()}</h3>
        </div>
        <div className="glass p-4 bg-rose-500/5 border-rose-500/20 flex flex-col gap-1">
          <p className="text-[9px] uppercase font-extrabold text-text-muted tracking-widest flex items-center gap-1">
            <TrendingDown size={10} /> Expenses
          </p>
          <h3 className="text-lg font-bold text-rose-400">₹{totalExpenses.toLocaleString()}</h3>
        </div>
        <div className="glass p-4 bg-emerald-500/5 border-emerald-500/20 flex flex-col gap-1">
          <p className="text-[9px] uppercase font-extrabold text-text-muted tracking-widest">Gross Profit</p>
          <h3 className="text-lg font-bold text-emerald-400">₹{totalProfit.toLocaleString()}</h3>
        </div>
        <div className={`glass p-4 flex flex-col gap-1 ${netBalance >= 0 ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-rose-500/5 border-rose-500/20'}`}>
          <p className="text-[9px] uppercase font-extrabold text-text-muted tracking-widest">Net Balance</p>
          <h3 className={`text-lg font-bold ${netBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {netBalance >= 0 ? '+' : ''}₹{netBalance.toLocaleString()}
          </h3>
        </div>
      </div>

      {/* Revenue vs Expenses Chart */}
      <div className="glass p-5 flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-bold flex items-center gap-2">
            <BarChart2 size={16} className="text-primary" /> Revenue vs Expenses
          </h3>
          <div className="flex gap-1.5">
            {([7, 14, 30] as const).map(r => (
              <button
                key={r}
                onClick={() => setChartRange(r)}
                className={`text-[9px] font-extrabold px-2 py-1 rounded-lg border transition-all ${
                  chartRange === r
                    ? 'bg-primary border-primary text-white'
                    : 'bg-white/5 border-white/10 text-text-muted'
                }`}
              >
                {r}D
              </button>
            ))}
          </div>
        </div>
        <div className="h-[220px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="name"
                stroke="#94a3b8"
                fontSize={9}
                tickLine={false}
                axisLine={false}
                interval={chartRange === 30 ? 6 : chartRange === 14 ? 1 : 0}
              />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="revenue"
                name="Revenue"
                stroke="#6366f1"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorRev)"
              />
              <Area
                type="monotone"
                dataKey="expenses"
                name="Expense"
                stroke="#f43f5e"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorExp)"
              />
              <Area
                type="monotone"
                dataKey="profit"
                name="Profit"
                stroke="#10b981"
                strokeWidth={1.5}
                strokeDasharray="4 3"
                fillOpacity={1}
                fill="url(#colorProfit)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        {/* Legend */}
        <div className="flex gap-4 justify-center">
          {[
            { color: '#6366f1', label: 'Revenue' },
            { color: '#f43f5e', label: 'Expense' },
            { color: '#10b981', label: 'Profit' },
          ].map(l => (
            <div key={l.label} className="flex items-center gap-1.5 text-[9px] font-bold text-text-muted">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: l.color }} />
              {l.label}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {/* Sales Category Distribution */}
        <div className="glass p-5 flex flex-col gap-4">
          <h3 className="text-sm font-bold flex items-center gap-2">
            <Box size={16} className="text-purple-400" /> Sales by Category
          </h3>
          {categoryData.length > 0 ? (
            <div className="flex items-center gap-2">
              <div className="h-[160px] flex-1">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      innerRadius={50}
                      outerRadius={72}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload?.length) {
                          const d = payload[0].payload;
                          return (
                            <div className="glass p-2 text-[10px]">
                              <p className="font-bold">{d.name}</p>
                              <p className="text-text-muted">{d.value} sales</p>
                              <p className="text-primary">₹{d.revenue?.toLocaleString()}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-col gap-2.5 pr-2">
                {categoryData.map(c => (
                  <div key={c.name} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: c.color }} />
                    <div>
                      <p className="text-[10px] font-bold">{c.name}</p>
                      <p className="text-[9px] text-text-muted">{c.value} sales • ₹{c.revenue.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-xs text-text-muted text-center py-8">No sales data yet</p>
          )}
        </div>

        {/* Top Products */}
        <div className="glass p-5 flex flex-col gap-4">
          <h3 className="text-sm font-bold flex items-center gap-2">
            <Award size={16} className="text-emerald-400" /> Best Sellers
          </h3>
          <div className="flex flex-col gap-2">
            {topProducts.length > 0 ? topProducts.map((p, i) => (
              <div
                key={p.name}
                className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5"
              >
                <div className="flex items-center gap-3">
                  <span className="text-base font-bold text-white/20">#{i + 1}</span>
                  <span className="text-xs font-bold truncate max-w-[150px]">{p.name}</span>
                </div>
                <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-lg">
                  {p.count} Sold
                </span>
              </div>
            )) : (
              <p className="text-xs text-text-muted text-center py-6">Not enough data</p>
            )}
          </div>
        </div>

        {/* Expense Breakdown */}
        {topExpenseCategories.length > 0 && (
          <div className="glass p-5 flex flex-col gap-4">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <TrendingDown size={16} className="text-rose-400" /> Expense Breakdown
            </h3>
            <div className="h-[160px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topExpenseCategories} layout="vertical" margin={{ left: 0, right: 10 }}>
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={90}
                    tick={{ fontSize: 10, fill: '#94a3b8' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload?.length) {
                        return (
                          <div className="glass p-2 text-[10px]">
                            <p className="font-bold text-rose-400">₹{payload[0].value?.toLocaleString()}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="amount" fill="#f43f5e" radius={[0, 6, 6, 0]} opacity={0.8} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Quick Insight */}
      <div className="glass p-5 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-primary/20">
        <h3 className="text-sm font-bold flex items-center gap-2 text-primary">
          <Zap size={16} /> Quick Insight
        </h3>
        <p className="text-xs text-text-muted mt-2 leading-relaxed">
          {categoryData.length > 0 ? (
            <>
              Your most sold category is{' '}
              <strong className="text-text-main">
                {[...categoryData].sort((a, b) => b.value - a.value)[0]?.name}
              </strong>
              {topProducts[0] && (
                <>
                  {' '}and <strong className="text-text-main">{topProducts[0].name}</strong> is your top product.
                </>
              )}
              {totalExpenses > 0 && (
                <>{' '}You've spent <strong className="text-rose-400">₹{totalExpenses.toLocaleString()}</strong> in expenses, leaving a net balance of <strong className={netBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'}>₹{Math.abs(netBalance).toLocaleString()}</strong>.</>
              )}
            </>
          ) : (
            'Start adding sales to see insights here.'
          )}
        </p>
      </div>
    </div>
  );
};

export default StatsPage;
