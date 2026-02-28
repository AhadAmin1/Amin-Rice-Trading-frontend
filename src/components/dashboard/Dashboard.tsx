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
    <div 
      className="premium-glass p-6 rounded-2xl cursor-pointer hover:shadow-premium transition-all duration-300 hover:-translate-y-2 active:scale-95 group relative overflow-hidden h-full flex flex-col justify-between border-white/20"
      onClick={onClick}
    >
      <div 
        className="absolute top-0 right-0 w-40 h-40 -mr-12 -mt-12 opacity-5 group-hover:opacity-15 transition-opacity duration-700 rounded-full blur-3xl"
        style={{ backgroundColor: color }}
      />
      
      <div className="flex items-start justify-between mb-8 relative z-10">
        <div className="space-y-3">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{title}</p>
          {loading ? (
            <Skeleton className="h-12 w-48 rounded-2xl bg-slate-200/50" />
          ) : (
            <h3 className="text-4xl font-bold text-slate-900 tracking-tight tabular-nums leading-none drop-shadow-sm">{value}</h3>
          )}
        </div>
        <div 
          className="p-5 rounded-[1.5rem] shadow-inner transition-all duration-700 group-hover:rotate-6 group-hover:scale-110 border border-white/20"
          style={{ backgroundColor: `${color}10` }}
        >
          <Icon className="h-8 w-8" style={{ color }} />
        </div>
      </div>

      {!loading && subtitle && (
        <div className="flex items-center justify-between mt-auto relative z-10 pt-4 border-t border-slate-100/50">
          <div className="flex items-center gap-3">
            <div className="h-2.5 w-2.5 rounded-full shadow-[0_0_8px_currentColor]" style={{ backgroundColor: color, color }} />
            <p className="text-[10px] font-bold text-slate-500 tracking-widest uppercase truncate">{subtitle}</p>
          </div>
          <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-amber-50 transition-colors">
            <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-amber-500 group-hover:translate-x-0.5 transition-all" />
          </div>
        </div>
      )}
    </div>
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
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      
      {/* Welcome & Global Metrics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        <div className="lg:col-span-2 space-y-6">
           <div className="flex items-center gap-4 mb-2">
              <div className="h-10 w-10 gold-gradient rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/10">
                 <ShieldCheck className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight leading-none">
                 Market <span className="text-gold">Intelligence</span>
              </h2>
           </div>
           <p className="text-slate-500 font-medium max-w-xl text-base">
              Enterprise overview of Amin Rice Trading. All metrics are updated in real-time from consistent ledger audits.
           </p>
           
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <DashboardCard
                title="Capital Flow Index"
                value={loading ? "loading" : formatCurrency(summary.cashBalance)}
                subtitle="Net Liquidity Position"
                icon={Wallet}
                onClick={() => onNavigate('cashbook')}
                color="#f59e0b"
                loading={loading}
              />
              <DashboardCard
                title="Yield/Profit Valuation"
                value={loading ? "loading" : formatCurrency(summary.totalProfit)}
                subtitle="Institutional Net Earning"
                icon={TrendingUp}
                onClick={() => onNavigate('profit')}
                color="#10b981"
                loading={loading}
              />
           </div>
        </div>

        <Card className="rounded-2xl bg-slate-900 border-none shadow-2xl relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-amber-500/20 transition-all duration-1000" />
           <CardContent className="p-6 h-full flex flex-col justify-between relative z-10">
              <div className="space-y-6">
                 <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">System Health</span>
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                       <div className="h-1 w-1 rounded-full bg-emerald-500" />
                       <span className="text-[8px] font-bold text-emerald-500 uppercase">Synced</span>
                    </div>
                 </div>
                 <div className="space-y-2">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Global Asset Volume</p>
                    <h4 className="text-4xl font-bold text-white tabular-nums tracking-tight">
                       {loading ? "..." : summary.totalStockKatte} <span className="text-xs text-slate-400 tracking-widest leading-none">UNIT TYPE</span>
                    </h4>
                    <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">{formatWeight(summary.totalStockWeight)} NET MASS</p>
                 </div>
              </div>
              
              <Button onClick={() => onNavigate('stock')} variant="outline" className="w-full h-12 rounded-2xl bg-white/10 border-white/10 text-white font-bold uppercase tracking-widest text-[9px] hover:bg-white hover:text-slate-900 transition-all group/btn">
                 Manage Global Assets <ExternalLink className="h-3 w-3 ml-2 group-hover/btn:translate-x-1 transition-transform" />
              </Button>
           </CardContent>
        </Card>
      </div>

      {/* Exposure Matrix Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DashboardCard
          title="Consolidated Receivables"
          value={loading ? "loading" : formatCurrency(summary.totalReceivable)}
          subtitle="Outstanding Market Credit"
          icon={ArrowDownLeft}
          onClick={() => onNavigate('ledger')}
          color="#3b82f6"
          loading={loading}
        />
        <DashboardCard
          title="Institutional Payables"
          value={loading ? "loading" : formatCurrency(summary.totalPayable)}
          subtitle="Sourcing Liability / Debts"
          icon={ArrowUpRight}
          onClick={() => onNavigate('ledger')}
          color="#ef4444"
          loading={loading}
        />
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
            className="group flex items-center justify-between p-6 premium-glass rounded-2xl border-white/20 hover:border-amber-500/30 hover:shadow-premium transition-all duration-300 cursor-pointer hover:-translate-y-1"
          >
            <div className="flex items-center gap-5">
              <div className="h-16 w-16 rounded-[1.5rem] bg-white text-slate-900 flex items-center justify-center group-hover:gold-gradient group-hover:text-white transition-all duration-300 shadow-sm group-hover:shadow-xl group-hover:shadow-amber-500/20">
                <Receipt className="h-7 w-7" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 tracking-tight mb-1">{bill.billNumber}</p>
                <div className="flex items-center gap-2">
                  <div className="h-1 w-1 rounded-full bg-amber-500" />
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">{bill.buyerName}</p>
                </div>
              </div>
            </div>
            <div className="text-right flex flex-col items-end gap-2">
              <p className="text-xl font-bold text-slate-900 tracking-tight leading-none">{formatCurrency(bill.totalAmount)}</p>
              <div className="flex items-center gap-2">
                 <span className="text-[8px] font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full uppercase border border-amber-100/50">{bill.katte} Katte</span>
                 <div className={cn("h-2 w-2 rounded-full shadow-[0_0_8px_currentColor]", bill.status === 'paid' ? "bg-emerald-500 text-emerald-500" : "bg-amber-400 text-amber-400")} />
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
            className="group flex items-center justify-between p-6 bg-white rounded-[2rem] border border-slate-100/60 hover:border-emerald-500/20 hover:shadow-xl transition-all duration-300 cursor-pointer"
          >
            <div className="flex items-center gap-5">
              <div className={cn(
                "h-14 w-14 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-inner",
                (entry.type === 'in' || entry.credit > 0) ? "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-500" : "bg-rose-50 text-rose-600 group-hover:bg-rose-500",
                "group-hover:text-white"
              )}>
                {(entry.type === 'in' || entry.credit > 0) ? <ArrowUpRight className="h-7 w-7" /> : <ArrowDownLeft className="h-7 w-7" />}
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
                "text-lg font-bold tracking-tight leading-none mb-1.5",
                (entry.type === 'in' || entry.credit > 0) ? "text-emerald-600" : "text-rose-600"
              )}>
                {(entry.type === 'in' || entry.credit > 0) ? '+' : '-'}{formatCurrency(entry.credit || entry.debit)}
              </p>
              <div className="flex items-center justify-end gap-1.5 opacity-40 group-hover:opacity-100 transition-opacity">
                 <span className="text-[8px] font-bold text-slate-400 uppercase">Available</span>
                 <span className="text-[10px] font-bold text-slate-900 tabular-nums tracking-tight">{formatCurrency(entry.balance)}</span>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
