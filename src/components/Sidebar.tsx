import { 
  LayoutDashboard, 
  Package, 
  Receipt, 
  Wallet, 
  BookOpen, 
  TrendingUp,
  Menu,
  X
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

const menuItems: { id: ViewType; label: string; icon: React.ElementType }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'stock', label: 'Stock / Maal Book', icon: Package },
  { id: 'sales', label: 'Sales / Billing', icon: Receipt },
  { id: 'cashbook', label: 'Cash Book', icon: Wallet },
  { id: 'ledger', label: 'Ledger (Khata)', icon: BookOpen },
  { id: 'profit', label: 'Profit', icon: TrendingUp },
];

export function Sidebar({ currentView, onViewChange, isOpen, onToggle }: SidebarProps) {
  return (
    <>
      {/* Mobile Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden"
        onClick={onToggle}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed left-0 top-0 h-full bg-slate-900 text-white z-40 transition-transform duration-300 ease-in-out",
          "w-64 flex flex-col",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center">
              <Package className="h-6 w-6 text-slate-900" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight text-white">Amin Rice Trading</h1>
              <p className="text-xs text-slate-400">Account Managed for Abu</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => {
                  onViewChange(item.id);
                  onToggle();
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-left",
                  isActive 
                    ? "bg-amber-500 text-slate-900 font-medium" 
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700">
          <div className="text-xs text-slate-400 text-center">
            <p>© 2024 Amin Rice Trading</p>
            <p className="mt-1">Built for Daily Business</p>
          </div>
        </div>
      </aside>
    </>
  );
}
