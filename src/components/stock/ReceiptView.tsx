import { useRef } from 'react';
import type { StockItem } from "@/types";
import { Button } from "../ui/button";
import { Download, Printer, CheckCircle2 } from "lucide-react";
import html2canvas from "html2canvas";
import { cn } from "@/lib/utils";

export function ReceiptView({ stock }: { stock: StockItem }) {
  const receiptRef = useRef<HTMLDivElement>(null);

  if (!stock) return null;

  const handleDownloadImage = async () => {
    if (!receiptRef.current) return;
    const canvas = await html2canvas(receiptRef.current, {
        scale: 2,
        backgroundColor: "#ffffff",
    });
    const image = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = image;
    link.download = `Receipt-${stock.receiptNumber || '0000'}.png`;
    link.click();
  };

  const shareToWhatsApp = async () => {
    if (!receiptRef.current) return;
    try {
      const canvas = await html2canvas(receiptRef.current, {
        scale: 2,
        backgroundColor: "#ffffff",
      });
      
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const file = new File([blob], `Receipt-${stock.receiptNumber || '0000'}.png`, { type: "image/png" });
        
        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: `Receipt ${stock.receiptNumber || '0000'}`,
            text: `Purchase Receipt from ${stock.millerName || 'Miller'}`,
          });
        } else {
          alert("Direct Photo Share is not supported by your browser. The photo will be downloaded, please attach it manually in WhatsApp.");
          handleDownloadImage();
        }
      }, "image/png");
    } catch (err) {
      console.error("Share failed:", err);
      handleDownloadImage();
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const formatCurrency = (amount: number) => {
    return `RS ${new Intl.NumberFormat('en-PK', {
      maximumFractionDigits: 2,
    }).format(amount)}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 no-print">
        <Button onClick={shareToWhatsApp} className="bg-[#25D366] hover:bg-[#128C7E] text-white flex-1 min-w-[140px]">
          <svg className="h-4 w-4 mr-2 fill-current" viewBox="0 0 24 24">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.588-5.946 0-6.556 5.332-11.891 11.891-11.891 3.181 0 6.167 1.24 8.413 3.488 2.246 2.248 3.484 5.232 3.484 8.402 0 6.556-5.332 11.891-11.891 11.891-2.01 0-3.987-.51-5.742-1.47l-6.154 1.689zm5.924-4.502l.363.216c1.551.922 3.407 1.411 5.31 1.411 5.617 0 10.191-4.576 10.191-10.19 0-2.72-1.057-5.274-2.977-7.193s-4.47-2.977-7.214-2.977c-5.617 0-10.19 4.576-10.19 10.19 0 2.13.652 4.212 1.884 5.986l.233.338-.996 3.635 3.72-.976zm11.367-7.387c-.201-.101-1.196-.59-1.381-.657-.184-.067-.32-.101-.453.101-.132.202-.513.657-.628.79-.114.132-.23.148-.431.047-.201-.101-.848-.312-1.615-.997-.597-.533-.998-1.192-1.115-1.393-.117-.202-.013-.311.088-.41.09-.089.201-.234.301-.351.099-.117.133-.198.2-.332.067-.134.033-.251-.018-.352-.05-.101-.453-1.091-.621-1.493-.164-.391-.344-.338-.472-.344-.121-.006-.26-.007-.4-.007s-.367.051-.559.26c-.192.208-.733.717-.733 1.748 0 1.03.75 2.023.855 2.163.104.14 1.476 2.253 3.575 3.159.499.215.889.344 1.193.44.501.159.957.137 1.317.083.401-.06 1.196-.489 1.365-.96.17-.471.17-.874.12-.96-.051-.085-.19-.136-.391-.237z"/>
          </svg>
          WhatsApp
        </Button>
        <Button onClick={handleDownloadImage} variant="secondary" className="flex-1 min-w-[140px]">
          <Download className="h-4 w-4 mr-2" /> Download
        </Button>
        <Button onClick={handlePrint} variant="outline" className="flex-1 min-w-[140px]">
          <Printer className="h-4 w-4 mr-2" /> Print
        </Button>
      </div>

      <div 
        ref={receiptRef}
        className="p-8 bg-white border-2 border-slate-200 rounded-xl shadow-inner max-w-md mx-auto receipt-container relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -mr-16 -mt-16 z-0 opacity-50" />
        
        <div className="relative z-10">
          <div className="text-center border-b-2 border-slate-100 pb-6 mb-6">
            <h1 className="text-2xl font-bold text-slate-800 uppercase tracking-tight">Amin Rice Trading</h1>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Purchase Receipt</p>
            <div className={`mt-4 inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
              stock.status === 'paid' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
            }`}>
              <CheckCircle2 className="h-3 w-3 mr-1" /> {(stock.status || 'unpaid').toUpperCase()}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-y-4 text-sm mb-8">
            <div>
              <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Receipt Number</p>
              <p className="font-bold text-slate-900">{stock.receiptNumber || 'N/A'}</p>
            </div>
            <div className="text-right">
              <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Date</p>
              <p className="font-bold text-slate-900">{stock.date || 'N/A'}</p>
            </div>
            <div>
              <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Condition</p>
              <span className={cn(
                "font-bold text-xs uppercase px-2 py-1 rounded bg-slate-100 w-fit mt-1 block",
                stock.paymentType === 'credit' ? "text-rose-700" : "text-emerald-700"
              )}>
                {stock.paymentType === 'credit' ? 'Credit (Udhar)' : 'Cash'}
              </span>
            </div>
            <div className="text-right">
              <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Due Date</p>
              <p className="font-bold text-slate-900">{stock.dueDate || 'N/A'}</p>
            </div>
            <div className="col-span-2">
              <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Miller / Supplier</p>
              <p className="font-bold text-slate-900 text-lg leading-tight">{stock.millerName || 'Unknown Miller'}</p>
            </div>
          </div>

          <div className="bg-slate-50 rounded-lg p-4 mb-6 border border-slate-100">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Product</p>
                <p className="font-bold text-slate-900 leading-tight">{stock.itemName || 'Rice Product'}</p>
              </div>
              <div className="text-right">
                <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Quantity</p>
                <p className="font-bold text-slate-900">{stock.katte} Katte</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 border-t border-slate-200 pt-3">
              <span>Total Weight:</span>
              <span className="text-right font-medium">{(stock.totalWeight || 0).toFixed(2)} kg</span>
              <span>Purchase Rate ({stock.rateType === 'per_kg' ? 'per kg' : 'per katta'}):</span>
              <span className="text-right font-medium">{formatCurrency(stock.purchaseRate)}</span>
              {(Number(stock.bhardana) > 0) && (
                <>
                  <span>Bhardana:</span>
                  <span className="text-right font-medium">{formatCurrency(stock.bhardana || 0)}</span>
                </>
              )}
            </div>
          </div>

          <div className="bg-slate-900 text-white rounded-lg p-5">
            <div className="flex justify-between items-center mb-2">
              <p className="text-[10px] uppercase font-bold tracking-wider opacity-70">Total Amount</p>
              <p className="text-xl font-bold">{formatCurrency(stock.totalAmount || 0)}</p>
            </div>
            <div className="flex justify-between items-center border-t border-slate-700 pt-2 text-xs">
              <span className="opacity-70">Paid:</span>
              <span className="font-bold text-emerald-400">{formatCurrency(stock.paidAmount || 0)}</span>
            </div>
            <div className="flex justify-between items-center pt-1 text-xs">
              <span className="opacity-70">Balance:</span>
              <span className="font-bold text-amber-400">{formatCurrency((stock.totalAmount || 0) - (stock.paidAmount || 0))}</span>
            </div>
          </div>

          <div className="mt-12 flex justify-between items-end italic text-[10px] text-slate-400">
            <div>
              <p>Computer generated receipt.</p>
              <p>Amin Rice Trading - Quality & Trust.</p>
            </div>
            <div className="text-center pt-8 border-t border-slate-200 min-w-[80px]">
              Authorized Stamp
            </div>
          </div>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          .no-print { display: none !important; }
          body { background: white; margin: 0; padding: 0; }
          .receipt-container { border: none !important; box-shadow: none !important; width: 100% !important; max-width: none !important; }
        }
      `}} />
    </div>
  );
}
