import { useEffect, useState } from 'react';
import { Plus, Search, Package, Eye, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { dataStore } from '@/store/dataStore';
import type { StockItem, Bill } from '@/types';
import EditStockForm from "@/components/editStockForm";
import { ReceiptView } from "./ReceiptView";

export function StockManagement() {
  const [stock, setStock] = useState<StockItem[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingStock, setEditingStock] = useState<StockItem | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedStockReceipt, setSelectedStockReceipt] = useState<StockItem | null>(null);

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

  const formatCurrency = (amount: number) => {
    return `RS ${new Intl.NumberFormat('en-PK', {
      maximumFractionDigits: 2,
    }).format(amount)}`;
  };

  const filteredStock = stock.filter(item => 
    (item.itemName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.millerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.receiptNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Stock / Maal Book</h2>
          <p className="text-slate-500 text-sm">Manage your inventory and miller purchases</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-100 transition-all active:scale-95">
              <Plus className="h-4 w-4 mr-2" />
              Add New Stock
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Add New Stock Entry</DialogTitle>
              <p className="text-sm text-slate-500">Enter purchase details to update inventory and miller ledger.</p>
            </DialogHeader>
            <AddStockForm onSuccess={(newStock) => {
              setIsAddDialogOpen(false);
              loadStock();
              if (newStock) setSelectedStockReceipt(newStock);
            }} />
          </DialogContent>
        </Dialog>
      </div>

      <StatsCards stock={stock} />

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b bg-slate-50/50">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search stock, millers, or receipt #..."
              className="pl-9 bg-white border-slate-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50 border-b hover:bg-transparent">
                <TableHead className="w-[120px] font-bold text-slate-700">Date</TableHead>
                <TableHead className="font-bold text-slate-700">Receipt #</TableHead>
                <TableHead className="font-bold text-slate-700">Miller</TableHead>
                <TableHead className="font-bold text-slate-700">Item</TableHead>
                <TableHead className="text-right font-bold text-slate-700">Katte</TableHead>
                <TableHead className="text-right font-bold text-slate-700">Weight</TableHead>
                <TableHead className="text-right font-bold text-slate-700">Rate</TableHead>
                <TableHead className="text-right font-bold text-slate-700">Bhardana</TableHead>
                <TableHead className="text-right font-bold text-slate-700">Amount</TableHead>
                <TableHead className="font-bold text-slate-700">Sold To</TableHead>
                <TableHead className="text-center font-bold text-slate-700">Status</TableHead>
                <TableHead className="text-right font-bold text-slate-700 pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStock.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={12} className="h-48 text-center text-slate-500">
                    <Package className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                    <p className="font-medium">No stock entries found</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredStock
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((item) => (
                    <TableRow key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      <TableCell className="font-medium text-slate-600">{item.date}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono text-xs border-blue-200 bg-blue-50 text-blue-700">
                          {item.receiptNumber}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-bold text-slate-900">
                        <span 
                          className="cursor-pointer hover:text-blue-600 hover:underline decoration-blue-400 underline-offset-4"
                          onClick={() => (window as any).onNavigate('party-ledger', item.millerId)}
                        >
                          {item.millerName}
                        </span>
                      </TableCell>
                      <TableCell className="font-medium text-slate-700">{item.itemName}</TableCell>
                      <TableCell className="text-right">
                        <div className="font-bold text-slate-900">{item.katte}</div>
                        <div className="text-[10px] text-slate-400 font-medium uppercase">Katte</div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="font-bold text-slate-900">{item.totalWeight}</div>
                        <div className="text-[10px] text-slate-400 font-medium uppercase">kg</div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="font-bold text-slate-900">{formatCurrency(item.purchaseRate)}</div>
                        <div className="text-[10px] text-slate-400 font-medium">/{item.rateType === 'per_kg' ? 'kg' : 'katta'}</div>
                      </TableCell>
                      <TableCell className="text-right font-medium text-slate-600">
                        {formatCurrency(item.bhardana || 0)}
                      </TableCell>
                      <TableCell className="text-right font-black text-slate-900">
                        {formatCurrency(item.totalAmount)}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {bills
                            .filter((b) => b.stockId === item.id)
                            .map((b) => (
                              <Badge
                                key={b.id}
                                variant="outline"
                                className="cursor-pointer hover:bg-blue-50 text-blue-600 border-blue-200 text-[10px] py-0 px-1"
                                onClick={() => (window as any).onNavigate('party-ledger', b.buyerId)}
                              >
                                {b.buyerName}
                              </Badge>
                            ))}
                          {bills.filter((b) => b.stockId === item.id).length === 0 && (
                            <span className="text-slate-400 text-xs italic">Not sold yet</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex flex-col items-center gap-1">
                          {item.status === 'paid' ? (
                            <Badge className="bg-green-500 hover:bg-green-600 border-0 shadow-sm shadow-green-100">Paid</Badge>
                          ) : item.status === 'partial' ? (
                            <Badge variant="secondary" className="bg-amber-100 text-amber-700 border-amber-200 text-[10px] py-0 px-1 font-bold">Partial</Badge>
                          ) : (
                            <Badge variant="outline" className="text-slate-400 text-[10px] py-0 px-1 border-slate-200 font-bold">Unpaid</Badge>
                          )}
                          {item.remainingKatte === 0 && (
                            <div className="text-[9px] text-slate-400 mt-0.5 uppercase font-bold tracking-tighter">Sold Out</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <div className="flex justify-end gap-1">
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-8 w-8 text-blue-600 hover:bg-blue-50 transition-colors"
                            onClick={() => setSelectedStockReceipt(item)}
                            title="View Receipt"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-amber-600 hover:bg-amber-50"
                            onClick={() => {
                              setEditingStock(item);
                              setIsEditDialogOpen(true);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-red-600 hover:bg-red-50"
                            onClick={async () => {
                              if (confirm('Are you sure you want to delete this stock?')) {
                                await dataStore.deleteStock(item.id);
                                loadStock();
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* View Receipt Dialog */}
      <Dialog open={!!selectedStockReceipt} onOpenChange={() => setSelectedStockReceipt(null)}>
        <DialogContent className="max-w-xl overflow-y-auto max-h-[95vh] p-0 border-none shadow-2xl bg-white">
          <DialogHeader className="sr-only">
             <DialogTitle>Stock Receipt</DialogTitle>
             <p className="text-sm text-slate-500">Miller purchase receipt details.</p>
          </DialogHeader>
          <div className="p-6 bg-white rounded-xl">
             {selectedStockReceipt && <ReceiptView stock={selectedStockReceipt} />}
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Stock Dialog */}
      {editingStock && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Edit Stock Entry</DialogTitle>
              <p className="text-sm text-slate-500">Modify existing stock records carefully.</p>
            </DialogHeader>
            <EditStockForm
              stock={editingStock}
              onSuccess={() => {
                setIsEditDialogOpen(false);
                setEditingStock(null);
                loadStock();
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function StatsCards({ stock }: { stock: StockItem[] }) {
  const formatCurrency = (amount: number) => {
    return `RS ${new Intl.NumberFormat('en-PK', {
      maximumFractionDigits: 0,
    }).format(amount)}`;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <Card className="border-slate-200 shadow-sm overflow-hidden group hover:border-amber-200 transition-colors">
        <CardHeader className="pb-2 bg-slate-50/50">
          <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Inventory</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="text-3xl font-black text-slate-900 tracking-tight">
            {stock.reduce((sum, s) => sum + (s.remainingKatte || 0), 0)}
            <span className="text-sm font-bold text-slate-400 ml-2 uppercase">Katte</span>
          </div>
          <p className="text-xs text-slate-500 mt-2 font-medium">
            Across {stock.length} millers / batches
          </p>
        </CardContent>
      </Card>

      <Card className="border-slate-200 shadow-sm overflow-hidden group hover:border-blue-200 transition-colors">
        <CardHeader className="pb-2 bg-slate-50/50">
          <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-wider">Net Weight</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="text-3xl font-black text-slate-900 tracking-tight text-blue-600">
            {stock.reduce((sum, s) => sum + (s.remainingWeight || 0), 0).toLocaleString()}
            <span className="text-sm font-bold text-slate-400 ml-2 uppercase">kg</span>
          </div>
          <p className="text-xs text-slate-500 mt-2 font-medium italic">
            Ready for sale
          </p>
        </CardContent>
      </Card>

      <Card className="border-slate-200 shadow-sm overflow-hidden group hover:border-green-200 transition-colors">
        <CardHeader className="pb-2 bg-slate-50/50">
          <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-wider">Estimated Value</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="text-3xl font-black text-slate-900 tracking-tight text-green-600">
            {formatCurrency(stock.reduce((sum, s) => sum + ((s.remainingKatte || 0) * s.totalAmount / s.katte), 0))}
          </div>
          <p className="text-xs text-slate-500 mt-2 font-medium">
            Based on average purchase rates
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function AddStockForm({ onSuccess }: { onSuccess: (stock: StockItem) => void }) {
  const [parties, setParties] = useState<any[]>([]);
  const [nextReceiptHint, setNextReceiptHint] = useState<string>('');

  useEffect(() => {
    dataStore.getParties().then(setParties);
    dataStore.getStock().then(stocks => {
      const lastRcp = stocks.find(s => s.receiptNumber?.startsWith('RCP-'));
      let hint = 'RCP-0001';
      if (lastRcp) {
        const num = lastRcp.receiptNumber.match(/\d+$/);
        if (num) {
          hint = `RCP-${(parseInt(num[0]) + 1).toString().padStart(4, '0')}`;
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
      receiptNumber: formData.receiptNumber || undefined,
    } as any);

    onSuccess(newStock);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date">Date *</Label>
          <Input
            id="date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="miller">Miller *</Label>
          <Select 
            value={formData.millerId} 
            onValueChange={(value) => setFormData({ ...formData, millerId: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Miller" />
            </SelectTrigger>
            <SelectContent>
              {parties.map((party) => (
                <SelectItem key={party.id} value={party.id}>
                  {party.name} ({party.type})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="itemName">Item Name (Rice Type) *</Label>
        <Input
          id="itemName"
          placeholder="e.g., Basmati Rice, Sona Masoori"
          value={formData.itemName}
          onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="receiptNumber">Receipt No (Optional)</Label>
          <Input
            id="receiptNumber"
            placeholder={nextReceiptHint ? `Auto: ${nextReceiptHint}` : "Auto-generated"}
            value={formData.receiptNumber}
            onChange={(e) => setFormData({ ...formData, receiptNumber: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="katte">Number of Katte *</Label>
          <Input
            id="katte"
            type="number"
            min="1"
            placeholder="e.g., 100"
            value={formData.katte}
            onChange={(e) => setFormData({ ...formData, katte: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="weightPerKatta">Weight per Katta (kg) *</Label>
          <Input
            id="weightPerKatta"
            type="number"
            min="0"
            step="any"
            placeholder="e.g., 50.5"
            value={formData.weightPerKatta}
            onChange={(e) => setFormData({ ...formData, weightPerKatta: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="purchaseRate">Purchase Rate (rs) *</Label>
          <Input
            id="purchaseRate"
            type="number"
            min="0"
            step="any"
            placeholder="e.g., 40.5"
            value={formData.purchaseRate}
            onChange={(e) => setFormData({ ...formData, purchaseRate: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="bhardanaRate">Bhardana (per Katta)</Label>
          <Input
            id="bhardanaRate"
            type="number"
            min="0"
            step="any"
            placeholder="e.g., 20.5"
            value={formData.bhardanaRate}
            onChange={(e) => setFormData({ ...formData, bhardanaRate: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="rateType">Rate Type *</Label>
          <Select 
            value={formData.rateType} 
            onValueChange={(value: 'per_kg' | 'per_katta') => setFormData({ ...formData, rateType: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="per_kg">Per Kg</SelectItem>
              <SelectItem value="per_katta">Per Katta</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Preview */}
      {formData.katte && formData.weightPerKatta && formData.purchaseRate && (
        <div className="bg-amber-50 p-4 rounded-lg space-y-2 border border-amber-100">
          <p className="text-sm font-semibold text-amber-900 border-b border-amber-200 pb-1 mb-2">
            Stock Preview:
          </p>
          <div className="grid grid-cols-2 gap-y-2 text-sm text-amber-900">
            <span>Receipt Number:</span>
            <span className="text-right font-bold text-blue-700">{formData.receiptNumber || nextReceiptHint || 'Generating...'}</span>

            <span>Total Weight:</span>
            <span className="text-right font-medium">{(Number(formData.katte) * Number(formData.weightPerKatta)).toFixed(2)} kg</span>
            
            <span>Bhardana (Packaging):</span>
            <span className="text-right font-medium">
              {new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(Number(formData.katte) * (Number(formData.bhardanaRate) || 0))}
            </span>

            <span>Total Amount (to Miller):</span>
            <span className="text-right font-bold text-amber-700">
              {new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(
                (formData.rateType === 'per_kg'
                  ? Number(formData.katte) * Number(formData.weightPerKatta) * Number(formData.purchaseRate)
                  : Number(formData.katte) * Number(formData.purchaseRate)) + (Number(formData.katte) * (Number(formData.bhardanaRate) || 0))
              )}
            </span>
          </div>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="outline" className="flex-1" onClick={() => onSuccess(null as any)}>
          Cancel
        </Button>
        <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-100">
          Add Stock & View Receipt
        </Button>
      </div>
    </form>
  );
}
