import { useEffect, useState } from 'react';
import { Plus, Search, Package, TrendingUp, Wallet, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { dataStore } from '@/store/dataStore';
import type { StockItem, Bill } from '@/types';
import EditStockForm from "@/components/editStockForm";
import { ReceiptView } from "./ReceiptView";
import { DirectPaymentDialog } from "@/components/DirectPaymentDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StockTable } from './StockTable';

export function StockManagement() {
  const [stock, setStock] = useState<StockItem[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingStockId, setEditingStockId] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedStockReceiptId, setSelectedStockReceiptId] = useState<string | null>(null);
  const [paymentStockId, setPaymentStockId] = useState<string | null>(null);

  const editingStock = stock.find(s => s.id === editingStockId) || null;
  const selectedStockReceipt = stock.find(s => s.id === selectedStockReceiptId) || null;
  const paymentStock = stock.find(s => s.id === paymentStockId) || null;

  useEffect(() => {
    loadStock();
    loadBills();

    // Auto-reload on global data changes
    const unsubscribe = dataStore.onUpdate(() => {
      console.log("Real-time update triggered for StockManagement");
      loadStock();
      loadBills();
    });

    return () => unsubscribe();
  }, []);

  const loadStock = async () => {
    const data = await dataStore.getStock();
    setStock(data);
  };

  const loadBills = async () => {
    const data = await dataStore.getBills();
    setBills(data);
  };

  const filteredStock = stock.filter(item => 
    (item.itemName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.millerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.receiptNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Stock Management</h2>
          <p className="text-slate-500 text-sm mt-1">Manage warehouse inventory and miller purchases.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-amber-600 hover:bg-amber-700 text-white font-bold h-10 px-6 rounded-lg shadow-sm transition-all flex items-center gap-2">
                <Plus className="h-4 w-4" />
                <span className="uppercase tracking-wider text-xs">Add Inventory</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto rounded-xl border-none shadow-2xl p-0">
              <div className="bg-slate-900 p-6 text-white">
                <DialogTitle className="text-lg font-bold tracking-tight uppercase">New Purchase Entry</DialogTitle>
                <p className="text-slate-400 text-xs mt-1">Record new stock arrivals from millers.</p>
              </div>
              <div className="p-6">
                <AddStockForm onSuccess={(stockItem: StockItem) => {
                  setIsAddDialogOpen(false);
                  loadStock();
                  if (stockItem) setSelectedStockReceiptId(stockItem.id);
                }} />
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <StatsCards stock={stock} />

      {/* Filter & View Controls */}
      <div className="space-y-4">
        <Tabs 
          defaultValue={localStorage.getItem('stock_tab') || "all"} 
          onValueChange={(val) => localStorage.setItem('stock_tab', val)} 
          className="w-full"
        >
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-2">
            <TabsList className="bg-slate-100 p-1 rounded-lg h-auto">
              <TabsTrigger value="all" className="rounded-md px-6 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm font-bold text-xs uppercase tracking-wider">Comprehensive View</TabsTrigger>
              <TabsTrigger value="available" className="rounded-md px-6 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm font-bold text-xs uppercase tracking-wider text-amber-600">In-Stock Only</TabsTrigger>
            </TabsList>
            
            <div className="relative w-full lg:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                placeholder="Search..."
                className="w-full pl-10 pr-4 h-10 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="bg-white rounded-xl mt-6 border border-slate-200 shadow-sm overflow-hidden">
            <TabsContent value="all" className="m-0">
               <StockTable 
                  stock={filteredStock}
                  bills={bills}
                  onView={setSelectedStockReceiptId}
                  onEdit={(id) => {
                      setEditingStockId(id);
                      setIsEditDialogOpen(true);
                  }}
                  onDelete={async (id) => {
                      if (confirm('Are you sure you want to delete this stock?')) {
                          await dataStore.deleteStock(id);
                          loadStock();
                      }
                  }}
                  onPayment={setPaymentStockId}
                  onNavigateParty={(id) => (window as any).onNavigate('party-ledger', id)}
               />
            </TabsContent>
            
            <TabsContent value="available" className="m-0">
               <StockTable 
                  stock={filteredStock.filter(s => s.remainingKatte > 0)}
                  bills={bills}
                  onView={setSelectedStockReceiptId}
                  onEdit={(id) => {
                      setEditingStockId(id);
                      setIsEditDialogOpen(true);
                  }}
                  onDelete={async (id) => {
                      if (confirm('Are you sure you want to delete this stock?')) {
                          await dataStore.deleteStock(id);
                          loadStock();
                      }
                  }}
                  onPayment={setPaymentStockId}
                  onNavigateParty={(id) => (window as any).onNavigate('party-ledger', id)}
               />
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* View Receipt Dialog */}
      <Dialog open={!!selectedStockReceiptId} onOpenChange={(open) => !open && setSelectedStockReceiptId(null)}>
        <DialogContent className="max-w-xl overflow-y-auto max-h-[95vh] p-0 border-none shadow-2xl bg-white rounded-2xl">
          <DialogHeader className="sr-only">
             <DialogTitle>Stock Receipt</DialogTitle>
             <DialogDescription>Miller purchase receipt details.</DialogDescription>
          </DialogHeader>
          <div className="p-6 bg-white rounded-2xl">
             {selectedStockReceipt && <ReceiptView stock={selectedStockReceipt} />}
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Stock Dialog */}
      {editingStock && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl border-none shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black text-slate-900">Edit Inventory Record</DialogTitle>
              <DialogDescription className="text-sm font-medium text-slate-500 italic">
                Adjust stock details with extreme caution.
              </DialogDescription>
            </DialogHeader>
            <EditStockForm
              stock={editingStock}
              onSuccess={() => {
                setIsEditDialogOpen(false);
                setEditingStockId(null);
                loadStock();
              }}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Payment Dialog */}
      <DirectPaymentDialog
        open={!!paymentStockId}
        onOpenChange={(open) => !open && setPaymentStockId(null)}
        type="pay"
        item={paymentStock}
        partyId={paymentStock?.millerId || ''}
        partyName={paymentStock?.millerName || ''}
        onSuccess={() => {
          loadStock();
          loadBills();
        }}
      />
    </div>
  );
}

function StatsCards({ stock }: { stock: StockItem[] }) {
  const formatCurrency = (amount: number) => {
    return `RS ${new Intl.NumberFormat('en-PK', {
      maximumFractionDigits: 0,
    }).format(amount)}`;
  };

  const totalKatte = stock.reduce((sum, s) => sum + (s.katte || 0), 0);
  const remainingKatte = stock.reduce((sum, s) => sum + (s.remainingKatte || 0), 0);
  const totalPurchases = stock.reduce((sum, s) => sum + (s.totalAmount || 0), 0);
  const totalPaid = stock.reduce((sum, s) => sum + (s.paidAmount || 0), 0);
  const totalBalance = totalPurchases - totalPaid;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
            <Package className="h-5 w-5" />
          </div>
          <span className="text-[10px] font-extrabold text-slate-600 uppercase tracking-wider">Remaining Stock</span>
        </div>
        <div className="space-y-1">
          <h4 className="text-2xl font-bold text-slate-950 tabular-nums">{remainingKatte} <span className="text-xs font-bold text-slate-500">KT</span></h4>
          <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest pl-1">Total Pool: {totalKatte} KT</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
            <TrendingUp className="h-5 w-5" />
          </div>
          <span className="text-[10px] font-extrabold text-slate-600 uppercase tracking-wider">Weight Total</span>
        </div>
        <div className="space-y-1">
          <h4 className="text-2xl font-bold text-blue-600 tabular-nums">
            {stock.reduce((sum, s) => sum + (s.remainingWeight || 0), 0).toLocaleString()}
            <span className="text-xs ml-1 text-slate-400 font-bold uppercase">KG</span>
          </h4>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
            <Wallet className="h-5 w-5" />
          </div>
          <span className="text-[10px] font-extrabold text-slate-600 uppercase tracking-wider">Paid Amount</span>
        </div>
        <div className="space-y-1">
          <h4 className="text-2xl font-bold text-emerald-600 tabular-nums">{formatCurrency(totalPaid)}</h4>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 rounded-lg bg-rose-50 text-rose-600">
            <ArrowUpRight className="h-5 w-5" />
          </div>
          <span className="text-[10px] font-extrabold text-slate-600 uppercase tracking-wider">Outstanding</span>
        </div>
        <div className="space-y-1">
          <h4 className="text-2xl font-bold text-rose-600 tabular-nums">{formatCurrency(totalBalance)}</h4>
        </div>
      </div>
    </div>
  );
}

function AddStockForm({ onSuccess }: { onSuccess: (stock: StockItem) => void }) {
  const [parties, setParties] = useState<any[]>([]);
  const [nextReceiptHint, setNextReceiptHint] = useState<string>('');

  const formatCurrency = (amount: number) => {
    return `RS ${new Intl.NumberFormat('en-PK', { maximumFractionDigits: 0 }).format(amount)}`;
  };

  useEffect(() => {
    dataStore.getParties().then(setParties);
    dataStore.getStock().then(stocks => {
      const lastRcp = stocks.find(s => s.receiptNumber?.startsWith('S-'));
      let hint = 'S-101';
      if (lastRcp) {
        const num = lastRcp.receiptNumber.match(/\d+$/);
        if (num) {
          hint = `S-${(parseInt(num[0]) + 1)}`;
        }
      }
      setNextReceiptHint(hint);
      // Auto-fill if empty
      setFormData(prev => ({ ...prev, receiptNumber: prev.receiptNumber || hint }));
    });
  }, []);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    millerId: '',
    itemName: '',
    katte: '',
    weightPerKatta: '',
    purchaseRate: '',
    bhardanaRate: '',
    rateType: 'per_kg' as 'per_kg' | 'per_katta',
    receiptNumber: '',
    paymentType: 'cash' as 'cash' | 'credit',
    dueDays: '0',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const miller = parties.find(m => m.id === formData.millerId);
    if (!miller) return;

    const katte = Number(formData.katte);
    const weightPerKatta = Number(formData.weightPerKatta);
    const purchaseRate = Number(formData.purchaseRate);
    const totalWeight = katte * weightPerKatta;
    
    const totalAmount = formData.rateType === 'per_kg' 
      ? totalWeight * purchaseRate 
      : katte * purchaseRate;

    const days = formData.paymentType === 'credit' ? Number(formData.dueDays) : 3;
    const dueDate = new Date(new Date(formData.date).getTime() + days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const newStock = await dataStore.addStock({
      date: formData.date,
      millerId: miller.id,
      millerName: miller.name,
      itemName: formData.itemName,
      katte,
      weightPerKatta,
      totalWeight,
      purchaseRate,
      rateType: formData.rateType,
      totalAmount,
      bhardanaRate: Number(formData.bhardanaRate) || 0,
      bhardana: katte * (Number(formData.bhardanaRate) || 0),
      receiptNumber: formData.receiptNumber || nextReceiptHint || undefined,
      paymentType: formData.paymentType,
      dueDays: days,
      dueDate,
    } as any);

    onSuccess(newStock);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pt-4">
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="date" className="text-xs font-extrabold uppercase text-slate-700 ml-1">Arrival Date</Label>
          <Input
            id="date"
            type="date"
            className="h-12 rounded-xl bg-slate-50 border-slate-300 focus:ring-amber-500/20 focus:border-amber-500 font-bold text-slate-900"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="miller" className="text-xs font-extrabold uppercase text-slate-700 ml-1">Miller / Party</Label>
          <Select 
            value={formData.millerId} 
            onValueChange={(value) => setFormData({ ...formData, millerId: value })}
          >
            <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-slate-300 focus:ring-amber-500/20 focus:border-amber-500 font-bold text-slate-900">
              <SelectValue placeholder="Select Miller source" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-slate-200 shadow-2xl">
              {parties.map((party) => (
                <SelectItem key={party.id} value={party.id} className="rounded-xl my-1 focus:bg-amber-50 focus:text-amber-700">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{party.name}</span>
                      <span className={cn(
                        "text-[8px] px-1.5 py-0.5 rounded-full font-black uppercase tracking-tighter",
                        party.type === 'Miller' ? "bg-blue-100 text-blue-700" : "bg-emerald-100 text-emerald-700"
                      )}>
                        {party.type}
                      </span>
                    </div>
                    <span className="text-[10px] opacity-60 uppercase">{party.address || 'Standard Party'}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="itemName" className="text-xs font-black uppercase text-slate-500 ml-1">Item Name</Label>
        <Input
          id="itemName"
          placeholder="e.g., Basmati 1121 Sella, Super Kernel"
          className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:ring-amber-500/20 focus:border-amber-500 font-bold"
          value={formData.itemName}
          onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="receiptNumber" className="text-xs font-black uppercase text-slate-500 ml-1">Receipt Number</Label>
          <Input
            id="receiptNumber"
            placeholder={nextReceiptHint ? `Suggested: ${nextReceiptHint}` : "Internal Ref"}
            className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:ring-amber-500/20 focus:border-amber-500 font-bold placeholder:text-slate-300"
            value={formData.receiptNumber}
            onChange={(e) => setFormData({ ...formData, receiptNumber: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="katte" className="text-xs font-black uppercase text-slate-500 ml-1">Total Katte</Label>
          <Input
            id="katte"
            type="number"
            min="1"
            placeholder="0"
            className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:ring-amber-500/20 focus:border-amber-500 font-bold"
            value={formData.katte}
            onChange={(e) => setFormData({ ...formData, katte: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="weightPerKatta" className="text-xs font-black uppercase text-slate-500 ml-1">Weight Per Katta (kg)</Label>
          <Input
            id="weightPerKatta"
            type="number"
            min="0"
            step="any"
            placeholder="50.0"
            className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:ring-amber-500/20 focus:border-amber-500 font-bold"
            value={formData.weightPerKatta}
            onChange={(e) => setFormData({ ...formData, weightPerKatta: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="purchaseRate" className="text-xs font-black uppercase text-slate-500 ml-1">Purchase Rate</Label>
          <Input
            id="purchaseRate"
            type="number"
            min="0"
            step="any"
            placeholder="0.00"
            className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:ring-amber-500/20 focus:border-amber-500 font-bold text-amber-600"
            value={formData.purchaseRate}
            onChange={(e) => setFormData({ ...formData, purchaseRate: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="bhardanaRate" className="text-xs font-black uppercase text-slate-500 ml-1">Bhardana Rate</Label>
          <Input
            id="bhardanaRate"
            type="number"
            min="0"
            step="any"
            placeholder="Optional"
            className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:ring-amber-500/20 focus:border-amber-500 font-bold"
            value={formData.bhardanaRate}
            onChange={(e) => setFormData({ ...formData, bhardanaRate: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="rateType" className="text-xs font-black uppercase text-slate-500 ml-1">Rate Type</Label>
          <Select 
            value={formData.rateType} 
            onValueChange={(value: 'per_kg' | 'per_katta') => setFormData({ ...formData, rateType: value })}
          >
            <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:ring-amber-500/20 focus:border-amber-500 font-bold">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-2xl">
              <SelectItem value="per_kg" className="rounded-xl my-1">Calculate Per KG</SelectItem>
              <SelectItem value="per_katta" className="rounded-xl my-1">Calculate Per Katta</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 p-4 bg-slate-100/50 rounded-2xl border border-slate-200/50 shadow-inner">
        <div className="space-y-2">
          <Label htmlFor="paymentType" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Payment Type</Label>
          <Select 
            value={formData.paymentType} 
            onValueChange={(value: 'cash' | 'credit') => setFormData({ ...formData, paymentType: value })}
          >
            <SelectTrigger className="h-12 rounded-xl bg-white border-slate-200 focus:ring-amber-500/20 focus:border-amber-500 font-bold">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-2xl shadow-2xl border-none">
              <SelectItem value="cash" className="rounded-xl my-1">Immediate Cash</SelectItem>
              <SelectItem value="credit" className="rounded-xl my-1">Credit (Udhar)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {formData.paymentType === 'credit' && (
          <div className="space-y-2 animate-in fade-in slide-in-from-left-2 duration-300">
            <Label htmlFor="dueDays" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Credit Days</Label>
            <Input
              id="dueDays"
              type="number"
              min="0"
              placeholder="e.g. 15"
              className="h-12 rounded-xl bg-white border-slate-200 focus:ring-amber-500/20 focus:border-amber-500 font-bold"
              value={formData.dueDays}
              onChange={(e) => setFormData({ ...formData, dueDays: e.target.value })}
            />
          </div>
        )}
      </div>

      {/* Summary Preview */}
      <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-2 w-2 rounded-full bg-amber-500" />
            <h5 className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Transaction Summary</h5>
          </div>
          
          <div className="grid grid-cols-2 gap-y-4 text-sm">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Tonnage</span>
              <span className="text-lg font-bold text-slate-900 tabular-nums">{(Number(formData.katte) * Number(formData.weightPerKatta)).toFixed(2)} KG</span>
            </div>
            
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Bhardana Total</span>
              <span className="text-lg font-bold text-slate-900 tabular-nums">
                {formatCurrency(Number(formData.katte) * (Number(formData.bhardanaRate) || 0))}
              </span>
            </div>

            <div className="col-span-2 pt-4 border-t border-slate-200 mt-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Net Payable:</span>
                </div>
                <span className="text-3xl font-bold text-slate-900 tabular-nums">
                  {formatCurrency(
                    (formData.rateType === 'per_kg'
                      ? Number(formData.katte) * Number(formData.weightPerKatta) * Number(formData.purchaseRate)
                      : Number(formData.katte) * Number(formData.purchaseRate)) + (Number(formData.katte) * (Number(formData.bhardanaRate) || 0))
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-4 pt-4">
        <Button type="button" variant="ghost" className="h-14 flex-1 rounded-2xl font-bold text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all uppercase tracking-widest text-[10px]" onClick={() => onSuccess(null as any)}>
          Dismiss
        </Button>
        <Button type="submit" className="h-14 flex-[2] gold-gradient hover:opacity-90 text-white font-black rounded-2xl shadow-lg transition-all active:scale-95 uppercase tracking-widest text-xs">
          Confirm & Print Receipt
        </Button>
      </div>
    </form>
  );
}
