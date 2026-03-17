import { ConnectButton, useCurrentAccount, useSuiClient, useSuiClientQuery } from '@mysten/dapp-kit';
import { Link, useLocation } from 'react-router-dom';
import { Hexagon, Wallet, Menu, Shield, Activity } from 'lucide-react';
import React, { useEffect, useState } from 'react';

export function Header() {
  const account = useCurrentAccount();
  const location = useLocation();
  const [state, setState] = useState(window.state);

  useEffect(() => {
    if (account) {
      window.ux.connectWallet(account.address);
    } else {
      window.ux.disconnectWallet();
    }
  }, [account?.address]);

  useEffect(() => {
    const handleUpdate = () => {
      setState({ ...window.state });
    };
    window.addEventListener('ux-state-update', handleUpdate);
    return () => window.removeEventListener('ux-state-update', handleUpdate);
  }, []);

  const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  const navLinks = [
    { name: 'Loot Boxes', path: '/' },
    { name: 'Inventory', path: '/inventory' },
    { name: 'Rewards', path: '/rewards' },
    { name: 'Leaderboard', path: '/leaderboard' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-[100] border-b border-surface-border glass-panel rounded-b-xl shadow-[0_8px_32px_rgba(0,0,0,0.8)] backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between whitespace-nowrap">
      <Link to="/" className="flex items-center gap-4 text-primary">
        <Hexagon className="w-8 h-8" />
        <h2 className="text-white text-xl font-bold leading-tight tracking-widest uppercase">Cyber-Vault</h2>
      </Link>

      <div className="hidden md:flex flex-1 justify-end gap-8">
        <div className="flex items-center gap-8">
          {state.connected && (
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3 bg-background-dark/50 px-4 py-2 rounded-lg border border-surface-border">
                <Wallet className="w-4 h-4 text-primary" />
                <span className="text-white font-mono font-bold">
                  {state.balance.toLocaleString()} <span className="text-primary text-[10px] ml-1">SUI</span>
                </span>
                <div className="h-4 w-px bg-slate-700 mx-1"></div>
                <span className="text-slate-400 font-mono text-xs">{formatAddress(state.walletAddress!)}</span>
              </div>
            </div>
          )}

          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={`text-sm font-medium tracking-wider uppercase transition-colors ${location.pathname === link.path
                ? 'text-primary font-semibold'
                : 'text-slate-400 hover:text-white'
                }`}
            >
              {link.name}
            </Link>
          ))}
        </div>

        <ConnectButton
          className="!flex !items-center !justify-center !overflow-hidden !rounded !lg !h-10 !px-6 !bg-[#f4d125] !text-[#020617] !text-sm !font-bold !uppercase !tracking-wider hover:!bg-white !transition-colors !shadow-[0_0_15px_rgba(244,209,37,0.4)]"
        />
      </div>

        <button className="md:hidden text-primary">
          <Menu className="w-8 h-8" />
        </button>
      </div>
    </header>
  );
}
