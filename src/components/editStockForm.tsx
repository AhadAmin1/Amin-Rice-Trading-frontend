import { useState, useEffect } from "react";
import { dataStore } from "@/store/dataStore";
import type { StockItem } from "@/types";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Props = {
  stock: StockItem;
  onSuccess: () => void;
};

export default function EditStockForm({ stock, onSuccess }: Props) {
  // ✅ safety guard (IMPORTANT)
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
  });

  const katte = Number(formData.katte) || 0;
  const weightPerKatta = Number(formData.weightPerKatta) || 0;
  const purchaseRate = Number(formData.purchaseRate) || 0;
  const bhardanaRate = Number(formData.bhardanaRate) || 0;
  const bhardana = katte * bhardanaRate;

  const totalWeight = katte * weightPerKatta;
  
  const rawAmount = formData.rateType === "per_kg"
      ? totalWeight * purchaseRate
      : katte * purchaseRate;
      
  const totalAmount = rawAmount + bhardana;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const miller = millers.find(m => m.id === formData.millerId);
    if (!miller) return;

    // ✅ id guaranteed here
    await dataStore.updateStock(stock.id, {
      date: formData.date,
      millerId: miller.id,
      millerName: miller.name,
      itemName: formData.itemName,
      katte,
      weightPerKatta,
      totalWeight,
      purchaseRate,
      bhardanaRate,
      bhardana,
      rateType: formData.rateType,
      totalAmount,

      // 🔴 keep existing remaining values
      remainingKatte: stock.remainingKatte,
      remainingWeight: stock.remainingWeight,
    });

    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label>Date</Label>
          <Input
            type="date"
            value={formData.date}
            onChange={e =>
              setFormData({ ...formData, date: e.target.value })
            }
          />
        </div>

        <div className="space-y-1">
          <Label>Miller</Label>
          <Select
            value={formData.millerId}
            onValueChange={value =>
              setFormData({ ...formData, millerId: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select miller" />
            </SelectTrigger>
            <SelectContent>
              {millers.map(m => (
                <SelectItem key={m.id} value={m.id}>
                  {m.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1">
        <Label>Item</Label>
        <Input
          value={formData.itemName}
          onChange={e =>
            setFormData({ ...formData, itemName: e.target.value })
          }
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label>Katte</Label>
          <Input
            type="number"
            value={formData.katte}
            onChange={e =>
              setFormData({ ...formData, katte: e.target.value })
            }
          />
        </div>

        <div className="space-y-1">
          <Label>Weight per Katta (kg)</Label>
          <Input
            type="number"
            step="any"
            value={formData.weightPerKatta}
            onChange={e =>
              setFormData({
                ...formData,
                weightPerKatta: e.target.value,
              })
            }
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label>Rate</Label>
          <Input
            type="number"
            step="any"
            value={formData.purchaseRate}
            onChange={e =>
              setFormData({
                ...formData,
                purchaseRate: e.target.value,
              })
            }
          />
        </div>

         <div className="space-y-1">
          <Label>Bhardana (per Katta)</Label>
          <Input
            type="number"
            step="any"
            value={formData.bhardanaRate}
            onChange={e =>
              setFormData({
                ...formData,
                bhardanaRate: e.target.value,
              })
            }
          />
        </div>
      </div>
      
      <div className="space-y-1">
          <Label>Rate Type</Label>
          <Select
            value={formData.rateType}
            onValueChange={(v: "per_kg" | "per_katta") =>
              setFormData({ ...formData, rateType: v })
            }
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

      {/* Preview */}
      <div className="bg-slate-50 p-4 rounded-lg text-sm space-y-1">
        <div className="flex justify-between">
          <span>Total Weight</span>
          <b>{totalWeight.toFixed(0)} kg</b>
        </div>
         <div className="flex justify-between">
          <span>Bhardana</span>
          <b>
            {new Intl.NumberFormat("en-PK", {
              style: "currency",
              currency: "PKR",
              maximumFractionDigits: 0,
            }).format(bhardana)}
          </b>
        </div>
        <div className="flex justify-between">
          <span>Total Amount</span>
          <b>
            {new Intl.NumberFormat("en-PK", {
              style: "currency",
              currency: "PKR",
              maximumFractionDigits: 0,
            }).format(totalAmount)}
          </b>
        </div>
      </div>

      <Button
        type="submit"
        className="w-full bg-amber-500 hover:bg-amber-600 text-white"
      >
        Update Stock
      </Button>
    </form>
  );
}
