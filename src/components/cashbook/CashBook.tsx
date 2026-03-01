import { useEffect, useState } from 'react';
import { 
  Plus, 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Search,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { dataStore } from '@/store/dataStore';
import type { CashEntry } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { cn } from "@/lib/utils";

export function CashBook() {
  const [entries, setEntries] = useState<CashEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  useEffect(() => {
    loadEntries();
    const unsubscribe = dataStore.onUpdate(loadEntries);
    return () => unsubscribe();
  }, []);

  const loadEntries = async () => {
    const data = await dataStore.getCashEntries();
    setEntries(data);
  };

  const filteredEntries = entries.filter(entry => 
    entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (entry.billReference?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (amount: number) => {
    return `RS ${new Intl.NumberFormat('en-PK', {
      maximumFractionDigits: 0,
    }).format(amount)}`;
  };

  const totalDebit = entries.reduce((sum, e) => sum + e.debit, 0);
  const totalCredit = entries.reduce((sum, e) => sum + e.credit, 0);
  const currentBalance = entries.length > 0 ? entries[entries.length - 1].balance : 0;

  return (
    <div className="space-y-10 pb-10">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Global Cash Book</h2>
          <p className="text-slate-500 text-sm mt-1">Manage cash flow and daily transactions.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="h-10 bg-amber-600 hover:bg-amber-700 text-white font-bold px-6 rounded-lg shadow-sm transition-all flex items-center gap-2">
                <Plus className="h-4 w-4" />
                <span className="uppercase tracking-wider text-xs">Add Entry</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md rounded-xl border-none shadow-2xl p-0 overflow-hidden">
               <div className="bg-slate-900 p-6 text-white">
                  <DialogTitle className="text-lg font-bold tracking-tight uppercase">Cash Transaction</DialogTitle>
                  <p className="text-slate-400 text-xs mt-1">Record money in or out of the system.</p>
               </div>
               <div className="p-6 bg-white">
                <AddCashForm 
                  onSuccess={() => {
                    setIsAddDialogOpen(false);
                    loadEntries();
                  }} 
                />
               </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Analytics matrix */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Available Balance', value: formatCurrency(currentBalance), icon: Wallet, color: '#f59e0b', highlight: true },
          { label: 'Total Inflow', value: formatCurrency(totalCredit), icon: ArrowUpRight, color: '#10b981' },
          { label: 'Total Outflow', value: formatCurrency(totalDebit), icon: ArrowDownLeft, color: '#f43f5e' },
        ].map((stat, i) => (
          <div key={i} className={cn("p-6 rounded-xl border border-slate-200 shadow-sm transition-shadow", stat.highlight ? "bg-amber-50" : "bg-white")}>
            <div className="flex flex-col h-full justify-between">
               <div className="flex items-center justify-between mb-4">
                  <div className={cn("p-2 rounded-lg bg-slate-100 text-slate-600", stat.highlight && "bg-amber-100 text-amber-600")}>
                     <stat.icon className="h-5 w-5" />
                  </div>
               </div>
               <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-600 mb-1">{stat.label}</p>
                  <h3 className="text-2xl font-bold tracking-tight text-slate-950 tabular-nums">{stat.value}</h3>
               </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Journal interface */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <Tabs 
        defaultValue={localStorage.getItem('cashbook_tab') || "all"} 
        onValueChange={(val) => localStorage.setItem('cashbook_tab', val)} 
        className="w-full"
      >
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center p-6 gap-6 border-b border-slate-100">
            <TabsList className="bg-slate-100 p-1 rounded-lg h-auto">
              <TabsTrigger value="all" className="rounded-md px-6 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm font-bold text-xs uppercase tracking-wider">Full History</TabsTrigger>
              <TabsTrigger value="in" className="rounded-md px-6 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm font-bold text-xs uppercase tracking-wider text-emerald-600">Inflow (+)</TabsTrigger>
              <TabsTrigger value="out" className="rounded-md px-6 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm font-bold text-xs uppercase tracking-wider text-rose-600">Outflow (-)</TabsTrigger>
            </TabsList>
            
            <div className="relative w-full lg:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 h-10 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
            </div>
          </div>

          <div className="p-4">
            <TabsContent value="all" className="m-0 focus-visible:outline-none focus-visible:ring-0">
               <CashEntriesTable entries={filteredEntries} />
            </TabsContent>
            <TabsContent value="in" className="m-0 focus-visible:outline-none focus-visible:ring-0">
               <CashEntriesTable entries={filteredEntries.filter(e => e.type === 'in')} />
            </TabsContent>
            <TabsContent value="out" className="m-0 focus-visible:outline-none focus-visible:ring-0">
               <CashEntriesTable entries={filteredEntries.filter(e => e.type === 'out')} />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}

function CashEntriesTable({ entries }: { entries: CashEntry[] }) {
  const formatCurrency = (amount: number) => {
    return `RS ${new Intl.NumberFormat('en-PK', { maximumFractionDigits: 0 }).format(amount)}`;
  };

  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-slate-50">
          <TableHead className="py-3 px-6 text-[11px] font-extrabold uppercase tracking-wider text-slate-700">Date</TableHead>
          <TableHead className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700">Description</TableHead>
          <TableHead className="text-right text-[11px] font-extrabold uppercase tracking-wider text-slate-700">Debit (Out)</TableHead>
          <TableHead className="text-right text-[11px] font-extrabold uppercase tracking-wider text-slate-700">Credit (In)</TableHead>
          <TableHead className="text-right px-6 text-[11px] font-extrabold uppercase tracking-wider text-slate-700">Balance</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {entries.length === 0 ? (
          <TableRow><TableCell colSpan={5} className="text-center py-32 text-slate-400 font-black uppercase tracking-[0.3em] text-[10px]">No historical data found in treasury</TableCell></TableRow>
        ) : (
          entries.slice().reverse().map((entry) => (
            <TableRow key={entry.id} className="hover:bg-slate-50 transition-colors">
              <TableCell className="py-4 px-6 font-bold text-slate-900 tabular-nums text-xs">
                {new Date(entry.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-4">
                  <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center", entry.type === 'in' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600')}>
                     {entry.type === 'in' ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownLeft className="h-4 w-4" />}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-slate-700">{entry.description}</span>
                    <div className="flex items-center gap-2">
                       <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{formatDistanceToNow(new Date(entry.date))} ago</span>
                       {entry.billReference && (
                         <Badge variant="secondary" className="text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">REF: {entry.billReference}</Badge>
                       )}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-right font-bold text-rose-600 tabular-nums text-xs">{entry.debit > 0 ? formatCurrency(entry.debit) : '—'}</TableCell>
              <TableCell className="text-right font-bold text-emerald-600 tabular-nums text-xs">{entry.credit > 0 ? formatCurrency(entry.credit) : '—'}</TableCell>
              <TableCell className="text-right px-6 font-bold text-slate-900 tabular-nums text-xs">
                {formatCurrency(entry.balance)}
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}

function AddCashForm({ onSuccess }: { onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    type: 'in',
    description: '',
    amount: '',
    billReference: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description || !formData.amount) return;

    try {
      const entryData = {
        date: new Date().toISOString(),
        type: formData.type as 'in' | 'out',
        description: formData.description,
        debit: formData.type === 'out' ? parseFloat(formData.amount) : 0,
        credit: formData.type === 'in' ? parseFloat(formData.amount) : 0,
        billReference: formData.billReference || undefined
      };

      await dataStore.addCashEntry(entryData);
      onSuccess();
    } catch (err) {
      console.error("Failed to record entry:", err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Button 
          type="button"
          variant={formData.type === 'in' ? 'default' : 'outline'}
          className={cn("h-14 rounded-lg flex flex-col gap-1 transition-all", formData.type === 'in' ? 'bg-emerald-600 text-white border-none shadow-sm' : 'bg-slate-50 text-slate-500')}
          onClick={() => setFormData({ ...formData, type: 'in' })}
        >
          <ArrowUpRight className="h-5 w-5" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Cash In</span>
        </Button>
        <Button 
          type="button"
          variant={formData.type === 'out' ? 'default' : 'outline'}
          className={cn("h-14 rounded-lg flex flex-col gap-1 transition-all", formData.type === 'out' ? 'bg-rose-600 text-white border-none shadow-sm' : 'bg-slate-50 text-slate-500')}
          onClick={() => setFormData({ ...formData, type: 'out' })}
        >
          <ArrowDownLeft className="h-5 w-5" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Cash Out</span>
        </Button>
      </div>

      <div className="space-y-2">
        <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Description</Label>
        <Input 
          placeholder="e.g. Office Utilities Payment"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="h-10 rounded-lg bg-slate-50 border-slate-200 font-semibold"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Amount (RS)</Label>
          <Input 
            type="number"
            placeholder="0.00"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            className="h-10 rounded-lg bg-slate-50 border-slate-200 font-bold tabular-nums"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Ref #</Label>
          <Input 
            placeholder="Optional"
            value={formData.billReference}
            onChange={(e) => setFormData({ ...formData, billReference: e.target.value })}
            className="h-10 rounded-lg bg-slate-50 border-slate-200 font-semibold uppercase"
          />
        </div>
      </div>

      <div className="flex gap-4 pt-4">
        <Button type="button" variant="outline" className="flex-1 h-10 rounded-lg font-bold uppercase text-xs tracking-wider" onClick={onSuccess}>Cancel</Button>
        <Button type="submit" className={cn("flex-1 h-10 rounded-lg font-bold uppercase text-xs tracking-wider text-white", formData.type === 'in' ? 'bg-emerald-600' : 'bg-rose-600')}>
          Record
        </Button>
      </div>
    </form>
  );
}
