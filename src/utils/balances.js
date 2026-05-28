const r2 = (n) => Math.round(n * 100) / 100;

/**
 * Computes net balances for each person from a list of expenses.
 * Positive = they are owed money, Negative = they owe money.
 */
export function computeNetBalances(roommates, expenses) {
  const net = {};
  roommates.forEach(r => { net[r] = 0; });

  expenses.forEach(exp => {
    if (!exp.active) return;
    const n          = roommates.length;
    const share      = r2(exp.amount / n);
    // Payer absorbs the rounding remainder so the sum of all net balances stays 0.
    // e.g. 100/3 → share=33.33, payerShare=33.34, others=33.33 each → total=100 ✓
    const payerShare = r2(exp.amount - (n - 1) * share);

    roommates.forEach(r => {
      if (r === exp.paidBy) {
        net[r] = r2((net[r] || 0) + exp.amount - payerShare);
      } else {
        net[r] = r2((net[r] || 0) - share);
      }
    });
  });

  return net;
}

/**
 * Converts net balances into a minimal list of debt transactions.
 * Returns array of { from, to, amount }
 */
export function computeDebts(roommates, expenses, settlements) {
  const net = computeNetBalances(roommates, expenses);

  settlements.forEach(s => {
    if (s.active) {
      net[s.from] = r2((net[s.from] || 0) + s.amount);
      net[s.to]   = r2((net[s.to]   || 0) - s.amount);
    }
  });

  const debtors   = [];
  const creditors = [];

  Object.entries(net).forEach(([person, balance]) => {
    if (balance < -0.01)  debtors.push({ person, amount: r2(-balance) });
    else if (balance > 0.01) creditors.push({ person, amount: r2(balance) });
  });

  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  const debts = [];
  let i = 0, j = 0;
  while (i < debtors.length && j < creditors.length) {
    const amount = r2(Math.min(debtors[i].amount, creditors[j].amount));
    if (amount > 0.01) {
      debts.push({ from: debtors[i].person, to: creditors[j].person, amount });
    }
    debtors[i].amount  = r2(debtors[i].amount  - amount);
    creditors[j].amount = r2(creditors[j].amount - amount);
    if (debtors[i].amount   <= 0.01) i++;
    if (creditors[j].amount <= 0.01) j++;
  }

  return debts;
}

export function formatCurrency(amount) {
  return `${Number(amount).toFixed(2)} ₪`;
}

export function getCurrentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric' });
}

export const CATEGORIES = [
  { value: 'كهرباء', emoji: '⚡' },
  { value: 'ماء',    emoji: '💧' },
  { value: 'إنترنت', emoji: '🌐' },
  { value: 'بقالة',  emoji: '🛒' },
  { value: 'إيجار',  emoji: '🏠' },
  { value: 'أخرى',   emoji: '📦' },
];
