import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { UXOverlay } from './UXOverlay';

export function Layout() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="antialiased font-display bg-[#020617] text-slate-100 min-h-screen flex flex-col relative">
      <div className="bg-canvas" data-alt="Abstract geometric futuristic dark background"></div>
      <Header />
      <div className="layout-container flex h-full grow flex-col relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <main className="flex-1 flex flex-col gap-12 pt-20 pb-20">
          <div className="flex-1 flex flex-col w-full">
            <Outlet />
          </div>
        </main>
        <Footer />
      </div>
      <div className="relative z-[100]">
        <UXOverlay />
      </div>
    </div>
  );
}
