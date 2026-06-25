import { useState, useCallback } from 'react';

const footerLinks = [
  { label: 'Privacy Policy', href: '#' },
  { label: 'Terms of Service', href: '#' },
  { label: 'Security', href: '#' },
  { label: 'API Documentation', href: '#' },
  { label: 'Support Center', href: '#' },
  { label: 'Contact', href: '#' },
];

function DecodeLink({ label, href }: { label: string; href: string }) {
  const [display, setDisplay] = useState(label);
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const intervalRef = useState<ReturnType<typeof setInterval> | null>(null);

  const shuffle = useCallback(() => {
    let iteration = 0;
    const target = label;

    if (intervalRef[0]) clearInterval(intervalRef[0]);

    const iv = setInterval(() => {
      setDisplay(
        target
          .split('')
          .map((char, index) => {
            if (index < iteration) return target[index];
            if (char === ' ') return ' ';
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join('')
      );

      iteration += 1 / 2;
      if (iteration >= target.length) {
        clearInterval(iv);
        setDisplay(target);
      }
    }, 30);

    intervalRef[1](iv);
  }, [label]);

  return (
    <a
      href={href}
      className="text-zinc-600 hover:text-red-500 transition-colors text-sm font-mono-data block py-1"
      onMouseEnter={() => {
        shuffle();
      }}
      onMouseLeave={() => {
        setDisplay(label);
        if (intervalRef[0]) clearInterval(intervalRef[0]);
      }}
    >
      {display}
    </a>
  );
}

export default function FooterSection() {
  return (
    <footer className="w-full bg-black border-t border-white/5 py-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-8 h-8 bg-red-500 flex items-center justify-center"
                style={{ borderRadius: '4px' }}
              >
                <span className="text-black font-bold text-xs">PF</span>
              </div>
              <span className="text-white font-semibold text-lg tracking-tight">
                Precision Finance
              </span>
            </div>
            <p className="text-zinc-600 text-sm max-w-sm leading-relaxed">
              Automated financial intelligence for the modern Canadian. Track, automate, and
              optimize your credit card portfolio with bank-level security and real-time sync.
            </p>
            <div className="flex items-center gap-4 mt-6">
              <span className="text-zinc-700 text-xs font-mono-data">
                Powered by Plaid API
              </span>
              <span className="text-zinc-800">|</span>
              <span className="text-zinc-700 text-xs font-mono-data">
                256-bit Encryption
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div>
              <p className="text-zinc-700 text-xs font-mono-data uppercase mb-4 tracking-wider">
                Platform
              </p>
              {footerLinks.slice(0, 3).map((link) => (
                <DecodeLink key={link.label} label={link.label} href={link.href} />
              ))}
            </div>
            <div>
              <p className="text-zinc-700 text-xs font-mono-data uppercase mb-4 tracking-wider">
                Support
              </p>
              {footerLinks.slice(3).map((link) => (
                <DecodeLink key={link.label} label={link.label} href={link.href} />
              ))}
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-zinc-700 text-xs font-mono-data">
            &copy; {new Date().getFullYear()} Precision Finance. All rights reserved.
          </p>
          <p className="text-zinc-800 text-xs font-mono-data">
            Data provided for informational purposes only. Not financial advice.
          </p>
        </div>
      </div>
    </footer>
  );
}
