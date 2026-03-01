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
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, color: 'amber' },
  { id: 'stock', label: 'Stock / Inventory', icon: Package, color: 'blue' },
  { id: 'sales', label: 'Sales / Billing', icon: Receipt, color: 'emerald' },
  { id: 'cashbook', label: 'Cash Book', icon: Wallet, color: 'amber' },
  { id: 'ledger', label: 'Accounts Ledger', icon: BookOpen, color: 'indigo' },
  { id: 'profit', label: 'Profit / Loss', icon: TrendingUp, color: 'rose' },
];

export function Sidebar({ currentView, onViewChange, isOpen, onToggle }: SidebarProps) {
  return (
    <>
      {/* Mobile Toggle - Precision Floating */}
      {!isOpen && (
        <Button
          variant="outline"
          size="icon"
          className="fixed top-4 left-4 z-50 lg:hidden h-10 w-10 bg-white shadow-md rounded-lg"
          onClick={onToggle}
        >
          <Menu className="h-5 w-5 text-slate-600" />
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
        {/* Header - Branding */}
        <div className="p-8 border-b border-slate-800">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-600 rounded-lg flex items-center justify-center shadow-lg">
              <Package className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-tight text-white leading-none">Amin <span className="text-amber-500">Rice</span></h1>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Trading Co.</p>
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
                  "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left group outline-none mb-1",
                  isActive 
                    ? "bg-amber-600 text-white shadow-md" 
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                )}
              >
                <Icon className="h-5 w-5" />
                <div className="flex-1 flex flex-col">
                  <span className="text-xs font-bold uppercase tracking-wider">
                    {item.label}
                  </span>
                </div>
                {isActive && (
                  <ChevronRight className="h-4 w-4 text-white/50" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer - Status */}
        <div className="p-6 border-t border-slate-800 bg-black/10">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Admin</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-1 w-1 rounded-full bg-emerald-500" />
                <span className="text-[9px] font-bold text-emerald-500 uppercase">Live</span>
              </div>
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
