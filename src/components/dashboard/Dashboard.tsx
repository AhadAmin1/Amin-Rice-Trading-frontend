import { useEffect, useState } from 'react';
import { 
  Package, 
  Wallet, 
  ArrowDownLeft, 
  ArrowUpRight, 
  TrendingUp,
  Receipt,
  ChevronRight,
  ShieldCheck,
  Zap,
  Clock,
  ExternalLink
} from 'lucide-react';
import { dataStore } from '@/store/dataStore';
import { cn } from '@/lib/utils';
import type { DashboardSummary, ViewType, Bill, CashEntry as CashEntryType } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface DashboardProps {
  onNavigate: (view: ViewType) => void;
}

interface DashboardCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ElementType;
  onClick: () => void;
  color: string;
  loading?: boolean;
}

function DashboardCard({ title, value, subtitle, icon: Icon, onClick, color, loading }: DashboardCardProps) {
  return (
    <Card 
      className="p-6 cursor-pointer hover:bg-slate-50 transition-colors active:scale-95 group relative overflow-hidden h-full flex flex-col justify-between border-slate-200"
      onClick={onClick}
    >
      
      <div className="flex items-start justify-between mb-8 relative z-10">
        <div className="space-y-2">
          <p className="text-[10px] font-extrabold text-slate-600 uppercase tracking-wider">{title}</p>
          {loading ? (
            <Skeleton className="h-10 w-40 rounded-lg bg-slate-100" />
          ) : (
            <h3 className="text-3xl font-bold text-slate-950 tracking-tight tabular-nums leading-none">{value}</h3>
          )}
        </div>
        <div 
          className="p-4 rounded-xl shadow-sm border border-slate-100"
          style={{ backgroundColor: `${color}10` }}
        >
          <Icon className="h-6 w-6" style={{ color }} />
        </div>
      </div>

      {!loading && subtitle && (
        <div className="flex items-center justify-between mt-auto relative z-10 pt-4 border-t border-slate-50">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
            <p className="text-[10px] font-semibold text-slate-500 uppercase truncate">{subtitle}</p>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-slate-600 transition-colors" />
        </div>
      )}
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
      maximumFractionDigits: 0,
    }).format(amount)}`;
  };

  const formatWeight = (kg: number) => {
    if (kg >= 1000) return `${(kg / 1000).toFixed(1)} MT`;
    return `${kg.toFixed(0)} kg`;
  };

  return (
    <div className="space-y-6">
      
      {/* Summary Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Business Overview</h2>
          <p className="text-slate-500 text-sm mt-1">Real-time summary of your rice trading status.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard
          title="Cash Balance"
          value={loading ? "loading" : formatCurrency(summary.cashBalance)}
          subtitle="Available Liquidity"
          icon={Wallet}
          onClick={() => onNavigate('cashbook')}
          color="#f59e0b"
          loading={loading}
        />
        <DashboardCard
          title="Total Profit"
          value={loading ? "loading" : formatCurrency(summary.totalProfit)}
          subtitle="Net Earnings"
          icon={TrendingUp}
          onClick={() => onNavigate('profit')}
          color="#10b981"
          loading={loading}
        />
        <DashboardCard
          title="Receivables"
          value={loading ? "loading" : formatCurrency(summary.totalReceivable)}
          subtitle="From Buyers"
          icon={ArrowDownLeft}
          onClick={() => onNavigate('ledger')}
          color="#3b82f6"
          loading={loading}
        />
        <DashboardCard
          title="Payables"
          value={loading ? "loading" : formatCurrency(summary.totalPayable)}
          subtitle="To Millers"
          icon={ArrowUpRight}
          onClick={() => onNavigate('ledger')}
          color="#ef4444"
          loading={loading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 bg-slate-900 text-white p-6 rounded-xl border-none shadow-sm flex flex-col justify-between">
           <div className="space-y-4">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Current Inventory</span>
              <div className="space-y-1">
                 <h4 className="text-4xl font-bold tabular-nums tracking-tight">
                    {loading ? "..." : summary.totalStockKatte} <span className="text-xs text-slate-400 uppercase">Katte</span>
                 </h4>
                 <p className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">{formatWeight(summary.totalStockWeight)} Total Weight</p>
              </div>
           </div>
           <Button onClick={() => onNavigate('stock')} className="mt-6 w-full h-10 bg-white text-slate-900 font-bold hover:bg-slate-100 uppercase tracking-wider text-[10px]">
              View Inventory
           </Button>
        </Card>
      </div>

      {/* Transaction Journal Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
        {/* Recent Bills Monitoring */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-xl bg-slate-900 flex items-center justify-center text-white">
                 <Receipt className="h-4 w-4" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">Recent Invoices</h3>
            </div>
            <Button variant="ghost" className="text-[10px] font-bold text-amber-600 uppercase tracking-widest hover:bg-amber-50" onClick={() => onNavigate('sales')}>View Registry</Button>
          </div>
          <RecentBills onNavigate={onNavigate} />
        </div>
        
        {/* Recent Cash Flow Monitoring */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-xl bg-slate-900 flex items-center justify-center text-white">
                 <Zap className="h-4 w-4 text-amber-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">Live Cash Flow</h3>
            </div>
            <Button variant="ghost" className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest hover:bg-emerald-50" onClick={() => onNavigate('cashbook')}>View Treasury</Button>
          </div>
          <RecentCashEntries onNavigate={onNavigate} />
        </div>
      </div>
    </div>
  );
}

function RecentBills({ onNavigate }: { onNavigate: (v: ViewType) => void }) {
  const [bills, setBills] = useState<Bill[]>([]);

  useEffect(() => {
    const fetchBills = () => {
      dataStore.getBills().then(allBills => {
        setBills(allBills.slice(-4).reverse());
      });
    };
    fetchBills();
    const unsubscribe = dataStore.onUpdate(fetchBills);
    return () => unsubscribe();
  }, []);

  const formatCurrency = (amount: number) => {
    return `RS ${new Intl.NumberFormat('en-PK', { maximumFractionDigits: 0 }).format(amount)}`;
  };

  return (
    <div className="space-y-4">
      {bills.length === 0 ? (
        <div className="text-center py-16 bg-white/50 rounded-2xl border border-slate-100 flex flex-col items-center justify-center">
          <Package className="h-10 w-10 text-slate-200 mb-4" />
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No Recent Activity Indexed</p>
        </div>
      ) : (
        bills.map((bill) => (
          <div 
            key={bill.id} 
            onClick={() => onNavigate('sales')}
            className="group flex items-center justify-between p-4 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-all shadow-sm">
                <Receipt className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 tracking-tight mb-1">{bill.billNumber}</p>
                <div className="flex items-center gap-2">
                  <div className="h-1 w-1 rounded-full bg-amber-500" />
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">{bill.buyerName}</p>
                </div>
              </div>
            </div>
            <div className="text-right flex flex-col items-end gap-1.5">
              <p className="text-lg font-bold text-slate-900 leading-none">{formatCurrency(bill.totalAmount)}</p>
              <div className="flex items-center gap-2">
                 <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded uppercase">{bill.katte} Katte</span>
                 <div className={cn("h-1.5 w-1.5 rounded-full", bill.status === 'paid' ? "bg-emerald-500" : "bg-amber-500")} />
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function RecentCashEntries({ onNavigate }: { onNavigate: (v: ViewType) => void }) {
  const [entries, setEntries] = useState<CashEntryType[]>([]);

  useEffect(() => {
    const fetchEntries = () => {
      dataStore.getCashEntries().then(allEntries => {
        setEntries(allEntries.slice(-4).reverse());
      });
    };
    fetchEntries();
    const unsubscribe = dataStore.onUpdate(fetchEntries);
    return () => unsubscribe();
  }, []);

  const formatCurrency = (amount: number) => {
    return `RS ${new Intl.NumberFormat('en-PK', { maximumFractionDigits: 0 }).format(amount)}`;
  };

  return (
    <div className="space-y-4">
      {entries.length === 0 ? (
        <div className="text-center py-16 bg-white/50 rounded-2xl border border-slate-100 flex flex-col items-center justify-center">
          <Wallet className="h-10 w-10 text-slate-200 mb-4" />
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Treasury Log Clear</p>
        </div>
      ) : (
        entries.map((entry) => (
          <div 
            key={entry.id} 
            onClick={() => onNavigate('cashbook')}
            className="group flex items-center justify-between p-4 bg-white rounded-lg border border-slate-200 hover:border-slate-300 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className={cn(
                "h-11 w-11 rounded-lg flex items-center justify-center transition-colors shadow-sm",
                (entry.type === 'in' || entry.credit > 0) ? "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600" : "bg-rose-50 text-rose-600 group-hover:bg-rose-600",
                "group-hover:text-white"
              )}>
                {(entry.type === 'in' || entry.credit > 0) ? <ArrowUpRight className="h-6 w-6" /> : <ArrowDownLeft className="h-6 w-6" />}
              </div>
              <div className="min-w-0 pr-4">
                <p className="text-sm font-bold text-slate-900 tracking-tight truncate mb-0.5">{entry.description}</p>
                <div className="flex items-center gap-2">
                   <Clock className="h-3 w-3 text-slate-300" />
                   <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">{entry.date}</p>
                </div>
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className={cn(
                "text-base font-bold leading-none mb-1",
                (entry.type === 'in' || entry.credit > 0) ? "text-emerald-600" : "text-rose-600"
              )}>
                {(entry.type === 'in' || entry.credit > 0) ? '+' : '-'}{formatCurrency(entry.credit || entry.debit)}
              </p>
              <div className="flex items-center justify-end gap-1.5 opacity-60">
                 <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Balance</span>
                 <span className="text-[10px] font-bold text-slate-700 tabular-nums">{formatCurrency(entry.balance)}</span>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
