import type { Bill } from "@/types";
import { Button } from "../ui/button";
import { Eye, Share2, Trash2, Receipt, Wallet, Calendar, Hash, User, Package, CircleDot } from "lucide-react";
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
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-none hover:bg-transparent">
            <TableHead className="w-[120px] py-6 px-6">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                <Calendar className="h-3 w-3" /> Date
              </div>
            </TableHead>
            <TableHead className="w-[140px]">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                <Hash className="h-3 w-3" /> Invoice
              </div>
            </TableHead>
            <TableHead className="w-[120px]">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                Condition
              </div>
            </TableHead>
            <TableHead>
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                <User className="h-3 w-3" /> Buyer Assignment
              </div>
            </TableHead>
            <TableHead>
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                <Package className="h-3 w-3" /> Product Spec
              </div>
            </TableHead>
            <TableHead className="text-right">
              <div className="flex items-center justify-end gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                Valuation / Total
              </div>
            </TableHead>
            <TableHead className="text-center">
              <div className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                <CircleDot className="h-3 w-3" /> Status
              </div>
            </TableHead>
            <TableHead className="text-right px-6">
              <div className="flex items-center justify-end gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                Management
              </div>
            </TableHead>
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
              const isCleared = balance <= 1;

              return (
                <TableRow key={bill.id} className="group border-b border-slate-50 hover:bg-amber-50/30 transition-all duration-300">
                  <TableCell className="py-6 px-6">
                    <span className="text-sm font-black text-slate-900 tabular-nums">
                      {new Date(bill.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                    </span>
                  </TableCell>
                  
                  <TableCell>
                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-slate-900 text-white text-[10px] font-black tracking-wider shadow-sm">
                      {bill.billNumber}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <span className={cn(
                        "text-[10px] font-black uppercase px-2.5 py-1 rounded-lg w-fit shadow-sm border",
                        bill.paymentType === 'cash' || !bill.paymentType 
                          ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
                          : "bg-rose-50 text-rose-700 border-rose-100"
                      )}>
                        {bill.paymentType === 'credit' ? 'Udhar (Credit)' : 'Cash Payment'}
                      </span>
                      {(bill.paymentType === 'credit' || bill.dueDays) && (
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest pl-1">
                          Term: {bill.dueDays || 0} Days
                        </span>
                      )}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex flex-col gap-0.5">
                      <span 
                        className="text-sm font-black text-slate-900 cursor-pointer hover:text-amber-600 transition-colors"
                        onClick={() => (window as any).onNavigate('party-ledger', bill.buyerId)}
                      >
                        {bill.buyerName}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Secondary: {bill.millerName || 'Direct Sale'}</span>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-bold text-slate-700">{bill.itemName}</span>
                      <span className="text-[10px] font-black text-amber-600/70 uppercase">
                        {bill.katte} Katte <span className="mx-1 opacity-30">|</span> {bill.weight?.toFixed(0)} KG
                      </span>
                    </div>
                  </TableCell>
                  
                  <TableCell className="text-right">
                    <div className="flex flex-col items-end gap-0.5">
                      <span className="text-sm font-black text-slate-900 tracking-tight">{formatCurrency(bill.totalAmount)}</span>
                      {!isCleared && (
                        <span className="text-[10px] font-black text-rose-500 uppercase tracking-tighter">
                          Due: {formatCurrency(balance)}
                        </span>
                      )}
                      {isCleared && (
                        <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Fully Settled</span>
                      )}
                    </div>
                  </TableCell>
                  
                  <TableCell className="text-center">
                    <div className={cn(
                      "inline-flex items-center justify-center w-24 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all shadow-sm",
                      bill.status === 'paid' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                      bill.status === 'partial' ? "bg-amber-50 text-amber-600 border-amber-100" :
                      "bg-slate-50 text-slate-400 border-slate-100"
                    )}>
                      {bill.status}
                    </div>
                  </TableCell>
                  
                  <TableCell className="text-right px-6">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-9 w-9 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl"
                        onClick={() => onView(bill)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-9 w-9 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl"
                        onClick={() => onWhatsApp(bill)}
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>

                      {!isCleared && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-9 w-9 text-emerald-600 hover:bg-emerald-50 rounded-xl"
                          onClick={() => onPayment(bill)}
                        >
                          <Wallet className="h-4 w-4" />
                        </Button>
                      )}

                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-9 w-9 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl"
                        onClick={() => onDelete(bill.id)}
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