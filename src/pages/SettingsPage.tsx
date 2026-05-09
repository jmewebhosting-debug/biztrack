import React, { useRef } from 'react';
import { Download, Upload, Trash2, ShieldCheck, Database, Info, HardDrive, Bell } from 'lucide-react';
import { exportData, importData, exportToCSV } from '../utils/backup';
import { requestNotificationPermission } from '../utils/notifications';
import { db } from '../db/db';
import { motion } from 'framer-motion';

const SettingsPage: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);

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

    if (confirm('Warning: This will overwrite ALL current data with the backup file. Continue?')) {
      try {
        await importData(file);
        alert('Data restored successfully! Refreshing...');
        window.location.reload();
      } catch (err) {
        alert('Import failed: ' + err);
      }
    }
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleClearAll = async () => {
    if (confirm('CRITICAL WARNING: This will delete EVERY record in your database. This cannot be undone. Are you absolutely sure?')) {
      const pin = prompt('Type "DELETE" to confirm:');
      if (pin === 'DELETE') {
        await Promise.all([
          db.sales.clear(),
          db.expenses.clear(),
          db.dues.clear(),
          db.providers.clear(),
          db.providerTransactions.clear(),
          db.products.clear()
        ]);
        alert('All data cleared.');
        window.location.reload();
      }
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-2xl font-bold font-heading">Settings</h2>

      <div className="flex flex-col gap-4">
        {/* Reports & Exports */}
        <div className="glass p-5 flex flex-col gap-4">
          <div className="flex items-center gap-2 text-emerald-400">
            <Database size={18} />
            <h3 className="text-sm font-bold uppercase tracking-wider">Excel / CSV Reports</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
             <button onClick={() => exportToCSV('sales')} className="btn-secondary py-2 text-[10px] flex items-center justify-center gap-2">
                <Download size={14} /> Sales CSV
             </button>
             <button onClick={() => exportToCSV('expenses')} className="btn-secondary py-2 text-[10px] flex items-center justify-center gap-2">
                <Download size={14} /> Expenses CSV
             </button>
          </div>
          <button 
            onClick={async () => {
              const granted = await requestNotificationPermission();
              if (granted) alert('Renewal alerts enabled!');
              else alert('Notifications denied. Please enable in browser settings.');
            }}
            className="btn-primary py-2 text-xs flex items-center justify-center gap-2 mt-2"
          >
            <Bell size={16} /> Enable Renewal Alerts
          </button>
        </div>

        {/* Data Management */}
        <div className="glass p-5 flex flex-col gap-4">
          <div className="flex items-center gap-2 text-primary">
            <Database size={18} />
            <h3 className="text-sm font-bold uppercase tracking-wider">Data Management</h3>
          </div>
          
          <div className="grid grid-cols-1 gap-3">
            <button 
              onClick={handleExport}
              className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all text-left"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
                  <Download size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold">Export Backup</h4>
                  <p className="text-[10px] text-text-muted">Save your data to a .json file</p>
                </div>
              </div>
            </button>

            <button 
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all text-left"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 text-purple-400 rounded-lg">
                  <Upload size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold">Restore Backup</h4>
                  <p className="text-[10px] text-text-muted">Load data from a previous backup</p>
                </div>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImport} 
                className="hidden" 
                accept=".json"
              />
            </button>

            <button 
              onClick={handleClearAll}
              className="flex items-center justify-between p-4 bg-rose-500/5 border border-rose-500/10 rounded-xl hover:bg-rose-500/10 transition-all text-left"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-rose-500/10 text-rose-400 rounded-lg">
                  <Trash2 size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-rose-400">Clear All Data</h4>
                  <p className="text-[10px] text-rose-400/60">Permanently delete all records</p>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Security Info */}
        <div className="glass p-5 flex flex-col gap-3 bg-emerald-500/5 border-emerald-500/10">
          <div className="flex items-center gap-2 text-emerald-400">
            <ShieldCheck size={18} />
            <h3 className="text-sm font-bold uppercase tracking-wider">Privacy & Security</h3>
          </div>
          <p className="text-xs text-text-muted leading-relaxed">
            This app uses <strong>Local-First</strong> technology. Your data never leaves this device unless you manually export a backup. 
            No cloud servers, no tracking, total privacy.
          </p>
        </div>

        {/* App Info */}
        <div className="glass p-5 flex flex-col gap-4">
          <div className="flex items-center gap-2 text-text-muted">
            <Info size={18} />
            <h3 className="text-sm font-bold uppercase tracking-wider">App Information</h3>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center text-xs">
               <span className="text-text-muted">Version</span>
               <span className="font-mono">1.0.0-PRO</span>
            </div>
            <div className="flex justify-between items-center text-xs">
               <span className="text-text-muted">Storage Engine</span>
               <span className="font-mono flex items-center gap-1"><HardDrive size={10} /> IndexedDB</span>
            </div>
            <div className="flex justify-between items-center text-xs">
               <span className="text-text-muted">Build ID</span>
               <span className="font-mono">May-2026-STABLE</span>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center py-4">
        <p className="text-[10px] text-text-muted uppercase tracking-[0.2em]">Designed for Excellence</p>
      </div>
    </div>
  );
};

export default SettingsPage;
