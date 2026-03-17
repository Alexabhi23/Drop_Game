import { useNavigate, Link } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { Box, Lock, PieChart, Grid, ArrowRight, Shield, Zap, Cpu, Swords } from 'lucide-react';

export function LootBoxPurchase() {
  const navigate = useNavigate();
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [showError, setShowError] = useState(false);
  const [balance, setBalance] = useState(window.state.balance);

  useEffect(() => {
    const handleUpdate = () => {
      setBalance(window.state.balance);
    };

    const handleError = (e: any) => {
      if (e.detail.type === 'balance') {
        setIsShaking(true);
        setShowError(true);
        setTimeout(() => setIsShaking(false), 400);
        setTimeout(() => setShowError(false), 2000);
      }
    };
    window.addEventListener('ux-state-update', handleUpdate);
    window.addEventListener('ux-error', handleError as any);
    return () => {
      window.removeEventListener('ux-state-update', handleUpdate);
      window.removeEventListener('ux-error', handleError as any);
    };
  }, []);

  const handlePurchase = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!window.state.connected) {
      window.ux.addToast("Connect wallet to purchase", "error");
      return;
    }

    const COST = 10;
    if (balance < COST) {
      window.ux.triggerError('balance');
      window.ux.addToast("Insufficient balance", "error");
      window.ux.addLog("PURCHASE", "Loot Box", "FAILED: Insufficient funds");
      return;
    }

    setIsPurchasing(true);
    window.ux.addLog("PURCHASE", "Loot Box", "Pending confirmation...");
    
    try {
      // Simulate real transaction delay
      await new Promise(r => setTimeout(r, 2000));
      
      // On real confirm:
      window.ux.addToast("Transaction Confirmed!", "success");
      await window.ux.fetchBalance(); // Refresh from chain
      
      navigate('/pending');
    } catch (err) {
      setIsPurchasing(false);
      window.ux.addToast("Transaction Failed", "error");
    }
  };

  return (
    <>
      <section className="flex flex-col lg:flex-row gap-8 items-center justify-center min-h-[60vh]">
        <div className="w-full lg:w-1/2 flex flex-col items-center justify-center gap-8 relative">
          <div className="w-64 h-64 md:w-96 md:h-96 rounded-full border border-surface-border glass-panel flex items-center justify-center relative shadow-[0_0_50px_rgba(244,209,37,0.1)]">
            <div className="absolute inset-0 bg-primary/5 rounded-full animate-pulse"></div>
            <Box className="text-primary/40 w-32 h-32" />
            <div className="absolute top-4 left-4 text-xs font-mono text-primary/60 border border-primary/20 px-2 py-1 rounded">SYS_READY</div>
            <div className="absolute bottom-4 right-4 text-xs font-mono text-primary/60 border border-primary/20 px-2 py-1 rounded">SUI_NETWORK</div>
          </div>
          
          <div className="w-full max-w-md glass-panel p-6 rounded-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
            <div className="flex gap-6 justify-between items-end mb-2">
              <div>
                <p className="text-primary text-xs font-mono tracking-widest uppercase mb-1">Guaranteed Drop</p>
                <p className="text-white text-lg font-bold tracking-wider uppercase">Legendary Pity</p>
              </div>
              <p className="text-primary text-2xl font-black font-mono">24<span className="text-slate-500 text-lg">/30</span></p>
            </div>
            <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden border border-slate-700">
              <div className="h-full bg-gradient-to-r from-yellow-600 to-primary rounded-full relative" style={{ width: '80%' }}>
                <div className="absolute right-0 top-0 bottom-0 w-4 bg-white/50 blur-[2px]"></div>
              </div>
            </div>
            <p className="text-slate-400 text-xs mt-3 text-right">6 drops remaining until guaranteed Legendary.</p>
          </div>
        </div>
        
        <div className="w-full lg:w-1/2 flex flex-col gap-8">
          <div className="text-center lg:text-left">
            <h1 className="text-white text-5xl md:text-6xl font-black leading-tight tracking-tighter uppercase mb-4 drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
              Cyber-Vault<br/><span className="text-primary">Loot Box</span>
            </h1>
            <p className="text-slate-300 text-lg md:text-xl font-light tracking-wide max-w-lg mx-auto lg:mx-0">
              Decrypt premium Web3 gaming assets. High-yield tactical gear and legendary artifacts await.
            </p>
          </div>
          
          <div className="flex flex-col items-center lg:items-start gap-4">
            <button 
              onClick={handlePurchase} 
              disabled={isPurchasing || balance < 10}
              className={`w-full sm:w-auto flex items-center justify-center gap-3 rounded-xl h-16 px-10 text-xl font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 group ${
                balance < 10 
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border-slate-700' 
                  : 'bg-primary text-background-dark hover:bg-white hover:shadow-[0_0_50px_rgba(244,209,37,0.6)] hover:scale-105'
              } ${isShaking ? 'animate-shake border-2 border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.5)]' : ''}`}
            >
              {isPurchasing ? (
                <span className="flex items-center gap-2">
                  <span className="w-5 h-5 border-4 border-background-dark border-t-transparent rounded-full animate-spin"></span>
                  PROCUREMENT...
                </span>
              ) : (
                <>
                  <Lock className="w-8 h-8 group-hover:rotate-180 transition-transform duration-500" />
                  <span>{balance < 10 ? 'INSUFFICIENT' : 'Purchase (10 SUI)'}</span>
                </>
              )}
            </button>
            {showError && (
                <p className="text-red-500 font-mono text-sm animate-slide-in font-bold tracking-widest uppercase mt-2">
                  Insufficient balance
                </p>
            )}
          </div>
          
          <div className="glass-panel rounded-xl overflow-hidden mt-4 border border-surface-border">
            <div className="px-6 py-4 border-b border-surface-border bg-slate-900/50 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-primary" />
              <h3 className="text-white text-sm font-bold tracking-widest uppercase">Drop Rates</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900/30 text-slate-400 text-xs tracking-wider uppercase border-b border-surface-border">
                    <th className="px-6 py-3 font-medium">Rarity</th>
                    <th className="px-6 py-3 font-medium">Odds</th>
                    <th className="px-6 py-3 font-medium hidden sm:table-cell">Notes</th>
                  </tr>
                </thead>
                <tbody className="text-sm font-medium">
                  <tr className="border-b border-surface-border/50 hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 flex items-center gap-2 text-primary">
                      <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_#f4d125]"></span>
                      Legendary
                    </td>
                    <td className="px-6 py-4 text-white">1.5%</td>
                    <td className="px-6 py-4 text-slate-400 text-xs hidden sm:table-cell">Pity at 30</td>
                  </tr>
                  <tr className="border-b border-surface-border/50 hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 flex items-center gap-2 text-purple-400">
                      <span className="w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_8px_#c084fc]"></span>
                      Epic
                    </td>
                    <td className="px-6 py-4 text-white">8.5%</td>
                    <td className="px-6 py-4 text-slate-400 text-xs hidden sm:table-cell">-</td>
                  </tr>
                  <tr className="border-b border-surface-border/50 hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 flex items-center gap-2 text-blue-400">
                      <span className="w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_8px_#60a5fa]"></span>
                      Rare
                    </td>
                    <td className="px-6 py-4 text-white">25.0%</td>
                    <td className="px-6 py-4 text-slate-400 text-xs hidden sm:table-cell">-</td>
                  </tr>
                  <tr className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 flex items-center gap-2 text-slate-300">
                      <span className="w-2 h-2 rounded-full bg-slate-300 shadow-[0_0_8px_#cbd5e1]"></span>
                      Common
                    </td>
                    <td className="px-6 py-4 text-white">65.0%</td>
                    <td className="px-6 py-4 text-slate-400 text-xs hidden sm:table-cell">-</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
      
      <section className="mt-12 flex flex-col gap-6">
        <div className="flex items-center justify-between border-b border-surface-border pb-4">
          <div className="flex items-center gap-3">
            <Grid className="w-6 h-6 text-primary" />
            <h2 className="text-white text-2xl font-bold tracking-widest uppercase">Quick Stats</h2>
          </div>
          <Link to="/inventory" className="text-primary text-sm font-bold uppercase tracking-wider hover:underline flex items-center gap-1">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="holographic-card rounded-xl p-1 flex flex-col aspect-[3/4] relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="w-full h-3/5 bg-slate-900 rounded-lg mb-3 border border-primary/30 relative overflow-hidden" style={{ backgroundImage: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' }}>
              <div className="absolute inset-0 flex items-center justify-center opacity-50">
                <Swords className="w-16 h-16 text-primary" />
              </div>
              <div className="absolute top-2 right-2 bg-background-dark/80 px-2 py-1 rounded text-[10px] font-mono text-primary border border-primary/50">#0492</div>
            </div>
            <div className="px-3 pb-3 flex-1 flex flex-col justify-between">
              <div>
                <p className="text-primary text-[10px] font-bold tracking-widest uppercase mb-1 flex items-center gap-1">
                  ★ Legendary
                </p>
                <h4 className="text-white text-lg font-bold leading-tight">Plasma Katana</h4>
              </div>
            </div>
          </div>
          
          <div className="holographic-card rounded-xl p-1 flex flex-col aspect-[3/4] relative overflow-hidden group" style={{ borderColor: 'rgba(192, 132, 252, 0.3)' }}>
            <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="w-full h-3/5 bg-slate-900 rounded-lg mb-3 border border-purple-500/30 relative overflow-hidden" style={{ backgroundImage: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' }}>
              <div className="absolute inset-0 flex items-center justify-center opacity-50">
                <Shield className="w-16 h-16 text-purple-400" />
              </div>
              <div className="absolute top-2 right-2 bg-background-dark/80 px-2 py-1 rounded text-[10px] font-mono text-purple-400 border border-purple-500/50">#8831</div>
            </div>
            <div className="px-3 pb-3 flex-1 flex flex-col justify-between">
              <div>
                <p className="text-purple-400 text-[10px] font-bold tracking-widest uppercase mb-1 flex items-center gap-1">
                  ♦ Epic
                </p>
                <h4 className="text-white text-lg font-bold leading-tight">Aegis Core</h4>
              </div>
            </div>
          </div>
          
          <div className="holographic-card rounded-xl p-1 flex flex-col aspect-[3/4] relative overflow-hidden group" style={{ borderColor: 'rgba(96, 165, 250, 0.3)' }}>
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="w-full h-3/5 bg-slate-900 rounded-lg mb-3 border border-blue-500/30 relative overflow-hidden" style={{ backgroundImage: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' }}>
              <div className="absolute inset-0 flex items-center justify-center opacity-50">
                <Zap className="w-16 h-16 text-blue-400" />
              </div>
              <div className="absolute top-2 right-2 bg-background-dark/80 px-2 py-1 rounded text-[10px] font-mono text-blue-400 border border-blue-500/50">#1209</div>
            </div>
            <div className="px-3 pb-3 flex-1 flex flex-col justify-between">
              <div>
                <p className="text-blue-400 text-[10px] font-bold tracking-widest uppercase mb-1 flex items-center gap-1">
                  ▲ Rare
                </p>
                <h4 className="text-white text-lg font-bold leading-tight">Neural Link</h4>
              </div>
            </div>
          </div>
          
          <div className="holographic-card rounded-xl p-1 flex flex-col aspect-[3/4] relative overflow-hidden group" style={{ borderColor: 'rgba(148, 163, 184, 0.3)' }}>
            <div className="absolute inset-0 bg-gradient-to-tr from-slate-500/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="w-full h-3/5 bg-slate-900 rounded-lg mb-3 border border-slate-500/30 relative overflow-hidden" style={{ backgroundImage: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' }}>
              <div className="absolute inset-0 flex items-center justify-center opacity-50">
                <Cpu className="w-16 h-16 text-slate-400" />
              </div>
              <div className="absolute top-2 right-2 bg-background-dark/80 px-2 py-1 rounded text-[10px] font-mono text-slate-300 border border-slate-500/50">#5591</div>
            </div>
            <div className="px-3 pb-3 flex-1 flex flex-col justify-between">
              <div>
                <p className="text-slate-400 text-[10px] font-bold tracking-widest uppercase mb-1 flex items-center gap-1">
                  ■ Common
                </p>
                <h4 className="text-white text-lg font-bold leading-tight">Scrap Plating</h4>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
