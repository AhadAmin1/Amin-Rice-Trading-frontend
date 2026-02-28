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
import { Input } from '@/components/ui/input';
import type { Bill, Party, StockItem } from '@/types';
import { BillsTable } from './BillsTable';
import { CreateBillForm } from './CreateBillForm';
import { BillView } from './BillView';
import { PaymentForm } from '../ledger/LedgerSystem';

export default function SalesBilling() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [parties, setParties] = useState<Party[]>([]);
  const [stocks, setStocks] = useState<StockItem[]>([]);

  // Modal States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
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
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 bg-white/40 p-6 rounded-2xl border border-white/20 backdrop-blur-sm shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-100/20 rounded-full -mr-32 -mt-32 blur-3xl" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-8 w-1 bg-amber-500 rounded-full" />
            <span className="text-xs font-bold text-amber-600 uppercase tracking-widest leading-none">Commercial Division</span>
          </div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Sales & <span className="text-gold">Billing</span></h2>
          <p className="text-slate-500 font-medium mt-1">Generate premium invoices and track buyer receivables in real-time.</p>
        </div>
        
        <div className="flex items-center gap-3 relative z-10">
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="h-14 gold-gradient hover:opacity-90 text-white font-bold px-8 rounded-2xl shadow-lg transition-all active:scale-95 flex items-center gap-3">
                <Plus className="h-5 w-5" />
                <span className="uppercase tracking-widest text-xs">New Invoice</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border-none shadow-2xl p-0">
               <div className="bg-slate-900 p-6 text-white">
                  <DialogTitle className="text-2xl font-bold tracking-tight uppercase">Invoice Authorization</DialogTitle>
                  <DialogDescription className="text-slate-400 text-sm mt-1">Configure fresh dispatch and generate commercial bill.</DialogDescription>
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
          { label: 'Market Valuation', value: formatCurrency(stats.totalSales), icon: TrendingUp, color: 'amber' },
          { label: 'Capital Recovered', value: formatCurrency(stats.totalReceived), icon: ShoppingBag, color: 'emerald' },
          { label: 'Outbound Debt', value: formatCurrency(stats.pendingReceivables), icon: Receipt, color: 'rose' },
          { label: 'Active Invoices', value: stats.totalInvoices, icon: LayoutDashboard, color: 'slate' },
        ].map((item, i) => (
          <Card key={i} className="glass-card border-white/50 group hover:border-amber-500/30 transition-all duration-500 overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-2xl bg-${item.color}-50 text-${item.color}-600 group-hover:scale-110 transition-transform duration-500 shadow-inner`}>
                  <item.icon className="h-5 w-5" />
                </div>
                <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center">
                   <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-amber-500 transition-colors" />
                </div>
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{item.label}</p>
              <h3 className="text-2xl font-black text-slate-900 tracking-tighter tabular-nums">{item.value}</h3>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Billing Interface */}
      <div className="glass-card rounded-2xl border-white/50 shadow-sm overflow-hidden min-h-[500px]">
        <Tabs 
          defaultValue={localStorage.getItem('sales_tab') || "all"} 
          onValueChange={(val) => localStorage.setItem('sales_tab', val)} 
          className="w-full"
        >
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center p-6 gap-6 border-b border-slate-100">
            <TabsList className="bg-slate-100/50 p-1.5 rounded-2xl h-auto border border-slate-200/50 backdrop-blur-sm">
              <TabsTrigger 
                value="all" 
                className="rounded-xl px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:text-amber-600 data-[state=active]:shadow-lg font-black text-xs uppercase tracking-widest transition-all"
              >
                Global Registry
              </TabsTrigger>
              <TabsTrigger 
                value="unpaid" 
                className="rounded-xl px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:text-rose-600 data-[state=active]:shadow-lg font-black text-xs uppercase tracking-widest transition-all"
              >
                Outstanding
              </TabsTrigger>
              <TabsTrigger 
                value="paid" 
                className="rounded-xl px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:text-emerald-600 data-[state=active]:shadow-lg font-black text-xs uppercase tracking-widest transition-all"
              >
                Settled Invoices
              </TabsTrigger>
            </TabsList>
            
            <div className="relative w-full lg:max-w-md group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-amber-500 transition-colors" />
              <Input
                placeholder="Search index by party name or invoice #..."
                className="pl-12 h-14 bg-white/70 backdrop-blur-md border-amber-100/50 rounded-2xl shadow-sm focus:ring-amber-500/20 focus:border-amber-500 transition-all font-medium text-slate-700"
              />
            </div>
          </div>

          <div className="p-2">
            <TabsContent value="all" className="m-0 focus-visible:outline-none focus-visible:ring-0">
              <BillsTable 
                bills={bills} 
                onView={setViewBill} 
                onEdit={() => {}} 
                onDelete={(id) => dataStore.deleteBill(id)}
                onWhatsApp={(bill) => setViewBill(bill)}
                onPayment={setShowPayment} 
              />
            </TabsContent>
            <TabsContent value="unpaid" className="m-0 focus-visible:outline-none focus-visible:ring-0">
              <BillsTable 
                bills={bills.filter(b => b.status !== 'paid')} 
                onView={setViewBill} 
                onEdit={() => {}} 
                onDelete={(id) => dataStore.deleteBill(id)}
                onWhatsApp={(bill) => setViewBill(bill)}
                onPayment={setShowPayment} 
              />
            </TabsContent>
            <TabsContent value="paid" className="m-0 focus-visible:outline-none focus-visible:ring-0">
              <BillsTable 
                bills={bills.filter(b => b.status === 'paid')} 
                onView={setViewBill} 
                onEdit={() => {}} 
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
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-[3rem] border-none shadow-2xl p-0 bg-slate-50/50 backdrop-blur-2xl">
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
    </div>
  );
}
