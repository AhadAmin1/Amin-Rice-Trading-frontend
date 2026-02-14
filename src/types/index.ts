// Rice Trading Accounting System - Types

export type PartyType = 'Miller' | 'Buyer';

export interface Party {
  id: string;
  name: string;
  type: PartyType;
  phone?: string;
  address?: string;
  createdAt: string;
}

export type Buyer = Party;
export type Miller = Party;

export interface StockItem {
  id: string;
  date: string;
  millerId: string;
  millerName: string;
  itemName: string;
  katte: number;
  weightPerKatta: number;
  totalWeight: number;
  purchaseRate: number;
  rateType: 'per_kg' | 'per_katta';
  totalAmount: number;
  remainingKatte: number;
  remainingWeight: number;
  createdAt: string;
}

export interface Bill {
  millerId: string;
  millerName: string; // Added to match backend
  id: string;
  billNumber: string;
  date: string;
  buyerId: string;
  buyerName: string;
  itemName: string;
  stockId: string;
  katte: number;
  weightPerKatta: number;
  weight: number;
  rate: number;
  rateType: 'per_kg' | 'per_katta';
  totalAmount: number;
  purchaseCost: number;
  profit: number;
  createdAt: string;
}

export interface CashEntry {
  id: string;
  date: string;
  description: string;
  billReference?: string;
  debit: number;
  credit: number;
  balance: number;
  createdAt: string;
}

export interface LedgerEntry {
  id: string;
  date: string;
  partyId: string;
  partyName: string;
  partyType: PartyType;
  particulars: string;
  billNo?: string;
  katte?: number;
  weight?: number;
  rate?: number;
  debit: number;
  credit: number;
  balance: number;
  createdAt: string;
}

export interface ProfitEntry {
  id: string;
  billId: string;
  billNumber: string;
  date: string;
  buyerId: string;
  buyerName: string;
  itemName: string;
  katte: number;
  totalWeight: number;
  sellingAmount: number;
  purchaseCost: number;
  profit: number;
  createdAt: string;
}

export type ViewType = 
  | 'dashboard' 
  | 'stock' 
  | 'sales' 
  | 'cashbook' 
  | 'ledger' 
  | 'profit' 
  | 'party-ledger';

export interface DashboardSummary {
  totalStockKatte: number;
  totalStockWeight: number;
  cashBalance: number;
  totalReceivable: number;
  totalPayable: number;
  totalProfit: number;
}
