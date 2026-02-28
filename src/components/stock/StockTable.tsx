import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Eye, Pencil, Trash2, Wallet, Package } from 'lucide-react';
import type { StockItem, Bill } from '@/types';

interface StockTableProps {
  stock: StockItem[];
  bills: Bill[];
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onPayment: (id: string) => void;
  onNavigateParty: (partyId: string) => void;
}

export function StockTable({ 
  stock, 
  bills, 
  onView, 
  onEdit, 
  onDelete, 
  onPayment,
  onNavigateParty
}: StockTableProps) {
  
  const formatCurrency = (amount: number) => {
    return `RS ${new Intl.NumberFormat('en-PK', {
      maximumFractionDigits: 2,
    }).format(amount)}`;
  };

  return (
    <div className="overflow-x-auto custom-scrollbar">
      <Table className="min-w-[1200px]">
        <TableHeader>
          <TableRow className="bg-slate-50/80 border-b border-amber-100/50 hover:bg-slate-100/30 transition-colors">
            <TableHead className="w-[110px] py-5 font-black text-[10px] tracking-widest text-slate-500 uppercase italic">Arrival Date</TableHead>
            <TableHead className="py-5 font-black text-[10px] tracking-widest text-slate-500 uppercase">Receipt #</TableHead>
            <TableHead className="py-5 font-black text-[10px] tracking-widest text-slate-500 uppercase">Miller / Party</TableHead>
            <TableHead className="py-5 font-black text-[10px] tracking-widest text-slate-500 uppercase">Description</TableHead>
            <TableHead className="text-right py-5 font-black text-[10px] tracking-widest text-slate-500 uppercase">Inventory</TableHead>
            <TableHead className="text-right py-5 font-black text-[10px] tracking-widest text-slate-500 uppercase">Weights</TableHead>
            <TableHead className="py-5 font-black text-[10px] tracking-widest text-slate-500 uppercase">Condition</TableHead>
            <TableHead className="text-right py-5 font-black text-[10px] tracking-widest text-slate-500 uppercase">Purch. Rate</TableHead>
            <TableHead className="text-right py-5 font-black text-[10px] tracking-widest text-slate-500 uppercase">Bhardana</TableHead>
            <TableHead className="text-right py-5 font-black text-[10px] tracking-widest text-slate-500 uppercase">Net Total</TableHead>
            <TableHead className="text-right py-5 font-black text-[10px] tracking-widest text-slate-500 uppercase">Payable Bal.</TableHead>
            <TableHead className="py-5 font-black text-[10px] tracking-widest text-slate-500 uppercase">Buyers (Sold To)</TableHead>
            <TableHead className="text-center py-5 font-black text-[10px] tracking-widest text-slate-500 uppercase">Status</TableHead>
            <TableHead className="text-right py-5 pr-8 font-black text-[10px] tracking-widest text-slate-500 uppercase">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {stock.length === 0 ? (
            <TableRow>
              <TableCell colSpan={14} className="h-64 text-center">
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="p-6 bg-amber-50 rounded-full border border-amber-100">
                    <Package className="h-10 w-10 text-amber-200" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-lg font-bold text-slate-800">No Stock Records</p>
                    <p className="text-sm text-slate-400 max-w-[200px] mx-auto italic">Start by adding your first purchase from a miller.</p>
                  </div>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            stock
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map((item) => (
                <TableRow key={item.id} className="group hover:bg-amber-50/30 transition-all duration-300 border-b border-slate-100">
                  <TableCell className="py-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-600 text-[13px]">{item.date}</span>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Verified</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className={cn(
                      "inline-flex items-center px-2.5 py-1 rounded-lg font-mono text-xs font-bold ring-1 ring-inset",
                      item.receiptNumber 
                        ? "bg-amber-50 text-amber-700 ring-amber-500/30 group-hover:bg-amber-100" 
                        : "bg-slate-50 text-slate-400 ring-slate-500/20"
                    )}>
                      {item.receiptNumber || 'PENDING'}
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <div 
                      className="cursor-pointer group/link flex flex-col"
                      onClick={() => onNavigateParty(item.millerId)}
                    >
                      <span className="font-black text-slate-900 group-hover/link:text-amber-600 transition-colors uppercase tracking-tight">{item.millerName}</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic group-hover/link:translate-x-1 transition-transform inline-block">View Ledger →</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <span className="font-bold text-slate-600 tracking-tight text-[13px]">{item.itemName}</span>
                  </TableCell>
                  <TableCell className="text-right py-4">
                    <div className="flex flex-col items-end">
                      <span className="font-black text-slate-900">{item.remainingKatte}</span>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter bg-slate-100 px-1 rounded">OF {item.katte} PCS</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right py-4">
                    <div className="flex flex-col items-end">
                      <span className="font-black text-amber-600">{item.remainingWeight?.toLocaleString() || 0}</span>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">KG NET</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex flex-col gap-1">
                      <span className={cn(
                        "text-[10px] font-black uppercase px-2.5 py-1 rounded-lg w-fit shadow-sm border",
                        item.paymentType === 'cash' || !item.paymentType 
                          ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
                          : "bg-rose-50 text-rose-700 border-rose-100"
                      )}>
                        {item.paymentType === 'credit' ? 'Udhar (Credit)' : 'Cash Payment'}
                      </span>
                      {(item.paymentType === 'credit' || item.dueDays) && (
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest pl-1">
                          Term: {item.dueDays || 0} Days
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right py-4">
                    <div className="flex flex-col items-end">
                      <span className="font-black text-slate-900">{formatCurrency(item.purchaseRate)}</span>
                      <span className="text-[9px] font-bold text-slate-400 uppercase">/{item.rateType === 'per_kg' ? 'kg' : 'katta'}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right py-4">
                    <span className="font-bold text-slate-500 italic text-[13px]">{formatCurrency(item.bhardana || 0)}</span>
                  </TableCell>
                  <TableCell className="text-right py-4">
                    <div className="flex flex-col items-end">
                      <div className="gold-gradient text-white px-3 py-1 rounded-lg text-[12px] font-black shadow-lg shadow-amber-500/20 mb-1">
                        {formatCurrency(item.totalAmount)}
                      </div>
                      <div className={cn(
                        "text-[10px] font-black px-1.5 py-0.5 rounded",
                        item.paidAmount > 0 ? "bg-emerald-50 text-emerald-600" : "bg-slate-50 text-slate-400"
                      )}>
                        PAID: {formatCurrency(item.paidAmount || 0)}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right py-4">
                    <div className="flex flex-col items-end">
                      <span className={cn(
                        "font-black text-[15px] tracking-tighter",
                        (item.totalAmount - (item.paidAmount || 0)) > 1 ? "text-rose-600" : "text-slate-900"
                      )}>
                        {formatCurrency(item.totalAmount - (item.paidAmount || 0))}
                      </span>
                      {(item.totalAmount - (item.paidAmount || 0)) <= 1 && (
                        <div className="flex items-center gap-1">
                          <div className="h-1 w-1 rounded-full bg-emerald-500" />
                          <span className="text-[9px] uppercase text-emerald-500 font-black tracking-widest">Settled</span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex flex-wrap gap-1.5 max-w-[150px]">
                      {bills
                        .filter((b) => b.stockId === item.id)
                        .map((b) => (
                          <div
                            key={b.id}
                            className="text-[10px] font-black bg-amber-50 text-amber-700 border border-amber-200/50 px-2 py-1 rounded-md cursor-pointer hover:bg-amber-100 transition-colors uppercase tracking-tight"
                            onClick={() => onNavigateParty(b.buyerId)}
                          >
                            {b.buyerName}
                          </div>
                        ))}
                      {bills.filter((b) => b.stockId === item.id).length === 0 && (
                        <span className="text-slate-400 text-xs italic font-medium opacity-60">No Dispatches</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-center py-4">
                    <div className="flex flex-col items-center gap-2">
                      {item.status === 'paid' ? (
                        <div className="px-3 py-1 rounded-full bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20">Cleared</div>
                      ) : item.status === 'partial' ? (
                        <div className="px-3 py-1 rounded-full bg-amber-100 text-amber-700 border border-amber-200 text-[10px] font-black uppercase tracking-widest">Partial</div>
                      ) : (
                        <div className="px-3 py-1 rounded-full bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-widest border border-slate-200">Due</div>
                      )}
                      {item.remainingKatte === 0 && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-900 text-white font-black uppercase tracking-widest">Out of Stock</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right pr-8 py-4">
                    <div className="flex justify-end gap-2 shrink-0">
                      <Button 
                        size="icon" 
                        variant="secondary" 
                        className="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 hover:bg-amber-500 hover:text-white border-amber-100/50 transition-all duration-300 shadow-sm shadow-amber-100"
                        onClick={() => onView(item.id)}
                        title="View Receipt"
                      >
                        <Eye className="h-5 w-5" />
                      </Button>
                      {item.status !== 'paid' && (
                        <Button
                          size="icon"
                          variant="secondary"
                          className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white border-emerald-100/50 transition-all shadow-sm shadow-emerald-100"
                          onClick={() => onPayment(item.id)}
                          title="Pay Miller"
                        >
                          <Wallet className="h-5 w-5" />
                        </Button>
                      )}
                      <Button
                        size="icon"
                        variant="secondary"
                        className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-500 hover:text-white border-blue-100/50 transition-all shadow-sm shadow-blue-100"
                        onClick={() => onEdit(item.id)}
                        title="Edit Entry"
                      >
                        <Pencil className="h-5 w-5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="secondary"
                        className="h-10 w-10 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white border-rose-100/50 transition-all shadow-sm shadow-rose-100"
                        onClick={() => onDelete(item.id)}
                        title="Delete Entry"
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
