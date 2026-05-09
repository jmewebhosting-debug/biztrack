import Dexie, { type Table } from 'dexie';
import type { Product, Sale, Expense, Account, Provider, ProviderTransaction, Due } from '../types';

export class BusinessDB extends Dexie {
  products!: Table<Product>;
  sales!: Table<Sale>;
  expenses!: Table<Expense>;
  accounts!: Table<Account>;
  providers!: Table<Provider>;
  providerTransactions!: Table<ProviderTransaction>;
  dues!: Table<Due>;
  settings!: Table<BusinessSettings>;

  constructor() {
    super('BusinessTrackerDB');
    this.version(3).stores({
      products: '++id, name, category',
      sales: '++id, productName, category, date, renewalDate, status',
      expenses: '++id, category, date, accountId, member',
      accounts: '++id, name',
      providers: '++id, name',
      providerTransactions: '++id, providerId, date, type',
      dues: '++id, personName, type, status, saleId',
      settings: '++id',
      customers: '++id, name, phone'
    });
  }
}

export const db = new BusinessDB();

// Initialize default accounts if empty
db.on('ready', async () => {
  const count = await db.accounts.count();
  if (count === 0) {
    await db.accounts.bulkAdd([
      { name: 'Cash', balance: 0 },
      { name: 'Bank Account', balance: 0 },
      { name: 'UPI/Wallet', balance: 0 }
    ]);
  }

  const settingsCount = await db.settings.count();
  if (settingsCount === 0) {
    await db.settings.add({
      businessName: 'My Business',
      email: 'business@example.com',
      phone: '+91 00000 00000',
      address: 'Business Address, City'
    });
  }
});
