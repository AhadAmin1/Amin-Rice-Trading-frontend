import { useEffect, useState } from 'react';
import { Plus, Search, Package, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { dataStore } from '@/store/dataStore';
import type { StockItem } from '@/types';
import { Pencil, Trash2 } from 'lucide-react';
import EditStockForm from "@/components/editStockForm";



export function StockManagement() {
  const [stock, setStock] = useState<StockItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingStock, setEditingStock] = useState<StockItem | null>(null);
const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);




  useEffect(() => {
    loadStock();
  }, []);


  const loadStock = async () => {
    const data = await dataStore.getStock();
    setStock(data);
  };




  const filteredStock = stock.filter(item => 
    item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.millerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

 const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    maximumFractionDigits: 0,
  }).format(amount);
};





  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Stock / Maal Book</h2>
          <p className="text-slate-500 mt-1">Manage your rice inventory</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-amber-500 hover:bg-amber-600 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Add Stock
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Stock</DialogTitle>
            </DialogHeader>
            <AddStockForm 
              onSuccess={() => {
                setIsAddDialogOpen(false);
                loadStock();
              }} 
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Katte</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {stock.reduce((sum, s) => sum + s.remainingKatte, 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Weight</CardTitle>
          </CardHeader>
      <CardContent>
  <div className="text-2xl font-bold text-slate-900">
    {stock.reduce((sum, s) => sum + s.remainingWeight, 0).toFixed(2)} kg
  </div>
</CardContent>

        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Stock Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {formatCurrency(stock.reduce((sum, s) => sum + (s.remainingKatte * s.totalAmount / s.katte), 0))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Search by item name or miller..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Stock Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead>Date</TableHead>
              <TableHead>Miller</TableHead>
              <TableHead>Item</TableHead>
              <TableHead className="text-right">Katte</TableHead>
              <TableHead className="text-right">Weight (kg)</TableHead>
              <TableHead className="text-right">Rate</TableHead>
              <TableHead className="text-right">Bhardana</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-center">Status</TableHead>
            </TableRow>
          </TableHeader>
         <TableBody>
  {filteredStock.length === 0 ? (
    <TableRow>
      <TableCell colSpan={9} className="text-center py-8 text-slate-500">
        <Package className="h-12 w-12 mx-auto mb-3 text-slate-300" />
        <p>No stock found</p>
      </TableCell>
    </TableRow>
  ) : (
    filteredStock.map((item) => (
      <TableRow key={item.id} className="hover:bg-slate-50">
        <TableCell>{item.date}</TableCell>
        <TableCell className="font-medium">{item.millerName}</TableCell>
        <TableCell>{item.itemName}</TableCell>
        <TableCell className="text-right">
          <span className={item.remainingKatte === 0 ? 'text-slate-400' : 'text-slate-900'}>
            {item.remainingKatte}
          </span>
          <span className="text-slate-400 text-sm"> / {item.katte}</span>
        </TableCell>
        <TableCell className="text-right">
          {item.remainingWeight.toFixed(0)}
          <span className="text-slate-400 text-sm"> / {item.totalWeight.toFixed(0)}</span>
        </TableCell>
        <TableCell className="text-right">
          {formatCurrency(item.purchaseRate)}/{item.rateType === 'per_kg' ? 'kg' : 'katte'}
        </TableCell>
        <TableCell className="text-right text-slate-600">
          {formatCurrency(item.bhardana || 0)}
        </TableCell>
        <TableCell className="text-right font-medium">
          {formatCurrency(item.totalAmount)}
        </TableCell>
        <TableCell className="text-center">
          {item.remainingKatte === 0 ? (
            <Badge variant="secondary" className="bg-slate-200 text-slate-600">
              Sold Out
            </Badge>
          ) : item.remainingKatte < item.katte * 0.2 ? (
            <Badge variant="destructive" className="flex items-center gap-1 w-fit mx-auto">
              <AlertCircle className="h-3 w-3" />
              Low
            </Badge>
          ) : (
            <Badge variant="default" className="bg-green-500">
              Available
            </Badge>
          )}
        </TableCell>

        {/* ✅ Actions Column */}
        <TableCell className="text-center">
          <div className="flex justify-center gap-2">
            {/* Edit Button */}
        <Button
  size="icon"
  variant="outline"
  onClick={() => {
    setEditingStock(item);
    setIsEditDialogOpen(true);
  }}
>
  <Pencil className="h-4 w-4" />
</Button>


{editingStock && (
  <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
    <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Edit Stock</DialogTitle>
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



            {/* Delete Button */}
            <Button
              size="icon"
              variant="destructive"
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
  );
}

function AddStockForm({ onSuccess }: { onSuccess: () => void }) {
  const [millers, setMillers] = useState<any[]>([]);

  useEffect(() => {
    dataStore.getMillers().then(setMillers);
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
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const miller = millers.find(m => m.id === formData.millerId);
    if (!miller) return;

    const katte = Number(formData.katte);
    const weightPerKatta = Number(formData.weightPerKatta);
    const purchaseRate = Number(formData.purchaseRate);
    const totalWeight = katte * weightPerKatta;
    
    const totalAmount = formData.rateType === 'per_kg' 
      ? totalWeight * purchaseRate 
      : katte * purchaseRate;

    await dataStore.addStock({
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
    } as any);

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
          <Label htmlFor="miller">Miller *</Label>
          <Select 
            value={formData.millerId} 
            onValueChange={(value) => setFormData({ ...formData, millerId: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Miller" />
            </SelectTrigger>
            <SelectContent>
              {millers.map((miller) => (
                <SelectItem key={miller.id} value={miller.id}>
                  {miller.name}
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
      </div>

      <div className="grid grid-cols-2 gap-4">
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
        <div className="bg-slate-50 p-4 rounded-lg space-y-2">
          <p className="text-sm font-medium text-slate-700">Preview:</p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <span className="text-slate-600">Total Weight:</span>
            <span className="font-medium text-right">
              {(Number(formData.katte) * Number(formData.weightPerKatta)).toFixed(0)} kg
            </span>
             <span className="text-slate-600">Bhardana:</span>
            <span className="font-medium text-right">
              {new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(Number(formData.katte) * (Number(formData.bhardanaRate) || 0))}
            </span>
            <span className="text-slate-600">Total Amount:</span>
            <span className="font-medium text-right">
 {new Intl.NumberFormat('en-PK', {
  style: 'currency',
  currency: 'PKR',
  maximumFractionDigits: 0,
}).format(
  (formData.rateType === 'per_kg'
    ? Number(formData.katte) * Number(formData.weightPerKatta) * Number(formData.purchaseRate)
    : Number(formData.katte) * Number(formData.purchaseRate)) + (Number(formData.katte) * (Number(formData.bhardanaRate) || 0))
)}
</span>

          </div>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="outline" className="flex-1" onClick={onSuccess}>
          Cancel
        </Button>
        <Button type="submit" className="flex-1 bg-amber-500 hover:bg-amber-600 text-white">
          Add Stock
        </Button>
      </div>
    </form>
  );
}
