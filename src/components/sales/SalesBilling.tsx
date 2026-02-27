import { useEffect, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { dataStore } from '@/store/dataStore';
import type { Bill, Party, StockItem } from '@/types';
import { CreateBillForm } from "./CreateBillForm";
import { BillsTable } from "./BillsTable";
import { BillView } from "./BillView";


// ================= SALES BILLING MAIN =================
export function SalesBilling() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [parties, setParties] = useState<Party[]>([]);
  const [stocks, setStocks] = useState<StockItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [viewBill, setViewBill] = useState<Bill | null>(null);
  const [editBill, setEditBill] = useState<Bill | null>(null);
  

  // Load buyers, stocks, bills
  useEffect(() => {
    loadData();
    const unsubscribe = dataStore.onUpdate(() => {
      console.log("Real-time update triggered for SalesBilling");
      loadData();
    });
    return () => unsubscribe();
  }, []);

  // const loadData = async () => {
  //   const [b, s] = await Promise.all([api.getParties(), api.getStocks()]);
  //   setBuyers(b);
  //   setStocks(s);
  //   loadBills();
  // };

  const loadData = async () => {
    try {
      console.log("Loading data...");
      const [partiesData, stocksData, billsData] = await Promise.all([
        dataStore.getParties(),
        dataStore.getStock(),
        dataStore.getBills(),
      ]);

      console.log("Fetched - Parties:", partiesData.length, "Stocks:", stocksData.length, "Bills:", billsData.length);
      setParties(partiesData);
      setStocks(stocksData);
      setBills(billsData);
    } catch (err) {
      console.error("Error loading data:", err);
    }
  };




  const loadBills = async () => {
    const allBills = await dataStore.getBills();
    setBills(allBills);
  };

  const handleDeleteBill = async (id: string) => {
    if (!confirm("Are you sure you want to delete this bill?")) return;

    try {
      await dataStore.deleteBill(id);
      loadBills();
      alert("Bill deleted successfully");
    } catch (err) {
      console.error(err);
      alert("Failed to delete bill");
    }
  };

  // const handleUpdateBill = async (id: string, data: any) => {
  //   try {
  //     await api.updateBill(id, data);
  //     loadBills();
  //     alert("Bill updated successfully");
  //   } catch (err) {
  //     console.error(err);
  //     alert("Failed to update bill");
  //   }
  // };


  const filteredBills = bills.filter(
    b =>
      (b.billNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.buyerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.itemName || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // const handleDeleteBill = async (id: string) => {
  //   if (!confirm('Are you sure you want to delete this bill?')) return;
  //   await api.deleteBill(id);
  //   loadBills();
  // };

  const handleWhatsAppShare = (bill: Bill) => {
    const buyer = parties.find(p => p.id === bill.buyerId);
    const phone = buyer?.phone || '';
    const message = `*INVOICE: ${bill.billNumber}*\n\n` +
      `Dear *${bill.buyerName}*,\n` +
      `Your bill for *${bill.itemName}* has been generated.\n\n` +
      `*Details:*\n` +
      `- Quantity: ${bill.katte} Katte\n` +
      `- Total Amount: ${new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(bill.totalAmount)}\n\n` +
      `Thank you for your business!`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Sales & Billing</h2>
          <p className="text-slate-500 mt-1">Create and manage sales bills</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-amber-500 hover:bg-amber-600 text-white">
              <Plus className="h-4 w-4 mr-2" /> Create Bill
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Bill</DialogTitle>
            </DialogHeader>
            <CreateBillForm
              parties={parties}
              stocks={stocks}
              onSuccess={bill => {
                setIsAddDialogOpen(false);
                loadData();
                setViewBill(bill);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="all">All Bills</TabsTrigger>
          <TabsTrigger value="today">Today's Bills</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by bill number, buyer, or item..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <BillsTable
            bills={filteredBills}
            onView={setViewBill}
            onEdit={setEditBill}
            onDelete={handleDeleteBill}
            onWhatsApp={handleWhatsAppShare}
          />
        </TabsContent>

        <TabsContent value="today" className="space-y-4">
          <BillsTable
            bills={bills.filter(b => b.date === new Date().toISOString().split('T')[0])}
            onView={setViewBill}
            onEdit={setEditBill}
            onDelete={handleDeleteBill}
            onWhatsApp={handleWhatsAppShare}
          />
        </TabsContent>
      </Tabs>

      <Dialog open={!!viewBill} onOpenChange={() => setViewBill(null)}>
        <DialogContent className="w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Bill Details</DialogTitle>
          </DialogHeader>
          {viewBill && <BillView bill={viewBill} />}
        </DialogContent>
      </Dialog>

      <Dialog open={!!editBill} onOpenChange={() => setEditBill(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Bill</DialogTitle>
          </DialogHeader>
          {editBill && (
            <EditBillForm
              bill={editBill}
              parties={parties}
              stocks={stocks}
              onSuccess={() => {
                loadBills();
                setEditBill(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ================= EDIT BILL FORM =================
function EditBillForm({
  bill,
  parties,
  stocks,
  onSuccess,
}: {
  bill: Bill;
  parties: Party[];
  stocks: StockItem[];
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    date: bill.date,
    buyerId: bill.buyerId,
    stockId: bill.stockId,
    katte: bill.katte.toString(),
    rate: bill.rate.toString(),
    bhardanaRate: (bill.bhardanaRate || 0).toString(),
    rateType: bill.rateType,
  });

  const selectedStock = stocks.find(s => s.id === formData.stockId);
  const enteredKatte = Number(formData.katte) || 0;
  const maxAllowedKatte = selectedStock?.remainingKatte ?? 0;
  const isKatteInvalid = enteredKatte <= 0 || enteredKatte > maxAllowedKatte;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStock || isKatteInvalid) return;

    const katte = Number(formData.katte);
    const totalWeight = katte * selectedStock.weightPerKatta;
    const rate = Number(formData.rate);
    const bhardanaRate = Number(formData.bhardanaRate) || 0;
    const bhardana = katte * bhardanaRate;
    
    const rawAmount = formData.rateType === 'per_kg' ? totalWeight * rate : katte * rate;
    const totalAmount = rawAmount + bhardana;
    
    const costPerKg = selectedStock.totalAmount / selectedStock.totalWeight;
    const purchaseCost = totalWeight * costPerKg;
    const profit = totalAmount - purchaseCost;

    try {
      await dataStore.updateBill(bill.id, {
        date: formData.date,
        buyerId: formData.buyerId,
        stockId: formData.stockId,
        katte,
        weight: totalWeight,
        rate,
        bhardanaRate,
        bhardana,
        rateType: formData.rateType as any,
        totalAmount,
        purchaseCost,
        profit
      });
      onSuccess();
    } catch (err) {
      console.error(err);
      alert("Failed to update bill");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input
          type="date"
          value={formData.date}
          onChange={e => setFormData({ ...formData, date: e.target.value })}
        />
        <Select 
          value={formData.buyerId}
          onValueChange={value => setFormData({ ...formData, buyerId: value })}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select buyer" />
          </SelectTrigger>
          <SelectContent>
            {parties.map(b => <SelectItem key={b.id} value={b.id}>{b.name} ({b.type})</SelectItem>)}
          </SelectContent>
        </Select>
        <Select 
          value={formData.stockId}
          onValueChange={value => setFormData({ ...formData, stockId: value })}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select stock" />
          </SelectTrigger>
          <SelectContent>
            {stocks.map(s => <SelectItem key={s.id} value={s.id}>{s.itemName}</SelectItem>)}
          </SelectContent>
        </Select>
        <Input
          type="number"
          placeholder="Katte"
          value={formData.katte}
          onChange={e => setFormData({ ...formData, katte: e.target.value })}
        />
        <Input
          type="number"
          placeholder="Rate"
          value={formData.rate}
          onChange={e => setFormData({ ...formData, rate: e.target.value })}
        />
        <div className="flex flex-col gap-1">
          <Label className="text-[10px] text-slate-500 ml-1">Bhardana (Packaging)</Label>
          <Input
            type="number"
            placeholder="Bhardana Rate"
            value={formData.bhardanaRate}
            onChange={e => setFormData({ ...formData, bhardanaRate: e.target.value })}
          />
        </div>
        <Select
          value={formData.rateType}
          onValueChange={value => setFormData({ ...formData, rateType: value as 'per_kg' | 'per_katta' })}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select rate type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="per_kg">Per Kg</SelectItem>
            <SelectItem value="per_katta">Per Katta</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" className="bg-amber-500 hover:bg-amber-600 text-white w-full" disabled={isKatteInvalid}>
        Save Changes
      </Button>
    </form>
  );
}

