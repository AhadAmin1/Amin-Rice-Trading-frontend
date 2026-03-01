import type {
  Party,
  StockItem,
  Bill,
  CashEntry,
  LedgerEntry,
  ProfitEntry,
  DashboardSummary
} from '@/types';

const API_URL = import.meta.env.VITE_API_URL || 'https://amin-rice-trading-backend.vercel.app/api';


const fetchJson = async (url: string, options?: RequestInit) => {
  const fullUrl = `${API_URL}${url}`;
  console.log(`Fetching: ${fullUrl}`);
  
  // Set global loading state
  dataStore.setLoading(true);

  try {
    const res = await fetch(fullUrl, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        ...options?.headers,
      },
    });
    if (!res.ok) {
      const errorText = await res.text();
      console.error(`API Error ${res.status} for ${fullUrl}:`, errorText);
      throw new Error(`API Error: ${res.status} ${res.statusText} - ${errorText}`);
    }
    return res.json();
  } catch (err) {
    console.error(`Fetch error for ${fullUrl}:`, err);
    throw err;
  } finally {
    // Unset global loading state
    dataStore.setLoading(false);
  }
};

const mapId = (item: any): any => {
  if (!item) return item;
  if (Array.isArray(item)) return item.map(mapId);
  if (typeof item === 'object' && item._id) {
    const { _id, ...rest } = item;
    return { ...rest, id: _id };
  }
  return item;
};

class DataStore {
  private activeRequests = 0;
  private listeners: ((loading: boolean) => void)[] = [];
  private updateListeners: (() => void)[] = [];
  private overdueItems: any[] = [];
  private notificationListeners: ((items: any[]) => void)[] = [];

  subscribe(listener: (loading: boolean) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  onUpdate(listener: () => void) {
    this.updateListeners.push(listener);
    return () => {
      this.updateListeners = this.updateListeners.filter(l => l !== listener);
    };
  }

  onNotifications(listener: (items: any[]) => void) {
    this.notificationListeners.push(listener);
    return () => {
      this.notificationListeners = this.notificationListeners.filter(l => l !== listener);
    };
  }

  setOverdueItems(items: any[]) {
    this.overdueItems = items;
    this.notificationListeners.forEach(l => l(items));
  }

  getOverdueItems() {
    return this.overdueItems;
  }

  private updateTimer: any = null;
  private notifyUpdate() {
    if (this.updateTimer) clearTimeout(this.updateTimer);
    this.updateTimer = setTimeout(() => {
      console.log("Global data update notification triggered");
      this.updateListeners.forEach(l => l());
      this.updateTimer = null;
    }, 100);
  }

  setLoading(loading: boolean) {
    if (loading) {
      this.activeRequests++;
    } else {
      this.activeRequests = Math.max(0, this.activeRequests - 1);
    }
    
    const isGlobalLoading = this.activeRequests > 0;
    this.listeners.forEach(l => l(isGlobalLoading));
  }

  getLoading() {
    return this.activeRequests > 0;
  }
  // Parties
  async getParties(): Promise<Party[]> {
    const data = await fetchJson('/parties');
    return mapId(data);
  }

  async getMillers(): Promise<Party[]> {
    const parties = await this.getParties();
    return Array.isArray(parties) ? parties.filter(p => p.type?.toLowerCase() === 'miller') : [];
  }

  async getBuyers(): Promise<Party[]> {
    const parties = await this.getParties();
    return Array.isArray(parties) ? parties.filter(p => p.type?.toLowerCase() === 'buyer') : [];
  }

  async addParty(party: Omit<Party, 'id' | 'createdAt'>): Promise<Party> {
    const data = await fetchJson('/parties', {
      method: 'POST',
      body: JSON.stringify(party),
    });
    this.notifyUpdate();
    return mapId(data);
  }

  async updateParty(id: string, data: Partial<Party>): Promise<Party> {
    const res = await fetchJson(`/parties/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    this.notifyUpdate();
    return mapId(res);
  }

  async deleteParty(id: string): Promise<void> {
    await fetchJson(`/parties/${id}`, { method: 'DELETE' });
    this.notifyUpdate();
  }

  async getNextBillNumber(): Promise<string> {
    const data = await fetchJson('/bills/next-number');
    return data.nextNumber;
  }

  // Stock
  async getStock(): Promise<StockItem[]> {
    const data = await fetchJson('/stock');
    return mapId(data);
  }

  async getAvailableStock(): Promise<StockItem[]> {
    const stock = await this.getStock();
    return stock.filter(s => s.remainingKatte > 0);
  }

  async addStock(stock: Omit<StockItem, 'id' | 'remainingKatte' | 'remainingWeight' | 'createdAt'>): Promise<StockItem> {
    const data = await fetchJson('/stock', {
      method: 'POST',
      body: JSON.stringify(stock),
    });
    this.notifyUpdate();
    return mapId(data);
  }

  async updateStock(id: string, data: any): Promise<StockItem> {
    const res = await fetchJson(`/stock/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    this.notifyUpdate();
    return mapId(res);
  }

  async deleteStock(id: string): Promise<void> {
    await fetchJson(`/stock/${id}`, { method: 'DELETE' });
    this.notifyUpdate();
  }

  // Bills
  async getBills(): Promise<Bill[]> {
    const data = await fetchJson('/bills');
    return mapId(data);
  }

  async addBill(bill: Omit<Bill, 'id' | 'billNumber' | 'createdAt'>): Promise<Bill> {
    // The backend now handles stock reduction, ledger updates, etc.
    const data = await fetchJson('/bills', {
      method: 'POST',
      body: JSON.stringify(bill),
    });
    this.notifyUpdate();
    return mapId(data.bill); 
  }

  async updateBill(id: string, data: Partial<Bill>): Promise<Bill> {
    const res = await fetchJson(`/bills/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    this.notifyUpdate();
    return mapId(res);
  }

  async deleteBill(id: string): Promise<void> {
    await fetchJson(`/bills/${id}`, { method: 'DELETE' });
    this.notifyUpdate();
  }

  // Cash Book
  async getCashEntries(): Promise<CashEntry[]> {
    const data = await fetchJson('/cash');
    return mapId(data);
  }

  async addCashEntry(entry: Omit<CashEntry, 'id' | 'balance' | 'createdAt'> & { billId?: string }): Promise<CashEntry> {
    const data = await fetchJson('/cash', {
      method: 'POST',
      body: JSON.stringify(entry),
    });
    this.notifyUpdate();
    return mapId(data);
  }

  async updateCashEntry(id: string, data: Partial<CashEntry>): Promise<CashEntry> {
    const res = await fetchJson(`/cash/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    this.notifyUpdate();
    return mapId(res.entry);
  }

  async deleteCashEntry(id: string): Promise<void> {
    await fetchJson(`/cash/${id}`, { method: 'DELETE' });
    this.notifyUpdate();
  }

  // Ledger
  async getLedgerEntries(): Promise<LedgerEntry[]> {
    // We don't have a 'get ALL ledger entries' endpoint currently exposed?
    // We have getLedgerByParty.
    // Ideally we should add GET /ledger to backend?
    // But usually we view ledger by party.
    // If we need ALL, we need to add the endpoint.
    // For now, let's assume getPartyLedger is the main usage.
    // And if `LedgerSystem` needs all, we might need to change it.
    // Let's implement getPartyLedger.
    // But `LedgerSystem.tsx` displays a list of parties with their balances first.
    // That suggests we need `getDashboardStats` or similar?
    // Or fetch all parties?
    // Let's check `LedgerSystem` logic later.
    // For now, I'll add `getLedgerByParty`.
    return []; // Placeholder if needed
  }

  async getPartyLedger(partyId: string): Promise<LedgerEntry[]> {
    const data = await fetchJson(`/ledger/${partyId}`);
    return mapId(data);
  }

  async getStockLedger(stockId: string): Promise<LedgerEntry[]> {
    const data = await fetchJson(`/ledger/stock/${stockId}`);
    return mapId(data);
  }

  async getBillLedger(billId: string): Promise<LedgerEntry[]> {
    const data = await fetchJson(`/ledger/bill/${billId}`);
    return mapId(data);
  }

  async addLedgerEntry(entry: any): Promise<LedgerEntry> {
    const data = await fetchJson('/ledger', {
      method: 'POST',
      body: JSON.stringify(entry)
    });
    this.notifyUpdate();
    return mapId(data);
  }

  async updateLedgerEntry(id: string, data: any): Promise<LedgerEntry> {
    const res = await fetchJson(`/ledger/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    this.notifyUpdate();
    return mapId(res);
  }

  async deleteLedgerEntry(id: string): Promise<void> {
    await fetchJson(`/ledger/${id}`, { method: 'DELETE' });
    this.notifyUpdate();
  }

  // Pay Miller / Receive from Buyer (These are wrappers around addCash/addLedger)
  // Since backend doesn't have dedicated endpoints for these composite actions (yet),
  // we can orchestrate them here?
  // OR just call `addLedgerEntry` and `addCashEntry` sequentially?
  // Risk of inconsistency.
  // Ideally backend should handle "Payment".
  // But given constraints, I'll implement them as client-side orchestration for now, 
  // or better: Use `addLedgerEntry` (which modifies ledger) and `addCashEntry` (which modifies cash).
  
  async payMiller(amount: number, date: string, description: string, receiptNo?: string): Promise<void> {
      // Logic: Only add to Cash Book. Backend "Smart Linking" handles the Ledger.
      const stockMatch = description.match(/#?(S-?\d+)/i);
      const linkRef = receiptNo || (stockMatch ? (stockMatch[1].toUpperCase().startsWith('S-') ? stockMatch[1].toUpperCase() : `S-${stockMatch[1].toUpperCase().replace('S', '')}`) : null);
      await this.addCashEntry({
          date,
          type: 'out',
          description: `${description} ${linkRef ? `#${linkRef}` : ''}`.trim(),
          debit: amount,
          credit: 0,
      });
  }

  async receiveFromBuyer(amount: number, date: string, description: string, billNo?: string): Promise<void> {
      const linkRef = billNo || (description.match(/#?(B-\d+)/i)?.[1]);
      await this.addCashEntry({
          date,
          type: 'in',
          description: `${description} ${linkRef ? `#${linkRef}` : ''}`.trim(),
          debit: 0,
          credit: amount
      });
  }

  async getPartyBalances(): Promise<Record<string, number>> {
      const data = await fetchJson('/ledger/balances');
      // data is array of { _id, lastBalance }
      const map: Record<string, number> = {};
      data.forEach((item: any) => {
          map[item._id] = item.lastBalance;
      });
      return map;
  }

  // Profit
  async getProfitEntries(): Promise<ProfitEntry[]> {
    const data = await fetchJson('/profit');
    return mapId(data);
  }

  // Dashboard Summary
  async getDashboardSummary(): Promise<DashboardSummary> {
    const data = await fetchJson('/ledger/summary');
    return data;
  }
}

export const dataStore = new DataStore();
