import { db } from '../db/db';

export const exportData = async () => {
  const data: Record<string, any[]> = {};
  
  const tables = ['products', 'sales', 'expenses', 'accounts', 'providers', 'providerTransactions', 'dues'];
  
  for (const table of tables) {
    data[table] = await (db as any)[table].toArray();
  }
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `business_backup_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const importData = async (file: File) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        
        // Correcting the transaction arguments: use an array for multiple tables
        await db.transaction('rw', [db.products, db.sales, db.expenses, db.accounts, db.providers, db.providerTransactions, db.dues], async () => {
          for (const [table, items] of Object.entries(data)) {
            if (Array.isArray(items)) {
              await (db as any)[table].clear();
              await (db as any)[table].bulkAdd(items);
            }
          }
        });
        resolve(true);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
};

export const exportToCSV = async (tableName: string) => {
  const items = await (db as any)[tableName].toArray();
  if (items.length === 0) return alert('No data to export');

  const headers = Object.keys(items[0]);
  const csvRows = [
    headers.join(','), // header row
    ...items.map((row: any) => 
      headers.map(fieldName => JSON.stringify(row[fieldName] || '')).join(',')
    )
  ];

  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${tableName}_export_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
