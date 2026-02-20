import { useEffect, useState } from 'react';
import { Plus, Search, Wallet, ArrowDownLeft, ArrowUpRight, TrendingUp, TrendingDown, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { dataStore } from '@/store/dataStore';
import type { CashEntry } from '@/types';
import { formatDistanceToNow } from 'date-fns';

export function CashBook() {
  const [entries, setEntries] = useState<CashEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  useEffect(() => {
    loadEntries();
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
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    maximumFractionDigits: 0,
  }).format(amount);
};

  const totalDebit = entries.reduce((sum, e) => sum + e.debit, 0);
  const totalCredit = entries.reduce((sum, e) => sum + e.credit, 0);
  const currentBalance = entries.length > 0 ? entries[entries.length - 1].balance : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Cash Book</h2>
          <p className="text-slate-500 mt-1">Track all cash transactions</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-amber-500 hover:bg-amber-600 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Add Entry
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Cash Entry</DialogTitle>
            </DialogHeader>
            <AddCashForm 
              onSuccess={() => {
                setIsAddDialogOpen(false);
                loadEntries();
              }} 
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              Total Cash In
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalDebit)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-red-500" />
              Total Cash Out
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(totalCredit)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
              <Wallet className="h-4 w-4 text-amber-500" />
              Current Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${currentBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(currentBalance)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Entries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{entries.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="all">All Entries</TabsTrigger>
          <TabsTrigger value="in">Cash In</TabsTrigger>
          <TabsTrigger value="out">Cash Out</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search entries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <CashEntriesTable entries={filteredEntries} onRefresh={loadEntries} />
        </TabsContent>

        <TabsContent value="in" className="space-y-4">
          <CashEntriesTable entries={filteredEntries.filter(e => e.debit > 0)} onRefresh={loadEntries} />
        </TabsContent>

        <TabsContent value="out" className="space-y-4">
          <CashEntriesTable entries={filteredEntries.filter(e => e.credit > 0)} onRefresh={loadEntries} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function CashEntriesTable({ entries, onRefresh }: { entries: CashEntry[]; onRefresh?: () => void }) {
 const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    maximumFractionDigits: 0,
  }).format(amount);
};

  if (entries.length === 0) {
    return (
      <div className="text-center py-12 bg-slate-50 rounded-lg">
        <Wallet className="h-12 w-12 mx-auto mb-3 text-slate-300" />
        <p className="text-slate-500">No entries found</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50">
            <TableHead>Date</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Reference</TableHead>
            <TableHead className="text-right">Cash In</TableHead>
            <TableHead className="text-right">Cash Out</TableHead>
            <TableHead className="text-right">Balance</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((entry) => (
            <TableRow key={entry.id} className="hover:bg-slate-50">
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium">{entry.date}</span>
                  <span className="text-xs text-slate-400">
                    {entry.createdAt ? formatDistanceToNow(new Date(entry.createdAt), { addSuffix: true }) : ''}
                  </span>
                </div>
              </TableCell>
              <TableCell className="font-medium">{entry.description}</TableCell>
              <TableCell>
                {entry.billReference ? (
                  <Badge variant="secondary">{entry.billReference}</Badge>
                ) : (
                  <span className="text-slate-400">-</span>
                )}
              </TableCell>
              <TableCell className="text-right">
                {entry.debit > 0 ? (
                  <span className="text-green-600 font-medium flex items-center justify-end gap-1">
                    <ArrowDownLeft className="h-4 w-4" />
                    {formatCurrency(entry.debit)}
                  </span>
                ) : (
                  <span className="text-slate-300">-</span>
                )}
              </TableCell>
              <TableCell className="text-right">
                {entry.credit > 0 ? (
                  <span className="text-red-600 font-medium flex items-center justify-end gap-1">
                    <ArrowUpRight className="h-4 w-4" />
                    {formatCurrency(entry.credit)}
                  </span>
                ) : (
                  <span className="text-slate-300">-</span>
                )}
              </TableCell>
              <TableCell className="text-right font-bold">
                {formatCurrency(entry.balance)}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  <EditCashEntryDialog entry={entry} onSuccess={() => onRefresh?.()} />
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={async () => {
                      if (confirm('Delete this cash entry?')) {
                        await dataStore.deleteCashEntry(entry.id);
                        onRefresh?.();
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function EditCashEntryDialog({ entry, onSuccess }: { entry: CashEntry; onSuccess: () => void }) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    date: entry.date,
    description: entry.description,
    debit: entry.debit,
    credit: entry.credit,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await dataStore.updateCashEntry(entry.id, formData);
    setOpen(false);
    onSuccess();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-slate-600">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Cash Entry</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-date">Date</Label>
            <Input
              id="edit-date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-description">Description</Label>
            <Input
              id="edit-description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-debit">Cash In</Label>
              <Input
                id="edit-debit"
                type="number"
                value={formData.debit}
                onChange={(e) => setFormData({ ...formData, debit: Number(e.target.value) })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-credit">Cash Out</Label>
              <Input
                id="edit-credit"
                type="number"
                value={formData.credit}
                onChange={(e) => setFormData({ ...formData, credit: Number(e.target.value) })}
                required
              />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1 bg-amber-500 hover:bg-amber-600 text-white">
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AddCashForm({ onSuccess }: { onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    type: 'in' as 'in' | 'out',
    amount: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const amount = Number(formData.amount);
    
    await dataStore.addCashEntry({
      date: formData.date,
      description: formData.description,
      debit: formData.type === 'in' ? amount : 0,
      credit: formData.type === 'out' ? amount : 0,
    });

    onSuccess();
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
          <Label htmlFor="type">Type *</Label>
          <Select 
            value={formData.type}
            onValueChange={value => setFormData({ ...formData, type: value as 'in' | 'out' })}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="in">Cash In (Received)</SelectItem>
              <SelectItem value="out">Cash Out (Paid)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description *</Label>
        <Input
          id="description"
          placeholder="e.g., Received from buyer, Paid to miller"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">Amount (₹) *</Label>
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

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="outline" className="flex-1" onClick={onSuccess}>
          Cancel
        </Button>
        <Button 
          type="submit" 
          className={`flex-1 text-white ${
            formData.type === 'in' 
              ? 'bg-green-500 hover:bg-green-600' 
              : 'bg-red-500 hover:bg-red-600'
          }`}
        >
          {formData.type === 'in' ? 'Add Cash In' : 'Add Cash Out'}
        </Button>
      </div>
    </form>
  );
}
