
import React, { useState, useEffect } from 'react';
import { Download, X, Sparkles } from 'lucide-react';

const InstallBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Only show if not already installed
      if (!window.matchMedia('(display-mode: standalone)').matches) {
        setShowBanner(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[200] w-[calc(100%-2rem)] max-w-md bg-slate-900 text-white p-4 rounded-3xl shadow-2xl border border-slate-800 flex items-center justify-between gap-4 animate-in slide-in-from-top-10 duration-500">
      <div className="flex items-center gap-4">
        <div className="bg-indigo-600 p-3 rounded-2xl">
          <Download size={24} />
        </div>
        <div>
          <h4 className="font-black text-sm uppercase tracking-widest flex items-center gap-2">
            Install Forge Elite <Sparkles size={12} className="text-indigo-400" />
          </h4>
          <p className="text-[10px] text-slate-400 font-bold">Add to home screen for elite access.</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button 
          onClick={handleInstall}
          className="bg-white text-slate-900 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all"
        >
          INSTALL
        </button>
        <button 
          onClick={() => setShowBanner(false)}
          className="p-2 text-slate-500 hover:text-white transition-colors"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
};

export default InstallBanner;
