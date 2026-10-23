import Link from 'next/link';
import { AlertCircle, LayoutDashboard, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-16 text-center select-none">
      <div className="max-w-md w-full bg-[#161616] border border-[#262626] rounded-2xl p-8 sm:p-10 flex flex-col items-center shadow-2xl">
        
        {/* Borderless Mascot or Icon */}
        <div className="w-16 h-16 mb-6 flex items-center justify-center">
          <img
            src="/Manager Bear Dashboard Mascot.png"
            alt="Toy App Mascot"
            className="w-14 h-14 object-contain filter drop-shadow-sm"
          />
        </div>

        {/* 404 Status */}
        <span className="text-xs font-mono font-bold text-zinc-500 uppercase tracking-widest mb-2">
          Error 404 • Route Not Found
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-3">
          Command Center Route Missing
        </h1>

        <p className="text-zinc-400 text-sm leading-relaxed mb-8">
          The requested administrative module or operation view does not exist or your staff session lacks access to it.
        </p>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-3">
          <Link
            href="/"
            className="w-full bg-white hover:bg-zinc-200 text-black font-bold text-xs uppercase tracking-wider py-3.5 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            <LayoutDashboard className="w-4 h-4" />
            Back to Executive Overview
          </Link>

          <a
            href="https://producertoy.com"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-[#202020] hover:bg-[#262626] text-zinc-300 hover:text-white font-semibold text-xs uppercase tracking-wider py-3.5 px-6 rounded-lg border border-[#2a2a2a] transition-colors flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            Storefront
          </a>
        </div>

      </div>
    </div>
  );
}
