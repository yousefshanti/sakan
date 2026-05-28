import { useState } from 'react';
import { BarChart2 } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell
} from 'recharts';
import { CATEGORIES, formatCurrency, getCurrentMonth } from '../utils/balances';

const COLORS = ['#0d9488','#0891b2','#7c3aed','#d97706','#dc2626','#059669'];

export default function Reports({ roommates, expenses }) {
  const [scope, setScope] = useState('month');
  const currentMonth = getCurrentMonth();

  const activeExpenses = expenses.filter(e => e.active);
  const scoped = scope === 'month'
    ? activeExpenses.filter(e => e.date && e.date.startsWith(currentMonth))
    : activeExpenses;

  // Per category
  const byCat = CATEGORIES.map((cat, i) => {
    const total = scoped.filter(e => e.category === cat.value).reduce((s, e) => s + e.amount, 0);
    return { name: `${cat.emoji} ${cat.value}`, value: total, color: COLORS[i] };
  }).filter(c => c.value > 0).sort((a, b) => b.value - a.value);

  // Per person
  const byPerson = roommates.map(r => ({
    name: r,
    paid: scoped.filter(e => e.paidBy === r).reduce((s, e) => s + e.amount, 0),
  }));

  const total = scoped.reduce((s, e) => s + e.amount, 0);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload?.length) {
      return (
        <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-3 py-2 text-sm">
          <p className="font-bold text-gray-800">{formatCurrency(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-4 max-w-lg mx-auto space-y-4 lg:max-w-none lg:p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-teal-800 flex items-center gap-2">
          <BarChart2 className="w-6 h-6" />
          التقارير
        </h2>
        <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
          {[['month', 'هذا الشهر'], ['all', 'الكل']].map(([val, label]) => (
            <button
              key={val}
              onClick={() => setScope(val)}
              className={`px-3 py-1.5 rounded-lg text-sm font-bold ${
                scope === val ? 'bg-white text-teal-700 shadow-sm' : 'text-gray-500'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Total */}
      <div className="bg-teal-600 text-white rounded-2xl p-4 text-center">
        <p className="text-sm opacity-80">إجمالي المصاريف</p>
        <p className="text-3xl font-extrabold mt-1">{formatCurrency(total)}</p>
        <p className="text-sm opacity-80 mt-1">{scoped.length} فاتورة</p>
      </div>

      {/* Two-column grid on desktop */}
      <div className="lg:grid lg:grid-cols-2 lg:gap-6 space-y-4 lg:space-y-0">

        {/* By person */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
            <h3 className="font-bold text-gray-700">ما دفعه كل شخص</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {byPerson.map((p, i) => (
              <div key={p.name} className="px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white"
                    style={{ background: COLORS[i % COLORS.length] }}>
                    {p.name.charAt(0)}
                  </div>
                  <span className="font-medium text-gray-800">{p.name}</span>
                </div>
                <div className="text-right">
                  <p className="font-extrabold text-gray-900">{formatCurrency(p.paid)}</p>
                  {total > 0 && (
                    <p className="text-xs text-gray-400">{((p.paid / total) * 100).toFixed(0)}%</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category breakdown list */}
        {byCat.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
              <h3 className="font-bold text-gray-700">تفاصيل الفئات</h3>
            </div>
            <div className="divide-y divide-gray-100">
              {byCat.map((cat, i) => (
                <div key={cat.name} className="px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ background: cat.color }} />
                    <span className="text-gray-700">{cat.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-gray-900">{formatCurrency(cat.value)}</span>
                    {total > 0 && (
                      <span className="text-xs text-gray-400 mr-2">({((cat.value / total) * 100).toFixed(0)}%)</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>{/* end two-column grid */}

      {/* By category chart — full width */}
      {byCat.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <h3 className="font-bold text-gray-700 mb-4">المصاريف حسب الفئة</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={byCat} layout="vertical" margin={{ right: 10, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={v => `${v}₪`} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fontFamily: 'Tajawal' }} width={90} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                {byCat.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {scoped.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <p className="text-4xl mb-2">📊</p>
          <p>لا توجد بيانات لعرضها</p>
        </div>
      )}
    </div>
  );
}
