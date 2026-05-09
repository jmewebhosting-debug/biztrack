import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

export const useFinanceSummary = () => {
  const sales = useLiveQuery(() => db.sales.toArray());
  const expenses = useLiveQuery(() => db.expenses.toArray());

  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const currentMonthSales = sales?.filter(s => 
    isWithinInterval(new Date(s.date), { start: monthStart, end: monthEnd })
  ) || [];

  const currentMonthExpenses = expenses?.filter(e => 
    isWithinInterval(new Date(e.date), { start: monthStart, end: monthEnd })
  ) || [];

  const totalRevenue = currentMonthSales.reduce((acc, s) => acc + s.price, 0);
  const totalCost = currentMonthSales.reduce((acc, s) => acc + s.cost, 0);
  const totalProfit = totalRevenue - totalCost;
  const totalExpenses = currentMonthExpenses.reduce((acc, e) => acc + e.amount, 0);

  return {
    revenue: totalRevenue,
    profit: totalProfit,
    expenses: totalExpenses,
    net: totalProfit - totalExpenses,
    recentSales: sales?.slice(-5).reverse() || [],
    recentExpenses: expenses?.slice(-5).reverse() || []
  };
};

export const useSalesByProduct = () => {
  return useLiveQuery(async () => {
    const sales = await db.sales.toArray();
    const productStats: Record<string, { count: number, profit: number }> = {};

    sales.forEach(sale => {
      if (!productStats[sale.productName]) {
        productStats[sale.productName] = { count: 0, profit: 0 };
      }
      productStats[sale.productName].count += 1;
      productStats[sale.productName].profit += sale.profit;
    });

    return Object.entries(productStats).map(([name, stats]) => ({
      name,
      ...stats
    })).sort((a, b) => b.count - a.count);
  });
};
