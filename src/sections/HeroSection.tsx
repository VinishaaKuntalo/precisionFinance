import { useRef, useEffect } from 'react';
import { AuroraBackground } from '@/lib/effects/AuroraBackground';
import { CreditCard, Shield, TrendingDown, Zap } from 'lucide-react';

export default function HeroSection() {
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const auroraRef = useRef<AuroraBackground | null>(null);

  useEffect(() => {
    if (canvasContainerRef.current && !auroraRef.current) {
      auroraRef.current = new AuroraBackground(canvasContainerRef.current, {
        breathingSpeed: 0.8,
        displacementSpeed: 0.6,
      });
    }
    return () => {
      auroraRef.current?.destroy();
      auroraRef.current = null;
    };
  }, []);

  const scrollToDashboard = () => {
    const el = document.getElementById('dashboard');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      id="hero"
      className="relative w-full min-h-screen flex items-center justify-center overflow-hidden"
    >
      <div
        ref={canvasContainerRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 0,
        }}
      />

      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        <p className="font-mono-data text-xs tracking-[0.15em] text-zinc-500 uppercase mb-6">
          Automated Financial Intelligence
        </p>
        <h1
          className="text-6xl md:text-8xl lg:text-9xl font-bold text-white tracking-tight leading-none mb-6"
          style={{ letterSpacing: '-0.02em' }}
        >
          Track.
          <br />
          Automate.
          <br />
          <span className="text-red-500">Optimize.</span>
        </h1>
        <p className="text-lg md:text-xl text-zinc-400 max-w-lg mx-auto mb-10 leading-relaxed">
          A precise, terminal-like experience for tracking credit balances,
          monitoring payments, and optimizing your cash flow.
        </p>
        <button
          onClick={scrollToDashboard}
          className="bg-red-500 hover:bg-red-600 text-black font-semibold text-sm px-8 py-3 tracking-wide uppercase transition-colors"
          style={{ borderRadius: '4px' }}
        >
          Initialize Dashboard
        </button>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20">
          {[
            { icon: CreditCard, label: '7 Cards Linked', sub: 'Real-time sync' },
            { icon: Shield, label: '256-bit Encryption', sub: 'Bank-level security' },
            { icon: TrendingDown, label: '$12.1K Total', sub: 'Balance tracked' },
            { icon: Zap, label: '3 Due Soon', sub: 'Auto-reminders set' },
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <item.icon className="w-5 h-5 text-red-500" strokeWidth={1.5} />
              <span className="text-white text-sm font-medium">{item.label}</span>
              <span className="text-zinc-600 text-xs font-mono-data">{item.sub}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
