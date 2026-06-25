import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function AuthScreen() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register(email, password, name);
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6">
      <div className="w-full max-w-sm bg-[#121212] border border-white/10 p-8" style={{ borderRadius: '4px' }}>
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-red-500 flex items-center justify-center" style={{ borderRadius: '4px' }}>
            <span className="text-black font-bold text-[10px]">PF</span>
          </div>
          <span className="text-white font-semibold text-sm tracking-tight">Precision Finance</span>
        </div>

        <h2 className="text-white text-xl font-semibold mb-1">
          {mode === 'login' ? 'Welcome back' : 'Create account'}
        </h2>
        <p className="text-zinc-500 text-xs mb-6">
          {mode === 'login' ? 'Sign in to your account' : 'Get started with your personal dashboard'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="text-zinc-500 text-xs font-mono-data uppercase mb-1 block">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-black border border-white/10 text-white text-sm px-3 py-2 focus:border-red-500 focus:outline-none transition-colors"
                style={{ borderRadius: '4px' }}
                required
              />
            </div>
          )}
          <div>
            <label className="text-zinc-500 text-xs font-mono-data uppercase mb-1 block">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black border border-white/10 text-white text-sm px-3 py-2 focus:border-red-500 focus:outline-none transition-colors"
              style={{ borderRadius: '4px' }}
              required
            />
          </div>
          <div>
            <label className="text-zinc-500 text-xs font-mono-data uppercase mb-1 block">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black border border-white/10 text-white text-sm px-3 py-2 focus:border-red-500 focus:outline-none transition-colors"
              style={{ borderRadius: '4px' }}
              required
              minLength={6}
            />
          </div>

          {error && <p className="text-red-500 text-xs">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-500 hover:bg-red-600 disabled:opacity-50 text-black font-semibold text-sm py-2.5 transition-colors"
            style={{ borderRadius: '4px' }}
          >
            {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
            className="text-zinc-500 text-xs hover:text-white transition-colors"
          >
            {mode === 'login' ? "Don't have an account? Create one" : 'Already have an account? Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
}
