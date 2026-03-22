import { Coins, Diamond, Swords, Shield, Zap, Cpu, CheckCircle, RotateCcw, Lock, Sparkles } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { MILESTONE_REWARDS } from '../ux/logic';
import { hoverLift, hoverGlow, shimmer } from '../utils/animations';

export function Rewards() {
  const [level, setLevel] = useState(window.state.level);
  const [exp, setExp] = useState(window.state.exp);
  const [claimedRewards, setClaimedRewards] = useState<string[]>(window.state.claimedRewards);
  
  const getExpRequired = (l: number) => (100 * l * (l + 1)) / 2;
  const nextExpRequirement = getExpRequired(level);
  const progressPercent = Math.min((exp / nextExpRequirement) * 100, 100);

  useEffect(() => {
    const handleUpdate = () => {
      setLevel(window.state.level);
      setExp(window.state.exp);
      setClaimedRewards([...window.state.claimedRewards]);
    };

    window.addEventListener('ux-state-update', handleUpdate);
    return () => window.removeEventListener('ux-state-update', handleUpdate);
  }, []);

  const handleReset = () => {
    if (confirm("Are you sure you want to reset your level and EXP progress? This will return you to Level 1.")) {
      window.state.level = 1;
      window.state.exp = 0;
      window.ux.addToast("Progress reset to zero", "info");
      window.dispatchEvent(new CustomEvent('ux-state-update'));
      
      // Also save to storage if function exists
      try {
        const dataToSave = {
          balance: window.state.balance,
          level: window.state.level,
          exp: window.state.exp,
          inventory: window.state.inventory,
        };
        localStorage.setItem('cyber_vault_state', JSON.stringify(dataToSave));
      } catch (e) {}
    }
  };

  return (
    <>
      <section className="flex flex-col gap-6 w-full mt-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-2">
          <div>
            <h1 className="text-white text-4xl md:text-5xl font-black leading-tight tracking-tighter uppercase drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
              Season 1:<br/><span className="text-primary">Obsidian Frontier</span>
            </h1>
            <p className="text-slate-300 text-lg md:text-xl font-light tracking-wide max-w-lg mt-3">
              Complete bounties to earn loot shards and unlock premium Web3 assets.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <button 
              onClick={handleReset}
              className="flex items-center justify-center gap-3 rounded-xl h-14 px-6 bg-slate-800 text-slate-400 text-sm font-bold uppercase tracking-widest hover:text-white transition-all border border-slate-700"
            >
              <RotateCcw className="w-5 h-5" />
              <span>Reset Progress</span>
            </button>
            <button className="flex items-center justify-center gap-3 rounded-xl h-14 px-8 bg-primary text-background-dark text-lg font-black uppercase tracking-widest hover:bg-white transition-all shadow-[0_0_30px_rgba(244,209,37,0.4)] hover:shadow-[0_0_50px_rgba(244,209,37,0.7)] hover:scale-105 active:scale-95 group">
              <Coins className="w-6 h-6 group-hover:rotate-180 transition-transform duration-500" />
              <span>Redeem Loot Shards</span>
            </button>
          </div>
        </div>
        
        <div className="glass-panel p-6 md:p-8 rounded-xl relative overflow-hidden border border-surface-border w-full shadow-[0_0_40px_rgba(0,0,0,0.6)] mt-4 animate-shimmer">
          <div className="flex justify-between items-end mb-6">
            <div>
              <p className="text-primary text-sm font-mono tracking-widest uppercase mb-1">Current Tier</p>
              <p className="text-white text-4xl font-black tracking-wider uppercase font-mono">LVL {level}</p>
            </div>
            <div className="text-right">
              <p className="text-slate-400 text-sm font-mono uppercase mb-1">Season Progress</p>
              <p className="text-white text-2xl font-bold font-mono">{exp.toLocaleString()} <span className="text-slate-500 text-lg">/ {nextExpRequirement.toLocaleString()} XP</span></p>
            </div>
          </div>
          
          <div className="h-8 w-full bg-slate-800 rounded-full overflow-hidden border border-slate-700 relative shadow-inner">
            <div className="h-full bg-gradient-to-r from-primary via-yellow-400 to-purple-600 rounded-full transition-all duration-1000 ease-out relative" style={{ width: `${progressPercent}%` }}>
              <div className="absolute right-0 top-0 bottom-0 w-8 bg-white/50 blur-[4px]"></div>
            </div>
          </div>
          <p className="text-slate-400 text-sm mt-4 font-mono">{(nextExpRequirement - exp).toLocaleString()} XP remaining until Level {level + 1}.</p>
        </div>
      </section>
      
      
      <section className="mt-8 flex flex-col gap-6">
        <div className="flex items-center justify-between border-b border-surface-border pb-4">
          <div className="flex items-center gap-3">
            <Diamond className="w-6 h-6 text-primary" />
            <h2 className="text-white text-2xl font-bold tracking-widest uppercase">Claimable Assets</h2>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {MILESTONE_REWARDS.map((reward, index) => {
            const isClaimed = claimedRewards.includes(reward.id);
            const isLocked = level < reward.levelRequired;
            const isClickable = !isClaimed && !isLocked;

            const getIcon = () => {
              if (reward.levelRequired >= 50) return <Swords className="w-16 h-16 text-primary drop-shadow-[0_0_15px_rgba(244,209,37,0.8)]" />;
              if (reward.levelRequired >= 40) return <Shield className="w-16 h-16 text-purple-400 drop-shadow-[0_0_15px_rgba(192,132,252,0.8)]" />;
              if (reward.levelRequired >= 25) return <Zap className="w-16 h-16 text-blue-400 drop-shadow-[0_0_15px_rgba(96,165,250,0.8)]" />;
              return <Cpu className="w-16 h-16 text-blue-400 drop-shadow-[0_0_15px_rgba(96,165,250,0.8)]" />;
            };

            const rarityColor = reward.rarity === 'Legendary' ? 'text-primary' : reward.rarity === 'Epic' ? 'text-purple-400' : 'text-blue-400';
            const rarityBorder = reward.rarity === 'Legendary' ? 'border-primary/30' : reward.rarity === 'Epic' ? 'border-purple-500/30' : 'border-blue-500/30';
            const rarityGlow = reward.rarity === 'Legendary' ? 'from-primary/20' : reward.rarity === 'Epic' ? 'from-purple-500/20' : 'from-blue-500/20';

            return (
              <div
                key={reward.id}
                className={`holographic-card rounded-xl p-1 flex flex-col aspect-[3/4] relative overflow-hidden group transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl ${isLocked ? 'grayscale opacity-60' : ''}`}
                style={{ 
                  animation: `slide-in 0.5s ease-out ${index * 0.1}s both`,
                  borderColor: reward.rarity === 'Epic' ? 'rgba(192, 132, 252, 0.3)' : reward.rarity === 'Rare' ? 'rgba(96, 165, 250, 0.3)' : undefined 
                }}
              >
                <div className={`absolute inset-0 bg-gradient-to-tr ${rarityGlow} via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                <div className={`w-full h-3/5 bg-slate-900 rounded-lg mb-3 border ${rarityBorder} relative overflow-hidden`} style={{ backgroundImage: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' }}>
                  <div className="absolute inset-0 flex items-center justify-center opacity-70 group-hover:scale-110 transition-transform duration-500">
                    {getIcon()}
                  </div>
                  <div className={`absolute top-2 right-2 bg-background-dark/80 px-2 py-1 rounded text-[10px] font-mono ${rarityColor} border ${rarityBorder.replace('/30', '/50')}`}>
                    LVL {reward.levelRequired} UNLOCK
                  </div>
                  {isLocked && (
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex flex-col items-center justify-center gap-2">
                        <Lock className="w-8 h-8 text-slate-500" />
                        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold">Locked</span>
                    </div>
                  )}
                </div>
                <div className="px-3 pb-3 flex-1 flex flex-col justify-between">
                  <div>
                    <p className={`${rarityColor} text-[10px] font-bold tracking-widest uppercase mb-1 flex items-center gap-1`}>
                      {reward.rarity === 'Legendary' ? '★' : reward.rarity === 'Epic' ? '♦' : reward.rarity === 'Rare' ? '▲' : '■'} {reward.rarity} {reward.type}
                    </p>
                    <h4 className="text-white text-lg font-bold leading-tight">{reward.name}</h4>
                  </div>
                  
                  {isClaimed ? (
                    <button className="mt-2 w-full py-2 bg-slate-800 text-slate-500 text-xs font-bold uppercase rounded border border-slate-700 cursor-not-allowed flex items-center justify-center gap-2">
                      <CheckCircle className="w-4 h-4" /> Claimed
                    </button>
                  ) : isLocked ? (
                    <button className="mt-2 w-full py-2 bg-slate-800 text-slate-400 text-xs font-bold uppercase rounded border border-slate-700 cursor-not-allowed">Locked</button>
                  ) : (
                    <button 
                      onClick={() => window.ux.claimReward(reward.id)}
                      className={`mt-2 w-full py-2 ${reward.rarity === 'Legendary' ? 'bg-primary text-background-dark border-primary' : reward.rarity === 'Epic' ? 'bg-purple-500 text-white border-purple-400' : 'bg-blue-500 text-white border-blue-400'} text-xs font-bold uppercase rounded border shadow-lg hover:brightness-110 transition-all active:scale-95`}
                    >
                      Claim Asset
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}
