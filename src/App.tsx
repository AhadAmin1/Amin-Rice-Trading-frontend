import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { StockManagement } from '@/components/stock/StockManagement';
import SalesBilling from '@/components/sales/SalesBilling';
import { CashBook } from '@/components/cashbook/CashBook';
import { LedgerSystem, PartyLedger } from '@/components/ledger/LedgerSystem';
import { ProfitModule } from '@/components/profit/ProfitModule';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { dataStore } from '@/store/dataStore';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import type { ViewType } from '@/types';
import { Menu, Bell, Search, Settings, HelpCircle, Calendar, Package, ShieldCheck } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Toaster } from 'sonner';
import { DueNotifications } from '@/components/notifications/DueNotifications';
import './App.css';

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    // Initial load simulation
    const timer = setTimeout(() => {
      setIsInitializing(false);
    }, 1500);

    const unsubscribe = dataStore.subscribe((loading) => {
      setIsLoading(loading);
    });
    return () => {
      unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  const [currentView, setCurrentView] = useState<ViewType>(() => {
    return (localStorage.getItem('rice_trading_view') as ViewType) || 'dashboard';
  });
  const [selectedPartyId, setSelectedPartyId] = useState<string | undefined>(() => {
    return localStorage.getItem('rice_trading_party_id') || undefined;
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);

  const [overdueItems, setOverdueItems] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribe = dataStore.onNotifications(setOverdueItems);
    setOverdueItems(dataStore.getOverdueItems());
    return () => unsubscribe();
  }, []);

  const handleNavigate = (view: ViewType, partyId?: string) => {
    setCurrentView(view);
    localStorage.setItem('rice_trading_view', view);
    if (partyId) {
      setSelectedPartyId(partyId);
      localStorage.setItem('rice_trading_party_id', partyId);
    } else {
      setSelectedPartyId(undefined);
      localStorage.removeItem('rice_trading_party_id');
    }
    window.scrollTo(0, 0);
  };

  useEffect(() => {
    (window as any).onNavigate = handleNavigate;
  }, []);

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard onNavigate={handleNavigate} />;
      case 'stock':
        return <StockManagement />;
      case 'sales':
        return <SalesBilling />;
      case 'cashbook':
        return <CashBook />;
      case 'ledger':
        return <LedgerSystem onNavigate={handleNavigate} />;
      case 'party-ledger':
        if (selectedPartyId) {
          return <PartyLedger partyId={selectedPartyId} onBack={() => handleNavigate('ledger')} />;
        }
        return <LedgerSystem onNavigate={handleNavigate} />;
      case 'profit':
        return <ProfitModule />;
      default:
        return <Dashboard onNavigate={handleNavigate} />;
    }
  };

  const getPageTitle = () => {
    switch (currentView) {
      case 'dashboard': return { primary: 'Dashboard', secondary: 'Summary' };
      case 'stock': return { primary: 'Stock', secondary: 'Inventory' };
      case 'sales': return { primary: 'Sales', secondary: 'Billing' };
      case 'cashbook': return { primary: 'Cash', secondary: 'Book' };
      case 'ledger': return { primary: 'Accounts', secondary: 'Ledger' };
      case 'party-ledger': return { primary: 'Party', secondary: 'Statement' };
      case 'profit': return { primary: 'Profit', secondary: 'Analysis' };
      default: return { primary: 'Rice', secondary: 'Trading' };
    }
  };

  const title = getPageTitle();

  return (
    <div className="min-h-screen bg-slate-50 selection:bg-amber-100 selection:text-amber-900 overflow-x-hidden antialiased">
      {(isInitializing || isLoading) && <LoadingScreen />}
      <DueNotifications />

      {/* Sidebar - Premium Navigation */}
      <Sidebar 
        currentView={currentView} 
        onViewChange={handleNavigate}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Main Content Area */}
      <main className="lg:ml-72 min-h-screen transition-all relative z-10">
        
        {/* Top Bar - Standard Header */}
        <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-6 sm:px-10 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
            
            {/* Page Title & Breadcrumb */}
            <div className="flex items-center gap-6">
              <Button 
                variant="ghost" 
                size="icon"
                className="lg:hidden h-12 w-12 rounded-xl bg-white/20 backdrop-blur-md border border-white/20 shadow-xl"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-6 w-6 text-slate-700" />
              </Button>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight leading-none">
                  {title.primary} <span className="text-amber-600 font-semibold">{title.secondary}</span>
                </h1>
              </div>
            </div>

            {/* Central Search - Floating Effect */}
            <div className="hidden xl:flex items-center relative flex-1 max-w-xl group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-amber-500 transition-colors" />
              <Input 
                placeholder="Search ledgers, bills, and stock..."
                className="h-10 w-full pl-11 bg-slate-50 border-slate-200 rounded-lg focus:ring-amber-500/10 focus:border-amber-500 transition-all font-medium text-slate-600 placeholder:text-slate-400"
              />
            </div>

            {/* Utility Icons & Profile */}
            <div className="flex items-center gap-3 sm:gap-6">
              <div className="hidden md:flex items-center gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-slate-400 hover:text-amber-600 hover:bg-amber-50/50 transition-all relative">
                      <Bell className="h-5 w-5" />
                      {overdueItems.length > 0 && (
                        <span className="absolute top-2 right-2 h-4 w-4 bg-rose-500 rounded-full border-2 border-white animate-pulse flex items-center justify-center">
                           <span className="text-[7px] font-black text-white">{overdueItems.length}</span>
                        </span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-0 rounded-2xl shadow-2xl border-slate-200 overflow-hidden" align="end">
                    <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                      <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-2">
                        <Bell className="h-3 w-3" /> Overdue Alerts
                      </h4>
                      <Badge variant="outline" className="text-[9px] font-bold bg-white text-rose-600 border-rose-100">{overdueItems.length} Pending</Badge>
                    </div>
                    <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
                      {overdueItems.length === 0 ? (
                        <div className="p-10 text-center">
                          <ShieldCheck className="h-8 w-8 text-emerald-200 mx-auto mb-3" />
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">All accounts are settled</p>
                        </div>
                      ) : (
                        <div className="divide-y divide-slate-50">
                          {overdueItems.map((item) => (
                            <div 
                              key={item.id} 
                              className="p-4 hover:bg-slate-50 transition-colors cursor-pointer group"
                              onClick={() => handleNavigate(item.type === 'sale' ? 'sales' : 'stock')}
                            >
                              <div className="flex justify-between items-start mb-1">
                                <span className="text-[10px] font-black text-slate-900 group-hover:text-amber-600 transition-colors">{item.title}</span>
                                <span className="text-[9px] font-bold text-rose-500 uppercase tracking-tighter">Overdue</span>
                              </div>
                              <p className="text-[11px] font-bold text-slate-500 leading-tight mb-2">{item.party}</p>
                              <div className="flex justify-between items-center">
                                <span className="text-[11px] font-black text-slate-900 tabular-nums">RS {item.amount.toLocaleString()}</span>
                                <span className="text-[9px] font-bold text-slate-400 uppercase">Due: {item.date}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    {overdueItems.length > 0 && (
                      <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
                        <Button 
                          variant="ghost" 
                          className="w-full h-8 text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-amber-600 hover:bg-white"
                          onClick={() => handleNavigate('ledger')}
                        >
                          View Full Statement
                        </Button>
                      </div>
                    )}
                  </PopoverContent>
                </Popover>
                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-slate-400 hover:text-amber-600 hover:bg-amber-50/50 transition-all">
                  <HelpCircle className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-slate-400 hover:text-amber-600 hover:bg-amber-50/50 transition-all">
                  <Settings className="h-5 w-5" />
                </Button>
              </div>

              <div className="h-8 w-[1px] bg-slate-200/50 hidden sm:block mx-1" />

              <div className="flex items-center gap-4 group cursor-pointer pl-1 px-3 py-1 rounded-lg hover:bg-slate-50">
                <div className="text-right hidden xl:block">
                  <p className="text-sm font-bold text-slate-900">Amin Tradings</p>
                  <p className="text-[10px] font-semibold text-emerald-600 uppercase leading-none mt-1">Admin Account</p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center border border-amber-200">
                  <span className="text-xs font-bold text-amber-700">AR</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Page Container */}
        <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto relative min-h-[calc(100vh-100px)]">
            <div className="flex items-center gap-3 mb-6 overflow-x-auto pb-4 no-scrollbar border-b border-slate-200">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border border-slate-200 shadow-sm shrink-0">
                 <Calendar className="h-3.5 w-3.5 text-slate-500" />
                 <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                    {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
                 </span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-lg border border-emerald-100 shrink-0">
                 <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                 <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Synced</span>
              </div>
              <div className="h-6 w-[1px] bg-slate-200 mx-2" />
              <button onClick={() => handleNavigate('dashboard')} className={cn("px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all", currentView === 'dashboard' ? "bg-amber-600 text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200")}>Dashboard</button>
              <button onClick={() => handleNavigate('stock')} className={cn("px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all", currentView === 'stock' ? "bg-amber-600 text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200")}>Stock</button>
            </div>

           {renderContent()}
        </div>

        {/* Global Footer - Minimalist Professional */}
        <footer className="px-6 py-8 border-t border-slate-50/50 bg-[#fafafa]">
           <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 opacity-30 hover:opacity-100 transition-opacity duration-700">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Amin Rice Trading © 2026</p>
              <div className="flex items-center gap-6">
                 <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest cursor-pointer hover:text-amber-600">Infrastructure</span>
                 <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest cursor-pointer hover:text-amber-600">Privacy Protocols</span>
                 <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest cursor-pointer hover:text-amber-600">API Documentation</span>
              </div>
           </div>
        </footer>
      </main>

      {/* Welcome Dialog - Cinematic Modal */}
      <Dialog open={showWelcome} onOpenChange={setShowWelcome}>
        <DialogContent className="max-w-xl p-0 overflow-hidden border-none rounded-[3rem] shadow-2xl shadow-amber-500/10">
          <div className="relative h-48 gold-gradient flex flex-col items-center justify-center p-10 overflow-hidden text-center">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_white_0%,transparent_70%)] opacity-20" />
            <Package className="h-16 w-16 text-white mb-4 relative z-10 drop-shadow-2xl" />
            <DialogTitle className="text-3xl font-black text-white tracking-tighter relative z-10 uppercase italic">Welcome to the Registry</DialogTitle>
            <DialogDescription className="sr-only">Initial welcome and configuration overview for the Amin Rice Trading OS.</DialogDescription>
          </div>
          <div className="p-12 bg-white space-y-8">
             <div className="space-y-4">
                <p className="text-slate-500 font-bold leading-relaxed text-center">
                  You have accessed the Amin Rice Trading central management console. This system is designed for high-precision institutional oversight.
                </p>
                <div className="flex flex-col gap-3 pt-4">
                   {[
                     "Real-time liquidity across all cash books",
                     "Premium invoice generation & WhatsApp sharing",
                     "Automated ledger balancing & debt tracking",
                     "High-fidelity inventory monitoring"
                   ].map((item, i) => (
                     <div key={i} className="flex items-center gap-3 p-4 rounded-2xl bg-amber-50/50 border border-amber-100/30 group hover:bg-amber-100/50 transition-all">
                        <div className="h-6 w-6 rounded-lg bg-white flex items-center justify-center shadow-sm">
                           <ShieldCheck className="h-4 w-4 text-emerald-500" />
                        </div>
                        <span className="text-xs font-black text-slate-700 uppercase tracking-widest">{item}</span>
                     </div>
                   ))}
                </div>
             </div>
             <Button 
               className="w-full h-16 gold-gradient hover:opacity-90 text-white font-black text-sm uppercase tracking-[0.3em] rounded-2xl shadow-xl shadow-amber-500/20 active:scale-95 transition-all"
               onClick={() => setShowWelcome(false)}
             >
               Initialize Operating System
             </Button>
          </div>
        </DialogContent>
      </Dialog>
      <Toaster position="top-right" richColors closeButton />
    </div>
  );
}

export default App;
