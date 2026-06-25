export interface CreditCard {
  id: string;
  bankName: string;
  cardName: string;
  cardNumber: string;
  balance: number;
  creditLimit: number;
  availableCredit: number;
  dueDate: string;
  minimumPayment: number;
  interestRate: number;
  lastPaymentDate: string;
  lastPaymentAmount: number;
  status: 'active' | 'locked' | 'overdue';
  color: string;
  logo: string;
  transactions: Transaction[];
}

export interface Transaction {
  id: string;
  merchant: string;
  amount: number;
  date: string;
  category: string;
  type: 'purchase' | 'payment' | 'refund' | 'interest';
}

export interface PaymentReminder {
  id: string;
  cardId: string;
  cardName: string;
  bankName: string;
  dueDate: string;
  amount: number;
  isPaid: boolean;
  daysUntilDue: number;
}

export interface DashboardSummary {
  totalBalance: number;
  totalLimit: number;
  totalAvailable: number;
  totalMinimumDue: number;
  upcomingPayments: PaymentReminder[];
  utilizationRate: number;
  monthlySpending: number;
}
