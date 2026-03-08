import { useState, useEffect } from "react";
import { dataStore } from "@/store/dataStore";
import type { StockItem } from "@/types";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Props = {
  stock: StockItem;
  onSuccess: () => void;
};

export default function EditStockForm({ stock, onSuccess }: Props) {
  if (!stock || !stock.id) {
    return <p className="text-red-500">Invalid stock data</p>;
  }

  const [millers, setMillers] = useState<any[]>([]);

  useEffect(() => {
    dataStore.getMillers().then((data) => setMillers(data.filter(m => m.id !== "father")));
  }, []);

  const [formData, setFormData] = useState({
    date: stock.date,
    millerId: stock.millerId,
    itemName: stock.itemName,
    katte: String(stock.katte),
    weightPerKatta: String(stock.weightPerKatta),
    purchaseRate: String(stock.purchaseRate),
    bhardanaRate: String(stock.bhardanaRate || 0),
    rateType: stock.rateType as "per_kg" | "per_katta",
    receiptNumber: stock.receiptNumber || '',
    paymentType: (stock.paymentType || 'cash') as 'cash' | 'credit',
    dueDays: String(stock.dueDays || 30),
    totalWeight: String(stock.totalWeight), 
    minusWeight: String(stock.minusWeight || 0), 
  });

  // Auto-calculate weight when katte or weightPerKatta changes
  useEffect(() => {
    if (formData.katte && formData.weightPerKatta) {
      const grossWeight = Number(formData.katte) * Number(formData.weightPerKatta);
      const deduction = Number(formData.katte) * (Number(formData.minusWeight) || 0);
      const calculatedWeight = (grossWeight - deduction).toFixed(2);
      setFormData(prev => ({ ...prev, totalWeight: calculatedWeight }));
    }
  }, [formData.katte, formData.weightPerKatta, formData.minusWeight]);

  const katte = Number(formData.katte) || 0;
  const weightPerKatta = Number(formData.weightPerKatta) || 0;
  const purchaseRate = Number(formData.purchaseRate) || 0;
  const bhardanaRate = Number(formData.bhardanaRate) || 0;
  const bhardana = katte * bhardanaRate;

  const formatCurrency = (amount: number) =>
    `RS ${new Intl.NumberFormat("en-PK", { maximumFractionDigits: 0 }).format(amount)}`;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const miller = millers.find(m => m.id === formData.millerId);
    if (!miller) return;

    const days = formData.paymentType === 'credit' ? Number(formData.dueDays) : 3;
    const dueDate = new Date(
      new Date(formData.date).getTime() + days * 24 * 60 * 60 * 1000
    ).toISOString().split('T')[0];

    const totalWeightOverride = Number(formData.totalWeight) || (katte * weightPerKatta);

    const payload = {
      date: formData.date,
      millerId: miller.id,
      millerName: miller.name,
      itemName: formData.itemName,
      katte,
      weightPerKatta,
      totalWeight: totalWeightOverride,
      purchaseRate,
      bhardanaRate,
      bhardana,
      minusWeight: Number(formData.minusWeight) || 0,
      rateType: formData.rateType,
      totalAmount: (formData.rateType === "per_kg" ? totalWeightOverride * purchaseRate : katte * purchaseRate) + bhardana,
      receiptNumber: formData.receiptNumber,
      paymentType: formData.paymentType,
      dueDays: days,
      dueDate,
    };

    await dataStore.updateStock(stock.id, payload);
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pt-2">

      {/* Row 1: Date + Miller */}
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label className="text-xs font-extrabold uppercase text-slate-700 ml-1">Arrival Date</Label>
          <Input
            type="date"
            className="h-12 rounded-xl bg-slate-50 border-slate-300 focus:ring-amber-500/20 focus:border-amber-500 font-bold text-slate-900"
            value={formData.date}
            onChange={e => setFormData({ ...formData, date: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs font-extrabold uppercase text-slate-700 ml-1">Miller / Party</Label>
          <Select
            value={formData.millerId}
            onValueChange={value => setFormData({ ...formData, millerId: value })}
          >
            <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-slate-300 focus:ring-amber-500/20 focus:border-amber-500 font-bold text-slate-900">
              <SelectValue placeholder="Select Miller" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-slate-200 shadow-2xl">
              {millers.map(m => (
                <SelectItem key={m.id} value={m.id} className="rounded-xl my-1 focus:bg-amber-50 focus:text-amber-700 font-bold">
                  {m.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Row 2: Item + Receipt Number */}
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label className="text-xs font-black uppercase text-slate-500 ml-1">Item Name</Label>
          <Input
            className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:ring-amber-500/20 focus:border-amber-500 font-bold"
            value={formData.itemName}
            onChange={e => setFormData({ ...formData, itemName: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs font-black uppercase text-slate-500 ml-1">Receipt Number</Label>
          <Input
            className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:ring-amber-500/20 focus:border-amber-500 font-bold font-mono"
            value={formData.receiptNumber}
            onChange={e => setFormData({ ...formData, receiptNumber: e.target.value })}
          />
        </div>
      </div>

      {/* Row 3: Katte + Weight per Katta */}
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label className="text-xs font-black uppercase text-slate-500 ml-1">Total Katte</Label>
          <Input
            type="number"
            min="1"
            className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:ring-amber-500/20 focus:border-amber-500 font-bold"
            value={formData.katte}
            onChange={e => setFormData({ ...formData, katte: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs font-black uppercase text-slate-500 ml-1">Weight per Katta (kg)</Label>
          <Input
            type="number"
            step="any"
            min="0"
            className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:ring-amber-500/20 focus:border-amber-500 font-bold"
            value={formData.weightPerKatta}
            onChange={e => setFormData({ ...formData, weightPerKatta: e.target.value })}
            required
          />
        </div>
      </div>

      {/* Row 4: Purchase Rate + Bhardana Rate */}
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label className="text-xs font-black uppercase text-slate-500 ml-1">Purchase Rate</Label>
          <Input
            type="number"
            step="any"
            min="0"
            className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:ring-amber-500/20 focus:border-amber-500 font-bold text-amber-600"
            value={formData.purchaseRate}
            onChange={e => setFormData({ ...formData, purchaseRate: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs font-black uppercase text-slate-500 ml-1">Bhardana Rate (per Katta)</Label>
          <Input
            type="number"
            step="any"
            min="0"
            className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:ring-amber-500/20 focus:border-amber-500 font-bold"
            value={formData.bhardanaRate}
            onChange={e => setFormData({ ...formData, bhardanaRate: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label className="text-xs font-black uppercase text-slate-500 ml-1">Minus Weight (Per Bag)</Label>
          <Input
            type="number"
            step="any"
            placeholder="e.g. 0.7"
            className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:ring-amber-500/20 focus:border-amber-500 font-bold text-rose-500"
            value={formData.minusWeight}
            onChange={e => setFormData({ ...formData, minusWeight: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs font-black uppercase text-slate-500 ml-1">Rate Type</Label>
          <Select
            value={formData.rateType}
            onValueChange={(v: "per_kg" | "per_katta") => setFormData({ ...formData, rateType: v })}
          >
            <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:ring-amber-500/20 focus:border-amber-500 font-bold">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-2xl">
              <SelectItem value="per_kg" className="rounded-xl my-1">Calculate Per KG</SelectItem>
              <SelectItem value="per_katta" className="rounded-xl my-1">Calculate Per Katta</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Row 6: Payment Type + Credit Days */}
      <div className="grid grid-cols-2 gap-6 p-4 bg-slate-100/50 rounded-2xl border border-slate-200/50 shadow-inner">
        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Payment Type</Label>
          <Select
            value={formData.paymentType}
            onValueChange={(value: 'cash' | 'credit') => setFormData({ ...formData, paymentType: value })}
          >
            <SelectTrigger className="h-12 rounded-xl bg-white border-slate-200 focus:ring-amber-500/20 focus:border-amber-500 font-bold">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-2xl shadow-2xl border-none">
              <SelectItem value="cash" className="rounded-xl my-1">Immediate Cash</SelectItem>
              <SelectItem value="credit" className="rounded-xl my-1">Credit (Udhar)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {formData.paymentType === 'credit' && (
          <div className="space-y-2 animate-in fade-in slide-in-from-left-2 duration-300">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Credit Days</Label>
            <Input
              type="number"
              min="0"
              placeholder="e.g. 30"
              className="h-12 rounded-xl bg-white border-slate-200 focus:ring-amber-500/20 focus:border-amber-500 font-bold"
              value={formData.dueDays}
              onChange={e => setFormData({ ...formData, dueDays: e.target.value })}
            />
          </div>
        )}
      </div>

      {/* Summary Preview */}
      <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <div className="h-2 w-2 rounded-full bg-amber-500" />
          <h5 className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Transaction Summary</h5>
        </div>
        <div className="grid grid-cols-2 gap-y-3 text-sm">
          <div className="flex flex-col gap-1">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Total Weight</span>
            <div className="flex items-baseline gap-1">
              <input
                type="number"
                step="any"
                value={formData.totalWeight}
                onChange={e => setFormData({ ...formData, totalWeight: e.target.value })}
                className="w-28 text-xl font-black text-slate-900 tracking-tighter leading-none bg-transparent border-b-2 border-dashed border-amber-400 focus:outline-none focus:border-amber-600 text-right"
              />
              <span className="text-xs font-bold text-slate-400">KG</span>
            </div>
            <span className="text-[8px] text-slate-300 font-medium">Tap to edit</span>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Standard Weight</span>
            <span className="text-xl font-black text-slate-900 tracking-tighter leading-none tabular-nums">
              {(Number(formData.katte) * Number(formData.weightPerKatta)).toLocaleString()} KG
            </span>
          </div>

          <div className="flex flex-col items-start mt-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Bhardana</span>
            <span className="text-base font-bold text-slate-900">{formatCurrency(bhardana)}</span>
          </div>
          <div className="col-span-2 pt-3 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Net Payable:</span>
              <span className="text-2xl font-bold text-slate-900">
                {formatCurrency(
                  (formData.rateType === "per_kg" ? Number(formData.totalWeight) * purchaseRate : katte * purchaseRate) + bhardana
                )}
              </span>
            </div>
          </div>
        </div>
      </div>

      <Button
        type="submit"
        className="w-full h-14 bg-amber-500 hover:bg-amber-600 text-white font-black rounded-2xl shadow-lg transition-all active:scale-95 uppercase tracking-widest text-xs"
      >
        Update Stock Record
      </Button>
    </form>
  );
}
