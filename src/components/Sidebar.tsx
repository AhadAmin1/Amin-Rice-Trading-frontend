import { 
  LayoutDashboard, 
  Package, 
  Receipt, 
  Wallet, 
  BookOpen, 
  TrendingUp,
  Menu,
  X,
  ChevronRight,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { ViewType } from '@/types';

interface SidebarProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const menuItems: { id: ViewType; label: string; icon: React.ElementType; color: string }[] = [
  { id: 'dashboard', label: 'Commercial Hub', icon: LayoutDashboard, color: 'amber' },
  { id: 'stock', label: 'Inventory / Maal', icon: Package, color: 'blue' },
  { id: 'sales', label: 'Billing & Invoices', icon: Receipt, color: 'emerald' },
  { id: 'cashbook', label: 'Liquidity Center', icon: Wallet, color: 'amber' },
  { id: 'ledger', label: 'Institutional Khata', icon: BookOpen, color: 'indigo' },
  { id: 'profit', label: 'Yield Analytics', icon: TrendingUp, color: 'rose' },
];

export function Sidebar({ currentView, onViewChange, isOpen, onToggle }: SidebarProps) {
  return (
    <>
      {/* Mobile Toggle - Precision Floating */}
      {!isOpen && (
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-6 left-6 z-50 lg:hidden h-12 w-12 rounded-2xl premium-glass border-white/20 shadow-xl active:scale-90 transition-all"
          onClick={onToggle}
        >
          <Menu className="h-6 w-6 text-slate-800" />
        </Button>
      )}

      {/* Cinematic Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden transition-all duration-500"
          onClick={onToggle}
        />
      )}

      {/* Main Sidebar - Premium Monolith */}
      <aside 
        className={cn(
          "fixed left-0 top-0 h-full premium-gradient text-white z-40 transition-all duration-500 ease-in-out border-r border-white/5 shadow-[20px_0_50px_rgba(0,0,0,0.3)]",
          "w-72 flex flex-col",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Header - Corporate Identity */}
        <div className="p-10 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-amber-500/5 -skew-y-12 transform -translate-y-20" />
          <div className="flex flex-col items-center text-center gap-6 relative z-10">
            <div className="w-20 h-20 gold-gradient rounded-3xl flex items-center justify-center shadow-2xl shadow-amber-500/20 group cursor-pointer">
              <Package className="h-10 w-10 text-white group-hover:scale-110 transition-transform duration-500" />
            </div>
            <div>
              <h1 className="font-black text-2xl tracking-tighter text-white uppercase italic leading-none">Amin <span className="text-amber-500">Rice</span></h1>
              <div className="flex items-center justify-center gap-2 mt-2">
                <div className="h-[1px] w-4 bg-amber-500/50" />
                <p className="text-[10px] font-black text-amber-500/80 tracking-[0.3em] uppercase">Enterprise</p>
                <div className="h-[1px] w-4 bg-amber-500/50" />
              </div>
            </div>
          </div>
        </div>

        {/* Navigation - Institutional Menu */}
        <nav className="flex-1 px-6 space-y-1.5 overflow-y-auto custom-scrollbar pt-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => {
                  onViewChange(item.id);
                  if (isOpen) onToggle();
                }}
                className={cn(
                  "w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-500 text-left group relative outline-none mb-1",
                  isActive 
                    ? "bg-white/10 text-white shadow-inner border border-white/5 active:scale-95" 
                    : "text-slate-400 hover:text-white hover:bg-white/5 hover:translate-x-1 active:scale-98"
                )}
              >
                <div className={cn(
                  "p-2.5 rounded-xl transition-all duration-500",
                  isActive 
                    ? `bg-amber-500 text-white shadow-[0_0_20px_rgba(245,158,11,0.3)]` 
                    : "bg-slate-800/50 group-hover:bg-slate-700"
                )}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 flex flex-col">
                  <span className={cn(
                    "text-xs font-black uppercase tracking-widest transition-colors duration-500",
                    isActive ? "text-white" : "text-slate-400 group-hover:text-slate-200"
                  )}>
                    {item.label}
                  </span>
                </div>
                {isActive && (
                  <div className="absolute right-4 h-1.5 w-1.5 rounded-full bg-amber-500 shadow-[0_0_10px_#f59e0b]" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer - Administrative Status */}
        <div className="p-8 border-t border-white/5 bg-black/20">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Admin Mode</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-1 w-1 rounded-full bg-emerald-500" />
                <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Live</span>
              </div>
            </div>
            
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-4 hover:bg-white/10 transition-colors cursor-pointer group">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 group-hover:bg-amber-500/20 transition-all">
                <Zap className="h-5 w-5 text-amber-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">System Health</p>
                <p className="text-xs font-black text-white truncate tracking-tight">OPTIMIZED</p>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-amber-500 group-hover:translate-x-1 transition-all" />
            </div>
          </div>
        </div>
        
        {/* Mobile Close Button */}
        {isOpen && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-6 right-6 lg:hidden text-white/50 hover:text-white"
            onClick={onToggle}
          >
            <X className="h-6 w-6" />
          </Button>
        )}
      </aside>
    </>
  );
}
