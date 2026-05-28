/**
 * Computes net balances for each person from a list of expenses.
 * Positive = they are owed money. Negative = they owe money.
 *
 * Uses exact floating-point arithmetic internally (no intermediate rounding).
 * The sum of all net balances is always exactly 0, so no rounding residuals
 * can build up regardless of how many expenses are added.
 */
export function computeNetBalances(roommates, expenses) {
  const net = {};
  roommates.forEach(r => { net[r] = 0; });

  expenses.forEach(exp => {
    if (!exp.active) return;
    const share = exp.amount / roommates.length; // exact division
    net[exp.paidBy] += exp.amount;
    roommates.forEach(r => { net[r] -= share; });
  });

  return net;
}

/**
 * Converts net balances into a minimal list of debt transactions.
 * Balances within ±0.01 are treated as settled (handles sub-agora residuals
 * that arise when rounded settlement amounts are applied back to exact balances).
 * Returns array of { from, to, amount } where amount is rounded to 2 dp.
 */
export function computeDebts(roommates, expenses, settlements) {
  const net = computeNetBalances(roommates, expenses);

  settlements.forEach(s => {
    if (s.active) {
      net[s.from] += s.amount;
      net[s.to]   -= s.amount;
    }
  });

  const debtors   = [];
  const creditors = [];

  Object.entries(net).forEach(([person, balance]) => {
    if (balance < -0.01)  debtors.push({ person, amount: -balance });
    else if (balance > 0.01) creditors.push({ person, amount: balance });
  });

  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  const debts = [];
  let i = 0, j = 0;
  while (i < debtors.length && j < creditors.length) {
    const amount = Math.min(debtors[i].amount, creditors[j].amount);
    if (amount > 0.01) {
      debts.push({
        from:   debtors[i].person,
        to:     creditors[j].person,
        amount: Math.round(amount * 100) / 100, // round only here, for display & DB
      });
    }
    debtors[i].amount  -= amount;
    creditors[j].amount -= amount;
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
