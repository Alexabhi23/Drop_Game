import { ConnectButton, useCurrentAccount } from '@mysten/dapp-kit';
import { Link, useLocation } from 'react-router-dom';
import { Hexagon, Menu } from 'lucide-react';
import React, { useEffect, useState } from 'react';

export function Header() {
  const account = useCurrentAccount();
  const location = useLocation();
  const [state, setState] = useState(window.state);
  const [menuOpen, setMenuOpen] = useState(false);

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


  const navLinks = [
    { name: 'Loot Boxes', path: '/' },
    { name: 'Inventory', path: '/inventory' },
    { name: 'Rewards', path: '/rewards' },
    { name: 'Leaderboard', path: '/leaderboard' },
  ];

  return (
    <header
      style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999 }}
      className="w-full border-b border-surface-border bg-neutral-primary glass-panel"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between whitespace-nowrap">
        <Link to="/" className="flex items-center gap-4 text-primary">
          <Hexagon className="w-8 h-8" />
          <h2 className="text-white text-xl font-bold leading-tight tracking-widest uppercase">Cyber-Vault</h2>
        </Link>

        <button
          type="button"
          className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-body rounded-base md:hidden hover:bg-neutral-secondary-soft hover:text-heading focus:outline-none focus:ring-2 focus:ring-neutral-tertiary"
          aria-controls="mobile-menu"
          aria-expanded={menuOpen}
          aria-label="Toggle navigation menu"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span className="sr-only">Open main menu</span>
          <Menu className="w-6 h-6" />
        </button>

        {/* Desktop: Nav links + wallet + connect — all in one right-side group */}
        <div className="hidden md:flex items-center gap-8 ml-auto">
          <ul className="font-medium flex flex-row items-center gap-6">
            {navLinks.map((link) => (
              <li key={link.name}>
                <Link
                  to={link.path}
                  className={`text-base font-medium tracking-wide transition-colors ${
                    location.pathname === link.path
                      ? 'text-primary font-semibold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>

          <ConnectButton
            className="!flex !items-center !justify-center !overflow-hidden !rounded-lg !h-10 !px-6 !bg-[#f4d125] !text-[#020617] !text-sm !font-bold !uppercase !tracking-wider hover:!bg-white !transition-colors !shadow-[0_0_15px_rgba(244,209,37,0.4)]"
          />
        </div>
      </div>

      {/* Mobile Menu — rendered outside the flex row, below it */}
      {menuOpen && (
        <div id="mobile-menu" className="md:hidden border-t border-surface-border bg-neutral-primary px-4 pb-4">
          <ul className="font-medium flex flex-col space-y-1 pt-3">
            {navLinks.map((link) => (
              <li key={link.name}>
                <Link
                  to={link.path}
                  onClick={() => setMenuOpen(false)}
                  className={`block py-2 px-3 rounded ${location.pathname === link.path ? 'text-white bg-brand' : 'text-heading hover:bg-neutral-tertiary'}`}
                >
                  {link.name}
                </Link>
              </li>
            ))}
            {/* Mobile wallet + connect */}
            <li className="pt-3 border-t border-surface-border mt-2">
              <ConnectButton
                className="!flex !items-center !justify-center !overflow-hidden !rounded !lg !h-10 !px-6 !bg-[#f4d125] !text-[#020617] !text-sm !font-bold !uppercase !tracking-wider hover:!bg-white !transition-colors !shadow-[0_0_15px_rgba(244,209,37,0.4)]"
              />
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
