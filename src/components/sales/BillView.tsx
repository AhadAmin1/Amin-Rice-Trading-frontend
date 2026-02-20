import { useRef } from 'react';
import type { Bill } from "@/types";
import { Button } from "../ui/button";
import { Download, Printer, CheckCircle2 } from "lucide-react";
import html2canvas from "html2canvas";

export function BillView({ bill }: { bill: Bill }) {
  const billRef = useRef<HTMLDivElement>(null);

  const handleDownloadImage = async () => {
    if (!billRef.current) return;
    const canvas = await html2canvas(billRef.current, {
        scale: 2,
        backgroundColor: "#ffffff",
    });
    const image = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = image;
    link.download = `Bill-${bill.billNumber}.png`;
    link.click();
  };

  const shareToWhatsApp = async () => {
    if (!billRef.current) return;
    try {
      const canvas = await html2canvas(billRef.current, {
        scale: 2,
        backgroundColor: "#ffffff",
      });
      
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const file = new File([blob], `Bill-${bill.billNumber}.png`, { type: "image/png" });
        
        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: `Bill ${bill.billNumber}`,
            text: `Invoice for ${bill.buyerName}`,
          });
        } else {
          // Fallback: Show a friendly message and trigger download
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
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      maximumFractionDigits: 0,
    }).format(amount);
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
        ref={billRef}
        className="p-8 bg-white border-2 border-slate-200 rounded-xl shadow-inner max-w-md mx-auto bill-container relative overflow-hidden"
      >
        {/* Aesthetic Background Elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-bl-full -mr-16 -mt-16 z-0 opacity-50" />
        
        <div className="relative z-10">
          {/* Header */}
          <div className="text-center border-b-2 border-slate-100 pb-6 mb-6">
            <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Amin Rice Trading</h1>
            <p className="text-slate-500 text-xs font-medium uppercase tracking-widest">Premium Quality Rice Merchants</p>
            <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full bg-green-50 text-green-700 text-[10px] font-bold uppercase tracking-wider">
              <CheckCircle2 className="h-3 w-3 mr-1" /> Payment Pending / Unpaid
            </div>
          </div>

          {/* Bill Info Grid */}
          <div className="grid grid-cols-2 gap-y-4 text-sm mb-8">
            <div>
              <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Bill Number</p>
              <p className="font-bold text-slate-900">{bill.billNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Date</p>
              <p className="font-bold text-slate-900">{bill.date}</p>
            </div>
            <div className="col-span-2">
              <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Customer / Buyer</p>
              <p className="font-bold text-slate-900 text-lg leading-tight">{bill.buyerName}</p>
            </div>
          </div>

          {/* Items Table-like UI */}
          <div className="bg-slate-50 rounded-lg p-4 mb-6 border border-slate-100">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Product</p>
                <p className="font-bold text-slate-900 leading-tight">{bill.itemName}</p>
              </div>
              <div className="text-right">
                <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Quantity</p>
                <p className="font-bold text-slate-900">{bill.katte} Katte</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 border-t border-slate-200 pt-3">
              <span>Total Weight:</span>
              <span className="text-right font-medium">{bill.weight.toFixed(2)} kg</span>
              <span>Rate ({bill.rateType === 'per_kg' ? 'per kg' : 'per katta'}):</span>
              <span className="text-right font-medium">{formatCurrency(bill.rate)}</span>
              {bill.bhardanaRate !== undefined && bill.bhardanaRate > 0 && (
                <>
                  <span>Bhardana (RS {bill.bhardanaRate} per katta):</span>
                  <span className="text-right font-medium">{formatCurrency(bill.bhardana || 0)}</span>
                </>
              )}
            </div>
          </div>

          {/* Grand Total */}
          <div className="bg-amber-500 text-white rounded-lg p-5 shadow-lg shadow-amber-200">
            <div className="flex justify-between items-center">
              <p className="text-[10px] uppercase font-black tracking-widest opacity-80">Total Amount</p>
              <div className="text-right">
                <p className="text-2xl font-black leading-none">{formatCurrency(bill.totalAmount)}</p>
              </div>
            </div>
          </div>

          {/* Footer Signature Area */}
          <div className="mt-12 flex justify-between items-end italic text-[10px] text-slate-400">
            <div>
              <p>Thank you for your business!</p>
              <p>Terms: All payments within 7 days.</p>
            </div>
            <div className="text-center pt-8 border-t border-slate-200 min-w-[80px]">
              Signature
            </div>
          </div>
        </div>
      </div>
      
      <p className="text-center text-xs text-slate-400 italic no-print">
        Tip: Download the photo and share it directly on WhatsApp.
      </p>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          .no-print { display: none !important; }
          body { background: white; margin: 0; padding: 0; }
          .bill-container { border: none !important; box-shadow: none !important; width: 100% !important; max-width: none !important; }
        }
      `}} />
    </div>
  );
}