import { useState } from 'react';
import { History as HistoryIcon, Trash2, X } from 'lucide-react';
import { CATEGORIES, formatDate, formatCurrency } from '../utils/balances';

export default function History({ roommates, expenses, onDelete }) {
  const [filterCategory, setFilterCategory] = useState('الكل');
  const [filterPerson, setFilterPerson] = useState('الكل');
  const [confirmDelete, setConfirmDelete] = useState(null);

  const active = expenses.filter(e => e.active);

  const filtered = active
    .filter(e => filterCategory === 'الكل' || e.category === filterCategory)
    .filter(e => filterPerson === 'الكل' || e.paidBy === filterPerson)
    .sort((a, b) => b.createdAt - a.createdAt);

  const categoryEmoji = (cat) => CATEGORIES.find(c => c.value === cat)?.emoji || '📦';

  return (
    <div className="p-4 md:p-6 max-w-lg mx-auto space-y-4 md:max-w-none">
      <h2 className="text-xl font-bold text-teal-800 flex items-center gap-2">
        <HistoryIcon className="w-6 h-6" />
        سجل المصاريف
      </h2>

      {/* Filters */}
      <div className="space-y-2">
        <div>
          <p className="text-xs font-bold text-gray-500 mb-1">حسب الشخص</p>
          <div className="flex gap-2 flex-wrap">
            {['الكل', ...roommates].map(p => (
              <button
                key={p}
                onClick={() => setFilterPerson(p)}
                className={`px-3 py-1 rounded-full text-sm font-medium border ${
                  filterPerson === p
                    ? 'bg-teal-600 border-teal-600 text-white'
                    : 'bg-white border-gray-200 text-gray-600'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs font-bold text-gray-500 mb-1">حسب الفئة</p>
          <div className="flex gap-2 flex-wrap">
            {['الكل', ...CATEGORIES.map(c => c.value)].map(cat => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-3 py-1 rounded-full text-sm font-medium border ${
                  filterCategory === cat
                    ? 'bg-teal-600 border-teal-600 text-white'
                    : 'bg-white border-gray-200 text-gray-600'
                }`}
              >
                {cat === 'الكل' ? cat : `${categoryEmoji(cat)} ${cat}`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results count */}
      <p className="text-sm text-gray-500">{filtered.length} فاتورة</p>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-4xl mb-2">📭</p>
          <p>لا توجد فواتير</p>
        </div>
      ) : (
        <div className="space-y-3 md:grid md:grid-cols-2 md:gap-4 md:space-y-0 lg:grid-cols-3">
          {filtered.map(exp => (
            <div key={exp.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-11 h-11 bg-teal-50 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                    {categoryEmoji(exp.category)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-gray-800">{exp.category}</span>
                      <span className="text-xs bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full">{exp.paidBy}</span>
                    </div>
                    {exp.description && (
                      <p className="text-sm text-gray-500 mt-0.5 truncate">{exp.description}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">{formatDate(exp.date)}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="font-extrabold text-gray-900 text-base">{formatCurrency(exp.amount)}</span>
                  <span className="text-xs text-gray-400">حصة: {formatCurrency(exp.amount / 3)}</span>
                  <button
                    onClick={() => setConfirmDelete(exp)}
                    className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirm Delete Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50 p-4" onClick={() => setConfirmDelete(null)}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800 text-lg">حذف الفاتورة؟</h3>
              <button onClick={() => setConfirmDelete(null)} className="p-1 text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-gray-600 mb-2">
              <span className="font-bold">{confirmDelete.category}</span> — {formatCurrency(confirmDelete.amount)}
            </p>
            <p className="text-sm text-gray-500 mb-5">
              سيتم عكس تأثيرها على الأرصدة. هذا الإجراء لا يمكن التراجع عنه.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-bold"
              >
                إلغاء
              </button>
              <button
                onClick={() => { onDelete(confirmDelete.id); setConfirmDelete(null); }}
                className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold"
              >
                حذف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
