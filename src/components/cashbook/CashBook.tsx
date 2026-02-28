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
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 premium-glass p-6 rounded-2xl border-white/20 shadow-premium relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-amber-500/5 rounded-full -mr-40 -mt-40 blur-[100px]" />
        <div className="relative z-10 flex flex-col gap-2">
           <div className="flex items-center gap-3">
              <div className="h-6 w-1 gold-gradient rounded-full" />
              <span className="text-[10px] font-black text-amber-600 uppercase tracking-[0.3em]">Commercial Liquidity Reservoir</span>
           </div>
           <h2 className="text-5xl font-black text-slate-900 tracking-tighter leading-none">Global <span className="text-amber-600">Treasury</span></h2>
           <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-1">Institutional Cash Flow & Master Auditing Protocols</p>
        </div>
        
        <div className="flex items-center gap-4 relative z-10">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="h-16 gold-gradient text-white font-bold px-10 rounded-3xl shadow-lg transition-all active:scale-95 flex items-center gap-3 hover:opacity-90">
                <Plus className="h-6 w-6" />
                <span className="uppercase tracking-widest text-[10px]">Execute Master Entry</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl rounded-2xl border-none shadow-premium p-0 overflow-hidden">
               <div className="premium-gradient p-6 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl" />
                  <DialogTitle className="text-3xl font-black tracking-tighter uppercase mb-2">Treasury Dispatch</DialogTitle>
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Manual Liquidity Injection or Disbursement Protocol</p>
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { label: 'Available Liquidity', value: formatCurrency(currentBalance), icon: Wallet, color: '#f59e0b', trend: 'Live Balance', highlight: true },
          { label: 'Verified Inflow', value: formatCurrency(totalCredit), icon: ArrowUpRight, color: '#10b981', trend: 'Cumulative' },
          { label: 'Capital Outflow', value: formatCurrency(totalDebit), icon: ArrowDownLeft, color: '#f43f5e', trend: 'Expenditure' },
        ].map((stat, i) => (
          <div key={i} className={cn("p-8 rounded-2xl shadow-premium relative overflow-hidden transition-all duration-700 hover:-translate-y-2 group h-full", stat.highlight ? "premium-gradient text-white" : "premium-glass border-white/20")}>
            {stat.highlight && <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/10 rounded-full -mr-16 -mt-16 blur-3xl opacity-50 group-hover:opacity-80 transition-opacity" />}
            <div className="relative z-10 flex flex-col h-full justify-between">
               <div className="flex items-center justify-between mb-8">
                  <div className={cn("p-5 rounded-2xl shadow-inner transition-transform group-hover:rotate-6", stat.highlight ? "bg-white/10 text-amber-500" : `bg-slate-100/50 text-slate-600`)} style={{ color: !stat.highlight ? stat.color : undefined }}>
                     <stat.icon className="h-7 w-7" />
                  </div>
                  <Badge variant="outline" className={cn("text-[9px] font-bold tracking-widest uppercase px-3 py-1 rounded-full border-white/20", stat.highlight ? "text-white/60" : "text-slate-400")}>{stat.trend}</Badge>
               </div>
               <div>
                  <p className={cn("text-[10px] font-bold uppercase tracking-widest mb-3", stat.highlight ? "text-slate-400" : "text-slate-400")}>{stat.label}</p>
                  <h3 className={cn("text-2xl font-bold tracking-tight tabular-nums drop-shadow-sm leading-none", stat.highlight ? "text-white" : "text-slate-900")}>{stat.value}</h3>
               </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Journal interface */}
      <div className="premium-glass rounded-2xl border-white/20 shadow-premium overflow-hidden transition-all duration-700 hover:shadow-2xl">
      <Tabs 
        defaultValue={localStorage.getItem('cashbook_tab') || "all"} 
        onValueChange={(val) => localStorage.setItem('cashbook_tab', val)} 
        className="w-full"
      >
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center p-6 gap-8 border-b border-slate-100/30">
            <TabsList className="bg-slate-100/30 p-2 rounded-[1.5rem] h-auto backdrop-blur-md border border-slate-100/50">
              <TabsTrigger 
                value="all" 
                className="rounded-xl px-10 py-3 data-[state=active]:bg-white data-[state=active]:text-amber-600 data-[state=active]:shadow-lg font-bold text-[10px] uppercase tracking-widest transition-all"
              >
                Full Archive
              </TabsTrigger>
              <TabsTrigger 
                value="in" 
                className="rounded-xl px-10 py-3 data-[state=active]:bg-white data-[state=active]:text-emerald-600 data-[state=active]:shadow-lg font-bold text-[10px] uppercase tracking-widest transition-all"
              >
                Revenue (+)
              </TabsTrigger>
              <TabsTrigger 
                value="out" 
                className="rounded-xl px-10 py-3 data-[state=active]:bg-white data-[state=active]:text-rose-600 data-[state=active]:shadow-lg font-bold text-[10px] uppercase tracking-widest transition-all"
              >
                Expense (-)
              </TabsTrigger>
            </TabsList>
            
            <div className="relative w-full lg:max-w-md group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-6 w-6 text-slate-300 group-focus-within:text-amber-500 transition-all" />
              <Input
                placeholder="Search audit trail or REF ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-14 h-16 bg-white/40 backdrop-blur-xl border-white/20 rounded-2xl shadow-inner focus:ring-amber-500/10 focus:border-amber-500 font-bold uppercase text-[10px] tracking-widest placeholder:text-slate-300"
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
        <TableRow className="border-none hover:bg-transparent">
          <TableHead className="py-8 px-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Date Segment</TableHead>
          <TableHead className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Contextual Audit</TableHead>
          <TableHead className="text-right text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Debit</TableHead>
          <TableHead className="text-right text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Credit</TableHead>
          <TableHead className="text-right px-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Net Liquidity</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {entries.length === 0 ? (
          <TableRow><TableCell colSpan={5} className="text-center py-32 text-slate-400 font-black uppercase tracking-[0.3em] text-[10px]">No historical data found in treasury</TableCell></TableRow>
        ) : (
          entries.slice().reverse().map((entry) => (
            <TableRow key={entry.id} className="group border-b border-slate-50 hover:bg-amber-500/[0.02] transition-all duration-500">
              <TableCell className="py-8 px-8 font-black text-slate-900 tabular-nums">
                <div className="flex flex-col">
                  <span className="text-sm">{new Date(entry.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                  <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest mt-0.5">Segment Log</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-6">
                  <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center shadow-inner", entry.type === 'in' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600')}>
                     {entry.type === 'in' ? <ArrowUpRight className="h-6 w-6" /> : <ArrowDownLeft className="h-6 w-6" />}
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[13px] font-black text-slate-700 tracking-tight leading-none group-hover:text-slate-900 transition-colors">{entry.description}</span>
                    <div className="flex items-center gap-2">
                       <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest mt-0.5">{formatDistanceToNow(new Date(entry.date))} ago</span>
                       {entry.billReference && (
                         <>
                           <div className="h-1 w-1 rounded-full bg-slate-200 mt-1" />
                           <Badge variant="outline" className="text-[9px] font-black border-slate-200 bg-slate-50 text-slate-500 px-3 py-0.5 rounded-full uppercase tracking-tighter mt-1">REF: {entry.billReference}</Badge>
                         </>
                       )}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-right font-black text-rose-600 tabular-nums text-sm">{entry.debit > 0 ? formatCurrency(entry.debit) : '—'}</TableCell>
              <TableCell className="text-right font-black text-emerald-600 tabular-nums text-sm">{entry.credit > 0 ? formatCurrency(entry.credit) : '—'}</TableCell>
              <TableCell className="text-right px-8">
                <div className="flex flex-col items-end gap-1">
                  <span className="text-sm font-black text-slate-900 tabular-nums tracking-tighter drop-shadow-sm">{formatCurrency(entry.balance)}</span>
                  <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Running Net</span>
                </div>
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
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <Button 
          type="button"
          variant={formData.type === 'in' ? 'default' : 'outline'}
          className={cn("h-20 rounded-2xl flex flex-col gap-1 transition-all", formData.type === 'in' ? 'gold-gradient text-white border-none shadow-lg shadow-amber-500/20' : 'bg-slate-50 text-slate-400')}
          onClick={() => setFormData({ ...formData, type: 'in' })}
        >
          <ArrowUpRight className="h-6 w-6" />
          <span className="text-[10px] font-black uppercase tracking-widest">Inflow</span>
        </Button>
        <Button 
          type="button"
          variant={formData.type === 'out' ? 'default' : 'outline'}
          className={cn("h-20 rounded-2xl flex flex-col gap-1 transition-all", formData.type === 'out' ? 'bg-slate-900 text-white border-none shadow-lg' : 'bg-slate-50 text-slate-400')}
          onClick={() => setFormData({ ...formData, type: 'out' })}
        >
          <ArrowDownLeft className="h-6 w-6" />
          <span className="text-[10px] font-black uppercase tracking-widest">Outflow</span>
        </Button>
      </div>

      <div className="space-y-2">
        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Contextual Description</Label>
        <Input 
          placeholder="e.g., Office Utilities Payment"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="h-14 rounded-2xl bg-slate-50 border-slate-100 focus:bg-white transition-all font-medium"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Monetary Volume (RS)</Label>
          <Input 
            type="number"
            placeholder="0.00"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            className="h-14 rounded-2xl bg-slate-50 border-slate-100 focus:bg-white transition-all font-black tabular-nums"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Document Ref #</Label>
          <Input 
            placeholder="Optional"
            value={formData.billReference}
            onChange={(e) => setFormData({ ...formData, billReference: e.target.value })}
            className="h-14 rounded-2xl bg-slate-50 border-slate-100 focus:bg-white transition-all font-medium uppercase placeholder:normal-case"
          />
        </div>
      </div>

      <div className="flex gap-4 pt-4">
        <Button type="button" variant="outline" className="flex-1 h-14 rounded-2xl font-black uppercase text-[10px] tracking-widest" onClick={onSuccess}>Abort</Button>
        <Button type="submit" className={cn("flex-1 h-14 rounded-2xl font-black uppercase text-[10px] tracking-widest text-white shadow-xl shadow-amber-500/10", formData.type === 'in' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-rose-500 hover:bg-rose-600')}>
          {formData.type === 'in' ? 'Authorize Inflow' : 'Authorize Disbursement'}
        </Button>
      </div>
    </form>
  );
}
