const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

function getToken() {
  return localStorage.getItem('pf_token');
}

async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken() || ''}`,
      ...options.headers,
    },
  });

  if (res.status === 401) {
    localStorage.removeItem('pf_token');
    window.location.reload();
    throw new Error('Unauthorized');
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `HTTP ${res.status}`);
  }

  return res.json();
}

export const authApi = {
  register: (data: { email: string; password: string; name?: string }) =>
    api<{ token: string; user: { id: number; email: string; name: string } }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  login: (data: { email: string; password: string }) =>
    api<{ token: string; user: { id: number; email: string; name: string } }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  me: () => api<{ id: number; email: string; name: string }>('/api/auth/me'),
  forgotPassword: (data: { email: string }) =>
    api<{ message: string; resetUrl?: string }>('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  resetPassword: (data: { token: string; password: string }) =>
    api<{ message: string }>('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

export const plaidApi = {
  createLinkToken: () => api<{ link_token: string }>('/api/plaid/link-token', { method: 'POST' }),
  exchangePublicToken: (public_token: string) =>
    api<{ success: boolean; item_id: string; institution_name: string }>('/api/plaid/exchange', {
      method: 'POST',
      body: JSON.stringify({ public_token }),
    }),
  getAccounts: () =>
    api<
      Array<{
        id: number;
        plaid_account_id: string;
        name: string;
        mask: string;
        type: string;
        subtype: string;
        balance_current: number;
        balance_available: number;
        balance_limit: number;
        currency_code: string;
        institution_name: string;
      }>
    >('/api/plaid/accounts'),
  deleteAccount: (id: number) =>
    api<{ success: boolean; message: string }>(`/api/plaid/accounts/${id}`, { method: 'DELETE' }),
  getTransactions: (accountId?: number, limit = 50) =>
    api<
      Array<{
        id: number;
        plaid_transaction_id: string;
        name: string;
        merchant_name: string;
        amount: number;
        date: string;
        category: string;
        pending: number;
        account_name: string;
        account_type: string;
      }>
    >(`/api/plaid/transactions?${accountId ? `account_id=${accountId}&` : ''}limit=${limit}`),
  getAnalytics: (range = 30) =>
    api<{
      creditSummary: Array<{
        id: number;
        name: string;
        institution_name: string;
        mask: string;
        balance_current: number;
        balance_limit: number;
        balance_available: number;
        utilization: number;
        currency_code: string;
      }>;
      spendingByCategory: Array<{ name: string; value: number }>;
      dailySpending: Array<{ date: string; amount: number }>;
      spendingByAccount: Array<{ name: string; amount: number; type: string }>;
      totalSpending: number;
      totalIncome: number;
      netFlow: number;
      transactionCount: number;
    }>('/api/plaid/analytics?range=' + range),
  sync: () => api<{ synced: number; results: any[] }>('/api/plaid/sync', { method: 'POST' }),
};

export const paymentsApi = {
  getSchedules: () =>
    api<
      Array<{
        id: number;
        account_id: number;
        due_day: number;
        minimum_payment: number;
        statement_balance: number;
        autopay_enabled: number;
        reminder_days: number;
        account_name: string;
        institution_name: string;
        mask: string;
        type: string;
        subtype: string;
        balance_current: number;
        balance_limit: number;
        currency_code: string;
      }>
    >('/api/payments/schedule'),
  createSchedule: (data: {
    account_id: number;
    due_day: number;
    minimum_payment?: number;
    statement_balance?: number;
    autopay_enabled?: boolean;
    reminder_days?: number;
  }) =>
    api<{ id: number; success: boolean }>('/api/payments/schedule', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateSchedule: (id: number, data: Partial<{
    due_day: number;
    minimum_payment: number;
    statement_balance: number;
    autopay_enabled: boolean;
    reminder_days: number;
    status: string;
  }>) =>
    api<{ success: boolean }>(`/api/payments/schedule/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteSchedule: (id: number) =>
    api<{ success: boolean }>(`/api/payments/schedule/${id}`, { method: 'DELETE' }),
  getUpcoming: () =>
    api<
      Array<{
        id: number;
        account_id: number;
        due_day: number;
        minimum_payment: number;
        statement_balance: number;
        autopay_enabled: number;
        reminder_days: number;
        account_name: string;
        institution_name: string;
        mask: string;
        type: string;
        balance_current: number;
        balance_limit: number;
        currency_code: string;
        dueDate: string;
        daysUntilDue: number;
        isOverdue: boolean;
        isUrgent: boolean;
        utilizationRate: number;
      }>
    >('/api/payments/upcoming'),
};
