import { useEffect, useState } from "react";

export function LoadingScreen() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShow(true), 200);
    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/10 backdrop-blur-[8px] transition-all duration-700">
      <div className="relative flex flex-col items-center gap-6 p-10 rounded-[2rem] bg-white/70 backdrop-blur-md shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-white/40 overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-amber-400/20 blur-[60px] rounded-full"></div>
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-orange-400/20 blur-[60px] rounded-full"></div>

        {/* Custom Premium Spinner */}
        <div className="relative w-20 h-20">
          {/* Outer Ring */}
          <svg className="absolute inset-0 w-full h-full rotate-[-90deg]">
            <circle
              cx="40"
              cy="40"
              r="36"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              className="text-slate-100"
            />
            <circle
              cx="40"
              cy="40"
              r="36"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeDasharray="226"
              strokeDashoffset="180"
              strokeLinecap="round"
              className="text-amber-500 animate-[spin_1.5s_ease-in-out_infinite]"
            />
          </svg>
          
          {/* Inner Ring */}
          <svg className="absolute inset-0 w-full h-full p-2 rotate-[90deg]">
            <circle
              cx="32"
              cy="32"
              r="28"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-slate-50"
            />
            <circle
              cx="32"
              cy="32"
              r="28"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeDasharray="176"
              strokeDashoffset="140"
              strokeLinecap="round"
              className="text-orange-400 animate-[spin_2s_linear_infinite]"
            />
          </svg>

          {/* Center Pulsing Dot */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-3 h-3 bg-amber-500 rounded-full animate-ping"></div>
          </div>
        </div>

        {/* Text content */}
        <div className="relative space-y-2 text-center">
          <h2 className="text-xl font-black tracking-tight text-slate-900 uppercase">
            Amin <span className="text-amber-600">Rice</span> Trading
          </h2>
          <div className="flex items-center justify-center gap-2">
            <span className="w-1 h-1 bg-amber-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
            <span className="w-1 h-1 bg-amber-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
            <span className="w-1 h-1 bg-amber-500 rounded-full animate-bounce"></span>
            <p className="text-xs font-bold text-slate-500 tracking-[0.2em] uppercase ml-1">
              Synchronizing
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
