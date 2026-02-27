import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { StockManagement } from '@/components/stock/StockManagement';
import { SalesBilling } from '@/components/sales/SalesBilling';
import { CashBook } from '@/components/cashbook/CashBook';
import { LedgerSystem, PartyLedger } from '@/components/ledger/LedgerSystem';
import { ProfitModule } from '@/components/profit/ProfitModule';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { dataStore } from '@/store/dataStore';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import type { ViewType } from '@/types';
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
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [selectedPartyId, setSelectedPartyId] = useState<string | undefined>(undefined);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    // Check if first visit
    const hasVisited = localStorage.getItem('rice_trading_visited');
    if (!hasVisited) {
      setShowWelcome(true);
      localStorage.setItem('rice_trading_visited', 'true');
    }
  }, []);

  const handleNavigate = (view: ViewType, partyId?: string) => {
    setCurrentView(view);
    if (partyId) {
      setSelectedPartyId(partyId);
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
      case 'dashboard': return 'Dashboard';
      case 'stock': return 'Stock / Maal Book';
      case 'sales': return 'Sales & Billing';
      case 'cashbook': return 'Cash Book';
      case 'ledger': return 'Ledger (Khata Book)';
      case 'party-ledger': return 'Party Ledger';
      case 'profit': return 'Profit Module';
      default: return 'Dashboard';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {(isInitializing || isLoading) && <LoadingScreen />}
      {/* Sidebar */}
      <Sidebar 
        currentView={currentView} 
        onViewChange={handleNavigate}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Main Content */}
      <main className="lg:ml-64 min-h-screen">
        {/* Top Bar */}
        <header className="bg-white border-b sticky top-0 z-30">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 lg:hidden">
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setSidebarOpen(true)}
                >
                  <span className="sr-only">Open menu</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </Button>
                <h1 className="text-lg font-semibold text-slate-900">{getPageTitle()}</h1>
              </div>
              <div className="hidden lg:block">
                <h1 className="text-xl font-semibold text-slate-900">{getPageTitle()}</h1>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm text-slate-500">{new Date().toLocaleDateString('en-IN', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 sm:p-6 lg:p-8">
          {renderContent()}
        </div>
      </main>

      {/* Welcome Dialog */}
      <Dialog open={showWelcome} onOpenChange={setShowWelcome}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl">Welcome to Amin Rice Trading</DialogTitle>
            <DialogDescription className="text-base">
              A complete business management solution for your rice trading operations.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-amber-50 p-4 rounded-lg">
              <h3 className="font-medium text-amber-900 mb-2">Quick Start Guide:</h3>
              <ul className="text-sm text-amber-800 space-y-1 list-disc list-inside">
                <li>Add Millers and Buyers in the Ledger section</li>
                <li>Record stock purchases in Stock / Maal Book</li>
                <li>Create sales bills in Sales & Billing</li>
                <li>Track cash flow in Cash Book</li>
                <li>Monitor profits in Profit Module</li>
              </ul>
            </div>
            <p className="text-sm text-slate-600">
              Sample data has been loaded for you to explore. Click around to get familiar with the system!
            </p>
            <Button 
              className="w-full bg-amber-500 hover:bg-amber-600 text-white"
              onClick={() => setShowWelcome(false)}
            >
              Get Started
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default App;
