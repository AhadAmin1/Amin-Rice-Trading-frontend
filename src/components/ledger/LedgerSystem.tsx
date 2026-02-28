import { useEffect, useState } from 'react';
import { 
  Search, 
  BookOpen, 
  User, 
  Building2, 
  ArrowRight, 
  Plus, 
  Wallet,
  Pencil, 
  Trash2, 
  Share2 as ShareIcon, 
  Phone, 
  CheckCircle2,
  ShoppingBag
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { dataStore } from '@/store/dataStore';
import type { LedgerEntry, Party, ViewType, Bill, StockItem } from '@/types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatDistanceToNow } from 'date-fns';
import { cn } from "@/lib/utils";

interface LedgerSystemProps {
  onNavigate: (view: ViewType, partyId?: string) => void;
}

export function LedgerSystem({ onNavigate }: LedgerSystemProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [parties, setParties] = useState<Party[]>([]);
  const [balances, setBalances] = useState<Record<string, number>>({});

  const refreshParties = async () => {
    try {
      const [fetchedParties, fetchedBalances] = await Promise.all([
        dataStore.getParties(),
        dataStore.getPartyBalances()
      ]);
      setParties(fetchedParties.filter(p => p.id !== 'father'));
      setBalances(fetchedBalances);
    } catch (err) {
      console.error("Failed to refresh ledger parties:", err);
    }
  };

  useEffect(() => {
    refreshParties();
    const unsubscribe = dataStore.onUpdate(() => {
      console.log("Real-time update triggered for LedgerSystem");
      refreshParties();
    });
    return () => unsubscribe();
  }, []);

  const filteredParties = parties
    .filter(party => party.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      const aIsTop = a.name.toLowerCase().includes('home') || a.name.toLowerCase().includes('office');
      const bIsTop = b.name.toLowerCase().includes('home') || b.name.toLowerCase().includes('office');
      if (aIsTop && !bIsTop) return -1;
      if (!aIsTop && bIsTop) return 1;
      return a.name.localeCompare(b.name);
    });

  const millers = filteredParties.filter(p => p.type === 'Miller');
  const buyers = filteredParties.filter(p => p.type === 'Buyer');
  const expenses = filteredParties.filter(p => p.type === 'Expense');

  const getPartyBalance = (partyId: string) => balances[partyId] || 0;

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 bg-white/40 p-6 rounded-3xl border border-white/20 backdrop-blur-sm shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-100/20 rounded-full -mr-32 -mt-32 blur-3xl" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-8 w-1 bg-amber-500 rounded-full" />
            <span className="text-xs font-bold text-amber-600 uppercase tracking-widest leading-none">Financial Transparency</span>
          </div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Ledger / <span className="text-gold">Khata Book</span></h2>
          <p className="text-slate-500 font-medium mt-1">Institutional record-keeping & real-time balance reconciliation.</p>
        </div>
        <div className="flex items-center gap-3 relative z-10">
          <AddPartyDialog onSuccess={refreshParties} />
        </div>
      </div>

      <div className="space-y-4">
        <Tabs 
          defaultValue={localStorage.getItem('ledger_tab') || "all"} 
          onValueChange={(val) => localStorage.setItem('ledger_tab', val)} 
          className="w-full"
        >
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-2">
            <TabsList className="bg-slate-100/50 p-1.5 rounded-2xl h-auto border border-slate-200/50 backdrop-blur-sm">
              <TabsTrigger value="all" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:text-amber-600 data-[state=active]:shadow-lg font-black text-xs uppercase tracking-widest transition-all">All Accounts</TabsTrigger>
              <TabsTrigger value="buyers" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:text-amber-600 data-[state=active]:shadow-lg font-black text-xs uppercase tracking-widest transition-all">Buyers</TabsTrigger>
              <TabsTrigger value="millers" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:text-amber-600 data-[state=active]:shadow-lg font-black text-xs uppercase tracking-widest transition-all">Millers</TabsTrigger>
              <TabsTrigger value="expenses" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:text-amber-600 data-[state=active]:shadow-lg font-black text-xs uppercase tracking-widest transition-all">Expenses</TabsTrigger>
            </TabsList>
            <div className="relative w-full lg:max-w-md group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-amber-500 transition-colors" />
              <Input
                placeholder="Search party names, locations, or account IDs..."
                className="pl-12 h-14 bg-white/70 backdrop-blur-md border-amber-100/50 rounded-2xl shadow-sm focus:ring-amber-500/20 focus:border-amber-500 transition-all font-medium text-slate-700"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="mt-8">
            <TabsContent value="all" className="m-0 focus-visible:outline-none focus-visible:ring-0">
              <PartiesGrid parties={filteredParties} onViewLedger={(partyId) => onNavigate('party-ledger', partyId)} getBalance={getPartyBalance} onRefresh={refreshParties} />
            </TabsContent>
            <TabsContent value="buyers" className="m-0 focus-visible:outline-none focus-visible:ring-0">
              <PartiesGrid parties={buyers} onViewLedger={(partyId) => onNavigate('party-ledger', partyId)} getBalance={getPartyBalance} onRefresh={refreshParties} />
            </TabsContent>
            <TabsContent value="millers" className="m-0 focus-visible:outline-none focus-visible:ring-0">
              <PartiesGrid parties={millers} onViewLedger={(partyId) => onNavigate('party-ledger', partyId)} getBalance={getPartyBalance} onRefresh={refreshParties} />
            </TabsContent>
            <TabsContent value="expenses" className="m-0 focus-visible:outline-none focus-visible:ring-0">
              <PartiesGrid parties={expenses} onViewLedger={(partyId) => onNavigate('party-ledger', partyId)} getBalance={getPartyBalance} onRefresh={refreshParties} />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}

function PartiesGrid({ 
  parties, 
  onViewLedger,
  getBalance,
  onRefresh
}: { 
  parties: Party[]; 
  onViewLedger: (partyId: string) => void;
  getBalance: (partyId: string) => number;
  onRefresh?: () => void;
}) {
  const formatCurrency = (amount: number) => {
    return `RS ${new Intl.NumberFormat('en-PK', { maximumFractionDigits: 0 }).format(amount)}`;
  };

  if (parties.length === 0) {
    return (
      <div className="text-center py-20 bg-white/50 rounded-[2rem] border-2 border-dashed border-amber-100/50 backdrop-blur-sm">
        <div className="bg-amber-50 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-6">
          <BookOpen className="h-10 w-10 text-amber-200" />
        </div>
        <h3 className="text-xl font-black text-slate-900 tracking-tight">No Khata Found</h3>
        <p className="text-slate-400 font-medium mt-1 max-w-xs mx-auto">No parties matched your search or selection. Add a new buyer or miller to begin.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {parties.map((party) => {
        const balance = getBalance(party.id);
        const isReceivable = party.type === 'Buyer' && balance > 0;
        const isPayable = party.type === 'Miller' && balance > 0;
        const isExpense = party.type === 'Expense';

        return (
          <div key={party.id} className="premium-glass p-8 rounded-xl border-white/20 group hover:shadow-premium floating-card flex flex-col h-full relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full -mr-16 -mt-16 group-hover:bg-amber-500/10 transition-all duration-1000 blur-2xl" />
            
            <div className="flex items-start justify-between relative z-10 mb-8">
              <div className="flex items-center gap-5">
                <div className={cn(
                  "w-16 h-16 rounded-[1.5rem] flex items-center justify-center shadow-inner transition-all duration-700",
                  party.type === 'Buyer' ? 'bg-blue-500/10 text-blue-600 group-hover:bg-blue-600 group-hover:text-white' : 
                  party.type === 'Miller' ? 'bg-amber-500/10 text-amber-600 group-hover:gold-gradient group-hover:text-white' :
                  'bg-emerald-500/10 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white'
                )}>
                  {party.type === 'Buyer' ? <User className="h-7 w-7" /> :
                   party.type === 'Miller' ? <Building2 className="h-7 w-7" /> :
                   <Wallet className="h-7 w-7" />
                  }
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tighter group-hover:text-amber-600 transition-colors leading-tight">{party.name}</h3>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className={cn(
                      "text-[9px] font-black uppercase tracking-[0.2em] px-2.5 py-1 rounded-full border",
                      party.type === 'Buyer' ? "bg-blue-50 border-blue-100 text-blue-700" :
                      party.type === 'Miller' ? "bg-amber-50 border-amber-100 text-amber-700" :
                      "bg-emerald-50 border-emerald-100 text-emerald-700"
                    )}>
                      {party.type}
                    </span>
                    {party.phone && <span className="text-[10px] font-black text-slate-400 tracking-tighter/none"># {party.phone.replace('+92 ', '')}</span>}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <EditPartyDialog party={party} onUpdated={() => {onRefresh && onRefresh();}} />
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="h-10 w-10 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                  onClick={async () => {
                    if (confirm(`Archive and delete ${party.name}?`)) {
                      await dataStore.deleteParty(party.id);
                      onRefresh?.();
                    }
                  }}
                >
                  <Trash2 className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <div className="mt-auto space-y-5 relative z-10">
              <div className="premium-glass p-5 rounded-[1.8rem] border-white/20 shadow-inner relative overflow-hidden group/bal">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                    {isReceivable ? 'Due to Us' : isPayable ? 'Our Liability' : isExpense ? 'Net Spend' : 'Current Status'}
                  </span>
                  <div className="flex items-center justify-between">
                    <span className={cn(
                      "text-2xl font-black tabular-nums tracking-tighter leading-none drop-shadow-sm",
                      isReceivable ? 'text-blue-600' : isPayable ? 'text-rose-600' : isExpense ? 'text-emerald-600' : 'text-slate-900'
                    )}>
                      {formatCurrency(Math.abs(balance))}
                    </span>
                    {balance === 0 && (
                      <div className="flex items-center gap-1.5 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                        <CheckCircle2 className="h-3 w-3 text-emerald-600 outline-none" />
                        <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Settled</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <Button 
                variant="outline" 
                className="w-full h-14 rounded-2xl border-amber-200/50 text-amber-600 font-black text-[10px] uppercase tracking-[0.3em] hover:gold-gradient hover:text-white hover:border-transparent transition-all duration-500 group/btn shadow-sm active:scale-95"
                onClick={() => onViewLedger(party.id)}
              >
                DETAILED ACCOUNT ACCESS
                <ArrowRight className="h-4 w-4 ml-3 group-hover/btn:translate-x-1.5 transition-transform duration-500" />
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function EditPartyDialog({ party, onUpdated }: { party: Party; onUpdated: () => void; }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: party.name,
    phone: party.phone || '+92 ',
    address: party.address || '',
  });

  const handleSave = async () => {
    await dataStore.updateParty(party.id, form);
    onUpdated();      
    setOpen(false);   
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-300 hover:text-amber-600 hover:bg-amber-50 rounded-lg">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md rounded-xl p-0 border-none shadow-2xl overflow-hidden">
        <div className="bg-slate-900 p-8 text-white">
          <DialogTitle className="text-2xl font-black tracking-tight uppercase">Edit Account Profile</DialogTitle>
          <DialogDescription className="text-slate-400 text-sm mt-1">Update institutional details for {party.name}.</DialogDescription>
        </div>
        <div className="p-8 space-y-4 bg-white">
          <div className="space-y-2">
            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Legal Name</Label>
            <Input value={form.name} className="h-12 rounded-xl bg-slate-50 border-slate-200 font-bold" onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contact Terminal</Label>
            <Input value={form.phone} className="h-12 rounded-xl bg-slate-50 border-slate-200 font-bold" onChange={(e) => {
              let val = e.target.value;
              if (!val.startsWith('+92 ')) val = '+92 ' + val.replace(/^\+92\s?/, '');
              setForm({ ...form, phone: val });
            }} />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Geographical Mapping</Label>
            <Input value={form.address} className="h-12 rounded-xl bg-slate-50 border-slate-200 font-bold" onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </div>
          <div className="flex gap-4 pt-4">
            <Button variant="outline" className="flex-1 h-12 rounded-xl font-black text-xs uppercase" onClick={() => setOpen(false)}>Cancel</Button>
            <Button className="flex-1 h-12 gold-gradient text-white font-black text-xs uppercase rounded-xl" onClick={handleSave}>Apply Changes</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function AddPartyDialog({ onSuccess }: { onSuccess: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'Buyer' as 'Buyer' | 'Miller' | 'Expense',
    phone: '+92 ',
    address: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await dataStore.addParty(formData);
    setIsOpen(false);
    setFormData({ name: '', type: 'Buyer', phone: '+92 ', address: '' });
    onSuccess();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="h-14 gold-gradient hover:opacity-90 text-white font-black px-8 rounded-2xl shadow-xl shadow-amber-500/20 transition-all active:scale-95 flex items-center gap-3">
          <Plus className="h-5 w-5" />
          <span className="uppercase tracking-widest text-xs">Register Party</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg rounded-xl p-0 border-none shadow-2xl overflow-hidden">
        <div className="bg-slate-900 p-8 text-white">
          <DialogTitle className="text-2xl font-black tracking-tight uppercase">New Khata Registration</DialogTitle>
          <DialogDescription className="text-slate-400 text-sm mt-1">Onboard a new financial entity into the central registry.</DialogDescription>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-4 bg-white">
          <div className="space-y-2">
            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Entity Name</Label>
            <Input placeholder="Enter commercial name" className="h-12 rounded-xl bg-slate-50 border-slate-200 font-bold" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Classification Target</Label>
            <Select value={formData.type} onValueChange={value => setFormData({ ...formData, type: value as 'Buyer' | 'Miller' })}>
              <SelectTrigger className="h-12 rounded-xl bg-slate-50 font-bold border-slate-200"><SelectValue /></SelectTrigger>
              <SelectContent className="rounded-2xl shadow-2xl border-none"><SelectItem value="Buyer" className="rounded-xl my-1">Buyer (Customer)</SelectItem><SelectItem value="Miller" className="rounded-xl my-1">Miller (Supplier)</SelectItem><SelectItem value="Expense" className="rounded-xl my-1">Expense (Khata)</SelectItem></SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Communication Terminal</Label>
            <Input value={formData.phone} className="h-12 rounded-xl bg-slate-50 border-slate-200 font-bold" onChange={(e) => {
              let val = e.target.value;
              if (!val.startsWith('+92 ')) val = '+92 ' + val.replace(/^\+92\s?/, '');
              setFormData({ ...formData, phone: val });
            }} />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Base Location / Note</Label>
            <Input className="h-12 rounded-xl bg-slate-50 border-slate-200 font-bold" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
          </div>
          <div className="flex gap-4 pt-4">
            <Button type="button" variant="outline" className="flex-1 h-12 rounded-xl font-black text-xs uppercase" onClick={() => setIsOpen(false)}>Abort</Button>
            <Button type="submit" className="flex-1 h-12 gold-gradient text-white font-black text-xs uppercase rounded-xl">Register Account</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function PartyLedger({ partyId, onBack }: { partyId: string; onBack: () => void }) {
  const [party, setParty] = useState<Party | null>(null);
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);

  const loadData = async () => {
    const parties = await dataStore.getParties();
    const p = parties.find(p => p.id === partyId);
    if (p) {
      setParty(p);
      const ledgerEntries = await dataStore.getPartyLedger(partyId);
      setEntries(ledgerEntries);
    }
  };

  useEffect(() => {
    loadData();
    const unsubscribe = dataStore.onUpdate(loadData);
    return () => unsubscribe();
  }, [partyId]);

  const formatCurrency = (amount: number) => {
    return `RS ${new Intl.NumberFormat('en-PK', { maximumFractionDigits: 0 }).format(amount)}`;
  };

  const currentBalance = entries.length > 0 ? entries[entries.length - 1].balance : 0;

  const generatePDF = async () => {
    if (!party) return;
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.setTextColor(40, 44, 52);
    doc.text("Amin Rice Trading", 105, 15, { align: "center" });
    doc.setFontSize(14);
    doc.text(`Ledger Report: ${party.name}`, 105, 25, { align: "center" });
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 32, { align: "center" });
    doc.setFontSize(11);
    doc.setTextColor(0);
    doc.text(`Party: ${party.name}`, 14, 45);
    doc.text(`Phone: ${party.phone || 'N/A'}`, 14, 50);
    doc.text(`Type: ${party.type}`, 14, 55);
    doc.text(`Balance: ${formatCurrency(currentBalance)}`, 196, 55, { align: "right" });

    const tableData = entries.map(e => [
      e.date,
      e.particulars,
      e.billNo || '-',
      e.katte || '-',
      e.debit > 0 ? formatCurrency(e.debit) : '-',
      e.credit > 0 ? formatCurrency(e.credit) : '-',
      formatCurrency(e.balance)
    ]);

    autoTable(doc, {
      startY: 65,
      head: [['Date', 'Particulars', 'Bill', 'Katte', 'Debit', 'Credit', 'Balance']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [245, 158, 11], textColor: 255 },
      styles: { fontSize: 8 },
      columnStyles: { 4: { halign: 'right' }, 5: { halign: 'right' }, 6: { halign: 'right', fontStyle: 'bold' } }
    });

    const pdfBlob = doc.output('blob');
    const fileName = `Ledger_${party.name.replace(/\s+/g, '_')}.pdf`;
    if (navigator.share && navigator.canShare && navigator.canShare({ files: [new File([pdfBlob], fileName, { type: 'application/pdf' })] })) {
      try { await navigator.share({ files: [new File([pdfBlob], fileName, { type: 'application/pdf' })], title: `${party.name} - Ledger`, text: `Attached is the ledger for ${party.name} from Amin Rice Trading.` }); } catch (err) { doc.save(fileName); }
    } else { doc.save(fileName); }
  };

  if (!party) return null;

  return (
    <div className="space-y-10 pb-10">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8 premium-glass p-6 rounded-2xl border-white/20 shadow-premium relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-amber-500/5 rounded-full -mr-40 -mt-40 blur-[100px]" />
        <div className="flex items-center gap-6 relative z-10">
           <Button variant="ghost" onClick={onBack} className="h-20 w-20 rounded-3xl bg-white/20 backdrop-blur-md border border-white/40 shadow-xl hover:bg-white/40 hover:-translate-x-1 transition-all group">
              <ArrowRight className="h-8 w-8 rotate-180 text-slate-700" />
           </Button>
           <div className="space-y-3">
              <div className="flex items-center gap-3">
                 <Badge className={cn("rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] shadow-sm border-none", party.type === 'Buyer' ? "bg-blue-600 text-white" : "bg-amber-600 text-white")}>Institutional {party.type}</Badge>
                 <div className="h-1 w-1 rounded-full bg-slate-300" />
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Master ID: {party.id.slice(-6).toUpperCase()}</span>
              </div>
              <h2 className="text-5xl font-black text-slate-900 tracking-tighter leading-none">{party.name}</h2>
              {party.phone && <div className="flex items-center gap-2.5 text-slate-500 font-black text-sm tracking-tight"><Phone className="h-4 w-4 text-emerald-500" /> {party.phone}</div>}
           </div>
        </div>
        <div className="flex items-center gap-4 relative z-10">
           <Button onClick={generatePDF} variant="ghost" className="h-16 px-10 rounded-3xl premium-glass border-white/40 font-black uppercase tracking-[0.2em] text-[10px] text-slate-700 hover:bg-white/60 hover:shadow-lg transition-all transform active:scale-95 group">
              <ShareIcon className="h-5 w-5 mr-3 text-emerald-600 group-hover:rotate-12 transition-transform" /> Export Statement
           </Button>
           <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
              <DialogTrigger asChild>
                 <Button className="h-16 px-10 gold-gradient text-white font-black uppercase tracking-[0.2em] text-[10px] rounded-3xl shadow-[0_20px_40px_-5px_rgba(253,185,49,0.3)] active:scale-95 transition-all hover:opacity-90">
                    <Wallet className="h-5 w-5 mr-3" /> Manual Recovery / Payment
                 </Button>
              </DialogTrigger>
              <DialogContent className="max-w-xl rounded-2xl p-0 border-none shadow-premium overflow-hidden">
                 <div className="premium-gradient p-6 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl" />
                    <DialogTitle className="text-3xl font-black tracking-tighter uppercase mb-2">Institutional Entry</DialogTitle>
                    <p className="text-slate-400 text-xs font-black uppercase tracking-[0.2em]">Khata Reference Management Protocol</p>
                 </div>
                 <div className="p-6 bg-white">
                    <PaymentForm 
                      party={party}
                      onSuccess={() => { setIsPaymentDialogOpen(false); loadData(); }}
                    />
                 </div>
              </DialogContent>
           </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { label: `Gross ${party.type === 'Buyer' ? 'Dispatch' : 'Sourcing'}`, value: formatCurrency(entries.reduce((sum, e) => sum + (e.debit || 0), 0)), icon: ShoppingBag, color: '#64748b' },
          { label: `Recovered / Paid`, value: formatCurrency(entries.reduce((sum, e) => sum + (e.credit || 0), 0)), icon: CheckCircle2, color: '#10b981' },
          { label: 'Net Commercial Exposure', value: formatCurrency(currentBalance), icon: Wallet, color: '#f59e0b', highlight: true },
        ].map((stat, i) => (
          <div key={i} className={cn("p-8 rounded-2xl shadow-premium relative overflow-hidden border-white/20 h-full group transition-all duration-700 hover:-translate-y-2", stat.highlight ? "premium-gradient text-white" : "premium-glass")}>
            {stat.highlight && <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/10 rounded-full -mr-16 -mt-16 blur-3xl opacity-50 group-hover:opacity-80 transition-opacity" />}
            <div className="relative z-10 flex flex-col h-full justify-between">
               <div className="flex items-center justify-between mb-8">
                  <div className={cn("p-5 rounded-2xl shadow-inner transition-transform group-hover:rotate-6", stat.highlight ? "bg-white/10 text-amber-500" : `bg-slate-100 text-slate-600`)} style={{ color: !stat.highlight ? stat.color : undefined }}>
                     <stat.icon className="h-7 w-7" />
                  </div>
                  <div className="h-1 w-12 rounded-full bg-slate-200/20" />
               </div>
               <div>
                  <p className={cn("text-[10px] font-black uppercase tracking-[0.3em] mb-3", stat.highlight ? "text-slate-400" : "text-slate-400")}>{stat.label}</p>
                  <h3 className={cn("text-4xl font-black tracking-tighter tabular-nums drop-shadow-sm leading-none", stat.highlight ? "text-white" : "text-slate-900")}>{stat.value}</h3>
               </div>
            </div>
          </div>
        ))}
      </div>

      <div className="premium-glass rounded-2xl border-white/20 shadow-premium overflow-hidden transition-all duration-700 hover:shadow-2xl">
        <Table>
          <TableHeader>
            <TableRow className="border-none hover:bg-transparent">
              <TableHead className="py-6 px-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Date Segment</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Contextual Details</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Ref ID</TableHead>
              <TableHead className="text-right text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Debit</TableHead>
              <TableHead className="text-right text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Credit</TableHead>
              <TableHead className="text-right px-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Net Exposure</TableHead>
              <TableHead className="w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center py-32 text-slate-400 font-black uppercase tracking-[0.3em] text-[10px]">No historical data found for this khata</TableCell></TableRow>
            ) : (
              entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((entry) => (
                <TableRow key={entry.id} className="group border-b border-slate-50 hover:bg-amber-500/[0.02] transition-all duration-500">
                  <TableCell className="py-8 px-8 font-black text-slate-900 tabular-nums">
                    <div className="flex flex-col">
                      <span className="text-sm">{new Date(entry.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                      <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest mt-0.5">Segment Log</span>
                    </div>
                  </TableCell>
                  <TableCell>
                     <div className="flex flex-col gap-1">
                        <span className="text-[13px] font-black text-slate-700 tracking-tight leading-none group-hover:text-slate-900 transition-colors">{entry.particulars}</span>
                        {entry.createdAt && <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest mt-0.5">{formatDistanceToNow(new Date(entry.createdAt))} ago</span>}
                     </div>
                  </TableCell>
                  <TableCell>
                    {entry.billNo ? (
                      <div className="flex flex-col gap-1">
                        <Badge variant="outline" className="text-[9px] font-black border-slate-200 bg-slate-50 text-slate-500 px-3 py-0.5 rounded-full uppercase tracking-tighter">REF: {entry.billNo}</Badge>
                        <span className="text-[8px] font-bold text-slate-300 uppercase ml-1">Verified Ref</span>
                      </div>
                    ) : (
                      <span className="text-[10px] font-black text-slate-200 uppercase tracking-widest">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-black text-slate-900 tabular-nums text-sm">{entry.debit > 0 ? formatCurrency(entry.debit) : '-'}</TableCell>
                  <TableCell className="text-right font-black text-emerald-600 tabular-nums text-sm">{entry.credit > 0 ? formatCurrency(entry.credit) : '-'}</TableCell>
                  <TableCell className="text-right px-8">
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-sm font-black text-slate-900 tabular-nums tracking-tighter drop-shadow-sm">{formatCurrency(entry.balance)}</span>
                      <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Running Net</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {!entry.billId && (
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                        <EditLedgerEntryDialog entry={entry} onSuccess={loadData} />
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-9 w-9 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all" 
                          onClick={async () => { if (confirm('Archive this specific entry?')) { await dataStore.deleteLedgerEntry(entry.id); loadData(); } }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function EditLedgerEntryDialog({ entry, onSuccess }: { entry: LedgerEntry; onSuccess: () => void }) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ date: entry.date, particulars: entry.particulars, debit: entry.debit, credit: entry.credit });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await dataStore.updateLedgerEntry(entry.id, formData);
    setOpen(false);
    onSuccess();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-300 hover:text-amber-600"><Pencil className="h-4 w-4" /></Button>
      </DialogTrigger>
      <DialogContent className="max-w-md rounded-xl p-0 border-none shadow-2xl overflow-hidden">
        <div className="bg-slate-900 p-8 text-white">
          <DialogTitle className="text-2xl font-black tracking-tight uppercase">Correction Entry</DialogTitle>
          <p className="text-slate-400 text-sm mt-1">Rectify historical journal data for precise balancing.</p>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-4 bg-white">
          <div className="space-y-2"><Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Journal Date</Label><Input type="date" value={formData.date} className="h-12 rounded-xl bg-slate-50 font-bold" onChange={(e) => setFormData({ ...formData, date: e.target.value })} required /></div>
          <div className="space-y-2"><Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Context</Label><Input value={formData.particulars} className="h-12 rounded-xl bg-slate-50 font-bold" onChange={(e) => setFormData({ ...formData, particulars: e.target.value })} required /></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Debit</Label><Input type="number" step="any" value={formData.debit} className="h-12 rounded-xl bg-slate-50 font-bold text-slate-900" onChange={(e) => setFormData({ ...formData, debit: Number(e.target.value) })} required /></div>
            <div className="space-y-2"><Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Credit</Label><Input type="number" step="any" value={formData.credit} className="h-12 rounded-xl bg-slate-50 font-bold text-emerald-600" onChange={(e) => setFormData({ ...formData, credit: Number(e.target.value) })} required /></div>
          </div>
          <div className="flex gap-4 pt-4">
            <Button type="button" variant="outline" className="flex-1 h-12 rounded-xl font-black text-xs uppercase" onClick={() => setOpen(false)}>Abort</Button>
            <Button type="submit" className="flex-1 h-12 gold-gradient text-white font-black text-xs uppercase rounded-xl">Commit Correction</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function PaymentForm({ party, onSuccess }: { party: Party; onSuccess: () => void }) {
  const [formData, setFormData] = useState({ date: new Date().toISOString().split('T')[0], amount: '', description: '', billId: '', stockId: '' });
  const [bills, setBills] = useState<Bill[]>([]);
  const [receipts, setReceipts] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const [allBills, allStock] = await Promise.all([dataStore.getBills(), dataStore.getStock()]);
      if (party.type === 'Buyer') {
        setBills(allBills.filter(b => b.buyerId === party.id && b.status !== 'paid'));
      } else if (party.type === 'Miller') {
        setReceipts(allStock.filter(s => s.millerId === party.id && s.status !== 'paid'));
        setBills(allBills.filter(b => b.millerId === party.id && b.status !== 'paid'));
      }
    };
    loadData();
  }, [party.id, party.type]);

  const selectedBill = bills.find(b => b.id === formData.billId);
  const selectedReceipt = receipts.find(s => s.id === formData.stockId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    const amount = Number(formData.amount);
    if (party.type === 'Buyer') {
      await dataStore.addLedgerEntry({ partyId: party.id, billId: formData.billId || undefined, date: formData.date, particulars: formData.description || `Payment Received${formData.billId ? ' for Bill' : ''}`, debit: 0, credit: amount });
      await dataStore.addCashEntry({ date: formData.date, type: 'in', description: `Received from ${party.name} - ${formData.description}`, debit: 0, credit: amount, billId: formData.billId || undefined });
    } else {
      await dataStore.addLedgerEntry({ partyId: party.id, billId: formData.billId || undefined, stockId: formData.stockId || undefined, date: formData.date, particulars: formData.description || `Payment Made${formData.billId ? ' for Bill' : formData.stockId ? ' for Receipt' : ''}`, debit: 0, credit: amount });
      await dataStore.addCashEntry({ date: formData.date, type: 'out', description: `Payment to ${party.name} - ${formData.description}`, debit: amount, credit: 0, billId: formData.billId || undefined });
    }
    setLoading(false);
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2"><Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Transaction Date</Label><Input type="date" value={formData.date} className="h-12 rounded-xl bg-slate-50 font-black" onChange={(e) => setFormData({ ...formData, date: e.target.value })} required /></div>
      {(bills.length > 0 || receipts.length > 0) && (
        <div className="space-y-2">
          <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Reference Object</Label>
          <Select value={formData.billId || formData.stockId || "none"} onValueChange={(val) => {
            if (val === "none") { setFormData({ ...formData, billId: '', stockId: '' }); }
            else if (bills.some(b => b.id === val)) { setFormData({ ...formData, billId: val, stockId: '' }); }
            else { setFormData({ ...formData, billId: '', stockId: val }); }
          }}>
            <SelectTrigger className="h-12 rounded-xl bg-slate-50 font-bold text-xs"><SelectValue placeholder="General (Unlinked) Transaction" /></SelectTrigger>
            <SelectContent className="rounded-2xl shadow-2xl border-none">
              <SelectItem value="none" className="rounded-xl my-1">General (Unlinked) Transaction</SelectItem>
              {bills.map(bill => <SelectItem key={bill.id} value={bill.id} className="rounded-xl my-1">Bill #{bill.billNumber} ({bill.itemName}) - RS {bill.totalAmount - (bill.paidAmount || 0)} due</SelectItem>)}
              {receipts.map(receipt => <SelectItem key={receipt.id} value={receipt.id} className="rounded-xl my-1">Receipt #{receipt.receiptNumber} ({receipt.itemName}) - RS {receipt.totalAmount - (receipt.paidAmount || 0)} due</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      )}
      {(selectedBill || selectedReceipt) && (
        <div className="bg-slate-900 p-6 rounded-[2rem] text-white relative overflow-hidden shadow-xl">
           <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl" />
           <p className="text-[10px] font-black uppercase tracking-widest text-amber-500 mb-4 flex items-center gap-2"><Plus className="h-3 w-3" /> Settlement Target</p>
           <div className="grid grid-cols-2 gap-y-4">
              <div className="flex flex-col"><span className="text-[9px] font-black text-slate-500 uppercase">Product</span><span className="text-sm font-black">{selectedBill?.itemName || selectedReceipt?.itemName}</span></div>
              <div className="flex flex-col items-end"><span className="text-[9px] font-black text-slate-500 uppercase">Outstanding</span><span className="text-sm font-black text-amber-500">RS {new Intl.NumberFormat().format((selectedBill?.totalAmount || selectedReceipt?.totalAmount || 0) - (selectedBill?.paidAmount || selectedReceipt?.paidAmount || 0))}</span></div>
           </div>
        </div>
      )}
      <div className="space-y-2"><Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Transfer Amount (PKR)</Label><Input type="number" min="0" step="any" placeholder="0.00" className="h-14 rounded-xl bg-slate-50 font-black text-2xl tracking-tighter" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} required /></div>
      <div className="space-y-2"><Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Observation / Note</Label><Input placeholder="Internal memo" className="h-12 rounded-xl bg-slate-50 font-bold" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} /></div>
      <div className="flex gap-4 pt-4">
        <Button type="button" variant="outline" className="flex-1 h-14 rounded-2xl font-black uppercase text-[10px] tracking-widest" onClick={onSuccess}>Abort</Button>
        <Button type="submit" disabled={loading} className={cn("flex-1 h-14 rounded-2xl font-black uppercase text-[10px] tracking-widest text-white shadow-xl", party.type === 'Buyer' ? "bg-emerald-500 shadow-emerald-500/20" : "bg-rose-500 shadow-rose-500/20")}>
          {loading ? "Processing..." : party.type === 'Buyer' ? 'Authorize Receipt' : 'Authorize Disbursement'}
        </Button>
      </div>
    </form>
  );
}
