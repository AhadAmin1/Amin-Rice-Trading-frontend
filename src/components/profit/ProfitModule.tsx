import { useEffect, useState } from 'react';
import { TrendingUp, Calendar, User, Package, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { dataStore } from '@/store/dataStore';
import type { ProfitEntry } from '@/types';

export function ProfitModule() {
  const [profits, setProfits] = useState<ProfitEntry[]>([]);

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
      maximumFractionDigits: 2,
    }).format(amount)}`;
  };

  const totalProfit = profits.reduce((sum, p) => sum + p.profit, 0);
  const totalSales = profits.reduce((sum, p) => sum + p.sellingAmount, 0);
  const totalCost = profits.reduce((sum, p) => sum + p.purchaseCost, 0);

  // Group by buyer
  const buyerProfits = profits.reduce((acc, p) => {
    if (!acc[p.buyerId]) {
      acc[p.buyerId] = {
        buyerName: p.buyerName,
        profit: 0,
        sales: 0,
        bills: 0,
      };
    }
    acc[p.buyerId].profit += p.profit;
    acc[p.buyerId].sales += p.sellingAmount;
    acc[p.buyerId].bills += 1;
    return acc;
  }, {} as Record<string, { buyerName: string; profit: number; sales: number; bills: number }>);

  // Group by item
  const itemProfits = profits.reduce((acc, p) => {
    if (!acc[p.itemName]) {
      acc[p.itemName] = {
        profit: 0,
        sales: 0,
        katte: 0,
      };
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
      acc[month] = {
        profit: 0,
        sales: 0,
        bills: 0,
      };
    }
    acc[month].profit += p.profit;
    acc[month].sales += p.sellingAmount;
    acc[month].bills += 1;
    return acc;
  }, {} as Record<string, { profit: number; sales: number; bills: number }>);

  const profitMargin = totalSales > 0 ? (totalProfit / totalSales) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Profit Module</h2>
        <p className="text-slate-500 mt-1">Father's Profit Analysis</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-700 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Total Profit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{formatCurrency(totalProfit)}</div>
            <p className="text-sm text-green-600 mt-1">Father's Earnings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
              <ArrowUpRight className="h-4 w-4 text-blue-500" />
              Total Sales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{formatCurrency(totalSales)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
              <ArrowDownRight className="h-4 w-4 text-red-500" />
              Total Cost
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{formatCurrency(totalCost)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Profit Margin</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{profitMargin.toFixed(1)}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="bills" className="w-full">
        <TabsList className="grid w-full grid-cols-4 max-w-lg">
          <TabsTrigger value="bills">By Bill</TabsTrigger>
          <TabsTrigger value="buyers">By Buyer</TabsTrigger>
          <TabsTrigger value="items">By Item</TabsTrigger>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
        </TabsList>

        <TabsContent value="bills" className="space-y-4">
          <BillsProfitTable profits={profits} />
        </TabsContent>

        <TabsContent value="buyers" className="space-y-4">
          <BuyersProfitTable buyerProfits={buyerProfits} />
        </TabsContent>

        <TabsContent value="items" className="space-y-4">
          <ItemsProfitTable itemProfits={itemProfits} />
        </TabsContent>

        <TabsContent value="monthly" className="space-y-4">
          <MonthlyProfitTable monthlyProfits={monthlyProfits} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function BillsProfitTable({ profits }: { profits: ProfitEntry[] }) {
  const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    maximumFractionDigits: 0,
  }).format(amount);
};

  if (profits.length === 0) {
    return (
      <div className="text-center py-12 bg-slate-50 rounded-lg">
        <TrendingUp className="h-12 w-12 mx-auto mb-3 text-slate-300" />
        <p className="text-slate-500">No profit data yet</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50">
            <TableHead>Bill No</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Buyer</TableHead>
            <TableHead>Item</TableHead>
            <TableHead className="text-right">Katte</TableHead>
            <TableHead className="text-right">Sales</TableHead>
            <TableHead className="text-right">Cost</TableHead>
            <TableHead className="text-right">Profit</TableHead>
            <TableHead className="text-right">Margin</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {profits
            .slice()
            .sort((a, b) => {
              const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime();
              if (dateDiff !== 0) return dateDiff;
              return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            })
            .map((profit) => (
            <TableRow key={profit.id} className="hover:bg-slate-50">
              <TableCell>
                <Badge variant="secondary">{profit.billNumber}</Badge>
              </TableCell>
              <TableCell>{profit.date}</TableCell>
              <TableCell>{profit.buyerName}</TableCell>
              <TableCell>{profit.itemName}</TableCell>
              <TableCell className="text-right">{profit.katte}</TableCell>
              <TableCell className="text-right">{formatCurrency(profit.sellingAmount)}</TableCell>
              <TableCell className="text-right">{formatCurrency(profit.purchaseCost)}</TableCell>
              <TableCell className="text-right">
                <span className={`font-bold ${profit.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(profit.profit)}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <span className={`${profit.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {((profit.profit / profit.sellingAmount) * 100).toFixed(1)}%
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function BuyersProfitTable({ 
  buyerProfits 
}: { 
  buyerProfits: Record<string, { buyerName: string; profit: number; sales: number; bills: number }> 
}) {
  const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    maximumFractionDigits: 0,
  }).format(amount);
};

  const buyers = Object.entries(buyerProfits).sort((a, b) => b[1].profit - a[1].profit);

  if (buyers.length === 0) {
    return (
      <div className="text-center py-12 bg-slate-50 rounded-lg">
        <User className="h-12 w-12 mx-auto mb-3 text-slate-300" />
        <p className="text-slate-500">No buyer data yet</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50">
            <TableHead>Buyer</TableHead>
            <TableHead className="text-right">Total Bills</TableHead>
            <TableHead className="text-right">Total Sales</TableHead>
            <TableHead className="text-right">Total Profit</TableHead>
            <TableHead className="text-right">Avg Margin</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {buyers.map(([id, data]) => (
            <TableRow key={id} className="hover:bg-slate-50">
              <TableCell className="font-medium">{data.buyerName}</TableCell>
              <TableCell className="text-right">{data.bills}</TableCell>
              <TableCell className="text-right">{formatCurrency(data.sales)}</TableCell>
              <TableCell className="text-right">
                <span className={`font-bold ${data.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(data.profit)}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <span className={`${data.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {((data.profit / data.sales) * 100).toFixed(1)}%
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function ItemsProfitTable({ 
  itemProfits 
}: { 
  itemProfits: Record<string, { profit: number; sales: number; katte: number }> 
}) {
  const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    maximumFractionDigits: 0,
  }).format(amount);
};

  const items = Object.entries(itemProfits).sort((a, b) => b[1].profit - a[1].profit);

  if (items.length === 0) {
    return (
      <div className="text-center py-12 bg-slate-50 rounded-lg">
        <Package className="h-12 w-12 mx-auto mb-3 text-slate-300" />
        <p className="text-slate-500">No item data yet</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50">
            <TableHead>Item Name</TableHead>
            <TableHead className="text-right">Total Katte</TableHead>
            <TableHead className="text-right">Total Sales</TableHead>
            <TableHead className="text-right">Total Profit</TableHead>
            <TableHead className="text-right">Avg Margin</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map(([name, data]) => (
            <TableRow key={name} className="hover:bg-slate-50">
              <TableCell className="font-medium">{name}</TableCell>
              <TableCell className="text-right">{data.katte}</TableCell>
              <TableCell className="text-right">{formatCurrency(data.sales)}</TableCell>
              <TableCell className="text-right">
                <span className={`font-bold ${data.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(data.profit)}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <span className={`${data.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {((data.profit / data.sales) * 100).toFixed(1)}%
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function MonthlyProfitTable({ 
  monthlyProfits 
}: { 
  monthlyProfits: Record<string, { profit: number; sales: number; bills: number }> 
}) {
 const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    maximumFractionDigits: 0,
  }).format(amount);
};

  const months = Object.entries(monthlyProfits).sort((a, b) => b[0].localeCompare(a[0]));

  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    const date = new Date(Number(year), Number(month) - 1);
    return date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
  };

  if (months.length === 0) {
    return (
      <div className="text-center py-12 bg-slate-50 rounded-lg">
        <Calendar className="h-12 w-12 mx-auto mb-3 text-slate-300" />
        <p className="text-slate-500">No monthly data yet</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50">
            <TableHead>Month</TableHead>
            <TableHead className="text-right">Total Bills</TableHead>
            <TableHead className="text-right">Total Sales</TableHead>
            <TableHead className="text-right">Total Profit</TableHead>
            <TableHead className="text-right">Avg Margin</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {months.map(([month, data]) => (
            <TableRow key={month} className="hover:bg-slate-50">
              <TableCell className="font-medium">{formatMonth(month)}</TableCell>
              <TableCell className="text-right">{data.bills}</TableCell>
              <TableCell className="text-right">{formatCurrency(data.sales)}</TableCell>
              <TableCell className="text-right">
                <span className={`font-bold ${data.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(data.profit)}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <span className={`${data.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {((data.profit / data.sales) * 100).toFixed(1)}%
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
