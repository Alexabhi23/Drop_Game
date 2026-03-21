import { Link } from 'react-router-dom';
import { ArrowRight, Swords, Shield, Zap, Cpu, Loader2 } from 'lucide-react';
import React, { useState, useEffect } from 'react';

export function LootBoxReveal() {
  const [revealState, setRevealState] = useState<'suspense' | 'revealed'>('suspense');
  const [power, setPower] = useState(0);
  const [expProgress, setExpProgress] = useState({ current: window.state.exp, total: (100 * window.state.level * (window.state.level + 1)) / 2 });

  // Mocked result for the reveal
  const resultItem = {
    id: Math.floor(Math.random() * 9000 + 1000).toString(),
    name: 'Valkyrie Blade',
    rarity: 'Legendary' as const,
    type: 'Sword'
  };

  useEffect(() => {
    // 800ms suspense
    const timer = setTimeout(() => {
      setRevealState('revealed');
      
      // addItem will now calculate the correct power based on rarity
      window.ux.addItem(resultItem);
      
      // Get the added item with its generated power
      const addedItem = window.state.inventory[0];
      const itemPower = addedItem.power;
      
      window.ux.addToast(`Artifact Decrypted: ${resultItem.rarity} NFT Acquired`, 'success');
      window.ux.addLog("OPEN", resultItem.name, `[${resultItem.rarity}] Power ${itemPower}`);
      
      // Add EXP
      window.ux.addExp(resultItem.rarity);
      
      // Animate power bar fill
      setTimeout(() => {
        let p = 0;
        const interval = setInterval(() => {
          p += 2;
          if (p >= itemPower) {
            setPower(itemPower);
            clearInterval(interval);
          } else {
            setPower(p);
          }
        }, 10);
      }, 300);

      // We don't need to manually setExpProgress here as we'll listen for state updates
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleUpdate = () => {
      setExpProgress({ 
        current: window.state.exp, 
        total: (100 * window.state.level * (window.state.level + 1)) / 2 
      });
    };
    window.addEventListener('ux-state-update', handleUpdate);
    return () => window.removeEventListener('ux-state-update', handleUpdate);
  }, []);

  const getRarityGlow = (rarity: string) => {
    switch (rarity) {
      case 'Legendary': return 'rarity-glow-legendary';
      case 'Epic': return 'rarity-glow-epic';
      case 'Rare': return 'rarity-glow-rare';
      default: return 'rarity-glow-common';
    }
  };

  return (
    <div className="antialiased font-display bg-background-dark text-slate-100 min-h-screen flex flex-col relative overflow-hidden">
      <div className="fixed top-0 left-0 w-full h-full z-[-1] bg-[radial-gradient(circle_at_center,rgba(30,41,59,0.8)_0%,#020617_80%)]"></div>
      
      <div className="absolute top-1/2 left-1/2 w-[200vw] h-[200vw] -translate-x-1/2 -translate-y-1/2 z-0 pointer-events-none" style={{ background: 'repeating-conic-gradient(from 0deg, rgba(244, 209, 37, 0.15) 0deg 5deg, transparent 5deg 15deg)', maskImage: 'radial-gradient(circle, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 60%)', WebkitMaskImage: 'radial-gradient(circle, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 60%)' }}></div>
      
      <div className="absolute top-12 left-1/2 -translate-x-1/2 z-50 text-center">
        <div className="inline-block border-2 border-primary bg-primary/10 px-8 py-3 rounded-full backdrop-blur-sm shadow-[0_0_30px_rgba(244,209,37,0.5)]">
          <h1 className="text-primary text-2xl md:text-3xl font-black tracking-[0.2em] uppercase drop-shadow-[0_0_10px_rgba(244,209,37,0.8)]">
            {revealState === 'suspense' ? 'Decrypting Artifact...' : 'New Item Acquired'}
          </h1>
        </div>
      </div>
      
      <main className="flex-1 flex flex-col items-center justify-center relative z-10 w-full max-w-7xl mx-auto px-4 h-screen">
        <div 
          className={`relative w-72 sm:w-80 md:w-96 aspect-[3/4] rounded-2xl p-2 flex flex-col mt-8 transition-all duration-700 ${revealState === 'suspense' ? 'scale-90 blur-sm brightness-50' : `scale-110 ${getRarityGlow(resultItem.rarity)} animate-slide-in`}`} 
          style={{ background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%)', border: revealState === 'revealed' ? undefined : '2px solid rgba(244, 209, 37, 0.2)' }}
        >
          {revealState === 'suspense' && (
            <div className="absolute inset-0 flex items-center justify-center z-30">
              <Loader2 className="w-16 h-16 text-primary animate-spin" />
            </div>
          )}
          
          <div className="w-full h-[65%] bg-slate-900 rounded-xl mb-4 border border-primary/50 relative overflow-hidden flex items-center justify-center shadow-inner" style={{ backgroundImage: 'radial-gradient(circle at center, #1e293b 0%, #020617 100%)' }}>
            <div className="absolute inset-0 bg-primary/10 mix-blend-overlay"></div>
            {revealState === 'revealed' && <img src="/assets/images/plasma_katana.png" alt="Revealed Item" className="w-[85%] h-[85%] object-contain drop-shadow-[0_0_20px_rgba(244,209,37,0.8)]" />}
            
            <div className="absolute top-3 right-3 bg-black/80 px-3 py-1.5 rounded text-xs font-mono text-primary border border-primary/50 shadow-[0_0_10px_rgba(244,209,37,0.3)]">
              #{resultItem.id}
            </div>
            
            <div className="absolute bottom-3 left-3 bg-primary/20 backdrop-blur-md px-3 py-1 rounded text-[10px] font-bold tracking-widest uppercase text-primary border border-primary/40 flex items-center gap-1">
              ★ {resultItem.rarity}
            </div>
          </div>
          
          <div className="px-4 pb-4 flex-1 flex flex-col justify-between items-center text-center">
            {revealState === 'revealed' && (
              <>
                <div className="animate-slide-in">
                  <h2 className="text-white text-3xl font-black leading-tight tracking-wider uppercase drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
                    Valkyrie<br/>Blade
                  </h2>
                  <p className="text-primary/80 text-xs font-mono mt-2 tracking-widest uppercase">{resultItem.rarity} tier artifact</p>
                </div>
                
                <div className="w-full flex flex-col gap-2 border-t border-primary/30 pt-3 mt-4 animate-slide-in" style={{ animationDelay: '0.2s' }}>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-[10px] font-mono uppercase">Power Level</span>
                    <span className="text-white font-bold text-lg">{power}</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-primary transition-all duration-300" style={{ width: `${power}%` }}></div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
        
        <div className={`mt-10 z-50 flex flex-col items-center gap-6 transition-all duration-500 ${revealState === 'revealed' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <Link to="/inventory" className="flex items-center justify-center gap-3 rounded-xl h-16 px-12 bg-primary text-background-dark text-2xl font-black uppercase tracking-[0.15em] hover:bg-white hover:text-background-dark transition-all duration-300 shadow-[0_0_20px_rgba(244,209,37,0.4)] hover:shadow-[0_0_40px_rgba(244,209,37,0.8)] group backdrop-blur-sm">
            <span>Claim Item</span>
            <ArrowRight className="w-8 h-8 group-hover:translate-x-1 transition-transform" />
          </Link>

          <div className="w-96 flex flex-col gap-2 mt-4">
             <div className="flex justify-between text-[10px] font-mono uppercase tracking-widest">
               <span className="text-primary font-bold">Level {window.state.level}</span>
               <span className="text-slate-400">{expProgress.current} / {expProgress.total} EXP</span>
             </div>
             <div className="h-3 w-full bg-slate-900 rounded-full border border-primary/20 overflow-hidden p-0.5">
               <div 
                 className="h-full bg-gradient-to-r from-primary/50 to-primary transition-all duration-1000 ease-out rounded-full relative"
                 style={{ width: `${(expProgress.current / expProgress.total) * 100}%` }}
               >
                 <div className="absolute top-0 right-0 w-4 h-full bg-white/20 blur-sm"></div>
               </div>
             </div>
          </div>
        </div>
      </main>
      
      <div className="absolute bottom-6 right-6 z-30 w-64 glass-panel p-4 rounded-xl border-primary/30 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
        <div className="absolute top-0 left-0 w-1 h-full bg-slate-700"></div>
        <div className="flex justify-between items-end mb-2">
          <div>
            <p className="text-slate-400 text-[10px] font-mono tracking-widest uppercase mb-0.5">Pity Reset</p>
            <p className="text-white text-sm font-bold tracking-wider uppercase">Legendary</p>
          </div>
          <p className="text-white text-xl font-black font-mono">0<span className="text-slate-500 text-sm">/30</span></p>
        </div>
        <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden border border-slate-700">
          <div className="h-full bg-slate-600 rounded-full" style={{ width: '0%' }}></div>
        </div>
      </div>
    </div>
  );
}
