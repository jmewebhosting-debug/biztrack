import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import Dashboard from './pages/Dashboard';
import SalesPage from './pages/SalesPage';
import ExpensesPage from './pages/ExpensesPage';
import DuesPage from './pages/DuesPage';
import StatsPage from './pages/StatsPage';
import SettingsPage from './pages/SettingsPage';
import ProductsPage from './pages/ProductsPage';
import CustomersPage from './pages/CustomersPage';
import InvoicesPage from './pages/InvoicesPage';
import AppLock from './components/shared/AppLock';

const App: React.FC = () => {
  const [isUnlocked, setIsUnlocked] = React.useState(() => {
    const lastUnlock = localStorage.getItem('last_unlock_time');
    if (lastUnlock) {
      const timeDiff = Date.now() - parseInt(lastUnlock, 10);
      return timeDiff < 24 * 60 * 60 * 1000; // 24 hours
    }
    return false;
  });

  const handleUnlock = () => {
    setIsUnlocked(true);
    localStorage.setItem('last_unlock_time', Date.now().toString());
  };

  return (
    <Router>
      {!isUnlocked ? (
        <AppLock onUnlock={handleUnlock} />
      ) : (
        <MainLayout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/sales" element={<SalesPage />} />
            <Route path="/expenses" element={<ExpensesPage />} />
            <Route path="/dues" element={<DuesPage />} />
            <Route path="/stats" element={<StatsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/customers" element={<CustomersPage />} />
            <Route path="/invoices" element={<InvoicesPage />} />
          </Routes>
        </MainLayout>
      )}
    </Router>
  );
};

export default App;
