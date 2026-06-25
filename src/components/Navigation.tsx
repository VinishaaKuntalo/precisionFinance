import { useState, useEffect } from 'react';
import { Menu, X, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const navLinks = [
  { label: 'Dashboard', href: '#dashboard' },
  { label: 'Analytics', href: '#analytics' },
  { label: 'Services', href: '#ecosystem' },
  { label: 'Optimization', href: '#optimization' },
];

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (href: string) => {
    setMobileOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-black/80 border-b border-white/10'
          : 'bg-transparent border-b border-transparent'
      }`}
      style={{ backdropFilter: scrolled ? 'blur(12px)' : 'none' }}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-14">
        <a href="#hero" onClick={() => scrollTo('#hero')} className="flex items-center gap-2">
          <div
            className="w-7 h-7 bg-red-500 flex items-center justify-center"
            style={{ borderRadius: '4px' }}
          >
            <span className="text-black font-bold text-[10px]">PF</span>
          </div>
          <span className="text-white font-semibold text-sm tracking-tight">
            Precision Finance
          </span>
        </a>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <button
              key={link.label}
              onClick={() => scrollTo(link.href)}
              className="text-zinc-500 hover:text-white text-xs font-mono-data uppercase tracking-wider transition-colors"
            >
              {link.label}
            </button>
          ))}
          <button
            className="bg-red-500 hover:bg-red-600 text-black text-xs font-semibold px-4 py-1.5 transition-colors"
            style={{ borderRadius: '4px' }}
            onClick={() => scrollTo('#dashboard')}
          >
            Open Dashboard
          </button>
          {user && (
            <button
              onClick={logout}
              className="text-zinc-500 hover:text-red-500 text-xs font-mono-data uppercase tracking-wider transition-colors flex items-center gap-1"
              title="Logout"
            >
              <LogOut className="w-3 h-3" />
              {user.email?.split('@')[0]}
            </button>
          )}
        </div>

        <button
          className="md:hidden text-zinc-400 hover:text-white"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-black/95 border-b border-white/10 px-6 pb-4">
          {navLinks.map((link) => (
            <button
              key={link.label}
              onClick={() => scrollTo(link.href)}
              className="block w-full text-left text-zinc-400 hover:text-white text-sm py-3 border-b border-white/5 transition-colors"
            >
              {link.label}
            </button>
          ))}
          <button
            className="w-full mt-4 bg-red-500 text-black text-sm font-semibold py-2"
            style={{ borderRadius: '4px' }}
            onClick={() => scrollTo('#dashboard')}
          >
            Open Dashboard
          </button>
          {user && (
            <button
              onClick={logout}
              className="w-full mt-2 text-zinc-500 hover:text-red-500 text-sm py-2 border-b border-white/5 transition-colors text-left"
            >
              Logout ({user.email})
            </button>
          )}
        </div>
      )}
    </nav>
  );
}
