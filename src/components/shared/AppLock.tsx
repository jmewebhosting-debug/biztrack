import React, { useState, useEffect } from 'react';
import { Lock, Delete, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AppLock: React.FC<{ onUnlock: () => void }> = ({ onUnlock }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [confirmPin, setConfirmPin] = useState('');
  const [step, setStep] = useState<'enter' | 'confirm'>('enter');
  const [showHint, setShowHint] = useState(false);
  const savedPin = localStorage.getItem('app_pin');
  const isSettingPin = !savedPin;

  const handleInput = (val: string) => {
    if (error) return;
    if (isSettingPin && step === 'confirm') {
      if (confirmPin.length < 4) setConfirmPin(prev => prev + val);
    } else {
      if (pin.length < 4) setPin(prev => prev + val);
    }
  };

  const handleDelete = () => {
    if (isSettingPin && step === 'confirm') {
      setConfirmPin(prev => prev.slice(0, -1));
    } else {
      setPin(prev => prev.slice(0, -1));
    }
  };

  useEffect(() => {
    if (isSettingPin) {
      if (step === 'enter' && pin.length === 4) {
        setTimeout(() => setStep('confirm'), 300);
      } else if (step === 'confirm' && confirmPin.length === 4) {
        if (confirmPin === pin) {
          localStorage.setItem('app_pin', pin);
          onUnlock();
        } else {
          setError(true);
          setTimeout(() => {
            setConfirmPin('');
            setPin('');
            setStep('enter');
            setError(false);
          }, 1200);
        }
      }
    } else {
      if (pin.length === 4) {
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
  }, [pin, confirmPin, step, savedPin, isSettingPin, onUnlock]);

  const currentPin = isSettingPin && step === 'confirm' ? confirmPin : pin;

  const title = isSettingPin
    ? step === 'enter' ? 'Set App PIN' : 'Confirm Your PIN'
    : 'Enter PIN';

  const subtitle = isSettingPin
    ? step === 'enter'
      ? 'Create a 4-digit PIN to secure your data'
      : 'Re-enter the same PIN to confirm'
    : 'Enter your 4-digit security PIN';

  const keys = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  return (
    <div className="fixed inset-0 z-100 flex flex-col items-center justify-center p-6 overflow-hidden"
      style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.15) 0%, #0f172a 60%)' }}>

      {/* Decorative background blobs */}
      <div className="absolute top-0 left-1/2 -translate-x-half w-80 h-80 rounded-full opacity-20 blur-2xl"
        style={{ background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)' }} />
      <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full opacity-10 blur-2xl"
        style={{ background: 'radial-gradient(circle, #a855f7 0%, transparent 70%)' }} />

      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', damping: 20 }}
        className="flex flex-col items-center gap-8 w-full max-w-xs relative z-10"
      >
        {/* Icon + Title */}
        <div className="flex flex-col items-center gap-3 text-center">
          <motion.div
            animate={error ? { rotate: [0, -10, 10, -10, 10, 0] } : {}}
            transition={{ duration: 0.5 }}
            className="w-20 h-20 rounded-3xl flex items-center justify-center"
            style={{ background: error ? 'rgba(239,68,68,0.15)' : 'rgba(99,102,241,0.15)', border: `2px solid ${error ? 'rgba(239,68,68,0.3)' : 'rgba(99,102,241,0.3)'}` }}
          >
            {error
              ? <Lock size={36} color="#ef4444" />
              : <ShieldCheck size={36} color="#818cf8" />
            }
          </motion.div>
          <div>
            <AnimatePresence mode="wait">
              <motion.h2
                key={title}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="text-2xl font-bold font-heading"
                style={{ color: error ? '#f87171' : '#f8fafc' }}
              >
                {error ? 'Incorrect PIN' : title}
              </motion.h2>
            </AnimatePresence>
            <p className="text-sm text-text-muted mt-1">{error ? 'Please try again' : subtitle}</p>
          </div>
        </div>

        {/* PIN Dots */}
        <div className="flex gap-4">
          {[1, 2, 3, 4].map((i) => {
            const filled = currentPin.length >= i;
            return (
              <motion.div
                key={i}
                animate={error ? { x: [0, -6, 6, -6, 6, 0] } : {}}
                transition={{ duration: 0.4 }}
              >
                <motion.div
                  animate={{ scale: filled ? 1.15 : 1 }}
                  transition={{ type: 'spring', stiffness: 400 }}
                  className="w-4 h-4 rounded-full border-2 transition-colors duration-200"
                  style={{
                    backgroundColor: filled ? (error ? '#ef4444' : '#6366f1') : 'transparent',
                    borderColor: filled ? (error ? '#ef4444' : '#6366f1') : 'rgba(255,255,255,0.15)',
                    boxShadow: filled && !error ? '0 0 12px rgba(99,102,241,0.5)' : 'none',
                  }}
                />
              </motion.div>
            );
          })}
        </div>

        {/* Step indicator for setting PIN */}
        {isSettingPin && (
          <div className="flex gap-2">
            {['enter', 'confirm'].map((s) => (
              <div key={s} className="h-1 w-8 rounded-full transition-all duration-300"
                style={{ background: step === s || (s === 'enter' && step === 'confirm') ? '#6366f1' : 'rgba(255,255,255,0.1)' }} />
            ))}
          </div>
        )}

        {/* Number Pad */}
        <div className="grid grid-cols-3 gap-3 w-full">
          {keys.map((val) => (
            <motion.button
              key={val}
              whileTap={{ scale: 0.88 }}
              onClick={() => handleInput(val.toString())}
              className="h-16 rounded-2xl text-2xl font-bold transition-all"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#f8fafc' }}
            >
              {val}
            </motion.button>
          ))}
          <div />
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={() => handleInput('0')}
            className="h-16 rounded-2xl text-2xl font-bold transition-all"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#f8fafc' }}
          >
            0
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={handleDelete}
            className="h-16 rounded-2xl flex items-center justify-center transition-all"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}
          >
            <Delete size={22} color="#94a3b8" />
          </motion.button>
        </div>

        {/* Hint for change PIN */}
        {!isSettingPin && (
          <button onClick={() => setShowHint(!showHint)} className="text-xs text-text-muted underline opacity-50">
            Forgot PIN?
          </button>
        )}
        {showHint && (
          <p className="text-xs text-text-muted text-center glass p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)' }}>
            Clear app storage in your browser settings to reset PIN, then reinstall the app.
          </p>
        )}

        <p className="text-[10px] text-text-muted text-center opacity-40 uppercase tracking-widest">
          Business Tracker Pro • Secured
        </p>
      </motion.div>
    </div>
  );
};

export default AppLock;
