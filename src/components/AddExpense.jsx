import { useState } from 'react';
import { PlusCircle } from 'lucide-react';
import { CATEGORIES } from '../utils/balances';

export default function AddExpense({ roommates, onAdd }) {
  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({
    paidBy: roommates[0],
    amount: '',
    category: 'بقالة',
    description: '',
    date: today,
  });
  const [saved, setSaved] = useState(false);

  const set = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.amount || Number(form.amount) <= 0) return;
    onAdd({
      id: Date.now().toString(),
      paidBy: form.paidBy,
      amount: Number(form.amount),
      category: form.category,
      description: form.description.trim(),
      date: form.date,
      active: true,
      createdAt: Date.now(),
    });
    setForm({ paidBy: roommates[0], amount: '', category: 'بقالة', description: '', date: today });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-4 md:p-6 max-w-lg mx-auto md:max-w-2xl lg:max-w-xl xl:max-w-2xl">
      <h2 className="text-xl font-bold text-teal-800 mb-4 flex items-center gap-2">
        <PlusCircle className="w-6 h-6" />
        إضافة فاتورة جديدة
      </h2>

      {saved && (
        <div className="bg-teal-50 border border-teal-300 text-teal-800 rounded-xl px-4 py-3 mb-4 text-center font-medium animate-pulse">
          ✅ تم حفظ الفاتورة بنجاح
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">
        {/* Who paid */}
        <div>
          <label className="block text-sm font-bold text-gray-600 mb-2">من دفع؟</label>
          <div className="grid grid-cols-3 gap-2">
            {roommates.map(r => (
              <button
                key={r}
                type="button"
                onClick={() => set('paidBy', r)}
                className={`py-3 rounded-xl font-bold text-sm border-2 ${
                  form.paidBy === r
                    ? 'bg-teal-600 border-teal-600 text-white'
                    : 'bg-white border-gray-200 text-gray-700 hover:border-teal-300'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Amount */}
        <div>
          <label className="block text-sm font-bold text-gray-600 mb-2">المبلغ (₪)</label>
          <input
            type="number"
            value={form.amount}
            onChange={(e) => set('amount', e.target.value)}
            placeholder="0.00"
            min="0.01"
            step="0.01"
            required
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-left text-gray-800 focus:border-teal-500 focus:outline-none text-xl font-bold"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-bold text-gray-600 mb-2">الفئة</label>
          <div className="grid grid-cols-3 gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat.value}
                type="button"
                onClick={() => set('category', cat.value)}
                className={`py-2 rounded-xl text-sm border-2 flex items-center justify-center gap-1 ${
                  form.category === cat.value
                    ? 'bg-teal-600 border-teal-600 text-white font-bold'
                    : 'bg-white border-gray-200 text-gray-600 hover:border-teal-300'
                }`}
              >
                <span>{cat.emoji}</span>
                <span>{cat.value}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-bold text-gray-600 mb-2">ملاحظة (اختياري)</label>
          <input
            type="text"
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            placeholder="وصف اختياري..."
            maxLength={100}
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-right text-gray-800 focus:border-teal-500 focus:outline-none"
          />
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm font-bold text-gray-600 mb-2">التاريخ</label>
          <input
            type="date"
            value={form.date}
            onChange={(e) => set('date', e.target.value)}
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:border-teal-500 focus:outline-none"
          />
        </div>

        {/* Preview */}
        {form.amount > 0 && (
          <div className="bg-teal-50 rounded-xl p-3 text-sm text-teal-700">
            <span className="font-bold">{form.paidBy}</span> دفع{' '}
            <span className="font-bold">{Number(form.amount).toFixed(2)} ₪</span>
            {' '}— حصة كل شخص:{' '}
            <span className="font-bold">{(Number(form.amount) / 3).toFixed(2)} ₪</span>
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-4 rounded-xl text-lg"
        >
          حفظ الفاتورة
        </button>
      </form>
    </div>
  );
}
