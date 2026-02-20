import type { Bill } from "@/types";
import { Button } from "../ui/button";
import { Edit, Eye, Share2, Trash2, Receipt } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

type Props = {
  bills: Bill[];
  onView: (bill: Bill) => void;
  onEdit: (bill: Bill) => void;
  onDelete: (id: string) => void;
  onWhatsApp: (bill: Bill) => void;
};

export function BillsTable({ bills, onView, onEdit, onDelete, onWhatsApp }: Props) {
  const formatCurrency = (amount: number) => {
    return `RS ${new Intl.NumberFormat('en-PK', {
      maximumFractionDigits: 2,
    }).format(amount)}`;
  };

  if (bills.length === 0) {
    return (
      <div className="text-center py-12 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
        <Receipt className="h-12 w-12 mx-auto mb-3 text-slate-300" />
        <p className="text-slate-500 font-medium">No bills found</p>
        <p className="text-slate-400 text-sm mt-1">Create a new bill to see it here</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden shadow-sm bg-white">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50">
            <TableHead className="font-bold">Date</TableHead>
            <TableHead className="font-bold">Bill #</TableHead>
            <TableHead className="font-bold">Buyer</TableHead>
            <TableHead className="font-bold">Item</TableHead>
            <TableHead className="text-right font-bold">Katte</TableHead>
            <TableHead className="text-right font-bold">Total Amount</TableHead>
            <TableHead className="text-center font-bold">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bills
            .sort((a, b) => {
              const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime();
              if (dateDiff !== 0) return dateDiff;
              return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            })
            .map((bill) => (
            <TableRow key={bill.id} className="hover:bg-slate-50 transition-colors">
              <TableCell className="text-slate-600 font-medium">{bill.date}</TableCell>
              <TableCell>
                <Badge variant="outline" className="font-mono text-xs border-amber-200 bg-amber-50 text-amber-700">
                  {bill.billNumber}
                </Badge>
              </TableCell>
              <TableCell className="font-bold text-slate-900">{bill.buyerName}</TableCell>
              <TableCell className="text-slate-700 font-medium">{bill.itemName}</TableCell>
              <TableCell className="text-right font-semibold text-slate-900">
                {bill.katte} <span className="text-slate-400 text-[10px] font-normal uppercase ml-1">Katte</span>
              </TableCell>
              <TableCell className="text-right">
                <div className="font-black text-slate-900">{formatCurrency(bill.totalAmount)}</div>
                <div className="text-[10px] text-slate-400 font-medium">
                  {bill.weight.toFixed(0)} kg @ {formatCurrency(bill.rate)}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex justify-center gap-1.5">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    onClick={() => onView(bill)}
                    title="View Bill"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                    onClick={() => onEdit(bill)}
                    title="Edit Bill"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                    onClick={() => onWhatsApp(bill)}
                    title="WhatsApp Share"
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => onDelete(bill.id)}
                    title="Delete Bill"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}