import { useState } from 'react';
import { Wallet, Copy, CheckCheck, ArrowLeftRight } from 'lucide-react';
import { computeNetBalances, computeDebts, formatCurrency } from '../utils/balances';

export default function Balances({ roommates, expenses, settlements, onSettle, compact = false }) {
  const [copied, setCopied] = useState(false);

  const net    = computeNetBalances(roommates, expenses);
  const debts  = computeDebts(roommates, expenses, settlements);

  const adjustedNet = { ...net };
  settlements.forEach(s => {
    if (s.active) {
      adjustedNet[s.from] = (adjustedNet[s.from] || 0) + s.amount;
      adjustedNet[s.to]   = (adjustedNet[s.to]   || 0) - s.amount;
    }
  });

  const copyToClipboard = () => {
    const lines = ['📊 ملخص مصاريف السكن\n'];
    roommates.forEach(r => {
      const bal  = adjustedNet[r] || 0;
      const sign = bal >= 0 ? '✅' : '🔴';
      lines.push(`${sign} ${r}: ${bal >= 0 ? '+' : ''}${formatCurrency(bal)}`);
    });
    if (debts.length > 0) {
      lines.push('\n💸 المديونيات:');
      debts.forEach(d => {
        lines.push(`${d.from} يدين لـ ${d.to} بـ ${formatCurrency(d.amount)}`);
      });
    } else {
      lines.push('\n✅ الحسابات متساوية، لا يوجد مديونيات!');
    }
    navigator.clipboard.writeText(lines.join('\n')).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const totalSpent = expenses.filter(e => e.active).reduce((s, e) => s + e.amount, 0);

  // ── Compact variant (used inside the desktop two-column add-expense panel) ─
  if (compact) {
    return (
      <div className="p-4 space-y-3">
        <h2 className="text-base font-bold text-teal-800 flex items-center gap-2">
          <Wallet className="w-5 h-5" />
          الأرصدة الحالية
        </h2>

        {/* Total */}
        <div className="bg-teal-600 text-white rounded-xl p-3 text-center">
          <p className="text-xs opacity-80">إجمالي المصاريف</p>
          <p className="text-2xl font-extrabold mt-0.5">{formatCurrency(totalSpent)}</p>
          <p className="text-xs opacity-80 mt-0.5">حصة كل شخص: {formatCurrency(totalSpent / 3)}</p>
        </div>

        {/* Person cards */}
        <div className="space-y-2">
          {roommates.map(r => {
            const bal   = adjustedNet[r] || 0;
            const isPos = bal >= 0.005;
            const isNeg = bal <= -0.005;
            return (
              <div
                key={r}
                className={`rounded-xl p-3 flex items-center justify-between border ${
                  isPos ? 'bg-green-50 border-green-200' :
                  isNeg ? 'bg-red-50 border-red-200' :
                  'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${
                    isPos ? 'bg-green-200 text-green-800' :
                    isNeg ? 'bg-red-200 text-red-800' :
                    'bg-gray-200 text-gray-700'
                  }`}>
                    {r.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-gray-800">{r}</p>
                    <p className={`text-xs ${isPos ? 'text-green-700' : isNeg ? 'text-red-700' : 'text-gray-500'}`}>
                      {isPos ? 'له مبالغ' : isNeg ? 'عليه مبالغ' : 'صافي'}
                    </p>
                  </div>
                </div>
                <span className={`text-base font-extrabold ${isPos ? 'text-green-700' : isNeg ? 'text-red-700' : 'text-gray-500'}`}>
                  {isPos ? '+' : ''}{formatCurrency(bal)}
                </span>
              </div>
            );
          })}
        </div>

        {/* Debts */}
        {debts.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="bg-orange-50 px-3 py-2 border-b border-orange-100">
              <h3 className="font-bold text-sm text-orange-800 flex items-center gap-2">
                <ArrowLeftRight className="w-4 h-4" />
                المديونيات
              </h3>
            </div>
            <div className="divide-y divide-gray-100">
              {debts.map((d, i) => (
                <div key={i} className="px-3 py-2.5 flex items-center justify-between gap-2">
                  <p className="text-xs text-gray-700 flex-1">
                    <span className="text-red-600 font-bold">{d.from}</span>
                    {' → '}
                    <span className="text-green-600 font-bold">{d.to}</span>
                    {' '}
                    <span className="font-extrabold text-gray-900">{formatCurrency(d.amount)}</span>
                  </p>
                  <button
                    onClick={() => onSettle(d)}
                    className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold px-2.5 py-1.5 rounded-lg flex-shrink-0"
                  >
                    تسوية
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {debts.length === 0 && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center">
            <p className="text-lg mb-0.5">🎉</p>
            <p className="font-bold text-sm text-green-700">الحسابات متساوية!</p>
          </div>
        )}
      </div>
    );
  }

  // ── Full variant ────────────────────────────────────────────────────────────
  return (
    <div className="p-4 md:p-6 max-w-lg mx-auto space-y-4 md:max-w-none">
      <h2 className="text-xl font-bold text-teal-800 flex items-center gap-2">
        <Wallet className="w-6 h-6" />
        الأرصدة الحالية
      </h2>

      {/* Top row: total + person cards */}
      <div className="md:grid md:grid-cols-3 md:gap-6 md:items-start space-y-4 md:space-y-0">

        {/* Total spent */}
        <div className="bg-teal-600 text-white rounded-2xl p-4 text-center md:col-span-1">
          <p className="text-sm opacity-80 mb-1">إجمالي المصاريف</p>
          <p className="text-3xl font-extrabold">{formatCurrency(totalSpent)}</p>
          <p className="text-sm opacity-80 mt-1">حصة كل شخص: {formatCurrency(totalSpent / 3)}</p>
        </div>

        {/* Person cards */}
        <div className="grid gap-3 md:col-span-2 md:grid-cols-3">
          {roommates.map(r => {
            const bal   = adjustedNet[r] || 0;
            const isPos = bal >= 0.005;
            const isNeg = bal <= -0.005;
            return (
              <div
                key={r}
                className={`rounded-2xl p-4 flex items-center justify-between border-2 ${
                  isPos ? 'bg-green-50 border-green-200' :
                  isNeg ? 'bg-red-50 border-red-200' :
                  'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${
                    isPos ? 'bg-green-200 text-green-800' :
                    isNeg ? 'bg-red-200 text-red-800' :
                    'bg-gray-200 text-gray-700'
                  }`}>
                    {r.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">{r}</p>
                    <p className={`text-sm ${isPos ? 'text-green-700' : isNeg ? 'text-red-700' : 'text-gray-500'}`}>
                      {isPos ? 'له مبالغ مستحقة' : isNeg ? 'عليه مبالغ' : 'الحساب صافي'}
                    </p>
                  </div>
                </div>
                <span className={`text-xl font-extrabold ${isPos ? 'text-green-700' : isNeg ? 'text-red-700' : 'text-gray-500'}`}>
                  {isPos ? '+' : ''}{formatCurrency(bal)}
                </span>
              </div>
            );
          })}
        </div>

      </div>

      {/* Debts */}
      {debts.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="bg-orange-50 px-4 py-3 border-b border-orange-100">
            <h3 className="font-bold text-orange-800 flex items-center gap-2">
              <ArrowLeftRight className="w-4 h-4" />
              المديونيات
            </h3>
          </div>
          <div className="divide-y divide-gray-100 md:grid md:grid-cols-2 md:divide-y-0 md:divide-x md:divide-x-reverse">
            {debts.map((d, i) => (
              <div key={i} className="px-4 py-3 flex items-center justify-between border-b border-gray-100 md:border-b-0">
                <div>
                  <p className="font-medium text-gray-800">
                    <span className="text-red-600 font-bold">{d.from}</span>
                    {' يدين لـ '}
                    <span className="text-green-600 font-bold">{d.to}</span>
                    {' بـ '}
                    <span className="font-extrabold text-gray-900">{formatCurrency(d.amount)}</span>
                  </p>
                </div>
                <button
                  onClick={() => onSettle(d)}
                  className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold px-3 py-2 rounded-lg"
                >
                  تسوية
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {debts.length === 0 && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-center">
          <p className="text-2xl mb-1">🎉</p>
          <p className="font-bold text-green-700">الحسابات متساوية!</p>
          <p className="text-sm text-green-600">لا توجد مديونيات حالياً</p>
        </div>
      )}

      {/* Copy button */}
      <button
        onClick={copyToClipboard}
        className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-base border-2 ${
          copied
            ? 'bg-green-50 border-green-400 text-green-700'
            : 'bg-white border-teal-300 text-teal-700 hover:bg-teal-50'
        }`}
      >
        {copied ? <CheckCheck className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
        {copied ? 'تم النسخ!' : 'نسخ الملخص (واتساب)'}
      </button>
    </div>
  );
}
