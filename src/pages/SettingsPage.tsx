import React, { useRef, useState } from 'react';
import { Download, Upload, Trash2, ShieldCheck, Database, Info, HardDrive, Bell, Key, Lock, CheckCircle2, ChevronRight, Sun, Moon, RefreshCcw, Building2, Mail, Phone, MapPin, Save } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { exportData, importData, exportToCSV } from '../utils/backup';
import { requestNotificationPermission } from '../utils/notifications';
import { db } from '../db/db';
import { motion } from 'framer-motion';

const SectionHeader: React.FC<{ icon: React.ReactNode; title: string; color?: string }> = ({ icon, title, color = '#6366f1' }) => (
  <div className="flex items-center gap-2.5 mb-1">
    <div className="p-1.5 rounded-lg" style={{ background: `${color}18` }}>
      {React.cloneElement(icon as React.ReactElement, { size: 15, color })}
    </div>
    <h3 className="text-xs font-extrabold uppercase tracking-[0.15em]" style={{ color }}>{title}</h3>
  </div>
);

const SettingsRow: React.FC<{
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onClick?: () => void;
  iconBg?: string;
  iconColor?: string;
  danger?: boolean;
  rightContent?: React.ReactNode;
}> = ({ icon, title, subtitle, onClick, iconBg = 'rgba(99,102,241,0.1)', iconColor = '#818cf8', danger = false, rightContent }) => (
  <button
    onClick={onClick}
    className="flex items-center justify-between p-4 rounded-2xl w-full text-left transition-all active:scale-98"
    style={{ background: danger ? 'rgba(239,68,68,0.05)' : 'rgba(255,255,255,0.04)', border: `1px solid ${danger ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.07)'}` }}
  >
    <div className="flex items-center gap-3">
      <div className="p-2.5 rounded-xl flex-shrink-0" style={{ background: iconBg }}>
        {React.cloneElement(icon as React.ReactElement, { size: 18, color: iconColor })}
      </div>
      <div>
        <h4 className="text-sm font-bold" style={{ color: danger ? '#f87171' : undefined }}>{title}</h4>
        <p className="text-[10px] text-text-muted mt-0.5">{subtitle}</p>
      </div>
    </div>
    {rightContent || <ChevronRight size={16} color="#475569" />}
  </button>
);

const SettingsPage: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [notifGranted, setNotifGranted] = useState(Notification.permission === 'granted');
  const [changingPin, setChangingPin] = useState(false);
  const [pinStep, setPinStep] = useState<'old' | 'new' | 'confirm'>('old');
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [pinError, setPinError] = useState('');

  const settings = useLiveQuery(() => db.settings.toCollection().first());
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    businessName: '',
    email: '',
    phone: '',
    address: ''
  });

  React.useEffect(() => {
    if (settings) {
      setProfileData({
        businessName: settings.businessName,
        email: settings.email,
        phone: settings.phone,
        address: settings.address
      });
    }
  }, [settings]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const existing = await db.settings.toCollection().first();
    if (existing?.id) {
      await db.settings.update(existing.id, profileData);
    } else {
      await db.settings.add(profileData);
    }
    setIsEditingProfile(false);
    alert('✅ Business Profile Updated!');
  };

  const handleExport = async () => {
    try {
      await exportData();
    } catch (err) {
      alert('Export failed: ' + err);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (confirm('Warning: This will OVERWRITE all current data with the backup. Continue?')) {
      try {
        await importData(file);
        alert('Data restored! Refreshing...');
        window.location.reload();
      } catch (err) {
        alert('Import failed: ' + err);
      }
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleClearAll = async () => {
    if (confirm('CRITICAL: This deletes ALL records permanently. Are you absolutely sure?')) {
      const confirm2 = prompt('Type "DELETE ALL" to confirm:');
      if (confirm2 === 'DELETE ALL') {
        await Promise.all([
          db.sales.clear(), db.expenses.clear(), db.dues.clear(),
          db.providers.clear(), db.providerTransactions.clear(), db.products.clear()
        ]);
        alert('All data cleared.');
        window.location.reload();
      }
    }
  };

  const handleNotif = async () => {
    const granted = await requestNotificationPermission();
    setNotifGranted(granted);
    alert(granted ? '✅ Renewal alerts enabled!' : '❌ Notifications denied. Enable in browser settings.');
  };

  const handlePinChange = () => {
    const savedPin = localStorage.getItem('app_pin');
    if (pinStep === 'old') {
      if (oldPin === savedPin) {
        setPinStep('new');
        setPinError('');
      } else {
        setPinError('Wrong current PIN');
        setOldPin('');
      }
    } else if (pinStep === 'new') {
      if (newPin.length === 4) {
        setPinStep('confirm');
        setPinError('');
      } else {
        setPinError('PIN must be 4 digits');
      }
    } else {
      if (newPin === oldPin) {
        setPinError('New PIN same as old');
        setPinStep('new');
        setNewPin('');
      } else if (newPin === prompt('Enter new PIN again to confirm:')) {
        localStorage.setItem('app_pin', newPin);
        setPinError('');
        setChangingPin(false);
        setPinStep('old');
        setOldPin('');
        setNewPin('');
        alert('✅ PIN changed successfully!');
      } else {
        setPinError('PINs do not match');
        setPinStep('new');
        setNewPin('');
      }
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-20">
      <div>
        <h2 className="text-2xl font-bold font-heading">Settings</h2>
        <p className="text-xs text-text-muted mt-0.5">App configuration & data management</p>
      </div>

      {/* Business Profile */}
      <div className="glass p-5 flex flex-col gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="flex justify-between items-center relative z-10">
          <SectionHeader icon={<Building2 />} title="Business Profile" color="#6366f1" />
          <button 
            onClick={() => setIsEditingProfile(!isEditingProfile)}
            className="text-[10px] font-extrabold text-primary bg-primary/10 px-3 py-1.5 rounded-lg border border-primary/20 hover:bg-primary/20 transition-all"
          >
            {isEditingProfile ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        {isEditingProfile ? (
          <form onSubmit={handleSaveProfile} className="flex flex-col gap-4 mt-2 relative z-10">
            <div className="grid grid-cols-1 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] uppercase font-bold text-text-muted ml-1">Business Name</label>
                <div className="relative">
                  <Building2 size={14} className="absolute left-3.5 top-1/2 -translate-y-half text-text-muted" />
                  <input 
                    className="h-10 pl-10 text-xs bg-white/5 border-white/10"
                    value={profileData.businessName}
                    onChange={e => setProfileData({...profileData, businessName: e.target.value})}
                    placeholder="Enter business name"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] uppercase font-bold text-text-muted ml-1">Email</label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-half text-text-muted" />
                    <input 
                      type="email"
                      className="h-10 pl-10 text-xs bg-white/5 border-white/10"
                      value={profileData.email}
                      onChange={e => setProfileData({...profileData, email: e.target.value})}
                      placeholder="email@example.com"
                      required
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] uppercase font-bold text-text-muted ml-1">Phone</label>
                  <div className="relative">
                    <Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-half text-text-muted" />
                    <input 
                      className="h-10 pl-10 text-xs bg-white/5 border-white/10"
                      value={profileData.phone}
                      onChange={e => setProfileData({...profileData, phone: e.target.value})}
                      placeholder="+91 00000 00000"
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] uppercase font-bold text-text-muted ml-1">Address</label>
                <div className="relative">
                  <MapPin size={14} className="absolute left-3.5 top-4 text-text-muted" />
                  <textarea 
                    className="pl-10 py-3 text-xs bg-white/5 border-white/10 min-h-[80px]"
                    value={profileData.address}
                    onChange={e => setProfileData({...profileData, address: e.target.value})}
                    placeholder="Enter physical address"
                    required
                  />
                </div>
              </div>
            </div>
            <button type="submit" className="btn-primary h-11 text-xs flex items-center justify-center gap-2 mt-2">
              <Save size={16} /> Save Changes
            </button>
          </form>
        ) : (
          <div className="grid grid-cols-1 gap-4 mt-2 relative z-10">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black text-xl border border-primary/20">
                {profileData.businessName?.[0] || 'B'}
              </div>
              <div>
                <h4 className="text-base font-bold">{profileData.businessName || 'Business Name'}</h4>
                <p className="text-[10px] text-text-muted font-medium">{profileData.email}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
               <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center gap-3">
                  <Phone size={14} className="text-primary" />
                  <span className="text-[10px] font-bold">{profileData.phone}</span>
               </div>
               <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center gap-3">
                  <MapPin size={14} className="text-primary" />
                  <span className="text-[10px] font-bold truncate">{profileData.address}</span>
               </div>
            </div>
          </div>
        )}
      </div>

      {/* Reports Section */}
      <div className="glass p-5 flex flex-col gap-3">
        <SectionHeader icon={<Database />} title="Export Reports" color="#10b981" />
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => exportToCSV('sales')}
            className="flex items-center justify-center gap-2 p-3 rounded-xl text-xs font-bold transition-all"
            style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', color: '#34d399' }}
          >
            <Download size={14} /> Sales CSV
          </button>
          <button
            onClick={() => exportToCSV('expenses')}
            className="flex items-center justify-center gap-2 p-3 rounded-xl text-xs font-bold transition-all"
            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}
          >
            <Download size={14} /> Expenses CSV
          </button>
        </div>
      </div>

      {/* Notifications */}
      <div className="glass p-5 flex flex-col gap-3">
        <SectionHeader icon={<Bell />} title="Notifications" color="#f59e0b" />
        <SettingsRow
          icon={<Bell />}
          title={notifGranted ? 'Renewal Alerts Active' : 'Enable Renewal Alerts'}
          subtitle={notifGranted ? 'You will be notified before renewals expire' : 'Get notified when client renewals are due'}
          onClick={handleNotif}
          iconBg="rgba(245,158,11,0.1)"
          iconColor="#fbbf24"
          rightContent={notifGranted
            ? <CheckCircle2 size={18} color="#10b981" />
            : <ChevronRight size={16} color="#475569" />
          }
        />
      </div>

      {/* Security */}
      <div className="glass p-5 flex flex-col gap-3">
        <SectionHeader icon={<ShieldCheck />} title="Security" color="#6366f1" />
        <SettingsRow
          icon={<Key />}
          title="Change App PIN"
          subtitle="Update your 4-digit security PIN"
          onClick={() => {
            const currentPin = prompt('Enter your CURRENT 4-digit PIN:');
            const savedPin = localStorage.getItem('app_pin');
            if (currentPin !== savedPin) {
              alert('❌ Wrong PIN!');
              return;
            }
            const newPinVal = prompt('Enter your NEW 4-digit PIN:');
            if (!newPinVal || newPinVal.length !== 4 || !/^\d{4}$/.test(newPinVal)) {
              alert('❌ Invalid PIN. Must be exactly 4 digits.');
              return;
            }
            const confirmPinVal = prompt('Confirm your NEW PIN:');
            if (newPinVal !== confirmPinVal) {
              alert('❌ PINs do not match!');
              return;
            }
            localStorage.setItem('app_pin', newPinVal);
            alert('✅ PIN changed successfully!');
          }}
          iconBg="rgba(99,102,241,0.1)"
          iconColor="#818cf8"
        />
        <div className="flex items-start gap-3 p-3 rounded-xl" style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.12)' }}>
          <ShieldCheck size={16} color="#34d399" className="flex-shrink-0 mt-0.5" />
          <p className="text-[10px] text-text-muted leading-relaxed">
            <strong className="text-emerald-400">100% Local Storage.</strong> Your data never leaves this device. No cloud, no tracking, total privacy. Built with IndexedDB.
          </p>
        </div>
      </div>

      {/* Data Management */}
      <div className="glass p-5 flex flex-col gap-3">
        <SectionHeader icon={<HardDrive />} title="Data Management" color="#818cf8" />
        <div className="flex flex-col gap-2.5">
          <SettingsRow
            icon={<Download />}
            title="Export Full Backup"
            subtitle="Download all data as a .json file"
            onClick={handleExport}
            iconBg="rgba(59,130,246,0.1)"
            iconColor="#60a5fa"
          />
          <SettingsRow
            icon={<Upload />}
            title="Restore from Backup"
            subtitle="Load data from a previous backup file"
            onClick={() => fileInputRef.current?.click()}
            iconBg="rgba(168,85,247,0.1)"
            iconColor="#c084fc"
          />
          <input type="file" ref={fileInputRef} onChange={handleImport} className="hidden" accept=".json" />
          <SettingsRow
            icon={<Trash2 />}
            title="Clear All Data"
            subtitle="Permanently delete every record (irreversible)"
            onClick={handleClearAll}
            iconBg="rgba(239,68,68,0.1)"
            iconColor="#f87171"
            danger
          />
        </div>
      </div>

      {/* App Info */}
      <div className="glass p-5 flex flex-col gap-4">
        <SectionHeader icon={<Info />} title="App Information" color="#94a3b8" />
        {[
          { label: 'Version', value: '3.5.0-HUB' },
          { label: 'Storage Engine', value: 'IndexedDB (Dexie)' },
          { label: 'Session', value: '24-hour PIN unlock' },
          { label: 'Build', value: 'May-2026-STABLE' },
        ].map(row => (
          <div key={row.label} className="flex justify-between items-center text-xs border-b border-white/5 pb-3 last:border-none last:pb-0">
            <span className="text-text-muted">{row.label}</span>
            <span className="font-mono font-bold">{row.value}</span>
          </div>
        ))}
      </div>

      <div className="text-center py-2">
        <p className="text-[10px] text-text-muted uppercase tracking-[0.2em] opacity-40">
          Business Tracker Pro • Designed for Excellence
        </p>
      </div>
    </div>
  );
};

export default SettingsPage;
