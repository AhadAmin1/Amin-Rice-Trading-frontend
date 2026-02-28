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
import { Input } from '@/components/ui/input';

export function ProfitModule() {
  const [profits, setProfits] = useState<ProfitEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchProfits = () => {
      dataStore.getProfitEntries().then(setProfits);
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

  const totalProfit = profits.reduce((sum, p) => sum + p.profit, 0);
  const totalSales = profits.reduce((sum, p) => sum + p.sellingAmount, 0);
  const totalCost = profits.reduce((sum, p) => sum + p.purchaseCost, 0);
  const profitMargin = totalSales > 0 ? (totalProfit / totalSales) * 100 : 0;

  // Group by buyer
  const buyerProfits = profits.reduce((acc, p) => {
    if (!acc[p.buyerId]) {
      acc[p.buyerId] = { buyerName: p.buyerName, profit: 0, sales: 0, bills: 0 };
    }
    acc[p.buyerId].profit += p.profit;
    acc[p.buyerId].sales += p.sellingAmount;
    acc[p.buyerId].bills += 1;
    return acc;
  }, {} as Record<string, { buyerName: string; profit: number; sales: number; bills: number }>);

  // Group by item
  const itemProfits = profits.reduce((acc, p) => {
    if (!acc[p.itemName]) {
      acc[p.itemName] = { profit: 0, sales: 0, katte: 0 };
    }
    acc[p.itemName].profit += p.profit;
    acc[p.itemName].sales += p.sellingAmount;
    acc[p.itemName].katte += p.katte;
    return acc;
  }, {} as Record<string, { profit: number; sales: number; katte: number }>);

  // Group by month
  const monthlyProfits = profits.reduce((acc, p) => {
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
    <div className="space-y-8 pb-10">
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 bg-white/40 p-8 rounded-3xl border border-white/20 backdrop-blur-sm shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-100/20 rounded-full -mr-32 -mt-32 blur-3xl" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-8 w-1 bg-emerald-500 rounded-full" />
            <span className="text-xs font-black text-emerald-600 uppercase tracking-[0.2em]">Institutional Performance</span>
          </div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Yield & <span className="text-gold">Profitability</span></h2>
          <p className="text-slate-500 font-medium mt-1">High-fidelity analysis of commercial margins and capital growth.</p>
        </div>
        
        <div className="flex items-center gap-3 relative z-10">
          <div className="flex flex-col items-end">
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Efficiency Ratio</span>
             <div className="flex items-center gap-2">
                <div className="h-2 w-24 bg-slate-100 rounded-full overflow-hidden">
                   <div className="h-full bg-emerald-500" style={{ width: `${Math.min(profitMargin * 5, 100)}%` }} />
                </div>
                <span className="text-sm font-black text-emerald-600">{profitMargin.toFixed(1)}%</span>
             </div>
          </div>
        </div>
      </div>

      {/* Analytics Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Net Commercial Gain', value: formatCurrency(totalProfit), icon: TrendingUp, color: 'emerald', highlight: true },
          { label: 'Gross Revenue', value: formatCurrency(totalSales), icon: ArrowUpRight, color: 'blue' },
          { label: 'Sourcing Expenditure', value: formatCurrency(totalCost), icon: ArrowDownRight, color: 'rose' },
          { label: 'Portfolio Margin', value: `${profitMargin.toFixed(1)}%`, icon: Activity, color: 'amber' },
        ].map((item, i) => (
          <Card key={i} className={cn(
            "rounded-3xl border-white/50 shadow-sm relative overflow-hidden group transition-all duration-500",
            item.highlight ? "bg-slate-900 text-white" : "bg-white hover:shadow-xl"
          )}>
            {item.highlight && <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16 opacity-50" />}
            <CardContent className="p-6 relative z-10">
               <div className="flex items-center justify-between mb-4">
                  <div className={cn(
                    "p-3 rounded-2xl shadow-inner",
                    item.highlight ? "bg-white/10 text-emerald-400" : `bg-${item.color}-50 text-${item.color}-600`
                  )}>
                     <item.icon className="h-5 w-5" />
                  </div>
                  {!item.highlight && (
                    <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <ChevronRight className="h-4 w-4 text-slate-300" />
                    </div>
                  )}
               </div>
               <p className={cn("text-[10px] font-black uppercase tracking-widest mb-1", item.highlight ? "text-slate-500" : "text-slate-400")}>{item.label}</p>
               <h3 className={cn("text-2xl font-black tracking-tighter tabular-nums", item.highlight ? "text-white" : "text-slate-900")}>{item.value}</h3>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Analysis Interface */}
      <div className="glass-card rounded-[2.5rem] border-white/50 shadow-sm overflow-hidden min-h-[500px]">
        <Tabs defaultValue="bills" className="w-full">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center p-8 gap-6 border-b border-slate-100">
            <TabsList className="bg-slate-100/50 p-1.5 rounded-2xl h-auto border border-slate-200/50 backdrop-blur-sm">
              <TabsTrigger value="bills" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:text-amber-600 data-[state=active]:shadow-lg font-black text-xs uppercase tracking-widest transition-all">By Invoice</TabsTrigger>
              <TabsTrigger value="buyers" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:text-amber-600 data-[state=active]:shadow-lg font-black text-xs uppercase tracking-widest transition-all">By Entity</TabsTrigger>
              <TabsTrigger value="items" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:text-amber-600 data-[state=active]:shadow-lg font-black text-xs uppercase tracking-widest transition-all">By Product</TabsTrigger>
              <TabsTrigger value="monthly" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:text-amber-600 data-[state=active]:shadow-lg font-black text-xs uppercase tracking-widest transition-all">Monthly Pulse</TabsTrigger>
            </TabsList>
            
            <div className="relative w-full lg:max-w-md group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-amber-500 transition-colors" />
              <Input
                placeholder="Audit registry by name or ID..."
                className="pl-12 h-14 bg-white/70 backdrop-blur-md border-amber-100/50 rounded-2xl shadow-sm focus:ring-amber-500/20 focus:border-amber-500 transition-all font-medium text-slate-700"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="p-2">
            <TabsContent value="bills" className="m-0 focus-visible:outline-none focus-visible:ring-0">
              <BillsProfitTable profits={profits.filter(p => p.buyerName.toLowerCase().includes(searchTerm.toLowerCase()) || p.billNumber.toLowerCase().includes(searchTerm.toLowerCase()))} />
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
      <div className="text-center py-20 bg-white/50 rounded-[2rem] border-2 border-dashed border-amber-100/50 backdrop-blur-sm">
        <div className="bg-amber-50 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-6">
          <BarChart3 className="h-10 w-10 text-amber-200" />
        </div>
        <h3 className="text-xl font-black text-slate-900 tracking-tight">No Yield Data Indexed</h3>
        <p className="text-slate-400 font-medium mt-1 max-w-xs mx-auto">Generate sales invoices to begin processing profitability metrics.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-none hover:bg-transparent">
            <TableHead className="py-6 px-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Ref / Date</TableHead>
            <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Authorized Entity</TableHead>
            <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Cargo Type</TableHead>
            <TableHead className="text-right text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Revenue</TableHead>
            <TableHead className="text-right text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Sourcing</TableHead>
            <TableHead className="text-right px-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Net Margin</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {profits
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .map((profit) => (
            <TableRow key={profit.id} className="group border-b border-slate-50 hover:bg-emerald-50/20 transition-all duration-300">
              <TableCell className="py-6 px-8">
                <div className="flex flex-col">
                   <Badge variant="outline" className="w-fit text-[9px] font-black border-slate-200 bg-slate-50 text-slate-500 mb-1">#{profit.billNumber}</Badge>
                   <span className="text-xs font-black text-slate-400 uppercase tracking-tighter">{new Date(profit.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</span>
                </div>
              </TableCell>
              <TableCell className="font-bold text-slate-900">{profit.buyerName}</TableCell>
              <TableCell>
                 <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-700">{profit.itemName}</span>
                    <span className="text-[9px] font-black text-amber-600 bg-amber-50 px-2 rounded-md uppercase">{profit.katte} UNIT</span>
                 </div>
              </TableCell>
              <TableCell className="text-right font-black text-slate-900 tabular-nums">{formatCurrency(profit.sellingAmount)}</TableCell>
              <TableCell className="text-right font-bold text-slate-400 tabular-nums">{formatCurrency(profit.purchaseCost)}</TableCell>
              <TableCell className="text-right px-8">
                <div className="flex flex-col items-end">
                   <span className={cn("text-sm font-black tabular-nums tracking-tighter", profit.profit >= 0 ? 'text-emerald-600' : 'text-rose-600')}>
                     {formatCurrency(profit.profit)}
                   </span>
                   <span className={cn("text-[9px] font-black uppercase", profit.profit >= 0 ? 'text-emerald-400' : 'text-rose-400')}>
                     {((profit.profit / profit.sellingAmount) * 100).toFixed(1)}% Yield
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
          <TableRow className="border-none hover:bg-transparent">
            <TableHead className="py-6 px-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Authorized Entity</TableHead>
            <TableHead className="text-right text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Total Volume</TableHead>
            <TableHead className="text-right text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Gross Contribution</TableHead>
            <TableHead className="text-right px-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Entity Net Yield</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {buyers.map(([id, data]) => (
            <TableRow key={id} className="group border-b border-slate-50 hover:bg-emerald-50/20 transition-all duration-300">
              <TableCell className="py-6 px-8 flex items-center gap-4">
                 <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 font-black text-xs border border-slate-100 uppercase">{data.buyerName.charAt(0)}</div>
                 <span className="font-black text-slate-900 tracking-tight">{data.buyerName}</span>
              </TableCell>
              <TableCell className="text-right">
                 <Badge variant="outline" className="text-[10px] font-black text-slate-500 uppercase">{data.bills} INVOICES</Badge>
              </TableCell>
              <TableCell className="text-right font-bold text-slate-900 tabular-nums">{formatCurrency(data.sales)}</TableCell>
              <TableCell className="text-right px-8">
                <div className="flex flex-col items-end">
                   <span className={cn("text-lg font-black tabular-nums tracking-tighter", data.profit >= 0 ? 'text-emerald-600' : 'text-rose-600')}>
                     {formatCurrency(data.profit)}
                   </span>
                   <span className={cn("text-[10px] font-black uppercase tracking-widest", data.profit >= 0 ? 'text-emerald-500/50' : 'text-rose-500/50')}>
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
          <TableRow className="border-none hover:bg-transparent">
            <TableHead className="py-6 px-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Cargo Classification</TableHead>
            <TableHead className="text-right text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Load Volume</TableHead>
            <TableHead className="text-right text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Market Valuation</TableHead>
            <TableHead className="text-right px-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Commodity Yield</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map(([name, data]) => (
            <TableRow key={name} className="group border-b border-slate-50 hover:bg-emerald-50/20 transition-all duration-300">
              <TableCell className="py-6 px-8 font-black text-slate-900 tracking-tight">{name}</TableCell>
              <TableCell className="text-right font-bold text-slate-500 tabular-nums">{data.katte} KATTE</TableCell>
              <TableCell className="text-right font-black text-slate-900 tabular-nums">{formatCurrency(data.sales)}</TableCell>
              <TableCell className="text-right px-8">
                 <div className="flex flex-col items-end">
                    <span className={cn("text-lg font-black tabular-nums tracking-tighter", data.profit >= 0 ? 'text-emerald-600' : 'text-rose-600')}>{formatCurrency(data.profit)}</span>
                    <span className="text-[10px] font-black text-slate-400">{(data.profit / data.sales * 100).toFixed(1)}% Efficiency</span>
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
          <TableRow className="border-none hover:bg-transparent">
            <TableHead className="py-6 px-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Archive Period</TableHead>
            <TableHead className="text-right text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Cycle Volume</TableHead>
            <TableHead className="text-right text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Gross Turnvover</TableHead>
            <TableHead className="text-right px-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Cycle Net Yield</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {months.map(([month, data]) => (
            <TableRow key={month} className="group border-b border-slate-50 hover:bg-emerald-50/20 transition-all duration-300">
              <TableCell className="py-6 px-8">
                 <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                       <Calendar className="h-5 w-5" />
                    </div>
                    <span className="font-black text-slate-900 uppercase tracking-tighter text-sm">{formatMonth(month)}</span>
                 </div>
              </TableCell>
              <TableCell className="text-right">
                 <Badge variant="outline" className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{data.bills} INVOICES</Badge>
              </TableCell>
              <TableCell className="text-right font-black text-slate-900 tabular-nums">{formatCurrency(data.sales)}</TableCell>
              <TableCell className="text-right px-8 font-black text-emerald-600 text-lg tabular-nums tracking-tighter">{formatCurrency(data.profit)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
