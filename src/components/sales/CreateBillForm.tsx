import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { dataStore } from "@/store/dataStore";
import type { Buyer, StockItem, Bill } from "@/types";

type CreateBillFormProps = {
  buyers: Buyer[];
  stocks: StockItem[];
  onSuccess: (bill: Bill) => void;
};

export function CreateBillForm({ buyers, stocks, onSuccess }: CreateBillFormProps) {
  const [formData, setFormData] = useState({
    buyerId: "",
    stockId: "",
    katte: "",
    rate: "",
    bhardana: "",
    rateType: "per_kg" as 'per_kg' | 'per_katta',
    billNo: "",
  });

  const [loading, setLoading] = useState(false);

  // Values for preview calculation
  const selectedStock = stocks.find(s => s.id === formData.stockId);
  const katte = Number(formData.katte) || 0;
  const rate = Number(formData.rate) || 0;
  const bhardana = Number(formData.bhardana) || 0;
  const totalWeight = selectedStock ? katte * selectedStock.weightPerKatta : 0;
  // Total Amount = (Rate Amount) + Bhardana
  // Bhardana is added to the total receivable from Buyer
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

  // Set initial values when buyers/stocks load
  useEffect(() => {
    if (buyers.length > 0 && !formData.buyerId) {
      setFormData(prev => ({ ...prev, buyerId: buyers[0].id }));
    }
  }, [buyers]);

  useEffect(() => {
    const availableStocks = stocks.filter(s => s.remainingKatte > 0);
    if (availableStocks.length > 0 && !formData.stockId) {
      setFormData(prev => ({ ...prev, stockId: availableStocks[0].id }));
    }
  }, [stocks]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const selectedStock = stocks.find(s => s.id === formData.stockId);
      const buyer = buyers.find(b => b.id === formData.buyerId);
      
      if (!selectedStock || !buyer) {
          alert("Please select stock and buyer");
          setLoading(false);
          return;
      }

      const katte = Number(formData.katte);
      const rate = Number(formData.rate);
      
      if (katte > selectedStock.remainingKatte) {
          alert("Insufficient stock");
          setLoading(false);
          return;
      }

      const weightPerKatta = selectedStock.weightPerKatta;
      const totalWeight = katte * weightPerKatta;
      
      const bhardana = Number(formData.bhardana) || 0;
      
      const rawAmount = formData.rateType === 'per_kg' 
        ? totalWeight * rate 
        : katte * rate;
      
      const totalAmount = rawAmount + bhardana;
        
      
      // Cost per kg based on total purchase amount
      const costPerKg = selectedStock.totalAmount / selectedStock.totalWeight;
      const calculatedPurchaseCost = totalWeight * costPerKg;
      
      const profit = totalAmount - calculatedPurchaseCost;

      const bill = await dataStore.addBill({
        buyerId: formData.buyerId,
        buyerName: buyer.name,
        millerId: selectedStock.millerId,
        millerName: selectedStock.millerName,
        date: new Date().toISOString().split('T')[0],
        // billNo: formData.billNo, // Backend generates bill number 
        itemName: selectedStock.itemName,
        stockId: selectedStock.id,
        katte,
        weightPerKatta,
        weight: totalWeight, // Using weight field now
        rate,
        bhardana,
        rateType: formData.rateType,
        totalAmount,
        purchaseCost: calculatedPurchaseCost,
        profit
      } as any);

      onSuccess(bill);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to create bill");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
    <div className="grid grid-cols-2 gap-4">
      <div>
        <Label>Buyer</Label>
        {buyers.length === 0 ? (
          <div className="text-sm text-slate-500 p-2 bg-slate-50 rounded-md">
            No buyers found. Please add a buyer first.
          </div>
        ) : (
          <Select 
              value={formData.buyerId} 
              onValueChange={value => setFormData({ ...formData, buyerId: value })}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select buyer" />
            </SelectTrigger>
            <SelectContent>
              {buyers.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
            </SelectContent>
          </Select>
        )}
      </div>
      <div>
        <Label>Stock</Label>
        {stocks.filter(s => s.remainingKatte > 0).length === 0 ? (
          <div className="text-sm text-slate-500 p-2 bg-slate-50 rounded-md">
            No stock available. Please add stock first.
          </div>
        ) : (
          <Select 
              value={formData.stockId} 
              onValueChange={value => setFormData({ ...formData, stockId: value })}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select stock" />
            </SelectTrigger>
            <SelectContent>
              {stocks.filter(s => s.remainingKatte > 0).map(s => (
                <SelectItem key={s.id} value={s.id}>
                    {s.itemName} ({s.remainingKatte} left)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
      <div>
        <Label>Bill No (Optional)</Label>
        <Input 
            value={formData.billNo} 
            onChange={e => setFormData({ ...formData, billNo: e.target.value })} 
            placeholder="Auto-generated if empty"
        />
      </div>
      <div>
        <Label>Katte</Label>
        <Input type="number" value={formData.katte} onChange={e => setFormData({ ...formData, katte: e.target.value })} required />
      </div>
      <div>
        <Label>Rate</Label>
        <Input type="number" value={formData.rate} onChange={e => setFormData({ ...formData, rate: e.target.value })} required />
      </div>
      <div>
        <Label>Bhardana (Optional)</Label>
        <Input type="number" value={formData.bhardana} onChange={e => setFormData({ ...formData, bhardana: e.target.value })} placeholder="Packaging cost" />
      </div>
      <div>
        <Label>Rate Type</Label>
        <Select 
            value={formData.rateType} 
            onValueChange={value => setFormData({ ...formData, rateType: value as "per_kg" | "per_katta" })}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select rate type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="per_kg">Per Kg</SelectItem>
            <SelectItem value="per_katta">Per Katta</SelectItem>
          </SelectContent>
        </Select>
      </div>
      </div>

      {/* Calculation Preview */}
      {selectedStock && formData.katte && formData.rate && (
        <div className="bg-amber-50 p-4 rounded-lg space-y-2 border border-amber-100">
          <p className="text-sm font-semibold text-amber-900 border-b border-amber-200 pb-1 mb-2">
            Bill Preview:
          </p>
          <div className="grid grid-cols-2 gap-y-2 text-sm text-amber-900">
            <span>Total Weight:</span>
            <span className="text-right font-medium">{totalWeight.toFixed(2)} kg</span>
            
            <span>Bhardana (Packaging):</span>
            <span className="text-right font-medium">{formatCurrency(bhardana)}</span>

            <span>Total Amount:</span>
            <span className="text-right font-bold text-amber-700">{formatCurrency(totalAmount)}</span>
            
            <div className="col-span-2 border-t border-amber-200 my-1"></div>
            
            <span className="text-slate-600">Purchase Cost:</span>
            <span className="text-right text-slate-600 font-medium">{formatCurrency(purchaseCost)}</span>
            
            <span className="font-semibold">Estimated Profit:</span>
            <span className={`text-right font-bold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(profit)}
            </span>
          </div>
        </div>
      )}

      <Button type="submit" className="bg-amber-500 hover:bg-amber-600 text-white w-full" disabled={loading}>
        {loading ? "Creating..." : "Create Bill"}
      </Button>
    </form>
  );
}