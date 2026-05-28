import { useState } from 'react';
import { Home, Users, Loader2 } from 'lucide-react';

export default function SetupScreen({ onSetup }) {
  const [names, setNames]     = useState(['', '', '']);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState(null);

  const handleChange = (index, value) => {
    const updated = [...names];
    updated[index] = value;
    setNames(updated);
  };

  const isValid = names.every(n => n.trim().length >= 2);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid || saving) return;
    try {
      setSaving(true);
      setError(null);
      await onSetup(names.map(n => n.trim()));
    } catch {
      setError('تعذّر حفظ البيانات. تحقق من اتصالك بالإنترنت وحاول مجدداً.');
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-teal-600 to-teal-800 p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-600 to-teal-700 p-8 text-center">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Home className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-1">مصاريف السكن</h1>
          <p className="text-teal-100 text-sm">إدارة مصاريف المنزل المشترك</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="flex items-center gap-2 text-teal-700 mb-2">
            <Users className="w-5 h-5" />
            <h2 className="text-lg font-bold">أدخل أسماء الشركاء الثلاثة</h2>
          </div>

          {names.map((name, i) => (
            <div key={i}>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                الشريك {['الأول', 'الثاني', 'الثالث'][i]}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => handleChange(i, e.target.value)}
                placeholder={['مثال: أحمد', 'مثال: يوسف', 'مثال: محمد'][i]}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-right text-gray-800 focus:border-teal-500 focus:outline-none placeholder:text-gray-300 text-base"
                maxLength={20}
                required
                disabled={saving}
              />
            </div>
          ))}

          {error && (
            <p className="text-sm text-red-600 text-center font-medium">{error}</p>
          )}

          <button
            type="submit"
            disabled={!isValid || saving}
            className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl text-lg mt-4 flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                جارٍ الحفظ…
              </>
            ) : (
              'ابدأ الآن'
            )}
          </button>

          <p className="text-center text-xs text-gray-400">
            البيانات مُزامَنة على جميع الأجهزة عبر السحابة
          </p>
        </form>
      </div>
    </div>
  );
}
