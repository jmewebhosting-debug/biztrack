import React, { useState, useEffect } from 'react';
import { Lock, Delete } from 'lucide-react';
import { motion } from 'framer-motion';

const AppLock: React.FC<{ onUnlock: () => void }> = ({ onUnlock }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const savedPin = localStorage.getItem('app_pin');

  // If no PIN is set, allow the user to set one first time
  const isSettingPin = !savedPin;

  const handleInput = (val: string) => {
    if (pin.length < 4) {
      setPin(prev => prev + val);
    }
  };

  useEffect(() => {
    if (pin.length === 4) {
      if (isSettingPin) {
        // Set new PIN
        localStorage.setItem('app_pin', pin);
        onUnlock();
      } else {
        // Verify PIN
        if (pin === savedPin) {
          onUnlock();
        } else {
          setError(true);
          setTimeout(() => {
            setPin('');
            setError(false);
          }, 1000);
        }
      }
    }
  }, [pin, savedPin, isSettingPin, onUnlock]);

  return (
    <div className="fixed inset-0 z-100 bg-bg-dark flex flex-col items-center justify-center p-8">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-8 w-full max-w-xs"
      >
        <div className="flex flex-col items-center gap-2">
          <div className="p-4 rounded-3xl bg-primary/10 border border-primary/20 text-primary">
            <Lock size={32} />
          </div>
          <h2 className="text-xl font-bold font-heading mt-4">
            {isSettingPin ? 'Set Your App PIN' : 'Enter App PIN'}
          </h2>
          <p className="text-sm text-text-muted text-center">
            {isSettingPin ? 'Create a 4-digit PIN to secure your financial data' : 'Please enter your 4-digit security PIN'}
          </p>
        </div>

        {/* PIN Indicators */}
        <div className="flex gap-4">
          {[1, 2, 3, 4].map((i) => (
            <motion.div 
              key={i}
              animate={error ? { x: [0, -5, 5, -5, 5, 0] } : {}}
              className={`w-4 h-4 rounded-full border-2 transition-all duration-300 ${
                pin.length >= i 
                  ? (error ? 'bg-rose-500 border-rose-500' : 'bg-primary border-primary') 
                  : 'bg-white/5 border-white/10'
              }`}
            />
          ))}
        </div>

        {/* Number Pad */}
        <div className="grid grid-cols-3 gap-4 w-full">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((val) => (
            <button
              key={val}
              onClick={() => handleInput(val.toString())}
              className="h-16 rounded-2xl bg-white/5 border border-white/10 text-2xl font-bold hover:bg-white/10 active:scale-90 transition-all"
            >
              {val}
            </button>
          ))}
          <div />
          <button
            onClick={() => handleInput('0')}
            className="h-16 rounded-2xl bg-white/5 border border-white/10 text-2xl font-bold hover:bg-white/10 active:scale-90 transition-all"
          >
            0
          </button>
          <button
            onClick={() => setPin(prev => prev.slice(0, -1))}
            className="h-16 rounded-2xl flex items-center justify-center text-text-muted hover:text-white"
          >
            <Delete size={24} />
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default AppLock;
