import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, ExternalLink } from 'lucide-react';
import { hoverGlow } from '../utils/animations';

export function TransactionPending() {
  const navigate = useNavigate();

  useEffect(() => {
    // Simulate transaction processing
    const timer = setTimeout(() => {
      navigate('/reveal');
    }, 3000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="antialiased font-display bg-background-dark text-slate-100 min-h-screen flex flex-col relative overflow-hidden items-center justify-center">
      <div className="fixed top-0 left-0 w-full h-full z-[-1] bg-cover bg-center transition-all duration-1000" style={{ backgroundImage: `linear-gradient(rgba(2, 6, 23, 0.85), rgba(2, 6, 23, 0.95)), url(https://lh3.googleusercontent.com/aida-public/AB6AXuC0yfqxq4uqCtXxIa86kV3UnqzFTbRnw3dmawmDEXYxqU0J3Yri1o9U6MB1SF26lXi73_5BwhJfBFT0oZVe5VhUuBObs62WdE4coy5r32SRyEzvErUZwkLr-e9roRyRPuJ5WJWHmpIClThj6v60-GeYoEn8Q9iFiKcUwW-o54zqdEoPsq02kbW4OvYAfXPYi5XvhvO9O8fEpSVsYC10MUjzTJCdE2tI8BPXggDVHII-bKl5W45YeaAsu7jkl8gJKCEGDZt0KN242Q)` }}></div>
      <div className="fixed top-0 left-0 right-0 bottom-0 z-[-1] opacity-30" style={{ backgroundImage: 'linear-gradient(0deg, transparent 24%, rgba(244, 209, 37, 0.05) 25%, rgba(244, 209, 37, 0.05) 26%, transparent 27%, transparent 74%, rgba(244, 209, 37, 0.05) 75%, rgba(244, 209, 37, 0.05) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(244, 209, 37, 0.05) 25%, rgba(244, 209, 37, 0.05) 26%, transparent 27%, transparent 74%, rgba(244, 209, 37, 0.05) 75%, rgba(244, 209, 37, 0.05) 76%, transparent 77%, transparent)', backgroundSize: '50px 50px' }}></div>
      
      <main className="relative z-10 flex flex-col items-center justify-center text-center px-4 w-full">
        <div className="relative flex items-center justify-center mb-16 mt-8">
          <div className="w-[200px] h-[200px] rounded-full border-2 border-primary/30 relative shadow-[0_0_40px_rgba(244,209,37,0.2),inset_0_0_40px_rgba(244,209,37,0.2)] animate-[pulse-glow_3s_infinite_alternate]">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80px] h-[120px] bg-gradient-to-br from-sky-400/80 to-sky-700/90 rounded-[50%_50%_50%_50%/60%_60%_40%_40%] shadow-[inset_-10px_-10px_20px_rgba(0,0,0,0.5),inset_10px_10px_20px_rgba(255,255,255,0.4),0_0_30px_rgba(56,189,248,0.4)] border border-white/30 backdrop-blur-sm"></div>
          </div>
          <div className="absolute -top-5 -left-5 -right-5 -bottom-5 rounded-full border-4 border-primary/10 border-t-primary border-r-primary/50 animate-[spin_2s_linear_infinite]"></div>
        </div>
        
        <div className="flex flex-col items-center gap-4">
          <h1 className="text-primary text-3xl md:text-4xl font-black uppercase tracking-[0.2em] mb-2 animate-pulse" style={{ textShadow: '0 0 10px rgba(244, 209, 37, 0.8)' }}>
            Decrypting Data...
          </h1>
          <p className="text-slate-400 font-mono text-sm uppercase tracking-widest flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-primary animate-spin" />
            Awaiting Blockchain Confirmation
          </p>
          
          <div className="mt-4 flex gap-2">
            <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0s' }}></span>
            <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
            <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
          </div>
        </div>
        
        <div className="mt-20 absolute bottom-12 animate-slide-in" style={{ animationDelay: '0.5s' }}>
          <a href="#" className="flex items-center gap-2 text-slate-500 hover:text-primary transition-all border border-slate-700/50 hover:border-primary/50 bg-slate-900/50 backdrop-blur-sm px-6 py-3 rounded-full text-xs font-mono uppercase tracking-widest group hover:shadow-[0_0_30px_rgba(244,209,37,0.3)]">
            View on Sui Explorer
            <ExternalLink className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>
      </main>
      
      <div className="fixed top-6 left-6 text-[10px] font-mono text-primary/40 uppercase tracking-widest pointer-events-none">
        SEQ: 894.22.1<br/>
        NODE: ONLINE
      </div>
      
      <div className="fixed bottom-6 right-6 text-[10px] font-mono text-primary/40 uppercase tracking-widest text-right pointer-events-none">
        CYBERLOOT PROTOCOL<br/>
        SECURE CONNECTION ESTABLISHED
      </div>
    </div>
  );
}
