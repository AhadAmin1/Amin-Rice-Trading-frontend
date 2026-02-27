import { useEffect, useState } from 'react';
import { 
  Package, 
  Wallet, 
  ArrowDownLeft, 
  ArrowUpRight, 
  TrendingUp 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { dataStore } from '@/store/dataStore';
import type { DashboardSummary, ViewType } from '@/types';

interface DashboardProps {
  onNavigate: (view: ViewType) => void;
}

interface DashboardCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ElementType;
  trend?: 'up' | 'down' | 'neutral';
  onClick: () => void;
  color: string;
}

import { Skeleton } from '@/components/ui/skeleton';

function DashboardCard({ title, value, subtitle, icon: Icon, onClick, color }: DashboardCardProps) {
  const isLoading = value === "loading" || !value;

  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-[1.02] border-l-4"
      style={{ borderLeftColor: color }}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-slate-600">{title}</CardTitle>
        <div 
          className="p-2 rounded-lg"
          style={{ backgroundColor: `${color}20` }}
        >
          <Icon className="h-5 w-5" style={{ color }} />
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-4 w-16" />
          </div>
        ) : (
          <>
            <div className="text-2xl font-bold text-slate-900">{value}</div>
            {subtitle && (
              <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const [summary, setSummary] = useState<DashboardSummary>({
    totalStockKatte: 0,
    totalStockWeight: 0,
    cashBalance: 0,
    totalReceivable: 0,
    totalPayable: 0,
    totalProfit: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSummary = () => {
      setLoading(true);
      dataStore.getDashboardSummary()
        .then(setSummary)
        .finally(() => setLoading(false));
    };

    loadSummary();
    const unsubscribe = dataStore.onUpdate(loadSummary);
    return () => unsubscribe();
  }, []);

   const formatCurrency = (amount: number) => {
    return `RS ${new Intl.NumberFormat('en-PK', {
      maximumFractionDigits: 2,
    }).format(amount)}`;
  };

  const formatWeight = (kg: number) => {
    if (kg >= 1000) {
      return `${(kg / 1000).toFixed(2)} MT`;
    }
    return `${kg.toFixed(0)} kg`;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Dashboard</h2>
          <p className="text-slate-500 mt-1">Overview of your rice trading business</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <DashboardCard
          title="Total Stock"
          value={loading ? "loading" : `${summary.totalStockKatte} Katte`}
          subtitle={loading ? undefined : formatWeight(summary.totalStockWeight)}
          icon={Package}
          onClick={() => onNavigate('stock')}
          color="#f59e0b"
        />
        
        <DashboardCard
          title="Cash Balance"
          value={loading ? "loading" : formatCurrency(summary.cashBalance)}
          subtitle={loading ? undefined : "Available cash in hand"}
          icon={Wallet}
          onClick={() => onNavigate('cashbook')}
          color="#10b981"
        />
        
        <DashboardCard
          title="Total Receivable"
          value={loading ? "loading" : formatCurrency(summary.totalReceivable)}
          subtitle={loading ? undefined : "From Buyers"}
          icon={ArrowDownLeft}
          onClick={() => onNavigate('ledger')}
          color="#3b82f6"
        />
        
        <DashboardCard
          title="Total Payable"
          value={loading ? "loading" : formatCurrency(summary.totalPayable)}
          subtitle={loading ? undefined : "To Millers"}
          icon={ArrowUpRight}
          onClick={() => onNavigate('ledger')}
          color="#ef4444"
        />
        
        <DashboardCard
          title="Total Profit"
          value={loading ? "loading" : formatCurrency(summary.totalProfit)}
          subtitle={loading ? undefined : "Amin's Net Profit"}
          icon={TrendingUp}
          onClick={() => onNavigate('profit')}
          color="#8b5cf6"
        />
      </div>

      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bills */}
        <RecentBills />
        
        {/* Recent Cash Entries */}
        <RecentCashEntries />
      </div>
    </div>
  );
}

function RecentBills() {
  const [bills, setBills] = useState<any[]>([]);

  useEffect(() => {
    const fetchBills = () => {
      dataStore.getBills().then(allBills => {
        setBills(allBills.slice(-5).reverse());
      });
    };

    fetchBills();
    const unsubscribe = dataStore.onUpdate(fetchBills);
    return () => unsubscribe();
  }, []);

 const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    maximumFractionDigits: 0,
  }).format(amount);
};

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Recent Bills</CardTitle>
      </CardHeader>
      <CardContent>
        {bills.length === 0 ? (
          <p className="text-slate-500 text-center py-4">No bills yet</p>
        ) : (
          <div className="space-y-3">
            {bills.map((bill) => (
              <div 
                key={bill.id} 
                className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
              >
                <div>
                  <p className="font-medium text-slate-900">{bill.billNumber}</p>
                  <p className="text-sm text-slate-500">{bill.buyerName}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-slate-900">{formatCurrency(bill.totalAmount)}</p>
                  <p className="text-sm text-slate-500">{bill.katte} Katte</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function RecentCashEntries() {
  const [entries, setEntries] = useState<any[]>([]);

  useEffect(() => {
    const fetchEntries = () => {
      dataStore.getCashEntries().then(allEntries => {
        setEntries(allEntries.slice(-5).reverse());
      });
    };

    fetchEntries();
    const unsubscribe = dataStore.onUpdate(fetchEntries);
    return () => unsubscribe();
  }, []);

 const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    maximumFractionDigits: 0,
  }).format(amount);
};

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Recent Cash Entries</CardTitle>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <p className="text-slate-500 text-center py-4">No cash entries yet</p>
        ) : (
          <div className="space-y-3">
            {entries.map((entry) => (
              <div 
                key={entry.id} 
                className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
              >
                <div>
                  <p className="font-medium text-slate-900">{entry.description}</p>
                  <p className="text-sm text-slate-500">{entry.date}</p>
                </div>
                <div className="text-right">
                  <p className={`font-medium ${entry.debit > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {entry.debit > 0 ? '+' : '-'}{formatCurrency(entry.debit || entry.credit)}
                  </p>
                  <p className="text-sm text-slate-500">Bal: {formatCurrency(entry.balance)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
