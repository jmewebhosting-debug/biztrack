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

  constructor() {
    super('BusinessTrackerDB');
    this.version(1).stores({
      products: '++id, name, category',
      sales: '++id, productName, category, date, renewalDate, status',
      expenses: '++id, category, date, accountId, member',
      accounts: '++id, name',
      providers: '++id, name',
      providerTransactions: '++id, providerId, type, date',
      dues: '++id, personName, type, status'
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
});
