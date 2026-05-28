import { useState } from 'react';
import { Home, RotateCcw, CheckSquare, Square } from 'lucide-react';
import { getCurrentMonth, formatCurrency } from '../utils/balances';

const MONTH_NAMES = [
  'يناير','فبراير','مارس','أبريل','مايو','يونيو',
  'يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'
];

export default function Rent({ roommates, rentData, onUpdateRent }) {
  const currentMonth = getCurrentMonth();
  const [editAmount, setEditAmount] = useState(false);
  const [tempAmount, setTempAmount] = useState('');

  const data = rentData[currentMonth] || { amount: 0, paid: {} };

  const monthLabel = () => {
    const [year, month] = currentMonth.split('-');
    return `${MONTH_NAMES[parseInt(month) - 1]} ${year}`;
  };

  const setAmount = () => {
    const val = Number(tempAmount);
    if (val > 0) {
      onUpdateRent(currentMonth, { ...data, amount: val });
    }
    setEditAmount(false);
  };

  const togglePaid = (name) => {
    const newPaid = { ...data.paid, [name]: !data.paid[name] };
    onUpdateRent(currentMonth, { ...data, paid: newPaid });
  };

  const newMonth = () => {
    onUpdateRent(currentMonth, { amount: data.amount, paid: {} });
  };

  const allPaid = roommates.every(r => data.paid[r]);
  const paidCount = roommates.filter(r => data.paid[r]).length;
  const sharePerPerson = data.amount > 0 ? data.amount / 3 : 0;

  return (
    <div className="p-4 max-w-lg mx-auto space-y-4 lg:max-w-none lg:p-6">
      <h2 className="text-xl font-bold text-teal-800 flex items-center gap-2">
        <Home className="w-6 h-6" />
        الإيجار الشهري
      </h2>

      {/* Month banner */}
      <div className="bg-teal-600 text-white rounded-2xl p-4">
        <p className="text-sm opacity-80 mb-1">شهر</p>
        <p className="text-2xl font-extrabold">{monthLabel()}</p>
        <div className="mt-2 bg-white/20 rounded-full h-2">
          <div
            className="bg-white rounded-full h-2 transition-all duration-500"
            style={{ width: `${(paidCount / 3) * 100}%` }}
          />
        </div>
        <p className="text-sm opacity-80 mt-1">{paidCount}/3 دفعوا</p>
      </div>

      {/* Two-column grid on desktop */}
      <div className="lg:grid lg:grid-cols-2 lg:gap-6 space-y-4 lg:space-y-0">

      {/* Rent amount */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-gray-700">مبلغ الإيجار</h3>
          <button
            onClick={() => { setEditAmount(!editAmount); setTempAmount(data.amount || ''); }}
            className="text-sm text-teal-600 font-medium hover:underline"
          >
            {editAmount ? 'إلغاء' : 'تعديل'}
          </button>
        </div>

        {editAmount ? (
          <div className="flex gap-2">
            <input
              type="number"
              value={tempAmount}
              onChange={(e) => setTempAmount(e.target.value)}
              placeholder="أدخل مبلغ الإيجار"
              className="flex-1 border-2 border-teal-300 rounded-xl px-4 py-2 text-left focus:outline-none focus:border-teal-500"
              autoFocus
            />
            <button
              onClick={setAmount}
              className="bg-teal-600 text-white px-4 py-2 rounded-xl font-bold"
            >
              حفظ
            </button>
          </div>
        ) : (
          <div>
            {data.amount > 0 ? (
              <div className="text-center">
                <p className="text-3xl font-extrabold text-gray-900">{formatCurrency(data.amount)}</p>
                <p className="text-sm text-gray-500 mt-1">
                  حصة كل شخص: <span className="font-bold text-teal-700">{formatCurrency(sharePerPerson)}</span>
                </p>
              </div>
            ) : (
              <p className="text-gray-400 text-center py-2">لم يُحدَّد مبلغ الإيجار بعد</p>
            )}
          </div>
        )}
      </div>

      {/* Payment status */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
          <h3 className="font-bold text-gray-700">حالة الدفع</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {roommates.map(r => {
            const paid = !!data.paid[r];
            return (
              <button
                key={r}
                onClick={() => togglePaid(r)}
                className={`w-full px-4 py-4 flex items-center justify-between text-right hover:bg-gray-50 ${paid ? 'opacity-100' : 'opacity-100'}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                    paid ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {r.charAt(0)}
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-800">{r}</p>
                    <p className={`text-sm ${paid ? 'text-green-600' : 'text-gray-400'}`}>
                      {paid ? '✅ دفع' : '⏳ لم يدفع بعد'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {sharePerPerson > 0 && (
                    <span className={`text-sm font-bold ${paid ? 'text-green-700' : 'text-gray-500'}`}>
                      {formatCurrency(sharePerPerson)}
                    </span>
                  )}
                  {paid
                    ? <CheckSquare className="w-6 h-6 text-green-500" />
                    : <Square className="w-6 h-6 text-gray-300" />
                  }
                </div>
              </button>
            );
          })}
        </div>
      </div>

      </div>{/* end two-column grid */}

      {/* All paid message */}
      {allPaid && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-center">
          <p className="text-2xl mb-1">🎉</p>
          <p className="font-bold text-green-700">جميع الشركاء دفعوا الإيجار هذا الشهر!</p>
        </div>
      )}

      {/* New month button */}
      <button
        onClick={newMonth}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-gray-200 bg-white text-gray-600 font-bold hover:border-teal-300 hover:text-teal-700"
      >
        <RotateCcw className="w-4 h-4" />
        شهر جديد (إعادة ضبط)
      </button>
    </div>
  );
}
