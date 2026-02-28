import { useRef } from 'react';
import type { Bill } from "@/types";
import { Button } from "../ui/button";
import { Download, Printer, CheckCircle2, ShoppingBag, MapPin, Phone, Calendar, User } from "lucide-react";
import html2canvas from "html2canvas";
import { cn } from "@/lib/utils";

export function BillView({ bill }: { bill: Bill }) {
  const billRef = useRef<HTMLDivElement>(null);

  const handleDownloadImage = async () => {
    if (!billRef.current) return;
    const canvas = await html2canvas(billRef.current, {
        scale: 3,
        backgroundColor: "#ffffff",
        useCORS: true,
    });
    const image = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = image;
    link.download = `Invoice-${bill.billNumber}.png`;
    link.click();
  };

  const shareToWhatsApp = async () => {
    if (!billRef.current) return;
    try {
      const canvas = await html2canvas(billRef.current, {
        scale: 3,
        backgroundColor: "#ffffff",
      });
      
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const file = new File([blob], `Invoice-${bill.billNumber}.png`, { type: "image/png" });
        
        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: `Invoice ${bill.billNumber}`,
            text: `Commercial Invoice for ${bill.buyerName} - Amin Rice Trading`,
          });
        } else {
          alert("Browser secure sharing unavailable. Downloading high-res copy for manual attachment.");
          handleDownloadImage();
        }
      }, "image/png");
    } catch (err) {
      console.error("Share failed:", err);
      handleDownloadImage();
    }
  };

  const formatCurrency = (amount: number) => {
    return `RS ${new Intl.NumberFormat('en-PK', {
      maximumFractionDigits: 0,
    }).format(amount)}`;
  };

  return (
    <div className="space-y-8">
      {/* Control Panel */}
      <div className="flex flex-wrap items-center justify-center gap-4 no-print bg-white/50 p-6 rounded-[2rem] border border-white backdrop-blur-md shadow-sm">
        <Button onClick={shareToWhatsApp} className="bg-[#25D366] hover:bg-[#128C7E] text-white font-black h-12 px-8 rounded-2xl shadow-lg border-none transition-all active:scale-95">
          <svg className="h-5 w-5 mr-3 fill-current" viewBox="0 0 24 24">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.588-5.946 0-6.556 5.332-11.891 11.891-11.891 3.181 0 6.167 1.24 8.413 3.488 2.246 2.248 3.484 5.232 3.484 8.402 0 6.556-5.332 11.891-11.891 11.891-2.01 0-3.987-.51-5.742-1.47l-6.154 1.689zm5.924-4.502l.363.216c1.551.922 3.407 1.411 5.31 1.411 5.617 0 10.191-4.576 10.191-10.19 0-2.72-1.057-5.274-2.977-7.193s-4.47-2.977-7.214-2.977c-5.617 0-10.19 4.576-10.19 10.19 0 2.13.652 4.212 1.884 5.986l.233.338-.996 3.635 3.72-.976zm11.367-7.387c-.201-.101-1.196-.59-1.381-.657-.184-.067-.32-.101-.453.101-.132.202-.513.657-.628.79-.114.132-.23.148-.431.047-.201-.101-.848-.312-1.615-.997-.597-.533-.998-1.192-1.115-1.393-.117-.202-.013-.311.088-.41.09-.089.201-.234.301-.351.099-.117.133-.198.2-.332.067-.134.033-.251-.018-.352-.05-.101-.453-1.091-.621-1.493-.164-.391-.344-.338-.472-.344-.121-.006-.26-.007-.4-.007s-.367.051-.559.26c-.192.208-.733.717-.733 1.748 0 1.03.75 2.023.855 2.163.104.14 1.476 2.253 3.575 3.159.499.215.889.344 1.193.44.501.159.957.137 1.317.083.401-.06 1.196-.489 1.365-.96.17-.471.17-.874.12-.96-.051-.085-.19-.136-.391-.237z"/>
            </svg>
          Direct WhatsApp
        </Button>
        <Button onClick={handleDownloadImage} variant="outline" className="h-12 border-slate-200 text-slate-600 font-black rounded-2xl hover:bg-slate-50 transition-all">
          <Download className="h-5 w-5 mr-3" /> HQ Image
        </Button>
        <Button onClick={() => window.print()} variant="outline" className="h-12 border-slate-200 text-slate-600 font-black rounded-2xl hover:bg-slate-50 transition-all">
          <Printer className="h-5 w-5 mr-3" /> Print Document
        </Button>
      </div>

      {/* Cinematic Invoice Rendering */}
      <div 
        ref={billRef}
        className="bg-white p-16 shadow-2xl rounded-[3rem] border border-slate-100 max-w-2xl mx-auto relative overflow-hidden"
        style={{ fontFamily: 'Inter, sans-serif' }}
      >
        {/* Aesthetic Overlay */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full -mr-48 -mt-48 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-slate-900/5 rounded-full -ml-32 -mb-32 blur-3xl" />
        
        <div className="relative z-10">
          {/* Brand Header */}
          <div className="flex justify-between items-start mb-16 border-b-4 border-amber-500/10 pb-10">
            <div>
              <div className="flex items-center gap-3 mb-2">
                 <div className="h-10 w-2 bg-slate-900 rounded-full" />
                 <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Amin Rice <span className="text-amber-500">Trading</span></h1>
              </div>
              <div className="flex flex-col text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] space-y-1">
                 <div className="flex items-center gap-2"><MapPin className="h-3 w-3" /> Industrial Area, Punjab, Pakistan</div>
                 <div className="flex items-center gap-2"><Phone className="h-3 w-3" /> Support: +92 300 0000000</div>
              </div>
            </div>
            <div className="text-right">
               <div className="bg-slate-900 text-white px-6 py-3 rounded-2xl inline-block shadow-xl">
                  <div className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Invoice ID</div>
                  <div className="text-xl font-black tabular-nums">{bill.billNumber}</div>
               </div>
            </div>
          </div>

          {/* Transaction Metadata */}
          <div className="grid grid-cols-2 gap-12 mb-16">
            <div className="space-y-4">
              <div className="group">
                <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                  <User className="h-3 w-3" /> Billed To (Buyer)
                </p>
                <p className="text-2xl font-black text-slate-900 leading-tight">{bill.buyerName}</p>
                <div className="h-1 w-8 bg-slate-100 mt-2 group-hover:w-16 transition-all duration-500" />
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Institutional Account / Primary Ledger Holder</p>
            </div>
            
            <div className="space-y-4 text-right">
              <div>
                <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1.5 flex items-center justify-end gap-2">
                  <Calendar className="h-3 w-3" /> Issuance Date
                </p>
                <p className="text-xl font-black text-slate-900">{new Date(bill.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Sourcing Origin</p>
                <p className="text-sm font-black text-slate-600 italic">Miller: {bill.millerName || 'Internal Reserve'}</p>
              </div>
              <div className="pt-4 border-t border-slate-100 flex flex-col items-end">
                <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">Payment Condition</p>
                <div className="flex flex-col items-end">
                  <p className={cn(
                    "text-sm font-black uppercase px-3 py-1 rounded-lg",
                    bill.paymentType === 'credit' ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600"
                  )}>
                    {bill.paymentType === 'credit' ? 'Udhar (30 Days)' : 'Immediate Cash'}
                  </p>
                  {bill.dueDate && (
                    <p className="text-[9px] font-black text-slate-400 mt-1 uppercase tracking-tighter">
                      Maturity: {new Date(bill.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Product Execution Table */}
          <div className="rounded-[2.5rem] bg-slate-50/50 border border-slate-100 overflow-hidden mb-12">
            <div className="bg-slate-900 p-6 text-white grid grid-cols-4 text-[10px] font-black uppercase tracking-[0.2em]">
               <div className="col-span-2">Specification & Description</div>
               <div className="text-center">Quantity</div>
               <div className="text-right">Unit Rate</div>
            </div>
            
            <div className="p-10 space-y-10">
              <div className="grid grid-cols-4 items-center">
                <div className="col-span-2">
                   <h3 className="text-xl font-black text-slate-900 mb-1">{bill.itemName}</h3>
                   <p className="text-xs font-bold text-slate-400">Premium Grade Sourcing Batch Ref: {bill.stockId.slice(-6).toUpperCase()}</p>
                </div>
                <div className="text-center font-black text-slate-900">
                   <span className="text-2xl">{bill.katte}</span>
                   <span className="text-[10px] text-slate-400 ml-1 uppercase">Katte</span>
                </div>
                <div className="text-right font-black text-slate-900">
                   <span className="text-lg">{formatCurrency(bill.rate)}</span>
                   <span className="text-[10px] text-slate-400 ml-1 uppercase">/{bill.rateType === 'per_kg' ? 'KG' : 'KT'}</span>
                </div>
              </div>

              <div className="pt-10 border-t border-slate-200/50 grid grid-cols-2 gap-y-6">
                 <div className="flex flex-col">
                    <span className="text-[10px] font-black text-slate-400 uppercase mb-1">Total Tonnage Shipped</span>
                    <span className="text-sm font-black text-slate-900 tracking-tight">{bill.weight.toFixed(2)} KG Net Weight</span>
                 </div>
                 <div className="flex flex-col items-end">
                    <span className="text-[10px] font-black text-slate-400 uppercase mb-1">Packaging (Bhardana)</span>
                    <span className="text-sm font-black text-slate-900 tracking-tight">{formatCurrency(bill.bhardana || 0)}</span>
                 </div>
              </div>
            </div>
          </div>

          {/* Financial Footer */}
          <div className="flex flex-col md:flex-row gap-12 items-end justify-between px-4">
             <div className="space-y-6">
                <div className="flex items-center gap-3">
                   <div className="h-6 w-6 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <CheckCircle2 className="h-4 w-4" />
                   </div>
                   <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Digitally Verified Ledger Entry</span>
                </div>
                <div className="max-w-[240px] opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
                   <div className="h-16 w-48 border-2 border-slate-100 rounded-2xl flex items-center justify-center relative">
                      <span className="text-[10px] text-slate-300 font-bold italic">Authorized Signature</span>
                      <div className="absolute top-1/2 left-4 right-4 h-px bg-slate-100" />
                   </div>
                </div>
             </div>

             <div className="bg-amber-500 p-10 rounded-[3rem] text-white shadow-2xl shadow-amber-200 min-w-[320px] relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-full h-full bg-slate-900 transition-transform duration-700 translate-x-full group-hover:translate-x-0" />
                <div className="relative z-10">
                  <p className="text-[11px] font-black uppercase tracking-[0.3em] mb-4 opacity-70">Total Receivable</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-black tracking-tighter tabular-nums">{formatCurrency(bill.totalAmount)}</span>
                  </div>
                  <div className="mt-4 pt-4 border-t border-white/20 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                    <ShoppingBag className="h-3 w-3" /> Valid Document
                  </div>
                </div>
             </div>
          </div>

          <div className="mt-20 text-center text-[9px] font-black text-slate-300 uppercase tracking-[0.4em]">
             Official Commercial Instrument <span className="mx-2">•</span> Amin Rice Trading
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; margin: 0; padding: 0; }
          .bill-container { border: none !important; box-shadow: none !important; width: 100% !important; max-width: none !important; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
      `}} />
    </div>
  );
}