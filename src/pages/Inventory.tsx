import { Search, Filter, LayoutGrid, List, Swords, Shield, Zap, Cpu, Gamepad2, Landmark, Send, Flame, ChevronDown } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Item } from '../ux/logic';

export function Inventory() {
  const [items, setItems] = useState<Item[]>(window.state.inventory);
  const [filters, setFilters] = useState(window.state.filters);
  const [balance, setBalance] = useState(window.state.balance);

  useEffect(() => {
    const handleUpdate = () => {
      setItems([...window.state.inventory]);
      setFilters({ ...window.state.filters });
      setBalance(window.state.balance);
    };

    window.addEventListener('ux-state-update', handleUpdate);
    return () => window.removeEventListener('ux-state-update', handleUpdate);
  }, []);

  const handleTransfer = (item: Item) => {
    const addr = prompt("Enter recipient address (0x...)");
    if (!addr) {
      window.ux.triggerError('input');
      return;
    }
    window.ux.removeItem(item.id, 'transfer');
    window.ux.addToast(`Transferred ${item.name} to ${addr.slice(0, 6)}...`, 'transfer');
    window.ux.addLog('TRANSFER', item.name, `Sent to ${addr.slice(0, 6)}...`);
  };

  const handleBurn = (item: Item) => {
    if (!confirm(`Are you sure you want to incinerate ${item.name}?`)) return;
    window.ux.removeItem(item.id, 'burn');
    window.ux.addToast(`Item burned: ${item.name}`, 'burn');
    window.ux.addLog('BURN', item.name, 'Vaporized');
  };

  const filteredItems = items
    .filter(i => {
      const matchSearch = i.name.toLowerCase().includes(filters.search.toLowerCase());
      const matchRarity = filters.rarity === 'all' || i.rarity === filters.rarity;
      return matchSearch && matchRarity;
    })
    .sort((a, b) => {
      switch (filters.sort) {
        case 'newest': return b.dateAcquired - a.dateAcquired;
        case 'power_high': return b.power - a.power;
        case 'power_low': return a.power - b.power;
        case 'rarity': {
          const ranks = { 'Legendary': 4, 'Epic': 3, 'Rare': 2, 'Common': 1 };
          return ranks[b.rarity] - ranks[a.rarity];
        }
        default: return 0;
      }
    });

  const getRarityIcon = (rarity: string) => {
    switch (rarity) {
      case 'Legendary': return <Swords className="w-16 h-16 text-primary drop-shadow-[0_0_15px_rgba(244,209,37,0.5)]" />;
      case 'Epic': return <Shield className="w-16 h-16 text-purple-400 drop-shadow-[0_0_15px_rgba(192,132,252,0.5)]" />;
      case 'Rare': return <Zap className="w-16 h-16 text-blue-400 drop-shadow-[0_0_15px_rgba(96,165,250,0.5)]" />;
      default: return <Cpu className="w-16 h-16 text-slate-400" />;
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'Legendary': return 'text-primary';
      case 'Epic': return 'text-purple-400';
      case 'Rare': return 'text-blue-400';
      default: return 'text-slate-400';
    }
  };

  return (
    <>
      <div className="flex flex-col gap-8">
        {/* Top Stats Bar */}
        <section className="glass-panel rounded-xl p-6 flex flex-col md:flex-row gap-6 justify-between items-center relative overflow-hidden">
          <div className="flex items-center gap-6 w-full md:w-auto">
            <div className="bg-background-dark/80 p-4 rounded-lg border border-surface-border flex items-center gap-4">
              <Landmark className="w-10 h-10 text-primary" />
              <div>
                <p className="text-slate-400 text-xs font-mono tracking-widest uppercase mb-1">Total SUI Balance</p>
                <p className="text-white text-3xl font-black tracking-wider flex items-end gap-2">
                  {balance.toLocaleString()} <span className="text-primary text-lg font-bold">SUI</span>
                </p>
              </div>
            </div>
            
            <div className="flex flex-col gap-1 border-l border-surface-border pl-6">
              <p className="text-slate-400 text-xs font-mono tracking-wider uppercase">Assets</p>
              <p className="text-white text-xl font-bold font-mono uppercase tracking-tighter">{items.length} units</p>
            </div>
          </div>

          <div className="hidden lg:block">
            <p className="text-slate-500 text-[10px] font-mono uppercase tracking-[0.2em]">Asset Lookbook System v1.0.4</p>
          </div>
        </section>

        {/* Filters Bar */}
        <section className="glass-panel rounded-xl p-4 border border-surface-border/30">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
              <input 
                className="w-full pl-10 pr-4 py-3 rounded-lg text-sm font-mono placeholder:text-slate-600 focus:ring-0 bg-background-dark border border-surface-border/50 text-white focus:border-primary transition-all" 
                placeholder="SEARCH REGISTRY..." 
                type="text"
                value={filters.search}
                onChange={(e) => window.ux.updateFilters({ search: e.target.value })}
              />
            </div>

            {/* Filter Controls */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative min-w-[140px]">
                <select 
                  className="w-full pl-4 pr-10 py-3 rounded-lg text-[10px] font-mono font-bold tracking-widest uppercase focus:ring-0 appearance-none bg-background-dark border border-surface-border/50 text-white focus:border-primary cursor-pointer hover:bg-slate-800 transition-colors"
                  value={filters.rarity}
                  onChange={(e: any) => window.ux.updateFilters({ rarity: e.target.value })}
                >
                  <option value="all">ALL CLASSES</option>
                  <option value="Legendary">LEGENDARY</option>
                  <option value="Epic">EPIC</option>
                  <option value="Rare">RARE</option>
                  <option value="Common">COMMON</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
              </div>

              <div className="relative min-w-[140px]">
                <select 
                  className="w-full pl-4 pr-10 py-3 rounded-lg text-[10px] font-mono font-bold tracking-widest uppercase focus:ring-0 appearance-none bg-background-dark border border-surface-border/50 text-white focus:border-primary cursor-pointer hover:bg-slate-800 transition-colors"
                  value={filters.sort}
                  onChange={(e: any) => window.ux.updateFilters({ sort: e.target.value })}
                >
                  <option value="newest">TIMESTAMP: NEW</option>
                  <option value="power_high">POWER: DESC</option>
                  <option value="power_low">POWER: ASC</option>
                  <option value="rarity">RARITY RANK</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
              </div>

              <button 
                onClick={() => window.ux.resetFilters()}
                className="h-11 px-6 bg-slate-800/50 border border-slate-700 text-slate-400 rounded-lg hover:text-white hover:border-primary hover:bg-slate-800 transition-all flex items-center justify-center font-mono text-[10px] font-bold uppercase tracking-widest"
              >
                Reset
              </button>
            </div>
          </div>
        </section>

        {/* Arsenal Grid */}
        <section className="flex flex-col gap-6">
          <div className="flex items-center justify-between border-b border-surface-border pb-4">
            <h3 className="text-white text-lg font-bold tracking-widest uppercase flex items-center gap-2">
              <LayoutGrid className="w-6 h-6 text-primary" />
              Registry Arsenal
            </h3>
            <div className="flex items-center gap-2">
              <button className="p-2 text-primary bg-primary/10 rounded-lg border border-primary/20"><LayoutGrid className="w-4 h-4" /></button>
              <button className="p-2 text-slate-600 hover:text-slate-400 transition-colors"><List className="w-4 h-4" /></button>
            </div>
          </div>
          
          {filteredItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {filteredItems.map((item) => (
                <div 
                  key={item.id} 
                  className={`holographic-card rounded-xl p-1 flex flex-col aspect-[3/4] relative overflow-hidden group transition-all duration-500 ${item.animation === 'slide-in' ? 'animate-slide-in' : ''} ${item.animation === 'fade-shrink' ? 'animate-fade-shrink' : ''} ${item.animation === 'burn-dissolve' ? 'animate-burn-dissolve' : ''}`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-tr opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${item.rarity === 'Legendary' ? 'from-primary/20' : item.rarity === 'Epic' ? 'from-purple-500/20' : item.rarity === 'Rare' ? 'from-blue-500/20' : 'from-slate-500/20'}`}></div>
                  <div className={`w-full h-3/5 bg-slate-900 rounded-lg mb-3 border relative overflow-hidden flex items-center justify-center ${item.rarity === 'Legendary' ? 'border-primary/30' : item.rarity === 'Epic' ? 'border-purple-500/30' : item.rarity === 'Rare' ? 'border-blue-500/30' : 'border-slate-500/30'}`} style={{ backgroundImage: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' }}>
                    <div className="opacity-80 group-hover:scale-110 transition-transform duration-500">
                      {getRarityIcon(item.rarity)}
                    </div>
                    <div className={`absolute top-2 right-2 bg-background-dark/80 px-2 py-1 rounded text-[10px] font-mono border backdrop-blur-sm ${getRarityColor(item.rarity)} ${item.rarity === 'Legendary' ? 'border-primary/50' : item.rarity === 'Epic' ? 'border-purple-500/50' : item.rarity === 'Rare' ? 'border-blue-500/50' : 'border-slate-500/50'}`}>#{item.id}</div>
                    
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 z-20">
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleTransfer(item); }} 
                          className="p-3 bg-blue-500/20 border border-blue-500/50 rounded-full text-blue-400 hover:bg-blue-500 hover:text-white transition-all shadow-lg" 
                          title="Transfer"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleBurn(item); }} 
                          className="p-3 bg-red-500/20 border border-red-500/50 rounded-full text-red-400 hover:bg-red-500 hover:text-white transition-all shadow-lg" 
                          title="Incinerate"
                        >
                            <Flame className="w-4 h-4" />
                        </button>
                    </div>
                  </div>
                  <div className="px-3 pb-3 flex-1 flex flex-col justify-between">
                    <div>
                      <p className={`text-[10px] font-bold tracking-widest uppercase mb-1 flex items-center gap-1 ${getRarityColor(item.rarity)}`}>
                        {item.rarity === 'Legendary' ? '★' : item.rarity === 'Epic' ? '♦' : item.rarity === 'Rare' ? '▲' : '■'} {item.rarity}
                      </p>
                      <h4 className="text-white text-md font-bold leading-tight group-hover:text-primary transition-colors">{item.name}</h4>
                    </div>
                    <div className="flex justify-between items-center border-t border-slate-700/50 pt-2 mt-2">
                      <span className="text-slate-500 text-[10px] font-mono uppercase">Power Rank</span>
                      <span className={`font-bold text-sm ${item.rarity === 'Legendary' ? 'text-primary' : 'text-white'}`}>{item.power}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 glass-panel rounded-xl border-dashed border-2 border-surface-border/50">
              <Filter className="w-12 h-12 text-slate-700 mb-4" />
              <p className="text-slate-500 font-mono text-sm uppercase tracking-widest">No assets matching signature</p>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
