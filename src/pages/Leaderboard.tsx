import { Trophy, ChevronDown, User, Shield, List } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Player } from '../ux/logic';
import { staggerContainer, staggerItem, hoverLift, shimmer } from '../utils/animations';

export function Leaderboard() {
  const [players, setPlayers] = useState<Player[]>(window.state.leaderboard);
  const currentPlayer = players.find(p => p.isCurrentPlayer);

  useEffect(() => {
    const handleUpdate = () => {
      setPlayers([...window.state.leaderboard]);
    };

    window.addEventListener('ux-state-update', handleUpdate);
    return () => window.removeEventListener('ux-state-update', handleUpdate);
  }, []);

  const truncate = (addr: string) => {
    if (addr.includes('...')) return addr;
    return addr.slice(0, 6) + '...' + addr.slice(-4);
  };

  const podium = players.slice(0, 3);
  const top1 = podium[0];
  const top2 = podium[1];
  const top3 = podium[2];

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 border-b border-surface-border pb-6">
        <div>
          <h1 className="text-white text-4xl md:text-5xl font-black leading-tight tracking-tighter uppercase drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
            Global <span className="text-primary">Rankings</span>
          </h1>
          <p className="text-slate-400 text-sm font-mono tracking-widest mt-2">ELITE COLLECTOR DATABASE // SUI NETWORK</p>
        </div>
        
        <div className="flex bg-slate-900/50 p-1 rounded-lg border border-surface-border backdrop-blur-sm">
          <button className="px-6 py-2 rounded-md bg-primary text-background-dark font-bold text-sm tracking-widest uppercase shadow-[0_0_10px_rgba(244,209,37,0.3)]">All Time</button>
          <button className="px-6 py-2 rounded-md text-slate-400 hover:text-white font-medium text-sm tracking-widest uppercase transition-colors">Seasonal</button>
        </div>
      </div>
      
      <section className="flex flex-col md:flex-row justify-center items-end gap-4 md:gap-8 min-h-[400px] mt-8 mb-16 pt-10" style={{ perspective: '1000px' }}>
        {top2 && (
          <div className="flex flex-col items-center w-full md:w-1/3 order-2 md:order-1 relative group animate-slide-in" style={{ animationDelay: '0.1s' }}>
            <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity font-mono text-purple-400 text-xs">LVL {top2.level} collector</div>
            <div className="w-24 h-24 rounded-full bg-slate-800 border-2 border-purple-400 flex items-center justify-center mb-4 z-10 shadow-[0_0_20px_rgba(192,132,252,0.4)] relative overflow-hidden">
              <img alt="Avatar 2" className="w-full h-full object-cover rounded-full opacity-80 mix-blend-screen" src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${top2.address}`} />
              <div className="absolute bottom-0 right-0 bg-background-dark border border-purple-400 rounded-full w-6 h-6 flex items-center justify-center text-[10px] font-bold text-purple-400">#2</div>
            </div>
            <div className="text-center mb-6 z-10">
              <h3 className="text-white font-bold text-lg">{truncate(top2.address)}</h3>
              <p className="text-purple-400 font-mono text-sm font-bold mt-1">{top2.balance.toLocaleString()} SUI</p>
            </div>
            <div className="w-full h-48 bg-gradient-to-b from-slate-800/80 to-slate-900/40 rounded-t-xl backdrop-blur-md relative flex items-center justify-center border-x border-t border-purple-500/20 hover-lift" style={{ boxShadow: '0 -15px 40px rgba(192, 132, 252, 0.2), inset 0 2px 10px rgba(192, 132, 252, 0.4)', borderTop: '2px solid rgba(192, 132, 252, 0.6)' }}>
              <span className="text-purple-400/20 font-black text-6xl">2</span>
            </div>
          </div>
        )}
        
        {top1 && (
          <div className="flex flex-col items-center w-full md:w-1/3 order-1 md:order-2 relative group z-20 animate-slide-in" style={{ animationDelay: '0s' }}>
            <div className="absolute -top-16 opacity-100 font-mono text-primary text-xs flex items-center gap-1 bg-primary/10 px-3 py-1 rounded border border-primary/30">
              <Shield className="w-4 h-4" /> LVL {top1.level} CYBER-LORD
            </div>
            <div className="w-32 h-32 rounded-full bg-slate-800 border-2 border-primary flex items-center justify-center mb-4 z-10 shadow-[0_0_40px_rgba(244,209,37,0.6)] relative overflow-hidden">
              <img alt="Avatar 1" className="w-full h-full object-cover rounded-full opacity-90 mix-blend-screen" src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${top1.address}`} />
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Trophy className="text-primary w-8 h-8 drop-shadow-[0_0_10px_#f4d125]" />
              </div>
              <div className="absolute bottom-0 right-2 bg-background-dark border border-primary rounded-full w-8 h-8 flex items-center justify-center text-xs font-black text-primary">#1</div>
            </div>
            <div className="text-center mb-6 z-10">
              <h3 className="text-white font-black text-xl drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]">{truncate(top1.address)}</h3>
              <p className="text-primary font-mono text-lg font-black mt-1 drop-shadow-[0_0_8px_rgba(244,209,37,0.5)]">{top1.balance.toLocaleString()} SUI</p>
            </div>
            <div className="w-full h-64 bg-gradient-to-b from-slate-800/90 to-slate-900/50 rounded-t-xl backdrop-blur-md relative flex items-center justify-center border-x border-t border-primary/30 hover-lift" style={{ boxShadow: '0 -20px 50px rgba(244, 209, 37, 0.3), inset 0 2px 10px rgba(244, 209, 37, 0.5)', borderTop: '2px solid rgba(244, 209, 37, 0.8)' }}>
              <span className="text-primary/20 font-black text-8xl">1</span>
            </div>
          </div>
        )}
        
        {top3 && (
          <div className="flex flex-col items-center w-full md:w-1/3 order-3 md:order-3 relative group animate-slide-in" style={{ animationDelay: '0.2s' }}>
            <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity font-mono text-blue-400 text-xs">LVL {top3.level} collector</div>
            <div className="w-20 h-20 rounded-full bg-slate-800 border-2 border-blue-400 flex items-center justify-center mb-4 z-10 shadow-[0_0_20px_rgba(96,165,250,0.4)] relative overflow-hidden">
              <img alt="Avatar 3" className="w-full h-full object-cover rounded-full opacity-80 mix-blend-screen" src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${top3.address}`} />
              <div className="absolute bottom-0 right-0 bg-background-dark border border-blue-400 rounded-full w-6 h-6 flex items-center justify-center text-[10px] font-bold text-blue-400">#3</div>
            </div>
            <div className="text-center mb-6 z-10">
              <h3 className="text-white font-bold text-lg">{truncate(top3.address)}</h3>
              <p className="text-blue-400 font-mono text-sm font-bold mt-1">{top3.balance.toLocaleString()} SUI</p>
            </div>
            <div className="w-full h-36 bg-gradient-to-b from-slate-800/80 to-slate-900/40 rounded-t-xl backdrop-blur-md relative flex items-center justify-center border-x border-t border-blue-500/20 hover-lift" style={{ boxShadow: '0 -15px 40px rgba(96, 165, 250, 0.2), inset 0 2px 10px rgba(96, 165, 250, 0.4)', borderTop: '2px solid rgba(96, 165, 250, 0.6)' }}>
              <span className="text-blue-400/20 font-black text-6xl">3</span>
            </div>
          </div>
        )}
      </section>
      
      <section className="glass-panel rounded-xl overflow-hidden border border-surface-border">
        <div className="px-6 py-4 border-b border-surface-border bg-slate-900/50 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <List className="w-5 h-5 text-primary" />
            <h3 className="text-white text-sm font-bold tracking-widest uppercase">Global Ranks</h3>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
            <span>UPDATE_FREQ: REALTIME</span>
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse ml-2"></span>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-900/30 text-slate-400 text-xs tracking-wider uppercase border-b border-surface-border font-mono">
                <th className="px-6 py-4 font-medium">Rank</th>
                <th className="px-6 py-4 font-medium">Player</th>
                <th className="px-6 py-4 font-medium text-right">Items</th>
                <th className="px-6 py-4 font-medium text-right">Level</th>
                <th className="px-6 py-4 font-medium text-right text-primary">Balance</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {players.map((player, index) => (
                <tr
                  key={player.address}
                  className={`border-b border-surface-border/30 hover:bg-white/5 transition-all duration-300 hover:translate-x-1 ${player.isCurrentPlayer ? 'bg-primary/5 border-l-4 border-l-primary' : ''}`}
                  style={{ animation: `slide-in 0.4s ease-out ${index * 0.05}s both` }}
                >
                  <td className={`px-6 py-4 font-black ${player.rank === 1 ? 'text-primary' : player.rank === 2 ? 'text-purple-400' : player.rank === 3 ? 'text-blue-400' : 'text-slate-400'}`}>
                    <div className="flex items-center gap-2">
                      #{player.rank}
                      {player.rank === 1 && <Trophy className="w-4 h-4 text-primary" />}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img alt="Avatar" className="w-8 h-8 rounded-full border border-slate-700 mix-blend-screen" src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${player.address}`} />
                      <div>
                        <div className={`font-bold ${player.isCurrentPlayer ? 'text-primary' : 'text-white'}`}>{truncate(player.address)}</div>
                        {player.isCurrentPlayer && <div className="text-[10px] text-primary font-mono uppercase tracking-widest">You (Current)</div>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right text-slate-400 font-mono">{player.itemsOwned}</td>
                  <td className="px-6 py-4 text-right">
                    <span className="bg-slate-800 px-2 py-0.5 rounded text-[10px] font-bold text-white border border-slate-700">LVL {player.level}</span>
                  </td>
                  <td className={`px-6 py-4 text-right font-bold font-mono ${player.rank === 1 ? 'text-primary' : player.isCurrentPlayer ? 'text-primary' : 'text-white'}`}>
                    {player.balance.toLocaleString()} SUI
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      
      {currentPlayer && (
        <div className="fixed bottom-0 left-0 w-full glass-panel border-t border-primary/30 z-[90] py-3 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-slate-800 border-2 border-primary flex items-center justify-center">
                <User className="w-6 h-6 text-primary" />
              </div>
              <div>
                <div className="text-xs text-primary font-mono uppercase tracking-widest font-bold">Your Status</div>
                <div className="text-white font-bold text-sm">{truncate(currentPlayer.address)}</div>
              </div>
            </div>
            
            <div className="flex items-center gap-8 font-mono">
              <div className="text-center sm:text-right">
                <div className="text-[10px] text-slate-400 uppercase tracking-widest">Current Rank</div>
                <div className="text-primary font-bold text-lg">#{currentPlayer.rank}</div>
              </div>
              <div className="text-right border-l border-slate-700 pl-8">
                <div className="text-[10px] text-slate-400 uppercase tracking-widest">Current Level</div>
                <div className="text-white font-bold text-lg">Level {currentPlayer.level}</div>
              </div>
              <div className="hidden sm:block text-right border-l border-slate-700 pl-8">
                <div className="text-[10px] text-slate-400 uppercase tracking-widest">EXP Progress</div>
                <div className="text-white font-bold text-lg">{window.state.exp} / {((100 * window.state.level * (window.state.level + 1)) / 2).toLocaleString()}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
