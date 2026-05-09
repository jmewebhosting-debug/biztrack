export type Category = 'Software' | 'VPS' | 'Linux';
export type TransactionType = 'income' | 'expense';
export type DueType = 'to-receive' | 'to-pay';

export interface Product {
  id?: number;
  name: string;
  category: Category;
  cost: number;
  price: number;
  specs: string;
}

export interface SaleItem {
  name: string;
  category: Category;
  cost: number;
  price: number;
}

export interface Sale {
  id?: number;
  productId?: number;
  productName: string;
  category: Category;
  cost: number;
  price: number;
  profit: number;
  date: Date;
  customerName: string;
  phone?: string;
  validityDays: number;
  renewalDate: Date;
  status: 'active' | 'expired' | 'renewed';
  notes?: string;
  items?: SaleItem[];
  amountPaid?: number;
}

export interface Expense {
  id?: number;
  category: string;
  amount: number;
  date: Date;
  accountId: number;
  note: string;
  member?: string;
}

export interface Account {
  id?: number;
  name: string;
  balance: number;
}

export interface Provider {
  id?: number;
  name: string;
  balance: number;
  notes?: string;
}

export interface Customer {
  id?: number;
  name: string;
  phone?: string;
  email?: string;
  notes?: string;
}

export interface ProviderTransaction {
  id?: number;
  providerId: number;
  type: 'payment' | 'refund' | 'investment';
  amount: number;
  date: Date;
  note: string;
}

export interface Due {
  id?: number;
  personName: string;
  type: DueType;
  amount: number;
  date: Date;
  status: 'pending' | 'cleared';
  note?: string;
  saleId?: number;
}

export interface BusinessSettings {
  id?: number;
  businessName: string;
  email: string;
  phone: string;
  address: string;
  logoText?: string;
}
