import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { dataStore } from '@/store/dataStore';
import type { Bill, StockItem } from '@/types';

interface DirectPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'receive' | 'pay';
  item: Bill | StockItem | null;
  partyId: string;
  partyName: string;
  onSuccess: () => void;
}

export function DirectPaymentDialog({ open, onOpenChange, type, item, partyName, onSuccess }: DirectPaymentDialogProps) {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  if (!item) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    
    const numAmount = Number(amount);
    const date = new Date().toISOString().split('T')[0];

    try {
        if (type === 'receive') {
            const bill = item as Bill;
            const linkRef = bill.billNumber.startsWith('B-') ? bill.billNumber : `B-${bill.billNumber}`;
            await dataStore.addCashEntry({
              date,
              type: 'in',
              description: `Received from ${partyName} - ${description || 'Payment'} #${linkRef}`,
              debit: 0,
              credit: numAmount,
              billId: bill.id
            });
        } else {
            const stock = item as StockItem;
            const linkRef = stock.receiptNumber;
            await dataStore.addCashEntry({
              date,
              type: 'out',
              description: `Payment to ${partyName} - ${description || 'Payment'} #${linkRef}`,
              debit: numAmount,
              credit: 0,
            });
        }
        onSuccess();
        onOpenChange(false);
        setAmount('');
        setDescription('');
    } catch (err) {
        console.error(err);
        alert('Payment failed');
    } finally {
        setLoading(false);
    }
  };

  const remaining = item.totalAmount - (item.paidAmount || 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{type === 'receive' ? 'Receive Payment' : 'Make Payment'}</DialogTitle>
          <DialogDescription className="sr-only">
            {type === 'receive' ? `Settle receivables from ${partyName}.` : `Settle payables to ${partyName}.`}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-sm space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500">Party:</span>
              <span className="font-medium text-slate-900">{partyName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">{type === 'receive' ? 'Bill Number:' : 'Receipt Number:'}</span>
              <span className="font-medium text-slate-900">{(item as Bill).billNumber || (item as StockItem).receiptNumber || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Total Amount:</span>
              <span className="font-medium text-slate-900">RS {item.totalAmount.toLocaleString('en-PK', { maximumFractionDigits: 0 })}</span>
            </div>
            <div className="flex justify-between font-bold border-t pt-2 mt-2">
              <span className="text-slate-700">Remaining Balance:</span>
              <span className="text-red-600">RS {remaining.toLocaleString('en-PK', { maximumFractionDigits: 0 })}</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (RS) *</Label>
            <Input
              id="amount"
              type="number"
              min="1"
              step="any"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Input
              id="description"
              placeholder="e.g., Cash payment, Bank transfer"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className={`flex-1 text-white ${type === 'receive' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}`}>
              {type === 'receive' ? 'Receive Amount' : 'Pay Amount'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
