import { Search, Filter, LayoutGrid, List, Swords, Shield, Zap, Cpu, Gamepad2, Landmark, Send, Flame, ChevronDown, X } from 'lucide-react';
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Item } from '../ux/logic';

export function Inventory() {
  const [items, setItems] = useState<Item[]>(window.state.inventory);
  const [filters, setFilters] = useState(window.state.filters);
  const [balance, setBalance] = useState(window.state.balance);

  // Modal states
  const [transferModal, setTransferModal] = useState<{ open: boolean; item: Item | null }>({ open: false, item: null });
  const [transferAddress, setTransferAddress] = useState('');
  const [burnModal, setBurnModal] = useState<{ open: boolean; item: Item | null }>({ open: false, item: null });

  useEffect(() => {
    const handleUpdate = () => {
      setItems([...window.state.inventory]);
      setFilters({ ...window.state.filters });
      setBalance(window.state.balance);
    };

    window.addEventListener('ux-state-update', handleUpdate);
    return () => window.removeEventListener('ux-state-update', handleUpdate);
  }, []);

  const handleTransfer = useCallback((item: Item) => {
    setTransferModal({ open: true, item });
    setTransferAddress('');
  }, []);

  const confirmTransfer = useCallback(() => {
    if (!transferModal.item) return;
    const addr = transferAddress.trim();
    if (!addr || !addr.startsWith('0x')) {
      window.ux.triggerError('input');
      window.ux.addToast('Invalid address format', 'error');
      return;
    }
    window.ux.removeItem(transferModal.item.id, 'transfer');
    window.ux.addToast(`Transferred ${transferModal.item.name} to ${addr.slice(0, 6)}...`, 'transfer');
    window.ux.addLog('TRANSFER', transferModal.item.name, `Sent to ${addr.slice(0, 6)}...`);
    setTransferModal({ open: false, item: null });
    setTransferAddress('');
  }, [transferModal.item, transferAddress]);

  const handleBurn = useCallback((item: Item) => {
    setBurnModal({ open: true, item });
  }, []);

  const confirmBurn = useCallback(() => {
    if (!burnModal.item) return;
    window.ux.removeItem(burnModal.item.id, 'burn');
    window.ux.addToast(`Item burned: ${burnModal.item.name}`, 'burn');
    window.ux.addLog('BURN', burnModal.item.name, 'Vaporized');
    setBurnModal({ open: false, item: null });
  }, [burnModal.item]);

  const filteredItems = useMemo(() =>
    items
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
      }),
    [items, filters]
  );

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
        <section className="glass-panel rounded-xl p-6 flex flex-col md:flex-row gap-6 justify-between items-center relative overflow-hidden animate-shimmer">
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
        <section className="glass-panel rounded-xl p-4 border border-surface-border/30 animate-slide-in" style={{ animationDelay: '0.1s' }}>
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
        <section className="flex flex-col gap-6 animate-slide-in" style={{ animationDelay: '0.2s' }}>
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
              {filteredItems.map((item, index) => (
                <div
                  key={item.id}
                  className={`holographic-card rounded-xl p-1 flex flex-col aspect-[3/4] relative overflow-hidden group transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl ${item.animation === 'slide-in' ? 'animate-slide-in' : ''} ${item.animation === 'fade-shrink' ? 'animate-fade-shrink' : ''} ${item.animation === 'burn-dissolve' ? 'animate-burn-dissolve' : ''}`}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className={`absolute inset-0 bg-gradient-to-tr opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${item.rarity === 'Legendary' ? 'from-primary/20' : item.rarity === 'Epic' ? 'from-purple-500/20' : item.rarity === 'Rare' ? 'from-blue-500/20' : 'from-slate-500/20'}`}></div>
                  <div className={`w-full h-3/5 bg-slate-900 rounded-lg mb-3 border relative overflow-hidden flex items-center justify-center ${item.rarity === 'Legendary' ? 'border-primary/30' : item.rarity === 'Epic' ? 'border-purple-500/30' : item.rarity === 'Rare' ? 'border-blue-500/30' : 'border-slate-500/30'}`} style={{ backgroundImage: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' }}>
                    <div className="opacity-80 group-hover:scale-110 transition-transform duration-500 w-full h-full">
                      {item.rarity === 'Legendary' && <img src="/assets/images/plasma_katana.png" alt={item.name} className="w-full h-full object-cover" />}
                      {item.rarity === 'Epic' && <img src="/assets/images/aegis_core_shield.png" alt={item.name} className="w-full h-full object-cover" />}
                      {item.rarity === 'Rare' && <img src="/assets/images/neural_link_chip.png" alt={item.name} className="w-full h-full object-cover" />}
                      {!['Legendary', 'Epic', 'Rare'].includes(item.rarity) && <img src="/assets/images/iron_gauntlet_common.png" alt={item.name} className="w-full h-full object-cover" />}
                    </div>
                    <div className={`absolute top-2 right-2 bg-background-dark/80 px-2 py-1 rounded text-[10px] font-mono border backdrop-blur-sm ${getRarityColor(item.rarity)} ${item.rarity === 'Legendary' ? 'border-primary/50' : item.rarity === 'Epic' ? 'border-purple-500/50' : item.rarity === 'Rare' ? 'border-blue-500/50' : 'border-slate-500/50'}`}>#{item.id}</div>
                    
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 z-20">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleTransfer(item); }}
                          className="p-3 bg-blue-500/20 border border-blue-500/50 rounded-full text-blue-400 hover:bg-blue-500 hover:text-white transition-all shadow-lg"
                          aria-label={`Transfer ${item.name}`}
                          title="Transfer"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleBurn(item); }}
                          className="p-3 bg-red-500/20 border border-red-500/50 rounded-full text-red-400 hover:bg-red-500 hover:text-white transition-all shadow-lg"
                          aria-label={`Burn ${item.name}`}
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

      {/* Transfer Modal */}
      {transferModal.open && transferModal.item && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="transfer-title">
          <div className="glass-panel rounded-2xl p-6 max-w-md w-full border border-primary/30 shadow-2xl animate-slide-in">
            <div className="flex justify-between items-center mb-6">
              <h3 id="transfer-title" className="text-white text-lg font-bold tracking-widest uppercase flex items-center gap-2">
                <Send className="w-5 h-5 text-primary" />
                Transfer Asset
              </h3>
              <button
                onClick={() => setTransferModal({ open: false, item: null })}
                className="text-slate-500 hover:text-white transition-colors"
                aria-label="Close transfer modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-6 p-4 bg-slate-900/50 rounded-lg border border-primary/20">
              <p className="text-slate-400 text-xs font-mono uppercase tracking-wider mb-1">Asset</p>
              <p className={`text-lg font-bold ${getRarityColor(transferModal.item.rarity)}`}>{transferModal.item.name}</p>
              <p className="text-slate-500 text-xs font-mono mt-1">ID: #{transferModal.item.id} | Power: {transferModal.item.power}</p>
            </div>

            <div className="mb-6">
              <label htmlFor="transfer-address" className="text-slate-400 text-xs font-mono uppercase tracking-wider mb-2 block">
                Recipient Address (0x...)
              </label>
              <input
                id="transfer-address"
                type="text"
                value={transferAddress}
                onChange={(e) => setTransferAddress(e.target.value)}
                placeholder="0x..."
                className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-surface-border/50 text-white font-mono text-sm focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                autoFocus
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setTransferModal({ open: false, item: null })}
                className="flex-1 py-3 px-4 rounded-lg border border-slate-600 text-slate-400 hover:text-white hover:border-slate-400 transition-all font-mono text-xs uppercase tracking-wider"
              >
                Cancel
              </button>
              <button
                onClick={confirmTransfer}
                className="flex-1 py-3 px-4 rounded-lg bg-primary text-background-dark font-bold uppercase tracking-wider text-sm hover:bg-white transition-all"
              >
                Transfer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Burn Confirmation Modal */}
      {burnModal.open && burnModal.item && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="burn-title">
          <div className="glass-panel rounded-2xl p-6 max-w-md w-full border border-red-500/30 shadow-2xl animate-slide-in">
            <div className="flex justify-between items-center mb-6">
              <h3 id="burn-title" className="text-white text-lg font-bold tracking-widest uppercase flex items-center gap-2">
                <Flame className="w-5 h-5 text-red-500" />
                Incinerate Asset
              </h3>
              <button
                onClick={() => setBurnModal({ open: false, item: null })}
                className="text-slate-500 hover:text-white transition-colors"
                aria-label="Close burn modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-6 p-4 bg-red-950/20 rounded-lg border border-red-500/30">
              <p className="text-red-400 text-xs font-mono uppercase tracking-wider mb-1">Warning</p>
              <p className="text-slate-300 text-sm">
                This action will permanently destroy <span className="text-white font-bold">{burnModal.item.name}</span>.
                This cannot be undone.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setBurnModal({ open: false, item: null })}
                className="flex-1 py-3 px-4 rounded-lg border border-slate-600 text-slate-400 hover:text-white hover:border-slate-400 transition-all font-mono text-xs uppercase tracking-wider"
              >
                Cancel
              </button>
              <button
                onClick={confirmBurn}
                className="flex-1 py-3 px-4 rounded-lg bg-red-500 text-white font-bold uppercase tracking-wider text-sm hover:bg-red-600 transition-all shadow-lg shadow-red-500/20"
              >
                Incinerate
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
