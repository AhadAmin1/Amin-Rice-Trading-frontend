import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { dataStore } from "@/store/dataStore";
import type { Party, StockItem, Bill } from "@/types";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

type CreateBillFormProps = {
  parties: Party[];
  stocks: StockItem[];
  onSuccess: (bill: Bill) => void;
};

export function CreateBillForm({ parties, stocks, onSuccess }: CreateBillFormProps) {
  const [formData, setFormData] = useState({
    buyerId: "",
    stockId: "",
    katte: "",
    rate: "",
    bhardanaRate: "",
    rateType: "per_kg" as 'per_kg' | 'per_katta',
    billNo: "",
    paymentType: 'cash' as 'cash' | 'credit',
    dueDays: '0',
    date: new Date().toISOString().split('T')[0],
  });

  const [loading, setLoading] = useState(false);

  const selectedStock = stocks.find(s => s.id === formData.stockId);
  const katte = Number(formData.katte) || 0;
  const rate = Number(formData.rate) || 0;
  const bhardanaRate = Number(formData.bhardanaRate) || 0;
  const bhardana = katte * bhardanaRate;
  const totalWeight = selectedStock ? katte * selectedStock.weightPerKatta : 0;
  
  const rawAmount = formData.rateType === 'per_kg' ? totalWeight * rate : katte * rate;
  const totalAmount = rawAmount + bhardana;
  
  const purchaseCost = selectedStock 
    ? totalWeight * (selectedStock.totalAmount / selectedStock.totalWeight)
    : 0;
  const profit = totalAmount - purchaseCost;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  useEffect(() => {
    if (parties.length > 0 && !formData.buyerId) {
      setFormData(prev => ({ ...prev, buyerId: parties[0].id }));
    }
  }, [parties]);

  useEffect(() => {
    const availableStocks = stocks.filter(s => s.remainingKatte > 0);
    if (availableStocks.length > 0 && !formData.stockId) {
      setFormData(prev => ({ ...prev, stockId: availableStocks[0].id }));
    }

    // Fetch next bill number
    dataStore.getNextBillNumber().then(num => {
      setFormData(prev => ({ ...prev, billNo: num }));
    });
  }, [stocks]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const selectedStock = stocks.find(s => s.id === formData.stockId);
      const buyer = parties.find(b => b.id === formData.buyerId);
      
      if (!selectedStock || !buyer) {
          alert("Selection missing");
          setLoading(false);
          return;
      }

      const katte = Number(formData.katte);
      if (katte > selectedStock.remainingKatte) {
          alert("Insufficient stock in warehouse");
          setLoading(false);
          return;
      }

      const weightPerKatta = selectedStock.weightPerKatta;
      const totalWeight = katte * weightPerKatta;
      const bhardanaRate = Number(formData.bhardanaRate) || 0;
      const bhardana = katte * bhardanaRate;
      const rawAmount = formData.rateType === 'per_kg' ? totalWeight * Number(formData.rate) : katte * Number(formData.rate);
      const totalAmount = rawAmount + bhardana;
      const costPerKg = selectedStock.totalAmount / selectedStock.totalWeight;
      const calculatedPurchaseCost = totalWeight * costPerKg;
      const profit = totalAmount - calculatedPurchaseCost;

      const days = formData.paymentType === 'credit' ? Number(formData.dueDays) : 3;
      const baseDate = new Date(formData.date);
      const dueDate = new Date(baseDate.getTime() + days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const bill = await dataStore.addBill({
        buyerId: formData.buyerId,
        buyerName: buyer.name,
        millerId: selectedStock.millerId,
        millerName: selectedStock.millerName,
        date: formData.date,
        itemName: selectedStock.itemName,
        stockId: selectedStock.id,
        katte,
        weightPerKatta,
        weight: totalWeight,
        rate: Number(formData.rate),
        bhardanaRate,
        bhardana,
        rateType: formData.rateType,
        totalAmount,
        purchaseCost: calculatedPurchaseCost,
        profit,
        billNumber: formData.billNo || undefined,
        paymentType: formData.paymentType,
        dueDays: days,
        dueDate,
      } as any);

      onSuccess(bill);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Bill Date</Label>
          <Input 
            type="date"
            className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:ring-amber-500/20 focus:border-amber-500 font-bold"
            value={formData.date} 
            onChange={e => setFormData({ ...formData, date: e.target.value })} 
            required 
          />
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Bill Number</Label>
          <Input 
            placeholder="Next Bill Number..."
            className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:ring-amber-500/20 focus:border-amber-500 font-extrabold text-amber-600"
            value={formData.billNo} 
            onChange={e => setFormData({ ...formData, billNo: e.target.value })} 
            required 
          />
        </div>

        <div className="space-y-2 col-span-2">
          <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Select Buyer</Label>
          <Select 
              value={formData.buyerId} 
              onValueChange={value => setFormData({ ...formData, buyerId: value })}
          >
            <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:ring-amber-500/20 focus:border-amber-500 font-bold">
              <SelectValue placeholder="Select target buyer" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-slate-200 shadow-2xl">
              {parties.map(p => (
                <SelectItem key={p.id} value={p.id} className="rounded-xl my-1 focus:bg-amber-50 focus:text-amber-700 font-bold">
                  <div className="flex items-center gap-2">
                    <span>{p.name}</span>
                    <span className={cn(
                      "text-[8px] px-1.5 py-0.5 rounded-full font-black uppercase tracking-tighter",
                      p.type === 'Miller' ? "bg-blue-100 text-blue-700" : "bg-emerald-100 text-emerald-700"
                    )}>
                      {p.type}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 col-span-2">
          <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Select Stock Source</Label>
          <Select 
              value={formData.stockId} 
              onValueChange={value => setFormData({ ...formData, stockId: value })}
          >
            <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:ring-amber-500/20 focus:border-amber-500 font-bold">
              <SelectValue placeholder="Select stock batch" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-slate-200 shadow-2xl">
              {stocks.filter(s => s.remainingKatte > 0).map(s => (
                <SelectItem key={s.id} value={s.id} className="rounded-xl my-1 focus:bg-amber-50 focus:text-amber-700">
                  <div className="flex flex-col">
                    <span className="font-bold">{s.itemName}</span>
                    <span className="text-[9px] uppercase opacity-60">Miller: {s.millerName} | Available: {s.remainingKatte}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

       {selectedStock && (
         <div className="premium-glass p-6 rounded-[2rem] border-white/20 shadow-inner group transition-all duration-700 animate-in fade-in slide-in-from-top-4">
            <div className="h-12 w-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center shadow-inner group-active:scale-95 transition-all">
              <Info className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-600 mb-1.5 underline decoration-amber-200 underline-offset-4">Stock Info</h4>
              <p className="text-xs font-bold text-slate-600 leading-relaxed">
                Item: <span className="text-slate-900 font-black">{selectedStock.itemName}</span> | 
                Miller: <span className="text-slate-900 font-black">{selectedStock.millerName}</span> | 
                Purchase Rate: <span className="text-amber-600 font-black">{formatCurrency(selectedStock.purchaseRate)}</span>
              </p>
            </div>
         </div>
       )}

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-1">Quantity (Katte)</Label>
          <Input 
            type="number" 
            value={formData.katte} 
            placeholder="0"
            className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:ring-amber-500/20 focus:border-amber-500 font-bold placeholder:text-slate-300"
            onChange={e => setFormData({ ...formData, katte: e.target.value })} 
            required 
          />
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-1">Sale Rate</Label>
          <Input 
            type="number" 
            step="any" 
            placeholder="0.00"
            className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:ring-amber-500/20 focus:border-amber-500 font-bold text-emerald-600 placeholder:text-slate-300"
            value={formData.rate} 
            onChange={e => setFormData({ ...formData, rate: e.target.value })} 
            required 
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-1">Bhardana Rate</Label>
          <Input 
            type="number" 
            step="any" 
            value={formData.bhardanaRate} 
            placeholder="Per Unit"
            className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:ring-amber-500/20 focus:border-amber-500 font-bold placeholder:text-slate-300"
            onChange={e => setFormData({ ...formData, bhardanaRate: e.target.value })} 
          />
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-1">Rate Type</Label>
          <Select 
              value={formData.rateType} 
              onValueChange={value => setFormData({ ...formData, rateType: value as "per_kg" | "per_katta" })}
          >
            <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:ring-amber-500/20 focus:border-amber-500 font-bold">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.1)]">
              <SelectItem value="per_kg" className="rounded-xl my-1 focus:bg-amber-50">Calculate Per KG</SelectItem>
              <SelectItem value="per_katta" className="rounded-xl my-1 focus:bg-amber-50">Calculate Per Katta</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 p-6 bg-slate-50 rounded-[2rem] border border-slate-100 shadow-inner">
        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-1">Payment Type</Label>
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
            <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-1">Credit Days</Label>
            <Input
              type="number"
              min="0"
              placeholder="e.g. 15"
              className="h-12 rounded-xl bg-white border-slate-200 focus:ring-amber-500/20 focus:border-amber-500 font-bold"
              value={formData.dueDays}
              onChange={(e) => setFormData({ ...formData, dueDays: e.target.value })}
            />
          </div>
        )}
      </div>

      {selectedStock && formData.katte && formData.rate && (
        <div className="premium-glass p-8 rounded-[2.5rem] border-white/20 shadow-premium relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-amber-500/10 transition-all duration-1000" />
          
          <div className="flex items-center gap-3 mb-6 relative z-10">
             <div className="h-2 w-2 rounded-full bg-amber-500 shadow-[0_0_8px_#f59e0b]" />
             <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Bill Summary</h5>
          </div>

          <div className="grid grid-cols-2 gap-y-8 relative z-10">
            <div className="flex flex-col gap-1">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Total Weight</span>
              <span className="text-xl font-black text-slate-900 tracking-tighter leading-none">{totalWeight.toFixed(2)} KG</span>
            </div>
            
            <div className="flex flex-col items-end gap-1">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Profit / Loss</span>
              <span className={cn("text-xl font-black tabular-nums tracking-tighter leading-none", profit >= 0 ? "text-emerald-500" : "text-rose-500")}>
                {formatCurrency(profit)}
              </span>
            </div>

            <div className="col-span-2 pt-6 border-t border-slate-100/50 mt-2">
               <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-black text-amber-600 uppercase tracking-[0.2em] underline decoration-amber-200 underline-offset-4 leading-none">Total Bill Amount:</span>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Final Amount to Receive</p>
                  </div>
                  <span className="text-4xl font-black text-slate-900 tracking-tighter leading-none drop-shadow-sm">{formatCurrency(totalAmount)}</span>
               </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-4 pt-2">
         <Button type="submit" className="h-14 flex-1 gold-gradient hover:opacity-90 text-white font-black rounded-2xl shadow-xl shadow-amber-500/20 transition-all active:scale-95 uppercase tracking-widest text-xs" disabled={loading}>
          {loading ? "Processing..." : "Create Bill"}
        </Button>
      </div>
    </form>
  );
}