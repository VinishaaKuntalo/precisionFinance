import { useState, useEffect, useCallback } from 'react';
import { plaidApi } from '@/services/api';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, CartesianGrid,
} from 'recharts';
import {
  CreditCard, TrendingDown, TrendingUp, Wallet, PieChart as PieIcon, Calendar, ArrowUpRight,
} from 'lucide-react';

const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16', '#a855f7'];

function formatCurrency(amount: number, currency = 'CAD') {
  return new Intl.NumberFormat('en-CA', { style: 'currency', currency, minimumFractionDigits: 0 }).format(amount);
}

export default function AnalyticsSection() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState(30);
  const [error, setError] = useState('');

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const data = await plaidApi.getAnalytics(range);
      setAnalytics(data);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  if (error) {
    return (
      <div className="bg-[#121212] border border-white/10 p-8 text-center" style={{ borderRadius: '4px' }}>
        <p className="text-red-400 text-sm">{error}</p>
        <button
          onClick={fetchAnalytics}
          className="mt-3 text-red-500 text-xs font-medium hover:text-red-400 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-[#121212] border border-white/10 p-8 text-center" style={{ borderRadius: '4px' }}>
        <p className="text-zinc-500 text-sm">Loading analytics...</p>
      </div>
    );
  }

  if (!analytics || analytics.transactionCount === 0) {
    return (
      <div className="bg-[#121212] border border-white/10 p-8 text-center" style={{ borderRadius: '4px' }}>
        <p className="text-zinc-500 text-sm">No transaction data yet. Sync your accounts to see analytics.</p>
      </div>
    );
  }

  const hasCreditCards = analytics.creditSummary && analytics.creditSummary.length > 0;

  return (
    <section id="analytics" className="w-full bg-black py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="font-mono-data text-xs tracking-[0.15em] text-zinc-600 uppercase mb-2">Analytics</p>
            <h2 className="text-3xl md:text-4xl font-semibold text-white" style={{ letterSpacing: '-0.01em' }}>
              Spending Insights
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {[7, 30, 90].map((d) => (
              <button
                key={d}
                onClick={() => setRange(d)}
                className={`text-xs font-mono-data px-3 py-1.5 transition-colors ${
                  range === d ? 'bg-red-500 text-black font-semibold' : 'bg-white/5 text-zinc-500 hover:text-white'
                }`}
                style={{ borderRadius: '4px' }}
              >
                {d === 7 ? '7D' : d === 30 ? '30D' : '90D'}
              </button>
            ))}
          </div>
        </div>

        {/* Summary Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
          <div className="bg-[#121212] border border-white/10 p-5" style={{ borderRadius: '4px' }}>
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-red-500" strokeWidth={1.5} />
              <span className="text-zinc-500 text-xs font-mono-data uppercase">Total Spending</span>
            </div>
            <p className="text-white text-2xl font-bold">{formatCurrency(analytics.totalSpending)}</p>
            <p className="text-zinc-600 text-xs font-mono-data mt-1">{analytics.transactionCount} transactions</p>
          </div>
          <div className="bg-[#121212] border border-white/10 p-5" style={{ borderRadius: '4px' }}>
            <div className="flex items-center gap-2 mb-3">
              <TrendingDown className="w-4 h-4 text-green-500" strokeWidth={1.5} />
              <span className="text-zinc-500 text-xs font-mono-data uppercase">Total Income</span>
            </div>
            <p className="text-green-400 text-2xl font-bold">{formatCurrency(analytics.totalIncome)}</p>
            <p className="text-zinc-600 text-xs font-mono-data mt-1">credits received</p>
          </div>
          <div className="bg-[#121212] border border-white/10 p-5" style={{ borderRadius: '4px' }}>
            <div className="flex items-center gap-2 mb-3">
              <Wallet className="w-4 h-4 text-yellow-500" strokeWidth={1.5} />
              <span className="text-zinc-500 text-xs font-mono-data uppercase">Net Flow</span>
            </div>
            <p className={`text-2xl font-bold ${analytics.netFlow >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {formatCurrency(analytics.netFlow)}
            </p>
            <p className="text-zinc-600 text-xs font-mono-data mt-1">income minus spending</p>
          </div>
          <div className="bg-[#121212] border border-white/10 p-5" style={{ borderRadius: '4px' }}>
            <div className="flex items-center gap-2 mb-3">
              <PieIcon className="w-4 h-4 text-blue-500" strokeWidth={1.5} />
              <span className="text-zinc-500 text-xs font-mono-data uppercase">Top Category</span>
            </div>
            <p className="text-white text-xl font-bold truncate">
              {analytics.spendingByCategory?.[0]?.name || 'N/A'}
            </p>
            <p className="text-zinc-600 text-xs font-mono-data mt-1">
              {analytics.spendingByCategory?.[0]?.value
                ? formatCurrency(analytics.spendingByCategory[0].value)
                : '--'}
            </p>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
          {/* Daily Spending Trend */}
          <div className="bg-[#121212] border border-white/10 p-6" style={{ borderRadius: '4px' }}>
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-4 h-4 text-zinc-500" strokeWidth={1.5} />
              <h3 className="text-white text-sm font-semibold">Daily Spending</h3>
            </div>
            <div style={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics.dailySpending}>
                  <defs>
                    <linearGradient id="colorSpending" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: '#52525b', fontSize: 10 }}
                    tickFormatter={(v) => v.slice(5)}
                    axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                  />
                  <YAxis
                    tick={{ fill: '#52525b', fontSize: 10 }}
                    tickFormatter={(v) => `$${v}`}
                    axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#121212', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px' }}
                    labelStyle={{ color: '#a1a1aa' }}
                    formatter={(value: any) => [`$${Number(value).toFixed(2)}`, 'Spent']}
                  />
                  <Area type="monotone" dataKey="amount" stroke="#ef4444" fillOpacity={1} fill="url(#colorSpending)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Spending by Category */}
          <div className="bg-[#121212] border border-white/10 p-6" style={{ borderRadius: '4px' }}>
            <div className="flex items-center gap-2 mb-4">
              <PieIcon className="w-4 h-4 text-zinc-500" strokeWidth={1.5} />
              <h3 className="text-white text-sm font-semibold">Spending by Category</h3>
            </div>
            <div className="flex items-center gap-6">
              <div style={{ height: 280, width: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics.spendingByCategory}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={3}
                      dataKey="value"
                      stroke="none"
                    >
                      {analytics.spendingByCategory.map((_: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#121212', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px' }}
                      formatter={(value: any, name: any) => [`$${Number(value).toFixed(2)}`, name]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-2">
                {analytics.spendingByCategory.slice(0, 5).map((cat: any, i: number) => (
                  <div key={cat.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length], borderRadius: '2px' }} />
                    <span className="text-zinc-400 text-xs flex-1 truncate">{cat.name}</span>
                    <span className="text-white text-xs font-mono-data font-medium">{formatCurrency(cat.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Credit Cards Deep Dive */}
        {hasCreditCards && (
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-6">
              <CreditCard className="w-4 h-4 text-red-500" strokeWidth={1.5} />
              <h3 className="text-xl font-semibold text-white">Credit Card Breakdown</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {analytics.creditSummary.map((card: any) => (
                <div key={card.id} className="bg-[#121212] border border-white/10 p-5" style={{ borderRadius: '4px' }}>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-white text-sm font-medium">{card.institution_name}</p>
                      <p className="text-zinc-600 text-xs font-mono-data">**** {card.mask || '0000'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white text-lg font-bold">{formatCurrency(card.balance_current)}</p>
                      <p className="text-zinc-600 text-xs font-mono-data">balance</p>
                    </div>
                  </div>

                  {/* Utilization Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-zinc-500 font-mono-data">{card.utilization.toFixed(1)}% utilized</span>
                      <span className="text-zinc-500 font-mono-data">
                        {formatCurrency(card.balance_available)} avail
                      </span>
                    </div>
                    <div className="w-full h-2 bg-white/5 overflow-hidden" style={{ borderRadius: '2px' }}>
                      <div
                        className="h-full transition-all"
                        style={{
                          width: `${Math.min(card.utilization, 100)}%`,
                          backgroundColor: card.utilization > 80 ? '#ef4444' : card.utilization > 50 ? '#f97316' : '#22c55e',
                          borderRadius: '2px',
                        }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/5">
                    <div>
                      <p className="text-zinc-500 text-xs font-mono-data uppercase mb-1">Limit</p>
                      <p className="text-white text-sm font-medium">{formatCurrency(card.balance_limit)}</p>
                    </div>
                    <div>
                      <p className="text-zinc-500 text-xs font-mono-data uppercase mb-1">Available</p>
                      <p className="text-green-400 text-sm font-medium">{formatCurrency(card.balance_available)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Spending by Account */}
        <div>
          <div className="flex items-center gap-2 mb-6">
            <ArrowUpRight className="w-4 h-4 text-red-500" strokeWidth={1.5} />
            <h3 className="text-xl font-semibold text-white">Spending by Account</h3>
          </div>
          <div className="bg-[#121212] border border-white/10 p-6" style={{ borderRadius: '4px' }}>
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.spendingByAccount} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis
                    type="number"
                    tick={{ fill: '#52525b', fontSize: 10 }}
                    tickFormatter={(v) => `$${v}`}
                    axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fill: '#a1a1aa', fontSize: 11 }}
                    width={120}
                    axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#121212', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px' }}
                    formatter={(value: any) => [`$${Number(value).toFixed(2)}`, 'Spent']}
                  />
                  <Bar dataKey="amount" fill="#ef4444" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
