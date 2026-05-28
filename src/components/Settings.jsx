import { useState } from 'react';
import { Settings as SettingsIcon, Trash2, AlertTriangle, X } from 'lucide-react';

export default function Settings({ roommates, onReset }) {
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <div className="p-4 max-w-lg mx-auto space-y-4 lg:max-w-2xl lg:p-6">
      <h2 className="text-xl font-bold text-teal-800 flex items-center gap-2">
        <SettingsIcon className="w-6 h-6" />
        الإعدادات
      </h2>

      {/* Current roommates */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
          <h3 className="font-bold text-gray-700">الشركاء الحاليون</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {roommates.map((r, i) => (
            <div key={r} className="px-4 py-3 flex items-center gap-3">
              <div className="w-10 h-10 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center font-bold">
                {i + 1}
              </div>
              <span className="font-medium text-gray-800">{r}</span>
            </div>
          ))}
        </div>
      </div>

      {/* App info */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
        <h3 className="font-bold text-gray-700">عن التطبيق</h3>
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex justify-between">
            <span>اسم التطبيق</span>
            <span className="font-medium">مصاريف السكن</span>
          </div>
          <div className="flex justify-between">
            <span>الإصدار</span>
            <span className="font-medium">1.0.0</span>
          </div>
          <div className="flex justify-between">
            <span>تخزين البيانات</span>
            <span className="font-medium text-teal-600">محلي على الجهاز فقط</span>
          </div>
        </div>
      </div>

      {/* Reset */}
      <div className="bg-red-50 rounded-2xl border border-red-200 p-4">
        <h3 className="font-bold text-red-800 mb-2 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          منطقة الخطر
        </h3>
        <p className="text-sm text-red-600 mb-4">
          حذف جميع البيانات والبدء من جديد. هذا الإجراء لا يمكن التراجع عنه.
        </p>
        <button
          onClick={() => setShowConfirm(true)}
          className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-bold px-4 py-3 rounded-xl w-full justify-center"
        >
          <Trash2 className="w-4 h-4" />
          حذف كل البيانات وإعادة الضبط
        </button>
      </div>

      {/* Confirm modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800 text-lg">تأكيد الحذف</h3>
              <button onClick={() => setShowConfirm(false)} className="p-1 text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="bg-red-50 rounded-xl p-3 mb-4 flex gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">
                سيتم حذف <strong>جميع الفواتير والأرصدة والإعدادات</strong> بشكل نهائي.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-bold"
              >
                إلغاء
              </button>
              <button
                onClick={() => { onReset(); setShowConfirm(false); }}
                className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold"
              >
                حذف نهائي
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
