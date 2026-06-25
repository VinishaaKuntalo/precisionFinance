import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { PlaidApi, PlaidEnvironments, Configuration, Products, CountryCode } from 'plaid';
import db from './db.js';
import { authMiddleware, generateToken } from './auth.js';
import type { AuthenticatedRequest } from './auth.js';
import { sendPasswordResetEmail } from './mail.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Plaid client setup
const plaidConfig = new Configuration({
  basePath: PlaidEnvironments[process.env.PLAID_ENV as keyof typeof PlaidEnvironments || 'sandbox'],
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET,
    },
  },
});

const plaidClient = new PlaidApi(plaidConfig);

// ─── Auth ─────────────────────────────────────────────

app.post('/api/auth/register', async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: 'Email and password required' });
    return;
  }

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) {
    res.status(409).json({ error: 'User already exists' });
    return;
  }

  const hash = await bcrypt.hash(password, 10);
  const result = db.prepare('INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)').run(email, hash, name || null);
  const token = generateToken(result.lastInsertRowid as number, email);
  res.json({ token, user: { id: result.lastInsertRowid, email, name } });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }
  const token = generateToken(user.id, user.email);
  res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
});

app.get('/api/auth/me', authMiddleware, (req: AuthenticatedRequest, res) => {
  const user = db.prepare('SELECT id, email, name FROM users WHERE id = ?').get(req.userId!) as any;
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  res.json(user);
});

// ─── Forgot Password ──────────────────────────────────

app.post('/api/auth/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    res.status(400).json({ error: 'Email required' });
    return;
  }

  const user = db.prepare('SELECT id, email, name FROM users WHERE email = ?').get(email) as any;
  if (!user) {
    // Don't reveal whether email exists
    res.json({ message: 'If an account exists, a reset email has been sent.' });
    return;
  }

  // Generate secure token
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 1);

  // Invalidate old tokens
  db.prepare("UPDATE password_reset_tokens SET used = 1 WHERE user_id = ?").run(user.id);

  db.prepare('INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?)').run(
    user.id,
    token,
    expiresAt.toISOString()
  );

  try {
    const result = await sendPasswordResetEmail(user.email, token);
    res.json({
      message: 'If an account exists, a reset email has been sent.',
      ...(result.logged ? { resetUrl: result.resetUrl } : {}),
    });
  } catch (err: any) {
    console.error('Failed to send reset email:', err.message);
    res.status(500).json({ error: 'Failed to send reset email' });
  }
});

app.post('/api/auth/reset-password', async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password || password.length < 6) {
    res.status(400).json({ error: 'Token and password (min 6 chars) required' });
    return;
  }

  const resetToken = db.prepare(
    'SELECT * FROM password_reset_tokens WHERE token = ? AND used = 0 AND expires_at > datetime(\'now\')'
  ).get(token) as any;

  if (!resetToken) {
    res.status(400).json({ error: 'Invalid or expired token' });
    return;
  }

  const hash = await bcrypt.hash(password, 10);
  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hash, resetToken.user_id);
  db.prepare('UPDATE password_reset_tokens SET used = 1 WHERE id = ?').run(resetToken.id);

  res.json({ message: 'Password updated successfully. Please log in.' });
});

// ─── Plaid Link ─────────────────────────────────────

app.post('/api/plaid/link-token', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const tokenResponse = await plaidClient.linkTokenCreate({
      user: { client_user_id: String(req.userId!) },
      client_name: 'Precision Finance',
      products: [Products.Transactions],
      country_codes: [CountryCode.Us, CountryCode.Ca],
      language: 'en',
      redirect_uri: process.env.PLAID_REDIRECT_URI,
    });
    res.json({ link_token: tokenResponse.data.link_token });
  } catch (err: any) {
    console.error('Link token error:', err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to create link token' });
  }
});

app.post('/api/plaid/exchange', authMiddleware, async (req: AuthenticatedRequest, res) => {
  const { public_token } = req.body;
  try {
    const exchangeResponse = await plaidClient.itemPublicTokenExchange({ public_token });
    const accessToken = exchangeResponse.data.access_token;
    const itemId = exchangeResponse.data.item_id;

    // Get institution info
    const itemResponse = await plaidClient.itemGet({ access_token: accessToken });
    const institutionId = itemResponse.data.item.institution_id;
    let institutionName = 'Unknown';
    if (institutionId) {
      try {
        const instResponse = await plaidClient.institutionsGetById({
          institution_id: institutionId,
          country_codes: [CountryCode.Us, CountryCode.Ca],
        });
        institutionName = instResponse.data.institution.name;
      } catch {
        // fallback
      }
    }

    db.prepare(
      'INSERT INTO plaid_items (user_id, item_id, access_token, institution_name, institution_id) VALUES (?, ?, ?, ?, ?)'
    ).run(req.userId!, itemId, accessToken, institutionName, institutionId);

    // Sync accounts immediately
    await syncAccounts(accessToken, req.userId!);

    res.json({ success: true, item_id: itemId, institution_name: institutionName });
  } catch (err: any) {
    console.error('Exchange error:', err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to exchange token' });
  }
});

// ─── Accounts ───────────────────────────────────────

app.get('/api/plaid/accounts', authMiddleware, (req: AuthenticatedRequest, res) => {
  const accounts = db.prepare(`
    SELECT a.*, pi.institution_name
    FROM accounts a
    JOIN plaid_items pi ON a.item_id = pi.id
    WHERE pi.user_id = ? AND a.status = 'active'
    ORDER BY a.created_at DESC
  `).all(req.userId!) as any[];

  res.json(accounts);
});

app.delete('/api/plaid/accounts/:id', authMiddleware, (req: AuthenticatedRequest, res) => {
  const accountId = req.params.id;
  const account = db.prepare(`
    SELECT a.id FROM accounts a
    JOIN plaid_items pi ON a.item_id = pi.id
    WHERE a.id = ? AND pi.user_id = ?
  `).get(accountId, req.userId!) as any;

  if (!account) {
    res.status(404).json({ error: 'Account not found' });
    return;
  }

  db.prepare("UPDATE accounts SET status = 'deleted' WHERE id = ?").run(accountId);
  db.prepare("UPDATE payment_schedules SET status = 'deleted' WHERE account_id = ?").run(accountId);

  res.json({ success: true, message: 'Account unlinked' });
});

app.get('/api/plaid/analytics', authMiddleware, (req: AuthenticatedRequest, res) => {
  const { range = '30' } = req.query;
  const days = Number(range);
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  const cutoffStr = cutoffDate.toISOString().split('T')[0];

  const accounts = db.prepare(`
    SELECT a.*, pi.institution_name
    FROM accounts a
    JOIN plaid_items pi ON a.item_id = pi.id
    WHERE pi.user_id = ? AND a.status = 'active'
  `).all(req.userId!) as any[];

  const transactions = db.prepare(`
    SELECT t.*, a.name as account_name, a.type as account_type, a.subtype, a.currency_code
    FROM transactions t
    JOIN accounts a ON t.account_id = a.id
    JOIN plaid_items pi ON a.item_id = pi.id
    WHERE pi.user_id = ? AND t.date >= ? AND t.status IS NOT 'deleted'
    ORDER BY t.date DESC
  `).all(req.userId!, cutoffStr) as any[];

  // Credit cards summary
  const creditCards = accounts.filter((a: any) => a.type === 'credit');
  const creditSummary = creditCards.map((card: any) => ({
    id: card.id,
    name: card.name,
    institution_name: card.institution_name,
    mask: card.mask,
    balance_current: card.balance_current,
    balance_limit: card.balance_limit,
    balance_available: card.balance_available,
    utilization: card.balance_limit > 0 ? (card.balance_current / card.balance_limit) * 100 : 0,
    currency_code: card.currency_code,
  }));

  // Spending by category
  const categoryMap = new Map<string, number>();
  for (const tx of transactions) {
    if (tx.amount > 0 && !tx.pending) {
      const cat = tx.category || 'Uncategorized';
      categoryMap.set(cat, (categoryMap.get(cat) || 0) + tx.amount);
    }
  }
  const spendingByCategory = Array.from(categoryMap.entries())
    .map(([name, value]) => ({ name, value: Number(value.toFixed(2)) }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);

  // Daily spending (last 30 days)
  const dailyMap = new Map<string, number>();
  for (let i = 0; i < days; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dailyMap.set(d.toISOString().split('T')[0], 0);
  }
  for (const tx of transactions) {
    if (tx.amount > 0 && !tx.pending) {
      dailyMap.set(tx.date, (dailyMap.get(tx.date) || 0) + tx.amount);
    }
  }
  const dailySpending = Array.from(dailyMap.entries())
    .map(([date, amount]) => ({ date, amount: Number(amount.toFixed(2)) }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Spending by account
  const accountMap = new Map<number, { name: string; amount: number; type: string }>();
  for (const tx of transactions) {
    if (tx.amount > 0 && !tx.pending) {
      const existing = accountMap.get(tx.account_id);
      if (existing) {
        existing.amount += tx.amount;
      } else {
        accountMap.set(tx.account_id, { name: tx.account_name, amount: tx.amount, type: tx.account_type });
      }
    }
  }
  const spendingByAccount = Array.from(accountMap.entries())
    .map(([_, data]) => ({ name: data.name, amount: Number(data.amount.toFixed(2)), type: data.type }))
    .sort((a, b) => b.amount - a.amount);

  // Total spending
  const totalSpending = transactions
    .filter((tx: any) => tx.amount > 0 && !tx.pending)
    .reduce((sum: number, tx: any) => sum + tx.amount, 0);

  // Total income
  const totalIncome = transactions
    .filter((tx: any) => tx.amount < 0 && !tx.pending)
    .reduce((sum: number, tx: any) => sum + Math.abs(tx.amount), 0);

  res.json({
    creditSummary,
    spendingByCategory,
    dailySpending,
    spendingByAccount,
    totalSpending: Number(totalSpending.toFixed(2)),
    totalIncome: Number(totalIncome.toFixed(2)),
    netFlow: Number((totalIncome - totalSpending).toFixed(2)),
    transactionCount: transactions.length,
  });
});

// ─── Sync ───────────────────────────────────────────

app.post('/api/plaid/sync', authMiddleware, async (req: AuthenticatedRequest, res) => {
  const items = db.prepare('SELECT * FROM plaid_items WHERE user_id = ? AND status = ?').all(req.userId!, 'active') as any[];
  
  const results = [];
  for (const item of items) {
    try {
      await syncAccounts(item.access_token, req.userId!);
      await syncTransactions(item.access_token, item.id, req.userId!);
      results.push({ item_id: item.item_id, status: 'success' });
    } catch (err: any) {
      console.error(`Sync error for item ${item.item_id}:`, err.message);
      results.push({ item_id: item.item_id, status: 'error', error: err.message });
    }
  }

  res.json({ synced: results.length, results });
});

// ─── Helper: sync accounts from Plaid ───────────────

async function syncAccounts(accessToken: string, userId: number) {
  const response = await plaidClient.accountsGet({ access_token: accessToken });
  const accounts = response.data.accounts;
  const itemId = response.data.item.item_id;

  const itemRow = db.prepare('SELECT id FROM plaid_items WHERE item_id = ? AND user_id = ?').get(itemId, userId) as any;
  if (!itemRow) return;

  const itemDbId = itemRow.id;

  const insertStmt = db.prepare(`
    INSERT INTO accounts (item_id, plaid_account_id, name, mask, type, subtype, balance_current, balance_available, balance_limit, currency_code)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(plaid_account_id) DO UPDATE SET
      name = excluded.name,
      mask = excluded.mask,
      type = excluded.type,
      subtype = excluded.subtype,
      balance_current = excluded.balance_current,
      balance_available = excluded.balance_available,
      balance_limit = excluded.balance_limit,
      currency_code = excluded.currency_code,
      updated_at = CURRENT_TIMESTAMP
  `);

  for (const acc of accounts) {
    insertStmt.run(
      itemDbId,
      acc.account_id,
      acc.name,
      acc.mask || null,
      acc.type,
      acc.subtype || null,
      acc.balances.current ?? null,
      acc.balances.available ?? null,
      acc.balances.limit ?? null,
      acc.balances.iso_currency_code || acc.balances.unofficial_currency_code || 'CAD'
    );
  }
}

// ─── Helper: sync transactions from Plaid ───────────

async function syncTransactions(accessToken: string, itemDbId: number, userId: number) {
  const now = new Date();
  const startDate = new Date(now.getFullYear() - 2, now.getMonth(), now.getDate()).toISOString().split('T')[0];
  const endDate = now.toISOString().split('T')[0];

  const response = await plaidClient.transactionsGet({
    access_token: accessToken,
    start_date: startDate,
    end_date: endDate,
    options: { count: 500 },
  });

  const transactions = response.data.transactions;
  const insertStmt = db.prepare(`
    INSERT INTO transactions (account_id, plaid_transaction_id, name, merchant_name, amount, date, category, pending, transaction_type)
    VALUES (
      (SELECT id FROM accounts WHERE plaid_account_id = ?),
      ?, ?, ?, ?, ?, ?, ?, ?
    )
    ON CONFLICT(plaid_transaction_id) DO UPDATE SET
      name = excluded.name,
      merchant_name = excluded.merchant_name,
      amount = excluded.amount,
      date = excluded.date,
      category = excluded.category,
      pending = excluded.pending,
      transaction_type = excluded.transaction_type
  `);

  for (const tx of transactions) {
    insertStmt.run(
      tx.account_id,
      tx.transaction_id,
      tx.name,
      tx.merchant_name || null,
      tx.amount,
      tx.date,
      tx.category?.join(', ') || null,
      tx.pending ? 1 : 0,
      tx.transaction_type || null
    );
  }
}

// ─── Payment Schedules ────────────────────────────────

app.get('/api/payments/schedule', authMiddleware, (req: AuthenticatedRequest, res) => {
  const schedules = db.prepare(`
    SELECT ps.*, a.name as account_name, a.mask, a.type, a.subtype, a.balance_current, a.balance_limit, a.currency_code,
           pi.institution_name
    FROM payment_schedules ps
    JOIN accounts a ON ps.account_id = a.id
    JOIN plaid_items pi ON a.item_id = pi.id
    WHERE ps.user_id = ? AND ps.status = 'active'
    ORDER BY ps.due_day ASC
  `).all(req.userId!) as any[];
  res.json(schedules);
});

app.post('/api/payments/schedule', authMiddleware, (req: AuthenticatedRequest, res) => {
  const { account_id, due_day, minimum_payment, statement_balance, autopay_enabled, reminder_days } = req.body;
  if (!account_id || !due_day) {
    res.status(400).json({ error: 'account_id and due_day are required' });
    return;
  }

  // Verify the account belongs to this user
  const account = db.prepare(`
    SELECT a.id FROM accounts a
    JOIN plaid_items pi ON a.item_id = pi.id
    WHERE a.id = ? AND pi.user_id = ?
  `).get(account_id, req.userId!) as any;

  if (!account) {
    res.status(403).json({ error: 'Account not found or not authorized' });
    return;
  }

  // Remove existing schedule for this account
  db.prepare(`UPDATE payment_schedules SET status = 'replaced' WHERE account_id = ? AND status = 'active'`).run(account_id);

  const result = db.prepare(`
    INSERT INTO payment_schedules (user_id, account_id, due_day, minimum_payment, statement_balance, autopay_enabled, reminder_days)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(req.userId!, account_id, due_day, minimum_payment || 0, statement_balance || 0, autopay_enabled ? 1 : 0, reminder_days || 3);

  res.json({ id: result.lastInsertRowid, success: true });
});

app.put('/api/payments/schedule/:id', authMiddleware, (req: AuthenticatedRequest, res) => {
  const { due_day, minimum_payment, statement_balance, autopay_enabled, reminder_days, status } = req.body;
  const schedule = db.prepare('SELECT * FROM payment_schedules WHERE id = ? AND user_id = ?').get(req.params.id, req.userId!) as any;
  if (!schedule) {
    res.status(404).json({ error: 'Schedule not found' });
    return;
  }

  db.prepare(`
    UPDATE payment_schedules SET
      due_day = COALESCE(?, due_day),
      minimum_payment = COALESCE(?, minimum_payment),
      statement_balance = COALESCE(?, statement_balance),
      autopay_enabled = COALESCE(?, autopay_enabled),
      reminder_days = COALESCE(?, reminder_days),
      status = COALESCE(?, status),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(
    due_day ?? null,
    minimum_payment ?? null,
    statement_balance ?? null,
    autopay_enabled !== undefined ? (autopay_enabled ? 1 : 0) : null,
    reminder_days ?? null,
    status ?? null,
    req.params.id
  );

  res.json({ success: true });
});

app.delete('/api/payments/schedule/:id', authMiddleware, (req: AuthenticatedRequest, res) => {
  const schedule = db.prepare('SELECT * FROM payment_schedules WHERE id = ? AND user_id = ?').get(req.params.id, req.userId!) as any;
  if (!schedule) {
    res.status(404).json({ error: 'Schedule not found' });
    return;
  }
  db.prepare("UPDATE payment_schedules SET status = 'deleted' WHERE id = ?").run(req.params.id);
  res.json({ success: true });
});

app.get('/api/payments/upcoming', authMiddleware, (req: AuthenticatedRequest, res) => {
  const now = new Date();
  const currentDay = now.getDate();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const schedules = db.prepare(`
    SELECT ps.*, a.name as account_name, a.mask, a.type, a.subtype, a.balance_current, a.balance_limit, a.currency_code,
           pi.institution_name
    FROM payment_schedules ps
    JOIN accounts a ON ps.account_id = a.id
    JOIN plaid_items pi ON a.item_id = pi.id
    WHERE ps.user_id = ? AND ps.status = 'active'
  `).all(req.userId!) as any[];

  const upcoming = schedules.map((s) => {
    let dueMonth = currentMonth;
    let dueYear = currentYear;

    if (s.due_day < currentDay) {
      dueMonth++;
      if (dueMonth > 11) {
        dueMonth = 0;
        dueYear++;
      }
    }

    const dueDate = new Date(dueYear, dueMonth, s.due_day);
    const diffTime = dueDate.getTime() - now.getTime();
    const daysUntil = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const isOverdue = daysUntil < 0;
    const isUrgent = daysUntil <= s.reminder_days && daysUntil >= 0;

    const utilization = s.balance_limit > 0 ? (s.balance_current / s.balance_limit) * 100 : 0;

    return {
      ...s,
      dueDate: dueDate.toISOString().split('T')[0],
      daysUntilDue: daysUntil,
      isOverdue,
      isUrgent,
      utilizationRate: utilization,
    };
  }).sort((a, b) => a.daysUntilDue - b.daysUntilDue);

  res.json(upcoming);
});

// ─── Start server ───────────────────────────────────

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Precision Finance server running on port ${PORT}`);
  console.log(`Environment: ${process.env.PLAID_ENV || 'sandbox'}`);
});
