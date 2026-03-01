import type { Bill } from "@/types";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Eye, Share2, Trash2, Receipt, Wallet } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

type Props = {
  bills: Bill[];
  onView: (bill: Bill) => void;
  onEdit: (bill: Bill) => void;
  onDelete: (id: string) => void;
  onWhatsApp: (bill: Bill) => void;
  onPayment: (bill: Bill) => void;
};

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { History } from "lucide-react";
import { useEffect, useState } from "react";
import { dataStore } from "@/store/dataStore";

export function BillsTable({ bills, onView, onDelete, onWhatsApp, onPayment }: Props) {
  const formatCurrency = (amount: number) => {
    return `RS ${new Intl.NumberFormat('en-PK', {
      maximumFractionDigits: 0,
    }).format(amount)}`;
  };

  if (bills.length === 0) {
    return (
      <div className="text-center py-20 bg-white/50 rounded-[2rem] border-2 border-dashed border-amber-100/50 backdrop-blur-sm">
        <div className="bg-amber-50 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Receipt className="h-10 w-10 text-amber-200" />
        </div>
        <h3 className="text-xl font-black text-slate-900 tracking-tight">No Transactions Recorded</h3>
        <p className="text-slate-400 font-medium mt-1 max-w-xs mx-auto">Your digital sales ledger is empty. Start by creating your first buyer invoice.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto overflow-y-auto max-h-[70vh] custom-scrollbar border border-slate-200 rounded-xl bg-white">
      <Table className="min-w-[1200px] border-collapse">
        <TableHeader className="sticky top-0 z-20 bg-slate-50 shadow-sm border-b">
          <TableRow className="border-b border-slate-200">
            <TableHead className="py-4 px-4 text-[11px] font-extrabold uppercase tracking-wider text-slate-700">Date</TableHead>
            <TableHead className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700">Invoice #</TableHead>
            <TableHead className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700">Buyer Name</TableHead>
            <TableHead className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700">Item Details</TableHead>
            <TableHead className="text-right text-[11px] font-extrabold uppercase tracking-wider text-slate-700">Quantity (KT)</TableHead>
            <TableHead className="text-right text-[11px] font-extrabold uppercase tracking-wider text-slate-700">Weight (KG)</TableHead>
            <TableHead className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700">Payment Type</TableHead>
            <TableHead className="text-right text-[11px] font-extrabold uppercase tracking-wider text-slate-700">Sale Rate</TableHead>
            <TableHead className="text-right text-[11px] font-extrabold uppercase tracking-wider text-slate-700">Total Amount</TableHead>
            <TableHead className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700">Udhar / Due</TableHead>
            <TableHead className="text-right text-[11px] font-extrabold uppercase tracking-wider text-slate-700">Balance</TableHead>
            <TableHead className="text-center text-[10px] font-extrabold uppercase tracking-wider text-slate-700">Status</TableHead>
            <TableHead className="text-right pr-6 text-[10px] font-extrabold uppercase tracking-wider text-slate-700">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bills
            .sort((a, b) => {
              const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime();
              if (dateDiff !== 0) return dateDiff;
              return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            })
            .map((bill) => {
              const balance = bill.totalAmount - (bill.paidAmount || 0);
              
              return (
                <TableRow key={bill.id} className="hover:bg-slate-50 transition-colors border-b border-slate-100">
                  <TableCell className="py-4 px-4 font-semibold text-slate-600 text-xs">
                    {new Date(bill.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </TableCell>
                  
                  <TableCell>
                    <Badge variant="outline" className="font-mono text-[10px] font-bold bg-slate-900 text-white border-slate-800">
                      {bill.billNumber}
                    </Badge>
                  </TableCell>
                  
                  <TableCell>
                    <div 
                      className="cursor-pointer font-bold text-slate-900 hover:text-amber-600 transition-colors text-xs"
                      onClick={() => (window as any).onNavigate('party-ledger', bill.buyerId)}
                    >
                      {bill.buyerName}
                      <div className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Miller: {bill.millerName || 'Direct'}</div>
                    </div>
                  </TableCell>

                  <TableCell className="text-xs font-medium text-slate-600">
                    {bill.itemName}
                  </TableCell>

                  <TableCell className="text-right font-bold text-slate-900 text-xs">
                    {bill.katte}
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex flex-col items-end">
                      <span className="font-bold text-blue-600 text-xs">{bill.weight?.toLocaleString()}</span>
                      <span className="text-[9px] font-bold text-slate-400 uppercase">KG</span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge variant="secondary" className={cn(
                      "text-[9px] font-bold uppercase",
                      bill.paymentType === 'credit' ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-700"
                    )}>
                      {bill.paymentType === 'credit' ? 'Credit' : 'Cash'}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex flex-col items-end">
                      <span className="font-bold text-slate-900 text-xs">{formatCurrency(bill.rate)}</span>
                      <span className="text-[9px] font-bold text-slate-400 uppercase">/{bill.rateType === 'per_kg' ? 'kg' : 'kt'}</span>
                    </div>
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex flex-col items-end">
                      <span className="font-bold text-slate-900 text-xs">{formatCurrency(bill.totalAmount)}</span>
                      {bill.paidAmount > 0 && (
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="ghost" className="h-auto p-0 hover:bg-transparent">
                              <span className="text-[9px] font-extrabold text-emerald-600 uppercase flex items-center gap-1 cursor-pointer hover:underline">
                                <History className="h-2 w-2" /> Received: {formatCurrency(bill.paidAmount)}
                              </span>
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-64 p-3 rounded-xl shadow-2xl border-slate-200" align="end">
                             <h4 className="text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest flex items-center gap-2">
                               <History className="h-3 w-3" /> Collection History
                             </h4>
                             <BillPaymentHistoryList billId={bill.id} />
                          </PopoverContent>
                        </Popover>
                      )}
                    </div>
                  </TableCell>

                  <TableCell>
                    {bill.paymentType === 'credit' ? (
                       <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5">
                             <span className="text-[10px] font-black text-rose-600 uppercase tracking-tighter">
                               {bill.dueDays || 0} Days Udhar
                             </span>
                          </div>
                          {bill.dueDate && (
                             <span className="text-[9px] font-bold text-slate-400">
                               Due: {bill.dueDate}
                             </span>
                          )}
                       </div>
                    ) : (
                       <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Cash Sale</span>
                    )}
                  </TableCell>

                  <TableCell className="text-right">
                    <span className={cn(
                      "font-bold text-xs",
                      balance > 1 ? "text-rose-600" : "text-emerald-600"
                    )}>
                      {formatCurrency(balance)}
                    </span>
                  </TableCell>

                  <TableCell className="text-center">
                    {bill.status === 'paid' ? (
                      <Badge className="bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-wider h-6 min-w-[70px] flex items-center justify-center">Paid</Badge>
                    ) : bill.status === 'partial' ? (
                      <Badge className="bg-amber-500 text-white text-[10px] font-bold uppercase tracking-wider h-6 min-w-[70px] flex items-center justify-center">Partial</Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider text-slate-500 h-6 min-w-[70px] flex items-center justify-center border-slate-300">Unpaid</Badge>
                    )}
                  </TableCell>

                  <TableCell className="text-right pr-6 py-4">
                    <div className="flex justify-end gap-2 shrink-0">
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-9 w-9 border border-slate-200 text-slate-600 hover:bg-slate-100"
                        onClick={() => onView(bill)}
                        title="View Invoice"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-9 w-9 border border-slate-200 text-blue-600 hover:bg-blue-50"
                        onClick={() => onWhatsApp(bill)}
                        title="Share WhatsApp"
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>

                      {bill.status !== 'paid' && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-9 w-9 border border-slate-200 text-emerald-600 hover:bg-emerald-50"
                          onClick={() => onPayment(bill)}
                          title="Receive Payment"
                        >
                          <Wallet className="h-4 w-4" />
                        </Button>
                      )}
                      
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-9 w-9 border border-slate-200 text-rose-600 hover:bg-rose-50"
                        onClick={() => onDelete(bill.id)}
                        title="Delete Invoice"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
        </TableBody>
      </Table>
    </div>
  );
}

function BillPaymentHistoryList({ billId }: { billId: string }) {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dataStore.getBillLedger(billId).then(data => {
      setHistory(data.filter((e: any) => (e.credit || 0) > 0)); // Collection is Credit for us
      setLoading(false);
    });
  }, [billId]);

  if (loading) return <div className="text-[10px] text-slate-400 animate-pulse font-bold">Loading history...</div>;
  if (history.length === 0) return <div className="text-[10px] text-slate-400 italic font-bold">No collections recorded yet.</div>;

  return (
    <div className="space-y-2">
      {history.map((entry: any, idx: number) => (
        <div key={idx} className="flex justify-between items-center bg-slate-50 p-2 rounded-lg border border-slate-100">
          <div className="flex flex-col">
            <span className="text-[9px] font-black text-slate-900">{entry.date}</span>
            <span className="text-[8px] text-slate-400 font-bold truncate w-32">{entry.particulars}</span>
          </div>
          <span className="text-[10px] font-black text-emerald-600 tabular-nums">
            RS {(entry.credit || 0).toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
}
