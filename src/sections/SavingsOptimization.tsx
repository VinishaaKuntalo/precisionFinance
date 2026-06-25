import { useRef, useEffect, useState } from 'react';
import { ParticleFlow } from '@/lib/effects/ParticleFlow';
import { savingsGoals } from '@/lib/data';
import { plaidApi } from '@/services/api';
import {
  Target,
  TrendingDown,
  Award,
  PiggyBank,
  Sparkles,
  Flame,
  Zap,
} from 'lucide-react';

function formatCurrency(amount: number, currency = 'CAD') {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(amount);
}

function PayoffCelebration({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
      <div className="text-center animate-in fade-in zoom-in duration-700">
        <div className="relative">
          <Sparkles className="w-20 h-20 text-red-500 mx-auto mb-4 animate-pulse" />
          <div
            className="absolute inset-0 blur-3xl opacity-50"
            style={{ background: 'radial-gradient(circle, rgba(239,68,68,0.4) 0%, transparent 70%)' }}
          />
        </div>
        <h2 className="text-5xl md:text-7xl font-bold text-white mb-2 tracking-tight">
          DEBT FREE!
        </h2>
        <p className="text-xl text-zinc-400 font-mono-data">
          You have officially paid off all credit card balances
        </p>
        <div className="flex items-center justify-center gap-4 mt-6">
          <div className="flex items-center gap-2 text-red-400">
            <Flame className="w-5 h-5" />
            <span className="text-sm font-medium">$0.00 remaining</span>
          </div>
          <div className="flex items-center gap-2 text-green-400">
            <Award className="w-5 h-5" />
            <span className="text-sm font-medium">100% complete</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SavingsOptimization() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particleRef = useRef<ParticleFlow | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [totalBalance, setTotalBalance] = useState(0);
  const [creditLimit, setCreditLimit] = useState(0);
  const [accountCount, setAccountCount] = useState(0);

  useEffect(() => {
    if (canvasRef.current && !particleRef.current) {
      particleRef.current = new ParticleFlow(canvasRef.current, {
        particleCount: 120,
        baseSpeed: 1.2,
        trailLength: 0.15,
        colors: ['#ef4444', '#f97316', '#dc2626', '#991b1b'],
        particleSize: 2,
      });
    }
    return () => {
      particleRef.current?.destroy();
      particleRef.current = null;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const accounts = await plaidApi.getAccounts();
        if (cancelled) return;
        const creditCards = accounts.filter((a) => a.type === 'credit');
        const balance = creditCards.reduce((sum, a) => sum + (a.balance_current || 0), 0);
        const limit = creditCards.reduce((sum, a) => sum + (a.balance_limit || 0), 0);
        setTotalBalance(balance);
        setCreditLimit(limit);
        setAccountCount(accounts.length);
      } catch {
        // fallback to demo data if API fails
        setTotalBalance(12112);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const handleSimulatePayoff = () => {
    setShowCelebration(true);
    setTimeout(() => {
      setShowCelebration(false);
    }, 5000);
  };

  const utilization = creditLimit > 0 ? (totalBalance / creditLimit) * 100 : 0;
  const healthScore = utilization < 30 ? 'Excellent' : utilization < 50 ? 'Good' : utilization < 70 ? 'Fair' : 'Poor';
  const healthScoreNum = Math.max(300, Math.min(850, 850 - (utilization * 5)));

  return (
    <section
      id="optimization"
      ref={sectionRef}
      className="relative w-full min-h-[900px] overflow-hidden"
      style={{ background: '#000' }}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 1,
        }}
      />

      <PayoffCelebration visible={showCelebration} />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-32">
        <div className="text-center mb-16">
          <p className="font-mono-data text-xs tracking-[0.15em] text-zinc-600 uppercase mb-4">
            Savings Optimization
          </p>
          <h2 className="text-4xl md:text-5xl font-semibold text-white mb-4" style={{ letterSpacing: '-0.01em' }}>
            Visualize Your Freedom
          </h2>
          <p className="text-zinc-400 max-w-md mx-auto">
            Every payment brings you closer. Watch your debt shrink and your savings grow
            in real-time.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Efficiency Metrics */}
          <div className="space-y-4">
            <DashboardCard
              title="Projected Savings"
              value={formatCurrency(totalBalance * 0.2)}
              subtitle="Estimated annual interest saved"
              icon={PiggyBank}
              trend="up"
            />
            <DashboardCard
              title="Utilization"
              value={`${utilization.toFixed(1)}%`}
              subtitle="Credit utilization rate"
              icon={Zap}
              trend="up"
            />
          </div>

          {/* Center - Payoff Progress */}
          <div className="bg-[#121212]/60 border border-white/10 p-6" style={{ borderRadius: '4px', backdropFilter: 'blur(12px)' }}>
            <div className="flex items-center gap-2 mb-6">
              <Target className="w-4 h-4 text-red-500" strokeWidth={1.5} />
              <span className="text-zinc-500 text-xs font-mono-data uppercase">Debt Payoff Progress</span>
            </div>

            <div className="text-center mb-8">
              <p className="text-5xl font-bold text-white mb-1">{formatCurrency(totalBalance)}</p>
              <p className="text-zinc-500 text-xs font-mono-data">
                {accountCount > 0 ? `remaining across ${accountCount} accounts` : 'remaining across all cards'}
              </p>
            </div>

            <div className="space-y-5">
              {savingsGoals.map((goal) => {
                const pct = (goal.current / goal.target) * 100;
                return (
                  <div key={goal.id}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white text-sm">{goal.name}</span>
                      <span className="text-zinc-500 text-xs font-mono-data">
                        {formatCurrency(goal.current)} / {formatCurrency(goal.target)}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-white/5 overflow-hidden" style={{ borderRadius: '2px' }}>
                      <div
                        className="h-full bg-red-500 transition-all duration-1000"
                        style={{
                          width: `${Math.min(pct, 100)}%`,
                          borderRadius: '2px',
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-zinc-600 text-xs">{pct.toFixed(0)}% complete</span>
                      <span className="text-zinc-600 text-xs font-mono-data">Due {goal.dueDate}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={handleSimulatePayoff}
              className="w-full mt-8 bg-red-500 hover:bg-red-600 text-black font-semibold text-sm py-3 transition-colors"
              style={{ borderRadius: '4px' }}
            >
              Simulate Full Payoff
            </button>
          </div>

          {/* Right Panel - Velocity */}
          <div className="space-y-4">
            <DashboardCard
              title="Payment Velocity"
              value={totalBalance > 0 ? '1.5x' : 'N/A'}
              subtitle="Faster than minimum payments"
              icon={TrendingDown}
              trend="up"
            />
            <DashboardCard
              title="Credit Health"
              value={healthScore}
              subtitle={`${healthScoreNum.toFixed(0)} estimated score`}
              icon={Award}
              trend="neutral"
            />
          </div>
        </div>

        {/* Quick Tips */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              title: 'Pay Highest APR First',
              desc: accountCount > 0
                ? `Focus on paying down high-interest cards first to minimize total interest paid.`
                : 'CIBC Aventura at 20.99% APR is costing you $78/mo in interest. Prioritize this card.',
              action: 'View Strategy',
            },
            {
              title: 'Consolidate Spending',
              desc: accountCount > 0
                ? 'Use low-APR cards for purchases while paying down higher-interest balances.'
                : 'Move purchases to your Neo card (0% APR) to avoid interest charges while paying down other cards.',
              action: 'Optimize Now',
            },
            {
              title: 'Round-Up Savings',
              desc: 'Enable round-up on all transactions. Estimated extra $45/month toward your payoff goal.',
              action: 'Enable',
            },
          ].map((tip, i) => (
            <div
              key={i}
              className="bg-[#121212]/60 border border-white/10 p-5 hover:border-red-500/30 transition-colors"
              style={{ borderRadius: '4px', backdropFilter: 'blur(12px)' }}
            >
              <h4 className="text-white text-sm font-medium mb-2">{tip.title}</h4>
              <p className="text-zinc-500 text-xs leading-relaxed mb-3">{tip.desc}</p>
              <button className="text-red-500 text-xs font-medium hover:text-red-400 transition-colors">
                {tip.action} →
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function DashboardCard({
  title,
  value,
  subtitle,
  icon: Icon,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ElementType;
  trend?: 'up' | 'down' | 'neutral';
}) {
  return (
    <div
      className="bg-[#121212]/60 border border-white/10 p-5"
      style={{ borderRadius: '4px', backdropFilter: 'blur(12px)' }}
    >
      <div className="flex items-center gap-2 mb-4">
        <Icon className="w-4 h-4 text-red-500" strokeWidth={1.5} />
        <span className="text-zinc-500 text-xs font-mono-data uppercase">{title}</span>
      </div>
      <p className="text-white text-2xl font-bold mb-1">{value}</p>
      <p className="text-zinc-600 text-xs">{subtitle}</p>
    </div>
  );
}
