import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
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

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { History, CalendarClock } from "lucide-react";
import { useEffect, useState } from "react";
import { dataStore } from "@/store/dataStore";

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
    <div className="overflow-x-auto overflow-y-auto max-h-[70vh] custom-scrollbar border border-slate-200 rounded-xl bg-white">
      <Table className="min-w-[1200px] border-collapse">
        <TableHeader className="sticky top-0 z-20 bg-slate-50 shadow-sm border-b">
          <TableRow className="border-b border-slate-200">
            <TableHead className="py-4 px-4 text-[11px] font-extrabold uppercase tracking-wider text-slate-700">Date</TableHead>
            <TableHead className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700">Receipt #</TableHead>
            <TableHead className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700">Miller / Party</TableHead>
            <TableHead className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700">Item</TableHead>
            <TableHead className="text-right text-[11px] font-extrabold uppercase tracking-wider text-slate-700">Stock (KT)</TableHead>
            <TableHead className="text-right text-[11px] font-extrabold uppercase tracking-wider text-slate-700">Weight (KG)</TableHead>
            <TableHead className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700">Type</TableHead>
            <TableHead className="text-right text-[11px] font-extrabold uppercase tracking-wider text-slate-700">Rate</TableHead>
            <TableHead className="text-right text-[11px] font-extrabold uppercase tracking-wider text-slate-700">Net Total</TableHead>
            <TableHead className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700">Udhar / Due</TableHead>
            <TableHead className="text-right text-[11px] font-extrabold uppercase tracking-wider text-slate-700">Balance</TableHead>
            <TableHead className="text-[10px] font-extrabold uppercase tracking-wider text-slate-700">Dispatches</TableHead>
            <TableHead className="text-center text-[10px] font-extrabold uppercase tracking-wider text-slate-700">Status</TableHead>
            <TableHead className="text-right pr-6 text-[10px] font-extrabold uppercase tracking-wider text-slate-700">Actions</TableHead>
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
                <TableRow key={item.id} className="hover:bg-slate-50 transition-colors border-b border-slate-100">
                  <TableCell className="py-4 px-4 font-semibold text-slate-600 text-xs">
                    {item.date}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono text-[10px] font-bold bg-slate-50 text-slate-600 border-slate-200">
                      {item.receiptNumber || 'PENDING'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div 
                      className="cursor-pointer font-bold text-slate-900 hover:text-amber-600 transition-colors text-xs"
                      onClick={() => onNavigateParty(item.millerId)}
                    >
                      {item.millerName}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs font-medium text-slate-600">
                    {item.itemName}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex flex-col items-end">
                      <span className="font-bold text-slate-900 text-xs">{item.remainingKatte}</span>
                      <span className="text-[9px] font-bold text-slate-400 uppercase">OF {item.katte}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex flex-col items-end">
                      <span className="font-bold text-blue-600 text-xs">{item.remainingWeight?.toLocaleString()}</span>
                      <span className="text-[9px] font-bold text-slate-400 uppercase">KG</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={cn(
                      "text-[9px] font-bold uppercase",
                      item.paymentType === 'credit' ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-700"
                    )}>
                      {item.paymentType === 'credit' ? 'Credit' : 'Cash'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex flex-col items-end">
                      <span className="font-bold text-slate-900 text-xs">{formatCurrency(item.purchaseRate)}</span>
                      <span className="text-[9px] font-bold text-slate-400 uppercase">/{item.rateType === 'per_kg' ? 'kg' : 'kt'}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex flex-col items-end">
                      <span className="font-bold text-slate-900 text-xs">{formatCurrency(item.totalAmount)}</span>
                      {item.paidAmount > 0 && (
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="ghost" className="h-auto p-0 hover:bg-transparent">
                              <span className="text-[9px] font-extrabold text-emerald-600 uppercase flex items-center gap-1 cursor-pointer hover:underline">
                                <History className="h-2 w-2" /> Paid: {formatCurrency(item.paidAmount)}
                              </span>
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-64 p-3 rounded-xl shadow-2xl border-slate-200">
                             <h4 className="text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest flex items-center gap-2">
                               <History className="h-3 w-3" /> Payment History
                             </h4>
                             <PaymentHistoryList stockId={item.id} />
                          </PopoverContent>
                        </Popover>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {item.paymentType === 'credit' ? (
                       <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5">
                             <CalendarClock className="h-3 w-3 text-rose-500" />
                             <span className="text-[10px] font-black text-rose-600 uppercase tracking-tighter">
                               {item.dueDays || 0} Days Udhar
                             </span>
                          </div>
                          {item.dueDate && (
                             <span className="text-[9px] font-bold text-slate-400 pl-4">
                               Due: {item.dueDate}
                             </span>
                          )}
                       </div>
                    ) : (
                       <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest pl-1">Cash Payment</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={cn(
                      "font-bold text-xs",
                      (item.totalAmount - (item.paidAmount || 0)) > 1 ? "text-rose-600" : "text-emerald-600"
                    )}>
                      {formatCurrency(item.totalAmount - (item.paidAmount || 0))}
                    </span>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex flex-wrap gap-1 max-w-[160px]">
                      {bills
                        .filter((b) => b.stockId === item.id)
                        .slice(0, 3) // Show only first 3
                        .map((b) => (
                          <div
                            key={b.id}
                            className="text-[9px] font-black bg-amber-50 text-amber-700 border border-amber-200/40 px-1.5 py-0.5 rounded-md cursor-pointer hover:bg-amber-100 transition-colors uppercase"
                            onClick={() => onNavigateParty(b.buyerId)}
                            title={b.buyerName}
                          >
                            {b.buyerName.split(' ')[0]}
                          </div>
                        ))}
                      {bills.filter((b) => b.stockId === item.id).length > 3 && (
                        <Badge variant="outline" className="text-[8px] font-black py-0 px-1 border-amber-200 text-amber-600 bg-amber-50/30">
                          +{bills.filter((b) => b.stockId === item.id).length - 3} More
                        </Badge>
                      )}
                      {bills.filter((b) => b.stockId === item.id).length === 0 && (
                        <span className="text-slate-300 text-[10px] italic font-medium">None</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    {item.status === 'paid' ? (
                      <Badge className="bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-wider h-6 min-w-[70px] flex items-center justify-center">Paid</Badge>
                    ) : item.status === 'partial' ? (
                      <Badge className="bg-amber-500 text-white text-[10px] font-bold uppercase tracking-wider h-6 min-w-[70px] flex items-center justify-center">Partial</Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider text-slate-500 h-6 min-w-[70px] flex items-center justify-center border-slate-300">Unpaid</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right pr-8 py-4">
                    <div className="flex justify-end gap-2 shrink-0">
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-9 w-9 border border-slate-200 text-slate-600 hover:bg-slate-100"
                        onClick={() => onView(item.id)}
                        title="View Receipt"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {item.status !== 'paid' && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-9 w-9 border border-slate-200 text-emerald-600 hover:bg-emerald-50"
                          onClick={() => onPayment(item.id)}
                          title="Pay Miller"
                        >
                          <Wallet className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-9 w-9 border border-slate-200 text-blue-600 hover:bg-blue-50"
                        onClick={() => onEdit(item.id)}
                        title="Edit Entry"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-9 w-9 border border-slate-200 text-rose-600 hover:bg-rose-50"
                        onClick={() => onDelete(item.id)}
                        title="Delete Entry"
                      >
                        <Trash2 className="h-4 w-4" />
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

function PaymentHistoryList({ stockId }: { stockId: string }) {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dataStore.getStockLedger(stockId).then(data => {
      setHistory(data.filter(e => (e.credit || 0) > 0)); // Only show payments
      setLoading(false);
    });
  }, [stockId]);

  if (loading) return <div className="text-[10px] text-slate-400 animate-pulse">Loading history...</div>;
  if (history.length === 0) return <div className="text-[10px] text-slate-400 italic">No payments recorded yet.</div>;

  return (
    <div className="space-y-2">
      {history.map((entry, idx) => (
        <div key={idx} className="flex justify-between items-center bg-slate-50 p-2 rounded-lg border border-slate-100">
          <div className="flex flex-col">
            <span className="text-[9px] font-black text-slate-900">{entry.date}</span>
            <span className="text-[8px] text-slate-400 truncate w-32">{entry.particulars}</span>
          </div>
          <span className="text-[10px] font-black text-emerald-600">
            RS {(entry.credit || 0).toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
}
