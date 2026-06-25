import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { authApi } from '@/services/api';
import { Mail, ArrowLeft, Lock, CheckCircle } from 'lucide-react';

type AuthMode = 'login' | 'register' | 'forgot' | 'reset';

export default function AuthScreen() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Check for reset token in URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('reset_token');
    if (token) {
      setResetToken(token);
      setMode('reset');
      // Clean URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(email, password, name);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const res = await authApi.forgotPassword({ email });
      setSuccess(res.message);
      if (res.resetUrl) {
        // Email not configured - show the link
        setSuccess(`${res.message} Use this link: ${res.resetUrl}`);
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const res = await authApi.resetPassword({ token: resetToken, password });
      setSuccess(res.message);
      setTimeout(() => {
        setMode('login');
        setSuccess('');
        setPassword('');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Invalid or expired token');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    setError('');
    setSuccess('');
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

        {/* ─── LOGIN ─── */}
        {mode === 'login' && (
          <>
            <h2 className="text-white text-xl font-semibold mb-1">Welcome back</h2>
            <p className="text-zinc-500 text-xs mb-6">Sign in to your account</p>

            <form onSubmit={handleLogin} className="space-y-4">
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
                {loading ? 'Please wait...' : 'Sign In'}
              </button>
            </form>

            <div className="mt-4 flex items-center justify-between">
              <button
                onClick={() => switchMode('forgot')}
                className="text-zinc-500 text-xs hover:text-red-500 transition-colors"
              >
                Forgot password?
              </button>
            </div>

            <div className="mt-4 text-center">
              <button
                onClick={() => switchMode('register')}
                className="text-zinc-500 text-xs hover:text-white transition-colors"
              >
                Don't have an account? Create one
              </button>
            </div>
          </>
        )}

        {/* ─── REGISTER ─── */}
        {mode === 'register' && (
          <>
            <h2 className="text-white text-xl font-semibold mb-1">Create account</h2>
            <p className="text-zinc-500 text-xs mb-6">Get started with your personal dashboard</p>

            <form onSubmit={handleRegister} className="space-y-4">
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
                {loading ? 'Please wait...' : 'Create Account'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => switchMode('login')}
                className="text-zinc-500 text-xs hover:text-white transition-colors"
              >
                Already have an account? Sign in
              </button>
            </div>
          </>
        )}

        {/* ─── FORGOT PASSWORD ─── */}
        {mode === 'forgot' && (
          <>
            <button
              onClick={() => switchMode('login')}
              className="text-zinc-500 text-xs hover:text-white transition-colors flex items-center gap-1 mb-4"
            >
              <ArrowLeft className="w-3 h-3" /> Back to login
            </button>

            <h2 className="text-white text-xl font-semibold mb-1">Reset password</h2>
            <p className="text-zinc-500 text-xs mb-6">Enter your email to receive a reset link</p>

            <form onSubmit={handleForgot} className="space-y-4">
              <div>
                <label className="text-zinc-500 text-xs font-mono-data uppercase mb-1 block">Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-600 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-black border border-white/10 text-white text-sm pl-9 pr-3 py-2 focus:border-red-500 focus:outline-none transition-colors"
                    style={{ borderRadius: '4px' }}
                    required
                  />
                </div>
              </div>

              {error && <p className="text-red-500 text-xs">{error}</p>}
              {success && (
                <div className="bg-green-500/10 border border-green-500/20 p-3" style={{ borderRadius: '4px' }}>
                  <p className="text-green-400 text-xs flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{success}</span>
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !!success}
                className="w-full bg-red-500 hover:bg-red-600 disabled:opacity-50 text-black font-semibold text-sm py-2.5 transition-colors"
                style={{ borderRadius: '4px' }}
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          </>
        )}

        {/* ─── RESET PASSWORD ─── */}
        {mode === 'reset' && (
          <>
            <button
              onClick={() => switchMode('login')}
              className="text-zinc-500 text-xs hover:text-white transition-colors flex items-center gap-1 mb-4"
            >
              <ArrowLeft className="w-3 h-3" /> Back to login
            </button>

            <h2 className="text-white text-xl font-semibold mb-1">New password</h2>
            <p className="text-zinc-500 text-xs mb-6">Enter your new password below</p>

            <form onSubmit={handleReset} className="space-y-4">
              <div>
                <label className="text-zinc-500 text-xs font-mono-data uppercase mb-1 block">Reset Token</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-600 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={resetToken}
                    onChange={(e) => setResetToken(e.target.value)}
                    className="w-full bg-black border border-white/10 text-white text-sm pl-9 pr-3 py-2 focus:border-red-500 focus:outline-none transition-colors"
                    style={{ borderRadius: '4px' }}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="text-zinc-500 text-xs font-mono-data uppercase mb-1 block">New Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-600 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-black border border-white/10 text-white text-sm pl-9 pr-3 py-2 focus:border-red-500 focus:outline-none transition-colors"
                    style={{ borderRadius: '4px' }}
                    required
                    minLength={6}
                  />
                </div>
              </div>

              {error && <p className="text-red-500 text-xs">{error}</p>}
              {success && (
                <div className="bg-green-500/10 border border-green-500/20 p-3" style={{ borderRadius: '4px' }}>
                  <p className="text-green-400 text-xs flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    {success}
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !!success}
                className="w-full bg-red-500 hover:bg-red-600 disabled:opacity-50 text-black font-semibold text-sm py-2.5 transition-colors"
                style={{ borderRadius: '4px' }}
              >
                {loading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
