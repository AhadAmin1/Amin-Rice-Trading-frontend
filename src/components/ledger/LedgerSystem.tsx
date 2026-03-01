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
  ShoppingBag,
  MapPin
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
import { Card } from '../ui/card';

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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Ledger / Khata Book</h2>
          <p className="text-slate-500 text-sm mt-1">View accounts and manage balances.</p>
        </div>
        <div className="flex items-center gap-3">
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
            <TabsList className="bg-slate-100 p-1 rounded-lg h-auto">
              <TabsTrigger value="all" className="rounded-md px-4 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm font-bold text-xs uppercase tracking-wider">All Accounts</TabsTrigger>
              <TabsTrigger value="buyers" className="rounded-md px-4 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm font-bold text-xs uppercase tracking-wider">Buyers</TabsTrigger>
              <TabsTrigger value="millers" className="rounded-md px-4 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm font-bold text-xs uppercase tracking-wider">Millers</TabsTrigger>
              <TabsTrigger value="expenses" className="rounded-md px-4 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm font-bold text-xs uppercase tracking-wider">Expenses</TabsTrigger>
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
      <div className="text-center py-16 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
        <div className="bg-slate-100 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <BookOpen className="h-8 w-8 text-slate-300" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">No Account Found</h3>
        <p className="text-slate-500 text-sm mt-1">Add a new buyer or miller to begin profiling.</p>
      </div>
    );
  }

  return (
    <div className="overflow-y-auto max-h-[75vh] pr-2 custom-scrollbar border-t pt-6 border-slate-100">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {parties.map((party) => {
        const balance = getBalance(party.id);
        const isReceivable = party.type === 'Buyer' && balance > 0;
        const isPayable = party.type === 'Miller' && balance > 0;
        const isExpense = party.type === 'Expense';

        return (
          <div key={party.id} className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
            <div className="flex items-start justify-between mb-6 gap-2">
              <div className="flex items-start gap-4 flex-1 min-w-0">
                <div className={cn(
                  "w-12 h-12 rounded-lg flex items-center justify-center shrink-0",
                  party.type === 'Buyer' ? 'bg-blue-50 text-blue-600' : 
                  party.type === 'Miller' ? 'bg-amber-50 text-amber-600' :
                  'bg-emerald-50 text-emerald-600'
                )}>
                  {party.type === 'Buyer' ? <User className="h-7 w-7" /> :
                   party.type === 'Miller' ? <Building2 className="h-7 w-7" /> :
                   <Wallet className="h-7 w-7" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-slate-900 tracking-tight truncate leading-tight" title={party.name}>{party.name}</h3>
                  <div className="flex flex-col gap-1 mt-1">
                    <div className="flex items-center gap-2 flex-wrap min-w-0">
                      <span className={cn(
                        "text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border shrink-0",
                        party.type === 'Buyer' ? "bg-blue-50 border-blue-100 text-blue-700" :
                        party.type === 'Miller' ? "bg-amber-50 border-amber-100 text-amber-700" :
                        "bg-emerald-50 border-emerald-100 text-emerald-700"
                      )}>
                        {party.type}
                      </span>
                      {party.phone && (
                        <div className="flex items-center gap-1 min-w-0 max-w-[120px]">
                          <Phone className="h-3 w-3 text-slate-300 shrink-0" />
                          <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap truncate">
                            {party.phone}
                          </span>
                        </div>
                      )}
                    </div>
                    {party.address && (
                      <div className="flex items-center gap-1.5 min-w-0">
                         <MapPin className="h-3 w-3 text-slate-300 shrink-0" />
                         <p className="text-[10px] font-medium text-slate-400 truncate italic" title={party.address}>
                           {party.address}
                         </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-1 shrink-0">
                <EditPartyDialog party={party} onUpdated={() => {onRefresh && onRefresh();}} />
                <Button 
                   size="icon" 
                   variant="ghost" 
                   className="h-8 w-8 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                   onClick={async () => {
                     if (confirm(`Archive and delete ${party.name}?`)) {
                       await dataStore.deleteParty(party.id);
                       onRefresh?.();
                     }
                   }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="mt-auto space-y-4">
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Balance
                  </span>
                  <div className="flex items-center justify-between">
                    <span className={cn(
                      "text-xl font-bold tabular-nums tracking-tight",
                      isReceivable ? 'text-blue-600' : isPayable ? 'text-rose-600' : isExpense ? 'text-emerald-600' : 'text-slate-900'
                    )}>
                      {formatCurrency(Math.abs(balance))}
                    </span>
                    {balance === 0 && (
                      <div className="flex items-center gap-1 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                        <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                        <span className="text-[9px] font-bold text-emerald-600 uppercase">Settled</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <Button 
                variant="outline" 
                className="w-full h-10 rounded-lg border-slate-200 text-slate-600 font-bold text-[10px] uppercase tracking-wider hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                onClick={() => onViewLedger(party.id)}
              >
                View Account
                <ArrowRight className="h-3 w-3" />
              </Button>
            </div>
          </div>
        );
      })}
      </div>
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
        <div className="bg-slate-900 p-6 text-white">
          <DialogTitle className="text-lg font-bold tracking-tight uppercase">Edit Account</DialogTitle>
          <DialogDescription className="text-slate-400 text-xs mt-1">Update details for {party.name}.</DialogDescription>
        </div>
        <div className="p-6 space-y-4 bg-white">
          <div className="space-y-2">
            <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Name</Label>
            <Input value={form.name} className="h-10 rounded-lg bg-slate-50 border-slate-200 font-semibold" onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Phone</Label>
            <Input value={form.phone} className="h-10 rounded-lg bg-slate-50 border-slate-200 font-semibold" onChange={(e) => {
              let val = e.target.value;
              if (!val.startsWith('+92 ')) val = '+92 ' + val.replace(/^\+92\s?/, '');
              setForm({ ...form, phone: val });
            }} />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Address</Label>
            <Input value={form.address} className="h-10 rounded-lg bg-slate-50 border-slate-200 font-semibold" onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </div>
          <div className="flex gap-4 pt-4">
            <Button variant="outline" className="flex-1 h-10 rounded-lg font-bold text-xs uppercase" onClick={() => setOpen(false)}>Cancel</Button>
            <Button className="flex-1 h-10 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs uppercase rounded-lg" onClick={handleSave}>Save</Button>
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
        <Button className="h-10 bg-amber-600 hover:bg-amber-700 text-white font-bold px-6 rounded-lg shadow-sm transition-all flex items-center gap-2">
          <Plus className="h-4 w-4" />
          <span className="uppercase tracking-wider text-xs">Register Party</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg rounded-xl p-0 border-none shadow-2xl overflow-hidden">
        <div className="bg-slate-900 p-6 text-white">
          <DialogTitle className="text-lg font-bold tracking-tight uppercase">New Party Registration</DialogTitle>
          <DialogDescription className="text-slate-400 text-xs mt-1">Add a new account to the system.</DialogDescription>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4 bg-white">
          <div className="space-y-2">
            <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Party Name</Label>
            <Input placeholder="Enter name" className="h-10 rounded-lg bg-slate-50 border-slate-200 font-semibold" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Account Type</Label>
            <Select value={formData.type} onValueChange={value => setFormData({ ...formData, type: value as 'Buyer' | 'Miller' })}>
              <SelectTrigger className="h-10 rounded-lg bg-slate-50 font-semibold border-slate-200"><SelectValue /></SelectTrigger>
              <SelectContent className="rounded-lg shadow-xl border-slate-200"><SelectItem value="Buyer">Buyer (Customer)</SelectItem><SelectItem value="Miller">Miller (Supplier)</SelectItem><SelectItem value="Expense">Expense</SelectItem></SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Phone Number</Label>
            <Input value={formData.phone} className="h-10 rounded-lg bg-slate-50 border-slate-200 font-semibold" onChange={(e) => {
              let val = e.target.value;
              if (!val.startsWith('+92 ')) val = '+92 ' + val.replace(/^\+92\s?/, '');
              setFormData({ ...formData, phone: val });
            }} />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Address / Note</Label>
            <Input className="h-10 rounded-lg bg-slate-50 border-slate-200 font-semibold" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
          </div>
          <div className="flex gap-4 pt-4">
            <Button type="button" variant="outline" className="flex-1 h-10 rounded-lg font-bold text-xs uppercase" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button type="submit" className="flex-1 h-10 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs uppercase rounded-lg">Register</Button>
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
    <div className="space-y-6 pb-10">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="flex items-center gap-4 relative z-10">
           <Button variant="ghost" onClick={onBack} className="h-12 w-12 rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-colors group">
              <ArrowRight className="h-5 w-5 rotate-180 text-slate-600" />
           </Button>
           <div className="space-y-1">
              <div className="flex items-center gap-2">
                 <Badge className={cn("rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider", party.type === 'Buyer' ? "bg-blue-600 text-white" : "bg-amber-600 text-white")}>{party.type}</Badge>
                 <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">ID: {party.id.slice(-6).toUpperCase()}</span>
              </div>
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight">{party.name}</h2>
              {party.phone && <div className="flex items-center gap-2 text-slate-500 font-semibold text-xs transition-colors hover:text-emerald-600"><Phone className="h-3 w-3" /> {party.phone}</div>}
           </div>
        </div>
        <div className="flex items-center gap-3 relative z-10">
           <Button onClick={generatePDF} variant="outline" className="h-10 px-4 rounded-lg border-slate-200 font-bold uppercase tracking-wider text-[10px] text-slate-600 hover:bg-slate-50 flex items-center gap-2">
              <ShareIcon className="h-4 w-4" /> Export
           </Button>
           <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
              <DialogTrigger asChild>
                 <Button className="h-10 px-6 bg-amber-600 hover:bg-amber-700 text-white font-bold uppercase tracking-wider text-[10px] rounded-lg shadow-sm">
                    <Wallet className="h-4 w-4 mr-2" /> Record Payment
                 </Button>
              </DialogTrigger>
              <DialogContent className="max-w-xl rounded-xl p-0 border-none shadow-2xl overflow-hidden">
                 <div className="bg-slate-900 p-6 text-white">
                    <DialogTitle className="text-lg font-bold tracking-tight uppercase">Manual Payment/Recovery</DialogTitle>
                    <p className="text-slate-400 text-xs mt-1">Record a transaction for {party.name}.</p>
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: `Gross ${party.type === 'Buyer' ? 'Sales' : 'Purchase'}`, value: formatCurrency(entries.reduce((sum, e) => sum + (e.debit || 0), 0)), icon: ShoppingBag, color: '#64748b' },
          { label: `Recovered / Paid`, value: formatCurrency(entries.reduce((sum, e) => sum + (e.credit || 0), 0)), icon: CheckCircle2, color: '#10b981' },
          { label: 'Net Balance', value: formatCurrency(currentBalance), icon: Wallet, color: '#f59e0b', highlight: true },
        ].map((stat, i) => (
          <Card key={i} className={cn("p-6 rounded-xl border border-slate-200 shadow-sm transition-colors", stat.highlight ? "bg-amber-50" : "bg-white")}>
            <div className="flex flex-col h-full justify-between">
               <div className="flex items-center justify-between mb-4">
                  <div className={cn("p-2 rounded-lg bg-slate-100 text-slate-600", stat.highlight && "bg-amber-100 text-amber-600")}>
                     <stat.icon className="h-5 w-5" />
                  </div>
               </div>
               <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">{stat.label}</p>
                  <h3 className="text-2xl font-bold tracking-tight text-slate-900 tabular-nums">{stat.value}</h3>
               </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead className="py-3 px-6 text-[10px] font-bold uppercase tracking-wider text-slate-500">Date</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Particulars</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Ref</TableHead>
              <TableHead className="text-right text-[10px] font-bold uppercase tracking-wider text-slate-500">Debit</TableHead>
              <TableHead className="text-right text-[10px] font-bold uppercase tracking-wider text-slate-500">Credit</TableHead>
              <TableHead className="text-right px-6 text-[10px] font-bold uppercase tracking-wider text-slate-500">Balance</TableHead>
              <TableHead className="w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center py-16 text-slate-400 font-bold uppercase tracking-widest text-[10px]">No data found</TableCell></TableRow>
            ) : (
              entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((entry) => (
                <TableRow key={entry.id} className="hover:bg-slate-50 transition-colors">
                  <TableCell className="py-4 px-6 font-bold text-slate-900 tabular-nums text-xs">
                    {new Date(entry.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </TableCell>
                  <TableCell>
                     <div className="flex flex-col">
                        <span className="text-sm font-semibold text-slate-700">{entry.particulars}</span>
                        {entry.createdAt && <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{formatDistanceToNow(new Date(entry.createdAt))} ago</span>}
                     </div>
                  </TableCell>
                  <TableCell>
                    {entry.billNo ? (
                      <Badge variant="secondary" className="text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">#{entry.billNo}</Badge>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-300">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-bold text-slate-900 tabular-nums text-xs">{entry.debit > 0 ? formatCurrency(entry.debit) : '-'}</TableCell>
                  <TableCell className="text-right font-bold text-emerald-600 tabular-nums text-xs">{entry.credit > 0 ? formatCurrency(entry.credit) : '-'}</TableCell>
                  <TableCell className="text-right px-6 font-bold text-slate-900 tabular-nums text-xs">
                    {formatCurrency(entry.balance)}
                  </TableCell>
                  <TableCell>
                    {!entry.billId && (
                      <div className="flex justify-end gap-1">
                        <EditLedgerEntryDialog entry={entry} onSuccess={loadData} />
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-8 w-8 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" 
                          onClick={async () => { if (confirm('Delete this entry?')) { await dataStore.deleteLedgerEntry(entry.id); loadData(); } }}
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
          <div className="space-y-2"><Label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Context</Label><Input value={formData.particulars} className="h-10 rounded-lg bg-slate-50 border-slate-200 font-semibold" onChange={(e) => setFormData({ ...formData, particulars: e.target.value })} required /></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Debit</Label><Input type="number" step="any" value={formData.debit} className="h-10 rounded-lg bg-slate-50 border-slate-200 font-bold text-slate-900" onChange={(e) => setFormData({ ...formData, debit: Number(e.target.value) })} required /></div>
            <div className="space-y-2"><Label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Credit</Label><Input type="number" step="any" value={formData.credit} className="h-10 rounded-lg bg-slate-50 border-slate-200 font-bold text-emerald-600" onChange={(e) => setFormData({ ...formData, credit: Number(e.target.value) })} required /></div>
          </div>
          <div className="flex gap-4 pt-4">
            <Button type="button" variant="outline" className="flex-1 h-10 rounded-lg font-bold text-xs uppercase" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" className="flex-1 h-10 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs uppercase rounded-lg">Save</Button>
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Date</Label>
        <Input type="date" value={formData.date} className="h-10 rounded-lg bg-slate-50 border-slate-200 font-semibold" onChange={(e) => setFormData({ ...formData, date: e.target.value })} required />
      </div>
      {(bills.length > 0 || receipts.length > 0) && (
        <div className="space-y-2">
          <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Reference</Label>
          <Select value={formData.billId || formData.stockId || "none"} onValueChange={(val) => {
            if (val === "none") { setFormData({ ...formData, billId: '', stockId: '' }); }
            else if (bills.some(b => b.id === val)) { setFormData({ ...formData, billId: val, stockId: '' }); }
            else { setFormData({ ...formData, billId: '', stockId: val }); }
          }}>
            <SelectTrigger className="h-10 rounded-lg bg-slate-50 font-semibold text-xs border-slate-200"><SelectValue placeholder="General Transaction" /></SelectTrigger>
            <SelectContent className="rounded-lg shadow-xl border-slate-200">
              <SelectItem value="none">General Transaction</SelectItem>
              {bills.map(bill => <SelectItem key={bill.id} value={bill.id}>Bill #{bill.billNumber} ({bill.itemName}) - RS {bill.totalAmount - (bill.paidAmount || 0)}</SelectItem>)}
              {receipts.map(receipt => <SelectItem key={receipt.id} value={receipt.id}>Receipt #{receipt.receiptNumber} ({receipt.itemName}) - RS {receipt.totalAmount - (receipt.paidAmount || 0)}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      )}
      {(selectedBill || selectedReceipt) && (
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
           <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-2">Settlement Target</p>
           <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-700">{selectedBill?.itemName || selectedReceipt?.itemName}</span>
              <span className="font-bold text-amber-600 uppercase">Due: RS {new Intl.NumberFormat().format((selectedBill?.totalAmount || selectedReceipt?.totalAmount || 0) - (selectedBill?.paidAmount || selectedReceipt?.paidAmount || 0))}</span>
           </div>
        </div>
      )}
      <div className="space-y-2">
        <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Amount (Rs.)</Label>
        <Input type="number" min="0" step="any" placeholder="0.00" className="h-12 rounded-lg bg-slate-50 border-slate-200 font-bold text-xl tracking-tight" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} required />
      </div>
      <div className="space-y-2">
        <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Description</Label>
        <Input placeholder="Internal memo" className="h-10 rounded-lg bg-slate-50 border-slate-200 font-semibold" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
      </div>
      <div className="flex gap-4 pt-4">
        <Button type="button" variant="outline" className="flex-1 h-10 rounded-lg font-bold uppercase text-xs tracking-wider" onClick={onSuccess}>Cancel</Button>
        <Button type="submit" disabled={loading} className={cn("flex-1 h-10 rounded-lg font-bold uppercase text-xs tracking-wider text-white", party.type === 'Buyer' ? "bg-emerald-600" : "bg-rose-600")}>
          {loading ? "Processing..." : party.type === 'Buyer' ? 'Receive' : 'Pay'}
        </Button>
      </div>
    </form>
  );
}
