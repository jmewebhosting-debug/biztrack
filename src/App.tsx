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
import AppLock from './components/shared/AppLock';

const App: React.FC = () => {
  const [isUnlocked, setIsUnlocked] = React.useState(false);

  return (
    <Router>
      {!isUnlocked ? (
        <AppLock onUnlock={() => setIsUnlocked(true)} />
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
          </Routes>
        </MainLayout>
      )}
    </Router>
  );
};

export default App;
