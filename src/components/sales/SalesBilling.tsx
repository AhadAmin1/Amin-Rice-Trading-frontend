import { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Plus, 
  Receipt, 
  TrendingUp, 
  ChevronRight, 
  Search,
  LayoutDashboard
} from 'lucide-react';
import { dataStore } from '@/store/dataStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import type { Bill, Party, StockItem } from '@/types';
import { BillsTable } from './BillsTable';
import { CreateBillForm } from './CreateBillForm';
import { BillView } from './BillView';
import { PaymentForm } from '../ledger/LedgerSystem';
import { cn } from '@/lib/utils';

export default function SalesBilling() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [parties, setParties] = useState<Party[]>([]);
  const [stocks, setStocks] = useState<StockItem[]>([]);

  // Modal States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editBill, setEditBill] = useState<Bill | null>(null);
  const [viewBill, setViewBill] = useState<Bill | null>(null);
  const [showPayment, setShowPayment] = useState<Bill | null>(null);

  const loadData = async () => {
    try {
      const [fetchedBills, fetchedParties, fetchedStocks] = await Promise.all([
        dataStore.getBills(),
        dataStore.getParties(),
        dataStore.getStock(),
      ]);
      setBills(fetchedBills);
      setParties(fetchedParties);
      setStocks(fetchedStocks);
    } catch (err) {
      console.error("Failed to load sales data:", err);
    }
  };

  useEffect(() => {
    loadData();
    const unsubscribe = dataStore.onUpdate(loadData);
    return () => unsubscribe();
  }, []);

  const stats = {
    totalSales: bills.reduce((sum, b) => sum + b.totalAmount, 0),
    totalReceived: bills.reduce((sum, b) => sum + (b.paidAmount || 0), 0),
    pendingReceivables: bills.reduce((sum, b) => sum + (b.totalAmount - (b.paidAmount || 0)), 0),
    totalInvoices: bills.length,
  };

  const formatCurrency = (amount: number) => {
    return `RS ${new Intl.NumberFormat('en-PK', {
      maximumFractionDigits: 0,
    }).format(amount)}`;
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Sales & Billing</h2>
          <p className="text-slate-500 text-sm mt-1">Generate invoices and track buyer receivables.</p>
        </div>
        
        <div className="flex items-center gap-3 relative z-10">
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-6 h-10 rounded-lg flex items-center gap-2">
                <Plus className="h-4 w-4" />
                <span className="uppercase tracking-wider text-xs">New Invoice</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border-none shadow-2xl p-0">
                <div className="bg-slate-900 p-4 text-white">
                  <DialogTitle className="text-lg font-bold tracking-tight uppercase">New Invoice</DialogTitle>
                  <DialogDescription className="text-slate-400 text-xs mt-1">Fill in the details to generate a bill.</DialogDescription>
                </div>
               <div className="p-6 bg-white">
                <CreateBillForm 
                  parties={parties} 
                  stocks={stocks} 
                  onSuccess={() => setIsCreateOpen(false)} 
                />
               </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Quick Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Sales', value: formatCurrency(stats.totalSales), icon: TrendingUp, color: 'amber' },
          { label: 'Received', value: formatCurrency(stats.totalReceived), icon: ShoppingBag, color: 'emerald' },
          { label: 'Pending', value: formatCurrency(stats.pendingReceivables), icon: Receipt, color: 'rose' },
          { label: 'Invoices', value: stats.totalInvoices, icon: LayoutDashboard, color: 'slate' },
        ].map((item, i) => (
          <Card key={i} className="bg-white border-slate-200 hover:bg-slate-50 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={cn(
                  "p-2.5 rounded-lg",
                  `bg-${item.color}-50 text-${item.color}-600`
                )}>
                  <item.icon className="h-5 w-5" />
                </div>
                <ChevronRight className="h-4 w-4 text-slate-300" />
              </div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">{item.label}</p>
              <h3 className="text-2xl font-bold text-slate-900 tracking-tight tabular-nums">{item.value}</h3>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden min-h-[500px]">
        <Tabs 
          defaultValue={localStorage.getItem('sales_tab') || "all"} 
          onValueChange={(val) => localStorage.setItem('sales_tab', val)} 
          className="w-full"
        >
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center p-6 gap-6 border-b border-slate-100">
            <TabsList className="bg-slate-100 p-1 rounded-lg h-auto">
              <TabsTrigger 
                value="all" 
                className="rounded-md px-4 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm font-bold text-xs uppercase tracking-wider"
              >
                All Invoices
              </TabsTrigger>
              <TabsTrigger 
                value="unpaid" 
                className="rounded-md px-4 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm font-bold text-xs uppercase tracking-wider"
              >
                Outstanding
              </TabsTrigger>
              <TabsTrigger 
                value="paid" 
                className="rounded-md px-4 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm font-bold text-xs uppercase tracking-wider"
              >
                Paid
              </TabsTrigger>
            </TabsList>
            
            <div className="relative w-full lg:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                placeholder="Search..."
                className="w-full pl-10 pr-4 h-10 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
            </div>
          </div>

          <div className="p-2">
            <TabsContent value="all" className="m-0 focus-visible:outline-none focus-visible:ring-0">
              <BillsTable 
                bills={bills} 
                onView={setViewBill} 
                onEdit={setEditBill} 
                onDelete={(id) => dataStore.deleteBill(id)}
                onWhatsApp={(bill) => setViewBill(bill)}
                onPayment={setShowPayment} 
              />
            </TabsContent>
            <TabsContent value="unpaid" className="m-0 focus-visible:outline-none focus-visible:ring-0">
              <BillsTable 
                bills={bills.filter(b => b.status !== 'paid')} 
                onView={setViewBill} 
                onEdit={setEditBill} 
                onDelete={(id) => dataStore.deleteBill(id)}
                onWhatsApp={(bill) => setViewBill(bill)}
                onPayment={setShowPayment} 
              />
            </TabsContent>
            <TabsContent value="paid" className="m-0 focus-visible:outline-none focus-visible:ring-0">
              <BillsTable 
                bills={bills.filter(b => b.status === 'paid')} 
                onView={setViewBill} 
                onEdit={setEditBill} 
                onDelete={(id) => dataStore.deleteBill(id)}
                onWhatsApp={(bill) => setViewBill(bill)}
                onPayment={() => {}} 
              />
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* Global Invoice View Portal */}
      <Dialog open={!!viewBill} onOpenChange={() => setViewBill(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl border-none shadow-2xl p-0 bg-white">
          <div className="p-6">
            <DialogTitle className="sr-only">Document View</DialogTitle>
            <DialogDescription className="sr-only">Detailed view of the selected invoice.</DialogDescription>
            {viewBill && <BillView bill={viewBill} />}
          </div>
        </DialogContent>
      </Dialog>

      {/* Global Payment Portal */}
      <Dialog open={!!showPayment} onOpenChange={() => setShowPayment(null)}>
        <DialogContent className="max-w-lg rounded-2xl border-none shadow-2xl p-0 overflow-hidden">
           <div className="bg-slate-900 p-6 text-white">
             <DialogTitle className="text-2xl font-black tracking-tight uppercase">Payment Reconciliation</DialogTitle>
             <DialogDescription className="text-slate-400 text-sm mt-1">Settle outstanding balances for {showPayment?.buyerName}.</DialogDescription>
           </div>
          <div className="p-6 bg-white">
            {showPayment && parties.find(p => p.id === showPayment.buyerId) && (
              <PaymentForm 
                party={parties.find(p => p.id === showPayment.buyerId)!}
                onSuccess={() => setShowPayment(null)}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Bill Portal */}
      <Dialog open={!!editBill} onOpenChange={() => setEditBill(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border-none shadow-2xl p-0">
            <div className="bg-slate-900 p-4 text-white">
              <DialogTitle className="text-lg font-bold tracking-tight uppercase">Edit Invoice</DialogTitle>
              <DialogDescription className="text-slate-400 text-xs mt-1">Modify the condition or details of the bill.</DialogDescription>
            </div>
           <div className="p-6 bg-white">
            {editBill && (
              <CreateBillForm 
                parties={parties} 
                stocks={stocks} 
                initialData={editBill}
                onSuccess={() => setEditBill(null)} 
              />
            )}
           </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
