import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { UXOverlay } from './UXOverlay';

export function Layout() {
  return (
    <div className="antialiased font-display bg-[#020617] text-slate-100 min-h-screen flex flex-col relative overflow-x-hidden">
      <div className="bg-canvas" data-alt="Abstract geometric futuristic dark background"></div>
      
      <div className="layout-container flex h-full grow flex-col relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Header />
        <main className="flex-1 flex flex-col gap-12 pt-20 pb-20">
          <Outlet />
        </main>
        <Footer />
      </div>
      <div className="relative z-[200]">
        <UXOverlay />
      </div>
    </div>
  );
}
