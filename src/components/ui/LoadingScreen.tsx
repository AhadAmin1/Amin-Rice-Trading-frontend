import { Spinner } from "./spinner";
import { useEffect, useState } from "react";

export function LoadingScreen() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Wait 200ms before showing loading to avoid flicker for fast requests
    const timer = setTimeout(() => setShow(true), 200);
    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/80 backdrop-blur-sm transition-all duration-300">
      <div className="flex flex-col items-center gap-4 p-8 rounded-2xl bg-white shadow-2xl border border-slate-100">
        <div className="relative">
          <div className="absolute inset-0 bg-amber-500/20 blur-xl rounded-full animate-pulse"></div>
          <Spinner className="h-12 w-12 text-amber-500 relative z-10" />
        </div>
        <div className="space-y-1 text-center">
          <p className="text-lg font-bold text-slate-900 animate-pulse">
            Amin Rice Trading
          </p>
          <p className="text-sm text-slate-500 font-medium">
            Fetching data... please wait
          </p>
        </div>
      </div>
    </div>
  );
}
