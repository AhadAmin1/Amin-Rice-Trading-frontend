import { useEffect, useState } from 'react';
import { 
  TrendingUp, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownRight,
  Activity,
  ChevronRight,
  BarChart3,
  Search
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { dataStore } from '@/store/dataStore';
import type { ProfitEntry } from '@/types';
import { cn } from "@/lib/utils";

export function ProfitModule() {
  const [profits, setProfits] = useState<ProfitEntry[]>([]);
  const [stock, setStock] = useState<any[]>([]);
  const [bills, setBills] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchProfits = () => {
      dataStore.getProfitEntries().then(setProfits);
      dataStore.getStock().then(setStock);
      dataStore.getBills().then(setBills);
    };

    fetchProfits();
    const unsubscribe = dataStore.onUpdate(fetchProfits);
    return () => unsubscribe();
  }, []);

  const formatCurrency = (amount: number) => {
    return `RS ${new Intl.NumberFormat('en-PK', {
      maximumFractionDigits: 0,
    }).format(amount)}`;
  };

  const getSmartMetrics = (p: ProfitEntry) => {
    const bill = bills.find(b => 
      String(b._id || b.id) === String(p.billId) || 
      b.billNumber === p.billNumber
    );
    if (!bill || !bill.stockId) {
      const g = p.weightGainProfit || 0;
      return { cost: p.purchaseCost, profit: p.profit, gain: g };
    }
    
    const s = stock.find(item => String(item.id || item._id) === String(bill.stockId));
    if (!s) {
      const g = p.weightGainProfit || 0;
      return { cost: p.purchaseCost, profit: p.profit, gain: g };
    }

    const wpk = bill.weightPerKatta || s.weightPerKatta || 50;
    const sBuyRatePerKg = s.rateType === 'per_kg' ? s.purchaseRate : s.purchaseRate / (s.weightPerKatta || 50);
    
    const smartCost = (s.rateType === 'per_kg' 
      ? p.katte * wpk * s.purchaseRate 
      : p.katte * s.purchaseRate) 
      + (p.katte * (s.bhardanaRate || 0));
      
    const smartProfit = p.sellingAmount - smartCost;
    
    // Gain = Surplus Weight * Buy Rate
    const standardWeight = p.katte * wpk;
    const weightGain = Math.max(0, p.totalWeight - standardWeight);
    const smartGain = weightGain * sBuyRatePerKg;

    return { cost: smartCost, profit: smartProfit, gain: smartGain };
  };

  const smartProfits = profits.map(p => ({ ...p, ...getSmartMetrics(p) }));

  const totalSales = smartProfits.reduce((sum, p) => sum + p.sellingAmount, 0);
  const totalCost = smartProfits.reduce((sum, p) => sum + p.cost, 0);
  
  const realizedWeightGainFromBills = smartProfits.reduce((sum, p) => sum + (p.gain || 0), 0);
  
  const inventoryGains = stock.reduce((acc, s) => {
    const standardWeight = (s.remainingKatte || 0) * (s.weightPerKatta || 50);
    const weightGap = (s.remainingWeight || 0) - standardWeight;

    if (weightGap > 0) {
      // Unrealized: Surplus weight sitting in existing bags
      const sBuyRatePerKg = s.rateType === 'per_kg' ? s.purchaseRate : s.purchaseRate / (s.weightPerKatta || 50);
      acc.unrealized += weightGap * sBuyRatePerKg;
    } else if (s.remainingWeight < 0) {
      // Realized: Profit from selling more than available (Overselling)
      // Use Average Selling Rate for negative weight as per user request
      const stockBills = bills.filter(b => String(b.stockId) === String(s.id || s._id));
      const totalWeightSold = stockBills.reduce((sum, b) => sum + (b.weight || 0), 0);
      const totalAmountSold = stockBills.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
      const avgSellingRate = totalWeightSold > 0 ? (totalAmountSold / totalWeightSold) : s.purchaseRate;

      acc.oversold += Math.abs(s.remainingWeight) * avgSellingRate;
    }
    return acc;
  }, { unrealized: 0, oversold: 0 });

  const totalStockGainProfit = realizedWeightGainFromBills + inventoryGains.unrealized + inventoryGains.oversold;
  const totalProfit = smartProfits.reduce((sum, p) => sum + p.profit, 0) + inventoryGains.unrealized + inventoryGains.oversold;
  const realizedGain = realizedWeightGainFromBills + inventoryGains.oversold;
  const inventoryGain = inventoryGains.unrealized;
  const profitMargin = totalSales > 0 ? (totalProfit / totalSales) * 100 : 0;

  // Group by buyer
  const buyerProfits = smartProfits.reduce((acc, p) => {
    if (!acc[p.buyerId]) {
      acc[p.buyerId] = { buyerName: p.buyerName, profit: 0, sales: 0, bills: 0 };
    }
    acc[p.buyerId].profit += p.profit;
    acc[p.buyerId].sales += p.sellingAmount;
    acc[p.buyerId].bills += 1;
    return acc;
  }, {} as Record<string, { buyerName: string; profit: number; sales: number; bills: number }>);

  // Group by item
  const itemProfits = smartProfits.reduce((acc, p) => {
    if (!acc[p.itemName]) {
      acc[p.itemName] = { profit: 0, sales: 0, katte: 0 };
    }
    acc[p.itemName].profit += p.profit;
    acc[p.itemName].sales += p.sellingAmount;
    acc[p.itemName].katte += p.katte;
    return acc;
  }, {} as Record<string, { profit: number; sales: number; katte: number }>);

  // Group by month
  const monthlyProfits = smartProfits.reduce((acc, p) => {
    const month = p.date.substring(0, 7); // YYYY-MM
    if (!acc[month]) {
      acc[month] = { profit: 0, sales: 0, bills: 0 };
    }
    acc[month].profit += p.profit;
    acc[month].sales += p.sellingAmount;
    acc[month].bills += 1;
    return acc;
  }, {} as Record<string, { profit: number; sales: number; bills: number }>);

  return (
    <div className="space-y-6 pb-10">
      {/* Standard Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Profit & Loss Analysis</h2>
          <p className="text-slate-500 text-sm mt-1">Detailed overview of sales margins and business performance.</p>
        </div>
        
        <div className="flex items-center gap-4">
              <Card className="bg-emerald-50/50 border-emerald-100 shadow-none">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="p-2 bg-emerald-100 rounded-lg">
                      <TrendingUp className="w-4 h-4 text-emerald-600" />
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-emerald-800 uppercase tracking-wider">Stock Gain Profit</span>
                    <h3 className="text-xl font-black text-emerald-600 mt-1">{formatCurrency(totalStockGainProfit)}</h3>
                    <div className="flex gap-2 mt-1">
                      <span className="text-[9px] font-bold text-emerald-500/70 uppercase">Realized: {formatCurrency(realizedGain)}</span>
                      <span className="text-[9px] font-bold text-emerald-500/70 uppercase">Unrealized: {formatCurrency(inventoryGain)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <div className="w-px h-8 bg-slate-100 mx-2" />
              <div className="text-right">
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Overall Margin</p>
                 <div className="flex items-center gap-2">
                    <div className="h-2 w-24 bg-slate-100 rounded-full overflow-hidden">
                       <div className="h-full bg-emerald-500" style={{ width: `${Math.min(profitMargin * 5, 100)}%` }} />
                    </div>
                    <span className="text-sm font-bold text-emerald-600">{profitMargin.toFixed(1)}%</span>
                 </div>
              </div>
           </div>
      </div>

      {/* Analytics Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
        
          { label: 'Net Profit', value: formatCurrency(totalProfit), icon: TrendingUp, color: 'emerald' },
          { label: 'Total Sales', value: formatCurrency(totalSales), icon: ArrowUpRight, color: 'blue' },
          { label: 'Total Cost', value: formatCurrency(totalCost), icon: ArrowDownRight, color: 'rose' },
          { label: 'Profit Margin', value: `${profitMargin.toFixed(1)}%`, icon: Activity, color: 'amber' },
        ].map((item, i) => (
          <Card key={i} className="rounded-xl bg-white border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer group">
            <CardContent className="p-6">
               <div className="flex items-center justify-between mb-4">
                  <div className={cn(
                    "p-2.5 rounded-lg",
                    `bg-${item.color}-50 text-${item.color}-600`
                  )}>
                     <item.icon className="h-5 w-5" />
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-300" />
               </div>
               <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">{item.label}</p>
               <h3 className="text-2xl font-bold text-slate-900 tracking-tight tabular-nums">{item.value}</h3>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Analysis Interface */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden min-h-[500px]">
        <Tabs defaultValue="bills" className="w-full">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center p-6 gap-6 border-b border-slate-100">
            <TabsList className="bg-slate-100 p-1 rounded-lg h-auto">
              <TabsTrigger value="bills" className="rounded-md px-4 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm font-bold text-xs uppercase tracking-wider">Invoices</TabsTrigger>
              <TabsTrigger value="buyers" className="rounded-md px-4 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm font-bold text-xs uppercase tracking-wider">Buyers</TabsTrigger>
              <TabsTrigger value="items" className="rounded-md px-4 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm font-bold text-xs uppercase tracking-wider">Products</TabsTrigger>
              <TabsTrigger value="monthly" className="rounded-md px-4 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm font-bold text-xs uppercase tracking-wider">Monthly</TabsTrigger>
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

          <div className="p-2">
            <TabsContent value="bills" className="m-0 focus-visible:outline-none focus-visible:ring-0">
              <BillsProfitTable profits={smartProfits.filter(p => p.buyerName.toLowerCase().includes(searchTerm.toLowerCase()) || p.billNumber.toLowerCase().includes(searchTerm.toLowerCase()))} />
            </TabsContent>
            <TabsContent value="buyers" className="m-0 focus-visible:outline-none focus-visible:ring-0">
              <BuyersProfitTable buyerProfits={buyerProfits} searchTerm={searchTerm} />
            </TabsContent>
            <TabsContent value="items" className="m-0 focus-visible:outline-none focus-visible:ring-0">
              <ItemsProfitTable itemProfits={itemProfits} searchTerm={searchTerm} />
            </TabsContent>
            <TabsContent value="monthly" className="m-0 focus-visible:outline-none focus-visible:ring-0">
              <MonthlyProfitTable monthlyProfits={monthlyProfits} />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}

function BillsProfitTable({ profits }: { profits: ProfitEntry[] }) {
  const formatCurrency = (amount: number) => {
    return `RS ${new Intl.NumberFormat('en-PK', { maximumFractionDigits: 0 }).format(amount)}`;
  };

  if (profits.length === 0) {
    return (
      <div className="text-center py-16 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
        <div className="bg-slate-100 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <BarChart3 className="h-8 w-8 text-slate-300" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">No Data Found</h3>
        <p className="text-slate-500 text-sm mt-1">Generate sales invoices to see profit metrics.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50 border-b border-slate-200">
            <TableHead className="py-4 px-6 text-[10px] font-bold uppercase tracking-wider text-slate-500">Invoice / Date</TableHead>
            <TableHead className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Buyer Name</TableHead>
            <TableHead className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Item Details</TableHead>
            <TableHead className="text-right text-[10px] font-bold uppercase tracking-wider text-slate-500">Selling Amount</TableHead>
            <TableHead className="text-right text-[10px] font-bold uppercase tracking-wider text-slate-500">Purchase Cost</TableHead>
            <TableHead className="text-right px-6 text-[10px] font-bold uppercase tracking-wider text-slate-500">Net Profit</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {profits
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .map((profit) => (
            <TableRow key={profit.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer">
              <TableCell className="py-4 px-6">
                <div className="flex flex-col">
                   <span className="text-xs font-bold text-slate-900">#{profit.billNumber}</span>
                   <span className="text-[10px] font-semibold text-slate-400 uppercase">{new Date(profit.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</span>
                </div>
              </TableCell>
              <TableCell className="font-semibold text-slate-900">{profit.buyerName}</TableCell>
              <TableCell>
                 <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-slate-700">{profit.itemName}</span>
                    <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded uppercase">{profit.katte} Katte</span>
                 </div>
              </TableCell>
              <TableCell className="text-right font-bold text-slate-900 tabular-nums">{formatCurrency(profit.sellingAmount)}</TableCell>
              <TableCell className="text-right font-medium text-slate-400 tabular-nums">{formatCurrency((profit as any).cost)}</TableCell>
              <TableCell className="text-right px-6">
                <div className="flex flex-col items-end">
                   <span className={cn("text-sm font-black tabular-nums", profit.profit >= 0 ? 'text-emerald-600' : 'text-rose-600')}>
                     {formatCurrency(profit.profit)}
                   </span>
                   <span className={cn(
                      "text-[10px] font-black uppercase flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full border",
                      (profit as any).gain > 0 
                        ? "text-emerald-500 bg-emerald-50 border-emerald-100/50" 
                        : "text-slate-400 bg-slate-50 border-slate-100"
                   )}>
                      {(profit as any).gain > 0 && <TrendingUp className="w-3 h-3 text-emerald-600" />}
                      Gain: {formatCurrency((profit as any).gain)}
                   </span>
                   <span className={cn("text-[9px] font-bold uppercase", profit.profit >= 0 ? 'text-emerald-500' : 'text-rose-500')}>
                     {((profit.profit / profit.sellingAmount) * 100).toFixed(1)}% Margin
                   </span>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function BuyersProfitTable({ buyerProfits, searchTerm }: { buyerProfits: Record<string, any>; searchTerm: string }) {
  const formatCurrency = (amount: number) => {
    return `RS ${new Intl.NumberFormat('en-PK', { maximumFractionDigits: 0 }).format(amount)}`;
  };

  const buyers = Object.entries(buyerProfits)
    .filter(([_, data]) => data.buyerName.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => b[1].profit - a[1].profit);

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50 border-b border-slate-200">
            <TableHead className="py-4 px-6 text-[10px] font-bold uppercase tracking-wider text-slate-500">Buyer Name</TableHead>
            <TableHead className="text-right text-[10px] font-bold uppercase tracking-wider text-slate-500">Total Invoices</TableHead>
            <TableHead className="text-right text-[10px] font-bold uppercase tracking-wider text-slate-500">Total Sales</TableHead>
            <TableHead className="text-right px-6 text-[10px] font-bold uppercase tracking-wider text-slate-500">Total Profit</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {buyers.map(([id, data]) => (
            <TableRow key={id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer">
              <TableCell className="py-4 px-6 flex items-center gap-4">
                 <div className="h-9 w-9 rounded bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs border border-slate-200 uppercase">{data.buyerName.charAt(0)}</div>
                 <span className="font-semibold text-slate-900">{data.buyerName}</span>
              </TableCell>
              <TableCell className="text-right">
                 <Badge variant="secondary" className="text-[10px] font-bold uppercase">{data.bills} Bills</Badge>
              </TableCell>
              <TableCell className="text-right font-semibold text-slate-900 tabular-nums">{formatCurrency(data.sales)}</TableCell>
              <TableCell className="text-right px-6">
                <div className="flex flex-col items-end">
                   <span className={cn("text-base font-bold tabular-nums", data.profit >= 0 ? 'text-emerald-600' : 'text-rose-600')}>
                     {formatCurrency(data.profit)}
                   </span>
                   <span className="text-[10px] font-medium text-slate-400">
                     {(data.profit / data.sales * 100).toFixed(1)}% Ratio
                   </span>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function ItemsProfitTable({ itemProfits, searchTerm }: { itemProfits: Record<string, any>; searchTerm: string }) {
  const formatCurrency = (amount: number) => {
    return `RS ${new Intl.NumberFormat('en-PK', { maximumFractionDigits: 0 }).format(amount)}`;
  };

  const items = Object.entries(itemProfits)
    .filter(([name]) => name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => b[1].profit - a[1].profit);

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50 border-b border-slate-200">
            <TableHead className="py-4 px-6 text-[10px] font-bold uppercase tracking-wider text-slate-500">Product Name</TableHead>
            <TableHead className="text-right text-[10px] font-bold uppercase tracking-wider text-slate-500">Total Katte</TableHead>
            <TableHead className="text-right text-[10px] font-bold uppercase tracking-wider text-slate-500">Total Sales</TableHead>
            <TableHead className="text-right px-6 text-[10px] font-bold uppercase tracking-wider text-slate-500">Total Profit</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map(([name, data]) => (
            <TableRow key={name} className="border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer">
              <TableCell className="py-4 px-6 font-semibold text-slate-900">{name}</TableCell>
              <TableCell className="text-right font-medium text-slate-500 tabular-nums">{data.katte} Katte</TableCell>
              <TableCell className="text-right font-bold text-slate-900 tabular-nums">{formatCurrency(data.sales)}</TableCell>
              <TableCell className="text-right px-6">
                 <div className="flex flex-col items-end">
                    <span className={cn("text-base font-bold tabular-nums", data.profit >= 0 ? 'text-emerald-600' : 'text-rose-600')}>{formatCurrency(data.profit)}</span>
                    <span className="text-[10px] font-medium text-slate-400">{(data.profit / data.sales * 100).toFixed(1)}% Efficiency</span>
                 </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function MonthlyProfitTable({ monthlyProfits }: { monthlyProfits: Record<string, any> }) {
  const formatCurrency = (amount: number) => {
    return `RS ${new Intl.NumberFormat('en-PK', { maximumFractionDigits: 0 }).format(amount)}`;
  };

  const months = Object.entries(monthlyProfits).sort((a, b) => b[0].localeCompare(a[0]));
  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    const date = new Date(Number(year), Number(month) - 1);
    return date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50 border-b border-slate-200">
            <TableHead className="py-4 px-6 text-[10px] font-bold uppercase tracking-wider text-slate-500">Month / Year</TableHead>
            <TableHead className="text-right text-[10px] font-bold uppercase tracking-wider text-slate-500">Invoices</TableHead>
            <TableHead className="text-right text-[10px] font-bold uppercase tracking-wider text-slate-500">Total Sales</TableHead>
            <TableHead className="text-right px-6 text-[10px] font-bold uppercase tracking-wider text-slate-500">Net Profit</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {months.map(([month, data]) => (
            <TableRow key={month} className="border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer">
              <TableCell className="py-4 px-6">
                 <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded bg-emerald-50 flex items-center justify-center text-emerald-600">
                       <Calendar className="h-5 w-5" />
                    </div>
                    <span className="font-bold text-slate-900 text-sm">{formatMonth(month)}</span>
                 </div>
              </TableCell>
              <TableCell className="text-right">
                 <Badge variant="outline" className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{data.bills} Bills</Badge>
              </TableCell>
              <TableCell className="text-right font-bold text-slate-900 tabular-nums">{formatCurrency(data.sales)}</TableCell>
              <TableCell className="text-right px-6 font-bold text-emerald-600 text-base tabular-nums">{formatCurrency(data.profit)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
