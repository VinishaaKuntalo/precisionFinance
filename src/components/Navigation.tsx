import { useState, useEffect } from 'react';
import { Menu, X, LogOut, Sun, Moon, Settings, Server } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { getApiUrl, setApiUrl } from '@/services/api';

const navLinks = [
  { label: 'Dashboard', href: '#dashboard' },
  { label: 'Analytics', href: '#analytics' },
  { label: 'Services', href: '#ecosystem' },
  { label: 'Optimization', href: '#optimization' },
];

function SettingsModal({ onClose }: { onClose: () => void }) {
  const [apiUrl, setApiUrlState] = useState(getApiUrl());
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setApiUrl(apiUrl.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <div
        className="bg-[#121212] border border-white/10 w-full max-w-sm p-6"
        style={{ borderRadius: '4px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-white font-semibold text-sm">Settings</h3>
          <button onClick={onClose} className="text-zinc-500 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-zinc-500 text-xs font-mono-data uppercase mb-1.5 flex items-center gap-1.5">
              <Server className="w-3 h-3" />
              API URL
            </label>
            <input
              type="text"
              value={apiUrl}
              onChange={(e) => setApiUrlState(e.target.value)}
              className="w-full bg-black border border-white/10 text-white text-sm px-3 py-2 focus:border-red-500 focus:outline-none"
              style={{ borderRadius: '4px' }}
            />
            <p className="text-zinc-600 text-xs mt-1.5">
              Backend server URL. Default: http://localhost:3001
            </p>
          </div>

          <button
            onClick={handleSave}
            className="w-full bg-red-500 hover:bg-red-600 text-black font-semibold text-sm py-2.5 transition-colors"
            style={{ borderRadius: '4px' }}
          >
            {saved ? 'Saved! Reloading...' : 'Save & Reload'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

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

  const isDark = theme === 'dark';

  return (
    <>
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

          <div className="hidden md:flex items-center gap-6">
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

            <button
              onClick={toggleTheme}
              className="text-zinc-500 hover:text-white p-1.5 transition-colors"
              title={isDark ? 'Switch to light' : 'Switch to dark'}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              onClick={() => setSettingsOpen(true)}
              className="text-zinc-500 hover:text-white p-1.5 transition-colors"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
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
            <div className="flex items-center gap-4 mt-4">
              <button
                onClick={toggleTheme}
                className="text-zinc-500 hover:text-white text-sm flex items-center gap-2"
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                {isDark ? 'Light Mode' : 'Dark Mode'}
              </button>
              <button
                onClick={() => { setSettingsOpen(true); setMobileOpen(false); }}
                className="text-zinc-500 hover:text-white text-sm flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                Settings
              </button>
            </div>
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

      {settingsOpen && <SettingsModal onClose={() => setSettingsOpen(false)} />}
    </>
  );
}
