import React, { useState } from 'react';
import { Home, ShoppingCart, Wallet, Users, Settings, Sun, Moon, Menu, X, PieChart, Users2, Package } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

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
    className="flex flex-col items-center gap-0.5 relative py-2 flex-1 transition-all active:scale-95"
  >
    <div className={`transition-colors duration-300 ${active ? 'text-primary' : 'text-text-muted'}`}>
      {icon}
    </div>
    <span className={`text-[9px] font-bold tracking-tight transition-colors duration-300 ${active ? 'text-primary' : 'text-text-muted'}`}>
      {label}
    </span>
    {active && (
      <motion.div 
        layoutId="nav-active"
        className="absolute -top-1 w-8 h-1 bg-primary rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]"
      />
    )}
  </Link>
);

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const [isLight, setIsLight] = useState(localStorage.getItem('theme') === 'light');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
    { to: '/sales', icon: <ShoppingCart size={20} />, label: 'Sales' },
    { to: '/expenses', icon: <Wallet size={20} />, label: 'Expense' },
    { to: '/dues', icon: <Users size={20} />, label: 'Dues' },
  ];

  const extraNavItems = [
    { to: '/customers', icon: <Users2 size={24} />, label: 'Customers (CRM)', desc: 'Manage your client base' },
    { to: '/products', icon: <Package size={24} />, label: 'Product Catalog', desc: 'Manage VPS & Software templates' },
    { to: '/stats', icon: <PieChart size={24} />, label: 'Business Stats', desc: 'View detailed analytics' },
    { to: '/settings', icon: <Settings size={24} />, label: 'App Settings', desc: 'Security, Theme & Backups' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-bg-dark text-text-main overflow-x-hidden">
      {/* Header */}
      <header className="px-6 py-4 flex justify-between items-center sticky top-0 z-40 glass-dark">
        <h1 className="text-xl font-bold text-gradient font-heading tracking-tighter">Business Tracker</h1>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsLight(!isLight)}
            className="p-2 rounded-full bg-white/5 border border-white/10 transition-all text-text-muted hover:text-white"
          >
            {isLight ? <Moon size={20} /> : <Sun size={20} />}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 pt-6 pb-28 app-container overflow-y-auto">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 glass-dark border-t border-white/5 w-full">
        <div className="max-w-600px mx-auto flex justify-around items-center px-2 pb-2 pt-1">
          {mainNavItems.map((item) => (
            <NavItem 
              key={item.to} 
              to={item.to} 
              icon={item.icon} 
              label={item.label} 
              active={location.pathname === item.to}
            />
          ))}
          
          {/* Hamburger / More Button */}
          <button 
            onClick={() => setIsMenuOpen(true)}
            className="flex flex-col items-center gap-0.5 relative py-2 flex-1 transition-all active:scale-95"
          >
            <div className={`transition-colors duration-300 ${isMenuOpen ? 'text-primary' : 'text-text-muted'}`}>
              <Menu size={20} />
            </div>
            <span className={`text-[9px] font-bold tracking-tight transition-colors duration-300 ${isMenuOpen ? 'text-primary' : 'text-text-muted'}`}>
              More
            </span>
          </button>
        </div>
      </nav>

      {/* Hamburger Menu Drawer */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 z-60 bg-black/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 z-70 glass p-6 pb-12 rounded-t-drawer border-t border-white/10 max-w-600px mx-auto"
            >
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-xl font-bold font-heading">Business Menu</h3>
                  <p className="text-xs text-text-muted">Advanced management tools</p>
                </div>
                <button 
                  onClick={() => setIsMenuOpen(false)}
                  className="p-3 rounded-2xl bg-white/5 border border-white/10 text-text-muted"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {extraNavItems.map((item) => (
                  <Link 
                    key={item.to} 
                    to={item.to} 
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-primary/10 hover:border-primary/20 transition-all group"
                  >
                    <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-all">
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold">{item.label}</h4>
                      <p className="text-[10px] text-text-muted">{item.desc}</p>
                    </div>
                  </Link>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-white/5 flex justify-center">
                 <p className="text-[10px] text-text-muted uppercase tracking-[0.2em] font-bold">Business Tracker Pro v1.0</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MainLayout;
