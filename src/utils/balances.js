/**
 * Computes net balances for each person from a list of expenses.
 * Positive = they are owed money, Negative = they owe money.
 */
export function computeNetBalances(roommates, expenses) {
  const net = {};
  roommates.forEach(r => { net[r] = 0; });

  expenses.forEach(exp => {
    if (!exp.active) return;
    const share = exp.amount / 3;
    // payer gets credit for the full amount
    net[exp.paidBy] = (net[exp.paidBy] || 0) + exp.amount;
    // every roommate owes their share
    roommates.forEach(r => {
      net[r] = (net[r] || 0) - share;
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

  // Apply settlements
  settlements.forEach(s => {
    if (s.active) {
      net[s.from] = (net[s.from] || 0) + s.amount;
      net[s.to] = (net[s.to] || 0) - s.amount;
    }
  });

  const debtors = [];
  const creditors = [];

  Object.entries(net).forEach(([person, balance]) => {
    if (balance < -0.005) debtors.push({ person, amount: -balance });
    else if (balance > 0.005) creditors.push({ person, amount: balance });
  });

  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  const debts = [];
  let i = 0, j = 0;
  while (i < debtors.length && j < creditors.length) {
    const amount = Math.min(debtors[i].amount, creditors[j].amount);
    if (amount > 0.005) {
      debts.push({ from: debtors[i].person, to: creditors[j].person, amount: +amount.toFixed(2) });
    }
    debtors[i].amount -= amount;
    creditors[j].amount -= amount;
    if (debtors[i].amount < 0.005) i++;
    if (creditors[j].amount < 0.005) j++;
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
  { value: 'ماء', emoji: '💧' },
  { value: 'إنترنت', emoji: '🌐' },
  { value: 'بقالة', emoji: '🛒' },
  { value: 'إيجار', emoji: '🏠' },
  { value: 'أخرى', emoji: '📦' },
];
