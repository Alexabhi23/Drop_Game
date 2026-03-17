/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Item {
  id: string;
  name: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  power: number;
  type: string;
  icon?: string;
  animation?: string;
  dateAcquired: number;
}

export interface Player {
  address: string;
  level: number;
  exp: number;
  balance: number;
  itemsOwned: number;
  rank?: number;
  isCurrentPlayer?: boolean;
}

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'burn' | 'transfer' | 'levelup';
}

export interface LogEntry {
  time: string;
  action: string;
  amount: string;
  result: string;
}

export interface GlobalState {
  // from wallet (live, on-chain)
  walletAddress: string | null;
  balance: number;           
  connected: boolean;
  network: string;

  // from localStorage (game data, per address)
  level: number;
  exp: number;
  inventory: Item[];
  toasts: Toast[];
  logs: LogEntry[];
  leaderboard: Player[];
  claimedRewards: string[];
  filters: {
    rarity: 'all' | 'Common' | 'Rare' | 'Epic' | 'Legendary';
    sort: 'newest' | 'power_high' | 'power_low' | 'rarity';
    search: string;
  };
}

declare global {
  interface Window {
    state: GlobalState;
    ux: {
      updateBalance: (newBalance: number) => void;
      fetchBalance: () => Promise<void>;
      addToast: (message: string, type?: Toast['type']) => void;
      addLog: (action: string, amount: string, result: string) => void;
      addItem: (item: Omit<Item, 'id' | 'dateAcquired' | 'power'> & { id?: string, power?: number }) => void;
      removeItem: (id: string, animation: 'burn' | 'transfer') => void;
      triggerError: (type: 'balance' | 'input') => void;
      addExp: (rarity: Item['rarity']) => void;
      updateFilters: (filters: Partial<GlobalState['filters']>) => void;
      resetFilters: () => void;
      connectWallet: (address: string) => void;
      disconnectWallet: () => void;
      claimReward: (rewardId: string) => void;
    };
  }
}

export const MILESTONE_REWARDS = [
  { id: 'reward_lvl20', name: 'Quantum Core', rarity: 'Rare', type: 'Module', levelRequired: 20 },
  { id: 'reward_lvl25', name: 'Neural Link', rarity: 'Rare', type: 'Module', levelRequired: 25 },
  { id: 'reward_lvl40', name: 'Aegis Core', rarity: 'Epic', type: 'Shield', levelRequired: 40 },
  { id: 'reward_lvl50', name: 'Plasma Katana', rarity: 'Legendary', type: 'Weapon', levelRequired: 50 },
];

const INITIAL_INVENTORY: Item[] = [
  { id: '0492', name: 'Plasma Katana', rarity: 'Legendary', power: 48, type: 'Sword', dateAcquired: Date.now() - 1000000 },
  { id: '8831', name: 'Aegis Core', rarity: 'Epic', power: 36, type: 'Shield', dateAcquired: Date.now() - 2000000 },
  { id: '1209', name: 'Neural Link', rarity: 'Rare', power: 22, type: 'Utility', dateAcquired: Date.now() - 3000000 },
  { id: '5591', name: 'Scrap Plating', rarity: 'Common', power: 8, type: 'Armor', dateAcquired: Date.now() - 4000000 },
  { id: '3012', name: 'Quantum Visor', rarity: 'Epic', power: 32, type: 'Headgear', dateAcquired: Date.now() - 5000000 },
];

const SIMULATED_PLAYERS: Player[] = [
  { address: '0x1A2B...3C4D', level: 12, exp: 450, balance: 245900, itemsOwned: 142 },
  { address: '0x8F7E...6D5C', level: 10, exp: 1200, balance: 128450, itemsOwned: 89 },
  { address: '0x3B2A...1F0E', level: 8, exp: 900, balance: 98200, itemsOwned: 64 },
  { address: '0x9C8D...7A6B', level: 7, exp: 200, balance: 75300, itemsOwned: 42 },
  { address: '0x5E6F...4G3H', level: 6, exp: 400, balance: 52100, itemsOwned: 35 },
  { address: '0x7A8B...9C0D', level: 5, exp: 100, balance: 31400, itemsOwned: 28 },
  { address: '0x2D3E...4F5G', level: 4, exp: 350, balance: 15600, itemsOwned: 19 },
  { address: '0x1F2G...3H4I', level: 3, exp: 150, balance: 8900, itemsOwned: 12 },
];

const getExpRequired = (level: number) => (100 * level * (level + 1)) / 2;

const updateLeaderboard = () => {
  const currentPlayer: Player = {
    address: window.state.walletAddress || '0x4A...9B2',
    level: window.state.level,
    exp: window.state.exp,
    balance: window.state.balance,
    itemsOwned: window.state.inventory.length,
    isCurrentPlayer: true
  };

  const allPlayers = [...SIMULATED_PLAYERS, currentPlayer];
  allPlayers.sort((a, b) => {
    if (b.level !== a.level) return b.level - a.level;
    return b.balance - a.balance;
  });

  window.state.leaderboard = allPlayers.map((p, i) => ({ ...p, rank: i + 1 }));
};

const getStorageKey = (address: string) => `gameData_${address}`;

const saveToStorage = () => {
  if (!window.state.walletAddress) return;
  try {
    const dataToSave = {
      level: window.state.level,
      exp: window.state.exp,
      inventory: window.state.inventory,
      logs: window.state.logs,
      claimedRewards: window.state.claimedRewards,
    };
    localStorage.setItem(getStorageKey(window.state.walletAddress), JSON.stringify(dataToSave));
  } catch (e) {
    console.error('Failed to save state:', e);
  }
};

const loadFromStorage = (address: string) => {
  try {
    const saved = localStorage.getItem(getStorageKey(address));
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Failed to load state:', e);
  }
  return null;
};

window.state = {
  walletAddress: null,
  balance: 0,
  connected: false,
  network: 'testnet',
  level: 1,
  exp: 0,
  inventory: INITIAL_INVENTORY,
  toasts: [],
  logs: [],
  leaderboard: [],
  filters: {
    rarity: 'all',
    sort: 'newest',
    search: ''
  },
  claimedRewards: []
};

updateLeaderboard();

import { SuiJsonRpcClient, getJsonRpcFullnodeUrl } from '@mysten/sui/jsonRpc';
const suiClient = new SuiJsonRpcClient({ url: getJsonRpcFullnodeUrl('testnet'), network: 'testnet' });

window.ux = {
  fetchBalance: async () => {
    if (!window.state.walletAddress) return;
    try {
      const balanceObj = await suiClient.getBalance({
        owner: window.state.walletAddress,
        coinType: '0x2::sui::SUI'
      });
      // Convert MIST to SUI
      const realBalance = Number(balanceObj.totalBalance) / 1_000_000_000;
      if (window.state.balance !== realBalance) {
        window.state.balance = realBalance;
        updateLeaderboard();
        window.dispatchEvent(new CustomEvent('ux-state-update'));
      }
    } catch (e) {
      console.error('Failed to fetch balance:', e);
    }
  },

  connectWallet: (address: string) => {
    window.state.walletAddress = address;
    window.state.connected = true;
    
    const saved = loadFromStorage(address);
    if (saved) {
      window.state.level = saved.level ?? 1;
      window.state.exp = saved.exp ?? 0;
      window.state.inventory = saved.inventory ?? INITIAL_INVENTORY;
      window.state.logs = saved.logs ?? [];
      window.state.claimedRewards = saved.claimedRewards ?? [];
    } else {
      // First time initialization
      window.state.level = 1;
      window.state.exp = 0;
      window.state.inventory = INITIAL_INVENTORY;
      window.state.logs = [];
      window.state.claimedRewards = [];
      saveToStorage();
    }
    
    window.ux.fetchBalance();
    updateLeaderboard();
    window.dispatchEvent(new CustomEvent('ux-state-update'));
  },

  disconnectWallet: () => {
    window.state.walletAddress = null;
    window.state.connected = false;
    window.state.balance = 0;
    // Reset to defaults
    window.state.level = 1;
    window.state.exp = 0;
    window.state.inventory = INITIAL_INVENTORY;
    window.state.logs = [];
    window.state.claimedRewards = [];
    updateLeaderboard();
    window.dispatchEvent(new CustomEvent('ux-state-update'));
  },

  updateBalance: (newBalance: number) => {
    // This is now purely for local feedback if needed, 
    // but the architecture says re-fetch after tx.
    window.state.balance = newBalance;
    window.dispatchEvent(new CustomEvent('ux-state-update'));
  },

  addToast: (message: string, type: Toast['type'] = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    const toast = { id, message, type };
    window.state.toasts = [...window.state.toasts, toast];
    window.dispatchEvent(new CustomEvent('ux-state-update'));

    setTimeout(() => {
      window.state.toasts = window.state.toasts.filter((t) => t.id !== id);
      window.dispatchEvent(new CustomEvent('ux-state-update'));
    }, 2500);
  },

  addLog: (action: string, amount: string, result: string) => {
    const entry = {
      time: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      action,
      amount,
      result
    };
    window.state.logs = [entry, ...window.state.logs.slice(0, 19)];
    saveToStorage();
    window.dispatchEvent(new CustomEvent('ux-state-update'));
  },

  addItem: (item: Omit<Item, 'id' | 'dateAcquired' | 'power'> & { id?: string, power?: number }) => {
    const powerRanges = {
      'Common': { min: 1, max: 10 },
      'Rare': { min: 11, max: 25 },
      'Epic': { min: 26, max: 40 },
      'Legendary': { min: 41, max: 50 },
    };
    
    const range = powerRanges[item.rarity];
    const finalPower = item.power ?? Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;

    const newItem = { 
      ...item, 
      id: Math.random().toString(36).substr(2, 6).toUpperCase(), 
      dateAcquired: Date.now(), 
      power: finalPower,
      animation: 'animate-slide-in' 
    };
    window.state.inventory = [newItem, ...window.state.inventory];
    updateLeaderboard();
    saveToStorage();
    window.dispatchEvent(new CustomEvent('ux-state-update'));
    
    setTimeout(() => {
        const idx = window.state.inventory.findIndex(i => i.id === newItem.id);
        if (idx !== -1) {
            const newInv = [...window.state.inventory];
            newInv[idx] = { ...newInv[idx], animation: undefined };
            window.state.inventory = newInv;
            window.dispatchEvent(new CustomEvent('ux-state-update'));
        }
    }, 1000);
  },

  removeItem: (id: string, animation: 'burn' | 'transfer') => {
    const idx = window.state.inventory.findIndex(i => i.id === id);
    if (idx !== -1) {
      const newInv = [...window.state.inventory];
      newInv[idx] = { 
        ...newInv[idx], 
        animation: animation === 'burn' ? 'animate-burn-dissolve' : 'animate-fade-shrink' 
      };
      window.state.inventory = newInv;
      window.dispatchEvent(new CustomEvent('ux-state-update'));

      setTimeout(() => {
        window.state.inventory = window.state.inventory.filter((i) => i.id !== id);
        updateLeaderboard();
        saveToStorage();
        window.dispatchEvent(new CustomEvent('ux-state-update'));
      }, 800);
    }
  },

  triggerError: (type: 'balance' | 'input') => {
    window.dispatchEvent(new CustomEvent('ux-error', { detail: { type } }));
  },

  addExp: (rarity: Item['rarity']) => {
    const rewards = {
      'Common': 10,
      'Rare': 25,
      'Epic': 60,
      'Legendary': 150
    };
    let expGain = rewards[rarity];
    let currentExp = window.state.exp + expGain;
    let currentLevel = window.state.level;
    let leveledUp = false;

    while (currentExp >= getExpRequired(currentLevel)) {
      currentExp -= getExpRequired(currentLevel);
      currentLevel++;
      leveledUp = true;
    }

    window.state.exp = currentExp;
    window.state.level = currentLevel;
    
    if (leveledUp) {
      window.ux.addToast(`🎉 Level Up! You are now Level ${currentLevel}`, 'levelup');
      updateLeaderboard();
    }
    saveToStorage();
    window.dispatchEvent(new CustomEvent('ux-state-update'));
  },

  updateFilters: (newFilters: Partial<GlobalState['filters']>) => {
    window.state.filters = { ...window.state.filters, ...newFilters };
    window.dispatchEvent(new CustomEvent('ux-state-update'));
  },

  resetFilters: () => {
    window.state.filters = { rarity: 'all', sort: 'newest', search: '' };
    window.dispatchEvent(new CustomEvent('ux-state-update'));
  },

  claimReward: (rewardId: string) => {
    if (window.state.claimedRewards.includes(rewardId)) {
      window.ux.addToast("Reward already claimed", "error");
      return;
    }

    const reward = MILESTONE_REWARDS.find(r => r.id === rewardId);
    if (!reward) return;

    if (window.state.level < reward.levelRequired) {
      window.ux.addToast(`Requires Level ${reward.levelRequired}`, "error");
      return;
    }

    // Add item to inventory
    window.ux.addItem({
      name: reward.name,
      rarity: reward.rarity as any,
      type: reward.type
    });

    // Mark as claimed
    window.state.claimedRewards.push(rewardId);
    window.ux.addToast(`Claimed ${reward.name}!`, "success");
    window.ux.addLog("CLAIM", reward.name, `Unlocked at Level ${reward.levelRequired}`);
    
    saveToStorage();
    window.dispatchEvent(new CustomEvent('ux-state-update'));
  }
};

// Recurring balance polling
setInterval(() => {
  if (window.state.connected) {
    window.ux.fetchBalance();
  }
}, 30000);
