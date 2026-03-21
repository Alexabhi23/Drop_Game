import { Outlet, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Header } from './Header';
import { Footer } from './Footer';
import { UXOverlay } from './UXOverlay';

export function Layout() {
  const location = useLocation();
  const [pageKey, setPageKey] = useState(location.pathname);

  useEffect(() => {
    setPageKey(location.pathname);
  }, [location.pathname]);

  return (
    <div className="antialiased font-display bg-[#020617] text-slate-100 min-h-screen flex flex-col relative">
      <div className="bg-canvas" data-alt="Abstract geometric futuristic dark background"></div>
      <Header />
      <div className="layout-container flex h-full grow flex-col relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <main className="flex-1 flex flex-col gap-12 pt-20 pb-20">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="flex-1 flex flex-col"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
        <Footer />
      </div>
      <div className="relative z-[100]">
        <UXOverlay />
      </div>
    </div>
  );
}
