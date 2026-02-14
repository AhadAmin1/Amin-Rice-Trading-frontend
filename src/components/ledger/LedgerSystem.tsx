import { useEffect, useState } from 'react';
import { Search, BookOpen, Eye, User, Building2, ArrowRight, Plus, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { dataStore } from '@/store/dataStore';
import type { Party, LedgerEntry, ViewType } from '@/types';
import { Pencil, Trash2, Share2 as ShareIcon } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface LedgerSystemProps {
  onNavigate: (view: ViewType, partyId?: string) => void;
}

export function LedgerSystem({ onNavigate }: LedgerSystemProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [parties, setParties] = useState<Party[]>([]);

  const [balances, setBalances] = useState<Record<string, number>>({});

  const refreshParties = async () => {
    const [fetchedParties, fetchedBalances] = await Promise.all([
      dataStore.getParties(),
      dataStore.getPartyBalances()
    ]);
    setParties(fetchedParties.filter(p => p.id !== 'father'));
    setBalances(fetchedBalances);
  };

  useEffect(() => {
    refreshParties();
  }, []);

  const filteredParties = parties.filter(party => 
    party.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const millers = filteredParties.filter(p => p.type === 'Miller');
  const buyers = filteredParties.filter(p => p.type === 'Buyer');

  const getPartyBalance = (partyId: string) => {
    return balances[partyId] || 0;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Ledger (Khata Book)</h2>
          <p className="text-slate-500 mt-1">Manage party accounts and transactions</p>
        </div>
        <AddPartyDialog onSuccess={refreshParties} />
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Search parties..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="all">All Parties</TabsTrigger>
          <TabsTrigger value="buyers">Buyers</TabsTrigger>
          <TabsTrigger value="millers">Millers</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <PartiesGrid 
            parties={filteredParties} 
            onViewLedger={(partyId) => onNavigate('party-ledger', partyId)}
            getBalance={getPartyBalance}
            onRefresh={refreshParties}
          />
        </TabsContent>

        <TabsContent value="buyers" className="space-y-4">
          <PartiesGrid 
            parties={buyers} 
            onViewLedger={(partyId) => onNavigate('party-ledger', partyId)}
            getBalance={getPartyBalance}
            onRefresh={refreshParties}
          />
        </TabsContent>

        <TabsContent value="millers" className="space-y-4">
          <PartiesGrid 
            parties={millers} 
            onViewLedger={(partyId) => onNavigate('party-ledger', partyId)}
            getBalance={getPartyBalance}
            onRefresh={refreshParties}
          />
        </TabsContent>
      </Tabs>
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
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    maximumFractionDigits: 0,
  }).format(amount);
};

  if (parties.length === 0) {
    return (
      <div className="text-center py-12 bg-slate-50 rounded-lg">
        <BookOpen className="h-12 w-12 mx-auto mb-3 text-slate-300" />
        <p className="text-slate-500">No parties found</p>
      </div>
    );
  }

  function EditPartyDialog({
  party,
  onUpdated,
}: {
  party: Party;
  onUpdated: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: party.name,
    phone: party.phone || '',
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
        <Button size="icon" variant="ghost">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Party</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div>
            <Label>Name</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div>
            <Label>Phone</Label>
            <Input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>

          <div>
            <Label>Address</Label>
            <Input
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button className="flex-1 bg-amber-500 text-white" onClick={handleSave}>
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}


  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {parties.map((party) => {
        const balance = getBalance(party.id);
        const isReceivable = party.type === 'Buyer' && balance > 0;
        const isPayable = party.type === 'Miller' && balance > 0;

        return (
          <Card key={party.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
            <div className="flex items-start justify-between">
  <div className="flex items-center gap-3">
    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
      party.type === 'Buyer' ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'
    }`}>
      {party.type === 'Buyer'
        ? <User className="h-5 w-5" />
        : <Building2 className="h-5 w-5" />
      }
    </div>

    <div>
      <h3 className="font-medium text-slate-900">{party.name}</h3>
      <Badge variant="secondary" className="mt-1">
        {party.type}
      </Badge>
    </div>
  </div>

  {/* ACTION BUTTONS */}
  <div className="flex gap-1">
    <EditPartyDialog
      party={party}
      onUpdated={() => {onRefresh && onRefresh();}}
    />

    <Button
      size="icon"
      variant="ghost"
      className="text-red-500 hover:bg-red-50"
      onClick={async () => {
        if (confirm(`Delete ${party.name}?`)) {
          await dataStore.deleteParty(party.id);
          onRefresh?.();
        }
      }}
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  </div>
</div>



              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">
                    {isReceivable ? 'Receivable:' : isPayable ? 'Payable:' : 'Balance:'}
                  </span>
                  <span className={`font-bold ${
                    isReceivable ? 'text-blue-600' : isPayable ? 'text-red-600' : 'text-slate-900'
                  }`}>
                    {formatCurrency(balance)}
                  </span>
                </div>
              </div>

              <Button 
                variant="outline" 
                className="w-full mt-4"
                onClick={() => onViewLedger(party.id)}
              >
                <Eye className="h-4 w-4 mr-2" />
                View Ledger
                <ArrowRight className="h-4 w-4 ml-auto" />
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}


function AddPartyDialog({ onSuccess }: { onSuccess: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'Buyer' as 'Buyer' | 'Miller',
    phone: '',
    address: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await dataStore.addParty({
      name: formData.name,
      type: formData.type,
      phone: formData.phone,
      address: formData.address,
    });

    setIsOpen(false);
    setFormData({ name: '', type: 'Buyer', phone: '', address: '' });
    onSuccess();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-amber-500 hover:bg-amber-600 text-white">
          <Plus className="h-4 w-4 mr-2" />
          Add Party
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add New Party</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Party Name *</Label>
            <Input
              id="name"
              placeholder="Enter party name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Party Type *</Label>
            <Select 
              value={formData.type}
              onValueChange={value => setFormData({ ...formData, type: value as 'Buyer' | 'Miller' })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select party type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Buyer">Buyer (Customer)</SelectItem>
                <SelectItem value="Miller">Miller (Supplier)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              placeholder="e.g., 9876543210"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              placeholder="Enter address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1 bg-amber-500 hover:bg-amber-600 text-white">
              Add Party
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Party Ledger Detail View
interface PartyLedgerProps {
  partyId: string;
  onBack: () => void;
}

export function PartyLedger({ partyId, onBack }: PartyLedgerProps) {
  const [party, setParty] = useState<Party | null>(null);
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const parties = await dataStore.getParties();
      const p = parties.find(p => p.id === partyId);
      if (p) {
        setParty(p);
        const entries = await dataStore.getPartyLedger(partyId);
        setEntries(entries);
      }
    };
    loadData();
  }, [partyId]);

   const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    maximumFractionDigits: 0,
  }).format(amount);
};

  const currentBalance = entries.length > 0 ? entries[entries.length - 1].balance : 0;

  const generatePDF = async () => {
    if (!party) return;
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(40, 44, 52);
    doc.text("Amin Rice Trading", 105, 15, { align: "center" });
    
    doc.setFontSize(14);
    doc.text(`Ledger Report: ${party.name}`, 105, 25, { align: "center" });
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 32, { align: "center" });
    
    // Party Details
    doc.setFontSize(11);
    doc.setTextColor(0);
    doc.text(`Party: ${party.name}`, 14, 45);
    doc.text(`Phone: ${party.phone || 'N/A'}`, 14, 50);
    doc.text(`Type: ${party.type}`, 14, 55);
    doc.text(`Balance: ${formatCurrency(currentBalance)}`, 196, 55, { align: "right" });

    // Table
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
      columnStyles: {
        4: { halign: 'right' },
        5: { halign: 'right' },
        6: { halign: 'right', fontStyle: 'bold' }
      }
    });

    // Save/Share
    const pdfBlob = doc.output('blob');
    const fileName = `Ledger_${party.name.replace(/\s+/g, '_')}.pdf`;
    
    if (navigator.share && navigator.canShare && navigator.canShare({ files: [new File([pdfBlob], fileName, { type: 'application/pdf' })] })) {
        const file = new File([pdfBlob], fileName, { type: 'application/pdf' });
        try {
            await navigator.share({
                files: [file],
                title: `${party.name} - Ledger`,
                text: `Attached is the ledger for ${party.name} from Amin Rice Trading.`
            });
        } catch (err) {
            console.log("Share failed, downloading instead.");
            doc.save(fileName);
        }
    } else {
        doc.save(fileName);
        alert("PDF Downloaded. Please share it manually on WhatsApp.");
    }
  };

  if (!party) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onBack}>
            ← Back
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{party.name}</h2>
            <p className="text-slate-500 mt-1">
              <Badge variant={party.type === 'Buyer' ? 'default' : 'secondary'}>
                {party.type}
              </Badge>
              {party.phone && <span className="ml-2">📞 {party.phone}</span>}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
           <Button onClick={generatePDF} className="bg-green-600 hover:bg-green-700 text-white">
            <ShareIcon className="h-4 w-4 mr-2" />
            Share Ledger PDF
          </Button>
          <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-amber-500 hover:bg-amber-600 text-white">
                <Wallet className="h-4 w-4 mr-2" />
                {party.type === 'Buyer' ? 'Receive Payment' : 'Make Payment'}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>
                  {party.type === 'Buyer' ? 'Receive from Buyer' : 'Pay to Miller'}
                </DialogTitle>
              </DialogHeader>
              <PaymentForm 
                party={party}
                onSuccess={async () => {
                  setIsPaymentDialogOpen(false);
                  const entries = await dataStore.getPartyLedger(partyId);
                  setEntries(entries);
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Balance Card */}
      <Card className={`${
        party.type === 'Buyer' 
          ? currentBalance > 0 ? 'bg-blue-50 border-blue-200' : 'bg-green-50 border-green-200'
          : currentBalance > 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'
      }`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">
                {party.type === 'Buyer' 
                  ? currentBalance > 0 ? 'Amount Receivable' : 'Advance Received'
                  : currentBalance > 0 ? 'Amount Payable' : 'Advance Paid'
                }
              </p>
              <p className={`text-3xl font-bold mt-1 ${
                party.type === 'Buyer'
                  ? currentBalance > 0 ? 'text-blue-600' : 'text-green-600'
                  : currentBalance > 0 ? 'text-red-600' : 'text-green-600'
              }`}>
                {formatCurrency(currentBalance)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-600">Total Transactions</p>
              <p className="text-2xl font-bold text-slate-900">{entries.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ledger Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead>Date</TableHead>
              <TableHead>Particulars</TableHead>
              <TableHead>Bill No</TableHead>
              <TableHead className="text-right">Katte</TableHead>
              <TableHead className="text-right">Weight</TableHead>
              <TableHead className="text-right">Rate</TableHead>
              <TableHead className="text-right">
                {party.type === 'Buyer' ? 'Debit (Received)' : 'Debit (Purchase)'}
              </TableHead>
              <TableHead className="text-right">
                {party.type === 'Buyer' ? 'Credit (Sale)' : 'Credit (Paid)'}
              </TableHead>
              <TableHead className="text-right">Balance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-slate-500">
                  <BookOpen className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                  <p>No ledger entries yet</p>
                </TableCell>
              </TableRow>
            ) : (
              entries.map((entry) => (
                <TableRow key={entry.id} className="hover:bg-slate-50">
                  <TableCell>{entry.date}</TableCell>
                  <TableCell className="font-medium">{entry.particulars}</TableCell>
                  <TableCell>
                    {entry.billNo ? (
                      <Badge variant="secondary">{entry.billNo}</Badge>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">{entry.katte || '-'}</TableCell>
                  <TableCell className="text-right">
                    {entry.weight ? `${entry.weight.toFixed(0)} kg` : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    {entry.rate ? `RS ${entry.rate}` : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    {entry.debit > 0 ? formatCurrency(entry.debit) : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    {entry.credit > 0 ? formatCurrency(entry.credit) : '-'}
                  </TableCell>
                  <TableCell className="text-right font-bold">
                    {formatCurrency(entry.balance)}
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

function PaymentForm({ party, onSuccess }: { party: Party; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: '',
    description: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const amount = Number(formData.amount);
    
    if (party.type === 'Buyer') {
      await dataStore.receiveFromBuyer(party.id, amount, formData.date, formData.description);
    } else {
      await dataStore.payMiller(party.id, amount, formData.date, formData.description);
    }

    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
        <Label htmlFor="amount">Amount (RS) *</Label>
        <Input
          id="amount"
          type="number"
          min="0"
          step="0.01"
          placeholder="Enter amount"
          value={formData.amount}
          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          placeholder="e.g., Cash payment, Bank transfer"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="outline" className="flex-1" onClick={onSuccess}>
          Cancel
        </Button>
        <Button 
          type="submit" 
          className={`flex-1 text-white ${
            party.type === 'Buyer'
              ? 'bg-green-500 hover:bg-green-600'
              : 'bg-red-500 hover:bg-red-600'
          }`}
        >
          {party.type === 'Buyer' ? 'Receive Payment' : 'Make Payment'}
        </Button>
      </div>
    </form>
  );
}



// const refreshParties = () => {
//   setParties(
//     dataStore.getParties().filter(p => p.id !== 'father')
//   );
// };

