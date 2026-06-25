import type { CreditCard, PaymentReminder, DashboardSummary } from '@/types/credit';

const today = new Date();
const formatDate = (daysOffset: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() + daysOffset);
  return d.toISOString().split('T')[0];
};

export const creditCards: CreditCard[] = [
  {
    id: 'amex-1',
    bankName: 'American Express',
    cardName: 'Cobalt Card',
    cardNumber: '**** 3456',
    balance: 2340.50,
    creditLimit: 10000,
    availableCredit: 7659.50,
    dueDate: formatDate(5),
    minimumPayment: 117.03,
    interestRate: 20.99,
    lastPaymentDate: formatDate(-25),
    lastPaymentAmount: 1500.00,
    status: 'active',
    color: '#016FD0',
    logo: 'AMEX',
    transactions: [
      { id: 't1', merchant: 'Whole Foods Market', amount: 142.35, date: formatDate(-1), category: 'Groceries', type: 'purchase' },
      { id: 't2', merchant: 'Shell Gas Station', amount: 68.50, date: formatDate(-2), category: 'Transportation', type: 'purchase' },
      { id: 't3', merchant: 'Netflix', amount: 16.99, date: formatDate(-3), category: 'Entertainment', type: 'purchase' },
      { id: 't4', merchant: 'Uber Eats', amount: 34.22, date: formatDate(-4), category: 'Dining', type: 'purchase' },
    ],
  },
  {
    id: 'rogers-1',
    bankName: 'Rogers Bank',
    cardName: 'World Elite Mastercard',
    cardNumber: '**** 7891',
    balance: 890.25,
    creditLimit: 15000,
    availableCredit: 14109.75,
    dueDate: formatDate(12),
    minimumPayment: 44.51,
    interestRate: 19.99,
    lastPaymentDate: formatDate(-18),
    lastPaymentAmount: 1200.00,
    status: 'active',
    color: '#E31837',
    logo: 'RB',
    transactions: [
      { id: 't5', merchant: 'Rogers Wireless', amount: 85.00, date: formatDate(-1), category: 'Telecom', type: 'purchase' },
      { id: 't6', merchant: 'LCBO', amount: 47.80, date: formatDate(-3), category: 'Dining', type: 'purchase' },
      { id: 't7', merchant: 'Amazon.ca', amount: 129.99, date: formatDate(-5), category: 'Shopping', type: 'purchase' },
    ],
  },
  {
    id: 'cibc-1',
    bankName: 'CIBC',
    cardName: 'Aventura Visa Infinite',
    cardNumber: '**** 4523',
    balance: 4567.80,
    creditLimit: 20000,
    availableCredit: 15432.20,
    dueDate: formatDate(-2),
    minimumPayment: 228.39,
    interestRate: 20.99,
    lastPaymentDate: formatDate(-30),
    lastPaymentAmount: 800.00,
    status: 'overdue',
    color: '#C41F3E',
    logo: 'CIBC',
    transactions: [
      { id: 't8', merchant: 'Best Buy', amount: 899.99, date: formatDate(-1), category: 'Electronics', type: 'purchase' },
      { id: 't9', merchant: 'Canadian Tire', amount: 156.45, date: formatDate(-4), category: 'Home', type: 'purchase' },
      { id: 't10', merchant: 'Tim Hortons', amount: 8.47, date: formatDate(-6), category: 'Dining', type: 'purchase' },
    ],
  },
  {
    id: 'neo-1',
    bankName: 'Neo Financial',
    cardName: 'Neo Mastercard',
    cardNumber: '**** 9087',
    balance: 345.60,
    creditLimit: 5000,
    availableCredit: 4654.40,
    dueDate: formatDate(18),
    minimumPayment: 17.28,
    interestRate: 0,
    lastPaymentDate: formatDate(-10),
    lastPaymentAmount: 200.00,
    status: 'active',
    color: '#00D632',
    logo: 'NEO',
    transactions: [
      { id: 't11', merchant: 'Grocery Gateway', amount: 87.34, date: formatDate(-1), category: 'Groceries', type: 'purchase' },
      { id: 't12', merchant: 'Pizza Pizza', amount: 24.99, date: formatDate(-5), category: 'Dining', type: 'purchase' },
      { id: 't13', merchant: 'Spotify', amount: 10.99, date: formatDate(-7), category: 'Entertainment', type: 'purchase' },
    ],
  },
  {
    id: 'ws-1',
    bankName: 'Wealthsimple',
    cardName: 'Cash Card',
    cardNumber: '**** 1123',
    balance: 0,
    creditLimit: 5000,
    availableCredit: 5000,
    dueDate: formatDate(22),
    minimumPayment: 0,
    interestRate: 0,
    lastPaymentDate: formatDate(-5),
    lastPaymentAmount: 500.00,
    status: 'active',
    color: '#FFC84D',
    logo: 'WS',
    transactions: [
      { id: 't14', merchant: 'Transfer from Cash', amount: -500.00, date: formatDate(-5), category: 'Transfer', type: 'payment' },
    ],
  },
  {
    id: 'scotia-1',
    bankName: 'Scotiabank',
    cardName: 'Scene+ Visa',
    cardNumber: '**** 6654',
    balance: 1289.45,
    creditLimit: 12000,
    availableCredit: 10710.55,
    dueDate: formatDate(8),
    minimumPayment: 64.47,
    interestRate: 19.99,
    lastPaymentDate: formatDate(-22),
    lastPaymentAmount: 950.00,
    status: 'active',
    color: '#EC111A',
    logo: 'SB',
    transactions: [
      { id: 't15', merchant: 'Cineplex', amount: 42.50, date: formatDate(-1), category: 'Entertainment', type: 'purchase' },
      { id: 't16', merchant: 'Shoppers Drug Mart', amount: 73.20, date: formatDate(-3), category: 'Health', type: 'purchase' },
      { id: 't17', merchant: 'Uber', amount: 18.45, date: formatDate(-6), category: 'Transportation', type: 'purchase' },
    ],
  },
  {
    id: 'nbc-1',
    bankName: 'National Bank',
    cardName: 'World Mastercard',
    cardNumber: '**** 3342',
    balance: 2678.90,
    creditLimit: 18000,
    availableCredit: 15321.10,
    dueDate: formatDate(15),
    minimumPayment: 133.95,
    interestRate: 20.99,
    lastPaymentDate: formatDate(-16),
    lastPaymentAmount: 600.00,
    status: 'active',
    color: '#C8102E',
    logo: 'NBC',
    transactions: [
      { id: 't18', merchant: 'SAQ', amount: 89.75, date: formatDate(-2), category: 'Dining', type: 'purchase' },
      { id: 't19', merchant: 'IKEA', amount: 456.80, date: formatDate(-5), category: 'Home', type: 'purchase' },
      { id: 't20', merchant: 'Jean Coutu', amount: 32.15, date: formatDate(-8), category: 'Health', type: 'purchase' },
    ],
  },
];

export const upcomingPayments: PaymentReminder[] = creditCards
  .filter((card) => card.balance > 0)
  .map((card) => {
    const due = new Date(card.dueDate);
    const diffTime = due.getTime() - today.getTime();
    const daysUntilDue = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return {
      id: `pay-${card.id}`,
      cardId: card.id,
      cardName: card.cardName,
      bankName: card.bankName,
      dueDate: card.dueDate,
      amount: card.balance,
      isPaid: false,
      daysUntilDue,
    };
  })
  .sort((a, b) => a.daysUntilDue - b.daysUntilDue);

export function getDashboardSummary(): DashboardSummary {
  const totalBalance = creditCards.reduce((sum, c) => sum + c.balance, 0);
  const totalLimit = creditCards.reduce((sum, c) => sum + c.creditLimit, 0);
  const totalAvailable = creditCards.reduce((sum, c) => sum + c.availableCredit, 0);
  const totalMinimumDue = creditCards.reduce((sum, c) => sum + c.minimumPayment, 0);
  const monthlySpending = creditCards.reduce(
    (sum, c) =>
      sum +
      c.transactions
        .filter((t) => t.type === 'purchase' && t.amount > 0)
        .reduce((s, t) => s + t.amount, 0),
    0
  );

  return {
    totalBalance,
    totalLimit,
    totalAvailable,
    totalMinimumDue,
    upcomingPayments,
    utilizationRate: totalLimit > 0 ? (totalBalance / totalLimit) * 100 : 0,
    monthlySpending,
  };
}

export const savingsGoals = [
  { id: 'sg1', name: 'Emergency Fund', target: 10000, current: 6200, dueDate: formatDate(180) },
  { id: 'sg2', name: 'Credit Card Payoff', target: 12112, current: 3500, dueDate: formatDate(365) },
  { id: 'sg3', name: 'Vacation Fund', target: 5000, current: 2100, dueDate: formatDate(120) },
];
